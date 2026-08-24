import "server-only";

import {
  createLoader,
  parseAsIndex,
  parseAsInteger,
  parseAsString,
  parseAsStringEnum,
} from "nuqs/server";
import type { ParserMap } from "nuqs/server";

import { DEFAULT_PAGE_INDEX, DEFAULT_PAGE_SIZE } from "@/constants";

export function tableQuerySearchParams<Parsers extends ParserMap>(
  additionalKeys?: Parsers
) {
  const baseParsers = {
    page: parseAsIndex
      .withDefault(DEFAULT_PAGE_INDEX)
      .withOptions({ clearOnDefault: true }),
    limit: parseAsInteger
      .withDefault(DEFAULT_PAGE_SIZE)
      .withOptions({ clearOnDefault: true }),
    search: parseAsString.withOptions({ clearOnDefault: true }),
    order: parseAsStringEnum(["asc", "desc"]).withOptions({
      clearOnDefault: true,
    }),
    orderField: parseAsString.withOptions({ clearOnDefault: true }),
  };

  return createLoader({
    ...baseParsers,
    ...(additionalKeys ?? {}),
  } as unknown as typeof baseParsers & Parsers);
}
