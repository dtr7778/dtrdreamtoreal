import type { ReactNode } from "react";

import { PageTransition } from "@/features/website/components/motion";

export default function WebsiteTemplate({
  children,
}: Readonly<{ children: ReactNode }>) {
  return <PageTransition>{children}</PageTransition>;
}
