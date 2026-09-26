import { z } from "zod";
import { assessmentInputSchema } from "@/domain/framework/schema";
import { createSnapshot } from "@/domain/framework/snapshots";
import { allProjectRows } from "@/lib/supabase/projects";
import { ApiError, authorize, handle, json, readJson, requireProject } from "@/lib/supabase/server";

type Context = { params: Promise<{ id: string }> };
export async function GET(request: Request, context: Context) {
  return handle(async () => { const auth = await authorize(request); const { id } = await context.params; await requireProject(auth, id); return json({ assessments: await allProjectRows(auth, "oaas_assessments", id) }); });
}
export async function POST(request: Request, context: Context) {
  return handle(async () => {
    const auth = await authorize(request);
    const { id } = await context.params;
    const project = await requireProject(auth, id);
    const { draft } = await readJson(request, z.object({ draft: assessmentInputSchema }).strict());
    if (draft.projectId !== id || draft.stage !== project.stage) throw new ApiError(400, "Salve o rascunho no projeto e estágio corretos antes de finalizar.");
    // Ignore any purported result from the browser. Recompute with versioned domain rules.
    const snapshot = createSnapshot(draft, { id: crypto.randomUUID(), author: auth.userId, createdAt: new Date().toISOString() });
    const { data, error } = await auth.client.rpc("oaas_finalize_assessment", { p_project_id: id, p_snapshot: snapshot });
    if (error) throw new ApiError(503, "Não foi possível registrar a avaliação. Tente novamente.");
    return json({ assessment: data }, 201);
  });
}
