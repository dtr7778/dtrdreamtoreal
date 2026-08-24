export async function register() {
  console.log("Initialized Smart Service app");

  if (process.env.NODE_ENV === "development") {
    (await import("@upstash/qstash")).startDevServer();
  }
}
