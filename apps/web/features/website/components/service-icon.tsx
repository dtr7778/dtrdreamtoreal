import {
  Gauge,
  LifeBuoy,
  type LucideIcon,
  Search,
  Sparkles,
  SquareCode,
} from "lucide-react";

import type { ServiceIconKey } from "../content/services";

const iconMap: Record<ServiceIconKey, LucideIcon> = {
  code: SquareCode,
  search: Search,
  sparkles: Sparkles,
  gauge: Gauge,
  "life-buoy": LifeBuoy,
};

export function ServiceIcon({
  name,
  className,
}: {
  name: ServiceIconKey;
  className?: string;
}) {
  const Icon = iconMap[name];
  return <Icon aria-hidden="true" className={className} />;
}
