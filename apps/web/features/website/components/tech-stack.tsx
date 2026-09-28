import { StaggerGroup, StaggerItem } from "./motion";

export function TechStack({
  groups,
}: {
  groups: Array<{ title: string; items: Array<string> }>;
}) {
  return (
    <div className="grid gap-6 sm:grid-cols-3">
      {groups.map((group) => (
        <div
          key={group.title}
          className="flex flex-col gap-4 rounded-xl border border-border bg-card p-6"
        >
          <p className="text-xs font-semibold tracking-wide text-primary uppercase">
            {group.title}
          </p>
          <StaggerGroup as="ul" className="flex flex-wrap gap-2">
            {group.items.map((item) => (
              <StaggerItem
                as="li"
                key={item}
                className="rounded-full border border-border bg-muted/40 px-3 py-1 text-xs font-medium text-muted-foreground"
              >
                {item}
              </StaggerItem>
            ))}
          </StaggerGroup>
        </div>
      ))}
    </div>
  );
}
