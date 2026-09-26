import { allProjectRows } from "@/lib/supabase/projects";
import { authorize, handle, requireProject } from "@/lib/supabase/server";

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  return handle(async () => {
    const auth = await authorize(request);
    const { id } = await context.params;
    const project = await requireProject(auth, id);
    const [assessments, experiments, evidence, auditEvents] = await Promise.all([allProjectRows(auth, "oaas_assessments", id), allProjectRows(auth, "oaas_experiments", id), allProjectRows(auth, "oaas_evidence", id), allProjectRows(auth, "oaas_audit_events", id)]);
    return new Response(JSON.stringify({ exportVersion: "1", exportedAt: new Date().toISOString(), project, assessments, experiments, evidence, auditEvents }, null, 2), {
      headers: { "Content-Type": "application/json; charset=utf-8", "Content-Disposition": `attachment; filename="radar-oaas-${id}.json"`, "Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff", "Content-Security-Policy": "default-src 'none'" },
    });
  });
}
