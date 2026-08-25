import type { Meta, StoryObj } from "@storybook/react-vite";

import {
  Progress,
  ProgressLabel,
  ProgressValue,
} from "@workspace/ui/components/progress";

const meta = {
  title: "UI/Progress",
  component: Progress,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    value: {
      control: { type: "number", min: 0, max: 100 },
    },
  },
} satisfies Meta<typeof Progress>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    value: 60,
    className: "w-56",
  },
};

export const WithLabel: Story = {
  args: {
    value: 40,
    className: "w-56",
  },
  render: (args) => (
    <Progress {...args}>
      <ProgressLabel>Uploading</ProgressLabel>
      <ProgressValue />
    </Progress>
  ),
};
