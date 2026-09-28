"use client";

import { useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Check } from "lucide-react";
import { useForm } from "react-hook-form";

import { ButtonSpinner } from "@workspace/ui/components/button-spinner";
import { InputField } from "@workspace/ui/components/form-fields/InputField";

import {
  marketingNewsletterSchema,
  MarketingNewsletterType,
} from "../website.schema";

export function NewsletterForm({ recipientEmail }: { recipientEmail: string }) {
  "use no memo";

  const [isLoading, setIsLoading] = useState(false);
  const [subscribed, setSubscribed] = useState(false);

  const form = useForm<MarketingNewsletterType>({
    resolver: zodResolver(marketingNewsletterSchema),
    defaultValues: { email: "" },
  });

  const handleSubmit = (values: MarketingNewsletterType) => {
    setIsLoading(true);

    const subject = encodeURIComponent("Newsletter subscription");
    const body = encodeURIComponent(
      `Please add ${values.email} to the DTR newsletter.`
    );

    window.location.assign(
      `mailto:${recipientEmail}?subject=${subject}&body=${body}`
    );

    setIsLoading(false);
    setSubscribed(true);
  };

  if (subscribed) {
    return (
      <p className="flex items-center gap-2 text-sm text-muted-foreground">
        <Check aria-hidden="true" className="size-4 text-primary" />
        Thanks — check your email client to confirm.
      </p>
    );
  }

  return (
    <form
      onSubmit={form.handleSubmit(handleSubmit)}
      className="w-full max-w-sm"
    >
      <div className="flex items-start gap-2">
        <InputField
          control={form.control}
          type="email"
          name="email"
          aria-label="Email address"
          placeholder="you@company.com"
        />
        <ButtonSpinner type="submit" isLoading={isLoading} className="shrink-0">
          <span>Subscribe</span>
          <ArrowRight aria-hidden="true" className="size-4" />
        </ButtonSpinner>
      </div>
    </form>
  );
}
