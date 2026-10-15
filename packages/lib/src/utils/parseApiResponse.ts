import type { ApiResponseType } from "../types";

export async function parseApiResponse<T>(response: {
  ok: boolean;
  status: number;
  json: () => Promise<unknown>;
}): Promise<ApiResponseType<T>> {
  const body = (await response
    .json()
    .catch(() => null)) as ApiResponseType<T> | null;

  if (!response.ok) {
    throw new Error(body?.message ?? `Request failed (${response.status})`);
  }

  return body as ApiResponseType<T>;
}
