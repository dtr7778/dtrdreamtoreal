import axios from "axios";

import { createApiClient } from "@workspace/contract";

import { env } from "./env";

const instance = axios.create({
  baseURL: env.NEXT_PUBLIC_BACKEND_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const apiClient = createApiClient({
  axios: instance,
});
