import type { Meta, StoryObj } from "@storybook/react-vite";
import { Edit } from "lucide-react";

import { Button } from "@workspace/ui/components/button";

const meta = {
  title: "UI/Button",
  component: Button,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      options: [
        "default",
        "outline",
        "secondary",
        "ghost",
        "destructive",
        "link",
      ],
      control: { type: "radio" },
    },
    size: {
      options: [
        "default",
        "xs",
        "sm",
        "lg",
        "icon",
        "icon-xs",
        "icon-sm",
        "icon-lg",
      ],
      control: { type: "radio" },
    },
    disabled: {
      control: { type: "boolean" },
    },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Primary Button
 */
export const Primary: Story = {
  args: {
    variant: "default",
    size: "default",
    children: "Button",
  },
};

/**
 * Icon Button
 */
export const Icon: Story = {
  args: {
    variant: "default",
    size: "icon",
    children: <Edit />,
  },
};
