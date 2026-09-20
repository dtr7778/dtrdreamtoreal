"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { ButtonSpinner } from "@workspace/ui/components/button-spinner";
import { FieldGroup } from "@workspace/ui/components/field";
import { InputField } from "@workspace/ui/components/form-fields/InputField";
import { PhoneInputField } from "@workspace/ui/components/form-fields/PhoneInputField";

import { useCreateEmployee } from "../../api/employee.api.hook";
import { employeeCreateSchema, EmployeeCreateType } from "../../company.schema";
import { CompanySelectorField } from "../CompanySelectorField";
import { AddressField } from "./AddressField";
import { SocialMediaField } from "./SocialMediaField";

export function EmployeeCreateForm({
  companyId,
}: {
  companyId?: string | null | undefined;
}) {
  "use no memo";
  const form = useForm<EmployeeCreateType>({
    resolver: zodResolver(employeeCreateSchema),
    defaultValues: {
      companyId: companyId ?? "",
      firstName: "",
      middleName: "",
      lastName: "",
      email: "",
      phone: "",
      jobTitle: "",
      department: "",
      website: "",
      addresses: [],
      socialMedia: [],
    },
  });

  const { mutate, isPending } = useCreateEmployee<keyof EmployeeCreateType>({
    onSuccess: () => {
      form.reset();
    },
    onValidationErrors: (fields) => {
      fields.forEach(({ fieldName, message }) => {
        form.setError(fieldName, { message });
      });
    },
  });

  const handleSubmit = (e: EmployeeCreateType) => mutate({ ...e });

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)}>
      <FieldGroup>
        <CompanySelectorField
          control={form.control}
          name="companyId"
          label="Company"
          disabled={!!companyId || isPending}
          requiredField
        />
        <div className="grid gap-4 sm:grid-cols-3">
          <InputField
            control={form.control}
            name="firstName"
            label="First Name"
            placeholder="First name"
            disabled={isPending}
            requiredField
          />
          <InputField
            control={form.control}
            name="middleName"
            label="Middle Name"
            placeholder="Middle name"
            disabled={isPending}
          />
          <InputField
            control={form.control}
            name="lastName"
            label="Last Name"
            placeholder="Last name"
            disabled={isPending}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <InputField
            control={form.control}
            type="email"
            name="email"
            label="Email"
            placeholder="employee@company.com"
            disabled={isPending}
          />
          <PhoneInputField
            control={form.control}
            name="phone"
            label="Phone"
            placeholder="+1 234 567 890"
            disabled={isPending}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <InputField
            control={form.control}
            name="jobTitle"
            label="Job Title"
            placeholder="Software Engineer"
            disabled={isPending}
          />
          <InputField
            control={form.control}
            name="department"
            label="Department"
            placeholder="Engineering"
            disabled={isPending}
          />
        </div>
        <InputField
          control={form.control}
          type="url"
          name="website"
          label="Website"
          placeholder="https://example.com"
          disabled={isPending}
        />
        <FieldGroup className="p-4 bg-muted/30 border rounded-md">
          <SocialMediaField
            control={form.control}
            name="socialMedia"
            disabled={isPending}
            legend="Company social media"
            addLabel="Add Social media"
            defaultType="person"
          />

          <AddressField
            control={form.control}
            name="addresses"
            disabled={isPending}
            legend="Company Address"
            addLabel="Add address"
            defaultType="home"
          />
        </FieldGroup>
        <ButtonSpinner type="submit" isLoading={isPending}>
          Submit
        </ButtonSpinner>
      </FieldGroup>
    </form>
  );
}
