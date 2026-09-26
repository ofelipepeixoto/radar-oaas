import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";
import { readSupabaseConfig } from "./config";

export class ApiError extends Error {
  constructor(public status: number, message: string) { super(message); }
}

export type AuthContext = { client: SupabaseClient; userId: string };

/** Each request uses its own client and a user JWT. No administrative key. */
export async function authorize(request: Request): Promise<AuthContext> {
  const config = readSupabaseConfig();
  if (!config) throw new ApiError(503, "Modo privado indisponível: configure autenticação e banco de dados.");
  const authorization = request.headers.get("authorization") ?? "";
  const match = /^Bearer ([A-Za-z0-9_.-]+)$/.exec(authorization);
  if (!match || match[1].length > 8192) throw new ApiError(401, "Entre na sua conta para continuar.");
  const client = createClient(config.url, config.key, {
    global: { headers: { Authorization: authorization } },
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
  const { data, error } = await client.auth.getUser(match[1]);
  if (error || !data.user || data.user.is_anonymous) throw new ApiError(401, "Sessão inválida ou expirada. Entre novamente.");
  return { client, userId: data.user.id };
}

export async function readJson<T>(request: Request, schema: z.ZodType<T>): Promise<T> {
  if (!request.headers.get("content-type")?.toLowerCase().startsWith("application/json")) {
    throw new ApiError(415, "Envie os dados no formato JSON.");
  }
  if (!request.body) throw new ApiError(400, "Corpo da solicitação ausente.");
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > 512_000) { await reader.cancel(); throw new ApiError(413, "O projeto excede o limite de 500 KB por gravação."); }
      chunks.push(value);
    }
    const buffer = new Uint8Array(size);
    let offset = 0;
    for (const chunk of chunks) { buffer.set(chunk, offset); offset += chunk.byteLength; }
    const parsed = schema.safeParse(JSON.parse(new TextDecoder().decode(buffer)));
    if (!parsed.success) throw new ApiError(400, "Dados inválidos. Verifique campos, limites e referências do projeto.");
    return parsed.data;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(400, "JSON inválido.");
  } finally { reader.releaseLock(); }
}

export function parseId(id: string): string {
  if (!z.string().uuid().safeParse(id).success) throw new ApiError(404, "Projeto não encontrado.");
  return id;
}

export async function requireProject(auth: AuthContext, id: string) {
  const { data, error } = await auth.client.from("oaas_projects").select("*").eq("id", parseId(id)).eq("owner_id", auth.userId).maybeSingle();
  if (error) throw new ApiError(503, "Não foi possível consultar o projeto. Tente novamente.");
  if (!data) throw new ApiError(404, "Projeto não encontrado.");
  return data;
}

export function json(data: unknown, status = 200): Response {
  return Response.json(data, { status, headers: { "Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff" } });
}

export async function handle(action: () => Promise<Response>): Promise<Response> {
  try { return await action(); } catch (error) {
    // Do not log tokens, payloads, or database error details.
    return json({ error: error instanceof ApiError ? error.message : "Não foi possível concluir a solicitação. Tente novamente." }, error instanceof ApiError ? error.status : 500);
  }
}
