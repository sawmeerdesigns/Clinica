// Clinica for City Hospital's staff — the hospital web app (1440 × 900). One sign-in; what you see follows your role:
// the administrator, the front desk and HR. Figma: zw3saW6ot26E6gWH20K3ux, section 553:19705.
// Same world as the doctor's apps and Anisha's phone: checking a patient in puts them in Dr. Sharma's queue as Waiting,
// a walk-in for her joins it, and the dashboard counts the reports she hasn't released yet.
import { Fragment } from 'react';
import { Phone, btn, digits, empty, listItem, masked, range, start, support } from './app.jsx';
import { T, acts, say, src } from './ask.jsx';
import { bar, initials, label, row, rows, sk, tag, when } from './booking.jsx';
import { setting, signoutSheet } from './care.jsx';
import { A, ACTIONS, FLOW, NUM, ORDER, OVERLAY, S, SCREENS, after, back, every, extraState, go, later, onPhone, paint, render, reset, sepJoin } from './core.jsx';
import { DR_HISTORY, DR_PATIENTS, EXTRA_STATE_DR, drField, drRadio, drStatus, drTime, drToday, showApp } from './doctor.jsx';
import { field, list } from './health.jsx';
import { ring } from './meds.jsx';

// ---------- data ----------
export const ROLES = {
  doctor: ['Doctor', 'Runs a personal queue, writes notes and releases reports', ["Their own queue and today's patients", 'Writing visit notes and prescriptions', 'Releasing lab reports to patients']],
  desk: ['Front desk', 'Checks patients in and registers walk-ins', ["Today's arrivals across every doctor", 'Check patients in and register walk-ins', 'Search and match returning patients']],
  hr: ['HR manager', 'Manages the staff directory and leave requests', ['The whole staff directory, not just doctors', 'Leave requests and approvals', 'Individual staff records and contact details']],
  admin: ['Hospital administrator', 'Sees hospital-wide dashboards, doctors and departments', ['Hospital-wide dashboard and reports', 'Full doctor roster and departments', 'Settings, including adding doctors and assigning roles']],
};
// id: initials, name, job title, department, access role, employee ID, joined
export const STAFF = Object.entries({
  ps: ['PS', 'Dr. Priya Sharma', 'Doctor', 'General medicine', 'doctor', 'CH-0231', 'Jun 2019'],
  rs: ['RS', 'Dr. Ramesh Shrestha', 'Doctor', 'General medicine', 'doctor', 'CH-0198', 'Feb 2017'],
  aj: ['AJ', 'Dr. Anita Joshi', 'Doctor', 'General medicine', 'doctor', 'CH-0244', 'Aug 2020'],
  bt: ['BT', 'Dr. Bikash Thapa', 'Doctor', 'Dermatology', 'doctor', 'CH-0212', 'Apr 2018'],
  sr: ['SR', 'Dr. Sunita Rai', 'Doctor', 'Paediatrics', 'doctor', 'CH-0226', 'Jan 2019'],
  kg: ['KG', 'Dr. Kiran Gurung', 'Doctor', 'Gynaecology', 'doctor', 'CH-0251', 'Mar 2021'],
  sk: ['SK', 'Dr. Suman KC', 'Doctor', 'Cardiology', 'doctor', 'CH-0187', 'Sep 2016'],
  ms: ['MS', 'Dr. Maya Shrestha', 'Doctor', 'Dermatology', 'doctor', 'CH-0263', 'Nov 2022'],
  sbr: ['SbR', 'Sabina Rai', 'Front desk', 'Reception', 'desk', 'CH-STF-0204', 'May 2021'],
  rk: ['RK', 'Rajesh Koirala', 'Administrator', 'Hospital management', 'admin', 'CH-ADM-04', 'Jul 2015'],
  ab: ['AB', 'Anjali Basnet', 'HR manager', 'Human resources', 'hr', 'CH-HR-03', 'Oct 2018'],
  mt: ['MT', 'Maya Tuladhar', 'Nurse', 'General medicine', 'doctor', 'CH-STF-0231', 'Mar 2022'],
  pk: ['PsK', 'Prasant Khadka', 'Nurse', 'Cardiology', 'doctor', 'CH-STF-0247', 'Jan 2023'],
  nl: ['NL', 'Nirmala Lama', 'Lab technician', 'City Hospital lab', 'doctor', 'CH-STF-0219', 'Jun 2020'],
}).map(([id, [ini, name, title, dept, access, emp, joined]]) => ({ id, ini, name, title, dept, access, emp, joined }));
// The roster: OPD, patients booked today, duty, NMC registration, next free slot, reports waiting on them.
export const DOC = {
  ps: ['OPD 2', 8, 'on', '12345', '5:30 PM', 2], rs: ['OPD 1', 6, 'on', '9231', '10:15 AM', 2], aj: ['OPD 3', 5, 'on', '10877', '11:00 AM', 1],
  bt: ['OPD 5', 4, 'on', '11502', '2:30 PM', 1], sr: ['OPD 6', 7, 'on', '9874', '3:45 PM', 1], kg: ['OPD 7', 3, 'on', '12210', '1:15 PM', 0],
  sk: ['OPD 4', 0, 'off', '8456', '', 0], ms: ['OPD 5', 0, 'leave', '11930', '', 0],
};
export const DEPTS = { gm: ['General medicine', 'OPD 1–3', ['ps', 'rs', 'aj']], derm: ['Dermatology', 'OPD 5', ['bt', 'ms']], paed: ['Paediatrics', 'OPD 6', ['sr']], gyn: ['Gynaecology', 'OPD 7', ['kg']], card: ['Cardiology', 'OPD 4', ['sk']] };
// Today's arrivals with other doctors; Dr. Sharma's come from her queue (doctor.jsx). name, initials, info, doctor, time, reason, history
export const ARR = {
  sl: ['Sabin Lama', 'SL', 'Male · 34 · CH-1765', 'rs', '10:15 AM', 'Back pain', [['Apr 2, 2026', 'Dr. Ramesh Shrestha · Back pain']]],
  nk: ['Nisha Karki', 'NK', 'Female · 29 · CH-2033', 'aj', '11:30 AM', 'Migraine', []],
  rt: ['Rita Thapa', 'RT', 'Female · 62 · CH-2411', 'rs', '3:00 PM', 'Follow-up, diabetes review', [['Jul 14, 2026', 'Dr. Ramesh Shrestha · Diabetes review']]],
  bp: ['Binod Pandey', 'BP', 'Male · 47 · CH-1490', 'aj', '3:15 PM', 'Chest pain on exertion', []],
  pa: ['Prakash Adhikari', 'PA', 'Male · 55 · CH-1302', 'rs', '5:15 PM', 'General checkup', []],
  st: ['Sunita Thapa', 'ST', 'Female · 41 · CH-1187', 'rs', '5:15 PM', 'Follow-up, hypertension review', [['Jan 14, 2026', 'Dr. Ramesh Shrestha · Blood pressure check']], '+977 98XX-XX8821'],
  kb: ['Kiran Basnet', 'KB', 'Male · 38 · CH-1956', 'rs', '', 'Chest infection', [['Aug 12, 2026', 'Dr. Ramesh Shrestha · Chest infection'], ['May 30, 2026', 'Dr. Priya Sharma · General checkup'], ['Feb 9, 2026', 'Dr. Ramesh Shrestha · Cough']]],
};
// Everyone on the hospital's books: id, usual doctor, visits, last visit.
export const PATS = [['as', 'ps', 4, 'Aug 28, 2026'], ['bt', 'ps', 2, 'Aug 28, 2026'], ['sm', 'ps', 1, 'Aug 28, 2026'], ['di', 'ps', 3, 'Aug 28, 2026'], ['sl', 'rs', 1, 'Aug 28, 2026'],
  ['kg', 'ps', 2, 'Aug 28, 2026'], ['nk', 'aj', 1, 'Aug 28, 2026'], ['rb', 'ps', 1, 'Aug 28, 2026'], ['rt', 'rs', 2, 'Aug 28, 2026'], ['bp', 'aj', 1, 'Aug 28, 2026'],
  ['nt', 'ps', 3, 'Aug 28, 2026'], ['sk', 'ps', 2, 'Mar 3, 2026'], ['pa', 'rs', 1, 'Aug 28, 2026'], ['kb', 'rs', 3, 'Aug 12, 2026'], ['st', 'rs', 1, 'Jan 14, 2026']];
export const EARLIER = { di: [['Nov 4, 2025', 'Dr. Priya Sharma · Skin rash']], sk: [['Oct 21, 2025', 'Dr. Priya Sharma · General checkup']],
  as: [['Aug 12, 2026', 'Dr. Ramesh Shrestha · Ear infection'], ['Jul 3, 2026', 'Dr. Anita Joshi · General checkup'], ['Jun 20, 2026', 'Dr. Anita Joshi · Walk-in']] };
export const LEAVES = {
  ms: { type: 'Sick leave', dates: 'Aug 26 – Sep 2, 2026', days: '8 days', asked: 'Aug 20, 2026' },
  pk: { type: 'Annual leave', dates: 'Sep 5 – Sep 7, 2026', days: '3 days', asked: 'Aug 30, 2026', note: '3 days off leaves the cardiology ward with one nurse on those dates.' },
};
// August so far: total working days, present, on leave, absent.
export const ATT = { ps: [20, 20, 0, 0], rs: [20, 19, 1, 0], aj: [20, 20, 0, 0], bt: [20, 20, 0, 0], sr: [20, 19, 1, 0], kg: [20, 20, 0, 0], sk: [20, 18, 0, 2], ms: [20, 12, 8, 0],
  sbr: [20, 20, 0, 0], rk: [20, 20, 0, 0], ab: [20, 20, 0, 0], mt: [20, 20, 0, 0], pk: [20, 20, 0, 0], nl: [20, 19, 0, 1] };
export const PHONE_END = { sk: '0234' }; // masked numbers keep their last four digits on record
export const SIGN_IDS = { 'CH-ADM-04': 'rk', 'CH-FD-12': 'sbr', 'CH-HR-03': 'ab' };

export const EXTRA_STATE_ST = () => ({
  stMe: null, stErr: false, stForgot: false, stHoliday: false, stAccess: {}, stDocs: [], walk: {}, ckAt: {},
  rq: { sl: 'done', nk: 'done', rt: 'waiting', bp: 'with', pa: 'notarrived' }, leave: { ms: 'approved', pk: 'pending' },
  stQ: '', stMenu: null, stF: {}, stSort: '', stRange: [], stSel: [], stId: null, stWho: [], stPick: null, stDone: '',
  wk: { type: 'new' }, wkErr: {}, stAdd: {}, stAddErr: {}, stAdded: null, stHospSaved: false, stSet: { leave: true, reports: true, staff: false },
  stSignId: '', // the Admin ID field
  stFrom: null, // where Add a doctor was opened from, for its back link
  stDepts: [], stMoved: {}, stDept: { docs: [] }, stDeptErr: {}, stDeptAdded: null, // Add a department
  stStaff: [], stNew: {}, stNewErr: {}, // Add staff
  stCalM: 7, stCalDay: null, // attendance calendar: month shown (0 = Jan) and the day tapped
});
extraState(EXTRA_STATE_ST, ORDER.staff);
export const STAFF_START = () => ({ app: 'staff', screen: 'ssignin', signedIn: true, visitDay: 'checkedin', followup: null });

// ---------- the shared world ----------
export const people = () => [...STAFF, ...S.stDocs.map(d => ({ ...d, title: 'Doctor', dept: d.spec, access: 'doctor', emp: d.emp, joined: 'Aug 2026' })), ...S.stStaff]
  .map(p => ({ ...p, access: S.stAccess[p.id] || p.access, dept: S.stMoved[p.id] ? deptOf(S.stMoved[p.id])[0] : p.dept }));
export const person = id => people().find(p => p.id === id);
export const stMe = () => person(S.stMe);
export const stHome = () => ({ admin: 'sdash', desk: 'sarr', hr: 'shdash' })[stMe()?.access] || 'ssignin';
export const roster = () => people().filter(p => p.title === 'Doctor');
export const docOf = id => { const d = S.stDocs.find(x => x.id === id); return d ? [d.opd || '', 0, 'off', d.nmc || '', '', 0] : DOC[id]; };
export const walkFor = id => Object.values(S.walk).filter(w => w.doc === id && w.doc !== 'ps').length; // Dr. Sharma's walk-ins are in her own queue
export const ptToday = id => id === 'ps' ? drToday().length : docOf(id)[1] + walkFor(id);
export const duty = id => docOf(id)[2];
export const repsOf = id => id === 'ps' ? S.drPending.length : docOf(id)[5];
export const DUTY = { on: ['On duty', 'success'], off: ['Off duty', 'neutral'], leave: ['On leave', 'warn'] };
export const ARR_TAG = { done: ['Completed', 'neutral'], waiting: ['Waiting', 'warn'], with: ['With doctor', 'success'], notarrived: ['Not arrived', 'error'] }; // a no-show most needs Reception's attention
export const pid = k => (arr(k).info.match(/CH-\d+/) || [])[0] || ''; // the record's own ID; a new walk-in has none yet
export const staffStatus = p => p.id === 'ms' ? 'On leave' : 'Active';
// Departments, with any added today; a doctor moved into a new one leaves their old one (one department each).
export const depts = () => [...Object.entries(DEPTS), ...S.stDepts.map(d => [d.k, [d.name, d.opd, []]])]
  .map(([k, [name, opd, ids]]) => [k, [name, opd, [...ids.filter(i => !S.stMoved[i]), ...Object.keys(S.stMoved).filter(i => S.stMoved[i] === k)]]]);
export const deptOf = k => Object.fromEntries(depts())[k];
export const isNewDept = k => S.stDepts.some(d => d.k === k); // added today: running, nobody seen yet
export const deptPts = k => isNewDept(k) ? 0 : deptOf(k)[2].reduce((s, i) => s + ptToday(i), 0);
// Who can sign in to what follows the job: the same access the existing staff with that title have.
export const ACCESS_OF = { Doctor: 'doctor', 'Front desk': 'desk', 'HR manager': 'hr', Administrator: 'admin', Nurse: 'doctor', 'Lab technician': 'doctor' };
export const signoutBody = { desk: "You'll need to sign in again to see today's check-ins.", hr: "You'll need to sign in again to see staff and leave requests.", admin: "You'll need to sign in again to manage the hospital." };

// A patient as reception sees them today. Dr. Sharma's take their place in the queue from her app.
export function arr(k) {
  const w = S.walk[k];
  if (w) return w;
  const p = DR_PATIENTS[k];
  if (p) return { name: p.name, ini: p.ini, info: p.info, doc: 'ps', time: drTime(k), reason: p.reason, phone: '+977 98XX-XXXXXX',
    hist: DR_HISTORY[k] || (p.hist ? p.hist.split(', ').map(d => [`${d}, 2026`, `Dr. Priya Sharma · ${k === 'sk' ? 'General checkup' : p.short}`]) : []) };
  const [name, ini, info, doc, time, reason, hist, phone = '+977 98XX-XXXXXX'] = ARR[k];
  return { name, ini, info, doc, time, reason, hist, phone };
}
export const inDrQueue = k => k === 'as' || (DR_PATIENTS[k] && k in S.drq);
export const arrSt = k => inDrQueue(k) ? drStatus(k) : S.rq[k];
export const mins = t => { const [, h, m, pm] = t.match(/(\d+):(\d+) (PM|AM)/); return (+h % 12 + (pm === 'PM' ? 12 : 0)) * 60 + +m; };
export const clock = m => `${Math.floor(m / 60) % 12 || 12}:${String(m % 60).padStart(2, '0')} ${m >= 720 ? 'PM' : 'AM'}`;
export const now = () => clock(16 * 60 + 52 + 3 * (Object.keys(S.ckAt).length + Object.keys(S.walk).length)); // the day's clock moves with each arrival
export const arrivals = () => S.stHoliday ? [] : [...new Set([...drToday(), ...Object.keys(S.rq)])].sort((a, b) => mins(arr(a).time) - mins(arr(b).time));
export const dname = id => person(id)?.name || '';
export const inis = n => n.replace(/^Dr\.\s*/, '').split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0].toUpperCase()).join('');

// Patients: the records, plus anyone registered as new today.
export const patients = () => [...PATS.map(([k, doc, visits, last]) => ({ k, doc, visits, last, ...nameOf(k) })),
  ...Object.entries(S.walk).filter(([, w]) => w.isNew).map(([k, w]) => ({ k, doc: w.doc, visits: 1, last: 'Aug 28, 2026', name: w.name, ini: w.ini }))];
export const nameOf = k => { const a = arr(k); return { name: a.name, ini: a.ini }; };
// Every visit on record, one row each: today's patients by appointment time, then the rest by last visit; each patient's visits newest first.
export function visitRows() {
  const today = p => p.last === 'Aug 28, 2026';
  return [...patients()].sort((x, y) => today(x) !== today(y) ? today(y) - today(x) : today(x) ? mins(arr(x.k).time) - mins(arr(y.k).time) : Date.parse(y.last) - Date.parse(x.last))
    .flatMap(p => histOf(p.k, p.visits, p.last).map(([date, what], i) => {
      const doc = what.split(' · ')[0];
      return { id: `${p.k}|${i}`, k: p.k, name: p.name, ini: p.ini, pid: pid(p.k), doc, dept: roster().find(d => d.name === doc)?.dept || '', date,
        when: date === 'Aug 28, 2026' ? `Aug 28, ${arr(p.k).time}` : date };
    }));
}
export function histOf(k, visits, last) {
  const a = arr(k), today = last === 'Aug 28, 2026' ? [['Aug 28, 2026', `${dname(a.doc)} · ${a.reason}`]] : [];
  return [...today, ...(EARLIER[k] || a.hist.filter(([d]) => d !== 'Aug 28, 2026'))].slice(0, visits);
}

// ---------- pieces ----------
export const NAV = {
  admin: [['Dashboard', 'dnav-dashboard-secondary', 'dnav-dashboard-active', 'sdash'], ['Doctors', 'dnav-doctors', 'dnav-doctors-active', 'sdocs'],
    ['Departments', 'dnav-departments', 'dnav-departments-active', 'sdepts'], ['Patients', 'snav-profile', 'snav-profile-active', 'spats'],
    ['Reception', 'dnav-reception', 'snav-checkin-active', 'sarr'], ['Staff', 'dnav-staff', 'icon-group-filled-action-20', 'sstaff'], ['Settings', 'dnav-settings', 'dnav-settings-active', 'sset']],
  desk: [['Check-in', 'snav-checkin-active', 'snav-checkin-active', 'sarr'], ['Patients', 'snav-profile', 'snav-profile-active', 'spats']],
  hr: [['Dashboard', 'dnav-dashboard-secondary', 'dnav-dashboard-active', 'shdash'], ['Staff', 'dnav-staff-primary', 'icon-group-filled-action-20', 'sstaff'],
    ['Leave requests', 'icon-schedule-secondary-20', 'dnav-leave-active', 'sleave'], ['Attendance', 'icon-calendar-month-secondary-20', 'dnav-attendance-active', 'satt']],
};
export const SEC = { sdoc: 'sdocs', sdept: 'sdepts', spat: 'spats', scheck: 'sarr', swalk: 'sarr', smatch: 'sarr', sperson: 'sstaff',
  sadd: 'sset', sroles: 'sset', srole: 'sset', sacct: 'sset', shosp: 'sset', sreq: 'sleave', satt1: 'satt', sadddept: 'sdepts', saddst: 'sstaff' };
export const secOf = sc => sc === 'sadd' && S.stFrom === 'sdocs' ? 'sdocs' : SEC[sc] || sc; // Add a doctor belongs to wherever it was opened from
export const img = (f, s = 20) => <img src={`${A}${f}.svg`} width={s} height={s} alt="" />;
export const mtJoin = items => items.map((x, i) => <Fragment key={i}>{i > 0 && <div className="mt-sep" aria-hidden="true" />}{x}</Fragment>);

export function sSide() {
  const me = stMe(), root = secOf(S.screen);
  const menu = <div className="st-dd up" role="menu">{me.access === 'admin' ? <button className="st-opt" role="menuitem" data-act="st-go:sacct">Account settings</button> : null}
    <button className="st-opt" role="menuitem" data-act="st-signout">Sign out</button></div>;
  return <aside className="k-side st"><div className="k-top"><p className="k-logo">Clinica</p><nav className="k-nav" aria-label="Main">{NAV[me.access].map(([l, i, ia, sc]) => sc !== root
    ? <a key={sc} href="#" className="k-ni" data-act={`st-go:${sc}`}>{img(i)}{l}</a>
    : S.screen === sc ? <span key={sc} className="k-ni on" aria-current="page">{img(ia)}{l}</span> // below the section root, the active item leads back to it
      : <a key={sc} href="#" className="k-ni on" aria-current="page" data-act={`st-go:${sc}`}>{img(ia)}{l}</a>)}</nav></div>
    <div className="st-dd-wrap">{S.stMenu === 'me' ? menu : null}<button className="k-me" data-act="st-menu:me" aria-haspopup="menu" aria-expanded={S.stMenu === 'me'}><span className="avatar">{initials(me.name)}</span>
      <span className="st-me"><span className="item-title">{me.name}</span><span className="dr-body">{ROLES[me.access][0]}</span></span></button></div></aside>;
}
export const sPage = (inner, cls = '') => <div className="screen k">{sSide()}<main className={`st-main ${cls}`}>{inner}</main></div>;
export const sHead = (t, sub, right = null) => <div className="st-hd"><div className="st-ttl"><h1 className="k-h2">{t}</h1><p className="dr-sub">{sub}</p></div>{right}</div>;
// Typing re-renders in place; React keeps the input, so focus and caret stay put.
export const sSearch = ph => <div className="field st-search"><input id="st-q" type="search" placeholder={ph} aria-label={ph} value={S.stQ}
  onChange={e => { S.stQ = e.target.value; S.stSel = []; sRe(); }} /></div>;
export const sBack = (label, sc) => <a href="#" className="k-link" data-act={`st-go:${sc}`}>{img('icon-chevron-left-action-16', 16)}{label}</a>;
export const sWho = (ini, name, sub, right = null, h = 'k-name') => <div className="st-hd"><div className="k-id"><span className="avatar l">{ini}</span><div><p className={h}>{name}</p><p className="dr-sub">{sub}</p></div></div>{right}</div>;
export const sSec = (t, inner) => <section className="stack16"><h2 className="st-sec">{t}</h2>{inner}</section>;
export const sStats = stats => <div className="st-stats fix">{stats.map(([v, l, c]) => <div key={l} className="st-stat"><p className="k-h2">{v}</p><p className="st-sl">{l}</p><p className="dr-body">{c}</p></div>)}</div>;
// A pick-list field: the native select, dressed as a text field.
export const sSelect = (id, label, ph, value, opts, err, onChange) => <div className="field-wrap"><label className="label" htmlFor={id}>{label}</label>
  <div className={`field st-sel ${err ? 'err' : ''}`}><select id={id} value={value || ''} onChange={onChange} className={value ? '' : 'ph'}>
    <option value="" disabled>{ph}</option>{opts.map(o => <option key={o} value={o}>{o}</option>)}</select>{img('icon-chevron-down-secondary-14', 14)}</div>{err ? support(err, 'err') : null}</div>;
export const sKV = rows => <div className="mt-list">{mtJoin(rows.map(([k, v]) => <div className="st-kv"><span>{k}</span><b>{v}</b></div>))}</div>;
export const sHist = rows => <div className="mt-list">{sepJoin(rows.map(([d, s]) => row('lt-history.svg', d, s)))}</div>;
export const sTag = ([t, tone]) => tag(t, `${tone} s12`);
export const sOk = (t, deny) => <p className={`st-ok ${deny ? 'n' : ''}`} role="status">{img(deny ? 'icon-cancel-secondary-20' : 'icon-check-circle-success-20')}{t}</p>;
export const sEmpty = (icon, t, b) => <div className="st-empty">{img(icon, 32)}<p className="st-et">{t}</p><p className="dr-body">{b}</p></div>;
export const cb = on => <span className={`cb ${on ? 'on' : ''}`} aria-hidden="true">{on ? img('icon-check-white-14', 14) : null}</span>;
export const cbBtn = (on, act, label) => <button className="cb-btn" role="checkbox" aria-checked={on} aria-label={label} data-act={act}>{cb(on)}</button>;
export const sPager = <nav className="st-pg" aria-label="Pages"><button className="st-pb" disabled>{img('icon-arrow-back-disabled-16', 16)}Previous</button>
  <span className="st-pill" aria-current="page">1</span><button className="st-pb" disabled>Next{img('icon-arrow-forward-disabled-16', 16)}</button></nav>;

// Filter chips open their own panel, 4px below; a click anywhere else closes it.
export const chip = (key, label, on, panel) => <div className="st-dd-wrap"><button className={`st-chip ${on ? 'on' : ''}`} data-act={`st-menu:${key}`} aria-haspopup="true" aria-expanded={S.stMenu === key}>{label}
  {img(`icon-chevron-down-${on ? 'action' : 'secondary'}-14`, 14)}</button>{S.stMenu === key ? panel() : null}</div>;
// one = a single choice: the same panel, but picking replaces the choice (picking it again clears it).
export const checks = (key, opts, w = 240, one = false) => <div className="st-dd" style={{ width: w }} role="menu">{opts.map(([v, n]) => { const on = (S.stF[key] || []).includes(v);
  return <button key={v} className="st-opt" role={one ? 'menuitemradio' : 'menuitemcheckbox'} aria-checked={on} data-act={`${one ? 'st-f1' : 'st-f'}:${key}|${v}`}><span className="l">{cb(on)}{v}</span><span className="n">{n}</span></button>; })}</div>;
export const radios = (opts, w = 260) => <div className="st-dd" style={{ width: w }} role="menu">{opts.map(([v, l]) =>
  <button key={v} className="st-opt r" role="menuitemradio" aria-checked={S.stSort === v} data-act={`st-sort:${v}`}><span>{l}</span><span className="ring"></span></button>)}</div>;
export const fLabel = (key, base) => { const v = S.stF[key] || []; return v.length ? `${base}: ${v.length === 1 ? v[0] : `${v.length} selected`}` : base; };
export const counts = (list, f) => Object.entries(list.reduce((m, x) => ({ ...m, [f(x)]: (m[f(x)] || 0) + 1 }), {}));
export const filtered = (list, fs) => list.filter(x => Object.entries(fs).every(([k, f]) => !(S.stF[k] || []).length || S.stF[k].includes(f(x))));
export const results = (n, total, what) => S.stQ ? `${n} result${n === 1 ? '' : 's'} for “${S.stQ}”` : `${n} of ${total} · filtered by ${what}`;

// A table: checkbox column, fixed-width cells, then whatever sits at the right edge.
export let stVisible = [];
export function sTable(cols, items, cells, act) {
  stVisible = items.map(x => x.id);
  const all = items.length && items.every(x => S.stSel.includes(x.id));
  return <div className="st-tbl"><div className="st-th" role="row">{cbBtn(all, 'st-cball', 'Select all')}{cols.map(([l, w], i) => w ? <span key={i} style={{ width: w }}>{l}</span> : <Fragment key={i}><span className="sp"></span><span>{l}</span></Fragment>)}</div>
    <div className="st-rows">{sepJoin(items.map(x => <div className="st-tr" role="row" {...(act ? { 'data-act': `${act}:${x.id}`, tabIndex: 0 } : {})}>{cbBtn(S.stSel.includes(x.id), `st-cb:${x.id}`, `Select ${x.name}`)}{cells(x)}</div>))}</div></div>;
}
export const nmCell = (x, w) => <span className="nm" style={{ width: w }}><span className="avatar">{x.ini}</span>{x.name}</span>;
export const cell = (t, w, cls = '') => <span className={cls} style={{ width: w }}>{t}</span>;
export const byQ = (list, ...fs) => { const q = S.stQ.trim().toLowerCase(); return q ? list.filter(x => fs.some(f => f(x).toLowerCase().includes(q))) : list; };

// A row of today's arrivals — the doctor's queue row, with the doctor where the reason was.
export const arrRow = k => {
  const a = arr(k), st = arrSt(k), past = st === 'done';
  return <button className="list-item k-row" data-act={`st-arr:${k}`}><span className="avatar">{a.ini}</span>
    <span className="dq-t"><span className={`h-s ${past ? 'past' : ''}`}>{a.name}</span>{pid(k) ? <span className="st-pid">{pid(k)}</span> : null}<span className="dq-r">{dname(a.doc)} · {docOf(a.doc)[0]}</span>
      <span className="dq-m"><span className={past ? 'past' : 'now'}>{a.time}</span>{sTag(ARR_TAG[st])}</span></span></button>;
};

// ---------- screens ----------
Object.assign(SCREENS, {
  // The Sign in button's click signs in, and Enter in a field clicks it, so the form itself only stops the page submitting.
  ssignin: () => <div className="screen k k-sign"><form className="k-card" id="st-form" noValidate onSubmit={e => e.preventDefault()}>
      <div className="dr-brand"><p className="wordmark-s">Clinica</p><p className="dr-sub">Hospital management — City Hospital</p></div>
      <div className="fields st-f8"><div className="field-wrap"><label className="label" htmlFor="st-id">Admin ID</label><div className="field"><input id="st-id" placeholder="e.g. CH-ADM-04" autoComplete="username"
        value={S.stSignId} onChange={e => { S.stSignId = e.target.value; paint(); }} /></div></div>
        {drField('st-pw', 'Password', 'Password', S.stErr ? 'Admin ID or password is incorrect. Try again.' : '')}
        <a href="#" className="dr-link" data-act="st-forgot">Forgot your password?</a>{S.stForgot ? support('IT support can reset it — call extension 210.') : null}</div>
      <div className="stack12">{btn('Sign in', 'st-signin', { size: 'l' })}<p className="dr-body tertiary" style={{ textAlign: 'center' }}>Trouble signing in? Call IT support.</p></div>
    </form></div>,

  // ----- Administrator -----
  sdash: () => {
    const docs = roster(), on = docs.filter(d => duty(d.id) === 'on'), h = S.stHoliday;
    const stats = [[h ? 0 : docs.reduce((s, d) => s + ptToday(d.id), 0), 'Patients today', 'Across all departments'], [h ? 0 : on.length, 'Doctors on duty', `Of ${docs.length} on the roster`],
      [h ? 0 : docs.reduce((s, d) => s + repsOf(d.id), 0), 'Reports pending', 'Waiting on doctor review'], [arrivals().filter(k => arrSt(k) === 'notarrived').length, 'Not yet arrived', 'Booked, not checked in']];
    return sPage(<>{sHead('Today', 'Aug 28, 2026 · City Hospital')}
      <div className="st-stats">{stats.map(([v, l, c]) => <div key={l} className="st-stat"><p className="k-h2">{v}</p><p className="st-sl">{l}</p><p className="dr-body">{c}</p></div>)}</div>
      <section className={`stack8 ${h ? 'st-grow' : ''}`}><div className="st-hd"><h2 className="dr-h1" style={{ fontSize: 20, lineHeight: '24px' }}>Doctors on duty</h2><a href="#" className="st-a" data-act="st-go:sdocs">View all doctors</a></div>
        {h ? sEmpty('icon-event-available-tertiary-32', 'No doctors on duty', 'Public holiday — check back tomorrow.')
          : <div className="st-rows">{sepJoin(on.map(d => <button className="list-item st-dr" data-act={`st-doc:${d.id}`}><span className="avatar">{d.ini}</span>
            <span className="dq-t"><span className="st-nm">{d.name}</span><span className="dr-body">{d.dept} · {docOf(d.id)[0]}</span></span>
            <span className="dr-body">{ptToday(d.id)} patients today</span>{sTag(DUTY.on)}</button>))}</div>}</section>
      {/* HR's numbers only: who is on leave, and why, stays in HR (Figma 685:31360). */}
      <section className="stack16"><h2 className="st-sec">Staff (HR)</h2>
        {sStats([[people().length, 'Total staff', 'Across all roles'], [people().filter(p => staffStatus(p) === 'On leave').length, 'On leave today', 'Operational count only']])}
        <p className="dr-body tertiary">Who's on leave and why stays in HR — Administrator sees counts only.</p></section></>);
  },

  sdocs: () => {
    const all = roster(), on = all.filter(d => duty(d.id) === 'on').length;
    let list = filtered(byQ(all, d => d.name, d => d.dept), { dept: d => d.dept, status: d => DUTY[duty(d.id)][0] });
    if (S.stSort) list = [...list].sort((a, b) => (ptToday(b.id) - ptToday(a.id)) * (S.stSort === 'pt-asc' ? -1 : 1));
    const fil = S.stQ || (S.stF.dept || []).length || (S.stF.status || []).length;
    return sPage(<>{sHead('Doctors', fil ? results(list.length, all.length, (S.stF.dept || []).length ? 'department' : 'status') : `${all.length} on the roster · ${on} on duty today`,
      <>{sSearch('Search doctors')}<button className="btn primary l hug" data-act="st-adddoc">{img('icon-add-white-24', 24)}Add doctor</button></>)}
      <div className="st-chips">{chip('dept', fLabel('dept', 'Department'), (S.stF.dept || []).length, () => checks('dept', counts(all, d => d.dept)))}
        {chip('status', fLabel('status', 'Status'), (S.stF.status || []).length, () => checks('status', ['On duty', 'Off duty', 'On leave'].map(s => [s, all.filter(d => DUTY[duty(d.id)][0] === s).length])))}
        {chip('sort', S.stSort ? `Sort: ${S.stSort === 'pt-asc' ? 'Lowest' : 'Highest'} patients` : 'Sort: Patients today', S.stSort, () => radios([['pt-desc', 'Highest to lowest patients'], ['pt-asc', 'Lowest to highest patients']]))}</div>
      {sTable([['Doctor', 320], ['Department', 260], ['Patients today', 180], ['Status']], list,
        d => <>{nmCell(d, 320)}{cell(`${d.dept} · ${docOf(d.id)[0]}`, 260)}{cell(ptToday(d.id), 180)}<span className="sp"></span>{sTag(DUTY[duty(d.id)])}</>, 'st-doc')}
      {sPager}</>, 'st-acts');
  },

  sdoc: () => {
    const d = person(S.stId), [opd, , , nmc, slot] = docOf(d.id), st = duty(d.id), extra = S.stDocs.find(x => x.id === d.id);
    const email = extra?.email || `${d.name.replace(/^Dr\.\s*/, '').toLowerCase().replace(/\s+/g, '.')}@cityhospital.np`;
    return sPage(<>{sBack('Doctors', 'sdocs')}{sWho(d.ini, d.name, `${d.dept}${opd ? ` · ${opd}` : ''}`, sTag(DUTY[st]))}
      {sSec('Details', sKV([['NMC registration', nmc || '—'], ['Phone', extra?.phone || '+977 98XX-XXXXXX'], ['Email', email], ['Working days', extra?.days || 'Sun–Thu, 9 AM–5 PM']]))}
      {sSec('Today', sKV([['Patients today', ptToday(d.id)], ['Reports pending', repsOf(d.id)], ['Next available slot', st === 'on' ? slot : st === 'leave' ? 'On leave' : 'Not in today']]))}</>);
  },

  sdepts: () => sPage(<>{sHead('Departments', `${7 + S.stDepts.length} OPDs · City Hospital`,
      <button className="btn primary l hug" data-act="st-newdept">{img('icon-add-white-24', 24)}Add department</button>)}<div className="st-grid">{depts().map(([k, [name, opd, ids]]) => {
    const on = ids.filter(i => duty(i) === 'on'), sur = i => `Dr. ${dname(i).split(' ').pop()}`, run = on.length || isNewDept(k);
    const who = on.length ? [on.map(sur).join(', '), ...ids.filter(i => duty(i) === 'leave').map(i => `${sur(i)} on leave`)].join(' · ') : ids.length ? `${ids.map(sur).join(', ')} — not in today` : null;
    return <a key={k} href="#" className="st-dept" data-act={`st-dept:${k}`}><span className="st-hd"><span className="st-nm">{name}</span>{tag(run ? 'Running' : 'Closed today', `${run ? 'success' : 'neutral'} s12 sm`)}</span>
      <span className="dr-body">{opd}</span>{who ? <span className="dr-body tertiary">{who}</span> : null}<span className="st-nm">{deptPts(k)} patients today</span></a>; })}</div></>),

  sdept: () => {
    const [name, opd, ids] = deptOf(S.stId), on = ids.filter(i => duty(i) === 'on'), opds = new Set(ids.map(i => docOf(i)[0])), onOpds = new Set(on.map(i => docOf(i)[0]));
    const leave = ids.filter(i => duty(i) === 'leave').length;
    return sPage(<>{sBack('Departments', 'sdepts')}{sHead(name, `${opd} · ${ids.length} doctor${ids.length === 1 ? '' : 's'}`, sTag(on.length || isNewDept(S.stId) ? ['Running', 'success'] : ['Closed today', 'neutral']))}
      {sSec('Doctors', <div className="mt-list">{sepJoin(ids.map(i => { const st = duty(i); return <div className="st-kv"><span className="st-who"><span className="avatar">{person(i).ini}</span><b>{dname(i)} · {docOf(i)[0]}</b></span>
        <span className="dr-body">{st === 'on' ? `${ptToday(i)} patients today` : st === 'leave' ? 'On leave' : 'Not in today'}</span></div>; }))}</div>)}
      {sSec('Today', sKV([['Patients seen', deptPts(S.stId)], ['OPDs running', `${onOpds.size} of ${opds.size}`],
        leave ? ['Staff on leave', leave] : ['Not yet arrived', arrivals().filter(k => ids.includes(arr(k).doc) && arrSt(k) === 'notarrived').length]]))}</>);
  },

  // One row per visit, so a patient seen four times has four rows (Figma 651:6946). Shared by the front desk and the administrator.
  spats: () => {
    const all = visitRows(), [a, b] = S.stRange;
    let list = filtered(byQ(all, v => v.name, v => v.pid), { dept: v => v.dept, doc: v => v.doc });
    if (b) list = list.filter(v => { const m = v.date.match(/^Aug (\d+), 2026$/); return m && +m[1] >= a && +m[1] <= b; });
    if (S.stSort) list = [...list].sort((x, y) => x.name.localeCompare(y.name) * (S.stSort === 'name-desc' ? -1 : 1)); // stable: each patient's visits stay newest first
    const range = b ? `Aug ${a} – ${b}, 2026` : a ? `Aug ${a}, 2026` : 'Visited date';
    const by = [...['dept', 'doc'].filter(k => (S.stF[k] || []).length).map(k => ({ dept: 'department', doc: 'doctor' })[k]), ...(b ? ['visited date'] : [])].join(' and ');
    const sortBtn = <button className={`st-sortc ${S.stSort === 'name-desc' ? 'desc' : ''}`} data-act="st-nsort" aria-label={`Sort by name, ${S.stSort === 'name-asc' ? 'Z to A' : 'A to Z'}`}>Name{img('icon-chevron-down-tertiary-14', 14)}</button>;
    return sPage(<>{sHead('Patients', S.stQ || by ? results(list.length, all.length, by) : `${new Set(all.map(v => v.k)).size} patients · ${all.length} visits · City Hospital`, sSearch('Search patients'))}
      <div className="st-chips">{chip('dept', fLabel('dept', 'Department'), (S.stF.dept || []).length, () => checks('dept', counts(all, v => v.dept)))}
        {chip('doc', fLabel('doc', 'Doctor'), (S.stF.doc || []).length, () => checks('doc', counts(all, v => v.doc), 260))}
        {chip('date', range, a, sCal)}</div>
      {sTable([['Patient ID', 110], [sortBtn, 260], ['Doctor', 240], ['Department', 220], ['Visited date']], list,
        v => <>{cell(v.pid || '—', 110)}{nmCell(v, 260)}{cell(v.doc, 240)}{cell(v.dept, 220)}<span className="sp"></span>{sTag([v.when, 'neutral'])}</>, 'st-pat')}
      {sPager}</>);
  },

  spat: () => {
    const p = patients().find(x => x.k === S.stId), a = arr(p.k);
    return sPage(<>{sBack('Patients', 'spats')}{sWho(p.ini, p.name, a.info)}
      {sSec('Patient', sKV([['Usually sees', `${dname(p.doc)} · ${docOf(p.doc)[0]}`], ['Total visits', p.visits], ['Phone', a.phone], ['Last visit', p.last]]))}
      {sSec('Visit history', sHist(histOf(p.k, p.visits, p.last)))}</>);
  },

  sset: () => {
    const g = (t, items) => sSec(t, <div className="mt-list">{sepJoin(items.map(([i, a, b, act]) => listItem(i, a, b, act)))}</div>);
    return sPage(<><h1 className="k-h2">Settings</h1>
      {g('Staff & roles', [['icon-person.svg', 'Add a doctor', 'New doctor, specialty and department', 'st-go:sadd'], ['lt-lock.svg', 'Assign roles', 'Change what a staff member can access', 'st-go:sroles']])}
      {g('Hospital', [['lt-hospital.svg', 'Hospital details', 'Name, address and working hours', 'st-go:shosp'], ['lt-document.svg', 'Departments', "OPDs and who's assigned to them", 'st-go:sdepts']])}
      {g('Account', [['lt-bell.svg', 'Notifications', 'New reports and staff requests', 'st-go:sacct'], ['lt-lock.svg', 'Change password', 'Last changed 2 months ago', 'st-go:sacct']])}
      <div className="st-sp"></div><div><button className="btn secondary l hug" data-act="st-signout">Sign out</button></div></>);
  },

  sadd: () => {
    const head = <>{S.stFrom === 'sdocs' ? sBack('Doctors', 'sdocs') : sBack('Settings', 'sset')}<div className="st-ttl"><h1 className="k-h2">Add a doctor</h1><p className="dr-sub">Adds them to the roster and gives them their own sign-in</p></div></>;
    if (S.stAdded) return sPage(<>{head}<div className="st-done" role="status"><p className="st-ok">{img('icon-check-circle-success-20')}{S.stAdded} has been added</p>
      <p className="dr-body">They can sign in with the staff ID and password sent to their phone.</p></div>
      <div className="st-sp"></div><div className="st-cta"><button className="btn secondary l" data-act="st-go:sdocs">View in roster</button></div></>);
    const f = (k, l, ph, type = 'text') => <div className="field-wrap"><label className="label" htmlFor={`sa-${k}`}>{l}</label><div className={`field ${S.stAddErr[k] ? 'err' : ''}`}>
      <input id={`sa-${k}`} data-af={k} type={type} placeholder={ph} value={S.stAdd[k] || ''} onChange={e => { S.stAdd[k] = e.target.value; paint(); }} /></div>{S.stAddErr[k] ? support(S.stAddErr[k], 'err') : null}</div>;
    return sPage(<>{head}<form id="st-addf" className="st-form" noValidate>
      {sSec('Personal details', <div className="fields st-f8">{f('name', 'Full name', 'e.g. Dr. Kabita Shrestha')}{f('phone', 'Phone number', '+977 98XX-XXXXXX', 'tel')}{f('email', 'Email', 'e.g. name@cityhospital.np', 'email')}{f('nmc', 'NMC registration', 'e.g. 12345')}</div>)}
      {sSec('Assignment', <div className="fields st-f8">{f('spec', 'Specialty', 'e.g. Cardiology')}{f('opd', 'Department / OPD', 'e.g. OPD 4')}{f('days', 'Working days', 'e.g. Sun–Thu, 9 AM–5 PM')}</div>)}
      </form><div className="st-sp"></div><div className="st-cta"><button className="btn primary l" data-act="st-add">Add doctor</button></div></>);
  },

  sroles: () => {
    const list = byQ(people(), p => p.name, p => ROLES[p.access][0], p => p.dept);
    return sPage(<>{sBack('Settings', 'sset')}{sHead('Assign roles', 'What each person can access in Clinica', sSearch('Search staff'))}
      {S.stDone ? support(S.stDone, '', 'icon-check-circle-success-20.svg') : null}
      {S.stSel.length ? <div className="st-bulk"><span aria-live="polite">{S.stSel.length} selected</span><button className="btn primary st-m" data-act="st-bulk">Assign role to selected</button></div> : null}
      {sTable([['Name', 300], ['Current role', 220], ['Department', 260]], list, p => <>{nmCell(p, 300)}{cell(ROLES[p.access][0], 220)}{cell(p.dept, 260)}<span className="sp"></span></>, 'st-role')}
      {sPager}</>);
  },

  srole: () => {
    const who = S.stWho.map(person), one = who.length === 1 ? who[0] : null, pick = S.stPick;
    const sub = one ? (['Doctor', 'Front desk', 'HR manager', 'Administrator'].includes(one.title) ? one.dept : `${one.title}, ${one.dept}`) : `${who.length} people`;
    return sPage(<>{sBack('Assign roles', 'sroles')}{sWho(one ? one.ini : who.length, one ? one.name : who.map(p => p.name).join(' and '), sub, null, 'dr-h1')}
      <section className="stack16"><h2 className="st-sec">Role</h2><div className="mt-list" role="radiogroup" aria-label="Role">{sepJoin(Object.entries(ROLES).map(([k, [l, d]]) =>
        <button className="st-role" role="radio" aria-checked={pick === k} data-act={`st-pick:${k}`}><span className="dq-t"><span className="st-nm">{l}</span><span className="dr-body">{d}</span></span><span className="ring"></span></button>))}</div>
        <div>{btn('Save role', 'st-saverole', { size: 'l', kind: 'primary hug' })}</div></section>
      {sSec(`What ${ROLES[pick][0]} can access`, <div className="mt-list">{ROLES[pick][2].map(t => <p key={t} className="st-acc">{img('icon-check-circle-success-16', 16)}{t}</p>)}</div>)}</>);
  },

  // Both account settings on one page, as the design has them.
  sacct: () => sPage(<div className="k-col" style={{ gap: 64 }}>{sBack('Settings', 'sset')}
      <section className="stack32"><h1 className="k-h2">Change password</h1><form id="d-pwform" className="fields st-f8" noValidate>{drField('d-pw0', 'Current password', 'Password')}
        {drField('d-pw1', 'New password', 'At least 8 characters', S.drPwErr === 'short' ? 'Use at least 8 characters.' : '')}
        {drField('d-pw2', 'Confirm new password', 'Re-enter new password', S.drPwErr === 'match' ? "The new passwords don't match." : '')}</form>
        {S.drPwErr === 'saved' ? support('Password changed.', '', 'icon-check-circle-success-20.svg') : null}<div>{btn('Save password', 'd-pwsave', { size: 'l', kind: 'primary hug' })}</div></section>
      <section className="stack16"><h2 className="k-h2">Notifications</h2><div className="mt-list">{sepJoin([['leave', 'New leave requests', 'When staff request time off'], ['reports', 'Reports pending', "Doctors' results waiting for release"], ['staff', 'Staff changes', 'New hires and role changes']]
        .map(([k, t, b]) => setting(t, b, S.stSet[k], `st-set:${k}`)))}</div></section></div>, 'narrow'),

  shosp: () => sPage(<div className="k-col" style={{ gap: 32 }}>{sBack('Settings', 'sset')}<h1 className="k-h2">Hospital details</h1>
      <div className="fields st-f8">{[['Hospital name', 'e.g. City Hospital'], ['Address', 'e.g. Bagbazar, Kathmandu'], ['Reception phone', '+977 01-XXXXXXX'], ['Working hours', 'e.g. Sun–Fri, 9 AM–5 PM']]
        .map(([l, ph], i) => <div key={i} className="field-wrap"><label className="label" htmlFor={`sh-${i}`}>{l}</label><div className="field"><input id={`sh-${i}`} placeholder={ph} /></div></div>)}</div>
      {S.stHospSaved ? support('Hospital details saved.', '', 'icon-check-circle-success-20.svg') : null}<div>{btn('Save details', 'st-hosp', { size: 'l', kind: 'primary hug' })}</div></div>, 'narrow'),

  // ----- Front desk -----
  sarr: () => {
    const all = arrivals(), status = x => ARR_TAG[arrSt(x.k)][0];
    const list = filtered(byQ(all.map(k => ({ k, name: arr(k).name })), x => x.name), { status });
    const sub = S.stQ ? `${list.length} result${list.length === 1 ? '' : 's'} for “${S.stQ}”` : (S.stF.status || []).length ? results(list.length, all.length, 'status')
      : all.length ? `Aug 28, 2026 · ${all.length} patients across the hospital` : 'Aug 28, 2026 · Nothing booked yet';
    const st = chip('status', fLabel('status', 'Status'), (S.stF.status || []).length,
      () => checks('status', Object.values(ARR_TAG).map(([l]) => [l, all.filter(k => ARR_TAG[arrSt(k)][0] === l).length]), 240, true));
    return sPage(<>{sHead("Today's arrivals", sub, <>{sSearch('Search patients')}{st}<button className="btn primary l hug" data-act="st-go:swalk">{img('icon-add-white-24', 24)}Register a walk-in</button></>)}
      {all.length ? <div className="st-rows">{sepJoin(list.map(x => arrRow(x.k)))}</div>
        : sEmpty('icon-event-available-tertiary-32', 'No arrivals today', 'Booked patients and walk-ins will show up here.')}</>, 'st-arr');
  },

  scheck: () => {
    const k = S.stId, a = arr(k), st = arrSt(k);
    const right = S.ckAt[k] ? sOk(`Checked in at ${S.ckAt[k]}`) : st === 'notarrived' ? btn('Check in', 'st-checkin', { size: 'l', kind: 'primary hug' }) : sTag(ARR_TAG[st]);
    return sPage(<>{sBack("Today's arrivals", 'sarr')}{sWho(a.ini, a.name, a.info, right)}
      {sSec('Visit details', sKV([[a.walkin ? 'Walk-in for' : 'Booked with', `${dname(a.doc)} · ${docOf(a.doc)[0]}`], [a.walkin ? 'Arrived' : 'Appointment time', a.time], ['Reason for visit', a.reason], ['Phone', a.phone]]))}
      {a.hist.length ? sSec('Recent visits', sHist(a.hist)) : null}</>);
  },

  swalk: () => {
    const w = S.wk, e = S.wkErr;
    const f = (k, l, ph, type = 'text', list = '') => <div className="field-wrap"><label className="label" htmlFor={`wk-${k}`}>{l}</label><div className={`field ${e[k] ? 'err' : ''}`}>
      <input id={`wk-${k}`} data-wf={k} type={type} placeholder={ph} value={w[k] || ''} list={list || undefined} onChange={ev => { S.wk[k] = ev.target.value; paint(); }} /></div>{e[k] ? support(e[k], 'err') : null}</div>;
    return sPage(<><div className="st-ttl"><h1 className="k-h2">Register a walk-in</h1><p className="dr-sub">For a patient arriving without a booking</p></div>
      <form id="st-walkf" className="st-form" noValidate>
      {sSec('Patient details', <div className="fields st-f8">{f('name', 'Full name', 'e.g. Dipesh Rai')}{f('phone', 'Phone number', '+977 98XX-XXXXXX', 'tel')}
        <div className="st-2">{f('h', 'Height', 'e.g. 165 cm')}{f('w', 'Weight', 'e.g. 60 kg')}</div></div>)}
      <section className="stack16"><h2 className="st-sec">Visit details</h2><div className="fields st-f8">{drRadio('Visit type', [['new', 'New patient'], ['follow', 'Follow-up visit']], w.type, 'st-wtype')}
        {f('doc', 'See which doctor?', 'Search by name or department', 'text', 'st-docs')}{f('reason', 'Reason for visit', 'e.g. Fever, follow-up')}
        <datalist id="st-docs">{roster().filter(d => duty(d.id) === 'on').map(d => <option key={d.id} value={`${d.name} · ${d.dept}`} />)}</datalist></div>
        <div id="wk-hist">{wkHist()}</div></section></form>
      {w.type === 'follow' ? null : <div className="st-sp"></div>}<div className="st-cta"><button className="btn primary l" data-act="st-walk">Add to queue</button></div></>);
  },

  smatch: () => {
    const first = S.wk.name.trim().split(/\s+/)[0], c = S.stWho;
    return sPage(<div className="st-col"><div className="st-ttl"><h1 className="k-h2">Is this {first[0].toUpperCase() + first.slice(1)}?</h1>
      <p className="dr-sub">{c.length === 1 ? 'One patient matches' : `${['', '', 'Two', 'Three', 'Four'][c.length] || c.length} patients match`} that name — pick the right one, or continue as new.</p></div>
      <div className="st-rows">{sepJoin(c.map(k => { const a = arr(k), p = PATS.find(x => x[0] === k);
        return <div className="st-match"><span className="avatar l">{a.ini}</span><span className="dq-t"><span className="st-nm">{a.name}</span><span className="dr-body">{a.info}</span>
          <span className="dr-body tertiary">Last visit {p ? p[3] : 'Aug 28, 2026'} · phone ending {(a.phone.match(/(\d{4})$/) || [])[1] || PHONE_END[k] || '4412'}</span></span>
          <button className="btn secondary st-m" data-act={`st-them:${k}`}>This is them</button></div>; }))}</div>
      {btn('None of these — register as new patient', 'st-asnew', { size: 'l' })}</div>, 'narrow');
  },

  // ----- HR -----
  sstaff: () => {
    const all = people(), status = staffStatus;
    const list = filtered(byQ(all, p => p.name, p => p.title, p => p.dept), { role: p => p.title, dept: p => p.dept, status });
    const fil = S.stQ || ['role', 'dept', 'status'].some(k => (S.stF[k] || []).length);
    const by = ['role', 'dept', 'status'].filter(k => (S.stF[k] || []).length).map(k => ({ role: 'role', dept: 'department', status: 'status' })[k]).join(' and ');
    return sPage(<>{sHead('Staff', fil ? results(list.length, all.length, by) : `${all.length} people · ${all.filter(p => status(p) === 'On leave').length} on leave`,
      <>{sSearch('Search staff')}<button className="btn primary l hug" data-act="st-addst">{img('icon-add-white-24', 24)}Add staff</button></>)}
      {S.stDone ? sOk(S.stDone) : null}
      <div className="st-chips">{chip('role', fLabel('role', 'Role'), (S.stF.role || []).length, () => checks('role', counts(all, p => p.title)))}
        {chip('dept', fLabel('dept', 'Department'), (S.stF.dept || []).length, () => checks('dept', counts(all, p => p.dept)))}
        {chip('status', fLabel('status', 'Status'), (S.stF.status || []).length, () => checks('status', [['Active', all.filter(p => status(p) === 'Active').length], ['On leave', 1]]))}</div>
      {sTable([[<>Name{img('icon-chevron-down-tertiary-14', 14)}</>, 300], ['Role', 220], ['Department', 220], ['Status']], list,
        p => <>{nmCell(p, 300)}{cell(p.title, 220)}{cell(p.dept, 220)}<span className="sp"></span>{sTag(status(p) === 'Active' ? ['Active', 'success'] : ['On leave', 'warn'])}</>, 'st-person')}
      {sPager}</>, 'st-acts');
  },

  sperson: () => {
    const p = person(S.stId), l = LEAVES[p.id], email = `${p.name.replace(/^Dr\.\s*/, '').toLowerCase().replace(/\s+/g, '.')}@cityhospital.np`;
    return sPage(<>{sBack('Staff', 'sstaff')}{sWho(p.ini, p.name, `${p.title} · ${p.dept}`, sTag(p.id === 'ms' ? ['On leave', 'warn'] : ['Active', 'success']))}
      {sSec('Employment', sKV([['Employee ID', p.emp], ['Department', p.dept], ['Joined', p.joined], ...(p.addedBy ? [['Added by', `${p.addedBy}, today`]] : []),
        ...(l ? [[l.type, `${l.dates} · ${S.leave[p.id][0].toUpperCase()}${S.leave[p.id].slice(1)}`]] : [])]))}
      {sSec('Contact', sKV([['Phone', p.phone || '+977 98XX-XXXXXX'], ['Email', p.email || email]]))}</>);
  },

  // Add staff — one form for HR and the administrator, any role (Figma 631:273). Doctors also join the roster.
  saddst: () => {
    const f = (k, l, ph, type = 'text') => <div className="field-wrap"><label className="label" htmlFor={`as-${k}`}>{l}</label><div className={`field ${S.stNewErr[k] ? 'err' : ''}`}>
      <input id={`as-${k}`} type={type} placeholder={ph} value={S.stNew[k] || ''} onChange={e => { S.stNew[k] = e.target.value; paint(); }} /></div>{S.stNewErr[k] ? support(S.stNewErr[k], 'err') : null}</div>;
    const pick = k => e => { S.stNew[k] = e.target.value; paint(); };
    return sPage(<>{sBack('Staff', 'sstaff')}<div className="st-ttl"><h1 className="k-h2">Add staff</h1><p className="dr-sub">Adds them to the roster and gives them their own sign-in. Works for any role — doctor, nurse, reception, lab.</p></div>
      <form id="st-addsf" className="st-form" noValidate>
        {sSec('Personal details', <div className="fields st-f8">{f('name', 'Full name', 'e.g. Kabita Shrestha')}{f('phone', 'Phone number', '+977 98XX-XXXXXX', 'tel')}{f('email', 'Email', 'e.g. name@cityhospital.np', 'email')}
          {sSelect('as-role', 'Role', 'Choose a role', S.stNew.role, Object.keys(ACCESS_OF), S.stNewErr.role, pick('role'))}</div>)}
        {sSec('Assignment', <div className="fields st-f8">{sSelect('as-dept', 'Department', 'Choose a department', S.stNew.dept, [...new Set([...depts().map(([, [n]]) => n), ...people().map(p => p.dept)])], S.stNewErr.dept, pick('dept'))}</div>)}
      </form><div className="st-sp"></div>
      <div className="st-cta st-note"><p className="dr-body tertiary">Will show as “Added by {stMe().name}, today” on the staff record</p><button className="btn primary l" data-act="st-addstaff">Add staff</button></div></>);
  },

  // Add a department — name, OPDs and its doctors (Figma 631:1305). Assigning a doctor moves them here.
  sadddept: () => {
    const head = <>{sBack('Departments', 'sdepts')}<div className="st-ttl"><h1 className="k-h2">Add a department</h1><p className="dr-sub">Creates a new department and assigns the doctors who work in it.</p></div></>;
    if (S.stDeptAdded) return sPage(<>{head}<div className="st-done" role="status"><p className="st-ok">{img('icon-check-circle-success-20')}{S.stDeptAdded} has been added</p></div>
      <div className="st-sp"></div><div className="st-cta"><button className="btn secondary l" data-act="st-go:sdepts">View in departments</button></div></>);
    const d = S.stDept, e = S.stDeptErr, q = (d.q || '').trim().toLowerCase();
    const f = (k, l, ph) => <div className="field-wrap"><label className="label" htmlFor={`ad-${k}`}>{l}</label><div className={`field ${e[k] ? 'err' : ''}`}>
      <input id={`ad-${k}`} placeholder={ph} value={d[k] || ''} onChange={ev => { S.stDept[k] = ev.target.value; paint(); }} /></div>{e[k] ? support(e[k], 'err') : null}</div>;
    const hits = q ? roster().filter(r => !d.docs.includes(r.id) && r.name.toLowerCase().includes(q)) : [];
    return sPage(<>{head}<form id="st-adddf" className="st-form" noValidate>
      {sSec('Department details', <div className="fields st-f8">{f('name', 'Department name', 'e.g. Orthopaedics')}{f('opd', 'OPD / room range', 'e.g. OPD 8')}</div>)}
      {sSec('Assignment', <div className="field-wrap"><label className="label" htmlFor="ad-q">Assign doctors</label>
        <div className="st-dd-wrap"><div className="field"><input id="ad-q" placeholder="Search by name — e.g. Dr. Bikash Thapa" autoComplete="off" value={d.q || ''}
          onChange={ev => { S.stDept.q = ev.target.value; paint(); }} /></div>
          {hits.length ? <div className="st-dd" style={{ width: '100%' }} role="listbox" aria-label="Doctors">{hits.map(r =>
            <button key={r.id} type="button" className="st-opt" role="option" aria-selected="false" data-act={`st-dpick:${r.id}`}><span className="l"><span className="avatar">{r.ini}</span>{r.name}</span><span className="n">{r.dept}</span></button>)}</div> : null}</div>
        {d.docs.length ? <div className="st-picks">{d.docs.map(id => <button key={id} type="button" className="st-pick" data-act={`st-dunpick:${id}`} aria-label={`Remove ${dname(id)}`}>{dname(id)}{img('icon-close', 16)}</button>)}</div> : null}</div>)}
      </form><div className="st-sp"></div><div className="st-cta"><button className="btn primary l" data-act="st-adddept">Add department</button></div></>);
  },

  // HR's own landing page: today's headcount and the latest leave requests (Figma 630:417).
  shdash: () => {
    const all = people(), leave = all.filter(p => staffStatus(p) === 'On leave'), off = all.filter(p => staffStatus(p) !== 'On leave' && roster().some(d => d.id === p.id) && duty(p.id) === 'off');
    return sPage(<>{sHead('Dashboard', 'Today · Aug 28, 2026')}
      {sStats([[all.length, 'Total staff', 'Across all departments'], [all.length - leave.length - off.length, 'Available today', `${all.length} total, ${leave.length} on leave, ${off.length} off duty`],
        [leave.length, 'On leave today', leave.map(p => p.name).join(', ')]])}
      {sSec('Recent leave requests', <div className="st-rows">{sepJoin(Object.keys(LEAVES).map(k => <button className="list-item k-row" data-act={`st-req:${k}`}>
        <span className="dq-t"><span className="st-nm">{person(k).name}</span><span className="dr-body">{LEAVES[k].type} · {LEAVES[k].dates.replace(', 2026', '')}</span></span></button>))}</div>)}</>);
  },

  sleave: () => {
    const ids = Object.keys(LEAVES), pending = ids.filter(k => S.leave[k] === 'pending'), done = ids.filter(k => S.leave[k] === 'approved').length;
    const rowsOf = list => <div className="st-rows">{sepJoin(list.map(k => { const p = person(k), l = LEAVES[k];
      return <button className="list-item k-row" data-act={`st-req:${k}`}><span className="avatar">{p.ini}</span><span className="dq-t"><span className="h-s">{p.name}</span><span className="dq-r">{l.type}</span>
        <span className="dq-m"><span className="now">{l.dates}</span>{sTag(LEAVE_TAG[S.leave[k]])}</span></span></button>; }))}</div>;
    const st = k => LEAVE_TAG[S.leave[k]][0], shown = filtered(ids.map(k => ({ k })), { status: x => st(x.k) }).map(x => x.k);
    const chips = <div className="st-chips">{chip('status', fLabel('status', 'Status'), (S.stF.status || []).length,
      () => checks('status', ['Pending', 'Approved', 'Denied'].map(l => [l, ids.filter(k => st(k) === l).length]), 240, true))}</div>;
    const fil = (S.stF.status || []).length ? results(shown.length, ids.length, 'status') : null;
    if (!pending.length) return sPage(<>{sHead('Leave requests', fil || 'Nothing waiting on you right now')}{chips}
      {sEmpty('icon-schedule-tertiary-32', 'No pending requests', 'Approved and denied requests still show in the history.')}{sSec('History', rowsOf(shown))}</>, 'st-leave0');
    return sPage(<>{sHead('Leave requests', fil || `${pending.length} pending · ${done} already approved`)}{chips}{rowsOf(shown)}</>);
  },

  sreq: () => {
    const k = S.stId, p = person(k), l = LEAVES[k], st = S.leave[k], first = p.name.replace(/^Dr\.\s*/, '').split(' ')[0];
    return sPage(<>{sBack('Leave requests', 'sleave')}{sWho(p.ini, p.name, `${p.title} · ${p.dept}`, sTag(LEAVE_TAG[st]))}
      {sSec('Request details', sKV([['Type', l.type], ['Dates', l.dates], ['Duration', l.days], ['Requested on', l.asked]]))}
      {sSec('Decision', st === 'pending' ? <div className="st-act"><p className="dr-body">{l.note}</p>{btn('Approve', 'st-leave:approved', { size: 'l' })}{btn('Deny', 'st-leave:denied', { size: 'l', kind: 'destructive' })}</div>
        : sOk(`${st === 'approved' ? 'Approved' : 'Denied'} — ${first} has been notified`, st === 'denied'))}</>);
  },

  satt: () => {
    const all = people().filter(p => ATT[p.id]);
    let list = byQ(all, p => p.name);
    const [k, dir] = S.stSort.split('-'), col = { present: 1, absent: 3 }[k];
    if (col) list = [...list].sort((a, b) => (ATT[b.id][col] - ATT[a.id][col]) * (dir === 'asc' ? -1 : 1));
    const sortChip = (key, word) => chip(key, `Sort: ${k === key && dir === 'asc' ? 'Lowest' : 'Highest'} ${word}`, k === key,
      () => radios([[`${key}-desc`, `Highest to lowest ${word}`], [`${key}-asc`, `Lowest to highest ${word}`]], key === 'present' ? 260 : 220));
    return sPage(<>{sHead('Attendance', S.stQ ? results(list.length, all.length, '') : 'August 2026 · 20 working days so far', sSearch('Search staff'))}
      <div className="st-chips">{sortChip('present', 'present')}{sortChip('absent', 'absent')}</div>
      {sTable([['Name', 280], ['Total days', 140], ['Present', 140], ['On leave', 140], ['Absent', 140]], list, p => { const [t, pr, lv, ab] = ATT[p.id];
        return <>{nmCell(p, 280)}{cell(t, 140)}{cell(pr, 140, 'st-b')}{cell(lv, 140)}{cell(ab, 140, ab ? 'st-err' : '')}</>; }, 'st-att')}
      {sPager}</>);
  },

  satt1: () => {
    const p = person(S.stId), [t, pr, lv, ab] = ATT[p.id], [jm, jy] = p.joined.split(' ');
    const years = Math.floor((2026 * 12 + 7 - (+jy * 12 + MONTHS.indexOf(jm))) / 12); // whole years to Aug 2026
    const tone = { Present: 'success', 'Sick leave': 'warn', Weekend: 'neutral', Absent: 'error' };
    return sPage(<>{sBack('Attendance', 'satt')}{sWho(p.ini, p.name, `${p.dept} · August 2026`)}
      {sStats([[years, 'Years since joined', `Joined ${p.joined}`], [pr, 'Present days', 'This month'], [ab, 'Non-requested leave', `This month, ${ab} of ${t} days`]])}
      {sSec('Attendance calendar', attCal(p.id))}
      {sSec('Recent days', <div className="mt-list">{mtJoin(recentDays(p.id).map(([d, s]) => <div className="st-kv"><span>{d}</span>{sTag([s, tone[s]])}</div>))}</div>)}
      <section className="stack16"><h2 className="st-sec">This month</h2>{sKV([['Total working days', t], ['Present', pr], ['On leave', lv], ['Absent', ab]])}
        {p.id === 'ms' ? <p className="dr-body">Leave continues through Sep 2 — shown on next month's attendance.</p> : null}</section></>);
  },
});
export const LEAVE_TAG = { pending: ['Pending', 'warn'], approved: ['Approved', 'success'], denied: ['Denied', 'neutral'] };

// The last week, as recorded; Dr. Maya Shrestha's sick leave started Aug 26.
export const recentDays = id => { const ab = ATT[id][3];
  return [['Mon, Aug 24', 'Present'], ['Tue, Aug 25', ab > 1 ? 'Absent' : 'Present'], ['Wed, Aug 26', 'Present'], ['Thu, Aug 27', ab ? 'Absent' : 'Present'],
    ['Fri, Aug 28', 'Present'], ['Sat, Aug 29', 'Weekend'], ['Sun, Aug 30', 'Weekend'], ['Mon, Aug 31', 'Present']]
    .map(([d, s], i) => [d, id === 'ms' && i >= 2 && s === 'Present' ? 'Sick leave' : s]); };
export const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
export const CAL_LONG = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
export const KIND = { Present: 'present', 'Sick leave': 'leave', Absent: 'absent', Weekend: 'weekend' };
export const CAL_LABEL = { present: 'Present', leave: 'On leave', absent: 'Non-requested leave', weekend: 'Weekend' };
// August's working days, Aug 3–28. Only the month's totals are recorded, so the earlier weeks are placed representatively from them
// (present, then leave, then absent), and the last week matches Recent days. Days after today stay blank.
export function augDays(id) {
  const [, pr, lv, ab] = ATT[id], out = {}, last = recentDays(id).slice(0, 5);
  last.forEach(([, s], i) => { out[24 + i] = [KIND[s], s === 'Sick leave' ? 'Sick leave' : null]; });
  const used = k => last.filter(([, s]) => KIND[s] === k).length;
  const rest = [...Array(pr - used('present')).fill('present'), ...Array(lv - used('leave')).fill('leave'), ...Array(ab - used('absent')).fill('absent')];
  for (let d = 3; d <= 21; d++) if (new Date(2026, 7, d).getDay() % 6) out[d] = [rest.shift(), null];
  return out;
}
export function attCal(id) {
  const m = S.stCalM, y = 2026 + Math.floor(m / 12), mo = ((m % 12) + 12) % 12, first = new Date(y, mo, 1).getDay(), n = new Date(y, mo + 1, 0).getDate();
  const aug = y === 2026 && mo === 7 ? augDays(id) : {}, today = new Date(2026, 7, 28);
  const kindOf = d => { const date = new Date(y, mo, d); if (date > today) return null; // the future is blank
    return date.getDay() % 6 ? (aug[d] || [])[0] || null : 'weekend'; };
  const cells = [...Array(first).fill(0), ...Array.from({ length: n }, (_, i) => i + 1)];
  const pop = d => { const [k, why] = aug[d] || [kindOf(d)];
    return <span className="att-pop" role="status">{new Date(y, mo, d).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} · {why || CAL_LABEL[k]}</span>; };
  return <div className="att-cal"><div className="att-hd"><button className="att-nav" data-act="st-calm:-1" aria-label="Previous month">{img('icon-chevron-left-action-16', 16)}</button>
      <p className="st-nm">{CAL_LONG[mo]} {y}</p><button className="att-nav" data-act="st-calm:1" aria-label="Next month">{img('icon-chevron-right-action-16', 16)}</button></div>
    <div className="att-grid">{['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => <span key={`h${i}`} className="att-wd">{d}</span>)}
      {cells.map((d, i) => { if (!d) return <span key={i}></span>; const k = kindOf(d);
        return k ? <span key={i} className="att-d"><button className={`att-c ${k}`} data-act={`st-calday:${d}`} aria-pressed={S.stCalDay === d} aria-label={`${d}, ${CAL_LABEL[k]}`}>{d}</button>{S.stCalDay === d ? pop(d) : null}</span>
          : <span key={i} className="att-c">{d}</span>; })}</div>
    <div className="att-key">{Object.entries(CAL_LABEL).map(([k, l]) => <span key={k} className={k}><i></i>{l}</span>)}</div></div>;
}

// The date-range panel: August, Sunday first; the first tap starts the range, the second ends it.
export function sCal() {
  const [a, b] = S.stRange, cells = [...Array(6).fill(0), ...Array.from({ length: 31 }, (_, i) => i + 1)];
  return <div className="st-dd st-cal" role="dialog" aria-label="Date range"><p className="st-nm" style={{ textAlign: 'center' }}>August 2026</p>
    <div className="st-wk">{['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => <span key={i} className="st-dh">{d}</span>)}</div>
    {Array.from({ length: 6 }, (_, w) => <div key={w} className="st-wk">{cells.slice(w * 7, w * 7 + 7).concat(Array(7).fill(0)).slice(0, 7).map((d, i) => !d ? <span key={i} className="st-d"></span>
      : <button key={i} className={`st-d ${d === a || d === b ? 'end' : b && d > a && d < b ? 'in' : ''}`} data-act={`st-day:${d}`} aria-pressed={d === a || d === b}>{d}</button>)}</div>)}</div>;
}

// Follow-up for someone already on the books: their recent visits, as soon as the name matches one record.
export function wkHist() {
  if (S.wk.type !== 'follow') return null;
  const q = (S.wk.name || '').trim().toLowerCase(), m = patients().find(p => p.name.toLowerCase() === q);
  return m ? sSec('Recent visits', sHist(histOf(m.k, m.visits, m.last).filter(([d]) => d !== 'Aug 28, 2026').slice(0, 2))) : null;
}

// ---------- behaviour ----------
export function sGo(sc, from = null) {
  const was = secOf(S.screen);
  S.stFrom = from;
  if (secOf(sc) !== was) Object.assign(S, { stQ: '', stF: {}, stSort: '', stRange: [] }); // each list starts unfiltered
  Object.assign(S, { stack: [], screen: sc, stMenu: null, stSel: [], sheet: null, stCalDay: null, stDone: sc === 'sroles' ? S.stDone : '' });
  render();
}
// Signing out asks first, for every role (Figma 635:1739, 629:6940).
OVERLAY.stsignout = () => signoutSheet(signoutBody[stMe().access], 'st-signout-ok');
// Re-render in place. React keeps the page's scroll and the search caret, since the elements survive.
export const sRe = () => render();
// The walk-in becomes a patient in today's list — and, for Dr. Sharma, in her own queue.
export function addWalkIn(rec) {
  const k = `w${Object.keys(S.walk).length + 1}`, w = { ...rec, time: now(), walkin: true };
  S.walk[k] = w;
  if (w.doc === 'ps') { DR_PATIENTS[k] = { name: w.name, ini: w.ini, info: w.info, reason: w.reason, short: w.reason, time: w.time, hist: '' }; DR_HISTORY[k] = w.hist; S.drq[k] = 'waiting'; }
  else S.rq[k] = 'waiting';
  S.wk = { type: 'new' }; S.wkErr = {}; S.stQ = ''; // back to the full list, with the new row in it
  sGo('sarr');
}
export const wkRecord = (base = {}) => {
  const w = S.wk, doc = roster().find(d => w.doc.toLowerCase().startsWith(d.name.toLowerCase()) || d.name.toLowerCase().includes(w.doc.trim().toLowerCase()));
  return { name: w.name.trim(), ini: initials(w.name.trim().replace(/\s+/g, ' ')), info: 'New patient · walk-in', reason: (w.reason || '').trim() || 'Walk-in', phone: (w.phone || '').trim() || '+977 98XX-XXXXXX', hist: [], isNew: true, ...base, doc: doc.id };
};

// Rows are keyboard-reachable; Enter opens them like a click.
onPhone('keydown', e => { if (e.key === 'Enter' && e.target.matches?.('.st-tr[data-act]')) e.target.click(); });
// A click outside an open panel closes it.
onPhone('click', e => { if (S.app === 'staff' && S.stMenu && !e.target.closest('.st-dd-wrap')) { S.stMenu = null; sRe(); } });

Object.assign(ACTIONS, {
  'st-signin': () => {
    const id = S.stSignId.trim().toUpperCase(), pw = document.getElementById('st-pw').value;
    S.stSignId = ''; // the old page redrew the form empty after every try
    if (id === 'CH-0231' && pw === 'clinica') { S.drSigned = true; S.stErr = false; return showApp('desk'); } // a doctor signing in here lands in their own app
    const who = SIGN_IDS[id];
    if (!who || pw !== 'clinica') { S.stErr = true; return render(); }
    S.stMe = who; S.stErr = false;
    if (stMe().access === 'doctor') { S.drSigned = true; return showApp('desk'); }
    sGo(stHome());
  },
  'st-forgot': () => { S.stForgot = true; render(); },
  'st-signout': () => { Object.assign(S, { stMenu: null, sheet: 'stsignout' }); render(); },
  'st-signout-ok': () => { Object.assign(S, { stMe: null, stMenu: null, sheet: null, stack: [], screen: 'ssignin' }); render(); },
  'st-go': sc => sGo(sc),
  'st-adddoc': () => { S.stAdded = null; sGo('sadd', 'sdocs'); },
  'st-menu': k => { S.stMenu = S.stMenu === k ? null : k; sRe(); },
  'st-f': arg => { const [k, v] = arg.split('|'), cur = S.stF[k] || []; S.stF = { ...S.stF, [k]: cur.includes(v) ? cur.filter(x => x !== v) : [...cur, v] }; sRe(); },
  'st-f1': arg => { const [k, v] = arg.split('|'); S.stF = { ...S.stF, [k]: (S.stF[k] || []).includes(v) ? [] : [v] }; S.stMenu = null; sRe(); }, // a single choice
  'st-nsort': () => { S.stSort = S.stSort === 'name-asc' ? 'name-desc' : 'name-asc'; sRe(); },
  'st-sort': v => { S.stSort = v; S.stMenu = null; sRe(); },
  'st-day': d => { const [a, b] = S.stRange; d = +d; S.stRange = !a || b ? [d] : d < a ? [d, a] : [a, d]; sRe(); },
  'st-cb': id => { S.stSel = S.stSel.includes(id) ? S.stSel.filter(x => x !== id) : [...S.stSel, id]; sRe(); },
  'st-cball': () => { const all = stVisible.every(id => S.stSel.includes(id)); S.stSel = all ? [] : [...stVisible]; sRe(); },
  'st-doc': id => { S.stId = id; sGo('sdoc'); },
  'st-dept': k => { S.stId = k; sGo('sdept'); },
  'st-pat': id => { S.stId = id.split('|')[0]; sGo('spat'); }, // a visit row opens its patient
  'st-person': id => { S.stId = id; sGo('sperson'); },
  'st-req': id => { S.stId = id; sGo('sreq'); },
  'st-att': id => { S.stId = id; sGo('satt1'); },
  'st-arr': k => { S.stId = k; sGo('scheck'); },
  'st-role': id => { Object.assign(S, { stWho: [id], stPick: person(id).access }); sGo('srole'); },
  'st-bulk': () => { Object.assign(S, { stWho: [...S.stSel], stPick: person(S.stSel[0]).access }); sGo('srole'); },
  'st-pick': k => { S.stPick = k; sRe(); },
  'st-saverole': () => {
    S.stWho.forEach(id => { S.stAccess[id] = S.stPick; });
    S.stDone = `${S.stWho.map(dname).join(' and ')} ${S.stWho.length > 1 ? 'are' : 'is'} now ${ROLES[S.stPick][0]}.`;
    sGo('sroles');
  },
  'st-set': k => { S.stSet[k] = !S.stSet[k]; sRe(); },
  'st-hosp': () => { S.stHospSaved = true; sRe(); },
  'st-add': () => {
    const f = S.stAdd; S.stAddErr = {};
    if (!(f.name || '').trim()) S.stAddErr.name = "Enter the doctor's full name.";
    if (!(f.spec || '').trim()) S.stAddErr.spec = 'Enter their specialty, for example Cardiology.';
    if (Object.keys(S.stAddErr).length) return sRe();
    const name = /^Dr\.?\s/i.test(f.name.trim()) ? f.name.trim().replace(/^Dr\.?\s*/i, 'Dr. ') : `Dr. ${f.name.trim()}`;
    S.stDocs.push({ id: `n${S.stDocs.length + 1}`, ini: initials(name.replace(/^Dr\. /, '')), name, spec: f.spec.trim(), opd: (f.opd || '').trim(), days: (f.days || '').trim() || 'Sun–Thu, 9 AM–5 PM',
      phone: (f.phone || '').trim() || '+977 98XX-XXXXXX', email: (f.email || '').trim(), nmc: (f.nmc || '').trim(), emp: `CH-0${270 + S.stDocs.length}` });
    Object.assign(S, { stAdded: name, stAdd: {} }); sRe();
  },
  // Front desk
  'st-checkin': () => {
    const k = S.stId;
    S.ckAt[k] = now();
    if (k === 'as') S.visitDay = 'checkedin'; // Anisha's phone shows her checked in
    else if (inDrQueue(k)) S.drq[k] = 'waiting'; // and Dr. Sharma's queue shows them waiting
    else S.rq[k] = 'waiting';
    sRe();
  },
  'st-wtype': v => { S.wk.type = v; sRe(); },
  'st-walk': () => {
    const w = S.wk, e = S.wkErr = {};
    if (!(w.name || '').trim()) e.name = "Enter the patient's full name.";
    const doc = (w.doc || '').trim() && roster().find(d => w.doc.toLowerCase().startsWith(d.name.toLowerCase()) || d.name.toLowerCase().includes(w.doc.trim().toLowerCase()) || d.dept.toLowerCase().startsWith(w.doc.trim().toLowerCase()));
    if (!doc || duty(doc.id) !== 'on') e.doc = doc ? `${doc.name} isn't in today — choose a doctor on duty.` : 'Choose a doctor from the list.';
    if (Object.keys(e).length) return sRe();
    w.doc = doc.name;
    const name = w.name.trim().toLowerCase(), all = patients(), exact = all.find(p => p.name.toLowerCase() === name);
    if (exact) return ACTIONS['st-them'](exact.k);
    const first = name.split(/\s+/)[0], c = all.filter(p => p.name.toLowerCase().split(/\s+/)[0] === first).map(p => p.k);
    if (c.length) { S.stWho = c; return sGo('smatch'); } // someone with that name is already on the books
    addWalkIn(wkRecord());
  },
  // A returning patient: booked today → check them in; otherwise they join the queue on their own record.
  'st-them': k => {
    if (ARR[k] && !(k in S.rq) && ARR[k][4]) S.rq[k] = 'notarrived'; // Sunita Thapa's booking, found through the walk-in search
    if (arrivals().includes(k)) { S.stId = k; S.wk = { type: 'new' }; return sGo('scheck'); }
    const a = arr(k);
    addWalkIn(wkRecord({ name: a.name, ini: a.ini, info: a.info, phone: a.phone, hist: histOf(k, 9, '').slice(0, 2), isNew: false }));
  },
  'st-asnew': () => addWalkIn(wkRecord()),
  // HR
  'st-leave': v => { S.leave[S.stId] = v; sRe(); },
  'st-calm': d => { S.stCalM += +d; S.stCalDay = null; sRe(); },
  'st-calday': d => { S.stCalDay = S.stCalDay === +d ? null : +d; sRe(); },
  // Add staff (HR and the administrator)
  'st-addst': () => { Object.assign(S, { stNew: {}, stNewErr: {} }); sGo('saddst'); },
  'st-addstaff': () => {
    const f = S.stNew, e = S.stNewErr = {}, v = k => (f[k] || '').trim();
    if (!v('name')) e.name = 'Full name is required.';
    if (!v('phone')) e.phone = 'Phone number is required.';
    if (!f.role) e.role = 'Role is required.';
    if (!f.dept) e.dept = 'Department is required.';
    if (Object.keys(e).length) return sRe();
    const n = S.stStaff.length + S.stDocs.length, base = { phone: v('phone'), email: v('email'), addedBy: stMe().name };
    if (f.role === 'Doctor') { // the same doctor roster Add a doctor adds to
      const name = /^Dr\.?\s/i.test(v('name')) ? v('name').replace(/^Dr\.?\s*/i, 'Dr. ') : `Dr. ${v('name')}`;
      S.stDocs.push({ id: `n${S.stDocs.length + 1}`, ini: initials(name.replace(/^Dr\. /, '')), name, spec: f.dept, opd: '', days: 'Sun–Thu, 9 AM–5 PM', nmc: '', emp: `CH-0${270 + S.stDocs.length}`, ...base });
    } else S.stStaff.push({ id: `s${S.stStaff.length + 1}`, ini: initials(v('name')), name: v('name'), title: f.role, dept: f.dept, access: ACCESS_OF[f.role], emp: `CH-STF-0${270 + n}`, joined: 'Aug 2026', ...base });
    const who = f.role === 'Doctor' ? S.stDocs.at(-1).name : v('name');
    Object.assign(S, { stNew: {}, stQ: '', stF: {} });
    sGo('sstaff'); S.stDone = `${who} has been added`; sRe(); // back to the directory, with the new row in it
  },
  // Add a department
  'st-newdept': () => { Object.assign(S, { stDept: { docs: [] }, stDeptErr: {}, stDeptAdded: null }); sGo('sadddept'); },
  'st-dpick': id => { S.stDept.docs = [...S.stDept.docs, id]; S.stDept.q = ''; sRe(); },
  'st-dunpick': id => { S.stDept.docs = S.stDept.docs.filter(x => x !== id); sRe(); },
  'st-adddept': () => {
    const d = S.stDept, e = S.stDeptErr = {};
    if (!(d.name || '').trim()) e.name = 'Department name is required.';
    if (!(d.opd || '').trim()) e.opd = 'OPD / room range is required.';
    if (Object.keys(e).length) return sRe();
    const k = `d${S.stDepts.length + 1}`;
    S.stDepts.push({ k, name: d.name.trim(), opd: d.opd.trim() });
    d.docs.forEach(id => { S.stMoved[id] = k; }); // one department each: they leave their old one
    Object.assign(S, { stDeptAdded: d.name.trim(), stDept: { docs: [] } }); sRe();
  },
});
// A tap anywhere else closes the attendance day's popover.
onPhone('click', e => { if (S.app === 'staff' && S.stCalDay && !e.target.closest('.att-d')) { S.stCalDay = null; paint(); } });

export const STAFF_NUM = {
  ssignin: s => s.stErr ? 'T00b' : 'T00',
  sdash: s => s.stHoliday ? 'T01b' : 'T01',
  sdocs: s => ({ dept: 'T02e', status: 'T02f', sort: 'T02g' })[s.stMenu] || (s.stQ ? 'T02b' : Object.values(s.stF).some(v => v.length) ? 'T02d' : 'T02'),
  sdoc: () => 'T02c',
  sdepts: () => 'T03', sdept: s => ({ gm: 'T03a', derm: 'T03b', paed: 'T03c', gyn: 'T03d', card: 'T03e' })[s.stId],
  sset: () => 'T04', sadd: s => s.stAdded ? 'T04a2' : s.stFrom === 'sdocs' ? 'T04a3' : 'T04a', sroles: s => s.stSel.length ? 'T04b2' : 'T04b',
  srole: s => ({ sbr: 'T04c', rk: 'T04c2', ab: 'T04c3', ps: 'T04c4', mt: 'T04c5' })[s.stWho[0]] || 'T04c', sacct: () => 'T04d', shosp: () => 'T04e',
  spats: s => person(s.stMe)?.access === 'desk' ? 'R09' : ({ date: 'T05c', dept: 'T05d', doc: 'T05e' })[s.stMenu] || (s.stSort ? 'T05b' : 'T05'), spat: () => 'T05a',
  sadddept: s => s.stDeptAdded ? 'T03h' : Object.keys(s.stDeptErr).length ? 'T03g' : 'T03f',
  sarr: s => !arrivals().length ? 'R01b' : s.stQ ? 'R01c' : s.stMenu === 'status' ? 'R01d' : (s.stF.status || []).length ? 'R01e' : 'R01',
  scheck: s => s.stId === 'st' ? (s.ckAt.st ? 'R08' : 'R07') : s.ckAt[s.stId] ? 'R03' : 'R02',
  swalk: s => s.wk.type === 'follow' ? 'R05' : 'R04', smatch: () => 'R06',
  sstaff: s => ({ role: 'HR01d', dept: 'HR01c', status: 'HR01e' })[s.stMenu] || (s.stDone ? 'HR11c' : Object.values(s.stF).some(v => v.length) ? 'HR01b' : 'HR01'),
  sperson: s => person(s.stId)?.addedBy ? 'HR02b' : 'HR02', shdash: () => 'HR10', saddst: s => Object.keys(s.stNewErr).length ? 'HR11b' : 'HR11',
  sleave: s => s.stMenu === 'status' ? 'HR03c' : (s.stF.status || []).length ? 'HR03d' : Object.values(s.leave).includes('pending') ? 'HR03' : 'HR03b',
  sreq: s => s.stId === 'ms' ? 'HR07' : ({ pending: 'HR04', approved: 'HR05', denied: 'HR06' })[s.leave.pk],
  satt: s => s.stMenu === 'present' ? 'HR08c' : s.stMenu === 'absent' ? 'HR08d' : s.stSort ? 'HR08b' : 'HR08', satt1: s => s.stCalDay ? 'HR09b' : s.stCalM !== 7 ? 'HR09c' : 'HR09',
};
// The sign-out confirmation can sit over any staff screen.
for (const [k, f] of Object.entries(STAFF_NUM)) NUM[k] = s => s.sheet === 'stsignout' ? ({ admin: 'T06', desk: 'R10', hr: 'HR12' })[person(s.stMe)?.access] : f(s);

export const SA = (x = {}) => () => ({ ...STAFF_START(), stMe: 'rk', screen: 'sdash', ...x });
export const SD = (x = {}) => SA({ stMe: 'sbr', screen: 'sarr', ...x });
export const SH = (x = {}) => SA({ stMe: 'ab', screen: 'sstaff', ...x });
later(() => { // the presets read the doctor's queue (doctor.jsx)
FLOW.push(['Hospital staff — administrator', [
  ['T00', 'Sign in', 'Hospital staff', 'One sign-in for every staff role — the ID decides whether you land on the dashboard, check-in or the staff directory.', () => ({ ...STAFF_START() })],
  ['T00b', 'Sign in — wrong password', 'Wrong ID or password', "The error names both fields, so it doesn't reveal which one was wrong. The password is cleared.", () => ({ ...STAFF_START(), stErr: true })],
  ['T01', 'Dashboard', 'Signs in as the administrator', "Today across the hospital at a glance. The numbers come from the same day as the doctor's apps — Dr. Sharma's queue and the reports she hasn't released. Below, HR's headcount — counts only; who is on leave and why stays in HR.", SA()],
  ['T01b', 'Dashboard — no doctors on duty', 'Public holiday', 'A day with nobody rostered — the list says why instead of sitting empty.', SA({ stHoliday: true })],
  ['T02', 'Doctors', 'Doctors', 'The whole roster with today\'s load and duty status, searchable and filterable.', SA({ screen: 'sdocs' })],
  ['T02b', 'Doctors — search', 'Types “derma”', 'Search matches the department as well as the name.', SA({ screen: 'sdocs', stQ: 'derma' })],
  ['T02c', 'Doctor — Dr. Ramesh Shrestha', 'Opens a doctor', 'One doctor\'s registration, contact and working days, with their day so far.', SA({ screen: 'sdoc', stId: 'rs' })],
  ['T02d', 'Doctors — filtered by department', 'Department: Dermatology', 'The chip shows the filter in force, so the shorter list explains itself.', SA({ screen: 'sdocs', stF: { dept: ['Dermatology'] } })],
  ['T02e', 'Doctors — Department filter open', 'Department', 'Departments with how many doctors each — tick one or more.', SA({ screen: 'sdocs', stMenu: 'dept', stF: { dept: ['Dermatology'] } })],
  ['T02f', 'Doctors — Status filter open', 'Status', 'On duty, off duty or on leave, with counts.', SA({ screen: 'sdocs', stMenu: 'status', stF: { status: ['Off duty'] } })],
  ['T02g', 'Doctors — Sort open', 'Sort', 'Sort by how busy each doctor is today.', SA({ screen: 'sdocs', stMenu: 'sort', stSort: 'pt-desc' })],
  ['T03', 'Departments', 'Departments', 'Each department as a card: running or closed, who\'s in, and today\'s patients.', SA({ screen: 'sdepts' })],
  ['T03a', 'Department — General medicine', 'General medicine', 'The department\'s doctors and how its day is going.', SA({ screen: 'sdept', stId: 'gm' })],
  ['T03b', 'Department — Dermatology', 'Dermatology', 'A department with a doctor on leave — staff on leave replaces the arrivals count.', SA({ screen: 'sdept', stId: 'derm' })],
  ['T03c', 'Department — Paediatrics', 'Paediatrics', 'A one-doctor department.', SA({ screen: 'sdept', stId: 'paed' })],
  ['T03d', 'Department — Gynaecology', 'Gynaecology', 'A one-doctor department.', SA({ screen: 'sdept', stId: 'gyn' })],
  ['T03e', 'Department — Cardiology', 'Cardiology', 'Closed today — its only doctor isn\'t in.', SA({ screen: 'sdept', stId: 'card' })],
  ['T03f', 'Add a department', 'Add department', 'Name, OPDs and the doctors who work in it — only what the department screens show. Assigning a doctor moves them out of their old department.', SA({ screen: 'sadddept' })],
  ['T03g', 'Add a department — missing details', 'Add department with fields empty', 'Each required field says what it needs.', SA({ screen: 'sadddept', stDeptErr: { name: 'Department name is required.', opd: 'OPD / room range is required.' } })],
  ['T03h', 'Add a department — added', 'Add department', 'It joins the departments straight away: running, with no patients yet today.', SA({ screen: 'sadddept', stDeptAdded: 'Orthopaedics', stDepts: [{ k: 'd1', name: 'Orthopaedics', opd: 'OPD 8' }] })],
  ['T04', 'Settings', 'Settings', 'Staff and roles, hospital details, and the administrator\'s own account.', SA({ screen: 'sset' })],
  ['T04a', 'Add a doctor', 'Add a doctor', 'A new doctor goes straight onto the roster and gets their own sign-in.', SA({ screen: 'sadd' })],
  ['T04a3', 'Add a doctor — from Doctors', 'Add doctor', 'The same form, opened from the Doctors list, so its back link leads there.', SA({ screen: 'sadd', stFrom: 'sdocs' })],
  ['T04a2', 'Add a doctor — added', 'Add doctor', 'Confirms who was added and how they\'ll sign in; they now show in the roster and the staff directory.', SA({ screen: 'sadd', stAdded: 'Dr. Kabita Shrestha' })],
  ['T04b', 'Assign roles', 'Assign roles', 'Who can access what, for everyone on the staff.', SA({ screen: 'sroles' })],
  ['T04b2', 'Assign roles — 2 selected', 'Ticks two people', 'Selecting people brings up a bar to change their role together.', SA({ screen: 'sroles', stSel: ['sbr', 'rk'] })],
  ['T04c', 'Assign role — Sabina Rai', 'Opens Sabina', 'Four roles, with what the chosen one can access spelled out beneath.', SA({ screen: 'srole', stWho: ['sbr'], stPick: 'desk' })],
  ['T04c2', 'Assign role — Rajesh Koirala', 'Opens Rajesh', 'The administrator\'s own role.', SA({ screen: 'srole', stWho: ['rk'], stPick: 'admin' })],
  ['T04c3', 'Assign role — Anjali Basnet', 'Opens Anjali', 'The HR manager\'s role.', SA({ screen: 'srole', stWho: ['ab'], stPick: 'hr' })],
  ['T04c4', 'Assign role — Dr. Priya Sharma', 'Opens Dr. Sharma', 'A doctor\'s role.', SA({ screen: 'srole', stWho: ['ps'], stPick: 'doctor' })],
  ['T04c5', 'Assign role — Maya Tuladhar', 'Opens Maya', 'A nurse — there\'s no nurse role, so she has a doctor\'s access.', SA({ screen: 'srole', stWho: ['mt'], stPick: 'doctor' })],
  ['T04d', 'Account settings', 'Change password / Notifications', 'Password and notifications on one page; the switches take effect straight away.', SA({ screen: 'sacct' })],
  ['T04e', 'Hospital details', 'Hospital details', 'The hospital\'s name, address, reception number and hours.', SA({ screen: 'shosp' })],
  ['T05', 'Patients', 'Patients', 'One row per visit, so a patient seen four times has four rows, each with their Patient ID, doctor and department.', SA({ screen: 'spats' })],
  ['T05a', 'Patient — Anisha Sharma', 'Opens Anisha', 'Her visits match her own app and her doctor\'s history.', SA({ screen: 'spat', stId: 'as' })],
  ['T05b', 'Patients — sorted by name', 'Name', 'Sorted A to Z; each patient\'s visits stay together, newest first.', SA({ screen: 'spats', stSort: 'name-asc' })],
  ['T05c', 'Patients — visited date', 'Visited date', 'Tap a start and an end day; the list keeps only visits in that range.', SA({ screen: 'spats', stMenu: 'date', stRange: [20, 28] })],
  ['T05d', 'Patients — Department filter open', 'Department', 'Departments with how many visits each.', SA({ screen: 'spats', stMenu: 'dept' })],
  ['T05e', 'Patients — Doctor filter open', 'Doctor', 'Doctors with how many visits each.', SA({ screen: 'spats', stMenu: 'doc' })],
  ['T06', 'Sign out', 'Sign out', 'Asks first. Signing out is reversible, so the button is Brand, not red.', SA({ sheet: 'stsignout' })],
]]);
FLOW.push(['Hospital staff — front desk', [
  ['R01', "Today's arrivals", 'Signs in as the front desk', "Every doctor's patients today. Dr. Sharma's rows follow her queue — Nabin with her, Anisha waiting.", SD()],
  ['R01b', 'No arrivals today', 'Public holiday', 'Nothing booked — and walk-ins will still show up here.', SD({ stHoliday: true })],
  ['R01c', 'Search — “sunita”', 'Types “sunita”', 'Finding one patient in a long day.', SD({ stQ: 'sunita' })],
  ['R01d', 'Status filter open', 'Status', 'One status at a time, with how many patients are in each.', SD({ stMenu: 'status' })],
  ['R01e', 'Filtered — Not arrived', 'Status: Not arrived', 'The no-shows, the state most likely to need Reception.', SD({ stF: { status: ['Not arrived'] } })],
  ['R02', 'Check-in — Sunita Karki', 'Opens Sunita', 'Her booking, reason and last visit before checking her in.', SD({ screen: 'scheck', stId: 'sk' })],
  ['R03', 'Checked in', 'Check in', "Sunita is checked in — and now Waiting in Dr. Sharma's queue on both of her apps.", SD({ screen: 'scheck', stId: 'sk', ckAt: { sk: '4:52 PM' }, drq: { ...EXTRA_STATE_DR().drq, sk: 'waiting' } })],
  ['R04', 'Register a walk-in', 'Register a walk-in', 'A patient without a booking. Pick a doctor on duty; Dr. Sharma\'s walk-ins join her own queue.', SD({ screen: 'swalk' })],
  ['R05', 'Walk-in — follow-up', 'Follow-up visit', 'Once the name matches a record, their recent visits show so the right doctor is chosen.', SD({ screen: 'swalk', wk: { type: 'follow', name: 'Kiran Basnet' } })],
  ['R06', 'Walk-in — is this Sunita?', 'Add to queue with a common name', 'Two records share the name — pick the right one before creating a duplicate.', SD({ screen: 'smatch', wk: { type: 'new', name: 'Sunita' }, stWho: ['sk', 'st'] })],
  ['R07', 'Check-in — Sunita Thapa', 'This is them', "She had a booking after all, so she's checked in rather than added as a walk-in.", SD({ screen: 'scheck', stId: 'st', rq: { ...EXTRA_STATE_ST().rq, st: 'notarrived' } })],
  ['R08', 'Sunita Thapa — checked in', 'Check in', 'Checked in, early for her 5:15 slot.', SD({ screen: 'scheck', stId: 'st', rq: { ...EXTRA_STATE_ST().rq, st: 'waiting' }, ckAt: { st: '4:55 PM' } })],
  ['R09', 'Patients', 'Patients', 'The same visit-by-visit table the administrator sees.', SD({ screen: 'spats' })],
  ['R10', 'Sign out', 'Sign out', 'Asks first, from the name menu.', SD({ sheet: 'stsignout' })],
]]);
FLOW.push(['Hospital staff — HR', [
  ['HR01', 'Staff directory', 'Staff', 'Everyone at the hospital, not just doctors, with who is on leave.', SH()],
  ['HR01b', 'Staff — filtered by role', 'Role: Doctor', 'Only the doctors.', SH({ stF: { role: ['Doctor'] } })],
  ['HR01c', 'Staff — Department filter open', 'Department', 'Departments with headcounts.', SH({ stMenu: 'dept', stF: { dept: ['Dermatology'] } })],
  ['HR01d', 'Staff — Role filter open', 'Role', 'Job titles with headcounts.', SH({ stMenu: 'role', stF: { role: ['Nurse'] } })],
  ['HR01e', 'Staff — Status filter open', 'Status', 'Active or on leave.', SH({ stMenu: 'status', stF: { status: ['On leave'] } })],
  ['HR02', 'Staff — Maya Tuladhar', 'Opens Maya', 'One person\'s employment and contact details.', SH({ screen: 'sperson', stId: 'mt' })],
  ['HR02b', 'Staff — added today', 'Opens the new person', 'Records added in Clinica say who added them, beside the join date and employee ID.', SH({ screen: 'sperson', stId: 's1', stStaff: [{ id: 's1', ini: 'KS', name: 'Kabita Shrestha', title: 'Nurse', dept: 'General medicine', access: 'doctor', emp: 'CH-STF-0270', joined: 'Aug 2026', phone: '+977 98XX-XX1234', email: '', addedBy: 'Anjali Basnet' }] })],
  ['HR03', 'Leave requests', 'Leave requests', 'Requests waiting on HR, alongside ones already decided.', SH({ screen: 'sleave' })],
  ['HR03c', 'Leave requests — Status filter open', 'Status', 'Pending, approved or denied — one at a time.', SH({ screen: 'sleave', stMenu: 'status' })],
  ['HR03d', 'Leave requests — filtered', 'Status: Pending', 'Only what is waiting on HR.', SH({ screen: 'sleave', stF: { status: ['Pending'] } })],
  ['HR03b', 'Leave requests — none pending', 'All decided', 'Nothing waiting — decided requests stay in the history below.', SH({ screen: 'sleave', leave: { ms: 'approved', pk: 'approved' } })],
  ['HR04', 'Leave request — Prasant Khadka', 'Opens Prasant', 'The request with its effect on staffing, so the decision is informed.', SH({ screen: 'sreq', stId: 'pk' })],
  ['HR05', 'Leave request — approved', 'Approve', 'Approved, and Prasant is told.', SH({ screen: 'sreq', stId: 'pk', leave: { ms: 'approved', pk: 'approved' } })],
  ['HR06', 'Leave request — denied', 'Deny', 'Denied, and Prasant is told.', SH({ screen: 'sreq', stId: 'pk', leave: { ms: 'approved', pk: 'denied' } })],
  ['HR07', 'Leave request — Dr. Maya Shrestha', 'Opens Maya', 'An already approved request, read-only.', SH({ screen: 'sreq', stId: 'ms' })],
  ['HR08', 'Attendance', 'Attendance', 'This month for everyone; absences stand out in red.', SH({ screen: 'satt' })],
  ['HR08b', 'Attendance — highest absent', 'Highest to lowest absent', 'Who has missed the most days.', SH({ screen: 'satt', stSort: 'absent-desc' })],
  ['HR08c', 'Attendance — Present sort open', 'Sort: Highest present', 'Sort by days present.', SH({ screen: 'satt', stMenu: 'present', stSort: 'present-desc' })],
  ['HR08d', 'Attendance — Absent sort open', 'Sort: Highest absent', 'Sort by days absent.', SH({ screen: 'satt', stMenu: 'absent', stSort: 'absent-desc' })],
  ['HR09', 'Attendance — Dr. Maya Shrestha', 'Opens Maya', 'Years since joining, days present and non-requested leave, then the month as a calendar. Only the month\'s totals are recorded, so earlier weeks are placed from them; the last week matches Recent days.', SH({ screen: 'satt1', stId: 'ms' })],
  ['HR09b', 'Attendance — one day', 'Taps a day', 'A tap shows that day\'s status.', SH({ screen: 'satt1', stId: 'ms', stCalDay: 26 })],
  ['HR09c', 'Attendance — another month', 'Next month', 'The arrows move between months; days after today are blank.', SH({ screen: 'satt1', stId: 'ms', stCalM: 8 })],
  ['HR10', 'Dashboard', 'Signs in as HR', 'Today\'s headcount — available means present and working, so on leave and off duty are both left out — and the latest leave requests.', SH({ screen: 'shdash' })],
  ['HR11', 'Add staff', 'Add staff', 'One form for any role, for HR and the administrator. Role and department are pick-lists; a doctor also joins the roster.', SH({ screen: 'saddst' })],
  ['HR11b', 'Add staff — missing details', 'Add staff with fields empty', 'Each required field says what it needs. Email is optional.', SH({ screen: 'saddst', stNewErr: { name: 'Full name is required.', phone: 'Phone number is required.', role: 'Role is required.', dept: 'Department is required.' } })],
  ['HR11c', 'Add staff — added', 'Add staff', 'Back in the directory, with the new person in it.', SH({ stDone: 'Kabita Shrestha has been added', stStaff: [{ id: 's1', ini: 'KS', name: 'Kabita Shrestha', title: 'Nurse', dept: 'General medicine', access: 'doctor', emp: 'CH-STF-0270', joined: 'Aug 2026', phone: '+977 98XX-XX1234', email: '', addedBy: 'Anjali Basnet' }] })],
  ['HR12', 'Sign out', 'Sign out', 'Asks first, from the name menu.', SH({ screen: 'shdash', sheet: 'stsignout' })],
]]);
}, ORDER.staff);
