import { DashboardShell } from "#/components/shared/dashboard-shell";
import {
  DashboardShellDescription,
  DashboardShellHeader,
  DashboardShellTitle,
} from "#/components/shared/dashboard-shell/DashboardShellHeader";
import {
  DashboardShellDescriptionSkeleton,
  DashboardShellTitleSkeleton,
} from "#/components/shared/dashboard-shell/DashboardShellHeaderSkeleton";
import { DashboardShellSkeleton } from "#/components/shared/dashboard-shell/DashboardShellSkeleton";
import {
  TabNavigation,
  TabNavigationContent,
  TabNavigationList,
  TabNavigationTrigger,
} from "#/components/tab-navigation";
import { requirePermissions } from "#/features/auth/auth.functions";
import { DetailsStep } from "#/features/user/components/user-details/DetailsStep";
import { orpcTQClient } from "#/server/orpc";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import z from "zod";

import { strInitials } from "@workspace/lib/utils";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/components/avatar";
import { Button } from "@workspace/ui/components/button";
import { ButtonSkeleton } from "@workspace/ui/components/button-skeleton";
import { Spinner } from "@workspace/ui/components/spinner";

export const Route = createFileRoute(
  "/(dashboard)/_dashboardLayout/users/$userId"
)({
  beforeLoad: ({ context }) => {
    requirePermissions(
      context.permissions,
      ["system.user.manage", "system.user.read"],
      context.user.id
    );
  },
  validateSearch: z.object({
    tab: z
      .enum(["details"] as const)
      .optional()
      .default("details"),
  }),
  loader: ({ context: { queryClient }, params: { userId } }) =>
    queryClient.query(
      orpcTQClient.user.details.queryOptions({
        input: {
          userId,
        },
      })
    ),
  pendingComponent: LoadingComponent,
  component: RouteComponent,
});

function RouteComponent() {
  const { data } = Route.useLoaderData();
  const { userId } = Route.useParams();

  return (
    <DashboardShell
      className="max-w-5xl w-full mx-auto"
      header={
        <DashboardShellHeader>
          <Button
            variant="ghost"
            nativeButton={false}
            render={<Link to="/users" />}
          >
            <ArrowLeft />
            <span>Go Back</span>
          </Button>
          <DashboardShellTitle>User Details</DashboardShellTitle>
          <DashboardShellDescription>
            View and manage user account details
          </DashboardShellDescription>
        </DashboardShellHeader>
      }
    >
      <div className="flex md:flex-row flex-col items-center gap-4">
        <Avatar className="size-24">
          <AvatarImage
            src={data.image ?? "/user_placeholder_img.png"}
            alt={data.name}
          />
          <AvatarFallback className="text-xs font-semibold uppercase">
            {strInitials(data.name)}
          </AvatarFallback>
        </Avatar>
        <div className="text-left leading-tight">
          <div className="text-2xl font-semibold">{data.name}</div>
          <div className="truncate text-sm text-muted-foreground">
            {data.email}
          </div>
        </div>
      </div>
      <TabNavigation
        defaultTab="details"
        routeId="/(dashboard)/_dashboardLayout/users/$userId"
      >
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
  );
}

function LoadingComponent() {
  return (
    <DashboardShellSkeleton
      className="mx-auto w-full max-w-5xl"
      header={
        <DashboardShellHeader>
          <ButtonSkeleton />
          <DashboardShellTitleSkeleton />
          <DashboardShellDescriptionSkeleton />
        </DashboardShellHeader>
      }
    >
      <div className="flex w-full items-center justify-center p-4">
        <Spinner className="size-14 text-primary" strokeWidth={1} />
      </div>
    </DashboardShellSkeleton>
  );
}
