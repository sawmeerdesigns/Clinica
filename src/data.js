// Clinica — the hospital's data, one copy for every app: doctors, departments, today's arrivals, fees and the demo's dates.
// The patient app, the doctor's apps and the staff app all read from here, so their counts and names agree (F07/R05/T06/V07, W20).
// Plain data and tiny helpers only; what changes during the demo lives in S (core.jsx).

// ---------- dates ----------
// F20: the demo's today is a fixed day; every weekday label comes from a real Date, never typed by hand.
export const TODAY = new Date(2026, 7, 28); // Fri, Aug 28, 2026
export const dayAt = (n, from = TODAY) => new Date(from.getFullYear(), from.getMonth(), from.getDate() + n);
export const wdOf = d => d.toLocaleDateString('en-US', { weekday: 'short' }); // 'Fri'
export const mdOf = d => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }); // 'Aug 28'
export const dayLabel = d => `${wdOf(d)}, ${mdOf(d)}`; // 'Fri, Aug 28'
export const isoOf = d => [d.getFullYear(), d.getMonth(), d.getDate()];
// n days from a start date. The OPDs close on Saturdays ("Sun to Fri, 9 AM to 5 PM. Closed Saturdays.").
export const week = (from, n = 7) => Array.from({ length: n }, (_, i) => { const d = dayAt(i, from);
  return { wd: wdOf(d), date: mdOf(d), iso: isoOf(d), closed: d.getDay() === 6 }; });
export const FU_DAY = new Date(2026, 8, 11); // Anisha's two-week follow-up with Dr. Sharma

// ---------- doctors ----------
export const GM = 'General medicine';
export const DAY_TIMES = ['10:30 AM', '11:00 AM', '11:30 AM', '4:30 PM', '5:00 PM', '5:30 PM'];
const OPEN = 'Sun–Fri, 9 AM–5 PM';
// W20: one record per doctor. spec is also their department. duty, slot and reps are today's; busy: day index → taken times, or 'all'.
// Other specialists' patient-app profiles aren't designed yet (noProfile), so their rows don't open there.
export const DOCTORS = {
  ps: { name: 'Dr. Priya Sharma', ini: 'PS', sex: 'Female', spec: GM, opd: 'OPD 2', days: OPEN, emp: 'CH-0231', joined: 'Jun 2019', nmc: '12345', duty: 'on', slot: '5:30 PM', reps: 2,
    times: DAY_TIMES, busy: { 0: ['10:30 AM', '11:30 AM'], 1: ['11:00 AM'], 3: ['5:30 PM'] } },
  rs: { name: 'Dr. Ramesh Shrestha', ini: 'RS', sex: 'Male', spec: GM, opd: 'OPD 1', days: OPEN, emp: 'CH-0198', joined: 'Feb 2017', nmc: '9231', duty: 'on', slot: '10:15 AM', reps: 2,
    times: DAY_TIMES, busy: { 0: 'all', 1: 'all', 2: 'all', 3: 'all', 4: 'all', 5: 'all' } }, // fully booked until Thu, Sep 3 (B07)
  aj: { name: 'Dr. Anita Joshi', ini: 'AJ', sex: 'Female', spec: GM, opd: 'OPD 3', days: OPEN, emp: 'CH-0244', joined: 'Aug 2020', nmc: '10877', duty: 'on', slot: '11:00 AM', reps: 1,
    times: ['9:00 AM', '11:00 AM', '11:30 AM', '4:30 PM', '5:00 PM', '5:30 PM'], busy: { 0: 'all', 2: ['11:30 AM'] } }, // next slot after the closed Saturday
  bt: { name: 'Dr. Bikash Thapa', ini: 'BT', sex: 'Male', spec: 'Dermatology', opd: 'OPD 5', days: OPEN, emp: 'CH-0212', joined: 'Apr 2018', nmc: '11502', duty: 'on', slot: '2:30 PM', reps: 1,
    times: DAY_TIMES, busy: { 0: 'all', 2: 'all', 3: 'all' }, noProfile: true },
  sr: { name: 'Dr. Sunita Rai', ini: 'SR', sex: 'Female', spec: 'Paediatrics', opd: 'OPD 6', days: OPEN, emp: 'CH-0226', joined: 'Jan 2019', nmc: '9874', duty: 'on', slot: '3:45 PM', reps: 1,
    times: DAY_TIMES, busy: {}, noProfile: true }, // W20: Paediatrics in both apps
  kg: { name: 'Dr. Kiran Gurung', ini: 'KG', sex: 'Male', spec: 'Gynaecology', opd: 'OPD 7', days: OPEN, emp: 'CH-0251', joined: 'Mar 2021', nmc: '12210', duty: 'on', slot: '1:15 PM', reps: 0,
    times: DAY_TIMES, busy: {}, noProfile: true },
  sk: { name: 'Dr. Suman KC', ini: 'SK', sex: 'Male', spec: 'Cardiology', opd: 'OPD 4', days: 'Sun–Thu, 9 AM–5 PM', emp: 'CH-0187', joined: 'Sep 2016', nmc: '8456', duty: 'off', slot: '', reps: 0,
    times: DAY_TIMES, busy: { 0: 'all', 2: 'all', 3: 'all' } }, // not in on Fridays; Figma 260:10739: next slot Tue, Sep 1
  ms: { name: 'Dr. Maya Shrestha', ini: 'MS', sex: 'Female', spec: 'Dermatology', opd: 'OPD 5', days: OPEN, emp: 'CH-0263', joined: 'Nov 2022', nmc: '11930', duty: 'leave', slot: '', reps: 0,
    times: ['10:00 AM', '10:30 AM', '2:00 PM'], busy: { 0: 'all' }, noProfile: true },
};
// R07/T08: a department is a name and its OPDs; its doctors are whoever on the roster has that specialty (staff.jsx depts()).
export const DEPTS = { gm: [GM, 'OPD 1–3'], derm: ['Dermatology', 'OPD 5'], paed: ['Paediatrics', 'OPD 6'], gyn: ['Gynaecology', 'OPD 7'], card: ['Cardiology', 'OPD 4'] };

// ---------- today's arrivals ----------
// F07/R05/T06/V07: one arrivals list. Every count — dashboard, Departments, Reception, a doctor's "patients today" — is derived from
// Dr. Sharma's queue (DR_PATIENTS, with S.drq) plus everyone else's (ARR, with S.rq); nothing is typed as a number.
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
// Everyone else's: name, initials, info, doctor, time, reason, history, phone. Their status today starts as ARR_STATE.
export const ARR = {
  sl: ['Sabin Lama', 'SL', 'Male · 34 · CH-1765', 'rs', '10:15 AM', 'Back pain', [['Apr 2, 2026', 'Dr. Ramesh Shrestha · Back pain']]],
  nk: ['Nisha Karki', 'NK', 'Female · 29 · CH-2033', 'aj', '11:30 AM', 'Migraine', []],
  rt: ['Rita Thapa', 'RT', 'Female · 62 · CH-2411', 'rs', '3:00 PM', 'Follow-up, diabetes review', [['Jul 14, 2026', 'Dr. Ramesh Shrestha · Diabetes review']]],
  bp: ['Binod Pandey', 'BP', 'Male · 47 · CH-1490', 'aj', '3:15 PM', 'Chest pain on exertion', []],
  pa: ['Prakash Adhikari', 'PA', 'Male · 55 · CH-1302', 'rs', '5:15 PM', 'General checkup', []],
  st: ['Sunita Thapa', 'ST', 'Female · 41 · CH-1187', 'rs', '5:15 PM', 'Follow-up, hypertension review', [['Jan 14, 2026', 'Dr. Ramesh Shrestha · Blood pressure check']], '+977 98XX-XX8821'],
  kb: ['Kiran Basnet', 'KB', 'Male · 38 · CH-1956', 'rs', '', 'Chest infection', [['Aug 12, 2026', 'Dr. Ramesh Shrestha · Chest infection'], ['May 30, 2026', 'Dr. Priya Sharma · General checkup'], ['Feb 9, 2026', 'Dr. Ramesh Shrestha · Cough']]],
  // R05/T06: Reception covers every department, not only General medicine.
  pm: ['Pooja Magar', 'PM', 'Female · 26 · CH-2501', 'bt', '10:30 AM', 'Acne flare-up', []],
  hb: ['Hari Bhandari', 'HB', 'Male · 49 · CH-2502', 'bt', '2:45 PM', 'Itchy rash on both arms', []],
  aa: ['Aarav Adhikari', 'AA', 'Male · 6 · CH-2503', 'sr', '9:45 AM', 'Fever and cough', []],
  ik: ['Ishani KC', 'IK', 'Female · 3 · CH-2504', 'sr', '11:15 AM', 'Vaccination, 3-year dose', []],
  rm: ['Riya Maharjan', 'RM', 'Female · 9 · CH-2505', 'sr', '5:00 PM', 'Ear pain', []],
  ls: ['Laxmi Shrestha', 'LS', 'Female · 31 · CH-2506', 'kg', '12:30 PM', 'Antenatal check, 24 weeks', []],
  sg: ['Sabita Ghimire', 'SG', 'Female · 45 · CH-2507', 'kg', '4:30 PM', 'Irregular periods', []],
};
// Who is in today's arrivals, and how far along. Sunita Thapa's booking isn't listed yet (found through the walk-in search; Phase 4).
export const ARR_STATE = { sl: 'done', nk: 'done', rt: 'waiting', bp: 'with', pa: 'notarrived',
  pm: 'done', hb: 'waiting', aa: 'done', ik: 'done', rm: 'notarrived', ls: 'done', sg: 'with' };

// ---------- fees ----------
export const FEE = 800; // NPR, the consultation fee
export const WALLETS = { esewa: ['eSewa', 'e'], khalti: ['Khalti', 'K'], fonepay: ['Fonepay', 'F'] }; // the chosen one is S.payWith
