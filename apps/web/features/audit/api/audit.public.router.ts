import { auditImpl } from "./audit.procedure";
import { auditDetailsProcedure } from "./audit.public.procedure";

export const auditRouter = auditImpl.router({
  public: {
    details: auditDetailsProcedure,
  },
});
