import type { AnalysisInput, AnalysisProvider, ProviderResponse } from "./schema";

/** Local and deterministic: no network, no model and no claim to be a real AI analysis. */
export class MockAnalysisProvider implements AnalysisProvider {
  readonly id = "simulated" as const;
  readonly model = "deterministic-demo-v1";

  async analyze(input: AnalysisInput): Promise<ProviderResponse> {
    return { output: { suggestions: [
      {
        kind: "question",
        text: "Quem aceita a entrega e qual evidência permitirá verificar esse aceite?",
        evidenceIds: [], supportingQuotes: [],
      },
      {
        kind: "experiment",
        text: input.evidence.length === 0
          ? "Rascunho simulado: registre uma hipótese, o teste seguro, o responsável e o critério de sucesso antes de começar."
          : "Rascunho simulado: confira a origem e o período das evidências selecionadas e registre o que elas ainda não demonstram.",
        evidenceIds: [], supportingQuotes: [],
      },
    ] } };
  }
}

export class DisabledAnalysisProvider implements AnalysisProvider {
  readonly id = "disabled" as const;
  readonly model = null;
  async analyze(): Promise<ProviderResponse> { return { output: { suggestions: [] } }; }
}
