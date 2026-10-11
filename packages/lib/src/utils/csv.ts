type JsonValue =
  string | number | boolean | null | undefined | JsonObject | JsonArray;
type JsonObject = { [key: string]: JsonValue };
type JsonArray = JsonValue[];

type ExportFormat = "csv" | "json";

interface ExportResult<T = unknown> {
  data: T[] | string;
  filename: string;
  contentType: string;
}

interface ExportOptions<T = unknown> {
  prefix?: string;
  csvFormatter?: (data: T[]) => string;
  columns?: (keyof T)[];
  delimiter?: string;
}

/**
 * Utility function to prepare export data with filename and content type
 * @param results - The data to be exported
 * @param format - Export format ('csv' or 'json')
 * @param options - Export options
 * @returns Export object with data, filename, and contentType
 */
export function prepareExport<T extends Record<string, unknown>>(
  results: T[],
  format: ExportFormat,
  options: ExportOptions<T> = {}
): ExportResult<T> {
  const { prefix, csvFormatter, columns, delimiter = "," } = options;

  const date = new Date().toISOString().split("T")[0];
  const filename = prefix
    ? `${prefix}_${date}.${format}`
    : `data_${date}.${format}`;

  const contentType = format === "csv" ? "text/csv" : "application/json";

  let formattedData: string | T[];

  if (format === "csv") {
    formattedData = csvFormatter
      ? csvFormatter(results)
      : arrayToCSV(results, columns, delimiter);
  } else {
    formattedData = results;
  }

  return {
    data: formattedData,
    filename,
    contentType,
  };
}

/**
 * Converts an array of objects into a CSV string.
 */
export function arrayToCSV<T extends Record<string, unknown>>(
  data: T[],
  columns?: (keyof T)[],
  delimiter: string = ","
): string {
  if (!data || !data.length) {
    return "";
  }

  // If columns not provided, extract all unique keys from objects
  if (!columns) {
    columns = [...new Set(data.flatMap(Object.keys))] as (keyof T)[];
  }

  // Escape a field for CSV (handle quotes, commas, newlines)
  const escapeField = (field: unknown): string => {
    if (field === null || field === undefined) {
      return "";
    }

    const stringField = String(field);

    // If field contains delimiter, newline, or double quote, wrap in quotes
    if (
      stringField.includes(delimiter) ||
      stringField.includes('"') ||
      stringField.includes("\n") ||
      stringField.includes("\r")
    ) {
      // Replace double quotes with two double quotes
      return `"${stringField.replace(/"/g, '""')}"`;
    }

    return stringField;
  };

  // Create header row
  const header = columns.map((col) => escapeField(String(col))).join(delimiter);

  // Create data rows
  const rows = data.map((obj) => {
    return columns
      .map((col) => {
        const value = obj[col];

        // Handle nested objects or arrays
        if (typeof value === "object" && value !== null) {
          return escapeField(JSON.stringify(value));
        }

        return escapeField(value);
      })
      .join(delimiter);
  });

  // Combine header and rows
  return [header, ...rows].join("\n");
}

// Also export types for consumers
export type { ExportResult, ExportOptions, ExportFormat };
