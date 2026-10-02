import { expect, test } from '@playwright/test';
test('public guide: incomplete, keyboard, reload, result, copy, edit, erase and no private requests',async({page,context})=>{
 await context.grantPermissions(['clipboard-read','clipboard-write']);
 const external:string[]=[];page.on('request',r=>{if(/\/api\/|supabase|openai\.com/.test(r.url()))external.push(r.url());});
 await page.goto('/');await page.getByRole('link',{name:'Começar sem cadastro',exact:true}).first().click();
 await expect(page.getByRole('heading',{name:'Quem você quer ajudar?'})).toBeVisible();
 await page.getByRole('button',{name:'Continuar',exact:true}).click();await expect(page.getByRole('alert')).toContainText('Escolha uma opção');
 const audience=page.getByRole('radio',{name:'Pequenas empresas',exact:true});await audience.focus();await page.keyboard.press('Space');
 await page.reload();await expect(audience).toBeChecked();await page.getByRole('button',{name:'Continuar',exact:true}).click();
 await page.getByRole('radio',{name:'Preparar um documento para revisão',exact:true}).check();await page.getByRole('radio',{name:'A própria pessoa ou equipe faz o trabalho',exact:true}).check();
 await page.getByRole('button',{name:'Continuar',exact:true}).click();await page.getByRole('radio',{name:'Já conversei com possíveis clientes',exact:true}).check();await page.getByRole('radio',{name:'Uma pessoa confere a entrega',exact:true}).check();
 await page.getByRole('button',{name:'Continuar',exact:true}).click();await page.getByRole('radio',{name:'Posso entregar e conferir o trabalho combinado',exact:true}).check();await page.getByRole('radio',{name:'Não, pelo que sei',exact:true}).check();await page.getByRole('button',{name:'Ver meu plano',exact:true}).click();
 await expect(page.getByRole('heading',{name:'Seu primeiro teste',exact:true})).toBeFocused();await expect(page.locator('.public-steps li')).toHaveCount(3);await expect(page.getByRole('table')).toHaveCount(0);
 await page.getByRole('button',{name:'Copiar plano',exact:true}).click();await expect(page.getByRole('status')).toHaveText('Plano copiado.');expect(await page.evaluate(()=>navigator.clipboard.readText())).toContain('Registro esperado');
 await page.reload();await expect(page.getByRole('heading',{name:'Seu primeiro teste',exact:true})).toBeVisible();
 for(const width of [1280,375,320]){await page.setViewportSize({width,height:900});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);}
 await page.getByRole('button',{name:'Corrigir respostas'}).click();await expect(audience).toBeChecked();
 page.once('dialog',d=>d.accept());await page.getByRole('button',{name:'Apagar respostas e recomeçar'}).click();await expect(page.getByRole('radio',{checked:true})).toHaveCount(0);expect(await page.evaluate(()=>localStorage.getItem('radar-oaas.public-plan.v1'))).toBeNull();expect(external).toEqual([]);
});
test('unknowns produce safe research; guided example does not overwrite a personal draft',async({page})=>{
 await page.goto('/avaliar');for(let step=0;step<4;step++){const choices=page.getByRole('radio',{name:/^(Ainda não sei|Prefiro responder depois|Não tenho certeza)$/});await expect(choices.first()).toBeVisible();for(const c of await choices.all())await c.check();await page.getByRole('button',{name:step===3?'Ver meu plano':'Continuar',exact:true}).click();}
 await expect(page.locator('.guide-action')).toContainText('fictício');const saved=await page.evaluate(()=>localStorage.getItem('radar-oaas.public-plan.v1'));
 await page.goto('/avaliar?exemplo=1');await expect(page.getByRole('radio',{name:'Pequenas empresas',exact:true})).toBeChecked();await page.getByRole('button',{name:'Continuar',exact:true}).click();await page.reload();await expect(page.getByRole('heading',{name:'Qual será a primeira entrega?'})).toBeVisible();expect(await page.evaluate(()=>localStorage.getItem('radar-oaas.public-plan.v1'))).toBe(saved);
});
