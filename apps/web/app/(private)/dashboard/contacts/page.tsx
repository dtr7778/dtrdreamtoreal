import { parseAsStringEnum } from "nuqs/server";

import { ContactStatusEnumSchema } from "@workspace/drizzle/zod-db-enums";

import { createRangeFilterServer } from "@/lib/nuqs/rangeFilter.server";
import { tableQuerySearchParams } from "@/lib/nuqs/tableQuerySearchParams";
import { getQueryClient, HydrateClient } from "@/lib/tanstack/query/hydration";

import { DashboardShell } from "@/components/shared/dashboard-shell";
import {
  DashboardShellHeader,
  DashboardShellTitle,
} from "@/components/shared/dashboard-shell/DashboardShellHeader";

import { ContactManagementTable } from "@/features/contact/components/contact-table/ContactManagementTable";
import { orpcTQClient } from "@/server/orpc.client";
import { requireUserPermissionsCache } from "@/utils/user-utils";

export default async function ContactPage(
  props: PageProps<"/dashboard/contacts">
) {
  await requireUserPermissionsCache([
    "system.contact.manage",
    "system.contact.list",
  ]);

  const queryClient = getQueryClient();

  const filters = await tableQuerySearchParams({
    ...createRangeFilterServer(),
    status: parseAsStringEnum(ContactStatusEnumSchema.options).withOptions({
      clearOnDefault: true,
    }),
  })(props.searchParams);

  const searchFields = ["subject"];

  const queryclient = getQueryClient();

  await queryclient.query(
    orpcTQClient.contact.list.queryOptions({
      input: {
        page: filters.page,
        limit: filters.limit,
        search: filters.search,
        searchFields,
        order: filters.order ?? undefined,
        orderField: filters.orderField ?? undefined,
      },
    })
  );

  return (
    <HydrateClient client={queryClient}>
      <DashboardShell
        header={
          <DashboardShellHeader>
            <DashboardShellTitle>Contacts</DashboardShellTitle>
          </DashboardShellHeader>
        }
      >
        <ContactManagementTable searchFields={searchFields} />
      </DashboardShell>
    </HydrateClient>
  );
}
