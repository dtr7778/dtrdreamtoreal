import { type BullmqClientServiceConfig } from "@workspace/lib/bullmq";

import {
  BullmqMailService,
  type IBullmqMailService,
} from "../services/BullmqMail.service";

/** Create the caller-side BullMQ mail publisher from a BullMQ client config. */
export function createBullmqMail(
  config: BullmqClientServiceConfig
): IBullmqMailService {
  return new BullmqMailService(config);
}
