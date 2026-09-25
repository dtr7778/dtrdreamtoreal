"use client";

import { motion } from "motion/react";
import { Control } from "react-hook-form";

import { FieldGroup, FieldSeparator } from "@workspace/ui/components/field";
import { InputField } from "@workspace/ui/components/form-fields/InputField";
import { PhoneInputField } from "@workspace/ui/components/form-fields/PhoneInputField";

import { CompanyCreateType } from "../../../company.schema";
import { AddressField } from "../AddressField";
import { formAnimationVariants } from "../CompanyCreateForm";
import { SocialMediaField } from "../SocialMediaField";

export function DetailsStep({
  control,
  disabled,
}: {
  control: Control<CompanyCreateType>;
  disabled?: boolean;
}) {
  "use no memo";

  return (
    <motion.div
      variants={formAnimationVariants}
      initial="hidden"
      animate="visible"
      exit="hidden"
      key="details-step-content"
    >
      <FieldGroup>
        <InputField
          control={control}
          name="name"
          label="Name"
          placeholder="Company name"
          disabled={disabled}
          requiredField
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <InputField
            control={control}
            name="legalName"
            label="Legal name"
            placeholder="Legal name"
            disabled={disabled}
          />
          <InputField
            control={control}
            name="employSize"
            label="Employee Size"
            placeholder="1-10, 11-50, 51-200, etc."
            disabled={disabled}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <InputField
            control={control}
            type="email"
            name="email"
            label="Email"
            placeholder="contact@company.com"
            disabled={disabled}
          />
          <PhoneInputField
            control={control}
            name="phone"
            label="Phone"
            placeholder="+1 234 567 890"
            disabled={disabled}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <InputField
            control={control}
            type="url"
            name="website"
            label="Website"
            placeholder="https://company.com"
            disabled={disabled}
          />
          <InputField
            control={control}
            name="industry"
            label="Industry"
            disabled={disabled}
          />
        </div>

        <FieldGroup className="p-4 bg-muted/30 border rounded-md">
          <SocialMediaField
            control={control}
            name="socialMedia"
            disabled={disabled}
            legend="Company social media"
            addLabel="Add Social media"
            defaultType="company"
          />

          <FieldSeparator />

          <AddressField
            control={control}
            name="addresses"
            disabled={disabled}
            legend="Company Address"
            addLabel="Add address"
            defaultType="work"
          />
        </FieldGroup>
      </FieldGroup>
    </motion.div>
  );
}
