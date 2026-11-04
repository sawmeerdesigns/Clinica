const { chromium } = require('playwright');
const [out, RUN1, PRE, NOW] = process.argv.slice(2);
const T = (p, ms = 350) => p.waitForTimeout(ms);
const payFlow = async p => { await p.evaluate(() => jumpTo('B04')); await p.click('#phone [data-act*="esewa"]'); await T(p, 500); await p.click('#phone >> text=Confirm booking'); await T(p, 500); };
const shots = [
  ['home', 'phone', PRE, NOW, async p => { await p.evaluate(() => jumpTo('B01')); }],
  ['review', 'phone', PRE, NOW, async p => { await p.evaluate(() => jumpTo('B04')); await p.click('#phone [data-act*="esewa"]'); }],
  ['payconfirm', 'phone', RUN1, NOW, payFlow],
  ['paid', 'phone', RUN1, NOW, async p => { await payFlow(p); await p.click('.as a.as-btn'); await T(p, 600); await p.evaluate(() => { const t = document.querySelector('.toast-region'); if (t) t.style.visibility = 'hidden'; }); }],
  ['error', 'phone', RUN1, NOW, async p => { await p.evaluate(() => jumpTo('B08')); }],
  ['report', 'desk', PRE, NOW, async p => { await p.evaluate(() => jumpTo('K20')); }],
];
(async () => { const b = await chromium.launch();
  for (const [name, kind, before, after, run] of shots) for (const [tag, url] of [['before', before], ['after', after]]) {
    const p = await b.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: kind === 'phone' ? 2 : 1 }); await p.goto(url); await p.waitForTimeout(1200);
    try { await run(p); } catch (e) { console.log(name, tag, 'ERR', e.message.slice(0, 120)); } await T(p, 500);
    console.log(name, tag, '::', (await p.evaluate(() => document.getElementById('phone').innerText.replace(/\n+/g, ' · ').slice(0, 200))));
    await p.locator('#phone').screenshot({ path: `${out}/${name}-${tag}.jpg`, type: 'jpeg', quality: 72 }); await p.close(); }
  await b.close(); })();
