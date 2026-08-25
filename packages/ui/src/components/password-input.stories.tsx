import * as React from "react";

import type { Meta, StoryObj } from "@storybook/react-vite";

import { PasswordInput } from "@workspace/ui/components/password-input";

const meta = {
  title: "UI/PasswordInput",
  component: PasswordInput,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof PasswordInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [value, setValue] = React.useState("");
    return (
      <PasswordInput
        {...args}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="w-64"
      />
    );
  },
};

export const Disabled: Story = {
  args: {
    placeholder: "Disabled",
    disabled: true,
    className: "w-64",
  },
};
