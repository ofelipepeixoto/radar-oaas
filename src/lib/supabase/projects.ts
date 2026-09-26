import { z } from "zod";
import { assessmentInputSchema, createEmptyAssessment, stageSchema, type AssessmentInput } from "@/domain/framework/schema";
import { ApiError, type AuthContext } from "./server";

export const projectCreateSchema = z.object({ name: z.string().trim().min(1).max(160), stage: stageSchema.default("idea"), draft: assessmentInputSchema.optional() }).strict();
export const projectUpdateSchema = z.object({ name: z.string().trim().min(1).max(160), stage: stageSchema, draft: assessmentInputSchema }).strict();

export async function saveProject(auth: AuthContext, input: { id: string; name: string; stage: z.infer<typeof stageSchema>; draft?: AssessmentInput }, create: boolean) {
  // IDs and owner are server-assigned. Body schema rejects owner_id and unknown fields.
  const draft = input.draft ?? createEmptyAssessment(input.id, input.stage);
  if (!create && (draft.projectId !== input.id || draft.stage !== input.stage)) throw new ApiError(400, "Projeto e estágio do rascunho precisam corresponder ao cadastro.");
  const normalized = assessmentInputSchema.parse({ ...draft, projectId: input.id, stage: input.stage });
  const { data, error } = await auth.client.rpc("oaas_save_project", {
    p_id: input.id, p_name: input.name, p_stage: input.stage, p_draft: normalized, p_create: create,
  });
  if (error) throw new ApiError(error.code === "42501" ? 404 : 503, error.code === "42501" ? "Projeto não encontrado." : "Não foi possível salvar o projeto. Seus dados continuam no formulário.");
  return data;
}

/** Exports cannot silently truncate a project's history. */
export async function allProjectRows(auth: AuthContext, table: "oaas_assessments" | "oaas_experiments" | "oaas_evidence" | "oaas_audit_events", projectId: string) {
  const rows: Record<string, unknown>[] = [];
  for (let start = 0; ; start += 500) {
    const { data, error } = await auth.client.from(table).select("*").eq("project_id", projectId).eq("owner_id", auth.userId).order("created_at").order(table === "oaas_evidence" ? "evidence_id" : "id").range(start, start + 499);
    if (error) throw new ApiError(503, "Não foi possível consultar todos os registros do projeto.");
    rows.push(...data);
    if (data.length < 500) return rows;
  }
}
