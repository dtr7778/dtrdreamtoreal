import { processSteps } from "../content/home";
import { StaggerGroup, StaggerItem } from "./motion";
import { ServiceIcon } from "./service-icon";

export function ProcessTimeline() {
  return (
    <StaggerGroup as="ol" className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {processSteps.map((step) => (
        <StaggerItem
          as="li"
          key={step.step}
          hover
          className="relative flex flex-col gap-4 rounded-xl border border-border bg-card p-6"
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <ServiceIcon name={step.icon} className="size-5" />
            </div>
            <span className="font-heading text-2xl font-semibold text-muted-foreground/40">
              {step.step}
            </span>
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <h3 className="font-heading text-base font-semibold text-foreground">
                {step.title}
              </h3>
              <span className="rounded-full border border-border bg-muted/50 px-2 py-0.5 text-[0.65rem] font-medium text-muted-foreground">
                {step.duration}
              </span>
            </div>
            <p className="text-sm/relaxed text-muted-foreground">
              {step.description}
            </p>
          </div>
        </StaggerItem>
      ))}
    </StaggerGroup>
  );
}
