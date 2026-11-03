// Clinica — Medicines tracker: stock rings, dose logging, restock, alerts.
// Figma: zw3saW6ot26E6gWH20K3ux, section 511:27999. Plugs into core.jsx and reuses health.jsx (S.meds, lowStock,
// field, saveMed, openHealth) and care.jsx (frame, notifRow).
import { Fragment } from 'react';
import { btn, homeInd, statusBar } from './app.jsx';
import { ask, say, src, words } from './ask.jsx';
import { bar, label, row, rows, tag, when } from './booking.jsx';
import { frame, notifRow } from './care.jsx';
import { A, ACTIONS, FLOW, NUM, ORDER, S, SCREENS, after, back, every, extraState, fresh, go, later, mount, render, sepJoin, toast, tr, NE, nd, ne } from './core.jsx';
import { field, firstNum, lbl, list, lowStock, openHealth, saveMed } from './health.jsx';
import { checks, chip, clock, img, now } from './staff.jsx';

// Phase 8: Nepali for this module's own lines. Medicine names and strengths stay Latin.
Object.assign(NE, {
  'e.g. Paracetamol': 'जस्तै: Paracetamol', 'e.g. Tablet, capsule, syrup': 'जस्तै: ट्याब्लेट, क्याप्सुल, सिरप', 'e.g. 500 mg': 'जस्तै: 500 mg',
  'e.g. 20 tablets, or 100 ml': 'जस्तै: 20 ट्याब्लेट, वा 100 ml', 'e.g. 1 tablet': 'जस्तै: 1 ट्याब्लेट', 'e.g. Twice a day, after meals': 'जस्तै: दिनको 2 पटक, खाना खाएपछि',
  // the demo medicines (health.jsx data) and what the tracker says about them
  'Acetaminophen tablets': 'Acetaminophen ट्याब्लेट', 'Metformin hydrochloride tablets': 'Metformin hydrochloride ट्याब्लेट', 'Cetirizine hydrochloride syrup': 'Cetirizine hydrochloride सिरप',
  'Cetirizine 10 mg (syrup)': 'Cetirizine 10 mg (सिरप)', '1 tablet, twice a day': '1 ट्याब्लेट, दिनको 2 पटक', '1 tablet, after breakfast': '1 ट्याब्लेट, बिहानको खाना खाएपछि',
  '5 ml, at night': '5 ml, राति', 'Twice daily': 'दिनको 2 पटक', 'Once daily': 'दिनको 1 पटक', 'At night': 'राति', 'As needed': 'चाहिएको बेला', 'Twice a day': 'दिनको 2 पटक',
  'After breakfast': 'बिहानको खाना खाएपछि', '1 tablet': '1 ट्याब्लेट', '3 weeks': '3 हप्ता', '2 months': '2 महिना', '1 week': '1 हप्ता', Tablet: 'ट्याब्लेट', Syrup: 'सिरप',
  'Your action is required': 'तपाईंले केही गर्नुपर्ने छ', 'Some of your medicines are going out of stock soon. Refill before you run out.': 'तपाईंका केही औषधि छिट्टै सकिन लागेका छन्। सकिनुअघि थप किन्नुहोस्।',
  'Or tell the assistant instead →': 'वा बरु सहायकलाई भन्नुहोस् →', 'Or type it in instead →': 'वा बरु टाइप गर्नुहोस् →', 'Or tell the assistant how much you bought →': 'वा कति किन्नुभयो सहायकलाई भन्नुहोस् →',
  'Say the name, strength, how much you have, and how often you take it.': 'नाम, मात्रा, तपाईंसँग कति छ, र कति पटक खानुहुन्छ भन्नुहोस्।', 'For example, say': 'जस्तै, यसो भन्नुहोस्',
  '“I bought Paracetamol 500 mg, 20 tablets”': '“मैले Paracetamol 500 mg, 20 ट्याब्लेट किनेँ”', '“I take one twice a day”': '“म दिनको 2 पटक एउटा खान्छु”',
  'Listening…': 'सुनिरहेको छ…', 'Tap the mic to speak': 'बोल्न माइक थिच्नुहोस्', 'Stop listening': 'सुन्न बन्द गर्नुहोस्', Speak: 'बोल्नुहोस्', Send: 'पठाउनुहोस्',
  "This fills in your medicine details — you'll review before it saves.": 'यसले तपाईंको औषधिको विवरण भर्छ — सेभ हुनुअघि तपाईं जाँच्नुहुन्छ।',
  "Filled in from what you said — check it's right, then save.": 'तपाईंले भनेअनुसार भरिएको छ — सही छ कि जाँचेर सेभ गर्नुहोस्।',
  'Please restock soon — missing doses can affect your recovery.': 'छिट्टै थप किन्नुहोस् — औषधि छुटे निको हुन ढिलो हुन सक्छ।', 'None left to take': 'खान बाँकी छैन',
  'Running low — buy more soon': 'सकिन लागेको छ — छिट्टै थप किन्नुहोस्', 'Just now': 'अहिले भर्खरै', '5 min ago': '5 मिनेटअघि', Added: 'थपेको',
  "We've filled in what we already know — just update how much you've got.": 'हामीलाई थाहा भएको कुरा भरिसकेका छौं — तपाईंसँग अहिले कति छ, त्यति मात्र बदल्नुहोस्।',
  'Paracetamol is running low': 'Paracetamol सकिन लागेको छ', '6 tablets left. Buy more before you run out.': '6 ट्याब्लेट बाँकी। सकिनुअघि थप किन्नुहोस्।',
  'Time for your Metformin': 'Metformin खाने समय भयो', "1 tablet, after breakfast. Log it once you've taken it.": '1 ट्याब्लेट, बिहानको खाना खाएपछि। खाइसकेपछि टिप्नुहोस्।',
  'A follow-up is due': 'फलो-अपको समय भयो', 'Book a time that suits you.': 'आफूलाई मिल्ने समय बुक गर्नुहोस्।', 'Your visit notes are ready': 'तपाईंको भेटको टिप्पणी तयार छ',
  'Open Health to read them.': 'पढ्न स्वास्थ्य खोल्नुहोस्।', 'Dose logged.': 'औषधि खाएको टिपियो।',
  'Paracetamol is almost out of stock': 'Paracetamol सकिनै लागेको छ', 'Only 6 tablets left. Restock before you run out.': '6 ट्याब्लेट मात्र बाँकी। सकिनुअघि थप किन्नुहोस्।',
  now: 'अहिले', tablets: 'ट्याब्लेट', capsules: 'क्याप्सुल',
});
// A dose or count the patient typed ('2 tablets') keeps its words, except tablet/capsule.
const mx = s => !ne() || !s ? s : NE[s] || String(s).replace(/\b(tablet|capsule)s?\b/gi, w => /^t/i.test(w) ? 'ट्याब्लेट' : 'क्याप्सुल');

export const MED_FORM = [['name', 'Medicine name', 'e.g. Paracetamol'], ['form', 'Form', 'e.g. Tablet, capsule, syrup'], ['strength', 'Strength', 'e.g. 500 mg'],
  ['qty', 'Total you have', 'e.g. 20 tablets, or 100 ml'], ['each', 'How much you take', 'e.g. 1 tablet'], ['often', 'How often', 'e.g. Twice a day, after meals']];
export const HEARD = { name: 'Paracetamol', form: 'Tablet', strength: '500 mg', qty: '20 tablets', each: '1 tablet', often: 'Twice a day' }; // stand-in for speech
export const MED_NOTIFS = [
  { g: 'Today', tile: 'error', icon: 'icon-medication-error-20.svg', t: 'Paracetamol is running low', b: '6 tablets left. Buy more before you run out.', when: 'Just now', go: 'med:0' },
  { g: 'Today', tile: 'action', icon: 'icon-schedule-action-20.svg', t: 'Time for your Metformin', b: "1 tablet, after breakfast. Log it once you've taken it.", when: '5 min ago', go: 'med:1' },
  { g: 'Earlier', icon: 'lt-calendar.svg', t: 'A follow-up is due', b: 'Book a time that suits you.', when: 'Yesterday', go: 'fu', read: true },
  { g: 'Earlier', icon: 'lt-document.svg', t: 'Your visit notes are ready', b: 'Open Health to read them.', when: 'Aug 28', go: 'hvisit', read: true },
];

extraState(() => ({ medI: 0, mtListening: true }), ORDER.meds);

// ---------- pieces ----------
// Stock ring: the arc is the share of stock left since the last restock. Red when low, blue when fine.
export function ring(m, big = false) {
  const s = big ? 120 : 56, w = big ? 9 : 5.6, r = (s - w) / 2, c = 2 * Math.PI * r, p = Math.max(0, Math.min(1, m.left / m.total)), tone = lowStock(m) ? 'error' : 'action';
  return <span className="ring" style={{ width: s, height: s }} role="img" aria-label={ne() ? `स्टक ${Math.round(p * 100)}% बाँकी${tone === 'error' ? ', सकिन लागेको' : ''}` : `${Math.round(p * 100)}% of stock left${tone === 'error' ? ', running low' : ''}`}>
    <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`} aria-hidden="true"><circle cx={s / 2} cy={s / 2} r={r} fill="none" stroke="var(--border-secondary)" strokeWidth={w} />
      <circle cx={s / 2} cy={s / 2} r={r} fill="none" stroke={`var(--text-${tone})`} strokeWidth={w} strokeDasharray={`${p * c} ${c}`} transform={`rotate(-90 ${s / 2} ${s / 2})`} /></svg>
    <img src={`${A}icon-medication-${tone}-${big ? 44 : 22}.svg`} width={big ? 44 : 22} height={big ? 44 : 22} alt="" /></span>;
}
export const med = () => S.meds[S.medI];
export const perDose = m => firstNum(m.each) || 1;
export const mtLink = (label, act) => <button className="mt-link" data-act={act}>{label}</button>;
export const medForm2 = () => <form id="mf" noValidate className="fields" onSubmit={e => { e.preventDefault(); saveMed(); }}>{MED_FORM.map(([k, l, ph]) => field(k, l, tr(ph)))}</form>;

export const medRow2 = (m, i) => {
  const low = lowStock(m);
  return <button className="mt-row" data-act={`mt-open:${i}`}>{ring(m)}
    <span className="mt-t"><span className="mt-name"><span>{tr(m.title)}</span>{low ? tag('Refill', 'error sm') : null}</span>
      {m.generic ? <span className="body-s">{tr(m.generic)}</span> : null}
      <span className={`mt-dose ${low ? 'low' : ''}`}><img src={`${A}icon-schedule-tertiary-13.svg`} width="13" height="13" alt="" />{mx(m.sub)}</span>
      <span className={`mt-left ${low ? 'low' : ''}`}>{ne() ? `${m.left} ${mx(m.unit)} बाँकी` : `${m.left} ${m.unit} left`}</span></span></button>;
};

// ---------- screens ----------
Object.assign(SCREENS, {
  mtlist: () => frame('Medicines', <div className="stack16">
      {S.meds.some(lowStock) ? <div className="mt-banner" role="status"><p className="mt-bt"><img src={`${A}icon-warning-18.svg`} width="18" height="18" alt="" />{tr('Your action is required')}</p>
        <p>{tr('Some of your medicines are going out of stock soon. Refill before you run out.')}</p></div> : null}
      <div className="stack4"><div className="inset">{lbl('Your medicines')}</div>
        <div className="mt-list">{sepJoin(S.meds.map(medRow2))}</div></div></div>,
    { cta: <button className="btn secondary" data-act="mt-new"><img src={`${A}icon-add-24.svg`} width="24" height="24" alt="" />{tr('Add a medicine')}</button> }),

  mtadd: () => frame('Add a medicine', <div className="inset">{mtLink(tr('Or tell the assistant instead →'), 'mt-swap:mtvoice')}{medForm2()}</div>,
    { cta: btn('Save medicine', 'med-save', { kind: 'secondary' }) }),

  // Chat-shaped app bar: the back label names where Back goes.
  mtvoice: () => (
    <div className="screen">
      {statusBar()}
      <div className="appbar chat hug">
        <div className="side"><a href="#" className="back-l" data-act="back"><span className="icon-btn"><img src={`${A}icon-back.svg`} width="24" height="24" alt="" /></span>{tr('Medicines')}</a></div>
        <h1 className="c-title">{tr('Add a medicine')}</h1>{/* W13 */}<div className="side end"><div className="slot"></div></div>
      </div>
      <div className="body g20">
        <div className="inset"><div className="greet2"><p className="g1">{tr('Tell me about your medicine')}</p><p className="lede">{tr('Say the name, strength, how much you have, and how often you take it.')}</p></div>
          {mtLink(tr('Or type it in instead →'), 'mt-swap:mtadd')}</div>
        <div className="inset stack8">{lbl('For example, say')}
          <div className="chips">{[['icon-medication-action-18.svg', '“I bought Paracetamol 500 mg, 20 tablets”'], ['icon-schedule-action-18.svg', '“I take one twice a day”']].map(([i, t]) =>
            <button key={i} className="chip" data-act="mt-heard"><img src={`${A}${i}`} width="18" height="18" alt="" />{tr(t)}</button>)}</div></div>
      </div>
      <div className="ask-input">
        <div className="ib-row">
          {S.mtListening ? <div className="ib-field" role="status">{tr('Listening…')}</div> : <div className="ib-field idle">{tr('Tap the mic to speak')}</div>}
          <button className={`ib-btn ${S.mtListening ? 'voice' : 'ghost'}`} data-act="mt-voice" aria-pressed={S.mtListening} aria-label={tr(S.mtListening ? 'Stop listening' : 'Speak')}>
            <img src={`${A}icon-mic${S.mtListening ? '-white' : ''}-24.svg`} width="24" height="24" alt="" /></button>
          <button className="ib-btn" disabled aria-label={tr('Send')}><img src={`${A}icon-send-disabled-24.svg`} width="24" height="24" alt="" /></button>
        </div>
        <p className="body-s tertiary" style={{ textAlign: 'center' }}>{tr("This fills in your medicine details — you'll review before it saves.")}</p>
      </div>
      {homeInd()}
    </div>),

  mtreview: () => frame('Review your medicine', <div className="inset">
      <div className="mt-ai"><img src={`${A}icon-check-circle-action-18.svg`} width="18" height="18" alt="" /><p>{tr("Filled in from what you said — check it's right, then save.")}</p></div>
      {medForm2()}</div>, { cta: btn('Save medicine', 'med-save', { kind: 'secondary' }) }),

  mtmed: () => {
    const m = med(), low = lowStock(m), out = m.left < perDose(m);
    return frame(m.title, <div className="inset stack24">
      <div className="mt-hero">{ring(m, true)}</div>
      {low ? <div className="mt-alert" role="status"><p className="mt-at"><img src={`${A}icon-warning-error-18.svg`} width="18" height="18" alt="" />{ne() ? (m.left ? `${m.left} ${mx(m.unit)} मात्र बाँकी` : `${mx(m.unit)} सकियो`) : m.left ? `Only ${m.left} ${m.unit} remain` : `No ${m.unit} left`}</p>
        <p>{tr('Please restock soon — missing doses can affect your recovery.')}</p></div> : null}
      <div className="mt-stats">{[[tr(m.since), 'Tracking since'], [mx(m.sched), 'Schedule'], [`${m.left} ${mx(m.unit)}`, 'Stock left', low]].map(([v, l, red]) =>
        <div key={l}><p className={`mt-v ${red ? 'low' : ''}`}>{v}</p><p className="body-s">{tr(l)}</p></div>)}</div>{/* F15/R12 */}
      {m.each ? <div className="stack8"><p className="mt-h">{tr('Instructions')}</p><p className="mt-instr"><img src={`${A}icon-schedule-secondary-16.svg`} width="16" height="16" alt="" />{ne() ? `${mx(m.each)}${m.often ? `, ${mx(m.often)}` : ''} खानुहोस्` : `Take ${m.each}${m.often ? `, ${m.often.toLowerCase()}` : ''}`}</p></div> : null}
    </div>, { cta: <><button className="btn primary l" data-act="mt-restock"><img src={`${A}icon-add-white-24.svg`} width="24" height="24" alt="" />{tr('Add medicine')}</button>
      {btn(out ? 'None left to take' : 'I took a dose', 'mt-dose', { kind: 'secondary', size: 'l', disabled: out })}</> });
  },

  mtdose: () => {
    const m = med(), low = lowStock(m);
    return frame(m.title, <div className="inset stack24">
      <div className="mt-stock"><p className={`mt-n ${low ? 'low' : ''}`}>{m.left}</p><p className="lede">{ne() ? `${mx(m.unit)} बाँकी` : `${m.unit} left`}</p>{low ? <p className="mt-low">{tr('Running low — buy more soon')}</p> : null}</div>
      <div className="mt-rows">{[['How much you take', mx(m.each)], ['How often', mx(m.often)], ['Last taken', tr('Just now')], ['Added', m.since === 'Today' ? tr('Today') : ne() ? `${tr(m.since)}अघि` : `${m.since} ago`]]
        .map(([k, v], i) => <Fragment key={k}>{i > 0 && <div className="mt-sep" aria-hidden="true"></div>}<div className="mt-kv"><span>{tr(k)}</span><b>{v || '—'}</b></div></Fragment>)}</div>
    </div>, { cta: <p className="mt-done"><img src={`${A}icon-check-circle-success-20.svg`} width="20" height="20" alt="" />{tr('Dose logged')}</p> });
  },

  mtrestock: () => frame(ne() ? `${med().name || med().title} थप्नुहोस्` : `Restock ${med().name || med().title}`, <div className="inset">
      {mtLink(tr('Or tell the assistant how much you bought →'), 'mt-swap:mtvoice')}
      <p className="body-s">{tr("We've filled in what we already know — just update how much you've got.")}</p>
      {medForm2()}</div>, { cta: btn('Save medicine', 'med-save', { kind: 'secondary' }) }),

  // The phone's lock screen, not an app screen.
  mtpush: () => (
    <a href="#" className="screen push" data-act="push-open" aria-label={ne() ? 'Clinica सूचना: Paracetamol सकिनै लागेको छ। औषधि खोल्छ।' : 'Clinica notification: Paracetamol is almost out of stock. Opens the medicine.'}>
      <div className="p-time"><p className="p-clock">9:41</p><p className="p-date">{nd(`${new Date(2026, 8, 6).toLocaleDateString('en-US', { weekday: 'long' })}, 6 September`)}</p>{/* F20: weekday from the date */}</div>
      <div className="p-card">
        <div className="p-head"><span className="p-app"><img src={`${A}icon-medication-white-14.svg`} width="14" height="14" alt="" /></span><span>CLINICA</span><span className="p-now">{tr('now')}</span></div>
        <p className="p-title">{tr('Paracetamol is almost out of stock')}</p><p className="p-body">{tr('Only 6 tablets left. Restock before you run out.')}</p>
      </div>
    </a>),
});

// ---------- behaviour ----------
Object.assign(mount, {
  mtvoice: () => { if (S.mtListening) after(() => ACTIONS['mt-heard'](), 3000); }, // stand-in for speech: stops after a pause
});

Object.assign(ACTIONS, {
  'mt-open': i => { S.medI = +i; go('mtmed'); },
  'mt-new': () => { S.mform = {}; S.mErr = {}; go('mtadd'); },
  'mt-swap': arg => { S.mtListening = true; go(arg, { replace: true }); }, // typing and speaking are one step, either way
  'mt-voice': () => { S.mtListening = !S.mtListening; render(); },
  'mt-heard': () => { // the patient checks it before anything is saved; typed restock fields are kept
    S.mform = S.screen === 'mtvoice' && S.stack.at(-1) === 'mtmed' ? { ...S.mform, qty: HEARD.qty } : { ...HEARD };
    S.mErr = {}; S.mtListening = false;
    go('mtreview', { replace: true });
  },
  'mt-restock': () => { const m = med(); S.mform = { name: m.name, form: m.form, strength: m.strength, qty: '', each: m.each, often: m.often }; S.mErr = {}; go('mtrestock'); },
  'mt-dose': () => { const m = med(); m.left = Math.max(0, m.left - perDose(m)); toast('Dose logged.'); go('mtdose', { replace: true }); }, // W03
  'push-open': () => { S.medI = 0; openHealth('mtmed'); }, // through the Health lock
});

Object.assign(NUM, {
  mtlist: () => 'MT01', mtadd: () => 'MT02', mtvoice: () => 'MT03', mtreview: () => 'MT04', mtmed: () => 'MT05', mtdose: () => 'MT06',
  mtrestock: () => 'MT08', mtpush: () => 'MT09',
});
later(() => { // wraps care's Notification-centre number
  const NOTIFS_NUM = NUM.notifs;
  NUM.notifs = s => !s.healthEmpty && s.notifs.some(n => n.go.startsWith('med:')) ? 'MT07' : NOTIFS_NUM(s);
}, ORDER.meds);

export const MU = { unlocked: true }, MS = ['health', 'mtlist'], NO_CAP = 'Figma has no caption for this screen.';
FLOW.push(['Medicines — tracker', [
  ['MT01', 'Medicines', 'From Health → Medicines, or the low-stock banner on Home', `${NO_CAP} A stock ring per medicine: the arc is what's left since the last restock, red when it runs out within three days. Every row opens its medicine.`, () => ({ screen: 'mtlist', stack: ['health'], ...MU })],
  ['MT02', 'Add a medicine — manually', 'Add a medicine', `${NO_CAP} The same six fields everywhere a medicine is added or restocked. Speaking is one tap away, not a separate step.`, () => ({ screen: 'mtadd', stack: MS, ...MU })],
  ['MT03', 'Add a medicine — tell the assistant', 'Or tell the assistant instead →', `${NO_CAP} Listening starts at once. The prototype stands in for speech: it 'hears' both examples after 3 seconds, or when you tap one.`, () => ({ screen: 'mtvoice', stack: MS, ...MU })],
  ['MT04', 'Review what the assistant heard', 'After speaking', `${NO_CAP} Filled in from what was said, and every field stays editable. Nothing is saved until the patient saves it.`, () => ({ screen: 'mtreview', stack: MS, mform: { ...HEARD }, ...MU })],
  ['MT05', 'Medicine — Paracetamol', 'Taps a medicine', `${NO_CAP} The ring, the warning in words, and the schedule. 'Add medicine' restocks this one; 'I took a dose' logs it.`, () => ({ screen: 'mtmed', stack: MS, medI: 0, ...MU })],
  ['MT06', 'Medicine — dose logged', 'I took a dose', `${NO_CAP} The count goes down by one dose and says so. Back returns to the list.`, () => ({ screen: 'mtdose', stack: MS, medI: 0, meds: fresh().meds.map((m, i) => i ? m : { ...m, left: 5 }), ...MU })],
  ['MT07', 'Medicine alerts', 'From the bell on Home', `${NO_CAP} The Notification centre with medicine alerts. Each opens its medicine through the Health lock. As with lab reports (W10), the in-app centre names the medicine; the lock screen (NM03) never does — there it reads 'Time for your medicine'.`, () => ({ screen: 'notifs', stack: ['home'], notifs: MED_NOTIFS.map(n => ({ ...n })) })],
  ['MT08', 'Restock Paracetamol', "From 05 — 'Add medicine'", 'Same fields as adding fresh — but name, form, and strength are already known, so only the new count needs entering.', () => ({ screen: 'mtrestock', stack: [...MS, 'mtmed'], medI: 0, mform: { name: 'Paracetamol', form: 'Tablet', strength: '500 mg', qty: '', each: '1 tablet', often: 'Twice a day' }, ...MU })],
  ['MT09', 'Push notification — low stock', 'On the lock screen', 'What the OS notification looks like when stock runs low — tapping it opens the medicine directly (through the Health lock).', () => ({ screen: 'mtpush' })],
]]);
