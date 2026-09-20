import type { Metadata } from "next";
import Link from "next/link";

import {
  Building2,
  CalendarDays,
  Check,
  Mail,
  Pencil,
  Shield,
  User,
} from "lucide-react";

import { formatDateWithTimezone, formatEnumValue } from "@workspace/lib/utils";
import { Avatar, AvatarFallback } from "@workspace/ui/components/avatar";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Separator } from "@workspace/ui/components/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@workspace/ui/components/tooltip";

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

import { getAuthUserWithRolesAndPermissionsCache } from "@/features/auth/data/getAuthUser";
import { nameInitials } from "@/utils/nameInitials";

export const metadata: Metadata = {
  title: "Profile",
};

export default async function ProfilePage() {
  const { user, roles, permissions } =
    await getAuthUserWithRolesAndPermissionsCache();

  return (
    <DashboardShell
      className="max-w-5xl w-full mx-auto"
      header={
        <DashboardShellHeader>
          <DashboardShellTitle>Profile</DashboardShellTitle>
          <DashboardShellDescription>
            Your personal profile details
          </DashboardShellDescription>
        </DashboardShellHeader>
      }
    >
      <div className="flex items-center gap-4">
        <Avatar className="shrink-0 size-12">
          <UserAvatarImage image={user.image} alt={user.name} />
          <AvatarFallback>{nameInitials(user.name)}</AvatarFallback>
        </Avatar>

        <div>
          <h2 className="text-base font-semibold">{user.name}</h2>
          <div className="flex items-center gap-1 text-muted-foreground">
            <Mail className="size-3" />
            <span className="text-xs">{user.email}</span>
          </div>
        </div>
      </div>

      <TabNavigation defaultValue="details">
        <TabNavigationList variant="line">
          <TabNavigationTrigger value="details">
            <User />
            <span>Details</span>
          </TabNavigationTrigger>

          <TabNavigationTrigger value="roles">
            <Shield />
            <span>Roles</span>
          </TabNavigationTrigger>

          <TabNavigationTrigger value="permissions">
            <Building2 />
            <span>Permissions</span>
          </TabNavigationTrigger>
        </TabNavigationList>

        <TabNavigationContent value="details">
          <Card>
            <CardHeader>
              <CardTitle>Profile Details</CardTitle>
              <CardAction>
                <Tooltip>
                  <TooltipTrigger
                    render={
                      <Button
                        size="icon"
                        nativeButton={false}
                        render={<Link href="/dashboard/settings/profile" />}
                      />
                    }
                  >
                    <Pencil />
                    <span className="sr-only">update profile</span>
                  </TooltipTrigger>

                  <TooltipContent>
                    <p>Update Profile</p>
                  </TooltipContent>
                </Tooltip>
              </CardAction>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-2">
                <div>
                  <h4 className="font-semibold">Name</h4>
                  <div className="flex items-center gap-1">
                    <User className="size-3.5" />
                    <span>{user.name}</span>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold">Email</h4>
                  <div className="flex items-center gap-1">
                    <Mail className="size-3.5" />
                    <span>{user.email}</span>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold">Joined At</h4>
                  <div className="flex items-center gap-1">
                    <CalendarDays className="size-3.5" />
                    <span>
                      {formatDateWithTimezone(
                        user.createdAt,
                        "PP",
                        user.timezone
                      )}
                    </span>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold">Email Verified</h4>
                  <Badge
                    variant={user.emailVerified ? "default" : "outline"}
                    className="text-xs"
                  >
                    <Check className="size-3.5" />
                    <span>
                      {user.emailVerified ? "Verified" : "Not Verified"}
                    </span>
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabNavigationContent>
        <TabNavigationContent value="roles">
          <Card>
            <CardHeader>
              <CardTitle>Roles</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <section>
                <h3 className="flex items-center gap-1.5 text-muted-foreground">
                  <Shield className="size-3" />
                  <span className="text-xs font-medium">SYSTEM</span>
                </h3>
                <Separator className="my-2" />
                <div className="flex flex-wrap items-center gap-2">
                  {roles.map((role) => (
                    <Badge key={role.roleName}>
                      <User className="size-3.5" />
                      <span>{formatEnumValue(role.roleName)}</span>
                    </Badge>
                  ))}
                </div>
              </section>
            </CardContent>
          </Card>
        </TabNavigationContent>
        <TabNavigationContent value="permissions">
          <Card>
            <CardHeader>
              <CardTitle>Permissions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <section>
                <h3 className="flex items-center gap-1.5 text-muted-foreground">
                  <Shield className="size-3" />
                  <span className="text-xs font-medium">SYSTEM</span>
                </h3>
                <Separator className="my-2" />
                <div className="flex flex-wrap items-center gap-2">
                  {permissions.map((perm) => (
                    <Badge
                      key={perm.name}
                      variant="outline"
                      className="font-mono text-xs"
                    >
                      <User className="size-3.5" />
                      <span className="capitalize">{`${perm.resource} - ${perm.action}`}</span>
                    </Badge>
                  ))}
                </div>
              </section>
            </CardContent>
          </Card>
        </TabNavigationContent>
      </TabNavigation>
    </DashboardShell>
  );
}
