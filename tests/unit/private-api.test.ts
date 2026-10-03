import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { privateApi, PrivateApiError } from '../../src/components/private-api';
import { createBrowserClient } from '../../src/lib/supabase/client';
import { authFailureMessage } from '../../src/lib/auth-feedback';
import { readCreatedProject, readProjectsResponse } from '../../src/components/private-response';

vi.mock('../../src/lib/supabase/client', () => ({ createBrowserClient: vi.fn() }));
const getSession = vi.fn();
const fetchMock = vi.fn();
beforeEach(() => {
  vi.mocked(createBrowserClient).mockReturnValue({ auth: { getSession } } as unknown as NonNullable<ReturnType<typeof createBrowserClient>>);
  getSession.mockResolvedValue({ data: { session: { access_token: 'synthetic-session' } }, error: null });
  vi.stubGlobal('fetch', fetchMock);
});
afterEach(() => { vi.resetAllMocks(); vi.unstubAllGlobals(); });

describe('Private request recovery boundary', () => {
  it('does not call the network without a configured client or session', async () => {
    vi.mocked(createBrowserClient).mockReturnValue(null);
    await expect(privateApi('/api/projects')).rejects.toMatchObject({ status: 503 });
    vi.mocked(createBrowserClient).mockReturnValue({ auth: { getSession } } as unknown as NonNullable<ReturnType<typeof createBrowserClient>>);
    getSession.mockResolvedValue({ data: { session: null }, error: null });
    await expect(privateApi('/api/projects')).rejects.toMatchObject({ status: 401 });
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it('turns a rejected session lookup into a recovery error without diagnostics', async () => {
    getSession.mockRejectedValue(new Error('sensitive diagnostic must not reach the UI'));
    await expect(privateApi('/api/projects')).rejects.toMatchObject({ status: 401, message: expect.not.stringContaining('sensitive') });
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it.each([401, 403, 404, 429, 503])('keeps HTTP %i for a suitable next action even if the service returns HTML', async status => {
    fetchMock.mockResolvedValue(new Response('<html>provider diagnostics</html>', { status }));
    await expect(privateApi('/api/projects')).rejects.toMatchObject({ status, message: expect.not.stringContaining('diagnostics') });
  });
  it('does not repeat an uncertain write and suppresses raw network errors', async () => {
    fetchMock.mockRejectedValue(new Error('URL with credential and request details'));
    await expect(privateApi('/api/projects', 'POST', { name: 'Synthetic' })).rejects.toMatchObject({ status: null, message: 'Não conseguimos confirmar a resposta do serviço.' });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
  it('never renders arbitrary JSON error diagnostics and keeps a friendly conflict message', async () => {
    const diagnostic = 'SYNTHETIC_SENSITIVE_DIAGNOSTIC';
    for (const status of [400, 409, 413, 415, 429, 503]) {
      fetchMock.mockResolvedValueOnce(Response.json({ error: diagnostic }, { status }));
      await expect(privateApi('/api/projects/synthetic', 'PUT', { name: 'Synthetic' })).rejects.toMatchObject({ status, message: expect.not.stringContaining(diagnostic) });
    }
    fetchMock.mockResolvedValueOnce(Response.json({ error: diagnostic }, { status: 409 }));
    await expect(privateApi('/api/projects/synthetic')).rejects.toMatchObject({ status: 409, message: expect.stringContaining('versão salva') });
  });
  it('sends the session only in the authorization header with a bounded request', async () => {
    fetchMock.mockResolvedValue(Response.json({ projects: [] }));
    await expect(privateApi('/api/projects')).resolves.toEqual({ projects: [] });
    const [path, options] = fetchMock.mock.calls[0];
    expect(path).toBe('/api/projects');
    expect(options.headers).toEqual({ Authorization: 'Bearer synthetic-session' });
    expect(options.signal).toBeInstanceOf(AbortSignal);
  });
  it('keeps a denied project hidden and rejects malformed successful responses', async () => {
    fetchMock.mockResolvedValueOnce(Response.json({ error: 'Projeto não encontrado.' }, { status: 404 }));
    await expect(privateApi('/api/projects/synthetic')).rejects.toEqual(new PrivateApiError('Projeto não encontrado.', 404));
    fetchMock.mockResolvedValueOnce(new Response('invalid', { status: 200 }));
    await expect(privateApi('/api/projects')).rejects.toBeInstanceOf(PrivateApiError);
  });
});

describe('Auth feedback', () => {
  it('explains invalid credentials without exposing provider details', () => {
    expect(authFailureMessage({ code: 'invalid_credentials', message: 'Provider detail' })).toContain('recupere sua senha');
    expect(authFailureMessage(new Error('Provider detail'))).not.toContain('Provider detail');
  });
  it('distinguishes confirmation and throttling without claiming account existence', () => {
    expect(authFailureMessage({ code: 'email_not_confirmed' })).toContain('Confirme seu cadastro');
    expect(authFailureMessage({ code: 'over_email_send_rate_limit' })).toContain('Aguarde');
  });
});

describe('Private successful responses', () => {
  it('rejects malformed project data before navigation or list state changes', () => {
    for (const value of [{}, { projects: null }, { projects: [{}] }]) {
      expect(() => readProjectsResponse(value)).toThrow(PrivateApiError);
    }
    expect(() => readCreatedProject({})).toThrow(PrivateApiError);
    expect(() => readCreatedProject({ project: { id: 'not-an-id' } })).toThrow(PrivateApiError);
    expect(readProjectsResponse({ projects: [] })).toEqual([]);
    expect(readCreatedProject({ project: { id: '11111111-1111-4111-8111-111111111111' } })).toEqual({ id: '11111111-1111-4111-8111-111111111111' });
  });
});
