"use client";

import { formatDateWithTimezone } from "@workspace/lib/utils";

import { useAuthStore } from "@/stores/zustand/auth/AuthStoreContext";

interface FormatDateCellBaseProps {
  value: Date | string | number;
  format: string;
  options?: Parameters<typeof formatDateWithTimezone>[3];
}

type FormatDateCellProps<T extends React.ElementType = "span"> =
  FormatDateCellBaseProps &
    Omit<React.ComponentPropsWithoutRef<T>, keyof FormatDateCellBaseProps> & {
      as?: T;
    };

export function FormatDateCell<T extends React.ElementType = "span">({
  as,
  value,
  format,
  options,
  ...props
}: FormatDateCellProps<T>) {
  const user = useAuthStore((state) => state.user!);
  const Component = as ?? "span";

  return (
    <Component {...props}>
      {formatDateWithTimezone(value, format, user.timezone, options)}
    </Component>
  );
}
