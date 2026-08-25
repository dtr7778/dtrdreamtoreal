"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { RoleEnumSchema, RoleEnumType } from "@workspace/drizzle/zod-db-enums";
import { formatEnumValue } from "@workspace/lib/utils";
import { Button } from "@workspace/ui/components/button";
import { FieldGroup } from "@workspace/ui/components/field";
import { TagsField } from "@workspace/ui/components/form-fields/TagsField";
import { Spinner } from "@workspace/ui/components/spinner";

import { useRoleUpdate } from "../../api/users.api.hook";
import { roleUpdateSchema, RoleUpdateType } from "../../user.schema";

export default function UserRoleUpdateForm({
  userId,
  roleNames,
  onSuccess,
}: {
  userId: string;
  roleNames: RoleEnumType[];
  onSuccess?: () => void;
}) {
  "use no memo";

  const form = useForm<RoleUpdateType>({
    resolver: zodResolver(roleUpdateSchema),
    defaultValues: {
      userId,
      roleNames,
    },
  });

  const { mutate, isPending } = useRoleUpdate<keyof RoleUpdateType>({
    onSuccess: () => {
      onSuccess?.();
    },
    onValidationErrors: (fields) => {
      fields.forEach(({ fieldName, message }) => {
        form.setError(fieldName, {
          message,
        });
      });
    },
  });

  const handleSubmit = async (e: RoleUpdateType) => {
    mutate(e);
  };

  return (
    <div className="rounded-md border p-3 pt-0 shadow">
      <h5 className="-mt-3 w-fit bg-background px-2 text-sm font-medium">
        Role update
      </h5>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="mt-2">
        <FieldGroup>
          <TagsField
            control={form.control}
            name="roleNames"
            placeholder="Roles"
            label="User Roles"
            disabled={isPending}
            options={RoleEnumSchema.options.map((value) => ({
              value,
              label: formatEnumValue(value),
            }))}
          />
          <div className="text-right">
            <Button
              disabled={!form.formState.isDirty || isPending}
              aria-disabled={!form.formState.isDirty || isPending}
              type="submit"
            >
              {isPending ? <Spinner /> : "Submit"}
            </Button>
          </div>
        </FieldGroup>
      </form>
    </div>
  );
}
