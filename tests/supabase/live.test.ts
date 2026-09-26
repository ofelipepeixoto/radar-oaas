import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { GET as listProjects, POST as createProject } from "@/server-api/projects/route";
import { GET as getProject, PUT as updateProject, DELETE as deleteProject } from "@/server-api/projects/[id]/route";
import { POST as finalizeAssessment } from "@/server-api/projects/[id]/assessments/route";
import { POST as createExperiment } from "@/server-api/projects/[id]/experiments/route";
import { GET as exportProject } from "@/server-api/projects/[id]/export/route";
import { createEmptyAssessment, type AssessmentInput } from "@/domain/framework/schema";

// Explicit opt-in integration command. Never point this suite at a hosted project.
let admin: SupabaseClient;
let clientA: SupabaseClient;
let clientB: SupabaseClient;
let tokenA: string;
let tokenB: string;
let userA: string;
let userB: string;
let projectId: string;
let draft: AssessmentInput;
const createdUsers: string[] = [];
const context = () => ({ params: Promise.resolve({ id: projectId }) });
const request = (method: string, token?: string, body?: unknown) => new Request("http://localhost/api/projects", { method, headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}), ...(body ? { "Content-Type": "application/json" } : {}) }, ...(body ? { body: JSON.stringify(body) } : {}) });

beforeAll(async () => {
  const url = process.env.SUPABASE_TEST_URL;
  const key = process.env.SUPABASE_TEST_ANON_KEY;
  const adminKey = process.env.SUPABASE_TEST_SERVICE_ROLE_KEY;
  if (!url || !key || !adminKey) throw new Error("Supabase Auth/REST tests require Docker + `npx supabase start` + migrations and SUPABASE_TEST_URL, SUPABASE_TEST_ANON_KEY, SUPABASE_TEST_SERVICE_ROLE_KEY from local CLI status. Tests were not skipped.");
  if (!["127.0.0.1", "localhost", "[::1]"].includes(new URL(url).hostname)) throw new Error("This suite is restricted to a disposable LOCAL Supabase instance; hosted projects are rejected.");
  const options = { auth: { persistSession: false, autoRefreshToken: false } };
  admin = createClient(url, adminKey, options);
  clientA = createClient(url, key, options);
  clientB = createClient(url, key, options);
  const password = `local-test-${crypto.randomUUID()}-Aa9!`;
  for (const [index, client] of [clientA, clientB].entries()) {
    const email = `oaas-${crypto.randomUUID()}@example.invalid`;
    const created = await admin.auth.admin.createUser({ email, password, email_confirm: true });
    if (created.error || !created.data.user) throw new Error("Could not create local synthetic account. Verify local Auth and test service role configuration.");
    createdUsers.push(created.data.user.id);
    const signed = await client.auth.signInWithPassword({ email, password });
    if (signed.error || !signed.data.session) throw new Error("Could not sign in local synthetic account.");
    if (index === 0) { tokenA = signed.data.session.access_token; userA = signed.data.user.id; }
    else { tokenB = signed.data.session.access_token; userB = signed.data.user.id; }
  }
  vi.stubEnv("PUBLIC_SUPABASE_URL", url);
  vi.stubEnv("PUBLIC_SUPABASE_PUBLISHABLE_KEY", key);
  draft = createEmptyAssessment("new", "idea");
  const response = await createProject(request("POST", tokenA, { name: "Integração sintética", stage: "idea", draft }));
  if (response.status !== 201) throw new Error(`Local project creation returned ${response.status}. Apply migrations with npx supabase db reset --local.`);
  const created = await response.json();
  projectId = created.project.id;
  draft = created.project.draft;
}, 30_000);

afterAll(async () => {
  for (const id of createdUsers) await admin.auth.admin.deleteUser(id);
  vi.unstubAllEnvs();
});

describe("real local Supabase Auth, REST, API authorization and RLS", () => {
  it("creates, lists, saves and resumes the owner's draft", async () => {
    expect((await (await listProjects(request("GET", tokenA))).json()).projects.some((p: { id: string }) => p.id === projectId)).toBe(true);
    draft.canvas.icp = "Cliente sintético";
    draft.evidence = [{ id: "local-e1", type: "founder_statement", source: "Fictícia", date: "2026-09-26", period: "teste", cohort: "sintética", description: "<img src=x onerror=alert(1)>", claim: "Hipótese fictícia", url: "https://example.invalid/not-fetched", outcome: "inconclusive", review: null }];
    expect((await updateProject(request("PUT", tokenA, { name: "Atualizado", stage: "idea", draft }), context())).status).toBe(200);
    const resumed = await (await getProject(request("GET", tokenA), context())).json();
    expect(resumed.project.draft.canvas.icp).toBe("Cliente sintético");
    expect(resumed.evidence[0].payload.description).toBe("<img src=x onerror=alert(1)>");
  });

  it("rejects user B on read, update, delete, export, finalization and experiment creation", async () => {
    const body = { name: "Forjado", stage: "idea", draft };
    const responses = await Promise.all([
      getProject(request("GET", tokenB), context()), updateProject(request("PUT", tokenB, body), context()),
      deleteProject(request("DELETE", tokenB), context()), exportProject(request("GET", tokenB), context()),
      finalizeAssessment(request("POST", tokenB, { draft }), context()), createExperiment(request("POST", tokenB, {}), context()),
    ]);
    expect(responses.map(response => response.status)).toEqual([404, 404, 404, 404, 404, 404]);
    expect((await (await listProjects(request("GET", tokenB))).json()).projects.some((p: { id: string }) => p.id === projectId)).toBe(false);
  });

  it("validates tokens remotely and rejects forged owner fields", async () => {
    expect((await listProjects(request("GET"))).status).toBe(401);
    expect((await listProjects(request("GET", `${tokenA.slice(0, -8)}tampered`))).status).toBe(401);
    expect((await createProject(request("POST", tokenA, { name: "Forjado", stage: "idea", owner_id: userB }))).status).toBe(400);
    for (const table of ["oaas_projects", "oaas_evidence", "oaas_assessments", "oaas_experiments", "oaas_audit_events"]) {
      const read = await clientB.from(table).select("*").eq("owner_id", userA);
      expect(read.error).toBeNull(); expect(read.data).toEqual([]);
    }
    const forged = await clientB.from("oaas_experiments").insert({ project_id: projectId, owner_id: userA, payload: {} });
    expect(forged.error).not.toBeNull();
    const reassigned = await clientB.from("oaas_experiments").insert({ project_id: projectId, owner_id: userB, payload: {} });
    expect(reassigned.error).not.toBeNull();
  });

  it("finalizes immutable snapshots and exposes a complete owner-authorized export", async () => {
    const response = await finalizeAssessment(request("POST", tokenA, { draft }), context());
    expect(response.status).toBe(201);
    const { assessment } = await response.json();
    expect(assessment.snapshot.author).toBe(userA);
    expect(assessment.snapshot.input.canvas.icp).toBe("Cliente sintético");
    draft.canvas.icp = "Segunda versão";
    expect((await updateProject(request("PUT", tokenA, { name: "Atualizado", stage: "idea", draft }), context())).status).toBe(200);
    const rewritten = await clientA.from("oaas_assessments").update({ snapshot: {} }).eq("id", assessment.id);
    expect(rewritten.error).not.toBeNull();
    const exported = await exportProject(request("GET", tokenA), context());
    expect(exported.status).toBe(200);
    expect(exported.headers.get("content-disposition")).toContain("attachment");
    const data = await exported.json();
    expect(data.project.draft.canvas.icp).toBe("Segunda versão");
    expect(data.assessments[0].snapshot.input.canvas.icp).toBe("Cliente sintético");
    expect(data.evidence).toHaveLength(1);
    expect(data.auditEvents.length).toBeGreaterThan(0);
  });

  it("records an experiment and deletes the project, its history and all child records", async () => {
    const experiment = { id: "exp-local", hypothesis: "Fictícia", procedure: "Entrevista", expectedEvidence: "Ata", responsible: "Pessoa sintética", dependencies: [], period: "15 dias", estimatedCostCents: null, metric: "Entendimento", successCriterion: "Documentar", stopRule: "Ausência de consentimento", status: "planned", safeResearchOnly: true };
    expect((await createExperiment(request("POST", tokenA, { experiment }), context())).status).toBe(201);
    expect((await deleteProject(request("DELETE", tokenA), context())).status).toBe(200);
    expect((await getProject(request("GET", tokenA), context())).status).toBe(404);
    for (const table of ["oaas_evidence", "oaas_assessments", "oaas_experiments", "oaas_audit_events"]) {
      const result = await clientA.from(table).select("*").eq("project_id", projectId);
      expect(result.error).toBeNull(); expect(result.data).toEqual([]);
    }
  });
});
