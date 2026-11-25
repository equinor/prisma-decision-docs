import { chromium } from 'playwright';
import { readFile } from 'node:fs/promises';
import { pages } from './pages.mjs';
const API='http://localhost:7075', WEB='http://127.0.0.1:5004';
const api = async (m, r, b) => { const res = await fetch(API+r,{method:m,headers:{'Content-Type':'application/json','X-Username':'docs-bot'},body:b===undefined?undefined:JSON.stringify(b)}); if(!res.ok) throw new Error(m+r+res.status+await res.text()); return res.status===204?null:res.json(); };
const data = JSON.parse(await readFile('/workspaces/prisma-decision-docs/workflow/projects/[Backup_-_DQ_Conference_-_Workshop]_Team_building.json','utf8'));
const [p] = await api('POST','/projects/import',[data]);
const only = process.argv[2] ? new Set(process.argv[2].split(',')) : null;
const browser = await chromium.launch();
const ctx = await browser.newContext({viewport:{width:1440,height:900}});
await ctx.addInitScript(()=>{localStorage.setItem('username','docs-bot');localStorage.setItem('useDarkMode','false');});
const page = await ctx.newPage();
try {
 for (const d of pages) {
  if (only && !only.has(d.folder)) continue;
  await page.goto(d.route===null?WEB+'/':`${WEB}/project/${p.id}/${d.route}`,{waitUntil:'load'});
  await page.waitForTimeout(3000);
  console.log(`\n##### ${d.folder}`);
  const snap = await page.locator('body').ariaSnapshot();
  console.log(snap.split('\n').filter(l=>/button|textbox|heading|combobox|checkbox|tab|link|menuitem|radio|slider|spinbutton|switch|img/.test(l)).slice(0,120).join('\n'));
 }
} finally { await browser.close(); await api('DELETE',`/projects/${p.id}`); }
