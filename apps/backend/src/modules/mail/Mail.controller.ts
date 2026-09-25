import { StatusCodes } from "http-status-codes";
import { inject } from "inversify";

import { contracts, type ContractsType } from "@workspace/contract";
import {
  Controller,
  Post,
  RequestValidator,
  UseGuards,
} from "@workspace/lib/server";
import type { TemplateMailPayload } from "@workspace/mail";

import { API_MESSAGE } from "@/constant";
import { CONTAINER_TYPES } from "@/container/container-types";
import { RequireBullmqSignature } from "@/decorators/bullmq-signature.decorator";
import { BullmqSignatureGuard } from "@/guard/bullmq-signature.guard";
import { BaseController } from "@/helpers/BaseController";

import { MailService } from "./Mail.service";

export interface IMailController {
  sendMail(
    input: ContractsType["mail"]["send"]["input"]
  ): Promise<ContractsType["mail"]["send"]["output"]>;
  sendRawMail(
    input: ContractsType["mail"]["raw"]["input"]
  ): Promise<ContractsType["mail"]["raw"]["output"]>;
  sendMailBatch(
    input: ContractsType["mail"]["sendBatch"]["input"]
  ): Promise<ContractsType["mail"]["sendBatch"]["output"]>;
  sendRawMailBatch(
    input: ContractsType["mail"]["rawBatch"]["input"]
  ): Promise<ContractsType["mail"]["rawBatch"]["output"]>;
}

@Controller({ path: "/mails", scope: "Singleton", tags: ["Mail"] })
@UseGuards(BullmqSignatureGuard)
export class MailController extends BaseController implements IMailController {
  constructor(
    @inject(CONTAINER_TYPES.MailService)
    private readonly mailService: MailService
  ) {
    super();
  }

  @Post("/", contracts.mail.send)
  public async sendMail(
    @RequestValidator(contracts.mail.send.input)
    { body }: ContractsType["mail"]["send"]["input"]
  ): Promise<ContractsType["mail"]["send"]["output"]> {
    const result = await this.mailService.send(
      body as unknown as TemplateMailPayload
    );

    return this.response({
      statusCode: StatusCodes.ACCEPTED,
      message: API_MESSAGE.MAIL.JOB_ENQUEU,
      data: result,
    });
  }

  @Post("/raw", contracts.mail.raw)
  public async sendRawMail(
    @RequestValidator(contracts.mail.raw.input)
    { body }: ContractsType["mail"]["raw"]["input"]
  ): Promise<ContractsType["mail"]["raw"]["output"]> {
    const result = await this.mailService.sendRaw(body);

    return this.response({
      statusCode: StatusCodes.ACCEPTED,
      message: API_MESSAGE.MAIL.JOB_ENQUEU,
      data: result,
    });
  }

  @Post("/batch", contracts.mail.sendBatch)
  @RequireBullmqSignature("items")
  public async sendMailBatch(
    @RequestValidator(contracts.mail.sendBatch.input)
    { body }: ContractsType["mail"]["sendBatch"]["input"]
  ): Promise<ContractsType["mail"]["sendBatch"]["output"]> {
    const results = await this.mailService.sendBatch(
      body.items as unknown as TemplateMailPayload[]
    );

    return this.response({
      statusCode: StatusCodes.ACCEPTED,
      message: API_MESSAGE.MAIL.JOB_ENQUEU,
      data: { results },
    });
  }

  @Post("/raw/batch", contracts.mail.rawBatch)
  @RequireBullmqSignature("items")
  public async sendRawMailBatch(
    @RequestValidator(contracts.mail.rawBatch.input)
    { body }: ContractsType["mail"]["rawBatch"]["input"]
  ): Promise<ContractsType["mail"]["rawBatch"]["output"]> {
    const results = await this.mailService.sendRawBatch(body.items);

    return this.response({
      statusCode: StatusCodes.ACCEPTED,
      message: API_MESSAGE.MAIL.JOB_ENQUEU,
      data: { results },
    });
  }
}
