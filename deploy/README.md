# VPS — alternativa futura, não implementada para Astro

A arquitetura vigente usa **Astro7 + ilhas React + adaptador Cloudflare em Sites privado**. O build gera `dist/server/index.js` com handler fetch de Worker e assets em `dist/client`. O roteiro vigente está em [docs/deployment.md](../docs/deployment.md).

O roteiro de containers anterior foi removido. A alternativa VPS exige implementação e verificação próprias com o adaptador Node.

## O que uma implantação Node exigiria

Escolher e configurar um adaptador Astro Node dedicado; definir uma entrada de servidor apropriada; criar Dockerfile/Compose novos; separar configuração pública de segredos de runtime; verificar sessão, handlers, build, shutdown e healthcheck; testar recursos e reversão em ambiente isolado. Esse trabalho não foi implementado nem verificado nesta entrega.

Antes de qualquer alteração na VPS, identificar a VM autorizada, containers existentes, recursos livres, proxy HTTPS e porta disponível. Não presumir capacidade nem conectar o aplicativo às redes/diretórios de outros produtos. A inspeção operacional da VPS não foi concluída na execução inicial por indisponibilidade das ferramentas VPS do conector; não houve alteração remota por este pacote.

## Dados e planos

Supabase compartilhado no `radar-disruptivo` foi autorizado posteriormente com `public.oaas_*` e `oaas_private`. Auth e recursos continuam compartilhados; namespace não cria isolamento total de capacidade. A tentativa anterior de projeto dedicado Free falhou por cota. Não pausar/excluir projetos, mudar plano ou hospedar a plataforma inteira Supabase na VPS por inferência.

IA real continua desligada; `AI_PROVIDER=simulated` não exige chave. Nunca expor `service_role`, senha de banco ou segredo de IA em variáveis `PUBLIC_*`, arquivos versionados ou argumentos de build. Configuração atual e resultados reais estão em STATUS; nenhuma disponibilidade operacional de VPS é anunciada aqui.
