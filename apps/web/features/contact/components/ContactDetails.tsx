"use client";
import { Fragment } from "react";

import { useQuery } from "@tanstack/react-query";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Separator } from "@workspace/ui/components/separator";

import { QueryStateBoundary } from "@/lib/tanstack/query/QueryStateBoundary";

import { FormatDateCell } from "@/components/format-date/FormatDateCell";
import {
  DashboardShellDescription,
  DashboardShellHeader,
  DashboardShellTitle,
} from "@/components/shared/dashboard-shell/DashboardShellHeader";
import { UserAvatar } from "@/components/UserAvatar";

import { orpcTQClient } from "@/server/orpc.client";

import { ContactStatusBadge } from "./ContactStatusBadge";

export function ContactDetails({ contactId }: { contactId: string }) {
  const { data, isLoading, isError, error } = useQuery(
    orpcTQClient.contact.details.queryOptions({
      input: {
        contactId,
      },
    })
  );

  return (
    <QueryStateBoundary
      isLoading={isLoading}
      isError={isError}
      error={error}
      isEmpty={() => false}
      data={data?.data}
    >
      {(data) => (
        <div className="space-y-4">
          <DashboardShellHeader>
            <DashboardShellTitle>{data.subject}</DashboardShellTitle>
            <DashboardShellDescription>
              Detailed overview of contact submissions.
            </DashboardShellDescription>
          </DashboardShellHeader>

          <div className="grid grid-cols-12 gap-6">
            <div className="col-span-12 lg:col-span-7 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Message</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="whitespace-pre-wrap text-sm">
                    {data.message}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>{`Replies (${data.replies.length})`}</CardTitle>
                </CardHeader>
                <CardContent>
                  {data.replies.length === 0 ? (
                    <div className="text-sm text-muted-foreground">
                      No replies yet.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {data.replies.map((reply, idx) => (
                        <Fragment key={reply.id}>
                          <div className="flex items-center gap-2 mb-2">
                            <UserAvatar
                              userName={reply.repliedByUser.name}
                              userEmail={reply.repliedByUser.email}
                              imageUrl={reply.repliedByUser.image}
                            />
                            <div>
                              <div className="text-sm font-medium">
                                {reply.repliedByUser.name ??
                                  reply.repliedByUser.email}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                <FormatDateCell
                                  format="dd, MMM yyyy hh:mm aa"
                                  value={reply.createdAt}
                                />
                              </div>
                            </div>
                          </div>
                          <div className="whitespace-pre-wrap text-sm md:pl-10">
                            {reply.reply}
                          </div>
                          {idx < data.replies.length - 1 && <Separator />}
                        </Fragment>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
            <div className="col-span-12 lg:col-span-5 space-y-6">
              <Card>
                <CardContent>
                  <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-4">
                    <DetailsItem title="Name">{data.name}</DetailsItem>
                    <DetailsItem title="Email">{data.email}</DetailsItem>
                    <DetailsItem title="Status">
                      <ContactStatusBadge status={data.status} />
                    </DetailsItem>
                    {data.phone && (
                      <DetailsItem title="Phone">{data.phone}</DetailsItem>
                    )}
                    {data.company && (
                      <DetailsItem title="Company">{data.company}</DetailsItem>
                    )}
                    <DetailsItem title="Subject">{data.subject}</DetailsItem>
                    <DetailsItem title="Submitted at">
                      <FormatDateCell
                        format="dd, MMM yyyy hh:mm aa"
                        value={data.createdAt}
                      />
                    </DetailsItem>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}
    </QueryStateBoundary>
  );
}

function DetailsItem({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="text-muted-foreground font-medium">{title}</div>
      <div className="flex items-center gap-2">{children}</div>
    </div>
  );
}
