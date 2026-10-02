# MVP público — 02/10/2026

Implementação em `feat/public-first-test`, sem merge implícito. `/avaliar` funciona sem cadastro ou IA paga, com quatro etapas, desconhecido separado de reprovação, plano de três passos, copiar, corrigir e apagar. MIT autorizada pelo proprietário; LICENSE e NOTICE delimitam o código e as exclusões.

Fontes reconciliadas: Sites `b97d446348194e0f127e65d19aa023dfa98f1926` e GitHub `3c0581c` têm o mesmo código; três diferenças posteriores de documentação/teste no GitHub foram preservadas. A versão publicada existente era v2 e acesso custom somente proprietário. Leitura integral do framework recebido nesta rodada: 15 páginas, 496 linhas, Library `libfile_a789b10e301881918c14cce7702d1ce3`. DOCX não foi publicado.

Verificações locais (Node 24.19.0, Chromium): lint e tipos aprovados (13 avisos informativos legados de depreciação); 129 testes unitários/IA, 14 de integração PostgreSQL WASM; build Astro/Cloudflare e build estático aprovados. Dois testes públicos passaram também no pacote estático real (desktop, 375 e 320 px, teclado, incompletos, não sei, copiar, editar, recarregar, apagar, exemplo separado e ausência de requests privados). Suíte completa: 18 testes de navegador aprovados em execução sequencial (45,9 s). CI remota será consultada após o commit. Uma primeira execução completa durante builds concorrentes falhou no cache Vite e no layout do progresso; layout corrigido e execução repetida em sequência.

`out` contém só três HTML e assets: sem Worker, `/api`, `/conta`, `/projetos`, URLs Supabase, chaves ou cliente de banco. Build completo e fontes privadas preservados. A publicação isolada não disponibiliza a interface avançada privada; dados Supabase e snapshots não são alterados. Homologação hospedada com duas contas/e-mail e testes com cinco leigos permanecem pendentes.

Publicação confirmada: Sites versão 3, commit canônico `576a00dd3b0ee48e775fa459c41c5d3d01fb4d72`, implantação `appgdep_6ac03a661dd081918da48162ded3389f`, status `succeeded`. URL: https://radar-oaas.radarjacarepagua.chatgpt.site. Acesso `public` confirmado pelo get_site, revisão 2. O pacote estático foi implantado ainda sob acesso privado e só depois liberado, evitando expor a versão privada anterior.

Acesso deslogado externo não pôde ser testado deste executor: o proxy respondeu `CONNECT tunnel failed, response 403` e o leitor web informou URL inacessível. Isso não foi um erro HTTP da aplicação. Não se afirma que houve teste de navegador em produção. Os fluxos foram testados sobre os bytes do pacote publicado; a saída reconstruída em `out/` coincidiu byte a byte.

Draft PR: https://github.com/ofelipepeixoto/radar-oaas/pull/1, sem merge. A CI Qualidade do MVP do commit inicial `55934e7` passou (run 37076260367); a CI do último commit deve ser consultada, sem herdar esse resultado. CLI GitHub retornou token inválido/Forbidden; usado o conector autenticado da conta correta. Helpers Sites ausentes no bootstrap; o fluxo nativo foi executado com clone/push autenticado efêmero via stdin, confirmação do SHA remoto, arquivo estático, save version e deploy. Primeira tentativa de pacote recusou o nome `public-dist`; corrigido para o diretório permitido `out` antes de salvar. Nenhuma mudança de conta, OAuth ou Supabase.

## Histórico anterior

# Estado verificável — 26/09/2026

## Jornada guiada — atualização de UX

A entrada agora explica a proposta e separa projeto privado de exemplo fictício. O guia tem quatro etapas por escolhas, sem opções pré-marcadas: cliente, entrega, descobertas e resultado. Texto livre aparece em “Outro”; nome é opcional na criação. O primeiro resultado reúne a intenção, uma dúvida principal e uma ação com perguntas de preparação. Avaliação completa segue acessível em “Aprofundar avaliação”.

`guidedIntake` opcional persiste no JSON do rascunho existente. Rascunhos legados, textos manuais, evidências, notas, etapas e snapshots são preservados. Nenhuma migração, configuração global de Auth ou alteração no Radar compartilhado foi necessária. A demonstração guiada usa uma chave separada do exemplo completo. IA paga permanece desativada.

Verificações locais desta rodada: lint e typecheck aprovados, 118 testes unitários/IA e 14 de integração aprovados. A suíte remota inclui 16 jornadas de navegador e o fluxo de duas contas locais com persistência do guia. Na primeira execução remota, 15 jornadas passaram; uma contagem de opções ocorria antes da hidratação da tela. O teste agora aguarda a primeira opção visível, sem modificar a aplicação ou enfraquecer a verificação. Resultados atualizados estão em [GitHub Actions](https://github.com/ofelipepeixoto/radar-oaas/actions). Testes com cinco leigos e homologação de e-mails no ambiente hospedado continuam pendentes. [Auditoria e critérios de aceite](docs/auditoria-ux-2026-09-26.md). Publicação privada concluída: Sites `b97d446348194e0f127e65d19aa023dfa98f1926`, implantação `appgdep_6ab76cb92dd4819186305cabb76e3c99`, `succeeded`. Código da jornada: GitHub `db0d9ebd18e5bf7c503e5ac563216e164b6dcd8d`. Os números nas seções históricas abaixo referem-se às versões anteriores.


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

- **Homologação hospedada:** autorizada em 26/09/2026 e ainda depende de dois e-mails controlados pelo usuário, SMTP e redirects do projeto compartilhado. O gate descartável já passou: cinco testes Auth/PostgREST e uma jornada completa de navegador com dois usuários sintéticos, conforme execução abaixo. Nenhum usuário de produção foi usado.
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

A CI básica aprovada pertence ao commit identificado acima. Os 128 testes dessa execução não incluíam Auth/PostgREST nem confirmação/recuperação. O gate real local executado posteriormente está registrado abaixo; a homologação hospedada continua pendente.

Próximas etapas: [plano de execução](docs/next-steps.md).

## Homologação Auth local aprovada — 26/09/2026

Configuração exclusivamente local corrigida: confirmação de e-mail obrigatória, redirects exatos de cadastro/recuperação, senha mínima de oito caracteres e cota local de 30 mensagens capturadas pelo Mailpit. Novo workflow usa containers descartáveis no GitHub Actions, sem credenciais hospedadas, mantendo administração fora do aplicativo. A suíte de navegador usa dois contextos, HTTP Astro e PostgREST reais; emails e traces não são publicados.

**Execução aprovada:** [36223385630](https://github.com/ofelipepeixoto/radar-oaas/actions/runs/36223385630), commit `4aa6261f8c64b1ed59de5857dec16f6c7959937f`, job `108352725227`, `completed/success`. Instalação, lint, tipos, inicialização/migração Supabase, Chromium, **cinco testes Auth/PostgREST/RLS e uma jornada integral de navegador passaram**. O job também removeu os containers com sucesso.

Cobertura executada: duas contas criadas pela UI e confirmadas pelo Mailpit; ausência de sessão antes da confirmação; gravação e retomada de projeto; conta B funcional em seu próprio projeto; bloqueio de leitura, alteração, exclusão, exportação, avaliação e experimento no projeto A; bloqueio direto PostgREST; token adulterado/ausente e proprietário forjado; finalização/exportação/exclusão pelo dono; recuperação real por email local, rejeição da senha antiga, login com a nova senha e logout. Astro HTTP, Auth e PostgREST não foram mockados. O servidor foi iniciado em modo de desenvolvimento; esse resultado não certifica por si só o Worker de produção.

Tentativas anteriores permaneceram registradas: `36222460714` e `36222889868` falharam no seletor de senha, cujo rótulo concatena o texto de ajuda; `36223109102` avançou até a verificação B e revelou que o helper HTTP precisava enviar `Origin` em DELETE, como o navegador. Corrigidos somente os testes, mantendo a proteção CSRF do Astro e as expectativas de isolamento. Os cinco testes Auth/PostgREST passaram nessas tentativas. Não foi necessário alterar código do aplicativo ou migração.

Leituras do ambiente publicado: `/api/projects` respondeu `401` sem sessão; `/auth/v1/settings` confirmou cadastro por e-mail habilitado, confirmação obrigatória e acesso anônimo desabilitado. Sites permanece privado. Essas leituras não validam login, entrega de email ou isolamento entre contas no ambiente hospedado. Nenhuma configuração global de Auth, tabela existente, plano ou licença foi alterada.
