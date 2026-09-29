import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";

import { createApiClient } from "@workspace/contract";
import type { ApiResponseType } from "@workspace/lib/types";

import { env } from "./env";

const baseURL = env.NEXT_PUBLIC_BACKEND_URL;
const backendOrigin = new URL(baseURL).origin;

const CSRF_ENDPOINT = `${backendOrigin}/csrf-token`;
const CSRF_HEADER = "x-csrf-token";
const MUTATING_METHODS = ["post", "put", "patch", "delete"];

const instance = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

let csrfTokenPromise: Promise<string> | null = null;

async function fetchCsrfToken(): Promise<string> {
  const response = await axios.get<ApiResponseType<string>>(CSRF_ENDPOINT, {
    withCredentials: true,
  });

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

function isMutating(config: InternalAxiosRequestConfig | undefined): boolean {
  return MUTATING_METHODS.includes((config?.method ?? "get").toLowerCase());
}

instance.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    if (isMutating(config)) {
      config.headers.set(CSRF_HEADER, await getCsrfToken());
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

    if (
      error.response?.status === 403 &&
      config &&
      !config._csrfRetried &&
      isMutating(config)
    ) {
      config._csrfRetried = true;
      csrfTokenPromise = null;

      config.headers.set(CSRF_HEADER, await getCsrfToken());

      return instance.request(config);
    }

    return Promise.reject(error);
  }
);

export const apiClient = createApiClient({
  axios: instance,
});
