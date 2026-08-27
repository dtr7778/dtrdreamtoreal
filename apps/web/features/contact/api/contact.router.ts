import {
  contactImpl,
  createReplyContactProcedure,
  detailsContactProcedure,
  listContactProcedure,
} from "./contact.procedure";

export const contactRouter = contactImpl.router({
  list: listContactProcedure,
  details: detailsContactProcedure,
  createReply: createReplyContactProcedure,
});
