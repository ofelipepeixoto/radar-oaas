// Isolated public surface: no Worker, authentication, database or API routes.
import { cp, mkdir, rm, writeFile, symlink, readFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
const root=process.cwd();const stage=path.join(root,'.public-build');
await rm(stage,{recursive:true,force:true});await mkdir(stage,{recursive:true});
for(const item of ['src','public','tsconfig.json','package.json','postcss.config.mjs'])await cp(path.join(root,item),path.join(stage,item),{recursive:true});
await symlink(path.join(root,'node_modules'),path.join(stage,'node_modules'),'dir');
const css=path.join(stage,'src/styles/global.css');
await writeFile(css,(await readFile(css,'utf8')).replace('@import "tailwindcss";',`@import "${path.join(root,'node_modules/tailwindcss/index.css')}";`));
await rm(path.join(stage,'src/pages'),{recursive:true});await mkdir(path.join(stage,'src/pages'),{recursive:true});
for(const page of ['index.astro','avaliar.astro','metodologia.astro'])await cp(path.join(root,'src/pages',page),path.join(stage,'src/pages',page));
await writeFile(path.join(stage,'astro.config.mjs'),`import {defineConfig} from 'astro/config';import react from '@astrojs/react';import tailwind from '@tailwindcss/postcss';export default defineConfig({output:'static',outDir:'../out',integrations:[react()],vite:{css:{postcss:{plugins:[tailwind()]}}}});`);
const result=spawnSync(process.execPath,[path.join(root,'node_modules/astro/bin/astro.mjs'),'build'],{cwd:stage,stdio:'inherit',env:{...process.env,ASTRO_TELEMETRY_DISABLED:'1',PUBLIC_RADAR_SURFACE:'true'}});
process.exitCode=result.status??1;
