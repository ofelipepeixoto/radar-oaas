import { expect, test, type Page } from '@playwright/test';
import { createEmptyAssessment } from '../../src/domain/framework/schema';

// UI-only fixtures. Supabase and private HTTP responses are mocked; these tests
// do not prove Auth/RLS, persistence, deployment or performance of real services.
const projectId = '11111111-1111-4111-8111-111111111111';
const project = { id: projectId, name: 'Projeto fictício de documentos', stage: 'idea', updated_at: '2026-10-03T15:00:00Z' };
const draft = createEmptyAssessment(projectId);

async function fixture(page: Page, session = true) {
  await page.route('**/*', route => {
    const url = new URL(route.request().url());
    if (url.origin === 'http://127.0.0.1:3100') return route.continue();
    if (url.origin === 'http://127.0.0.1:54321') return route.fulfill({ status: 400, contentType: 'application/json', body: JSON.stringify({ error_code: 'invalid_credentials', message: 'Provider diagnostics must not be shown' }) });
    return route.abort();
  });
  if (session) await page.addInitScript(() => {
    localStorage.setItem('sb-127-auth-token', JSON.stringify({ access_token: 'synthetic-ui-session', refresh_token: 'synthetic-ui-refresh', token_type: 'bearer', expires_in: 3600, expires_at: Math.floor(Date.now() / 1000) + 3600, user: { id: '22222222-2222-4222-8222-222222222222', email: 'fixture@example.invalid', aud: 'authenticated', role: 'authenticated' } }));
  });
}

test('recupera falha de carregamento por ação explícita sem mostrar vazio como sucesso', async ({ page }) => {
  await fixture(page);
  let attempts = 0;
  await page.route('**/api/projects', route => route.fulfill({ status: ++attempts === 1 ? 503 : 200, json: attempts === 1 ? { error: 'SYNTHETIC_SENSITIVE_DIAGNOSTIC' } : { projects: [project] } }));
  await page.goto('/projetos');
  const alert = page.getByRole('alert');
  await expect(alert).toBeFocused();
  await expect(page.getByText('SYNTHETIC_SENSITIVE_DIAGNOSTIC', { exact: true })).toHaveCount(0);
  await expect(page.getByText('Uma oportunidade começa com uma pergunta.', { exact: true })).toHaveCount(0);
  expect(attempts).toBe(1);
  await page.getByRole('button', { name: 'Atualizar lista', exact: true }).click();
  await expect(page.getByRole('heading', { name: project.name, exact: true })).toBeVisible();
  await expect(alert).toHaveCount(0);
  expect(attempts).toBe(2);
});

test('JSON incompatível não quebra a tela nem apaga a última lista carregada', async ({ page }) => {
  await fixture(page);
  let reads = 0;
  await page.route('**/api/projects', route => route.fulfill({ json: ++reads === 2 ? {} : { projects: [project] } }));
  await page.goto('/projetos');
  await expect(page.getByRole('heading', { name: project.name, exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Atualizar lista', exact: true }).click();
  await expect(page.getByRole('alert')).toBeFocused();
  await expect(page.getByRole('heading', { name: project.name, exact: true })).toBeVisible();
  await expect(page.getByText(/Cannot read properties/)).toHaveCount(0);
  await page.getByRole('button', { name: 'Atualizar lista', exact: true }).click();
  await expect(page.getByRole('alert')).toHaveCount(0);
  expect(reads).toBe(3);
});

for (const response of ['malformed-json', 'wrong-shape']) {
  test(`criação 200 com ${response} preserva o nome e exige conferência antes de repetir`, async ({ page }) => {
    await fixture(page);
    let writes = 0;
    await page.route('**/api/projects', route => {
      if (route.request().method() !== 'POST') return route.fulfill({ json: { projects: [] } });
      writes++;
      return response === 'malformed-json' ? route.fulfill({ status: 200, contentType: 'application/json', body: 'invalid' }) : route.fulfill({ json: {} });
    });
    await page.goto('/projetos');
    await page.getByRole('button', { name: 'Criar meu primeiro projeto', exact: true }).click();
    const name = page.getByLabel('Nome do novo projeto (opcional)', { exact: true });
    await name.fill(project.name);
    await page.getByRole('button', { name: 'Começar o guia', exact: true }).click();
    await expect(page.getByRole('alert')).toBeFocused();
    await expect(name).toHaveValue(project.name);
    await expect(page.getByText(/Antes de criar outra vez/)).toBeVisible();
    await expect(page.getByText(/Cannot read properties/)).toHaveCount(0);
    expect(writes).toBe(1);
    await expect(page).toHaveURL(/\/projetos$/);
  });
}

test('preserva nome depois de criação incerta e permite conferir a lista antes de repetir', async ({ page }) => {
  await fixture(page);
  let writes = 0;
  await page.route('**/api/projects', route => {
    if (route.request().method() === 'POST') { writes++; return route.fulfill({ status: 503, json: { error: 'Não foi possível confirmar a criação.' } }); }
    return route.fulfill({ json: { projects: writes ? [project] : [] } });
  });
  await page.goto('/projetos');
  await page.getByRole('button', { name: 'Criar meu primeiro projeto', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Vamos organizar sua ideia.', exact: true })).toBeFocused();
  const name = page.getByLabel('Nome do novo projeto (opcional)', { exact: true });
  await name.fill(project.name);
  await page.getByRole('button', { name: 'Começar o guia', exact: true }).click();
  await expect(page.getByRole('alert')).toBeFocused();
  await expect(name).toHaveValue(project.name);
  await expect(page.getByText(/Antes de criar outra vez/)).toBeVisible();
  expect(writes).toBe(1);
  await page.getByRole('button', { name: 'Atualizar lista', exact: true }).click();
  await expect(page.getByRole('heading', { name: project.name, exact: true })).toBeVisible();
  await expect(name).toHaveValue(project.name);
  expect(writes).toBe(1);
});

test('projeto negado continua sem formulário nem informação privada e oferece volta', async ({ page }) => {
  await fixture(page);
  await page.route(`**/api/projects/${projectId}`, route => route.fulfill({ status: 404, json: { error: 'Projeto não encontrado.' } }));
  await page.goto(`/projetos/${projectId}`);
  await expect(page.getByRole('alert')).toHaveText('Projeto não encontrado.');
  await expect(page.getByRole('alert')).toBeFocused();
  await expect(page.getByRole('radio')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Tentar abrir novamente', exact: true })).toHaveCount(0);
  await expect(page.getByRole('link', { name: 'Voltar aos projetos', exact: true })).toHaveAttribute('href', '/projetos');
});

test('sessão negada ao salvar mantém respostas e oferece login em outra aba', async ({ page }) => {
  await fixture(page);
  let writes = 0;
  await page.route(`**/api/projects/${projectId}`, route => {
    if (route.request().method() === 'PUT') { writes++; return route.fulfill({ status: 401, json: { error: 'Sessão inválida ou expirada. Entre novamente.' } }); }
    return route.fulfill({ json: { project: { ...project, draft }, assessments: [] } });
  });
  await page.goto(`/projetos/${projectId}`);
  const choice = page.getByRole('radio', { name: 'Pequenas empresas', exact: true });
  await choice.check();
  await page.getByRole('button', { name: 'Continuar', exact: true }).click();
  await expect(page.getByRole('alert')).toBeFocused();
  await expect(choice).toBeChecked();
  await expect(page.getByRole('heading', { name: 'Para quem é a sua ideia?', exact: true })).toBeVisible();
  await expect(page.getByText('Alterações não salvas', { exact: true })).toBeVisible();
  const login = page.getByRole('link', { name: 'Entrar novamente em outra aba', exact: true });
  await expect(login).toHaveAttribute('href', '/conta');
  await expect(login).toHaveAttribute('target', '_blank');
  expect(writes).toBe(1);
  expect(await page.evaluate(() => localStorage.getItem('radar-oaas.guided-demo.v1'))).toBeNull();
});

test('erro temporário preserva campos detalhados e uma tentativa explícita pode salvar', async ({ page }) => {
  await fixture(page);
  let writes = 0;
  await page.route(`**/api/projects/${projectId}`, route => {
    if (route.request().method() === 'PUT') return route.fulfill({ status: ++writes === 1 ? 503 : 200, json: writes === 1 ? { error: 'Serviço indisponível.' } : { project } });
    return route.fulfill({ json: { project: { ...project, draft }, assessments: [] } });
  });
  await page.goto(`/projetos/${projectId}`);
  await page.getByRole('button', { name: 'Aprofundar avaliação', exact: true }).click();
  const client = page.getByLabel('Cliente ideal (ICP)', { exact: true });
  await client.fill('Público fictício que precisa organizar documentos');
  await page.getByRole('button', { name: 'Salvar rascunho', exact: true }).first().click();
  await expect(page.getByRole('alert')).toBeFocused();
  await expect(client).toHaveValue('Público fictício que precisa organizar documentos');
  await expect(page.getByText('Suas respostas continuam nesta tela. Não feche nem recarregue antes de salvar.', { exact: true })).toBeVisible();
  expect(writes).toBe(1);
  await page.getByRole('button', { name: 'Salvar rascunho', exact: true }).first().click();
  await expect(page.getByText('Rascunho privado salvo.', { exact: true })).toBeVisible();
  await expect(page.getByRole('alert')).toHaveCount(0);
  expect(writes).toBe(2);
});

test('uma gravação pendente bloqueia edição para não marcar alterações posteriores como salvas', async ({ page }) => {
  await fixture(page);
  let release!: () => void;
  let started!: () => void;
  const waiting = new Promise<void>(resolve => { release = resolve; });
  const received = new Promise<void>(resolve => { started = resolve; });
  await page.route(`**/api/projects/${projectId}`, async route => {
    if (route.request().method() === 'PUT') { started(); await waiting; return route.fulfill({ json: { project } }); }
    return route.fulfill({ json: { project: { ...project, draft }, assessments: [] } });
  });
  await page.goto(`/projetos/${projectId}`);
  await page.getByRole('button', { name: 'Aprofundar avaliação', exact: true }).click();
  const client = page.getByLabel('Cliente ideal (ICP)', { exact: true });
  await client.fill('Resposta sintética a salvar');
  await Promise.all([received, page.getByRole('button', { name: 'Salvar rascunho', exact: true }).first().click()]);
  try {
    await expect(client).toBeDisabled();
    await expect(page.getByRole('button', { name: 'Voltar ao guia simples', exact: false })).toBeDisabled();
  } finally { release(); }
  await expect(page.getByText('Rascunho privado salvo.', { exact: true })).toBeVisible();
  await expect(client).toBeEnabled();
  await client.fill('Nova edição sintética depois de salvar');
  await expect(page.locator('.saved-label')).toContainText('Alterações não salvas');
});

test('o salvamento anterior à assistência opcional também bloqueia edições concorrentes', async ({ page }) => {
  await fixture(page);
  let release!: () => void;
  let started!: () => void;
  const waiting = new Promise<void>(resolve => { release = resolve; });
  const received = new Promise<void>(resolve => { started = resolve; });
  await page.route(`**/api/projects/${projectId}`, async route => {
    if (route.request().method() === 'PUT') { started(); await waiting; return route.fulfill({ json: { project } }); }
    return route.fulfill({ json: { project: { ...project, draft }, assessments: [] } });
  });
  await page.route('**/api/analysis', route => route.fulfill({ status: 403, json: { error: 'SYNTHETIC_DISABLED_PROVIDER' } }));
  await page.goto(`/projetos/${projectId}`);
  await page.getByRole('button', { name: 'Aprofundar avaliação', exact: true }).click();
  await page.getByLabel('Cliente ideal (ICP)', { exact: true }).fill('Contexto fictício antes da assistência');
  const experiments = page.getByRole('button', { name: /Plano de experimentos/ });
  await experiments.click();
  await page.getByRole('checkbox', { name: /^Autorizo enviar o contexto mínimo/ }).check();
  await Promise.all([received, page.getByRole('button', { name: 'Solicitar sugestões opcionais', exact: true }).click()]);
  try {
    await expect(page.getByRole('button', { name: /Projeto e canvas/ })).toBeDisabled();
    await expect(page.getByRole('button', { name: 'Definir próximo experimento', exact: true })).toBeDisabled();
  } finally { release(); }
  await expect(page.getByRole('alert')).toContainText('A avaliação manual continua disponível.');
  await expect(page.getByRole('button', { name: /Projeto e canvas/ })).toBeEnabled();
  await page.getByRole('button', { name: /Projeto e canvas/ }).click();
  await page.getByLabel('Cliente ideal (ICP)', { exact: true }).fill('Nova edição fictícia depois da assistência');
  await expect(page.locator('.saved-label')).toContainText('Alterações não salvas');
});

test('login recusado explica recuperação e preserva o e-mail sem diagnóstico bruto', async ({ page }) => {
  await fixture(page, false);
  await page.goto('/conta');
  await page.getByLabel('E-mail', { exact: true }).fill('fixture@example.invalid');
  await page.getByLabel('Senha', { exact: true }).fill('Synthetic-Only-123!');
  await page.getByRole('button', { name: 'Entrar nos meus projetos', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('recupere sua senha');
  await expect(page.getByRole('alert')).toBeFocused();
  await expect(page.getByLabel('E-mail', { exact: true })).toHaveValue('fixture@example.invalid');
  await expect(page.getByText('Provider diagnostics must not be shown', { exact: true })).toHaveCount(0);
  await page.getByRole('button', { name: 'Esqueci minha senha', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Enviar recuperação', exact: true })).toBeVisible();
  await expect(page.getByLabel('E-mail', { exact: true })).toHaveValue('fixture@example.invalid');
});

test('recuperação cabe em tela estreita e reflow equivalente a zoom de 200%', async ({ page }) => {
  await fixture(page);
  await page.route(`**/api/projects/${projectId}`, route => route.fulfill({ status: 503, json: { error: 'Não foi possível consultar o projeto. Tente novamente.' } }));
  await page.goto(`/projetos/${projectId}`);
  for (const width of [640, 375, 320]) {
    await page.setViewportSize({ width, height: 900 });
    await expect(page.getByRole('button', { name: 'Tentar abrir novamente', exact: true })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).toBe(true);
  }
});
