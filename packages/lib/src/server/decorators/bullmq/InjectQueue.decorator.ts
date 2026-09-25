import { inject } from "inversify";

import { getQueueToken } from "../../constant";
import type { NameOrEntity } from "../../types";
import { resolveName } from "../../utils/name.utils";

/**
 * Injects a BullMQ `Queue` instance into a constructor parameter.
 *
 * Accepts either a raw queue name or a queue contract. The matching queue must
 * have been registered on the BullMQ module, e.g.
 * `bullMq.registerQueue("email")` or `bullMq.registerContracts([emailQueue])`.
 *
 * Inspired by `@nestjs/bullmq`'s `@InjectQueue`.
 *
 * @example
 * ```ts
 * constructor(@InjectQueue(emailQueue) private readonly queue: Queue) {}
 * ```
 */
export function InjectQueue(queue: NameOrEntity): ParameterDecorator {
  return inject(getQueueToken(resolveName(queue)));
}
