# Roadmap do MVP público

As etapas são prioridades, não promessas de prazo ou evidência de demanda.

1. **Primeiro teste sem cadastro:** quatro etapas por escolhas, não sei, exemplo separado, plano com três passos, copiar, editar/apagar, regras transparentes e pacote estático sem APIs. Implementação nesta branch; publicação e gates em STATUS.
2. **Aprender com uso:** observar cinco leigos, registrar dúvidas sem dados sensíveis, testar clareza do resultado e modelos de tarefas. Critério proposto: a pessoa explica o próximo teste sem ajuda. Piloto ainda não realizado.
3. **Aprofundar quando houver necessidade:** registro opcional do que foi observado e acesso avançado privado após homologação hospedada entre duas contas. Preservar snapshots, custos e evidências; nenhuma dependência paga obrigatória.

Boas primeiras contribuições: exemplos de entregas delimitadas, revisão de linguagem, testes de teclado/zoom e melhoria de mensagens de armazenamento indisponível. Abra issue com problema, caso sintético e resultado esperado; não publique respostas de usuários.

## Histórico do planejamento anterior

# Roadmap

Este roadmap descreve trabalho do aplicativo. O plano de 90 dias mostrado ao usuário é sobre o projeto que ele avalia.

## Entrega inicial preparada

Aplicativo Astro com ilhas React e alvo Sites privado; motor determinístico, modelos versionados, evidências, oito critérios, seis blocos e cobertura, travas por etapa, economia/capacidade, comparação de snapshots, sinais operacionais, plano90dias editável, exemplos sintéticos, persistência privada Supabase, demonstração sem login, diagnóstico/exportações, IA simulada, testes e documentação. O estado executado de cada item deve ser conferido em `STATUS.md` e `docs/traceability.md`; esta lista não declara aprovação de produção.

## Antes da primeira publicação

1. Confirmar titular/destino GitHub, licença do código e materiais autorizados.
2. Resolver os bloqueios de execução identificados em `STATUS.md`.
3. Executar banco local, isolamento de duas contas, jornada completa e revisão de segredos.
4. Confirmar mantenedores, canal privado de vulnerabilidade e proteção de branch.
5. Publicar em destino confirmado e verificar commit, visibilidade e CI remota.

## Piloto e aprendizado

Realizar o piloto de compreensão e rastreabilidade em `docs/evaluator-pilot.md`. Ajustar interface e rubricas conforme resultados documentados, com nova versão quando mudar decisão. Medir recomendações inadequadas e divergência entre revisores antes de ampliar uso.

## Candidatos posteriores

Melhorias de acessibilidade e estudos das comparações já implementadas; revisão externa com papéis próprios; calibração de rubricas por estudos autorizados. Integração real de IA só com opt-in, limites, saída validada e rastreabilidade, preservando decisão determinística.

## Fora do MVP

Uploads/extrator documental, colaboração de vários proprietários, cobrança, marketplace, ranking público, aplicativo móvel, publicação automática de projetos e execução dos serviços OaaS do usuário.

Uma implantação futura em VPS Node requer adaptador e pacote novos; o container da implementação anterior não é compatível com a saída Cloudflare atual.
