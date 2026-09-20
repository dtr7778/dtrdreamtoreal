"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";

import { ButtonSpinner } from "@workspace/ui/components/button-spinner";
import { FieldGroup } from "@workspace/ui/components/field";
import { InputField } from "@workspace/ui/components/form-fields/InputField";
import { PhoneInputField } from "@workspace/ui/components/form-fields/PhoneInputField";
import { TextareaField } from "@workspace/ui/components/form-fields/TextareaField";
import { Spinner } from "@workspace/ui/components/spinner";

import { QueryStateBoundary } from "@/lib/tanstack/query/QueryStateBoundary";

import { orpcTQClient } from "@/server/orpc.client";

import { useUpdateCompany } from "../../api/company.api.hook";
import { CompanyDetailsContractType } from "../../api/company.contract";
import { companyUpdateSchema, CompanyUpdateType } from "../../company.schema";
import { AddressField } from "./AddressField";
import { SocialMediaField } from "./SocialMediaField";

export function CompanyUpdateForm({ companyId }: { companyId: string }) {
  "use no memo";

  const { data, isLoading, isError, error } = useQuery(
    orpcTQClient.company.details.queryOptions({
      input: {
        companyId,
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
      {(data) => <CompanyUpdateFormComp companyData={data} />}
    </QueryStateBoundary>
  );
}

function CompanyUpdateFormComp({
  companyData,
}: {
  companyData: CompanyDetailsContractType["output"]["data"];
}) {
  "use no memo";
  const form = useForm<CompanyUpdateType>({
    resolver: zodResolver(companyUpdateSchema),
    defaultValues: {
      name: companyData.name,
      legalName: companyData.legalName ?? "",
      email: companyData.email ?? "",
      phone: companyData.phone ?? "",
      employSize: companyData.employSize ?? "",
      industry: companyData.industry ?? "",
      website: companyData.website ?? "",
      description: companyData.description ?? "",
      addresses: companyData.addresses.map((address) => ({
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
      socialMedia: companyData.socialMedia.map((socialMedia) => ({
        type: socialMedia.type,
        platform: socialMedia.platform,
        username: socialMedia.username,
        displayName: socialMedia.displayName ?? "",
        url: socialMedia.url,
        notes: socialMedia.notes ?? "",
      })),
    },
  });

  const { mutate, isPending } = useUpdateCompany<keyof CompanyUpdateType>({
    onSuccess: () => {
      form.reset();
    },
    onValidationErrors: (fields) => {
      fields.forEach(({ fieldName, message }) => {
        form.setError(fieldName, { message });
      });
    },
  });

  const handleSubmit = (data: CompanyUpdateType) => {
    mutate({ ...data, companyId: companyData.id });
  };

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)}>
      <FieldGroup>
        <InputField
          control={form.control}
          name="name"
          label="Name"
          placeholder="Company name"
          disabled={isPending}
          requiredField
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <InputField
            control={form.control}
            name="legalName"
            label="Legal name"
            placeholder="Legal name"
            disabled={isPending}
          />
          <InputField
            control={form.control}
            name="employSize"
            label="Employee Size"
            placeholder="1-10, 11-50, 51-200, etc."
            disabled={isPending}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <InputField
            control={form.control}
            type="email"
            name="email"
            label="Email"
            placeholder="contact@company.com"
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
            type="url"
            name="website"
            label="Website"
            placeholder="https://company.com"
            disabled={isPending}
          />
          <InputField
            control={form.control}
            name="industry"
            label="Industry"
            disabled={isPending}
          />
        </div>

        <TextareaField
          control={form.control}
          name="description"
          label="Description"
          placeholder="Brief description of the company"
          disabled={isPending}
        />

        <FieldGroup className="p-4 bg-muted/30 border rounded-md">
          <SocialMediaField
            control={form.control}
            name="socialMedia"
            disabled={isPending}
            legend="Company social media"
            addLabel="Add Social media"
            defaultType="company"
          />

          <AddressField
            control={form.control}
            name="addresses"
            disabled={isPending}
            legend="Company Address"
            addLabel="Add address"
            defaultType="work"
          />
        </FieldGroup>

        <div className="flex items-center gap-2">
          <ButtonSpinner type="submit" isLoading={isPending}>
            Submit
          </ButtonSpinner>
        </div>
      </FieldGroup>
    </form>
  );
}
