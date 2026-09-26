# Metodologia experimental

Fonte editorial: **Radar Disruptivo | Outcome as a Service**, edição setembro de 2026, data-base `2026-09-23`. Regras computacionais: `0.1.0-experimental`. O avaliador implementa uma interpretação operacional rastreável; não é metodologia estatisticamente validada nem instrumento de certificação. A distinção entre regra editorial e regra de software é parte do produto.

> Avaliação estratégica experimental baseada nas informações registradas. Não constitui certificação, parecer profissional ou garantia de resultado.

## Origem dos instrumentos

| Instrumento | Origem | Limite |
| --- | --- | --- |
| Oito critérios, escala 0–5 e N/D | `framework`, §02 | Nota registra sustentação da oportunidade; evidência forte de fracasso continua desfavorável. |
| Canvas e cunha | `framework`, §03 | Não prova demanda paga. |
| Contrato de resultado e operação Human + AI | `framework`, §§04–06 | A ficha não é contrato jurídico para assinatura. |
| Economia, preço e mercado bottom-up | `framework`, §§07–10 | Insumos e premissas precisam ser comparáveis. |
| Seis blocos, pesos e quatro travas | `framework`, §11 | Não há fórmula editorial convertendo oito notas em seis. |
| Fórmula de cobertura e índice parcial | `proposta_mvp`, especificação §06 | Não é probabilidade de sucesso. |
| Precedência e transições computacionais | `proposta_mvp`, especificação §07 | Somente próxima etapa demonstrada; confirmação humana separada. |
| Formulários, persistência, snapshots e IA opcional | `proposta_mvp` | Decisões técnicas não são validação da tese. |

## Evidências e revisão

Cada evidência conserva identificador, tipo, fonte, data, período/coorte, descrição verificável, alegação apoiada e estado de revisão. Declaração do fundador, hipótese, documento apresentado e resultado observado são categorias distintas. Uma URL é referência fornecida: o sistema não visita a página nem declara seu conteúdo verificado.

O proprietário revisa notas e justificativas. Essa revisão é **autodeclarada**. Não deve ser chamada de auditoria independente. Nota sem justificativa, vínculo válido com evidência revisada ou autoria/data suficientes permanece N/D. Confiança é baixa, média, alta ou não avaliada e exige justificativa; não multiplica a nota.

| Nota | Significado |
| --- | --- |
| 0 | Evidência desfavorável |
| 1 | Muito fraca |
| 2 | Indício inicial |
| 3 | Hipótese parcialmente testada |
| 4 | Piloto demonstrado |
| 5 | Replicação em clientes e períodos distintos |
| N/D (`null`) | Ausência de dado suficiente |

Registrar um fracasso repetido não o converte em nota 5. Estado de revisão e qualidade da evidência são diferentes da direção favorável ou desfavorável da conclusão.

## Oito critérios e seis blocos

Os critérios são orçamento, incumbente, dor valiosa, automatização, verificabilidade, vantagem, aprendizado e barreiras. Cada um é revisado individualmente. Os seis blocos recebem notas próprias; não são médias automáticas desses critérios.

| Bloco | Peso | Prova mínima editorial |
| --- | --- | --- |
| Dor + orçamento | 20% | Gasto atual e decisor identificados |
| Verificabilidade + vantagem | 20% | Rubrica de aceite e baseline comparável |
| Automação + operação | 20% | Piloto representativo, fila e horas medidas |
| Economia + preço | 20% | Pagamento, custos completos e margem por coorte |
| Defensibilidade + acesso | 10% | Canal e hipótese de aprendizado testáveis |
| Risco + responsabilidade | 10% | Direitos, licença, revisão e remédios definidos |

A escala é aplicada separadamente a cada bloco, com justificativa humana vinculada à prova mínima e ao estágio. Essa operacionalização adicional é proposta do MVP. Não existe benchmark de mercado embutido.

```text
cobertura = soma dos pesos dos blocos conhecidos
indice_parcial = 100 × soma(peso × nota/5) / cobertura
```

Com cobertura zero, índice e total completo são N/D. Com cobertura incompleta, o total completo permanece N/D; o índice parcial aparece junto da cobertura. Um único bloco com peso 20% e nota 5 resulta em índice parcial 100, cobertura 20% e nenhuma aprovação. Com cobertura 100%, o índice completo pode ir de 0 a 100. O sistema não imputa notas ausentes nem usa cortes de 70 ou 80 para avançar.

Pesos e regras são fixados antes da avaliação. Comparações precisam de mesma cobertura, rubrica, versão, unidade, período e coorte; mesmo assim não representam ranking universal. Mudanças de regra geram versão nova e não reescrevem snapshots.

## Decisão por estágio

Quatro travas: risco legal intransponível, falha grave não mitigada, margem estrutural negativa e aceite impossível. Estados: pendente, não identificada com evidência, mitigada com evidência e impeditiva confirmada. Cada registro exige fundamento, responsável, data e condição de reavaliação. Pendência não prova impedimento, mas impede operação que dependa da resposta. IA não confirma trava jurídica.

A tabela executável e os códigos de regra estão documentados em [decision-table.md](decision-table.md). Precedência:

1. Impedimento confirmado bloqueia avanço; pausar ou pivotar a cunha conforme causa.
2. Pendência crítica ou prova obrigatória ausente exige investigação/revisão; pesquisa segura pode continuar.
3. Teste obrigatório reprovado exige iteração ou mudança de cunha fundamentada.
4. Requisitos cumpridos permitem recomendar somente a próxima etapa demonstrada.

| Transição | Condições necessárias |
| --- | --- |
| Ideia → descoberta | Orientação para investigar; não exige receita nem atesta viabilidade |
| Descoberta → contrato | Comprador, gasto atual, baseline, processo e cunha delimitados |
| Contrato → piloto pago | Escopo, aceite, compromisso comercial, exclusões, direitos, controles, especialista quando necessário e metas prévias |
| Piloto → repetição | Casos representativos, pagamento observado, qualidade/segurança, custos completos, fila e horas medidas |
| Repetição → escala gradual | Demanda paga repetida, qualidade, economia sustentável, capacidade humana, processo e renovação compatível com ciclo |

Metas de erro, margem, prazo e capacidade devem ser registradas antes do piloto. Um score alto não supre nenhuma delas. Margem negativa pontual não confirma uma margem estruturalmente negativa. A mudança efetiva de estágio depende de confirmação do proprietário e mantém a avaliação original.

## Economia e capacidade

Valores monetários usam representação decimal/centavos no motor. Ausência de custo é N/D, não zero. Custos de rejeitados e retrabalho integram a entrega. Identificadores e categorias devem impedir duplicação; rateios são explicitados. Receita reconhecida e recebida permanecem separadas.

```text
custo_por_aceito = custos_de_entrega / resultados_aceitos
margem_de_entrega = (receita_da_entrega - custos_de_entrega) / receita_da_entrega
contribuicao_apos_aquisicao = receita_recebida - entrega - onboarding_alocado - aquisicao_alocada
minutos_de_revisao = casos × taxa_de_excecao × minutos_por_revisao
```

Denominador zero retorna N/D com explicação. Moeda, unidade, período e coorte incompatíveis não são somados silenciosamente. Cem casos, 20% de exceção e 12 minutos por revisão exigem 240 minutos de revisão, fora outras horas operacionais. Demanda e margem favoráveis não autorizam escala quando faltam revisores.

Cenários de 10, 100 e 1.000 clientes pressupõem ICP/mix comparáveis. Cada cenário declara volume, preço, complexidade, exceções, custo-hora, IA, implantação, suporte e capacidade. Volume não reduz automaticamente esforço ou custo unitário. Contas elegíveis já descontam restrições uma única vez; volume capturável e receita são hipóteses limitadas pela capacidade.

## Categoria e experimentos

SaaS, AI SaaS/copiloto, automação gerenciada, serviço habilitado por IA, OaaS e modelos híbridos são alternativas. Cobrar assinatura não impede vender resultado; ser SaaS não reprova um negócio. OaaS depende de execução, aceite e responsabilidade delimitada.

A agenda de 90 dias é sugestão para validar o projeto avaliado, não prazo de desenvolvimento do aplicativo: descoberta (1–15), contrato (16–30), piloto pago (31–60), repetição (61–75), decisão (76–90). Dez a vinte entrevistas são alvo exploratório, sem validade estatística presumida. Cada experimento explicita hipótese, procedimento, evidência esperada, responsável, dependências, período, custo ou N/D, métrica, sucesso e interrupção. Direitos e controles pendentes condicionam qualquer piloto.

## Limitações

O avaliador não verifica automaticamente autenticidade documental, direitos, licenças, causalidade ou previsões. Autodeclarações podem ser erradas. A regra evita algumas inferências indevidas, mas não elimina viés, divergência entre revisores nem necessidade de especialista. O piloto metodológico está em [evaluator-pilot.md](evaluator-pilot.md); seus resultados ainda não existem.

## Comparações de aprendizado e sinais operacionais

`compareSnapshots` compara qualidade, custo por aceito, horas por aceito, margem, onboarding, exceções e horas transferidas ao cliente. Exige mesmo projeto, versões, moeda/unidade, ICP/mix e duração da janela, além de justificativa e evidências revisadas de comparabilidade. Mudança de rubrica ou direção da qualidade mantém seus valores registrados, mas torna o delta N/D. Ausência de dados não vira zero.

Sinais disponíveis: `NOVEL_CUSTOMIZATION_PER_CLIENT` e `FOUNDER_DEPENDENCY` são declarações; `ONBOARDING_NOT_FALLING`, `EXCEPTIONS_RISING`, `PROPORTIONAL_LABOR_WITHOUT_ECONOMIC_IMPROVEMENT` e `WORK_TRANSFERRED_TO_CLIENT` derivam de comparações válidas. São propostas do MVP, não benchmarks ou prova de causalidade. Não alteram pesos, nota ou trava automaticamente. O plano de90dias tem fases, períodos, objetivos e responsáveis editáveis sem reescrever avaliações antigas.
