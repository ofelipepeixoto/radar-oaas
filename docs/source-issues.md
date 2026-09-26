# Questões da fonte e direitos

Registro em 26/09/2026. Nenhuma divergência foi corrigida silenciosamente no documento original. O DOCX não integra este repositório preparado para publicação.

## Identificação de origem

- Documento lido: `Radar_Disruptivo_Framework_Outcome_as_a_Service_2026(1).docx`.
- Data-base editorial: `2026-09-23`.
- Autoria editorial declarada no documento: Radar Disruptivo.
- SHA-256 do arquivo recebido: `9d138d7fc5284655423c004e3bebd42e7bdd285878161fceaf4d2bfa7f298234`.
- Especificação de implementação: `Markdown colado(4).md`, SHA-256 `3320bbcea2d8ea80baca95ab4d17ab5d5327c19bf20b8782b8bee5225d5b24ab`.
- Regras de software propostas: `0.1.0-experimental`.

Hashes identificam o material recebido; não comprovam autoria, licença ou validação externa.

| ID | Local | Questão | Tratamento no MVP | Estado |
| --- | --- | --- | --- | --- |
| SRC-001 | Framework §07 | Texto informa R$60 após elevar custo-hora a R$120; os insumos produzem R$20 | Calcular pelos insumos e fórmula, mostrar 1% de margem, conservar divergência | Confirmação editorial pendente |
| SRC-002 | §§02 e 11 | Oito critérios e seis blocos, sem função explícita de conversão | Notas independentes; vínculos argumentados, sem média automática | Proposta MVP documentada |
| SRC-003 | §11 | Pesos sugeridos sem fórmula para N/D ou nota de corte | Cobertura/índice parcial versionados; nenhum corte aprova | Proposta MVP documentada |
| SRC-004 | §§11 e 12 | Regras de etapa descritivas; condições computacionais não exaustivas | Tabela de decisão explícita e testes; não atribuir validação estatística à fonte | Proposta MVP documentada |
| SRC-005 | §12 | Cronograma 90 dias e 10–20 entrevistas exploratórias | Agenda editável do projeto avaliado; não prazo de software ou prova estatística | Preservado |
| SRC-006 | Referências editoriais | A fonte declara pesquisas externas; nem todas foram verificadas nesta execução | Somente páginas verificadas listadas em research-context; sem transferir números ao motor | Verificação integral não realizada |
| SRC-008 | Especificação §12 | Next.js era arquitetura proposta; usuário exigiu Astro posteriormente | Astro 7 + ilhas React + adaptador Cloudflare; preservar domínio/regras e repetir validações, conforme ADR-004 | Instrução posterior incorporada |
| SRC-007 | Direitos | Autorização para publicação integral do framework/marca e titular do código não confirmados | DOCX excluído; MIT apenas proposta; publicação depende de confirmação | Pendente |

### Reprodução de SRC-001

```text
Cenário A: 2.000 - 300 - (12 × 80) - 240 = 500
Margem de entrega: 500 / 2.000 = 25%

Cenário B: 2.000 - 300 - (12 × 120) - 240 = 20
Margem de entrega: 20 / 2.000 = 1%
```

Os resultados são derivados dos insumos e da fórmula, sujeitos à confirmação editorial. O cenário é didático; valores não representam mercado, cliente ou benchmark. Onboarding, aquisição, estrutura e tributos não estão cobertos pela margem de entrega desses exemplos.

## Resolução de questões

Mudança editorial: obter texto aprovado, preservar ID anterior, registrar nova versão e exemplos antes/depois. Mudança de regra: abrir proposta metodológica com testes e impacto sobre decisões. Reavaliações criam snapshots novos; avaliações antigas não são recalculadas em silêncio.

## Separação de direitos

A futura licença do código não relicencia framework, marca, DOCX, artigos, logos ou materiais de terceiros. Antes da primeira publicação, o titular deve confirmar destino GitHub, licença e conteúdo autorizado. Nenhum mantenedor ou canal institucional foi inventado. A nota de pesquisa contém paráfrases breves e links; não inclui relatórios ou imagens de terceiros.
