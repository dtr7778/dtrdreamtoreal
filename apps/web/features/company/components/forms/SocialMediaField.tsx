import { Fragment } from "react";

import { Plus, Trash2 } from "lucide-react";
import {
  type Control,
  type FieldArray,
  type FieldArrayPath,
  type FieldValues,
  type Path,
  useFieldArray,
} from "react-hook-form";

import {
  SocialMediaPlatfromTypeEnumSchema,
  SocialMediaTypeEnumType,
} from "@workspace/drizzle/zod-db-enums";
import { formatEnumValue } from "@workspace/lib/utils";
import { Button } from "@workspace/ui/components/button";
import {
  FieldDescription,
  FieldGroup,
  FieldLegend,
  FieldSeparator,
  FieldSet,
} from "@workspace/ui/components/field";
import { InputField } from "@workspace/ui/components/form-fields/InputField";
import { SelectField } from "@workspace/ui/components/form-fields/SelectField";
import { TextareaField } from "@workspace/ui/components/form-fields/TextareaField";

interface SocialMediaFieldProps<TFieldValues extends FieldValues> {
  control: Control<TFieldValues>;
  name: FieldArrayPath<TFieldValues>;
  disabled?: boolean;
  legend?: string;
  description?: string;
  addLabel?: string;
  defaultType?: SocialMediaTypeEnumType;
}

export function SocialMediaField<TFieldValues extends FieldValues>({
  control,
  name,
  disabled,
  legend = "Social media",
  addLabel = "Add Social media",
  defaultType = "company",
  description,
}: SocialMediaFieldProps<TFieldValues>) {
  "use no memo";
  const { fields, append, remove } = useFieldArray({ control, name });

  const handleAppend = () => {
    append({
      type: defaultType,
      platform: "facebook",
      url: "",
      username: "",
      displayName: "",
      notes: "",
    } as FieldArray<TFieldValues, typeof name>);
  };

  return (
    <FieldSet>
      <FieldLegend>{legend}</FieldLegend>
      {description && <FieldDescription>{description}</FieldDescription>}
      <FieldGroup>
        {fields.map((field, idx) => (
          <Fragment key={field.id}>
            <div className="flex justify-between items-center">
              <h4 className="font-semibold text-foreground tracking-tight">
                {`Social media #${idx + 1}`}
              </h4>
              <Button
                type="button"
                variant="destructive"
                size="icon"
                onClick={() => remove(idx)}
                disabled={disabled}
              >
                <Trash2 className="size-4" />
              </Button>
            </div>

            <FieldGroup>
              <div className="grid gap-4 sm:grid-cols-2">
                <InputField
                  control={control}
                  name={`${name}.${idx}.username` as Path<TFieldValues>}
                  label="Username"
                  disabled={disabled}
                  requiredField
                />
                <InputField
                  control={control}
                  name={`${name}.${idx}.displayName` as Path<TFieldValues>}
                  label="Display name"
                  disabled={disabled}
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <SelectField
                  control={control}
                  name={`${name}.${idx}.platform` as Path<TFieldValues>}
                  label="Platform"
                  placeholder="Select platform"
                  options={SocialMediaPlatfromTypeEnumSchema.options.map(
                    (value) => ({
                      value,
                      label: formatEnumValue(value),
                    })
                  )}
                  disabled={disabled}
                  requiredField
                />
                <InputField
                  control={control}
                  name={`${name}.${idx}.url` as Path<TFieldValues>}
                  type="url"
                  label="Url"
                  placeholder="Profile url"
                  disabled={disabled}
                  requiredField
                />
              </div>
              <TextareaField
                control={control}
                name={`${name}.${idx}.notes` as Path<TFieldValues>}
                label="Notes"
                disabled={disabled}
              />
            </FieldGroup>

            {idx < fields.length - 1 && <FieldSeparator />}
          </Fragment>
        ))}
        <Button
          type="button"
          variant="secondary"
          className="w-fit"
          onClick={handleAppend}
          disabled={disabled}
        >
          <Plus className="size-4" />
          <span>{addLabel}</span>
        </Button>
      </FieldGroup>
    </FieldSet>
  );
}
