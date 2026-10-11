import { describe, expect, it } from 'vitest';
import { createEmptyAssessment, createSnapshot, emptyRating, evaluateAssessment, syntheticEvidence, type Evidence } from '../../src/domain/framework';
import { reportMarkdown } from '../../src/lib/exports/report';

describe('Markdown do diagnóstico — evidência e versão exportadas', () => {
  it.each([
    ['supports', 'Favorável / sustenta'],
    ['contradicts', 'Desfavorável / contradiz'],
    ['inconclusive', 'Inconclusiva — ainda não permite concluir'],
  ] as const)('preserva alegação, contexto, revisão e relação %s', (outcome, label) => {
    const input = createEmptyAssessment('synthetic-report', 'discovery');
    input.evidence = [{
      ...syntheticEvidence('evidence-report'),
      source: 'Ensaio fictício do relatório',
      description: 'Observação sintética sem dados de clientes',
      claim: 'A conferência detecta divergências no lote sintético',
      period: 'Primeiro período fictício',
      cohort: 'Grupo fictício A',
      outcome,
    }];
    const markdown = reportMarkdown('Diagnóstico fictício', input, evaluateAssessment(input));
    expect(markdown).toContain('### evidence-report — Ensaio fictício do relatório');
    expect(markdown).toContain('Tipo: document | Data: 2026-09-23 | Período observado: Primeiro período fictício');
    expect(markdown).toContain('Coorte / cliente / grupo: Grupo fictício A');
    expect(markdown).toContain('Descrição verificável: Observação sintética sem dados de clientes');
    expect(markdown).toContain('Alegação investigada: A conferência detecta divergências no lote sintético');
    expect(markdown).toContain('Relação com a alegação: ' + label);
    expect(markdown).toContain('Revisão: Revisão autodeclarada | Autor: Proprietário fictício | Data da revisão: 2026-09-23T12:00:00Z');
    expect(markdown).toContain('nunca auditoria independente');
  });

  it('mantém zero desfavorável distinto de N/D no arquivo', () => {
    const input = createEmptyAssessment('synthetic-report', 'discovery');
    const evidence: Evidence = { ...syntheticEvidence('negative'), type: 'observed_result', outcome: 'contradicts' };
    input.evidence = [evidence];
    const rating = {
      ...emptyRating(), score: 0, justification: 'Teste sintético documentado',
      period: evidence.period, evidenceIds: [evidence.id], review: evidence.review,
    };
    input.criteria.budget = structuredClone(rating);
    input.blocks.pain_budget = structuredClone(rating);
    const result = evaluateAssessment(input);
    expect(result.criteria.budget.score).toBe(0);
    expect(result.blocks.pain_budget.score).toBe(0);
    expect(result.criteria.incumbent.score).toBeNull();
    expect(result.scorecard).toMatchObject({ coverage: 0.2, partialIndex: 0, completeIndex: null });
    const markdown = reportMarkdown('Diagnóstico fictício', input, result);
    expect(markdown).toContain('- Orçamento: 0 / 5');
    expect(markdown).toContain('- Incumbente: N/D / 5');
    expect(markdown).toContain('- Dor + orçamento (20%): 0 / 5');
    expect(markdown).toContain('- Verificabilidade + vantagem (20%): N/D / 5');
    expect(markdown).toContain('Índice completo: N/D');
    expect(markdown).toContain('N/D significa informação ausente ou sem sustentação suficiente. Zero representa evidência desfavorável; não são a mesma situação.');
  });

  it('não transforma alegação ausente ou revisão pendente em evidência desfavorável', () => {
    const input = createEmptyAssessment('synthetic-report');
    input.evidence = [{ ...syntheticEvidence(), claim: '', period: '', cohort: '', outcome: 'inconclusive', review: null }];
    const markdown = reportMarkdown('Diagnóstico fictício', input, evaluateAssessment(input));
    expect(markdown).toContain('Alegação investigada: Não registrada');
    expect(markdown).toContain('Período observado: N/D');
    expect(markdown).toContain('Coorte / cliente / grupo: N/D');
    expect(markdown).toContain('Relação com a alegação: Inconclusiva — ainda não permite concluir');
    expect(markdown).toContain('Revisão: Revisão pendente | Autor: N/D | Data da revisão: N/D');
    expect(markdown).not.toContain('Relação com a alegação: Desfavorável');
  });

  it('usa metadados e pesos da versão selecionada sem recalcular ou modificar o snapshot', () => {
    const original = createSnapshot(createEmptyAssessment('synthetic-history'), {
      id: 'historical-snapshot', author: 'Revisora fictícia', createdAt: '2026-09-23T12:00:00Z',
    });
    const snapshot = {
      ...original, frameworkVersion: 'historical-framework', rulesVersion: 'historical-rules',
      weights: { ...original.weights, pain_budget: 0.3, verification_advantage: 0.1 },
    };
    const before = structuredClone(snapshot);
    const markdown = reportMarkdown('Diagnóstico fictício', snapshot.input, snapshot.result, { snapshot });
    expect(markdown).toContain('Framework: historical-framework | Regras: historical-rules');
    expect(markdown).toContain('Snapshot: historical-snapshot');
    expect(markdown).toContain('Registrado em: 2026-09-23T12:00:00Z | Autor: Revisora fictícia');
    expect(markdown).toContain('- Dor + orçamento (30%): N/D / 5');
    expect(markdown).toContain('- Verificabilidade + vantagem (10%): N/D / 5');
    expect(snapshot).toEqual(before);
  });

  it('rotula explicitamente a demo fictícia e mantém as limitações em qualquer modo', () => {
    const input = createEmptyAssessment('synthetic-report');
    const result = evaluateAssessment(input);
    const demo = reportMarkdown('Diagnóstico fictício', input, result, { demo: true });
    const ordinary = reportMarkdown('Diagnóstico', input, result);
    expect(demo).toContain('Demonstração com dados fictícios. Não representa resultados reais, validação de mercado ou autorização para operar.');
    expect(ordinary).not.toContain('Demonstração com dados fictícios.');
    for (const markdown of [demo, ordinary]) {
      expect(markdown).toContain('Não constitui certificação, parecer profissional ou garantia de resultado');
      expect(markdown).toContain('nunca auditoria independente');
    }
  });

  it('trata alegação, contexto e referência como texto não confiável', () => {
    const input = createEmptyAssessment('synthetic-report');
    input.evidence = [{
      ...syntheticEvidence(), claim: '<b>Texto</b> **marcado** [atalho](https://example.com)',
      period: '*período*', cohort: '[grupo]', url: 'https://example.com/evidencia',
    }];
    const markdown = reportMarkdown('Diagnóstico fictício', input, evaluateAssessment(input));
    expect(markdown).not.toContain('<b>');
    expect(markdown).not.toContain('**marcado**');
    expect(markdown).not.toContain('[atalho](https://example.com)');
    expect(markdown).toContain('\\*\\*marcado\\*\\*');
    expect(markdown).toContain('Período observado: \\*período\\*');
    expect(markdown).toContain('Coorte / cliente / grupo: \\[grupo\\]');
    expect(markdown).toContain('Referência URL: https://example\\.com/evidencia — não verificada automaticamente.');
  });
});
