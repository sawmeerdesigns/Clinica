// Clinica — Medicines tracker: stock rings, dose logging, restock, alerts.
// Figma: zw3saW6ot26E6gWH20K3ux, section 511:27999. Plugs into core.jsx and reuses health.jsx (S.meds, lowStock,
// field, saveMed, openHealth) and care.jsx (frame, notifRow).
import { Fragment } from 'react';
import { btn, homeInd, statusBar } from './app.jsx';
import { ask, say, src, words } from './ask.jsx';
import { bar, label, row, rows, tag, when } from './booking.jsx';
import { frame, notifRow } from './care.jsx';
import { A, ACTIONS, FLOW, NUM, ORDER, S, SCREENS, after, back, every, extraState, fresh, go, later, mount, render, sepJoin } from './core.jsx';
import { field, firstNum, lbl, list, lowStock, openHealth, saveMed } from './health.jsx';
import { checks, chip, clock, img, now } from './staff.jsx';

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
  return <span className="ring" style={{ width: s, height: s }} role="img" aria-label={`${Math.round(p * 100)}% of stock left${tone === 'error' ? ', running low' : ''}`}>
    <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`} aria-hidden="true"><circle cx={s / 2} cy={s / 2} r={r} fill="none" stroke="var(--border-secondary)" strokeWidth={w} />
      <circle cx={s / 2} cy={s / 2} r={r} fill="none" stroke={`var(--text-${tone})`} strokeWidth={w} strokeDasharray={`${p * c} ${c}`} transform={`rotate(-90 ${s / 2} ${s / 2})`} /></svg>
    <img src={`${A}icon-medication-${tone}-${big ? 44 : 22}.svg`} width={big ? 44 : 22} height={big ? 44 : 22} alt="" /></span>;
}
export const med = () => S.meds[S.medI];
export const perDose = m => firstNum(m.each) || 1;
export const mtLink = (label, act) => <button className="mt-link" data-act={act}>{label}</button>;
export const medForm2 = () => <form id="mf" noValidate className="fields" onSubmit={e => { e.preventDefault(); saveMed(); }}>{MED_FORM.map(f => field(...f))}</form>;

export const medRow2 = (m, i) => {
  const low = lowStock(m);
  return <button className="mt-row" data-act={`mt-open:${i}`}>{ring(m)}
    <span className="mt-t"><span className="mt-name"><span>{m.title}</span>{low ? tag('Refill', 'error sm') : null}</span>
      {m.generic ? <span className="body-s">{m.generic}</span> : null}
      <span className={`mt-dose ${low ? 'low' : ''}`}><img src={`${A}icon-schedule-tertiary-13.svg`} width="13" height="13" alt="" />{m.sub}</span>
      <span className={`mt-left ${low ? 'low' : ''}`}>{m.left} {m.unit} left</span></span></button>;
};

// ---------- screens ----------
Object.assign(SCREENS, {
  mtlist: () => frame('Medicines', <div className="stack16">
      {S.meds.some(lowStock) ? <div className="mt-banner" role="status"><p className="mt-bt"><img src={`${A}icon-warning-18.svg`} width="18" height="18" alt="" />Your action is required</p>
        <p>Some of your medicines are going out of stock soon. Refill before you run out.</p></div> : null}
      <div className="stack4"><div className="inset">{lbl('Your medicines')}</div>
        <div className="mt-list">{sepJoin(S.meds.map(medRow2))}</div></div></div>,
    { cta: <button className="btn secondary" data-act="mt-new"><img src={`${A}icon-add-24.svg`} width="24" height="24" alt="" />Add a medicine</button> }),

  mtadd: () => frame('Add a medicine', <div className="inset">{mtLink('Or tell the assistant instead →', 'mt-swap:mtvoice')}{medForm2()}</div>,
    { cta: btn('Save medicine', 'med-save', { kind: 'secondary' }) }),

  // Chat-shaped app bar: the back label names where Back goes.
  mtvoice: () => (
    <div className="screen">
      {statusBar()}
      <div className="appbar chat hug">
        <div className="side"><a href="#" className="back-l" data-act="back"><span className="icon-btn"><img src={`${A}icon-back.svg`} width="24" height="24" alt="" /></span>Medicines</a></div>
        <div className="c-title">Add a medicine</div><div className="side end"><div className="slot"></div></div>
      </div>
      <div className="body g20">
        <div className="inset"><div className="greet2"><p className="g1">Tell me about your medicine</p><p className="lede">Say the name, strength, how much you have, and how often you take it.</p></div>
          {mtLink('Or type it in instead →', 'mt-swap:mtadd')}</div>
        <div className="inset stack8">{lbl('For example, say')}
          <div className="chips">{[['icon-medication-action-18.svg', '“I bought Paracetamol 500 mg, 20 tablets”'], ['icon-schedule-action-18.svg', '“I take one twice a day”']].map(([i, t]) =>
            <button key={i} className="chip" data-act="mt-heard"><img src={`${A}${i}`} width="18" height="18" alt="" />{t}</button>)}</div></div>
      </div>
      <div className="ask-input">
        <div className="ib-row">
          {S.mtListening ? <div className="ib-field" role="status">Listening…</div> : <div className="ib-field idle">Tap the mic to speak</div>}
          <button className={`ib-btn ${S.mtListening ? 'voice' : 'ghost'}`} data-act="mt-voice" aria-pressed={S.mtListening} aria-label={S.mtListening ? 'Stop listening' : 'Speak'}>
            <img src={`${A}icon-mic${S.mtListening ? '-white' : ''}-24.svg`} width="24" height="24" alt="" /></button>
          <button className="ib-btn" disabled aria-label="Send"><img src={`${A}icon-send-disabled-24.svg`} width="24" height="24" alt="" /></button>
        </div>
        <p className="body-s tertiary" style={{ textAlign: 'center' }}>This fills in your medicine details — you'll review before it saves.</p>
      </div>
      {homeInd()}
    </div>),

  mtreview: () => frame('Review your medicine', <div className="inset">
      <div className="mt-ai"><img src={`${A}icon-check-circle-action-18.svg`} width="18" height="18" alt="" /><p>Filled in from what you said — check it's right, then save.</p></div>
      {medForm2()}</div>, { cta: btn('Save medicine', 'med-save', { kind: 'secondary' }) }),

  mtmed: () => {
    const m = med(), low = lowStock(m), out = m.left < perDose(m);
    return frame(m.title, <div className="inset stack24">
      <div className="mt-hero">{ring(m, true)}</div>
      {low ? <div className="mt-alert" role="status"><p className="mt-at"><img src={`${A}icon-warning-error-18.svg`} width="18" height="18" alt="" />{m.left ? `Only ${m.left} ${m.unit} remain` : `No ${m.unit} left`}</p>
        <p>Please restock soon — missing doses can affect your recovery.</p></div> : null}
      <div className="mt-stats">{[[m.since, 'Tracking since'], [m.sched, 'Schedule'], [`${m.left} ${m.unit}`, 'Stock left', low]].map(([v, l, red]) =>
        <div key={l}><p className={`mt-v ${red ? 'low' : ''}`}>{v}</p><p className="body-s">{l}</p></div>)}</div>
      {m.each ? <div className="stack8"><p className="mt-h">Instructions</p><p className="mt-instr"><img src={`${A}icon-schedule-secondary-16.svg`} width="16" height="16" alt="" />Take {m.each}{m.often ? `, ${m.often.toLowerCase()}` : ''}</p></div> : null}
    </div>, { cta: <><button className="btn primary l" data-act="mt-restock"><img src={`${A}icon-add-white-24.svg`} width="24" height="24" alt="" />Add medicine</button>
      {btn(out ? 'None left to take' : 'I took a dose', 'mt-dose', { kind: 'secondary', size: 'l', disabled: out })}</> });
  },

  mtdose: () => {
    const m = med(), low = lowStock(m);
    return frame(m.title, <div className="inset stack24">
      <div className="mt-stock"><p className={`mt-n ${low ? 'low' : ''}`}>{m.left}</p><p className="lede">{m.unit} left</p>{low ? <p className="mt-low">Running low — buy more soon</p> : null}</div>
      <div className="mt-rows">{[['How much you take', m.each], ['How often', m.often], ['Last taken', 'Just now'], ['Added', m.since === 'Today' ? 'Today' : `${m.since} ago`]]
        .map(([k, v], i) => <Fragment key={k}>{i > 0 && <div className="mt-sep" aria-hidden="true"></div>}<div className="mt-kv"><span>{k}</span><b>{v || '—'}</b></div></Fragment>)}</div>
    </div>, { cta: <p className="mt-done" role="status"><img src={`${A}icon-check-circle-success-20.svg`} width="20" height="20" alt="" />Dose logged</p> });
  },

  mtrestock: () => frame(`Restock ${med().name || med().title}`, <div className="inset">
      {mtLink('Or tell the assistant how much you bought →', 'mt-swap:mtvoice')}
      <p className="body-s">We've filled in what we already know — just update how much you've got.</p>
      {medForm2()}</div>, { cta: btn('Save medicine', 'med-save', { kind: 'secondary' }) }),

  // The phone's lock screen, not an app screen.
  mtpush: () => (
    <a href="#" className="screen push" data-act="push-open" aria-label="Clinica notification: Paracetamol is almost out of stock. Opens the medicine.">
      <div className="p-time"><p className="p-clock">9:41</p><p className="p-date">Saturday, 6 September</p></div>
      <div className="p-card">
        <div className="p-head"><span className="p-app"><img src={`${A}icon-medication-white-14.svg`} width="14" height="14" alt="" /></span><span>CLINICA</span><span className="p-now">now</span></div>
        <p className="p-title">Paracetamol is almost out of stock</p><p className="p-body">Only 6 tablets left. Restock before you run out.</p>
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
  'mt-dose': () => { const m = med(); m.left = Math.max(0, m.left - perDose(m)); go('mtdose', { replace: true }); },
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
  ['MT07', 'Medicine alerts', 'From the bell on Home', `${NO_CAP} The Notification centre with medicine alerts. Each opens its medicine through the Health lock. Figma names the medicines in the titles, which the Content/Notification rule forbids on a shared phone — kept as designed, flagged.`, () => ({ screen: 'notifs', stack: ['home'], notifs: MED_NOTIFS.map(n => ({ ...n })) })],
  ['MT08', 'Restock Paracetamol', "From 05 — 'Add medicine'", 'Same fields as adding fresh — but name, form, and strength are already known, so only the new count needs entering.', () => ({ screen: 'mtrestock', stack: [...MS, 'mtmed'], medI: 0, mform: { name: 'Paracetamol', form: 'Tablet', strength: '500 mg', qty: '', each: '1 tablet', often: 'Twice a day' }, ...MU })],
  ['MT09', 'Push notification — low stock', 'On the lock screen', 'What the OS notification looks like when stock runs low — tapping it opens the medicine directly (through the Health lock).', () => ({ screen: 'mtpush' })],
]]);
