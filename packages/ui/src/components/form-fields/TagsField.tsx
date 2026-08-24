"use client";
import { useCallback, useId, useMemo } from "react";

import { Asterisk, CheckIcon, Info } from "lucide-react";
import {
  Control,
  Controller,
  ControllerFieldState,
  ControllerRenderProps,
  FieldValues,
  Path,
} from "react-hook-form";

import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@workspace/ui/components/field";
import {
  Tags,
  TagsContent,
  TagsContentProps,
  TagsEmpty,
  TagsGroup,
  TagsInput,
  TagsItem,
  TagsList,
  TagsTrigger,
  TagsTriggerProps,
  TagsValue,
} from "@workspace/ui/components/kibo-ui/tags/index";

type TagType = {
  value: string;
  label: string;
};

export interface TagsFieldProps<TFieldValues extends FieldValues> {
  name: Path<TFieldValues>;
  control: Control<TFieldValues>;
  label?: string;
  description?: string;
  options: TagType[];
  isDescriptionInfoIconShow?: boolean;
  placeholder?: string;
  triggerProps?: TagsTriggerProps;
  contentProps?: TagsContentProps;
  requiredField?: boolean;
  disabled?: boolean;
  onValueChange?: (value: string[]) => void;
}

function TagsField<TFieldValues extends FieldValues>({
  name,
  control,
  label,
  description,
  placeholder,
  isDescriptionInfoIconShow = false,
  requiredField = false,
  options,
  disabled = false,
  triggerProps,
  contentProps,
  onValueChange,
}: TagsFieldProps<TFieldValues>) {
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
          <TagsFieldRender
            field={field}
            fieldState={fieldState}
            id={fieldId}
            placeholder={placeholder}
            options={options}
            disabled={disabled}
            triggerProps={triggerProps}
            contentProps={contentProps}
            onValueChange={onValueChange}
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

interface TagsFieldRenderProps<TFieldValues extends FieldValues> {
  field: ControllerRenderProps<TFieldValues, Path<TFieldValues>>;
  fieldState: ControllerFieldState;
  id: string;
  options: TagType[];
  placeholder?: string;
  triggerProps?: TagsTriggerProps;
  contentProps?: TagsContentProps;
  disabled?: boolean;
  onValueChange?: (value: string[]) => void;
}

function TagsFieldRender<TFieldValues extends FieldValues>({
  field,
  fieldState,
  id,
  placeholder,
  options,
  disabled = false,
  triggerProps,
  contentProps,
  onValueChange,
}: TagsFieldRenderProps<TFieldValues>) {
  const selectedTags = useMemo(() => (field.value || []) as string[], [field]);

  const handleSelect = useCallback(
    (tagValue: string) => {
      const newTags = [...selectedTags, tagValue];
      field.onChange(newTags);
      onValueChange?.(newTags);
    },
    [field, onValueChange, selectedTags]
  );

  const handleRemove = useCallback(
    (tagValue: string) => {
      const remainTags = selectedTags.filter((t) => t !== tagValue);
      field.onChange(remainTags);
      onValueChange?.(remainTags);
    },
    [field, onValueChange, selectedTags]
  );

  return (
    <Tags>
      <TagsTrigger
        placeholder={placeholder}
        name={field.name}
        id={id}
        aria-invalid={fieldState.invalid}
        disabled={disabled}
        {...triggerProps}
      >
        {selectedTags?.map((tag) => (
          <TagsValue key={`${tag}`} onRemove={() => handleRemove(tag)}>
            {options.find(({ value }) => value === tag)?.label}
          </TagsValue>
        ))}
      </TagsTrigger>
      <TagsContent align="start" side="bottom" {...contentProps}>
        <TagsInput placeholder="Search..." />
        <TagsList>
          <TagsEmpty />
          <TagsGroup>
            {options.map((option) => {
              const isSelected =
                selectedTags.findIndex((t) => t === option.value) !== -1;

              return (
                <TagsItem
                  key={`${id}-${option.value}`}
                  onSelect={() => handleSelect(option.value)}
                  value={option.value}
                  disabled={isSelected}
                  aria-disabled={isSelected}
                  aria-selected={isSelected}
                >
                  {option.label}
                  {isSelected && (
                    <CheckIcon className="text-muted-foreground size-4" />
                  )}
                </TagsItem>
              );
            })}
          </TagsGroup>
        </TagsList>
      </TagsContent>
    </Tags>
  );
}

export { TagsField };
