import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";

import { createApiClient } from "@workspace/contract";

import { env } from "./env";

const baseURL = env.NEXT_PUBLIC_BACKEND_URL;
const backendOrigin = new URL(baseURL).origin;

const instance = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

let csrfTokenPromise: Promise<string> | null = null;

async function fetchCsrfToken(): Promise<string> {
  const response = await axios.get<{ data: string }>(
    `${backendOrigin}/api/v1/csrf-token`,
    { withCredentials: true }
  );

  return response.data.data;
}

function getCsrfToken(): Promise<string> {
  if (!csrfTokenPromise) {
    csrfTokenPromise = fetchCsrfToken().catch((error) => {
      csrfTokenPromise = null;
      throw error;
    });
  }

  return csrfTokenPromise;
}

const MUTATING_METHODS = ["post", "put", "patch", "delete"];

instance.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const method = (config.method ?? "get").toLowerCase();

    if (MUTATING_METHODS.includes(method)) {
      const token = await getCsrfToken();
      config.headers.set("x-csrf-token", token);
    }

    return config;
  }
);

instance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const config = error.config as
      | (InternalAxiosRequestConfig & { _csrfRetried?: boolean })
      | undefined;

    const method = (config?.method ?? "get").toLowerCase();

    if (
      error.response?.status === 403 &&
      config &&
      !config._csrfRetried &&
      MUTATING_METHODS.includes(method)
    ) {
      config._csrfRetried = true;
      csrfTokenPromise = null;

      const token = await getCsrfToken();
      config.headers.set("x-csrf-token", token);

      return instance.request(config);
    }

    return Promise.reject(error);
  }
);

export const apiClient = createApiClient({
  axios: instance,
});
