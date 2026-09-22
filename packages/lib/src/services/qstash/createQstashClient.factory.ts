import { IQstashService, QstashService } from "./Qstash.service";
import type { QstashServiceConfig } from "./types";

/**
 * Create a {@link QstashService} from the given configuration.
 *
 * Kept as a factory so callers depend on {@link IQstashService} rather than the
 * concrete class.
 */
export function createQstashClient(
  config: QstashServiceConfig
): IQstashService {
  return new QstashService(config);
}
