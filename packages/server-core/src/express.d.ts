import type { WebhookEventPayload } from "resend";

import type { AuthType } from "@workspace/auth";
import type { PermissionType, RoleType } from "@workspace/lib/types";

type AuthSession = AuthType["$Infer"]["Session"];

declare global {
  namespace Express {
    interface Request {
      userAuth?: AuthSession | null;
      userRoles: Array<RoleType> | null;
      userPermissions: Array<PermissionType> | null;
      resendWebhookEventPayload?: WebhookEventPayload;
    }
  }
}
