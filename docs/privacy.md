# Dados, privacidade e retenção

Documento operacional do MVP, não certificação de conformidade jurídica. Obrigações, base jurídica e papéis da implantação precisam de revisão conforme usuários e jurisdição. Um checkbox não prova direito de uso dos dados.

## Inventário

| Dados | Finalidade | Onde | Exposição pública padrão |
| --- | --- | --- | --- |
| Identidade/email da conta | Autenticação | Supabase Auth | Nenhuma |
| Projeto e canvas | Delimitar oportunidade | Banco por proprietário | Nenhuma |
| Evidências e URLs | Sustentar revisão | Banco por proprietário | Nenhuma; URLs não são consultadas automaticamente |
| Notas, confiança e justificativas | Diagnóstico | Rascunho e snapshots | Nenhuma |
| Travas, riscos, economia e capacidade | Decisão explicável | Rascunho e snapshots | Nenhuma |
| Experimentos | Próxima validação | Banco por proprietário | Nenhuma |
| AuditEvent | Rastreabilidade operacional | Banco por proprietário | Metadados mínimos; sem conteúdo integral em logs |
| Contadores de quota de IA | Limitar chamadas/tokens por usuário/dia | Schema privado `oaas_private.ai_usage` | Sem conteúdo de projeto; sem acesso direto do usuário |
| Exemplos fictícios | Demonstração e testes | Código/estado demonstrativo | Sim, somente sintéticos |
| Exportações | Portabilidade controlada pelo dono | Download do usuário | Nenhuma publicação automática |

## Retenção proposta

Projetos e snapshots persistem enquanto o proprietário os mantiver. A exclusão explícita do projeto deve remover seus dados relacionados, incluindo snapshots e metadados de auditoria ligados ao projeto; confirmar cascatas nos testes. Não reter cópia oculta em logs da aplicação. A imutabilidade vale durante a vida do registro, não como exceção ao pedido de exclusão.

A exclusão do projeto não exclui a conta Supabase Auth compartilhada com outros produtos. Operações de conta precisam de canal do responsável pela implantação. Backups/logs de infraestrutura seguem a configuração do provedor, ainda sem prazo operacional confirmado nesta entrega; antes de coletar dados reais, definir e informar prazos de expiração, recuperação e atendimento a titulares. Não prometer eliminação instantânea de backups sem evidência.

## Exportação

O proprietário pode obter JSON, Markdown e relatório para impressão. Exportações podem conter toda a informação privada do projeto; o usuário controla o arquivo após baixá-lo. Nomes/conteúdo são tratados como texto, com escaping adequado. Exportação não cria página pública.

## Dependências externas

Supabase oferece autenticação e armazenamento quando configurado. Hospedagem executa o servidor e pode processar metadados técnicos. IA real, se habilitada e escolhida explicitamente, recebe somente conteúdo necessário definido pelo adaptador; provedor/modelo/prompt/data/referências são auditáveis. A demo não chama IA real.

Sem analytics de conteúdo por padrão. Telemetria do Astro deve permanecer desativada na execução. Não coletar contratos, documentos pessoais ou segredos desnecessários. A aplicação não possui upload/extrator de anexos no escopo inicial.

## Incidentes e comunidade

Relatos seguem [SECURITY.md](../SECURITY.md). Issues/PRs aceitam apenas exemplos sintéticos. Compartilhamento de aprendizado de um projeto real exige processo separado de autorização e revisão, inclusive quando parcialmente anonimizado. Nunca usar dados privados como fixture para facilitar reprodução.

Contadores de quota não integram o projeto e não são apagados pela exclusão de um projeto, evitando reinício do limite por exclusão/recriação. Retêm identificador de usuário, janela diária e contagens, sem conteúdo de evidência. A rotina de expiração desses metadados e o tratamento na exclusão da conta devem ser definidos antes do uso real de IA.
