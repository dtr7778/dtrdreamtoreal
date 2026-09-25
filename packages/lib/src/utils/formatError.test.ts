import { AxiosError, type AxiosResponse } from "axios";
import { describe, expect, it } from "vitest";

import { formatError } from "./formatError";

function axiosErrorWith(data: unknown, message = "Request failed with status code 400") {
  const response = {
    data,
    status: 400,
    statusText: "Bad Request",
    headers: {},
    config: {},
  } as AxiosResponse;

  return new AxiosError(message, "ERR_BAD_REQUEST", undefined, undefined, response);
}

describe("formatError", () => {
  it("returns the default message for nullish values", () => {
    expect(formatError(null)).toBe("An unknown error occurred");
    expect(formatError(undefined)).toBe("An unknown error occurred");
  });

  it("returns the message of a standard Error", () => {
    expect(formatError(new Error("boom"))).toBe("boom");
  });

  it("returns a thrown string as-is", () => {
    expect(formatError("something went wrong")).toBe("something went wrong");
  });

  it("returns message from a plain object", () => {
    expect(formatError({ message: "object message" })).toBe("object message");
  });

  it("extracts the server message from an axios error response", () => {
    expect(
      formatError(
        axiosErrorWith({ message: "Email already exists", success: false, data: null })
      )
    ).toBe("Email already exists");
  });

  it("falls back to the axios error message when the response has no message", () => {
    expect(formatError(axiosErrorWith({ success: false }))).toBe(
      "Request failed with status code 400"
    );
  });

  it("falls back to the axios error message for a non-object response body", () => {
    expect(formatError(axiosErrorWith("plain body"))).toBe(
      "Request failed with status code 400"
    );
  });

  it("ignores a non-string message on the axios response body", () => {
    expect(formatError(axiosErrorWith({ message: 42 }))).toBe(
      "Request failed with status code 400"
    );
  });
});