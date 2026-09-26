import { z } from 'zod';
import { BLOCKS, CANVAS_KEYS, CHECKS, COST_CATEGORIES, CRITERIA, GATES, PLAN_90_DAYS, STAGES } from './constants';
const short = z.string().max(500);
const text = z.string().max(5000);
const identifier = z.string().min(1).max(100);
const cents = z.number().int().nonnegative().max(1_000_000_000_000);
const count = z.number().int().nonnegative().max(1_000_000_000);
const nonnegative = z.number().finite().nonnegative().max(1_000_000_000);
const fraction = z.number().finite().min(0).max(1);
const date = z.string().date();
export const stageSchema = z.enum(STAGES);
export const reviewSchema = z.object({status:z.enum(['pending','self_declared']),author:short,reviewedAt:z.string().max(40)}).strict();
export const evidenceSchema = z.object({id:identifier,type:z.enum(['founder_statement','hypothesis','document','observed_result']),source:short,date,period:short,cohort:short,description:text,claim:text,url:z.union([z.literal(''),z.string().url().max(2000).refine(v=>/^https?:\/\//i.test(v),'Use apenas referências HTTP/HTTPS.')]),outcome:z.enum(['supports','contradicts','inconclusive']),review:reviewSchema.nullable()}).strict();
export const ratingSchema = z.object({score:z.number().int().min(0).max(5).nullable(),justification:text,evidenceIds:z.array(identifier).max(100),period:short,nextTest:text,confidence:z.enum(['not_assessed','low','medium','high']),confidenceReason:text,review:reviewSchema.nullable()}).strict();
export const gateSchema = z.object({status:z.enum(['pending','not_identified','mitigated','confirmed']),justification:text,evidenceIds:z.array(identifier).max(100),responsible:short,reviewedAt:z.string().max(40),reassessmentCondition:text,humanReviewed:z.boolean(),structuralAnalysisReviewed:z.boolean().default(false)}).strict();
export const checkSchema = z.object({status:z.enum(['pending','pass','fail','not_applicable']),justification:text,evidenceIds:z.array(identifier).max(100),review:reviewSchema.nullable(),pivotSupported:z.boolean()}).strict();
export const pilotTargetsSchema = z.object({declaredAt:date,pilotStartedAt:date.nullable(),errorRateMax:fraction,marginMin:z.number().finite().min(-10).max(1),deadlineDaysMax:z.number().finite().positive().max(3650),capacityHoursMax:nonnegative,justification:text}).strict();
export const costItemSchema = z.object({id:identifier,category:z.enum(COST_CATEGORIES),amountCents:cents.nullable(),allocationKey:identifier,allocationNote:text,currency:z.string().regex(/^[A-Z]{3}$/),period:short,cohort:short,unit:short}).strict();
export const economicsSchema = z.object({humanHours:nonnegative.nullable(),hourlyRateCents:cents.nullable(),currency:z.string().regex(/^[A-Z]{3}$/),period:short.min(1),cohort:short.min(1),unit:short.min(1),completed:count,accepted:count,recognizedRevenueCents:cents.nullable(),receivedRevenueCents:cents.nullable(),costs:z.array(costItemSchema).max(500),onboardingAllocatedCents:cents.nullable(),acquisitionAllocatedCents:cents.nullable(),allocationExplanation:text}).strict().superRefine((v,ctx)=>{if(v.accepted>v.completed)ctx.addIssue({code:'custom',path:['accepted'],message:'Aceitos não podem exceder concluídos.'});const ids=new Set<string>(); for (const item of v.costs) {if(ids.has(item.id))ctx.addIssue({code:'custom',path:['costs'],message:'Identificador de custo duplicado.'});ids.add(item.id);}});
export const capacitySchema = z.object({period:short.min(1),cases:count,exceptionRate:fraction,reviewMinutesPerException:nonnegative,otherOperationalHours:nonnegative,availableProductiveHours:nonnegative,exclusions:text}).strict();
export const riskSchema = z.object({id:identifier,category:z.enum(['factual_error','unauthorized_action','confidentiality','tool_failure','model_change','bias_exclusion','third_party']),description:text,severity:z.enum(['low','moderate','high','critical']),controls:text,escalation:text,competentApproval:text}).strict();
export const experimentSchema = z.object({id:identifier,hypothesis:text,procedure:text,expectedEvidence:text,responsible:short,dependencies:z.array(short).max(30),period:short,estimatedCostCents:cents.nullable(),metric:text,successCriterion:text,stopRule:text,status:z.enum(['planned','running','completed','stopped']),safeResearchOnly:z.boolean()}).strict();
export const operationStepSchema = z.object({step:z.enum(['input','planning','execution','verification','exception','acceptance','learning']),responsible:short,tool:short,rule:text,control:text,evidenceIds:z.array(identifier).max(100)}).strict();
export const resultDefinitionSchema = z.object({unit:text,clockStart:text,acceptance:text,quality:text,exclusions:text,exceptions:text,data:text,remedy:text,independentAgreement:z.enum(['unknown','yes','no']),agreementEvidenceIds:z.array(identifier).max(100),thirdPartyDependencies:text,resultLayer:z.enum(['production','process','business'])}).strict();
export const pricingSchema = z.object({model:z.enum(['subscription','accepted_delivery','financial_impact','hybrid','agent_seat']),rationale:text,baseline:text,attribution:text,window:text,contestation:text}).strict();
export const scenarioSchema=z.object({name:z.enum(['conservative','central','optimistic']),period:z.string().min(1),currency:z.string().regex(/^[A-Z]{3}$/),icpMix:z.string().min(1),casesPerClient:z.number().int().positive().max(1_000_000),acceptanceRate:z.number().min(0).max(1),pricePerAcceptedCents:z.number().int().nonnegative().max(1_000_000_000),complexityMultiplier:z.number().positive().max(100),exceptionRate:z.number().min(0).max(1),reviewMinutes:z.number().nonnegative().max(1_000_000),otherHoursPerClient:z.number().nonnegative().max(1_000_000),hourlyRateCents:z.number().int().nonnegative().max(1_000_000_000),aiPerCaseCents:z.number().int().nonnegative().max(1_000_000_000),implementationCentsPerClient:z.number().int().nonnegative().max(1_000_000_000),supportCentsPerClient:z.number().int().nonnegative().max(1_000_000_000),otherDeliveryCentsPerClient:z.number().int().nonnegative().max(1_000_000_000),availableHours:z.number().nonnegative().max(1_000_000_000),assumptionNotes:z.string().min(1).max(5000)}).strict();
export type ScenarioInput=z.infer<typeof scenarioSchema>;
export const bottomUpSchema=z.object({eligibleAccounts:z.number().int().nonnegative().max(1_000_000_000),frequency:z.number().nonnegative().max(1_000_000),capturableShare:z.number().min(0).max(1),acceptanceRate:z.number().min(0).max(1),realizablePriceCents:z.number().int().nonnegative().max(1_000_000_000),capacityAccepted:z.number().int().nonnegative().nullable(),period:z.string().min(1),currency:z.string().regex(/^[A-Z]{3}$/),eligibilityMethod:z.string().min(1),source:z.string().min(1)}).strict();
export type BottomUpInput=z.infer<typeof bottomUpSchema>;
export const operationalSignalsSchema = z.object({
 novelCustomizationPerClient:z.boolean().nullable(),founderDependent:z.boolean().nullable(),onboardingHoursPerClient:nonnegative.nullable(),clientWorkHoursPerAccepted:nonnegative.nullable(),qualityMetric:short,qualityValue:z.number().finite().nullable(),qualityDirection:z.enum(['higher_better','lower_better']),qualityRubric:text,icpMix:short,measurementWindow:short,mixComparable:z.boolean().nullable(),comparabilityJustification:text,evidenceIds:z.array(identifier).max(100),review:reviewSchema.nullable(),
}).strict();
export type OperationalSignals = z.infer<typeof operationalSignalsSchema>;
export function emptyOperationalSignals():OperationalSignals{return {novelCustomizationPerClient:null,founderDependent:null,onboardingHoursPerClient:null,clientWorkHoursPerAccepted:null,qualityMetric:'',qualityValue:null,qualityDirection:'higher_better',qualityRubric:'',icpMix:'',measurementWindow:'',mixComparable:null,comparabilityJustification:'',evidenceIds:[],review:null};}
export const planPhaseSchema=z.object({id:identifier,period:short,stage:stageSchema,objective:text,responsible:short,successCriterion:text,stopRule:text}).strict();
export type PlanPhase=z.infer<typeof planPhaseSchema>;
export function defaultPlan90Days():PlanPhase[]{return PLAN_90_DAYS.map((p,index)=>({id:`phase-${index+1}`,period:p.period,stage:p.stage,objective:p.objective,responsible:'',successCriterion:'Definir antes da execução; não representa meta atingida.',stopRule:'Interromper diante de direitos ou controles pendentes, falha grave ou capacidade humana excedida.'}));}
export const assessmentInputSchema = z.object({
 projectId:identifier,stage:stageSchema,operationalSignals:operationalSignalsSchema.default(emptyOperationalSignals),plan90Days:z.array(planPhaseSchema).min(1).max(20).default(defaultPlan90Days),scenarios:z.array(scenarioSchema).max(3),market:bottomUpSchema.nullable(),canvas:z.record(z.enum(CANVAS_KEYS),text),
 evidence:z.array(evidenceSchema).max(1000),criteria:z.record(z.enum(CRITERIA),ratingSchema),blocks:z.record(z.enum(BLOCKS),ratingSchema),
 gates:z.record(z.enum(GATES),gateSchema),checks:z.record(z.enum(CHECKS),checkSchema),pilotTargets:pilotTargetsSchema.nullable(),economics:economicsSchema.nullable(),capacity:capacitySchema.nullable(),risks:z.array(riskSchema).max(100),experiments:z.array(experimentSchema).max(100),
 modelClassification:z.object({categories:z.array(z.enum(['saas','ai_saas','managed_automation','ai_service','oaas'])).max(5),execution:text,acceptance:text,responsibility:text,rationale:text}).strict(),
 resultDefinition:resultDefinitionSchema,operation:z.array(operationStepSchema).max(7),autonomy:z.object({level:z.enum(['assisted','supervised','delegated']),rationale:text,impact:text,reversibility:text,measuredQuality:text,professionalObligation:text}).strict(),pricing:pricingSchema,
}).strict().superRefine((input,ctx)=>{const ids=new Set<string>();input.evidence.forEach((e,i)=>{if(ids.has(e.id))ctx.addIssue({code:'custom',path:['evidence',i,'id'],message:'Identificador de evidência duplicado.'});ids.add(e.id);});});
export type Stage = z.infer<typeof stageSchema>;
export type Evidence = z.infer<typeof evidenceSchema>;
export type Rating = z.infer<typeof ratingSchema>;
export type GateAssessment = z.infer<typeof gateSchema>;
export type CheckAssessment = z.infer<typeof checkSchema>;
export type PilotTargets = z.infer<typeof pilotTargetsSchema>;
export type EconomicsInput = z.infer<typeof economicsSchema>;
export type CapacityInput = z.infer<typeof capacitySchema>;
export type Experiment = z.infer<typeof experimentSchema>;
export type AssessmentInput = z.infer<typeof assessmentInputSchema>;
export type CriterionId = (typeof CRITERIA)[number];
export type BlockId = (typeof BLOCKS)[number];
export type GateId = (typeof GATES)[number];
export type CheckId = (typeof CHECKS)[number];
export type CanvasKey = (typeof CANVAS_KEYS)[number];
export type CostCategory = (typeof COST_CATEGORIES)[number];

export function emptyRating():Rating{return {score:null,justification:'',evidenceIds:[],period:'',nextTest:'',confidence:'not_assessed',confidenceReason:'',review:null};}
export function createEmptyAssessment(projectId:string,stage:Stage='idea'):AssessmentInput {
 return {projectId,stage,operationalSignals:emptyOperationalSignals(),plan90Days:defaultPlan90Days(),scenarios:[],market:null,canvas:Object.fromEntries(CANVAS_KEYS.map(key=>[key,''])) as AssessmentInput['canvas'],evidence:[],criteria:Object.fromEntries(CRITERIA.map(key=>[key,emptyRating()])) as AssessmentInput['criteria'],blocks:Object.fromEntries(BLOCKS.map(key=>[key,emptyRating()])) as AssessmentInput['blocks'],
 gates:Object.fromEntries(GATES.map(key=>[key,{status:'pending',justification:'',evidenceIds:[],responsible:'',reviewedAt:'',reassessmentCondition:'',humanReviewed:false,structuralAnalysisReviewed:false}])) as unknown as AssessmentInput['gates'],checks:Object.fromEntries(CHECKS.map(key=>[key,{status:'pending',justification:'',evidenceIds:[],review:null,pivotSupported:false}])) as unknown as AssessmentInput['checks'],pilotTargets:null,economics:null,capacity:null,risks:[],experiments:[],modelClassification:{categories:[],execution:'',acceptance:'',responsibility:'',rationale:''},resultDefinition:{unit:'',clockStart:'',acceptance:'',quality:'',exclusions:'',exceptions:'',data:'',remedy:'',independentAgreement:'unknown',agreementEvidenceIds:[],thirdPartyDependencies:'',resultLayer:'process'},operation:[],autonomy:{level:'assisted',rationale:'',impact:'',reversibility:'',measuredQuality:'',professionalObligation:''},pricing:{model:'subscription',rationale:'',baseline:'',attribution:'',window:'',contestation:''}};
}
