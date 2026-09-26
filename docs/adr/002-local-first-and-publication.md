# ADR-002 — Desenvolvimento local e bloqueios externos explícitos

Data: 26/09/2026. Estado: histórico da decisão inicial; alternativa de destino substituída parcialmente pelo ADR-003.

## Contexto

O usuário autorizou criação de Supabase dedicado no plano Free, preservando projetos existentes. A tentativa retornou limite de dois projetos Free ativos para o proprietário. A criação não foi concluída.

## Decisão

Registrar `BLOCKED_FREE_PROJECT_QUOTA`, continuar implementação e testes locais e não mudar plano, pausar/excluir projetos ou reaproveitar instância de outro produto. Uma organização distinta não deve ser oferecida como solução certa para limite por proprietário. O usuário autorizou posteriormente o destino compartilhado descrito no ADR-003; essa autorização não equivale a aplicação ou teste concluído.

Preparar migrações/configuração e roteiro reproduzível. Publicação GitHub aguarda confirmação de titular, licença e materiais permitidos, conforme especificação do usuário. Não inferir destino apenas pelo histórico da conta `ofelipepeixoto`.

## Consequências

Demonstração e domínio podem ser usados localmente. Supabase completo requer ambiente local com Docker ou destino gratuito elegível posteriormente confirmado. Testes de SQL em PGlite reduzem incerteza sobre políticas, mas não atestam Auth/PostgREST/produção. CI preparada não é CI executada remotamente. Estado real de cada gate precisa acompanhar a entrega.
