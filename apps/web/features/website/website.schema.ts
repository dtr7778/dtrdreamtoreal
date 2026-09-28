import z from "zod";

export const marketingContactSchema = z.object({
  name: z.string().min(2, "Please enter your name."),
  email: z.email("Enter a valid email address."),
  company: z.string().optional(),
  subject: z.string().min(3, "Subject is reuqired"),
  message: z
    .string()
    .min(10, "Tell us a little more (at least 10 characters)."),
});
export type MarketingContactType = z.infer<typeof marketingContactSchema>;

export const marketingNewsletterSchema = z.object({
  email: z.email("Enter a valid email address."),
});
export type MarketingNewsletterType = z.infer<typeof marketingNewsletterSchema>;
