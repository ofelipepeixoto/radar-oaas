import { readFile } from 'node:fs/promises';
import { expect, test, type Download, type Locator, type Page } from '@playwright/test';
import type { AssessmentInput } from '../../src/domain/framework/schema';
import type { AssessmentSnapshot } from '../../src/domain/framework/snapshots';

// These tests operate the real demo UI, local persistence, deterministic engine,
// and browser downloads. They do not mock Supabase/OpenAI or claim live auth/RLS.
const DEMO_KEY = 'radar-oaas.synthetic-demo.v1';
type DemoStore = { name: string; draft: AssessmentInput; history: AssessmentSnapshot[] };

async function openDemo(page: Page) {
  await page.goto('/demo?exemplo=financeiro');
  await expect(page.getByRole('heading', { level: 1, name: 'Conciliação financeira', exact: true })).toBeVisible();
  await expect(page.getByText('Demonstração sintética', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Detalhar canvas completo', exact: true }).click();
}

async function goToStep(page: Page, name: string) {
  await page.getByRole('navigation', { name: 'Etapas da avaliação' })
    .getByRole('button', { name: new RegExp(name) }).click();
}

async function saveDraft(page: Page) {
  await page.getByRole('button', { name: 'Salvar rascunho', exact: true }).first().click();
  await expect(page.getByText('Rascunho sintético salvo neste navegador.', { exact: true })).toBeVisible();
  await expect(page.getByRole('alert')).toHaveCount(0);
}

async function readDemo(page: Page): Promise<DemoStore> {
  const raw = await page.evaluate((key) => localStorage.getItem(key), DEMO_KEY);
  expect(raw, 'The user-visible Save action must persist the synthetic draft').not.toBeNull();
  return JSON.parse(raw!) as DemoStore;
}

async function generateAssessment(page: Page, count = 1) {
  await page.getByRole('button', { name: /^Gerar diagnóstico/ }).click();
  await expect(page.getByLabel('Histórico de avaliações', { exact: true }).locator('option')).toHaveCount(count);
  await expect(page.getByRole('heading', { name: '08. Histórico e versões', exact: true })).toBeVisible();
  await expect(page.getByRole('alert')).toHaveCount(0);
}

function accordion(page: Page, summary: string): Locator {
  return page.locator('details').filter({ has: page.locator('summary').filter({ hasText: new RegExp('^' + summary.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')) }) });
}

async function reviewRating(record: Locator, score: string) {
  await record.locator('summary').click();
  await record.getByLabel('Nota proposta', { exact: true }).selectOption(score);
  await record.getByLabel('Período avaliado', { exact: true }).fill('Setembro de 2026 — exercício fictício');
  await record.getByLabel('Justificativa da nota', { exact: true }).fill('Relato sintético revisado para testar o registro independente desta nota.');
  await record.getByLabel('Próximo teste', { exact: true }).fill('Buscar resultados observados antes de propor piloto demonstrado.');
  await record.getByRole('checkbox', { name: /demo-evidence-01/ }).check();
  await record.getByRole('checkbox', { name: /Revisei este registro como proprietário/ }).check();
  await record.getByLabel('Autor da revisão').fill('Revisor fictício do teste');
}

async function readDownload(download: Download): Promise<string> {
  expect(await download.failure()).toBeNull();
  const path = await download.path();
  expect(path).not.toBeNull();
  return readFile(path!, 'utf8');
}

test.describe('Demonstração sintética — interface e motor reais, sem serviços externos', () => {
  test('carrega e troca os três exemplos sintéticos sem tratá-los como projetos privados', async ({ page }) => {
    await openDemo(page);
    await expect(page.getByLabel('Setor', { exact: true })).toHaveValue('Serviços contábeis');
    await page.getByLabel('Explorar outro exemplo sintético').selectOption('nda');
    await expect(page.getByRole('heading', { level: 1, name: 'Preparação de NDA', exact: true })).toBeVisible();
    await expect(page.getByLabel('Trabalho estreito', { exact: true })).toHaveValue(/revisão por profissional habilitado/);

    page.once('dialog', dialog => dialog.accept());
    await page.getByLabel('Explorar outro exemplo sintético').selectOption('provisioning');
    await expect(page.getByRole('heading', { level: 1, name: 'Provisionamento de usuários', exact: true })).toBeVisible();
    await expect(page.getByLabel('Trabalho estreito', { exact: true })).toHaveValue(/ambiente isolado/);
    await expect(page.getByText(/Não insira dados pessoais, confidenciais ou reais/)).toBeVisible();
    expect(await page.evaluate(key => localStorage.getItem(key), DEMO_KEY)).toBeNull();
  });

  test('salva o canvas editado e restaura os mesmos campos após recarregar', async ({ page }) => {
    await openDemo(page);
    await page.getByLabel('Nome do projeto', { exact: true }).fill('Fluxo sintético E2E');
    await page.getByLabel('Comprador e usuário', { exact: true }).fill('Comprador fictício da equipe de teste');
    await page.getByLabel('Critério de aceite', { exact: true }).fill('Conferência sintética de todas as entradas e divergências.');
    await saveDraft(page);
    await page.reload();

    await expect(page.getByRole('heading', { level: 1, name: 'Fluxo sintético E2E', exact: true })).toBeVisible();
    await expect(page.getByLabel('Comprador e usuário', { exact: true })).toHaveValue('Comprador fictício da equipe de teste');
    await expect(page.getByLabel('Critério de aceite', { exact: true })).toHaveValue('Conferência sintética de todas as entradas e divergências.');
    const saved = await readDemo(page);
    expect(saved.draft.projectId).toMatch(/^synthetic-/);
    expect(saved.history).toEqual([]);
  });

  test('registra evidência com alegação, período e revisão humana autodeclarada', async ({ page }) => {
    await openDemo(page);
    await goToStep(page, 'Evidências');
    await page.getByRole('button', { name: '+ Adicionar evidência', exact: true }).click();
    const evidence = page.locator('details').last();
    await evidence.getByLabel('Tipo de evidência').selectOption('observed_result');
    await evidence.getByLabel('Relação com a alegação').selectOption('supports');
    await evidence.getByLabel('Fonte da evidência', { exact: true }).fill('Ensaio inteiramente fictício E2E');
    await evidence.getByLabel('Data da evidência', { exact: true }).fill('2026-09-01');
    await evidence.getByLabel('Período observado', { exact: true }).fill('Primeiro período fictício');
    await evidence.getByLabel('Coorte / cliente / grupo', { exact: true }).fill('Coorte sintética A');
    await evidence.getByLabel('Trecho ou descrição verificável', { exact: true }).fill('Dez casos sintéticos foram conferidos por um revisor fictício, sem dados de clientes.');
    await evidence.getByLabel('Alegação à qual esta evidência se vincula', { exact: true }).fill('A regra de aceite pode ser aplicada a estes casos fictícios.');
    await evidence.getByLabel('URL de referência (opcional)', { exact: false }).fill('https://example.com/evidencia-sintetica');
    await evidence.getByRole('checkbox', { name: /Revisei este registro como proprietário/ }).check();
    await evidence.getByLabel('Autor da revisão').fill('Pessoa fictícia E2E');
    await saveDraft(page);
    await page.reload();
    await goToStep(page, 'Evidências');

    const restored = accordion(page, 'Ensaio inteiramente fictício E2E');
    await expect(restored.getByLabel('Autor da revisão')).toHaveValue('Pessoa fictícia E2E');
    await expect(restored.getByLabel('Tipo de evidência')).toHaveValue('observed_result');
    await expect(restored.getByText('Informe o responsável. Não é auditoria independente.')).toBeVisible();
    const saved = await readDemo(page);
    expect(saved.draft.evidence).toHaveLength(2);
    expect(saved.draft.evidence[1]).toMatchObject({ outcome: 'supports', review: { status: 'self_declared', author: 'Pessoa fictícia E2E' } });
  });

  test('mantém critérios e blocos independentes e não confunde índice parcial com aprovação', async ({ page }) => {
    await openDemo(page);
    await goToStep(page, 'Critérios e scorecard');
    const budget = accordion(page, 'Orçamento');
    const painBudget = accordion(page, 'Dor + orçamento');
    await reviewRating(budget, '3');
    // Editing a criterion alone must not populate the independent block.
    await painBudget.locator('summary').click();
    await expect(painBudget.getByLabel('Nota proposta', { exact: true })).toHaveValue('nd');
    await painBudget.locator('summary').click();
    await reviewRating(painBudget, '2');
    await generateAssessment(page);

    const criteriaSection = page.locator('section').filter({ has: page.getByRole('heading', { name: '03. Oito critérios', exact: true }) });
    const scoreSection = page.locator('section').filter({ has: page.getByRole('heading', { name: '04. Scorecard independente', exact: true }) });
    await expect(criteriaSection.getByRole('row').filter({ has: page.getByRole('cell', { name: 'Orçamento', exact: true }) })).toContainText('3 / 5');
    await expect(scoreSection.getByRole('row').filter({ has: page.getByRole('cell', { name: 'Dor + orçamento', exact: true }) })).toContainText('2 / 5');
    await expect(scoreSection.locator('.stat-card').filter({ hasText: /^COBERTURA/ })).toContainText('20%');
    await expect(scoreSection.locator('.stat-card').filter({ hasText: 'TOTAL COMPLETO' })).toContainText('N/D');
    await expect(page.getByRole('heading', { name: 'Evidência insuficiente / revisão necessária', exact: true })).toBeVisible();
    const saved = await readDemo(page);
    expect(saved.history[0].result.scorecard).toMatchObject({ coverage: 0.2, partialIndex: 40, completeIndex: null });
    expect(saved.history[0].result.decision.blocked).toBe(true);
  });

  test('finaliza, reavalia e preserva o conteúdo da avaliação anterior no histórico', async ({ page }) => {
    await openDemo(page);
    await page.getByLabel('Resultado delimitado', { exact: true }).fill('Resultado sintético da primeira avaliação');
    await generateAssessment(page);
    const before = (await readDemo(page)).history[0];
    await goToStep(page, 'Projeto e canvas');
    await page.getByLabel('Resultado delimitado', { exact: true }).fill('Resultado sintético alterado depois da primeira avaliação');
    await generateAssessment(page, 2);
    const after = await readDemo(page);
    expect(after.history[0].id).not.toBe(before.id);
    expect(after.history[0].input.canvas.outcome).toBe('Resultado sintético alterado depois da primeira avaliação');
    expect(after.history[1]).toEqual(before);
    await page.getByLabel('Histórico de avaliações', { exact: true }).selectOption(before.id);
    await expect(page.getByText(`ID: ${before.id}`, { exact: false })).toBeVisible();
    await page.reload();
    await goToStep(page, 'Diagnóstico e histórico');
    await expect(page.getByLabel('Histórico de avaliações', { exact: true }).locator('option')).toHaveCount(2);
  });

  test('exporta arquivos JSON e Markdown do diagnóstico selecionado, com versões e limitações', async ({ page }) => {
    await openDemo(page);
    await generateAssessment(page);
    const storedSnapshot = (await readDemo(page)).history[0];
    const jsonDownloadPromise = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Exportar JSON', exact: true }).click();
    const jsonDownload = await jsonDownloadPromise;
    expect(jsonDownload.suggestedFilename()).toBe('conciliacao-financeira-avaliacao.json');
    const json = JSON.parse(await readDownload(jsonDownload)) as AssessmentSnapshot;
    expect(json).toEqual(storedSnapshot);
    expect(json.frameworkVersion).toBeTruthy();
    expect(json.rulesVersion).toBeTruthy();
    expect(json.input.projectId).toMatch(/^synthetic-/);

    const markdownDownloadPromise = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Exportar Markdown', exact: true }).click();
    const markdownDownload = await markdownDownloadPromise;
    expect(markdownDownload.suggestedFilename()).toBe('conciliacao-financeira-relatorio.md');
    const markdown = await readDownload(markdownDownload);
    expect(markdown).toContain('# Conciliação financeira — Radar OaaS');
    expect(markdown).toContain(json.rulesVersion);
    expect(markdown).toContain('Scorecard independente');
    expect(markdown).toContain('nunca auditoria independente');
    expect(markdown).toContain('Não constitui certificação, parecer profissional ou garantia de resultado');
    expect(markdown).toContain('demo-evidence-01');
  });

  test('transforma sugestão em experimento editável, salva, restaura e remove o experimento', async ({ page }) => {
    await openDemo(page);
    await goToStep(page, 'Plano de experimentos');
    await page.getByRole('button', { name: 'Definir próximo experimento', exact: true }).click();
    const experiment = page.locator('details').last();
    await experiment.getByLabel('Hipótese', { exact: true }).fill('Hipótese fictícia verificável E2E');
    await experiment.getByLabel('Responsável', { exact: true }).fill('Responsável fictício E2E');
    await experiment.getByLabel('Métrica', { exact: true }).fill('Quantidade de casos sintéticos conferidos');
    await experiment.getByLabel('Critério de sucesso', { exact: true }).fill('Conferir dez casos fictícios sem divergência não explicada');
    await experiment.getByLabel('Regra de interrupção', { exact: true }).fill('Interromper ao encontrar qualquer dado real');
    await experiment.getByLabel('Custo estimado (BRL; vazio = N/D)', { exact: true }).fill('123.45');
    await experiment.getByLabel('Estado do experimento', { exact: true }).selectOption('running');
    await page.getByLabel('Período planejado', { exact: true }).first().fill('Dias 1–10 — período fictício revisado');
    await page.getByLabel('Responsável pela fase', { exact: true }).first().fill('Responsável fictício da descoberta');
    await saveDraft(page);
    await page.reload();
    await goToStep(page, 'Plano de experimentos');
    const restored = accordion(page, 'Hipótese fictícia verificável E2E');
    await expect(restored.getByLabel('Métrica', { exact: true })).toHaveValue('Quantidade de casos sintéticos conferidos');
    await expect(restored.getByLabel('Estado do experimento', { exact: true })).toHaveValue('running');
    await expect(page.getByLabel('Período planejado', { exact: true }).first()).toHaveValue('Dias 1–10 — período fictício revisado');
    await expect(page.getByLabel('Responsável pela fase', { exact: true }).first()).toHaveValue('Responsável fictício da descoberta');
    let saved = await readDemo(page);
    expect(saved.draft.experiments).toHaveLength(2);
    expect(saved.draft.experiments[1].estimatedCostCents).toBe(12345);
    await restored.getByRole('button', { name: 'Remover experimento', exact: true }).click();
    await saveDraft(page);
    saved = await readDemo(page);
    expect(saved.draft.experiments).toHaveLength(1);
    expect(saved.draft.experiments.some(item => item.hypothesis === 'Hipótese fictícia verificável E2E')).toBe(false);
  });

  test('opera demo, avaliação e sugestões simuladas sem chamadas à API privada ou a provedores', async ({ page }) => {
    const apiRequests: string[] = [];
    page.on('request', request => {
      const url = new URL(request.url());
      if (url.pathname.startsWith('/api/') || /(^|\.)(supabase\.co|openai\.com)$/.test(url.hostname)) {
        apiRequests.push(`${request.method()} ${url.origin}${url.pathname}`);
      }
    });
    await openDemo(page);
    await saveDraft(page);
    await generateAssessment(page);
    await goToStep(page, 'Plano de experimentos');
    await page.getByRole('button', { name: 'Ver sugestões simuladas', exact: true }).click();
    await expect(page.getByText('Simulação determinística', { exact: true })).toBeVisible();
    await expect(page.getByText('Pendente de revisão:', { exact: true }).first()).toBeVisible();
    await page.reload();
    await expect(page.getByLabel('Nome do projeto', { exact: true })).toHaveValue('Conciliação financeira');
    expect(apiRequests, 'A synthetic demo must never contact private APIs or AI/Supabase providers').toEqual([]);
    const storageKeys = await page.evaluate(() => Object.keys(localStorage));
    expect(storageKeys).toEqual([DEMO_KEY]);
  });

  test('cancela a reinicialização e depois reinicia a demonstração sem ressuscitar o histórico no reload', async ({ page }) => {
    await openDemo(page);
    await page.getByLabel('Nome do projeto', { exact: true }).fill('Rascunho fictício a remover');
    await generateAssessment(page);
    page.once('dialog', dialog => dialog.dismiss());
    await page.getByRole('button', { name: 'Reiniciar demonstração', exact: true }).click();
    expect((await readDemo(page)).history).toHaveLength(1);
    await expect(page.getByRole('heading', { level: 1, name: 'Rascunho fictício a remover', exact: true })).toBeVisible();

    page.once('dialog', dialog => dialog.accept());
    await page.getByRole('button', { name: 'Reiniciar demonstração', exact: true }).click();
    await expect(page.getByLabel('Nome do projeto', { exact: true })).toHaveValue('Conciliação financeira');
    // A demo reset is a synthetic draft reset, not a DELETE in Supabase.
    // No extra Save action: the destructive confirmation promises persistence.
    await page.reload();
    expect((await readDemo(page)).history).toEqual([]);
    await goToStep(page, 'Diagnóstico e histórico');
    await expect(page.getByLabel('Histórico de avaliações', { exact: true })).toHaveCount(0);
  });
});

test.describe('Acesso privado — fronteira real sem sessão, sem e-mail e sem mocks', () => {
  test('nega acesso sem autenticação ou configuração e não usa o navegador como banco privado', async ({ page, request, baseURL }) => {
    const origin = new URL(baseURL!).origin;
    const target = '/api/projects/11111111-1111-4111-8111-111111111111';
    const responses = await Promise.all([
      request.get('/api/projects'),
      request.post('/api/projects', { data: { name: 'Esta criação não pode acontecer', stage: 'idea' } }),
      request.delete(target, {headers:{Origin:origin}}),
    ]);
    for (const response of responses) {
      expect([401, 503], `${response.url()} must reject without authentication/configuration`).toContain(response.status());
      expect(response.headers()['cache-control']).toContain('no-store');
      const body = await response.json();
      expect(body).toHaveProperty('error');
      expect(body).not.toHaveProperty('project');
    }

    await page.goto('/projetos');
    await expect(page.getByRole('heading', { name: /Modo privado indisponível|Projetos privados\./ })).toBeVisible();
    await expect(page.getByRole('button', { name: /Novo projeto|Criar projeto privado/ })).toHaveCount(0);
    expect(await page.evaluate(() => localStorage.getItem('radar-oaas.synthetic-demo.v1'))).toBeNull();
    expect(await page.evaluate(() => Object.keys(localStorage).filter(key => /project|draft|rascunho/i.test(key)))).toEqual([]);
  });
});
