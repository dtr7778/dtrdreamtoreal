import Link from "next/link";

import { ArrowUpRight, Check } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";

import type { RoutePathType } from "@/types";

import type { Service } from "../content/services";
import { Reveal } from "./motion";
import { ServiceIcon } from "./service-icon";

export function ServiceCard({
  service,
  index,
  showDeliverables = false,
}: {
  service: Service;
  index?: number;
  showDeliverables?: boolean;
}) {
  const number = String((index ?? 0) + 1).padStart(2, "0");

  return (
    <Reveal hover className="h-full">
      <Card
        id={service.slug}
        className="group/card relative h-full scroll-mt-24 gap-4 p-6 ring-border transition-colors hover:ring-primary/40"
      >
        {index !== undefined ? (
          <span className="font-heading absolute inset-e-6 top-6 text-sm font-semibold text-muted-foreground/50">
            {number}
          </span>
        ) : null}
        <div className="flex size-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <ServiceIcon name={service.icon} className="size-5" />
        </div>
        <CardHeader className="gap-1 p-0">
          <CardTitle className="font-heading text-base font-semibold">
            {service.title}
          </CardTitle>
          <CardDescription className="text-xs font-medium tracking-wide text-primary uppercase">
            {service.tagline}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-1 flex-col p-0">
          <p className="text-sm/relaxed text-muted-foreground">
            {service.description}
          </p>
          {showDeliverables ? (
            <ul className="mt-4 flex flex-col gap-2">
              {service.deliverables.map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm">
                  <Check
                    aria-hidden="true"
                    className="mt-0.5 size-4 shrink-0 text-primary"
                  />
                  <span className="text-muted-foreground">{item}</span>
                </li>
              ))}
            </ul>
          ) : null}
          <Link
            href={`/services#${service.slug}` as RoutePathType}
            className="mt-5 inline-flex items-center gap-1 text-sm font-medium text-primary"
          >
            Learn more
            <ArrowUpRight
              aria-hidden="true"
              className="size-4 transition-transform duration-200 group-hover/card:translate-x-0.5 group-hover/card:-translate-y-0.5"
            />
          </Link>
        </CardContent>
      </Card>
    </Reveal>
  );
}
