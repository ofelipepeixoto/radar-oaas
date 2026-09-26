# Assistência opcional de IA

A avaliação numérica e a recomendação são produzidas exclusivamente pelo motor determinístico. O adaptador pode propor perguntas, contradições, justificativas e experimentos; suas sugestões ficam **pendentes de revisão humana**. Não há geração de evidência, confirmação de trava ou alteração automática de nota/peso.

## Modos e arquivos

| Componente | Implementação |
| --- | --- |
| Contrato e schemas | `src/lib/ai/schema.ts` |
| Provedor simulado e desligado | `src/lib/ai/mock.ts` |
| Orquestração/limites/validação | `src/lib/ai/service.ts` |
| Prompt versionado | `src/lib/ai/prompt.ts` |
| SDK oficial em módulo de servidor | `src/lib/ai/openai-provider.ts` |
| Escolha por configuração | `src/lib/ai/server.ts` |
| Endpoint autorizado | `POST /api/analysis`; wrapper `src/pages/api/analysis.ts` e handler `src/server-api/analysis/route.ts` |

O `MockAnalysisProvider` é determinístico, local e explicitamente rotulado como simulação. Não precisa de chave, não transmite evidências e não equivale a análise real de IA. A demo nunca aciona provedor externo. A ausência de configuração completa do provedor real resulta em modo desabilitado/manual.

## Dados enviados

O endpoint recebe `projectId`, `evidenceIds` e `consent`, verifica a sessão e busca o projeto do proprietário no servidor. Somente conteúdo **salvo** é selecionado: estágio, resultado delimitado, aceite e trechos das evidências escolhidas (tipo, data, período, alegação e descrição). IDs de evidência precisam existir no projeto; o ID do projeto não é enviado ao provedor.

Não envia o documento inteiro, banco, canvas completo, URLs para navegação ou dados de outros projetos. Evidências são entradas não confiáveis. O SDK não recebe ferramentas nem capacidade de buscar URL. A chamada usa Responses com saída estruturada, `store: false` e sem retentativas automáticas. Isso não substitui a política vigente de dados do provedor, que deve ser revista antes de habilitar uso real.

## Configuração de servidor

| Variável | Padrão/condição |
| --- | --- |
| `AI_PROVIDER` | Ausente ou `simulated`: simulação local; `openai`: pede configuração real completa |
| `AI_ENABLED` | Deve ser `true` para modo real |
| `OPENAI_MODEL` | Obrigatório para modo real; não existe modelo padrão presumido |
| `OPENAI_API_KEY` | Somente servidor; nunca `PUBLIC_`, commit ou chat |
| `AI_DEPLOYMENT_LIMIT_CONFIGURED` | Deve ser `true` somente após revisão/definição do limite monetário no provedor |

Mesmo com essas variáveis, uma chamada real exige consentimento explícito do usuário e reserva de quota durável via `oaas_reserve_ai_call`. A flag de limite de implantação é declaração operacional, não cria nem comprova um orçamento monetário no provedor. O operador precisa configurar/verificar o controle no provedor. Nenhuma chave foi configurada e nenhuma chamada paga foi realizada nesta entrega.

## Limites implementados

| Controle | Limite inicial |
| --- | --- |
| Evidências por chamada | 30 |
| Trecho individual | 4.000 caracteres |
| Contexto | 6.000 caracteres |
| Entrada total | 12.000 caracteres |
| Tempo | 15 segundos |
| Saída | 1.000 tokens |
| Tentativas | Uma, sem retry automático |
| Chamadas reais por usuário/dia | 5 |
| Reserva por usuário/dia | 120.000 tokens |
| Reserva de implantação/dia | 1.000.000 tokens |

A reserva conservadora soma bytes UTF-8 da entrada/prompt, margem para schema e teto de saída; não devolve quota em falha. Token é controle técnico, não garantia de custo em dinheiro: o valor depende de modelo e preço vigente. Os contadores ficam em schema privado do banco, sem acesso de reset pelo usuário comum. Não existe taxa de custo inventada.

## Saída e fallback

Validação exige schema estrito, identificadores válidos e trechos citados contidos nas evidências selecionadas. Isso verifica integridade da referência, **não prova apoio semântico ou verdade**. Toda sugestão continua `reviewStatus: pending` e `supportStatus: pending_human_review`. Scores, decisões, pesos e travas extras são rejeitados.

Recusa, timeout, erro, quota indisponível/esgotada, excesso de entrada ou saída inválida levam ao fluxo manual com mensagem sanitizada. O rascunho permanece preservado. Logs de auditoria guardam provedor, modelo, versão do prompt, data, IDs, uso/reserva de tokens e status; não registram texto integral, prompt ou resposta bruta.

## Verificação

`tests/ai/analysis.test.ts` cobre autorização, consentimento, quotas, limite de tamanho, referência inventada, citação inventada, campos proibidos, timeout, recusa, segredo em erro, conteúdo malicioso e determinismo simulado. `tests/ai/openai-provider.test.ts` usa SDK simulado para verificar payload mínimo, saída estruturada, `store:false`, zero retries, recusa e configuração incompleta. Nenhum desses testes chama o serviço real. A igualdade de resultados do domínio independe da presença de sugestões, que nunca entram como decisão autorizada.

Referência técnica consultada na implementação: [OpenAI — Structured Outputs](https://developers.openai.com/api/docs/guides/structured-outputs). As versões efetivas do SDK/Zod estão no lockfile; revise documentação oficial ao atualizar.

## Limite do novo runtime

A adaptação para Astro/Cloudflare preserva IA real desligada. Ler o SDK ou passar testes com SDK simulado não comprova execução de chamada real no Worker. Verificar tratamento de configuração/segredos de servidor e compatibilidade do runtime antes de ativar o provedor; não expor `OPENAI_API_KEY` em variáveis `PUBLIC_*` ou assets.
