import { authorize, handle, json, readJson, requireProject } from "@/lib/supabase/server";
import { allProjectRows, projectUpdateSchema, saveProject } from "@/lib/supabase/projects";

type Context = { params: Promise<{ id: string }> };
export async function GET(request: Request, context: Context) {
  return handle(async () => {
    const auth = await authorize(request);
    const { id } = await context.params;
    const project = await requireProject(auth, id);
    const [assessments, experiments, evidence] = await Promise.all([allProjectRows(auth, "oaas_assessments", id), allProjectRows(auth, "oaas_experiments", id), allProjectRows(auth, "oaas_evidence", id)]);
    return json({ project, assessments, experiments, evidence });
  });
}
export async function PUT(request: Request, context: Context) {
  return handle(async () => {
    const auth = await authorize(request);
    const { id } = await context.params;
    await requireProject(auth, id);
    const input = await readJson(request, projectUpdateSchema);
    const project = await saveProject(auth, { ...input, id }, false);
    return json({ project });
  });
}
export async function DELETE(request: Request, context: Context) {
  return handle(async () => {
    const auth = await authorize(request);
    const { id } = await context.params;
    await requireProject(auth, id);
    const { error } = await auth.client.from("oaas_projects").delete().eq("id", id).eq("owner_id", auth.userId);
    if (error) throw error;
    return json({ deleted: true });
  });
}
