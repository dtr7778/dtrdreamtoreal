import { IQstashService, QstashService } from "./Qstash.service";
import type { QstashServiceConfig } from "./types";

export function createQstashClient(
  config: QstashServiceConfig
): IQstashService {
  return new QstashService(config);
}
