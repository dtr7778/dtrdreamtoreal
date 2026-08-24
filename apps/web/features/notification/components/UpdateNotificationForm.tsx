"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import {
  Control,
  Controller,
  FieldValues,
  Path,
  useForm,
} from "react-hook-form";

import { ButtonSpinner } from "@workspace/ui/components/button-spinner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldTitle,
} from "@workspace/ui/components/field";
import { Switch } from "@workspace/ui/components/switch";

import { QueryStateBoundary } from "@/lib/tanstack/query/QueryStateBoundary";

import { orpcTQClient } from "@/server/orpc.client";

import { useNotificationSettingsUpdate } from "../api/notification.api.hook";
import {
  notificationUpdateSchema,
  NotificationUpdateType,
} from "../notification.schema";

const NOTIFICATION_FIELDS = [
  {
    name: "emailEnabled" as const,
    label: "Email Notifications",
    description: "Email notifications are sent to your email address",
  },
  {
    name: "pushEnabled" as const,
    label: "Push Notifications",
    description: "Push notifications are sent to your device",
  },
  {
    name: "inAppEnabled" as const,
    label: "In-App Notifications",
    description: "In-app notifications are sent to your browser",
  },
] as const;

interface SwitchFieldProps<TFieldValues extends FieldValues> {
  control: Control<TFieldValues>;
  name: Path<TFieldValues>;
  label: string;
  description: string;
  categoryName: string;
  disabled?: boolean;
}

function SwitchField<TFieldValues extends FieldValues>({
  control,
  name,
  label,
  description,
  categoryName,
  disabled,
}: SwitchFieldProps<TFieldValues>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <div className="space-y-2">
          <FieldLabel
            htmlFor={`${categoryName}-${field.name}`}
            aria-disabled={disabled}
          >
            <Field
              orientation="horizontal"
              data-invalid={fieldState.invalid}
              aria-disabled={disabled}
            >
              <FieldContent>
                <FieldTitle>{label}</FieldTitle>
                <FieldDescription>{description}</FieldDescription>
              </FieldContent>
              <Switch
                id={`${categoryName}-${field.name}`}
                name={field.name}
                checked={field.value}
                onCheckedChange={field.onChange}
                aria-invalid={fieldState.invalid}
                disabled={disabled}
              />
            </Field>
          </FieldLabel>
          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
        </div>
      )}
    />
  );
}

interface NotificationFormProps {
  data: NotificationUpdateType;
  title: string;
  description: string;
}

function NotificationUpdateForm({
  data,
  title,
  description,
}: NotificationFormProps) {
  const form = useForm<NotificationUpdateType>({
    resolver: zodResolver(notificationUpdateSchema),
    defaultValues: {
      category: data.category,
      emailEnabled: data.emailEnabled,
      pushEnabled: data.pushEnabled,
      inAppEnabled: data.inAppEnabled,
    },
  });

  const { mutate: updateSettings, isPending } = useNotificationSettingsUpdate<
    keyof NotificationUpdateType
  >({
    onValidationErrors: (fields) => {
      fields.forEach(({ fieldName, message }) => {
        form.setError(fieldName, { message });
      });
    },
  });

  const handleSubmit = (values: NotificationUpdateType) => {
    updateSettings(values);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(handleSubmit)}>
          <FieldGroup>
            {NOTIFICATION_FIELDS.map((field) => (
              <SwitchField
                key={field.name}
                control={form.control}
                categoryName={data.category}
                name={field.name}
                label={field.label}
                description={field.description}
                disabled={isPending}
              />
            ))}
            <div className="flex justify-end">
              <ButtonSpinner size="sm" type="submit" isLoading={isPending}>
                Update
              </ButtonSpinner>
            </div>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}

interface FormConfig {
  data: NotificationUpdateType;
  title: string;
  description: string;
}

function prepareFormData(
  notificationData: NotificationUpdateType[]
): FormConfig[] {
  const formsData: FormConfig[] = [];

  const systemNotificationData = notificationData.find(
    (d) => d.category === "SYSTEM"
  );

  const leadNotificationData = notificationData.find(
    (d) => d.category === "LEAD"
  );

  if (systemNotificationData) {
    formsData.push({
      data: systemNotificationData,
      title: "System Notifications",
      description: "Configure notification settings for your account",
    });
  }

  if (leadNotificationData) {
    formsData.push({
      data: leadNotificationData,
      title: "Lead Notifications",
      description: "Configure notification settings for your leads",
    });
  }

  return formsData;
}

export function UpdateNotificationForm() {
  const { data, isLoading, isError, error } = useQuery(
    orpcTQClient.notification.settings.queryOptions()
  );

  return (
    <QueryStateBoundary
      data={data?.data}
      isLoading={isLoading}
      isError={isError}
      error={error}
      isEmpty={(d) => d.length === 0}
    >
      {(data) => {
        const formConfigs = prepareFormData(data);
        return (
          <div className="space-y-4">
            {formConfigs.map((formConfig, index) => (
              <NotificationUpdateForm key={index} {...formConfig} />
            ))}
          </div>
        );
      }}
    </QueryStateBoundary>
  );
}
