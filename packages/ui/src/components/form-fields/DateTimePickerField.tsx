"use client";

import { useCallback, useId } from "react";

import { Asterisk, Info } from "lucide-react";
import {
  Control,
  Controller,
  ControllerRenderProps,
  FieldValues,
  Path,
} from "react-hook-form";

import { ButtonProps } from "@workspace/ui/components/button";
import {
  type CalendarCompProps,
  DateTimePicker,
} from "@workspace/ui/components/date-time-picker";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@workspace/ui/components/field";

interface DateTimePickerFieldProps<TFieldValues extends FieldValues> {
  name: Path<TFieldValues>;
  control: Control<TFieldValues>;
  label?: string;
  description?: string;
  isDescriptionInfoIconShow?: boolean;
  requiredField?: boolean;
  placeholder?: string;
  disabled?: boolean;
  triggerVariant?: ButtonProps["variant"];
  triggerClassName?: string;
  calendarProps?: Omit<CalendarCompProps, "id">;
  showTimeSelection?: boolean;
  onValueChange?: (value: Date | undefined) => void;
  timezone?: string | null | undefined;
}

export function DateTimePickerField<TFieldValues extends FieldValues>({
  name,
  control,
  label,
  description,
  isDescriptionInfoIconShow = false,
  requiredField = false,
  disabled,
  triggerVariant,
  triggerClassName,
  placeholder,
  calendarProps,
  showTimeSelection = true,
  onValueChange,
  timezone,
}: DateTimePickerFieldProps<TFieldValues>) {
  const fieldId = useId();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid}>
          {label && (
            <FieldLabel htmlFor={fieldId} aria-disabled={disabled}>
              {label}
              {requiredField && (
                <Asterisk className="-mt-2 size-3 text-destructive" />
              )}
            </FieldLabel>
          )}
          <DateTimePickerFieldRender
            field={field}
            onValueChange={onValueChange}
            id={fieldId}
            disabled={disabled}
            triggerVariant={triggerVariant}
            triggerClassName={triggerClassName}
            placeholder={placeholder}
            calendarProps={calendarProps}
            showTimeSelection={showTimeSelection}
            timezone={timezone}
          />
          {description && (
            <FieldDescription
              className="flex items-start gap-1.5"
              aria-disabled={disabled}
            >
              {isDescriptionInfoIconShow && <Info className="mt-0.5 size-4" />}
              {description}
            </FieldDescription>
          )}
          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
        </Field>
      )}
    />
  );
}

interface DateTimePickerFieldRenderProps<TFieldValues extends FieldValues> {
  field: ControllerRenderProps<TFieldValues, Path<TFieldValues>>;
  onValueChange?: (value: Date | undefined) => void;
  id: string;
  placeholder?: string;
  disabled?: boolean;
  triggerVariant?: ButtonProps["variant"];
  triggerClassName?: string;
  calendarProps?: Omit<CalendarCompProps, "id">;
  showTimeSelection?: boolean;
  timezone?: string | null | undefined;
}

function DateTimePickerFieldRender<TFieldValues extends FieldValues>({
  field,
  onValueChange,
  id,
  disabled,
  triggerVariant,
  triggerClassName,
  placeholder,
  calendarProps,
  showTimeSelection = true,
  timezone,
}: DateTimePickerFieldRenderProps<TFieldValues>) {
  const handleSelectValue = useCallback(
    (value: Date | null | undefined) => {
      field.onChange(value);
      onValueChange?.(value ?? undefined);
    },
    [field, onValueChange]
  );

  return (
    <DateTimePicker
      value={field.value}
      onSelectValue={handleSelectValue}
      calendarProps={{ ...calendarProps, id }}
      triggerVariant={triggerVariant}
      placeholder={placeholder}
      triggerClassName={triggerClassName}
      disabled={disabled}
      showTimeSelection={showTimeSelection}
      timezone={timezone}
    />
  );
}
