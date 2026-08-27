import {
  contactImpl,
  detailsContactProcedure,
  listContactProcedure,
} from "./contact.procedure";

export const contactRouter = contactImpl.router({
  list: listContactProcedure,
  details: detailsContactProcedure,
});
