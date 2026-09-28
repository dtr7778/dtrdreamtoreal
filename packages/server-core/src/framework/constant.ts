export const API_MESSAGE = {
  HEALTH: "API health is OK",
  INTERNAL_SERVER_ERROR: "internal server error",
  INVALID_CSRF: "Invalid csrf token",
  GET_CSRF_TOKEN: "CSRF generated successfully",
  FORBIDDEN: "Forbidden access",
  RATE_LIMIT: "Too many request",
};

export const REFLECT_KEYS = {
  CONTROLLER: "reflection:controller:metadata",
  ROUTE: "reflection:route:metadata",
  ROUTE_DOCS: "reflection:route:documentation",
  MIDDLEWARE: "reflection:middleware:metadata",
  GUARD: "reflection:guards:metadata",
  INTERCEPTOR: "reflection:interceptors:metadata",
  FILTER: "reflection:filters:metadata",
  PARAMS: "reflection:parameters:metadata",
  CRON_JOB_CLASS: "reflection:cronJobClass:metadata",
  CRON_JOB_METHOD: "reflection:cronJobMethod:metadata",
  BULLMQ_WORKER: "reflection:bullmq:worker:metadata",
  BULLMQ_WORKER_NODE: "reflection:bullmq:workerNode:metadata",
  BULLMQ_WORKER_EVENT: "reflection:bullmq:workerEvent:metadata",
};

export enum ParameterType {
  REQUEST = "request",
  RESPONSE = "response",
  NEXT = "next",
  BODY = "body",
  QUERY = "query",
  PARAMS = "params",
  PARAM = "param",
  HEADERS = "headers",
  HEADER = "header",
  IP = "ip",
  REQUEST_VALIDATOR = "request_validator",
}
