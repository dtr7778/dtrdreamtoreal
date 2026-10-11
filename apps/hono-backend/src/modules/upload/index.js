import { createRouter } from "@workspace/server-core";
import * as handlers from "./upload.handlers";
import * as routes from "./upload.routes";
const router = createRouter()
    .openapi(routes.getFileRoute, handlers.getFileHandler)
    .openapi(routes.getUploadUrlRoute, handlers.getUploadUrlHandler)
    .openapi(routes.confirmUploadRoute, handlers.confirmUploadHandler)
    .openapi(routes.assignEntityRoute, handlers.assignEntityHandler)
    .openapi(routes.deleteFileRoute, handlers.deleteFileHandler);
export default router;
