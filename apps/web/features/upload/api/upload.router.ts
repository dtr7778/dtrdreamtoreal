import {
  assignFileEntityProcedure,
  confirmUploadProcedure,
  deleteUploadProcedure,
  getSignedDownloadUrlProcedure,
  getSignedUploadUrlProcedure,
  uploadImpl,
} from "./upload.procedure";

export const uploadRouter = uploadImpl.router({
  getSignedDownloadUrl: getSignedDownloadUrlProcedure,
  getSignedUploadUrl: getSignedUploadUrlProcedure,
  confirm: confirmUploadProcedure,
  assignEntity: assignFileEntityProcedure,
  delete: deleteUploadProcedure,
});
