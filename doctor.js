// Clinica for City Hospital's care team — the doctor's app (Dr. Priya Sharma).
// Figma: zw3saW6ot26E6gWH20K3ux, section 551:19193. It shares one world with the patient app: Anisha's queue state is
// her visit day, the note written here is what she reads in Health, and a released report is what she sees.

const DR_PATIENTS = {
  bt: { name: 'Bishal Tamang', ini: 'BT', info: 'Male · 58 · CH-1140', reason: 'Follow-up on blood pressure medication', short: 'Follow-up', time: '9:00 AM', hist: 'Jun 30, May 2' },
  sm: { name: 'Sarita Maharjan', ini: 'SM', info: 'Female · 44 · CH-1873', reason: 'General checkup', short: 'General checkup', time: '9:30 AM', hist: 'Apr 9' },
  di: { name: 'Dipesh Rai', ini: 'DR', info: 'Male · 23 · CH-2296', reason: 'Skin rash', short: 'Skin rash', time: '10:00 AM', hist: 'Jan 15' },
  kg: { name: 'Kabita Gurung', ini: 'KG', info: 'Female · 51 · CH-0987', reason: 'Follow-up on her lipid panel', short: 'Follow-up', time: '11:00 AM', hist: 'Aug 25, May 30' },
  rb: { name: 'Roshan Bhattarai', ini: 'RB', info: 'Male · 36 · CH-2154', reason: 'General checkup', short: 'General checkup', time: '2:00 PM', hist: 'Feb 18' },
  nt: { name: 'Nabin Tamang', ini: 'NT', info: 'Male · 41 · CH-1922', reason: 'Cough and cold, for the past week', short: 'Cough and cold', time: '3:30 PM', hist: 'May 14, Feb 2' },
  as: { name: 'Anisha Sharma', ini: 'AS', info: 'Female · 32 · CH-2381', reason: 'Fever for three days, with a headache', short: 'Fever for three days, with a headache', time: '4:30 PM', hist: 'Aug 12, Jul 3, Jun 20' },
  sk: { name: 'Sunita Karki', ini: 'SK', info: 'Female · 27 · CH-2410', reason: 'General checkup', short: 'General checkup', time: '5:00 PM', hist: 'Mar 3' },
};
const DR_HISTORY = { as: [['Aug 12, 2026', 'Dr. Ramesh Shrestha · Ear infection'], ['Jul 3, 2026', 'Dr. Anita Joshi · General medicine'], ['Jun 20, 2026', 'Dr. Anita Joshi · Walk-in']] };
// The note and prescription as written — the exact wording the patient later reads in Health.
const DR_DRAFTS = {
  as: { note: VISITS.aug28.words, meds: RX.map(({ name, for: f, how, dur }) => ({ name, for: f, how, dur })), follow: '2w' },
  nt: { note: 'A common cold. Rest, stay warm, and drink warm fluids for the throat. Should clear on its own within a week.', follow: 'none',
    meds: [{ name: 'Cough syrup', for: 'For the cough and sore throat', how: '10 ml, 3 times a day', dur: 'For 5 days' },
      { name: 'Paracetamol 500 mg', for: 'For mild fever and body ache', how: '1 tablet 3 times a day, after food', dur: 'For 5 days' }] },
};
const DR_REPORTS = {
  cbc: { pid: 'as', test: 'CBC blood test', date: 'Aug 28', first: 'Anisha', rows: [['Haemoglobin', '13.2 g/dL'], ['White cell count', '6,200/µL'], ['Platelets', '250,000/µL']],
    normal: 'Everything in your blood count is normal. No follow-up needed.' },
  lipid: { pid: 'kg', test: 'Lipid panel', date: 'Aug 25', first: 'Kabita', rows: [['Total cholesterol', '185 mg/dL'], ['LDL', '110 mg/dL'], ['HDL', '52 mg/dL'], ['Triglycerides', '130 mg/dL']],
    normal: 'Your cholesterol levels are all within a healthy range. Keep up the good work.' },
};
const DR_FOLLOW = 'Please book a follow-up so we can discuss this.';

const EXTRA_STATE_DR = () => ({
  app: 'patient', saved: {}, drSigned: false, drErr: false, drId: '', drPw: '', drNoPatients: false,
  drq: { bt: 'done', sm: 'done', di: 'done', kg: 'done', rb: 'done', nt: 'with', sk: 'notarrived' },
  dp: 'as', drDraft: null, drPending: ['cbc', 'lipid'], drRep: 'cbc', drRel: null, released: {}, drNotes: {}, fuAdvice: null,
  drSet: { reports: true, checkin: true, schedule: false }, drPwErr: '',
});
{ const base = window.EXTRA_STATE; window.EXTRA_STATE = () => ({ ...base(), ...EXTRA_STATE_DR() }); }
Object.assign(S, EXTRA_STATE_DR());

// The doctor's day starts with Anisha checked in, Nabin with the doctor, and her follow-up not yet advised.
const DOCTOR_START = () => ({ app: 'doctor', screen: 'dsignin', signedIn: true, visitDay: 'checkedin', followup: null });

// ---------- shared world ----------
// Anisha's place in the queue is her own visit day on the patient side.
function drStatus(id) {
  if (id !== 'as') return S.drq[id];
  return ({ checkedin: 'waiting', turn: 'waiting', with: 'with', done: 'done' })[S.visitDay] || 'notarrived';
}
const drToday = () => Object.keys(DR_PATIENTS).filter(id => id === 'as' ? !S.careEmpty && S.appt.day === 0 : id in S.drq); // walk-ins join via staff.js
const drTime = id => id === 'as' ? S.appt.time : DR_PATIENTS[id].time;
const DR_TAG = { done: ['Done', 'neutral'], with: ['With you now', 'success'], waiting: ['Waiting', 'info'], notarrived: ['Not arrived', 'neutral'] };

// What the patient app shows for a report once the doctor has released it.
function labOf(k) {
  const l = LABS[k], r = S.released?.[k];
  return r ? { ...l, reviewing: false, tag: r.follow ? ['Needs follow-up', 'warn'] : ['Ready', 'success'], words: r.words, by: 'Reviewed by Dr. Priya Sharma on Aug 28',
    date: 'Aug 28, 2026', pages: 1, follow: r.follow } : l;
}

// ---------- pieces ----------
const drBar = (title, back = false) => `<div class="appbar dr">${back ? iconBtn('icon-back.svg', 'Back', 'back') : ''}<div class="title">${title}</div><div class="slot"></div></div>`;
function drNav(active) {
  return `<div class="bottom"><nav class="bnav" aria-label="Main">${[['Queue', 'nav-queue', 'd-tab:dqueue'], ['Reports', 'nav-reports', 'd-tab:dreports'], ['Profile', 'nav-profile', 'd-tab:dprofile']]
    .map(([l, i, a]) => `<a href="#" data-act="${a}" ${l === active ? 'aria-current="page"' : ''}><span><img src="${A}${i}${l === active ? '-active' : ''}.svg" width="24" height="24" alt=""></span>${l}</a>`).join('')}
  </nav>${homeInd()}</div>`;
}
const drScreen = (body, { nav = '', bar = '', cta = '' } = {}) => `<div class="screen dr">${statusBar()}${bar}${body}${cta}${nav ? drNav(nav) : homeInd()}</div>`;
const drRow = id => {
  const p = DR_PATIENTS[id], st = drStatus(id), [t, tone] = DR_TAG[st], past = st === 'done';
  return `<button class="list-item" data-act="d-patient:${id}"><span class="avatar">${p.ini}</span>
    <span class="dq-t"><span class="h-s ${past ? 'past' : ''}">${p.name}</span><span class="dq-r">${p.short}</span>
      <span class="dq-m"><span class="${past ? 'past' : 'now'}">${drTime(id)}</span>${tag(t, `${tone} s12`)}</span></span>${chev.replace('chevron-right', 'chevron-right-dark')}</button>`;
};
const drHead = (p, size = 'l') => `<div class="dr-head"><span class="avatar ${size === 'l' ? 'l' : ''}">${p.ini}</span><div>
  <p class="${size === 'l' ? 'dr-h1' : 'h-s'}">${p.name}</p><p class="dr-sub">${p.info}</p></div></div>`;
const drMed = m => `<div class="card dr-med"><p class="dm1">${m.name}</p><p class="dm2">${m.for}</p><p class="dm3">${m.how}</p><p class="dm4">${m.dur}</p></div>`;
const drRadio = (name, opts, cur, act) => `<div class="stack4" role="radiogroup" aria-label="${name}"><p class="dr-label" style="color:var(--text-primary)">${name}</p>
  <div class="radio-inline">${opts.map(([v, l]) => radioRow(cur === v, l, `${act}:${v}`)).join('')}</div></div>`;
const drField = (id, label, ph, err = '') => `<div class="field-wrap"><label class="label" for="${id}">${label}</label>
  <div class="field ${err ? 'err' : ''}"><input id="${id}" type="${/pw/.test(id) ? 'password' : 'text'}" placeholder="${ph}" ${id === 'd-id' ? `value="${esc(S.drId)}"` : ''}></div>${err ? support(err, 'err') : ''}</div>`;

// ---------- screens ----------
Object.assign(SCREENS, {
  // A staff ID and password — not the patient app's SMS sign-in.
  dsignin: () => drScreen(`
    <div class="body" style="justify-content:center;gap:32px;padding:0 16px 24px">
      <div style="height:40px;flex:none"></div>
      <div class="dr-brand"><p class="wordmark-s">Clinica</p><p class="dr-sub">For City Hospital's care team</p></div>
      <form id="d-form" class="fields" novalidate>
        ${drField('d-id', 'Staff ID', 'e.g. CH-0231')}
        ${drField('d-pw', 'Password', 'Password', S.drErr ? 'Staff ID or password is incorrect. Try again.' : '')}
        <a href="#" class="dr-link" data-act="stub:Forgot your password?">Forgot your password?</a>
      </form>
      <div class="stack12">${btn('Sign in', 'd-signin')}<p class="dr-body tertiary" style="width:192px;text-align:center">Trouble signing in? Call IT support.</p></div>
    </div>`),

  dqueue: () => {
    const ids = S.drNoPatients ? [] : drToday();
    if (!ids.length) return drScreen(centred(empty('qa-book.svg', 'No patients scheduled today', 'When a visit is booked with you, it appears here.', '')), { bar: drBar('Today · Aug 28'), nav: 'Queue' });
    const seen = ids.filter(id => drStatus(id) === 'done').length, withId = ids.find(id => drStatus(id) === 'with'), nextId = ids.find(id => drStatus(id) === 'waiting');
    const line = [withId && `You're with ${DR_PATIENTS[withId].name} now.`, nextId && `${DR_PATIENTS[nextId].name} is next.`].filter(Boolean).join(' ') || 'No one is waiting right now.';
    return drScreen(`<div class="body" style="gap:12px">
      <div class="inset"><div class="card notice info"><div class="text"><p class="h-s">${seen} of ${ids.length} seen today</p><p class="dr-body">${line}</p></div></div></div>
      <div class="inset"><p class="dr-label">Patients</p></div>
      <div class="list">${ids.map(drRow).join('<div class="sep" aria-hidden="true"></div>')}</div>
    </div>`, { bar: drBar('Today · Aug 28'), nav: 'Queue' });
  },

  // Quick to scan: who, why today, and the one action. History is a tap away rather than inline.
  dpatient: () => {
    const p = DR_PATIENTS[S.dp], st = drStatus(S.dp);
    return drScreen(`<div class="body" style="gap:24px">
      <div class="inset">${drHead(p)}</div>
      <div class="inset stack6"><p class="dr-label">Today's visit</p>
        <div class="dr-reason"><p class="dr-label tertiary">Reason for visit</p><p class="dr-l">${p.reason}</p><p class="dr-body">${drTime(S.dp)} · General medicine · OPD 2</p></div></div>
      <div class="inset"><button class="list-item" data-act="go:dhistory">${lead('lt-history.svg')}
        <span class="text"><span class="item-title">View history</span><span class="dr-body">${p.hist}</span></span>${chev.replace('chevron-right', 'chevron-right-dark')}</button></div>
      <div style="height:20px;flex:none"></div>
      <div class="inset">${st === 'done' ? tag('Visit complete', 'neutral s12') : st === 'notarrived' ? tag('Not arrived', 'warn s12') : btn('Start visit', 'd-start')}</div>
    </div>`, { bar: drBar('', true) });
  },

  dhistory: () => {
    const p = DR_PATIENTS[S.dp], rows = DR_HISTORY[S.dp] || p.hist.split(', ').map(d => [`${d}, 2026`, 'Dr. Priya Sharma · General medicine']);
    return drScreen(`<div class="body" style="gap:24px">
      <div class="inset">${drHead(p)}</div>
      <div class="inset stack4"><p class="sec-label lh20">Every visit</p>
        <div class="mt-list">${rows.map(([d, s]) => row('lt-history.svg', d, s)).join('<div class="sep" aria-hidden="true"></div>')}</div></div>
    </div>`, { bar: drBar('Visit history', true) });
  },

  // Writing the note and prescribing — the wording the patient later reads in her own Health tab.
  dvisit: () => {
    const p = DR_PATIENTS[S.dp], d = S.drDraft;
    return drScreen(`<div class="body" style="gap:24px;padding-bottom:36px">
      <div class="inset">${drHead(p, 's').replace('dr-sub', 'dr-body')
        .replace(p.info, `Today's visit · ${drTime(S.dp)}`)}</div>
      <div class="inset"><div class="field-wrap"><label class="dr-label" for="d-note">Doctor's note</label>
        <div class="field textarea"><textarea id="d-note">${esc(d.note)}</textarea></div></div></div>
      <div class="inset stack12"><p class="dr-label">Medicines</p>${d.meds.map(drMed).join('')}
        <button class="btn secondary l" data-act="stub:Add another medicine">Add another medicine</button></div>
      <div class="inset">${drRadio('Follow-up', [['none', 'No follow-up'], ['2w', 'In 2 weeks'], ['other', 'Other date']], d.follow, 'd-follow')}</div>
      <div style="height:20px;flex:none"></div>
      <div class="inset">${btn('Complete visit', 'd-complete')}</div>
    </div>`, { bar: drBar('Complete visit', true) });
  },

  dreports: () => {
    const ids = S.drPending;
    if (!ids.length) return drScreen(centred(empty('icon-check-circle-secondary-28.svg', 'Nothing waiting on you', 'Reports you need to release will show up here.', '<div style="height:104px"></div>')), { bar: drBar('Reports to release'), nav: 'Reports' });
    return drScreen(`<div class="body" style="gap:12px">
      <div class="inset"><div class="card notice info"><div class="text"><p class="h-s">${ids.length} ${ids.length === 1 ? 'result is' : 'results are'} waiting on you</p>
        <p class="dr-body">Patients can't see a report until you release it, with your own comment.</p></div></div></div>
      <div class="inset"><p class="dr-label">Pending</p></div>
      <div class="list">${ids.map(k => { const r = DR_REPORTS[k], p = DR_PATIENTS[r.pid];
        return `<button class="list-item" data-act="d-report:${k}"><span class="avatar">${p.ini}</span>
          <span class="dq-t"><span class="h-s">${p.name}</span><span class="dq-r">${r.test}</span><span class="dq-m"><span class="now">${r.date}</span>${tag('Needs review', 'warn s12')}</span></span>
          ${chev.replace('chevron-right', 'chevron-right-dark')}</button>`; }).join('<div class="sep" aria-hidden="true"></div>')}</div>
    </div>`, { bar: drBar('Reports to release'), nav: 'Reports' });
  },

  // Raw values, a release decision and a comment — the values themselves never reach the patient app.
  dreport: () => {
    const r = DR_REPORTS[S.drRep], p = DR_PATIENTS[r.pid], rel = S.drRel, follow = rel.choice === 'follow';
    return drScreen(`<div class="body" style="gap:24px;padding-bottom:36px">
      <div class="inset"><div class="dr-head"><span class="avatar">${p.ini}</span><div><p class="h-s">${p.name}</p><p class="dr-body">${r.test} · ${r.date} · City Hospital lab</p></div></div></div>
      <div class="inset stack6"><p class="dr-label">Result</p>
        <div class="dr-values">${r.rows.map(([n, v]) => `<div class="dv-row"><span>${n}</span><span class="dv-v"><b>${v}</b><span class="dv-f">Normal</span></span></div>`).join('<div class="mt-sep" aria-hidden="true"></div>')}</div>
        <p class="dr-body tertiary">Reference ranges only — patients never see raw values like these, only what you tell them.</p></div>
      <div class="inset">${drRadio('What should the patient see?', [['normal', 'Everything is normal'], ['follow', 'I need to see them again']], rel.choice, 'd-choice')}</div>
      ${follow ? `<div class="inset"><p class="dr-body tertiary">Releasing this shows ${r.first} the same “asked to see you” card and Book follow-up action already built on her side.</p></div>` : ''}
      <div class="inset"><div class="field-wrap"><label class="dr-label" for="d-comment">Comment for ${r.first}</label>
        <div class="field textarea"><textarea id="d-comment">${esc(rel.comment)}</textarea></div></div></div>
      <div style="height:20px;flex:none"></div>
      <div class="inset">${btn(follow ? 'Release with follow-up request' : `Release to ${r.first}`, 'd-release')}</div>
    </div>`, { bar: drBar('Review report', true) });
  },

  dprofile: () => drScreen(`<div class="body" style="gap:24px">
      <div class="inset"><div class="dr-me"><span class="avatar l">PS</span><p class="dr-h1">Dr. Priya Sharma</p><p class="dr-sub">General medicine · City Hospital</p></div></div>
      <div class="inset stack4"><p class="dr-label">Your details</p><div class="mt-list">${row('lt-document.svg', 'NMC registration', '12345')}<div class="sep" aria-hidden="true"></div>${row('lt-hospital.svg', 'Department', 'General medicine, OPD 2')}</div></div>
      <div class="inset stack4"><p class="dr-label">Account</p><div class="mt-list">${listItem('lt-lock.svg', 'Change password', 'Last changed 3 months ago', 'd-settings:pw')}<div class="sep" aria-hidden="true"></div>${listItem('lt-bell.svg', 'Notifications', 'New reports and check-ins', 'd-settings:notif')}</div></div>
      <div style="height:20px;flex:none"></div>
      <div class="inset"><button class="btn secondary" data-act="d-signout">Sign out</button></div>
    </div>`, { bar: drBar('Profile'), nav: 'Profile' }),

  // Both settings on one screen; Profile's two rows land with the right section in view.
  dsettings: () => drScreen(`<div class="body" style="gap:24px;padding:16px 0 36px">
      <div class="inset stack24" id="d-pw-sec"><p class="dr-h1">Change password</p>
        <form id="d-pwform" class="fields" novalidate>${drField('d-pw0', 'Current password', 'Password')}${drField('d-pw1', 'New password', 'At least 8 characters', S.drPwErr === 'short' ? 'Use at least 8 characters.' : '')}
          ${drField('d-pw2', 'Confirm new password', 'Re-enter new password', S.drPwErr === 'match' ? "The new passwords don't match." : '')}</form>
        ${S.drPwErr === 'saved' ? support('Password changed.', '', 'icon-check-circle-success-20.svg') : ''}${btn('Save password', 'd-pwsave')}</div>
      <div class="inset stack8" id="d-notif-sec"><p class="dr-h1">Notifications</p>
        <div class="mt-list">${[['reports', 'New reports', 'When a lab result needs your review'], ['checkin', 'Patients checking in', 'When someone on your list arrives'], ['schedule', 'Schedule changes', 'Cancellations and new bookings']]
          .map(([k, t, b]) => setting(t, b, S.drSet[k], `d-set:${k}`)).join('<div class="sep" aria-hidden="true"></div>')}</div></div>
    </div>`, { bar: drBar('Account settings', true) }),
});

// ---------- behaviour ----------
Object.assign(mount, {
  dsignin: () => {
    const id = document.getElementById('d-id'), pw = document.getElementById('d-pw');
    id.oninput = () => { S.drId = id.value; }; pw.oninput = () => { S.drPw = pw.value; };
    document.getElementById('d-form').onsubmit = e => { e.preventDefault(); ACTIONS['d-signin'](); };
    pw.onkeydown = e => { if (e.key === 'Enter') ACTIONS['d-signin'](); };
  },
  dvisit: () => { const n = document.getElementById('d-note'); n.oninput = () => { S.drDraft.note = n.value; }; },
  dreport: () => { const c = document.getElementById('d-comment'); c.oninput = () => { S.drRel.comment = c.value; S.drRel.edited = true; }; },
  dsettings: () => { if (S.drSec) { document.getElementById(S.drSec === 'notif' ? 'd-notif-sec' : 'd-pw-sec').scrollIntoView({ block: 'start' }); S.drSec = null; } },
});

Object.assign(ACTIONS, {
  'd-signin': () => { // demo: staff ID CH-0231, password clinica
    if (S.drId.trim().toUpperCase() !== 'CH-0231' || S.drPw !== 'clinica') { S.drErr = true; S.drPw = ''; return render(); }
    Object.assign(S, { drSigned: true, drErr: false, drPw: '', stack: [], screen: 'dqueue' }); render();
  },
  'd-tab': arg => { Object.assign(S, { stack: [], sheet: null, screen: arg }); render(); },
  'd-patient': id => { S.dp = id; go('dpatient'); },
  'd-start': () => { // the doctor moves on: whoever was with them is done, and this patient is with them now
    for (const id of drToday()) if (drStatus(id) === 'with' && id !== S.dp) { if (id === 'as') S.visitDay = 'done'; else S.drq[id] = 'done'; }
    if (S.dp === 'as') S.visitDay = 'with'; else S.drq[S.dp] = 'with';
    const d = DR_DRAFTS[S.dp] || { note: '', meds: [], follow: 'none' };
    S.drDraft = { note: S.drNotes[S.dp] || d.note, meds: d.meds, follow: d.follow };
    go('dvisit', { replace: true });
  },
  'd-follow': v => { S.drDraft.follow = v; rerender(); },
  'd-complete': () => {
    if (S.dp === 'as') { // what Anisha now sees: her visit complete, these notes, and this follow-up advice
      Object.assign(S, { visitDay: 'done', fuAdvice: S.drDraft.follow });
      S.notifs.unshift({ g: 'Today', icon: 'lt-document.svg', t: 'Your visit notes are ready', b: 'Open Health to read them.', when: 'Just now', go: 'hvisit' });
    } else S.drq[S.dp] = 'done';
    S.drNotes[S.dp] = S.drDraft.note;
    Object.assign(S, { stack: [], screen: 'dqueue' }); render();
  },
  'd-report': k => { S.drRep = k; S.drRel = { choice: 'normal', comment: DR_REPORTS[k].normal, edited: false }; go('dreport'); },
  'd-choice': v => { // the comment follows the choice until the doctor writes their own
    const r = DR_REPORTS[S.drRep]; S.drRel.choice = v;
    if (!S.drRel.edited) S.drRel.comment = v === 'follow' ? DR_FOLLOW : r.normal;
    rerender();
  },
  'd-release': () => {
    const k = S.drRep, follow = S.drRel.choice === 'follow';
    S.drPending = S.drPending.filter(x => x !== k);
    if (k === 'cbc') { // Anisha's CBC: now released, with this comment, on her side
      S.released = { ...S.released, cbc: { follow, words: S.drRel.comment.trim() || DR_REPORTS.cbc.normal } };
      S.notifs.unshift({ g: 'Today', icon: 'lt-lab.svg', t: 'A lab report is ready', b: 'Open Health to see it.', when: 'Just now', go: 'hreport-cbc' });
    }
    backTo('dreports');
  },
  'd-settings': sec => { S.drSec = sec; S.drPwErr = ''; go('dsettings'); },
  'd-set': k => { S.drSet[k] = !S.drSet[k]; rerender(); },
  'd-pwsave': () => {
    const v = id => document.getElementById(id).value;
    S.drPwErr = v('d-pw1').length < 8 ? 'short' : v('d-pw1') !== v('d-pw2') ? 'match' : 'saved';
    rerender();
  },
  'd-signout': () => { Object.assign(S, { drSigned: false, drId: '', drPw: '', drErr: false, stack: [], screen: 'dsignin' }); render(); },
});

// One world, two phones: switching keeps everything, and each phone stays where it was.
function showApp(app) {
  if (app === S.app) return;
  S.saved[S.app] = { screen: S.screen, stack: [...S.stack] };
  S.app = app;
  const back = S.saved[app] || { patient: { screen: S.signedIn ? 'home' : 'splash', stack: [] }, doctor: { screen: S.drSigned ? 'dqueue' : 'dsignin', stack: [] },
    desk: { screen: S.drSigned ? 'kqueue' : 'ksignin', stack: [] }, staff: { screen: S.stMe ? stHome() : 'ssignin', stack: [] } }[app];
  Object.assign(S, { screen: back.screen, stack: back.stack, sheet: null, picker: null, bio: null, stMenu: null });
  render();
}
const switchPhone = () => showApp(S.app === 'patient' ? 'doctor' : 'patient');

Object.assign(NUM, {
  dsignin: s => s.drErr ? 'D01b' : 'D01',
  dqueue: s => s.drNoPatients || !drToday().length ? 'D02b' : 'D02',
  dpatient: s => s.dp === 'as' && drStatus('as') !== 'done' ? 'D03' : s.dp === 'nt' && drStatus('nt') !== 'done' ? 'D03c'
    : drStatus(s.dp) === 'done' ? 'D03d' : drStatus(s.dp) === 'notarrived' ? 'D03e' : 'D03',
  dhistory: () => 'D03b', dvisit: s => s.dp === 'nt' ? 'D04b' : 'D04',
  dreports: s => s.drPending.length ? 'D05' : 'D05b', dreport: s => s.drRep === 'lipid' ? 'D06c' : s.drRel.choice === 'follow' ? 'D06b' : 'D06',
  dprofile: () => 'D07', dsettings: () => 'D07b',
});

const DW = (x = {}) => () => ({ ...DOCTOR_START(), drSigned: true, ...x });
FLOW.push(['Doctor app', [
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
]]);
