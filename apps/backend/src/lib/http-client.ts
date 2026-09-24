import axios from "axios";

/**
 * Shared axios instance for outbound HTTP from the backend.
 *
 * Mirrors the `fetch` semantics the audit code relies on: non-2xx responses
 * resolve so callers can inspect `status`, and the body is returned as raw text
 * so callers can parse JSON when needed.
 */
export const httpClient = axios.create({
  validateStatus: () => true,
  responseType: "text",
});
