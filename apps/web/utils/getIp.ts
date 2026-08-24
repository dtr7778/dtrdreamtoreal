export function getIp(headers: Headers): string {
  return (
    headers.get("x-forwarded-for")?.split(",")[0] ||
    headers.get("x-real-ip") ||
    "127.0.0.1"
  );
}
