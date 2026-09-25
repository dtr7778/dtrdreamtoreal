import axios from "axios";

/**
 * Extracts a meaningful, human-readable message from any value thrown
 * in a catch block (Error, axios error, string, object, or anything else).
 */
export function formatError(error: unknown): string {
  if (error == null) {
    return "An unknown error occurred";
  }

  // Must come before the `instanceof Error` check: an AxiosError is an Error,
  // so its generic message would otherwise shadow the server-provided message.
  if (axios.isAxiosError(error)) {
    const serverMessage = error.response?.data?.message;

    if (typeof serverMessage === "string" && serverMessage.trim() !== "") {
      return serverMessage;
    }

    return error.message || error.name || "An unknown error occurred";
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
