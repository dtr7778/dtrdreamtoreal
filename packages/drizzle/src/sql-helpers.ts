import type { AnyColumn, InferColumnsDataTypes, SQL } from "drizzle-orm";
import { sql } from "drizzle-orm";

function joinSql(values: (SQL | AnyColumn)[], separator: SQL): SQL {
  return sql.join(values, separator);
}

export function coalesce<T>(values: (SQL | AnyColumn)[]): SQL<T> {
  return sql<T>`COALESCE(${joinSql(values, sql`, `)})`;
}

export function jsonbBuildObject<TColumns extends Record<string, AnyColumn>>(
  columns: TColumns
): SQL<InferColumnsDataTypes<TColumns>> {
  const entries = Object.entries(columns);

  const parts: (SQL | AnyColumn)[] = entries.flatMap(([key, col]) => [
    sql`${sql.raw(`'${key}'`)}`,
    col,
  ]);

  return sql<
    InferColumnsDataTypes<TColumns>
  >`jsonb_build_object(${joinSql(parts, sql`, `)})`;
}

export function jsonbAgg<TColumns extends Record<string, AnyColumn>>(
  columns: TColumns,
  filterColumn?: AnyColumn
): SQL<InferColumnsDataTypes<TColumns>[]> {
  const entries = Object.entries(columns);

  // Safely extract filterColumn without mutating inputs
  const filterCol = filterColumn ?? entries[0]?.[1];

  // Declaratively build the array of arguments for coalesce
  const aggregatedJson = sql<InferColumnsDataTypes<TColumns>[]>`
    jsonb_agg(DISTINCT ${jsonbBuildObject(columns)}) FILTER (WHERE ${filterCol} IS NOT NULL)
  `;

  const fallbackJson = sql<InferColumnsDataTypes<TColumns>[]>`'[]'`;

  return coalesce<InferColumnsDataTypes<TColumns>[]>([
    aggregatedJson,
    fallbackJson,
  ]);
}
