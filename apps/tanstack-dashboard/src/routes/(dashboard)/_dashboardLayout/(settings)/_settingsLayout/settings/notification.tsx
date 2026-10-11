import { UpdateNotificationForm } from "#/features/notification/components/UpdateNotificationForm";
import { createFileRoute } from "@tanstack/react-router";

import { Spinner } from "@workspace/ui/components/spinner";

export const Route = createFileRoute(
  "/(dashboard)/_dashboardLayout/(settings)/_settingsLayout/settings/notification"
)({
  pendingComponent: LoadingComponent,
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Notification Settings</h1>
        <p className="text-muted-foreground">
          Configure notification settings for your account
        </p>
      </div>
      <UpdateNotificationForm />
    </div>
  );
}

function LoadingComponent() {
  return (
    <div className="flex w-full items-center justify-center p-4">
      <Spinner className="size-14 text-primary" strokeWidth={1} />
    </div>
  );
}
