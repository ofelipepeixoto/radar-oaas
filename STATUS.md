# Estado verificável — 26/09/2026

MVP experimental **Radar OaaS — Avaliador de Prontidão**. Stack vigente: Astro 7.3.5, React 19.2.6, TypeScript e adaptador Cloudflare 14.3.3. Sites privado é o destino de hospedagem. O repositório público [ofelipepeixoto/radar-oaas](https://github.com/ofelipepeixoto/radar-oaas) foi criado em 26/09/2026; envio inicial do MVP em andamento e CI remota ainda não executada. Licença definitiva e titular continuam pendentes. Não houve contratação de plano pago nem uso da API paga da OpenAI.

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

- **Homologação autenticada completa:** a suíte real `tests/supabase/live.test.ts` existe, mas não foi executada porque Docker/Supabase local não estavam disponíveis. Testar duas contas, confirmação/recuperação, redirects, gravação/retomada/exportação/exclusão. Não confundir PGlite com validação de Auth/PostgREST. Nenhum usuário real foi usado para testes.
- **E-mails de Auth:** os redirects precisam ser conferidos na allowlist do projeto compartilhado antes de liberar cadastro/recuperação ao público. A configuração global existente foi preservada.
- **GitHub e CI remota:** repositório público [ofelipepeixoto/radar-oaas](https://github.com/ofelipepeixoto/radar-oaas) criado e confirmado em 26/09/2026, branch `main`, commit inicial de README `7bf59c62774c482563ddcccec1e1cb6fea2900b0`. Envio inicial do MVP em andamento; CI remota ainda não executada. A cópia parte do commit Sites `cb9cf548908f4fec935d11cf029987f58e4c9ce6`, sem o vínculo particular `.openai/hosting.json`, preservando código, migração e workflow. Licença efetiva e titular continuam pendentes; pacote `UNLICENSED`.
- **Relato de segurança:** GitHub Private Vulnerability Reporting habilitado em 26/09/2026 e confirmado na interface do repositório. Canal pela aba Security/opção de relato privado. Recebimento de teste, equipe dedicada e SLA não foram confirmados.
- **OpenAI:** adaptador de Responses preparado, mas IA real desativada (`AI_PROVIDER=simulated`, `AI_ENABLED=false`). Chave/modelo não configurados; consumo pago zero nesta implementação. Limites de tokens não equivalem a teto monetário.
- **WebMCP:** duas ações opcionais implementadas; o navegador de verificação não disponibiliza `document.modelContext`. Validação funcional indisponível; a interface comum funciona sem essa capacidade.
- **VPS:** não modificada. Uma alternativa Node exigiria adaptador e implantação específicos; os arquivos de container incompatíveis foram retirados.
- **Validação do produto:** protocolo exploratório preparado, sem participantes ou resultados. Não há evidência de superioridade competitiva ou previsão de sucesso empresarial.

## Publicação

Publicação Sites confirmada com status terminal `succeeded` para o commit `cb9cf548908f4fec935d11cf029987f58e4c9ce6`. Endereço: https://radar-oaas.radarjacarepagua.chatgpt.site. A visibilidade permanece privada. Publicação técnica não encerra a homologação de Supabase Auth/PostgREST nem valida o produto comercialmente.

A preparação GitHub desta cópia altera somente documentação e a exclusão do vínculo particular Sites; não altera aplicação, testes, migração ou workflow. Por isso, a suíte completa não foi reexecutada por essa mudança documental. A comparação de integridade com o commit de origem e a CI remota devem ser registradas separadamente.

Próximas etapas: [plano de execução](docs/next-steps.md).
