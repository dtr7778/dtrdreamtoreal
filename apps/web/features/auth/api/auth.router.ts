import {
  authImpl,
  authMetadataProcedure,
  requestResetPasswordProcedure,
  userBanProcedure,
} from "./auth.procedure";

export const authRouter = authImpl.router({
  metadata: authMetadataProcedure,
  requestResetPassword: requestResetPasswordProcedure,
  ban: userBanProcedure,
});
