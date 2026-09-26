import { FRAMEWORK_VERSION, RULES_VERSION } from './constants';
import { calculateEconomics } from './economics';
import { assessmentInputSchema, type AssessmentInput, type OperationalSignals } from './schema';
import type { AssessmentSnapshot } from './snapshots';

export interface OperationalSignal {code:string;message:string;basis:'declared'|'calculated_comparison';evidenceIds:string[];}
export interface ComparisonMetric {id:'quality'|'cost_per_accepted'|'hours_per_accepted'|'delivery_margin'|'onboarding_hours'|'exception_rate'|'client_work_hours';label:string;previous:number|null;current:number|null;delta:number|null;unit:string;interpretation:'improved'|'worsened'|'unchanged'|'not_comparable'|'not_available';}
export interface ComparisonContext {previousRulesVersion:string;currentRulesVersion:string;previousFrameworkVersion:string;currentFrameworkVersion:string;}
export interface AssessmentComparison {comparable:boolean;reasons:string[];metrics:ComparisonMetric[];signals:OperationalSignal[];limitations:string[];previousCohort:string|null;currentCohort:string|null;}
const LIMITATIONS=['Comparação descritiva de dados registrados; não comprova causalidade nem vantagem defensável.','Revisão do proprietário é autodeclarada, não auditoria independente.','Mudança de mix ou transferência de trabalho ao cliente pode explicar diferenças; não atribuir melhoria automaticamente ao sistema.'];
function hasReviewedComparison(signals:OperationalSignals,input:AssessmentInput):boolean{return signals.review?.status==='self_declared'&&!!signals.review.author.trim()&&!!signals.review.reviewedAt.trim()&&signals.evidenceIds.length>0&&signals.evidenceIds.every(id=>input.evidence.some(e=>e.id===id&&e.type!=='hypothesis'&&e.review?.status==='self_declared'&&!!e.review.author.trim()&&!!e.review.reviewedAt.trim()&&!!e.claim.trim()&&!!e.description.trim()&&!!e.source.trim()));}
function declaredSignals(input:AssessmentInput):OperationalSignal[]{const signals:OperationalSignal[]=[];const x=input.operationalSignals;const evidenceIds=x.evidenceIds.filter(id=>input.evidence.some(e=>e.id===id));if(x.novelCustomizationPerClient===true)signals.push({code:'NOVEL_CUSTOMIZATION_PER_CLIENT',message:'Sinal declarado: cada cliente exige customização inédita; investigar custo e repetibilidade antes de afirmar escala tecnológica.',basis:'declared',evidenceIds});if(x.founderDependent===true)signals.push({code:'FOUNDER_DEPENDENCY',message:'Sinal declarado: a operação depende do fundador; testar execução por responsável capacitado e documentar limites.',basis:'declared',evidenceIds});return signals;}
/** Independent criterion/scorecard scores are intentionally absent from this comparator. */
export function compareAssessments(previousRaw:AssessmentInput,currentRaw:AssessmentInput,context:ComparisonContext={previousRulesVersion:RULES_VERSION,currentRulesVersion:RULES_VERSION,previousFrameworkVersion:FRAMEWORK_VERSION,currentFrameworkVersion:FRAMEWORK_VERSION}):AssessmentComparison {
 const previous=assessmentInputSchema.parse(previousRaw);const current=assessmentInputSchema.parse(currentRaw);const a=previous.operationalSignals;const b=current.operationalSignals;const reasons:string[]=[];const pe=previous.economics;const ce=current.economics;const p=pe?calculateEconomics(pe):null;const c=ce?calculateEconomics(ce):null;
 if(previous.projectId!==current.projectId)reasons.push('Projetos diferentes: comparar apenas avaliações do mesmo projeto.');
 if(context.previousRulesVersion!==context.currentRulesVersion||context.previousFrameworkVersion!==context.currentFrameworkVersion)reasons.push('Versões de regras ou framework diferentes: revisar rubricas antes de comparar.');
 if(!pe||!ce)reasons.push('Economia ausente em uma das avaliações.');
 else {if(pe.currency!==ce.currency)reasons.push('Moedas diferentes.');if(pe.unit!==ce.unit)reasons.push('Unidades de resultado aceito diferentes.');}
 if(p&&!p.valid||c&&!c.valid)reasons.push('Dados econômicos inválidos: resolver incompatibilidades e rateios.');
 if(!a.icpMix.trim()||!b.icpMix.trim()||a.icpMix.trim()!==b.icpMix.trim())reasons.push('ICP/mix ausente ou alterado: não atribuir a diferença à melhoria do sistema.');
 if(!a.measurementWindow.trim()||!b.measurementWindow.trim()||a.measurementWindow.trim()!==b.measurementWindow.trim())reasons.push('Janelas de medição ausentes ou de duração diferente.');
 if(b.mixComparable!==true||!b.comparabilityJustification.trim()||!hasReviewedComparison(b,current))reasons.push('Comparabilidade das coortes exige justificativa e evidências revisadas pelo proprietário.');
 if(previous.capacity&&pe&&previous.capacity.period!==pe.period||current.capacity&&ce&&current.capacity.period!==ce.period)reasons.push('Período de capacidade difere da economia na mesma avaliação.');
 const comparable=reasons.length===0;
 const metric=(id:ComparisonMetric['id'],label:string,oldValue:number|null,newValue:number|null,unit:string,higherBetter:boolean,extraComparable=true):ComparisonMetric=>{const available=oldValue!==null&&newValue!==null;const canCompare=comparable&&extraComparable;const delta=available&&canCompare?newValue-oldValue:null;return {id,label,previous:oldValue,current:newValue,delta,unit,interpretation:!available?'not_available':!canCompare?'not_comparable':delta===0?'unchanged':(delta!>0)===higherBetter?'improved':'worsened'};};
 const qualityComparable=!!a.qualityMetric.trim()&&a.qualityMetric===b.qualityMetric&&!!a.qualityRubric.trim()&&a.qualityRubric===b.qualityRubric&&a.qualityDirection===b.qualityDirection;
 const metrics=[
  metric('quality',b.qualityMetric||a.qualityMetric||'Qualidade registrada',a.qualityValue,b.qualityValue,'unidade da rubrica',b.qualityDirection==='higher_better',qualityComparable),
  metric('cost_per_accepted','Custo por resultado aceito',p?.costPerAcceptedCents??null,c?.costPerAcceptedCents??null,ce?.currency?`${ce.currency} centavos`:'centavos',false),
  metric('hours_per_accepted','Horas humanas por resultado aceito',pe&&pe.accepted>0&&pe.humanHours!==null?pe.humanHours/pe.accepted:null,ce&&ce.accepted>0&&ce.humanHours!==null?ce.humanHours/ce.accepted:null,'horas',false),
  metric('delivery_margin','Margem de entrega',p?.deliveryMargin??null,c?.deliveryMargin??null,'fração',true),
  metric('onboarding_hours','Onboarding por cliente',a.onboardingHoursPerClient,b.onboardingHoursPerClient,'horas',false),
  metric('exception_rate','Taxa de exceção',previous.capacity?.exceptionRate??null,current.capacity?.exceptionRate??null,'fração',false),
  metric('client_work_hours','Trabalho transferido ao cliente por aceito',a.clientWorkHoursPerAccepted,b.clientWorkHoursPerAccepted,'horas',false),
 ];
 const signals=declaredSignals(current);const evidenceIds=[...new Set([...a.evidenceIds,...b.evidenceIds])];
 const add=(code:string,message:string)=>signals.push({code,message,basis:'calculated_comparison',evidenceIds});
 const get=(id:ComparisonMetric['id'])=>metrics.find(m=>m.id===id)!;
 if(comparable){
  const onboarding=get('onboarding_hours');if(onboarding.delta!==null&&onboarding.delta>=0&&onboarding.current!==null&&onboarding.current>0)add('ONBOARDING_NOT_FALLING','Onboarding por cliente não caiu nas duas avaliações comparáveis; investigar repetibilidade.');
  const exceptions=get('exception_rate');if(exceptions.delta!==null&&exceptions.delta>0)add('EXCEPTIONS_RISING','Taxa de exceção aumentou entre as avaliações comparáveis; revisar mix, falhas e capacidade humana.');
  const hours=get('hours_per_accepted');const margin=get('delivery_margin');if(pe&&ce&&ce.accepted>pe.accepted&&hours.delta!==null&&hours.delta>=-1e-9&&margin.delta!==null&&margin.delta<=1e-9)add('PROPORTIONAL_LABOR_WITHOUT_ECONOMIC_IMPROVEMENT','Volume aceito aumentou sem reduzir horas humanas por aceito e sem melhorar margem; crescimento não demonstrou ganho econômico de escala.');
  const clientWork=get('client_work_hours');if(clientWork.delta!==null&&clientWork.delta>0)add('WORK_TRANSFERRED_TO_CLIENT','Horas do cliente por aceito aumentaram; parte do ganho aparente pode ser transferência de trabalho ao cliente.');
 }
 const limitations=[...LIMITATIONS];if(!qualityComparable)limitations.push('Métrica, direção ou rubrica de qualidade ausente/diferente: a qualidade não é diretamente comparável.');
 return {comparable,reasons,metrics,signals,limitations,previousCohort:pe?.cohort??null,currentCohort:ce?.cohort??null};
}
export function compareSnapshots(previous:AssessmentSnapshot,current:AssessmentSnapshot):AssessmentComparison{return compareAssessments(previous.input,current.input,{previousRulesVersion:previous.rulesVersion,currentRulesVersion:current.rulesVersion,previousFrameworkVersion:previous.frameworkVersion,currentFrameworkVersion:current.frameworkVersion});}
export function identifyOperationalSignals(currentRaw:AssessmentInput,previous?:AssessmentInput):OperationalSignal[]{if(previous)return compareAssessments(previous,currentRaw).signals;return declaredSignals(assessmentInputSchema.parse(currentRaw));}
