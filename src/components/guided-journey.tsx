import { useEffect, useRef, useState } from 'react';
import Link from './navigation';
import { applyGuidedAnswers, getGuidedSummary, guidedOptions, type GuidedAnswers } from '@/domain/framework/guided';
import type { AssessmentInput } from '@/domain/framework/schema';

type ChoiceKey = 'audience' | 'work' | 'benefit' | 'traction' | 'currentMethod' | 'verification' | 'sensitive';
type Props = { data: AssessmentInput; name: string; demo: boolean; busy: boolean; dirty: boolean; error: string; savedLabel: string; onChange: (draft: AssessmentInput) => void; onName: (value: string) => void; onPersist: (draft: AssessmentInput) => Promise<boolean>; onAdvanced: () => void };
const titles = ['Para quem é a sua ideia?', 'O que você quer melhorar?', 'O que você já descobriu?', 'Como saber se deu certo?', 'Sua ideia, com um próximo passo.'];
const descriptions = ['Escolha o público que você tem em mente. Pode mudar depois.', 'Escolha um trabalho e a melhoria que você gostaria de oferecer.', 'Conte em que ponto você está. Não precisa ter todas as respostas.', 'Pense no que o cliente poderia conferir ao receber sua entrega.'];
const labels: Record<ChoiceKey,string> = {audience:'Quem você quer ajudar?',work:'Qual trabalho você quer ajudar a resolver?',benefit:'Qual melhoria importa mais?',traction:'Você já apresentou essa ideia a alguém?',currentMethod:'Como esse trabalho é feito hoje?',verification:'Como o cliente perceberia que deu certo?',sensitive:'A entrega envolve informações pessoais ou decisões importantes?'};

export function GuidedJourney({data,name,demo,busy,dirty,error,savedLabel,onChange,onName,onPersist,onAdvanced}:Props) {
  const step = data.guidedIntake?.step ?? 0;
  const answers = data.guidedIntake?.answers ?? {};
  const heading = useRef<HTMLHeadingElement>(null);
  const [validation,setValidation] = useState('');
  const [prepared,setPrepared] = useState(false);
  useEffect(()=>{heading.current?.focus({preventScroll:true});window.scrollTo({top:0,behavior:'instant'});},[step]);
  const change = (key:keyof GuidedAnswers, value:string) => {onChange(applyGuidedAnswers(data,{...answers,[key]:value},step));setValidation('');};
  const groups: ChoiceKey[][] = [['audience'],['work','benefit'],['traction','currentMethod'],['verification','sensitive']];
  const valid = () => {
    if ((groups[step]??[]).some(key=>!answers[key])) {setValidation('Escolha uma opção em cada pergunta. “Ainda não sei” também vale.');return false;}
    if ((step===0&&answers.audience==='other'&&!answers.audienceOther?.trim())||(step===1&&answers.work==='other'&&!answers.workOther?.trim())) {setValidation('Escreva uma frase curta para a opção “Outro”, ou escolha “Ainda não sei”.');return false;}
    return true;
  };
  const move = async(next:number) => {if(next>step&&!valid())return;setValidation('');await onPersist(applyGuidedAnswers(data,answers,next));};
  const summary = getGuidedSummary(data);
  const choice = (key:ChoiceKey) => <fieldset className="guide-question" key={key} disabled={busy}>
    <legend>{labels[key]}</legend>
    <div className="choice-grid">{guidedOptions[key].map(option=><label className={`choice-card${answers[key]===option.value?' is-selected':''}`} key={option.value}>
      <input type="radio" name={key} value={option.value} checked={answers[key]===option.value} onChange={()=>change(key,option.value)}/><span>{option.label}</span>
    </label>)}</div>
    {key==='audience'&&answers.audience==='other'&&<label className="field guide-other"><span>Qual público?</span><input value={answers.audienceOther??''} maxLength={180} onChange={e=>change('audienceOther',e.target.value)} placeholder="Ex.: donos de pequenas padarias"/><small>Uma frase curta é suficiente.</small></label>}
    {key==='work'&&answers.work==='other'&&<label className="field guide-other"><span>Qual trabalho?</span><input value={answers.workOther??''} maxLength={180} onChange={e=>change('workOther',e.target.value)} placeholder="Ex.: organizar pedidos recebidos por mensagem"/><small>Descreva só o trabalho que você tem em mente.</small></label>}
  </fieldset>;
  return <main id="conteudo" className="guide-shell">
    <div className="guide-top"><Link href={demo?'/':'/projetos'} className="text-link">{demo?'← Início':'← Meus projetos'}</Link><span>{demo?'Demonstração':'Projeto privado'}</span></div>
    {demo&&<p className="guide-demo"><strong>Experimente com uma ideia fictícia.</strong> Não insira dados reais ou confidenciais. As respostas ficam só neste navegador.</p>}
    <div className="guide-progress" aria-label={step<4?`Etapa ${step+1} de 4`:'Resumo das suas respostas'}><span>{step<4?`Etapa ${step+1} de 4`:'Seu próximo passo'}</span><ol aria-label="Progresso do preenchimento">{['Cliente','Entrega','Descobertas','Resultado'].map((label,i)=><li key={label} className={i<=step?'is-current':''} aria-current={i===step?'step':undefined}><span>{label}</span></li>)}</ol></div>
    <header className="guide-heading"><h1 ref={heading} tabIndex={-1}>{titles[step]}</h1>{step<4&&<p>{descriptions[step]}</p>}</header>
    {!data.guidedIntake&&Object.values(data.canvas).some(Boolean)&&<p className="guide-preserved">Este projeto já tem informações. O guia preserva os detalhes que você escreveu; você pode revisá-los em “Aprofundar avaliação”.</p>}
    <div className="guide-content">
      {step<4?<>{groups[step].map(choice)}{step===3&&answers.sensitive&&answers.sensitive!=='no'&&<p className="guide-context">No próximo passo, vamos começar pelas condições de um teste seguro e por exemplos fictícios.</p>}</>:<>
        <section className="guide-summary"><span className="eyebrow dark-eyebrow">O QUE VOCÊ QUER CONSTRUIR</span><h2>{summary.summary}</h2><p><strong>Principal dúvida:</strong> {summary.uncertainty}</p><small>Resumo das suas respostas. Resultados ainda precisam ser observados.</small></section>
        <section className="guide-action"><span className="eyebrow">SEU PRÓXIMO PASSO</span><h2>{summary.action}</h2><button className="button button-lime" onClick={()=>setPrepared(v=>!v)} aria-expanded={prepared} aria-controls="guide-test">{prepared?'Recolher preparação':'Preparar meu próximo teste'} <span aria-hidden="true">→</span></button>
          {prepared&&<div id="guide-test" className="guide-test"><h3>Leve estas perguntas com você</h3><ol>{summary.questions.map(q=><li key={q}>{q}</li>)}</ol><p>Depois da conversa ou teste, registre o que aconteceu em “Aprofundar avaliação” → “Evidências”.</p></div>}
        </section>
        {!!summary.gaps.length&&<details className="guide-details"><summary>O que ainda vale esclarecer</summary><ul>{summary.gaps.slice(0,3).map(gap=><li key={gap}>{gap}</li>)}</ul></details>}
        <details className="guide-details"><summary>Rever minhas respostas</summary><dl>{(Object.keys(labels) as ChoiceKey[]).map(key=><div key={key}><dt>{labels[key]}</dt><dd>{answers[key]==='other'?(key==='audience'?answers.audienceOther:answers.workOther):guidedOptions[key].find(o=>o.value===answers[key])?.label??'Ainda não respondido'}</dd></div>)}</dl></details>
        <p className="guide-limit">Esta preparação não é uma aprovação do projeto. Notas, comprovações e histórico continuam na avaliação detalhada.</p>
      </>}
    </div>
    {(error||validation)&&<div role="alert" className="error-box">{error||validation}</div>}
    <div className="guide-navigation">{step>0?<button className="button button-light" disabled={busy} onClick={()=>void move(step===4?0:step-1)}>{step===4?'Corrigir respostas':'Voltar'}</button>:<span/>}{step<4?<button className="button button-dark" disabled={busy} onClick={()=>void move(step+1)}>{busy?'Salvando…':step===3?'Ver meu próximo passo':'Continuar'} <span aria-hidden="true">→</span></button>:<button className="button button-dark" disabled={busy} onClick={async()=>{if(await onPersist(data))window.location.assign(demo?'/':'/projetos')}}>{busy?'Salvando…':'Salvar e sair'}</button>}</div>
    <div className="guide-save"><span role="status">{dirty?'Alterações não salvas':savedLabel}</span>{step<4&&<button className="text-link" disabled={busy} onClick={async()=>{if(await onPersist(data))window.location.assign(demo?'/':'/projetos')}}>Salvar e sair</button>}</div>
    <div className="guide-extras"><details className="guide-details"><summary>Nome do projeto</summary><label className="field"><span>Como você quer chamar esta ideia?</span><input maxLength={120} value={name} onChange={e=>onName(e.target.value)}/></label></details><button className="text-link" onClick={onAdvanced} disabled={busy}>Aprofundar avaliação <span aria-hidden="true">↗</span></button></div>
  </main>;
}
