import {
  companyCreateProcedure,
  companyDeleteProcedure,
  companyDetailsProcedure,
  companyEmailThreadCreateProcedure,
  companyImpl,
  companyUpdateProcedure,
  listCompanyEmailProcedure,
  listCompanyEmailThreadProcedure,
  listCompanyForSearchProcedure,
  listCompanyProcedure,
} from "./company.procedure";
import {
  employeeCreateProcedure,
  employeeDeleteProcedure,
  employeeDetailsProcedure,
  employeeUpdateProcedure,
  listEmployeeProcedure,
} from "./employee.procedure";

export const companyRouter = companyImpl.router({
  list: listCompanyProcedure,
  listForSearch: listCompanyForSearchProcedure,
  details: companyDetailsProcedure,
  create: companyCreateProcedure,
  update: companyUpdateProcedure,
  delete: companyDeleteProcedure,
  employee: {
    list: listEmployeeProcedure,
    create: employeeCreateProcedure,
    delete: employeeDeleteProcedure,
    details: employeeDetailsProcedure,
    update: employeeUpdateProcedure,
  },
  emailThread: {
    list: listCompanyEmailThreadProcedure,
    create: companyEmailThreadCreateProcedure,
    email: {
      list: listCompanyEmailProcedure,
    },
  },
});
