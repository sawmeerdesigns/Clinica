const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(), p = await b.newPage({ viewport: { width: 1440, height: 1000 } });
  await p.goto(process.argv[2]); await p.waitForTimeout(1200);
  for (const s of process.argv.slice(3)) { try { if (s.startsWith('click:')) await p.click(s.slice(6), { timeout: 3000 }); else if (s.startsWith('wait:')) await p.waitForTimeout(+s.slice(5)); else await p.evaluate(s); } catch (e) { console.log('ERR', s, e.message.slice(0, 90)); } await p.waitForTimeout(300); }
  console.log(await p.evaluate(() => 'sheet=' + S.sheet + ' screen=' + S.screen + ' :: ' + document.getElementById('phone').innerText.replace(/\n+/g, ' · ').slice(0, 300)));
  await b.close(); })();
