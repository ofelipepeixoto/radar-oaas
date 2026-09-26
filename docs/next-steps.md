# Próximos passos — Radar OaaS

Registro de execução atualizado em 26/09/2026. O MVP técnico existente é a base para homologação e validação comercial. Implementação, teste, publicação e evidência de mercado são estados distintos.

## Decisões preservadas

- Astro com ilhas React; hospedagem Sites privada.
- Supabase no plano gratuito, com objetos próprios e RLS no projeto compartilhado autorizado. Auth, capacidade e cotas continuam compartilhados; não há garantia de isolamento de recursos.
- Domínio determinístico, regras explicáveis e exemplos sintéticos. IA generativa é opcional e permanece desativada; nenhuma chave ou consumo pago faz parte desta preparação.
- Repositório público [ofelipepeixoto/radar-oaas](https://github.com/ofelipepeixoto/radar-oaas) criado em 26/09/2026, branch `main`. O MVP foi publicado no commit `5e53d58210f81afed34b436f069a7ab55e83c3e4` e a [CI remota](https://github.com/ofelipepeixoto/radar-oaas/actions/runs/36221322124) foi aprovada (`completed` / `success`). Licença efetiva e titular continuam pendentes; manter `UNLICENSED` até decisão explícita.

## Ordem de execução

O usuário aprovou iniciar a homologação técnica em 26/09/2026. O gate Auth/PostgREST/Mailpit descartável foi aprovado na [execução 36223385630](https://github.com/ofelipepeixoto/radar-oaas/actions/runs/36223385630): cinco testes de integração real e uma jornada integral de navegador. Próxima ação: concluir a jornada no Sites hospedado com dois endereços controlados pelo usuário, SMTP e redirects conferidos. Não aplicar licença MIT sem decisão explícita de titular e escopo. Ver limites e resultado efetivo em STATUS.

| Etapa | Entrega necessária | Evidência para avançar |
| --- | --- | --- |
| 1. Público e oferta | Selecionar um segmento inicial, identificar comprador e delimitar diagnóstico avulso com escopo e aceite | Hipóteses e critérios documentados; entrevistas e oferta autorizadas, sem presumir demanda |
| 2. Protocolo de validação | Seleção de participantes, roteiro, autorização para dados, linha de base, métricas e critérios de revisão/interrupção | Metas declaradas antes da coleta; preço experimental definido separadamente |
| 3. Homologação técnica | Duas contas, isolamento de leitura/escrita/exportação/exclusão, confirmação de cadastro, recuperação e redirects | Testes reais de Auth/PostgREST e revisão dos fluxos; preservar configurações/dados dos outros projetos |
| 4. Piloto comercial | Diagnóstico assistido com organizações independentes do mesmo segmento | Medir pagamento independente de venda de implementação, utilidade frente à linha de base, horas humanas, custos e oportunidade de repetição |
| 5. Decisão do modelo | Confrontar os resultados observados com as hipóteses | Manter serviço avulso, testar assinatura, ajustar oferta ou interromper, conforme evidência |

A conclusão dos fluxos técnicos e das condições de uso de dados precede a coleta de dados reais de participantes externos. PGlite, testes de demonstração e publicação Sites não substituem a homologação autenticada entre duas contas. O MVP já está publicado no GitHub e tem CI aprovada no commit registrado acima; isso não comprova aptidão para uso de dados reais nem encerra a preparação comercial.

## Piloto proposto

A proposta exploratória é acompanhar aproximadamente **5 organizações, 10 projetos e 30 dias**. Esses números orientam o desenho inicial; não são amostra estatisticamente validada, prazo contratado, meta aprovada ou resultado alcançado. Ajustar ao segmento e ao ciclo real de compra. Não há participantes confirmados neste registro.

Avaliar três sinais separadamente: pagamento pelo diagnóstico, utilidade observada em comparação ao processo anterior e repetição quando surgir uma nova oportunidade. Registrar também onboarding, revisão, suporte, aquisição e horas de especialistas para evitar confundir receita com contribuição ou lucro.

Pagamento e utilidade com pouca repetição podem favorecer diagnóstico avulso/assistido. Repetição com custos sustentáveis permite testar assinatura B2B; não prova adequação comercial por si só. Ausência dos sinais exige revisar público, problema, oferta ou método. O preço de R$ 499/mês e os demais valores do planejamento são exemplos ilustrativos, sem aprovação de cobrança ou orçamento.

## Três ciclos diferentes

1. Homologação técnica e avaliação de compreensão da interface.
2. Piloto comercial do próprio avaliador, com a proposta exploratória acima.
3. Plano de 90 dias gerado para o projeto avaliado pelo usuário.

O terceiro ciclo não define o prazo de validação comercial deste produto. A concordância entre revisores também não equivale a capacidade comprovada de prever sucesso empresarial.

## Escopo posterior condicionado a evidência

IA paga somente após demonstrar benefício, definir orçamento e obter configuração/autorização correspondentes. Novas integrações, multiagentes, cobranças, colaboração avançada e alterações na VPS não fazem parte desta preparação GitHub. Não ampliar funcionalidades apenas para iniciar o piloto.

Resultados técnicos atuais e bloqueios: [STATUS](../STATUS.md). Protocolo de compreensão/usabilidade: [piloto do avaliador](evaluator-pilot.md). Regras de dados: [privacidade](privacy.md). Licença: [proposta pendente](../LICENSE-PROPOSED.md).
