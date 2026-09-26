import { z } from 'zod';
import { COST_CATEGORIES, COST_LABELS } from './constants';
import { bottomUpSchema, capacitySchema, economicsSchema, scenarioSchema, type BottomUpInput, type CapacityInput, type EconomicsInput, type ScenarioInput } from './schema';
export type { BottomUpInput, ScenarioInput } from './schema';
export { bottomUpSchema, scenarioSchema } from './schema';
export interface EconomicsResult {valid:boolean; deliveryCostCents:number|null; costPerAcceptedCents:number|null; deliveryContributionCents:number|null; deliveryMargin:number|null; contributionAfterAcquisitionCents:number|null; rejected:number; gaps:string[]; errors:string[]; warnings:string[];}
/** Integer cents are the unit of account; ratios are unrounded until presentation. */
export function calculateEconomics(raw:EconomicsInput):EconomicsResult {
 const input=economicsSchema.parse(raw);const gaps:string[]=[];const errors:string[]=[];const warnings:string[]=[];const seen=new Set<string>();
 for(const item of input.costs){
  if(seen.has(item.allocationKey))errors.push(`Dupla contagem: rateio ${item.allocationKey} aparece mais de uma vez.`);seen.add(item.allocationKey);
  for(const dimension of ['currency','period','cohort','unit'] as const)if(item[dimension]!==input[dimension])errors.push(`Custo ${item.id}: ${dimension} incompatível.`);
  if(item.amountCents===null)gaps.push(`Custo ${item.id} desconhecido.`);
  if(!item.allocationNote.trim())gaps.push(`Explicar rateio do custo ${item.id}.`);
 }
 for(const category of COST_CATEGORIES)if(!input.costs.some(c=>c.category===category))gaps.push(`Custo ausente: ${COST_LABELS[category]}; ausência não é zero.`);
 if(input.recognizedRevenueCents===null)gaps.push('Receita reconhecida ausente.');if(input.receivedRevenueCents===null)gaps.push('Receita recebida ausente.');
 if(input.onboardingAllocatedCents===null)gaps.push('Onboarding alocado ausente.');if(input.acquisitionAllocatedCents===null)gaps.push('Aquisição alocada ausente.');
 if(!input.allocationExplanation.trim())gaps.push('Explicar separação entre entrega, onboarding e aquisição.');
 if(input.humanHours===null||input.hourlyRateCents===null)gaps.push('Horas humanas e custo-hora ausentes.');
 else if(input.costs.filter(c=>c.category==='human').every(c=>c.amountCents!==null)){const humanTotal=input.costs.filter(c=>c.category==='human').reduce((sum,c)=>sum+(c.amountCents??0),0);if(humanTotal!==calculateHumanCostCents(input.humanHours,input.hourlyRateCents))errors.push('Custo humano diverge de horas × custo-hora; corrigir o rateio sem dupla contagem.');}
 const completeCosts=COST_CATEGORIES.every(category=>input.costs.some(c=>c.category===category))&&input.costs.every(c=>c.amountCents!==null&&c.allocationNote.trim());
 const sum=input.costs.reduce((total,c)=>total+(c.amountCents??0),0);
 if(!Number.isSafeInteger(sum))errors.push('Soma de custos excede precisão monetária segura.');
 const deliveryCostCents=errors.length===0&&completeCosts?sum:null;
 const deliveryContributionCents=deliveryCostCents!==null&&input.recognizedRevenueCents!==null?input.recognizedRevenueCents-deliveryCostCents:null;
 const deliveryMargin=deliveryContributionCents!==null&&input.recognizedRevenueCents!==null&&input.recognizedRevenueCents>0?deliveryContributionCents/input.recognizedRevenueCents:null;
 const costPerAcceptedCents=deliveryCostCents!==null&&input.accepted>0?Math.round(deliveryCostCents/input.accepted):null;
 const contributionAfterAcquisitionCents=deliveryCostCents!==null&&input.receivedRevenueCents!==null&&input.onboardingAllocatedCents!==null&&input.acquisitionAllocatedCents!==null&&input.allocationExplanation.trim()?input.receivedRevenueCents-deliveryCostCents-input.onboardingAllocatedCents-input.acquisitionAllocatedCents:null;
 if(input.accepted===0)gaps.push('Custo por aceito N/D: nenhum resultado aceito.');if(input.recognizedRevenueCents===0)gaps.push('Margem N/D: receita reconhecida zero.');
 if(deliveryMargin!==null&&deliveryMargin<0)warnings.push('Margem negativa nesta coorte não comprova margem estrutural negativa; revisar preço, custos, cenários e fundamento humano.');
 if(input.completed>input.accepted)warnings.push('Custos de tentativas rejeitadas e retrabalho devem estar incluídos na entrega; não descontá-los do numerador.');
 return {valid:errors.length===0,deliveryCostCents,costPerAcceptedCents,deliveryContributionCents,deliveryMargin,contributionAfterAcquisitionCents,rejected:input.completed-input.accepted,gaps,errors,warnings};
}
export function calculateHumanCostCents(hours:number,hourlyRateCents:number):number {
 z.number().finite().nonnegative().max(1_000_000).parse(hours);z.number().int().nonnegative().max(100_000_000).parse(hourlyRateCents);
 // Convert hours to decimal string-derived microhours before multiplication.
 const microhours=BigInt(Math.round(hours*1_000_000));const amount=(microhours*BigInt(hourlyRateCents)+500_000n)/1_000_000n;
 if(amount>BigInt(Number.MAX_SAFE_INTEGER))throw new Error('Custo humano excede precisão segura.');return Number(amount);
}
export interface CapacityResult {reviewMinutes:number;reviewHours:number;requiredHours:number;availableHours:number;utilization:number|null;sufficient:boolean;maxCases:number|null;exclusions:string;}
export function calculateCapacity(raw:CapacityInput):CapacityResult {
 const x=capacitySchema.parse(raw);const reviewMinutes=x.cases*x.exceptionRate*x.reviewMinutesPerException;const requiredHours=reviewMinutes/60+x.otherOperationalHours;
 const reviewHoursPerCase=x.exceptionRate*x.reviewMinutesPerException/60;const maxCases=reviewHoursPerCase>0?Math.max(0,Math.floor((x.availableProductiveHours-x.otherOperationalHours)/reviewHoursPerCase)):null;
 return {reviewMinutes,reviewHours:reviewMinutes/60,requiredHours,availableHours:x.availableProductiveHours,utilization:x.availableProductiveHours>0?requiredHours/x.availableProductiveHours:null,sufficient:requiredHours<=x.availableProductiveHours,maxCases,exclusions:x.exclusions||'Somente revisão de exceções e demais horas declaradas; tarefas não informadas ficam fora do cálculo.'};
}
export function stressScenario(raw:ScenarioInput,clients:readonly number[]=[10,100,1000]) {
 const x=scenarioSchema.parse(raw);return clients.map(n=>{z.number().int().positive().max(1_000_000).parse(n);const cases=n*x.casesPerClient;const accepted=Math.floor(cases*x.acceptanceRate);const humanHoursPerClient=x.casesPerClient*x.exceptionRate*x.reviewMinutes*x.complexityMultiplier/60+x.otherHoursPerClient;
 const requiredHours=n*humanHoursPerClient;const revenueCents=accepted*x.pricePerAcceptedCents;const deliveryCents=calculateHumanCostCents(requiredHours,x.hourlyRateCents)+Math.round(cases*x.aiPerCaseCents*x.complexityMultiplier)+n*(x.supportCentsPerClient+x.otherDeliveryCentsPerClient);const onboardingCents=n*x.implementationCentsPerClient;
 for(const value of [revenueCents,deliveryCents,onboardingCents])if(!Number.isSafeInteger(value))throw new Error('Cenário excede precisão monetária segura.');
 return {clients:n,cases,accepted,requiredHours,availableHours:x.availableHours,capacitySufficient:requiredHours<=x.availableHours,maxClientsByHumanCapacity:humanHoursPerClient>0?Math.floor(x.availableHours/humanHoursPerClient):null,revenueCents,deliveryCents,onboardingCents,contributionAfterOnboardingCents:revenueCents-deliveryCents-onboardingCents,deliveryMargin:revenueCents>0?(revenueCents-deliveryCents)/revenueCents:null,assumptions:'Hipóteses editáveis; ICP/mix constante; nenhum ganho de automação presumido com volume.'};});
}
export function calculateBottomUp(raw:BottomUpInput){const x=bottomUpSchema.parse(raw);const accessibleVolume=x.eligibleAccounts*x.frequency*x.capturableShare;const demandAccepted=Math.floor(accessibleVolume*x.acceptanceRate);const accepted=x.capacityAccepted===null?null:Math.min(demandAccepted,x.capacityAccepted);const revenueCents=accepted===null?null:accepted*x.realizablePriceCents;if(revenueCents!==null&&!Number.isSafeInteger(revenueCents))throw new Error('Estimativa excede precisão monetária segura.');return {accessibleVolume,demandAccepted,accepted,revenueCents,capacityLimited:accepted!==null&&accepted<demandAccepted,limitation:x.capacityAccepted===null?'Capacidade desconhecida: volume atendível e receita são N/D.':'Hipótese de mercado, não demanda comprovada. Contas elegíveis já descontam a união das restrições; não subtrair restrições sobrepostas novamente.'};}
