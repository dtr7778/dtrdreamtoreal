import { endOfMonth, startOfMonth } from "date-fns";
import { z } from "zod";

import { RangeSearchEnumSchema } from "@workspace/lib/zod-schemas";

export function createRangeFilterSchema(now: Date = new Date()) {
  return z.object({
    range: RangeSearchEnumSchema.default("THIS_MONTH"),
    startTime: z.coerce.date().default(startOfMonth(now)),
    endTime: z.coerce.date().default(endOfMonth(now)),
  });
}
