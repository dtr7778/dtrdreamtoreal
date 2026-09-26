export type CompanyDescriptionAnswer = {
  label: string;
  value: string | string[];
};

export type CompanyDescriptionInput = {
  companyName: string;
  industry?: string;
  website?: string;
  answers: Array<CompanyDescriptionAnswer>;
  apiKey: string;
  model?: string;
  maxTokens?: number;
  temperature?: number;
  appTitle?: string;
  httpReferer?: string;
};

export type AiUsageMetrics = {
  model: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  cost?: number;
  latencyMs: number;
};

export type CompanyDescriptionResult = {
  description: string;
  usage: AiUsageMetrics;
};
