export const FRAMEWORK_VERSION = '2026-09-23';
export const RULES_VERSION = '0.1.0-experimental';
export const DISCLAIMER = 'Avaliação estratégica experimental baseada nas informações registradas. Não constitui certificação, parecer profissional ou garantia de resultado';
export const STAGES = ['idea', 'discovery', 'contract', 'paid_pilot', 'repetition', 'scale_decision'] as const;
export const STAGE_LABELS = { idea: 'Ideia', discovery: 'Descoberta', contract: 'Contrato', paid_pilot: 'Piloto pago', repetition: 'Repetição', scale_decision: 'Decisão de escala' } as const;
export const CRITERIA = ['budget','incumbent','valuable_pain','automation','verifiability','advantage','learning','barriers'] as const;
export const CRITERION_LABELS = {budget:'Orçamento', incumbent:'Incumbente', valuable_pain:'Dor valiosa', automation:'Automatização', verifiability:'Verificabilidade', advantage:'Vantagem', learning:'Aprendizado', barriers:'Barreiras'} as const;
export const BLOCKS = ['pain_budget','verification_advantage','automation_operation','economics_pricing','defensibility_access','risk_responsibility'] as const;
export const BLOCK_LABELS = {pain_budget:'Dor + orçamento', verification_advantage:'Verificabilidade + vantagem', automation_operation:'Automação + operação', economics_pricing:'Economia + preço', defensibility_access:'Defensibilidade + acesso', risk_responsibility:'Risco + responsabilidade'} as const;
export const BLOCK_WEIGHTS: Readonly<Record<(typeof BLOCKS)[number],number>> = Object.freeze({pain_budget:0.2,verification_advantage:0.2,automation_operation:0.2,economics_pricing:0.2,defensibility_access:0.1,risk_responsibility:0.1});
export const GATES = ['legal','severe_failure','structural_margin','impossible_acceptance'] as const;
export const GATE_LABELS = {legal:'Risco legal intransponível', severe_failure:'Falha grave não mitigada', structural_margin:'Margem estrutural negativa', impossible_acceptance:'Aceite impossível'} as const;
export const CANVAS_KEYS = ['icp','sector','geography','buyer','signer','payer','receiver','validator','current_alternative','narrow_work','trigger','inputs','outcome','acceptance','exceptions','value','distribution','frequency','volume','proven_spend','decision_maker','baseline','human_owner','deadline','price'] as const;
export const CANVAS_LABELS:Record<(typeof CANVAS_KEYS)[number],string> = {icp:'ICP',sector:'Setor',geography:'Geografia / jurisdição',buyer:'Comprador e usuário',signer:'Quem assina',payer:'Quem paga',receiver:'Quem recebe',validator:'Quem valida',current_alternative:'Alternativa atual',narrow_work:'Trabalho estreito',trigger:'Gatilho de início',inputs:'Entradas',outcome:'Resultado delimitado',acceptance:'Critério de aceite',exceptions:'Exceções',value:'Valor',distribution:'Distribuição',frequency:'Frequência',volume:'Volume',proven_spend:'Gasto atual comprovado',decision_maker:'Decisor',baseline:'Baseline de custo / prazo / qualidade',human_owner:'Responsável humano',deadline:'Prazo',price:'Preço'};
export const CHECKS = ['buyer','current_spend','baseline','process','wedge','scope','acceptance','price','exclusions','data_rights','controls','specialist','pilot_goals','representative_cases','payment','quality','safety','complete_costs','queue','human_hours','repeated_demand','repeated_quality','sustainable_economics','human_capacity','documented_process','renewal'] as const;
export const CHECK_LABELS:Record<(typeof CHECKS)[number],string> = {buyer:'Comprador identificado',current_spend:'Gasto atual documentado',baseline:'Baseline comparável',process:'Processo delimitado',wedge:'Cunha delimitada',scope:'Escopo',acceptance:'Regra de aceite',price:'Preço e compromisso comercial',exclusions:'Exclusões',data_rights:'Direitos de dados e acesso',controls:'Controles',specialist:'Especialista quando necessário',pilot_goals:'Metas prévias do piloto',representative_cases:'Casos representativos',payment:'Pagamento observado',quality:'Qualidade avaliada',safety:'Segurança avaliada',complete_costs:'Custos completos',queue:'Fila registrada',human_hours:'Horas humanas registradas',repeated_demand:'Demanda paga repetida',repeated_quality:'Qualidade repetida',sustainable_economics:'Economia sustentável comparável',human_capacity:'Capacidade humana disponível',documented_process:'Processo documentado',renewal:'Renovação compatível com o ciclo'};
export const COST_CATEGORIES = ['ai','infrastructure','data','integrations','human','support','rework','errors'] as const;
export const COST_LABELS = {ai:'IA / APIs',infrastructure:'Infraestrutura',data:'Dados',integrations:'Integrações',human:'Pessoas',support:'Suporte',rework:'Retrabalho',errors:'Erros'} as const;
export const TRANSITION_CHECKS = {
 idea: [],
 discovery: ['buyer','current_spend','baseline','process','wedge'],
 contract: ['scope','acceptance','price','exclusions','data_rights','controls','specialist','pilot_goals'],
 paid_pilot: ['representative_cases','payment','quality','safety','complete_costs','queue','human_hours'],
 repetition: ['repeated_demand','repeated_quality','sustainable_economics','human_capacity','documented_process','renewal'],
 scale_decision: ['repeated_demand','repeated_quality','sustainable_economics','human_capacity','documented_process','renewal'],
} as const satisfies Record<(typeof STAGES)[number],readonly (typeof CHECKS)[number][]>;
export const PLAN_90_DAYS = [
 {period:'Dias 1–15',stage:'discovery',objective:'Investigar orçamento, comprador, baseline e uma cunha; 10–20 entrevistas são alvo exploratório, não validação estatística.'},
 {period:'Dias 16–30',stage:'contract',objective:'Definir escopo, aceite, preço, exclusões, revisão humana, direitos e metas antes do piloto.'},
 {period:'Dias 31–60',stage:'paid_pilot',objective:'Somente após direitos e controles: piloto pago com casos representativos, custos completos e especialista quando necessário.'},
 {period:'Dias 61–75',stage:'repetition',objective:'Repetir em outra conta/coorte comparável; medir qualidade, custo e horas por aceito.'},
 {period:'Dias 76–90',stage:'scale_decision',objective:'Revisar demanda paga, qualidade, economia, capacidade e renovação compatível com o ciclo.'},
] as const;
