import { createFileRoute, Navigate } from "@tanstack/react-router";

export const Route = createFileRoute(
  "/(dashboard)/_dashboardLayout/(settings)/_settingsLayout/settings/"
)({
  component: RouteComponent,
});

function RouteComponent() {
  return <Navigate to="/settings/profile" />;
}
