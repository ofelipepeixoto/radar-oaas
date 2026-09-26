# Execução e publicação — Astro / Sites

## Destino vigente

A aplicação usa **Astro7 com ilhas React e adaptador Cloudflare**, conforme instrução posterior do usuário. O destino atual é **Sites privado**. Consulte `STATUS.md` para criação/publicação, URL real, commit e validações; site criado não equivale a build/deploy aprovado.

O repositório público [ofelipepeixoto/radar-oaas](https://github.com/ofelipepeixoto/radar-oaas) foi criado em 26/09/2026, branch `main`. Envio inicial do MVP em andamento; CI remota ainda não executada. Licença do código e titular continuam pendentes; conferir os próximos resultados em `STATUS.md`. Supabase está no projeto compartilhado autorizado `radar-disruptivo`, com objetos `public.oaas_*` e schema interno `oaas_private`. A criação dedicada Free inicial foi bloqueada por cota, sem upgrade pago.

## Desenvolvimento e build local

Use Node compatível com `engines` e dependências do lockfile:

```bash
npm ci
npm run dev
```

O servidor Astro usa a porta3000. A raiz e `/demo` abrem o avaliador sintético; o modo privado exige Supabase configurado. Para configurar localmente, copie `.env.example` para `.env.local` e preencha apenas URL/chave pública local autorizada. Use `PUBLIC_SUPABASE_URL`, `PUBLIC_SUPABASE_PUBLISHABLE_KEY` (ou fallback `PUBLIC_SUPABASE_ANON_KEY`), `ASTRO_TELEMETRY_DISABLED=1` e `AI_PROVIDER=simulated`. Não incluir credenciais em arquivos versionados ou na documentação.

```bash
npm run lint
npm run typecheck
npm run test:unit
npm run test:integration
npx playwright install chromium
npm run test:e2e
npm run build
npm run start
```

`typecheck` executa Astro check e TypeScript. O build gera `dist/server/index.js` como entrada fetch do Worker e assets em `dist/client`. `npm run start` roda **Wrangler local** com `dist/server/wrangler.json`, a configuração gerada; abra a URL indicada no terminal. Não é comando de servidor Node/standalone nem publicação remota.

Os resultados precisam ser registrados especificamente após a migração para Astro. Testes de domínio anteriores não comprovam wrappers HTTP, resolução de configuração, bundle ou runtime Cloudflare.

## Sites privado

Usar o fluxo autorizado do Sites para build, prévia e publicação; preservar visibilidade privada. O build deve receber a URL e a chave pública de Supabase corretas. Segredos de IA, se um dia habilitados, permanecem exclusivamente no runtime do servidor, sem prefixo `PUBLIC_`. IA real continua desligada nesta entrega.

Após publicar, verificar as rotas do avaliador, assets, metodologia, tratamento sem sessão e comunicação autorizada com Supabase. Registrar URL real e versão. O acesso privado do Sites e a autorização por proprietário no Supabase são camadas distintas; não presumir que uma dispense a outra.

Não habilitar telemetria de conteúdo, serviços pagos ou migração de plano para resolver falhas de build. Bloqueios devem ser relatados com a causa real. O comando local Wrangler não é evidência de que Sites publicou com sucesso.

## Supabase local completo

Para desenvolvimento descartável, Docker e Supabase CLI são pré-requisitos adicionais:

```bash
npx supabase start
npx supabase db reset
npm run test:supabase
```

O reset apaga dados do banco local: não usar em destino remoto. `test:supabase` requer as três variáveis de teste descritas em `testing.md`, cria/remove contas sintéticas somente em host local e falha explicitamente sem pré-requisitos. PGlite não substitui essa verificação de Auth/REST. Migrações ficam em `supabase/migrations/`.

## Supabase compartilhado autorizado

A migração cria tabelas/funções próprias `public.oaas_*` e `oaas_private`. A aplicação remota e fingerprints comparativos estão registrados no STATUS. Preservar tabelas, políticas, grants, dados e configurações anteriores do Radar. Não mudar schemas expostos, Auth, chaves globais, plano ou serviços de outros produtos.

Auth, recursos de banco, conexões, cotas e disponibilidade são compartilhados. Prefixos/RLS separam dados e objetos de aplicação, mas não asseguram isolamento de carga ou disponibilidade. Exclusão de projeto OaaS não exclui conta global de Auth. Testar os fluxos reais com duas identidades sem afetar usuários/dados do outro produto.

## GitHub: repositório criado e envio inicial

Repositório público criado e confirmado em 26/09/2026: [ofelipepeixoto/radar-oaas](https://github.com/ofelipepeixoto/radar-oaas), branch `main`, commit inicial de README `7bf59c62774c482563ddcccec1e1cb6fea2900b0`. O envio inicial do MVP está em andamento; a CI remota ainda não foi executada. O pacote permanece `UNLICENSED`; proposta MIT, titular e termos para contribuição não estão aprovados.

A cópia de publicação parte de `git archive` do commit Sites `cb9cf548908f4fec935d11cf029987f58e4c9ce6`. Ela preserva código, migrações, testes e workflow, exclui o vínculo particular `.openai/hosting.json` e acrescenta `/.openai/` ao `.gitignore`. Não contém `.env`, chaves, banco, conteúdo privado nem DOCX original.

O checkout Sites possui vínculo Git próprio e deve permanecer intacto. A publicação GitHub usa uma cópia separada; não reinicializar nem substituir o remote do Sites. Uma implantação nova exige configurar seu próprio destino e suas variáveis.

Após enviar o MVP, confirmar os arquivos, o SHA remoto e todos os jobs da execução de CI daquele commit. Conta e visibilidade pública já foram confirmadas na criação. Configurar PR/revisão, checks obrigatórios, proteção contra force push/deleção e relato privado de vulnerabilidade quando disponíveis. Forks não recebem segredos nem executam código em contexto privilegiado. Workflow presente não prova CI remota aprovada. Publicar código não publica dados privados nem altera a visibilidade do Sites.

## VPS e recuperação

A implantação em VPS passou a ser **trabalho futuro**. A saída Cloudflare atual não funciona com o Dockerfile/Compose da implementação inicial. Um destino Node exige adaptador Astro Node, novo pacote de container, configuração de recursos e validação próprios, ainda não implementados. Leia [deploy/README.md](../deploy/README.md); não usar instruções antigas de `standalone`.

Rollback no Sites deve restaurar versão compatível com o schema e preservar snapshots/regras antigas. Não reverter migração de banco com exclusão destrutiva. Backups e restauração exigem escopo e ambiente isolado; não fazer limpeza global em VPS nem alterar containers de outros produtos.
