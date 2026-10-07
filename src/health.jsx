// Clinica — Health tab: lock and PIN, visits, prescriptions, reports, medicines.
// Figma: zw3saW6ot26E6gWH20K3ux, section 539:16334. Plugs into core.jsx (SCREENS, mount, ACTIONS, FLOW, NUM)
// and reuses pieces from booking.jsx (bar, label, tag, rows, callBtn, backTo).
import { appBar, btn, digits, empty, heading, homeInd, listItem, masked, mmss, start, statusBar, support } from './app.jsx';
import { acts, answer, ask, resolveAskLock, src, words } from './ask.jsx';
import { backTo, bar, callBtn, label, navBar, offLine, row, rows, tag, when } from './booking.jsx';
import { csheet, notice, pinOf, switchTo } from './care.jsx';
import { A, ACTIONS, FLOW, NUM, ORDER, OVERLAY, S, SCREENS, after, back, every, extraState, go, mount, onLeave, paint, render, reset, sepJoin } from './core.jsx';
import { labOf } from './doctor.jsx';
import { med, ring } from './meds.jsx';
import { openSys } from './more.jsx';
import { img, now, person, results } from './staff.jsx';

export const RX = [
  { name: 'Paracetamol 500 mg', for: 'For fever and headache', how: '1 tablet 3 times a day, after food', dur: 'For 5 days, until Sep 2',
    form: 'Tablet — 1, 3 times a day, after food', disp: '5 days · Dispense 15 tablets' },
  { name: 'Cetirizine 10 mg', for: 'For the runny nose', how: '1 tablet at night', dur: 'For 5 days, until Sep 2',
    form: 'Tablet — 1 at night', disp: '5 days · Dispense 5 tablets' },
];

export const RX2 = [{ name: 'Amoxicillin 500 mg', for: 'For the ear infection', how: '1 capsule 3 times a day', dur: 'For 7 days, finished Aug 19' }];
// Lab reports reach the patient only once a doctor has looked at them.
export const LABS = {
  hba1c: { title: 'HbA1c blood test', sub: 'Sep 2, City Hospital lab', month: 'September 2026', date: 'Sep 2, 2026', tag: ['Needs follow-up', 'warn'], pages: 1, follow: true,
    words: 'Your blood sugar is higher than it should be. Please book a follow-up so we can talk about what to do next.', by: 'Reviewed by Dr. Priya Sharma on Sep 4' },
  cbc: { title: 'CBC blood test', sub: 'Aug 28, City Hospital lab', month: 'August 2026', tag: ['Being reviewed', 'neutral'], reviewing: true },
  thyroid: { title: 'Thyroid panel', sub: 'Jul 3, City Hospital lab', month: 'July 2026', date: 'Jul 3, 2026', tag: ['Ready', 'success'], pages: 2,
    words: 'Your thyroid levels are normal. No change to your treatment.', by: 'Reviewed by Dr. Anita Joshi on Jul 5' },
};
export const VISITS = {
  aug28: { title: 'Visit on Aug 28', doc: ['PS', 'Dr. Priya Sharma', 'Aug 28, 4:30 PM', 'General medicine, OPD 2'], rx: 'aug28',
    words: 'A viral infection. Rest, drink plenty of fluids, and take paracetamol for the fever. Come back if the fever lasts more than 3 days.' },
  aug12: { title: 'Visit on Aug 12', doc: ['RS', 'Dr. Ramesh Shrestha', 'Aug 12, 11:00 AM', 'General medicine, OPD 3'], rx: 'aug12',
    words: "An ear infection. Take all of the amoxicillin, even once it feels better. Come back if the pain gets worse or there's discharge." },
};
export const PRESCRIPTIONS = {
  aug28: { doc: ['PS', 'Dr. Priya Sharma', 'Prescribed Aug 28', 'General medicine, OPD 2'], meds: RX, note: 'Finish the whole course, even if you feel better sooner.' },
  aug12: { doc: ['RS', 'Dr. Ramesh Shrestha', 'Prescribed Aug 12', 'General medicine, OPD 3'], meds: RX2, note: 'Take all of it, even once it feels better.', finished: 'Aug 19' },
};

extraState(() => ({
  unlocked: false, afterUnlock: null, healthEmpty: false, lockWhy: null, fingerChanged: false, pinChanged: false,
  labs: ['hba1c', 'cbc', 'thyroid'], report: 'thyroid', visit: 'aug28', rx: 'aug28', rxNone: false,
  pin: null, pinEntry: '', pinFirst: '', pinErr: false, pinMismatch: false, pinTries: 5, pinWait: 30,
  finger: null, bio: null, bioFails: 0, sheet: null, codeFor: null,
  meds: [ // the Medicines tracker's data (meds.jsx)
    { title: 'Paracetamol 500 mg', name: 'Paracetamol', strength: '500 mg', form: 'Tablet', generic: 'Acetaminophen tablets', each: '1 tablet', often: 'Twice a day',
      sched: 'Twice daily', sub: '1 tablet, twice a day', left: 6, total: 20, unit: 'tablets', perDay: 2, since: '3 weeks' },
    { title: 'Metformin 500 mg', name: 'Metformin', strength: '500 mg', form: 'Tablet', generic: 'Metformin hydrochloride tablets', each: '1 tablet', often: 'After breakfast',
      sched: 'Once daily', sub: '1 tablet, after breakfast', left: 28, total: 36, unit: 'tablets', perDay: 1, since: '2 months' },
    { title: 'Cetirizine 10 mg (syrup)', name: 'Cetirizine', strength: '10 mg', form: 'Syrup', generic: 'Cetirizine hydrochloride syrup', each: '5 ml', often: 'At night',
      sched: 'At night', sub: '5 ml, at night', left: 40, total: 50, unit: 'ml', perDay: 5, since: '1 week' },
  ],
  mform: {}, mErr: {},
}), ORDER.health);

// ---------- pieces ----------
export const lbl = t => <p className="sec-label lh20">{t}</p>;
export const chev = <img src={`${A}icon-chevron-right.svg`} width="20" height="20" alt="" />;
export const lead = icon => <span className="lead-tile"><img src={`${A}${icon}`} width="20" height="20" alt="" /></span>;
export const list = items => <div className="list">{sepJoin(items)}</div>;

// Content/Medicine: what it is, what it is FOR, how to take it, for how long.
export const medText = m => <span className="med-t"><span className="m1">{m.name}</span><span className="m2">{m.for}</span><span className="m3">{m.how}</span><span className="m4">{m.dur}</span></span>;
export const medRow = (m, act) => act
  ? <button className="list-item" data-act={act}>{lead('lt-rx.svg')}{medText(m)}{chev}</button>
  : <div className="list-item static">{lead('lt-rx.svg')}{medText(m)}</div>;

export const docCard = (ini, name, l2, l3) => <div className="card appt">
  <span className="avatar l">{ini}</span>
  <span className="appt-t"><span className="h-s">{name}</span><span className="when">{l2}</span><span className="where">{l3}</span></span></div>;

export const reportRow = (title, sub, status, act) => <button className="list-item" data-act={act}>{lead('lt-lab.svg')}
  <span className="report-t"><span className="text"><span className="h-s">{title}</span><span className="body-s">{sub}</span></span>{status}</span>{chev}</button>;

export const centred = inner => <div className="body" style={{ justifyContent: 'center' }}>{inner}</div>;

// ---------- PIN ----------
export const pinDots = (n, err) => <div className="pin-dots" role="img" aria-label={err ? 'PIN did not match' : `${n} of 4 digits entered`}>
  {[0, 1, 2, 3].map(i => <span key={i} className={`dot ${err ? 'err' : i < n ? 'on' : ''}`}></span>)}</div>;
export const keypad = () => <div className="inset"><div className="keypad" aria-label="PIN keypad">
  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(d => <button key={d} className="key" data-act={`pin-digit:${d}`}>{d}</button>)}
  <span className="key blank"></span><button className="key" data-act="pin-digit:0">0</button>
  <button className="key" data-act="pin-del" aria-label="Delete"><img src={`${A}icon-backspace.svg`} width="24" height="24" alt="" /></button>
</div></div>;
export const MISMATCH = "Those PINs didn't match. Choose one again.";
export const errLine = msg => <div style={{ width: 240 }}>{support(msg, 'err', 'icon-error.svg')}</div>;

export function pinScreen(title, sub, below = null) {
  const err = (S.screen === 'pin' || S.screen === 'pfpin') && S.pinErr;
  return (
  <div className="screen">
    {statusBar()}{appBar()}
    <div className="body" style={{ overflow: 'hidden' }}>
      {S.fingerChanged && S.screen === 'pin' ? <div className="inset">{notice('warn', 'Fingerprint unlock is off', 'A new fingerprint was added to this phone. For your safety, enter your PIN.')}</div> : null}
      {heading(title, sub)}
      <div className="entry">{pinDots(S.pinEntry.length, err)}{below}</div>
      <div style={{ flex: 1 }}></div>
      {keypad()}
    </div>
    {homeInd()}
  </div>);
}

// Bottom sheet — one decision; the scrim means the safe choice.
export const resetSheet = () => <>
  <div className="scrim" data-act="sheet-close"></div>
  <div className="csheet" role="dialog" aria-modal="true" aria-labelledby="cs-t">
    <span className="handle"></span>
    <div className="cs-text"><h2 className="cs-t" id="cs-t">Reset your PIN</h2>
      <p className="lede">We'll text a code to {masked()}. If others read this phone's messages, reset at reception instead — bring your ID.</p></div>
    <div className="cs-acts">{btn('Send code', 'reset-send')}{btn('Reset at reception', 'sheet-close', { kind: 'secondary' })}</div>
  </div><div className="sheet-home"></div></>;
OVERLAY.reset = resetSheet;

// System biometric prompt — a stand-in for the OS sheet. 'Use PIN instead' is always there.
export const bioSheet = () => {
  const fail = S.bio === 'fail';
  return <>
  <div className="scrim" data-act="bio-cancel"></div>
  <div className="bio-sheet" role="dialog" aria-modal="true" aria-labelledby="bio-t">
    <p className="cs-t" id="bio-t">Unlock your health records</p>
    <p className="body-s">Clinica</p>
    <button className={`sensor ${fail ? 'err' : ''}`} data-act="bio-touch" aria-label="Fingerprint sensor">
      <img src={`${A}icon-fingerprint-40${fail ? '-error' : ''}.svg`} width="40" height="40" alt="" /></button>
    <p className={fail ? 'bio-err' : 'body-s'} role="status">{fail ? 'Not recognised. Try again.' : 'Touch the fingerprint sensor'}</p>
    <button className="btn secondary" data-act="bio-pin">Use PIN instead</button>
  </div><div className="sheet-home"></div></>;
};

// ---------- medicines ----------
export const lowStock = m => m.left / m.perDay <= 3;
export const firstNum = s => +(/(\d+)/.exec(s || '') || [])[1] || 0;
export function perDayOf(often, each) {
  const o = (often || '').toLowerCase();
  const times = /(\d+)\s*times/.exec(o)?.[1] || (/twice/.test(o) ? 2 : /three/.test(o) ? 3 : 1);
  return +times * (firstNum(each) || 1);
}

export function field(key, labelText, ph) {
  const err = S.mErr[key];
  return <div key={key} className="field-wrap">
    <label className="label" htmlFor={`mf-${key}`}>{labelText}</label>
    <div className={`field ${err ? 'err' : ''}`}><input id={`mf-${key}`} data-f={key} placeholder={ph} value={S.mform[key] || ''}
      onChange={e => { S.mform[key] = e.target.value; delete S.mErr[key]; paint(); }} /></div>
    {err ? support(err, 'err') : null}
  </div>;
}
// ---------- screens ----------
Object.assign(SCREENS, {
  // 01 / 15 / 16 — the lock, with the biometric prompt on top when fingerprint is on
  hlocked: () => (
    <div className="screen">
      {statusBar()}{bar({ back: false, title: 'Health' })}
      {centred(empty('icon-lock.svg', 'Your health records are locked', {
        report: 'Unlock to see your new lab report. This phone may be shared, so your records stay locked until you enter your Clinica PIN.',
        left: 'Locked because you left Clinica. On a shared phone, your records lock when you leave the app, or after 5 minutes without use.',
      }[S.lockWhy] || 'This phone may be shared, so your visits and prescriptions stay locked until you unlock them with your Clinica PIN.',
        btn('Unlock', 'unlock-start', { size: 'l' })))}
      {navBar('Health')}
      {S.bio ? bioSheet() : null}
    </div>),

  health: () => (
    <div className="screen">
      {statusBar()}{bar({ back: false, title: 'Health' })}{offLine()}
      <div className="body g20">
        <div className="stack8">
          <div className="inset">{lbl('Taking now')}</div>
          <div className="inset"><button className="card med-card" data-act="go:hrxd">{lead('lt-rx.svg')}{medText(RX[0])}{chev}</button></div>
        </div>
        <div>
          <div className="inset">{lbl('Your records')}</div>
          {list([
            listItem('lt-followup.svg', 'Visit history', 'Last visit Aug 28, General medicine', 'go:hvisits'),
            listItem('lt-rx.svg', 'Prescriptions', '2 medicines to take now', 'go:hrx'),
            S.offline ? null : listItem('lt-rx.svg', 'Medicines', (n => n ? `${n} running low` : 'All stocked up')(S.meds.filter(lowStock).length), 'go:mtlist'), // stock needs a live count
            listItem('lt-lab.svg', 'Lab reports', (r => [r.filter(k => !labOf(k).reviewing).length && `${r.filter(k => !labOf(k).reviewing).length} ready`,
              r.filter(k => labOf(k).reviewing).length && `${r.filter(k => labOf(k).reviewing).length} being reviewed`].filter(Boolean).join(', ') || 'None yet')(S.labs), 'go:hlabs'),
            listItem('lt-clipboard.svg', 'Follow-ups', '1 due around Sep 11', 'go:hfollow'),
          ].filter(Boolean))}
        </div>
      </div>
      {navBar('Health')}
    </div>),

  hempty: () => (
    <div className="screen">
      {statusBar()}{bar({ back: false, title: 'Health' })}
      {centred(empty('qa-book.svg', 'Nothing here yet',
        'After your first visit, what your doctor tells you, your prescriptions and your reports will appear here.',
        btn('Book a visit', 'go:finddoctor', { size: 'l' })))}
      {navBar('Health')}
    </div>),

  hvisits: () => {
    const row = (title, sub, act) => listItem('lt-followup.svg', title, sub, act);
    return (
    <div className="screen">
      {statusBar()}{bar({ title: 'Visit history' })}
      <div className="body" style={{ gap: 12 }}>
        <div><div className="inset">{lbl('August 2026')}</div>{list([row('General medicine', 'Aug 28, Dr. Priya Sharma', 'visit:aug28'), row('General medicine', 'Aug 12, Dr. Ramesh Shrestha', 'visit:aug12')])}</div>
        <div><div className="inset">{lbl('July 2026')}</div>{list([row('Dermatology', 'Jul 3, Dr. Anita Joshi', 'stub:Visit on Jul 3')])}</div>
        <div><div className="inset">{lbl('June 2026')}</div>{list([row('General medicine, walk-in', 'Jun 20, Dr. Anita Joshi', 'stub:Visit on Jun 20')])}</div>
      </div>
      {homeInd()}
    </div>);
  },

  hvisit: () => {
    const v = VISITS[S.visit];
    return (
    <div className="screen">
      {statusBar()}{bar({ title: v.title })}
      <div className="body g20">
        <div className="inset">{docCard(...v.doc)}</div>
        <div className="inset stack8">{lbl('What your doctor told you')}<p className="note-body">{S.visit === 'aug28' && S.drNotes?.as || v.words}</p></div>
        <div className="stack8"><div className="inset">{lbl('Prescribed')}</div>{list(PRESCRIPTIONS[v.rx].meds.map(m => medRow(m, `rx:${v.rx}`)))}</div>
        <div className="inset stack8">{lbl('Next step')}
          {S.visit === 'aug28' && S.fuAdvice !== 'none' ? <div className="card notice"><div className="text"><p className="h-s">Follow-up in 2 weeks</p>
            <p className="body-s">Around Sep 11. Book now to get a time that suits you.</p></div>
            {btn('Book follow-up', 'doctor:ps', { size: 'l' })}</div>
          : notice('', 'No follow-up needed', 'Come back only if it gets worse.')}</div>
      </div>
      {homeInd()}
    </div>);
  },

  // Each follow-up says which visit asked for it, and leads to booking.
  hfollow: () => (
    <div className="screen">
      {statusBar()}{bar({ title: 'Follow-ups' })}
      <div className="body g20"><div><div className="inset">{lbl('Due')}</div>{list([
        listItem('lt-calendar.svg', 'General medicine', S.followup ? `Booked for ${S.followup.day}, ${S.followup.time} · asked for at your Aug 28 visit` : 'Around Sep 11 · asked for at your Aug 28 visit', S.followup ? 'appt:fu' : 'doctor:ps'),
        listItem('lt-calendar.svg', 'Dermatology', 'Sep 14 · asked for at your Jul 3 visit', 'find-spec:Dermatology')])}</div></div>
      {homeInd()}
    </div>),

  hrx: () => (
    <div className="screen">
      {statusBar()}{bar({ title: 'Prescriptions' })}
      <div className="body g20" style={S.rxNone ? { justifyContent: 'center' } : undefined}>
        {S.rxNone ? empty('qa-rx.svg', 'No prescriptions yet', 'When a doctor prescribes medicine, it appears here with how to take it.', <div style={{ height: 104 }}></div>) : <>
        <div><div className="inset">{lbl('Taking now')}</div>{list(RX.map(m => medRow(m)))}</div>
        <div><div className="inset">{lbl('All prescriptions')}</div>{list([
          listItem('lt-document.svg', 'Dr. Priya Sharma, Aug 28', '2 medicines', 'rx:aug28'),
          listItem('lt-document.svg', 'Dr. Ramesh Shrestha, Aug 12', '1 medicine, finished', 'rx:aug12')])}</div></>}
      </div>
      {homeInd()}
    </div>),

  hrxd: () => {
    const r = PRESCRIPTIONS[S.rx];
    return (
    <div className="screen">
      {statusBar()}{bar({ title: 'Prescription' })}
      <div className="body g20">
        <div className="inset">{docCard(...r.doc)}</div>
        <div><div className="inset">{lbl('Medicines')}</div>{list(r.meds.map(m => medRow(m)))}</div>
        <div className="inset stack8">{lbl("Doctor's note")}<p className="note-body">{r.note}</p></div>
      </div>
      <div className="cta">{r.finished // a finished course isn't handed over at a counter
        ? <p className="body-s">This course finished on {r.finished}.</p> : <button className="btn secondary" data-act="go:hpharm">Show to pharmacist</button>}</div>
      {homeInd()}
    </div>);
  },

  // 07 — read across a counter: 24 and 20px, all in primary ink, and no purpose line.
  hpharm: () => (
    <div className="screen">
      {statusBar()}{bar({ title: 'Show to pharmacist' })}
      <div className="body g20" style={{ padding: '8px 16px 16px' }}>
        <div className="pharm-who"><p className="pw-name">{S.fullName}, age 32</p><p>Prescribed by Dr. Priya Sharma</p><p>NMC reg. no. 12345</p><p>City Hospital, Aug 28, 2026</p></div>
        <div className="rx-list">{RX.map(m => <div key={m.name} className="rx-line"><p className="rx-n">{m.name}</p><p className="rx-d">{m.form}</p><p className="rx-q">{m.disp}</p></div>)}</div>
        <div className="stack6"><p className="rx-ref">Prescription no. RX-0828-4821</p><p className="body-s">This screen stays on while it's open.</p></div>
      </div>
      <div className="cta"><button className="btn secondary" data-act="back">Done</button></div>
      {homeInd()}
    </div>),

  hlabs: () => {
    const months = [...new Set(S.labs.map(k => LABS[k].month))];
    return (
    <div className="screen">
      {statusBar()}{bar({ title: 'Lab reports' })}
      <div className="body g20" style={S.labs.length ? undefined : { justifyContent: 'center' }}>
        {S.labs.length ? months.map(mo => <div key={mo}><div className="inset">{lbl(mo)}</div>{sepJoin(S.labs.filter(k => LABS[k].month === mo).map(k => {
          const l = labOf(k); // released by the doctor (doctor.jsx), or still being reviewed
          return reportRow(l.title, l.sub, tag(...l.tag), l.reviewing ? 'go:hreviewing' : `report:${k}`);
        }))}</div>)
        : empty('qa-lab.svg', 'No lab reports yet', "When your doctor orders a test, the report appears here once they've looked at it.", <div style={{ height: 104 }}></div>)}
      </div>
      {homeInd()}
    </div>);
  },

  hreport: () => {
    const l = labOf(S.report);
    return (
    <div className="screen">
      {statusBar()}{bar({ title: l.title })}
      <div className="body g20">
        <div className="inset"><div className="card">{lead('lt-lab.svg')}<span className="text"><span className="item-title">{l.title}</span><span className="body-s">{l.sub}</span></span></div></div>
        <div className="inset stack8">{lbl('What your doctor says')}
          <p className="note-body">{l.words}</p>
          <p className="body-s tertiary">{l.by}</p></div>
        {l.follow ? <div className="inset">{notice('warn', 'Dr. Sharma asked to see you', 'Book a follow-up to talk about this report.', btn('Book follow-up', 'doctor:ps', { size: 'l' }))}</div> : null}
        <div className="inset stack8">{lbl('Report')}
          <button className="card neutral" data-act="go:hfile">{lead('lt-document.svg')}<span className="text"><span className="item-title">{l.title} report</span><span className="body-s">PDF, {l.pages} page{l.pages > 1 ? 's' : ''}</span></span>{chev}</button></div>
      </div>
      <div className="cta"><button className="btn secondary" data-act="report-dl"><img src={`${A}icon-download.svg`} width="24" height="24" alt="" />Download report</button></div>
      {homeInd()}
    </div>);
  },

  // The lab's own document; results stand in as bars.
  hfile: () => {
    const l = labOf(S.report);
    return (
    <div className="screen">
      {statusBar()}{bar({ title: `${l.title} report` })}
      <div className="doc-view">
        <div className="doc-page" role="img" aria-label={`${l.title} report from City Hospital Laboratory, page 1`}>
          <p className="dp-lab">City Hospital Laboratory</p><p className="body-s tertiary">Maharajgunj, Kathmandu</p>
          <p className="dp-test">{l.title} · {l.date}</p><p className="body-s">Patient: {S.fullName} · CH-2381</p>
          {[280, 280, 160, 280, 280, 160, 280].map((w, i) => <span key={i} className="dp-bar" style={{ width: w }}></span>)}
        </div>
        <p className="body-s">Page 1 of 1</p>
      </div>
      <div className="cta"><button className="btn secondary" data-act="report-dl"><img src={`${A}icon-download.svg`} width="24" height="24" alt="" />Download report</button></div>
      {homeInd()}
    </div>);
  },

  hreviewing: () => (
    <div className="screen">
      {statusBar()}{bar({ title: 'CBC blood test' })}
      {centred(empty('qa-lab.svg', 'Your doctor is reviewing this report',
        "Results reach you once Dr. Priya Sharma has looked at them, so they come with an explanation. We'll message you when it's ready. Feeling worse? Don't wait for it — call the clinic.",
        callBtn('l')))}
      {homeInd()}
    </div>),

  pincreate: () => pinScreen('Choose a PIN for your health records', "Your phone's own PIN may be known to others who use it. This one is only yours.",
    S.pinMismatch ? errLine(MISMATCH) : null),
  pinconfirm: () => pinScreen('Enter it again', "So we know it's right."),
  pin: () => pinScreen(...({ pinnew: ['Enter your current PIN', "So we know it's you before you change it."], pfphone: ['Enter your PIN', 'To change your mobile number.'],
      hreport: ['Enter your PIN', 'To open your lab report.'] }[S.afterUnlock] || ['Enter your PIN', 'To open your health records.']),
    <>{S.pinErr ? errLine(`That PIN didn't match. ${S.pinTries} ${S.pinTries === 1 ? 'try' : 'tries'} left.`) : null}
      <button className="btn secondary l hug" data-act="forgot">Forgot your PIN?</button></>),
  pinnew: () => pinScreen('Choose a new PIN', 'Your old PIN stops working. Your records stay as they are.', S.pinMismatch ? errLine(MISMATCH) : null),
  pinnewconfirm: () => pinScreen('Enter it again', "So we know it's right."),

  finger: () => (
    <div className="screen">
      {statusBar()}{bar({ back: false })}
      <div className="body" style={{ justifyContent: 'center', alignItems: 'center', gap: 16 }}>
        {empty('icon-fingerprint-28.svg', 'Use your fingerprint next time?',
          "It's quicker than your PIN. But anyone whose fingerprint is saved on this phone could open your records too.",
          <>{btn('Use fingerprint', 'finger:on', { size: 'l' })}{btn('Just use my PIN', 'finger:off', { kind: 'secondary', size: 'l' })}</>)}
      </div>
      {homeInd()}
    </div>),

  toomany: () => (
    <div className="screen">
      {statusBar()}{appBar()}
      <div className="body" style={{ justifyContent: 'center', alignItems: 'center', gap: 16 }}>
        {empty('icon-lock.svg', 'Too many tries', `For your safety, wait before trying again, or reset your PIN with a code sent to ${masked()}.`,
          btn('Reset with an SMS code', 'forgot', { size: 'l' }))}
        <p className="wait">You can try again in <span id="pinwait">{mmss(S.pinWait)}</span></p>
      </div>
      {homeInd()}
      </div>),

});

// ---------- behaviour ----------
export function openHealth(target = 'health') {
  S.stack = []; S.bio = null; S.sheet = null;
  S.lockWhy = target === 'hreport' ? 'report' : null; // says why the PIN is being asked for
  if (S.healthEmpty) { S.screen = 'hempty'; return render(); } // nothing to lock yet
  S.afterUnlock = target; S.screen = 'hlocked'; render();       // every time the tab opens
}

export function unlock() {
  const t = S.afterUnlock || 'health';
  Object.assign(S, { unlocked: true, afterUnlock: null, pinEntry: '', pinErr: false, pinMismatch: false, pinTries: 5, bio: null, sheet: null });
  S.lockWhy = null;
  if (t === 'pinnew') { S.afterUnlock = 'pflock'; S.stack = ['pf', 'pflock']; S.screen = 'pinnew'; return render(); } // Profile › Change PIN, after the current one
  if (t === 'pfphone') { S.stack = ['pf', 'pfdetails']; S.screen = 'phone'; return render(); } // Profile › change number, after the PIN
  S.stack = t === 'health' || t === 'ask' ? [] : t === 'pflock' ? ['pf'] : t === 'mtmed' ? ['health', 'mtlist'] : t === 'hreport' ? ['health', 'hlabs'] : ['health'];
  S.screen = t;
  if (t === 'ask') return resolveAskLock(); // ask.jsx: the locked answer now shows
  render();
}

// Leaving Clinica locks the records again (the design also locks after 5 idle minutes).
export const HEALTH_SCREENS = ['health', 'hvisits', 'hvisit', 'hfollow', 'hrx', 'hrxd', 'hpharm', 'hlabs', 'hreport', 'hfile', 'hreviewing', 'mtlist', 'mtmed', 'mtdose'];
document.addEventListener('visibilitychange', () => {
  if (document.hidden || !S.unlocked || !HEALTH_SCREENS.includes(S.screen)) return;
  Object.assign(S, { unlocked: false, lockWhy: 'left', afterUnlock: 'health', stack: [], screen: 'hlocked', bio: null, sheet: null });
  render();
});

// A PDF of the report, through the browser's own save prompt.
export function downloadReport(l) {
  const lines = ['City Hospital Laboratory', 'Maharajgunj, Kathmandu', `${l.title} - ${l.date}`, `Patient: ${S.fullName} - CH-2381`, '', l.words, l.by];
  const text = lines.map((t, i) => `BT /F1 ${i ? 11 : 14} Tf 50 ${780 - i * 22} Td (${t.replace(/[()\\]/g, '\\$&')}) Tj ET`).join('\n');
  const objs = ['<< /Type /Catalog /Pages 2 0 R >>', '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>',
    `<< /Length ${text.length} >>\nstream\n${text}\nendstream`, '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>'];
  let pdf = '%PDF-1.4\n'; const offs = [];
  objs.forEach((o, i) => { offs.push(pdf.length); pdf += `${i + 1} 0 obj\n${o}\nendobj\n`; });
  const x = pdf.length;
  pdf += `xref\n0 ${objs.length + 1}\n0000000000 65535 f \n${offs.map(o => `${String(o).padStart(10, '0')} 00000 n \n`).join('')}trailer\n<< /Size ${objs.length + 1} /Root 1 0 R >>\nstartxref\n${x}\n%%EOF`;
  const url = URL.createObjectURL(new Blob([pdf], { type: 'application/pdf' }));
  Object.assign(document.createElement('a'), { href: url, download: `${l.title} report.pdf` }).click();
  openSys({ title: `${l.title} report.pdf`, sub: "Saved to your phone's Files.", confirm: 'Open file', href: url }); // the phone's own save prompt
}

export const PIN_SCREENS = ['pincreate', 'pinconfirm', 'pin', 'pinnew', 'pinnewconfirm', 'pfpin'];

export function pinDigit(d) {
  if (S.pinEntry.length >= 4) return;
  if (S.pinErr || S.pinMismatch) { S.pinErr = false; S.pinMismatch = false; S.pinEntry = ''; }
  S.pinEntry += d;
  render();
  if (S.pinEntry.length === 4) after(pinComplete, 180); // the fourth digit moves on; there is no button
}

export function pinComplete() {
  const e = S.pinEntry;
  S.pinEntry = '';
  if (S.sheet === 'askpin') { // Ask: the PIN sheet over the conversation; the right PIN opens the answer
    if (e !== S.pin) { S.pinErr = true; return render(); }
    Object.assign(S, { sheet: null, pinErr: false, afterUnlock: null });
    return resolveAskLock();
  }
  switch (S.screen) {
    case 'pincreate': S.pinFirst = e; return go('pinconfirm');
    case 'pinnew': S.pinFirst = e; return go('pinnewconfirm');
    case 'pinconfirm':
      if (e !== S.pinFirst) { S.pinMismatch = true; return backTo('pincreate'); } // back to 12 with the reason in words
      S.pin = e;
      if (S.noSensor) return unlock(); // no sensor: first-time setup skips the fingerprint step
      S.stack = []; S.screen = 'finger'; return render();
    case 'pinnewconfirm':
      if (e !== S.pinFirst) { S.pinMismatch = true; return backTo('pinnew'); }
      S.pin = e; S.pinChanged = S.afterUnlock === 'pflock'; return unlock(); // then straight back into Health, or to Health lock
    case 'pfpin': // care.jsx — Switch person
      if (e === pinOf(S.switchTo)) return switchTo(S.switchTo);
      S.pinErr = true; return render();
    case 'pin':
      if (e === S.pin && S.fingerChanged) { // a new fingerprint on the phone: the opt-in asks again, since the risk has changed
        Object.assign(S, { fingerChanged: false, finger: null, pinErr: false, pinTries: 5, stack: [], screen: 'finger' });
        return render();
      }
      if (e === S.pin) return unlock();
      S.pinTries--;
      if (S.pinTries <= 0) { S.pinErr = false; S.pinWait = 30; return go('toomany', { replace: true }); }
      S.pinErr = true; return render();
  }
}

document.addEventListener('keydown', e => {
  if (S.sheet !== 'askpin' && (!PIN_SCREENS.includes(S.screen) || S.sheet || e.target.matches('input, textarea'))) return;
  if (/^\d$/.test(e.key)) pinDigit(e.key);
  else if (e.key === 'Backspace') ACTIONS['pin-del']();
});

// Saves the medicine form (meds.jsx). Buying more of one already listed is a restock, which fills its ring.
export function saveMed() {
  const f = S.mform, n = firstNum(f.qty);
  S.mErr = {};
  if (!(f.name || '').trim()) S.mErr.name = "Enter the medicine's name.";
  if (!n) S.mErr.qty = 'Enter how many you have, as a number — for example 20 tablets.';
  if (Object.keys(S.mErr).length) return render();
  const name = f.name.trim(), existing = S.meds.find(m => m.title.toLowerCase().startsWith(name.toLowerCase()));
  if (existing) { existing.left += n; existing.total = existing.left; }
  else {
    const unit = (f.qty.replace(/[\d\s]+/, '').trim()) || { Tablet: 'tablets', Capsule: 'capsules', Liquid: 'ml' }[f.form] || 'tablets';
    const often = (f.often || '').trim();
    S.meds.push({ title: `${name} ${f.strength || ''}`.trim(), name, strength: f.strength || '', form: f.form || '', generic: '', each: f.each || '', often,
      sched: often || 'As needed', sub: [f.each, often.toLowerCase()].filter(Boolean).join(', ') || 'As needed',
      left: n, total: n, unit, perDay: perDayOf(f.often, f.each), since: 'Today' });
  }
  S.mform = {};
  S.stack.includes('mtlist') ? backTo('mtlist') : go('mtlist', { replace: true });
}

Object.assign(mount, {
  toomany: () => every(() => {
    S.pinWait--;
    if (S.pinWait <= 0) { S.pinTries = 5; S.sheet = null; return go('pin', { replace: true }); }
    paint();
  }, 1000),
  hpharm: () => { // "This screen stays on while it's open."
    navigator.wakeLock?.request('screen').then(lock => onLeave(() => lock.release())).catch(() => {});
  },
});

Object.assign(ACTIONS, {
  'health-tab': () => openHealth(),
  visit: arg => { S.visit = arg; go('hvisit'); },
  rx: arg => { S.rx = arg; go('hrxd'); },
  report: arg => { S.report = arg; go('hreport'); },
  'report-dl': () => downloadReport(labOf(S.report)),
  'health-go': arg => openHealth(arg),
  'unlock-start': () => {
    if (!S.pin) return go('pincreate'); // first unlock: create the PIN now, when it protects something
    if (S.finger === 'on' && !S.fingerChanged) { S.bio = 'prompt'; return render(); }
    go('pin');
  },
  'bio-touch': () => { // prototype: the first touch isn't recognised, the next one is
    if (S.bioFails++ === 0) { S.bio = 'fail'; return render(); }
    unlock();
  },
  'bio-pin': () => { S.bio = null; go('pin'); },
  'bio-cancel': () => { S.bio = null; render(); },
  'pin-digit': arg => pinDigit(arg),
  'pin-del': () => { if (S.pinErr || S.pinMismatch) return; S.pinEntry = S.pinEntry.slice(0, -1); render(); },
  forgot: () => { S.sheet = 'reset'; render(); },
  'sheet-close': () => { S.sheet = null; render(); }, // the safe choice
  'reset-send': () => { // the same code screen as sign-in
    Object.assign(S, { sheet: null, codeFor: 'pinreset', code: '', codeState: 'typing', resend: 42 });
    go('code');
  },
  finger: arg => { S.finger = arg; unlock(); },
  'med-save': saveMed,
});

Object.assign(NUM, {
  hlocked: s => s.bio === 'fail' ? 'H16' : s.bio ? 'H15' : s.lockWhy === 'report' ? 'HM01' : s.lockWhy === 'left' ? 'HM06' : 'H01',
  health: s => s.offline ? 'GX03' : 'H02', hvisits: () => 'H03', hvisit: s => s.visit === 'aug12' ? 'HM09' : 'H04', hrx: s => s.rxNone ? 'HM11' : 'H05',
  hrxd: s => s.rx === 'aug12' ? 'HM10' : 'H06', hpharm: () => 'H07', hfollow: () => 'HM08', hfile: () => 'HM05',
  hlabs: s => !s.labs.length ? 'HM12' : s.labs.includes('cbc') ? 'H08' : 'HM04', hreport: s => s.report === 'hba1c' ? 'HM03' : 'H09', hreviewing: () => 'H10', hempty: () => 'H11',
  pincreate: () => 'H12', pinconfirm: () => 'H13', finger: () => 'H14',
  pin: s => s.sheet ? 'H20' : s.pinErr ? 'H18' : s.fingerChanged ? 'HM07' : ({ hreport: 'HM02', pinnew: 'PM01', pfphone: 'PM05' })[s.afterUnlock] || 'H17',
  toomany: s => s.sheet ? 'H20' : 'H19',
  code: s => ({ pinreset: 'H21', newphone: 'PM07' })[s.codeFor],
  phone: s => s.codeFor === 'newphone' ? 'PM06' : undefined,
  pinnew: s => s.afterUnlock === 'pflock' ? 'PM02' : 'H22', pinnewconfirm: s => s.afterUnlock === 'pflock' ? 'PM03' : 'H23',
});

export const U = { unlocked: true };
FLOW.push(
  ['Health — visits', [
    ['H01', 'Health locked', 'Unlocks', 'Every time the tab opens, with a Clinica PIN — not the phone\'s, which others who share the phone may know. Unlock leads to 12 the first time, then to 15 or 17.', () => ({ screen: 'hlocked' })],
    ['H02', 'Health', 'Visit history', 'Leads with what the patient is taking now; everything else is one tap away. Drug names appear here, behind the lock — never on Home.', () => ({ screen: 'health', ...U })],
    ['H03', 'Visit history', 'Taps a visit', 'Grouped by month, newest first. Walk-ins appear alongside booked visits, because they are visits too.', () => ({ screen: 'hvisits', stack: ['health'], ...U })],
    ['H04', 'Visit detail', 'Scrolls', "Scrolls — shown at full length. Leads with the doctor's patient-facing note, then what was prescribed, then the follow-up, bookable right there.", () => ({ screen: 'hvisit', stack: ['health', 'hvisits'], ...U })],
  ]],
  ['Health — prescriptions and reports', [
    ['H05', 'Prescriptions', 'Taps a prescription', 'What to take now reads complete on its own row, so no chevron. Prescriptions as documents sit below, with one.', () => ({ screen: 'hrx', stack: ['health'], ...U })],
    ['H06', 'Prescription detail', 'Show to pharmacist', "'Show to pharmacist' opens 07, a large-text view for the pharmacy counter.", () => ({ screen: 'hrxd', stack: ['health', 'hrx'], ...U })],
    ['H07', 'Show to pharmacist', 'Read across a counter', "Read across a counter: 24 and 20px, all in primary ink, and the screen stays awake. What to dispense, with the prescriber's NMC number and a prescription number — and no purpose line.", () => ({ screen: 'hpharm', stack: ['health', 'hrx', 'hrxd'], ...U })],
    ['H08', 'Lab reports', 'Taps a ready report', "Each report's state as a tag: Being reviewed in Neutral, Ready in Success.", () => ({ screen: 'hlabs', stack: ['health'], ...U })],
    ['H09', 'Report detail', 'Released reports only', "Reachable only once released. Leads with the doctor's explanation and says who reviewed it, and when.", () => ({ screen: 'hreport', stack: ['health', 'hlabs'], ...U })],
  ]],
  ['Health — unhappy paths', [
    ['H10', 'Report being reviewed', 'Branch from 08 — a report not yet released', 'Results reach the patient after the doctor sees them. The screen says why, and points to the phone if they feel worse.', () => ({ screen: 'hreviewing', stack: ['health', 'hlabs'], ...U })],
    ['H11', 'No visits yet', 'Replaces 02 for a new patient', 'Nothing to lock yet, and one way forward: book the first visit.', () => ({ screen: 'hempty', healthEmpty: true })],
  ]],
  ['Health — unlock, first time', [
    ['H12', 'Create PIN', 'From 01 Unlock, first time', 'Asked for on the first unlock, not at sign-up — at the moment it protects something. The fourth digit moves on; there is no button.', () => ({ screen: 'pincreate', stack: ['hlocked'], pinEntry: '12' })],
    ['H13', 'Confirm PIN', 'After 12', "If the two don't match, back to 12 with the reason in words.", () => ({ screen: 'pinconfirm', stack: ['hlocked', 'pincreate'], pinFirst: '1234', pinEntry: '123' })],
    ['H14', 'Fingerprint opt-in', 'After 13', 'Offered once, after the PIN exists, with the shared-phone trade-off stated plainly. Either answer goes to 02.', () => ({ screen: 'finger', pin: '1234' })],
  ]],
  ['Health — unlock, returning', [
    ['H15', 'Unlock with fingerprint', 'From 01 Unlock, fingerprint on', 'The OS draws this sheet over the locked screen. Clinica sets only the title and the fallback.', () => ({ screen: 'hlocked', pin: '1234', finger: 'on', bio: 'prompt' })],
    ['H16', 'Fingerprint not recognised', 'Branch from 15', "Retries belong to the OS. 'Use PIN instead' is always there.", () => ({ screen: 'hlocked', pin: '1234', finger: 'on', bio: 'fail', bioFails: 1 })],
    ['H17', 'Enter PIN', 'From 01 Unlock with no fingerprint, or from 16', "'Forgot your PIN?' resets it with an SMS code. Correct PIN goes to 02.", () => ({ screen: 'pin', stack: ['hlocked'], pin: '1234', pinEntry: '12' })],
    ['H18', 'Wrong PIN', 'Branch from 17', 'The dots turn red, and the message says it in words, with tries left. The digits are never shown.', () => ({ screen: 'pin', stack: ['hlocked'], pin: '1234', pinErr: true, pinTries: 3 })],
    ['H19', 'Too many tries', 'Branch from 18', "After five wrong PINs: a 30-second wait, or a reset by SMS code through sign-in's Verify code screen, then back to 12.", () => ({ screen: 'toomany', stack: ['hlocked'], pin: '1234', pinTries: 0 })],
    ['H20', 'Reset your PIN', 'From Enter PIN, Wrong PIN, Too many tries, Profile', 'On a shared phone, family reads the same messages, so an SMS reset alone would defeat the Clinica PIN. The sheet says so, and offers reception with ID as the safe route.', () => ({ screen: 'pin', stack: ['hlocked'], pin: '1234', pinEntry: '12', sheet: 'reset' })],
    ['H21', 'Reset code', 'Send code', 'The same code screen as sign-in, so nothing new to learn.', () => ({ screen: 'code', stack: ['hlocked', 'pin'], pin: '1234', codeFor: 'pinreset', phone: '9841234412', code: '429' })],
    ['H22', 'Choose a new PIN', 'After the code', 'Says the old PIN stops working and that nothing in the records changes.', () => ({ screen: 'pinnew', stack: ['hlocked', 'pin'], pin: '1234', pinEntry: '12' })],
    ['H23', 'Confirm new PIN', 'After 22', 'Then straight back into Health.', () => ({ screen: 'pinnewconfirm', stack: ['hlocked', 'pin', 'pinnew'], pin: '1234', pinFirst: '5678', pinEntry: '567' })],
  ]],
);
