# Recuperação de falhas e primeira utilização — 03/10/2026

## Escopo e autoria

Melhoria original de UX no Radar OaaS, baseada no main `3c0581c0e2997879c2830926caad1ebbf6f4ef01`. Aplicadas as ideias de explicar, orientar e endurecer estados de falha selecionadas na auditoria do Impeccable; nenhum código, skill, hook, extensão ou runtime desse projeto foi copiado/instalado na aplicação.

O guia por escolhas já existe no main. Esta rodada melhora acesso, carregamento e salvamento, mantendo Astro/React, autorização de servidor, RLS, regras e snapshots. Não converte Radar OaaS em produto jurídico nem promete resultado profissional. Exemplos continuam fictícios.

## Baseline observada no código e mudança

| Estado | Antes no main inspecionado | Depois nesta mudança |
| --- | --- | --- |
| Falha ao listar | Mensagem sem ação de recarregamento local | “Atualizar lista”, sem tratar falha como lista vazia válida |
| Criação sem resposta confirmada | Nome continuava no state, mas sem orientação sobre pedido possivelmente recebido | Nome preservado, orientação para conferir a lista antes de repetir; nenhuma repetição automática |
| Sessão negada ao salvar guia | Mensagem genérica de tentativa, sem caminho de autenticação | Respostas e etapa preservadas; entrar em outra aba e voltar para salvar |
| Projeto negado | Mensagem e voltar, sem distinção de indisponibilidade temporária | 401/403/404 diferenciados de erro temporário; projeto de outra conta continua sem campos privados |
| Falha temporária ao abrir | Retorno aos projetos era a única ação | Retentar a leitura na própria tela |
| JSON inesperado | Resposta válida, mas incompatível, podia quebrar lista ou navegação; texto de erro JSON era exibido | Shapes de listagem/criação verificados antes de mudar state/URL; mensagens locais por HTTP; criação 2xx incerta mantém o nome |
| Erro de login | Texto bruto do provedor | Mensagens em português por código, diagnóstico desconhecido suprimido, e-mail preservado |
| Gravação pendente | Campos detalhados podiam ser editados antes de a resposta marcar rascunho salvo | Edição bloqueada durante gravação e no salvamento anterior à assistência opcional; nova edição após sucesso volta a marcar alterações não salvas |
| Teclado e estado | Alertas sem foco específico | Alerta recebe foco, carregamento tem status, formulário informa ocupação e formulário novo recebe foco |

As observações anteriores são inspeção de código; não são medições com usuários. O timeout de 15 segundos limita a espera da solicitação HTTP privada e não confirma se uma gravação chegou ao servidor. A criação recebe orientação específica para conferência. Nenhum write é repetido automaticamente.

A preservação de rascunho privado acontece somente em memória da tela. Não criamos fallback de dados privados no localStorage. Fechar/recarregar antes de salvar pode perder alterações; a interface explica isso. O login em outra aba depende do Auth existente e deve ser homologado com contas reais autorizadas; o teste desta rodada somente confere link, state e ação manual.

## Evidência automatizada

- `npm run test:unit`: 132 aprovados, incluindo 14 casos novos de fronteira cliente e mensagens de Auth.
- `npm run test:integration`: 14 aprovados em PGlite/API boundary. Não substitui Auth/PostgREST real.
- `npm run test:e2e`: 16 aprovados na versão local `a2669c94` contra demo real local e rejeição privada sem configuração. Após ajustes adicionais de respostas JSON e gravação pré-assistência, foram repetidos unitários/UX afetados; CI deve repetir E2E completo no commit publicado.
- `npm run test:ux`: doze jornadas de recuperação em UI real com respostas HTTP e sessão sintéticas mockadas. Não comprova autenticação, RLS, persistência real, SLA ou deploy.
- Lint e typecheck aprovados; 13 hints informativos, sem erros. Build Astro/Cloudflare local aprovado. Onze fixtures Gitleaks aprovadas; controles e limites em [segredos CI](segredos-ci.md).

O ambiente usou Node 24.19.0, dependências do lockfile e Chromium 153.0.0 de `@sparticuz/chromium` temporário fora do repositório. O pacote não entrou em dependências/lockfile da aplicação. CI continua usando Chromium padrão do Playwright e agora inclui a suíte UX. Rodar servidores Astro sequencialmente no mesmo checkout para evitar disputa do cache Vite.

A suíte UX recusa alvo remoto, inicia loopback com chave pública fictícia, bloqueia tráfego externo e não usa credenciais reais, OpenAI, SMTP ou banco. A nova asserção de rascunho detalhado foi corrigida para considerar o ícone presente no rótulo de status, mantendo a verificação de alteração não salva. Um primeiro mock de Auth usou o campo `code` sem header de versão; foi ajustado ao formato `error_code` reconhecido pelo SDK. A evidência final está separada da tentativa.

## Rubrica original de revisão

1. **Clareza:** a pessoa entende o que ocorreu e uma ação disponível, sem depender de vocabulário técnico.
2. **Continuidade:** uma falha não apaga respostas, inventa salvamento nem avança a etapa.
3. **Segurança:** negar acesso mantém conteúdo oculto; erros e demos não revelam dados privados.
4. **Controle:** retries de efeitos externos dependem de ação consciente; pedidos incertos pedem conferência.
5. **Acesso:** foco, status e controles funcionam por teclado, com reflow estreito e sem depender apenas de cor.

Automação confere recuperação em 320/375/640 px. 640 px representa reflow de uma área de 1280 px a 200%; não constitui teste completo de zoom do navegador, leitor de tela ou certificação WCAG.

## Protocolo humano ainda não realizado

Participantes: cinco pessoas leigas, incluindo pessoas com 45 anos ou mais; usar somente informações fictícias e autorização explícita para o teste. Sem gravar senhas, tokens, dados de clientes ou documentos jurídicos reais.

Tarefas: explicar a proposta da página inicial; iniciar uma ideia por escolhas; voltar e corrigir; entender o próximo passo; recuperar uma falha de leitura; identificar uma gravação pendente; interpretar sessão expirada sem fechar a tela. Casos de falha ficam em ambiente de teste, separados da produção.

Medir por participante: conclusão sem ajuda, pontos de dúvida, pedidos de ajuda, tempo por tarefa e entendimento do que foi ou não salvo. Registrar transcrição sanitizada ou notas com consentimento. Comparar mesmo roteiro, dispositivos e dificuldade contra baseline; cinco participantes oferecem sinais qualitativos, não estimativa estatística ou prova de conversão.

**Não medidos:** tempo humano, satisfação, conversão, ROI, sucesso empresarial, ganho clínico/jurídico, latência e disponibilidade reais. Não publicar percentuais de melhora antes dessa observação.

Os ajustes de revisão cobrem JSON malformado/incompatível, corpo de erro arbitrário e a gravação anterior à assistência opcional. O servidor próprio atual já suprime exceções; o cliente agora também não depende de diagnósticos JSON de intermediários.

## Gates operacionais

1. CI do commit publicado: lint, tipos, domínio, SQL/RLS, demo, UX e build.
2. Reexecutar a suíte local descartável de duas contas, confirmação/recuperação e RLS; resultados históricos não certificam o novo commit.
3. Compor explicitamente com PR #1 se o `/avaliar` público for adotado; as mudanças de domínio/licença desse PR não são assumidas aqui.
4. Prévia Sites e duas contas hospedadas autorizadas, redirects/SMTP existentes e recuperação em outra aba, preservando as configurações compartilhadas.
5. Conferir teclado, zoom real de 200%, leitor de tela e telefone; executar protocolo humano.

Reversão: reverter somente o commit desta melhoria. Nenhuma migração ou mudança de banco/Auth global foi adicionada.
