import { getQueryClient, HydrateClient } from "@/lib/tanstack/query/hydration";

import { UpdateNotificationForm } from "@/features/notification/components/UpdateNotificationForm";
import { orpcTQClient } from "@/server/orpc.client";

export const metadata = {
  title: "Notification Settings",
};

export default async function NotificationPage() {
  const queryclient = getQueryClient();

  await queryclient.prefetchQuery(
    orpcTQClient.notification.settings.queryOptions()
  );

  return (
    <HydrateClient client={queryclient}>
      <div>
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Notification Settings</h1>
          <p className="text-muted-foreground">
            Configure notification settings for your account
          </p>
        </div>
        <UpdateNotificationForm />
      </div>
    </HydrateClient>
  );
}
