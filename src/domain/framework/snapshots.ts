import { z } from 'zod';
import { BLOCK_WEIGHTS, FRAMEWORK_VERSION, RULES_VERSION } from './constants';
import { evaluateAssessment, type AssessmentResult } from './engine';
import { assessmentInputSchema, type AssessmentInput, type Stage } from './schema';
export interface AssessmentSnapshot {id:string;projectId:string;author:string;createdAt:string;frameworkVersion:string;rulesVersion:string;weights:typeof BLOCK_WEIGHTS;input:AssessmentInput;result:AssessmentResult;}
function deepFreeze<T>(value:T):T {if(value&&typeof value==='object'&&!Object.isFrozen(value)){Object.freeze(value);Object.values(value).forEach(deepFreeze);}return value;}
export function createSnapshot(raw:AssessmentInput,metadata:{id:string;author:string;createdAt:string}):Readonly<AssessmentSnapshot>{z.object({id:z.string().min(1).max(100),author:z.string().min(1).max(500),createdAt:z.string().datetime()}).strict().parse(metadata);const input=assessmentInputSchema.parse(structuredClone(raw));return deepFreeze({id:metadata.id,projectId:input.projectId,author:metadata.author,createdAt:metadata.createdAt,frameworkVersion:FRAMEWORK_VERSION,rulesVersion:RULES_VERSION,weights:{...BLOCK_WEIGHTS},input,result:evaluateAssessment(input)});}
export function confirmTransition(snapshot:AssessmentSnapshot,confirmation:{author:string;confirmedAt:string;confirmed:boolean}):{input:AssessmentInput;auditEvent:{type:'stage_transition';snapshotId:string;from:Stage;to:Stage;author:string;createdAt:string}} {
 if(!confirmation.confirmed||!confirmation.author.trim()||!confirmation.confirmedAt.trim())throw new Error('Transição exige confirmação explícita do proprietário.');
 if(snapshot.result.decision.blocked||!['advance','investigate','scale_gradually'].includes(snapshot.result.decision.recommendation))throw new Error('Avaliação não permite transição.');
 const input=structuredClone(snapshot.input);input.stage=snapshot.result.decision.allowedStage;return {input,auditEvent:{type:'stage_transition',snapshotId:snapshot.id,from:snapshot.input.stage,to:input.stage,author:confirmation.author,createdAt:confirmation.confirmedAt}};
}
