import type { Meta, StoryObj } from "@storybook/react-vite";

import { Badge } from "@workspace/ui/components/badge";

const meta = {
  title: "UI/Badge",
  component: Badge,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      options: [
        "default",
        "secondary",
        "destructive",
        "outline",
        "ghost",
        "link",
      ],
      control: { type: "radio" },
    },
  },
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Primary Button
 */
export const Primary: Story = {
  args: {
    variant: "default",
    children: "Badge",
  },
};
