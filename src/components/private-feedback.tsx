import { useEffect, useRef, type ReactNode } from 'react';
import Link from './navigation';
import { PrivateApiError } from './private-api';

export function ErrorNotice({ message, children }: { message: string; children?: ReactNode }) {
  const notice = useRef<HTMLDivElement>(null);
  useEffect(() => { notice.current?.focus(); }, [message]);
  return <div className="request-feedback">
    <div ref={notice} className="error-box" role="alert" tabIndex={-1}>{message}</div>
    {children}
  </div>;
}

export function PrivateRecovery({ error, draft = false, creation = false }: { error: unknown; draft?: boolean; creation?: boolean }) {
  if (!(error instanceof PrivateApiError)) return null;
  return <div className="request-help">
    {draft && <p>Suas respostas continuam nesta tela. Não feche nem recarregue antes de salvar.</p>}
    {error.status === 401
      ? <><p>{draft ? 'Entre novamente em outra aba. Depois volte aqui e tente salvar.' : 'Entre novamente para continuar.'}</p><Link className="button button-light" href="/conta" target={draft ? '_blank' : undefined} rel={draft ? 'noopener noreferrer' : undefined}>{draft ? 'Entrar novamente em outra aba' : 'Entrar novamente'}</Link></>
      : error.status === 404 || error.status === 403
        ? <p>Volte aos seus projetos e escolha um item disponível para sua conta.</p>
        : error.status === 409
          ? <p>Suas alterações continuam na tela. Confira o projeto salvo em outra aba antes de escolher o que manter.</p>
        : creation && (error.status === null || error.status >= 500 || (error.status >= 200 && error.status < 300))
          ? <p>Antes de criar outra vez, use “Atualizar lista” para conferir se o projeto já apareceu. O pedido pode ter sido recebido.</p>
          : <p>{error.status === 429 ? 'Aguarde um pouco e tente a mesma ação novamente.' : 'Confira sua conexão e tente a mesma ação novamente. Se continuar, retome mais tarde.'}</p>}
  </div>;
}
