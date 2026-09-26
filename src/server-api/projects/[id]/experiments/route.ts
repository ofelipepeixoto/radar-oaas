import { z } from "zod";
import { experimentSchema } from "@/domain/framework/schema";
import { allProjectRows } from "@/lib/supabase/projects";
import { authorize, handle, json, readJson, requireProject } from "@/lib/supabase/server";

type Context = { params: Promise<{ id: string }> };
export async function GET(request: Request, context: Context) {
  return handle(async () => { const auth = await authorize(request); const { id } = await context.params; await requireProject(auth, id); return json({ experiments: await allProjectRows(auth, "oaas_experiments", id) }); });
}
export async function POST(request: Request, context: Context) {
  return handle(async () => {
    const auth = await authorize(request);
    const { id } = await context.params;
    await requireProject(auth, id);
    const input = await readJson(request, z.object({ experiment: experimentSchema }).strict());
    const { data, error } = await auth.client.from("oaas_experiments").insert({ project_id: id, owner_id: auth.userId, payload: input.experiment }).select("*").single();
    if (error) throw error;
    return json({ experiment: data }, 201);
  });
}
