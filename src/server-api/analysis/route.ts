import { z } from "zod";
import { assessmentInputSchema } from "@/domain/framework/schema";
import { runAnalysis } from "@/lib/ai/service";
import { createAnalysisProvider } from "@/lib/ai/server";
import { ApiError, authorize, handle, json, readJson, requireProject } from "@/lib/supabase/server";


const requestSchema = z.object({
  projectId: z.string().uuid(),
  evidenceIds: z.array(z.string().min(1).max(100)).max(30),
  consent: z.boolean(),
}).strict();

export async function POST(request: Request) {
  return handle(async () => {
    const auth = await authorize(request);
    const body = await readJson(request, requestSchema);
    const row = await requireProject(auth, body.projectId);
    const parsed = assessmentInputSchema.safeParse(row.draft);
    if (!parsed.success) throw new ApiError(409, "Revise e salve o projeto antes de solicitar sugestões.");
    const selectedIds = new Set(body.evidenceIds);
    if (selectedIds.size !== body.evidenceIds.length || body.evidenceIds.some(id => !parsed.data.evidence.some(evidence => evidence.id === id))) {
      throw new ApiError(400, "Selecione apenas evidências existentes neste projeto.");
    }
    const draft = parsed.data;
    const result = await runAnalysis({
      projectId: row.id,
      context: JSON.stringify({ stage: draft.stage, outcome: draft.canvas.outcome, acceptance: draft.canvas.acceptance }),
      evidence: draft.evidence.filter(item => selectedIds.has(item.id)).map(item => ({
        id: item.id,
        excerpt: `Tipo: ${item.type}\nData: ${item.date}\nPeríodo: ${item.period}\nAfirmação: ${item.claim}\nDescrição: ${item.description}`,
      })),
      consent: body.consent,
    }, createAnalysisProvider(), {
      userId: auth.userId,
      authorizedProjectId: row.id,
      quota: { async reserve(userId, reservedTokens) {
        if (userId !== auth.userId) return false;
        const { data, error } = await auth.client.rpc("oaas_reserve_ai_call", { p_reserved_tokens: reservedTokens });
        if (error) throw new Error("quota_unavailable");
        return data === true;
      } },
    });
    // Metadata only: neither prompt, selected excerpts nor generated text enter the audit log.
    const { error } = await auth.client.from("oaas_audit_events").insert({
      project_id: row.id,
      owner_id: auth.userId,
      event_type: "ai.suggestion",
      metadata: { ...result.metadata, status: result.status, reason: result.reason ?? null, simulated: result.simulated },
    });
    if (error) throw new ApiError(503, "Não foi possível registrar a assistência. Seus dados permanecem preservados; continue a avaliação manual.");
    return json(result);
  });
}
