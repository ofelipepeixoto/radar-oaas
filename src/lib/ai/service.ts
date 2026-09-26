import { ANALYSIS_INSTRUCTIONS, PROMPT_VERSION } from "./prompt";
import { analysisInputSchema, providerOutputSchema, type AnalysisInput, type AnalysisMetadata, type AnalysisProvider, type AnalysisQuota, type AnalysisResult, type ManualReason } from "./schema";

export type AnalysisLimits = { maxInputChars: number; timeoutMs: number; maxOutputTokens: number };
export const DEFAULT_ANALYSIS_LIMITS: Readonly<AnalysisLimits> = Object.freeze({ maxInputChars: 12000, timeoutMs: 15000, maxOutputTokens: 1000 });
export type AnalysisContext = {
  userId: string;
  authorizedProjectId: string;
  quota?: AnalysisQuota;
  now?: () => Date;
  limits?: Partial<AnalysisLimits>;
};

const reasonNotices: Record<ManualReason, string> = {
  disabled: "Assistência opcional indisponível. Continue a avaliação manual; seus dados permanecem preservados.",
  consent_required: "Autorize explicitamente o envio dos trechos selecionados antes de solicitar assistência externa.",
  unauthorized: "Projeto não autorizado para esta solicitação. Continue pela sua área privada.",
  invalid_input: "Revise os dados selecionados. A avaliação manual continua disponível.",
  input_limit: "Selecione menos conteúdo para a assistência. A avaliação manual continua disponível.",
  quota_unavailable: "O controle de consumo está indisponível. Continue a avaliação manual.",
  quota_exceeded: "Limite de assistência atingido. Continue a avaliação manual.",
  timeout: "A assistência excedeu o tempo permitido. Seus dados foram preservados; continue manualmente.",
  refusal: "O provedor não produziu sugestões para esta solicitação. Continue a avaliação manual.",
  invalid_output: "As sugestões não passaram na validação de formato ou referências. Continue a avaliação manual.",
  provider_error: "A assistência está temporariamente indisponível. Seus dados foram preservados; continue manualmente.",
};

function hasValidReferences(output: ReturnType<typeof providerOutputSchema.parse>, input: AnalysisInput): boolean {
  const evidence = new Map(input.evidence.map(item => [item.id, item.excerpt]));
  return output.suggestions.every(suggestion => {
    const ids = new Set(suggestion.evidenceIds);
    if (ids.size !== suggestion.evidenceIds.length) return false;
    if (["contradiction", "justification"].includes(suggestion.kind) && ids.size === 0) return false;
    if (suggestion.evidenceIds.some(id => !evidence.has(id))) return false;
    if (suggestion.supportingQuotes.some(({ evidenceId, quote }) => !ids.has(evidenceId) || !quote.trim() || !evidence.get(evidenceId)?.includes(quote))) return false;
    return suggestion.evidenceIds.every(id => suggestion.supportingQuotes.some(quote => quote.evidenceId === id));
  });
}

/** This service has no writes to the domain and never accepts scores or decisions from a provider. */
export async function runAnalysis(rawInput: unknown, provider: AnalysisProvider, context: AnalysisContext): Promise<AnalysisResult> {
  const parsed = analysisInputSchema.safeParse(rawInput);
  const now = context.now ?? (() => new Date());
  const metadata: AnalysisMetadata = {
    provider: provider.id, model: provider.model, promptVersion: PROMPT_VERSION,
    generatedAt: now().toISOString(), evidenceIds: [], reservedTokens: 0, inputTokens: null, outputTokens: null,
  };
  const manual = (reason: ManualReason): AnalysisResult => ({ status: "manual", simulated: provider.id === "simulated", suggestions: [], reason, notice: reasonNotices[reason], metadata });
  if (!parsed.success) return manual("invalid_input");
  const input = parsed.data;
  if (!context.userId || input.projectId !== context.authorizedProjectId) return manual("unauthorized");
  metadata.evidenceIds = input.evidence.map(item => item.id);
  if (provider.id === "disabled") return manual("disabled");
  if (provider.id === "openai" && !input.consent) return manual("consent_required");
  const limits = { ...DEFAULT_ANALYSIS_LIMITS, ...context.limits };
  if (!Object.values(limits).every(value => Number.isSafeInteger(value) && value > 0) || limits.timeoutMs > 60000 || limits.maxOutputTokens > 4000 || limits.maxInputChars > 50000) return manual("invalid_input");
  // Only this minimized payload is transmitted; project IDs, ownership and consent are never sent.
  const payload = JSON.stringify({ context: input.context, evidence: input.evidence });
  if (payload.length > limits.maxInputChars) return manual("input_limit");
  if (provider.id === "openai") {
    if (!context.quota) return manual("quota_unavailable");
    // Conservative reservation: UTF-8 bytes >= typical token count, plus prompt/schema overhead.
    // Failed/refused/timed-out requests are not refunded because the provider may still charge them.
    metadata.reservedTokens = new TextEncoder().encode(payload + ANALYSIS_INSTRUCTIONS).length + 4000 + limits.maxOutputTokens;
    try {
      if (!await context.quota.reserve(context.userId, metadata.reservedTokens)) return manual("quota_exceeded");
    } catch { return manual("quota_unavailable"); }
  }
  const controller = new AbortController();
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    const response = await Promise.race([
      provider.analyze(input, { signal: controller.signal, maxOutputTokens: limits.maxOutputTokens }),
      new Promise<never>((_, reject) => { timer = setTimeout(() => { controller.abort(); reject(new Error("analysis_timeout")); }, limits.timeoutMs); }),
    ]);
    if (response.usage) {
      metadata.inputTokens = response.usage.inputTokens;
      metadata.outputTokens = response.usage.outputTokens;
    }
    if (response.refused) return manual("refusal");
    const validated = providerOutputSchema.safeParse(response.output);
    if (!validated.success || !hasValidReferences(validated.data, input)) return manual("invalid_output");
    return {
      status: "ok", simulated: provider.id === "simulated",
      notice: provider.id === "simulated"
        ? "SIMULAÇÃO LOCAL — roteiro determinístico, sem análise por IA real. Sugestões pendentes de revisão humana."
        : "Sugestões de IA pendentes de revisão humana. Referências verificadas por ID e trecho; o apoio à afirmação exige conferência humana. Nenhum resultado da avaliação foi alterado.",
      suggestions: validated.data.suggestions.map(suggestion => ({ ...suggestion, reviewStatus: "pending", supportStatus: "pending_human_review" })),
      metadata,
    };
  } catch {
    return manual(controller.signal.aborted ? "timeout" : "provider_error");
  } finally { if (timer !== undefined) clearTimeout(timer); }
}
