# Verificação reproduzível

O resultado efetivamente executado fica em [STATUS.md](../STATUS.md), com ambiente, contagens e bloqueios. Este documento descreve comandos/cobertura; não afirma que todo gate remoto foi aprovado.

## Instalação e qualidade básica

```bash
npm ci
npm run lint
npm run typecheck
npm run test:unit
npm run test:integration
npm run build
```

Use Node compatível com `engines` e as dependências do lockfile. Não trocar versões silenciosamente para esconder falha. `typecheck` executa `astro check` e `tsc --noEmit`; `test:unit` inclui `tests/unit` e `tests/ai`; domínio não requer banco, rede, chave ou serviço pago. Testes do SDK usam mocks explícitos.

## Integração SQL/RLS sem Docker

`npm run test:integration` executa migrações em **PostgreSQL WASM/PGlite**, com duas identidades sintéticas e funções de contexto de autenticação de teste. O SQL das migrações e políticas é real; Supabase Auth, PostgREST, rede e email não são simulados como se tivessem sido validados.

Cobertura: RLS em todas as tabelas `oaas_*`, preservação por sentinela de tabelas/schemas/grants/dados anteriores, isolamento de leitura/exportação lógica, inserção com dono forjado, alteração/exclusão entre contas, referências filhas de outro dono, imutabilidade de snapshots, exclusão em cascata, sincronização atômica de evidências e quota durável de IA. Consulte `tests/integration/rls.test.ts`. A suíte também inclui `tests/integration/api-boundary.test.ts`, cobrindo falha segura sem sessão/configuração, rejeição de dono forjado, chave administrativa no cliente e limites reais de payload antes da rede.

Não confundir essa suíte com teste da jornada autenticada completa. Um resultado verde aqui não fecha o gate de produção.

## Supabase local completo

Pré-requisitos adicionais: Docker/containers funcionando e Supabase CLI instalada pelo `npm ci`.

```bash
npx supabase start
npx supabase db reset --local --no-seed
```

O reset destrói somente os dados do banco local indicado pela configuração; use ambiente descartável. Configure `.env.local` com URL/chave pública local antes de iniciar o aplicativo. A configuração de autenticação/email está em `supabase/config.toml`; qualquer mudança precisa constar no registro do teste.

A suíte real existente é `tests/supabase/live.test.ts`. Ela cria e remove contas sintéticas somente em host local; rejeita destino hospedado. Forneça em ambiente reservado de teste `SUPABASE_TEST_URL`, `SUPABASE_TEST_ANON_KEY` e `SUPABASE_TEST_SERVICE_ROLE_KEY` obtidas da CLI local (a última serve apenas para preparar/remover contas de teste, nunca para runtime ou browser). Não imprimir/copiar essas chaves em chat ou repositório.

```bash
npm run test:supabase
```

Sem pré-requisitos a suíte falha explicitamente, não omite testes silenciosamente. Ela cobre Auth/REST e os handlers privados: salvar/retomar, isolamento A/B, token adulterado, proprietário forjado, snapshot/export, experimento e exclusão. É separada de `test:integration` para que o teste local sem Docker continue claro.

Para homologação, criar contas A e B distintas; A cria projeto/evidência/avaliação/experimento, B tenta ler/criar/alterar/excluir/exportar os IDs de A, incluindo payload com `owner_id` forjado. Verificar que A continua operando e pode exportar/excluir seus próprios dados. Acessos sem sessão e com sessão expirada devem falhar sem expor conteúdo. Registrar respostas sanitizadas e commit.

**Limite desta entrega:** quando Docker/Supabase local ou destino remoto não estiver disponível, essa validação completa fica explicitamente bloqueada. Não substituir por um login falso e anunciar integração real concluída.

### Cadastro, e-mail e recuperação com duas contas

O workflow `.github/workflows/auth.yml` provisiona um Supabase descartável no runner GitHub, sem vincular ou acessar projetos hospedados. Aplica a migração local e executa `test:supabase` e `test:auth`. `scripts/ci/local-supabase-env.mjs` lê o status da CLI sem imprimir credenciais, exige endpoints locais e mascara os valores no log.

Para execução manual local, forneça também `SUPABASE_TEST_MAIL_URL` (Mailpit, porta 54324), `PUBLIC_SUPABASE_URL` e `PUBLIC_SUPABASE_PUBLISHABLE_KEY` com os valores locais. Execute `npm run test:auth`. A suíte inicia Astro em `http://127.0.0.1:3000`, usa Chromium com dois contextos e testa cadastro, confirmação, recuperação e isolamento por HTTP. Ela rejeita URLs remotas e não publica traces, capturas, mensagens de e-mail ou sessões.

O arquivo `supabase/config.toml` é **exclusivamente local**: confirmação obrigatória, senha mínima de oito caracteres, redirects exatos para `/projetos` e `/conta/redefinir`, cota de 30 mensagens por hora no capturador local. Não sincronizar esse arquivo ao projeto compartilhado. Mailpit captura mensagens sem enviá-las a destinatários externos. Ao terminar, use `npx supabase stop --no-backup` somente nessa instância descartável.

Esse gate comprova a integração com serviços reais locais; a homologação do Sites hospedado exige duas contas com e-mails autorizados, confirmação da allowlist de redirects e do SMTP existente. Não criar membros da organização, alterar SMTP global nem desativar confirmação para contornar limitações de entrega. Logout remove a sessão do navegador; não presumir revogação instantânea de todo JWT previamente emitido.

## Navegador e jornada

```bash
npx playwright install chromium
npm run test:e2e
```

Playwright inicia `npm run dev` por padrão. Para um servidor já iniciado, configure `PLAYWRIGHT_BASE_URL`; não use um ambiente com dados reais. Em CI, dependências do navegador podem exigir `npx playwright install --with-deps chromium`.

A suíte `tests/e2e/workbench.spec.ts` cobre comportamento real do navegador: trocar exemplos, salvar/retomar canvas, evidências/revisão, critérios e score parcial, snapshots, JSON/Markdown, experimentos, ausência de tráfego privado na demo e falha segura sem sessão. Demo e fail-closed sem banco podem ser testados sem credenciais. A jornada privada completa depende do ambiente autenticado descrito acima e deve ter seu status próprio.

Após a migração para Astro, repetir a suíte contra o servidor Astro/Worker; um resultado da implementação anterior não deve ser reutilizado como aprovação do runtime atual. `npm run build` e `npm run start` verificam respectivamente a saída Cloudflare e sua execução local em Wrangler, com gates próprios.

Jornada de aceite: criar projeto → salvar rascunho → retomar → registrar evidência → revisar notas → gerar diagnóstico → exportar → registrar experimento → reavaliar → confirmar estágio permitido → excluir. Checar estado visível de salvamento, mensagens úteis, teclado, tabelas de N/D, conteúdo malicioso tratado como texto e impressão do relatório.

## Cobertura crítica esperada

| Área | Casos e resultado esperado |
| --- | --- |
| Ausência/score | Todos ausentes → N/D; 0 desfavorável ≠ N/D; peso20%/nota5 → índice parcial100/cobertura20%; nota/peso inválido → rejeição |
| Evidências | Hipótese sem prova, referência inexistente ou fracasso favorável indevido não sustenta nota; nota5 exige repetição |
| Decisão | Trava vence score; ideia vai à pesquisa; etapas diferem; metas ausentes e capacidade insuficiente bloqueiam avanço |
| História | Novo rascunho/regra não reescreve snapshot; transição precisa de confirmação |
| Comparação | Mesmo projeto/versões/moeda/unidade/mix/janela + revisão; diferença de rubrica impede delta de qualidade; alertas são descritivos e não alteram decisão |
| Economia | R$500/25% e R$20/1%; zero denominador → N/D; custo ausente não vira zero; rejeitados/retrabalho incluídos; duplicatas/incompatibilidades recusadas |
| Escala | 240 minutos de revisão no exemplo; volume aumenta horas sem automação presumida; capacidade limita receita bottom-up |
| IA | Opt-in, limite, referência inválida, citação falsa, timeout, recusa e erro preservam fluxo manual; ausência de segredo/payload bruto no retorno |
| Acesso | Duas identidades não cruzam dados; dono forjado falha; demo não acessa privado; exclusão remove snapshots |

Os arquivos e os testes que efetivamente existem estão em [traceability.md](traceability.md). Teste ainda não implementado/executado deve ser identificado, não contado como aprovado.

## CI e aceite

Workflow de pull request deve rodar lint, tipos, unitários, integração, navegador e build, com permissões mínimas e ações fixadas de modo verificável. Forks não recebem segredos. A CI remota só pode ser chamada de aprovada após consultar a execução real do commit publicado.

Aceite técnico exige jornada funcional, testes críticos, cálculos reproduzíveis, privacidade verificada e documentação executável. Não equivale a validação estatística; o piloto do avaliador possui protocolo separado. Conserve evidência de falhas e bloqueios no status, especialmente Auth real, build container e deploy quando não executados.

`tests/unit/comparison.test.ts` cobre comparabilidade, ausência de dados, preservação de versões, sinais de esforço/qualidade/onboarding, transferência de trabalho ao cliente, independência de score e plano de90dias editável. Nenhuma comparação prova causalidade.
