export type WindowUnit = "ms" | "s" | "m" | "h" | "d";

export type Duration = `${number} ${WindowUnit}`;

export type RatelimitAlgorithm =
  | "slidingWindow"
  | "fixedWindow"
  | "tokenBucket";
