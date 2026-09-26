import { afterEach, describe, expect, it, vi } from "vitest";
import { GET as listProjects, POST as createProject } from "@/server-api/projects/route";
import { projectCreateSchema } from "@/lib/supabase/projects";
import { readSupabaseConfig } from "@/lib/supabase/config";
import { readJson } from "@/lib/supabase/server";

afterEach(() => { vi.unstubAllEnvs(); });
function configure() { vi.stubEnv("PUBLIC_SUPABASE_URL", "http://127.0.0.1:54321"); vi.stubEnv("PUBLIC_SUPABASE_PUBLISHABLE_KEY", "sb_publishable_local_test_only"); }

describe("server boundary, before any network call", () => {
  it("fails closed for private list and create with missing config", async () => {
    vi.stubEnv("PUBLIC_SUPABASE_URL", ""); vi.stubEnv("PUBLIC_SUPABASE_PUBLISHABLE_KEY", ""); vi.stubEnv("PUBLIC_SUPABASE_ANON_KEY", "");
    expect((await listProjects(new Request("http://localhost/api/projects"))).status).toBe(503);
    expect((await createProject(new Request("http://localhost/api/projects", { method: "POST" }))).status).toBe(503);
  });
  it("does not accept a demo flag or an owner ID as authentication", async () => {
    configure();
    const response = await listProjects(new Request("http://localhost/api/projects?demo=true&owner_id=owner"));
    expect(response.status).toBe(401);
    expect(response.headers.get("cache-control")).toBe("private, no-store");
  });
  it("rejects administrative public configuration", () => {
    configure(); vi.stubEnv("PUBLIC_SUPABASE_PUBLISHABLE_KEY", "sb_secret_accidental");
    expect(readSupabaseConfig()).toBeNull();
    const forged = `header.${btoa(JSON.stringify({ role: "service_role" }))}.signature`;
    vi.stubEnv("PUBLIC_SUPABASE_PUBLISHABLE_KEY", forged);
    expect(readSupabaseConfig()).toBeNull();
  });
  it("rejects owner forgery and unknown fields instead of ignoring them", async () => {
    const request = new Request("http://localhost", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ name: "Fictício", stage: "idea", owner_id: "outro" }) });
    await expect(readJson(request, projectCreateSchema)).rejects.toMatchObject({ status: 400 });
  });
  it("enforces actual payload bytes even without Content-Length", async () => {
    const request = new Request("http://localhost", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ name: "a".repeat(512_001) }) });
    await expect(readJson(request, projectCreateSchema)).rejects.toMatchObject({ status: 413 });
  });
  it("requires valid JSON content type and syntax", async () => {
    await expect(readJson(new Request("http://localhost", { method: "POST", body: "x" }), projectCreateSchema)).rejects.toMatchObject({ status: 415 });
    await expect(readJson(new Request("http://localhost", { method: "POST", headers: { "content-type": "application/json" }, body: "{" }), projectCreateSchema)).rejects.toMatchObject({ status: 400 });
  });
});
