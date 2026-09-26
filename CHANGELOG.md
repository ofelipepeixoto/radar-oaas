# Changelog

## 2026-09-26 — Homologação Auth autorizada

Acrescentado workflow com Supabase local descartável, Auth/PostgREST reais e capturador Mailpit. Configuração local alinhada aos redirects usados pelo aplicativo e confirmação de e-mail obrigatória. Nova suíte de navegador para cadastro, confirmação, recuperação e isolamento A/B por HTTP; remoção dos usuários de teste e containers ao final. Sem mudanças no Auth remoto, nos dados Radar, no domínio de cálculo ou na licença. Resultado executado e limite da homologação hospedada registrados em STATUS.

## 0.1.0-experimental — preparação local — 2026-09-26

Primeira implementação do Radar OaaS com regras propostas baseadas na fonte editorial `2026-09-23`. Separação entre critérios e blocos, tratamento explícito de N/D, versão das regras, quatro travas e decisões por estágio; cálculos e exemplos didáticos com divergência R$20/R$60 registrada; estrutura de aplicação, persistência privada, testes e documentação comunitária.

Esta entrada descreve a preparação da versão, não um release publicado. Comandos executados, resultados e limitações constam em `STATUS.md`. O repositório público foi criado posteriormente, conforme atualização abaixo. O envio inicial do MVP e a CI remota foram concluídos, conforme registro abaixo. Licença definitiva e titular permanecem pendentes.

### Atualizações durante a preparação

Portado para Astro7 com ilhas React e adaptador Cloudflare por instrução do usuário; alvo Sites privado. Handlers foram separados do roteamento. Comparador de snapshots e seis sinais operacionais adicionados, sem efeito automático em scores/decisões; plano90dias passou a ser editável. Implantação paralela Supabase usa namespace próprio, conforme autorização posterior e status registrado. Testes/build/runtime Astro exigem validação própria; esta nota não anuncia aprovação.

### MVP publicado no GitHub e CI aprovada — 2026-09-26

Cópia do commit Sites `cb9cf548908f4fec935d11cf029987f58e4c9ce6` preparada para `ofelipepeixoto/radar-oaas`. Documentação ajustada para registrar a autorização, a publicação Sites privada já concluída e os próximos passos de homologação/validação comercial. Vínculo particular `.openai/hosting.json` excluído desta cópia e ignorado no Git. Código, migração, testes, dependências e workflow preservados. Nenhuma mudança metodológica ou licença aplicada; pacote `UNLICENSED`. Repositório público [ofelipepeixoto/radar-oaas](https://github.com/ofelipepeixoto/radar-oaas) criado e confirmado, branch `main`, commit inicial de README `7bf59c62774c482563ddcccec1e1cb6fea2900b0`. O MVP foi publicado no commit `5e53d58210f81afed34b436f069a7ab55e83c3e4` e a [CI remota](https://github.com/ofelipepeixoto/radar-oaas/actions/runs/36221322124) foi aprovada (`completed` / `success`).

Os 197 arquivos do commit `5e53d58210f81afed34b436f069a7ab55e83c3e4` foram conferidos contra a cópia preparada, sem divergências de conteúdo. Árvore Git: `4d071e2a5638a17f611a916710e42c00cf5dfd16`. A execução [36221322124](https://github.com/ofelipepeixoto/radar-oaas/actions/runs/36221322124) aprovou `npm ci`, lint, tipos, build, instalação Chromium e 128 testes: 104 unitários/IA, 14 de integração e 10 E2E, em Ubuntu com Node.js 24. GitHub Private Vulnerability Reporting está habilitado; proteção de branch não foi criada. A homologação de Auth/PostgREST com duas contas reais de teste permanece pendente. Nenhuma licença foi aplicada: pacote `UNLICENSED`, titular e proposta MIT ainda pendentes.
