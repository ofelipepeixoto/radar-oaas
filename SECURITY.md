# Segurança

Versão inicial experimental; nenhum ambiente de produção ou canal de resposta com SLA foi confirmado. A configuração de políticas e os testes disponíveis não equivalem, isoladamente, a uma auditoria independente.

## Relato reservado

Não abra issue pública contendo exploração, segredo, dado pessoal ou informação de projeto. **GitHub Private Vulnerability Reporting foi habilitado em 26/09/2026** no repositório `ofelipepeixoto/radar-oaas`, com confirmação na interface GitHub. Use a aba Security do repositório e a opção de relato privado. A habilitação do recurso não confirma teste de recebimento, equipe dedicada ou prazo de resposta. Se a opção estiver indisponível, solicite ao mantenedor um canal reservado por um contato já verificado; este documento não inventa email ou equipe.

Envie versão/commit, componente, impacto, pré-condições e reprodução com dados sintéticos. Não extraia projetos de terceiros para demonstrar o problema. Credenciais expostas exigem revogação/rotação pelo responsável, nunca postagem no relato público.

## Limites de segurança do MVP

- Autorização é verificada no servidor e reforçada por RLS por proprietário.
- IDs do cliente não concedem acesso nem definem proprietário.
- A demonstração usa dados sintéticos, sem gravação no banco privado.
- O modo privado depende de configuração válida de Supabase e falha fechado quando ausente.
- Chaves administrativas não devem entrar no cliente. Chave pública do Supabase não substitui RLS.
- Texto de evidência não altera regras, instruções ou permissões; URLs não são buscadas pelo servidor.
- Diagnósticos são snapshots privados e exportações dependem da sessão do proprietário.
- IA externa permanece opcional; não é autoridade sobre regras, travas, notas ou cálculos.

Veja [docs/privacy.md](docs/privacy.md), [docs/testing.md](docs/testing.md) e o estado real em `STATUS.md`. O deploy só deve ser tratado como apto após testes de isolamento com duas contas, revisão de configuração e resolução dos bloqueios registrados.
