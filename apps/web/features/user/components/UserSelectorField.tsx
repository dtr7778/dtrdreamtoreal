"use client";

import { useCallback, useId, useState } from "react";

import { useQuery } from "@tanstack/react-query";
import { Asterisk, Info, UserSearch } from "lucide-react";
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
import { Skeleton } from "@workspace/ui/components/skeleton";

import {
  SearchableSelector,
  SearchableSelectorContent,
  SearchableSelectorEmpty,
  SearchableSelectorItem,
  SearchableSelectorLoadingSkeleton,
  SearchableSelectorTrigger,
} from "@/components/SearchableSelector";
import { UserAvatar } from "@/components/UserAvatar";

import { DEFAULT_PAGE_INDEX } from "@/constants";
import { orpcTQClient } from "@/server/orpc.client";

interface UserSelectorFieldProps<TFieldValues extends FieldValues> {
  name: Path<TFieldValues>;
  control: Control<TFieldValues>;
  label?: string;
  description?: string;
  isDescriptionInfoIconShow?: boolean;
  requiredField?: boolean;
  disabled?: boolean;
}

export function UserSelectorField<TFieldValues extends FieldValues>({
  name,
  control,
  label,
  description,
  isDescriptionInfoIconShow,
  requiredField,
  disabled = false,
}: UserSelectorFieldProps<TFieldValues>) {
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
          <UserSelectorFieldRender
            field={field}
            fieldState={fieldState}
            id={fieldId}
            disabled={disabled}
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

interface UserSelectorFieldRenderProps<TFieldValues extends FieldValues> {
  field: ControllerRenderProps<TFieldValues, Path<TFieldValues>>;
  fieldState: ControllerFieldState;
  id: string;
  disabled?: boolean;
  placeholder?: string;
}

function UserSelectorFieldRender<TFieldValues extends FieldValues>({
  field,
  fieldState,
  id,
  disabled = false,
  placeholder = "Select User",
}: UserSelectorFieldRenderProps<TFieldValues>) {
  const [search, setSearch] = useState<string | undefined>(undefined);

  const { data, isLoading, isError, error } = useQuery(
    orpcTQClient.user.listUserForSearch.queryOptions({
      input: {
        search,
        searchFields: ["name", "email"],
        page: DEFAULT_PAGE_INDEX,
        limit: 5,
      },
    })
  );

  const handleOnChange = useCallback(
    (value: string | undefined) => {
      field.onChange(value);
    },
    [field]
  );

  return (
    <SearchableSelector
      value={field.value}
      onChange={handleOnChange}
      onSearch={setSearch}
      disabled={disabled}
    >
      <SearchableSelectorTrigger id={id} aria-invalid={fieldState.invalid}>
        <UserSearch className="size-4" />
        {field.value ? (
          <span className="truncate">
            {data?.data?.find(({ id }) => id === field.value)?.name}
          </span>
        ) : (
          <span className="text-muted-foreground">{placeholder}</span>
        )}
      </SearchableSelectorTrigger>
      <SearchableSelectorContent
        data={data?.data}
        isLoading={isLoading}
        isError={isError}
        error={error}
        title={placeholder}
        description="Select a user"
        loadingFallback={
          <SearchableSelectorLoadingSkeleton>
            <Skeleton className="h-8" />
          </SearchableSelectorLoadingSkeleton>
        }
        emptyFallback={
          <SearchableSelectorEmpty
            message="No users found"
            icon={<UserSearch className="size-8 opacity-20" />}
          />
        }
      >
        {(item) => (
          <SearchableSelectorItem item={item} getItemId={(user) => user.id}>
            <UserAvatar
              userName={item.name}
              userEmail={item.email}
              imageUrl={item.image}
              userRoles={item.roles}
              showDetails
              showRoleDetails
            />
          </SearchableSelectorItem>
        )}
      </SearchableSelectorContent>
    </SearchableSelector>
  );
}
