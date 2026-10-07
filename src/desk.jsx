// Clinica for City Hospital's care team — the doctor's desktop app (1440 × 900, master–detail).
// Figma: zw3saW6ot26E6gWH20K3ux, section 552:19194. Same world as the doctor's phone (doctor.jsx) and Anisha's app:
// starting, completing and releasing here change the same queue, notes and reports.
import { btn, empty, listItem, start, support } from './app.jsx';
import { T, src } from './ask.jsx';
import { label, rel, row, rows, sk, tag, when } from './booking.jsx';
import { A, ACTIONS, FLOW, NUM, ORDER, S, SCREENS, after, back, every, extraState, go, later, mount, paint, render, sepJoin } from './core.jsx';
import { DR_DRAFTS, DR_FOLLOW, DR_HISTORY, DR_PATIENTS, DR_REPORTS, DR_TAG, EXTRA_STATE_DR, drField, drMeds, drPwClear, drRadio, drSettings, drStatus, drTime, drToday, drValues } from './doctor.jsx';
import { centred, field, list } from './health.jsx';
import { img, now, patients, person } from './staff.jsx';

later(() => { DR_HISTORY.nt = [['May 14, 2026', 'Dr. Priya Sharma · General checkup'], ['Feb 2, 2026', 'Dr. Priya Sharma · Follow-up']]; }, ORDER.desk);
extraState(() => ({ kSel: null, kView: 'visit', kRep: null }), ORDER.desk);
export const DESK_START = () => ({ app: 'desk', screen: 'ksignin', signedIn: true, visitDay: 'checkedin', followup: null });

// ---------- pieces ----------
export const kChevR = <img src={`${A}icon-chevron-right-action-16.svg`} width="16" height="16" alt="" />;
export function kSide(active) {
  const items = [['Queue', 'snav-queue', 'kqueue'], ['Reports', 'snav-reports-secondary', 'kreports'], ['Profile', 'snav-profile', 'kprofile']];
  return <aside className="k-side"><div className="k-top"><p className="k-logo">Clinica</p><nav className="k-nav" aria-label="Main">{items.map(([l, i, sc]) => {
    if (l !== active) return <a key={l} href="#" className="k-ni" data-act={`k-tab:${sc}`}><img src={`${A}${i}.svg`} width="20" height="20" alt="" />{l}</a>;
    const T = S.screen === sc ? 'span' : 'a'; // below the section root, the active item leads back to it
    return <T key={l} {...(T === 'a' ? { href: '#', 'data-act': `k-tab:${sc}` } : {})} className="k-ni on" aria-current="page"><img src={`${A}${i.replace('-secondary', '')}-active.svg`} width="20" height="20" alt="" />{l}</T>;
  })}</nav></div>
    <div className="k-me"><span className="avatar">PS</span><div><p className="item-title">Dr. Priya Sharma</p><p className="dr-body">General medicine</p></div></div></aside>;
}
export const kPage = (active, inner) => <div className="screen k">{kSide(active)}{inner}</div>;
export const kHead = (t, sub) => <div className="k-head"><p className="dr-h1">{t}</p><p className="dr-sub">{sub}</p></div>;
export const kEmpty = (icon, t, b, w = 360) => <div className="empty" style={{ width: w }}><div className="tile-ic"><img src={`${A}${icon}`} width="28" height="28" alt="" /></div><p className="h-s">{t}</p><p className="dr-body">{b}</p><div style={{ height: 104 }}></div></div>;
export const kPatientRow = (id, sel) => {
  const p = DR_PATIENTS[id], st = drStatus(id), [t, tone] = DR_TAG[st], past = st === 'done';
  return <button className={`list-item k-row ${sel ? 'sel' : ''}`} data-act={`k-sel:${id}`} aria-current={sel ? 'true' : undefined}><span className="avatar">{p.ini}</span>
    <span className="dq-t"><span className={`h-s ${past ? 'past' : ''}`}>{p.name}</span><span className="dq-r">{p.short}</span>
      <span className="dq-m"><span className={past ? 'past' : 'now'}>{drTime(id)}</span>{tag(t, `${tone} s12`)}</span></span></button>;
};
export const kId = (p, sub) => <div className="k-id"><span className="avatar l">{p.ini}</span><div><p className="k-name">{p.name}</p><p className="dr-sub">{sub}</p></div></div>;

// The detail pane for the selected patient: their visit, their history, or completing the visit inline.
export function kDetail() {
  const id = S.kSel;
  if (!id) return <section className="k-detail center">{kEmpty('icon-person-secondary-28.svg', 'Select a patient', "Choose someone from today's list to see their visit.")}</section>;
  const p = DR_PATIENTS[id], st = drStatus(id);
  if (S.kView === 'history') {
    const rows = DR_HISTORY[id] || p.hist.split(', ').map(d => [`${d}, 2026`, 'Dr. Priya Sharma · General medicine']);
    return <section className="k-detail"><div className="k-hd" style={{ justifyContent: 'flex-start', gap: 16 }}><a href="#" className="k-link" data-act="k-view:visit"><img src={`${A}icon-chevron-left-action-16.svg`} width="16" height="16" alt="" />Back to visit</a>{kId(p, p.info)}</div>
      <div className="stack8"><p className="dr-label">History</p><div className="mt-list">{sepJoin(rows.map(([d, s]) => row('lt-history.svg', d, s)))}</div></div></section>;
  }
  if (S.kView === 'complete') {
    const d = S.drDraft;
    return <section className="k-detail"><div className="k-hd">{kId(p, `Today's visit · ${drTime(id)}`)}{btn('Complete visit', 'k-complete', { size: 'l', kind: 'primary hug' })}</div>
      <div className="field-wrap"><label className="dr-label" htmlFor="k-note">Doctor's note</label><div className="field textarea"><textarea id="k-note" value={d.note} onChange={e => { d.note = e.target.value; paint(); }} /></div></div>
      <div className="stack12"><p className="dr-label">Medicines</p>{drMeds(d.meds)}<button className="btn secondary l" data-act="stub:Add another medicine">Add another medicine</button></div>
      {drRadio('Follow-up', [['none', 'No follow-up'], ['2w', 'In 2 weeks'], ['other', 'Other date']], d.follow, 'd-follow')}</section>;
  }
  const action = st === 'done' ? tag('Visit complete', 'neutral s12') : st === 'notarrived' ? tag('Not arrived', 'warn s12') : btn('Start visit', 'k-start', { size: 'l', kind: 'primary hug' });
  return <section className="k-detail"><div className="k-hd">{kId(p, p.info)}{action}</div>
    <div className="stack8"><p className="dr-label">{st === 'done' ? "Today's visit — complete" : st === 'notarrived' ? 'Scheduled visit' : "Today's visit"}</p>
      <div className="dr-reason"><p className="dr-label tertiary">Reason for visit</p><p className="dr-l">{p.reason}</p><p className="dr-body">{drTime(id)} · General medicine · OPD 2</p></div>
      <a href="#" className="k-link" data-act="k-view:history">View history{kChevR}</a></div></section>;
}

export function kReportDetail() {
  const k = S.kRep;
  if (!k) return <section className="k-detail center">{kEmpty('qa-lab.svg', 'Select a report', 'Choose one from the list to review and release it.')}</section>;
  const r = DR_REPORTS[k], p = DR_PATIENTS[r.pid], rel = S.drRel, follow = rel.choice === 'follow';
  return <section className="k-detail"><div className="k-hd" style={{ justifyContent: 'flex-start' }}>{kId(p, `${r.test} · ${r.date} · City Hospital lab`)}</div>
    <div className="k-cols">
      <div className="stack8"><p className="dr-label">Result</p>
        {drValues(r.rows)}
        <p className="dr-body tertiary">Reference ranges only — patients never see raw values, only what you tell them.</p></div>
      <div className="stack12">{drRadio('What should the patient see?', [['normal', 'Everything is normal'], ['follow', 'I need to see them again']], rel.choice, 'd-choice')}
        <div className="field-wrap"><label className="dr-label" htmlFor="d-comment">Comment for {r.first}</label><div className="field textarea"><textarea id="d-comment" value={rel.comment} onChange={e => { rel.comment = e.target.value; rel.edited = true; paint(); }} /></div></div>
        <div>{btn(follow ? 'Release with follow-up request' : `Release to ${r.first}`, 'k-release', { size: 'l', kind: 'primary hug' })}</div></div>
    </div></section>;
}

// ---------- screens ----------
Object.assign(SCREENS, {
  // A centred card — there's no session yet to put a sidebar around.
  ksignin: () => <div className="screen k k-sign"><form className="k-card" id="k-form" noValidate onSubmit={e => { e.preventDefault(); ACTIONS['k-signin'](); }}>
      <div className="dr-brand"><p className="wordmark-s">Clinica</p><p className="dr-sub">For City Hospital's care team</p></div>
      <div className="fields">{drField('d-id', 'Staff ID', 'e.g. CH-0231')}{drField('d-pw', 'Password', 'Password', S.drErr ? 'Staff ID or password is incorrect. Try again.' : '')}
        <a href="#" className="dr-link" data-act="stub:Forgot your password?">Forgot your password?</a></div>
      <div className="stack12">{btn('Sign in', 'k-signin')}<p className="dr-body tertiary" style={{ textAlign: 'center' }}>Trouble signing in? Call IT support.</p></div>
    </form></div>,

  // Master–detail: the whole list stays visible while the selected patient shows on the right.
  kqueue: () => {
    const ids = S.drNoPatients ? [] : drToday(), seen = ids.filter(id => drStatus(id) === 'done').length;
    if (!ids.length) return kPage('Queue', <section className="k-list wide">{kHead('Today', 'Aug 28')}<div className="k-fill">{kEmpty('qa-book.svg', 'No patients scheduled today', 'A booked visit will show up here.', 300)}</div></section>);
    return kPage('Queue', <><section className="k-list">{kHead('Today', `Aug 28 · ${seen} of ${ids.length} seen`)}
      <div className="k-scroll">{sepJoin(ids.map(id => kPatientRow(id, id === S.kSel)))}</div></section>{kDetail()}</>);
  },

  kreports: () => {
    const ids = S.drPending;
    if (!ids.length) return kPage('Reports', <section className="k-list wide">{kHead('Reports', 'Nothing waiting on you')}<div className="k-fill">{kEmpty('icon-check-circle-secondary-28.svg', 'Nothing waiting on you', 'Reports you need to release will show up here.', 300)}</div></section>);
    return kPage('Reports', <><section className="k-list">{kHead('Reports', `${ids.length} ${ids.length === 1 ? 'is' : 'are'} waiting on you`)}
      <div className="k-scroll">{sepJoin(ids.map(k => { const r = DR_REPORTS[k], p = DR_PATIENTS[r.pid];
        return <button className={`list-item k-row ${k === S.kRep ? 'sel' : ''}`} data-act={`k-rep:${k}`}><span className="avatar">{p.ini}</span>
          <span className="dq-t"><span className="h-s">{p.name}</span><span className="dq-r">{r.test}</span><span className="dq-m"><span className="now">{r.date}</span>{tag('Needs review', 'warn s12')}</span></span></button>; }))}
      </div></section>{kReportDetail()}</>);
  },

  // The doctor's own account, centred — there's nothing to show alongside it.
  kprofile: () => kPage('Profile', <main className="k-main"><div className="k-col">
      <div className="k-id"><span className="avatar l">PS</span><div><p className="k-name">Dr. Priya Sharma</p><p className="dr-sub">General medicine · City Hospital</p></div></div>
      <div className="stack8"><p className="dr-label">Your details</p><div className="mt-list">{sepJoin([row('lt-document.svg', 'NMC registration', '12345'), row('lt-hospital.svg', 'Department', 'General medicine, OPD 2')])}</div></div>
      <div className="stack8"><p className="dr-label">Account</p><div className="mt-list">{sepJoin([listItem('lt-lock.svg', 'Change password', 'Last changed 3 months ago', 'k-settings:pw'), listItem('lt-bell.svg', 'Notifications', 'New reports and check-ins', 'k-settings:notif')])}</div></div>
      <div><button className="btn secondary l hug" data-act="d-signout">Sign out</button></div>
    </div></main>),

  kset: () => kPage('Profile', <main className="k-main"><div className="k-col" style={{ gap: 48 }}>
      <div className="stack8" id="d-notif-sec"><p className="k-h2">Notifications</p>
        <div className="mt-list">{drSettings()}</div></div>
      <div className="stack24" id="d-pw-sec"><p className="k-h2">Change password</p>
        <form id="d-pwform" className="fields" noValidate>{drField('d-pw0', 'Current password', 'Password')}{drField('d-pw1', 'New password', 'At least 8 characters', S.drPwErr === 'short' ? 'Use at least 8 characters.' : '')}
          {drField('d-pw2', 'Confirm new password', 'Re-enter new password', S.drPwErr === 'match' ? "The new passwords don't match." : '')}</form>
        {S.drPwErr === 'saved' ? support('Password changed.', '', 'icon-check-circle-success-20.svg') : null}<div>{btn('Save password', 'd-pwsave', { size: 'l', kind: 'primary hug' })}</div></div>
    </div></main>),
});

// ---------- behaviour ----------
Object.assign(mount, {
  kset: () => { if (S.drSec) { document.getElementById(S.drSec === 'notif' ? 'd-notif-sec' : 'd-pw-sec').scrollIntoView({ block: 'start' }); S.drSec = null; } },
});

Object.assign(ACTIONS, {
  'k-signin': () => {
    if (S.drId.trim().toUpperCase() !== 'CH-0231' || S.drPw !== 'clinica') { S.drErr = true; S.drPw = ''; return render(); }
    Object.assign(S, { drSigned: true, drErr: false, drPw: '', stack: [], screen: 'kqueue', kSel: null }); render(); // nothing pre-selected: the doctor chooses
  },
  'k-tab': sc => { Object.assign(S, { stack: [], screen: sc }); render(); },
  'k-sel': id => { Object.assign(S, { kSel: id, kView: 'visit' }); render(); },
  'k-view': v => { S.kView = v; render(); },
  'k-start': () => { S.dp = S.kSel; ACTIONS['d-start'](); Object.assign(S, { screen: 'kqueue', stack: [], kView: 'complete' }); render(); }, // the note is written inline
  'k-complete': () => { S.dp = S.kSel; ACTIONS['d-complete'](); Object.assign(S, { screen: 'kqueue', stack: [], kView: 'visit' }); render(); },
  'k-rep': k => { S.kRep = k; S.drRel = { choice: 'normal', comment: DR_REPORTS[k].normal, edited: false }; render(); },
  'k-release': () => { S.drRep = S.kRep; ACTIONS['d-release'](); Object.assign(S, { screen: 'kreports', stack: [], kRep: null }); render(); },
  'k-settings': sec => { S.drSec = sec; S.drPwErr = ''; drPwClear(); go('kset'); },
});
later(() => { const signout = ACTIONS['d-signout']; ACTIONS['d-signout'] = () => { signout(); if (S.app === 'desk') { S.screen = 'ksignin'; render(); } }; }, ORDER.desk); // wraps doctor.jsx's

Object.assign(NUM, {
  ksignin: () => 'K00',
  kqueue: s => s.drNoPatients || !drToday().length ? 'K10b' : !s.kSel ? 'K10'
    : ({ history: s.kSel === 'nt' ? 'K12g' : 'K11f', complete: s.kSel === 'nt' ? 'K12h' : 'K11b' })[s.kView]
      || (drStatus(s.kSel) === 'done' ? 'K11d' : drStatus(s.kSel) === 'notarrived' ? 'K11e' : s.kSel === 'nt' ? 'K12' : 'K11'),
  kreports: s => !s.drPending.length ? 'K20n' : !s.kRep ? 'K20a' : s.kRep === 'lipid' ? 'K20c' : s.drRel.choice === 'follow' ? 'K20b' : 'K20',
  kprofile: () => 'K30', kset: () => 'K30b',
});

export const KW = (x = {}) => () => ({ ...DESK_START(), drSigned: true, screen: 'kqueue', ...x });
later(() => FLOW.push(['Doctor desktop', [ // the presets read doctor.jsx's DR_DRAFTS, ready only now
  ['K00', 'Sign in', 'Doctor desktop', "The desktop entry point — a centred card rather than a full-bleed layout, since there's no session yet to put a sidebar around.", () => ({ ...DESK_START() })],
  ['K10', 'Queue — no selection', 'After signing in', 'The true default after signing in — nothing pre-selected, so the doctor chooses who to see.', KW()],
  ['K10b', 'Queue — no patients today', 'Nothing scheduled', "The desktop queue's true empty state — the list itself has nothing in it, not just nothing selected.", KW({ drNoPatients: true })],
  ['K11', 'Queue — Anisha', 'Selects Anisha', "Master-detail: the full list stays visible on the left while Anisha's visit shows on the right.", KW({ kSel: 'as' })],
  ['K11f', 'Queue — Anisha history', 'View history', 'History reached via a link, not shown inline — the same density fix applied on mobile.', KW({ kSel: 'as', kView: 'history' })],
  ['K11b', 'Queue — completing visit', 'Start visit', "Anisha's note and prescriptions, written inline in the detail pane rather than a separate page.", KW({ kSel: 'as', kView: 'complete', visitDay: 'with', drq: { ...EXTRA_STATE_DR().drq, nt: 'done' }, drDraft: { ...DR_DRAFTS.as } })],
  ['K11d', 'Queue — visit complete', 'Selects a Done patient', "A completed visit shown read-only — reused for every other ‘Done’ patient in the list.", KW({ kSel: 'bt' })],
  ['K11e', 'Queue — not arrived', 'Selects Sunita', "A patient who hasn't checked in — no visit to start yet.", KW({ kSel: 'sk' })],
  ['K12', 'Queue — Nabin', 'Selects Nabin', 'A second, genuinely different patient selected — proving the detail pane really changes, not just Anisha relabelled.', KW({ kSel: 'nt' })],
  ['K12g', 'Queue — Nabin history', 'View history', "Nabin's own visit history, distinct from Anisha's.", KW({ kSel: 'nt', kView: 'history' })],
  ['K12h', 'Queue — Nabin, completing visit', 'Start visit', "Nabin's own diagnosis and prescriptions, not a reused stand-in.", KW({ kSel: 'nt', kView: 'complete', drDraft: { ...DR_DRAFTS.nt } })],
  ['K20', 'Reports', "Selects Anisha's CBC", "Anisha's CBC result, with the raw values and the release decision side by side.", KW({ screen: 'kreports', kRep: 'cbc', drRel: { choice: 'normal', comment: DR_REPORTS.cbc.normal } })],
  ['K20a', 'Reports — no selection', 'Reports', "The Reports tab's own default state, matching the Queue's.", KW({ screen: 'kreports' })],
  ['K20b', 'Reports — flag follow-up', 'I need to see them again', 'The branch for when a result needs a conversation, not just a release.', KW({ screen: 'kreports', kRep: 'cbc', drRel: { choice: 'follow', comment: DR_FOLLOW } })],
  ['K20n', 'Reports — nothing pending', 'All released', 'Every report already released — nothing left to review.', KW({ screen: 'kreports', drPending: [] })],
  ['K20c', 'Reports — Kabita', "Selects Kabita's lipid panel", "A second patient's own report — her real Lipid panel, not Anisha's CBC reused.", KW({ screen: 'kreports', kRep: 'lipid', drRel: { choice: 'normal', comment: DR_REPORTS.lipid.normal } })],
  ['K30', 'Profile', 'Profile', "The doctor's own account, centred rather than in a sidebar layout since there's nothing else to show alongside it.", KW({ screen: 'kprofile' })],
  ['K30b', 'Account settings', 'Change password / Notifications', "Both settings on one scrollable page — Profile's two rows land here with the right section already in view.", KW({ screen: 'kset', stack: ['kprofile'] })],
]]), ORDER.desk);
