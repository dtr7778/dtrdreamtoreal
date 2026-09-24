import { StatusCodes } from "http-status-codes";
import { inject } from "inversify";

import { contracts, type ContractsType } from "@workspace/contract";
import { BULLMQ_TRANSPORT_HEADERS } from "@workspace/lib/bullmq";
import {
  Controller,
  Header,
  Post,
  RequestValidator,
} from "@workspace/lib/server";

import { API_MESSAGE } from "@/constant";
import { CONTAINER_TYPES } from "@/container/container-types";
import { BaseController } from "@/helpers/BaseController";

import { QueueSignatureService } from "../../helpers/QueueSignature.service";
import { MailQueueService } from "./MailQueue.service";

export interface IMailController {
  sendMail(
    signature: string | undefined,
    input: ContractsType["mail"]["send"]["input"]
  ): Promise<ContractsType["mail"]["send"]["output"]>;
}

@Controller({ path: "/mails", scope: "Singleton", tags: ["Mail"] })
export class MailController extends BaseController implements IMailController {
  constructor(
    @inject(CONTAINER_TYPES.MailQueueService)
    private readonly mailQueue: MailQueueService,
    @inject(CONTAINER_TYPES.QueueSignatureService)
    private readonly signature: QueueSignatureService
  ) {
    super();
  }

  @Post("/", contracts.mail.send)
  public async sendMail(
    @Header(BULLMQ_TRANSPORT_HEADERS.signature) signature: string | undefined,
    @RequestValidator(contracts.mail.send.input)
    { body }: ContractsType["mail"]["send"]["input"]
  ): Promise<ContractsType["mail"]["send"]["output"]> {
    this.signature.verifyOrThrow(body, signature);

    const result = await this.mailQueue.sendMail(body);

    return this.response({
      statusCode: StatusCodes.ACCEPTED,
      message: API_MESSAGE.MAIL.JOB_ENQUEU,
      data: result,
    });
  }
}
