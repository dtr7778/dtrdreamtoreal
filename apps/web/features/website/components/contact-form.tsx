"use client";

import { useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, Send } from "lucide-react";
import { useForm } from "react-hook-form";

import { Button } from "@workspace/ui/components/button";
import { ButtonSpinner } from "@workspace/ui/components/button-spinner";
import { FieldGroup } from "@workspace/ui/components/field";
import { InputField } from "@workspace/ui/components/form-fields/InputField";
import { TextareaField } from "@workspace/ui/components/form-fields/TextareaField";

import {
  marketingContactSchema,
  MarketingContactType,
} from "../website.schema";

export function ContactForm({ recipientEmail }: { recipientEmail: string }) {
  "use no memo";

  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const form = useForm<MarketingContactType>({
    resolver: zodResolver(marketingContactSchema),
    defaultValues: {
      name: "",
      email: "",
      company: "",
      subject: "",
      message: "",
    },
  });

  const handleSubmit = (values: MarketingContactType) => {
    setIsLoading(true);

    const subject = encodeURIComponent(`Project enquiry from ${values.name}`);
    const body = encodeURIComponent(
      [
        `Name: ${values.name}`,
        `Email: ${values.email}`,
        `Company: ${values.company || "-"}`,
        `subject: ${values.subject}`,
        "",
        values.message,
      ].join("\n")
    );

    window.location.assign(
      `mailto:${recipientEmail}?subject=${subject}&body=${body}`
    );

    setIsLoading(false);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-start gap-3 rounded-xl border border-border bg-card p-8">
        <CheckCircle2 aria-hidden="true" className="size-8 text-primary" />
        <h2 className="font-heading text-lg font-semibold text-foreground">
          Almost there
        </h2>
        <p className="text-sm/relaxed text-muted-foreground">
          Your email client should have opened with the details filled in. If it
          did not, email us directly at{" "}
          <a
            href={`mailto:${recipientEmail}`}
            className="font-medium text-primary hover:underline"
          >
            {recipientEmail}
          </a>
          .
        </p>
        <Button
          variant="outline"
          className="h-9 px-4 text-sm"
          onClick={() => setSubmitted(false)}
        >
          Send another message
        </Button>
      </div>
    );
  }

  return (
    <form
      onSubmit={form.handleSubmit(handleSubmit)}
      className="rounded-xl border border-border bg-card p-6 sm:p-8"
    >
      <FieldGroup>
        <div className="grid gap-4 sm:grid-cols-2">
          <InputField
            control={form.control}
            name="name"
            label="Name"
            placeholder="Your name"
            autoComplete="name"
            requiredField
          />

          <InputField
            control={form.control}
            name="company"
            label="Company"
            placeholder="Optional"
            autoComplete="organization"
          />
        </div>
        <InputField
          control={form.control}
          type="email"
          name="email"
          label="Email"
          placeholder="you@company.com"
          autoComplete="email"
          requiredField
        />
        <InputField
          control={form.control}
          name="subject"
          label="Subject"
          placeholder="Subject line"
          autoComplete="organization"
          requiredField
        />

        <TextareaField
          control={form.control}
          name="message"
          label="Message"
          placeholder="Goals, current site, timeline, anything useful."
          className="min-h-32"
          requiredField
        />

        <ButtonSpinner
          type="submit"
          isLoading={isLoading}
          className="sm:w-auto sm:self-start"
        >
          <Send aria-hidden="true" className="size-4" />
          Send enquiry
        </ButtonSpinner>
      </FieldGroup>
    </form>
  );
}
