# ADR-001 — Motor determinístico e avaliações versionadas

Data: 26/09/2026. Estado: implementado conforme arquivos e testes listados na matriz; validação de produção separada.

## Contexto

O usuário precisa entender por que uma etapa é recomendada, preservar ausência de dados e não delegar travas jurídicas/econômicas à IA. O framework não fornece algoritmo estatístico validado.

## Decisão

Usar funções puras em `src/domain/framework/`, validação por Zod, dinheiro em centavos/decimal e regras explícitas. Notas dos oito critérios e dos seis blocos são independentes. Pesos e regras são congelados por versão. Snapshots conservam entrada, evidências, resultado, versões, data e responsável. IA fica em adaptador substituível, desligável e sem autoridade decisória.

## Consequências

Testes podem executar sem banco/rede/chave. Explicações são reproduzíveis. Limitações da revisão humana e dos dados autodeclarados continuam existentes. Mudança de regra exige testes, versão nova e preservação histórica. Uma interface atraente ou saída estruturada de IA não certifica validade metodológica.

## Alternativas

Chatbot decisor foi rejeitado porque tornaria cálculo e precedência difíceis de reproduzir. Microserviços, agentes múltiplos e vetores não são necessários ao escopo. Normalização de toda subestrutura foi adiada em favor de snapshots JSONB tipados, sem retirar RLS e autorização por projeto.

O domínio determinístico foi preservado na migração posterior para Astro/React; veja ADR-004. O framework de interface não altera notas, pesos, travas nem snapshots.
