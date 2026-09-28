import type { LookupAddress } from "node:dns";
import { lookup } from "node:dns/promises";
import { isIP } from "node:net";

/**
 * Thrown when a target URL would resolve to a non-public address. Prevents the
 * crawler from being used for SSRF against internal services or cloud metadata.
 */
export class SsrfError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SsrfError";
  }
}

function isPrivateIpv4(ip: string): boolean {
  const parts = ip.split(".").map((part) => Number(part));
  if (parts.length !== 4 || parts.some((part) => Number.isNaN(part))) {
    return true;
  }

  const [a, b] = parts as [number, number, number, number];

  return (
    a === 0 || // "this" network
    a === 10 || // private
    a === 127 || // loopback
    (a === 169 && b === 254) || // link-local / cloud metadata
    (a === 172 && b >= 16 && b <= 31) || // private
    (a === 192 && b === 0) || // IETF protocol assignments
    (a === 192 && b === 168) || // private
    (a === 198 && (b === 18 || b === 19)) || // benchmarking
    a >= 224 // multicast / reserved
  );
}

function isPrivateIpv6(ip: string): boolean {
  const normalized = ip.toLowerCase();

  if (normalized.startsWith("::ffff:")) {
    // IPv4-mapped IPv6, validate the embedded IPv4 address.
    return isPrivateIpv4(normalized.slice("::ffff:".length));
  }

  return (
    normalized === "::1" ||
    normalized === "::" ||
    normalized.startsWith("fe80") || // link-local
    normalized.startsWith("fc") || // unique local
    normalized.startsWith("fd") // unique local
  );
}

export function isPrivateIp(ip: string): boolean {
  const version = isIP(ip);
  if (version === 4) return isPrivateIpv4(ip);
  if (version === 6) return isPrivateIpv6(ip);
  return true;
}

const BLOCKED_HOST_SUFFIXES = [".localhost", ".local", ".internal"];

/**
 * Asserts that `rawUrl` is an `http(s)` URL whose host resolves only to public
 * addresses. Throws {@link SsrfError} otherwise.
 *
 * Validation is skipped under `NODE_ENV=test` so unit tests stay hermetic.
 */
export async function assertPublicHttpUrl(rawUrl: string): Promise<void> {
  if (process.env.NODE_ENV === "test") return;

  let parsed: URL;
  try {
    parsed = new URL(rawUrl);
  } catch {
    throw new SsrfError(`Invalid URL: ${rawUrl}`);
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new SsrfError(`Unsupported URL protocol: ${parsed.protocol}`);
  }

  const hostname = parsed.hostname.toLowerCase();

  if (
    hostname === "localhost" ||
    BLOCKED_HOST_SUFFIXES.some((suffix) => hostname.endsWith(suffix))
  ) {
    throw new SsrfError(`Blocked host: ${hostname}`);
  }

  if (isIP(hostname)) {
    if (isPrivateIp(hostname)) {
      throw new SsrfError(`Blocked private address: ${hostname}`);
    }
    return;
  }

  let addresses: LookupAddress[];
  try {
    addresses = await lookup(hostname, { all: true, verbatim: true });
  } catch {
    throw new SsrfError(`Could not resolve host: ${hostname}`);
  }

  if (addresses.length === 0) {
    throw new SsrfError(`Could not resolve host: ${hostname}`);
  }

  if (addresses.some((record) => isPrivateIp(record.address))) {
    throw new SsrfError(`Host resolves to a private address: ${hostname}`);
  }
}
