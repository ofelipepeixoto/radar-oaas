# ADR-003 — Supabase compartilhado com namespace próprio

Data: 26/09/2026. Estado: destino autorizado pelo usuário; aplicação remota e verificações constam no STATUS.

## Contexto

A criação de projeto dedicado Free falhou por cota do proprietário. O usuário autorizou usar o projeto existente `radar-disruptivo`, mantendo a operação anterior e sem upgrade pago.

## Decisão

Criar somente `public.oaas_projects`, `public.oaas_evidence`, `public.oaas_assessments`, `public.oaas_experiments`, `public.oaas_audit_events`, funções prefixadas e `oaas_private`. Manter RLS por proprietário, referências filhas coerentes e autorização de servidor. Não alterar schemas expostos, Auth, grants de tabelas existentes ou dados anteriores. Inspecionar nomes antes da migração e testar objetos-sentinela do legado.

## Limitações

A separação é de objetos, políticas e dados de aplicação. Auth, compute, conexões, cotas e disponibilidade são compartilhados. Não prometer ausência absoluta de interferência operacional. Evitar carga desnecessária; analisar uso antes de escalar. Exclusão de projeto OaaS remove somente seus objetos relacionados; não exclui usuário global de Auth.

## Evidência

`tests/integration/rls.test.ts` testa migração/RLS em PGlite e sentinelas de objetos anteriores. Aplicação no Supabase remoto, versão/hash e verificação de metadados precisam de registro separado pelo executor autorizado. Nenhuma alteração de plano, pausa ou exclusão de projetos é autorizada por este ADR.
