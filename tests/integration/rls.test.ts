import { PGlite } from "@electric-sql/pglite";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

// Actual PostgreSQL SQL/RLS in WASM. This does not emulate Supabase Auth or REST.
const A = "11111111-1111-4111-8111-111111111111";
const B = "22222222-2222-4222-8222-222222222222";
const P = "33333333-3333-4333-8333-333333333333";
const TABLES = ["oaas_projects", "oaas_evidence", "oaas_assessments", "oaas_experiments", "oaas_audit_events"] as const;
let db: PGlite;

async function asUser(id: string | null) {
  await db.exec(`reset role; set role ${id ? "authenticated" : "anon"};`);
  await db.query("select set_config('request.jwt.claim.sub',$1,false), set_config('request.jwt.claims',$2,false)", [id ?? "", JSON.stringify({ sub: id, is_anonymous: false })]);
}
async function save(name = "Projeto fictício", evidence: unknown[] = []) {
  return db.query("select public.oaas_save_project($1,$2,'idea',$3::jsonb,false) as project", [P, name, JSON.stringify({ projectId: P, stage: "idea", evidence })]);
}

beforeAll(async () => {
  db = new PGlite();
  await db.exec(`
    create role anon; create role authenticated;
    create schema auth;
    create table auth.users(id uuid primary key);
    create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid; $$;
    create function auth.jwt() returns jsonb language sql stable as $$ select coalesce(nullif(current_setting('request.jwt.claims',true),'')::jsonb,'{}'::jsonb); $$;
    grant usage on schema auth, public to anon, authenticated;
    insert into auth.users values ('${A}'),('${B}');
    create table public.projects(id integer primary key, secret text);
    insert into public.projects values(1,'existing product must remain untouched');
    create schema private;
    create table private.existing_product(id integer primary key);
    insert into private.existing_product values(42);
    grant usage on schema private to anon;
  `);
  for (const file of readdirSync("supabase/migrations").filter(f => f.endsWith(".sql")).sort()) {
    await db.exec(readFileSync(join("supabase/migrations", file), "utf8"));
  }
}, 30_000);

beforeEach(async () => {
  await db.exec("reset role; truncate public.oaas_projects cascade; truncate oaas_private.ai_usage;");
  await asUser(A);
  await db.query("select public.oaas_save_project($1,'Projeto fictício','idea',$2::jsonb,true)", [P, JSON.stringify({ projectId: P, stage: "idea", evidence: [{ id: "E1", description: "Resultado sintético" }] })]);
  await db.query("insert into public.oaas_assessments(project_id,owner_id,snapshot,result,framework_version,rules_version) values($1,$2,$3::jsonb,'{}','2026-09-23','0.1.0-experimental')", [P, A, JSON.stringify({ immutable: "original" })]);
  await db.query("insert into public.oaas_experiments(project_id,owner_id,payload) values($1,$2,'{}')", [P, A]);
});

afterAll(async () => { await db?.close(); });

describe("migration and owner isolation (real PostgreSQL engine)", () => {
  it("protects every public table with RLS and rejects anonymous access", async () => {
    await db.exec("reset role");
    const flags = await db.query<{ relrowsecurity: boolean }>("select relrowsecurity from pg_class join pg_namespace on pg_namespace.oid=relnamespace where nspname='public' and relkind='r' and left(relname,5)='oaas_'");
    expect(flags.rows).toHaveLength(5);
    expect(flags.rows.every(row => row.relrowsecurity)).toBe(true);
    await asUser(null);
    for (const table of TABLES) await expect(db.query(`select * from public.${table}`)).rejects.toThrow(/permission denied/);
    await expect(db.query("select public.oaas_save_project($1,'Hack','idea','{}',false)", [P])).rejects.toThrow(/permission denied/);
  });

  it("leaves pre-existing tables, schemas, data and privileges unchanged", async () => {
    await db.exec("reset role");
    expect((await db.query("select * from public.projects")).rows).toEqual([{ id: 1, secret: "existing product must remain untouched" }]);
    expect((await db.query("select * from private.existing_product")).rows).toEqual([{ id: 42 }]);
    expect((await db.query<{ allowed: boolean }>("select has_schema_privilege('anon','private','usage') as allowed")).rows[0].allowed).toBe(true);
    expect((await db.query<{ relrowsecurity: boolean }>("select relrowsecurity from pg_class where oid='public.projects'::regclass")).rows[0].relrowsecurity).toBe(false);
  });

  it("lets the owner read every entity; user B cannot read/export any of A's entities", async () => {
    for (const table of TABLES) expect((await db.query(`select * from public.${table}`)).rows.length).toBeGreaterThan(0);
    await asUser(B);
    for (const table of TABLES) expect((await db.query(`select * from public.${table}`)).rows).toEqual([]);
  });

  it("blocks cross-owner update/delete and forged ownership on creation", async () => {
    await asUser(B);
    for (const table of ["oaas_projects", "oaas_evidence", "oaas_experiments"]) {
      const assignment = table === "oaas_projects" ? "name='Forjado'" : "payload='{}'::jsonb";
      expect((await db.query(`update public.${table} set ${assignment} returning *`)).rows).toEqual([]);
      expect((await db.query(`delete from public.${table} returning *`)).rows).toEqual([]);
    }
    for (const table of ["oaas_assessments", "oaas_audit_events"]) {
      await expect(db.query(`update public.${table} set owner_id=$1`, [B])).rejects.toThrow(/permission denied/);
      await expect(db.query(`delete from public.${table}`)).rejects.toThrow(/permission denied/);
    }
    await expect(db.query("insert into public.oaas_projects(owner_id,name,stage,draft) values($1,'Forjado','idea','{}')", [A])).rejects.toThrow(/row-level security/);
    await expect(db.query("insert into public.oaas_evidence(project_id,owner_id,evidence_id,payload) values($1,$2,'E2','{}')", [P, A])).rejects.toThrow(/row-level security/);
    await expect(db.query("insert into public.oaas_experiments(project_id,owner_id,payload) values($1,$2,'{}')", [P, A])).rejects.toThrow(/row-level security/);
    await expect(db.query("insert into public.oaas_assessments(project_id,owner_id,snapshot,result,framework_version,rules_version) values($1,$2,'{}','{}','x','x')", [P, A])).rejects.toThrow(/row-level security/);
    await expect(db.query("insert into public.oaas_audit_events(project_id,owner_id,event_type) values($1,$2,'forged')", [P, A])).rejects.toThrow(/row-level security/);
    // Even a self-owned child cannot point at another user's project.
    await expect(db.query("insert into public.oaas_experiments(project_id,owner_id,payload) values($1,$2,'{}')", [P, B])).rejects.toThrow(/foreign key/);
    await expect(save()).rejects.toThrow(/Project unavailable/);
  });

  it("cannot transfer owner; snapshots remain immutable after the draft changes", async () => {
    await expect(db.query("update public.oaas_projects set owner_id=$1 where id=$2", [B, P])).rejects.toThrow(/row-level security/);
    await save("Revisado");
    expect((await db.query<{ snapshot: unknown }>("select snapshot from public.oaas_assessments")).rows[0].snapshot).toEqual({ immutable: "original" });
    await expect(db.query("update public.oaas_assessments set snapshot='{}'")).rejects.toThrow(/permission denied/);
    await expect(db.query("delete from public.oaas_assessments")).rejects.toThrow(/permission denied/);
    await expect(db.query("update public.oaas_audit_events set metadata='{}'")).rejects.toThrow(/permission denied/);
  });

  it("atomically synchronizes evidence and rolls back a bad draft", async () => {
    await save("Novo", [{ id: "E2", description: "<script>alert('x')</script>", url: "https://example.invalid/never-fetch" }]);
    const evidence = await db.query<{ evidence_id: string; payload: { description: string } }>("select * from public.oaas_evidence");
    expect(evidence.rows.map(row => row.evidence_id)).toEqual(["E2"]);
    expect(evidence.rows[0].payload.description).toContain("<script>"); // Stored text, never executed or fetched.
    await expect(save("Não pode salvar", [{ id: "" }])).rejects.toThrow(/check constraint/);
    expect((await db.query<{ name: string }>("select name from public.oaas_projects")).rows[0].name).toBe("Novo");
    expect((await db.query<{ evidence_id: string }>("select evidence_id from public.oaas_evidence")).rows[0].evidence_id).toBe("E2");
  });

  it("supports owner updates/deletes and complete project erasure, including history", async () => {
    expect((await db.query("update public.oaas_experiments set payload='{\"status\":\"completed\"}' returning id")).rows).toHaveLength(1);
    expect((await db.query("delete from public.oaas_experiments returning id")).rows).toHaveLength(1);
    await db.query("delete from public.oaas_projects where id=$1", [P]);
    for (const table of TABLES) expect((await db.query(`select * from public.${table}`)).rows).toEqual([]);
  });

  it("limits real AI reservations and prevents users from resetting counters", async () => {
    const reserve = async (tokens: number) => (await db.query<{ accepted: boolean }>("select public.oaas_reserve_ai_call($1) accepted", [tokens])).rows[0].accepted;
    expect(await reserve(0)).toBe(false);
    expect(await reserve(120_001)).toBe(false);
    for (let i = 0; i < 5; i++) expect(await reserve(100)).toBe(true);
    expect(await reserve(100)).toBe(false);
    await expect(db.query("select * from oaas_private.ai_usage")).rejects.toThrow(/permission denied/);
    await expect(db.query("delete from oaas_private.ai_usage")).rejects.toThrow(/permission denied/);
    await asUser(B);
    expect(await reserve(119_999)).toBe(true);
    expect(await reserve(2)).toBe(false);
    await asUser(null);
    await expect(reserve(100)).rejects.toThrow(/permission denied/);
  });
});
