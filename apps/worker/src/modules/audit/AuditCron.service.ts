import { asc, gt } from "drizzle-orm";
import { inject } from "inversify";

import { SiteAuditTable } from "@workspace/drizzle/schemas";
import type { DatabaseType } from "@workspace/drizzle/types";
import { CwvStrategyEnumSchema } from "@workspace/drizzle/zod-db-enums";
import { type LoggerType } from "@workspace/lib/logger";
import { CronJob, CronJobClass } from "@workspace/server-core/framework";

import { CONTAINER_TYPES } from "@/container/container-types";

import { type IAUditService } from "./Audit.service";
import { type ICruxClient } from "./clients/crux.client";

export const AUDIT_CRON = {
  countryCwvSync: "0 4 1 * *",
} as const;

const SITE_PAGE_SIZE = 200;

export interface IAuditCronService {
  monthlyCwvSync(): Promise<void>;
}

@CronJobClass({ scope: "Singleton" })
export class AuditCronService implements IAuditCronService {
  constructor(
    @inject(CONTAINER_TYPES.Drizzle)
    private readonly db: DatabaseType,
    @inject(CONTAINER_TYPES.AuditService)
    private readonly auditService: IAUditService,
    @inject(CONTAINER_TYPES.CruxClient)
    private readonly crux: ICruxClient,
    @inject(CONTAINER_TYPES.Logger)
    private readonly log: LoggerType
  ) {}

  @CronJob(AUDIT_CRON.countryCwvSync, {
    jobName: "audit.monthly-cwv-sync",
    timezone: "UTC",
  })
  async monthlyCwvSync(): Promise<void> {
    let lastId: string | undefined;

    // Process sites in pages so the whole table is never loaded at once.
    for (;;) {
      const sites = await this.db
        .select()
        .from(SiteAuditTable)
        .where(lastId ? gt(SiteAuditTable.id, lastId) : undefined)
        .orderBy(asc(SiteAuditTable.id))
        .limit(SITE_PAGE_SIZE);

      if (sites.length === 0) break;

      for (const site of sites) {
        for (const formFactor of CwvStrategyEnumSchema.options) {
          try {
            const history = await this.crux.queryHistory(site.url, formFactor);
            const latest = history?.points.at(-1);
            if (!latest) continue;
            await this.auditService.storeCwv(site.id, {
              url: site.url,
              strategy: formFactor,
              source: "crux_history",
              lcp: latest.lcp,
              inp: latest.inp,
              cls: latest.cls,
              ttfb: latest.ttfb,
              fcp: latest.fcp,
              performanceScore: null,
              countryCode: null,
            });
          } catch (err) {
            this.log.warn(
              { err, siteId: site.id, url: site.url, formFactor },
              "monthly CWV sync failed for site"
            );
          }
        }
      }

      lastId = sites[sites.length - 1]?.id;
      if (sites.length < SITE_PAGE_SIZE) break;
    }
  }
}
