"use client";

import { motion } from "motion/react";

import { FieldGroup } from "@workspace/ui/components/field";
import { InputField } from "@workspace/ui/components/form-fields/InputField";
import { PhoneInputField } from "@workspace/ui/components/form-fields/PhoneInputField";

import { AddressField } from "../../AddressField";
import { SocialMediaField } from "../../SocialMediaField";
import { useCompanyFormContext } from "../contexts/CompanyFormContext";
import { formAnimationVariants } from "../data/company-form.constants";

export function DetailsStep() {
  "use no memo";
  const { control, isPending } = useCompanyFormContext();

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
          disabled={isPending}
          requiredField
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <InputField
            control={control}
            name="legalName"
            label="Legal name"
            placeholder="Legal name"
            disabled={isPending}
          />
          <InputField
            control={control}
            name="employSize"
            label="Employee Size"
            placeholder="1-10, 11-50, 51-200, etc."
            disabled={isPending}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <InputField
            control={control}
            type="email"
            name="email"
            label="Email"
            placeholder="contact@company.com"
            disabled={isPending}
          />
          <PhoneInputField
            control={control}
            name="phone"
            label="Phone"
            placeholder="+1 234 567 890"
            disabled={isPending}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <InputField
            control={control}
            type="url"
            name="website"
            label="Website"
            placeholder="https://company.com"
            disabled={isPending}
          />
          <InputField
            control={control}
            name="industry"
            label="Industry"
            disabled={isPending}
          />
        </div>

        <FieldGroup className="p-4 bg-muted/30 border rounded-md">
          <SocialMediaField
            control={control}
            name="socialMedia"
            disabled={isPending}
            legend="Company social media"
            addLabel="Add Social media"
            defaultType="company"
          />

          <AddressField
            control={control}
            name="addresses"
            disabled={isPending}
            legend="Company Address"
            addLabel="Add address"
            defaultType="work"
          />
        </FieldGroup>
      </FieldGroup>
    </motion.div>
  );
}
