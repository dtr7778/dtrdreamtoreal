import {
  TaskPriorityEnumSchema,
  TaskStatusEnumSchema,
} from "@workspace/drizzle/zod-db-enums";
import { formatEnumValue } from "@workspace/lib/utils";

import type { ListCompanyTaskContractType } from "./api/companyTask.contract";
import type { ListPersonalTaskContractType } from "./api/personalTask.contract";

export type TaskBoardItem =
  | ListCompanyTaskContractType["output"]["data"][number]
  | ListPersonalTaskContractType["output"]["data"][number];

export const TASK_STATUS_OPTIONS = TaskStatusEnumSchema.options.map(
  (value) => ({ value, label: formatEnumValue(value) })
);

export const TASK_PRIORITY_OPTIONS = TaskPriorityEnumSchema.options.map(
  (value) => ({ value, label: formatEnumValue(value) })
);

export const TASK_BOARD_COLUMNS = TaskStatusEnumSchema.options.map((value) => ({
  id: value,
  name: formatEnumValue(value),
}));
