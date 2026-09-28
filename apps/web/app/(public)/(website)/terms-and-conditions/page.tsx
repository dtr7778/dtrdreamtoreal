import { LegalPage } from "@/features/website/components/legal-page";
import { termsAndConditions } from "@/features/website/content/legal";

export const metadata = {
  title: "Terms & Conditions",
  description:
    "The terms that govern use of the DTR - Dream To Real website and services.",
};

export default function TermsAndConditionsPage() {
  return <LegalPage document={termsAndConditions} />;
}
