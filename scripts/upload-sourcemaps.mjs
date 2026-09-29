import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { resolve } from "node:path";

const token = process.env.SENTRY_AUTH_TOKEN;
const org = process.env.SENTRY_ORG;
const project = process.env.SENTRY_PROJECT;
const release = process.env.SENTRY_RELEASE;
const dist = process.argv[2] ?? "dist";

if (!token || !org || !project) {
  console.log("[sentry] skipping source map upload (missing auth env)");
  process.exit(0);
}

const localCli = resolve(process.cwd(), "node_modules", ".bin", "sentry-cli");
const useLocal = existsSync(localCli);

function run(args) {
  const command = useLocal ? localCli : "npx";
  const commandArgs = useLocal ? args : ["--yes", "sentry-cli", ...args];

  const result = spawnSync(command, commandArgs, {
    stdio: "inherit",
    env: process.env,
  });

  if (result.error) {
    console.error("[sentry] failed to run sentry-cli:", result.error);
    process.exit(1);
  }

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

run(["sourcemaps", "inject", dist]);
run([
  "sourcemaps",
  "upload",
  "--org",
  org,
  "--project",
  project,
  ...(release ? ["--release", release] : []),
  dist,
]);
