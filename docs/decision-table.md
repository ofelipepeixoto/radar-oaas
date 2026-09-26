# Tabela de decisão — 0.1.0-experimental

Origem das quatro travas: `framework`, §11. Formalização e códigos: `proposta_mvp`. Implementação: `src/domain/framework/engine.ts`, função `decide`. Constantes e requisitos: `constants.ts`. O score é informativo e não aparece como condição de avanço.

## Precedência executável

| Ordem | Condição revisada | Código(s) | Recomendação/efeito |
| --- | --- | --- | --- |
| 1 | Trava legal confirmada | `GATE_CONFIRMED_LEGAL` | Pausar; mantém estágio; bloqueia avanço |
| 1 | Falha grave confirmada | `GATE_CONFIRMED_SEVERE_FAILURE` | Pausar; mantém estágio |
| 1 | Margem estrutural negativa confirmada com análise humana | `GATE_CONFIRMED_STRUCTURAL_MARGIN` | Pausar; margem isolada não basta |
| 1 | Somente aceite impossível confirmado | `GATE_CONFIRMED_IMPOSSIBLE_ACCEPTANCE` | Pivotar a cunha; avanço bloqueado |
| 1 | Aceite impossível e outra trava confirmada | Códigos das travas aplicáveis | Pausar prevalece |
| 2 | Ideia sem impedimento confirmado | `IDEA_SAFE_DISCOVERY` | Investigar em descoberta; somente pesquisa segura, sem aprovação de viabilidade |
| 3 | Trava pendente, prova obrigatória ausente ou meta prévia inválida | `CRITICAL_EVIDENCE_MISSING` | Revisão necessária; mantém estágio; lista lacunas |
| 4 | Teste obrigatório falhou; mudança de cunha sustentada em aceite/preço | `TEST_FAILED_PIVOT` | Pivotar; sem transição automática |
| 4 | Teste obrigatório falhou sem esse fundamento | `TEST_FAILED_ITERATE` | Iterar; sem transição automática |
| 4 | Capacidade humana excedida | `HUMAN_CAPACITY_INSUFFICIENT` junto da falha | Iterar; não escalar |
| 4 | Margem abaixo da meta previamente declarada ou escala com margem não positiva | `DECLARED_MARGIN_TARGET_NOT_MET` junto da falha | Iterar; não cria trava estrutural automaticamente |
| 5 | Condições de descoberta cumpridas | `TRANSITION_DISCOVERY_TO_CONTRACT` | Recomendar contrato |
| 5 | Condições de contrato cumpridas | `TRANSITION_CONTRACT_TO_PAID_PILOT` | Recomendar piloto pago |
| 5 | Condições de piloto cumpridas | `TRANSITION_PAID_PILOT_TO_REPETITION` | Recomendar repetição |
| 5 | Condições de repetição/decisão de escala cumpridas | `REPEATED_EVIDENCE_GRADUAL_SCALE` | Recomendar escala gradual |

A etapa ideia é tratada antes das pendências gerais para permitir pesquisa segura. Mesmo nessa etapa, qualquer impedimento confirmado tem precedência. Falhas não apagam lacunas: se existem condições críticas desconhecidas, o sistema primeiro retorna revisão necessária.

## Validade da revisão

Uma trava não pendente precisa de fundamentação, responsável, data, condição de reavaliação, flag de revisão humana e referência revisada existente. Sem isso, é tratada como pendente. Margem estrutural confirmada requer também `structuralAnalysisReviewed`.

Um requisito precisa de revisão humana, justificativa e evidência revisada. `pass` exige evidência favorável; `fail` exige evidência desfavorável. `not_applicable` só é aceito para especialista, com justificativa/revisão; não dispensa outras condições. Hipóteses não contam como evidência revisada para aprovação. Essas verificações são metadados, não autenticação externa do conteúdo.

## Condições cumulativas

As transições usam `TRANSITION_CHECKS` e conservam exigências anteriores. Um projeto em repetição não perde a obrigação de ter comprador, baseline, direitos ou custo completo.

| Etapa atual | Novas condições da etapa |
| --- | --- |
| Descoberta | `buyer`, `current_spend`, `baseline`, `process`, `wedge` |
| Contrato | `scope`, `acceptance`, `price`, `exclusions`, `data_rights`, `controls`, `specialist`, `pilot_goals` |
| Piloto pago | `representative_cases`, `payment`, `quality`, `safety`, `complete_costs`, `queue`, `human_hours` |
| Repetição/decisão de escala | `repeated_demand`, `repeated_quality`, `sustainable_economics`, `human_capacity`, `documented_process`, `renewal` |

Contrato e etapas seguintes exigem metas de erro/margem/prazo/capacidade justificadas e declaradas antes do início do piloto. Preço por impacto exige baseline, atribuição, janela e contestação. Piloto e seguintes exigem economia/capacidade; períodos incompatíveis, pagamento não observado e custos ausentes impedem presumir cumprimento. Repetição/escala exigem resultados favoráveis observados em coortes e períodos distintos para demanda, qualidade e economia.

## Registro e confirmação

A saída contém `recommendation`, `allowedStage`, `blocked`, `ruleCodes`, `evidenceIds`, `gaps`, `conditions` e `explanation`. `createSnapshot` preserva entrada/resultado/pesos/versões. `confirmTransition` exige confirmação explícita e não permite avanço de decisão bloqueada. Na persistência privada, o servidor calcula o resultado a partir do rascunho validado, usando identidade autenticada.

Uma conclusão deve ser lida com suas referências e lacunas. Autodeclaração do proprietário não se transforma em revisão profissional ou auditoria independente. Atualizar os dados gera outra avaliação, não altera o passado.
