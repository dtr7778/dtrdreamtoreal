import { chat } from "@tanstack/ai";
import { createOpenRouterText } from "@tanstack/ai-openrouter";

import { buildCompanyDescriptionMessages } from "./company-description.prompt";
import type {
  AiUsageMetrics,
  CompanyDescriptionInput,
  CompanyDescriptionResult,
} from "./types";

export const DEFAULT_COMPANY_DESCRIPTION_MODEL = "google/gemini-2.5-flash-lite";

type OpenRouterTextModel = Parameters<typeof createOpenRouterText>[0];

export type CompanyDescriptionStreamChunk =
  | { type: "delta"; delta: string }
  | { type: "usage"; usage: AiUsageMetrics };

function toNumber(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function normalizeUsage(
  rawUsage: unknown,
  model: string,
  latencyMs: number
): AiUsageMetrics {
  const metrics: AiUsageMetrics = {
    model,
    promptTokens: 0,
    completionTokens: 0,
    totalTokens: 0,
    latencyMs,
  };

  if (Array.isArray(rawUsage)) {
    for (const item of rawUsage) {
      metrics.promptTokens += toNumber(item?.promptTokens);
      metrics.completionTokens += toNumber(item?.completionTokens);
      metrics.totalTokens += toNumber(item?.totalTokens);
    }
    return metrics;
  }

  if (rawUsage && typeof rawUsage === "object") {
    const usage = rawUsage as Record<string, unknown>;
    metrics.promptTokens = toNumber(usage.promptTokens);
    metrics.completionTokens = toNumber(usage.completionTokens);
    metrics.totalTokens = toNumber(usage.totalTokens);

    if (typeof usage.cost === "number" && Number.isFinite(usage.cost)) {
      metrics.cost = usage.cost;
    }
  }

  return metrics;
}

export async function* streamCompanyDescription(
  input: CompanyDescriptionInput
): AsyncGenerator<CompanyDescriptionStreamChunk> {
  const model = input.model ?? DEFAULT_COMPANY_DESCRIPTION_MODEL;

  const adapter = createOpenRouterText(
    model as OpenRouterTextModel,
    input.apiKey,
    {
      appTitle: input.appTitle,
      httpReferer: input.httpReferer,
    }
  );

  const { systemPrompt, userPrompt } = buildCompanyDescriptionMessages(input);

  const startedAt = Date.now();

  const stream = chat({
    adapter,
    systemPrompts: [systemPrompt],
    messages: [{ role: "user", content: userPrompt }],
    modelOptions: {
      temperature: input.temperature ?? 0.4,
      maxCompletionTokens: input.maxTokens ?? 320,
    },
  });

  for await (const chunk of stream) {
    if (chunk.type === "TEXT_MESSAGE_CONTENT") {
      yield { type: "delta", delta: chunk.delta ?? "" };
    } else if (chunk.type === "RUN_FINISHED") {
      yield {
        type: "usage",
        usage: normalizeUsage(chunk.usage, model, Date.now() - startedAt),
      };
    }
  }
}

export async function generateCompanyDescription(
  input: CompanyDescriptionInput
): Promise<CompanyDescriptionResult> {
  const model = input.model ?? DEFAULT_COMPANY_DESCRIPTION_MODEL;

  let description = "";
  let usage: AiUsageMetrics = {
    model,
    promptTokens: 0,
    completionTokens: 0,
    totalTokens: 0,
    latencyMs: 0,
  };

  for await (const chunk of streamCompanyDescription(input)) {
    if (chunk.type === "delta") {
      description += chunk.delta;
    } else {
      usage = chunk.usage;
    }
  }

  return { description: description.trim(), usage };
}
