import postgres from "postgres";

export function createConnection(
  databaseUrl: string,
  isProd: boolean,
  operationMode: "seed" | "normal"
) {
  return postgres(databaseUrl, {
    max: isProd ? 20 : 5,
    idle_timeout: 20,
    connect_timeout: 10,
    prepare: false,
    debug: !isProd && operationMode !== "seed",
  });
}
