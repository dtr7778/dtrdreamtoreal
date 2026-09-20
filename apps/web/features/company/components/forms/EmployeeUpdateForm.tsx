"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";

import { ButtonSpinner } from "@workspace/ui/components/button-spinner";
import { FieldGroup } from "@workspace/ui/components/field";
import { InputField } from "@workspace/ui/components/form-fields/InputField";
import { PhoneInputField } from "@workspace/ui/components/form-fields/PhoneInputField";
import { Spinner } from "@workspace/ui/components/spinner";

import { QueryStateBoundary } from "@/lib/tanstack/query/QueryStateBoundary";

import { orpcTQClient } from "@/server/orpc.client";

import { useUpdateEmployee } from "../../api/employee.api.hook";
import { EmployeeDetailsContractType } from "../../api/employee.contract";
import { employeeUpdateSchema, EmployeeUpdateType } from "../../company.schema";
import { AddressField } from "./AddressField";
import { SocialMediaField } from "./SocialMediaField";

export function EmployeeUpdateForm({
  employeeId,
}: {
  employeeId: string;
  companyId?: string | null | undefined;
}) {
  "use no memo";
  const { data, isLoading, isError, error } = useQuery(
    orpcTQClient.company.employee.details.queryOptions({
      input: {
        employeeId,
      },
    })
  );

  return (
    <QueryStateBoundary
      data={data?.data}
      isLoading={isLoading}
      isError={isError}
      error={error}
      isEmpty={() => false}
      loadingFallback={
        <div className="flex items-center justify-center gap-2">
          <Spinner className="size-10 text-primary" strokeWidth={1} />
        </div>
      }
    >
      {(data) => <EmployeeUpdateFormComp employeeData={data} />}
    </QueryStateBoundary>
  );
}

function EmployeeUpdateFormComp({
  employeeData,
}: {
  employeeData: EmployeeDetailsContractType["output"]["data"];
}) {
  "use no memo";

  const form = useForm<EmployeeUpdateType>({
    resolver: zodResolver(employeeUpdateSchema),
    defaultValues: {
      firstName: employeeData.firstName,
      middleName: employeeData.middleName ?? "",
      lastName: employeeData.lastName ?? "",
      email: employeeData.email ?? "",
      phone: employeeData.phone ?? "",
      jobTitle: employeeData.jobTitle ?? "",
      department: employeeData.department ?? "",
      website: employeeData.website ?? "",
      addresses: employeeData.addresses.map((address) => ({
        streetLine1: address.streetLine1,
        streetLine2: address.streetLine2 ?? "",
        type: address.type,
        city: address.city,
        state: address.state ?? "",
        zipCode: address.zipCode,
        country: address.country,
        isPrimary: address.isPrimary,
        latitude: address.latitude ?? "",
        longitude: address.longitude ?? "",
        notes: address.notes ?? "",
      })),
      socialMedia: employeeData.socialMedia.map((socialMedia) => ({
        type: socialMedia.type,
        platform: socialMedia.platform,
        username: socialMedia.username,
        displayName: socialMedia.displayName ?? "",
        url: socialMedia.url,
        notes: socialMedia.notes ?? "",
      })),
    },
  });

  const { mutate, isPending } = useUpdateEmployee<keyof EmployeeUpdateType>({
    onSuccess: () => {
      form.reset();
    },
    onValidationErrors: (fields) => {
      fields.forEach(({ fieldName, message }) => {
        form.setError(fieldName, { message });
      });
    },
  });

  const handleSubmit = (e: EmployeeUpdateType) =>
    mutate({ ...e, employeeId: employeeData.id });

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)}>
      <FieldGroup>
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
