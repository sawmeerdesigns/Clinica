// Clinica for City Hospital's care team — the doctor's app (Dr. Priya Sharma).
// Figma: zw3saW6ot26E6gWH20K3ux, section 551:19193. It shares one world with the patient app: Anisha's queue state is
// her visit day, the note written here is what she reads in Health, and a released report is what she sees.
import { Fragment } from 'react';
import { AD_SHORT, btn, empty, homeInd, listItem, maskDob, pad, parseDob, pickTab, range, start, statusBar, support } from './app.jsx';
import { acts, ask, src, words } from './ask.jsx';
import { DOCTORS, backTo, bar, iconBtn, initials, label, rel, row, rows, sk, tag, when } from './booking.jsx';
import { csheet, notice, setting, signoutSheet, usePerson } from './care.jsx';
import { A, ACTIONS, FLOW, NUM, ORDER, OVERLAY, S, SCREENS, after, back, every, extraState, go, later, mount, ne, onPhone, paint, render, sepJoin, toast, toastClear, tr } from './core.jsx';
import { LABS, RX, VISITS, centred, chev, docCard, field, lbl, lead, list, medRow } from './health.jsx';
import { med, ring } from './meds.jsx';
import { radioRow } from './more.jsx';
import { cell, chip, counts, filtered, img, now, patients, pid, results, stHome } from './staff.jsx';
import { DR_PATIENTS, FU_DAY, TODAY, dayAt, dayLabel, mdOf } from './data.js';

// Dr. Sharma's queue today is part of the hospital's one arrivals list (data.js, F07/R05/T06/V07).
export { DR_PATIENTS };
export const DR_HISTORY = { as: [['Aug 12, 2026', 'Dr. Ramesh Shrestha · Ear infection'], ['Jul 3, 2026', 'Dr. Anita Joshi · General medicine'], ['Jun 20, 2026', 'Dr. Anita Joshi · Walk-in']] };
// The note and prescription as written — the exact wording the patient later reads in Health.
export let DR_DRAFTS; // reads Health's visit and prescription (health.jsx), so it waits for every module
later(() => { DR_DRAFTS = {
  as: { note: VISITS.aug28.words, meds: RX.map(({ name, for: f, how, dur }) => ({ name, for: f, how, dur })), follow: '2w' },
  nt: { note: 'A common cold. Rest, stay warm, and drink warm fluids for the throat. Should clear on its own within a week.', follow: 'none',
    meds: [{ name: 'Cough syrup', for: 'For the cough and sore throat', how: '10 ml, 3 times a day', dur: 'For 5 days' },
      { name: 'Paracetamol 500 mg', for: 'For mild fever and body ache', how: '1 tablet 3 times a day, after food', dur: 'For 5 days' }] },
}; }, ORDER.doctor);
export const DR_REPORTS = {
  // T10/W06: each row is [name, value, reference range as shown, low, high] — fictional but plausible adult ranges.
  cbc: { pid: 'as', test: 'CBC blood test', date: 'Aug 28', first: 'Anisha', rows: [['Haemoglobin', '13.2 g/dL', '12.0–15.5 g/dL', 12, 15.5], ['White cell count', '6,200/µL', '4,000–11,000/µL', 4000, 11000],
    ['Platelets', '250,000/µL', '150,000–400,000/µL', 150000, 400000]],
    normal: 'Everything in your blood count is normal. No follow-up needed.' },
  lipid: { pid: 'kg', test: 'Lipid panel', date: 'Aug 25', first: 'Kabita', rows: [['Total cholesterol', '185 mg/dL', 'Below 200 mg/dL', null, 199], ['LDL', '110 mg/dL', 'Below 130 mg/dL', null, 129],
    ['HDL', '52 mg/dL', '50 mg/dL or more', 50, null], ['Triglycerides', '130 mg/dL', 'Below 150 mg/dL', null, 149]],
    normal: 'Your cholesterol levels are all within a healthy range. Keep up the good work.' },
};
export const DR_FOLLOW = 'Please book a follow-up so we can discuss this.';
// W06/F23: a report opens undecided, with an empty comment; the report's own text is only a suggestion.
export const drRelNew = () => ({ choice: null, comment: '', edited: false });
// F01/R01: the suggestion is worked out from the report on screen, never carried over from another one.
export const drSuggest = (k = S.drRep) => S.drRel.choice === 'follow' ? DR_FOLLOW : S.drRel.choice ? DR_REPORTS[k].normal : '';
export const drWords = (k = S.drRep) => S.drRel.comment.trim() || drSuggest(k); // what the patient will read
// The comment box and Release button, shared by phone and desktop. Release waits for a decision (W06/F23).
export const drComment = (r, k) => <div className="field-wrap"><label className="dr-label" htmlFor="d-comment">Comment for {r.first}</label>
  <div className="field textarea"><textarea id="d-comment" value={S.drRel.comment} placeholder={S.drRel.choice ? `Suggested: ${drSuggest(k)}` : 'Choose what the patient should see first'}
    onChange={e => { S.drRel.comment = e.target.value; S.drRel.edited = true; paint(); }} /></div>
  {S.drRel.choice && !S.drRel.comment.trim() ? <p className="dr-body tertiary">Leave it blank to send the suggested text.</p> : null}
  {S.drRel.choice ? drPreview(r) : null}</div>;
// Run 6 Y25: what the patient's report page will show once released, as she'll see it.
export const drPreview = r => <div className="stack8 dr-preview">{lbl(`What ${r.first} will see`)}<div className="card neutral stack8">
  <p className="item-title">{r.test}</p><p className="note-body">{drWords()}</p>
  {S.drRel.choice === 'follow' ? <p className="body-s"><b>Dr. Sharma asked to see you.</b> With a Book follow-up button.</p> : null}</div></div>;

export const EXTRA_STATE_DR = () => ({
  app: 'patient', saved: {}, drSigned: false, drErr: false, drId: '', drPw: '', drNoPatients: false,
  drq: { bt: 'done', sm: 'done', di: 'done', kg: 'done', rb: 'done', nt: 'with', sk: 'notarrived' },
  dp: 'as', drDraft: null, drPending: ['cbc', 'lipid'], drRep: 'cbc', drRel: null, released: {}, drNotes: {}, fuAdvice: null,
  drSet: { reports: true, checkin: true, schedule: false }, drPwErr: '', drPw0: '', drPw1: '', drPw2: '',
  drOffline: false, drFilt: 'all', drMenu: null, drHistDoc: 'all', drHv: 0, drVisits: {}, drKept: {}, drMed: null, fuDate: '', drOut: [], // drOut: released today (F24/R20/T11/W07)
});
extraState(EXTRA_STATE_DR, ORDER.doctor);

// The doctor's day starts with Anisha checked in, Nabin with the doctor, and her follow-up not yet advised.
export const DOCTOR_START = () => ({ app: 'doctor', screen: 'dsignin', signedIn: true, visitDay: 'checkedin', followup: null });

// ---------- shared world ----------
// Anisha's place in the queue is her own visit day on the patient side.
export function drStatus(id) {
  if (id !== 'as') return S.drq[id];
  return ({ checkedin: 'waiting', turn: 'waiting', with: 'with', done: 'done' })[S.visitDay] || 'notarrived';
}
export const drToday = () => { drExtra(); return Object.keys(DR_PATIENTS).filter(id => id === 'as' ? !S.careEmpty && S.appt.day === 0 && S.appt.doc === 'ps' : id in S.drq && (!DR_PATIENTS[id].extra || drExtraKeys.has(id))); }; // walk-ins join via staff.jsx; Run 6 Y02: her visit with Dr. Sharma
// Run 6 follow-on: Dr. Sharma's other visits booked in the app for today — a second one of Anisha's, or one for her father — join the queue as booked, not arrived.
// Worked out from the patient records each time, so a cancel or a reload needs nothing extra. ponytail: their notes don't reach the patient app; only the 4:30 visit does.
let drExtraKeys = new Set();
const RAMESH_DR = { name: 'Ramesh Sharma', ini: 'RS', info: 'Male · 65 · CH-0954', hist: '' };
function drExtra() {
  const rec = n => S.fullName === n ? S : S.people?.[n], a = rec('Anisha Sharma'), r = rec('Ramesh Sharma');
  const today = (p, all) => p ? [...(all && !p.careEmpty && p.appt ? [p.appt] : []), ...(p.more || [])].filter(v => v.day === 0 && v.doc === 'ps') : [];
  drExtraKeys = new Set([...today(a, false).map(v => [v, DR_PATIENTS.as, DR_HISTORY.as]), ...today(r, true).map(v => [v, RAMESH_DR, []])].map(([v, p, h]) => {
    const k = `${p.ini.toLowerCase()}-${v.time.replace(/\D/g, '')}`, why = v.reason || 'Booked in the app';
    DR_PATIENTS[k] ||= { name: p.name, ini: p.ini, info: p.info, reason: why, short: why, time: v.time, hist: p.hist, extra: true };
    DR_HISTORY[k] ||= h; if (!(k in S.drq)) S.drq[k] = 'notarrived';
    return k; }));
}
export const drTime = id => id === 'as' ? S.appt.time : DR_PATIENTS[id].time;
export const drBusy = () => drToday().find(id => drStatus(id) === 'with' && id !== S.dp); // Run 6 Y04: someone else still with the doctor
export const DR_TAG = { done: ['Completed', 'neutral'], with: ['With doctor', 'success'], waiting: ['Waiting', 'warn'], notarrived: ['Not arrived', 'error'] };
export const drPid = id => DR_PATIENTS[id].info.split(' · ').pop(); // the clinic's patient ID, the last part of info

// What the patient app shows for a report once the doctor has released it.
export function labOf(k) {
  const l = LABS[k], r = S.released?.[k];
  return r ? { ...l, reviewing: false, tag: r.follow ? ['Needs follow-up', 'warn'] : ['Ready', 'success'], words: r.words, by: 'Reviewed by Dr. Priya Sharma on Aug 28',
    date: 'Aug 28, 2026', pages: 1, follow: r.follow } : l;
}
// Phase 8: the same test done more than once (Anisha's HbA1c, Jun 20 and Aug 24): released results with a value, oldest first.
export const labSeries = k => { const t = LABS[k]?.title;
  return Object.keys(LABS).filter(x => LABS[x].title === t && LABS[x].value && !labOf(x).reviewing).sort((a, b) => new Date(LABS[a].date) - new Date(LABS[b].date)); };
// Phase 8: previous → latest, with dates and direction in words, so it never relies on the line or its colour. Doctor, desk and patient share it.
export function labTrend(k) {
  const s = labSeries(k); if (s.length < 2) return null;
  const v = s.map(x => parseFloat(LABS[x].value)), lo = Math.min(...v), hi = Math.max(...v), [a, b] = s.slice(-2).map(x => LABS[x]);
  const d = parseFloat(b.value) - parseFloat(a.value), dir = d > 0 ? 'Higher in the latest test' : d < 0 ? 'Lower in the latest test' : 'No change in the latest test';
  const day = l => tr(l.date.split(',')[0]), pts = v.map((y, i) => [4 + i * 112 / (v.length - 1), hi === lo ? 16 : 28 - (y - lo) / (hi - lo) * 24]);
  return <div className="stack8">{lbl('Over time')}<div className="card neutral">
    <svg width="120" height="32" viewBox="0 0 120 32" aria-hidden="true" style={{ flex: 'none' }}><polyline points={pts.join(' ')} fill="none" stroke="var(--border-strong)" strokeWidth="2" />
      {pts.map(([x, y], i) => <circle key={i} cx={x} cy={y} r="3.5" fill={i === pts.length - 1 ? 'var(--text-action)' : 'var(--text-secondary)'} />)}</svg>
    <div className="text"><p className="h-s">{a.value} → {b.value} {d > 0 ? '↑' : d < 0 ? '↓' : '='}</p>
      <p className="body-s">{ne() ? `${day(a)} → ${day(b)} · ${tr(dir)}` : `${day(a)} → ${day(b)} · ${dir}`}</p></div></div></div>;
}

// ---------- pieces ----------
export const drChev = <img src={`${A}icon-chevron-right-dark.svg`} width="20" height="20" alt="" />;
export const drBar = (title, back = false) => <div className="appbar dr">{back ? iconBtn('icon-back.svg', 'Back', 'back') : null}{title ? <h1 className="title">{title}</h1> : <div className="title"></div>}<div className="slot"></div></div>; // W13: a titled bar is the screen's heading
export function drNav(active) {
  return <div className="bottom"><nav className="bnav" aria-label="Main">{[['Queue', 'nav-queue', 'd-tab:dqueue'], ['Reports', 'nav-reports', 'd-tab:dreports'], ['Profile', 'nav-profile', 'd-tab:dprofile']]
    .map(([l, i, a]) => <a key={l} href="#" data-act={a} aria-current={l === active ? 'page' : undefined}><span><img src={`${A}${i}${l === active ? '-active' : ''}.svg`} width="24" height="24" alt="" />{l === 'Reports' ? drBadge() : null}</span>{l}</a>)}
  </nav>{homeInd()}</div>;
}
// R30: how many reports are waiting, on the Reports nav item (phone and desktop).
export const drBadge = () => S.drPending.length ? <span className="nbadge">{S.drPending.length}<span className="vh"> waiting</span></span> : null;
export const drScreen = (body, { nav = '', bar = null, cta = null } = {}) => <div className="screen dr">{statusBar()}{bar}{body}{cta}{nav ? drNav(nav) : homeInd()}</div>;
export const drRow = id => {
  const p = DR_PATIENTS[id], st = drStatus(id), [t, tone] = DR_TAG[st], past = st === 'done';
  return <button className="list-item" data-act={`d-patient:${id}`}><span className="avatar" aria-hidden="true">{p.ini}</span>
    <span className="dq-t"><span className={`h-s ${past ? 'past' : ''}`}>{p.name}</span><span className="dq-id">{drPid(id)}</span><span className="dq-r">{p.short}</span>
      <span className="dq-m"><span className={past ? 'past' : 'now'}>{drTime(id)}</span>{tag(t, `${tone} s12`)}</span></span>{drChev}</button>;
};
export const drHead = (p, size = 'l', H = 'p') => <div className="dr-head"><span className={`avatar ${size === 'l' ? 'l' : ''}`} aria-hidden="true">{p.ini}</span><div>
  <H className={size === 'l' ? 'dr-h1' : 'h-s'}>{p.name}</H><p className="dr-sub">{p.info}</p></div></div>;
export const drMed = m => <div className="card dr-med"><p className="dm1">{m.name}</p><p className="dm2">{m.for}</p><p className="dm3">{m.how}</p><p className="dm4">{m.dur}</p></div>;
export const drMeds = meds => meds.map((m, i) => <Fragment key={i}>{drMed(m)}</Fragment>);
// F04/R02/T01/V01: on the visit being written, every medicine can be edited or removed.
export const drMedEdit = (m, i) => <div key={i} className="card dr-med"><p className="dm1">{m.name}</p>{m.for ? <p className="dm2">{m.for}</p> : null}<p className="dm3">{m.how}</p>
  <p className="dm4">{m.dur}{m.qty ? ` · ${m.qty}` : ''}</p>
  <div className="dm-acts"><button className="dr-link" data-act={`d-medit:${i}`} aria-label={`Edit ${m.name}`}>Edit</button><button className="dr-link" data-act={`d-mdel:${i}`} aria-label={`Remove ${m.name}`}>Remove</button></div></div>;
export const drRadio = (name, opts, cur, act) => <div className="stack4" role="radiogroup" aria-label={name}><p className="dr-label" style={{ color: 'var(--text-primary)' }}>{name}</p>
  <div className="radio-inline">{opts.map(([v, l]) => <Fragment key={v}>{radioRow(cur === v, l, `${act}:${v}`)}</Fragment>)}</div></div>;
// Each field keeps its value in S: d-id → drId, d-pw… → drPw…, any other id (staff.jsx's st-pw) under the id itself.
export const drField = (id, label, ph, err = '') => {
  const k = id === 'd-id' ? 'drId' : id.startsWith('d-pw') ? id.replace('d-pw', 'drPw') : id;
  return <div className="field-wrap"><label className="label" htmlFor={id}>{label}</label>
    <div className={`field ${err ? 'err' : ''}`}><input id={id} type={/pw/.test(id) ? 'password' : 'text'} placeholder={ph} value={S[k] ?? ''}
      onChange={e => { S[k] = e.target.value; paint(); }}
      onKeyDown={id === 'd-pw' && S.screen === 'dsignin' ? e => { if (e.key === 'Enter') ACTIONS['d-signin'](); } : undefined} /></div>{err ? support(err, 'err') : null}</div>;
};
// The raw lab values, one row each.
// T10/W06: the reference range sits under each name, and the flag comes from the value against that range.
export const drFlag = (v, lo, hi) => { const x = parseFloat(v.replace(/,/g, '')); return lo != null && x < lo ? 'Low' : hi != null && x > hi ? 'High' : 'Normal'; };
export const drValues = rows => <div className="dr-values">{rows.map(([n, v, range, lo, hi], i) => { const f = drFlag(v, lo, hi);
  return <Fragment key={n}>{i > 0 && <div className="mt-sep" aria-hidden="true" />}
  <div className="dv-row"><span className="dv-n">{n}<span className="dv-r">Range {range}</span></span><span className="dv-v"><b>{v}</b><span className={`dv-f ${f === 'Normal' ? '' : 'out'}`}>{f}</span></span></div></Fragment>; })}</div>;
export const drSettings = () => sepJoin([['reports', 'New reports', 'When a lab result needs your review'], ['checkin', 'Patients checking in', 'When someone on your list arrives'], ['schedule', 'Schedule changes', 'Cancellations and new bookings']]
  .map(([k, t, b]) => setting(t, b, S.drSet[k], `d-set:${k}`)));
export const drPwClear = () => Object.assign(S, { drPw0: '', drPw1: '', drPw2: '' }); // a full re-render used to empty the password fields

// A single-choice filter chip, in the staff app's style; a click anywhere else closes it.
export const drChip = (key, name, opts, cur, act) => {
  const sel = opts.find(o => o[0] === cur) || opts[0], on = sel !== opts[0];
  return <div className="st-chips"><div className="st-dd-wrap"><button className={`st-chip ${on ? 'on' : ''}`} data-act={`d-menu:${key}`} aria-haspopup="true" aria-expanded={S.drMenu === key}>{name}: {sel[1]}
    <img src={`${A}icon-chevron-down-${on ? 'action' : 'secondary'}-14.svg`} width="14" height="14" alt="" /></button>
    {S.drMenu === key ? <div className="st-dd" role="menu">{opts.map(([v, l]) => <button key={v} className="st-opt r" role="menuitemradio" aria-checked={sel[0] === v} data-act={`${act}:${v}`}><span>{l}</span><span className="ring"></span></button>)}</div> : null}</div></div>;
};
// Status filter: only the statuses someone has today, so it never comes up empty. A status that empties out falls back to All.
export const drStatusOpts = ids => [['all', 'All'], ...['done', 'with', 'waiting', 'notarrived'].filter(st => ids.some(id => drStatus(id) === st)).map(st => [st, DR_TAG[st][0]])];
export const drShown = ids => drStatusOpts(ids).some(o => o[0] === S.drFilt) && S.drFilt !== 'all' ? ids.filter(id => drStatus(id) === S.drFilt) : ids;
// The queue can't update offline: the progress stays (it's what was last loaded), the list doesn't.
export const drOffline = () => empty('icon-wifi-off-28.svg', "You're offline", "Today's queue can't update right now. Reconnect to see new check-ins.", btn('Try again', 'd-retry', { size: 'l' }));

// Visit history: the doctor's own visits in full, other doctors' only as date, department and reason.
export const drVisits = id => {
  const p = DR_PATIENTS[id], past = (DR_HISTORY[id] || p.hist.split(', ').map(d => [`${d}, 2026`, 'Dr. Priya Sharma · General medicine']))
    .map(([date, s]) => { const [doc, reason] = s.split(' · '); return { date, doc, reason, own: doc === 'Dr. Priya Sharma' }; });
  const all = S.drVisits[id] ? [{ date: 'Aug 28, 2026', doc: 'Dr. Priya Sharma', reason: p.short, own: true, today: true }, ...past] : past; // today, once completed
  return all.map((v, i) => ({ ...v, i }));
};
export const drDocOpts = vs => [['all', 'All'], ...[...new Set(vs.map(v => v.doc))].map(d => [d, d])];
export const drVisitList = id => {
  const vs = drVisits(id), opts = drDocOpts(vs), shown = opts.some(o => o[0] === S.drHistDoc) && S.drHistDoc !== 'all' ? vs.filter(v => v.doc === S.drHistDoc) : vs;
  return <>{drChip('doc', 'Doctor', opts, S.drHistDoc, 'd-hdoc')}
    <div className="mt-list">{sepJoin(shown.map(v => // T25: every visit opens; the tag is the doctor's wording, not the patient's "Your visit"
      <button className="list-item" data-act={`d-hv:${v.i}`}>{lead('lt-history.svg')}<span className="text"><span className="item-title">{v.date}</span><span className="body-s">{`${v.doc} · ${v.reason}`}</span>
        {tag(v.own ? 'Seen by you' : 'Other doctor', `${v.own ? 'success' : 'info'} s12`)}</span>{chev}</button>))}</div>
    {drLabs(id).length ? <><p className="dr-label">Lab results</p><div className="mt-list">{sepJoin(drLabs(id).map(l => // T25: her lab results, each opening the report
      <button className="list-item" data-act={`d-lab:${l.k}`}>{lead('lt-lab.svg')}<span className="text"><span className="item-title">{l.title}</span><span className="body-s">{l.sub}{LABS[l.k]?.value && labSeries(l.k).at(-1) !== l.k ? ` · ${LABS[l.k].value}` : ''}</span>{/* Run 6 Y26: an earlier result shows its own value, not the trend */}
        {labSeries(l.k).length > 1 && labSeries(l.k).at(-1) === l.k ? <span className="body-s">{`${labSeries(l.k).map(x => LABS[x].value).join(' → ')}, ${labSeries(l.k).map(x => LABS[x].date.split(',')[0]).join(' → ')}`}</span> : null}{/* Phase 8: the trend, in the list too */}
        {(f => tag(l.pending ? 'Needs your review' : f ? 'Follow-up asked' : 'Released', `${l.pending ? 'warn' : f ? 'warn' : 'neutral'} s12`))(l.follow || S.drOut.find(o => o.k === l.k && !o.back)?.follow)}</span>{chev}</button>))}</div></> : null}</>;
};
// T25: a patient's lab results for the doctor: Anisha's from Health (labOf follows a release), anyone else's from the reports waiting here.
export const drLabs = id => (id === 'as' ? Object.keys(LABS).map(k => ({ k, ...labOf(k) }))
  : Object.entries(DR_REPORTS).filter(([, r]) => r.pid === id).map(([k, r]) => ({ k, title: r.test, sub: `${r.date}, City Hospital lab`, words: S.released[k]?.words,
    by: S.released[k] ? 'Reviewed by Dr. Priya Sharma on Aug 28' : '' })))
  .map(l => ({ ...l, pending: S.drPending.includes(l.k) }));
// T25: one result, read-only: its values when the lab sent them here, who reviewed it, and what the patient was told.
export const drLabView = (id, k) => { const l = drLabs(id).find(x => x.k === k), r = DR_REPORTS[k];
  return <><p className="dr-body">{l.sub}{l.by ? ` · ${l.by}` : ''}</p>
    {r ? <div className="stack6"><p className="dr-label">Result</p>{drValues(r.rows)}</div> : l.value ? <div className="stack6"><p className="dr-label">Result</p><p className="dr-body"><b>{l.value}</b></p></div>
      : <p className="dr-body tertiary">The values are in the lab's report file.</p>}
    {labTrend(k)}{/* Phase 8 */}
    {LABS[k]?.range ? <div className="stack6"><p className="dr-label">Reference range</p><p className="dr-body">{LABS[k].range}</p></div> : null}{/* Run 7 */}
    {l.words ? <div className="stack8">{lbl('What the patient was told')}<p className="note-body">{l.words}</p></div> : null}</>; };
export const drShort = dmy => { const p = parseDob(dmy); return p ? `${AD_SHORT[p.m]} ${p.d}` : ''; }; // '18 / 09 / 2026' → 'Sep 18'
export const drFollowLine = (f, date) => f === '2w' ? ['Follow-up in 2 weeks', `Around ${dayLabel(FU_DAY)}.`] : date ? [`Follow-up on ${drShort(date)}`, ''] : ['Follow-up needed', ''];
export const drOwnVisit = id => {
  const p = DR_PATIENTS[id], v = S.drVisits[id], reps = Object.values(DR_REPORTS).filter(r => r.pid === id && r.date === 'Aug 28');
  return <>
    <div className="stack8">{lbl("Doctor's note")}<p className="note-body">{v.note}</p></div>
    {reps.length ? <div className="stack8">{lbl('Reports')}<div className="dr-reps">{reps.map(r => <div key={r.test} className="dr-rep">
      <p className="item-title">{r.test}</p><p className="body-s">City Hospital lab · {S.drPending.includes(Object.keys(DR_REPORTS).find(k => DR_REPORTS[k] === r)) ? 'needs review' : 'reviewed'}</p></div>)}</div></div> : null}
    {v.meds.length ? <div className="stack8">{lbl('Prescribed')}<div className="mt-list">{sepJoin(v.meds.map(m => medRow(m)))}</div></div> : null}
    {v.follow !== 'none' ? <div className="stack8">{lbl('Next step')}{(([t, b]) => <div className="card notice"><div className="text"><p className="h-s">{t}</p>{b ? <p className="body-s">{b}</p> : null}</div></div>)(drFollowLine(v.follow, v.followDate))}</div> : null}</>;
};
export const drOtherVisit = (id, v) => {
  const dept = Object.values(DOCTORS).find(d => d.name === v.doc)?.spec || 'General medicine';
  return <div className="card neutral appt"><span className="avatar l" aria-hidden="true">{initials(v.doc.replace('Dr. ', ''))}</span>
    <span className="appt-t"><span className="h-s">{v.doc}</span><span className="when">{v.date}</span><span className="where">{dept}</span><span className="body-s tertiary">{v.reason}</span></span></div>;
};

// A date field: type it, or pick it on the AD/BS wheels. Optional, and only dates after today (Aug 28) count.
export const DR_TODAY = TODAY; // the demo's one today (data.js)
export const drDateErr = v => { if (!v) return ''; const p = parseDob(v); return !p ? 'Enter a real date, as DD / MM / YYYY.' : new Date(p.y, p.m, p.d) <= DR_TODAY ? 'Choose a date after today.' : ''; };
export const drDate = (id, label, obj, k, pick, hint = '') => <div className="field-wrap"><label className="label" htmlFor={id}>{label}</label>
  <div className={`field ${obj[`${k}Err`] ? 'err' : ''}`}><input id={id} placeholder="DD / MM / YYYY" value={obj[k] || ''}
    onChange={e => { const v = e.target.value; obj[k] = /[a-z]/i.test(v) ? v : maskDob(v); obj[`${k}Err`] = ''; paint(); }} // Run 6 Y13: "Nov 28, 2026" is kept as typed…
    onBlur={() => { const t = /[a-z]/i.test(obj[k] || '') && new Date(obj[k]); // …and becomes 28 / 11 / 2026 on leaving the field
      if (t && !isNaN(t)) obj[k] = `${pad(t.getDate())} / ${pad(t.getMonth() + 1)} / ${t.getFullYear()}`;
      obj[`${k}Err`] = drDateErr(obj[k]); paint(); }} />
    <button type="button" className="cal-btn" data-act={`d-pick:${pick}`} aria-label={`Choose ${label.toLowerCase()}`}><img src={`${A}icon-calendar.svg`} width="20" height="20" alt="" /></button></div>
  {obj[`${k}Err`] ? support(obj[`${k}Err`], 'err') : hint ? support(hint) : null}</div>;

// Run 6 Y03: long-term medicines too. A length in days, and the end it implies (today + that long); an End date has to agree with it.
export const DR_LONG = { '3 days': 3, '5 days': 5, '7 days': 7, '14 days': 14, '1 month': 31, '3 months': 92, Ongoing: 0 }; // months from Aug 28
const drDays = dmy => { const p = parseDob(dmy); return Math.round((new Date(p.y, p.m, p.d) - DR_TODAY) / 864e5); };
const drFits = (l, days) => Math.abs(days - DR_LONG[l]) <= Math.max(1, Math.round(DR_LONG[l] / 30)); // a day either side; 3 months, three
// Add another medicine: the patient's manual-add fields, with dosage chosen rather than typed. Errors live beside each value (nameErr…).
export const DR_MED_REQ = ['name', 'strength', 'form', 'dose', 'often', 'long']; // R24: the dose amount too
export const drMedText = (k, label, ph) => <div className="field-wrap"><label className="label" htmlFor={`dm-${k}`}>{label}</label>
  <div className={`field ${S.drMed[`${k}Err`] ? 'err' : ''}`}><input id={`dm-${k}`} placeholder={ph} value={S.drMed[k] || ''} onChange={e => { S.drMed[k] = e.target.value; S.drMed[`${k}Err`] = ''; paint(); }} /></div>
  {S.drMed[`${k}Err`] ? support(S.drMed[`${k}Err`], 'err') : null}</div>;
export const drMedRadio = (k, name, opts) => <div className="stack4">{drRadio(name, opts.map(o => [o, o]), S.drMed[k], `d-mf:${k}`)}{S.drMed[`${k}Err`] ? support(S.drMed[`${k}Err`], 'err') : null}</div>;
// Run 7: the quantity a dose, how often and how long add up to, as the field's suggestion ("About 184 tablets"). Ongoing has none.
const drQtyHint = () => { const m = S.drMed, n = parseFloat(m.dose), f = { 'Once a day': 1, 'Twice a day': 2, '3 times a day': 3 }[m.often], d = DR_LONG[m.long];
  return n && f && d ? `About ${Math.ceil(n * f * d)} ${/ml/i.test(m.dose) ? 'ml' : (m.form || 'tablet').toLowerCase() + 's'} for this dose` : ''; };
export const drMedForm = () => <div className="fields">
  {drMedText('name', 'Medicine name', 'e.g. Paracetamol')}{drMedText('strength', 'Strength', 'e.g. 500 mg')}
  {drMedText('purpose', 'Purpose', 'e.g. For fever and headache')}
  {drMedRadio('form', 'Form', ['Tablet', 'Capsule', 'Liquid'])}
  {drMedText('dose', 'Dose each time', 'e.g. 1 tablet, 10 ml')}
  {drMedText('qty', 'Quantity to dispense', drQtyHint() || 'e.g. 20 tablets')}
  {drMedRadio('often', 'How often', ['Once a day', 'Twice a day', '3 times a day'])}
  {drMedRadio('long', 'For how long', Object.keys(DR_LONG))}
  {drDate('dm-end', 'End date', S.drMed, 'end', 'medend')}</div>;

// ---------- the visit being written (phone dvisit and desktop complete) ----------
// F04/R02/T01/V01/F23: a visit starts empty. The prepared note is only a suggestion (the placeholder).
// Run 6 Y12: a blank note stays blank; the suggestion goes in only when the doctor chooses "Use suggested note".
export const drNoteHint = id => DR_DRAFTS[id]?.note || '';
export const drNoteOf = d => d.note.trim();
export const drNoteField = (d, id, fid) => <div className="field-wrap"><label className="dr-label" htmlFor={fid}>Doctor's note</label>
  <div className="field textarea"><textarea id={fid} value={d.note} placeholder={drNoteHint(id) ? `Suggested: ${drNoteHint(id)}` : 'What should the patient know?'} onChange={e => { d.note = e.target.value; paint(); }} /></div>
  {drNoteHint(id) && !d.note.trim() ? <div>{btn('Use suggested note', 'd-usenote', { size: 'l', kind: 'secondary hug' })}</div> : null}</div>;
export const drMedList = d => <><p className="dr-label">Medicines</p>{d.meds.length ? d.meds.map(drMedEdit) : <p className="dr-body tertiary">No medicines yet.</p>}
  <button className="btn secondary l" data-act="d-addmed">{d.meds.length ? 'Add another medicine' : 'Add a medicine'}</button></>; // Y26
// R24: the follow-up's real date shows while choosing.
export const drFollowRadio = d => drRadio('Follow-up', [['none', 'No follow-up'], ['2w', `In 2 weeks · ${dayLabel(FU_DAY)}`], ['other', 'Other date']], d.follow, 'd-follow');
export const drFollowText = d => d.follow === '2w' ? `In 2 weeks · ${dayLabel(FU_DAY)}` : d.follow !== 'other' ? 'No follow-up'
  : (p => p && !drDateErr(d.followDate) ? dayLabel(new Date(p.y, p.m, p.d)) : 'Follow-up needed, date not set')(parseDob(d.followDate || ''));
// F03/R03/T02/V02/T21: a draft that was kept says so when it comes back.
export const draftCue = msg => <div role="status">{support(msg, '', 'icon-check-circle-success-20.svg')}</div>;
// F05/V17: the same drug listed twice, whatever the strength ("Paracetamol 500 mg" and "Paracetamol 650 mg").
export const drDupes = meds => { const k = m => m.name.replace(/\s*\d.*$/, '').trim().toLowerCase(), ks = meds.map(k);
  return [...new Set(ks.filter((x, i) => ks.indexOf(x) !== i))].map(x => meds[ks.indexOf(x)].name.replace(/\s*\d.*$/, '').trim()); };
// F24/R20/T11/W07: today's released reports — who released each one and when.
export const drOutList = (cls = '') => S.drOut.length ? <><div className="inset" style={{ paddingTop: 12 }}><p className="dr-label">Released today</p></div>
  <div className="list">{sepJoin(S.drOut.map(o => { const r = DR_REPORTS[o.k], p = DR_PATIENTS[r.pid];
    return <div className={`list-item static ${cls}`}><span className="avatar" aria-hidden="true">{p.ini}</span>
      <span className="dq-t"><span className="h-s">{p.name}</span><span className="dq-id">{drPid(r.pid)}</span><span className="dq-r">{r.test}</span>
        <span className="dq-m"><span className="past">{o.back ? 'Taken back' : 'Released'} by {o.by} at {o.at}</span>{tag(o.back ? 'Taken back' : o.follow ? 'Follow-up asked' : 'Released', `${o.back ? 'neutral' : o.follow ? 'warn' : 'success'} s12`)}</span>
        {!o.back && o.words ? <span className="dr-body tertiary">They see: “{o.words}”</span> : null}{/* Run 7 */}
        {o.back ? null : <span>{btn('Take back', `d-retract:${o.k}`, { size: 'l', kind: 'secondary hug' })}</span>}</span></div>; }))}</div></> : null; // Take back sits under the line, so "Released by…" keeps its width

// ---------- screens ----------
Object.assign(SCREENS, {
  // A staff ID and password — not the patient app's SMS sign-in.
  dsignin: () => drScreen(
    <div className="body" style={{ justifyContent: 'center', gap: 32, padding: '0 16px 24px' }}>
      <div style={{ height: 40, flex: 'none' }}></div>
      <div className="dr-brand"><h1 className="wordmark-s">Clinica</h1>{/* W13 */}<p className="dr-sub">For City Hospital's care team</p></div>
      <form id="d-form" className="fields" noValidate onSubmit={e => { e.preventDefault(); ACTIONS['d-signin'](); }}>
        {drField('d-id', 'Staff ID', 'e.g. CH-0231')}
        {drField('d-pw', 'Password', 'Password', S.drErr ? 'Staff ID or password is incorrect. Try again.' : '')}
        <a href="#" className="dr-link" data-act="stub:Forgot your password?">Forgot your password?</a>
      </form>
      <div className="stack12">{btn('Sign in', 'd-signin')}<p className="dr-body tertiary" style={{ width: 192, textAlign: 'center' }}>Trouble signing in? Call IT support.</p></div>
    </div>),

  dqueue: () => {
    const ids = S.drNoPatients ? [] : drToday();
    if (!ids.length) return drScreen(centred(empty('qa-book.svg', 'No patients scheduled today', 'When a visit is booked with you, it appears here.', null)), { bar: drBar('Today · Aug 28'), nav: 'Queue' });
    const seen = ids.filter(id => drStatus(id) === 'done').length, withIds = ids.filter(id => drStatus(id) === 'with'), nextId = ids.find(id => drStatus(id) === 'waiting');
    // V21/F26: "You're with …" opens that visit, with its draft. Run 6 Y04: one line for each visit still open.
    const line = withIds.length || nextId ? <>{withIds.map((id, i) => <Fragment key={id}>{i ? ' ' : ''}<a href="#" className="dr-link" style={{ fontSize: 'inherit' }} data-act={`d-resume:${id}`}>You're with {DR_PATIENTS[id].name} now.</a></Fragment>)}{withIds.length && nextId ? ' ' : ''}{nextId ? `${DR_PATIENTS[nextId].name} is next.` : ''}</> : 'No one is waiting right now.';
    return drScreen(<div className="body" style={{ gap: 12 }}>
      <div className="inset"><div className="card notice info"><div className="text"><p className="h-s">{seen} of {ids.length} seen today</p><p className="dr-body">{line}</p></div></div></div>
      <div className="inset stack8"><p className="dr-label">Patients</p>{S.drOffline ? null : drChip('status', 'Status', drStatusOpts(ids), S.drFilt, 'd-filt')}</div>
      {S.drOffline ? <div className="inset">{drOffline()}</div> : <div className="list">{sepJoin(drShown(ids).map(drRow))}</div>}
    </div>, { bar: drBar('Today · Aug 28'), nav: 'Queue' });
  },

  // Quick to scan: who, why today, and the one action. History is a tap away rather than inline.
  dpatient: () => {
    const p = DR_PATIENTS[S.dp], st = drStatus(S.dp);
    return drScreen(<div className="body" style={{ gap: 24 }}>
      <div className="inset">{drHead(p, 'l', 'h1')}</div>{/* W13: the bar has no title here */}
      <div className="inset stack6"><p className="dr-label">Today's visit</p>
        <div className="dr-reason"><p className="dr-label tertiary">Reason for visit</p><p className="dr-l">{p.reason}</p><p className="dr-body">{drTime(S.dp)} · General medicine · OPD 2</p></div></div>
      <div className="inset"><button className="list-item" data-act="go:dhistory">{lead('lt-history.svg')}
        <span className="text"><span className="item-title">View history</span><span className="dr-body">{p.hist}</span></span>{drChev}</button></div>
      <div style={{ height: 20, flex: 'none' }}></div>
      <div className="inset stack8">{st === 'done' ? tag('Visit complete', 'neutral s12') : st === 'notarrived' ? <>{tag('Not arrived', 'error s12')}<p className="dr-body">{p.name.split(' ')[0]} hasn't checked in yet. Reception checks patients in; then you can start the visit here.</p><div>{btn('Check in at Reception', `d-checkin:${S.dp}`, { size: 'l', kind: 'secondary hug' })}</div></> : btn(st === 'with' ? 'Continue visit' : 'Start visit', 'd-start')}</div>
    </div>, { bar: drBar('', true) });
  },

  dhistory: () => drScreen(<div className="body" style={{ gap: 24 }}>
      <div className="inset">{drHead(DR_PATIENTS[S.dp])}</div>
      <div className="inset stack8"><p className="sec-label lh20">Every visit</p>{drVisitList(S.dp)}</div>
    </div>, { bar: drBar('Visit history', true) }),

  // A visit of her own, in full — what she wrote, prescribed and advised.
  dvisitd: () => drScreen(<div className="body" style={{ gap: 20, paddingBottom: 24 }}>
      <div className="inset stack16"><p className="dr-body tertiary">{DR_PATIENTS[S.dp].name} · {drPid(S.dp)}</p>
        {docCard('PS', 'Dr. Priya Sharma', `Aug 28, ${drTime(S.dp)}`, 'General medicine, OPD 2')}{drOwnVisit(S.dp)}</div>
    </div>, { bar: drBar('Visit on Aug 28', true) }),

  dlab: () => drScreen(<div className="body" style={{ gap: 20 }}>{/* T25 */}
      <div className="inset stack16"><p className="dr-body tertiary">{DR_PATIENTS[S.dp].name} · {drPid(S.dp)}</p>{drLabView(S.dp, S.drLab)}</div>
    </div>, { bar: drBar(LABS[S.drLab]?.title || DR_REPORTS[S.drLab].test, true) }),

  // Another doctor's visit: date, department and reason only. The rest stays with the doctor who saw her.
  dvisito: () => { const v = drVisits(S.dp)[S.drHv];
    return drScreen(<div className="body" style={{ gap: 20 }}>
      <div className="inset stack16"><p className="dr-body tertiary">{DR_PATIENTS[S.dp].name} · {drPid(S.dp)}</p>{drOtherVisit(S.dp, v)}</div>
    </div>, { bar: drBar(`Visit on ${v.date.split(',')[0]}`, true) }); },

  daddmed: () => drScreen(<div className="body" style={{ gap: 16, paddingBottom: 24 }}>
      <div className="inset"><p className="dr-body tertiary">For {DR_PATIENTS[S.dp].name} · {drPid(S.dp)}</p></div>
      <div className="inset">{drMedForm()}</div>
    </div>, { bar: drBar(S.drMed?.idx != null ? 'Edit medicine' : S.drDraft?.meds.length ? 'Add another medicine' : 'Add a medicine', true), cta: <div className="cta">{btn('Save medicine', 'd-medsave')}</div> }),

  // Writing the note and prescribing — the wording the patient later reads in her own Health tab.
  dvisit: () => {
    const p = DR_PATIENTS[S.dp], d = S.drDraft;
    return drScreen(<div className="body" style={{ gap: 24, paddingBottom: 36 }}>
      <div className="inset"><div className="dr-head"><span className="avatar " aria-hidden="true">{p.ini}</span><div>
        <p className="h-s">{p.name}</p><p className="dr-body">{drPid(S.dp)} · Today's visit · {drTime(S.dp)}</p></div></div></div>
      {d.restored ? <div className="inset">{draftCue('Draft kept — your note, medicines and follow-up are as you left them.')}</div> : null}
      <div className="inset">{drNoteField(d, S.dp, 'd-note')}</div>
      <div className="inset stack12">{drMedList(d)}</div>
      <div className="inset stack16">{drFollowRadio(d)}
        {d.follow === 'other' ? drDate('d-fudate', 'Follow-up date', d, 'followDate', 'follow', 'Optional — pick a date or type one') : null}</div>
      <div style={{ height: 20, flex: 'none' }}></div>
      <div className="inset">{btn('Complete visit', 'd-complete')}</div>
    </div>, { bar: drBar('Complete visit', true) });
  },

  dreports: () => {
    const ids = S.drPending;
    if (!ids.length && !S.drOut.length) return drScreen(centred(empty('icon-check-circle-secondary-28.svg', 'Nothing waiting on you', 'Reports you need to release will show up here.', <div style={{ height: 104 }}></div>)), { bar: drBar('Reports to release'), nav: 'Reports' });
    return drScreen(<div className="body" style={{ gap: 12 }}>
      <div className="inset"><div className="card notice info"><div className="text"><p className="h-s">{ids.length ? `${ids.length} ${ids.length === 1 ? 'result is' : 'results are'} waiting on you` : 'Nothing waiting on you'}</p>
        <p className="dr-body">Patients can't see a report until you release it, with your own comment.</p></div></div></div>
      {ids.length ? <div className="inset"><p className="dr-label">Pending</p></div> : null}
      <div className="list">{sepJoin(ids.map(k => { const r = DR_REPORTS[k], p = DR_PATIENTS[r.pid];
        return <button className="list-item" data-act={`d-report:${k}`}><span className="avatar" aria-hidden="true">{p.ini}</span>
          <span className="dq-t"><span className="h-s">{p.name}</span><span className="dq-id">{drPid(r.pid)}</span><span className="dq-r">{r.test}</span><span className="dq-m"><span className="now">{r.date}</span>{tag('Needs review', 'warn s12')}</span></span>
          {drChev}</button>; }))}</div>
      {drOutList()}
    </div>, { bar: drBar('Reports to release'), nav: 'Reports' });
  },

  // Raw values, a release decision and a comment — the values themselves never reach the patient app.
  dreport: () => {
    const r = DR_REPORTS[S.drRep], p = DR_PATIENTS[r.pid], rel = S.drRel, follow = rel.choice === 'follow';
    return drScreen(<div className="body" style={{ gap: 24, paddingBottom: 36 }}>
      <div className="inset stack8"><div className="dr-head"><span className="avatar" aria-hidden="true">{p.ini}</span><div><p className="h-s">{p.name}</p><p className="dr-body">{drPid(r.pid)} · {r.test} · {r.date} · City Hospital lab</p></div></div>
        <a href="#" className="dr-link" data-act={`d-hist:${r.pid}`}>View {r.first}'s history</a></div>{/* F24/R20/T25: history from the report */}
      <div className="inset stack6"><p className="dr-label">Result</p>
        {drValues(r.rows)}
        <p className="dr-body tertiary">Reference ranges only — patients never see raw values like these, only what you tell them.</p></div>
      <div className="inset">{drRadio('What should the patient see?', [['normal', 'Everything is normal'], ['follow', 'I need to see them again']], rel.choice, 'd-choice')}</div>
      <div className="inset">{drComment(r, S.drRep)}</div>
      <div style={{ height: 20, flex: 'none' }}></div>
      <div className="inset">{btn(follow ? 'Release with follow-up request' : `Release to ${r.first}`, 'd-release', { disabled: !rel.choice })}</div>
    </div>, { bar: drBar('Review report', true) });
  },

  dprofile: () => drScreen(<div className="body" style={{ gap: 24 }}>
      <div className="inset"><div className="dr-me"><span className="avatar l" aria-hidden="true">PS</span><p className="dr-h1">Dr. Priya Sharma</p><p className="dr-sub">General medicine · City Hospital</p></div></div>
      <div className="inset stack4"><p className="dr-label">Your details</p><div className="mt-list">{sepJoin([row('lt-document.svg', 'NMC registration', '12345'), row('lt-hospital.svg', 'Department', 'General medicine, OPD 2')])}</div></div>
      <div className="inset stack4"><p className="dr-label">Account</p><div className="mt-list">{sepJoin([listItem('lt-lock.svg', 'Change password', 'Last changed 3 months ago', 'd-settings:pw'), listItem('lt-bell.svg', 'Notifications', 'New reports and check-ins', 'd-settings:notif')])}</div></div>
      <div style={{ height: 20, flex: 'none' }}></div>
      <div className="inset"><button className="btn secondary" data-act="d-signout-ask">Sign out</button></div>
    </div>, { bar: drBar('Profile'), nav: 'Profile' }),

  // Both settings on one screen; Profile's two rows land with the right section in view.
  dsettings: () => drScreen(<div className="body" style={{ gap: 24, padding: '16px 0 36px' }}>
      <div className="inset stack24" id="d-pw-sec"><h2 className="dr-h1">Change password</h2>
        <form id="d-pwform" className="fields" noValidate>{drField('d-pw0', 'Current password', 'Password')}{drField('d-pw1', 'New password', 'At least 8 characters', S.drPwErr === 'short' ? 'Use at least 8 characters.' : '')}
          {drField('d-pw2', 'Confirm new password', 'Re-enter new password', S.drPwErr === 'match' ? "The new passwords don't match." : '')}</form>
        {S.drPwErr === 'saved' ? support('Password changed.', '', 'icon-check-circle-success-20.svg') : null}{btn('Save password', 'd-pwsave')}</div>
      <div className="inset stack8" id="d-notif-sec"><h2 className="dr-h1">Notifications</h2>
        <div className="mt-list">{drSettings()}</div></div>
    </div>, { bar: drBar('Account settings', true) }),
});

// ---------- behaviour ----------
Object.assign(mount, {
  dsettings: () => { if (S.drSec) { document.getElementById(S.drSec === 'notif' ? 'd-notif-sec' : 'd-pw-sec').scrollIntoView({ block: 'start' }); S.drSec = null; } },
});

// Release asks first, with exactly what the patient will be told. Brand, not red: releasing is the intended outcome.
// W05: both branches quote the comment and say what her app shows (health.jsx hreport: the comment, plus a "Book follow-up" card when flagged).
Object.assign(OVERLAY, {
  drrelease: () => {
    const r = DR_REPORTS[S.drRep], p = DR_PATIENTS[r.pid], w = drWords(), goBack = btn('Go back', 'sheet-close', { kind: 'secondary' });
    const sees = `${p.name} (${drPid(r.pid)}) will see your comment right away: “${w}”${/[.!?]$/.test(w) ? '' : '.'} You can take it back later from Released today.`; // Y06; no “….”. when the comment ends a sentence
    return S.drRel.choice === 'follow'
      ? csheet('Release with a follow-up request?', `${sees} ${r.first} will also be asked to book a follow-up with you.`, btn('Release with follow-up request', 'd-release-ok'), goBack)
      : csheet('Release this report?', sees, btn(`Release to ${r.first}`, 'd-release-ok'), goBack);
  },
  // T15: changing the decision after writing your own comment asks before anything is replaced.
  drkeep: () => csheet('Keep your comment?', `You changed the decision to “${S.drRel.next === 'follow' ? 'I need to see them again' : 'Everything is normal'}”. Your comment still says: “${S.drRel.comment.trim()}”`,
    btn('Keep my comment', 'd-keep:keep'), btn('Use the suggested text', 'd-keep:replace', { kind: 'secondary' })),
  // F05/R08/T12/V17/R24: completing a visit asks first, like release — the note, each medicine with dose and quantity,
  // the follow-up as a date, and a warning when one drug is listed twice. Back to editing keeps everything.
  drdone: () => {
    const d = S.drDraft, p = DR_PATIENTS[S.dp], note = drNoteOf(d), dup = drDupes(d.meds);
    return <><div className="scrim" data-act="sheet-close"></div>
    <div className="csheet dr-medsheet" role="dialog" aria-modal="true" aria-labelledby="dd-t"><span className="handle"></span>
      <div className="cs-text"><h2 className="cs-t" id="dd-t">Complete this visit?</h2>
        <p className="lede">This is what goes on {p.name}'s record ({drPid(S.dp)}).</p>
        {dup.length ? notice('warn', 'Same medicine twice', `${dup.join(', ')} is listed more than once. Check the doses before completing.`) : null}
        <div className="stack4"><p className="dr-label">Note</p><p className="dr-body">{note ? `“${note}”` : 'No note.'}</p></div>
        <div className="stack4"><p className="dr-label">Medicines</p>{d.meds.length ? d.meds.map((m, i) => <p key={i} className="dr-body"><b>{m.name}</b> — {m.how} · {m.dur} · {m.qty || 'Quantity not set'}</p>)
          : <p className="dr-body">No medicines.</p>}</div>
        <div className="stack4"><p className="dr-label">Follow-up</p><p className="dr-body">{drFollowText(d)}</p></div></div>
      <div className="cs-acts">{btn('Complete visit', 'd-complete-ok')}{btn('Back to editing', 'sheet-close', { kind: 'secondary' })}</div></div></>;
  },
  // Run 6 Y04: starting a visit while someone is still with the doctor asks first. Neither choice completes anyone.
  drbusy: () => { const id = drBusy(), n = DR_PATIENTS[id].name, f = DR_PATIENTS[S.dp].name.split(' ')[0];
    return csheet(`${n} is still with you`, `Their visit isn't completed yet. Starting ${f}'s won't complete it: finish it first, or keep it open and come back to it from the queue.`,
      btn(`Finish ${n}'s visit first`, `d-resume:${id}`), btn(`Keep it open and start ${f}'s`, 'd-start:ok', { kind: 'secondary' })); },
  // Run 6 Y06: a released report can be taken back after Undo has gone; it's logged under Released today.
  drretract: () => { const r = DR_REPORTS[S.drBack], p = DR_PATIENTS[r.pid];
    return csheet('Take this report back?', `${p.name} won't see your comment any more, and the ${r.test} goes back to Needs review so you can correct it. Released today keeps a record that you took it back.`,
      btn('Take it back', 'd-retract-ok'), btn('Go back', 'sheet-close', { kind: 'secondary' })); },
  drsignout: () => signoutSheet("You'll need to sign in again to see today's queue.", 'd-signout'),
  // Desktop adds a medicine in a sheet over the visit; the phone uses a full screen (daddmed).
  draddmed: () => <><div className="scrim" data-act="sheet-close"></div>
    <div className="csheet dr-medsheet" role="dialog" aria-modal="true" aria-labelledby="dm-t"><span className="handle"></span>
      <div className="cs-text"><h2 className="cs-t" id="dm-t">{S.drMed?.idx != null ? 'Edit medicine' : S.drDraft?.meds.length ? 'Add another medicine' : 'Add a medicine'}</h2><p className="dr-body tertiary">For {DR_PATIENTS[S.dp].name} · {drPid(S.dp)}</p></div>
      <div className="dm-form">{drMedForm()}</div>
      <div className="cs-acts">{btn('Save medicine', 'd-medsave')}{btn('Cancel', 'sheet-close', { kind: 'secondary' })}</div></div></>,
});
// Clicking anywhere outside an open filter closes it.
onPhone('click', e => { if ((S.app === 'doctor' || S.app === 'desk') && S.drMenu && !e.target.closest('.st-dd-wrap')) { S.drMenu = null; paint(); } });

export function drRelease() { // what releasing does, on either device
  const k = S.drRep, follow = S.drRel.choice === 'follow', r = DR_REPORTS[k];
  let notif = null;
  S.drPending = S.drPending.filter(x => x !== k);
  if (k === 'cbc') { // Anisha's CBC: now released, with this comment, on her side
    S.released = { ...S.released, cbc: { follow, words: drWords() } }; // W05: exactly what the sheet quoted
    // W10: names the test and the reviewing doctor (the signed-in one), so it never reads the same as another report's.
    S.notifs.unshift(notif = { g: 'Today', icon: 'lt-lab.svg', t: `Your ${r.test} is ready${follow ? ' — Dr. Sharma wants to see you' : ''}`, b: 'Open Health to read what Dr. Sharma wrote.', when: 'Just now', go: 'hreport-cbc' });
  }
  // F24/R20/T11/W07/V09: recorded as released today, by the signed-in doctor, and said out loud with Undo for 5 seconds.
  S.drOut = [{ k, follow, by: 'Dr. Priya Sharma', at: now(), rel: { ...S.drRel }, notif, words: drWords() }, ...S.drOut.filter(o => o.k !== k || o.back)]; // Run 7: a take-back stays on record when the corrected report goes out
  toast(`${r.test} released to ${DR_PATIENTS[r.pid].name}.`, ['Undo', `d-undo:${k}`]);
}
// Undo puts the report back as pending, with the decision and comment as they were, and takes it back off the patient's side.
export function drUndo(k) {
  const o = S.drOut.find(x => x.k === k && !x.back);
  toastClear();
  if (!o) return false;
  S.drOut = S.drOut.filter(x => x !== o);
  S.drPending = Object.keys(DR_REPORTS).filter(x => x === k || S.drPending.includes(x));
  const { [k]: _, ...rest } = S.released; S.released = rest;
  if (o.notif) S.notifs = S.notifs.filter(n => n !== o.notif);
  Object.assign(S, { drRep: k, drRel: o.rel });
  return true;
}

Object.assign(ACTIONS, {
  'd-signin': () => { // demo: staff ID CH-0231, password clinica
    if (S.drId.trim().toUpperCase() !== 'CH-0231' || S.drPw !== 'clinica') { S.drErr = true; S.drPw = ''; return render(); }
    Object.assign(S, { drSigned: true, drErr: false, drPw: '', stack: [], screen: 'dqueue' }); render();
  },
  'd-tab': arg => { Object.assign(S, { stack: [], sheet: null, screen: arg }); render(); },
  'd-patient': id => { S.dp = id; S.drHistDoc = 'all'; go('dpatient'); },
  'd-menu': k => { S.drMenu = S.drMenu === k ? null : k; paint(); },
  'd-filt': v => { S.drFilt = v; S.drMenu = null; render(); },
  'd-hdoc': v => { S.drHistDoc = v; S.drMenu = null; render(); },
  'd-retry': () => render(), // tries again: still offline stays offline
  'd-hv': i => { S.drHv = +i; const v = drVisits(S.dp)[S.drHv];
    if (S.app === 'desk') { S.kView = 'hvisit'; return render(); }
    go(v.today ? 'dvisitd' : 'dvisito'); }, // T25: today's visit in full; any other as its date, department and reason
  'd-lab': k => { // T25: a result waiting on her opens for review; any other opens read-only
    if (S.drPending.includes(k)) { if (S.app === 'desk') { Object.assign(S, { screen: 'kreports', stack: [] }); return ACTIONS['k-rep'](k); } return ACTIONS['d-report'](k); }
    S.drLab = k; if (S.app === 'desk') { S.kView = 'lab'; return render(); } go('dlab'); },
  // F24/R20/T25: the patient's history, from her report. The desktop shows it in the Queue's detail pane; Reports keeps its place.
  'd-hist': id => { S.dp = id; S.drHistDoc = 'all';
    if (S.app === 'desk') { Object.assign(S, { screen: 'kqueue', stack: [], kSel: id, kView: 'history' }); return render(); }
    go('dhistory'); },
  'd-addmed': () => { S.drMed = {}; ACTIONS['d-medform'](); },
  'd-medform': () => { if (S.app === 'desk') { S.dp = S.kSel; S.sheet = 'draddmed'; return render(); } go('daddmed'); },
  // F04/R02/T01/V01: edit opens the same form, filled in; remove takes it off the list.
  'd-medit': i => { const m = S.drDraft.meds[+i], [, name = m.name, strength = ''] = m.name.match(/^(.*?)\s+(\d.*)$/) || [];
    S.drMed = { ...(m.f || { name, strength, purpose: m.for }), idx: +i }; ACTIONS['d-medform'](); },
  'd-mdel': i => { S.drDraft.meds = S.drDraft.meds.filter((_, j) => j !== +i); render(); },
  'd-mf': arg => { const [k, v] = arg.split(/:(.*)/s); S.drMed[k] = v; S.drMed[`${k}Err`] = ''; paint(); },
  'd-medsave': () => {
    const m = S.drMed;
    for (const k of DR_MED_REQ) m[`${k}Err`] = (m[k] || '').trim() ? '' : 'This field is required.';
    m.endErr = drDateErr(m.end);
    // Run 6 Y03: an End date sets the length when none is chosen; a length that disagrees with it must be fixed first.
    const days = m.end && !m.endErr ? drDays(m.end) : null;
    if (days != null && !m.long) { m.longErr = ''; m.long = Object.keys(DR_LONG).find(l => DR_LONG[l] && drFits(l, days)) || `${days} days`; }
    else if (days != null && m.long === 'Ongoing') m.longErr = 'Ongoing has no end date. Clear the End date, or choose how long.';
    else if (days != null && DR_LONG[m.long] && !drFits(m.long, days)) m.longErr = `${m.long} from today ends ${mdOf(dayAt(DR_LONG[m.long]))}, not ${drShort(m.end)}. Change one so they agree.`;
    if ([...DR_MED_REQ, 'end'].some(k => m[`${k}Err`])) return render();
    // R24: the dose amount is part of how it's taken ("1 tablet, twice a day"); the quantity travels with it. f keeps the form for Edit.
    const { idx, ...f } = m, med = { name: `${m.name.trim()} ${m.strength.trim()}`, for: (m.purpose || '').trim(), how: `${m.dose.trim()}, ${m.often.toLowerCase()}`,
      dur: m.long === 'Ongoing' ? 'Ongoing' : `For ${m.long}${m.end ? `, until ${drShort(m.end)}` : ''}`, qty: (m.qty || '').trim(), f };
    S.drDraft.meds = idx != null ? S.drDraft.meds.map((x, j) => j === idx ? med : x) : [...S.drDraft.meds, med];
    S.drMed = null;
    if (S.app === 'desk') { S.sheet = null; return render(); }
    back();
  },
  // The AD/BS wheels from Date of birth, here for future dates: the follow-up, or when a medicine ends.
  'd-pick': k => {
    const [obj, key, title] = k === 'follow' ? [S.drDraft, 'followDate', 'Follow-up date'] : [S.drMed, 'end', 'End date'];
    const p = !drDateErr(obj[key]) && parseDob(obj[key] || ''), t = new Date(DR_TODAY.getTime() + 864e5); // opens on the date typed, or tomorrow
    S.picker = { cal: 'AD', y: p ? p.y : t.getFullYear(), m: p ? p.m : t.getMonth(), d: p ? p.d : t.getDate(), from: DR_TODAY.getFullYear(), title,
      onDone: ad => { obj[key] = `${pad(ad.d)} / ${pad(ad.m + 1)} / ${ad.y}`; obj[`${key}Err`] = drDateErr(obj[key]); } };
    paint();
  },
  'd-start': ok => { // this patient is with the doctor now. Run 6 Y04: nobody else is completed; if someone is still with them, ask first
    if (ok !== 'ok' && drStatus(S.dp) !== 'with' && drBusy()) { S.sheet = 'drbusy'; return render(); }
    S.sheet = null;
    if (S.dp === 'as') S.visitDay = 'with'; else S.drq[S.dp] = 'with';
    // F04/F23: nothing pre-filled — the prepared note is only the placeholder (drNoteField).
    // F03/R03/T02/V02: the draft lives in drKept from the start, so every way out (Back, a tab, another patient, the desktop X) keeps it.
    const kept = S.drKept[S.dp];
    S.drDraft = kept || { note: '', meds: [], follow: 'none', followDate: '' };
    S.drDraft.restored = !!kept;
    S.drKept = { ...S.drKept, [S.dp]: S.drDraft };
    if (S.app === 'desk') { Object.assign(S, { screen: 'kqueue', stack: [], kSel: S.dp, kView: 'complete' }); render(); return document.getElementById('k-note')?.focus(); } // the note is written inline; Run 7: focus there, not on Complete
    go('dvisit', { replace: true });
  },
  'd-checkin': id => { pickTab('reception'); ACTIONS['st-arr'](id); }, // Run 7: no dead end in a demo — the arrival opens at Reception
  'd-resume': id => { S.sheet = null; if (S.app === 'desk') { S.dp = id; return ACTIONS['d-start'](); } ACTIONS['d-patient'](id); ACTIONS['d-start'](); }, // V21: the "You're with …" banner; Run 6 Y04: the sheet's "Finish … first"
  'd-follow': v => { S.drDraft.follow = v; render(); },
  'd-complete': () => { S.sheet = 'drdone'; render(); }, // F05/R08/T12/V17: review first
  'd-complete-ok': () => {
    S.drDraft.note = drNoteOf(S.drDraft);
    if (S.dp === 'as') { // what Anisha now sees: her visit complete, these notes, and this follow-up advice
      Object.assign(S, { visitDay: 'done', fuAdvice: S.drDraft.follow, fuDate: S.drDraft.follow === 'other' ? S.drDraft.followDate : '' });
      S.notifs.unshift({ g: 'Today', icon: 'lt-document.svg', t: 'Your visit notes are ready', b: 'Open Health to read them.', when: 'Just now', go: 'hvisit' });
    } else S.drq[S.dp] = 'done';
    S.drNotes[S.dp] = S.drDraft.note;
    S.drVisits = { ...S.drVisits, [S.dp]: { ...S.drDraft } }; // now part of her history
    const { [S.dp]: _, ...kept } = S.drKept; S.drKept = kept;
    S.sheet = null; toast(`Visit with ${DR_PATIENTS[S.dp].name} completed.`); // W03
    if (S.app === 'desk') { Object.assign(S, { screen: 'kqueue', stack: [], kView: 'visit' }); return render(); }
    Object.assign(S, { stack: [], screen: 'dqueue' }); render();
  },
  'd-report': k => { S.drRep = k; S.drRel = drRelNew(); go('dreport'); }, // W06/F23: undecided
  'd-choice': v => { // F01/R01: never copies text in, so no other report's comment can land here; the suggestion is the placeholder
    const rel = S.drRel;
    if (rel.edited && rel.choice && v !== rel.choice && rel.comment.trim()) { rel.next = v; S.sheet = 'drkeep'; return render(); } // T15
    rel.choice = v;
    if (!rel.edited) rel.comment = ''; // a Figma frame's preset text gives way to the new suggestion
    render();
  },
  'd-keep': how => { const rel = S.drRel; rel.choice = rel.next; if (how === 'replace') Object.assign(rel, { comment: '', edited: false }); S.sheet = null; render(); }, // T15
  'd-release': () => { if (!S.drRel.choice) return; S.sheet = 'drrelease'; render(); }, // W06: no decision, no release
  'd-release-ok': () => {
    S.sheet = null; drRelease();
    if (S.app === 'desk') { Object.assign(S, { screen: 'kreports', stack: [], kRep: null }); return render(); }
    backTo('dreports');
  },
  'd-undo': k => { // F24/W07: the report comes back as it was, open again where Reports is showing
    if (!drUndo(k)) return paint();
    if (S.app === 'desk') { if (S.screen === 'kreports') S.kRep = k; return render(); }
    if (S.screen === 'dreports') return go('dreport');
    render();
  },
  'd-usenote': () => { S.drDraft.note = drNoteHint(S.dp); render(); document.querySelector('.phone textarea')?.focus(); }, // Y12
  'd-retract': k => { S.drBack = k; S.sheet = 'drretract'; render(); },
  'd-retract-ok': () => { const k = S.drBack, r = DR_REPORTS[k];
    drUndo(k); S.drOut = [{ k, back: true, by: 'Dr. Priya Sharma', at: now() }, ...S.drOut]; S.sheet = null;
    toast(`${r.test} taken back from ${DR_PATIENTS[r.pid].name}. It needs your review again.`); render(); },
  'd-settings': sec => { S.drSec = sec; S.drPwErr = ''; drPwClear(); go('dsettings'); },
  'd-set': k => { S.drSet[k] = !S.drSet[k]; drPwClear(); render(); },
  'd-pwsave': () => {
    S.drPwErr = S.drPw1.length < 8 ? 'short' : S.drPw1 !== S.drPw2 ? 'match' : 'saved';
    drPwClear(); if (S.drPwErr === 'saved') toast('Password changed.'); /* W03 */ render();
  },
  'd-signout-ask': () => { S.sheet = 'drsignout'; render(); },
  'd-signout': () => { Object.assign(S, { drSigned: false, drId: '', drPw: '', drErr: false, sheet: null, stack: [], screen: 'dsignin' }); render(); },
});

// One world, two phones: switching keeps everything, and each phone stays where it was.
export function showApp(app) {
  if (app === S.app) return;
  // Run 6 Y01: the care team's apps follow Anisha's record, whoever is using the patient app; that person's comes back with it.
  if (S.app === 'patient' && S.people['Anisha Sharma']) { S.ptWho = S.fullName; usePerson('Anisha Sharma'); }
  if (app === 'patient' && S.ptWho) { usePerson(S.ptWho); S.ptWho = null; }
  S.saved[S.app] = { screen: S.screen, stack: [...S.stack] };
  S.app = app;
  const back = S.saved[app] || { patient: { screen: S.signedIn ? 'home' : 'splash', stack: [] }, doctor: { screen: S.drSigned ? 'dqueue' : 'dsignin', stack: [] },
    desk: { screen: S.drSigned ? 'kqueue' : 'ksignin', stack: [] }, staff: { screen: S.stMe ? stHome() : 'ssignin', stack: [] } }[app];
  Object.assign(S, { screen: back.screen, stack: back.stack, sheet: null, toast: null, picker: null, bio: null, stMenu: null });
  render();
}
export const switchPhone = () => showApp(S.app === 'patient' ? 'doctor' : 'patient');

Object.assign(NUM, {
  dsignin: s => s.drErr ? 'D01b' : 'D01',
  dqueue: s => s.drNoPatients || !drToday().length ? 'D02b' : s.drOffline ? 'D02e' : s.drMenu === 'status' ? 'D02c' : s.drFilt !== 'all' ? 'D02d' : 'D02',
  dpatient: s => s.sheet === 'drbusy' ? 'D03i' : s.dp === 'as' && drStatus('as') !== 'done' ? 'D03' : s.dp === 'nt' && drStatus('nt') !== 'done' ? 'D03c'
    : drStatus(s.dp) === 'done' ? 'D03d' : drStatus(s.dp) === 'notarrived' ? 'D03e' : 'D03',
  dhistory: s => s.drMenu === 'doc' ? 'D03h' : 'D03b', dvisitd: () => 'D03f', dvisito: () => 'D03g', dlab: () => 'D03b', // T25: no Figma frame of its own yet
  dvisit: s => s.sheet === 'drdone' ? 'D04f' : s.dp === 'nt' ? 'D04b' : s.drDraft?.follow === 'other' ? 'D04c' : 'D04', daddmed: s => DR_MED_REQ.some(k => s.drMed?.[`${k}Err`]) ? 'D04e' : 'D04d',
  dreports: s => s.sheet === 'drretract' ? 'D05d' : s.drOut.length ? 'D05c' : s.drPending.length ? 'D05' : 'D05b', dreport: s => s.sheet === 'drrelease' ? (s.drRel.choice === 'follow' ? 'D06e' : 'D06d') : s.drRep === 'lipid' ? 'D06c' : s.drRel.choice === 'follow' ? 'D06b' : 'D06',
  dprofile: s => s.sheet === 'drsignout' ? 'D07c' : 'D07', dsettings: () => 'D07b',
});

export const DW = (x = {}) => () => ({ ...DOCTOR_START(), drSigned: true, ...x });
later(() => FLOW.push(['Doctor app', [ // the presets read DR_DRAFTS, ready only now
  ['D01', 'Sign in', 'Doctor app', "Doctor sign-in with a staff ID and password, not the patient app's SMS flow. (Demo: CH-0231 / clinica.)", DW({ drSigned: false })],
  ['D01b', 'Sign in — wrong password', 'A wrong password', "The password field's error state.", DW({ drSigned: false, screen: 'dsignin', drErr: true, drId: 'CH-0231' })],
  ['D02', "Today's queue", 'After signing in', "Dr. Sharma's patients for today, with status tags mirroring the patient-side Care states from the doctor's view. Anisha's tag is her own visit day.", DW({ screen: 'dqueue' })],
  ['D02b', 'No patients today', 'Nothing scheduled', "The queue's empty state, when nothing is scheduled.", DW({ screen: 'dqueue', drNoPatients: true })],
  ['D03', 'Patient snapshot', 'Taps Anisha', "Anisha's visit context — reason, and a link to history rather than the list inline, to keep this screen quick to scan.", DW({ screen: 'dpatient', stack: ['dqueue'], dp: 'as' })],
  ['D03b', 'Visit history', 'View history', 'The full visit history, reached only when the doctor asks for it.', DW({ screen: 'dhistory', stack: ['dqueue', 'dpatient'], dp: 'as' })],
  ['D03c', 'Patient snapshot — Nabin', 'Taps Nabin', 'A second real patient, proving the pattern generalises beyond Anisha.', DW({ screen: 'dpatient', stack: ['dqueue'], dp: 'nt' })],
  ['D03d', 'Patient snapshot — visit complete', 'Taps a Done patient', "A finished visit — a status tag replaces the Start visit button. Reused for every other ‘Done’ patient in today's queue.", DW({ screen: 'dpatient', stack: ['dqueue'], dp: 'bt' })],
  ['D03e', 'Patient snapshot — not arrived', 'Taps Sunita', "A patient who hasn't checked in yet — no Start visit action available.", DW({ screen: 'dpatient', stack: ['dqueue'], dp: 'sk' })],
  ['D03i', 'Start visit — someone still with you', 'Start visit, while Nabin is with the doctor', "New (Run 6 Y04): starting a visit never completes anyone. Finish Nabin's first (opens his visit), or keep it open and start Anisha's.", DW({ screen: 'dpatient', stack: ['dqueue'], dp: 'as', sheet: 'drbusy' })],
  ['D04', 'Complete visit', 'Start visit', "Writing the note and prescribing, with the exact wording that later appears in the patient's own Health tab. Completing it moves Anisha's Care to Visit complete.", DW({ screen: 'dvisit', stack: ['dqueue'], dp: 'as', visitDay: 'with', drq: { ...EXTRA_STATE_DR().drq, nt: 'done' }, drDraft: { ...DR_DRAFTS.as } })],
  ['D04b', 'Complete visit — Nabin', 'Start visit', "Nabin's own diagnosis and prescriptions, distinct from Anisha's.", DW({ screen: 'dvisit', stack: ['dqueue'], dp: 'nt', drDraft: { ...DR_DRAFTS.nt } })],
  ['D05', 'Reports', 'Reports tab', "Lab results waiting for the doctor's review before a patient can see them.", DW({ screen: 'dreports' })],
  ['D05b', 'No reports pending', 'All released', "The reports queue's empty state.", DW({ screen: 'dreports', drPending: [] })],
  ['D05c', 'Reports — released today', 'After releasing', 'New (Run 6 Y06): each report released today says who released it and when, and can be taken back after the few seconds of Undo have gone.', DW({ screen: 'dreports', drPending: ['lipid'], released: { cbc: { follow: false, words: DR_REPORTS.cbc.normal } }, drOut: [{ k: 'cbc', follow: false, by: 'Dr. Priya Sharma', at: '4:52 PM', rel: { choice: 'normal', comment: '', edited: false }, notif: null, words: DR_REPORTS.cbc.normal }] })],
  ['D05d', 'Take a report back', 'Take back', 'New (Run 6 Y06): asks first. The patient stops seeing the comment, the report goes back to Needs review to correct, and Released today keeps a record that it was taken back.', DW({ screen: 'dreports', drPending: ['lipid'], released: { cbc: { follow: false, words: DR_REPORTS.cbc.normal } }, drOut: [{ k: 'cbc', follow: false, by: 'Dr. Priya Sharma', at: '4:52 PM', rel: { choice: 'normal', comment: '', edited: false }, notif: null, words: DR_REPORTS.cbc.normal }], drBack: 'cbc', sheet: 'drretract' })],
  ['D06', 'Report detail', "Taps Anisha's CBC", 'Raw lab values, a release decision, and a comment for the patient — the values themselves never reach the patient app.', DW({ screen: 'dreport', stack: ['dreports'], drRep: 'cbc', drRel: { choice: 'normal', comment: DR_REPORTS.cbc.normal } })],
  ['D06b', 'Report — flag follow-up', 'I need to see them again', 'The alternate branch when a result needs a conversation, not just a release. On her side, the report then asks her to book a follow-up.', DW({ screen: 'dreport', stack: ['dreports'], drRep: 'cbc', drRel: { choice: 'follow', comment: DR_FOLLOW } })],
  ['D06c', 'Report detail — Kabita', "Taps Kabita's lipid panel", "A second patient's own report, not a reused stand-in.", DW({ screen: 'dreport', stack: ['dreports'], drRep: 'lipid', drRel: { choice: 'normal', comment: DR_REPORTS.lipid.normal } })],
  ['D07', 'Profile', 'Profile tab', "The doctor's own account — registration, department, and sign out.", DW({ screen: 'dprofile' })],
  ['D07b', 'Account settings', 'Change password / Notifications', "Both settings on one scrollable screen — Profile's two rows land here with the right section already in view.", DW({ screen: 'dsettings', stack: ['dprofile'] })],
  ['D02c', 'Queue — status filter', 'Status', 'One status at a time. Only statuses someone has today are offered, so the list never comes up empty.', DW({ screen: 'dqueue', drMenu: 'status' })],
  ['D02d', 'Queue — filtered', 'Status: Completed', 'The queue narrowed to one status; the progress card still counts the whole day.', DW({ screen: 'dqueue', drFilt: 'done' })],
  ['D02e', 'Queue — offline', 'No connection', "The progress card is what was last loaded; the list itself can't update, so it isn't shown as if it were current.", DW({ screen: 'dqueue', drOffline: true })],
  ['D03h', 'Visit history — doctor filter', 'Doctor', 'All, plus each doctor in her history.', DW({ screen: 'dhistory', stack: ['dqueue', 'dpatient'], dp: 'as', drMenu: 'doc' })],
  ['D03f', 'Visit history — seen by you', 'Taps Seen by you', 'Her own visit in full: the note, what was prescribed and the follow-up.', DW({ screen: 'dvisitd', stack: ['dqueue', 'dpatient', 'dhistory'], dp: 'as', visitDay: 'done', drVisits: { as: { ...DR_DRAFTS.as, meds: [...DR_DRAFTS.as.meds], followDate: '' } } })],
  ['D03g', 'Visit history — other doctor', 'Taps Other doctor', "Another doctor's visit: date, department and reason only. Notes, reports and medicines stay with the doctor who saw her.", DW({ screen: 'dvisito', stack: ['dqueue', 'dpatient', 'dhistory'], dp: 'as', drHv: 0 })],
  ['D04c', 'Complete visit — other date', 'Other date', 'Other date opens an optional date field: type it, or pick it on the same AD/BS wheels as Date of birth. Dates after today only.', DW({ screen: 'dvisit', stack: ['dqueue'], dp: 'as', visitDay: 'with', drq: { ...EXTRA_STATE_DR().drq, nt: 'done' }, drDraft: { ...DR_DRAFTS.as, meds: [...DR_DRAFTS.as.meds], follow: 'other', followDate: '' } })],
  ['D04d', 'Add another medicine', 'Add another medicine', "The patient's manual-add fields, with How often and For how long chosen rather than typed. Saving adds a card under Medicines.", DW({ screen: 'daddmed', stack: ['dqueue', 'dvisit'], dp: 'as', visitDay: 'with', drDraft: { ...DR_DRAFTS.as, meds: [...DR_DRAFTS.as.meds] }, drMed: {} })],
  ['D04e', 'Add another medicine — missing details', 'Save medicine', 'Every required field says what it needs, all at once. Quantity, Purpose and End date are optional.', DW({ screen: 'daddmed', stack: ['dqueue', 'dvisit'], dp: 'as', visitDay: 'with', drDraft: { ...DR_DRAFTS.as, meds: [...DR_DRAFTS.as.meds] },
    drMed: { nameErr: 'This field is required.', strengthErr: 'This field is required.', formErr: 'This field is required.', doseErr: 'This field is required.', oftenErr: 'This field is required.', longErr: 'This field is required.' } })],
  ['D06d', 'Release confirmation', 'Release to Kabita', 'The exact comment, before it reaches the patient. Brand, not red: releasing is the intended outcome.', DW({ screen: 'dreport', stack: ['dreports'], drRep: 'lipid', drRel: { choice: 'normal', comment: DR_REPORTS.lipid.normal }, sheet: 'drrelease' })],
  ['D06e', 'Follow-up confirmation', 'Release with follow-up request', "Flagging asks first too, quoting the comment she'll see and the follow-up she'll be asked to book (W05).", DW({ screen: 'dreport', stack: ['dreports'], drRep: 'cbc', drRel: { choice: 'follow', comment: DR_FOLLOW }, sheet: 'drrelease' })],
  ['D04f', 'Complete visit — review', 'Complete visit', 'Completing asks first: the note, each medicine with its dose and quantity, and the follow-up as a date. The same drug listed twice is flagged (F05/V17/R24).',
    DW({ screen: 'dvisit', stack: ['dqueue'], dp: 'nt', sheet: 'drdone', drDraft: { note: '', follow: '2w', followDate: '', meds: [...DR_DRAFTS.nt.meds,
      { name: 'Paracetamol 650 mg', for: 'For fever', how: '1 tablet, twice a day', dur: 'For 3 days', qty: '6 tablets' }] } })],
  ['D07c', 'Sign out', 'Sign out', 'Asks first. Reversible, so Brand, not red.', DW({ screen: 'dprofile', sheet: 'drsignout' })],
]]), ORDER.doctor);
