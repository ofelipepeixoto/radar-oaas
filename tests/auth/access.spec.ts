import { randomUUID } from 'node:crypto';
import { createClient } from '@supabase/supabase-js';
import { expect, test, type BrowserContext, type Page } from '@playwright/test';

const appOrigin = 'http://127.0.0.1:3000';
const localOnly = (value: string | undefined): string => {
  if (!value) throw new Error('Disposable local Auth test configuration is missing.');
  const url = new URL(value);
  if (url.protocol !== 'http:' || !['127.0.0.1', 'localhost', '[::1]'].includes(url.hostname) || url.username || url.password) {
    throw new Error('Auth tests refuse non-local endpoints.');
  }
  return url.origin;
};
const supabaseOrigin = localOnly(process.env.SUPABASE_TEST_URL);
const mailOrigin = localOnly(process.env.SUPABASE_TEST_MAIL_URL);
const publicKey = process.env.SUPABASE_TEST_ANON_KEY!;
const authOptions = { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false };
type Session = { token: string; userId: string };
type Mail = { ID: string; To: Array<{ Address: string }> };

async function session(page: Page): Promise<Session | null> {
  return page.evaluate(() => {
    for (const key of Object.keys(localStorage)) {
      if (!/^sb-.*-auth-token$/.test(key)) continue;
      try {
        const value = JSON.parse(localStorage.getItem(key) ?? 'null');
        if (typeof value?.access_token === 'string' && typeof value?.user?.id === 'string') {
          return { token: value.access_token, userId: value.user.id };
        }
      } catch { /* A malformed storage value is not a session. */ }
    }
    return null;
  });
}

async function authenticated(page: Page): Promise<Session> {
  await expect.poll(async () => Boolean(await session(page)), { message: 'A confirmed browser session must exist.' }).toBe(true);
  const value = await session(page);
  if (!value) throw new Error('The browser has no authenticated session.');
  return value;
}

// Mailpit API v1: https://mailpit.axllent.org/docs/api-v1/
// Read only the synthetic recipient's messages. Never release mail externally.
async function emailLink(email: string, type: 'signup' | 'recovery'): Promise<string> {
  let result = '';
  await expect.poll(async () => {
    try {
      const list = await fetch(`${mailOrigin}/api/v1/messages?limit=100`, { signal: AbortSignal.timeout(3000) });
      if (!list.ok) return false;
      const { messages } = await list.json() as { messages: Mail[] };
      for (const message of messages ?? []) {
        if (!message.To?.some(recipient => recipient.Address.toLowerCase() === email)) continue;
        const response = await fetch(`${mailOrigin}/api/v1/message/${encodeURIComponent(message.ID)}`, { signal: AbortSignal.timeout(3000) });
        if (!response.ok) continue;
        const detail = await response.json() as { HTML?: string; Text?: string };
        const text = `${detail.HTML ?? ''}\n${detail.Text ?? ''}`.replaceAll('&amp;', '&');
        for (const candidate of text.match(/https?:\/\/[^\s"'<>]+/g) ?? []) {
          const url = new URL(candidate);
          if (url.origin !== supabaseOrigin || url.pathname !== '/auth/v1/verify' || url.searchParams.get('type') !== type) continue;
          const redirect = new URL(url.searchParams.get('redirect_to') ?? '');
          if (redirect.origin !== appOrigin || redirect.pathname !== (type === 'signup' ? '/projetos' : '/conta/redefinir')) {
            throw new Error('The local confirmation or recovery redirect does not match the application.');
          }
          result = url.href;
          return true;
        }
      }
      return false;
    } catch { return false; }
  }, { timeout: 30_000, intervals: [250, 500, 1000], message: `A local ${type} email with the application's allowed redirect must arrive.` }).toBe(true);
  return result;
}

async function followEmail(page: Page, email: string, type: 'signup' | 'recovery', progress?: (detail: string) => void) {
  progress?.('waiting for the local confirmation email');
  const link = await emailLink(email, type);
  progress?.('following the local confirmation link');
  // A navigation error can contain a one-time token; replace it with a safe diagnostic.
  try { await page.goto(link); } catch { throw new Error(`Could not follow the local ${type} email.`); }
  progress?.('checking the confirmation redirect path');
  await expect.poll(() => new URL(page.url()).pathname).toBe(type === 'signup' ? '/projetos' : '/conta/redefinir');
}

async function signUp(page: Page, email: string, password: string, createdUsers: Set<string>, progress: (detail: string) => void) {
  progress('opening the account page');
  await page.goto('/conta');
  progress('opening the signup form');
  await page.getByRole('button', { name: 'Criar conta', exact: true }).click();
  progress('filling the synthetic email');
  await page.getByLabel('E-mail', { exact: true }).fill(email);
  progress('filling the password field');
  // The signup label also contains the password guidance text in a <small>.
  await page.getByLabel(/^Senha/).fill(password);
  progress('submitting the signup request');
  const [response] = await Promise.all([
    page.waitForResponse(response => new URL(response.url()).pathname === '/auth/v1/signup', { timeout: 15_000 }),
    page.getByRole('button', { name: 'Criar conta privada', exact: true }).click(),
  ]);
  progress('checking signup response and confirmation requirement');
  expect(response.status(), 'Local signup must succeed.').toBe(200);
  const body = await response.json() as { id?: string; user?: { id: string }; access_token?: string };
  const id = body.user?.id ?? body.id;
  if (id) createdUsers.add(id);
  expect(Boolean(body.access_token), 'Email confirmation must precede session issuance.').toBe(false);
  progress('checking the confirmation notice and absent session');
  await expect(page.getByRole('status')).toContainText('Confira seu e-mail');
  expect(Boolean(await session(page)), 'Unconfirmed signup must not authenticate the browser.').toBe(false);
  await followEmail(page, email, 'signup', progress);
  progress('opening the private projects page after confirmation');
  await expect(page.getByRole('heading', { name: 'Meus projetos', exact: true })).toBeVisible();
  const signed = await authenticated(page);
  createdUsers.add(signed.userId);
  return signed;
}

async function login(page: Page, email: string, password: string) {
  await page.goto('/conta');
  await page.getByLabel('E-mail', { exact: true }).fill(email);
  await page.getByLabel('Senha', { exact: true }).fill(password);
  await page.getByRole('button', { name: 'Entrar nos meus projetos', exact: true }).click();
}

async function api(method: string, path: string, token?: string, body?: unknown) {
  return fetch(`${appOrigin}${path}`, {
    method,
    // Browser fetch includes Origin for unsafe methods. Preserve Astro's CSRF check.
    headers: { Origin: appOrigin, ...(token ? { Authorization: `Bearer ${token}` } : {}), ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}) },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    signal: AbortSignal.timeout(10_000),
  });
}

test('duas contas: cadastro confirmado, HTTP e RLS isolados, recuperação e saída', async ({ browser }) => {
  const contexts: BrowserContext[] = [];
  const createdUsers = new Set<string>();
  const admin = createClient(supabaseOrigin, process.env.SUPABASE_TEST_SERVICE_ROLE_KEY!, { auth: authOptions });
  const suffix = randomUUID();
  const emailA = `oaas-browser-a-${suffix}@example.invalid`;
  const emailB = `oaas-browser-b-${suffix}@example.invalid`;
  const password = `Local-${randomUUID()}-Aa9!`;
  const newPassword = `Changed-${randomUUID()}-Bb8!`;
  let stage = 'local prerequisites';
  let failure: Error | undefined;
  try {
    const contextA = await browser.newContext({ baseURL: appOrigin });
    const contextB = await browser.newContext({ baseURL: appOrigin });
    contexts.push(contextA, contextB);
    for (const context of contexts) {
      context.setDefaultTimeout(15_000);
      context.setDefaultNavigationTimeout(20_000);
      await context.route('**/*', route => {
        const origin = new URL(route.request().url()).origin;
        return [appOrigin, supabaseOrigin].includes(origin) ? route.continue() : route.abort();
      });
    }
    const pageA = await contextA.newPage();
    const pageB = await contextB.newPage();

    stage = 'account A signup and email confirmation';
    const identityA = await signUp(pageA, emailA, password, createdUsers, detail => { stage = `account A signup: ${detail}`; });
    stage = 'account B signup and email confirmation';
    const identityB = await signUp(pageB, emailB, password, createdUsers, detail => { stage = `account B signup: ${detail}`; });
    expect(identityA.userId === identityB.userId, 'The contexts must own distinct accounts.').toBe(false);

    stage = 'account A private creation, save and reload through Astro HTTP';
    await pageA.getByRole('button', { name: '+ Novo projeto', exact: true }).click();
    await pageA.getByLabel('Nome do novo projeto (opcional)', { exact: true }).fill('Projeto sintético privado A');
    await pageA.getByRole('button', { name: 'Começar o guia', exact: true }).click();
    await expect(pageA.getByRole('heading', { level: 1, name: 'Para quem é a sua ideia?', exact: true })).toBeVisible();
    await pageA.getByRole('radio', { name: 'Pequenas empresas', exact: true }).check();
    await pageA.getByRole('button', { name: 'Continuar', exact: true }).click();
    await expect(pageA.getByRole('heading', { level: 1, name: 'O que você quer melhorar?', exact: true })).toBeVisible();
    await pageA.reload();
    await expect(pageA.getByRole('heading', { level: 1, name: 'O que você quer melhorar?', exact: true })).toBeVisible();
    expect(await pageA.evaluate(() => localStorage.getItem('radar-oaas.guided-demo.v1'))).toBeNull();
    await pageA.getByRole('button', { name: 'Voltar', exact: true }).click();
    await expect(pageA.getByRole('radio', { name: 'Pequenas empresas', exact: true })).toBeChecked();
    await pageA.getByRole('button', { name: 'Aprofundar avaliação', exact: true }).click();
    await expect(pageA.getByLabel('Nome do projeto', { exact: true })).toHaveValue('Projeto sintético privado A');
    const projectId = new URL(pageA.url()).pathname.split('/').pop()!;
    expect(/^[0-9a-f-]{36}$/.test(projectId)).toBe(true);
    await pageA.getByLabel('Cliente ideal (ICP)', { exact: true }).fill('Cliente fictício restrito à conta A');
    await pageA.getByRole('button', { name: 'Salvar rascunho', exact: true }).first().click();
    await expect(pageA.getByText('Rascunho privado salvo.', { exact: true })).toBeVisible();
    await pageA.reload();
    await pageA.getByRole('button', { name: 'Aprofundar avaliação', exact: true }).click();
    await expect(pageA.getByLabel('Cliente ideal (ICP)', { exact: true })).toHaveValue('Cliente fictício restrito à conta A');
    const bundleResponse = await api('GET', `/api/projects/${projectId}`, identityA.token);
    expect(bundleResponse.status).toBe(200);
    const bundle = await bundleResponse.json();
    expect(bundle.project.draft.guidedIntake).toMatchObject({ version: 1, step: 0, answers: { audience: 'small_business' } });

    stage = 'account B has its own working project and cannot access account A';
    const ownB = await api('POST', '/api/projects', identityB.token, { name: 'Projeto sintético privado B', stage: 'idea' });
    expect(ownB.status).toBe(201);
    await pageB.reload();
    await expect(pageB.getByRole('heading', { name: 'Projeto sintético privado B', exact: true })).toBeVisible();
    await expect(pageB.getByText('Projeto sintético privado A', { exact: true })).toHaveCount(0);
    const foreignRequests: Array<[string, string, unknown?]> = [
      ['GET', `/api/projects/${projectId}`],
      ['PUT', `/api/projects/${projectId}`, { name: 'Forbidden', stage: 'idea', draft: bundle.project.draft }],
      ['DELETE', `/api/projects/${projectId}`],
      ['GET', `/api/projects/${projectId}/export`],
      ['POST', `/api/projects/${projectId}/assessments`, { draft: bundle.project.draft }],
      ['POST', `/api/projects/${projectId}/experiments`, {}],
    ];
    for (const [method, path, body] of foreignRequests) {
      const denied = await api(method, path, identityB.token, body);
      expect(denied.status, `${method} on another account's resource must be hidden.`).toBe(404);
      expect(denied.headers.get('cache-control')).toContain('no-store');
      const payload = await denied.json();
      expect(Object.hasOwn(payload, 'project')).toBe(false);
    }
    await pageB.goto(`/projetos/${projectId}`);
    await expect(pageB.getByRole('alert')).toHaveText('Projeto não encontrado.');
    await expect(pageB.getByLabel('Cliente ideal (ICP)', { exact: true })).toHaveCount(0);

    stage = 'PostgREST ownership and anonymous or forged token rejection';
    const restB = createClient(supabaseOrigin, publicKey, {
      auth: authOptions, global: { headers: { Authorization: `Bearer ${identityB.token}` } },
    });
    const hidden = await restB.from('oaas_projects').select('id').eq('id', projectId);
    expect(Boolean(hidden.error)).toBe(false);
    expect(hidden.data).toEqual([]);
    for (const owner of [identityA.userId, identityB.userId]) {
      const forged = await restB.from('oaas_experiments').insert({ project_id: projectId, owner_id: owner, payload: {} });
      expect(Boolean(forged.error), 'RLS or the composite foreign key must reject a cross-owner child.').toBe(true);
    }
    expect((await api('GET', '/api/projects')).status).toBe(401);
    expect((await api('GET', '/api/projects', `${identityA.token.slice(0, -12)}tamperedtest`)).status).toBe(401);
    expect((await api('POST', '/api/projects', identityB.token, { name: 'Forbidden', owner_id: identityA.userId })).status).toBe(400);

    stage = 'account A still finalizes, exports and deletes its own project';
    const finalized = await api('POST', `/api/projects/${projectId}/assessments`, identityA.token, { draft: bundle.project.draft });
    expect(finalized.status).toBe(201);
    const exported = await api('GET', `/api/projects/${projectId}/export`, identityA.token);
    expect(exported.status).toBe(200);
    const data = await exported.json();
    expect(data.assessments).toHaveLength(1);
    expect(data.project.owner_id === identityA.userId).toBe(true);
    expect((await api('DELETE', `/api/projects/${projectId}`, identityA.token)).status).toBe(200);
    expect((await api('GET', `/api/projects/${projectId}`, identityA.token)).status).toBe(404);

    stage = 'logout removes the browser session and private access';
    await pageA.goto('/projetos');
    await pageA.getByRole('button', { name: 'Sair', exact: true }).click();
    await expect.poll(() => new URL(pageA.url()).pathname).toBe('/conta');
    expect(Boolean(await session(pageA))).toBe(false);
    await pageA.goto('/projetos');
    await expect.poll(() => new URL(pageA.url()).pathname).toBe('/conta');

    stage = 'password recovery email and new password submission';
    await pageA.getByRole('button', { name: 'Esqueci minha senha', exact: true }).click();
    await pageA.getByLabel('E-mail', { exact: true }).fill(emailA);
    await pageA.getByRole('button', { name: 'Enviar recuperação', exact: true }).click();
    await expect(pageA.getByRole('status')).toContainText('você receberá instruções');
    await followEmail(pageA, emailA, 'recovery');
    await pageA.getByLabel('Nova senha', { exact: true }).fill(newPassword);
    await pageA.getByRole('button', { name: 'Atualizar senha', exact: true }).click();
    await expect(pageA.getByText('Senha atualizada.', { exact: true })).toBeVisible();
    await pageA.getByRole('link', { name: 'Ir aos meus projetos', exact: true }).click();
    await pageA.getByRole('button', { name: 'Sair', exact: true }).click();
    await expect.poll(() => new URL(pageA.url()).pathname).toBe('/conta');

    stage = 'old password rejection and real login with the replacement password';
    await login(pageA, emailA, password);
    await expect(pageA.getByRole('alert')).toBeVisible();
    expect(Boolean(await session(pageA))).toBe(false);
    await login(pageA, emailA, newPassword);
    await expect(pageA.getByRole('heading', { name: 'Meus projetos', exact: true })).toBeVisible();
    expect((await authenticated(pageA)).userId === identityA.userId).toBe(true);
    await pageB.goto('/projetos');
    await expect(pageB.getByRole('heading', { name: 'Projeto sintético privado B', exact: true })).toBeVisible();
    for (const page of [pageA, pageB]) {
      await page.getByRole('button', { name: 'Sair', exact: true }).click();
      await expect.poll(() => new URL(page.url()).pathname).toBe('/conta');
      expect(Boolean(await session(page))).toBe(false);
    }
  } catch (error) {
    // Playwright/network errors may embed passwords, Authorization or email link tokens.
    // Retain only a source line and primitive assertion values for actionable diagnostics.
    const line = error instanceof Error ? error.stack?.match(/access\.spec\.ts:(\d+):(\d+)/)?.[1] : undefined;
    const matcher = typeof error === 'object' && error !== null && 'matcherResult' in error
      ? error.matcherResult as { actual?: unknown; expected?: unknown } : undefined;
    const primitive = (value: unknown) => typeof value === 'number' || typeof value === 'boolean' ? String(value) : 'suppressed';
    const assertion = matcher ? ` Expected ${primitive(matcher.expected)}, received ${primitive(matcher.actual)}.` : '';
    failure = new Error(`Disposable Auth verification failed during: ${stage}. Source line ${line ?? 'unavailable'}.${assertion} Sensitive diagnostics were suppressed.`);
  } finally {
    for (const context of contexts) await context.close().catch(() => undefined);
    for (const id of createdUsers) {
      try {
        const removed = await admin.auth.admin.deleteUser(id);
        if (removed.error) failure ??= new Error('Could not remove a synthetic local account. Discard the local instance.');
      } catch { failure ??= new Error('Local account cleanup could not complete. Discard the local instance.'); }
    }
  }
  if (failure) throw failure;
});
