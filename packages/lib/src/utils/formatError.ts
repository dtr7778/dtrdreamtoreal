/**
 * Extracts a meaningful, human-readable message from any value thrown
 * in a catch block (Error, string, object, or anything else).
 */
export function formatError(error: unknown): string {
  if (error == null) {
    return "An unknown error occurred";
  }

  if (error instanceof Error) {
    return error.message || error.name || "An unknown error occurred";
  }

  // Plain string thrown directly
  if (typeof error === "string") {
    return error;
  }

  if (typeof error === "object" && "message" in error) {
    return String(error.message);
  }

  if (typeof error === "object" && "statusText" in error) {
    return String(error.statusText);
  }

  try {
    return JSON.stringify(error);
  } catch {
    return String(error);
  }
}
