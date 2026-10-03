'use client';
import { createBrowserClient } from '@/lib/supabase/client';

export class PrivateApiError extends Error {
  constructor(message: string, public status: number | null) {
    super(message);
    this.name = 'PrivateApiError';
  }
}

const fallback = (status: number) => {
  switch (status) {
    case 400: return 'Confira os campos, limites e referências do projeto antes de tentar novamente.';
    case 401: return 'Sessão expirada. Entre novamente para acessar seus projetos.';
    case 403: return 'Esta ação não está disponível para sua conta.';
    case 404: return 'Projeto não encontrado.';
    case 409: return 'Não conseguimos concluir esta alteração. Confira a versão salva do projeto antes de repetir.';
    case 413: return 'Este projeto excede o limite de salvamento. Reduza o conteúdo antes de tentar novamente.';
    case 415: return 'Não conseguimos enviar os dados neste formato. Retome pela interface do projeto.';
    case 429: return 'Muitas tentativas em pouco tempo. Aguarde antes de tentar novamente.';
    default: return 'Não foi possível concluir a operação privada. Tente novamente.';
  }
};

/** One bounded request. Writes are never automatically repeated. */
export async function privateApi<T>(path: string, method = 'GET', body?: unknown): Promise<T> {
  const client = createBrowserClient();
  if (!client) throw new PrivateApiError('Modo privado indisponível neste ambiente.', 503);
  let token: string;
  try {
    const { data, error } = await client.auth.getSession();
    if (error || !data.session) throw new Error('No session');
    token = data.session.access_token;
  } catch {
    throw new PrivateApiError(fallback(401), 401);
  }
  let response: Response;
  try {
    response = await fetch(path, {
      method,
      headers: { Authorization: `Bearer ${token}`, ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}) },
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
      signal: AbortSignal.timeout(15_000),
    });
  } catch {
    // Network errors can contain URLs or request details. Do not render them.
    throw new PrivateApiError('Não conseguimos confirmar a resposta do serviço.', null);
  }
  if (!response.ok) {
    // Even an error JSON from the expected route can contain diagnostics from an
    // intermediary. Status controls the local message; bodies are never rendered.
    throw new PrivateApiError(fallback(response.status), response.status);
  }
  try { return await response.json() as T; } catch {
    throw new PrivateApiError('O serviço enviou uma resposta que não conseguimos abrir.', response.status);
  }
}
