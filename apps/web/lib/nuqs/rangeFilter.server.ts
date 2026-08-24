import "server-only";

import { endOfMonth, startOfMonth } from "date-fns";
import { parseAsIsoDate, parseAsStringLiteral } from "nuqs/server";

import { RangeSearchEnumSchema } from "@workspace/lib/utils";

export function createRangeFilterServer(now: Date = new Date()) {
  return {
    range: parseAsStringLiteral(RangeSearchEnumSchema.options)
      .withDefault("THIS_MONTH")
      .withOptions({
        clearOnDefault: true,
      }),
    startTime: parseAsIsoDate
      .withDefault(startOfMonth(now))
      .withOptions({ clearOnDefault: true }),
    endTime: parseAsIsoDate
      .withDefault(endOfMonth(now))
      .withOptions({ clearOnDefault: true }),
  };
}
