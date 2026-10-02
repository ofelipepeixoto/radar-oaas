import { describe, expect, it } from 'vitest';
import { applyGuidedAnswers, getGuidedSummary, guidedOptions, type GuidedAnswers } from '../../src/domain/framework/guided';
import { assessmentInputSchema, createEmptyAssessment, guidedIntakeSchema } from '../../src/domain/framework/schema';
import { createDemoAssessment } from '../../src/lib/demo/data';
import { evaluateAssessment } from '../../src/domain/framework/engine';
import { createSnapshot } from '../../src/domain/framework/snapshots';

const answers: GuidedAnswers = {
 audience:'small_business',work:'admin',benefit:'time',traction:'conversations',
 currentMethod:'team',verification:'compare',sensitive:'no',
};

describe('guided intake declarations', () => {
 it('parses a legacy draft without adding guided metadata or changing it', () => {
  const original = createDemoAssessment();
  const parsed = assessmentInputSchema.parse(JSON.parse(JSON.stringify(original)));
  expect(parsed).toEqual(original);
  expect(Object.hasOwn(parsed,'guidedIntake')).toBe(false);
 });

 it('accepts only bounded versioned answers and canvas keys', () => {
  expect(guidedIntakeSchema.safeParse({version:1,step:4,answers,appliedCanvas:{icp:'Público pretendido'}}).success).toBe(true);
  for (const invalid of [
   {version:2,step:0,answers},
   {version:1,step:5,answers},
   {version:1,step:0.5,answers},
   {version:1,step:0,answers:{...answers,score:5}},
   {version:1,step:0,answers:{audienceOther:'x'.repeat(181)}},
   {version:1,step:0,answers,appliedCanvas:{owner_id:'somebody'}},
   {version:1,step:0,answers,approved:true},
  ]) expect(guidedIntakeSchema.safeParse(invalid).success).toBe(false);
 });

 it('maps explicit answers only into the five canvas fields and preserves domain decisions', () => {
  const original = createEmptyAssessment('synthetic-guide','contract');
  const originalCopy = structuredClone(original);
  const next = applyGuidedAnswers(original,answers,2);
  expect(original).toEqual(originalCopy);
  expect(next.canvas.icp).toContain('pequenas empresas');
  expect(next.canvas.narrow_work).toContain('organizar tarefas administrativas');
  expect(next.canvas.outcome).toContain('Ainda precisa ser medido');
  expect(next.canvas.current_alternative).toContain('Alternativa a investigar');
  expect(next.canvas.acceptance).toContain('regra exata ainda precisa ser combinada');
  const {canvas: originalCanvas,...originalDomain} = original;
  const {canvas: nextCanvas,guidedIntake,...nextDomain} = next;
  expect(nextDomain).toEqual(originalDomain);
  expect(Object.keys(nextCanvas).filter(key=>nextCanvas[key as keyof typeof nextCanvas] !== originalCanvas[key as keyof typeof originalCanvas])).toEqual(['icp','current_alternative','narrow_work','outcome','acceptance']);
  expect(guidedIntake?.step).toBe(2);
  expect(evaluateAssessment(next)).toEqual(evaluateAssessment(original));
  expect(assessmentInputSchema.safeParse(next).success).toBe(true);
 });

 it('keeps all unknown answers absent without manufacturing a score or evidence', () => {
  const unknown: GuidedAnswers = {audience:'unknown',work:'unknown',benefit:'unknown',traction:'unknown',currentMethod:'unknown',verification:'unknown',sensitive:'unknown'};
  const next = applyGuidedAnswers(createEmptyAssessment('synthetic-unknown'),unknown,4);
  expect(Object.values(next.canvas).every(value=>value === '')).toBe(true);
  expect(next.evidence).toEqual([]);
  expect(next.experiments).toEqual([]);
  expect(next.economics).toBeNull();
  expect(next.capacity).toBeNull();
  expect(next.market).toBeNull();
  expect(next.pilotTargets).toBeNull();
  expect(evaluateAssessment(next).scorecard).toMatchObject({coverage:0,partialIndex:null,completeIndex:null});
  expect(Object.values(next.gates).every(gate=>gate.status === 'pending')).toBe(true);
  expect(Object.values(next.checks).every(check=>check.status === 'pending')).toBe(true);
 });

 it('preserves every legacy canvas value, economics and evidence after guide edits', () => {
  const legacy = createDemoAssessment();
  const next = applyGuidedAnswers(legacy,answers,1);
  expect(next.canvas).toEqual(legacy.canvas);
  expect(next.evidence).toEqual(legacy.evidence);
  expect(next.economics).toEqual(legacy.economics);
  expect(next.criteria).toEqual(legacy.criteria);
  expect(next.guidedIntake?.appliedCanvas).toEqual({});
  expect(getGuidedSummary(next).uncertainty).toContain('textos anteriores foram preservados');
 });

 it('changes and clears only values still owned by the guide after saving and resuming', () => {
  const first = applyGuidedAnswers(createEmptyAssessment('synthetic-resume'),answers,1);
  const resumed = assessmentInputSchema.parse(JSON.parse(JSON.stringify(first)));
  const changed = applyGuidedAnswers(resumed,{audience:'solo',benefit:'cost'},2);
  expect(changed.canvas.icp).toContain('profissionais autônomos');
  expect(changed.canvas.outcome).toContain('reduzir gastos');
  expect(changed.guidedIntake?.answers.work).toBe('admin');
  expect(changed.canvas.narrow_work).toBe(first.canvas.narrow_work);
  const cleared = applyGuidedAnswers(changed,{audience:'unknown'},3);
  expect(cleared.canvas.icp).toBe('');
  expect(cleared.guidedIntake?.appliedCanvas?.icp).toBeUndefined();
  expect(cleared.canvas.outcome).toBe(changed.canvas.outcome);
 });

 it('preserves manual edits when choices change or become unknown', () => {
  const edited = applyGuidedAnswers(createEmptyAssessment('synthetic-manual'),answers,1);
  edited.canvas.icp = 'Meu público escrito depois de usar o guia';
  edited.canvas.outcome = 'Resultado detalhado manualmente';
  const next = applyGuidedAnswers(edited,{audience:'people',benefit:'unknown'},2);
  expect(next.canvas.icp).toBe(edited.canvas.icp);
  expect(next.canvas.outcome).toBe(edited.canvas.outcome);
  expect(next.guidedIntake?.appliedCanvas?.icp).toBeUndefined();
  expect(next.guidedIntake?.appliedCanvas?.outcome).toBeUndefined();
  const resumed = applyGuidedAnswers(assessmentInputSchema.parse(JSON.parse(JSON.stringify(next))),{audience:'unknown'},4);
  expect(resumed.canvas.icp).toBe(edited.canvas.icp);
 });

 it('requires explicit other selection before using custom text and preserves other answers', () => {
  const draft = createEmptyAssessment('synthetic-other');
  const hidden = applyGuidedAnswers(draft,{audienceOther:' Cooperativas ',workOther:' Organizar arquivos '},0);
  expect(hidden.canvas).toEqual(draft.canvas);
  const selected = applyGuidedAnswers(hidden,{audience:'other',work:'other'},1);
  expect(selected.canvas.icp).toBe('Público pretendido: Cooperativas.');
  expect(selected.canvas.narrow_work).toBe('Trabalho proposto: Organizar arquivos.');
  const changedParent = applyGuidedAnswers(selected,{audience:'people'},2);
  expect(changedParent.guidedIntake?.answers.audienceOther).toBe(' Cooperativas ');
  expect(changedParent.canvas.narrow_work).toBe(selected.canvas.narrow_work);
 });

 it('cannot use applied metadata to change non-guided canvas fields', () => {
  const draft = createEmptyAssessment('synthetic-metadata');
  draft.canvas.proven_spend = 'Informação documentada anteriormente';
  draft.guidedIntake = {version:1,step:0,answers:{},appliedCanvas:{proven_spend:draft.canvas.proven_spend}};
  const next = applyGuidedAnswers(draft,answers,1);
  expect(next.canvas.proven_spend).toBe(draft.canvas.proven_spend);
  expect(next.guidedIntake?.appliedCanvas?.proven_spend).toBeUndefined();
 });

 it('preserves prior snapshots when a later draft changes answers', () => {
  const first = applyGuidedAnswers(createEmptyAssessment('synthetic-history'),answers,4);
  const snapshot = createSnapshot(first,{id:'before-guide-edit',author:'Synthetic owner',createdAt:'2026-09-26T12:00:00Z'});
  const serialized = JSON.stringify(snapshot);
  const next = applyGuidedAnswers(first,{audience:'people',traction:'paid'},4);
  expect(JSON.stringify(snapshot)).toBe(serialized);
  expect(snapshot.input.canvas.icp).toBe(first.canvas.icp);
  expect(next.canvas.icp).not.toBe(snapshot.input.canvas.icp);
  expect(next.stage).toBe('idea');
  expect(next.evidence).toEqual([]);
 });

 it('prioritizes sensitive or uncertain data before commercial progress', () => {
  for (const sensitive of ['yes','unknown'] as const) {
   const next = applyGuidedAnswers(createEmptyAssessment('synthetic-sensitive'),{...answers,traction:'paid',sensitive},4);
   const summary = getGuidedSummary(next);
   expect(summary.action).toMatch(/dados reais|informações/);
   expect(summary.questions).toContain('Quem pode autorizar o uso dessas informações?');
   expect(summary.uncertainty).toMatch(/autorizar o uso dos dados|dados exigem cuidado especial/);
  }
 });

 it('prioritizes undefined audience or work before traction and returns plain-language next questions', () => {
  const missing = applyGuidedAnswers(createEmptyAssessment('synthetic-missing'),{...answers,audience:'unknown',traction:'paid'},4);
  expect(getGuidedSummary(missing).action).toContain('Escolha um tipo de pessoa ou empresa');
  expect(getGuidedSummary(missing).gaps).toContain('Escolher um público para a primeira conversa.');
  const declaredPaid = applyGuidedAnswers(createEmptyAssessment('synthetic-paid'),{...answers,traction:'paid'},4);
  expect(getGuidedSummary(declaredPaid).action).toContain('Revise uma entrega já paga');
  expect(getGuidedSummary(declaredPaid).summary).toContain('com a intenção de ganhar tempo');
  expect(evaluateAssessment(declaredPaid).decision.recommendation).toBe('investigate');
 });

 it('offers an explicit unknown option for every guided question', () => {
  expect(Object.values(guidedOptions).every(options=>options.some(option=>option.value === 'unknown'))).toBe(true);
 });

 it('personalizes the main uncertainty to the declared experience without treating it as proof', () => {
  const cases = [
   ['none','problema aparece na vida'],
   ['unknown','problema aparece na vida'],
   ['conversations','qual pequena entrega'],
   ['test','benefício do teste se repete'],
   ['paid','novo pagamento e um custo'],
  ] as const;
  for (const [traction, expected] of cases) {
   const draft = applyGuidedAnswers(createEmptyAssessment('synthetic-uncertainty'),{...answers,traction},4);
   expect(getGuidedSummary(draft).uncertainty).toContain(expected);
   expect(draft.evidence).toEqual([]);
   expect(evaluateAssessment(draft).scorecard.coverage).toBe(0);
  }
  const noAudience = applyGuidedAnswers(createEmptyAssessment('synthetic-no-audience'),{...answers,audience:'unknown'},4);
  expect(getGuidedSummary(noAudience).uncertainty).toContain('escolher um público específico');
  const noWork = applyGuidedAnswers(createEmptyAssessment('synthetic-no-work'),{...answers,work:'unknown'},4);
  expect(getGuidedSummary(noWork).uncertainty).toContain('escolher uma única tarefa');
 });
});


describe('public planning precedence, proposta_mvp 0.2.0',()=>{
 const base:GuidedAnswers={audience:'small_business',work:'documents',currentMethod:'team',traction:'paid',verification:'inspect',control:'own',sensitive:'no'};
 it.each([
  [{sensitive:'unknown',audience:'unknown'},'Primeiro, descubra'],
  [{sensitive:'yes',control:'third_party'},'Antes de testar'],
  [{audience:'unknown',control:'third_party'},'Escolha um tipo'],
  [{control:'third_party',verification:'unknown'},'Separe o trabalho'],
  [{control:'unknown'},'Separe o trabalho'],
  [{verification:'unknown'},'Mostre um exemplo fictício'],
  [{currentMethod:'unknown'},'Investigue um caso recente'],
  [{traction:'none'},'Converse com uma pessoa'],
  [{traction:'conversations'},'Volte a uma dessas pessoas'],
  [{traction:'test'},'Converse com quem participou'],
  [{traction:'paid'},'Revise uma entrega já paga'],
 ] as [Partial<GuidedAnswers>,string][] )('chooses the earliest unresolved condition %j',(patch,prefix)=>{
  const original=createEmptyAssessment('synthetic-public-test');
  const draft=applyGuidedAnswers(original,{...base,...patch},4);
  const summary=getGuidedSummary(draft);
  expect(summary.action.startsWith(prefix)).toBe(true);
  expect(summary.steps).toHaveLength(3);
  expect(summary.record.length).toBeGreaterThan(10);
  expect(summary.decision.length).toBeGreaterThan(10);
  expect(evaluateAssessment(draft)).toEqual(evaluateAssessment(original));
 });
});
