const D1_MAX_BOUND_PARAMS = 100;

type InsertQuery<R = unknown> = {
  toSQL(): { params: unknown[] };
} & PromiseLike<R>;

async function runChunks<T, R>(
  rows: T[],
  build: (chunk: T[]) => InsertQuery<R>,
  collect: (result: R) => void
): Promise<void> {
  if (rows.length === 0) return;

  const query = build(rows);

  // D1 allows at most 100 bound parameters per statement. Split the batch until
  // each compiled statement fits (a single row is sent as-is even if it cannot).
  if (rows.length === 1 || query.toSQL().params.length <= D1_MAX_BOUND_PARAMS) {
    collect(await query);
    return;
  }

  const mid = Math.ceil(rows.length / 2);
  await runChunks(rows.slice(0, mid), build, collect);
  await runChunks(rows.slice(mid), build, collect);
}

export async function insertChunked<T>(
  rows: T[],
  build: (chunk: T[]) => InsertQuery
): Promise<void> {
  await runChunks<T, unknown>(rows, build, () => {});
}

export async function insertChunkedReturning<T, R>(
  rows: T[],
  build: (chunk: T[]) => InsertQuery<R[]>
): Promise<R[]> {
  const results: R[] = [];

  await runChunks<T, R[]>(rows, build, (result) => {
    results.push(...result);
  });

  return results;
}
