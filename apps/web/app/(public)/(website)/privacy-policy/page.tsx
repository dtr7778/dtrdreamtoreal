import { LegalPage } from "@/features/website/components/legal-page";
import { privacyPolicy } from "@/features/website/content/legal";

export const metadata = {
  title: "Privacy & Policy",
  description:
    "How DTR - Dream To Real collects, uses and protects your information.",
};

export default function PrivacyPolicyPage() {
  return <LegalPage document={privacyPolicy} />;
}
