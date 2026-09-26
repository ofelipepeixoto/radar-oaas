# Estado verificável — 26/09/2026

MVP experimental **Radar OaaS — Avaliador de Prontidão**. Stack vigente: Astro 7.3.5, React 19.2.6, TypeScript e adaptador Cloudflare 14.3.3. Sites privado é o destino de hospedagem. O repositório público [ofelipepeixoto/radar-oaas](https://github.com/ofelipepeixoto/radar-oaas) foi criado em 26/09/2026; MVP publicado no commit `5e53d58210f81afed34b436f069a7ab55e83c3e4` e [CI remota aprovada](https://github.com/ofelipepeixoto/radar-oaas/actions/runs/36221322124). Licença definitiva e titular continuam pendentes. Não houve contratação de plano pago nem uso da API paga da OpenAI.

## Implementado

Canvas, evidências, oito critérios e seis blocos independentes, quatro travas, transições condicionadas, cálculos monetários/capacidade, snapshots imutáveis, comparação de avaliações, plano de experimentos/90 dias, exportações JSON/Markdown e impressão. Demo sintética usa armazenamento local explicitamente identificado; o modo privado usa sessão e RLS.

O pedido posterior de Astro foi aplicado ao site, rotas e APIs. React fica nas ilhas interativas; os handlers usam Request/Response padrão. A comparação com ValidatorAI, Strategyzer e IdeaBuddy resultou em entrada essencial, contagens de preenchimento e destaque da próxima ação, sem alterar as regras do domínio. Ver [referências e limites](docs/competitive-reference.md).

## Verificações executadas nesta versão Astro

| Verificação | Resultado |
| --- | --- |
| `npm ci --no-audit --no-fund` | Aprovado; 633 pacotes instalados do lockfile |
| `npm run lint` | Aprovado |
| `npm run typecheck` | Astro check e TypeScript aprovados; 13 avisos informativos de APIs depreciadas, sem erros |
| `npm run test:unit` | 104 testes aprovados — domínio, comparação e adaptador IA simulado/mocado |
| `npm run test:integration` | 14 testes aprovados — SQL/RLS real em PGlite e fronteira HTTP sem rede |
| `npm run test:e2e` | 10 testes aprovados em Chromium — jornada demo real, persistência, evidências, histórico, exportações, experimentos e rejeição sem sessão |
| Build Astro/Cloudflare | Entrada `dist/server/index.js`, default fetch, assets `dist/client`; sem D1, R2 ou KV adicionais |
| Prévia visual | Interface Astro e geração de diagnóstico verificadas no navegador; sem transbordamento horizontal na largura desktop verificada |
| Bundle do navegador | Não contém `OPENAI_API_KEY`, `service_role`, endpoint OpenAI nem RPC de quota |

O navegador padrão do Playwright não pôde ser obtido nesta sessão. A suíte passou usando o executável Chromium 153 de `@sparticuz/chromium`, externo ao repositório, indicado por `PLAYWRIGHT_CHROMIUM_EXECUTABLE`. A CI usa a instalação padrão do Playwright. Tentativas iniciais revelaram e corrigiram incompatibilidades do ambiente, identificadores de campos e seletores ambíguos. Não foram usados mocks de UI, login ou Supabase nesses dez testes.

## Supabase compartilhado

Destino autorizado: `radar-disruptivo`, projeto `jgdebcmiklqajhbeniri`. Migração aplicada: `20260926042935_oaas_isolated_mvp_initial`.

- Criadas cinco tabelas próprias: `oaas_projects`, `oaas_evidence`, `oaas_assessments`, `oaas_experiments`, `oaas_audit_events`.
- Schema interno `oaas_private` para quota e funções auxiliares; RPCs com prefixo `oaas_`.
- RLS habilitada nas cinco tabelas, sem SELECT anônimo; operações autenticadas restritas pelo proprietário.
- Metadados anteriores comparados antes/depois: RLS/grants de tabelas Radar, políticas, definições/ACL de funções e ACL dos schemas `public/private/api/auth` permaneceram idênticos.
- Advisor remoto: nenhum novo WARN; novo INFO na quota interna sem políticas é esperado, com acesso somente pela função restrita.
- Não foram alterados configuração global de Auth, chaves, plano, tabelas `rd_*`, dados do Radar, Storage ou Edge Functions. Nenhum dado sintético foi inserido no banco remoto.

Fingerprints preservados: tabelas/RLS/grants `dba9c41f6230179ff3a77a51927db0e9`; ACL schemas `76ee3574fc8657220d425386b7d0ece6`; políticas `edee1fc26d9f921d487e707649377e8b`; funções/ACL `02b5910db7552ea62faf8c8f74309fee`.

**Limite:** Auth, capacidade, conexões e cotas são compartilhados. Separação lógica não equivale a isolamento de recursos. O plano gratuito não foi alterado, mas consumo e disponibilidade exigem acompanhamento.

## Pendências explícitas

- **Homologação autenticada completa:** autorizada em 26/09/2026. Gate descartável em preparação no workflow `auth.yml`: cinco testes Auth/PostgREST e jornada de navegador com dois usuários sintéticos. Resultado remoto ainda pendente neste registro. A homologação no Sites hospedado continua dependendo de dois e-mails autorizados e da conferência de SMTP/redirects; nenhum usuário de produção foi usado.
- **E-mails de Auth:** os redirects precisam ser conferidos na allowlist do projeto compartilhado antes de liberar cadastro/recuperação ao público. A configuração global existente foi preservada.
- **Licença e governança:** pacote `UNLICENSED`; titular, licença efetiva e termos de contribuição pendentes. Proteção de branch e regras obrigatórias de revisão/checks não foram criadas. Relato privado está habilitado, mas recebimento de teste, equipe dedicada e SLA não foram confirmados.

- **OpenAI:** adaptador de Responses preparado, mas IA real desativada (`AI_PROVIDER=simulated`, `AI_ENABLED=false`). Chave/modelo não configurados; consumo pago zero nesta implementação. Limites de tokens não equivalem a teto monetário.
- **WebMCP:** duas ações opcionais implementadas; o navegador de verificação não disponibiliza `document.modelContext`. Validação funcional indisponível; a interface comum funciona sem essa capacidade.
- **VPS:** não modificada. Uma alternativa Node exigiria adaptador e implantação específicos; os arquivos de container incompatíveis foram retirados.
- **Validação do produto:** protocolo exploratório preparado, sem participantes ou resultados. Não há evidência de superioridade competitiva ou previsão de sucesso empresarial.

## Publicação

Publicação Sites confirmada com status terminal `succeeded` para o commit `cb9cf548908f4fec935d11cf029987f58e4c9ce6`. Endereço: https://radar-oaas.radarjacarepagua.chatgpt.site. A visibilidade permanece privada. Publicação técnica não encerra a homologação de Supabase Auth/PostgREST nem valida o produto comercialmente.

## Publicação GitHub e CI remota

Repositório público: [ofelipepeixoto/radar-oaas](https://github.com/ofelipepeixoto/radar-oaas), branch `main`. Commit inicial de README: `7bf59c62774c482563ddcccec1e1cb6fea2900b0`. MVP publicado no commit **`5e53d58210f81afed34b436f069a7ab55e83c3e4`**, com **197 arquivos versionados**, conferidos contra a cópia preparada sem divergências de conteúdo. Árvore Git: `4d071e2a5638a17f611a916710e42c00cf5dfd16`.

A origem é o commit Sites `cb9cf548908f4fec935d11cf029987f58e4c9ce6`; o vínculo particular `.openai/hosting.json` foi excluído da publicação GitHub. Aplicação, migração, testes, dependências e workflow foram preservados. As diferenças são documentais e de ignore do vínculo Sites.

**[Execução GitHub Actions 36221322124](https://github.com/ofelipepeixoto/radar-oaas/actions/runs/36221322124)**: status `completed`, conclusão `success`, no commit do MVP acima, em Ubuntu com Node.js 24.

| Gate remoto | Resultado |
| --- | --- |
| `npm ci` | Aprovado |
| Lint e verificação de tipos | Aprovados |
| Testes unitários e adaptador IA | 104 aprovados |
| Integração SQL/RLS e fronteira HTTP | 14 aprovados |
| Build Astro/Cloudflare | Aprovado |
| Instalação padrão Chromium/Playwright | Aprovada |
| E2E em navegador | 10 aprovados |

A execução exibiu avisos não bloqueantes sobre runtimes das actions checkout/setup-node v4 (Node.js 20 forçado para 24) e migração da imagem `ubuntu-latest`. Revisar esses runtimes em manutenção futura; o workflow foi preservado e a CI concluiu com sucesso.

GitHub Private Vulnerability Reporting habilitado e confirmado na interface em 26/09/2026. Canal pela aba Security/opção de relato privado. Proteção de branch e regras obrigatórias de revisão/checks **não foram criadas**. O pacote permanece `UNLICENSED`; titular e licença efetiva continuam pendentes.

A CI aprovada pertence ao commit identificado acima. Esta atualização posterior registra seu resultado e altera somente documentação; não constitui nova execução de testes. Os 128 testes aprovados não substituem a homologação real de Auth/PostgREST, confirmação/recuperação e redirects entre duas contas, que permanece pendente.

Próximas etapas: [plano de execução](docs/next-steps.md).

## Homologação Auth — preparação de 26/09/2026

Configuração exclusivamente local corrigida: confirmação de e-mail obrigatória, redirects exatos de cadastro/recuperação, senha mínima de oito caracteres e cota local de 30 mensagens capturadas pelo Mailpit. Novo workflow usa containers descartáveis no GitHub Actions, sem credenciais hospedadas, mantendo administração fora do aplicativo. A suíte de navegador usa dois contextos, HTTP Astro e PostgREST reais; emails e traces não são publicados.

Primeira execução completa do job: [36222460714](https://github.com/ofelipepeixoto/radar-oaas/actions/runs/36222460714), commit `0a266dc3f2c316fd36fce102da327adeef31475a`. Instalação, lint, tipos, inicialização/migração Supabase e **cinco testes reais Auth/PostgREST/RLS aprovados**. O teste de navegador falhou por timeout no cadastro A: o seletor exato de senha ignorava o texto de ajuda incluído no rótulo. A correção pertence ao teste; a execução integral ainda precisa ser repetida. Containers removidos com sucesso ao final.

Leituras do ambiente publicado: `/api/projects` respondeu `401` sem sessão; `/auth/v1/settings` confirmou cadastro por e-mail habilitado, confirmação obrigatória e acesso anônimo desabilitado. Sites permanece privado. Essas leituras não validam login, entrega de email ou isolamento entre contas no ambiente hospedado. Nenhuma configuração global de Auth, tabela existente, plano ou licença foi alterada.
