import { StatusCodes } from "http-status-codes";
import { inject } from "inversify";
import { Resend, type WebhookEventPayload } from "resend";

import {
  Controller,
  type IRequest,
  Post,
  Request,
} from "@workspace/lib/server";
import { type IMailProcessor } from "@workspace/mail";

import { API_MESSAGE } from "@/constant";
import { CONTAINER_TYPES } from "@/container/container-types";
import { WORKER_CONTAINER_TYPES } from "@/container/worker-container/worker-container-types";
import { env } from "@/env";
import { BaseController } from "@/helpers/BaseController";

import { MailQueueService } from "./MailQueue.service";

@Controller({
  path: "/mails/resend",
  scope: "Singleton",
  tags: ["Resend mail"],
})
export class ResendMailController extends BaseController {
  private readonly resend: Resend;

  constructor(
    @inject(WORKER_CONTAINER_TYPES.MailProcessorService)
    private readonly mailProcessor: IMailProcessor,
    @inject(CONTAINER_TYPES.MailQueueService)
    private readonly mailQueue: MailQueueService
  ) {
    super();
    this.resend = new Resend(env.RESEND_API_KEY);
  }

  /** Read a single (possibly repeated) request header as a string. */
  private getHeader(request: IRequest, name: string): string | undefined {
    const value = request.headers[name];

    return Array.isArray(value) ? value[0] : value;
  }

  /**
   * Verify a Resend (svix) webhook signature against the raw request body and
   * return the decoded event.
   */
  private verifyWebhook(
    request: IRequest,
    webhookSecret: string
  ): WebhookEventPayload {
    const id = this.getHeader(request, "svix-id");
    const timestamp = this.getHeader(request, "svix-timestamp");
    const signature = this.getHeader(request, "svix-signature");
    const payload = request.rawBody;

    if (!id || !timestamp || !signature || !payload) {
      throw this.apiError({
        statusCode: StatusCodes.BAD_REQUEST,
        message: API_MESSAGE.GENERAL.RESEND.INVALID_REQUEST,
      });
    }

    try {
      return this.resend.webhooks.verify({
        payload,
        headers: { id, timestamp, signature },
        webhookSecret,
      });
    } catch {
      throw this.apiError({
        statusCode: StatusCodes.UNAUTHORIZED,
        message: API_MESSAGE.GENERAL.RESEND.INVALID_REQUEST,
      });
    }
  }

  @Post("/inbound")
  public async inboundMail(@Request() request: IRequest) {
    const eventPayload = this.verifyWebhook(
      request,
      env.RESEND_INBOUND_WEBHOOK_SECRET
    );

    if (eventPayload.type !== "email.received") {
      throw this.apiError({
        statusCode: StatusCodes.BAD_REQUEST,
        message: API_MESSAGE.GENERAL.RESEND.INVALID_REQUEST,
      });
    }

    const { data, error } = await this.resend.emails.receiving.get(
      eventPayload.data.email_id
    );

    if (error || !data) {
      throw this.apiError({
        statusCode: error.statusCode ?? StatusCodes.UNAUTHORIZED,
        message: error.message ?? API_MESSAGE.GENERAL.RESEND.INVALID_REQUEST,
      });
    }

    const result = await this.mailProcessor.processInboundEmail(data);

    return this.response({
      statusCode: StatusCodes.ACCEPTED,
      message: API_MESSAGE.MAIL.WEBHOOK_QUEUED,
      data: result,
    });
  }

  @Post("/outbound")
  public async outboundMail(@Request() request: IRequest) {
    const eventPayload = this.verifyWebhook(
      request,
      env.RESEND_OUTBOUND_WEBHOOK_SECRET
    );

    switch (eventPayload.type) {
      case "email.sent":
        await this.mailProcessor.processMailSent(
          eventPayload.data.email_id,
          eventPayload.data.message_id
        );
        break;
      case "email.delivered":
        await this.mailProcessor.processMailDelivered(
          eventPayload.data.email_id
        );
        break;
      default:
        throw this.apiError({
          statusCode: StatusCodes.BAD_REQUEST,
          message: API_MESSAGE.GENERAL.RESEND.INVALID_REQUEST,
        });
    }

    return this.response({
      statusCode: StatusCodes.ACCEPTED,
      message: API_MESSAGE.MAIL.WEBHOOK_QUEUED,
      data: null,
    });
  }
}
