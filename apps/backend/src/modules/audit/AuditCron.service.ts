import { inject } from "inversify";

import type { DatabaseType } from "@workspace/drizzle/types";
import { SiteAuditTable } from "@workspace/drizzle/schemas";
import { CwvStrategyEnumSchema } from "@workspace/drizzle/zod-db-enums";
import { CronJob, CronJobClass } from "@workspace/lib/server";

import { CONTAINER_TYPES } from "@/container/container-types";

import { type IAuditService } from "./Audit.service";
import { CruxClient } from "./clients/crux.client";
import { AUDIT_CRON } from "./constants";

@CronJobClass({ scope: "Singleton" })
export class AuditCronService {
  constructor(
    @inject(CONTAINER_TYPES.Drizzle)
    private readonly db: DatabaseType,
    @inject(CONTAINER_TYPES.AuditService)
    private readonly auditService: IAuditService,
    @inject(CONTAINER_TYPES.CruxClient)
    private readonly crux: CruxClient
  ) {}

  @CronJob(AUDIT_CRON.countryCwvSync, {
    jobName: "audit.monthly-cwv-sync",
    timezone: "UTC",
  })
  async monthlyCwvSync(): Promise<void> {
    const sites = await this.db.select().from(SiteAuditTable);

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
        } catch {
          continue;
        }
      }
    }
  }
}
