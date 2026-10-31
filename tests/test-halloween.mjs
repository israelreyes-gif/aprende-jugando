import http from 'node:http';
import { createRequire } from 'node:module';
import worker from '../worker/worker.js';
import { makeD1 } from './d1-shim.js';
const { chromium } = createRequire(import.meta.url)('playwright');
const API = 'http://localhost:8801';
const db = makeD1(new URL('./fixtures/schema.sql', import.meta.url).pathname); const env = { DB: db, API_KEY: 'k' };
db.sqlite.exec(`INSERT INTO profiles (id,name,avatar_color,gender,course_id) VALUES ('alex','Alex','#8EDBC0','chico','4-primaria')`);
db.sqlite.prepare(`INSERT INTO topic_release (id,profile_id,course_id,subject_id,topic_id) VALUES ('r','alex','4-primaria','ingles','time')`).run();
const server = http.createServer(async (req, res) => { const chunks = []; for await (const c of req) chunks.push(c); const body = chunks.length ? Buffer.concat(chunks) : undefined;
  const r = await worker.fetch(new Request(`${API}${req.url}`, { method: req.method, headers: req.headers, body: ['GET','HEAD'].includes(req.method) ? undefined : body }), env);
  res.writeHead(r.status, Object.fromEntries(r.headers)); res.end(Buffer.from(await r.arrayBuffer())); }).listen(8801);
const browser = await chromium.launch(); const B = 'http://localhost:8761/';
let ok = 0, bad = 0; const check = (name, cond) => { if (cond) ok++; else { bad++; console.log('✗', name); } };
const errs = [];
const dates = [['2026-10-14', false], ['2026-10-15', true], ['2026-10-31', true], ['2026-11-02', true], ['2026-11-03', false], ['2026-07-01', false], ['2026-12-14', false], ['2026-12-15', 'x'], ['2027-01-06', 'x'], ['2027-01-07', false]];
for (const [iso, hall] of dates) {
  const [y, m, d] = iso.split('-').map(Number);
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, serviceWorkers: 'block' });
  await ctx.addInitScript(`localStorage.setItem('aj.apiUrl','${API}'); localStorage.setItem('aj.apiKey','k');
    (() => { const fixed = new Date(${y}, ${m - 1}, ${d}, 12).valueOf(); const D = Date;
      class F extends D { constructor(...a) { if (a.length === 0) super(fixed); else super(...a); } static now() { return fixed; } }
      window.Date = F; })();`);
  const page = await ctx.newPage(); page.on('pageerror', (e) => errs.push(String(e)));
  const xm = hall === 'x'; const want = xm ? 'icons/mochila-navidad.svg' : hall ? 'icons/mochila-halloween.svg' : 'icons/mochila.svg';
  await page.goto(B + '#/'); await page.waitForTimeout(1200);
  check(`${iso} inicio`, (await page.locator('.home__mascot').getAttribute('src')) === want);
  check(`${iso} inicio carga la imagen`, await page.locator('.home__mascot').evaluate((i) => i.complete && i.naturalWidth > 0));
  await page.goto(B + '#/p/alex'); await page.waitForTimeout(1200);
  check(`${iso} curso`, (await page.locator('.course-card__bag img').first().getAttribute('src')) === want);
  if (iso === '2026-10-31' || iso === '2026-11-03' || iso === '2026-12-15') {
    db.sqlite.exec('DELETE FROM study_progress');
    await page.goto(B + '#/p/alex/c/4-primaria/s/ingles/study/time'); await page.reload(); await page.waitForTimeout(1800);
    await page.getByText(/mark as studied/i).first().click(); await page.waitForTimeout(1500);
    const src = await page.locator('.celebration__mascot').first().getAttribute('src').catch(() => null);
    check(`${iso} celebración`, src === want);
    const confetti = (await page.locator('.celebration__confetti').first().innerText()).replace(/\s+/g, '');
    check(`${iso} confeti (${confetti})`, confetti === (xm ? '❄️🎅⛄🎄❄️⭐🎁❄️🎅⛄🎄❄️⭐🎁❄️🎄' : hall ? '🦇🎃👻🕷️🦇🎃👻🕷️🦇🎃👻🕷️🦇🕷️👻🎃' : '🎉⭐✨🎊⭐✨🎈🎉⭐🎊✨🎈🎉⭐🎊✨'));
    
  }
  await ctx.close();
}
console.log(`${ok} ✓  ${bad} ✗  errores de página: ${errs.length}`, errs.slice(0, 2));
await browser.close(); server.close(); process.exit(0);
