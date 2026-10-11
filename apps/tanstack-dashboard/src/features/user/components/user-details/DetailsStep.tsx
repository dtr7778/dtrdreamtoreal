import { FormatDateCell } from "#/components/FormatDateCell";
import { orpcTQClient } from "#/server/orpc";
import { useQuery } from "@tanstack/react-query";

import { Badge } from "@workspace/ui/components/badge";
import { Card, CardContent } from "@workspace/ui/components/card";
import { QueryStateBoundary } from "@workspace/ui/components/tanstack-query/query-state-boundary";

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
      {(userData) => (
        <Card>
          <CardContent>
            <div className="grid grid-cols-[repeat(auto-fill,minmax(250px,1fr))] gap-4">
              <DetailsItem title="Name">{userData.name}</DetailsItem>
              <DetailsItem title="Email">
                {userData.email}{" "}
                <Badge
                  variant={userData.emailVerified ? "default" : "secondary"}
                >
                  {userData.emailVerified ? "Verified" : "Unverified"}
                </Badge>
              </DetailsItem>
              <DetailsItem title="Registered at">
                <FormatDateCell
                  format="dd, MMM yyyy"
                  value={userData.createdAt}
                />
              </DetailsItem>
              <DetailsItem title="Last login at">
                {userData.lastLogin ? (
                  <FormatDateCell
                    format="dd/MM/yy - hh:mm:ss a"
                    value={userData.lastLogin}
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
