# Radar OaaS — Avaliador de Prontidão

Aplicativo web em **Astro 7, com ilhas React**, em português para fundadores e equipes de inovação avaliarem uma oportunidade de **Outcome as a Service**. A pergunta central é: **com as evidências disponíveis, para qual etapa este projeto pode avançar, o que impede o avanço e qual experimento deve ser feito?**

O produto organiza evidências e usa regras determinísticas explicáveis. Funciona sem IA generativa e sem chave de API de IA. A fonte editorial é o framework Radar Disruptivo, versão `2026-09-23`; as regras operacionais são `0.1.0-experimental`.

> Avaliação estratégica experimental baseada nas informações registradas. Não constitui certificação, parecer profissional ou garantia de resultado.

## Estado da entrega

A aplicação foi portada para Astro por solicitação do usuário; o destino de hospedagem é **Sites privado**, com adaptador Cloudflare. Consulte [STATUS.md](STATUS.md) para estado de publicação, comandos efetivamente executados e limitações. Testes anteriores à migração de framework não comprovam o build ou os endpoints Astro. O repositório público [ofelipepeixoto/radar-oaas](https://github.com/ofelipepeixoto/radar-oaas) foi criado em 26/09/2026, com branch `main`. O MVP foi publicado no commit `5e53d58210f81afed34b436f069a7ab55e83c3e4` e a [CI remota](https://github.com/ofelipepeixoto/radar-oaas/actions/runs/36221322124) foi aprovada (`completed` / `success`). A licença definitiva e seu titular continuam pendentes.

**Supabase:** a criação inicial de projeto dedicado Free foi bloqueada por cota (`BLOCKED_FREE_PROJECT_QUOTA`). Posteriormente, o usuário autorizou usar o projeto existente `radar-disruptivo`, com objetos próprios `public.oaas_*` e schema interno `oaas_private`. Veja o resultado real da aplicação remota em [STATUS.md](STATUS.md). Auth, recursos e cotas são compartilhados; prefixos/RLS separam objetos e acesso, mas não garantem isolamento de capacidade ou disponibilidade. Nenhum plano pago foi contratado.

## O que o aplicativo faz

- Canvas com ICP, comprador, cunha, baseline, entrega e aceite.
- Evidências textuais e referências, com revisão autodeclarada pelo proprietário.
- Oito critérios independentes e seis blocos ponderados, com N/D explícito e cobertura.
- Travas, requisitos por estágio, decisão explicável e próximo experimento.
- Economia da entrega, capacidade humana, cenários e hipóteses de mercado.
- Comparação descritiva entre snapshots comparáveis, alertas operacionais e plano de 90 dias editável.
- Rascunhos, avaliações em snapshots, histórico, exportações e relatório para impressão.
- Demonstração sintética separada do modo privado autenticado.

O aplicativo avalia a operação proposta: não executa o serviço do usuário, não certifica viabilidade, não verifica URLs automaticamente e não produz contrato jurídico pronto para assinatura. Upload/extrator de PDF/DOCX, cobrança, ranking e colaboração multiusuário ficam fora desta versão.

## Executar a demonstração sem credenciais

Pré-requisitos: Node.js 22.13.0 ou superior, conforme versão compatível com `engines` do `package.json`, npm e navegador moderno. As versões exatas de dependências estão fixadas em `package-lock.json`.

```bash
npm ci
npm run dev
```

Abra `http://localhost:3000`: a página inicial apresenta o avaliador demonstrativo diretamente. `/demo` também abre a demonstração. Os exemplos de conciliação financeira, preparação de NDA e provisionamento de usuários são inteiramente fictícios. O modo demonstrativo não grava no banco privado nem chama provedor real de IA. Não insira dados confidenciais nos exemplos.

## Modo privado com Supabase local

É necessário Docker/ambiente de containers compatível com Supabase CLI. A CLI está fixada como dependência de desenvolvimento. Em Windows, use Docker Desktop e um terminal com acesso ao Docker.

```bash
npm ci
npx supabase start
npx supabase db reset
cp .env.example .env.local
```

`db reset` recria o banco **local** e apaga seus dados locais: use uma instância descartável de desenvolvimento. Não acrescente opções de destino remoto. Copie URL local e chave pública indicadas pela CLI para `.env.local`, mantendo segredos fora de chat, commits e logs compartilhados. A CLI pode apresentar chave anon legada; ela é aceita como fallback pela configuração.

```dotenv
PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
PUBLIC_SUPABASE_PUBLISHABLE_KEY=CHAVE_PUBLICA_LOCAL
ASTRO_TELEMETRY_DISABLED=1
AI_PROVIDER=simulated
```

Reinicie `npm run dev` após configurar as variáveis; crie uma conta e um projeto privado. O fluxo pode depender das configurações de confirmação de email do Supabase local. A ausência de configuração válida mantém o modo privado indisponível. Não use chave `service_role` no navegador; ela não é necessária ao runtime do aplicativo.

## Variáveis

| Variável | Escopo | Uso |
| --- | --- | --- |
| `PUBLIC_SUPABASE_URL` | Público | URL da instância autorizada |
| `PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Público | Chave publicável; acesso continua sujeito a sessão/RLS |
| `PUBLIC_SUPABASE_ANON_KEY` | Público, compatibilidade | Alternativa legada à chave publicável |
| `ASTRO_TELEMETRY_DISABLED` | Execução/build | `1` desativa telemetria do Astro |
| `AI_PROVIDER` | Servidor | `simulated` por padrão; integração real tem controles em [docs/ai.md](docs/ai.md) |
| `PLAYWRIGHT_BASE_URL` | Testes | Opcional; direciona a suíte a um servidor já iniciado |

Variáveis opcionais da IA constam em [docs/ai.md](docs/ai.md). Nenhuma chave real acompanha este repositório.

## Verificação

```bash
npm run lint
npm run typecheck
npm run test:unit
npm run test:integration
npx playwright install chromium
npm run test:e2e
npm run build
```

`typecheck` executa `astro check` e TypeScript. `npm run build` produz o servidor Cloudflare em `dist/server/index.js` e os assets em `dist/client`. Após o build, `npm run start` inicia Wrangler local usando a configuração gerada em `dist/server/wrangler.json`; consulte a URL indicada no terminal.

`test:integration` e a jornada autenticada têm níveis de cobertura e pré-requisitos distintos: leia [docs/testing.md](docs/testing.md). Para Auth/REST reais em Supabase local descartável, use `npm run test:supabase` com os pré-requisitos documentados. Testes PGlite exercitam PostgreSQL/RLS local, mas não comprovam Supabase Auth/PostgREST ou produção. Executar a demo no navegador não comprova isolamento entre contas. Nenhum teste bloqueado deve ser descrito como aprovado.

O workflow `auth.yml` agora executa Supabase real descartável e `npm run test:auth` para cadastro, confirmação, recuperação e isolamento por HTTP com duas contas. [Gate local aprovado em 26/09/2026](https://github.com/ofelipepeixoto/radar-oaas/actions/runs/36223385630): cinco testes Auth/PostgREST e uma jornada completa de navegador. SMTP/redirects e duas contas no Sites hospedado permanecem como aceite separado.

## Código público e dados privados

O código publicado no GitHub contém regras documentadas, migrações, testes e exemplos sintéticos. O vínculo particular de implantação Sites foi excluído dessa cópia. Projetos, evidências, avaliações, experimentos e exports pertencem ao proprietário e não serão publicados automaticamente. O DOCX original e sua extração integral não integram o pacote.

Consulte [privacidade](docs/privacy.md), [segurança](SECURITY.md), [arquitetura](docs/architecture.md) e [deploy](docs/deployment.md). A aprovação técnica não valida estatisticamente a metodologia; o piloto do avaliador está [documentado separadamente](docs/evaluator-pilot.md).

## Metodologia e contribuição

- [Metodologia e limitações](docs/methodology.md)
- [Questões da fonte, incluindo R$20 versus R$60](docs/source-issues.md)
- [Tabela de decisão](docs/decision-table.md)
- [Rastreabilidade de requisitos, código e testes](docs/traceability.md)
- [Contexto estratégico verificado ARK/Sequoia](docs/research-context.md)
- [Como contribuir](CONTRIBUTING.md), [governança](GOVERNANCE.md), [roadmap](ROADMAP.md)
- [Próximos passos e critérios de avanço](docs/next-steps.md)

A licença proposta para o código é MIT, **pendente de confirmação do titular**. O pacote permanece `UNLICENSED` até essa decisão. Framework, marca e material editorial têm direitos separados: [LICENSE-PROPOSED.md](LICENSE-PROPOSED.md). O destino autorizado é `ofelipepeixoto/radar-oaas`. A atribuição do titular, a licença efetiva e os termos para contribuições ainda precisam ser definidos; nenhuma licença MIT é concedida pela criação do repositório. Não há vínculo ou endosso de ARK, Sequoia ou fornecedores de tecnologia.
