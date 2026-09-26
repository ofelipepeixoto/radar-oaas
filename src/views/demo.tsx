import { useEffect, useState } from 'react';
import { SiteHeader } from '@/components/site-header';
import { Workbench } from '@/components/workbench';
import { createDemoAssessment, DEMO_STORAGE_KEY } from '@/lib/demo/data';
import { assessmentInputSchema, createEmptyAssessment, type AssessmentInput } from '@/domain/framework/schema';
import type { AssessmentSnapshot } from '@/domain/framework/snapshots';

export const GUIDED_DEMO_STORAGE_KEY='radar-oaas.guided-demo.v1';

type DemoStore={name:string;draft:AssessmentInput;history:AssessmentSnapshot[]};
export default function DemoPage(){const [stored,setStored]=useState<DemoStore|null>(null);const [example,setExample]=useState(false);useEffect(()=>{queueMicrotask(()=>{const showExample=new URLSearchParams(window.location.search).has('exemplo');setExample(showExample);try{const raw=localStorage.getItem(showExample?DEMO_STORAGE_KEY:GUIDED_DEMO_STORAGE_KEY);if(raw){const parsed=JSON.parse(raw) as DemoStore;const draft=assessmentInputSchema.parse(parsed.draft);if(draft.projectId.startsWith('synthetic-')){setStored({name:typeof parsed.name==='string'?parsed.name:'Exemplo sintético',draft,history:Array.isArray(parsed.history)?parsed.history:[]});return}}}catch{/* A damaged local demo never accesses private storage. */}setStored(showExample?{name:'Conciliação financeira',draft:createDemoAssessment(),history:[]}:{name:'Minha ideia fictícia',draft:createEmptyAssessment('synthetic-guided'),history:[]})})},[]);return <><SiteHeader compact/>{stored?<Workbench initial={stored.draft} initialName={stored.name} initialHistory={stored.history} initialMode={example?'advanced':'guided'} demo author="Responsável da demonstração (fictício)" onSave={async(name,draft,history)=>{localStorage.setItem(example?DEMO_STORAGE_KEY:GUIDED_DEMO_STORAGE_KEY,JSON.stringify({name,draft,history}));}}/>:<main id="conteudo" className="loading-state"><span className="spinner"/><p>Preparando a demonstração sintética…</p></main>}</>}
