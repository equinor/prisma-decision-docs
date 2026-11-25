import { chromium } from 'playwright';
import { readFile } from 'node:fs/promises';
const API='http://localhost:7075', WEB='http://127.0.0.1:5004';
const api = async (m, r, b) => { const res = await fetch(API+r,{method:m,headers:{'Content-Type':'application/json','X-Username':'docs-bot'},body:b===undefined?undefined:JSON.stringify(b)}); if(!res.ok) throw new Error(m+r+res.status+await res.text()); return res.status===204?null:res.json(); };
const data = JSON.parse(await readFile('/workspaces/prisma-decision-docs/workflow/projects/[Backup_-_DQ_Conference_-_Workshop]_Team_building.json','utf8'));
const [p] = await api('POST','/projects/import',[data]);
const browser = await chromium.launch();
const ctx = await browser.newContext({viewport:{width:1440,height:900}});
await ctx.addInitScript(()=>{localStorage.setItem('username','docs-bot');localStorage.setItem('useDarkMode','false');});
const page = await ctx.newPage();
try {
  await page.goto(`${WEB}/project/${p.id}/${process.argv[2]??''}`,{waitUntil:'load'});
  await page.waitForTimeout(3000);
  for (const sel of process.argv.slice(3)) {
    console.log(`\n### ${sel}`);
    const els = await page.locator(sel).all();
    for (const e of els.slice(0,3)) console.log((await e.evaluate(n=>n.outerHTML)).slice(0,1500));
  }
} finally { await browser.close(); await api('DELETE',`/projects/${p.id}`); }
