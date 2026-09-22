import type { QstashCallbackHandler, QstashReceiptHandler } from "./types";

/**
 * In-memory registry mapping route keys to the handlers that process inbound
 * QStash deliveries and receipts.
 *
 * Subclasses register handlers in their constructor; lookups happen while
 * processing a request.
 */
export class HandlerRegistry {
  private readonly callbacks = new Map<string, QstashCallbackHandler>();
  private readonly receipts = new Map<string, QstashReceiptHandler>();

  /** Register the handler that processes deliveries for `routeKey`. */
  public setCallback(routeKey: string, handler: QstashCallbackHandler): void {
    this.callbacks.set(routeKey, handler);
  }

  /** Register the handler that processes receipts for `routeKey`. */
  public setReceipt(routeKey: string, handler: QstashReceiptHandler): void {
    this.receipts.set(routeKey, handler);
  }

  /** Return the delivery handler registered for `routeKey`, if any. */
  public getCallback(routeKey: string): QstashCallbackHandler | undefined {
    return this.callbacks.get(routeKey);
  }

  /** Return the receipt handler registered for `routeKey`, if any. */
  public getReceipt(routeKey: string): QstashReceiptHandler | undefined {
    return this.receipts.get(routeKey);
  }
}
