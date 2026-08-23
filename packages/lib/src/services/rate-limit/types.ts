import type { Ratelimit } from "@upstash/ratelimit";

export type WindowUnit = "ms" | "s" | "m" | "h" | "d";

export type Duration = `${number} ${WindowUnit}`;

export type RatelimitAlgorithm =
  "slidingWindow" | "fixedWindow" | "tokenBucket";

export type RatelimitResponse = ReturnType<
  InstanceType<typeof Ratelimit>["limit"]
>;
export type GetRemainingResponse = ReturnType<
  InstanceType<typeof Ratelimit>["getRemaining"]
>;

export interface IRatelimit {
  limit(identifier: string): Promise<RatelimitResponse>;
  getRemaining(identifier: string): Promise<GetRemainingResponse>;
}
