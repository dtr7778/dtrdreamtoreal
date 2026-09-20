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
  AddressTypeEnumSchema,
  AddressTypeEnumType,
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
import { CheckboxField } from "@workspace/ui/components/form-fields/CheckboxField";
import { InputField } from "@workspace/ui/components/form-fields/InputField";
import { SelectField } from "@workspace/ui/components/form-fields/SelectField";

interface AddressFieldProps<TFieldValues extends FieldValues> {
  control: Control<TFieldValues>;
  name: FieldArrayPath<TFieldValues>;
  disabled?: boolean;
  legend?: string;
  description?: string;
  addLabel?: string;
  defaultType?: AddressTypeEnumType;
}

export function AddressField<TFieldValues extends FieldValues>({
  control,
  name,
  disabled,
  legend = "Address",
  addLabel = "Add address",
  defaultType = "work",
  description,
}: AddressFieldProps<TFieldValues>) {
  "use no memo";
  const { fields, append, remove } = useFieldArray({ control, name });

  const handleAppend = () => {
    append({
      type: defaultType,
      streetLine1: "",
      city: "",
      zipCode: "",
      state: "",
      country: "",
      notes: "",
      isPrimary: fields.length === 0,
    } as FieldArray<TFieldValues, typeof name>);
  };

  return (
    <FieldSet>
      <FieldLegend>{legend}</FieldLegend>
      {description && <FieldDescription>{description}</FieldDescription>}
      <FieldGroup>
        {fields.map((field, idx) => (
          <Fragment key={field.id}>
            <div>
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-semibold text-foreground tracking-tight">
                  {`Address #${idx + 1}`}
                </h4>

                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  onClick={() => remove(idx)}
                  disabled={disabled}
                >
                  <Trash2 />
                </Button>
              </div>

              <FieldGroup>
                <InputField
                  control={control}
                  name={`${name}.${idx}.streetLine1` as Path<TFieldValues>}
                  label="Street Address"
                  placeholder="Street address"
                  requiredField
                  disabled={disabled}
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InputField
                    control={control}
                    name={`${name}.${idx}.city` as Path<TFieldValues>}
                    label="City"
                    placeholder="City"
                    requiredField
                    disabled={disabled}
                  />
                  <SelectField
                    control={control}
                    name={`${name}.${idx}.type` as Path<TFieldValues>}
                    label="Type"
                    placeholder="Select address type"
                    options={AddressTypeEnumSchema.options.map((value) => ({
                      value,
                      label: formatEnumValue(value),
                    }))}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <InputField
                    control={control}
                    name={`${name}.${idx}.state` as Path<TFieldValues>}
                    label="State"
                    placeholder="State"
                    disabled={disabled}
                  />
                  <InputField
                    control={control}
                    name={`${name}.${idx}.zipCode` as Path<TFieldValues>}
                    label="Zip Code"
                    placeholder="Zip Code"
                    requiredField
                    disabled={disabled}
                  />
                  <InputField
                    control={control}
                    name={`${name}.${idx}.country` as Path<TFieldValues>}
                    label="Country"
                    placeholder="Country name"
                    requiredField
                    disabled={disabled}
                  />
                </div>

                <CheckboxField
                  control={control}
                  name={`${name}.${idx}.isPrimary` as Path<TFieldValues>}
                  label="Set as primary address"
                  disabled={disabled}
                />
              </FieldGroup>
            </div>

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
