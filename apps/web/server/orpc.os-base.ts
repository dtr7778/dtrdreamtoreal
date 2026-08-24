import { authMiddleware } from "./middleware/auth.middleware";
import { errorMiddleware } from "./middleware/error.middleware";
import {
  privateRateLimitMiddleware,
  publicRateLimitMiddleware,
} from "./middleware/rateLimit.middleware";
import { baseOs } from "./orpc.base";

const mainBaseOs = baseOs.use(errorMiddleware);

export const publicOs = mainBaseOs.use(publicRateLimitMiddleware);

export const authBaseOs = mainBaseOs
  .use(privateRateLimitMiddleware)
  .use(authMiddleware);
