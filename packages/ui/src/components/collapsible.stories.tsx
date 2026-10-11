import type { Meta, StoryObj } from "@storybook/react-vite";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@workspace/ui/components/collapsible";
import { Button } from "@workspace/ui/components/button";

const meta = {
  title: "UI/Collapsible",
  component: Collapsible,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Collapsible>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Collapsible className="w-64">
      <CollapsibleTrigger render={<Button variant="outline" />}>
        Toggle
      </CollapsibleTrigger>
      <CollapsibleContent className="mt-2 rounded-md border p-3 text-xs/relaxed text-muted-foreground">
        Collapsible content goes here.
      </CollapsibleContent>
    </Collapsible>
  ),
};

export const OpenByDefault: Story = {
  args: {
    defaultOpen: true,
  },
  render: () => (
    <Collapsible defaultOpen className="w-64">
      <CollapsibleTrigger render={<Button variant="outline" />}>
        Toggle
      </CollapsibleTrigger>
      <CollapsibleContent className="mt-2 rounded-md border p-3 text-xs/relaxed text-muted-foreground">
        Collapsible content goes here.
      </CollapsibleContent>
    </Collapsible>
  ),
};
