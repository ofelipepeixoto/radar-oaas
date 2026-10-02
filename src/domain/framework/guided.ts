import { guidedAnswersSchema, guidedIntakeSchema, type AssessmentInput, type CanvasKey } from './schema';

export type GuidedAnswers = NonNullable<AssessmentInput['guidedIntake']>['answers'];
type Question = Exclude<keyof GuidedAnswers, 'audienceOther' | 'workOther'>;
type Choice<K extends Question> = { value: NonNullable<GuidedAnswers[K]>; label: string; description?: string };

/** Choices describe the user's proposal. None attest to demand, safety or results. */
export const guidedOptions = {
 audience: [
  {value:'people',label:'Pessoas',description:'Quem compra usa a solução na própria vida.'},
  {value:'solo',label:'Profissionais autônomos',description:'Pessoas que trabalham por conta própria.'},
  {value:'small_business',label:'Pequenas empresas',description:'Negócios com uma equipe pequena.'},
  {value:'large_business',label:'Empresas maiores',description:'Equipes ou departamentos de uma organização.'},
  {value:'other',label:'Outro público'},
  {value:'unknown',label:'Ainda não sei'},
 ],
 work: [
  {value:'support',label:'Atender clientes',description:'Responder dúvidas e acompanhar solicitações.'},
  {value:'documents',label:'Preparar documentos',description:'Organizar informações e preparar materiais.'},
  {value:'sales',label:'Apoiar vendas',description:'Organizar contatos e acompanhar oportunidades.'},
  {value:'admin',label:'Organizar tarefas administrativas',description:'Cuidar de rotinas e informações do dia a dia.'},
  {value:'other',label:'Outro trabalho'},
  {value:'unknown',label:'Ainda não sei'},
 ],
 benefit: [
  {value:'time',label:'Ganhar tempo'},
  {value:'cost',label:'Reduzir gastos'},
  {value:'errors',label:'Diminuir erros'},
  {value:'sales',label:'Vender mais'},
  {value:'unknown',label:'Ainda não sei'},
 ],
 traction: [
  {value:'none',label:'Ainda não conversei com possíveis clientes'},
  {value:'conversations',label:'Já conversei com possíveis clientes'},
  {value:'test',label:'Já fiz um teste com alguém'},
  {value:'paid',label:'Alguém já pagou por uma entrega'},
  {value:'unknown',label:'Prefiro responder depois'},
 ],
 currentMethod: [
  {value:'team',label:'A própria pessoa ou equipe faz o trabalho'},
  {value:'provider',label:'Contrata alguém de fora'},
  {value:'tool',label:'Usa um programa ou aplicativo'},
  {value:'unknown',label:'Ainda não sei'},
 ],
 verification: [
  {value:'inspect',label:'Uma pessoa confere a entrega'},
  {value:'compare',label:'Compara com o que é feito hoje'},
  {value:'measure',label:'Confere uma medida combinada antes'},
  {value:'unknown',label:'Ainda não sei'},
 ],
 control: [
  {value:'own',label:'Posso entregar e conferir o trabalho combinado'},
  {value:'third_party',label:'Depende de uma aprovação, compra ou decisão de outra pessoa'},
  {value:'unknown',label:'Ainda não sei'},
 ],
 sensitive: [
  {value:'yes',label:'Sim',description:'Por exemplo: dados pessoais, dinheiro, saúde ou decisões jurídicas.'},
  {value:'no',label:'Não, pelo que sei'},
  {value:'unknown',label:'Não tenho certeza'},
 ],
} satisfies { [K in Question]: readonly Choice<K>[] };

const audiences = {
 people:'pessoas',solo:'profissionais autônomos',small_business:'pequenas empresas',large_business:'equipes de empresas maiores',
};
const work = {
 support:'atender clientes',documents:'preparar documentos',sales:'apoiar vendas',admin:'organizar tarefas administrativas',
};
const benefits = {time:'ganhar tempo',cost:'reduzir gastos',errors:'diminuir erros',sales:'vender mais'};
const alternatives = {team:'trabalho feito pela própria pessoa ou equipe',provider:'serviço de um fornecedor externo',tool:'uso de um programa ou aplicativo'};
const verifications = {inspect:'uma pessoa conferir a entrega',compare:'comparar a entrega com o que é feito hoje',measure:'conferir uma medida combinada antes da entrega'};
const managedKeys = ['icp','narrow_work','outcome','current_alternative','acceptance'] as const satisfies readonly CanvasKey[];
type ManagedKey = typeof managedKeys[number];

function audienceText(answers: GuidedAnswers): string {
 const answer = answers.audience;
 return answer === 'other' ? answers.audienceOther?.trim() ?? '' : answer && answer !== 'unknown' ? audiences[answer] : '';
}
function workText(answers: GuidedAnswers): string {
 const answer = answers.work;
 return answer === 'other' ? answers.workOther?.trim() ?? '' : answer && answer !== 'unknown' ? work[answer] : '';
}
function mappedAnswers(answers: GuidedAnswers): Record<ManagedKey, string | undefined> {
 const audience = audienceText(answers);
 const task = workText(answers);
 return {
  icp: answers.audience === undefined ? undefined : audience ? `Público pretendido: ${audience}.` : '',
  narrow_work: answers.work === undefined ? undefined : task ? `Trabalho proposto: ${task}.` : '',
  outcome: answers.benefit === undefined ? undefined : answers.benefit === 'unknown' ? '' : `Benefício pretendido: ${benefits[answers.benefit]}. Ainda precisa ser medido.`,
  current_alternative: answers.currentMethod === undefined ? undefined : answers.currentMethod === 'unknown' ? '' : `Alternativa a investigar: ${alternatives[answers.currentMethod]}.`,
  acceptance: answers.verification === undefined ? undefined : answers.verification === 'unknown' ? '' : `Forma de conferir proposta: ${verifications[answers.verification]}. A regra exata ainda precisa ser combinada.`,
 };
}

/**
 * Apply a partial answer update to the current draft, never to a fresh assessment.
 * A canvas value belongs to the guide only while it still equals the last value
 * written by the guide. A manual or legacy value always takes precedence.
 */
export function applyGuidedAnswers(draft: AssessmentInput, answers: GuidedAnswers, step: number): AssessmentInput {
 const merged = guidedAnswersSchema.parse({...draft.guidedIntake?.answers, ...guidedAnswersSchema.parse(answers)});
 const intake = guidedIntakeSchema.parse({version:1,step,answers:merged});
 const next = structuredClone(draft);
 const applied: Partial<Record<CanvasKey,string>> = {};
 const values = mappedAnswers(intake.answers);
 for (const key of managedKeys) {
  const previous = draft.guidedIntake?.appliedCanvas?.[key];
  const current = draft.canvas[key];
  const proposed = values[key];
  const owned = previous !== undefined && current === previous;
  if (proposed === undefined) {
   if (owned) applied[key] = current;
   continue;
  }
  if (!current.trim() || owned) {
   next.canvas[key] = proposed;
   if (proposed) applied[key] = proposed;
  }
 }
 next.guidedIntake = {...intake,appliedCanvas:applied};
 return next;
}

export const GUIDED_RULES_VERSION = '0.2.0-proposta_mvp';
export type GuidedSummary = {summary:string;uncertainty:string;action:string;questions:string[];gaps:string[];steps:string[];record:string;decision:string};

/** A plain-language planning aid; never a replacement for the assessment engine. */
export function getGuidedSummary(draft: AssessmentInput): GuidedSummary {
 const answers = draft.guidedIntake?.answers ?? {};
 const audience = audienceText(answers);
 const task = workText(answers);
 const benefit = answers.benefit && answers.benefit !== 'unknown' ? benefits[answers.benefit] : '';
 const summary = audience && task
  ? `Sua proposta é ajudar ${audience} a ${task}${benefit ? `, com a intenção de ${benefit}` : ''}.`
  : audience ? `Você pretende ajudar ${audience}. Falta escolher o primeiro trabalho a resolver.`
  : task ? `Você quer ${task}. Falta escolher quem precisa dessa entrega.`
  : 'Comece escolhendo quem você quer ajudar e qual trabalho pretende resolver.';
 const gaps: string[] = [];
 if (!audience) gaps.push('Escolher um público para a primeira conversa.');
 if (!task) gaps.push('Escolher uma única entrega para começar.');
 if (!benefit) gaps.push('Definir qual melhoria o cliente espera.');
 if (!answers.currentMethod || answers.currentMethod === 'unknown') gaps.push('Entender como o trabalho é feito hoje.');
 if (!answers.verification || answers.verification === 'unknown') gaps.push('Combinar como conferir se a entrega está boa.');
 if (!answers.sensitive || answers.sensitive === 'unknown') gaps.push('Verificar se há dados ou decisões que exigem cuidado especial.');
 if (answers.sensitive === 'yes') gaps.push('Definir os cuidados e quem precisa revisar antes de um teste real.');
 let action: string;
 let questions: string[];
 let uncertainty: string;
 if (answers.sensitive !== 'no') {
  uncertainty = answers.sensitive === 'yes'
   ? 'Falta confirmar quem pode autorizar o uso dos dados e quem precisa revisar a entrega antes de um teste real.'
   : 'Ainda não está claro quais dados exigem cuidado especial ou quem precisaria revisar uma entrega.';
  action = answers.sensitive === 'yes'
   ? 'Antes de testar com dados reais, confirme com a pessoa responsável quais dados podem ser usados e quem deve revisar a entrega.'
   : 'Primeiro, descubra quais informações a solução usaria e se uma falha poderia prejudicar alguém. Use um exemplo fictício enquanto isso.';
  questions = ['Quais informações seriam necessárias?', 'Quem pode autorizar o uso dessas informações?', 'Quem confere a entrega antes de alguém depender dela?'];
 } else if (!audience || !task) {
  uncertainty = !audience
   ? 'Ainda falta escolher um público específico para entender se essa proposta resolve um problema dele.'
   : 'Ainda falta escolher uma única tarefa para saber o que você conseguiria entregar e conferir.';
  action = !audience ? 'Escolha um tipo de pessoa ou empresa para conversar primeiro.' : 'Escolha uma única tarefa que você conseguiria demonstrar com um exemplo simples.';
  questions = ['Quem enfrenta esse problema?', 'Qual tarefa essa pessoa precisa resolver?', 'Como ela faz isso hoje?'];
 } else if (answers.control === 'third_party' || answers.control === 'unknown') {
  uncertainty = 'O resultado prometido pode depender de uma decisão que você não controla.';
  action = 'Separe o trabalho que você pode entregar da decisão de outra pessoa.';
  questions = ['Qual parte você consegue concluir e conferir?', 'Quem toma a decisão final?', 'Que entrega útil existe mesmo sem essa decisão?'];
 } else if (!answers.verification || answers.verification === 'unknown') {
  uncertainty = 'Ainda falta combinar o que faz uma entrega ser aceita.';
  action = 'Mostre um exemplo fictício e combine como conferir uma boa entrega.';
  questions = ['O que precisa estar presente?', 'Que erro tornaria a entrega inaceitável?', 'Duas pessoas chegariam à mesma conclusão ao conferir?'];
 } else if (!answers.currentMethod || answers.currentMethod === 'unknown') {
  uncertainty = 'Ainda não sabemos como esse trabalho é resolvido hoje.';
  action = 'Investigue um caso recente e a alternativa que o cliente já usa.';
  questions = ['Como esse trabalho foi feito da última vez?', 'Quanto tempo, gasto e retrabalho envolveu?', 'Quem escolhe e paga pela alternativa atual?'];
 } else if (answers.traction === 'paid') {
  uncertainty = 'Ainda precisamos entender se a entrega pode ser repetida, com novo pagamento e um custo que faça sentido.';
  action = 'Revise uma entrega já paga: registre o que foi aceito, quanto tempo levou e quais gastos teve antes de tentar repetir.';
  questions = ['O que o cliente aceitou como uma boa entrega?', 'Quanto trabalho humano e gasto a entrega exigiu?', 'O cliente pagaria de novo pela mesma entrega?'];
 } else if (answers.traction === 'test') {
  uncertainty = 'Ainda precisamos entender se o benefício do teste se repete e melhora a alternativa que o cliente usa hoje.';
  action = 'Converse com quem participou do teste e compare o resultado com a forma anterior de fazer o trabalho.';
  questions = ['O que melhorou no teste?', 'O que ainda deu trabalho ou precisou ser corrigido?', 'A pessoa pagaria por uma nova entrega?'];
 } else if (answers.traction === 'conversations') {
  uncertainty = 'Ainda falta descobrir qual pequena entrega ajudaria de verdade as pessoas com quem você conversou.';
  action = 'Volte a uma dessas pessoas e combine uma entrega pequena e uma forma simples de conferir se ela ajudou.';
  questions = ['Qual tarefa vale resolver primeiro?', 'O que seria uma boa entrega?', 'O que a pessoa usa ou paga para resolver isso hoje?'];
 } else {
  uncertainty = 'Ainda não sabemos se esse problema aparece na vida do possível cliente e merece ser resolvido.';
  action = 'Converse com uma pessoa desse público para entender o problema antes de construir a solução.';
  questions = ['Quando esse problema aconteceu pela última vez?', 'Como você resolveu e quanto trabalho deu?', 'O que teria ajudado naquela situação?'];
 }
 const proposals = mappedAnswers(answers);
 const hasPreservedText = managedKeys.some(key => proposals[key] !== undefined && draft.canvas[key].trim() && draft.canvas[key] !== proposals[key]);
 if (hasPreservedText) uncertainty += ' Seus textos anteriores foram preservados no projeto; confira os detalhes antes de registrar um diagnóstico.';
 const steps = [
  answers.sensitive !== 'no' ? 'Prepare um caso fictício, sem dados pessoais ou confidenciais.' : 'Escolha um único caso e uma pessoa desse público para conversar.',
  `Investigue com a pessoa: ${questions.join(' ')}`,
  'Anote o que observou, o que ainda é hipótese e o próximo acordo com a pessoa.',
 ];
 const record = answers.traction === 'paid' && answers.sensitive === 'no' ? 'Entrega aceita, pagamento, todos os gastos, horas humanas, correções e interesse em repetir.' : 'Um caso concreto, a resposta às três perguntas e o que faria você mudar de ideia.';
 const decision = answers.sensitive !== 'no' ? 'Continue com exemplos fictícios até esclarecer autorização, revisão e riscos. Isso não reprova a ideia.' : 'Avance apenas no ponto esclarecido. Se a entrega não for útil ou não puder ser conferida, ajuste o recorte e teste novamente. Estas respostas não autorizam escala.';
 return {summary,uncertainty,action,questions,gaps,steps,record,decision};
}
