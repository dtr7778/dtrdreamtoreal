"use client";

import { useState } from "react";

import { useQuery } from "@tanstack/react-query";
import {
  Briefcase,
  Calendar,
  FileText,
  Globe,
  Mail,
  Phone,
  Users,
} from "lucide-react";

import { Badge } from "@workspace/ui/components/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Separator } from "@workspace/ui/components/separator";

import { QueryStateBoundary } from "@/lib/tanstack/query/QueryStateBoundary";

import { FormatDateCell } from "@/components/format-date/FormatDateCell";

import { AddressCard } from "@/features/company/components/AddressCard";
import { AddressUpdateDialog } from "@/features/company/components/dialogs/AddressUpdateDialog";
import { SocialMediaUpdateDialog } from "@/features/company/components/dialogs/SocialMediaUpdateDialog";
import { SocialMediaCard } from "@/features/company/components/SocialMediaCard";
import { usePermissionCheck } from "@/hooks/use-permission-check";
import { orpcTQClient } from "@/server/orpc.client";

import { useUpdateCompany } from "../../api/company.api.hook";
import { CompanyUpdateType } from "../../company.schema";

export function CompanyDetailsStep({ companyId }: { companyId: string }) {
  const [openSocialMediaDialog, setOpenSocialMediaDialog] = useState(false);
  const [openAddressDialog, setOpenAddressDialog] = useState(false);

  const canUpdate = usePermissionCheck([
    "system.company.manage",
    "system.company.update",
  ]);

  const { data, isLoading, isError, error } = useQuery(
    orpcTQClient.company.details.queryOptions({
      input: { companyId },
    })
  );

  const { mutate: updateCompany, isPending } = useUpdateCompany<
    keyof CompanyUpdateType
  >({
    onSuccess: () => {
      setOpenSocialMediaDialog(false);
      setOpenAddressDialog(false);
    },
  });

  return (
    <QueryStateBoundary
      isLoading={isLoading}
      isError={isError}
      error={error}
      isEmpty={() => false}
      data={data?.data}
    >
      {(data) => (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            <div className="lg:col-span-8 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Briefcase className="size-4 text-primary" />
                    <h3 className="font-semibold text-foreground">
                      Company Information
                    </h3>
                  </CardTitle>
                </CardHeader>
                <Separator />
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2">
                    <DetailRow icon={<Mail className="size-4" />} label="Email">
                      {data.email || (
                        <span className="text-muted-foreground">N/A</span>
                      )}
                    </DetailRow>
                    <DetailRow
                      icon={<Phone className="size-4" />}
                      label="Phone"
                    >
                      {data.phone || (
                        <span className="text-muted-foreground">N/A</span>
                      )}
                    </DetailRow>
                    <DetailRow
                      icon={<Globe className="size-4" />}
                      label="Website"
                    >
                      {data.website ? (
                        <a
                          href={data.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-primary hover:underline"
                        >
                          {data.website.replace(/^https?:\/\//, "")}
                        </a>
                      ) : (
                        <span className="text-muted-foreground">N/A</span>
                      )}
                    </DetailRow>
                    <DetailRow
                      icon={<Briefcase className="size-4" />}
                      label="Industry"
                    >
                      {data.industry ? (
                        <Badge variant="secondary" className="font-medium">
                          {data.industry}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">N/A</span>
                      )}
                    </DetailRow>
                    <DetailRow
                      icon={<Users className="size-4" />}
                      label="Employee Size"
                    >
                      {data.employSize || (
                        <span className="text-muted-foreground">N/A</span>
                      )}
                    </DetailRow>
                    <DetailRow
                      icon={<Users className="size-4" />}
                      label="Total Employees"
                    >
                      <Badge
                        variant="outline"
                        className="font-semibold text-muted-foreground"
                      >
                        {`${data.employeeCount} of ${data.employSize || 0}`}
                      </Badge>
                    </DetailRow>
                  </div>
                  {data.description && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <FileText className="size-4 text-primary" />
                        <h3 className="font-semibold text-foreground">
                          Description
                        </h3>
                      </div>
                      <p className="text-sm leading-relaxed text-muted-foreground p-2 bg-muted border border-dashed rounded-lg">
                        {data.description}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
              <AddressCard
                addresses={data.addresses}
                onEdit={
                  canUpdate ? () => setOpenAddressDialog(true) : undefined
                }
              />
            </div>

            <div className="lg:col-span-4 space-y-4">
              <SocialMediaCard
                socialMedia={data.socialMedia}
                onEdit={
                  canUpdate ? () => setOpenSocialMediaDialog(true) : undefined
                }
              />
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="size-4 text-primary" />
                    <h3 className="font-semibold text-foreground">Timeline</h3>
                  </CardTitle>
                </CardHeader>
                <Separator />
                <CardContent>
                  <div className="grid gap-4">
                    <div className="flex items-center gap-3 rounded-lg border border-border/60 bg-muted/30 p-3">
                      <div className="flex size-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                        <Calendar className="size-4" />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-muted-foreground">
                          Created
                        </p>
                        <p className="text-sm font-semibold text-foreground">
                          <FormatDateCell
                            format="PP, p"
                            value={data.createdAt}
                          />
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 rounded-lg border border-border/60 bg-muted/30 p-3">
                      <div className="flex size-9 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
                        <Calendar className="size-4" />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-muted-foreground">
                          Updated
                        </p>
                        <p className="text-sm font-semibold text-foreground">
                          <FormatDateCell
                            format="PP, p"
                            value={data.updatedAt}
                          />
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <SocialMediaUpdateDialog
            open={openSocialMediaDialog}
            onOpenChange={setOpenSocialMediaDialog}
            isPending={isPending}
            defaultType="company"
            defaultValues={data.socialMedia.map((socialMedia) => ({
              type: socialMedia.type,
              platform: socialMedia.platform,
              username: socialMedia.username,
              displayName: socialMedia.displayName ?? "",
              url: socialMedia.url,
              notes: socialMedia.notes ?? "",
            }))}
            onSubmit={({ socialMedia }) =>
              updateCompany({ companyId, socialMedia })
            }
          />

          <AddressUpdateDialog
            open={openAddressDialog}
            onOpenChange={setOpenAddressDialog}
            isPending={isPending}
            defaultType="work"
            defaultValues={data.addresses.map((address) => ({
              type: address.type,
              streetLine1: address.streetLine1,
              streetLine2: address.streetLine2 ?? "",
              city: address.city,
              state: address.state ?? "",
              zipCode: address.zipCode,
              country: address.country,
              isPrimary: address.isPrimary,
              latitude: address.latitude ?? "",
              longitude: address.longitude ?? "",
              notes: address.notes ?? "",
            }))}
            onSubmit={({ addresses }) =>
              updateCompany({ companyId, addresses })
            }
          />
        </>
      )}
    </QueryStateBoundary>
  );
}

function DetailRow({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="group flex items-start gap-3 rounded-lg border border-transparent p-2.5 transition-colors hover:border-border/60 hover:bg-muted/30">
      <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground transition-colors group-hover:bg-primary/10 group-hover:text-primary">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        <div className="mt-0.5 flex items-center gap-1.5 text-sm font-medium truncate text-foreground">
          {children}
        </div>
      </div>
    </div>
  );
}
