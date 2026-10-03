import { useCallback, useEffect, useState } from 'react';
import { useRouter } from '@/components/navigation';
import Link from '@/components/navigation';
import { SiteHeader } from '@/components/site-header';
import { Workbench } from '@/components/workbench';
import { privateApi, PrivateApiError } from '@/components/private-api';
import { ErrorNotice, PrivateRecovery } from '@/components/private-feedback';
import { createBrowserClient } from '@/lib/supabase/client';
import { createEmptyAssessment, assessmentInputSchema, type AssessmentInput, type Stage } from '@/domain/framework/schema';
import type { AssessmentSnapshot } from '@/domain/framework/snapshots';
import type { AnalysisResult } from '@/lib/ai';

type Project={id:string;name:string;stage:Stage;draft:AssessmentInput|null};type Bundle={project:Project;assessments:Array<{snapshot:AssessmentSnapshot}>};
export default function PrivateProjectPage({ id }: { id: string }) {
  const router = useRouter();
  const [bundle, setBundle] = useState<Bundle | null>(null);
  const [author, setAuthor] = useState('');
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(true);
  const load = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const client = createBrowserClient();
      if (!client) throw new PrivateApiError('O modo privado não está disponível neste ambiente.', 503);
      const { data, error: sessionError } = await client.auth.getSession();
      if (sessionError) throw new PrivateApiError('Não foi possível conferir sua sessão. Entre novamente.', 401);
      if (!data.session) { router.replace('/conta'); return; }
      setAuthor(data.session.user.email || data.session.user.id);
      const result = await privateApi<Bundle>(`/api/projects/${id}`);
      result.project.draft = result.project.draft ? assessmentInputSchema.parse(result.project.draft) : createEmptyAssessment(id, result.project.stage);
      setBundle(result);
    } catch (error) { setError(error instanceof PrivateApiError ? error : new Error('Não foi possível abrir este projeto. Tente novamente.')); }
    finally { setLoading(false); }
  }, [id, router]);
  useEffect(() => { void load(); }, [load]);
  const canRetry = !(error instanceof PrivateApiError) || ![401, 403, 404].includes(error.status ?? 0);
  return <><SiteHeader compact />{error ? <main id="conteudo" className="loading-state">
    <ErrorNotice message={error.message}><PrivateRecovery error={error} /></ErrorNotice>
    <div className="button-row recovery-actions">{canRetry && <button className="button button-dark" onClick={() => void load()} disabled={loading}>Tentar abrir novamente</button>}<Link className="button button-light" href="/projetos">Voltar aos projetos</Link></div>
  </main> : bundle ? <Workbench initial={bundle.project.draft!} initialName={bundle.project.name} initialHistory={bundle.assessments.map(assessment => assessment.snapshot)} author={author} demo={false}
    onSave={async (name, draft) => { await privateApi(`/api/projects/${id}`, 'PUT', { name, stage: draft.stage, draft }); }}
    onAssess={async draft => { const result = await privateApi<{ assessment: { snapshot: AssessmentSnapshot } }>(`/api/projects/${id}/assessments`, 'POST', { draft }); return result.assessment.snapshot; }}
    onDelete={async () => { await privateApi(`/api/projects/${id}`, 'DELETE'); router.replace('/projetos'); }}
    onAssist={(evidenceIds, consent) => privateApi<AnalysisResult>('/api/analysis', 'POST', { projectId: id, evidenceIds, consent })}
  /> : <main id="conteudo" className="loading-state" role="status"><span className="spinner" aria-hidden="true" /><p>Abrindo projeto privado…</p></main>}</>;
}
