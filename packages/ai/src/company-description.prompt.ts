import type {
  CompanyDescriptionAnswer,
  CompanyDescriptionInput,
} from "./types";

export const COMPANY_DESCRIPTION_SYSTEM_PROMPT = [
  "You are an expert B2B company research assistant.",
  "Write a clear, factual, description of the company for SEO marketing use.",
  "Rules: 2 to 4 sentences, at most about 90 words; use only the provided answers;",
  "never invent facts, numbers, names, or claims; plain prose only — no headings,",
  "no bullet points, no markdown, no emojis, no marketing fluff.",
].join(" ");

function formatValue(value: CompanyDescriptionAnswer["value"]): string {
  return Array.isArray(value) ? value.join(", ") : value.trim();
}

export function formatCompanyAnswers(
  answers: Array<CompanyDescriptionAnswer>
): string {
  return answers
    .map(({ label, value }) => {
      const formatted = formatValue(value);
      return formatted ? `${label}: ${formatted}` : null;
    })
    .filter((line): line is string => line !== null)
    .join("\n");
}

export function buildCompanyDescriptionPrompt(input: {
  companyName: string;
  industry?: string;
  website?: string;
  answers: Array<CompanyDescriptionAnswer>;
}): string {
  const header: Array<string> = [`Company name: ${input.companyName.trim()}`];

  if (input.industry?.trim()) {
    header.push(`Industry: ${input.industry.trim()}`);
  }
  if (input.website?.trim()) {
    header.push(`Website: ${input.website.trim()}`);
  }

  const formattedAnswers = formatCompanyAnswers(input.answers);

  return [
    header.join("\n"),
    formattedAnswers,
    "Write the company description using only the information above.",
  ]
    .filter((section) => section.trim().length > 0)
    .join("\n\n");
}

export type CompanyDescriptionPrompt = {
  systemPrompt: string;
  userPrompt: string;
};

export function buildCompanyDescriptionMessages(
  input: CompanyDescriptionInput
): CompanyDescriptionPrompt {
  return {
    systemPrompt: COMPANY_DESCRIPTION_SYSTEM_PROMPT,
    userPrompt: buildCompanyDescriptionPrompt(input),
  };
}
