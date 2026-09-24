import { and, eq } from "drizzle-orm";
import { StatusCodes } from "http-status-codes";
import { inject } from "inversify";

import { contracts, type ContractsType } from "@workspace/contract";
import type { DatabaseType } from "@workspace/drizzle/client";
import { userProfileColumns } from "@workspace/drizzle/helpers";
import {
  buildPaginateOptions,
  buildPaginationMeta,
} from "@workspace/drizzle/paginate-query";
import {
  AuditItemTable,
  CompanyTable,
  CwvSnapshotTable,
  FileTable,
  RoleTable,
  SiteAuditTable,
  UserRoleTable,
  UserTable,
} from "@workspace/drizzle/schemas";
import {
  Controller,
  Delete,
  Get,
  Patch,
  Post,
  RequestValidator,
} from "@workspace/lib/server";

import { API_MESSAGE } from "@/constant";
import { CONTAINER_TYPES } from "@/container/container-types";
import { BaseController } from "@/helpers/BaseController";

import { type IAuditService } from "./Audit.service";

export interface ISiteController {
  list(
    input: ContractsType["siteAudit"]["list"]["input"]
  ): Promise<ContractsType["siteAudit"]["list"]["output"]>;
  listRunItems(
    input: ContractsType["siteAudit"]["listAuditItems"]["input"]
  ): Promise<ContractsType["siteAudit"]["listAuditItems"]["output"]>;
  create(
    input: ContractsType["siteAudit"]["create"]["input"]
  ): Promise<ContractsType["siteAudit"]["create"]["output"]>;
  get(
    input: ContractsType["siteAudit"]["get"]["input"]
  ): Promise<ContractsType["siteAudit"]["get"]["output"]>;
  update(
    input: ContractsType["siteAudit"]["update"]["input"]
  ): Promise<ContractsType["siteAudit"]["update"]["output"]>;
  remove(
    input: ContractsType["siteAudit"]["delete"]["input"]
  ): Promise<ContractsType["siteAudit"]["delete"]["output"]>;
  history(
    input: ContractsType["siteAudit"]["cwv"]["list"]["input"]
  ): Promise<ContractsType["siteAudit"]["cwv"]["list"]["output"]>;
}

@Controller({
  path: "/site-audits",
  scope: "Singleton",
  tags: ["Site audits"],
})
export class SiteAuditController
  extends BaseController
  implements ISiteController
{
  constructor(
    @inject(CONTAINER_TYPES.Drizzle)
    private readonly db: DatabaseType,
    @inject(CONTAINER_TYPES.AuditService)
    private readonly auditService: IAuditService
  ) {
    super();
  }

  @Get("/", contracts.siteAudit.list)
  public async list(
    @RequestValidator(contracts.siteAudit.list.input)
    { query }: ContractsType["siteAudit"]["list"]["input"]
  ): Promise<ContractsType["siteAudit"]["list"]["output"]> {
    const { offset, limit, where, orderBy, page } = buildPaginateOptions(
      {
        name: SiteAuditTable.name,
        url: SiteAuditTable.url,
        startedAt: SiteAuditTable.startedAt,
        completedAt: SiteAuditTable.completedAt,
        createdAt: SiteAuditTable.createdAt,
        companyId: SiteAuditTable.companyId,
      },
      query
    );

    const [totalCount, sites] = await Promise.all([
      this.db.$count(
        this.db
          .select({ id: SiteAuditTable.id })
          .from(SiteAuditTable)
          .where(where)
      ),
      this.db
        .select({
          id: SiteAuditTable.id,
          url: SiteAuditTable.url,
          name: SiteAuditTable.name,
          status: SiteAuditTable.status,
          totalItems: SiteAuditTable.totalItems,
          completedItems: SiteAuditTable.completedItems,
          passedItems: SiteAuditTable.passedItems,
          failedItems: SiteAuditTable.failedItems,
          company: {
            id: CompanyTable.id,
            name: CompanyTable.name,
          },
          triggeredByUser: userProfileColumns,
          startedAt: SiteAuditTable.startedAt,
          completedAt: SiteAuditTable.completedAt,
          createdAt: SiteAuditTable.createdAt,
          updatedAt: SiteAuditTable.updatedAt,
        })
        .from(SiteAuditTable)
        .innerJoin(CompanyTable, eq(CompanyTable.id, SiteAuditTable.companyId))
        .leftJoin(UserTable, eq(UserTable.id, SiteAuditTable.triggeredBy))
        .leftJoin(UserRoleTable, eq(UserRoleTable.userId, UserTable.id))
        .leftJoin(RoleTable, eq(RoleTable.id, UserRoleTable.roleId))
        .where(where)
        .groupBy(SiteAuditTable.id, CompanyTable.id, UserTable.id)
        .orderBy(orderBy)
        .limit(limit)
        .offset(offset),
    ]);

    return this.response({
      statusCode: StatusCodes.OK,
      message: API_MESSAGE.SITE_AUDIT.GET_ALL,
      data: {
        meta: buildPaginationMeta(totalCount, sites.length, page, limit),
        data: sites,
      },
    });
  }

  @Get("/:id/items", contracts.siteAudit.listAuditItems)
  public async listRunItems(
    @RequestValidator(contracts.siteAudit.listAuditItems.input)
    { params, query }: ContractsType["siteAudit"]["listAuditItems"]["input"]
  ): Promise<ContractsType["siteAudit"]["listAuditItems"]["output"]> {
    const { offset, limit, where, orderBy, page } = buildPaginateOptions(
      {
        title: AuditItemTable.title,
        url: AuditItemTable.url,
        checklistKey: AuditItemTable.checklistKey,
        section: AuditItemTable.section,
        status: AuditItemTable.status,
        createdAt: AuditItemTable.createdAt,
      },
      query
    );

    const finalWhere = and(eq(AuditItemTable.siteAuditId, params.id), where);

    const [totalCount, items] = await Promise.all([
      this.db.$count(AuditItemTable, finalWhere),
      this.db
        .select()
        .from(AuditItemTable)
        .where(finalWhere)
        .orderBy(orderBy)
        .limit(limit)
        .offset(offset),
    ]);

    return this.response({
      statusCode: StatusCodes.OK,
      message: API_MESSAGE.SITE_AUDIT.GET_ALL_AUDIT_ITEM,
      data: {
        meta: buildPaginationMeta(totalCount, items.length, page, limit),
        data: items,
      },
    });
  }

  @Post("/", contracts.siteAudit.create)
  public async create(
    @RequestValidator(contracts.siteAudit.create.input)
    { body }: ContractsType["siteAudit"]["create"]["input"]
  ): Promise<ContractsType["siteAudit"]["create"]["output"]> {
    const run = await this.auditService.createSiteAudit(
      body.companyId,
      body.name,
      body.url,
      body.description ?? undefined
    );

    return this.response({
      statusCode: StatusCodes.CREATED,
      message: API_MESSAGE.SITE_AUDIT.CREATE,
      data: run,
    });
  }

  @Get("/:id", contracts.siteAudit.get)
  public async get(
    @RequestValidator(contracts.siteAudit.get.input)
    { params }: ContractsType["siteAudit"]["get"]["input"]
  ): Promise<ContractsType["siteAudit"]["get"]["output"]> {
    const [siteData] = await this.db
      .select({
        id: SiteAuditTable.id,
        url: SiteAuditTable.url,
        name: SiteAuditTable.name,
        description: SiteAuditTable.description,
        status: SiteAuditTable.status,
        totalItems: SiteAuditTable.totalItems,
        completedItems: SiteAuditTable.completedItems,
        passedItems: SiteAuditTable.passedItems,
        failedItems: SiteAuditTable.failedItems,
        reportImage: {
          id: FileTable.id,
          key: FileTable.key,
          filename: FileTable.filename,
          originalName: FileTable.originalName,
          url: FileTable.url,
        },
        company: {
          id: CompanyTable.id,
          name: CompanyTable.name,
        },
        triggeredByUser: userProfileColumns,
        startedAt: SiteAuditTable.startedAt,
        completedAt: SiteAuditTable.completedAt,
        createdAt: SiteAuditTable.createdAt,
        updatedAt: SiteAuditTable.updatedAt,
      })
      .from(SiteAuditTable)
      .innerJoin(CompanyTable, eq(CompanyTable.id, SiteAuditTable.companyId))
      .leftJoin(FileTable, eq(FileTable.id, SiteAuditTable.reportImageFileId))
      .leftJoin(UserTable, eq(UserTable.id, SiteAuditTable.triggeredBy))
      .leftJoin(UserRoleTable, eq(UserRoleTable.userId, UserTable.id))
      .leftJoin(RoleTable, eq(RoleTable.id, UserRoleTable.roleId))
      .where(eq(SiteAuditTable.id, params.id))
      .limit(1);

    if (!siteData) {
      throw this.apiError({
        statusCode: StatusCodes.NOT_FOUND,
        message: API_MESSAGE.SITE_AUDIT.NOT_FOUND,
      });
    }

    return this.response({
      statusCode: StatusCodes.OK,
      message: API_MESSAGE.SITE_AUDIT.GET,
      data: siteData,
    });
  }

  @Get("/:id/results", contracts.siteAudit.getResult)
  public async getRunResults(
    @RequestValidator(contracts.siteAudit.getResult.input)
    { params }: ContractsType["siteAudit"]["getResult"]["input"]
  ): Promise<ContractsType["siteAudit"]["getResult"]["output"]> {
    const results = await this.auditService.getResults(params.id);

    return this.response({
      statusCode: StatusCodes.OK,
      message: API_MESSAGE.SITE_AUDIT.GET_RESULT,
      data: results,
    });
  }

  @Patch("/:id", contracts.siteAudit.update)
  public async update(
    @RequestValidator(contracts.siteAudit.update.input)
    { params, body }: ContractsType["siteAudit"]["update"]["input"]
  ): Promise<ContractsType["siteAudit"]["update"]["output"]> {
    const [updatedData] = await this.db
      .update(SiteAuditTable)
      .set({ ...body, updatedAt: new Date() })
      .where(eq(SiteAuditTable.id, params.id))
      .returning();

    if (!updatedData) {
      throw this.apiError({
        statusCode: StatusCodes.NOT_FOUND,
        message: API_MESSAGE.SITE_AUDIT.NOT_FOUND,
      });
    }

    return this.response({
      statusCode: StatusCodes.OK,
      message: API_MESSAGE.SITE_AUDIT.UPDATE,
      data: updatedData,
    });
  }

  @Delete("/:id", contracts.siteAudit.delete)
  public async remove(
    @RequestValidator(contracts.siteAudit.delete.input)
    { params }: ContractsType["siteAudit"]["delete"]["input"]
  ): Promise<ContractsType["siteAudit"]["delete"]["output"]> {
    const [existing] = await this.db
      .select({ id: SiteAuditTable.id })
      .from(SiteAuditTable)
      .where(eq(SiteAuditTable.id, params.id))
      .limit(1);

    if (!existing) {
      throw this.apiError({
        statusCode: StatusCodes.NOT_FOUND,
        message: API_MESSAGE.SITE_AUDIT.NOT_FOUND,
      });
    }

    await this.db
      .delete(SiteAuditTable)
      .where(eq(SiteAuditTable.id, existing.id));

    return this.response({
      statusCode: StatusCodes.OK,
      message: API_MESSAGE.SITE_AUDIT.DELETE,
      data: null,
    });
  }

  @Get("/:id/cwv/history", contracts.siteAudit.cwv.list)
  public async history(
    @RequestValidator(contracts.siteAudit.cwv.list.input)
    { params, query }: ContractsType["siteAudit"]["cwv"]["list"]["input"]
  ): Promise<ContractsType["siteAudit"]["cwv"]["list"]["output"]> {
    const { offset, limit, where, orderBy, page } = buildPaginateOptions(
      {
        source: CwvSnapshotTable.source,
        strategy: CwvSnapshotTable.strategy,
        createdAt: CwvSnapshotTable.createdAt,
      },
      query
    );

    const finalWhere = and(eq(CwvSnapshotTable.siteAuditId, params.id), where);

    const [totalCount, snapshots] = await Promise.all([
      this.db.$count(CwvSnapshotTable, finalWhere),
      this.db
        .select()
        .from(CwvSnapshotTable)
        .where(finalWhere)
        .orderBy(orderBy)
        .limit(limit)
        .offset(offset),
    ]);

    return this.response({
      statusCode: StatusCodes.OK,
      message: API_MESSAGE.SITE_AUDIT.CWV.GET_ALL,
      data: {
        meta: buildPaginationMeta(totalCount, snapshots.length, page, limit),
        data: snapshots,
      },
    });
  }
}
