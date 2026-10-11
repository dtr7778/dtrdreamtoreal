import * as React from "react";

import type { Meta, StoryObj } from "@storybook/react-vite";
import { addDays } from "date-fns";
import type { DateRange } from "react-day-picker";

import { DateFilter } from "@workspace/ui/components/date-filter";

const meta = {
  title: "UI/date-filter",
  component: DateFilter,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof DateFilter>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    placeholder: "Single Date",
    isInRange: false,
  },
  render: (args) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [value, setValue] = React.useState<Date | DateRange | undefined>(
      new Date()
    );

    return (
      <DateFilter
        {...args}
        value={value}
        onValueChange={setValue}
        onApply={(v) => console.log("Apply", v)}
      />
    );
  },
};

export const Range: Story = {
  args: {
    placeholder: "Date Range",
    isInRange: true,
  },
  render: (args) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [value, setValue] = React.useState<Date | DateRange | undefined>({
      from: new Date(),
      to: addDays(new Date(), 7),
    });

    return (
      <DateFilter
        {...args}
        value={value}
        onValueChange={setValue}
        onApply={(v) => console.log("Apply", v)}
        onCancel={() => setValue(undefined)}
      />
    );
  },
};
