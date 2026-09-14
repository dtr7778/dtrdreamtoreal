import { spawn, type ChildProcess } from "node:child_process";

let serverProcess: ChildProcess | null = null;

export function startServer(entryFile: string): void {
  if (serverProcess) {
    console.log("🔄 Restarting server...\n");
    serverProcess.kill();
  }

  console.log("🚀 Starting server...\n");
  serverProcess = spawn("node", [entryFile], {
    stdio: "inherit",
    env: { ...process.env },
  });

  serverProcess.on("error", (err) => {
    console.error("❌ Server error:", err);
  });
}

export function setupGracefulShutdown(): void {
  const cleanup = () => {
    if (serverProcess) {
      serverProcess.kill();
    }
    process.exit(0);
  };

  process.on("SIGINT", cleanup);
  process.on("SIGTERM", cleanup);
}
