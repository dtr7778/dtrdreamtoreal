"use client";

import { ProgressProvider } from "@bprogress/next/app";

export function ProgressBarProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProgressProvider
      height="2px"
      color="var(--foreground)"
      options={{ showSpinner: false }}
    >
      {children}
    </ProgressProvider>
  );
}
