import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ construct: vi.fn(), parse: vi.fn() }));
vi.mock("server-only", () => ({}));
vi.mock("openai", () => ({ default: class {
  responses = { parse: mocks.parse };
  constructor(options: unknown) { mocks.construct(options); }
} }));

import { OpenAIAnalysisProvider } from "../../src/lib/ai/openai-provider";
import { createAnalysisProvider } from "../../src/lib/ai/server";

describe("Adaptador oficial isolado: nenhuma chamada real nos testes", () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it("usa simulação por padrão e não instancia o SDK sem configuração completa", () => {
    expect(createAnalysisProvider({}).id).toBe("simulated");
    expect(createAnalysisProvider({ AI_PROVIDER: "openai" }).id).toBe("disabled");
    expect(createAnalysisProvider({ AI_PROVIDER: "openai", AI_ENABLED: "true", OPENAI_API_KEY: "synthetic-test-key", OPENAI_MODEL: "configured-test-model" }).id).toBe("disabled");
    expect(mocks.construct).not.toHaveBeenCalled();
  });

  it("envia só dados mínimos; usa Responses estruturada, store:false e zero retries", async () => {
    mocks.parse.mockResolvedValue({ status: "completed", output: [], output_parsed: { suggestions: [] }, usage: { input_tokens: 20, output_tokens: 4 } });
    const adapter = new OpenAIAnalysisProvider("configured-test-model", "synthetic-test-key");
    const controller = new AbortController();
    const result = await adapter.analyze({ projectId: "never-transmit-project-id", consent: true, context: "Resultado documentado", evidence: [{ id: "e1", excerpt: "Texto não confiável" }] }, { signal: controller.signal, maxOutputTokens: 500 });
    expect(mocks.construct).toHaveBeenCalledWith({ apiKey: "synthetic-test-key", maxRetries: 0, timeout: 15000 });
    const [body, options] = mocks.parse.mock.calls[0];
    expect(body).toMatchObject({ model: "configured-test-model", store: false, max_output_tokens: 500, text: { format: { type: "json_schema", name: "oaas_suggestions", strict: true } } });
    expect(body).not.toHaveProperty("tools");
    expect(JSON.stringify(body)).not.toContain("never-transmit-project-id");
    expect(JSON.stringify(body)).not.toContain("synthetic-test-key");
    expect(JSON.parse(body.input[0].content)).toEqual({ context: "Resultado documentado", evidence: [{ id: "e1", excerpt: "Texto não confiável" }] });
    expect(options).toEqual({ signal: controller.signal, maxRetries: 0 });
    expect(result.usage).toEqual({ inputTokens: 20, outputTokens: 4 });
  });

  it("identifica recusa e rejeita conteúdo incompleto", async () => {
    const adapter = new OpenAIAnalysisProvider("configured-test-model", "synthetic-test-key");
    const input = { projectId: "test", consent: true, context: "", evidence: [] };
    const options = { signal: new AbortController().signal, maxOutputTokens: 500 };
    mocks.parse.mockResolvedValueOnce({ status: "completed", output: [{ type: "message", content: [{ type: "refusal", refusal: "raw message" }] }], output_parsed: null });
    expect((await adapter.analyze(input, options)).refused).toBe(true);
    mocks.parse.mockResolvedValueOnce({ status: "incomplete", output: [], output_parsed: { suggestions: [] } });
    expect((await adapter.analyze(input, options)).output).toBeNull();
  });
});
