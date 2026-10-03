# Rastreabilidade

Fonte editorial `2026-09-23`; regras `0.1.0-experimental`. “Framework” identifica o DOCX; “especificação” identifica o prompt anexado. Esta matriz vincula requisitos a implementação e verificações existentes. **Arquivo de teste existente não significa teste executado:** resultados, contagens e bloqueios ficam em [STATUS.md](../STATUS.md).

Os IDs abaixo (`REQ-*`) organizam rastreabilidade documental; os códigos executáveis constam em [decision-table.md](decision-table.md). `U` = `tests/unit/domain.test.ts`; `AI` = `tests/ai/analysis.test.ts`; `SDK` = `tests/ai/openai-provider.test.ts`; `RLS` = `tests/integration/rls.test.ts`; `API` = `tests/integration/api-boundary.test.ts`; `C` = `tests/unit/comparison.test.ts`; `E2E` = `tests/e2e/workbench.spec.ts`; `LIVE` = `tests/supabase/live.test.ts` (Supabase local real, pré-requisito Docker; não coberto pelo PGlite).

## Produto e metodologia

| ID | Fonte/requisito | Regra ou implementação | Tela/saída | Verificação correspondente |
| --- | --- | --- | --- | --- |
| REQ-01 | Framework §§01/03; especificação §04: categoria/cunha | `schema.ts` → `modelClassification`, `canvas`; `experiments.ts` → `wedgeDefinition`, `commercialProposal` | Canvas; categorias combináveis; proposta editável | Schema; roteiro manual de jornada em testing.md |
| REQ-02 | Framework §02; especificação §05: oito critérios originais | `constants.ts` → `CRITERIA`; `engine.ts` → `reviewRating` | Critérios e tabela do relatório | U: critérios não preenchem blocos; notas sem sustentação |
| REQ-03 | Framework §02: 0 diferente de N/D | `ratingSchema`; `reviewRating` | N/D explícito; sem zero artificial | U: todos ausentes; zero desfavorável; nota inválida |
| REQ-04 | Especificação §05: evidência, revisão autodeclarada e confiança separada | `evidenceSchema`, `reviewSchema`, `isReviewedEvidence` | Evidências; autoria/data/período/coorte | U: URL sem revisão; confiança não multiplica nota; referência inexistente |
| REQ-05 | Especificação §05: fracasso forte não vira nota alta | `reviewRating`: direção e replicação | Justificativa da nota rejeitada | U: fracasso replicado; coortes e períodos distintos |
| REQ-06 | Framework §11; especificação §06: seis blocos com notas próprias | `constants.ts` → `BLOCKS`, `BLOCK_WEIGHTS` | Scorecard separado | U: oito critérios independentes; seis blocos completos |
| REQ-07 | Especificação §06: cobertura e índice parcial | `calculateScorecard` (`proposta_mvp`) | Índice parcial + cobertura; total completo N/D | U: 20%/5 → 100 parcial, cobertura20%; pesos inválidos; ausentes |
| REQ-08 | Framework §11; especificação §07: travas prevalecem | `decide` → `GATE_CONFIRMED_*` | Recomendação, causas e condições | U: travas parametrizadas; grave prevalece sobre pivô; revisão humana |
| REQ-09 | Especificação §07: margem estrutural exige análise | `assessedGate`, `structuralAnalysisReviewed` | Trava de margem com fundamento | U: confirmação estrutural; margem isolada não confirma trava |
| REQ-10 | Framework §12; especificação §07: decisão por estágio | `TRANSITION_CHECKS`, `decide` | Próxima etapa e evidências utilizadas | U: mesmos dados/etapas; ideia sem pagamento; pendência precede falha |
| REQ-11 | Especificação §07: metas antes do piloto | `pilotTargetsSchema`, `decide` | Operação/metas do piloto | U: metas ausentes e metas posteriores inválidas |
| REQ-12 | Especificação §07: revisão/pivô/iteração | `TEST_FAILED_*`, `CRITICAL_EVIDENCE_MISSING` | Explicação e lacunas | U: aceite falho com/sem fundamento de pivô |
| REQ-13 | Framework §04; especificação §08: ficha de resultado | `resultDefinitionSchema` | Operação: unidade, relógio, aceite, exceções, dados, remédio | Schema; inspeção/jornada; não é contrato jurídico |
| REQ-14 | Framework §§05/06; especificação §08: operação/autonomia/riscos | `operationStepSchema`, `riskSchema`, `autonomy` | Operação, sete etapas, riscos e escalonamento | Schema; inspeção/jornada por teclado |
| REQ-15 | Framework §05: capacidade humana | `economics.ts` → `calculateCapacity`; `HUMAN_CAPACITY_INSUFFICIENT` | Economia e relatório | U: 240 minutos; percentuais/contagens; margem/demanda não superam falta de revisão |
| REQ-16 | Framework §07: economia por aceito | `calculateEconomics`, `calculateHumanCostCents` | Economia e diagnóstico | U: R$500/25%; R$20/1%; centavos; denominadores zero |
| REQ-17 | Especificação §09: custos ausentes/duplicados/incompatíveis | `costItemSchema`, `calculateEconomics` | Lacunas/erros de custos e rateio | U: ausentes; rejeitados/retrabalho; chave de rateio; moeda/período/coorte/unidade; custo humano |
| REQ-18 | Especificação §09: receita recebida separada da reconhecida | `economicsSchema`; contribuição após aquisição | Economia | U: receita reconhecida/recebida; aquisição/onboarding |
| REQ-19 | Framework §§10/11: cenários e estresse 10/100/1000 | `scenarioSchema`, `stressScenario` | Cenários conservador/central/otimista | U: horas120/1200/12000; margem não melhora com volume |
| REQ-20 | Framework §10: bottom-up limitado pela capacidade | `bottomUpSchema`, `calculateBottomUp` | Mercado na economia | U: capacidade limita volume; capacidade ausente → receita N/D |
| REQ-21 | Framework §08: preço por impacto | `pricingSchema`; `decide` valida baseline/atribuição/janela/contestação | Operação/preço | U: preço por impacto exige quatro campos |
| REQ-22 | Framework §§09/11: aprendizado/defensibilidade | `comparison.ts` → `compareSnapshots`, `identifyOperationalSignals`; `operationalSignals` | Aprendizado; snapshots comparáveis; alertas descritivos | C: qualidade/custo/horas; mix/rubrica/janela/versões; seis sinais operacionais; alertas não alteram score/decisão |
| REQ-23 | Framework §12; especificação §10: plano/experimento | `plan90Days`, `defaultPlan90Days`, `experimentSchema`, `suggestExperiment` | Experimentos; fases da agenda90dias editáveis | U: falta de direitos → pesquisa segura; C: edição preserva constantes/snapshots; E2E: salvar/restaurar/remover experimento |
| REQ-24 | Especificação §11: explicabilidade e aviso | `Decision`/`AssessmentResult`, `DISCLAIMER` | Relatório em ordem declarada | U: ruleCodes/evidências/lacunas; inspeção da interface; piloto de compreensão ainda não realizado |

## Persistência, segurança e IA

| ID | Fonte/requisito | Implementação | Tela/saída | Verificação correspondente |
| --- | --- | --- | --- | --- |
| REQ-25 | Especificação §§03/12: rascunhos privados, múltiplos projetos por dono | `src/server-api/projects/`; `src/lib/supabase/`; `oaas_projects` | `/conta`, `/projetos`, `/projetos/[id]` | RLS: dono; API: sessão/configuração; LIVE: criar/salvar/retomar |
| REQ-26 | Especificação §12: snapshots versionados | `snapshots.ts`; endpoint `assessments`; `oaas_assessments` | Histórico | U: versão/imutabilidade; RLS: snapshot imutável; E2E: reavaliação preserva histórico; LIVE: finalização/export |
| REQ-27 | Especificação §07: confirmar transição | `confirmTransition`; atualização validada no servidor | Confirmação de estágio | U: sem confirmação/decisão bloqueada não avança; snapshot preservado |
| REQ-28 | Especificação §§03/14: exportação/exclusão | Endpoints `export` e `DELETE /api/projects/[id]`; cascatas SQL | Downloads/remoção | RLS: exportação lógica e cascatas; LIVE: autorização de export/exclusão; E2E: JSON/Markdown versionados |
| REQ-29 | Especificação §14: leitura/criação/alteração/exclusão por proprietário | Migração `20260926042935_oaas_isolated_mvp_initial.sql`, server auth | Modo privado | RLS: todas cinco tabelas, dono forjado, filho de outro projeto; LIVE: endpoints entre A/B |
| REQ-30 | Especificação §14: falhar fechado/sem segredo no cliente | `src/lib/supabase/config.ts`, `server.ts` | Mensagens 401/503/400 | API: sem config/sessão; demo flag não autentica; chave administrativa recusada |
| REQ-31 | Especificação §14: conteúdo malicioso é dado | Schemas estritos; escaping de render/export; nenhuma busca de URL | Evidência textual/relatório | U: injeção não muda pesos; URL javascript/IDs duplicados; AI: sem ferramentas; RLS: conteúdo armazenado como texto |
| REQ-32 | Especificação §13: interface IA e simulação determinística | `src/lib/ai/schema.ts`, `mock.ts`, `service.ts` | Assistência rotulada | AI: simulado determinístico/sem chave; U: domínio determinístico |
| REQ-33 | Especificação §13: autorização/opt-in/referências | `/api/analysis`; IDs selecionados do rascunho salvo | Sugestões pendentes | AI: projeto diferente, sem consentimento, referência/citação falsa, score extra |
| REQ-34 | Especificação §13: SDK oficial/saída estruturada | `openai-provider.ts`, `server.ts` | Provedor real só configurado explicitamente | SDK: payload mínimo, schema, store:false, zero retry, configuração incompleta |
| REQ-35 | Especificação §13: tamanho/tempo/chamadas/custo | `service.ts`; `oaas_reserve_ai_call`; `oaas_private.ai_usage` | Fallback manual | AI: limite/timeout/recusa/erro/quota; RLS: reservas por usuário e implantação; limite monetário externo depende do operador |
| REQ-36 | Especificação §14: demo separada do banco privado | Fixtures sintéticas + `/demo`; endpoints sempre autenticados | Demonstração | API: demo flag sem acesso; AI: nenhuma chamada real; E2E: interceptação verifica ausência de requests privados/provedor na demo |
| REQ-37 | Autorização posterior: coexistência em Supabase radar-disruptivo | Prefixo `public.oaas_*`, schema `oaas_private`; ADR-003 | Infraestrutura | RLS: sentinelas de tabelas/schemas/dados/grants prévios; verificação remota de fingerprints registrada em STATUS |

## Comunidade e homologação

Homologação Auth autorizada pelo usuário em 26/09/2026. `tests/auth/` acrescenta a jornada de cadastro, confirmação e recuperação com Mailpit, dois navegadores e requisições HTTP reais. `.github/workflows/auth.yml` executa essa jornada e `LIVE` em Supabase descartável; `STATUS.md` registra a execução efetiva. O gate local não certifica SMTP/redirects do ambiente compartilhado hospedado.

Execução efetivamente aprovada: [36223385630](https://github.com/ofelipepeixoto/radar-oaas/actions/runs/36223385630), commit `4aa6261f8c64b1ed59de5857dec16f6c7959937f`: `LIVE` (cinco casos) e `tests/auth/access.spec.ts` (uma jornada integral). Aplicativo e migração preservados; alterações de seletores e cabeçalho Origin pertencem somente ao teste HTTP.

| ID | Fonte/requisito | Artefato | Verificação/limite |
| --- | --- | --- | --- |
| REQ-38 | Especificação §15: documentação e comunidade | README, CONTRIBUTING, CODE_OF_CONDUCT, SECURITY, GOVERNANCE, CHANGELOG, ROADMAP, AGENTS, issue/PR templates | Inspeção de arquivos/links; templates não são issues abertas |
| REQ-39 | Especificação §02/15: direitos e fonte | `LICENSE-PROPOSED.md`, `source-issues.md`, original excluído | MVP publicado no repositório público `ofelipepeixoto/radar-oaas`; titular/licença efetiva pendentes; pacote UNLICENSED |
| REQ-40 | Especificação §15: CI | `.github/workflows/` conforme arquivos efetivos | [CI 36221322124](https://github.com/ofelipepeixoto/radar-oaas/actions/runs/36221322124) aprovada no commit `5e53d58210f81afed34b436f069a7ab55e83c3e4`; 104 unitários/IA + 14 integração + 10 E2E |
| REQ-41 | Especificação §16: validação do próprio avaliador | `evaluator-pilot.md`, `next-steps.md` | Homologação e piloto comercial distintos; proposta exploratória de 5 organizações/10 projetos/30 dias, sem participantes/resultados inventados |
| REQ-43 | Instrução posterior: Astro/Sites | `astro.config.mjs`, `src/pages`, `src/views`, `src/layouts/Base.astro`, `src/server-api`, `wrangler.jsonc`; ADR-004 | Reexecutar tipos/testes/build/e2e/runtime; Sites privado; sem herdar aprovação Next.js |
| REQ-42 | Especificação §§16/17: entrega testada e reproduzível | `testing.md`, `deployment.md`, `deploy/README.md`, STATUS | Contagens e bloqueios reais; Auth/Docker/deploy/CI não inferidos de unitários |

## Limitações a fechar explicitamente

- Testes PGlite/API sem rede não substituem `LIVE`, que exige Supabase local descartável com Docker; a suíte rejeita hosts remotos para evitar criar/apagar contas em produção.
- A comparação automática de snapshots exige mesmo projeto, regras/framework, moeda/unidade, ICP/mix, duração de janela e revisão de comparabilidade. Rubrica/direção de qualidade diferente resulta em delta N/D. Os seis sinais são declarações ou comparações descritivas, sem inferir causalidade ou alterar score/travas.
- Sugestões de experimento e plano de90dias são rascunhos editáveis; metas não preenchidas não contam como sucesso. O app não verifica documentos externos, profissões/licenças ou veracidade de autodeclarações.
- Acessibilidade exige teste assistivo adicional e piloto de compreensão; responsividade/tabelas/teclado não equivalem a certificação de conformidade.
- Publicação GitHub, licença final, Auth real, container e deploy possuem gates próprios; conferir o estado corrente em STATUS.

## Preparação documental para GitHub — 26/09/2026

Destino autorizado: `ofelipepeixoto/radar-oaas`. A cópia preserva aplicação, migração, testes e workflow do commit Sites `cb9cf548908f4fec935d11cf029987f58e4c9ce6`; as alterações se limitam a documentação e à remoção/ignore do vínculo particular Sites. Não muda versão de regras, resultados ou cobertura executada. O MVP foi publicado em 26/09/2026 no repositório público, branch `main`, commit `5e53d58210f81afed34b436f069a7ab55e83c3e4`. Os 197 arquivos publicados correspondem, por conteúdo, à cópia preparada; árvore Git `4d071e2a5638a17f611a916710e42c00cf5dfd16`. A [CI remota 36221322124](https://github.com/ofelipepeixoto/radar-oaas/actions/runs/36221322124) concluiu com `success` todos os gates: instalação, lint, tipos, build, instalação Chromium e 104 testes unitários/IA, 14 de integração e 10 E2E. O relato privado de vulnerabilidades foi habilitado; nenhuma proteção de branch foi criada. Licença/titular e homologação Auth/PostgREST com duas contas permanecem pendentes.

## Simplificação de UX — 26/09/2026

| Requisito do usuário | Implementação | Evidência de verificação |
| --- | --- | --- |
| Menos texto e linguagem acessível | `home.tsx`, `guided-journey.tsx`, quatro etapas, radios nativos e “Outro” condicional | `guided.spec.ts`: fluxo por escolhas, teclado e viewport móvel (execução na CI) |
| Respostas orientam o próximo passo | `guided.ts`: resumo, dúvida e ação determinísticos | `guided.test.ts`: ramificações e incertezas; sem notas ou evidências inferidas |
| Salvar e retomar sem perda | `guidedIntake` opcional e patch de campos administrados | Unidade: drafts legados e edição manual; navegador: voltar/recarregar; Auth: GET privado após reload |
| Não interferir no Radar | Nenhuma alteração SQL, RLS ou Auth; draft JSONB existente | Diff da implementação; suíte de isolamento continua obrigatória |
| Tornar produto compreensível para vender | Auditoria e roteiro de teste em `auditoria-ux-2026-09-26.md` | Teste com cinco leigos e validação comercial ainda pendentes; nenhuma alegação de PMF |

## 03/10/2026 — fronteira de UX e recuperação

- `src/components/private-api.ts`: status de falha e uma chamada HTTP com timeout, sem retry automático.
- `src/components/private-feedback.tsx`, views privadas, account e workbench: próximo passo, foco, preservação em memória e edição bloqueada enquanto salva.
- `src/components/private-response.ts`: shapes da lista e ID criado validados antes de state/navegação; JSON inesperado tem mensagem local.
- `src/lib/auth-feedback.ts`: mensagens Auth por código, sem diagnóstico bruto do provedor.
- `tests/unit/private-api.test.ts`: ausência de cliente/sessão, falha de lookup, HTML inesperado, códigos 401/403/404/429/503, resposta inválida, rede sem repetição e mensagem Auth.
- `tests/ux/recovery.spec.ts` e `playwright.ux.config.ts`: doze regressões com UI real e backend/sessão mockados. Evidência e limites em `docs/ux-recovery-2026-10-03.md`.
- Sem alteração em engine, cálculos, snapshots, migrações, autorização de servidor ou políticas RLS.

## Controle de segredos — bootstrap local

- `.github/workflows/segredos.yml`: política/código da base, conteúdo de PR somente como dados Git.
- `.github/workflows/segredos-fixtures.yml`: onze fixtures sintéticas; não certifica histórico real como limpo.
- `.security/gitleaks.toml`, scripts de instalação e scan: release 8.30.1 com SHA-256 fixo, bare mirror, redaction e saída sanitizada; scanner incompleto bloqueia.
- `tests/test_secrets.py`: arquivos limpos, marcador sintético, erro de configuração, segredo removido, gap multipart/verbose reproduzido, bypass de política de PR, mirror de refs e shallow/timeout.
- `licenses/`: MIT de scanner e controles próprios; licença geral do pacote continua `UNLICENSED`.
