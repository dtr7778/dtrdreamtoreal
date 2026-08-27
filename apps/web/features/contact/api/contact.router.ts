import { contactImpl, listContactProcedure } from "./contact.procedure";

export const contactRouter = contactImpl.router({
  list: listContactProcedure,
});
