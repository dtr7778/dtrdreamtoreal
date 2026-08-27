import {
  listTasksProcedure,
  taskCreateProcedure,
  taskDeleteProcedure,
  taskDetailsProcedure,
  taskImpl,
  taskUpdateProcedure,
  taskUpdateStatusProcedure,
} from "./task.procedure";

export const taskRouter = taskImpl.router({
  list: listTasksProcedure,
  details: taskDetailsProcedure,
  create: taskCreateProcedure,
  update: taskUpdateProcedure,
  updateStatus: taskUpdateStatusProcedure,
  delete: taskDeleteProcedure,
});
