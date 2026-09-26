import { expect, test, type Page } from '@playwright/test';
import type { AssessmentInput } from '../../src/domain/framework/schema';
import type { AssessmentSnapshot } from '../../src/domain/framework/snapshots';

// The guide is exercised with fictitious information only. These UI tests do not
// claim market validation or replace the separate two-account Auth/RLS suite.
const GUIDE_KEY = 'radar-oaas.guided-demo.v1';
const LEGACY_KEY = 'radar-oaas.synthetic-demo.v1';
type DemoStore = { name: string; draft: AssessmentInput; history: AssessmentSnapshot[] };

async function heading(page: Page, name: string) {
  await expect(page.getByRole('heading', { level: 1, name, exact: true })).toBeVisible();
}

async function continueGuide(page: Page, nextHeading: string) {
  await page.getByRole('button', { name: 'Continuar', exact: true }).click();
  await heading(page, nextHeading);
  await expect(page.getByRole('heading', { level: 1, name: nextHeading, exact: true })).toBeFocused();
}

async function readGuide(page: Page): Promise<DemoStore> {
  const stored = await page.evaluate(key => localStorage.getItem(key), GUIDE_KEY);
  expect(stored, 'A saved guided demo must resume from its own browser draft.').not.toBeNull();
  return JSON.parse(stored!) as DemoStore;
}

async function chooseUnknowns(page: Page) {
  const choices = page.getByRole('radio', { name: /^(Ainda não sei|Prefiro responder depois|Não tenho certeza)$/ });
  expect(await choices.count(), 'Every question must offer an explicit way to remain uncertain.').toBeGreaterThan(0);
  for (const choice of await choices.all()) await choice.check();
}

async function completeGuide(page: Page) {
  await page.goto('/demo');
  await heading(page, 'Para quem é a sua ideia?');
  await page.getByRole('radio', { name: 'Pequenas empresas', exact: true }).check();
  await continueGuide(page, 'O que você quer melhorar?');
  await expect(page.getByRole('textbox')).toHaveCount(0);
  await page.getByRole('radio', { name: 'Preparar documentos', exact: true }).check();
  await page.getByRole('radio', { name: 'Ganhar tempo', exact: true }).check();
  await continueGuide(page, 'O que você já descobriu?');
  await expect(page.getByRole('textbox')).toHaveCount(0);
  await page.getByRole('radio', { name: 'Ainda não conversei com possíveis clientes', exact: true }).check();
  await page.getByRole('radio', { name: 'A própria pessoa ou equipe faz o trabalho', exact: true }).check();
  await continueGuide(page, 'Como saber se deu certo?');
  await expect(page.getByRole('textbox')).toHaveCount(0);
  await page.getByRole('radio', { name: 'Uma pessoa confere a entrega', exact: true }).check();
  await page.getByRole('radio', { name: 'Não, pelo que sei', exact: true }).check();
  await page.getByRole('button', { name: 'Ver meu próximo passo', exact: true }).click();
  await heading(page, 'Sua ideia, com um próximo passo.');
}

test.describe('Entrada guiada — escolhas simples, persistência e aprofundamento opcional', () => {
  test('apresenta a proposta antes do formulário e separa projeto privado de demonstração', async ({ page }) => {
    await page.goto('/');
    await heading(page, 'Descubra o próximo passo da sua ideia.');
    await expect(page.getByRole('link', { name: 'Começar meu projeto', exact: true }).first()).toHaveAttribute('href', '/projetos');
    await page.getByRole('link', { name: 'Experimentar sem conta', exact: true }).first().click();
    await heading(page, 'Para quem é a sua ideia?');
    await expect(page.getByRole('radio', { checked: true })).toHaveCount(0);
    await expect(page.getByRole('textbox')).toHaveCount(0);
    await expect(page.getByRole('navigation', { name: 'Etapas da avaliação' })).toHaveCount(0);
    expect(await page.evaluate(key => localStorage.getItem(key), LEGACY_KEY)).toBeNull();
  });

  test('salva cada avanço e retoma a etapa e as escolhas depois de recarregar', async ({ page }) => {
    await page.goto('/demo');
    await page.getByRole('radio', { name: 'Pequenas empresas', exact: true }).check();
    await continueGuide(page, 'O que você quer melhorar?');
    let stored = await readGuide(page);
    expect(stored.draft.guidedIntake).toMatchObject({ version: 1, step: 1, answers: { audience: 'small_business' } });
    await page.reload();
    await heading(page, 'O que você quer melhorar?');
    await page.getByRole('button', { name: 'Voltar', exact: true }).click();
    await expect(page.getByRole('radio', { name: 'Pequenas empresas', exact: true })).toBeChecked();

    await page.getByRole('radio', { name: 'Ainda não sei', exact: true }).check();
    await continueGuide(page, 'O que você quer melhorar?');
    stored = await readGuide(page);
    expect(stored.draft.guidedIntake?.answers.audience).toBe('unknown');
    expect(stored.draft.canvas.icp).toBe('');
    expect(stored.draft.evidence).toEqual([]);
    expect(stored.history).toEqual([]);
    expect(await page.evaluate(key => localStorage.getItem(key), LEGACY_KEY)).toBeNull();
  });

  test('aceita incerteza em todas as perguntas sem transformar ausência em nota zero', async ({ page }) => {
    await page.goto('/demo');
    await chooseUnknowns(page);
    await continueGuide(page, 'O que você quer melhorar?');
    await chooseUnknowns(page);
    await continueGuide(page, 'O que você já descobriu?');
    await chooseUnknowns(page);
    await continueGuide(page, 'Como saber se deu certo?');
    await chooseUnknowns(page);
    await page.getByRole('button', { name: 'Ver meu próximo passo', exact: true }).click();
    await heading(page, 'Sua ideia, com um próximo passo.');
    const { draft, history } = await readGuide(page);
    expect(draft.guidedIntake?.step).toBe(4);
    expect(draft.evidence).toEqual([]);
    expect(Object.values(draft.criteria).every(rating => rating.score === null)).toBe(true);
    expect(Object.values(draft.blocks).every(rating => rating.score === null)).toBe(true);
    expect(Object.values(draft.gates).every(gate => gate.status === 'pending')).toBe(true);
    expect(draft.economics).toBeNull();
    expect(history).toEqual([]);
    await expect(page.getByRole('table')).toHaveCount(0);
    await expect(page.getByRole('button', { name: /^Gerar diagnóstico/ })).toHaveCount(0);
    await page.reload();
    await heading(page, 'Sua ideia, com um próximo passo.');
  });

  test('pede texto só para outra opção e permite salvar, sair e corrigir pelo teclado', async ({ page }) => {
    await page.goto('/demo');
    const other = page.getByRole('radio', { name: 'Outro público', exact: true });
    await other.focus();
    await page.keyboard.press('Space');
    const audience = page.getByLabel(/^Qual público\?/);
    await expect(audience).toBeVisible();
    await audience.fill('Associação fictícia de bairro');
    await page.getByRole('button', { name: 'Salvar e sair', exact: true }).click();
    await expect(page).toHaveURL(/\/$/);
    await page.goto('/demo');
    await expect(other).toBeChecked();
    await expect(audience).toHaveValue('Associação fictícia de bairro');
    await continueGuide(page, 'O que você quer melhorar?');
    await page.getByRole('radio', { name: 'Outro trabalho', exact: true }).check();
    const work = page.getByLabel(/^Qual trabalho\?/);
    await work.fill('Organizar pedidos fictícios de livros');
    await page.getByRole('radio', { name: 'Diminuir erros', exact: true }).check();
    await continueGuide(page, 'O que você já descobriu?');
    await page.getByRole('button', { name: 'Voltar', exact: true }).click();
    await expect(work).toHaveValue('Organizar pedidos fictícios de livros');
    await page.getByRole('radio', { name: 'Preparar documentos', exact: true }).check();
    await expect(work).toHaveCount(0);
    await continueGuide(page, 'O que você já descobriu?');
    const { draft } = await readGuide(page);
    expect(draft.guidedIntake?.answers.work).toBe('documents');
    expect(draft.canvas.narrow_work).not.toContain('livros');
    // Preserve a typed alternative for an explicit return without applying an
    // inactive branch to the current proposal.
    expect(draft.guidedIntake?.answers.workOther).toBe('Organizar pedidos fictícios de livros');
    await page.getByRole('button', { name: 'Voltar', exact: true }).click();
    await page.getByRole('radio', { name: 'Outro trabalho', exact: true }).check();
    await expect(work).toHaveValue('Organizar pedidos fictícios de livros');
  });

  test('entrega um próximo teste curto e preserva os detalhes editados no modo aprofundado', async ({ page }) => {
    await completeGuide(page);
    await expect(page.getByText(/Sua proposta é ajudar pequenas empresas a preparar documentos/)).toBeVisible();
    await expect(page.getByRole('table')).toHaveCount(0);
    await page.getByRole('button', { name: 'Preparar meu próximo teste', exact: true }).click();
    await expect(page.getByText('Quando esse problema aconteceu pela última vez?', { exact: true })).toBeVisible();
    await page.getByRole('button', { name: 'Aprofundar avaliação', exact: true }).click();
    await expect(page.getByLabel('Cliente ideal (ICP)', { exact: true })).toHaveValue('Público pretendido: pequenas empresas.');
    await page.getByLabel('Cliente ideal (ICP)', { exact: true }).fill('Público fictício ajustado no detalhamento');
    await page.getByRole('button', { name: 'Salvar rascunho', exact: true }).first().click();
    await expect(page.getByText('Rascunho sintético salvo neste navegador.', { exact: true })).toBeVisible();
    await page.reload();
    await heading(page, 'Sua ideia, com um próximo passo.');
    await page.getByRole('button', { name: 'Corrigir respostas', exact: true }).click();
    await page.getByRole('radio', { name: 'Pessoas', exact: true }).check();
    await continueGuide(page, 'O que você quer melhorar?');
    await page.getByRole('button', { name: 'Aprofundar avaliação', exact: true }).click();
    await expect(page.getByLabel('Cliente ideal (ICP)', { exact: true })).toHaveValue('Público fictício ajustado no detalhamento');
    expect((await readGuide(page)).history).toEqual([]);
  });

  test('mantém escolhas e ações utilizáveis em telas pequenas sem rolagem horizontal', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await completeGuide(page);
    for (const width of [375, 320]) {
      await page.setViewportSize({ width, height: 812 });
      const fits = await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1);
      expect(fits, `The result must fit a ${width}px viewport.`).toBe(true);
      const action = page.getByRole('button', { name: 'Preparar meu próximo teste', exact: true });
      await action.scrollIntoViewIfNeeded();
      await expect(action).toBeInViewport();
    }
    await page.getByRole('button', { name: 'Corrigir respostas', exact: true }).click();
    await heading(page, 'Para quem é a sua ideia?');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).toBe(true);
    await expect(page.getByRole('radio', { name: 'Pequenas empresas', exact: true })).toBeChecked();
  });
});
