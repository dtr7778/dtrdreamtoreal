"use client";

import { Fragment } from "react";

import { Plus, Trash2 } from "lucide-react";
import { motion } from "motion/react";
import { useFieldArray } from "react-hook-form";

import { Button } from "@workspace/ui/components/button";
import {
  FieldGroup,
  FieldLegend,
  FieldSeparator,
  FieldSet,
} from "@workspace/ui/components/field";
import { InputField } from "@workspace/ui/components/form-fields/InputField";
import { PhoneInputField } from "@workspace/ui/components/form-fields/PhoneInputField";

import { AddressField } from "../../AddressField";
import { SocialMediaField } from "../../SocialMediaField";
import { useCompanyFormContext } from "../contexts/CompanyFormContext";
import {
  createEmptyEmployee,
  formAnimationVariants,
} from "../data/company-form.constants";

export function EmployeeStep() {
  "use no memo";
  const { control, isPending } = useCompanyFormContext();

  const { fields, append, remove } = useFieldArray({
    control,
    name: "employees",
  });

  const handleAppend = () => {
    append(createEmptyEmployee());
  };

  return (
    <motion.div
      variants={formAnimationVariants}
      initial="hidden"
      animate="visible"
      exit="hidden"
      key="employee-step-content"
    >
      <FieldSet>
        <FieldLegend>Company Employees</FieldLegend>
        <FieldGroup>
          {fields.map((field, idx) => (
            <Fragment key={field.id}>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-semibold text-foreground tracking-tight">
                    {`Employee #${idx + 1}`}
                  </h4>

                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    onClick={() => remove(idx)}
                    disabled={isPending}
                  >
                    <Trash2 />
                  </Button>
                </div>

                <FieldGroup>
                  <div className="grid gap-4 sm:grid-cols-3">
                    <InputField
                      control={control}
                      name={`employees.${idx}.firstName`}
                      label="First Name"
                      placeholder="First name"
                      disabled={isPending}
                      requiredField
                    />
                    <InputField
                      control={control}
                      name={`employees.${idx}.middleName`}
                      label="Middle Name"
                      placeholder="Middle name"
                      disabled={isPending}
                    />
                    <InputField
                      control={control}
                      name={`employees.${idx}.lastName`}
                      label="Last Name"
                      placeholder="Last name"
                      disabled={isPending}
                    />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <InputField
                      control={control}
                      type="email"
                      name={`employees.${idx}.email`}
                      label="Email"
                      placeholder="employee@company.com"
                      disabled={isPending}
                    />
                    <PhoneInputField
                      control={control}
                      name={`employees.${idx}.phone`}
                      label="Phone"
                      placeholder="+1 234 567 890"
                      disabled={isPending}
                    />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <InputField
                      control={control}
                      name={`employees.${idx}.jobTitle`}
                      label="Job Title"
                      placeholder="Software Engineer"
                      disabled={isPending}
                    />
                    <InputField
                      control={control}
                      name={`employees.${idx}.department`}
                      label="Department"
                      placeholder="Engineering"
                      disabled={isPending}
                    />
                  </div>
                  <InputField
                    control={control}
                    type="url"
                    name={`employees.${idx}.website`}
                    label="Website"
                    placeholder="https://example.com"
                    disabled={isPending}
                  />

                  <FieldGroup className="p-4 bg-muted/30 border rounded-md">
                    <SocialMediaField
                      control={control}
                      name={`employees.${idx}.socialMedia`}
                      disabled={isPending}
                      legend={`Employee #${idx + 1} Social media`}
                      addLabel="Add Social media"
                      defaultType="person"
                    />

                    <AddressField
                      control={control}
                      name={`employees.${idx}.addresses`}
                      disabled={isPending}
                      legend={`Employee #${idx + 1} Address`}
                      addLabel="Add address"
                      defaultType="home"
                    />
                  </FieldGroup>
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
            disabled={isPending}
          >
            <Plus className="size-4" />
            <span>Add employee</span>
          </Button>
        </FieldGroup>
      </FieldSet>
    </motion.div>
  );
}
