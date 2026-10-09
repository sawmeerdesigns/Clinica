// Clinica for City Hospital's care team — the doctor's app (Dr. Priya Sharma).
// Figma: zw3saW6ot26E6gWH20K3ux, section 551:19193. It shares one world with the patient app: Anisha's queue state is
// her visit day, the note written here is what she reads in Health, and a released report is what she sees.
import { Fragment } from 'react';
import { AD_SHORT, btn, empty, homeInd, listItem, maskDob, pad, parseDob, range, start, statusBar, support } from './app.jsx';
import { acts, ask, src, words } from './ask.jsx';
import { DOCTORS, backTo, bar, iconBtn, initials, label, rel, row, rows, sk, tag, when } from './booking.jsx';
import { csheet, notice, setting, signoutSheet } from './care.jsx';
import { A, ACTIONS, FLOW, NUM, ORDER, OVERLAY, S, SCREENS, after, back, every, extraState, go, later, mount, onPhone, paint, render, sepJoin } from './core.jsx';
import { LABS, RX, VISITS, centred, chev, docCard, field, lbl, lead, list, medRow } from './health.jsx';
import { med, ring } from './meds.jsx';
import { radioRow } from './more.jsx';
import { cell, chip, counts, filtered, img, now, patients, pid, results, stHome } from './staff.jsx';

export const DR_PATIENTS = {
  bt: { name: 'Bishal Tamang', ini: 'BT', info: 'Male · 58 · CH-1140', reason: 'Follow-up on blood pressure medication', short: 'Follow-up', time: '9:00 AM', hist: 'Jun 30, May 2' },
  sm: { name: 'Sarita Maharjan', ini: 'SM', info: 'Female · 44 · CH-1873', reason: 'General checkup', short: 'General checkup', time: '9:30 AM', hist: 'Apr 9' },
  di: { name: 'Dipesh Rai', ini: 'DR', info: 'Male · 23 · CH-2296', reason: 'Skin rash', short: 'Skin rash', time: '10:00 AM', hist: 'Jan 15' },
  kg: { name: 'Kabita Gurung', ini: 'KG', info: 'Female · 51 · CH-2412', reason: 'Follow-up on her lipid panel', short: 'Follow-up', time: '11:00 AM', hist: 'Aug 25, May 30' },
  rb: { name: 'Roshan Bhattarai', ini: 'RB', info: 'Male · 36 · CH-2154', reason: 'General checkup', short: 'General checkup', time: '2:00 PM', hist: 'Feb 18' },
  nt: { name: 'Nabin Tamang', ini: 'NT', info: 'Male · 41 · CH-1922', reason: 'Cough and cold, for the past week', short: 'Cough and cold', time: '3:30 PM', hist: 'May 14, Feb 2' },
  as: { name: 'Anisha Sharma', ini: 'AS', info: 'Female · 32 · CH-2381', reason: 'Fever for three days, with a headache', short: 'Fever for three days, with a headache', time: '4:30 PM', hist: 'Aug 12, Jul 3, Jun 20' },
  sk: { name: 'Sunita Karki', ini: 'SK', info: 'Female · 27 · CH-2410', reason: 'General checkup', short: 'General checkup', time: '5:00 PM', hist: 'Mar 3' },
};
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
  cbc: { pid: 'as', test: 'CBC blood test', date: 'Aug 28', first: 'Anisha', rows: [['Haemoglobin', '13.2 g/dL'], ['White cell count', '6,200/µL'], ['Platelets', '250,000/µL']],
    normal: 'Everything in your blood count is normal. No follow-up needed.' },
  lipid: { pid: 'kg', test: 'Lipid panel', date: 'Aug 25', first: 'Kabita', rows: [['Total cholesterol', '185 mg/dL'], ['LDL', '110 mg/dL'], ['HDL', '52 mg/dL'], ['Triglycerides', '130 mg/dL']],
    normal: 'Your cholesterol levels are all within a healthy range. Keep up the good work.' },
};
export const DR_FOLLOW = 'Please book a follow-up so we can discuss this.';

export const EXTRA_STATE_DR = () => ({
  app: 'patient', saved: {}, drSigned: false, drErr: false, drId: '', drPw: '', drNoPatients: false,
  drq: { bt: 'done', sm: 'done', di: 'done', kg: 'done', rb: 'done', nt: 'with', sk: 'notarrived' },
  dp: 'as', drDraft: null, drPending: ['cbc', 'lipid'], drRep: 'cbc', drRel: null, released: {}, drNotes: {}, fuAdvice: null,
  drSet: { reports: true, checkin: true, schedule: false }, drPwErr: '', drPw0: '', drPw1: '', drPw2: '',
  drOffline: false, drFilt: 'all', drMenu: null, drHistDoc: 'all', drHv: 0, drVisits: {}, drKept: {}, drMed: null, fuDate: '',
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
export const drToday = () => Object.keys(DR_PATIENTS).filter(id => id === 'as' ? !S.careEmpty && S.appt.day === 0 : id in S.drq); // walk-ins join via staff.jsx
export const drTime = id => id === 'as' ? S.appt.time : DR_PATIENTS[id].time;
export const DR_TAG = { done: ['Completed', 'neutral'], with: ['With doctor', 'success'], waiting: ['Waiting', 'warn'], notarrived: ['Not arrived', 'error'] };
export const drPid = id => DR_PATIENTS[id].info.split(' · ').pop(); // the clinic's patient ID, the last part of info

// What the patient app shows for a report once the doctor has released it.
export function labOf(k) {
  const l = LABS[k], r = S.released?.[k];
  return r ? { ...l, reviewing: false, tag: r.follow ? ['Needs follow-up', 'warn'] : ['Ready', 'success'], words: r.words, by: 'Reviewed by Dr. Priya Sharma on Aug 28',
    date: 'Aug 28, 2026', pages: 1, follow: r.follow } : l;
}

// ---------- pieces ----------
export const drChev = <img src={`${A}icon-chevron-right-dark.svg`} width="20" height="20" alt="" />;
export const drBar = (title, back = false) => <div className="appbar dr">{back ? iconBtn('icon-back.svg', 'Back', 'back') : null}<div className="title">{title}</div><div className="slot"></div></div>;
export function drNav(active) {
  return <div className="bottom"><nav className="bnav" aria-label="Main">{[['Queue', 'nav-queue', 'd-tab:dqueue'], ['Reports', 'nav-reports', 'd-tab:dreports'], ['Profile', 'nav-profile', 'd-tab:dprofile']]
    .map(([l, i, a]) => <a key={l} href="#" data-act={a} aria-current={l === active ? 'page' : undefined}><span><img src={`${A}${i}${l === active ? '-active' : ''}.svg`} width="24" height="24" alt="" /></span>{l}</a>)}
  </nav>{homeInd()}</div>;
}
export const drScreen = (body, { nav = '', bar = null, cta = null } = {}) => <div className="screen dr">{statusBar()}{bar}{body}{cta}{nav ? drNav(nav) : homeInd()}</div>;
export const drRow = id => {
  const p = DR_PATIENTS[id], st = drStatus(id), [t, tone] = DR_TAG[st], past = st === 'done';
  return <button className="list-item" data-act={`d-patient:${id}`}><span className="avatar">{p.ini}</span>
    <span className="dq-t"><span className={`h-s ${past ? 'past' : ''}`}>{p.name}</span><span className="dq-id">{drPid(id)}</span><span className="dq-r">{p.short}</span>
      <span className="dq-m"><span className={past ? 'past' : 'now'}>{drTime(id)}</span>{tag(t, `${tone} s12`)}</span></span>{drChev}</button>;
};
export const drHead = (p, size = 'l') => <div className="dr-head"><span className={`avatar ${size === 'l' ? 'l' : ''}`}>{p.ini}</span><div>
  <p className={size === 'l' ? 'dr-h1' : 'h-s'}>{p.name}</p><p className="dr-sub">{p.info}</p></div></div>;
export const drMed = m => <div className="card dr-med"><p className="dm1">{m.name}</p><p className="dm2">{m.for}</p><p className="dm3">{m.how}</p><p className="dm4">{m.dur}</p></div>;
export const drMeds = meds => meds.map((m, i) => <Fragment key={i}>{drMed(m)}</Fragment>);
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
export const drValues = rows => <div className="dr-values">{rows.map(([n, v], i) => <Fragment key={n}>{i > 0 && <div className="mt-sep" aria-hidden="true" />}
  <div className="dv-row"><span>{n}</span><span className="dv-v"><b>{v}</b><span className="dv-f">Normal</span></span></div></Fragment>)}</div>;
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
    <div className="mt-list">{sepJoin(shown.map(v => { // past visits of her own with nothing written down here can't open, so carry no chevron
      const inner = <>{lead('lt-history.svg')}<span className="text"><span className="item-title">{v.date}</span><span className="body-s">{`${v.doc} · ${v.reason}`}</span>
        {tag(v.own ? 'Your visit' : 'Other doctor', `${v.own ? 'success' : 'info'} s12`)}</span></>;
      return v.today || !v.own ? <button className="list-item" data-act={`d-hv:${v.i}`}>{inner}{chev}</button> : <div className="list-item static">{inner}</div>; }))}</div></>;
};
export const drShort = dmy => { const p = parseDob(dmy); return p ? `${AD_SHORT[p.m]} ${p.d}` : ''; }; // '18 / 09 / 2026' → 'Sep 18'
export const drFollowLine = (f, date) => f === '2w' ? ['Follow-up in 2 weeks', 'Around Sep 11.'] : date ? [`Follow-up on ${drShort(date)}`, ''] : ['Follow-up needed', ''];
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
  return <div className="card neutral appt"><span className="avatar l">{initials(v.doc.replace('Dr. ', ''))}</span>
    <span className="appt-t"><span className="h-s">{v.doc}</span><span className="when">{v.date}</span><span className="where">{dept}</span><span className="body-s tertiary">{v.reason}</span></span></div>;
};

// A date field: type it, or pick it on the AD/BS wheels. Optional, and only dates after today (Aug 28) count.
export const DR_TODAY = new Date(2026, 7, 28);
export const drDateErr = v => { if (!v) return ''; const p = parseDob(v); return !p ? 'Enter a real date, as DD / MM / YYYY.' : new Date(p.y, p.m, p.d) <= DR_TODAY ? 'Choose a date after today.' : ''; };
export const drDate = (id, label, obj, k, pick, hint = '') => <div className="field-wrap"><label className="label" htmlFor={id}>{label}</label>
  <div className={`field ${obj[`${k}Err`] ? 'err' : ''}`}><input id={id} inputMode="numeric" placeholder="Select or type a date" value={obj[k] || ''}
    onChange={e => { obj[k] = maskDob(e.target.value); obj[`${k}Err`] = ''; paint(); }} onBlur={() => { obj[`${k}Err`] = drDateErr(obj[k]); paint(); }} />
    <button type="button" className="cal-btn" data-act={`d-pick:${pick}`} aria-label={`Choose ${label.toLowerCase()}`}><img src={`${A}icon-calendar.svg`} width="20" height="20" alt="" /></button></div>
  {obj[`${k}Err`] ? support(obj[`${k}Err`], 'err') : hint ? support(hint) : null}</div>;

// Add another medicine: the patient's manual-add fields, with dosage chosen rather than typed. Errors live beside each value (nameErr…).
export const DR_MED_REQ = ['name', 'strength', 'form', 'often', 'long'];
export const drMedText = (k, label, ph) => <div className="field-wrap"><label className="label" htmlFor={`dm-${k}`}>{label}</label>
  <div className={`field ${S.drMed[`${k}Err`] ? 'err' : ''}`}><input id={`dm-${k}`} placeholder={ph} value={S.drMed[k] || ''} onChange={e => { S.drMed[k] = e.target.value; S.drMed[`${k}Err`] = ''; paint(); }} /></div>
  {S.drMed[`${k}Err`] ? support(S.drMed[`${k}Err`], 'err') : null}</div>;
export const drMedRadio = (k, name, opts) => <div className="stack4">{drRadio(name, opts.map(o => [o, o]), S.drMed[k], `d-mf:${k}`)}{S.drMed[`${k}Err`] ? support(S.drMed[`${k}Err`], 'err') : null}</div>;
export const drMedForm = () => <div className="fields">
  {drMedText('name', 'Medicine name', 'e.g. Paracetamol')}{drMedText('strength', 'Strength', 'e.g. 500 mg')}
  {drMedText('purpose', 'Purpose', 'e.g. For fever and headache')}
  {drMedRadio('form', 'Form', ['Tablet', 'Capsule', 'Liquid'])}
  {drMedText('qty', 'Quantity to dispense', 'e.g. 20 tablets')}
  {drMedRadio('often', 'How often', ['Once a day', 'Twice a day', '3 times a day'])}
  {drMedRadio('long', 'For how long', ['3 days', '5 days', '7 days'])}
  {drDate('dm-end', 'End date', S.drMed, 'end', 'medend')}</div>;

// ---------- screens ----------
Object.assign(SCREENS, {
  // A staff ID and password — not the patient app's SMS sign-in.
  dsignin: () => drScreen(
    <div className="body" style={{ justifyContent: 'center', gap: 32, padding: '0 16px 24px' }}>
      <div style={{ height: 40, flex: 'none' }}></div>
      <div className="dr-brand"><p className="wordmark-s">Clinica</p><p className="dr-sub">For City Hospital's care team</p></div>
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
    const seen = ids.filter(id => drStatus(id) === 'done').length, withId = ids.find(id => drStatus(id) === 'with'), nextId = ids.find(id => drStatus(id) === 'waiting');
    const line = [withId && `You're with ${DR_PATIENTS[withId].name} now.`, nextId && `${DR_PATIENTS[nextId].name} is next.`].filter(Boolean).join(' ') || 'No one is waiting right now.';
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
      <div className="inset">{drHead(p)}</div>
      <div className="inset stack6"><p className="dr-label">Today's visit</p>
        <div className="dr-reason"><p className="dr-label tertiary">Reason for visit</p><p className="dr-l">{p.reason}</p><p className="dr-body">{drTime(S.dp)} · General medicine · OPD 2</p></div></div>
      <div className="inset"><button className="list-item" data-act="go:dhistory">{lead('lt-history.svg')}
        <span className="text"><span className="item-title">View history</span><span className="dr-body">{p.hist}</span></span>{drChev}</button></div>
      <div style={{ height: 20, flex: 'none' }}></div>
      <div className="inset">{st === 'done' ? tag('Visit complete', 'neutral s12') : st === 'notarrived' ? tag('Not arrived', 'error s12') : btn('Start visit', 'd-start')}</div>
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

  // Another doctor's visit: date, department and reason only. The rest stays with the doctor who saw her.
  dvisito: () => { const v = drVisits(S.dp)[S.drHv];
    return drScreen(<div className="body" style={{ gap: 20 }}>
      <div className="inset stack16"><p className="dr-body tertiary">{DR_PATIENTS[S.dp].name} · {drPid(S.dp)}</p>{drOtherVisit(S.dp, v)}</div>
    </div>, { bar: drBar(`Visit on ${v.date.split(',')[0]}`, true) }); },

  daddmed: () => drScreen(<div className="body" style={{ gap: 16, paddingBottom: 24 }}>
      <div className="inset"><p className="dr-body tertiary">For {DR_PATIENTS[S.dp].name} · {drPid(S.dp)}</p></div>
      <div className="inset">{drMedForm()}</div>
    </div>, { bar: drBar('Add another medicine', true), cta: <div className="cta">{btn('Save medicine', 'd-medsave')}</div> }),

  // Writing the note and prescribing — the wording the patient later reads in her own Health tab.
  dvisit: () => {
    const p = DR_PATIENTS[S.dp], d = S.drDraft;
    return drScreen(<div className="body" style={{ gap: 24, paddingBottom: 36 }}>
      <div className="inset"><div className="dr-head"><span className="avatar ">{p.ini}</span><div>
        <p className="h-s">{p.name}</p><p className="dr-body">{drPid(S.dp)} · Today's visit · {drTime(S.dp)}</p></div></div></div>
      <div className="inset"><div className="field-wrap"><label className="dr-label" htmlFor="d-note">Doctor's note</label>
        <div className="field textarea"><textarea id="d-note" value={d.note} onChange={e => { d.note = e.target.value; paint(); }} /></div></div></div>
      <div className="inset stack12"><p className="dr-label">Medicines</p>{drMeds(d.meds)}
        <button className="btn secondary l" data-act="d-addmed">Add another medicine</button></div>
      <div className="inset stack16">{drRadio('Follow-up', [['none', 'No follow-up'], ['2w', 'In 2 weeks'], ['other', 'Other date']], d.follow, 'd-follow')}
        {d.follow === 'other' ? drDate('d-fudate', 'Follow-up date', d, 'followDate', 'follow', 'Optional — pick a date or type one') : null}</div>
      <div style={{ height: 20, flex: 'none' }}></div>
      <div className="inset">{btn('Complete visit', 'd-complete')}</div>
    </div>, { bar: drBar('Complete visit', true) });
  },

  dreports: () => {
    const ids = S.drPending;
    if (!ids.length) return drScreen(centred(empty('icon-check-circle-secondary-28.svg', 'Nothing waiting on you', 'Reports you need to release will show up here.', <div style={{ height: 104 }}></div>)), { bar: drBar('Reports to release'), nav: 'Reports' });
    return drScreen(<div className="body" style={{ gap: 12 }}>
      <div className="inset"><div className="card notice info"><div className="text"><p className="h-s">{ids.length} {ids.length === 1 ? 'result is' : 'results are'} waiting on you</p>
        <p className="dr-body">Patients can't see a report until you release it, with your own comment.</p></div></div></div>
      <div className="inset"><p className="dr-label">Pending</p></div>
      <div className="list">{sepJoin(ids.map(k => { const r = DR_REPORTS[k], p = DR_PATIENTS[r.pid];
        return <button className="list-item" data-act={`d-report:${k}`}><span className="avatar">{p.ini}</span>
          <span className="dq-t"><span className="h-s">{p.name}</span><span className="dq-id">{drPid(r.pid)}</span><span className="dq-r">{r.test}</span><span className="dq-m"><span className="now">{r.date}</span>{tag('Needs review', 'warn s12')}</span></span>
          {drChev}</button>; }))}</div>
    </div>, { bar: drBar('Reports to release'), nav: 'Reports' });
  },

  // Raw values, a release decision and a comment — the values themselves never reach the patient app.
  dreport: () => {
    const r = DR_REPORTS[S.drRep], p = DR_PATIENTS[r.pid], rel = S.drRel, follow = rel.choice === 'follow';
    return drScreen(<div className="body" style={{ gap: 24, paddingBottom: 36 }}>
      <div className="inset"><div className="dr-head"><span className="avatar">{p.ini}</span><div><p className="h-s">{p.name}</p><p className="dr-body">{drPid(r.pid)} · {r.test} · {r.date} · City Hospital lab</p></div></div></div>
      <div className="inset stack6"><p className="dr-label">Result</p>
        {drValues(r.rows)}
        <p className="dr-body tertiary">Reference ranges only — patients never see raw values like these, only what you tell them.</p></div>
      <div className="inset">{drRadio('What should the patient see?', [['normal', 'Everything is normal'], ['follow', 'I need to see them again']], rel.choice, 'd-choice')}</div>
      {follow ? <div className="inset"><p className="dr-body tertiary">Releasing this shows {r.first} the same “asked to see you” card and Book follow-up action already built on her side.</p></div> : null}
      <div className="inset"><div className="field-wrap"><label className="dr-label" htmlFor="d-comment">Comment for {r.first}</label>
        <div className="field textarea"><textarea id="d-comment" value={rel.comment} onChange={e => { rel.comment = e.target.value; rel.edited = true; paint(); }} /></div></div></div>
      <div style={{ height: 20, flex: 'none' }}></div>
      <div className="inset">{btn(follow ? 'Release with follow-up request' : `Release to ${r.first}`, 'd-release')}</div>
    </div>, { bar: drBar('Review report', true) });
  },

  dprofile: () => drScreen(<div className="body" style={{ gap: 24 }}>
      <div className="inset"><div className="dr-me"><span className="avatar l">PS</span><p className="dr-h1">Dr. Priya Sharma</p><p className="dr-sub">General medicine · City Hospital</p></div></div>
      <div className="inset stack4"><p className="dr-label">Your details</p><div className="mt-list">{sepJoin([row('lt-document.svg', 'NMC registration', '12345'), row('lt-hospital.svg', 'Department', 'General medicine, OPD 2')])}</div></div>
      <div className="inset stack4"><p className="dr-label">Account</p><div className="mt-list">{sepJoin([listItem('lt-lock.svg', 'Change password', 'Last changed 3 months ago', 'd-settings:pw'), listItem('lt-bell.svg', 'Notifications', 'New reports and check-ins', 'd-settings:notif')])}</div></div>
      <div style={{ height: 20, flex: 'none' }}></div>
      <div className="inset"><button className="btn secondary" data-act="d-signout-ask">Sign out</button></div>
    </div>, { bar: drBar('Profile'), nav: 'Profile' }),

  // Both settings on one screen; Profile's two rows land with the right section in view.
  dsettings: () => drScreen(<div className="body" style={{ gap: 24, padding: '16px 0 36px' }}>
      <div className="inset stack24" id="d-pw-sec"><p className="dr-h1">Change password</p>
        <form id="d-pwform" className="fields" noValidate>{drField('d-pw0', 'Current password', 'Password')}{drField('d-pw1', 'New password', 'At least 8 characters', S.drPwErr === 'short' ? 'Use at least 8 characters.' : '')}
          {drField('d-pw2', 'Confirm new password', 'Re-enter new password', S.drPwErr === 'match' ? "The new passwords don't match." : '')}</form>
        {S.drPwErr === 'saved' ? support('Password changed.', '', 'icon-check-circle-success-20.svg') : null}{btn('Save password', 'd-pwsave')}</div>
      <div className="inset stack8" id="d-notif-sec"><p className="dr-h1">Notifications</p>
        <div className="mt-list">{drSettings()}</div></div>
    </div>, { bar: drBar('Account settings', true) }),
});

// ---------- behaviour ----------
Object.assign(mount, {
  dsettings: () => { if (S.drSec) { document.getElementById(S.drSec === 'notif' ? 'd-notif-sec' : 'd-pw-sec').scrollIntoView({ block: 'start' }); S.drSec = null; } },
});

// Release asks first, with exactly what the patient will be told. Brand, not red: releasing is the intended outcome.
Object.assign(OVERLAY, {
  drrelease: () => {
    const r = DR_REPORTS[S.drRep], p = DR_PATIENTS[r.pid], c = S.drRel.comment.trim(), goBack = btn('Go back', 'sheet-close', { kind: 'secondary' });
    return S.drRel.choice === 'follow'
      ? csheet('Flag this for follow-up?', `${r.first} will be told to expect a call, not see the raw result.`, btn('Flag for follow-up', 'd-release-ok'), goBack)
      : csheet('Release this report?', `Comment for ${p.name} (${drPid(r.pid)}): “${c || r.normal}” ${r.first} will be able to see this right away.`, btn(`Release to ${r.first}`, 'd-release-ok'), goBack);
  },
  drsignout: () => signoutSheet("You'll need to sign in again to see today's queue.", 'd-signout'),
  // Desktop adds a medicine in a sheet over the visit; the phone uses a full screen (daddmed).
  draddmed: () => <><div className="scrim" data-act="sheet-close"></div>
    <div className="csheet dr-medsheet" role="dialog" aria-modal="true" aria-labelledby="dm-t"><span className="handle"></span>
      <div className="cs-text"><h2 className="cs-t" id="dm-t">Add another medicine</h2><p className="dr-body tertiary">For {DR_PATIENTS[S.dp].name} · {drPid(S.dp)}</p></div>
      <div className="dm-form">{drMedForm()}</div>
      <div className="cs-acts">{btn('Save medicine', 'd-medsave')}{btn('Cancel', 'sheet-close', { kind: 'secondary' })}</div></div></>,
});
// Clicking anywhere outside an open filter closes it.
onPhone('click', e => { if ((S.app === 'doctor' || S.app === 'desk') && S.drMenu && !e.target.closest('.st-dd-wrap')) { S.drMenu = null; paint(); } });

export function drRelease() { // what releasing does, on either device
  const k = S.drRep, follow = S.drRel.choice === 'follow';
  S.drPending = S.drPending.filter(x => x !== k);
  if (k === 'cbc') { // Anisha's CBC: now released, with this comment, on her side
    S.released = { ...S.released, cbc: { follow, words: S.drRel.comment.trim() || DR_REPORTS.cbc.normal } };
    S.notifs.unshift({ g: 'Today', icon: 'lt-lab.svg', t: 'A lab report is ready', b: 'Open Health to see it.', when: 'Just now', go: 'hreport-cbc' });
  }
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
    go(v.own ? 'dvisitd' : 'dvisito'); },
  'd-addmed': () => { S.drMed = {}; if (S.app === 'desk') { S.dp = S.kSel; S.sheet = 'draddmed'; return render(); } go('daddmed'); },
  'd-mf': arg => { const [k, v] = arg.split(/:(.*)/s); S.drMed[k] = v; S.drMed[`${k}Err`] = ''; paint(); },
  'd-medsave': () => {
    const m = S.drMed;
    for (const k of DR_MED_REQ) m[`${k}Err`] = (m[k] || '').trim() ? '' : 'This field is required.';
    m.endErr = drDateErr(m.end);
    if ([...DR_MED_REQ, 'end'].some(k => m[`${k}Err`])) return render();
    S.drDraft.meds = [...S.drDraft.meds, { name: `${m.name.trim()} ${m.strength.trim()}`, for: (m.purpose || '').trim(), how: m.often, dur: `For ${m.long}${m.end ? `, until ${drShort(m.end)}` : ''}` }];
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
  'd-start': () => { // the doctor moves on: whoever was with them is done, and this patient is with them now
    for (const id of drToday()) if (drStatus(id) === 'with' && id !== S.dp) { if (id === 'as') S.visitDay = 'done'; else S.drq[id] = 'done'; }
    if (S.dp === 'as') S.visitDay = 'with'; else S.drq[S.dp] = 'with';
    const d = DR_DRAFTS[S.dp] || { note: '', meds: [], follow: 'none' };
    S.drDraft = S.drKept[S.dp] || { note: S.drNotes[S.dp] || d.note, meds: [...d.meds], follow: d.follow, followDate: '' }; // a draft closed on the desktop comes back as it was
    go('dvisit', { replace: true });
  },
  'd-follow': v => { S.drDraft.follow = v; render(); },
  'd-complete': () => {
    if (S.dp === 'as') { // what Anisha now sees: her visit complete, these notes, and this follow-up advice
      Object.assign(S, { visitDay: 'done', fuAdvice: S.drDraft.follow, fuDate: S.drDraft.follow === 'other' ? S.drDraft.followDate : '' });
      S.notifs.unshift({ g: 'Today', icon: 'lt-document.svg', t: 'Your visit notes are ready', b: 'Open Health to read them.', when: 'Just now', go: 'hvisit' });
    } else S.drq[S.dp] = 'done';
    S.drNotes[S.dp] = S.drDraft.note;
    S.drVisits = { ...S.drVisits, [S.dp]: { ...S.drDraft } }; // now part of her history
    const { [S.dp]: _, ...kept } = S.drKept; S.drKept = kept;
    Object.assign(S, { stack: [], screen: 'dqueue' }); render();
  },
  'd-report': k => { S.drRep = k; S.drRel = { choice: 'normal', comment: DR_REPORTS[k].normal, edited: false }; go('dreport'); },
  'd-choice': v => { // the comment follows the choice until the doctor writes their own
    const r = DR_REPORTS[S.drRep]; S.drRel.choice = v;
    if (!S.drRel.edited) S.drRel.comment = v === 'follow' ? DR_FOLLOW : r.normal;
    render();
  },
  'd-release': () => { S.sheet = 'drrelease'; render(); },
  'd-release-ok': () => {
    S.sheet = null; drRelease();
    if (S.app === 'desk') { Object.assign(S, { screen: 'kreports', stack: [], kRep: null }); return render(); }
    backTo('dreports');
  },
  'd-settings': sec => { S.drSec = sec; S.drPwErr = ''; drPwClear(); go('dsettings'); },
  'd-set': k => { S.drSet[k] = !S.drSet[k]; drPwClear(); render(); },
  'd-pwsave': () => {
    S.drPwErr = S.drPw1.length < 8 ? 'short' : S.drPw1 !== S.drPw2 ? 'match' : 'saved';
    drPwClear(); render();
  },
  'd-signout-ask': () => { S.sheet = 'drsignout'; render(); },
  'd-signout': () => { Object.assign(S, { drSigned: false, drId: '', drPw: '', drErr: false, sheet: null, stack: [], screen: 'dsignin' }); render(); },
});

// One world, two phones: switching keeps everything, and each phone stays where it was.
export function showApp(app) {
  if (app === S.app) return;
  S.saved[S.app] = { screen: S.screen, stack: [...S.stack] };
  S.app = app;
  const back = S.saved[app] || { patient: { screen: S.signedIn ? 'home' : 'splash', stack: [] }, doctor: { screen: S.drSigned ? 'dqueue' : 'dsignin', stack: [] },
    desk: { screen: S.drSigned ? 'kqueue' : 'ksignin', stack: [] }, staff: { screen: S.stMe ? stHome() : 'ssignin', stack: [] } }[app];
  Object.assign(S, { screen: back.screen, stack: back.stack, sheet: null, picker: null, bio: null, stMenu: null });
  render();
}
export const switchPhone = () => showApp(S.app === 'patient' ? 'doctor' : 'patient');

Object.assign(NUM, {
  dsignin: s => s.drErr ? 'D01b' : 'D01',
  dqueue: s => s.drNoPatients || !drToday().length ? 'D02b' : s.drOffline ? 'D02e' : s.drMenu === 'status' ? 'D02c' : s.drFilt !== 'all' ? 'D02d' : 'D02',
  dpatient: s => s.dp === 'as' && drStatus('as') !== 'done' ? 'D03' : s.dp === 'nt' && drStatus('nt') !== 'done' ? 'D03c'
    : drStatus(s.dp) === 'done' ? 'D03d' : drStatus(s.dp) === 'notarrived' ? 'D03e' : 'D03',
  dhistory: s => s.drMenu === 'doc' ? 'D03h' : 'D03b', dvisitd: () => 'D03f', dvisito: () => 'D03g',
  dvisit: s => s.dp === 'nt' ? 'D04b' : s.drDraft?.follow === 'other' ? 'D04c' : 'D04', daddmed: s => DR_MED_REQ.some(k => s.drMed?.[`${k}Err`]) ? 'D04e' : 'D04d',
  dreports: s => s.drPending.length ? 'D05' : 'D05b', dreport: s => s.sheet === 'drrelease' ? (s.drRel.choice === 'follow' ? 'D06e' : 'D06d') : s.drRep === 'lipid' ? 'D06c' : s.drRel.choice === 'follow' ? 'D06b' : 'D06',
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
  ['D04', 'Complete visit', 'Start visit', "Writing the note and prescribing, with the exact wording that later appears in the patient's own Health tab. Completing it moves Anisha's Care to Visit complete.", DW({ screen: 'dvisit', stack: ['dqueue'], dp: 'as', visitDay: 'with', drq: { ...EXTRA_STATE_DR().drq, nt: 'done' }, drDraft: { ...DR_DRAFTS.as } })],
  ['D04b', 'Complete visit — Nabin', 'Start visit', "Nabin's own diagnosis and prescriptions, distinct from Anisha's.", DW({ screen: 'dvisit', stack: ['dqueue'], dp: 'nt', drDraft: { ...DR_DRAFTS.nt } })],
  ['D05', 'Reports', 'Reports tab', "Lab results waiting for the doctor's review before a patient can see them.", DW({ screen: 'dreports' })],
  ['D05b', 'No reports pending', 'All released', "The reports queue's empty state.", DW({ screen: 'dreports', drPending: [] })],
  ['D06', 'Report detail', "Taps Anisha's CBC", 'Raw lab values, a release decision, and a comment for the patient — the values themselves never reach the patient app.', DW({ screen: 'dreport', stack: ['dreports'], drRep: 'cbc', drRel: { choice: 'normal', comment: DR_REPORTS.cbc.normal } })],
  ['D06b', 'Report — flag follow-up', 'I need to see them again', 'The alternate branch when a result needs a conversation, not just a release. On her side, the report then asks her to book a follow-up.', DW({ screen: 'dreport', stack: ['dreports'], drRep: 'cbc', drRel: { choice: 'follow', comment: DR_FOLLOW } })],
  ['D06c', 'Report detail — Kabita', "Taps Kabita's lipid panel", "A second patient's own report, not a reused stand-in.", DW({ screen: 'dreport', stack: ['dreports'], drRep: 'lipid', drRel: { choice: 'normal', comment: DR_REPORTS.lipid.normal } })],
  ['D07', 'Profile', 'Profile tab', "The doctor's own account — registration, department, and sign out.", DW({ screen: 'dprofile' })],
  ['D07b', 'Account settings', 'Change password / Notifications', "Both settings on one scrollable screen — Profile's two rows land here with the right section already in view.", DW({ screen: 'dsettings', stack: ['dprofile'] })],
  ['D02c', 'Queue — status filter', 'Status', 'One status at a time. Only statuses someone has today are offered, so the list never comes up empty.', DW({ screen: 'dqueue', drMenu: 'status' })],
  ['D02d', 'Queue — filtered', 'Status: Completed', 'The queue narrowed to one status; the progress card still counts the whole day.', DW({ screen: 'dqueue', drFilt: 'done' })],
  ['D02e', 'Queue — offline', 'No connection', "The progress card is what was last loaded; the list itself can't update, so it isn't shown as if it were current.", DW({ screen: 'dqueue', drOffline: true })],
  ['D03h', 'Visit history — doctor filter', 'Doctor', 'All, plus each doctor in her history.', DW({ screen: 'dhistory', stack: ['dqueue', 'dpatient'], dp: 'as', drMenu: 'doc' })],
  ['D03f', 'Visit history — your visit', 'Taps Your visit', 'Her own visit in full: the note, what was prescribed and the follow-up.', DW({ screen: 'dvisitd', stack: ['dqueue', 'dpatient', 'dhistory'], dp: 'as', visitDay: 'done', drVisits: { as: { ...DR_DRAFTS.as, meds: [...DR_DRAFTS.as.meds], followDate: '' } } })],
  ['D03g', 'Visit history — other doctor', 'Taps Other doctor', "Another doctor's visit: date, department and reason only. Notes, reports and medicines stay with the doctor who saw her.", DW({ screen: 'dvisito', stack: ['dqueue', 'dpatient', 'dhistory'], dp: 'as', drHv: 0 })],
  ['D04c', 'Complete visit — other date', 'Other date', 'Other date opens an optional date field: type it, or pick it on the same AD/BS wheels as Date of birth. Dates after today only.', DW({ screen: 'dvisit', stack: ['dqueue'], dp: 'as', visitDay: 'with', drq: { ...EXTRA_STATE_DR().drq, nt: 'done' }, drDraft: { ...DR_DRAFTS.as, meds: [...DR_DRAFTS.as.meds], follow: 'other', followDate: '' } })],
  ['D04d', 'Add another medicine', 'Add another medicine', "The patient's manual-add fields, with How often and For how long chosen rather than typed. Saving adds a card under Medicines.", DW({ screen: 'daddmed', stack: ['dqueue', 'dvisit'], dp: 'as', visitDay: 'with', drDraft: { ...DR_DRAFTS.as, meds: [...DR_DRAFTS.as.meds] }, drMed: {} })],
  ['D04e', 'Add another medicine — missing details', 'Save medicine', 'Every required field says what it needs, all at once. Quantity, Purpose and End date are optional.', DW({ screen: 'daddmed', stack: ['dqueue', 'dvisit'], dp: 'as', visitDay: 'with', drDraft: { ...DR_DRAFTS.as, meds: [...DR_DRAFTS.as.meds] },
    drMed: { nameErr: 'This field is required.', strengthErr: 'This field is required.', formErr: 'This field is required.', oftenErr: 'This field is required.', longErr: 'This field is required.' } })],
  ['D06d', 'Release confirmation', 'Release to Kabita', 'The exact comment, before it reaches the patient. Brand, not red: releasing is the intended outcome.', DW({ screen: 'dreport', stack: ['dreports'], drRep: 'lipid', drRel: { choice: 'normal', comment: DR_REPORTS.lipid.normal }, sheet: 'drrelease' })],
  ['D06e', 'Follow-up confirmation', 'Release with follow-up request', "Flagging asks first too: she'll be told to expect a call, not see the raw result.", DW({ screen: 'dreport', stack: ['dreports'], drRep: 'cbc', drRel: { choice: 'follow', comment: DR_FOLLOW }, sheet: 'drrelease' })],
  ['D07c', 'Sign out', 'Sign out', 'Asks first. Reversible, so Brand, not red.', DW({ screen: 'dprofile', sheet: 'drsignout' })],
]]), ORDER.doctor);
