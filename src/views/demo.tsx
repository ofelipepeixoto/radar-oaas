import { useEffect, useState } from 'react';
import { SiteHeader } from '@/components/site-header';
import { Workbench } from '@/components/workbench';
import { createDemoAssessment, DEMO_STORAGE_KEY } from '@/lib/demo/data';
import { assessmentInputSchema, type AssessmentInput } from '@/domain/framework/schema';
import type { AssessmentSnapshot } from '@/domain/framework/snapshots';

type DemoStore={name:string;draft:AssessmentInput;history:AssessmentSnapshot[]};
export default function DemoPage(){const [stored,setStored]=useState<DemoStore|null>(null);useEffect(()=>{queueMicrotask(()=>{try{const raw=localStorage.getItem(DEMO_STORAGE_KEY);if(raw){const parsed=JSON.parse(raw) as DemoStore;const draft=assessmentInputSchema.parse(parsed.draft);if(draft.projectId.startsWith('synthetic-')){setStored({name:typeof parsed.name==='string'?parsed.name:'Exemplo sintético',draft,history:Array.isArray(parsed.history)?parsed.history:[]});return}}}catch{/* A damaged local demo never accesses private storage. */}setStored({name:'Conciliação financeira',draft:createDemoAssessment(),history:[]})})},[]);return <><SiteHeader compact/>{stored?<Workbench initial={stored.draft} initialName={stored.name} initialHistory={stored.history} demo author="Responsável da demonstração (fictício)" onSave={async(name,draft,history)=>{localStorage.setItem(DEMO_STORAGE_KEY,JSON.stringify({name,draft,history}));}}/>:<main id="conteudo" className="loading-state"><span className="spinner"/><p>Preparando a demonstração sintética…</p></main>}</>}
