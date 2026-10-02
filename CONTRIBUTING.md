# Como contribuir

Código original sob [MIT](LICENSE), com exclusões em [NOTICE.md](NOTICE.md). Contribuições de código devem ser compatíveis com MIT, preservar créditos e licenças de terceiros e não incluir o framework editorial integral. Use o repositório [ofelipepeixoto/radar-oaas](https://github.com/ofelipepeixoto/radar-oaas) e abra uma proposta pequena em draft PR.

1. Leia README, metodologia e questões da fonte.
2. Escolha uma issue existente ou descreva o problema; tarefas introdutórias usarão `good first issue` e pedidos de apoio `help wanted`.
3. Faça fork e crie uma branch com escopo pequeno.
4. Instale com `npm ci`; execute os comandos em [docs/testing.md](docs/testing.md).
5. Adicione teste que reproduza o comportamento relevante e atualize a documentação afetada.
6. Abra pull request com causa, mudança, evidência de execução e limitações.

Use apenas dados sintéticos. Não envie `.env`, tokens, dumps, relatórios, contratos ou evidências de projetos privados. Trocar nomes de um caso real não basta para torná-lo público. Vulnerabilidades seguem [SECURITY.md](SECURITY.md).

## Mudanças nas regras

Toda proposta identifica origem, versão e regra afetada. Inclua exemplos antes/depois, razão estratégica, riscos de avanço indevido e testes. Preserve `null` para N/D, cobertura parcial, revisão humana, travas e snapshots. Alterações que mudam resultados exigem versão de regra nova. Não converter os oito critérios em seis blocos por média implícita.

## Interface e acessibilidade

Escreva em português brasileiro, dê nomes claros aos campos, preserve uso por teclado e apresente mensagens além de cor. Texto de evidência é dado não confiável. Não use HTML bruto ou navegação automática para URLs fornecidas. Prefira melhorias que aumentem compreensão de lacunas à gamificação das notas.

## Revisão

Declare o que foi executado e o que ficou bloqueado; anexar configuração de CI não equivale a CI aprovada. Novas dependências exigem necessidade, licença e versão justificadas. Não introduzir serviços pagos, rastreamento de conteúdo ou IA externa por padrão.
