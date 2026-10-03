import { useCallback, useEffect, useRef, useState } from 'react';
import Link, { useRouter } from '@/components/navigation';
import { SiteHeader, Footer } from '@/components/site-header';
import { Field } from '@/components/form-fields';
import { privateApi, PrivateApiError } from '@/components/private-api';
import { readCreatedProject, readProjectsResponse } from '@/components/private-response';
import { ErrorNotice, PrivateRecovery } from '@/components/private-feedback';
import { createBrowserClient } from '@/lib/supabase/client';
import { STAGE_LABELS } from '@/domain/framework/constants';
import type { Stage } from '@/domain/framework/schema';

type Project = { id: string; name: string; stage: Stage; updated_at: string };
export default function ProjectsPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState<Error | null>(null);
  const [createError, setCreateError] = useState<Error | null>(null);
  const [configured, setConfigured] = useState(true);
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState('');
  const [busy, setBusy] = useState(false);
  const formHeading = useRef<HTMLHeadingElement>(null);
  const load = useCallback(async () => {
    const client = createBrowserClient();
    if (!client) { setConfigured(false); setLoading(false); return; }
    setLoading(true);
    setListError(null);
    try {
      const { data, error } = await client.auth.getSession();
      if (error) throw new PrivateApiError('Não foi possível conferir sua sessão. Entre novamente.', 401);
      if (!data.session) { router.replace('/conta'); return; }
      const result = await privateApi<unknown>('/api/projects');
      setProjects(readProjectsResponse(result));
    } catch (error) {
      setListError(error instanceof PrivateApiError ? error : new PrivateApiError('Não foi possível carregar seus projetos. Tente atualizar novamente.', null));
    } finally { setLoading(false); }
  }, [router]);
  useEffect(() => { void load(); }, [load]);
  useEffect(() => { if (creating) formHeading.current?.focus(); }, [creating]);
  const create = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setCreateError(null);
    try {
      const result = await privateApi<unknown>('/api/projects', 'POST', { name: name.trim() || 'Minha nova ideia', stage: 'idea' });
      router.push(`/projetos/${readCreatedProject(result).id}`);
    } catch (error) {
      setCreateError(error instanceof PrivateApiError ? error : new PrivateApiError('Não conseguimos confirmar se o projeto foi criado.', null));
      setBusy(false);
    }
  };
  return <><SiteHeader compact /><main id="conteudo" className="projects-main">
    <div className="workspace-heading"><div><div className="eyebrow dark-eyebrow">ESPAÇO PRIVADO</div><h1>Meus projetos</h1><p>Organize o que sabe. Teste o que falta.</p></div>
      {configured && <div className="button-row" style={{ margin: 0, gap: 12 }}><button className="button button-dark" disabled={busy || loading} onClick={() => setCreating(!creating)} aria-expanded={creating} aria-controls="new-project">{creating ? 'Fechar formulário' : '+ Novo projeto'}</button><button className="text-link" disabled={busy} style={{ background: 'none' }} onClick={async () => { await createBrowserClient()?.auth.signOut(); router.replace('/conta'); }}>Sair</button></div>}
    </div>
    {!configured ? <div className="panel"><h2 className="subheading" style={{ marginTop: 0 }}>Modo privado indisponível neste ambiente</h2><p className="help-text">Não é possível salvar projetos privados agora. Você pode experimentar o guia com informações fictícias, sem criar conta.</p><Link className="button button-dark" href="/demo">Explorar demonstração →</Link></div> : <>
      {listError && <ErrorNotice message={listError.message}><PrivateRecovery error={listError} /></ErrorNotice>}
      {creating && <form id="new-project" className="panel" onSubmit={create} aria-busy={busy}>
        <h2 ref={formHeading} tabIndex={-1} className="subheading" style={{ marginTop: 0 }}>Vamos organizar sua ideia.</h2><p>Você vai responder por escolhas. Se ainda não souber algo, pode deixar para depois.</p>
        <fieldset className="request-fields" disabled={busy}><Field label="Nome do novo projeto (opcional)" value={name} onChange={value => setName(value.slice(0, 120))} placeholder="Você pode escolher um nome depois" />
          {createError && <ErrorNotice message={createError.message}><PrivateRecovery error={createError} creation /></ErrorNotice>}
          <button className="button button-dark" disabled={busy} style={{ marginTop: 20 }}>{busy ? 'Criando…' : 'Começar o guia'}</button>
        </fieldset>
      </form>}
      <div className="project-list-actions"><button type="button" className="button button-light" disabled={loading || busy} onClick={() => void load()}>{loading ? 'Atualizando…' : 'Atualizar lista'}</button></div>
      {loading ? <div className="loading-state" role="status" aria-live="polite"><span className="spinner" aria-hidden="true" /><p>Carregando seus projetos…</p></div> : projects.length ? <div className="projects-grid">{projects.map(project => <Link className="project-card" href={`/projetos/${project.id}`} key={project.id}><div><span className="pill pill-neutral">{STAGE_LABELS[project.stage]}</span><h2>{project.name}</h2><p>Atualizado em {new Date(project.updated_at).toLocaleDateString('pt-BR')}</p></div><span className="text-link">Continuar projeto <span>↗</span></span></Link>)}</div> : !listError && <div className="empty-state"><strong>Uma oportunidade começa com uma pergunta.</strong><p>Conte para quem é sua ideia e o que você quer melhorar. Vamos ajudar a escolher o próximo passo.</p><button className="button button-dark" disabled={busy} onClick={() => setCreating(true)}>Criar meu primeiro projeto</button></div>}
    </>}
  </main><Footer /></>;
}
