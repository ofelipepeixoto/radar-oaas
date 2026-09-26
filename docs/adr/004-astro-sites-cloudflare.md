# ADR-004 — Astro com ilhas React em Sites privado

Data: 26/09/2026. Estado: arquitetura implementada por solicitação posterior do usuário; verificação e publicação registradas em STATUS.

## Contexto

A especificação anexada propôs Next.js. Durante a execução, o usuário exigiu Astro e selecionou Sites. Essa instrução substitui a escolha anterior de framework, preservando domínio, controles e jornada.

## Decisão

Usar Astro 7 com ilhas React para a interface e adaptador Cloudflare para o servidor. As páginas ficam em `src/pages`, telas React em `src/views`, layout em `src/layouts/Base.astro` e handlers em `src/server-api`. Wrappers em `src/pages/api` recebem requests e delegam aos handlers. O motor em `src/domain/framework` permanece puro.

Build: `dist/server/index.js` com handler fetch para Worker e assets em `dist/client`. Execução de desenvolvimento por `astro dev` na porta3000; verificação local do build por Wrangler. Variáveis públicas são `PUBLIC_SUPABASE_URL`, `PUBLIC_SUPABASE_PUBLISHABLE_KEY` ou fallback `PUBLIC_SUPABASE_ANON_KEY`. Telemetria do framework é desativada por `ASTRO_TELEMETRY_DISABLED=1`.

## Consequências

Hospedagem alvo: Sites privado, sem inferir publicação pública. Resultados de testes/build da versão anterior não certificam o novo runtime. Rodar gates novamente e registrar bloqueios. Preservar RLS, autorização, limites de payload, não exposição de segredos e comportamento da demo.

O pacote Docker/standalone anterior não serve à saída Cloudflare. Implantação em VPS Node passa a ser trabalho futuro que exige adaptador Node e pacote de deploy dedicados, ainda não implementados. Não executar arquivos legados de container nem anunciar compatibilidade operacional.
