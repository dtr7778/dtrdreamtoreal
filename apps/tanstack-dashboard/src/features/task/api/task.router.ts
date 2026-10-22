import {
  createCompanyTaskProcedure,
  listCompanyTaskProcedure,
  removeCompanyTaskProcedure,
  updateCompanyTaskProcedure,
} from "./companyTask.procedure";
import {
  createPersonalTaskProcedure,
  listPersonalTaskProcedure,
  removePersonalTaskProcedure,
  updatePersonalTaskProcedure,
} from "./personalTask.procedure";
import { taskImpl } from "./task.procedure";

export const taskRouter = taskImpl.router({
  company: {
    list: listCompanyTaskProcedure,
    create: createCompanyTaskProcedure,
    update: updateCompanyTaskProcedure,
    remove: removeCompanyTaskProcedure,
  },
  personal: {
    list: listPersonalTaskProcedure,
    create: createPersonalTaskProcedure,
    update: updatePersonalTaskProcedure,
    remove: removePersonalTaskProcedure,
  },
});
