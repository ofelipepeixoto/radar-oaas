import "server-only";
import { DisabledAnalysisProvider, MockAnalysisProvider } from "./mock";
import { OpenAIAnalysisProvider } from "./openai-provider";
import type { AnalysisProvider } from "./schema";

/** No model/key defaults. Real calls require explicit deployment and per-request opt-in. */
export function createAnalysisProvider(env: Record<string, string | undefined> = process.env): AnalysisProvider {
  if (!env.AI_PROVIDER || env.AI_PROVIDER === "simulated") return new MockAnalysisProvider();
  if (env.AI_PROVIDER !== "openai" || env.AI_ENABLED !== "true" || !env.OPENAI_API_KEY?.trim() || !env.OPENAI_MODEL?.trim() || env.AI_DEPLOYMENT_LIMIT_CONFIGURED !== "true") return new DisabledAnalysisProvider();
  return new OpenAIAnalysisProvider(env.OPENAI_MODEL.trim(), env.OPENAI_API_KEY);
}
