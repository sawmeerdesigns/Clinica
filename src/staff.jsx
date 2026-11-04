// Clinica for City Hospital's staff — the hospital web app (1440 × 900). One sign-in; what you see follows your role:
// the administrator, the front desk and HR. Figma: zw3saW6ot26E6gWH20K3ux, section 553:19705.
// Same world as the doctor's apps and Anisha's phone: checking a patient in puts them in Dr. Sharma's queue as Waiting,
// a walk-in for her joins it, and the dashboard counts the reports she hasn't released yet.
import { Children, Fragment, cloneElement } from 'react';
import { Phone, btn, digits, empty, listItem, masked, range, start, support } from './app.jsx';
import { T, acts, say, src } from './ask.jsx';
import { bar, initials, label, row, rows, sk, tag, when } from './booking.jsx';
import { csheet, notice, setting, signoutSheet } from './care.jsx';
import { $phone, A, ACTIONS, FLOW, NUM, ORDER, OVERLAY, S, SCREENS, after, back, every, extraState, go, later, mount, onPhone, paint, render, reset, sepJoin, toast, toastClear } from './core.jsx';
import { DR_HISTORY, DR_PATIENTS, EXTRA_STATE_DR, draftCue, drField, drRadio, drStatus, drTime, drToday, showApp } from './doctor.jsx';
import { field, list } from './health.jsx';
import { ring } from './meds.jsx';
import { ARR, ARR_STATE, COVER, DEPTS, DOCTORS, PLAIN, SYMPTOMS, TODAY, dayAt, dayLabel, mdOf, phoneOf } from './data.js';

// ---------- data ----------
export const ROLES = {
  doctor: ['Doctor', 'Runs a personal queue, writes notes and releases reports', ["Their own queue and today's patients", 'Writing visit notes and prescriptions', 'Releasing lab reports to patients']],
  // F08/R16/T18: nurses and the lab technician get their own access, without the doctor's prescribing and report release.
  nurse: ['Nurse', "Works their department's queue; can't prescribe or release reports", ["Their department's arrivals today", 'Checking patients in for their doctors', 'Not included: prescriptions and releasing lab reports']],
  // Run 6 Y19: the lab technician gets Lab access, not Nurse access (no queue, no check-ins).
  lab: ['Lab', 'Sends lab results to the doctor who asked for them', ['Uploading lab results for doctors to review', 'The lab worklist: tests ordered today', 'Not included: patient queues, check-ins, prescriptions and releasing reports']],
  desk: ['Front desk', 'Checks patients in and registers walk-ins', ["Today's arrivals across every doctor", 'Check patients in and register walk-ins', 'Search and match returning patients']],
  hr: ['HR manager', 'Manages the staff directory and leave requests', ['The whole staff directory, not just doctors', 'Leave requests and approvals', 'Individual staff records and contact details']],
  // T23: a trustee reads the dashboard and departments and changes nothing. Trustees aren't staff, so they're not in the directory or Assign roles.
  trustee: ['Trustee', 'Reads the hospital dashboard and departments; changes nothing', ['Hospital-wide dashboard', 'Departments, with who covers a closed one', 'Not included: adding, editing or registering anything']],
  admin: ['Hospital administrator', 'Sees hospital-wide dashboards, doctors and departments', ['Hospital-wide dashboard and reports', 'Full doctor roster and departments', 'Settings, including adding doctors and assigning roles']],
};
// id: initials, name, job title, department, access role, employee ID, joined
// W20: the doctors come from the one doctor list (data.js); the rest of the staff are listed here.
export const STAFF = [...Object.entries(DOCTORS).map(([id, d]) => [id, [d.ini, d.name, 'Doctor', d.spec, 'doctor', d.emp, d.joined]]), ...Object.entries({
  sbr: ['SbR', 'Sabina Rai', 'Front desk', 'Reception', 'desk', 'CH-STF-0204', 'May 2021'],
  rk: ['RK', 'Rajesh Koirala', 'Administrator', 'Hospital management', 'admin', 'CH-ADM-04', 'Jul 2015'],
  ab: ['AB', 'Anjali Basnet', 'HR manager', 'Human resources', 'hr', 'CH-HR-03', 'Oct 2018'],
  mt: ['MT', 'Maya Tuladhar', 'Nurse', 'General medicine', 'nurse', 'CH-STF-0231', 'Mar 2022'], // F08: Nurse access, not Doctor
  pk: ['PsK', 'Prasant Khadka', 'Nurse', 'Cardiology', 'nurse', 'CH-STF-0247', 'Jan 2023'],
  nl: ['NL', 'Nirmala Lama', 'Lab technician', 'City Hospital lab', 'lab', 'CH-STF-0219', 'Jun 2020'], // Run 6 Y19
})].map(([id, [ini, name, title, dept, access, emp, joined]]) => ({ id, ini, name, title, dept, access, emp, joined }));
// Everyone on the hospital's books: id, usual doctor, visits, last visit.
export const PATS = [['as', 'ps', 4, 'Aug 28, 2026'], ['bt', 'ps', 2, 'Aug 28, 2026'], ['sm', 'ps', 1, 'Aug 28, 2026'], ['di', 'ps', 3, 'Aug 28, 2026'], ['sl', 'rs', 1, 'Aug 28, 2026'],
  ['kg', 'ps', 2, 'Aug 28, 2026'], ['nk', 'aj', 1, 'Aug 28, 2026'], ['rb', 'ps', 1, 'Aug 28, 2026'], ['rt', 'rs', 2, 'Aug 28, 2026'], ['bp', 'aj', 1, 'Aug 28, 2026'],
  ['nt', 'ps', 3, 'Aug 28, 2026'], ['sk', 'ps', 2, 'Mar 3, 2026'], ['pa', 'rs', 1, 'Aug 28, 2026'], ['kb', 'rs', 3, 'Aug 12, 2026'], ['st', 'rs', 1, 'Jan 14, 2026'],
  ['pm', 'bt', 1, 'Aug 28, 2026'], ['hb', 'bt', 1, 'Aug 28, 2026'], ['aa', 'sr', 1, 'Aug 28, 2026'], ['ik', 'sr', 1, 'Aug 28, 2026'], ['rm', 'sr', 1, 'Aug 28, 2026'], ['ls', 'kg', 1, 'Aug 28, 2026'], ['sg', 'kg', 1, 'Aug 28, 2026']]; // R05/T06: today's arrivals in every department
export const EARLIER = { di: [['Nov 4, 2025', 'Dr. Priya Sharma · Skin rash']], sk: [['Oct 21, 2025', 'Dr. Priya Sharma · General checkup']],
  as: [['Aug 12, 2026', 'Dr. Ramesh Shrestha · Ear infection'], ['Jul 3, 2026', 'Dr. Anita Joshi · General checkup'], ['Jun 20, 2026', 'Dr. Anita Joshi · Walk-in']] };
// Leave requests, one per id: who, type, first and last day, when asked, and the reason given (F16/R18).
// F17/R17/T17: every leave day on the attendance calendar belongs to one of these — Maya's Aug 17–21 annual leave included.
const D = (m, d) => new Date(2026, m, d);
export const LEAVES = {
  ms: { who: 'ms', type: 'Sick leave', from: D(7, 26), to: D(8, 2), asked: 'Aug 20, 2026', why: 'Minor surgery on Aug 26; the surgeon advised a week of rest.' },
  pk: { who: 'pk', type: 'Annual leave', from: D(8, 5), to: D(8, 7), asked: 'Aug 27, 2026' /* T28/R18: before the demo's today, Aug 28 */, why: "My sister's wedding in Pokhara." },
  ms0: { who: 'ms', type: 'Annual leave', from: D(7, 17), to: D(7, 21), asked: 'Aug 3, 2026', why: 'Family visit in Dharan.' },
  rs1: { who: 'rs', type: 'Casual leave', from: D(7, 19), to: D(7, 19), asked: 'Aug 14, 2026', why: "Child's school meeting." },
  sr1: { who: 'sr', type: 'Casual leave', from: D(7, 7), to: D(7, 7), asked: 'Aug 4, 2026', why: 'Bank appointment.' },
};
// T17: a request counts calendar days; attendance counts working days in the month shown.
// Phase 6: the working week is Sun–Fri, as the OPDs keep it (Nepal's week); only Saturday is off.
const isWork = d => d.getDay() !== 6;
const spanDays = (a, b, f = () => true) => { let n = 0; for (let d = new Date(a); d <= b; d.setDate(d.getDate() + 1)) if (f(d)) n++; return n; };
export const leaveSpan = l => `${mdOf(l.from)}${+l.from === +l.to ? '' : ` – ${mdOf(l.to)}`}, 2026`;
export const leaveDays = l => { const c = spanDays(l.from, l.to), w = spanDays(l.from, l.to, isWork);
  return `${c} calendar day${c === 1 ? '' : 's'} · ${w} working day${w === 1 ? '' : 's'}`; };
// Days missed in August with no leave request behind them (the only days not worked out from requests).
export const ABSENT = { sk: [25, 27], nl: [27] };
export const SIGN_IDS = { 'CH-ADM-04': 'rk', 'CH-FD-12': 'sbr', 'CH-HR-03': 'ab', 'CH-TRS-01': 'tb' };
// T23: the board's read-only sign-in, kept off the staff list.
export const TRUSTEES = [{ id: 'tb', ini: 'BK', name: 'Bimala Karki', title: 'Trustee', dept: 'Board of trustees', access: 'trustee', emp: 'CH-TRS-01', joined: 'Jan 2020' }];

export const EXTRA_STATE_ST = () => ({
  stMe: null, stErr: false, stForgot: false, stHoliday: false, stAccess: {}, stDocs: [], walk: {}, ckAt: {},
  rq: { ...ARR_STATE } /* everyone else's arrivals today (data.js) */, leave: { ms: 'approved', pk: 'pending', ms0: 'approved', rs1: 'approved', sr1: 'approved' },
  lvHist: {}, // Run 6 Y07: decisions that were reopened, kept per request
  lvBy: { ms: ['Anjali Basnet', 'Aug 21, 10:05 AM'], ms0: ['Anjali Basnet', 'Aug 4, 9:40 AM'], rs1: ['Anjali Basnet', 'Aug 14, 2:15 PM'], sr1: ['Anjali Basnet', 'Aug 4, 11:20 AM'] }, // T16/W08: who decided, and when
  lvWhy: {}, lvAsk: null, lvNote: '', // W08: the denial reason sent to the employee; the decision waiting on its confirm sheet
  stLeaveOk: {}, stAudit: [], stLv: { on: false, until: '' }, // W04: "Also approves leave" (id → { until }); R16/T18: role changes
  stEdits: {}, stEdit: null, stForce: false, // F18/R19/T13 and F06: edits to a record; adding a doctor without OPD/days after the warning
  wkDesk: {}, stHi: null, // T09/V10: what the desk typed for a matched booking; F12/R14: the new row to highlight
  stQ: '', stMenu: null, stF: {}, stSort: '', stRange: [], stSel: [], stId: null, stWho: [], stPick: null, stDone: '',
  wk: { type: 'new' }, wkErr: {}, stAdd: {}, stAddErr: {}, stAdded: null, stHospSaved: false, stSet: { leave: true, reports: true, staff: false },
  stSignId: '', // the Staff ID field (Run 6 Y26: every role signs in here, not only the admin)
  stFrom: null, // where Add a doctor was opened from, for its back link
  stDepts: [], stMoved: {}, stDept: { docs: [] }, stDeptErr: {}, stDeptAdded: null, // Add a department
  stStaff: [], stNew: {}, stNewErr: {}, // Add staff
  stCover: {}, // Phase 6: who covers a closed department (department → doctor id); COVER in data.js is the default
  stCalM: 7, stCalDay: null, // attendance calendar: month shown (0 = Jan) and the day tapped
});
extraState(EXTRA_STATE_ST, ORDER.staff);
export const wkFilled = () => ['name', 'phone', 'age', 'h', 'w', 'doc', 'reason', 'note'].some(k => String(S.wk[k] || '').trim()); // T21: a half-filled walk-in
export const STAFF_START = () => ({ app: 'staff', screen: 'ssignin', signedIn: true, visitDay: 'checkedin', followup: null });

// ---------- the shared world ----------
export const people = () => [...STAFF, ...S.stDocs.map(d => ({ ...d, title: 'Doctor', dept: d.spec, access: 'doctor', emp: d.emp, joined: d.joined || 'Aug 2026' })), ...S.stStaff]
  .map(p => ({ ...p, ...S.stEdits[p.id] })) // F18/R19/T13, F06: a record's later edits
  .map(p => ({ ...p, access: S.stAccess[p.id] || p.access, dept: S.stMoved[p.id] ? deptName(S.stMoved[p.id]) : p.dept }));
export const person = id => people().find(p => p.id === id) || TRUSTEES.find(p => p.id === id);
export const readOnly = () => stMe()?.access === 'trustee'; // T23: every data-changing control is hidden
export const isSeed = p => STAFF.some(x => x.id === p.id);
export const seedEmail = p => `${p.name.replace(/^Dr\.\s*/, '').toLowerCase().replace(/\s+/g, '.')}@cityhospital.np`; // the hospital's own address for staff on its books
export const stMe = () => person(S.stMe);
export const stHome = () => ({ admin: 'sdash', trustee: 'sdash', desk: 'sarr', nurse: 'sarr', hr: 'shdash' })[stMe()?.access] || 'ssignin';
export const roster = () => people().filter(p => p.title === 'Doctor');
// OPD, (unused), duty, NMC registration, next free slot, reports waiting on them — from the one doctor list (data.js).
export const docOf = id => { const d = S.stDocs.find(x => x.id === id), r = DOCTORS[id], e = S.stEdits[id] || {};
  return d ? [d.opd || '', 0, 'off', d.nmc || '', '', 0] : [e.opd || r.opd, 0, r.duty, e.nmc || r.nmc, r.slot, r.reps]; };
// F07/R05/T06/V07: a doctor's patients today are counted from today's arrivals, walk-ins included — never a typed number.
export const ptToday = id => arrivals().filter(k => arr(k).doc === id).length;
export const duty = id => docOf(id)[2];
export const repsOf = id => id === 'ps' ? S.drPending.length : docOf(id)[5];
export const DUTY = { on: ['On duty', 'success'], off: ['Off duty', 'neutral'], leave: ['On leave', 'warn'] };
export const ARR_TAG = { done: ['Completed', 'neutral'], waiting: ['Waiting', 'warn'], with: ['With doctor', 'success'], notarrived: ['Not arrived', 'error'] }; // a no-show most needs Reception's attention
export const pid = k => (arr(k).info.match(/CH-\d+/) || [])[0] || ''; // the record's own ID; a new walk-in has none yet
// F18/R19/T13: a new hire is Pending until their start date; on leave follows the approved requests.
export const staffStatus = p => p.start && p.start > TODAY ? 'Pending' : leaveOn(p.id, TODAY) ? 'On leave' : 'Active';
export const STATUS_TAG = { Active: ['Active', 'success'], 'On leave': ['On leave', 'warn'], Pending: ['Pending', 'neutral'] };
export const isoDate = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
export const fromIso = v => { const [y, m, d] = v.split('-').map(Number); return new Date(y, m - 1, d); };
export const NOT_SET = 'Not set'; // F06/R06/T24: a blank field says so, never a made-up value
// W04: leave approvals come with HR manager, or as an add-on to any role, until an optional end date.
export const leaveOk = id => S.stLeaveOk[id] && (!S.stLeaveOk[id].until || TODAY <= S.stLeaveOk[id].until) ? S.stLeaveOk[id] : null;
export const approvesLeave = p => p.access === 'hr' || !!leaveOk(p.id);
export const accessText = p => `${ROLES[p.access][0]}${p.access !== 'hr' && leaveOk(p.id) ? ` + approves leave${leaveOk(p.id).until ? ` until ${mdOf(leaveOk(p.id).until)}` : ''}` : ''}`;

// ---------- leave and attendance ----------
export const leaveOn = (id, date) => Object.keys(LEAVES).find(k => LEAVES[k].who === id && S.leave[k] === 'approved' && date >= LEAVES[k].from && date <= LEAVES[k].to);
// F17/R17/T17/V12: attendance is worked out day by day from the leave requests and recorded absences, so every figure counts the same days,
// and a month counts only its own days (Maya's sick leave into September shows on September).
export function dayKind(id, date) {
  const p = person(id);
  if (date > TODAY || (p?.start && date < p.start)) return null; // the future, and days before they started, stay blank
  if (!isWork(date)) return 'weekend';
  if (date.getMonth() !== 7 || date.getFullYear() !== 2026) return null; // only August is recorded
  if (leaveOn(id, date)) return 'leave';
  return (ABSENT[id] || []).includes(date.getDate()) ? 'absent' : 'present';
}
export const monthAtt = (id, y = 2026, mo = 7) => { const c = { total: 0, present: 0, leave: 0, absent: 0 }, n = new Date(y, mo + 1, 0).getDate();
  for (let d = 1; d <= n; d++) { const k = dayKind(id, new Date(y, mo, d)); if (k && k !== 'weekend') { c.total++; c[k]++; } } return c; };
// R17: the last week up to today, from the same days as the calendar.
export const recentDays = id => Array.from({ length: 7 }, (_, i) => dayAt(i - 6)).map(d => [dayLabel(d), dayKind(id, d), leaveOn(id, d)]).filter(([, k]) => k)
  .map(([d, k, lk]) => [d, lk ? LEAVES[lk].type : CAL_LABEL[k], lk]);
// Departments, with any added today; a doctor moved into a new one leaves their old one (one department each).
// R07/T08: each department's doctors come from the roster, so a doctor added in admin joins hers straight away.
export const deptName = k => DEPTS[k]?.[0] || S.stDepts.find(d => d.k === k)?.name;
export const depts = () => [...Object.entries(DEPTS), ...S.stDepts.map(d => [d.k, [d.name, d.opd]])]
  .map(([k, [name, opd]]) => [k, [name, opd, roster().filter(p => p.dept.trim().toLowerCase() === name.toLowerCase()).map(p => p.id)]]);
export const deptOf = k => Object.fromEntries(depts())[k];
export const isNewDept = k => S.stDepts.some(d => d.k === k); // added today: running, nobody seen yet
export const deptPts = k => deptOf(k)[2].reduce((s, i) => s + ptToday(i), 0); // F07: its doctors' arrivals, so the cards add up to the dashboard
export const deptKOf = docId => depts().find(([, [, , ids]]) => ids.includes(docId))?.[0];
export const deptLabel = k => `${deptName(k)}${PLAIN[k] ? ` · ${PLAIN[k]}` : ''}`; // T23: "Cardiology · heart"
export const waitingIn = k => arrivals().filter(x => deptOf(k)[2].includes(arr(x).doc) && arrSt(x) === 'waiting').length; // F13/R21/T07
// R21/T27: a closed department says why, who covers and when it reopens. Reopening is the next day one of its doctors works (never a Saturday).
const WD = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const backOn = id => { const lk = leaveOn(id, TODAY), m = (DOCTORS[id]?.days || '').match(/(\w{3})–(\w{3}), (\S+ [AP]M)/);
  if (!m) return null;
  const [a, b] = [WD.indexOf(m[1]), WD.indexOf(m[2])];
  for (let n = 1; n < 30; n++) { const d = dayAt(n), w = d.getDay(); if (w !== 6 && w >= a && w <= b && !(lk && d <= LEAVES[lk].to)) return [d, `${dayLabel(d)}, ${m[3]}`]; }
  return null; };
// T08: why a doctor isn't in, from her own working days and TODAY: "Not in today · works Sun–Thu · next in Sun, Aug 30".
export const notIn = id => { const p = person(id), m = ((S.stDocs.some(x => x.id === id) ? p.days : p.days || DOCTORS[id]?.days) || '').match(/(\w{3})\s*[–-]\s*(\w{3})/);
  const [a, b] = m ? [WD.indexOf(m[1]), WD.indexOf(m[2])] : [-1, -1];
  if (a < 0 || b < 0) return 'Not in today';
  const next = Array.from({ length: 7 }, (_, n) => dayAt(n + 1)).find(d => d.getDay() !== 6 && d.getDay() >= a && d.getDay() <= b);
  return `Not in today · works ${m[1]}–${m[2]}${next ? ` · next in ${dayLabel(next)}` : ''}`; };
// Who covers a closed department: admin's choice on its page, else the default in data.js (COVER).
export const coverOf = k => S.stCover[k] || COVER[k];
// Phase 6: the cover can be changed on the department's page, from the doctors on duty in other departments.
export const coverPick = k => { const ids = deptOf(k)[2], opts = roster().filter(p => duty(p.id) === 'on' && !ids.includes(p.id)).map(p => p.id);
  return <div style={{ maxWidth: 343 }}>{sSelect('st-cover', 'Who covers it today', 'Choose a doctor', dname(coverOf(k)), opts.map(dname), '', e => {
    S.stCover = { ...S.stCover, [k]: opts.find(i => dname(i) === e.target.value) }; toast(`${e.target.value} now covers ${deptName(k)}.`); render(); })}</div>; };
export function closure(k) {
  const [, , ids] = deptOf(k);
  if (!ids.length || isNewDept(k) || ids.some(i => duty(i) === 'on')) return null;
  const why = ids.map(i => duty(i) === 'leave' ? `${dname(i)} is on leave` : `${dname(i)} works ${(DOCTORS[i]?.days || '').split(',')[0] || 'other days'}, not ${WD[TODAY.getDay()]}days`).join('; ');
  const back = ids.map(backOn).filter(Boolean).sort((x, y) => x[0] - y[0])[0], c = coverOf(k);
  return { why, cover: c ? `${dname(c)}, ${person(c).dept} (${docOf(c)[0]})` : 'No cover set', reopen: back ? back[1] : 'Not set' };
}
// Who can sign in to what follows the job: the same access the existing staff with that title have.
export const ACCESS_OF = { Doctor: 'doctor', 'Front desk': 'desk', 'HR manager': 'hr', Administrator: 'admin', Nurse: 'nurse', 'Lab technician': 'lab' }; // F08; Run 6 Y19
export const signoutBody = { trustee: "You'll need to sign in again to see the dashboard.", desk: "You'll need to sign in again to see today's check-ins.", nurse: "You'll need to sign in again to see today's check-ins.", hr: "You'll need to sign in again to see staff and leave requests.", admin: "You'll need to sign in again to manage the hospital." };

// A patient as reception sees them today. Dr. Sharma's take their place in the queue from her app.
export function arr(k) {
  const w = S.walk[k];
  if (w) return w;
  const p = DR_PATIENTS[k];
  if (p) return { name: p.name, ini: p.ini, info: p.info, doc: 'ps', time: drTime(k), reason: p.reason, phone: phoneOf(k) || NOT_SET,
    hist: DR_HISTORY[k] || (p.hist ? p.hist.split(', ').map(d => [`${d}, 2026`, `Dr. Priya Sharma · ${k === 'sk' ? 'General checkup' : p.short}`]) : []) };
  const [name, ini, info, doc, time, reason, hist] = ARR[k];
  return { name, ini, info, doc, time, reason, hist, phone: phoneOf(k) || NOT_SET };
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
  nurse: [['Check-in', 'snav-checkin-active', 'snav-checkin-active', 'sarr']], // F08: their department's arrivals
  trustee: [['Dashboard', 'dnav-dashboard-secondary', 'dnav-dashboard-active', 'sdash'], ['Departments', 'dnav-departments', 'dnav-departments-active', 'sdepts']], // T23
  hr: [['Dashboard', 'dnav-dashboard-secondary', 'dnav-dashboard-active', 'shdash'], ['Staff', 'dnav-staff-primary', 'icon-group-filled-action-20', 'sstaff'],
    ['Leave requests', 'icon-schedule-secondary-20', 'dnav-leave-active', 'sleave'], ['Attendance', 'icon-calendar-month-secondary-20', 'dnav-attendance-active', 'satt']],
};
// W04: anyone who also approves leave gets Leave requests beside their own pages.
export const navOf = me => [...NAV[me.access], ...(me.access !== 'hr' && leaveOk(me.id) ? [NAV.hr[2]] : [])];
export const SEC = { sdoc: 'sdocs', sdept: 'sdepts', spat: 'spats', scheck: 'sarr', swalk: 'sarr', smatch: 'sarr', sperson: 'sstaff',
  sadd: 'sset', sroles: 'sset', srole: 'sset', sacct: 'sset', shosp: 'sset', sreq: 'sleave', satt1: 'satt', sadddept: 'sdepts', saddst: 'sstaff' };
export const secOf = sc => sc === 'sadd' && S.stFrom === 'sdocs' ? 'sdocs' : sc === 'srole' && S.stFrom === 'sperson' ? SEC.sperson || 'sstaff' : SEC[sc] || sc; // Run 6 Y26: a role changed from a profile stays in Staff // Add a doctor belongs to wherever it was opened from
export const img = (f, s = 20) => <img src={`${A}${f}.svg`} width={s} height={s} alt="" />;
export const mtJoin = items => items.map((x, i) => <Fragment key={i}>{i > 0 && <div className="mt-sep" aria-hidden="true" />}{x}</Fragment>);

export function sSide() {
  const me = stMe(), root = secOf(S.screen);
  const menu = <div className="st-dd up" role="menu">{me.access === 'admin' ? <button className="st-opt" role="menuitem" data-act="st-go:sacct">Account settings</button> : null}
    <button className="st-opt" role="menuitem" data-act="st-signout">Sign out</button></div>;
  return <aside className="k-side st"><div className="k-top"><p className="k-logo">Clinica</p><nav className="k-nav" aria-label="Main">{navOf(me).map(([l, i, ia, sc]) => sc !== root
    ? <a key={sc} href="#" className="k-ni" data-act={`st-go:${sc}`}>{img(i)}{l}</a>
    : S.screen === sc ? <span key={sc} className="k-ni on" aria-current="page">{img(ia)}{l}</span> // below the section root, the active item leads back to it
      : <a key={sc} href="#" className="k-ni on" aria-current="page" data-act={`st-go:${sc}`}>{img(ia)}{l}</a>)}</nav></div>
    <div className="st-dd-wrap">{S.stMenu === 'me' ? menu : null}<button className="k-me" data-act="st-menu:me" aria-haspopup="menu" aria-expanded={S.stMenu === 'me'}><span className="avatar" aria-hidden="true">{initials(me.name)}</span>
      <span className="st-me"><span className="item-title">{me.name}</span><span className="dr-body">{ROLES[me.access][0]}</span></span></button></div></aside>;
}
export const sPage = (inner, cls = '') => <div className="screen k">{sSide()}<main className={`st-main ${cls}`}>
  {readOnly() ? <p className="st-ro">{sTag(['Read-only', 'neutral'])}<span className="dr-body">Your trustee account can look at the dashboard and departments, but can't change anything.</span></p> : null}{/* Run 6 Y18 */}
  {inner}</main></div>;
export const sHead = (t, sub, right = null) => <div className="st-hd"><div className="st-ttl"><h1 className="k-h2">{t}</h1><p className="dr-sub" aria-live="polite">{sub}</p>{/* W18: result counts are announced */}</div>{right}</div>;
// Typing re-renders in place; React keeps the input, so focus and caret stay put.
export const sSearch = ph => <div className="field st-search"><input id="st-q" type="search" placeholder={ph} aria-label={ph} value={S.stQ}
  onChange={e => { S.stQ = e.target.value; S.stSel = []; sRe(); }} /></div>;
export const sBack = (label, sc) => <a href="#" className="k-link" data-act={`st-go:${sc}`} aria-label={`Back to ${label}`}>{img('icon-chevron-left-action-16', 16)}{label}</a>; // W18: not a second "Leave requests" link
// W13: a detail page's heading is the person's name. R27: initials are decoration.
export const sWho = (ini, name, sub, right = null, h = 'k-name') => <div className="st-hd"><div className="k-id"><span className="avatar l" aria-hidden="true">{ini}</span><div><h1 className={h}>{name}</h1><p className="dr-sub">{sub}</p></div></div>{right}</div>;
export const sSec = (t, inner) => <section className="stack16"><h2 className="st-sec">{t}</h2>{inner}</section>;
export const sStats = stats => <div className="st-stats fix">{stats.map(([v, l, c]) => <div key={l} className="st-stat"><p className="k-h2">{v}</p><p className="st-sl">{l}</p><p className="dr-body">{c}</p></div>)}</div>;
// A pick-list field: the native select, dressed as a text field.
export const sSelect = (id, label, ph, value, opts, err, onChange) => <div className="field-wrap"><label className="label" htmlFor={id}>{label}</label>
  <div className={`field st-sel ${err ? 'err' : ''}`}><select id={id} value={value || ''} onChange={onChange} className={value ? '' : 'ph'}>
    <option value="" disabled>{ph}</option>{opts.map(o => <option key={o} value={o}>{o}</option>)}</select>{img('icon-chevron-down-secondary-14', 14)}</div>{err ? support(err, 'err') : null}</div>;
export const sKV = rows => <div className="mt-list">{mtJoin(rows.map(([k, v]) => <div className="st-kv"><span>{k}</span><b>{v}</b></div>))}</div>;
export const sHist = rows => <div className="mt-list">{sepJoin(rows.map(([d, s]) => row('lt-history.svg', d, s)))}</div>;
export const sTag = ([t, tone]) => tag(t, `${tone} s12`);
// W03: success is announced once, by the shared toast; this is the lasting record on the page.
export const sOk = (t, deny) => <p className={`st-ok ${deny ? 'n' : ''}`}>{img(deny ? 'icon-cancel-secondary-20' : 'icon-check-circle-success-20')}{t}</p>;
export const sEmpty = (icon, t, b) => <div className="st-empty">{img(icon, 32)}<p className="st-et">{t}</p><p className="dr-body">{b}</p></div>;
export const cb = on => <span className={`cb ${on ? 'on' : ''}`} aria-hidden="true">{on ? img('icon-check-white-14', 14) : null}</span>;
export const cbBtn = (on, act, label) => <button className="cb-btn" role="checkbox" aria-checked={on} aria-label={label} data-act={act}>{cb(on)}</button>;
// Figma sync: no pager. Every table shows all its rows (R09: 33 visits), so Figma's 'Previous / 1 / Next' only ever had one page.
// ponytail: add a real pager (page size, Previous/Next acts) when a table outgrows one screen.

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
// A2/R28/V19: real table roles (table › rowgroup › row › columnheader/cell); each row's name is the link that opens it,
// and the row stays clickable for the mouse. cols: [label, width, aria-sort ('ascending' | 'descending' | 'none') for a sortable column (W18)].
export let stVisible = [];
const asCells = el => Children.toArray(el.props.children).map(c => c.props?.className === 'sp' ? cloneElement(c, { 'aria-hidden': true }) : cloneElement(c, { role: 'cell' }));
export function sTable(cols, items, cells, act, label) {
  stVisible = items.map(x => x.id);
  const all = items.length > 0 && items.every(x => S.stSel.includes(x.id)); // A3: an empty list is not "all selected" (0 leaked into aria-checked)
  return <div className="st-tbl" role="table" aria-label={label}><div role="rowgroup"><div className="st-th" role="row"><span role="columnheader">{cbBtn(all, 'st-cball', 'Select all')}</span>
    {cols.map(([l, w, sort], i) => w ? <span key={i} role="columnheader" aria-sort={sort} style={{ width: w }}>{l}</span> : <Fragment key={i}><span className="sp" aria-hidden="true"></span><span role="columnheader" aria-sort={sort}>{l}</span></Fragment>)}</div></div>
    <div className="st-rows" role="rowgroup">{sepJoin(items.map(x => <div className={`st-tr ${S.stHi === x.id ? 'hi' : ''}`} id={`st-row-${x.id}`} role="row" {...(act ? { 'data-act': `${act}:${x.id}` } : {})}><span role="cell">{cbBtn(S.stSel.includes(x.id), `st-cb:${x.id}`, `Select ${x.name}`)}</span>{asCells(cells(x))}</div>))}</div></div>;
}
// R28/V19: the name opens the row (a link, so it's announced as one). R27: initials are decoration.
export const nmCell = (x, w, act) => <span className="nm" style={{ width: w }}><span className="avatar" aria-hidden="true">{x.ini}</span>{act ? <a href="#" className="st-nm" data-act={`${act}:${x.id}`}>{x.name}</a> : x.name}</span>;
export const cell = (t, w, cls = '') => <span className={cls} style={{ width: w }}>{t}</span>;
export const byQ = (list, ...fs) => { const q = S.stQ.trim().toLowerCase(); return q ? list.filter(x => fs.some(f => f(x).toLowerCase().includes(q))) : list; };

// A row of today's arrivals — the doctor's queue row, with the doctor where the reason was.
// F11/R09: age and the phone's last four digits tell two Sunitas apart. F21: the department beside the doctor. F12/R14: the new walk-in is highlighted.
export const ageOf = a => (a.info.match(/· (\d+) ·/) || [])[1];
export const end4 = a => (a.phone.match(/(\d{4})$/) || [])[1];
export const arrRow = k => {
  const a = arr(k), st = arrSt(k), past = st === 'done', who = [ageOf(a) && `${ageOf(a)} yrs`, end4(a) && `phone ending ${end4(a)}`].filter(Boolean).join(' · ');
  return <button className={`list-item k-row ${S.stHi === k ? 'sel' : ''}`} id={`arr-${k}`} data-act={`st-arr:${k}`}><span className="avatar" aria-hidden="true">{a.ini}</span>
    <span className="dq-t"><span className={`h-s ${past ? 'past' : ''}`}>{a.name}</span>{pid(k) || who ? <span className="st-pid">{[pid(k), who].filter(Boolean).join(' · ')}</span> : null}
      <span className="dq-r">{dname(a.doc)} · {deptName(deptKOf(a.doc)) || person(a.doc)?.dept} · {docOf(a.doc)[0]}</span>
      <span className="dq-m"><span className={past ? 'past' : 'now'}>{a.time}</span>{sTag(ARR_TAG[st])}</span></span></button>;
};

// ---------- screens ----------
Object.assign(SCREENS, {
  // The Sign in button's click signs in, and Enter in a field clicks it, so the form itself only stops the page submitting.
  ssignin: () => <div className="screen k k-sign"><form className="k-card" id="st-form" noValidate onSubmit={e => e.preventDefault()}>
      <div className="dr-brand"><h1 className="wordmark-s">Clinica</h1>{/* W13 */}<p className="dr-sub">Hospital management — City Hospital</p></div>
      <div className="fields st-f8"><div className="field-wrap"><label className="label" htmlFor="st-id">Staff ID</label><div className="field"><input id="st-id" placeholder="e.g. CH-ADM-04" autoComplete="username"
        value={S.stSignId} onChange={e => { S.stSignId = e.target.value; paint(); }} /></div></div>
        {drField('st-pw', 'Password', 'Password', S.stErr ? 'Staff ID or password is incorrect. Try again.' : '')}
        <a href="#" className="dr-link" data-act="st-forgot">Forgot your password?</a>{S.stForgot ? support('IT support can reset it — call extension 210.') : null}</div>
      <div className="stack12">{btn('Sign in', 'st-signin', { size: 'l' })}<p className="dr-body tertiary" style={{ textAlign: 'center' }}>Trouble signing in? Call IT support.</p></div>
    </form></div>,

  // ----- Administrator -----
  sdash: () => {
    const docs = roster(), on = docs.filter(d => duty(d.id) === 'on'), h = S.stHoliday, Row = readOnly() ? 'div' : 'button'; // T23: a trustee's rows only read
    const stats = [[arrivals().length, 'Patients today', 'Across all departments'] /* F07/R05/T06/V07: the same list Reception shows */, [h ? 0 : on.length, 'Doctors on duty', `Of ${docs.length} on the roster`],
      [h ? 0 : docs.reduce((s, d) => s + repsOf(d.id), 0), 'Reports awaiting review', "Lab reports doctors haven't released"] /* T27: about reports, not patients */, [arrivals().filter(k => arrSt(k) === 'notarrived').length, 'Not yet arrived', 'Booked, not checked in']];
    return sPage(<>{sHead('Today', 'Aug 28, 2026 · City Hospital')}
      <div className="st-stats">{stats.map(([v, l, c]) => <div key={l} className="st-stat"><p className="k-h2">{v}</p><p className="st-sl">{l}</p><p className="dr-body">{c}</p></div>)}</div>
      <section className={`stack8 ${h ? 'st-grow' : ''}`}><div className="st-hd"><h2 className="dr-h1" style={{ fontSize: 20, lineHeight: '24px' }}>Doctors on duty</h2>{readOnly() ? null : <a href="#" className="st-a" data-act="st-go:sdocs">View all doctors</a>}</div>
        {h ? sEmpty('icon-event-available-tertiary-32', 'No doctors on duty', 'Public holiday — check back tomorrow.')
          : <div className="st-rows">{sepJoin(on.map(d => <Row className={`list-item st-dr${readOnly() ? ' static' : ''}`} data-act={readOnly() ? undefined : `st-doc:${d.id}`}><span className="avatar" aria-hidden="true">{d.ini}</span>
            <span className="dq-t"><span className="st-nm">{d.name}</span><span className="dr-body">{d.dept} · {docOf(d.id)[0]}</span></span>
            <span className="dr-body">{ptToday(d.id)} patients today</span>{sTag(DUTY.on)}</Row>))}</div>}</section>
      {/* F13/R21/T07: who is waiting in each department, and closed departments flagged with why, cover and reopening */}
      {h ? null : sSec('Waiting by department', <div className="st-rows">{sepJoin(depts().map(([k, [, opd]]) => { const c = closure(k);
        return <button className="list-item st-dr" data-act={`st-dept:${k}`}><span className="dq-t"><span className="st-nm">{deptLabel(k)}</span>
          <span className="dr-body">{c ? `Closed today: ${c.why}. Cover: ${c.cover}. Reopens ${c.reopen}.` : opd}</span></span>
          <span className="dr-body">{waitingIn(k)} waiting</span>{sTag(c ? ['Closed today', 'warn edge'] : ['Running', 'success'])}</button>; }))}</div>)}
      {/* HR's numbers only: who is on leave, and why, stays in HR (Figma 685:31360). */}
      <section className="stack16"><h2 className="st-sec">Staff (HR)</h2>
        {sStats([[people().length, 'Total staff', 'Across all roles'], [people().filter(p => staffStatus(p) === 'On leave').length, 'On leave today', 'Operational count only']])}
        <p className="dr-body tertiary">Who's on leave and why stays in HR — {readOnly() ? 'trustees see' : 'Administrator sees'} counts only.</p></section></>);
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
      {sTable([['Doctor', 320], ['Department', 260], ['Patients today', 180, S.stSort ? (S.stSort === 'pt-asc' ? 'ascending' : 'descending') : 'none'], ['Status']], list,
        d => <>{nmCell(d, 320, 'st-doc')}{cell(`${d.dept} · ${docOf(d.id)[0]}`, 260)}{cell(ptToday(d.id), 180)}<span className="sp"></span>{sTag(DUTY[duty(d.id)])}</>, 'st-doc', 'Doctors')}
      </>, 'st-acts');
  },

  sdoc: () => {
    const d = person(S.stId), [opd, , , nmc, slot] = docOf(d.id), st = duty(d.id), extra = S.stDocs.find(x => x.id === d.id);
    // F06/R06/T24: a blank says "Not set", with an Add action — no made-up phone, email or working days. Seed doctors keep their hospital email.
    const v = x => x || <>{NOT_SET} · <a href="#" className="st-a" data-act={`st-editdoc:${d.id}`}>Add</a></>;
    return sPage(<>{sBack('Doctors', 'sdocs')}{sWho(d.ini, d.name, `${d.dept}${opd ? ` · ${opd}` : ''}`, sTag(DUTY[st]))}
      {sSec('Details', sKV([['NMC registration', v(nmc)], ['OPD', v(opd)], ['Phone', v(d.phone)], ['Email', v(extra ? d.email : d.email || seedEmail(d))], ['Working days', v(extra ? d.days : d.days || DOCTORS[d.id]?.days)]]))}
      {sSec('Today', sKV([['Patients today', ptToday(d.id)], ['Reports pending', repsOf(d.id)], ['Next available slot', st === 'on' ? slot : st === 'leave' ? 'On leave' : notIn(d.id)]]))}</>);
  },

  sdepts: () => sPage(<>{sHead('Departments', `${depts().length} departments · ${new Set([...roster().map(d => docOf(d.id)[0]), ...S.stDepts.map(d => d.opd)].filter(Boolean)).size} OPDs · City Hospital`, // R29/F26: both counted, not typed
      readOnly() ? null : <button className="btn primary l hug" data-act="st-newdept">{img('icon-add-white-24', 24)}Add department</button>)}{/* T23 */}<div className="st-grid">{depts().map(([k, [name, opd, ids]]) => {
    const on = ids.filter(i => duty(i) === 'on'), sur = dname /* R29: full names — there are two Dr. Shresthas */, run = on.length || isNewDept(k), c = closure(k);
    const off = ids.filter(i => duty(i) === 'leave'), offs = readOnly() ? off.length ? [`${off.length} on leave`] : [] : off.map(i => `${sur(i)} on leave`); // Run 6 Y18: a trustee sees a count, not names
    const who = on.length ? [on.map(sur).join(', '), ...offs].join(' · ') : ids.length ? `${ids.map(sur).join(', ')} — not in today` : null;
    return <a key={k} href="#" className="st-dept" data-act={`st-dept:${k}`}><span className="st-hd"><span className="st-nm">{PLAIN[k] ? deptLabel(k) : name}</span>{tag(run ? 'Running' : 'Closed today', `${run ? 'success' : 'neutral edge'} s12 sm`)}{/* 1.4.11: a 3:1 edge on the grey card */}</span>
      <span className="dr-body">{opd}</span>{who ? <span className="dr-body tertiary">{who}</span> : null}{c ? <span className="dr-body">Reopens {c.reopen} · Cover: {c.cover}</span> : null}
      <span className="st-nm">{deptPts(k)} patients today</span></a>; })}</div></>),

  sdept: () => {
    const [name, opd, ids] = deptOf(S.stId), on = ids.filter(i => duty(i) === 'on'), opds = new Set(ids.map(i => docOf(i)[0])), onOpds = new Set(on.map(i => docOf(i)[0]));
    const leave = ids.filter(i => duty(i) === 'leave').length;
    const c = closure(S.stId);
    return sPage(<>{sBack('Departments', 'sdepts')}{sHead(PLAIN[S.stId] ? deptLabel(S.stId) : name, `${opd} · ${ids.length} doctor${ids.length === 1 ? '' : 's'}`, sTag(on.length || isNewDept(S.stId) ? ['Running', 'success'] : ['Closed today', 'neutral']))}
      {c ? notice('warn', 'Closed today', `${c.why}. Cover: ${c.cover}. Reopens ${c.reopen}.`) : null /* R21/T27 */}
      {c && !readOnly() ? coverPick(S.stId) : null}{/* T23: a trustee sees the cover in the notice, not the control */}
      {sSec('Doctors', <div className="mt-list">{sepJoin(ids.filter(i => !readOnly() || duty(i) !== 'leave').map(i => { /* Run 6 Y18: names on leave stay in HR */ const st = duty(i); return <div className="st-kv"><span className="st-who"><span className="avatar" aria-hidden="true">{person(i).ini}</span><b>{dname(i)} · {docOf(i)[0]}</b></span>
        <span className="dr-body">{st === 'on' ? `${ptToday(i)} patients today` : st === 'leave' ? 'On leave' : notIn(i)}</span></div>; }))}</div>)}
      {/* F07: Patients seen counts completed rows, as Reception shows them. Phase 6: 'OPDs running' was lost inside this comment in Phase 0; restored. */}
      {sSec('Today', sKV([['Patients seen', arrivals().filter(k => ids.includes(arr(k).doc) && arrSt(k) === 'done').length], ['OPDs running', `${onOpds.size} of ${opds.size}`],
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
      {sTable([['Patient ID', 110], [sortBtn, 260, { 'name-asc': 'ascending', 'name-desc': 'descending' }[S.stSort] || 'none'], ['Doctor', 240], ['Department', 220], ['Visited date']], list,
        v => <>{cell(v.pid || '—', 110)}{nmCell(v, 260, 'st-pat')}{cell(v.doc, 240)}{cell(v.dept, 220)}<span className="sp"></span>{sTag([v.when, 'neutral'])}</>, 'st-pat', 'Patient visits')}
      </>);
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
      {/* R16/T18/W09: every role change — who, when, from → to, and who made it. W08: a reopened leave request too */}
      {sSec('Role and leave changes', S.stAudit.length ? <div className="mt-list">{sepJoin(S.stAudit.map(a => row('lt-lock.svg', `${a.who}: ${a.from} → ${a.to}`, `Changed by ${a.by} · Today, ${a.at}`)))}</div>
        : <p className="dr-body tertiary">No role changes yet. Changes made in Assign roles are listed here with who made them and when.</p>)}
      {g('Account', [['lt-bell.svg', 'Notifications', 'New reports and staff requests', 'st-go:sacct'], ['lt-lock.svg', 'Change password', 'Last changed 2 months ago', 'st-go:sacct']])}
      <div className="st-sp"></div><div><button className="btn secondary l hug" data-act="st-signout">Sign out</button></div></>);
  },

  sadd: () => {
    const ed = S.stEdit && person(S.stEdit);
    const head = <>{ed ? sBack(ed.name, 'sdoc') : S.stFrom === 'sdocs' ? sBack('Doctors', 'sdocs') : sBack('Settings', 'sset')}<div className="st-ttl"><h1 className="k-h2">{ed ? `${ed.name}'s details` : 'Add a doctor'}</h1>
      <p className="dr-sub">{ed ? 'Fill in what was left blank, or correct it' : 'Adds them to the roster and gives them their own sign-in'}. Fields marked * are required.</p></div></>;
    if (S.stAdded) return sPage(<>{head}<div className="st-done"><p className="st-ok">{img('icon-check-circle-success-20')}{S.stAdded} has been added</p>
      <p className="dr-body">They can sign in with the staff ID and password sent to their phone.</p></div>
      <div className="st-sp"></div><div className="st-cta"><button className="btn secondary l" data-act="st-go:sdocs">View in roster</button></div></>);
    const f = (k, l, ph, type = 'text') => <div className="field-wrap"><label className="label" htmlFor={`sa-${k}`}>{l}</label><div className={`field ${S.stAddErr[k] ? 'err' : ''}`}>
      <input id={`sa-${k}`} data-af={k} type={type} placeholder={ph} value={S.stAdd[k] || ''} onChange={e => { S.stAdd[k] = e.target.value; paint(); }} /></div>{S.stAddErr[k] ? support(S.stAddErr[k], 'err') : null}</div>;
    // T24: specialty and OPD are pick-lists from the hospital's own departments and OPDs (data.js), not free text.
    const pick = k => e => { S.stAdd[k] = e.target.value; paint(); };
    const opds = [...new Set([...Object.values(DOCTORS).map(x => x.opd), ...S.stDepts.map(x => x.opd)])].sort((a, b) => parseInt(a.replace(/\D/g, '')) - parseInt(b.replace(/\D/g, '')));
    return sPage(<>{head}<form id="st-addf" className="st-form" noValidate>
      {sSec('Personal details', <div className="fields st-f8">{f('name', 'Full name *', 'e.g. Dr. Kabita Shrestha')}{f('phone', 'Phone number (optional)', '+977 98XX-XXXXXX', 'tel')}{f('email', 'Email (optional)', 'e.g. name@cityhospital.np', 'email')}{f('nmc', 'NMC registration (optional)', 'e.g. 12345')}</div>)}
      {sSec('Assignment', <div className="fields st-f8">{sSelect('sa-spec', 'Specialty *', 'Choose a specialty', S.stAdd.spec, depts().map(([, [n]]) => n), S.stAddErr.spec, pick('spec'))}
        {sSelect('sa-opd', 'OPD', 'Choose an OPD', S.stAdd.opd, opds, '', pick('opd'))}{f('days', 'Working days', 'e.g. Sun–Thu, 9 AM–5 PM')}</div>)}
      </form><div className="st-sp"></div><div className="st-cta"><button className="btn primary l" data-act="st-add">{ed ? 'Save details' : 'Add doctor'}</button></div></>);
  },

  sroles: () => {
    const list = byQ(people(), p => p.name, p => accessText(p), p => p.dept);
    return sPage(<>{sBack('Settings', 'sset')}{sHead('Assign roles', 'What each person can access in Clinica', sSearch('Search staff'))}
      {S.stSel.length ? <div className="st-bulk"><span aria-live="polite">{S.stSel.length} selected</span><button className="btn primary st-m" data-act="st-bulk">Assign role to selected</button></div> : null}
      {sTable([['Name', 300], ['Access', 300], ['Job title · department', 300]], list, p => <>{nmCell(p, 300, 'st-role')}{cell(accessText(p), 300)}{cell(`${p.title} · ${p.dept}`, 300)}<span className="sp"></span></>, 'st-role', 'Staff access')}
      </>);
  },

  srole: () => {
    const who = S.stWho.map(person), one = who.length === 1 ? who[0] : null, pick = S.stPick;
    const sub = one ? (['Doctor', 'Front desk', 'HR manager', 'Administrator'].includes(one.title) ? one.dept : `${one.title}, ${one.dept}`) : `${who.length} people`;
    return sPage(<>{S.stFrom === 'sperson' ? sBack(person(S.stWho[0]).name, 'sperson') : sBack('Assign roles', 'sroles')}{sWho(one ? one.ini : who.length, one ? one.name : who.map(p => p.name).join(' and '), sub, null, 'dr-h1')}
      {/* F19/W04: the one-role rule, stated; leave approvals are an add-on instead of a switch */}
      <section className="stack16"><h2 className="st-sec">Access role</h2><p className="dr-body">One access role each — switching replaces what they can do now. To let someone approve leave without switching, tick “Also approves leave”.</p>
        <div className="mt-list" role="radiogroup" aria-label="Access role">{sepJoin(Object.entries(ROLES).filter(([k]) => k !== 'trustee').map(([k, [l, d]]) =>
        <button className="st-role" role="radio" aria-checked={pick === k} data-act={`st-pick:${k}`}><span className="dq-t"><span className="st-nm">{l}</span><span className="dr-body">{d}</span></span><span className="ring"></span></button>))}</div>
        {pick === 'hr' ? null : <div className="stack8"><label className="st-acc" style={{ cursor: 'pointer' }}>{cbBtn(S.stLv.on, 'st-lvok', 'Also approves leave')}<span className="dq-t"><span className="st-nm">Also approves leave</span>
          <span className="dr-body">Leave requests only — not the staff directory or contact details</span></span></label>
          {S.stLv.on ? <div className="field-wrap" style={{ maxWidth: 320 }}><label className="label" htmlFor="sr-until">Until (optional)</label><div className="field"><input id="sr-until" type="date" min="2026-08-28" value={S.stLv.until}
            onChange={e => { S.stLv.until = e.target.value; paint(); }} /></div></div> : null}</div>}
        <div>{btn('Save role', 'st-saverole', { size: 'l', kind: 'primary hug' })}</div></section>
      {sSec(`What ${ROLES[pick][0]} can access`, <div className="mt-list">{ROLES[pick][2].map(t => <p key={t} className="st-acc">{img(/^Not included/.test(t) ? 'icon-cancel-secondary-20' : 'icon-check-circle-success-16', 16)}{t}</p>)}
        {pick !== 'hr' && S.stLv.on ? <p className="st-acc">{img('icon-check-circle-success-16', 16)}Approving and denying leave requests</p> : null}</div>)}</>);
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
    const me = stMe(), all = arrivals().filter(k => me.access !== 'nurse' || person(arr(k).doc)?.dept === me.dept), status = x => ARR_TAG[arrSt(x.k)][0]; // F08: a nurse sees their department
    // F11/R09/T19/V08: search by name, phone (any digits, e.g. the last four), CH- ID, doctor or department
    const list = filtered(byQ(all.map(k => ({ k, name: arr(k).name })), x => x.name, x => arr(x.k).phone.replace(/\D/g, ''), x => pid(x.k), x => dname(arr(x.k).doc), x => person(arr(x.k).doc)?.dept || ''), { status });
    const sub = S.stQ ? `${list.length} result${list.length === 1 ? '' : 's'} for “${S.stQ}”` : (S.stF.status || []).length ? results(list.length, all.length, 'status')
      : all.length ? `Aug 28, 2026 · ${all.length} patients across the hospital` : 'Aug 28, 2026 · Nothing booked yet';
    const st = chip('status', fLabel('status', 'Status'), (S.stF.status || []).length,
      () => checks('status', Object.values(ARR_TAG).map(([l]) => [l, all.filter(k => ARR_TAG[arrSt(k)][0] === l).length]), 240, true));
    return sPage(<>{sHead("Today's arrivals", sub, <>{sSearch('Search name, phone, CH- ID or doctor')}{st}<button className="btn primary l hug" data-act="st-go:swalk">{img('icon-add-white-24', 24)}Register a walk-in</button></>)}
      {all.length ? <div className="st-rows">{sepJoin(list.map(x => arrRow(x.k)))}</div>
        : sEmpty('icon-event-available-tertiary-32', 'No arrivals today', 'Booked patients and walk-ins will show up here.')}</>, 'st-arr');
  },

  scheck: () => {
    const k = S.stId, a = arr(k), st = arrSt(k);
    const right = S.ckAt[k] ? sOk(`Checked in at ${S.ckAt[k]}`) : st === 'notarrived' ? btn('Check in', 'st-checkin', { size: 'l', kind: 'primary hug' }) : sTag(ARR_TAG[st]);
    const dk = S.wkDesk[k]; // T09/V10: what the desk typed stays beside the booking's reason
    return sPage(<>{sBack("Today's arrivals", 'sarr')}{sWho(a.ini, a.name, a.info, right)}
      {dk ? notice('info', `Matched to ${pid(k)}`, `${a.name} already has a booking at ${a.time} — check in on it rather than adding a second visit. What you typed is kept below.`) : null}
      {sSec('Visit details', sKV([[a.walkin ? 'Walk-in for' : 'Booked with', `${dname(a.doc)} · ${docOf(a.doc)[0]}`], [a.walkin ? 'Arrived' : 'Appointment time', a.time], ['Reason for visit', a.reason],
        ...(dk?.reason ? [['Told the desk today', dk.reason]] : []), ...(a.note || dk?.note ? [['Note for doctor', a.note || dk.note]] : []), ['Phone', a.phone]]))}
      {a.hist.length ? sSec('Recent visits', sHist(a.hist)) : null}</>);
  },

  swalk: () => {
    const w = S.wk, e = S.wkErr, m = wkDoc();
    const f = (k, l, ph, type = 'text', list = '') => <div className="field-wrap"><label className="label" htmlFor={`wk-${k}`}>{l}</label><div className={`field ${e[k] ? 'err' : ''}`}>
      <input id={`wk-${k}`} data-wf={k} type={type} placeholder={ph} value={w[k] || ''} list={list || undefined} onChange={ev => { S.wk[k] = ev.target.value; if (k === 'doc') S.wk.docId = null; paint(); }} /></div>{e[k] ? support(e[k], 'err') : null}</div>;
    // W12/R15: a department (or a symptom) lists that department's doctors on duty to choose from — nothing is picked for you.
    const on = m.dept ? deptOf(m.dept)[2].filter(i => duty(i) === 'on') : [], c = m.dept && closure(m.dept);
    const choose = m.dept && !m.named ? <div className="stack8">{m.word ? <p className="dr-body">“{m.word}” usually goes to {deptLabel(m.dept)}.</p> : null}
      {on.length ? drRadio(`${deptName(m.dept)} doctors on duty — choose one`, on.map(i => [i, `${dname(i)} · ${docOf(i)[0]} · ${arrivals().filter(x => arr(x).doc === i && arrSt(x) === 'waiting').length} waiting`]), w.docId, 'st-wdoc')
        : <><p className="dr-body">No {deptName(m.dept)} doctor is in today.{c ? ` Cover: ${c.cover}. Reopens ${c.reopen}.` : ''}</p>
          {c && coverOf(m.dept) ? <div>{btn(`Send to ${dname(coverOf(m.dept))} instead`, `st-wcover:${coverOf(m.dept)}`, { size: 'l', kind: 'secondary hug' })}</div> : null}</>}</div> : null; // Run 6 Y14
    // Run 6 Y14: what the typed text matched, as it's typed
    const t = (w.doc || '').trim(), hint = !t ? null : m.named ? support(`${dname(m.doc)} · ${person(m.doc).dept} · ${duty(m.doc) === 'on' ? 'on duty' : 'not in today'}`, duty(m.doc) === 'on' ? '' : 'err', duty(m.doc) === 'on' ? 'icon-check-circle-success-20.svg' : '')
      : m.dept ? null : t.length > 2 ? support(`Nothing matches “${t}”. Try a doctor's name, a department or a symptom.`, 'err') : null;
    // F26: Enter in any field adds to the queue
    return sPage(<><div className="st-ttl"><h1 className="k-h2">Register a walk-in</h1><p className="dr-sub">For a patient arriving without a booking. Fields marked * are required.</p></div>
      {S.wkKept ? draftCue('Draft kept — the details entered earlier are still here.') : null}
      <form id="st-walkf" className="st-form" noValidate onKeyDown={ev => { if (ev.key === 'Enter' && ev.target.tagName === 'INPUT') { ev.preventDefault(); ACTIONS['st-walk'](); } }}>
      {/* F12/R14/T20: age and sex, so they don't end up typed into the reason */}
      {sSec('Patient details', <div className="fields st-f8">{f('name', 'Full name *', 'e.g. Dipesh Rai')}{f('phone', 'Phone number (optional)', '+977 98XX-XXXXXX', 'tel')}
        <div className="st-2">{f('age', 'Age *', 'e.g. 45', 'number')}<div className="stack4">{drRadio('Sex *', [['Female', 'Female'], ['Male', 'Male'], ['Other', 'Other']], w.sex, 'st-wsex')}{e.sex ? support(e.sex, 'err') : null}</div></div>
        <div className="st-2">{f('h', 'Height (optional)', 'e.g. 165 cm')}{f('w', 'Weight (optional)', 'e.g. 60 kg')}</div></div>)}
      <section className="stack16"><h2 className="st-sec">Visit details</h2><div className="fields st-f8">{drRadio('Visit type', [['new', 'New patient'], ['follow', 'Follow-up visit']], w.type, 'st-wtype')}
        {f('doc', 'See which doctor? *', 'A doctor, department or symptom — e.g. fever', 'text', 'st-docs')}{e.doc ? null : hint}{choose}
        {f('reason', 'Reason for visit', 'e.g. Fever, follow-up')}{f('note', 'Note for doctor (optional)', 'e.g. Headaches this week; came in a wheelchair')}
        <datalist id="st-docs">{roster().filter(d => duty(d.id) === 'on').map(d => <option key={d.id} value={`${d.name} · ${d.dept}`} />)}</datalist></div>
        <div id="wk-hist">{wkHist()}</div></section></form>
      {w.type === 'follow' ? null : <div className="st-sp"></div>}<div className="st-cta"><button className="btn primary l" data-act="st-walk">Add to queue</button></div></>);
  },

  smatch: () => {
    const first = S.wk.name.trim().split(/\s+/)[0], c = S.stWho;
    return sPage(<div className="st-col"><div className="st-ttl"><h1 className="k-h2">Is this {first[0].toUpperCase() + first.slice(1)}?</h1>
      <p className="dr-sub">{c.length === 1 ? 'One patient matches' : `${['', '', 'Two', 'Three', 'Four'][c.length] || c.length} patients match`} that name — pick the right one, or continue as new.</p></div>
      <div className="st-rows">{sepJoin(c.map(k => { const a = arr(k), p = PATS.find(x => x[0] === k);
        return <div className="st-match"><span className="avatar l" aria-hidden="true">{a.ini}</span><span className="dq-t"><span className="st-nm">{a.name}</span><span className="dr-body">{a.info}</span>
          <span className="dr-body tertiary">Last visit {p ? p[3] : 'Aug 28, 2026'} · phone ending {end4(a) || 'not on record'}</span></span>
          <button className="btn secondary st-m" data-act={`st-them:${k}`}>This is them</button></div>; }))}</div>
      {btn('None of these — register as new patient', 'st-asnew', { size: 'l' })}</div>, 'narrow');
  },

  // ----- HR -----
  sstaff: () => {
    const all = people(), status = staffStatus;
    const list = filtered(byQ(all, p => p.name, p => p.title, p => p.dept), { role: p => p.title, dept: p => p.dept, status });
    const fil = S.stQ || ['role', 'dept', 'status'].some(k => (S.stF[k] || []).length);
    const by = ['role', 'dept', 'status'].filter(k => (S.stF[k] || []).length).map(k => ({ role: 'role', dept: 'department', status: 'status' })[k]).join(' and ');
    const pend = all.filter(p => status(p) === 'Pending').length;
    return sPage(<>{sHead('Staff', fil ? results(list.length, all.length, by) : `${all.length} people · ${all.filter(p => status(p) === 'On leave').length} on leave${pend ? ` · ${pend} starting soon` : ''}`,
      <>{sSearch('Search staff')}{btn('Export for payroll', 'st-payroll', { size: 'l', kind: 'secondary hug' })}{/* T13 */}<button className="btn primary l hug" data-act="st-addst">{img('icon-add-white-24', 24)}Add staff</button></>)}
      {S.stDone ? sOk(S.stDone) : null}
      <div className="st-chips">{chip('role', fLabel('role', 'Job title'), (S.stF.role || []).length, () => checks('role', counts(all, p => p.title)))}
        {chip('dept', fLabel('dept', 'Department'), (S.stF.dept || []).length, () => checks('dept', counts(all, p => p.dept)))}
        {chip('status', fLabel('status', 'Status'), (S.stF.status || []).length, () => checks('status', ['Active', 'On leave', 'Pending'].map(x => [x, all.filter(p => status(p) === x).length]).filter(([x, n]) => n || x !== 'Pending')))}</div>
      {/* W09: this column is the job title; the access role is on the record and in Assign roles */}
      {sTable([[<>Name{img('icon-chevron-down-tertiary-14', 14)}</>, 300], ['Job title', 220], ['Department', 220], ['Status']], list,
        p => <>{nmCell(p, 300, 'st-person')}{cell(p.title, 220)}{cell(p.dept, 220)}<span className="sp"></span>{sTag(STATUS_TAG[status(p)])}</>, 'st-person', 'Staff')}
      </>, 'st-acts');
  },

  sperson: () => {
    const p = person(S.stId), ls = Object.keys(LEAVES).filter(k => LEAVES[k].who === p.id), st = staffStatus(p), admin = stMe().access === 'admin';
    const v = x => x || NOT_SET; // F06/R06: no placeholder phone
    // F18/R19/T13: start date, grade and council number, Pending until day one, and an Edit action. W09/F19: the access role is shown, with a route to it.
    return sPage(<>{sBack('Staff', 'sstaff')}{sWho(p.ini, p.name, `${p.title} · ${p.dept}`, <div className="st-chips">{sTag(STATUS_TAG[st])}<button className="btn secondary st-m" data-act={`st-edit:${p.id}`}>Edit</button></div>)}
      {sSec('Employment', sKV([['Employee ID', p.emp], ['Department', p.dept], [p.start ? (st === 'Pending' ? 'Starts' : 'Started') : 'Joined', p.start ? dayLabel(p.start) + ', 2026' : p.joined],
        ...(p.start || !isSeed(p) ? [['Grade', v(p.grade)], ['Council number', v(p.council)]] : []), ...(p.addedBy ? [['Added by', `${p.addedBy}, today`]] : []),
        ['Access', admin ? <>{accessText(p)} · <a href="#" className="st-a" data-act={`st-role:${p.id}`}>Change</a></> : accessText(p)],
        ...ls.map(k => [LEAVES[k].type, `${leaveSpan(LEAVES[k])} · ${LEAVE_TAG[S.leave[k]][0]}`])]))}
      {sSec('Contact', sKV([['Phone', v(p.phone)], ['Email', p.email || (isSeed(p) ? seedEmail(p) : NOT_SET)]]))}</>);
  },

  // Add staff — one form for HR and the administrator, any role (Figma 631:273). Doctors also join the roster.
  // F18/R19/T13: start date, grade and council number; required fields marked *, optional ones say so. The same form edits a record (S.stEdit).
  saddst: () => {
    const ed = S.stEdit && person(S.stEdit);
    const f = (k, l, ph, type = 'text', req = false) => <div className="field-wrap"><label className="label" htmlFor={`as-${k}`}>{l}</label><div className={`field ${S.stNewErr[k] ? 'err' : ''}`}>
      <input id={`as-${k}`} type={type} placeholder={ph} aria-required={req || undefined} value={S.stNew[k] || ''} onChange={e => { S.stNew[k] = e.target.value; paint(); }} /></div>{S.stNewErr[k] ? support(S.stNewErr[k], 'err') : null}</div>;
    const pick = k => e => { S.stNew[k] = e.target.value; paint(); };
    return sPage(<>{sBack(ed ? ed.name : 'Staff', ed ? 'sperson' : 'sstaff')}<div className="st-ttl"><h1 className="k-h2">{ed ? `Edit ${ed.name}` : 'Add staff'}</h1>
      <p className="dr-sub">{ed ? 'Changes show on their record straight away.' : 'Adds them to the roster and gives them their own sign-in. Works for any role — doctor, nurse, reception, lab.'} Fields marked * are required.</p></div>
      <form id="st-addsf" className="st-form" noValidate>
        {sSec('Personal details', <div className="fields st-f8">{f('name', 'Full name *', 'e.g. Kabita Shrestha', 'text', true)}{f('phone', 'Phone number *', '+977 98XX-XXXXXX', 'tel', true)}{f('email', 'Email (optional)', 'e.g. name@cityhospital.np', 'email')}
          {ed ? null : sSelect('as-role', 'Job title *', 'Choose a job title', S.stNew.role, Object.keys(ACCESS_OF), S.stNewErr.role, pick('role'))}</div>)}
        {sSec('Assignment', <div className="fields st-f8">{sSelect('as-dept', 'Department *', 'Choose a department', S.stNew.dept, [...new Set([...depts().map(([, [n]]) => n), ...people().map(p => p.dept)])], S.stNewErr.dept, pick('dept'))}
          {f('start', 'Start date *', '', 'date', true)}{support('They show as Pending until this day, and join Attendance from it.')}
          <div className="st-2">{f('grade', 'Grade (optional)', 'e.g. Level 5')}{f('council', 'Council number (optional)', 'e.g. NMC 12345 or NNC 6789')}</div></div>)}
      </form><div className="st-sp"></div>
      <div className="st-cta st-note"><p className="dr-body tertiary">{ed ? '' : `Will show as “Added by ${stMe().name}, today” on the staff record`}</p><button className="btn primary l" data-act="st-addstaff">{ed ? 'Save changes' : 'Add staff'}</button></div></>);
  },

  // Add a department — name, OPDs and its doctors (Figma 631:1305). Assigning a doctor moves them here.
  sadddept: () => {
    const head = <>{sBack('Departments', 'sdepts')}<div className="st-ttl"><h1 className="k-h2">Add a department</h1><p className="dr-sub">Creates a new department and assigns the doctors who work in it.</p></div></>;
    if (S.stDeptAdded) return sPage(<>{head}<div className="st-done"><p className="st-ok">{img('icon-check-circle-success-20')}{S.stDeptAdded} has been added</p></div>
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
            <button key={r.id} type="button" className="st-opt" role="option" aria-selected="false" data-act={`st-dpick:${r.id}`}><span className="l"><span className="avatar" aria-hidden="true">{r.ini}</span>{r.name}</span><span className="n">{r.dept}</span></button>)}</div> : null}</div>
        {d.docs.length ? <div className="st-picks">{d.docs.map(id => <button key={id} type="button" className="st-pick" data-act={`st-dunpick:${id}`} aria-label={`Remove ${dname(id)}`}>{dname(id)}{img('icon-close', 16)}</button>)}</div> : null}</div>)}
      </form><div className="st-sp"></div><div className="st-cta"><button className="btn primary l" data-act="st-adddept">Add department</button></div></>);
  },

  // HR's own landing page: today's headcount and the latest leave requests (Figma 630:417).
  shdash: () => {
    const all = people(), leave = all.filter(p => staffStatus(p) === 'On leave'), off = all.filter(p => staffStatus(p) !== 'On leave' && roster().some(d => d.id === p.id) && duty(p.id) === 'off');
    return sPage(<>{sHead('Dashboard', 'Today · Aug 28, 2026')}
      {sStats([[all.length, 'Total staff', 'Across all departments'], [all.length - leave.length - off.length, 'Available today', `${all.length} total, ${leave.length} on leave, ${off.length} off duty`],
        [leave.length, 'On leave today', leave.map(p => p.name).join(', ')]])}
      {/* V13: each row says where the request stands */}
      {sSec('Recent leave requests', <div className="st-rows">{sepJoin(Object.keys(LEAVES).sort((a, b) => Date.parse(LEAVES[b].asked) - Date.parse(LEAVES[a].asked)).slice(0, 3).map(k => <button className="list-item k-row" data-act={`st-req:${k}`}>
        <span className="dq-t"><span className="st-nm">{person(LEAVES[k].who).name}</span><span className="dr-body">{LEAVES[k].type} · {leaveSpan(LEAVES[k]).replace(', 2026', '')}</span></span>{sTag(LEAVE_TAG[S.leave[k]])}</button>))}</div>)}</>);
  },

  sleave: () => {
    const ids = Object.keys(LEAVES), pending = ids.filter(k => S.leave[k] === 'pending'), done = ids.filter(k => S.leave[k] === 'approved').length;
    const rowsOf = list => <div className="st-rows">{sepJoin(list.map(k => { const l = LEAVES[k], p = person(l.who);
      return <button className="list-item k-row" data-act={`st-req:${k}`}><span className="avatar" aria-hidden="true">{p.ini}</span><span className="dq-t"><span className="h-s">{p.name}</span><span className="dq-r">{p.title} · {p.dept} · {l.type}</span>
        <span className="dq-m"><span className="now">{leaveSpan(l)}</span>{sTag(LEAVE_TAG[S.leave[k]])}</span></span></button>; }))}</div>; // W19: role · department on each row
    const st = k => LEAVE_TAG[S.leave[k]][0], shown = filtered(ids.map(k => ({ k })), { status: x => st(x.k) }).map(x => x.k);
    const chips = <div className="st-chips">{chip('status', fLabel('status', 'Status'), (S.stF.status || []).length,
      () => checks('status', ['Pending', 'Approved', 'Denied'].map(l => [l, ids.filter(k => st(k) === l).length]), 240, true))}</div>;
    const fil = (S.stF.status || []).length ? results(shown.length, ids.length, 'status') : null;
    if (!pending.length) return sPage(<>{sHead('Leave requests', fil || 'Nothing waiting on you right now')}{chips}
      {sEmpty('icon-schedule-tertiary-32', 'No pending requests', 'Approved and denied requests still show in the history.')}{sSec('History', rowsOf(shown))}</>, 'st-leave0');
    return sPage(<>{sHead('Leave requests', fil || `${pending.length} pending · ${done} already approved`)}{chips}{rowsOf(shown)}</>);
  },

  // F16/R18/T16/V11/W08: the reason, a prominent coverage warning worked out from the staff list, who may decide,
  // Approve and Deny each confirmed in a sheet (then Undo), an optional denial reason shown as sent, and who decided and when.
  sreq: () => {
    const k = S.stId, l = LEAVES[k], p = person(l.who), st = S.leave[k], first = lvFirst(k), cov = coverage(k), by = S.lvBy[k];
    return sPage(<>{sBack('Leave requests', 'sleave')}{sWho(p.ini, p.name, `${p.title} · ${p.dept}`, sTag(LEAVE_TAG[st]))}
      {sSec('Request details', sKV([['Type', l.type], ['Dates', leaveSpan(l)], ['Duration', leaveDays(l)], ['Requested on', l.asked], ['Reason given', l.why]]))}
      {cov && (st === 'pending' || (st === 'approved' && cov[2])) ? notice('warn', st === 'approved' ? `Approved without cover: ${cov[0]}` : cov[0], cov[1], cov[2] ? <p className="dr-body">{cov[2]}</p> : null) : null}{/* Run 6 Y24: kept on the approved record */}
      {sSec('Decision', st === 'pending' ? <div className="st-act"><p className="dr-body">HR managers, and staff who also approve leave, can decide. You can undo for a few seconds after.</p>
        <div className="st-chips">{btn('Approve', 'st-leave:approved', { size: 'l', kind: 'primary hug' })}{btn('Deny', 'st-leave:denied', { size: 'l', kind: 'destructive hug' })}</div></div>
        : <div className="stack8">{sOk(`${st === 'approved' ? 'Approved' : 'Denied'} by ${by?.[0] || 'HR'}${by ? `, ${by[1]}` : ''} — ${first} has been notified`, st === 'denied')}
          {st === 'denied' ? <p className="dr-body">Sent to {first}: {S.lvWhy[k] ? `“${S.lvWhy[k]}”` : 'no reason was given.'}</p> : null}
          {/* W08: Reopen, once the Undo window has gone */}
          {S.toast?.action?.[1] === `st-lvundo:${k}` ? null : <div>{btn('Reopen', 'st-lvreopen', { size: 'l', kind: 'secondary hug' })}</div>}</div>)}
      {S.lvHist[k]?.length ? sSec('History', <div className="mt-list">{mtJoin(S.lvHist[k].map(([t, b]) => <div className="stack4"><p className="item-title">{t}</p>{b ? <p className="dr-body">{b}</p> : null}</div>))}</div>) : null}{/* Run 6 Y07 */}</>);
  },

  // V13: one Sort control; the period stays in the subtitle while searching. T17: says these are working days.
  satt: () => {
    const all = people().filter(p => monthAtt(p.id).total); // F18/T13: new staff join from their start date
    let list = byQ(all, p => p.name);
    const [k, dir] = S.stSort.split('-');
    if (k) list = [...list].sort((a, b) => (monthAtt(b.id)[k] - monthAtt(a.id)[k]) * (dir === 'asc' ? -1 : 1));
    const SORTS = [['present-desc', 'Most days present'], ['present-asc', 'Fewest days present'], ['absent-desc', 'Most days absent'], ['absent-asc', 'Fewest days absent']];
    const period = `August 2026 · ${spanDays(new Date(2026, 7, 1), TODAY, isWork)} working days so far (Sun–Fri)`; // Phase 6
    return sPage(<>{sHead('Attendance', S.stQ ? `${period} · ${results(list.length, all.length, '')}` : period, sSearch('Search staff'))}
      <div className="st-chips">{chip('sort', S.stSort ? `Sort: ${SORTS.find(x => x[0] === S.stSort)[1]}` : 'Sort', !!S.stSort, () => radios(SORTS, 260))}</div>
      {sTable([['Name', 280], ['Working days', 140], ['Present', 140, k === 'present' ? `${dir}ending` : 'none'], ['On leave', 140], ['Absent', 140, k === 'absent' ? `${dir}ending` : 'none']], list, p => { const a = monthAtt(p.id);
        return <>{nmCell(p, 280, 'st-att')}{cell(a.total, 140)}{cell(a.present, 140, 'st-b')}{cell(a.leave, 140)}{cell(a.absent, 140, a.absent ? 'st-err' : '')}</>; }, 'st-att', 'Attendance')}
      <p className="dr-body tertiary">Working days only. On leave = days covered by an approved request; Absent = days missed with no request.</p>
      </>);
  },

  // F17/R17/T17/V12: one label per figure ("Absent"), counted for the month shown only; each leave day links to its request.
  satt1: () => {
    const p = person(S.stId), m = S.stCalM, y = 2026 + Math.floor(m / 12), mo = ((m % 12) + 12) % 12, a = monthAtt(p.id, y, mo), mon = `${CAL_LONG[mo]} ${y}`;
    const [jm, jy] = p.joined.split(' '), years = Math.floor((2026 * 12 + 7 - (+jy * 12 + MONTHS.indexOf(jm))) / 12); // whole years to Aug 2026
    const tone = { Present: 'success', Weekend: 'neutral', Absent: 'error' };
    const reqs = Object.keys(LEAVES).filter(k => LEAVES[k].who === p.id && S.leave[k] === 'approved');
    return sPage(<>{sBack('Attendance', 'satt')}{sWho(p.ini, p.name, `${p.dept} · ${mon}`)}
      {sStats([[years, 'Years since joined', `Joined ${p.joined}`], [a.present, 'Present days', `${mon}, working days`], [a.absent, 'Absent', `Missed with no leave request, ${a.absent} of ${a.total} working days`]])}
      {sSec('Attendance calendar', attCal(p.id))}
      {sSec('Recent days', <div className="mt-list">{mtJoin(recentDays(p.id).map(([d, s, lk]) => <div className="st-kv"><span>{d}</span>
        {lk ? <a href="#" className="st-a" data-act={`st-req:${lk}`}>{s} · see request</a> : sTag([s, tone[s]])}</div>))}</div>)}
      <section className="stack16"><h2 className="st-sec">{mon}</h2>{sKV([['Working days so far', a.total], ['Present', a.present], ['On leave', a.leave], ['Absent', a.absent]])}
        {reqs.length ? <div className="mt-list">{mtJoin(reqs.map(k => <div className="st-kv"><span>{LEAVES[k].type} · {leaveDays(LEAVES[k])}</span><a href="#" className="st-a" data-act={`st-req:${k}`}>{leaveSpan(LEAVES[k])}</a></div>))}</div> : null}
        <p className="dr-body">Counts are working days in {mon} only. A request counts calendar days, so leave running into the next month shows there.</p></section></>);
  },
});
export const LEAVE_TAG = { pending: ['Pending', 'warn'], approved: ['Approved', 'success'], denied: ['Denied', 'neutral'] };

export const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
export const CAL_LONG = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
export const CAL_LABEL = { present: 'Present', leave: 'On leave', absent: 'Absent', weekend: 'Weekend' }; // R17: "Absent", the table's word, everywhere
// Who covers a request: the others with the same job in the same department, less anyone on approved leave over the same days (F16/V11).
export const lvFirst = k => person(LEAVES[k].who).name.replace(/^Dr\.\s*/, '').split(' ')[0];
export function coverage(k) {
  const l = LEAVES[k], p = person(l.who), job = p.title.toLowerCase(), when = leaveSpan(l).replace(', 2026', '');
  const same = people().filter(x => x.id !== p.id && x.title === p.title && x.dept === p.dept && staffStatus(x) !== 'Pending');
  const left = same.filter(x => !Object.keys(LEAVES).some(j => LEAVES[j].who === x.id && S.leave[j] === 'approved' && LEAVES[j].from <= l.to && LEAVES[j].to >= l.from));
  return left.length ? [`${p.dept} keeps ${left.length} ${job}${left.length === 1 ? '' : 's'} on ${when}`, `${left.map(x => x.name).join(', ')} ${left.length === 1 ? 'is' : 'are'} not on leave then.`]
    : [`${p.dept} will have no ${job} on ${when}`, `${p.name} is the only ${job} in ${p.dept} on the staff list. Arrange cover before approving.`,
      (free => free.length ? `${p.title}s in other departments who aren't on leave then: ${free.map(x => `${x.name} (${x.dept})`).join(', ')}.` : `No other ${job} is free then.`)( // Run 6 Y24
        people().filter(x => x.id !== p.id && x.title === p.title && x.dept !== p.dept && staffStatus(x) !== 'Pending' && !Object.keys(LEAVES).some(j => LEAVES[j].who === x.id && S.leave[j] === 'approved' && LEAVES[j].from <= l.to && LEAVES[j].to >= l.from)))];
}
export function attCal(id) {
  const m = S.stCalM, y = 2026 + Math.floor(m / 12), mo = ((m % 12) + 12) % 12, first = new Date(y, mo, 1).getDay(), n = new Date(y, mo + 1, 0).getDate();
  const kindOf = d => dayKind(id, new Date(y, mo, d)); // the future is blank
  const cells = [...Array(first).fill(0), ...Array.from({ length: n }, (_, i) => i + 1)];
  const pop = d => { const k = kindOf(d), lk = k === 'leave' && leaveOn(id, new Date(y, mo, d)); // F17/R17: a leave day links to its request
    return <span className="att-pop" role="status">{new Date(y, mo, d).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} · {lk
      ? <a href="#" className="st-a" data-act={`st-req:${lk}`}>{LEAVES[lk].type}, requested {LEAVES[lk].asked.replace(', 2026', '')}</a> : CAL_LABEL[k]}</span>; };
  return <div className="att-cal"><div className="att-hd"><button className="att-nav" data-act="st-calm:-1" aria-label="Previous month">{img('icon-chevron-left-action-16', 16)}</button>
      <p className="st-nm">{CAL_LONG[mo]} {y}</p><button className="att-nav" data-act="st-calm:1" aria-label="Next month">{img('icon-chevron-right-action-16', 16)}</button></div>
    {/* Run 6 Y20: one tab stop; arrow keys move a day (left/right) or a week (up/down); Home/End jump to the ends */}
    <div className="att-grid" role="group" aria-label={`${CAL_LONG[mo]} ${y} attendance`} onKeyDown={e => {
      const all = [...e.currentTarget.querySelectorAll('button.att-c')], i = all.indexOf(e.target), step = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 }[e.key];
      if (i < 0 || !(step || e.key === 'Home' || e.key === 'End')) return;
      e.preventDefault(); const days = all.map(b => +b.dataset.act.split(':')[1]), want = e.key === 'Home' ? days[0] : e.key === 'End' ? days.at(-1) : days[i] + step;
      const j = days.indexOf(Math.min(Math.max(want, days[0]), days.at(-1))); all.forEach((b, x) => { b.tabIndex = x === j ? 0 : -1; }); all[j]?.focus(); }}>
      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d, i) => <span key={`h${i}`} className="att-wd" aria-hidden="true">{d[0]}</span>)}
      {(() => { const live = cells.filter(d => d && kindOf(d)), tab = live.includes(S.stCalDay) ? S.stCalDay : live.at(-1); // the chosen day, else the latest
        return cells.map((d, i) => { if (!d) return <span key={i}></span>; const k = kindOf(d);
        return k ? <span key={i} className="att-d"><button className={`att-c ${k}`} data-act={`st-calday:${d}`} tabIndex={d === tab ? 0 : -1} aria-pressed={S.stCalDay === d}
            aria-label={`${new Date(y, mo, d).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}: ${CAL_LABEL[k]}`}>{d}</button>{S.stCalDay === d ? pop(d) : null}</span>
          : <span key={i} className="att-c">{d}</span>; }); })()}</div>
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
  return m ? sSec(`Matched to ${pid(m.k)} · ${m.name}`, sHist(histOf(m.k, m.visits, m.last).filter(([d]) => d !== 'Aug 28, 2026').slice(0, 2))) : null; // V10: says what was matched
}
// W12/R15: who the walk-in is for. A named doctor counts; a department or symptom only narrows the choice to its doctors on duty.
export function wkDoc() {
  const w = S.wk, t = (w.doc || '').trim().toLowerCase(), r = (w.reason || '').toLowerCase();
  const byDept = t && depts().find(([k, [n]]) => n.toLowerCase().startsWith(t) || t === PLAIN[k]); // "general medicine", "gen…"
  const named = !byDept && t && roster().find(d => t.startsWith(d.name.toLowerCase()) || (t.length > 2 && d.name.toLowerCase().includes(t)));
  const sym = x => { for (const k of Object.keys(SYMPTOMS)) { const hit = SYMPTOMS[k].find(s => x.includes(s)) || (x === PLAIN[k] && x); if (hit) return [k, hit]; } return null; };
  const bySym = !byDept && !named ? sym(t || r) : null;
  const dept = byDept?.[0] || bySym?.[0] || null;
  return { doc: named ? named.id : (dept && w.docId && deptOf(dept)[2].includes(w.docId) ? w.docId : null), dept, named: !!named, word: bySym && bySym[1] };
}

// ---------- behaviour ----------
export function sGo(sc, from = null) {
  const was = secOf(S.screen);
  S.stFrom = from;
  if (secOf(sc) !== was) Object.assign(S, { stQ: '', stF: {}, stSort: '', stRange: [] }); // each list starts unfiltered
  Object.assign(S, { stack: [], screen: sc, stMenu: null, stSel: [], sheet: null, stCalDay: null, stHi: null, stDone: sc === 'sroles' ? S.stDone : '' });
  render();
}
// Signing out asks first, for every role (Figma 635:1739, 629:6940).
OVERLAY.stsignout = () => signoutSheet(signoutBody[stMe().access], 'st-signout-ok');
const goBack = () => btn('Go back', 'sheet-close', { kind: 'secondary' });
Object.assign(OVERLAY, {
  // F11/T19: Check in names who is being checked in, so the wrong Sunita can't be.
  stcheck: () => { const a = arr(S.stId);
    return csheet(`Check in ${a.name}?`, `${a.info.split(' · ').slice(0, 2).join(', ')} · ${pid(S.stId)} · phone ending ${end4(a) || 'not on record'} · ${a.walkin ? 'walk-in for' : 'booked with'} ${dname(a.doc)} at ${a.time}.`,
      btn(`Check in ${a.name.split(' ')[0]}`, 'st-checkin-ok'), goBack()); },
  // F16/V11/W08: Approve and Deny each ask first; Deny takes an optional reason, sent to the employee as written.
  stleave: () => { const k = S.stId, l = LEAVES[k], p = person(l.who), first = lvFirst(k), deny = S.lvAsk === 'denied', cov = coverage(k);
    return <><div className="scrim" data-act="sheet-close"></div>
      <div className="csheet" role="dialog" aria-modal="true" aria-labelledby="sl-t"><span className="handle"></span>
        <div className="cs-text"><h2 className="cs-t" id="sl-t">{deny ? `Deny ${first}'s ${l.type.toLowerCase()}?` : `Approve ${first}'s ${l.type.toLowerCase()}?`}</h2>
          <p className="lede">{p.name} · {leaveSpan(l)} · {leaveDays(l)}. {first} is told straight away{deny ? ', with your reason if you give one' : ''}.{deny ? '' : ` ${cov[0]}.`}</p>
          {deny ? <div className="field-wrap"><label className="label" htmlFor="sl-why">Reason for {first} (optional)</label><div className="field"><input id="sl-why" placeholder="e.g. Cardiology has no nurse cover those days" value={S.lvNote}
            onChange={e => { S.lvNote = e.target.value; paint(); }} /></div></div> : null}</div>
        <div className="cs-acts">{btn(deny ? 'Deny request' : 'Approve request', 'st-leave-ok', { kind: deny ? 'destructive' : 'primary' })}{goBack()}</div></div><div className="sheet-home"></div></>; },
  // F19/T18: switching access says what goes before it goes.
  strole: () => { const who = S.stWho.map(person).filter(p => p.access !== S.stPick), to = ROLES[S.stPick];
    const lose = [...new Set(who.flatMap(p => ROLES[p.access][2].filter(t => !to[2].includes(t) && !/^Not included/.test(t))))];
    return csheet(`Switch ${who.map(p => p.name).join(' and ')} to ${to[0]}?`,
      `${who.map(p => `${p.name} stops being ${ROLES[p.access][0]}`).join('; ')}. They lose: ${lose.join('; ')}. To add leave approvals without losing anything, go back and tick “Also approves leave” instead.`,
      btn(`Switch to ${to[0]}`, 'st-saverole-ok'), goBack()); },
  // R06: adding a doctor without an OPD or working days asks first.
  stnoopd: () => { const f = S.stAdd, miss = [!f.opd && 'an OPD', !(f.days || '').trim() && 'working days'].filter(Boolean).join(' or ');
    return csheet(`Save without ${miss}?`, "Until they're set, patients can't book this doctor and the roster can't show them on duty. Their page will say “Not set”, with an Add link.",
      btn('Save without them', 'st-add:1'), goBack()); },
});
// Re-render in place. React keeps the page's scroll and the search caret, since the elements survive.
export const sRe = () => render();
// The walk-in becomes a patient in today's list — and, for Dr. Sharma, in her own queue.
// Run 6 Y05: her queue's patient list is module data, so a reload adds her walk-ins back from S.walk (app.jsx boot).
export const drJoin = (k, w) => { DR_PATIENTS[k] = { name: w.name, ini: w.ini, info: w.info, reason: w.note ? `${w.reason}. Desk note: ${w.note}` : w.reason, short: w.reason, time: w.time, hist: '' }; DR_HISTORY[k] = w.hist; };
export function addWalkIn(rec) {
  const k = `w${Object.keys(S.walk).length + 1}`, w = { ...rec, time: now(), walkin: true };
  S.walk[k] = w;
  if (w.doc === 'ps') { drJoin(k, w); S.drq[k] = 'waiting'; }
  else S.rq[k] = 'waiting';
  S.wk = { type: 'new' }; S.wkErr = {}; S.stQ = ''; S.stF = {}; // back to the full list, with the new row in it
  // F12/R14/T20: say who was added to whose queue, with their ID, and highlight the row (mount.sarr scrolls it into view).
  toast(`${w.name} (${pid(k)}${w.isNew ? '' : ', matched record'}) added to ${dname(w.doc)}'s queue.`);
  sGo('sarr'); S.stHi = k; sRe();
}
mount.sstaff = () => { if (S.stHi) document.getElementById(`st-row-${S.stHi}`)?.scrollIntoView({ block: 'center' }); }; // F26
mount.sarr = () => { if (S.stHi) document.getElementById(`arr-${S.stHi}`)?.scrollIntoView({ block: 'center' }); };
// R14/T20: a new patient gets the next CH- number; a matched record keeps its own (base).
export const wkRecord = (base = {}) => {
  const w = S.wk, id = `CH-${2508 + Object.values(S.walk).filter(x => x.isNew).length}`;
  return { name: w.name.trim(), ini: initials(w.name.trim().replace(/\s+/g, ' ')), info: `${w.sex} · ${String(w.age).trim()} · ${id}`, reason: (w.reason || '').trim() || 'Walk-in', note: (w.note || '').trim(),
    phone: (w.phone || '').trim() || NOT_SET, hist: [], isNew: true, ...base, doc: wkDoc().doc };
};

// Rows are keyboard-reachable; Enter opens them like a click.
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
  'st-go': sc => { // T21: coming back to a half-filled walk-in form says it was kept
    if (sc === 'swalk') S.wkKept = wkFilled();
    if (sc === 'sadd') Object.assign(S, { stEdit: null, stAdded: null, stAdd: {}, stAddErr: {} });
    sGo(sc); },
  'st-adddoc': () => { Object.assign(S, { stAdded: null, stEdit: null, stAdd: {}, stAddErr: {} }); sGo('sadd', 'sdocs'); },
  // F06: "Add" beside a Not set field opens the doctor's details with what's known filled in.
  'st-editdoc': id => { const d = person(id), extra = S.stDocs.find(x => x.id === id), [opd, , , nmc] = docOf(id);
    Object.assign(S, { stEdit: id, stAdded: null, stAddErr: {}, stAdd: { name: d.name, phone: d.phone || '', email: d.email || '', nmc, spec: d.dept, opd, days: (extra ? d.days : d.days || DOCTORS[id]?.days) || '' } }); sGo('sadd'); },
  // F18/R19/T13: every staff record can be edited.
  'st-edit': id => { const p = person(id);
    if (p.title === 'Doctor') return ACTIONS['st-editdoc'](id);
    const iso = p.start ? isoDate(p.start) : '';
    Object.assign(S, { stEdit: id, stNewErr: {}, stNew: { name: p.name, phone: p.phone || '', email: p.email || '', role: p.title, dept: p.dept, start: iso, grade: p.grade || '', council: p.council || '' } }); sGo('saddst'); },
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
  'st-role': id => { const l = leaveOk(id); Object.assign(S, { stWho: [id], stPick: person(id).access, stLv: { on: !!l, until: l?.until ? isoDate(l.until) : '' } }); sGo('srole', S.screen === 'sperson' ? 'sperson' : null); },
  'st-bulk': () => { Object.assign(S, { stWho: [...S.stSel], stPick: person(S.stSel[0]).access, stLv: { on: false, until: '' } }); sGo('srole'); },
  'st-pick': k => { S.stPick = k; sRe(); },
  'st-lvok': () => { S.stLv = { ...S.stLv, on: !S.stLv.on }; sRe(); }, // W04
  // F19/T18: a switch of access role warns first; the add-on alone saves straight away.
  'st-saverole': () => { if (S.stWho.some(id => person(id).access !== S.stPick)) { S.sheet = 'strole'; return render(); } ACTIONS['st-saverole-ok'](); },
  'st-saverole-ok': () => {
    const lv = S.stPick !== 'hr' && S.stLv.on ? { until: S.stLv.until ? fromIso(S.stLv.until) : null } : null;
    S.stWho.forEach(id => { const p = person(id), from = accessText(p);
      S.stAccess[id] = S.stPick;
      if (lv) S.stLeaveOk[id] = lv; else delete S.stLeaveOk[id];
      const to = accessText(person(id));
      if (to !== from) S.stAudit.unshift({ who: p.name, from, to, by: stMe().name, at: now() }); }); // R16/T18/W09: the audit log in Settings
    S.sheet = null; if (S.stFrom === 'sperson') { S.stId = S.stWho[0]; sGo('sperson'); } else sGo('sroles'); // Run 6 Y26: back where it started
    toast(`${S.stWho.map(dname).join(' and ')} ${S.stWho.length > 1 ? 'are' : 'is'} now ${accessText(person(S.stWho[0]))}.`); render();
  },
  'st-set': k => { S.stSet[k] = !S.stSet[k]; sRe(); },
  'st-hosp': () => { S.stHospSaved = true; toast('Hospital details saved.'); sRe(); }, // W03
  // F06/R06/T24: blanks stay blank ("Not set" on the record); saving without an OPD or working days asks first (stnoopd).
  'st-add': force => {
    const f = S.stAdd, t = k => (f[k] || '').trim(); S.stAddErr = {};
    if (!t('name')) S.stAddErr.name = "Enter the doctor's full name.";
    if (!t('spec')) S.stAddErr.spec = 'Choose their specialty.';
    if (Object.keys(S.stAddErr).length) return sRe();
    if (!force && (!t('opd') || !t('days'))) { S.sheet = 'stnoopd'; return render(); }
    const name = /^Dr\.?\s/i.test(t('name')) ? t('name').replace(/^Dr\.?\s*/i, 'Dr. ') : `Dr. ${t('name')}`;
    const rec = { name, ini: initials(name.replace(/^Dr\. /, '')), spec: t('spec'), opd: t('opd'), days: t('days'), phone: t('phone'), email: t('email'), nmc: t('nmc') };
    S.sheet = null;
    if (S.stEdit) { const id = S.stEdit, d = S.stDocs.find(x => x.id === id);
      if (d) Object.assign(d, rec); else S.stEdits[id] = { ...S.stEdits[id], ...rec, dept: rec.spec };
      Object.assign(S, { stId: id, stEdit: null, stAdd: {} }); sGo('sdoc'); toast(`${name}'s details saved.`); return render(); }
    S.stDocs.push({ id: `n${S.stDocs.length + 1}`, ...rec, emp: `CH-0${270 + S.stDocs.length}`, start: TODAY });
    Object.assign(S, { stAdded: name, stAdd: {} }); toast(`${name} has been added.`); sRe(); // W03
  },
  // Front desk
  'st-checkin': () => { S.sheet = 'stcheck'; render(); }, // F11/T19: confirm first
  'st-checkin-ok': () => {
    const k = S.stId;
    S.sheet = null; S.ckAt[k] = now();
    toast(`${arr(k).name} checked in.`); // W03
    if (k === 'as') S.visitDay = 'checkedin'; // Anisha's phone shows her checked in
    else if (inDrQueue(k)) S.drq[k] = 'waiting'; // and Dr. Sharma's queue shows them waiting
    else S.rq[k] = 'waiting';
    sRe();
  },
  'st-wtype': v => { S.wk.type = v; sRe(); },
  'st-wsex': v => { S.wk.sex = v; delete S.wkErr.sex; sRe(); },
  'st-wcover': id => { S.wk.doc = `${person(id).name} · ${person(id).dept}`; S.wk.docId = null; delete S.wkErr.doc; sRe(); }, // Run 6 Y14
  'st-wdoc': id => { S.wk.docId = id; delete S.wkErr.doc; sRe(); }, // W12: the receptionist picks the doctor
  'st-walk': () => {
    const w = S.wk, e = S.wkErr = {}, m = wkDoc(), age = String(w.age || '').trim();
    if (!(w.name || '').trim()) e.name = "Enter the patient's full name.";
    if (!/^\d{1,3}$/.test(age) || +age > 120) e.age = 'Enter their age in years.';
    if (!w.sex) e.sex = 'Choose one.';
    const doc = m.doc && person(m.doc);
    if (!doc || duty(doc.id) !== 'on') e.doc = doc ? `${doc.name} isn't in today — choose a doctor on duty.` : m.dept ? `Choose one of the ${deptName(m.dept)} doctors below.` : 'Type a doctor, department or symptom, then choose a doctor.';
    if (Object.keys(e).length) return sRe();
    const name = w.name.trim().toLowerCase(), all = patients(), exact = all.find(p => p.name.toLowerCase() === name);
    if (exact) return ACTIONS['st-them'](exact.k);
    const first = name.split(/\s+/)[0], c = all.filter(p => p.name.toLowerCase().split(/\s+/)[0] === first).map(p => p.k);
    if (c.length) { S.stWho = c; return sGo('smatch'); } // someone with that name is already on the books
    addWalkIn(wkRecord());
  },
  // A returning patient: booked today → check them in; otherwise they join the queue on their own record.
  'st-them': k => {
    // T09/V10: a booked patient is checked in on the booking, keeping what the desk typed and its note for the doctor
    if (arrivals().includes(k)) { S.stId = k; S.wkDesk[k] = { reason: (S.wk.reason || '').trim(), note: (S.wk.note || '').trim() }; S.wk = { type: 'new' }; return sGo('scheck'); }
    const a = arr(k);
    addWalkIn(wkRecord({ name: a.name, ini: a.ini, info: a.info, phone: a.phone, hist: histOf(k, 9, '').slice(0, 2), isNew: false }));
  },
  'st-asnew': () => addWalkIn(wkRecord()),
  // HR
  'st-leave': v => { Object.assign(S, { lvAsk: v, lvNote: '', sheet: 'stleave' }); render(); }, // F16/V11/W08: confirm first
  'st-leave-ok': () => { const k = S.stId, v = S.lvAsk;
    S.leave[k] = v; S.lvBy[k] = [stMe().name, `today, ${now()}`]; S.lvWhy[k] = v === 'denied' ? S.lvNote.trim() : '';
    S.sheet = null; toast(`${person(LEAVES[k].who).name}'s leave ${v}.`, ['Undo', `st-lvundo:${k}`]); render(); },
  // T13: a CSV for payroll — start date, grade, and August's working, present, leave and absent days — through the browser's own download.
  'st-payroll': () => { const q = v => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const rows = [['Name', 'Employee ID', 'Job title', 'Department', 'Start date', 'Grade', 'Working days (Aug 2026)', 'Present', 'Leave days', 'Absent'],
      ...people().map(p => { const a = monthAtt(p.id); return [p.name, p.emp, p.title, p.dept, p.start ? isoDate(p.start) : p.joined, p.grade, a.total, a.present, a.leave, a.absent]; })];
    const url = URL.createObjectURL(new Blob([rows.map(r => r.map(q).join(',')).join('\r\n')], { type: 'text/csv' }));
    Object.assign(document.createElement('a'), { href: url, download: 'clinica-payroll-2026-08.csv' }).click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
    const all = people(), pend = all.filter(p => staffStatus(p) === 'Pending').length, lv = all.filter(p => monthAtt(p.id).leave).length; // Run 6 Y16
    toast(`Payroll export downloaded: clinica-payroll-2026-08.csv. ${all.length} staff${pend ? `, including ${pend} not started yet (start date in the file)` : ''}${lv ? `; ${lv} with leave days in August` : ''}.`, null, 8000); render(); },
  'st-lvreopen': () => { const k = S.stId, l = LEAVES[k], was = LEAVE_TAG[S.leave[k]][0], by = S.lvBy[k]; // W08: back to Pending after the Undo window, and logged
    S.stAudit.unshift({ who: `${person(l.who).name}'s ${l.type.toLowerCase()} (${leaveSpan(l)})`, from: was, to: 'Pending (reopened)', by: stMe().name, at: now() });
    // Run 6 Y07: the earlier decision stays in the request's history, with what was sent, and the employee is told it's open again
    S.lvHist = { ...S.lvHist, [k]: [...(S.lvHist[k] || []), [`${was} by ${by?.[0] || 'HR'}${by ? `, ${by[1]}` : ''}`, S.lvWhy[k] ? `Sent: “${S.lvWhy[k]}”` : was === 'Denied' ? 'No reason was given.' : ''],
      [`Reopened by ${stMe().name}, today, ${now()}`, `${lvFirst(k)} was told the request is being looked at again.`]] };
    S.leave[k] = 'pending'; delete S.lvBy[k]; delete S.lvWhy[k]; toast(`${person(l.who).name}'s leave request is open again. ${lvFirst(k)} has been told.`); render();
    $phone()?.querySelector('[data-act="st-leave:approved"]')?.focus(); }, // Run 6 Y11: focus on the next decision, not the page
  'st-lvundo': k => { S.leave[k] = 'pending'; delete S.lvBy[k]; delete S.lvWhy[k]; toastClear(); render(); },
  'st-calm': d => { S.stCalM += +d; S.stCalDay = null; sRe(); },
  'st-calday': d => { S.stCalDay = S.stCalDay === +d ? null : +d; sRe(); },
  // Add staff (HR and the administrator)
  'st-addst': () => { Object.assign(S, { stNew: {}, stNewErr: {} }); sGo('saddst'); },
  // F18/R19/T13: start date required (Pending until then), grade and council number optional; the same action saves an edit.
  'st-addstaff': () => {
    const f = S.stNew, e = S.stNewErr = {}, v = k => (f[k] || '').trim(), ed = S.stEdit;
    if (!v('name')) e.name = 'Full name is required.';
    if (!v('phone')) e.phone = 'Phone number is required.';
    if (!ed && !f.role) e.role = 'Job title is required.';
    if (!f.dept) e.dept = 'Department is required.';
    if (!v('start')) e.start = 'Start date is required.';
    if (Object.keys(e).length) return sRe();
    const start = fromIso(v('start')), extra = { phone: v('phone'), email: v('email'), start, joined: `${MONTHS[start.getMonth()]} ${start.getFullYear()}`, grade: v('grade'), council: v('council') };
    if (ed) {
      S.stEdits[ed] = { ...S.stEdits[ed], name: v('name'), ini: initials(v('name').replace(/^Dr\.?\s*/i, '')), dept: f.dept, ...extra };
      Object.assign(S, { stEdit: null, stNew: {}, stId: ed }); sGo('sperson'); toast(`${v('name')}'s record saved.`); return render();
    }
    const n = S.stStaff.length + S.stDocs.length, base = { ...extra, addedBy: stMe().name };
    if (f.role === 'Doctor') { // the same doctor roster Add a doctor adds to; no made-up working days (F06)
      const name = /^Dr\.?\s/i.test(v('name')) ? v('name').replace(/^Dr\.?\s*/i, 'Dr. ') : `Dr. ${v('name')}`;
      S.stDocs.push({ id: `n${S.stDocs.length + 1}`, ini: initials(name.replace(/^Dr\. /, '')), name, spec: f.dept, opd: '', days: '', nmc: v('council'), emp: `CH-0${270 + S.stDocs.length}`, ...base });
    } else S.stStaff.push({ id: `s${S.stStaff.length + 1}`, ini: initials(v('name')), name: v('name'), title: f.role, dept: f.dept, access: ACCESS_OF[f.role], emp: `CH-STF-0${270 + n}`, ...base });
    const who = f.role === 'Doctor' ? S.stDocs.at(-1).name : v('name'), pend = start > TODAY;
    Object.assign(S, { stNew: {}, stQ: '', stF: {} });
    sGo('sstaff'); S.stDone = `${who} has been added${pend ? ` — Pending until ${dayLabel(start)}` : ''}`; toast(`${S.stDone}.`); // W03: back to the directory, with the new row in it
    S.stHi = f.role === 'Doctor' ? S.stDocs.at(-1).id : S.stStaff.at(-1).id; sRe(); // F26: highlighted and scrolled into view, as a new walk-in is
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
    Object.assign(S, { stDeptAdded: d.name.trim(), stDept: { docs: [] } }); toast(`${S.stDeptAdded} has been added.`); sRe(); // W03
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
  sset: s => s.stAudit.length ? 'T04f' : 'T04', sadd: s => s.stAdded ? 'T04a2' : s.stFrom === 'sdocs' ? 'T04a3' : 'T04a', sroles: s => s.stSel.length ? 'T04b2' : 'T04b',
  srole: s => ({ sbr: 'T04c', rk: 'T04c2', ab: 'T04c3', ps: 'T04c4', mt: 'T04c5' })[s.stWho[0]] || 'T04c', sacct: () => 'T04d', shosp: () => 'T04e',
  spats: s => person(s.stMe)?.access === 'desk' ? 'R09' : ({ date: 'T05c', dept: 'T05d', doc: 'T05e' })[s.stMenu] || (s.stSort ? 'T05b' : 'T05'), spat: () => 'T05a',
  sadddept: s => s.stDeptAdded ? 'T03h' : Object.keys(s.stDeptErr).length ? 'T03g' : 'T03f',
  sarr: s => !arrivals().length ? 'R01b' : s.stQ ? 'R01c' : s.stMenu === 'status' ? 'R01d' : (s.stF.status || []).length ? 'R01e' : 'R01',
  scheck: s => s.stId === 'st' ? (s.ckAt.st ? 'R08' : 'R07') : s.ckAt[s.stId] ? 'R03' : 'R02',
  swalk: s => s.wk.type === 'follow' ? 'R05' : s.wk.doc ? 'R04b' : 'R04', smatch: () => 'R06',
  sstaff: s => ({ role: 'HR01d', dept: 'HR01c', status: 'HR01e' })[s.stMenu] || (s.stDone ? 'HR11c' : Object.values(s.stF).some(v => v.length) ? 'HR01b' : 'HR01'),
  sperson: s => person(s.stId)?.addedBy ? 'HR02b' : 'HR02', shdash: () => 'HR10', saddst: s => Object.keys(s.stNewErr).length ? 'HR11b' : 'HR11',
  sleave: s => s.stMenu === 'status' ? 'HR03c' : (s.stF.status || []).length ? 'HR03d' : Object.values(s.leave).includes('pending') ? 'HR03' : 'HR03b',
  sreq: s => s.stId === 'ms' ? 'HR07' : s.lvHist?.[s.stId]?.length ? 'HR06b' : ({ pending: 'HR04', approved: 'HR05', denied: 'HR06' })[s.leave.pk],
  satt: s => s.stMenu === 'sort' ? 'HR08c' : s.stSort ? 'HR08b' : 'HR08', satt1: s => s.stCalDay ? 'HR09b' : s.stCalM !== 7 ? 'HR09c' : 'HR09',
};
// The sign-out confirmation can sit over any staff screen.
const SHEET_NUM = { stcheck: 'R02b', stleave: 'HR04b', strole: 'T04c6', stnoopd: 'T04a4' };
for (const [k, f] of Object.entries(STAFF_NUM)) NUM[k] = s => s.sheet === 'stsignout' ? ({ admin: 'T06', desk: 'R10', hr: 'HR12' })[person(s.stMe)?.access] : SHEET_NUM[s.sheet] || f(s);

export const SA = (x = {}) => () => ({ ...STAFF_START(), stMe: 'rk', screen: 'sdash', ...x });
export const SD = (x = {}) => SA({ stMe: 'sbr', screen: 'sarr', ...x });
export const SH = (x = {}) => SA({ stMe: 'ab', screen: 'sstaff', ...x });
later(() => { // the presets read the doctor's queue (doctor.jsx)
FLOW.push(['Hospital staff — administrator', [
  ['T00', 'Sign in', 'Hospital staff', 'One sign-in for every staff role — the ID decides whether you land on the dashboard, check-in or the staff directory.', () => ({ ...STAFF_START() })],
  ['T00b', 'Sign in — wrong password', 'Wrong ID or password', "The error names both fields, so it doesn't reveal which one was wrong. The password is cleared.", () => ({ ...STAFF_START(), stErr: true })],
  ['T01', 'Dashboard', 'Signs in as the administrator', "Today across the hospital at a glance. The numbers come from the same day as the doctor's apps — Dr. Sharma's queue and the reports she hasn't released (“Reports awaiting review”). Waiting by department flags Cardiology as closed, with why, who covers and when it reopens. Below, HR's headcount — counts only.", SA()],
  ['T01b', 'Dashboard — no doctors on duty', 'Public holiday', 'A day with nobody rostered — the list says why instead of sitting empty.', SA({ stHoliday: true })],
  ['T02', 'Doctors', 'Doctors', 'The whole roster with today\'s load and duty status, searchable and filterable.', SA({ screen: 'sdocs' })],
  ['T02b', 'Doctors — search', 'Types “derma”', 'Search matches the department as well as the name.', SA({ screen: 'sdocs', stQ: 'derma' })],
  ['T02c', 'Doctor — Dr. Ramesh Shrestha', 'Opens a doctor', 'One doctor\'s registration, contact and working days, with their day so far.', SA({ screen: 'sdoc', stId: 'rs' })],
  ['T02d', 'Doctors — filtered by department', 'Department: Dermatology', 'The chip shows the filter in force, so the shorter list explains itself.', SA({ screen: 'sdocs', stF: { dept: ['Dermatology'] } })],
  ['T02e', 'Doctors — Department filter open', 'Department', 'Departments with how many doctors each — tick one or more.', SA({ screen: 'sdocs', stMenu: 'dept', stF: { dept: ['Dermatology'] } })],
  ['T02f', 'Doctors — Status filter open', 'Status', 'On duty, off duty or on leave, with counts.', SA({ screen: 'sdocs', stMenu: 'status', stF: { status: ['Off duty'] } })],
  ['T02g', 'Doctors — Sort open', 'Sort', 'Sort by how busy each doctor is today.', SA({ screen: 'sdocs', stMenu: 'sort', stSort: 'pt-desc' })],
  ['T03', 'Departments', 'Departments', 'Each department as a card, in plain words too (“Cardiology · heart”): running or closed, who\'s in by full name, and today\'s patients. A closed one says when it reopens and who covers.', SA({ screen: 'sdepts' })],
  ['T03a', 'Department — General medicine', 'General medicine', 'The department\'s doctors and how its day is going.', SA({ screen: 'sdept', stId: 'gm' })],
  ['T03b', 'Department — Dermatology', 'Dermatology', 'A department with a doctor on leave — staff on leave replaces the arrivals count.', SA({ screen: 'sdept', stId: 'derm' })],
  ['T03c', 'Department — Paediatrics', 'Paediatrics', 'A one-doctor department.', SA({ screen: 'sdept', stId: 'paed' })],
  ['T03d', 'Department — Gynaecology', 'Gynaecology', 'A one-doctor department.', SA({ screen: 'sdept', stId: 'gyn' })],
  ['T03e', 'Department — Cardiology', 'Cardiology', 'Closed today — its only doctor works Sun–Thu. It says who covers and when it reopens.', SA({ screen: 'sdept', stId: 'card' })],
  ['T03f', 'Add a department', 'Add department', 'Name, OPDs and the doctors who work in it — only what the department screens show. Assigning a doctor moves them out of their old department.', SA({ screen: 'sadddept' })],
  ['T03g', 'Add a department — missing details', 'Add department with fields empty', 'Each required field says what it needs.', SA({ screen: 'sadddept', stDeptErr: { name: 'Department name is required.', opd: 'OPD / room range is required.' } })],
  ['T03h', 'Add a department — added', 'Add department', 'It joins the departments straight away: running, with no patients yet today.', SA({ screen: 'sadddept', stDeptAdded: 'Orthopaedics', stDepts: [{ k: 'd1', name: 'Orthopaedics', opd: 'OPD 8' }] })],
  ['T04', 'Settings', 'Settings', 'Staff and roles, hospital details, and the administrator\'s own account.', SA({ screen: 'sset' })],
  ['T04a', 'Add a doctor', 'Add a doctor', 'A new doctor goes straight onto the roster and gets their own sign-in.', SA({ screen: 'sadd' })],
  ['T04a3', 'Add a doctor — from Doctors', 'Add doctor', 'The same form, opened from the Doctors list, so its back link leads there.', SA({ screen: 'sadd', stFrom: 'sdocs' })],
  ['T04a4', 'Add a doctor — no OPD or days', 'Add doctor with OPD and working days blank', 'Asks before saving; the record will say “Not set” with an Add link, never an invented value.', SA({ screen: 'sadd', stAdd: { name: 'Nirmala Pandey', spec: 'Cardiology' }, sheet: 'stnoopd' })],
  ['T04a2', 'Add a doctor — added', 'Add doctor', 'Confirms who was added and how they\'ll sign in; they now show in the roster and the staff directory.', SA({ screen: 'sadd', stAdded: 'Dr. Kabita Shrestha' })],
  ['T04b', 'Assign roles', 'Assign roles', 'Each person\'s access role, kept apart from their job title.', SA({ screen: 'sroles' })],
  ['T04b2', 'Assign roles — 2 selected', 'Ticks two people', 'Selecting people brings up a bar to change their role together.', SA({ screen: 'sroles', stSel: ['sbr', 'rk'] })],
  ['T04c', 'Assign role — Sabina Rai', 'Opens Sabina', 'One access role each, the rule stated, an “Also approves leave” add-on with an optional end date, and what the chosen role can access.', SA({ screen: 'srole', stWho: ['sbr'], stPick: 'desk' })],
  ['T04c2', 'Assign role — Rajesh Koirala', 'Opens Rajesh', 'The administrator\'s own role.', SA({ screen: 'srole', stWho: ['rk'], stPick: 'admin' })],
  ['T04c3', 'Assign role — Anjali Basnet', 'Opens Anjali', 'The HR manager\'s role.', SA({ screen: 'srole', stWho: ['ab'], stPick: 'hr' })],
  ['T04c4', 'Assign role — Dr. Priya Sharma', 'Opens Dr. Sharma', 'A doctor\'s role.', SA({ screen: 'srole', stWho: ['ps'], stPick: 'doctor' })],
  ['T04c5', 'Assign role — Maya Tuladhar', 'Opens Maya', 'A nurse has Nurse access: her department\'s arrivals, without prescribing or releasing reports.', SA({ screen: 'srole', stWho: ['mt'], stPick: 'nurse' })],
  ['T04c6', 'Assign role — switch warning', 'Picks HR manager for Sabina', 'Before a switch is saved, it says what access she would lose — and points to the leave add-on instead.', SA({ screen: 'srole', stWho: ['sbr'], stPick: 'hr', sheet: 'strole' })],
  ['T04f', 'Settings — role changes', 'After saving a role', 'Every role change is logged: who, from → to, who changed it and when.', SA({ screen: 'sset', stAudit: [{ who: 'Sabina Rai', from: 'Front desk', to: 'Front desk + approves leave until Sep 30', by: 'Rajesh Koirala', at: '4:52 PM' }] })],
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
  ['R01c', 'Search — “sunita”', 'Types “sunita”', 'Both Sunitas — Karki and Thapa, whose 5:15 booking is now listed — told apart by age and the last four digits of their phone. Search also takes a phone number, CH- ID or doctor.', SD({ stQ: 'sunita' })],
  ['R01d', 'Status filter open', 'Status', 'One status at a time, with how many patients are in each.', SD({ stMenu: 'status' })],
  ['R01e', 'Filtered — Not arrived', 'Status: Not arrived', 'The no-shows, the state most likely to need Reception.', SD({ stF: { status: ['Not arrived'] } })],
  ['R02', 'Check-in — Sunita Karki', 'Opens Sunita', 'Her booking, reason and last visit. Check in asks first, naming her.', SD({ screen: 'scheck', stId: 'sk' })],
  ['R03', 'Checked in', 'Check in', "Sunita is checked in — and now Waiting in Dr. Sharma's queue on both of her apps.", SD({ screen: 'scheck', stId: 'sk', ckAt: { sk: '4:52 PM' }, drq: { ...EXTRA_STATE_DR().drq, sk: 'waiting' } })],
  ['R04', 'Register a walk-in', 'Register a walk-in', 'A patient without a booking, with age, sex, the reason and a note for the doctor. Enter adds them; Dr. Sharma\'s walk-ins join her own queue.', SD({ screen: 'swalk' })],
  ['R04b', 'Walk-in — choose a doctor', 'Types “General medicine”', 'A department, or a symptom like “fever”, lists its doctors on duty with how many are waiting — nobody is picked for you.', SD({ screen: 'swalk', wk: { type: 'new', doc: 'General medicine' } })],
  ['R05', 'Walk-in — follow-up', 'Follow-up visit', 'Once the name matches a record it says so — “Matched to CH-1956” — with their recent visits.', SD({ screen: 'swalk', wk: { type: 'follow', name: 'Kiran Basnet' } })],
  ['R06', 'Walk-in — is this Sunita?', 'Add to queue with a common name', 'Two records share the name — pick the right one before creating a duplicate.', SD({ screen: 'smatch', wk: { type: 'new', name: 'Sunita' }, stWho: ['sk', 'st'] })],
  ['R02b', 'Check in — confirm', 'Check in', 'Names who is being checked in — age, ID, the last four phone digits and the doctor — so the wrong Sunita can\'t be.', SD({ screen: 'scheck', stId: 'st', sheet: 'stcheck' })],
  ['R07', 'Check-in — Sunita Thapa', 'This is them', "Matched to CH-1187: her 5:15 booking is already in today's arrivals (no longer found only through the walk-in search), so she's checked in on it. What the desk typed stays beside the booking's reason.", SD({ screen: 'scheck', stId: 'st', wkDesk: { st: { reason: 'BP follow-up – headaches this week', note: '' } } })],
  ['R08', 'Sunita Thapa — checked in', 'Check in', 'Checked in, early for her 5:15 slot.', SD({ screen: 'scheck', stId: 'st', rq: { ...EXTRA_STATE_ST().rq, st: 'waiting' }, ckAt: { st: '4:55 PM' } })],
  ['R09', 'Patients', 'Patients', 'The same visit-by-visit table the administrator sees.', SD({ screen: 'spats' })],
  ['R10', 'Sign out', 'Sign out', 'Asks first, from the name menu.', SD({ sheet: 'stsignout' })],
]]);
FLOW.push(['Hospital staff — HR', [
  ['HR01', 'Staff directory', 'Staff', 'Everyone at the hospital, not just doctors, by job title, with who is on leave or starting soon.', SH()],
  ['HR01b', 'Staff — filtered by role', 'Role: Doctor', 'Only the doctors.', SH({ stF: { role: ['Doctor'] } })],
  ['HR01c', 'Staff — Department filter open', 'Department', 'Departments with headcounts.', SH({ stMenu: 'dept', stF: { dept: ['Dermatology'] } })],
  ['HR01d', 'Staff — Role filter open', 'Role', 'Job titles with headcounts.', SH({ stMenu: 'role', stF: { role: ['Nurse'] } })],
  ['HR01e', 'Staff — Status filter open', 'Status', 'Active or on leave.', SH({ stMenu: 'status', stF: { status: ['On leave'] } })],
  ['HR02', 'Staff — Maya Tuladhar', 'Opens Maya', 'One person\'s employment and contact details, their access role, and Edit. A blank says “Not set”.', SH({ screen: 'sperson', stId: 'mt' })],
  ['HR02b', 'Staff — added today', 'Opens the new person', 'Records added in Clinica say who added them, beside the join date and employee ID.', SH({ screen: 'sperson', stId: 's1', stStaff: [{ id: 's1', ini: 'KS', name: 'Kabita Shrestha', title: 'Nurse', dept: 'General medicine', access: 'nurse', emp: 'CH-STF-0270', joined: 'Aug 2026', phone: '+977 98XX-XX1234', email: '', addedBy: 'Anjali Basnet' }] })],
  ['HR03', 'Leave requests', 'Leave requests', 'Requests waiting on HR, alongside ones already decided.', SH({ screen: 'sleave' })],
  ['HR03c', 'Leave requests — Status filter open', 'Status', 'Pending, approved or denied — one at a time.', SH({ screen: 'sleave', stMenu: 'status' })],
  ['HR03d', 'Leave requests — filtered', 'Status: Pending', 'Only what is waiting on HR.', SH({ screen: 'sleave', stF: { status: ['Pending'] } })],
  ['HR03b', 'Leave requests — none pending', 'All decided', 'Nothing waiting — decided requests stay in the history below.', SH({ screen: 'sleave', leave: { ...EXTRA_STATE_ST().leave, pk: 'approved' } })],
  ['HR04', 'Leave request — Prasant Khadka', 'Opens Prasant', 'The reason given, and a warning worked out from the staff list: he is Cardiology\'s only nurse. Calendar and working days are both stated.', SH({ screen: 'sreq', stId: 'pk' })],
  ['HR04b', 'Leave request — deny, with a reason', 'Deny', 'Deny asks first, with an optional reason that is sent to Prasant as written. Approve asks the same way. Either can be undone for a few seconds.', SH({ screen: 'sreq', stId: 'pk', sheet: 'stleave', lvAsk: 'denied', lvNote: 'Cardiology has no nurse cover those days' })],
  ['HR05', 'Leave request — approved', 'Approve', 'Approved, with who approved it and when; Prasant is told.', SH({ screen: 'sreq', stId: 'pk', leave: { ...EXTRA_STATE_ST().leave, pk: 'approved' }, lvBy: { ...EXTRA_STATE_ST().lvBy, pk: ['Anjali Basnet', 'today, 4:52 PM'] } })],
  ['HR06', 'Leave request — denied', 'Deny', 'Denied, with who denied it and when, and the reason exactly as Prasant received it.', SH({ screen: 'sreq', stId: 'pk', leave: { ...EXTRA_STATE_ST().leave, pk: 'denied' }, lvBy: { ...EXTRA_STATE_ST().lvBy, pk: ['Anjali Basnet', 'today, 4:52 PM'] }, lvWhy: { pk: 'Cardiology has no nurse cover those days' } })],
  ['HR06b', 'Leave request — reopened', 'Reopen', "New (Run 6 Y07): back to Pending, with the denial and what was sent kept in the request's History, then who reopened it and that Prasant was told.", SH({ screen: 'sreq', stId: 'pk', lvHist: { pk: [['Denied by Anjali Basnet, today, 4:52 PM', 'Sent: “Cardiology has no other nurse those days.”'], ['Reopened by Anjali Basnet, today, 4:55 PM', 'Prasant was told the request is being looked at again.']] } })],
  ['HR07', 'Leave request — Dr. Maya Shrestha', 'Opens Maya', 'An already approved request, read-only.', SH({ screen: 'sreq', stId: 'ms' })],
  ['HR08', 'Attendance', 'Attendance', 'This month for everyone; absences stand out in red.', SH({ screen: 'satt' })],
  ['HR08b', 'Attendance — highest absent', 'Highest to lowest absent', 'Who has missed the most days.', SH({ screen: 'satt', stSort: 'absent-desc' })],
  ['HR08c', 'Attendance — Sort open', 'Sort', 'One Sort control: most or fewest days present or absent.', SH({ screen: 'satt', stMenu: 'sort', stSort: 'absent-desc' })],
  ['HR09', 'Attendance — Dr. Maya Shrestha', 'Opens Maya', 'Years since joining, days present and Absent, then the month as a calendar. Every leave day links to its request — the Aug 17–21 annual leave included — and only August\'s working days are counted.', SH({ screen: 'satt1', stId: 'ms' })],
  ['HR09b', 'Attendance — one day', 'Taps a day', 'A tap shows that day\'s status; a leave day links to its request.', SH({ screen: 'satt1', stId: 'ms', stCalDay: 26 })],
  ['HR09c', 'Attendance — another month', 'Next month', 'The arrows move between months; days after today are blank.', SH({ screen: 'satt1', stId: 'ms', stCalM: 8 })],
  ['HR10', 'Dashboard', 'Signs in as HR', 'Today\'s headcount — available means present and working, so on leave and off duty are both left out — and the latest leave requests.', SH({ screen: 'shdash' })],
  ['HR11', 'Add staff', 'Add staff', 'One form for any job, for HR and the administrator. Required fields are marked *; start date, grade and council number are asked for. A future start date shows as Pending.', SH({ screen: 'saddst' })],
  ['HR11b', 'Add staff — missing details', 'Add staff with fields empty', 'Each required field says what it needs. Email is optional.', SH({ screen: 'saddst', stNewErr: { name: 'Full name is required.', phone: 'Phone number is required.', role: 'Job title is required.', dept: 'Department is required.', start: 'Start date is required.' } })],
  ['HR11c', 'Add staff — added', 'Add staff', 'Back in the directory, with the new person in it.', SH({ stDone: 'Kabita Shrestha has been added', stStaff: [{ id: 's1', ini: 'KS', name: 'Kabita Shrestha', title: 'Nurse', dept: 'General medicine', access: 'nurse', emp: 'CH-STF-0270', joined: 'Aug 2026', phone: '+977 98XX-XX1234', email: '', addedBy: 'Anjali Basnet' }] })],
  ['HR12', 'Sign out', 'Sign out', 'Asks first, from the name menu.', SH({ screen: 'shdash', sheet: 'stsignout' })],
]]);
}, ORDER.staff);
