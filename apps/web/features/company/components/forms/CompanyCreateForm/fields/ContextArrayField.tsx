"use client";

import { useCallback, useId, useMemo, useState } from "react";

import { Plus, X } from "lucide-react";
import {
  Control,
  Controller,
  ControllerFieldState,
  ControllerRenderProps,
  FieldValues,
  Path,
} from "react-hook-form";

import { Button } from "@workspace/ui/components/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@workspace/ui/components/field";
import { Input } from "@workspace/ui/components/input";
import { cn } from "@workspace/ui/lib/utils";

interface ContextArrayFieldProps<TFieldValues extends FieldValues> {
  name: Path<TFieldValues>;
  control: Control<TFieldValues>;
  label?: string;
  placeholder?: string;
  description?: string;
  disabled?: boolean;
}

function ContextArrayField<TFieldValues extends FieldValues>({
  name,
  control,
  label,
  placeholder,
  description,
  disabled = false,
}: ContextArrayFieldProps<TFieldValues>) {
  const fieldId = useId();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <ContextArrayFieldRender
          field={field}
          fieldState={fieldState}
          id={fieldId}
          label={label}
          placeholder={placeholder}
          description={description}
          disabled={disabled}
        />
      )}
    />
  );
}

interface ContextArrayFieldRenderProps<TFieldValues extends FieldValues> {
  field: ControllerRenderProps<TFieldValues, Path<TFieldValues>>;
  fieldState: ControllerFieldState;
  id: string;
  label?: string;
  placeholder?: string;
  description?: string;
  disabled?: boolean;
}

function ContextArrayFieldRender<TFieldValues extends FieldValues>({
  field,
  fieldState,
  id,
  label,
  placeholder,
  description,
  disabled = false,
}: ContextArrayFieldRenderProps<TFieldValues>) {
  const [draft, setDraft] = useState("");

  const values = useMemo(
    () => (Array.isArray(field.value) ? (field.value as string[]) : []),
    [field.value]
  );

  const handleAdd = useCallback(() => {
    const value = draft.trim();
    if (!value) return;
    if (values.includes(value)) {
      setDraft("");
      return;
    }
    field.onChange([...values, value]);
    setDraft("");
  }, [draft, field, values]);

  const handleRemove = useCallback(
    (value: string) => {
      field.onChange(values.filter((item) => item !== value));
    },
    [field, values]
  );

  return (
    <Field data-invalid={fieldState.invalid}>
      {label && (
        <FieldLabel htmlFor={id} aria-disabled={disabled}>
          {label}
        </FieldLabel>
      )}

      {values.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {values.map((value) => (
            <span
              key={value}
              className="inline-flex items-center gap-1 rounded-md border bg-muted/50 px-2 py-1 text-sm"
            >
              {value}
              <button
                type="button"
                onClick={() => handleRemove(value)}
                disabled={disabled}
                aria-label={`Remove ${value}`}
                className="text-muted-foreground hover:text-foreground disabled:cursor-not-allowed"
              >
                <X className="size-3.5" />
              </button>
            </span>
          ))}
        </div>
      )}

      <div className="flex items-center gap-2">
        <Input
          id={id}
          value={draft}
          placeholder={placeholder}
          aria-invalid={fieldState.invalid}
          disabled={disabled}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              handleAdd();
            }
          }}
        />
        <Button
          type="button"
          variant="secondary"
          size="icon"
          className={cn("shrink-0")}
          onClick={handleAdd}
          disabled={disabled || !draft.trim()}
          aria-label="Add item"
        >
          <Plus className="size-4" />
        </Button>
      </div>

      {description && (
        <FieldDescription aria-disabled={disabled}>
          {description}
        </FieldDescription>
      )}
      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
    </Field>
  );
}

export { ContextArrayField };
