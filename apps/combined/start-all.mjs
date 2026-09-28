import { spawn } from "node:child_process";

const children = [];
let shuttingDown = false;
let exitCode = 0;

function stopAll(code) {
  if (code) exitCode = code;
  if (shuttingDown) return;
  shuttingDown = true;
  console.log("[supervisor] shutting down children...");
  for (const child of children) {
    if (child.exitCode === null && child.signalCode === null) {
      child.kill("SIGTERM");
    }
  }
}

function maybeExit() {
  const alive = children.some(
    (child) => child.exitCode === null && child.signalCode === null
  );
  if (shuttingDown && !alive) process.exit(exitCode);
}

function start(name, entry, cwd) {
  const child = spawn(process.execPath, [entry], {
    cwd,
    env: process.env,
    stdio: "inherit",
  });

  children.push(child);

  child.on("error", (error) => {
    console.error(`[supervisor] failed to start ${name}:`, error);
    stopAll(1);
    maybeExit();
  });

  child.on("exit", (code, signal) => {
    console.error(
      `[supervisor] ${name} exited (code=${code}, signal=${signal})`
    );
    stopAll(code ?? 1);
    maybeExit();
  });
}

console.log("[supervisor] starting backend and worker...");
start("backend", "/app/api/dist/index.js", "/app/api");
start("worker", "/app/worker/dist/index.js", "/app/worker");

process.on("SIGTERM", () => stopAll(0));
process.on("SIGINT", () => stopAll(0));