import {
  listUserProcedure,
  profileUpdateProcedure,
  updateUserRoleProcedure,
  userDataExportProcedure,
  userDetailsProcedure,
  userImpl,
  userStatsProcedure,
} from "./user.procedure";

export const userRouter = userImpl.router({
  list: listUserProcedure,
  export: userDataExportProcedure,
  stats: userStatsProcedure,
  updateRole: updateUserRoleProcedure,
  updateProfile: profileUpdateProcedure,
  details: userDetailsProcedure,
});
