import "server-only";
import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import { ANALYSIS_INSTRUCTIONS } from "./prompt";
import { providerOutputSchema, type AnalysisInput, type AnalysisProvider, type ProviderResponse } from "./schema";

/** Server-only SDK adapter; runAnalysis gates calls on opt-in and durable quota. */
export class OpenAIAnalysisProvider implements AnalysisProvider {
  readonly id = "openai" as const;
  private readonly client: OpenAI;

  constructor(readonly model: string, apiKey: string) {
    this.client = new OpenAI({ apiKey, maxRetries: 0, timeout: 15000 });
  }

  async analyze(input: AnalysisInput, options: { signal: AbortSignal; maxOutputTokens: number }): Promise<ProviderResponse> {
    const response = await this.client.responses.parse({
      model: this.model,
      store: false,
      instructions: ANALYSIS_INSTRUCTIONS,
      input: [{ role: "user", content: JSON.stringify({ context: input.context, evidence: input.evidence }) }],
      text: { format: zodTextFormat(providerOutputSchema, "oaas_suggestions") },
      max_output_tokens: options.maxOutputTokens,
    }, { signal: options.signal, maxRetries: 0 });
    const refused = response.output.some(item => item.type === "message" && item.content.some(content => content.type === "refusal"));
    return {
      output: response.status === "completed" ? response.output_parsed : null,
      refused,
      usage: response.usage ? { inputTokens: response.usage.input_tokens, outputTokens: response.usage.output_tokens } : undefined,
    };
  }
}
