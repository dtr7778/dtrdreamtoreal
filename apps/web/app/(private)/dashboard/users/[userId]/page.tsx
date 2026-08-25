import { Metadata } from "next";

import { ArrowLeft } from "lucide-react";

import { Avatar, AvatarFallback } from "@workspace/ui/components/avatar";

import { getQueryClient, HydrateClient } from "@/lib/tanstack/query/hydration";

import { LinkButton } from "@/components/LinkButton";
import { DashboardShell } from "@/components/shared/dashboard-shell";
import {
  DashboardShellDescription,
  DashboardShellHeader,
  DashboardShellTitle,
} from "@/components/shared/dashboard-shell/DashboardShellHeader";
import {
  TabNavigation,
  TabNavigationContent,
  TabNavigationList,
  TabNavigationTrigger,
} from "@/components/tab-navigation";
import { UserAvatarImage } from "@/components/UserAvatar";

import { DetailsStep } from "@/features/user/components/user-details/DetailsStep";
import { orpcTQClient } from "@/server/orpc.client";
import { nameInitials } from "@/utils/nameInitials";
import { requireUserPermissionsCache } from "@/utils/user-utils";

export const metadata: Metadata = {
  title: "User Details",
};

export default async function UserDetailsPage(
  props: PageProps<"/dashboard/users/[userId]">
) {
  const { userId } = await props.params;

  await requireUserPermissionsCache(["system.user.manage", "system.user.read"]);

  const queryclient = getQueryClient();

  const { data } = await queryclient.query(
    orpcTQClient.user.details.queryOptions({
      input: {
        userId,
      },
    })
  );

  return (
    <HydrateClient client={queryclient}>
      <DashboardShell
        className="max-w-5xl w-full mx-auto"
        header={
          <DashboardShellHeader>
            <LinkButton href="/dashboard/users">
              <ArrowLeft />
              <span>Go Back</span>
            </LinkButton>
            <DashboardShellTitle>User Details</DashboardShellTitle>
            <DashboardShellDescription>
              View and manage user account details
            </DashboardShellDescription>
          </DashboardShellHeader>
        }
      >
        <div className="flex md:flex-row flex-col items-center gap-4">
          <Avatar className="size-24">
            <UserAvatarImage image={data.image} alt={data.name} />
            <AvatarFallback className="text-xs font-semibold uppercase">
              {nameInitials(data.name)}
            </AvatarFallback>
          </Avatar>
          <div className="text-left leading-tight">
            <div className="text-2xl font-semibold">{data.name}</div>
            <div className="truncate text-sm text-muted-foreground">
              {data.email}
            </div>
          </div>
        </div>
        <TabNavigation defaultValue="details">
          <TabNavigationList variant="line">
            <TabNavigationTrigger value="details">
              <span>Details</span>
            </TabNavigationTrigger>
          </TabNavigationList>
          <TabNavigationContent value="details">
            <DetailsStep userId={userId} />
          </TabNavigationContent>
        </TabNavigation>
      </DashboardShell>
    </HydrateClient>
  );
}
