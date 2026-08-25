"use client";

import { useQuery } from "@tanstack/react-query";

import { Badge } from "@workspace/ui/components/badge";
import { Card, CardContent } from "@workspace/ui/components/card";

import { QueryStateBoundary } from "@/lib/tanstack/query/QueryStateBoundary";

import { FormatDateCell } from "@/components/format-date/FormatDateCell";

import { orpcTQClient } from "@/server/orpc.client";

export function DetailsStep({ userId }: { userId: string }) {
  const { data, isLoading, isError, error } = useQuery(
    orpcTQClient.user.details.queryOptions({
      input: {
        userId,
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
        <Card>
          <CardContent>
            <div className="grid grid-cols-[repeat(auto-fill,minmax(250px,1fr))] gap-4">
              <DetailsItem title="Name">{data.name}</DetailsItem>
              <DetailsItem title="Email">
                {data.email}{" "}
                <Badge variant={data.emailVerified ? "default" : "secondary"}>
                  {data.emailVerified ? "Verified" : "Unverified"}
                </Badge>
              </DetailsItem>
              <DetailsItem title="Registered at">
                <FormatDateCell format="dd, MMM yyyy" value={data.createdAt} />
              </DetailsItem>
              <DetailsItem title="Last login at">
                {data.lastLogin ? (
                  <FormatDateCell
                    format="dd/MM/yy - hh:mm:ss a"
                    value={data.lastLogin}
                  />
                ) : (
                  <span>N/A</span>
                )}
              </DetailsItem>
            </div>
          </CardContent>
        </Card>
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
