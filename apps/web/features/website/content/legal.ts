export interface LegalSection {
  id: string;
  title: string;
  paragraphs: Array<string>;
}

export interface LegalDocument {
  title: string;
  updated: string;
  intro: string;
  sections: Array<LegalSection>;
}

export const privacyPolicy: LegalDocument = {
  title: "Privacy & Policy",
  updated: "September 28, 2026",
  intro:
    "This policy explains what information DTR - Dream To Real collects, how we use it, and the choices you have. It applies to our website, audits and client engagements.",
  sections: [
    {
      id: "information-we-collect",
      title: "Information we collect",
      paragraphs: [
        "We collect information you provide directly, such as your name, email address, company and the contents of any message or audit request you submit.",
        "When you use our website we also collect limited technical data — pages visited, referring URL, device and browser type, and approximate location — to understand how the site is used.",
      ],
    },
    {
      id: "how-we-use-information",
      title: "How we use information",
      paragraphs: [
        "We use your information to respond to enquiries, deliver audits and projects, send service updates you asked for, and improve our website and offerings.",
        "We do not sell your personal information. We share it only with processors that help us operate, such as hosting, email and analytics providers, under appropriate agreements.",
      ],
    },
    {
      id: "cookies",
      title: "Cookies and analytics",
      paragraphs: [
        "We use essential cookies to keep the site working and optional analytics cookies to measure traffic. You can control or delete cookies through your browser settings.",
        "Where required, we ask for consent before setting non-essential cookies and honour your choice.",
      ],
    },
    {
      id: "data-retention",
      title: "Data retention",
      paragraphs: [
        "We keep enquiry and project data for as long as needed to provide our services and meet legal obligations, then delete or anonymise it.",
      ],
    },
    {
      id: "your-rights",
      title: "Your rights",
      paragraphs: [
        "Depending on where you live, you may have the right to access, correct, delete, or restrict the use of your personal information, and to object to certain processing. Contact us to exercise these rights.",
      ],
    },
    {
      id: "security",
      title: "Security",
      paragraphs: [
        "We use encryption in transit, access controls and reputable infrastructure providers to protect your data. No method of transmission or storage is perfectly secure, so we cannot guarantee absolute security.",
      ],
    },
    {
      id: "contact",
      title: "Contact us",
      paragraphs: [
        "For privacy questions or requests, email hello@dreamtoreal.dev and we will respond within a reasonable period.",
      ],
    },
  ],
};

export const termsAndConditions: LegalDocument = {
  title: "Terms & Conditions",
  updated: "September 28, 2026",
  intro:
    "These terms govern your use of the DTR - Dream To Real website and any services we provide. By using our site or engaging us, you agree to them.",
  sections: [
    {
      id: "use-of-website",
      title: "Use of the website",
      paragraphs: [
        "You may use our website for lawful purposes only. You agree not to interfere with its operation, attempt to gain unauthorised access, or use it to distribute harmful content.",
        "All content on this site is provided for general information and may change without notice.",
      ],
    },
    {
      id: "services-and-agreements",
      title: "Services and agreements",
      paragraphs: [
        "Specific project scopes, deliverables, timelines and fees are set out in a separate written proposal or statement of work signed by both parties. Where a signed agreement conflicts with these terms, the signed agreement governs.",
      ],
    },
    {
      id: "intellectual-property",
      title: "Intellectual property",
      paragraphs: [
        "Unless otherwise agreed in writing, client deliverables transfer to the client upon full payment. Our pre-existing tools, libraries and know-how remain our property.",
        "The DTR name, logo and site content may not be reused without permission.",
      ],
    },
    {
      id: "payment",
      title: "Fees and payment",
      paragraphs: [
        "Invoices are due as stated in the applicable proposal. Late payment may pause work and may incur interest where permitted by law.",
      ],
    },
    {
      id: "warranties-and-liability",
      title: "Warranties and liability",
      paragraphs: [
        "We provide our services with reasonable skill and care but make no guarantee of specific business outcomes such as search rankings or revenue.",
        "To the maximum extent permitted by law, our total liability is limited to the fees paid for the service giving rise to the claim. We are not liable for indirect or consequential losses.",
      ],
    },
    {
      id: "termination",
      title: "Termination",
      paragraphs: [
        "Either party may terminate an engagement as described in the applicable agreement. Fees for work already performed remain payable.",
      ],
    },
    {
      id: "governing-law",
      title: "Governing law",
      paragraphs: [
        "These terms are governed by the laws of Bangladesh, and any dispute will be subject to the exclusive jurisdiction of the courts of Dhaka.",
      ],
    },
    {
      id: "contact",
      title: "Contact us",
      paragraphs: [
        "Questions about these terms can be sent to hello@dreamtoreal.dev.",
      ],
    },
  ],
};
