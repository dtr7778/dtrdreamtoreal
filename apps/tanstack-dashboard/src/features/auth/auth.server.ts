import { env as workerEnv } from "cloudflare:workers";

export async function getAuthSession(headers: Headers) {
  return workerEnv.AUTH.getSession(headers);
}

export async function getUserAccounts(headers: Headers) {
  return workerEnv.AUTH.listUserAccounts(headers);
}

export async function getUserSessions(headers: Headers) {
  return workerEnv.AUTH.listSessions(headers);
}
