import { createHmac, timingSafeEqual } from "node:crypto";

import { BULLMQ_TRANSPORT_DEFAULTS } from "./constants";

/**
 * Recursively sort object keys so the signed representation is independent of
 * key ordering (the client signs an in-memory object, the server verifies the
 * JSON-parsed body, and both must agree byte-for-byte).
 */
function canonicalize(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(canonicalize);
  }

  if (value && typeof value === "object") {
    const source = value as Record<string, unknown>;
    const result: Record<string, unknown> = {};

    for (const key of Object.keys(source).sort()) {
      const entry = source[key];
      if (entry !== undefined) {
        result[key] = canonicalize(entry);
      }
    }

    return result;
  }

  return value;
}

/**
 * Canonicalize a payload into the exact string that gets signed / verified.
 *
 * Strings are signed verbatim (this is what an inbound HTTP `rawBody` is),
 * everything else is canonical JSON (keys sorted recursively).
 */
export function serializeBullmqPayload(payload: unknown): string {
  if (typeof payload === "string") {
    return payload;
  }

  // `JSON.stringify(undefined)` returns `undefined`, which would make
  // `createHmac().update()` throw. Fall back to a stable string so a missing
  // payload verifies as `false` rather than crashing the request.
  return JSON.stringify(canonicalize(payload)) ?? "undefined";
}

/** Compute the hex HMAC signature of `payload` using `secret`. */
export function createBullmqSignature(secret: string, payload: string): string {
  return createHmac(BULLMQ_TRANSPORT_DEFAULTS.signatureAlgorithm, secret)
    .update(payload)
    .digest("hex");
}

/**
 * Sign an arbitrary payload (object or raw string) and return the hex digest.
 *
 * Used by producers when publishing, and by workers when delivering receipts
 * and failure callbacks.
 */
export function signBullmqPayload(secret: string, payload: unknown): string {
  return createBullmqSignature(secret, serializeBullmqPayload(payload));
}

/**
 * Constant-time verification of a signature against a payload.
 *
 * Returns `false` (never throws) when the signature is missing or malformed so
 * callers can map the result to a 401 themselves.
 */
export function verifyBullmqSignature(
  secret: string,
  payload: unknown,
  signature: string | undefined | null
): boolean {
  if (!signature) return false;

  const expected = Buffer.from(signBullmqPayload(secret, payload));
  const received = Buffer.from(signature);

  if (expected.length !== received.length) return false;

  return timingSafeEqual(expected, received);
}
