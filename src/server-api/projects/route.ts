import { authorize, handle, json, readJson } from "@/lib/supabase/server";
import { projectCreateSchema, saveProject } from "@/lib/supabase/projects";

export async function GET(request: Request) {
  return handle(async () => {
    const auth = await authorize(request);
    const { data, error } = await auth.client.from("oaas_projects").select("*").eq("owner_id", auth.userId).order("updated_at", { ascending: false }).limit(100);
    if (error) throw error;
    return json({ projects: data });
  });
}

export async function POST(request: Request) {
  return handle(async () => {
    const auth = await authorize(request);
    const input = await readJson(request, projectCreateSchema);
    const project = await saveProject(auth, { ...input, id: crypto.randomUUID() }, true);
    return json({ project }, 201);
  });
}
