# Auditoria de UX e produto — 26/09/2026

**Estado:** auditoria de código e proposta de melhoria. O teste com cinco leigos descrito aqui ainda não foi realizado. Este documento não declara a implementação aprovada, o aplicativo pronto para uso externo ou o produto comercialmente validado.

**Base inspecionada:** commit `20fbe4f`, anterior às alterações desta rodada. Foram lidos `AGENTS.md`, a entrada `src/pages/index.astro`, as views de demonstração e projetos, o workbench, o relatório, o schema, as constantes e a metodologia. O relato do proprietário sobre dificuldade de uso orientou a auditoria; não substitui observação de outros participantes.

## Decisão de produto

O gargalo observado é a entrada no produto: a interface exige conhecimento do método antes de entregar uma orientação útil. A prioridade é permitir que uma pessoa organize sua ideia por escolhas compreensíveis e termine sabendo o que investigar em seguida.

A hipótese desta rodada é: **uma jornada guiada, com perguntas condicionais e uma primeira entrega curta, reduz a necessidade de ajuda sem transformar declarações em provas**. O ganho precisa ser observado; ainda não há tempo, conversão ou satisfação medidos.

Não ampliar IA, integrações, cobrança ou infraestrutura para resolver esse gargalo. O método completo permanece disponível para aprofundamento, com as mesmas regras, ressalvas e dados preservados.

## Achados e correções propostas

| Achado na versão inspecionada | Consequência provável, a verificar com usuários | Correção proposta |
| --- | --- | --- |
| `/` abre diretamente o projeto fictício de conciliação financeira | A pessoa pode confundir exemplo com seu projeto e não entender a oferta | Página inicial que explica a entrega; caminhos distintos para começar um projeto e experimentar um exemplo |
| Sete seções técnicas aparecem como navegação principal | O usuário precisa descobrir a ordem de trabalho | Jornada inicial guiada, com voltar, continuar e revisão das respostas |
| O modelo possui 25 campos de canvas, 14 fichas de notas e 26 verificações | Mesmo com campos recolhidos, a tarefa parece extensa e especializada | Pedir somente dados que alteram a orientação atual; apresentar aprofundamento quando necessário |
| Termos como ICP, cunha, scorecard, coorte e baseline aparecem cedo | A pessoa precisa aprender vocabulário para conseguir responder | Perguntas em linguagem cotidiana; conceitos técnicos em ajuda opcional |
| Descrição do projeto e classificação SaaS/OaaS dividem a primeira etapa | A pessoa precisa escolher uma categoria antes de descrever seu objetivo | Começar por cliente, trabalho e resultado; deixar classificação para avaliação detalhada |
| “Gerar diagnóstico” antecede preparação suficiente; o relatório expõe muitas pendências | A pessoa pode interpretar a ausência de informação como fracasso | Primeira entrega com resumo, principal dúvida e próximo teste; relatório completo sob ação explícita |

As contagens descrevem a estrutura do modelo, não uma medição de quantos campos aparecem simultaneamente. As consequências são inferências de UX a testar.

## Jornada inicial proposta

Os grupos abaixo definem o conteúdo. Perguntas independentes podem ocupar telas próprias; perguntas condicionais simples podem aparecer junto da escolha que as tornou relevantes. A quantidade final de telas deve continuar visível e coerente com o fluxo implementado.

| Grupo | Pergunta e escolhas iniciais | Ramificação e limite |
| --- | --- | --- |
| Seu cliente | “Para quem você quer oferecer isso?” — pessoas; profissionais autônomos; pequenas empresas; empresas maiores; ainda não defini | Texto curto somente para especificar um público ou escolher “Outro”. Não inventar cliente ou comprador |
| Sua entrega | “Qual trabalho você quer ajudar a resolver?” — atender clientes; organizar informações ou documentos; vender ou cobrar; executar tarefas administrativas; outro. “Qual melhoria importa mais?” — economizar tempo; reduzir custo; evitar erros; aumentar vendas; ainda não sei | “Outro” abre uma frase curta. A escolha descreve intenção, não resultado demonstrado |
| O que já aconteceu | “Você já apresentou essa ideia a alguém?” — ainda não; conversei com possíveis clientes; fiz um teste; já recebi por uma entrega. “Como o trabalho é feito hoje?” — pela própria pessoa/equipe; por fornecedor; com ferramenta; ainda não sei | Quem está na ideia não precisa preencher margem, escala ou capacidade. Declaração de pagamento não cria evidência revisada |
| Como conferir a entrega | “Como o cliente perceberia que deu certo?” — conferindo a entrega; comparando tempo ou custo; verificando quantidade ou qualidade; ainda não defini. “A entrega envolve informações pessoais ou decisões importantes?” — sim; não; não sei | Perguntar apenas o complemento necessário. Metas e valores desconhecidos permanecem desconhecidos; uma escolha não resolve direitos ou responsabilidade |
| Seu próximo passo | Mostrar resumo editável, principal dúvida e ação sugerida | No máximo três pontos a esclarecer na primeira entrega. Acesso opcional ao método completo |

Regras de interação:

- Oferecer “Não sei ainda” quando desconhecimento for uma resposta válida.
- Usar escolha única quando as respostas forem exclusivas; informar quando mais de uma seleção for permitida.
- Não pré-selecionar respostas em um projeto novo. Restaurar respostas explicitamente salvas é outro comportamento e deve ser reconhecível.
- Pedir texto apenas para informação específica que as opções não capturam. Identificar campos opcionais.
- Preservar respostas ao voltar; permitir corrigir antes de salvar ou concluir.
- Ao trocar uma resposta por “Não sei”, remover apenas o valor anteriormente gerado por aquela resposta. Não apagar informações independentes nem manter afirmação contraditória escondida.
- Manter seleção, foco, erro e instrução perceptíveis por teclado e tecnologia assistiva. Não depender somente de cor.
- Preservar o trabalho existente ao entrar na jornada guiada; não substituir um projeto detalhado por valores padrão.

## Primeira entrega útil

Exemplo estritamente ilustrativo, para respostas que de fato correspondam ao texto:

> Você quer ajudar pequenas empresas a organizar documentos e economizar tempo.
>
> Ainda falta descobrir como esse trabalho é feito hoje.
>
> **Seu próximo passo:** converse com uma pessoa desse público e descubra quem faz o trabalho, quanto tempo gasta e qual dificuldade mais atrapalha.

Oferecer um pequeno roteiro editável para executar essa ação. A chamada principal é “Preparar meu próximo teste”; alternativas são “Corrigir respostas” e “Aprofundar avaliação”.

| Informação disponível | Orientação inicial possível |
| --- | --- |
| Público indefinido | Escolher um público para investigar |
| Trabalho ou entrega indefinido | Delimitar um trabalho específico |
| Nenhuma conversa declarada | Preparar perguntas para compreender a situação atual |
| Conversas, sem teste declarado | Definir uma entrega pequena e como conferi-la |
| Teste declarado | Registrar o que aconteceu, incluindo falhas e limitações |
| Pagamento declarado | Organizar receita, custos e esforço humano da entrega |
| Condições de dados ou responsabilidade pendentes | Esclarecer as condições antes de executar operação que dependa delas |

Esta orientação é preparação do projeto. Não é nova regra de aprovação, nota de viabilidade ou autorização operacional. A precedência das condições do motor continua valendo. Oito critérios, seis blocos, quatro travas, distinção N/D/zero e snapshots imutáveis permanecem preservados.

## Página inicial

Proposta de mensagem: **“Descubra o próximo passo da sua ideia.”** Complemento: “Responda perguntas simples e organize o que precisa testar antes de investir mais.”

A página deve apresentar o resultado que a pessoa recebe: organizar a ideia, identificar a principal dúvida e saber o que testar. “Começar meu projeto” e “Experimentar com um exemplo” precisam levar a experiências claramente distintas. O caminho privado depende da autenticação e da homologação do ambiente; não prometer acesso disponível antes de conferi-lo.

Explicar salvamento e privacidade de forma curta. Método e limitações continuam acessíveis. Não anunciar tempo de conclusão, clientes, aprovação, acurácia, previsão de sucesso ou superioridade comercial sem evidência correspondente.

## Critérios de aceite da implementação

Todos os itens abaixo estão **pendentes de verificação nesta auditoria**. O responsável pela entrega deve registrar a versão, a execução e o resultado efetivo em `STATUS.md` e na documentação de testes.

| Critério | Evidência necessária |
| --- | --- |
| Entrada compreensível | Página inicial explica finalidade e entrega; exemplo fictício e projeto privado não se confundem |
| Jornada completa | Uma pessoa consegue começar, responder, voltar, corrigir e chegar ao resumo sem acessar o formulário técnico |
| Escolhas condicionais | Campos adicionais aparecem somente quando pertinentes; opção “Outro” e desconhecimento têm tratamento explícito |
| Respostas preservadas | Voltar, retomar e alternar para aprofundamento mantêm o conteúdo; mudança de opção não conserva dado contraditório |
| Sem fabricação de evidência | Escolhas não criam fonte, revisão, pagamento comprovado, nota ou condição aprovada |
| Saída útil e limitada | Resumo corresponde às respostas; próximo passo é específico; desconhecimento não aparece como reprovação ou garantia |
| Acesso inclusivo | Navegação por teclado, foco, rótulos, mensagens de erro e apresentação em tela estreita conferidos |
| Projeto existente preservado | Informações detalhadas e histórico anterior permanecem disponíveis após usar o novo fluxo |
| Privacidade e isolamento preservados | Persistência privada continua autenticada; demonstração não recebe dados reais; verificações entre identidades continuam válidas |
| Publicação verificada | Código testado, versão publicada e comportamento observado correspondem; aprovação local não é apresentada como teste hospedado |

## Teste exploratório com cinco leigos — não realizado

Objetivo: descobrir onde a pessoa precisa de ajuda e se entende a orientação recebida. Cinco participantes constituem uma rodada qualitativa de descoberta, não uma amostra estatística nem prova de demanda. Esta rodada curta complementa o [piloto metodológico](evaluator-pilot.md); não herda as metas numéricas daquele protocolo.

Selecionar pessoas sem familiaridade com os termos do método, sem envolvimento na construção do MVP. Registrar sua experiência com ferramentas digitais e o dispositivo utilizado. Começar com um caso fictício simples e explicitamente identificado. Uso de dados reais fica condicionado à homologação e às condições de privacidade.

Roteiro para cada participante:

1. Abrir a página inicial e explicar, com suas palavras, o que espera receber.
2. Encontrar o caminho de demonstração e organizar o caso fictício sem explicação prévia do facilitador.
3. Usar “Não sei”, corrigir uma resposta e verificar o resumo.
4. Explicar qual ação faria em seguida e o que o resultado ainda não comprova.
5. Retomar o rascunho e localizar aprofundamento somente se desejar mais detalhe.
6. Descrever o que foi útil, confuso ou desnecessário; comparar com a forma pela qual resolveria a tarefa hoje.

O facilitador observa antes de ajudar. Qualquer intervenção fica registrada; conclusão assistida não conta como conclusão autônoma. Não gravar telas por padrão nem incluir nomes, contatos ou conteúdo confidencial no repositório público. Combinar autorização e retenção antes da sessão.

| Participante | Estado | Registro a preencher após a sessão |
| --- | --- | --- |
| P01 | Não recrutado | Etapas, dificuldade, ajuda, entendimento e próxima correção |
| P02 | Não recrutado | Etapas, dificuldade, ajuda, entendimento e próxima correção |
| P03 | Não recrutado | Etapas, dificuldade, ajuda, entendimento e próxima correção |
| P04 | Não recrutado | Etapas, dificuldade, ajuda, entendimento e próxima correção |
| P05 | Não recrutado | Etapas, dificuldade, ajuda, entendimento e próxima correção |

Medir sem inventar metas: conclusão autônoma por etapa; pontos de abandono; tempo até compreender a primeira orientação; quantidade e motivo de ajuda; uso de respostas de desconhecimento; correções necessárias; compreensão da diferença entre declaração e prova; utilidade percebida acompanhada de exemplo concreto. Publicar contagens com denominadores e contexto, não generalizar uma rodada pequena para o mercado.

Perda de rascunho, exposição indevida ou interpretação de pendência como permissão de operação exigem correção antes de continuar o caso afetado. Outros problemas observados alimentam uma nova rodada. As metas quantitativas de uma avaliação posterior devem ser definidas antes da coleta, após considerar os aprendizados exploratórios.

## Visão de CEO: clareza antes de cobrança

O benefício a testar é ajudar alguém a decidir o próximo teste do projeto com menos dúvida e esforço. Ter mais campos ou citar mais frameworks não demonstra esse benefício.

A decisão proposta é melhorar compreensão e observar utilidade antes de ampliar aquisição ou ativar cobrança. Depois, escolher um público inicial e formular uma oferta delimitada. A evolução comercial deve seguir os [próximos passos](next-steps.md), preservando a distinção entre diagnóstico avulso, serviço assistido e eventual assinatura.

Métricas comerciais futuras: aceitação de uma oferta concreta; pagamento pelo diagnóstico separado de contratação de implementação; retorno para uma nova decisão; ação efetivamente executada depois do resultado; horas de atendimento e revisão; custo de entrega e suporte. Perguntar se alguém “pagaria” produz intenção declarada, não demanda comprovada.

Não há preço, prazo de lançamento, conversão, receita ou mercado dimensionado nesta auditoria. Se a pessoa continuar precisando que um especialista traduza a jornada inteira, revisar experiência e posicionamento antes de escalar. Se o resumo for compreensível, mas não mudar nenhuma ação, revisar a entrega de valor. Se houver utilidade e pagamento, mas pouca recorrência, considerar diagnóstico avulso antes de presumir assinatura.

## Referências primárias consultadas

Consulta em **26/09/2026**, na ordem ARK, Sequoia e referência de design. São contribuições ao raciocínio, não endossos ao Radar OaaS.

- **ARK Invest — [Investment Process](https://www.ark-invest.com/investment-process)**, página institucional sem data de publicação indicada no conteúdo consultado. Descreve combinação de pesquisa ampla e análise concreta por métricas. Aplicação independente nesta auditoria: a tese de oportunidade em IA precisa ser confrontada com utilidade e esforço observados no produto. Não foi obtida evidência específica sobre este MVP; não foram usados valuation, projeções ou recomendações de investimento.
- **Sequoia Capital — [The Arc Product-Market Fit Framework](https://sequoiacap.com/article/pmf-framework)**, Team Sequoia, publicado em 09/04/2024. Parte da relação do cliente com o problema e distingue desafios de necessidade urgente, hábito e nova possibilidade. O texto não propõe atestar PMF por questionário. Aplicação independente: investigar o problema que o público reconhece e a experiência pela qual percebe valor; não classificar este MVP como validado.
- **GOV.UK Design System — [Question pages](https://design-system.service.gov.uk/patterns/question-pages/)**, orientação de design vigente consultada. Recomenda pedir apenas informação necessária, aceitar incerteza quando válida, facilitar retorno e começar pelo desenho de uma pergunta por página. A jornada proposta usa esses princípios e precisa de avaliação com seus próprios usuários.
- **GOV.UK Design System — [Radios](https://design-system.service.gov.uk/components/radios/)**, orientação de componente vigente consultada. Diferencia escolha única e múltipla, recomenda não pré-selecionar opções e admite complemento condicional simples. Alerta também para dificuldades de acessibilidade em revelações condicionais; a implementação exige conferência, não mera semelhança visual.

## Limitações e estado final desta auditoria

Esta é uma revisão do código e da experiência projetada, informada pelo relato do proprietário. Não inclui recrutamento, entrevistas, pesquisa comparativa de concorrentes, certificação de acessibilidade ou validação de disposição a pagar. Nenhuma das referências demonstra que a proposta funcionará para este público.

A pesquisa e a documentação não modificam as regras de avaliação, o banco compartilhado ou as configurações de outros projetos. A aprovação técnica da mudança, sua publicação e os resultados de uso devem ser registrados separadamente por quem executar essas etapas. O próximo passo verificável é testar a implementação; o teste com cinco leigos permanece planejado.
