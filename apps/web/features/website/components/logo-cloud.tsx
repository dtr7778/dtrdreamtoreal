import { StaggerGroup, StaggerItem } from "./motion";

export function LogoCloud({ logos }: { logos: Array<string> }) {
  return (
    <StaggerGroup
      as="ul"
      className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4"
    >
      {logos.map((logo) => (
        <StaggerItem
          as="li"
          key={logo}
          className="font-heading text-lg font-semibold text-muted-foreground/70"
        >
          {logo}
        </StaggerItem>
      ))}
    </StaggerGroup>
  );
}
