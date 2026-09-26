import { z } from "zod";

const identifier = z.string().min(1).max(100);

/** This deliberately excludes scores, weights, gates and deterministic decisions. */
export const analysisInputSchema = z.object({
  projectId: identifier,
  context: z.string().max(6000),
  evidence: z.array(z.object({ id: identifier, excerpt: z.string().min(1).max(4000) }).strict()).max(30),
  consent: z.boolean(),
}).strict().superRefine((input, ctx) => {
  if (new Set(input.evidence.map(item => item.id)).size !== input.evidence.length) {
    ctx.addIssue({ code: "custom", message: "Identificadores de evidências duplicados." });
  }
});

export const providerOutputSchema = z.object({
  suggestions: z.array(z.object({
    kind: z.enum(["question", "contradiction", "justification", "experiment"]),
    text: z.string().min(1).max(1600),
    evidenceIds: z.array(identifier).max(10),
    supportingQuotes: z.array(z.object({ evidenceId: identifier, quote: z.string().min(1).max(1000) }).strict()).max(10),
  }).strict()).max(8),
}).strict();

export type AnalysisInput = z.infer<typeof analysisInputSchema>;
export type ProviderOutput = z.infer<typeof providerOutputSchema>;
export type AnalysisSuggestion = ProviderOutput["suggestions"][number] & {
  reviewStatus: "pending";
  supportStatus: "pending_human_review";
};

export type ManualReason = "disabled" | "consent_required" | "unauthorized" | "invalid_input" |
  "input_limit" | "quota_unavailable" | "quota_exceeded" | "timeout" | "refusal" | "invalid_output" | "provider_error";

export type AnalysisMetadata = {
  provider: "simulated" | "openai" | "disabled";
  model: string | null;
  promptVersion: string;
  generatedAt: string;
  evidenceIds: string[];
  reservedTokens: number;
  inputTokens: number | null;
  outputTokens: number | null;
};

export type AnalysisResult = {
  status: "ok" | "manual";
  simulated: boolean;
  suggestions: AnalysisSuggestion[];
  notice: string;
  reason?: ManualReason;
  metadata: AnalysisMetadata;
};

export type ProviderResponse = {
  output: unknown;
  refused?: boolean;
  usage?: { inputTokens: number; outputTokens: number };
};

export interface AnalysisProvider {
  readonly id: AnalysisMetadata["provider"];
  readonly model: string | null;
  analyze(input: AnalysisInput, options: { signal: AbortSignal; maxOutputTokens: number }): Promise<ProviderResponse>;
}

/** Must atomically reserve against durable per-user AND deployment-wide limits. */
export interface AnalysisQuota {
  reserve(userId: string, reservedTokens: number): Promise<boolean>;
}
