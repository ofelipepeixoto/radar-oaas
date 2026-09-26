-- Operationalization proposed for MVP 0.1.0. No remote project is changed by this file.
create schema if not exists oaas_private;
revoke all on schema oaas_private from public, anon;
grant usage on schema oaas_private to authenticated;

create table public.oaas_projects (
 id uuid primary key default gen_random_uuid(),
 owner_id uuid not null references auth.users(id) on delete cascade,
 name text not null check (length(btrim(name)) between 1 and 160),
 stage text not null check (stage in ('idea','discovery','contract','paid_pilot','repetition','scale_decision')),
 draft jsonb not null check (jsonb_typeof(draft) = 'object' and octet_length(draft::text) <= 512000),
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 unique (id, owner_id)
);
create index oaas_projects_owner_updated_idx on public.oaas_projects(owner_id, updated_at desc);

create table public.oaas_evidence (
 project_id uuid not null,
 owner_id uuid not null,
 evidence_id text not null check (length(evidence_id) between 1 and 100),
 payload jsonb not null check (jsonb_typeof(payload) = 'object' and octet_length(payload::text) <= 32000),
 created_at timestamptz not null default now(),
 primary key(project_id, evidence_id),
 foreign key(project_id, owner_id) references public.oaas_projects(id,owner_id) on delete cascade
);
create index oaas_evidence_owner_project_idx on public.oaas_evidence(owner_id,project_id);

create table public.oaas_assessments (
 id uuid primary key default gen_random_uuid(),
 project_id uuid not null,
 owner_id uuid not null,
 snapshot jsonb not null check (jsonb_typeof(snapshot) = 'object' and octet_length(snapshot::text) <= 1000000),
 result jsonb not null check (jsonb_typeof(result) = 'object'),
 framework_version text not null check(length(framework_version) <= 80),
 rules_version text not null check(length(rules_version) <= 80),
 created_at timestamptz not null default now(),
 foreign key(project_id, owner_id) references public.oaas_projects(id,owner_id) on delete cascade
);
create index oaas_assessments_owner_project_idx on public.oaas_assessments(owner_id,project_id,created_at);

create table public.oaas_experiments (
 id uuid primary key default gen_random_uuid(),
 project_id uuid not null,
 owner_id uuid not null,
 payload jsonb not null check (jsonb_typeof(payload) = 'object' and octet_length(payload::text) <= 64000),
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 foreign key(project_id, owner_id) references public.oaas_projects(id,owner_id) on delete cascade
);
create index oaas_experiments_owner_project_idx on public.oaas_experiments(owner_id,project_id);

create table public.oaas_audit_events (
 id uuid primary key default gen_random_uuid(),
 project_id uuid not null,
 owner_id uuid not null,
 event_type text not null check (length(event_type) between 1 and 100),
 metadata jsonb not null default '{}'::jsonb check (jsonb_typeof(metadata) = 'object' and octet_length(metadata::text) <= 16000),
 created_at timestamptz not null default now(),
 foreign key(project_id, owner_id) references public.oaas_projects(id,owner_id) on delete cascade
);
create index oaas_audit_events_owner_project_idx on public.oaas_audit_events(owner_id,project_id,created_at);

-- Grants restrict operations; RLS restricts owners, including direct REST access.
do $$
declare t text;
begin
 foreach t in array array['oaas_projects','oaas_evidence','oaas_assessments','oaas_experiments','oaas_audit_events'] loop
  execute format('alter table public.%I enable row level security',t);
  execute format('revoke all on table public.%I from public, anon, authenticated',t);
  execute format('grant select, insert on table public.%I to authenticated',t);
  execute format('create policy own_select on public.%I for select to authenticated using ((select auth.uid()) = owner_id)',t);
  execute format('create policy own_insert on public.%I for insert to authenticated with check ((select auth.uid()) = owner_id)',t);
 end loop;
 foreach t in array array['oaas_projects','oaas_evidence','oaas_experiments'] loop
  execute format('grant update, delete on table public.%I to authenticated',t);
  execute format('create policy own_update on public.%I for update to authenticated using ((select auth.uid()) = owner_id) with check ((select auth.uid()) = owner_id)',t);
  execute format('create policy own_delete on public.%I for delete to authenticated using ((select auth.uid()) = owner_id)',t);
 end loop;
end $$;

create function oaas_private.touch_updated_at() returns trigger language plpgsql security invoker set search_path = '' as $$
begin
 new.updated_at := now();
 return new;
end $$;
revoke all on function oaas_private.touch_updated_at() from public;
create trigger touch_project before update on public.oaas_projects for each row execute function oaas_private.touch_updated_at();
create trigger touch_experiment before update on public.oaas_experiments for each row execute function oaas_private.touch_updated_at();

create function oaas_private.reject_history_update() returns trigger language plpgsql security invoker set search_path = '' as $$
begin
 raise exception 'Finalized history is immutable; create a new assessment' using errcode='42501';
end $$;
revoke all on function oaas_private.reject_history_update() from public;
create trigger immutable_assessment before update on public.oaas_assessments for each row execute function oaas_private.reject_history_update();
create trigger immutable_audit before update on public.oaas_audit_events for each row execute function oaas_private.reject_history_update();

-- Atomic draft/evidence synchronization. Invoker security preserves all RLS checks.
create function public.oaas_save_project(p_id uuid,p_name text,p_stage text,p_draft jsonb,p_create boolean default false)
returns jsonb language plpgsql security invoker set search_path = '' as $$
declare result public.oaas_projects; item jsonb;
begin
 if auth.uid() is null then raise exception 'Authentication required' using errcode='42501'; end if;
 if p_create then
  insert into public.oaas_projects(id,owner_id,name,stage,draft) values(p_id,auth.uid(),p_name,p_stage,p_draft) returning * into result;
 else
  update public.oaas_projects set name=p_name,stage=p_stage,draft=p_draft where id=p_id and owner_id=auth.uid() returning * into result;
  if not found then raise exception 'Project unavailable' using errcode='42501'; end if;
 end if;
 if p_draft->>'projectId' is distinct from p_id::text or p_draft->>'stage' is distinct from p_stage then
  raise exception 'Draft identity mismatch' using errcode='22023';
 end if;
 delete from public.oaas_evidence where project_id=p_id and owner_id=auth.uid();
 for item in select value from jsonb_array_elements(coalesce(p_draft->'evidence','[]'::jsonb)) loop
  insert into public.oaas_evidence(project_id,owner_id,evidence_id,payload) values(p_id,auth.uid(),item->>'id',item);
 end loop;
 insert into public.oaas_audit_events(project_id,owner_id,event_type,metadata) values(p_id,auth.uid(),case when p_create then 'project.created' else 'project.updated' end,jsonb_build_object('stage',p_stage));
 return to_jsonb(result);
end $$;
revoke all on function public.oaas_save_project(uuid,text,text,jsonb,boolean) from public,anon;
grant execute on function public.oaas_save_project(uuid,text,text,jsonb,boolean) to authenticated;

-- Private quota rows cannot be read or rewritten through the Data API.
create table oaas_private.ai_usage (
 subject text not null,
 usage_day date not null,
 calls integer not null default 0 check(calls>=0),
 reserved_tokens bigint not null default 0 check(reserved_tokens>=0),
 primary key(subject,usage_day)
);
alter table oaas_private.ai_usage enable row level security;
revoke all on table oaas_private.ai_usage from public,anon,authenticated;

-- A narrowly scoped definer is necessary: clients must never reset quota counters.
-- No dynamic SQL; fixed search_path; auth.uid is the sole identity source.
create function oaas_private.reserve_ai_call(p_reserved_tokens integer) returns boolean
language plpgsql security definer set search_path = '' as $$
declare user_subject text; day date := (now() at time zone 'UTC')::date; global_usage oaas_private.ai_usage; user_usage oaas_private.ai_usage;
begin
 if auth.uid() is null or coalesce((auth.jwt()->>'is_anonymous')::boolean,false) then raise exception 'Authentication required' using errcode='42501'; end if;
 if p_reserved_tokens is null or p_reserved_tokens < 1 or p_reserved_tokens > 120000 then return false; end if;
 user_subject := auth.uid()::text;
 insert into oaas_private.ai_usage(subject,usage_day) values('deployment',day) on conflict do nothing;
 -- Lock order is always global then user; updates and ceilings are transactional.
 select * into global_usage from oaas_private.ai_usage where subject='deployment' and usage_day=day for update;
 insert into oaas_private.ai_usage(subject,usage_day) values(user_subject,day) on conflict do nothing;
 select * into user_usage from oaas_private.ai_usage where subject=user_subject and usage_day=day for update;
 if user_usage.calls>=5 or user_usage.reserved_tokens+p_reserved_tokens>120000 or global_usage.reserved_tokens+p_reserved_tokens>1000000 then return false; end if;
 update oaas_private.ai_usage set calls=calls+1,reserved_tokens=reserved_tokens+p_reserved_tokens where subject in ('deployment',user_subject) and usage_day=day;
 return true;
end $$;
revoke all on function oaas_private.reserve_ai_call(integer) from public,anon;
grant execute on function oaas_private.reserve_ai_call(integer) to authenticated;
create function public.oaas_reserve_ai_call(p_reserved_tokens integer) returns boolean language sql security invoker set search_path = '' as $$ select oaas_private.reserve_ai_call(p_reserved_tokens); $$;
revoke all on function public.oaas_reserve_ai_call(integer) from public,anon;
grant execute on function public.oaas_reserve_ai_call(integer) to authenticated;

-- One transaction for finalized history and its audit event. No update path exists.
create function public.oaas_finalize_assessment(p_project_id uuid,p_snapshot jsonb) returns jsonb
language plpgsql security invoker set search_path = '' as $$
declare result public.oaas_assessments;
begin
 if auth.uid() is null or not exists(select 1 from public.oaas_projects where id=p_project_id and owner_id=auth.uid()) then
  raise exception 'Project unavailable' using errcode='42501';
 end if;
 if p_snapshot->>'projectId' is distinct from p_project_id::text or p_snapshot->>'author' is distinct from auth.uid()::text then
  raise exception 'Snapshot identity mismatch' using errcode='22023';
 end if;
 insert into public.oaas_assessments(id,project_id,owner_id,snapshot,result,framework_version,rules_version)
 values((p_snapshot->>'id')::uuid,p_project_id,auth.uid(),p_snapshot,p_snapshot->'result',p_snapshot->>'frameworkVersion',p_snapshot->>'rulesVersion') returning * into result;
 insert into public.oaas_audit_events(project_id,owner_id,event_type,metadata)
 values(p_project_id,auth.uid(),'assessment.finalized',jsonb_build_object('assessmentId',result.id,'frameworkVersion',result.framework_version,'rulesVersion',result.rules_version));
 return to_jsonb(result);
end $$;
revoke all on function public.oaas_finalize_assessment(uuid,jsonb) from public,anon;
grant execute on function public.oaas_finalize_assessment(uuid,jsonb) to authenticated;
