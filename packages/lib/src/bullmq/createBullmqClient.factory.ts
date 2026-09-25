import {
  BullmqClientService,
  type IBullmqClientService,
} from "./BullmqClient.service";
import type { BullmqClientServiceConfig } from "./types";

/**
 * Create a {@link BullmqClientService} from the given configuration.
 *
 * Kept as a factory so callers depend on {@link IBullmqClientService} rather than the
 * concrete class.
 */
export function createBullmqClient(
  config: BullmqClientServiceConfig
): IBullmqClientService {
  return new BullmqClientService(config);
}
