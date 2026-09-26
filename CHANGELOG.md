# Changelog

## 0.1.0-experimental — preparação local — 2026-09-26

Primeira implementação do Radar OaaS com regras propostas baseadas na fonte editorial `2026-09-23`. Separação entre critérios e blocos, tratamento explícito de N/D, versão das regras, quatro travas e decisões por estágio; cálculos e exemplos didáticos com divergência R$20/R$60 registrada; estrutura de aplicação, persistência privada, testes e documentação comunitária.

Esta entrada descreve a preparação da versão, não um release publicado. Comandos executados, resultados e limitações constam em `STATUS.md`. O repositório público foi criado posteriormente, conforme atualização abaixo. Licença definitiva, titular e conclusão do envio inicial do MVP permanecem pendentes; CI remota ainda não executada.

### Atualizações durante a preparação

Portado para Astro7 com ilhas React e adaptador Cloudflare por instrução do usuário; alvo Sites privado. Handlers foram separados do roteamento. Comparador de snapshots e seis sinais operacionais adicionados, sem efeito automático em scores/decisões; plano90dias passou a ser editável. Implantação paralela Supabase usa namespace próprio, conforme autorização posterior e status registrado. Testes/build/runtime Astro exigem validação própria; esta nota não anuncia aprovação.

### Repositório GitHub criado e preparação do envio — 2026-09-26

Cópia do commit Sites `cb9cf548908f4fec935d11cf029987f58e4c9ce6` preparada para `ofelipepeixoto/radar-oaas`. Documentação ajustada para registrar a autorização, a publicação Sites privada já concluída e os próximos passos de homologação/validação comercial. Vínculo particular `.openai/hosting.json` excluído desta cópia e ignorado no Git. Código, migração, testes, dependências e workflow preservados. Nenhuma mudança metodológica ou licença aplicada; pacote `UNLICENSED`. Repositório público [ofelipepeixoto/radar-oaas](https://github.com/ofelipepeixoto/radar-oaas) criado e confirmado, branch `main`, commit inicial de README `7bf59c62774c482563ddcccec1e1cb6fea2900b0`. Envio inicial do MVP em andamento; CI remota ainda não executada.
