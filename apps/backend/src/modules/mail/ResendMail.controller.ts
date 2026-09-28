import { eq } from "drizzle-orm";
import { StatusCodes } from "http-status-codes";
import { inject } from "inversify";
import { Resend, type WebhookEventPayload } from "resend";

import { EmailTable } from "@workspace/drizzle/schemas";
import { type DatabaseType } from "@workspace/drizzle/types";
import { type EmailService, InboundEmailPayload } from "@workspace/mail";
import {
  ApiResponse,
  Controller,
  type IRequest,
  Post,
  Request,
  UseGuards,
} from "@workspace/server-core/framework";
import { BaseController } from "@workspace/server-core/helpers";

import { API_MESSAGE } from "@/constant";
import { CONTAINER_TYPES } from "@/container/container-types";
import { RequireResendWebhook } from "@/decorators/resend-webhook.decorator";
import { env } from "@/env";
import { ResendWebhookGuard } from "@/guards/resend-webhook.guard";

export interface IResendMailController {
  inboundMail(request: IRequest): Promise<
    ApiResponse<{
      success: boolean;
      emailId: string;
      threadId: string | undefined;
    }>
  >;
  outboundMail(request: IRequest): Promise<ApiResponse<null>>;
  emailEvent(request: IRequest): Promise<ApiResponse<null>>;
}

@Controller({
  path: "/mails/resend",
  scope: "Singleton",
  tags: ["Resend mail"],
})
@UseGuards(ResendWebhookGuard)
export class ResendMailController
  extends BaseController
  implements IResendMailController
{
  private readonly resend: Resend;

  constructor(
    @inject(CONTAINER_TYPES.Drizzle)
    private readonly database: DatabaseType,
    @inject(CONTAINER_TYPES.EmailService)
    private readonly emailService: EmailService
  ) {
    super();
    this.resend = new Resend(env.RESEND_API_KEY);
  }

  /** Read the verified webhook event attached by `ResendWebhookGuard`. */
  private getWebhookEvent(request: IRequest): WebhookEventPayload {
    const event = request.resendWebhookEventPayload;

    if (!event) {
      throw this.apiError({
        statusCode: StatusCodes.UNAUTHORIZED,
        message: API_MESSAGE.GENERAL.RESEND.INVALID_REQUEST,
      });
    }

    return event;
  }

  /** Strip the surrounding angle brackets from a message id. */
  private cleanMessageId(messageId: string): string {
    return messageId.replace(/^<|>$/g, "");
  }

  /**
   * Resolve the thread an inbound mail belongs to by matching its
   * `In-Reply-To` header, then any `References` header, against previously
   * stored `resendMessageId`s.
   */
  private async resolveInboundThreadId(
    payload: InboundEmailPayload
  ): Promise<string | undefined> {
    const inReplyTo = payload.headers?.["in-reply-to"];

    if (inReplyTo) {
      const [originalEmail] = await this.database
        .select({ threadId: EmailTable.threadId })
        .from(EmailTable)
        .where(eq(EmailTable.resendMessageId, this.cleanMessageId(inReplyTo)))
        .limit(1);

      if (originalEmail?.threadId) return originalEmail.threadId;
    }

    if (!payload.headers?.references) return undefined;

    const referenceIds = payload.headers.references
      .split(/\s+/)
      .map(this.cleanMessageId)
      .filter(Boolean);

    for (const refId of referenceIds) {
      const [email] = await this.database
        .select({ threadId: EmailTable.threadId })
        .from(EmailTable)
        .where(eq(EmailTable.resendMessageId, refId))
        .limit(1);

      if (email?.threadId) return email.threadId;
    }

    return undefined;
  }

  @Post("/inbound")
  @RequireResendWebhook("inbound")
  public async inboundMail(@Request() request: IRequest): Promise<
    ApiResponse<{
      success: boolean;
      emailId: string;
      threadId: string | undefined;
    }>
  > {
    const eventPayload = this.getWebhookEvent(request);

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

    const threadId = await this.resolveInboundThreadId(data);

    const { emailId } = await this.emailService.createInboundEmailRecord(
      {
        ...data,
        message_id: this.cleanMessageId(data.message_id),
        threadId,
      },
      this.database
    );

    return this.apiResponse({
      statusCode: StatusCodes.ACCEPTED,
      message: API_MESSAGE.MAIL.WEBHOOK_QUEUED,
      data: {
        success: true,
        emailId,
        threadId,
      },
    });
  }

  @Post("/outbound")
  @RequireResendWebhook("outbound")
  public async outboundMail(
    @Request() request: IRequest
  ): Promise<ApiResponse<null>> {
    const eventPayload = this.getWebhookEvent(request);

    if (eventPayload.type !== "email.delivered") {
      throw this.apiError({
        statusCode: StatusCodes.BAD_REQUEST,
        message: API_MESSAGE.GENERAL.RESEND.INVALID_REQUEST,
      });
    }

    await this.emailService.updateEmailByResendId(
      eventPayload.data.email_id,
      {
        status: "delivered",
      },
      this.database
    );

    return this.apiResponse({
      statusCode: StatusCodes.ACCEPTED,
      message: API_MESSAGE.MAIL.WEBHOOK_QUEUED,
      data: null,
    });
  }

  @Post("/email-event")
  @RequireResendWebhook("emailEvent")
  public async emailEvent(
    @Request() request: IRequest
  ): Promise<ApiResponse<null>> {
    const eventPayload = this.getWebhookEvent(request);

    switch (eventPayload.type) {
      case "email.sent":
        await this.emailService.updateEmailByResendId(
          eventPayload.data.email_id,
          {
            status: "sent",
            resendMessageId: this.cleanMessageId(eventPayload.data.message_id),
          },
          this.database
        );
        break;
      case "email.failed":
        await this.emailService.updateEmailByResendId(
          eventPayload.data.email_id,
          {
            status: "failed",
          },
          this.database
        );
        break;
      case "email.bounced":
        await this.emailService.updateEmailByResendId(
          eventPayload.data.email_id,
          {
            status: "bounced",
          },
          this.database
        );
        break;
      case "email.complained":
        await this.emailService.updateEmailByResendId(
          eventPayload.data.email_id,
          {
            status: "complained",
          },
          this.database
        );
        break;
      case "email.suppressed":
        await this.emailService.updateEmailByResendId(
          eventPayload.data.email_id,
          {
            status: "suppressed",
          },
          this.database
        );
        break;
      case "email.delivery_delayed":
        await this.emailService.updateEmailByResendId(
          eventPayload.data.email_id,
          {
            status: "delivery_delayed",
          },
          this.database
        );
        break;
      default:
        throw this.apiError({
          statusCode: StatusCodes.BAD_REQUEST,
          message: API_MESSAGE.GENERAL.RESEND.INVALID_REQUEST,
        });
    }

    return this.apiResponse({
      statusCode: StatusCodes.ACCEPTED,
      message: API_MESSAGE.MAIL.WEBHOOK_QUEUED,
      data: null,
    });
  }
}
