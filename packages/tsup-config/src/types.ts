import type { Dirent } from "node:fs";

import type { defineConfig, Options } from "tsup";

export interface CopyDirectoryOptions {
  source: string;
  destination: string;
  filter?: (srcPath: string, entry: Dirent) => boolean;
}

export type Entry = string[] | Record<string, string>;

export interface BuildConfigOptions extends Partial<Options> {
  /** Entry point(s) for your application */
  entry: Entry;

  /** Env mode */
  isDev: boolean;

  /** Output directory */
  outDir?: string;

  /** Node.js target version */
  target?: string;

  /** Path aliases */
  aliases?: Record<string, string>;

  /** dependency detection */
  dependencies?: Record<string, string>;

  /** Organization scope to identify internal packages */
  internalScope?: string;

  /** Files/directories to copy after build */
  copyAssets?: CopyDirectoryOptions[];

  /** Enable server auto-restart in dev mode */
  autoRestart?: boolean;

  /** Custom onSuccess callback */
  onBuildSuccess?: () => void | Promise<void>;
}

export type OutputOptions = ReturnType<typeof defineConfig>;
