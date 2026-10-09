// Clinica — Onboarding, Sign in and Sign up prototype.
// Figma: zw3saW6ot26E6gWH20K3ux, section 118:6259. Screens 01–25 are screens or states below.
import { cloneElement, useEffect, useLayoutEffect, useReducer, useRef, useState } from 'react';
import { ask, say, src } from './ask.jsx';
import { backTo, bar, label, row, rows, tag, when } from './booking.jsx';
import { emergency, setting } from './care.jsx';
import { A, ACTIONS, FLOW, NUM, OVERLAY, S, SCREENS, after, back, every, go, later, mount, paint, phoneListeners, render, reset, sepJoin, subscribe, takeRemount } from './core.jsx';
import { DESK_START } from './desk.jsx';
import { DOCTOR_START, drOffline, showApp } from './doctor.jsx';
import { centred, field, lead, list, unlock } from './health.jsx';
import { interceptLink, notifSet, openAs } from './more.jsx';
import { SA, STAFF_START, cell, checks, counts, img, now, patients, person, stHome, stMe } from './staff.jsx';

export const ND = window.NepaliDate.default; // Published Bikram Sambat table (2000–2090 BS), never a formula

// Demo backend
export const CODE_OK = '123456';
export const CODE_EXPIRED = '000000';
export const RECORDS = [{ name: 'Anisha Sharma', born: 'March 1994' }, { name: 'Ramesh Sharma', born: 'June 1961' }];

export const AD_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
export const AD_LONG = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
export const BS_MONTHS = ['Baisakh', 'Jestha', 'Asar', 'Shrawan', 'Bhadra', 'Ashwin', 'Kartik', 'Mangsir', 'Poush', 'Magh', 'Falgun', 'Chaitra'];

// ---------- helpers ----------
export const digits = s => s.replace(/\D/g, '');
export const telKey = () => S.codeFor === 'newphone' ? 'newPhone' : 'phone'; // Profile › change number reuses sign-in's screens
export const masked = () => { const d = digits(S[telKey()] || '') || '9841000412'; return `+977 ${d.slice(0, 2)}•• ••• ${d.slice(-3)}`; };
export const mmss = s => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
export const pad = n => String(n).padStart(2, '0');
export const todayAD = new Date();

export function toBS(y, m, d) { try { return ND.fromAD(new Date(y, m, d)).getBS(); } catch { return null; } }
export function toAD(y, m, d) { try { return new ND(y, m, d).getAD(); } catch { return null; } }
export function bsDays(y, m) { for (let d = 32; d >= 28; d--) { try { if (new ND(y, m, d).getMonth() === m) return d; } catch {} } return 30; }
export const adDays = (y, m) => new Date(y, m + 1, 0).getDate();
export const bsText = b => `${b.date} ${BS_MONTHS[b.month]} ${b.year} BS`;

export function parseDob(t) {
  const m = /^(\d{2}) \/ (\d{2}) \/ (\d{4})$/.exec(t);
  if (!m) return null;
  const [d, mo, y] = [+m[1], +m[2] - 1, +m[3]];
  const date = new Date(y, mo, d);
  return date.getMonth() === mo && date.getDate() === d ? { y, m: mo, d } : null;
}
export function maskDob(v) {
  const x = digits(v).slice(0, 8);
  return [x.slice(0, 2), x.slice(2, 4), x.slice(4)].filter(Boolean).join(' / ');
}

// ---------- shared pieces ----------
export const statusBar = light => (
  <div className="status" style={{ color: light ? '#fff' : 'var(--text-primary)' }}>
    <span>9:41</span>
    <span className="sys"><span className="signal"><i></i><i></i><i></i><i></i></span>
      <img src={`${A}wifi-${light ? 'light' : 'dark'}.svg`} width="17" height="17" alt="" /><span className="battery"></span></span>
  </div>);
export const homeInd = light => <div className="home-ind" style={{ color: light ? '#fff' : 'var(--text-primary)' }}></div>;
export const appBar = ({ back = true, title = '' } = {}) => (
  <div className="appbar">
    {back && <button className="icon-btn" data-act="back" aria-label="Back"><img src={`${A}icon-back.svg`} width="24" height="24" alt="" /></button>}
    <div className="title">{title}</div><div className="slot"></div>
  </div>);
export const heading = (h, p, cls = 'h-xl') => (
  <div className="inset"><div className="heading"><h2 className={cls}>{h}</h2>{p ? <p className="lede">{p}</p> : null}</div></div>);
export const btn = (label, act, { kind = 'primary', disabled = false, size = '' } = {}) =>
  <button className={`btn ${kind} ${size}`} data-act={act} disabled={disabled}>{label}</button>;
export const support = (msg, tone = '', icon = '') => (
  <div className={`support ${tone}`}>{icon ? <img src={`${A}${icon}`} width="14" height="14" alt="" /> : null}<p>{msg}</p></div>);

// ---------- screens ----------
Object.assign(SCREENS, {
  splash: (act = 'splash-next') => (
    <div className="screen bold" data-act={act}>
      {statusBar(true)}
      <div className="splash-body"><div className="wordmark">Clinica</div><p style={{ fontSize: 16, lineHeight: '24px' }}>Your clinic, in your pocket.</p></div>
      <div className="clinic"><p style={{ fontSize: 14, lineHeight: '20px' }}>for</p><p className="h-s">City Hospital</p></div>
      {homeInd(true)}
    </div>),

  language: () => (
    <div className="screen">
      {statusBar()}
      <div className="body" style={{ paddingTop: 48 }}>
        <div className="inset"><div className="heading" style={{ gap: 4 }}>
          <h2 className="h-xl">Choose your language</h2>
          <h2 className="h-xl deva" style={{ color: 'var(--text-secondary)' }}>भाषा छान्नुहोस्</h2>
        </div></div>
        <div className="inset"><div className="tiles" role="radiogroup" aria-label="Language">
          {[['en', 'English', ''], ['ne', 'नेपाली', 'deva']].map(([v, l, c]) => (
            <button key={v} className="tile" role="radio" aria-checked={S.lang === v} data-act="lang" data-v={v}>
              <img className="off" src={`${A}translate-secondary.svg`} width="28" height="28" alt="" />
              <img className="on" src={`${A}translate-action.svg`} width="28" height="28" alt="" />
              <span className={c}>{l}</span>
            </button>))}
        </div></div>
        <div className="inset"><p className="body-s">You can change this any time in Profile.</p></div>
      </div>
      <div className="cta">{btn('Continue', 'go:onb1')}</div>
      {homeInd()}
    </div>),

  onb1: () => onboarding(1, "Book with your clinic's own doctors.", 'See who is in today and choose a time that suits you.',
    <div className="card">
      <div className="avatar">SA</div>
      <div className="doctor"><p className="h-s">Dr. Sameer Acharya</p><p className="spec">General medicine</p><span className="tag">Available today</span></div>
    </div>),
  onb2: () => onboarding(2, 'Know the moment something changes.', "If your doctor is running late or a visit moves, we'll tell you straight away.",
    <div className="card info"><div className="text"><p className="h-s">Dr. Acharya is running late</p>
      <p className="body-s">Your slot is kept, and we'll message you when he's ready.</p></div></div>),
  onb3: () => onboarding(3, 'Everything your doctor tells you, in one place.', 'Visits, prescriptions and reports in one place, to read again later.',
    <div className="card">
      <div className="lead-tile"><img src={`${A}icon-prescription.svg`} width="20" height="20" alt="" /></div>
      <div className="text"><p className="item-title">Prescription from Dr. Acharya</p><p className="body-s">Three times a day, after food</p></div>
    </div>),

  phone: () => (
    <div className="screen">
      {statusBar()}{appBar()}
      <div className="body">
        {S.codeFor === 'newphone' ? heading('Your new mobile number', "We'll text a code to check it. Your records stay the same.")
          : heading('Your mobile number', "We'll text a 6-digit code. Use the number your clinic has on file, so we can find your records.")}
        <div className="inset"><div className="field-wrap">
          <label className="label" htmlFor="tel">Mobile number</label>
          <div className={`field ${S.phoneErr ? 'err' : ''}`} id="tel-field">
            <span className="dial"><span className="flag-np" aria-hidden="true"></span>+977<img src={`${A}icon-chevron-down.svg`} width="20" height="20" alt="" /></span>
            <span className="divider"></span>
            <input id="tel" type="tel" inputMode="tel" autoComplete="tel-national" placeholder="Phone number" aria-describedby="tel-msg"
              value={S[telKey()] || ''}
              onChange={e => { S[telKey()] = e.target.value; S.phoneErr = false; paint(); }}
              onKeyDown={e => { if (e.key === 'Enter') sendCode(); }} />
          </div>
          <div id="tel-msg">{S.phoneErr
            ? support('Nepali mobile numbers are 10 digits, starting with 9.', 'err')
            : support('Only used to sign you in and send visit updates.')}</div>
        </div></div>
        {S.codeFor === 'newphone' ? <div style={{ height: 40, flex: 'none' }}></div> : <div className="inset"><p className="consent">By continuing, you agree to the <a href="#" data-act="go:terms">Terms of use</a> and <a href="#" data-act="go:privacy">Privacy policy</a>.</p></div>}
      </div>
      <div className="cta">{btn('Send code', 'send-code')}</div>
      {homeInd()}
    </div>),

  code: () => {
    const st = S.codeState, err = st === 'wrong' || st === 'expired';
    const cells = [...Array(6)].map((_, i) =>
      <div key={i} className={`cell ${!err && i === S.code.length ? 'focus' : ''}`}>{S.code[i] || ''}</div>);
    const msg = {
      typing: <div className="body-s" style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <p style={{ fontWeight: 600, color: 'var(--text-tertiary)' }} id="resend">Resend code in {mmss(S.resend)}</p>
                <p>Wrong number? <a href="#" className="link" data-act="back" style={{ color: 'inherit' }}>Go back to change it.</a></p></div>,
      wrong: support(`That code didn't match. ${S.tries} ${S.tries === 1 ? 'try' : 'tries'} left.`, 'err', 'icon-error.svg'),
      noarrive: support("Didn't get it? Check the number above is right, then send a new one.", '', 'icon-info.svg'),
      expired: support('That code has expired. Send a new one and enter it as soon as it arrives.', 'err', 'icon-error.svg'),
    }[st];
    const canVerify = S.code.length === 6 && st !== 'expired';
    return (
    <div className="screen">
      {statusBar()}{appBar()}
      <div className="body">
        {heading('Enter the code', `Sent by SMS to ${masked()}.`)}
        <div className="inset"><div className="code-wrap">
          <div className={`code ${err ? 'err' : ''}`} id="code">{cells}
            <input className="cell-input" id="code-in" type="text" inputMode="numeric" autoComplete="one-time-code" maxLength={6}
              aria-label="6-digit code" aria-describedby="code-msg" aria-invalid={err || undefined} value={S.code} onChange={e => {
                S.code = digits(e.target.value).slice(0, 6); // paste and SMS autofill fill all six at once
                if (S.codeState !== 'typing' && S.codeState !== 'noarrive') { S.codeState = 'typing'; return render(); }
                paint();
                if (S.code.length === 6) verify(); // verifies on the sixth digit
              }} />
          </div>
          {st === 'typing' ? null : <div id="code-msg">{msg}</div>}
        </div></div>
        {st === 'typing' ? <div className="inset" id="code-msg">{msg}</div> : <div className="inset">{btn('Send a new code', 'new-code', { kind: 'secondary' })}</div>}
      </div>
      <div className="cta">{btn('Verify', 'verify', { disabled: !canVerify })}</div>
      {homeInd()}
    </div>);
  },

  locked: () => (
    <div className="screen">
      {statusBar()}{appBar()}
      <div className="body">
        {heading('Too many tries', 'For your safety, sign-in is paused for this number. Wait, or ask reception to help you sign in.')}
        <div className="inset">{support(<>You can try again in <span id="lock">{mmss(S.lock)}</span>.</>, 'warn', 'icon-warning-info.svg')}</div>
        <div className="inset"><a className="btn secondary" href="tel:+97710000000">Call the clinic</a></div>
      </div>
      {homeInd()}
    </div>),

  whos: () => (
    <div className="screen">
      {statusBar()}{appBar({ back: false })}
      <div className="body g20">
        {heading("Who's using the app?", `City Hospital has ${RECORDS.length} records for this number, because many families share a phone. Choose yours.`)}
        <div className="list">
          {sepJoin([...RECORDS.map(r => listItem('icon-person.svg', r.name, `Born ${r.born}`, `pick:${r.name}`)),
            listItem('icon-add.svg', 'Someone else', 'Create a new profile', 'go:profile')])}
        </div>
        <div className="inset"><p className="body-s tertiary">Anyone who signs in with this number will be asked this, so each person only sees their own record.</p></div>
      </div>
      {homeInd()}
    </div>),

  profile: () => {
    const p = parseDob(S.dob), bs = p && toBS(p.y, p.m, p.d);
    const dobMsg = S.dobErr ? support(S.dobErr, 'err') : support(bs ? bsText(bs) : 'AD or BS — choose in the date picker.');
    return (
    <div className="screen">
      {statusBar()}{appBar()}
      <div className="body g20">
        {heading('Create your profile', 'The clinic uses this to find you at reception.')}
        <div className="inset"><form id="pf" noValidate style={{ display: 'flex', flexDirection: 'column', gap: 16 }} onSubmit={e => { e.preventDefault(); createProfile(); }}>
          <div className="field-wrap">
            <label className="label" htmlFor="name">Full name</label>
            <div className={`field ${S.nameErr ? 'err' : ''}`}><input id="name" autoComplete="name" placeholder="Your full name" value={S.name}
              onChange={e => { S.name = e.target.value; if (S.nameErr && S.name.trim()) S.nameErr = false; paint(); }} /></div>
            <div id="name-msg">{S.nameErr ? support('Enter your full name, as the clinic has it.', 'err') : null}</div>
          </div>
          <div className="field-wrap">
            <label className="label" htmlFor="dob">Date of birth</label>
            <div className={`field ${S.dobErr ? 'err' : ''}`}>
              <button type="button" className="cal-btn" data-act="open-picker" aria-label="Choose date of birth"><img src={`${A}icon-calendar.svg`} width="20" height="20" alt="" /></button>
              <input id="dob" inputMode="numeric" autoComplete="bday" placeholder="DD / MM / YYYY" value={S.dob}
                onChange={e => { S.dob = maskDob(e.target.value); S.dobErr = ''; paint(); }}
                onBlur={() => { if (S.dob.length === 14) { S.dobErr = dobError(); S.dobErr ? render() : paint(); } }} />
            </div>
            <div id="dob-msg">{dobMsg}</div>
          </div>
          <fieldset className={`radio-group ${S.sexErr ? 'err' : ''}`} id="sex">
            <legend>Sex</legend>
            <div className="radio-options">
              {['Female', 'Male', 'Other'].map(v => <label key={v} className="radio"><input type="radio" name="sex" value={v} checked={S.sex === v}
                onChange={() => { S.sex = v; S.sexErr = false; paint(); }} />{v}</label>)}
            </div>
            <div id="sex-msg">{S.sexErr ? support('Choose one.', 'err') : null}</div>
          </fieldset>
        </form></div>
      </div>
      <div className="cta">{btn('Create profile', 'create-profile')}</div>
      {homeInd()}
    </div>);
  },

  match: () => (
    <div className="screen">
      {statusBar()}{appBar()}
      <div className="body g20">
        {heading('We may already know you', 'City Hospital has a record close to the details you entered, but not an exact match. To keep your health records together and correct, reception will check it with you.')}
        <div className="inset"><div className="card info"><div className="text"><p className="h-s">What happens next</p>
          <p className="body-s">Bring your ID to your next visit. You can book now; your health records will show in the app once reception confirms.</p></div></div></div>
      </div>
      <div className="cta">{btn('Continue', 'go:waiting')}{btn('Check my details', 'back', { kind: 'secondary' })}</div>
      {homeInd()}
    </div>),

  waiting: () => (
    <div className="screen">
      {statusBar()}{appBar({ back: false, title: 'Health' })}
      <div className="body g20" style={{ justifyContent: 'center' }}>
        {empty('icon-clipboard.svg', 'Your records are waiting for reception', 'Reception will confirm your details at your next visit. Your visits, prescriptions and reports will appear here then.',
          btn('Book a visit', 'end:book', { size: 'l' }))}
      </div>
      <div className="bottom">
        <nav className="bnav" aria-label="Main">
          {[['Home', 'nav-home'], ['Care', 'nav-care'], ['Health', 'nav-health-active'], ['Ask', 'nav-ask'], ['Profile', 'nav-profile']].map(([l, i]) =>
            <a key={l} href="#" aria-current={l === 'Health' ? 'page' : undefined} data-act="end:tab"><span><img src={`${A}${i}.svg`} width="24" height="24" alt="" /></span>{l}</a>)}
        </nav>
        {homeInd()}
      </div>
    </div>),

  returning: () => SCREENS.splash('returning-next'),

  session: () => (
    <div className="screen">
      {statusBar()}
      <div className="body" style={{ justifyContent: 'center', padding: '0 16px 16px' }}>
        {empty('icon-lock.svg', 'Please sign in again', "For your security, you're signed out after a long time away. Your health records are safe.",
          <>{btn(`Send a code to ${masked()}`, 'session-code', { size: 'l' })}{btn('Use a different number', 'session-other', { kind: 'secondary', size: 'l' })}</>)}
      </div>
      {homeInd()}
    </div>),

  terms: () => legal('Terms of use',
    "Clinica helps you book visits and follow your care at City Hospital. It isn't for emergencies — call 102. Keep your Clinica PIN to yourself. The clinic's records are the official ones.", [
      ['Using Clinica', "Use the app for your own care, or for someone you're allowed to book for. Don't share your sign-in code or your Clinica PIN."],
      ['Not for emergencies', "Clinica can't check symptoms or reach a doctor in a hurry. In an emergency, call 102 or go to the nearest emergency department."],
      ['Your records', "What the app shows comes from City Hospital. If something looks wrong, ask at reception — the clinic's record counts."],
      ['Changes', "If these terms change, we'll tell you in the app before the change takes effect."],
    ]),
  privacy: () => legal('Privacy policy',
    "We use your details only to run your care at City Hospital. Your care team sees your health records; they're never sold or used for ads. You can see, correct or close your account at any time.", [
      ['What we collect', 'Your name, date of birth, sex and mobile number, your appointments, and the records City Hospital releases to you: visit notes, prescriptions and reports.'],
      ['Who can see it', 'You, and the City Hospital staff caring for you. On a shared phone, your Clinica PIN keeps your records private from others who use it.'],
      ['How long we keep it', "City Hospital keeps medical records for as long as Nepal's law requires, even if you close your app account."],
      ['Your choices', 'See your details in Profile. Ask reception to correct them. Close your account from Profile at any time.'],
      ['Questions', 'Ask at reception, or call City Hospital.'],
    ]),

  // Home and the rest of the app live in other Figma sections — this marks where this flow ends.
  end: () => (
    <div className="screen">
      {statusBar()}{S.stack.length ? appBar() : null}
      <div className="body" style={{ justifyContent: 'center', padding: '0 16px 16px' }}>
        {empty('icon-person.svg', S.endTitle, S.endBody, btn('Restart prototype', 'restart', { size: 'l' }), true)}
      </div>
      {homeInd()}
    </div>),
});

export function onboarding(step, title, body, card) {
  return (
    <div className="screen subtle">
      {statusBar()}
      <div className="body hero-body">
        <div className="inset"><div className="heading"><h2 className="h-display">{title}</h2><p className="lede">{body}</p></div></div>
        <div className="hero-inset"><div className="hero"><img src={`${A}hero.png`} alt="A doctor in a white coat with a stethoscope" />{card}</div></div>
        <div className="dots" aria-label={`Step ${step} of 3`}>{[1, 2, 3].map(i => <i key={i} className={i === step ? 'on' : ''}></i>)}</div>
      </div>
      <div className="cta row">{step < 3 ? <>{btn('Skip', 'go:phone', { kind: 'secondary' })}{btn('Next', `go:onb${step + 1}`)}</> : btn('Get started', 'go:phone')}</div>
      {homeInd()}
    </div>);
}

export function listItem(icon, title, sub, act) {
  return <button className="list-item" data-act={act}>
    <span className="lead-tile"><img src={`${A}${icon}`} width="20" height="20" alt="" /></span>
    <span className="text"><span className="item-title">{title}</span><span className="body-s">{sub}</span></span>
    <img src={`${A}icon-chevron-right.svg`} width="20" height="20" alt="" />
  </button>;
}

export function empty(icon, title, body, actions, action = false) {
  return <div className="empty">
    <div className="tile-ic" style={action ? { background: 'var(--surface-icon-neutral-bold)' } : undefined}><img src={`${A}${icon}`} width={action ? 20 : 28} height={action ? 20 : 28} alt="" /></div>
    <p className="h-s">{title}</p><p className="body-s">{body}</p>
    <div className="actions">{actions}</div>
  </div>;
}

export function legal(title, short, sections) {
  return (
    <div className="screen legal">
      {statusBar()}{appBar({ title })}
      <div className="body g20" style={{ paddingBottom: 24 }}>
        <div className="inset"><div className="card warn"><div className="text"><p className="h-s">Draft wording</p><p className="body-s">City Hospital's legal team will replace this wording before launch.</p></div></div></div>
        <div className="inset"><div className="card neutral"><div className="text"><p className="h-s">In short</p><p className="body-s">{short}</p></div></div></div>
        {sections.map(([h, p]) => <div key={h} className="inset"><div className="section"><h3 className="h-s">{h}</h3><p className="lede">{p}</p></div></div>)}
      </div>
      {homeInd()}
    </div>);
}

// ---------- date of birth sheet ----------
export function openPicker() {
  const p = parseDob(S.dob);
  let pk;
  if (S.pickerCal === 'BS' && S.bsHint) pk = { cal: 'BS', ...S.bsHint };
  else if (p) pk = { cal: 'AD', y: p.y, m: p.m, d: p.d };
  else pk = { cal: 'AD', y: 1994, m: 2, d: 14 };
  if (pk.cal === 'AD' && S.pickerCal === 'BS') {
    const b = toBS(pk.y, pk.m, pk.d);
    if (b) pk = { cal: 'BS', y: b.year, m: b.month, d: b.date };
  }
  S.picker = pk;
  paint();
}

// A picker with `from` (an AD year) looks ahead — this year and next — for dates still to come, like a follow-up.
export function pickerRanges(pk) {
  if (pk.cal === 'AD') {
    const [y0, y1] = pk.from ? [pk.from, pk.from + 1] : [1920, todayAD.getFullYear()];
    return { years: range(y0, y1), months: AD_SHORT, days: adDays(pk.y, pk.m) };
  }
  const [y0, y1] = pk.from ? (b => [b, b + 1])(toBS(pk.from, 6, 1).year) : [2000, ND.fromAD(todayAD).getYear()];
  return { years: range(y0, y1), months: BS_MONTHS, days: bsDays(pk.y, pk.m) };
}
export const range = (a, b) => Array.from({ length: b - a + 1 }, (_, i) => a + i);

export function DobSheet() {
  const pk = S.picker, r = pickerRanges(pk);
  pk.y = Math.min(Math.max(pk.y, r.years[0]), r.years.at(-1));
  pk.d = Math.min(pk.d, r.days);
  useEffect(() => { document.querySelector('#sheet .seg[aria-pressed="true"]')?.focus(); }, []);
  let conv;
  if (pk.cal === 'AD') { const b = toBS(pk.y, pk.m, pk.d); conv = b ? `That's ${bsText(b)}.` : 'No BS conversion before 2000 BS (1943 AD).'; }
  else { const a = toAD(pk.y, pk.m, pk.d); conv = a ? `That's ${a.date} ${AD_LONG[a.month]} ${a.year} AD.` : ''; }
  return (
    <div id="sheet">
      <div className="scrim" data-act="close-picker"></div>
      <div className="sheet" role="dialog" aria-modal="true" aria-labelledby="sheet-title">
        <div className="grabber"></div>
        <p className="h-s" id="sheet-title">{pk.title || 'Date of birth'}</p>
        <div className="segmented" role="group" aria-label="Calendar">
          <button className="seg" aria-pressed={pk.cal === 'AD'} data-act="cal:AD">AD</button>
          <button className="seg" aria-pressed={pk.cal === 'BS'} data-act="cal:BS">BS</button>
        </div>
        <div className="wheels">
          <div className="band"></div>
          {/* A wheel rebuilds when its list changes: a new calendar, or a month with a different number of days. */}
          <Wheel key={`d${pk.cal}${r.days}`} id="w-d" label="Day" items={range(1, r.days)} idx={pk.d - 1} onPick={i => { pk.d = i + 1; paint(); }} />
          <Wheel key={`m${pk.cal}`} id="w-m" label="Month" items={r.months} idx={pk.m} onPick={i => { pk.m = i; paint(); }} />
          <Wheel key={`y${pk.cal}`} id="w-y" label="Year" items={r.years} idx={r.years.indexOf(pk.y)} onPick={i => { pk.y = r.years[i]; paint(); }} />
        </div>
        <div className="conversion" id="conv" aria-live="polite">{conv}</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>{btn('Done', 'picker-done')}{btn('Cancel', 'close-picker', { kind: 'secondary' })}</div>
      </div>
      <div className="sheet-home"></div>
    </div>);
}

// Scroll-snap wheel: 44px rows, selection is the centred row.
export function Wheel({ id, label, items, idx, onPick }) {
  const ul = useRef(), t = useRef(), [cur, setCur] = useState(idx);
  const at = () => Math.max(0, Math.min(items.length - 1, Math.round(ul.current.scrollTop / 44)));
  useLayoutEffect(() => { ul.current.scrollTop = idx * 44; }, []); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => () => clearTimeout(t.current), []);
  return (
    <div className="wheel"><span className="wl">{label}</span>
      <ul id={id} ref={ul} tabIndex={0} role="listbox" aria-label={label}
        onScroll={() => { setCur(at()); clearTimeout(t.current); t.current = setTimeout(() => onPick(at()), 100); }}
        onClick={e => { const i = [...ul.current.children].indexOf(e.target.closest('li')); if (i >= 0) ul.current.scrollTo({ top: i * 44, behavior: 'smooth' }); }}
        onKeyDown={e => { const k = { ArrowDown: 1, ArrowUp: -1 }[e.key]; if (k) { e.preventDefault(); ul.current.scrollTo({ top: (at() + k) * 44 }); } }}>
        {items.map((x, i) => <li key={i} role="option" aria-selected={i === cur} className={i === cur ? 'sel' : Math.abs(i - cur) === 1 ? 'n1' : ''}>{x}</li>)}
      </ul>
    </div>);
}

export function switchCal(cal) {
  const pk = S.picker;
  if (pk.cal === cal) return;
  const r = cal === 'BS' ? toBS(pk.y, pk.m, pk.d) : toAD(pk.y, pk.m, pk.d);
  if (!r) return;
  S.picker = { ...pk, cal, y: r.year, m: r.month, d: r.date };
  if (!pk.onDone) S.pickerCal = cal; // remembered for Date of birth only
  paint();
}

export function pickerDone() {
  const pk = S.picker;
  const ad = pk.cal === 'AD' ? { y: pk.y, m: pk.m, d: pk.d } : (a => a && { y: a.year, m: a.month, d: a.date })(toAD(pk.y, pk.m, pk.d));
  if (!ad) return;
  if (pk.onDone) { S.picker = null; pk.onDone(ad); return render(); } // another date field (doctor.jsx's follow-up, a medicine's end date)
  S.dob = `${pad(ad.d)} / ${pad(ad.m + 1)} / ${ad.y}`;
  S.picker = null; S.bsHint = null;
  S.dobErr = dobError();
  render();
}

// ---------- validation ----------
export function dobError() {
  if (!S.dob) return 'Enter your date of birth.';
  const p = parseDob(S.dob);
  if (!p || p.y < 1900) return 'Enter a real date, as DD / MM / YYYY.';
  if (new Date(p.y, p.m, p.d) > todayAD) {
    // The likeliest 'future' birth date in Nepal is a BS year typed as AD — open the picker on BS next time.
    S.pickerCal = 'BS';
    S.bsHint = p.y >= 2000 && p.y <= 2090 ? { y: p.y, m: p.m, d: p.d } : null;
    return `${p.y} is in the future in AD. If it's your BS year, choose BS in the date picker.`;
  }
  return '';
}

// Per-screen behaviour after a full render
Object.assign(mount, {
  splash: () => after(() => go('language', { replace: true }), 1800),
  returning: () => after(() => { S.loading = 'first'; toHome(); }, 1800), // signed in: straight to Home, no onboarding — skeletons while it loads
  phone: () => { if (S.codeFor === 'newphone') document.getElementById('tel').focus(); },
  code: () => {
    const input = document.getElementById('code-in');
    input.focus({ preventScroll: true });
    input.setSelectionRange(6, 6);
    if (S.codeState === 'typing') every(() => {
      S.resend--;
      if (S.resend <= 0) { S.codeState = 'noarrive'; S.code = ''; return render(); } // the countdown becomes the button
      paint();
    }, 1000);
  },
  locked: () => every(() => {
    S.lock--;
    if (S.lock <= 0) { S.tries = 3; S.lock = 14 * 60 + 52; S.stack = ['splash']; return go('phone', { replace: true }); }
    paint();
  }, 1000),
});

// ---------- actions ----------
export function sendCode() {
  const d = digits(S[telKey()] || '');
  if (!/^9\d{9}$/.test(d)) { S.phoneErr = true; paint(); document.getElementById('tel').focus(); return; } // keeps what was typed
  S.code = ''; S.codeState = 'typing'; S.resend = 42;
  go('code');
}

export function verify() {
  if (S.code.length < 6 || S.codeState === 'expired') return;
  if (S.code === CODE_OK && S.codeFor === 'newphone') { // the old number is told by SMS too
    Object.assign(S, { phone: S.newPhone, phoneChanged: true, codeFor: null, tries: 3 });
    return backTo('pfdetails');
  }
  if (S.code === CODE_OK && S.codeFor === 'addperson') { S.codeFor = null; S.tries = 3; return go('whos', { replace: true }); } // the other records on this number
  if (S.code === CODE_OK && S.codeFor === 'pinreset') { S.tries = 3; S.codeFor = null; S.pinEntry = ''; return go('pinnew', { replace: true }); } // PIN reset (health.jsx)
  if (S.code === CODE_OK) { S.tries = 3; S.signedIn = true; S.stack = []; return go('whos', { replace: true }); }
  if (S.code === CODE_EXPIRED) { S.codeState = 'expired'; return render(); }
  S.tries--;
  if (S.tries <= 0) { S.stack = ['splash', 'phone']; return go('locked', { replace: true }); }
  S.codeState = 'wrong'; // digits kept, tries left stated
  render();
}

export function createProfile() {
  S.nameErr = !S.name.trim();
  S.dobErr = dobError();
  S.sexErr = !S.sex;
  if (S.nameErr || S.dobErr || S.sexErr) return render(); // every missing field says what it needs, all at once
  if (/sharma/i.test(S.name)) return go('match'); // demo: a close, not exact, match
  S.fullName = S.name.trim(); S.first = S.fullName.split(' ')[0];
  S.healthEmpty = true; S.careEmpty = true; S.followup = null; // a new patient has no visits yet
  toHome(); // notifications are asked for later, after the first booking
}

export function endScreen(title, body) { S.endTitle = title; S.endBody = body; go('end'); }
export function toHome() { S.stack = []; S.screen = 'home'; S.picker = null; S.unlocked = false; S.bio = null; S.sheet = null; render(); } // leaving the tab re-locks Health

// data-act="name:arg" → ACTIONS.name(arg, el). The other modules add their own.
Object.assign(ACTIONS, {
  go: arg => go(arg),
  back,
  'splash-next': () => go('language', { replace: true }),
  'returning-next': () => toHome(),
  lang: (_, el) => { S.lang = el.dataset.v; paint(); },
  'send-code': sendCode,
  verify,
  'new-code': () => { S.code = ''; S.codeState = 'typing'; S.resend = 42; render(); },
  pick: arg => { S.fullName = arg; S.first = arg.split(' ')[0]; toHome(); }, // choosing yourself goes straight to Home
  'open-picker': openPicker,
  'close-picker': () => { S.picker = null; paint(); },
  cal: arg => switchCal(arg),
  'picker-done': pickerDone,
  'create-profile': createProfile,
  'session-code': () => { S.phone = S.phone || '9841000412'; S.code = ''; S.codeState = 'typing'; S.resend = 42; go('code'); },
  'session-other': () => { S.phone = ''; go('phone'); },
  end: arg => arg === 'book' ? go('finddoctor') : endScreen('Not in these flows', 'This tab is designed in another Figma section.'),
  restart: () => start('full'),
});

// ---------- review panel: every Figma screen and its caption ----------
FLOW.push(
  ['Onboarding', [
    ['01', 'Splash', 'Launch', "White on Surface/action is 5.63:1. The clinic's name is on the first screen, because the clinic is who the patient already trusts.", () => ({ screen: 'splash' })],
    ['02', 'Language', 'Continue', 'Asked in both scripts, because nobody has chosen yet. Nepali is set in Noto Sans Devanagari.', () => ({ screen: 'language' })],
    ['03', 'Onboarding — Book', 'Value 1 of 3', 'Each floating card is the real component the patient will meet. Level, never tilted.', () => ({ screen: 'onb1' })],
    ['04', 'Onboarding — Stay informed', 'Value 2 of 3', 'The one honest promise: we tell you when something changes. No wait estimate.', () => ({ screen: 'onb2' })],
    ['05', 'Onboarding — Your records', 'Value 3 of 3', 'Get started, or Skip from any value screen, goes to 06.', () => ({ screen: 'onb3' })],
  ]],
  ['Sign-in and sign-up', [
    ['06', 'Phone number', 'Sign in and sign up, one entry', 'No passwords. The number is how the clinic finds an existing record, which is what prevents duplicates.', () => ({ screen: 'phone' })],
    ['07', 'Verify code', 'Code by SMS', 'Verifies on the sixth digit; the button is a fallback. SMS autofill fills all six cells.', () => ({ screen: 'code', phone: '9841234412', code: '429' })],
    ['08', 'Wrong code', 'Branch from 07', 'Digits kept, tries left stated, a new code one tap away.', () => ({ screen: 'code', phone: '9841234412', code: '429173', codeState: 'wrong', tries: 2 })],
    ['09', "Who's using the app", 'Records found', 'Families share phones. Name and birth month only: enough to recognise yourself, not to expose a relative. Choosing yourself goes straight to Home.', () => ({ screen: 'whos' })],
    ['10', 'Create profile', 'Branch from 09, or no record', "Only for someone the clinic doesn't know yet. Date of birth in AD or BS. Then Home. Notifications are asked for later, after the first booking.", () => ({ screen: 'profile', stack: ['whos'] })],
  ]],
  ['Sign-in branches', [
    ['11', 'Invalid phone number', 'Branch from 06 — after tapping Send code', 'Shown on Send code, not while typing. Says what a valid number looks like, and keeps what was typed so it can be fixed rather than retyped.', () => ({ screen: 'phone', phone: '98412 345', phoneErr: true })],
    ['12', "Code didn't arrive", 'Branch from 07 — when the resend timer runs out', 'The countdown becomes the button. It suggests checking the number first, since a wrong number is the likeliest reason, and never promises how long a code takes.', () => ({ screen: 'code', phone: '9841234412', codeState: 'noarrive' })],
    ['13', 'Code expired', 'Branch from 07 — a code typed too late', "Names the cause and the fix. Verify is disabled because that code can't work. It doesn't state how long a code lasts — that's a backend rule this screen can't promise.", () => ({ screen: 'code', phone: '9841234412', code: '429173', codeState: 'expired' })],
    ['14', 'Too many tries', 'Branch from 08 — after the last wrong code', "Sign-in's counterpart to Health's lockout. No code cells, so nothing invites a tap that can't work. The countdown is the system's own timer, not an estimate. Reception can help anyone who can't wait.", () => ({ screen: 'locked', tries: 0 })],
  ]],
  ['Create profile', [
    ['15', 'Date of birth — AD', 'From 10 — tapping Date of birth', 'Wheels, because a birth date is decades back — a calendar grid would mean paging through hundreds of months. The line beneath gives the same date in BS.', () => ({ screen: 'profile', stack: ['whos'], picker: { cal: 'AD', y: 1994, m: 2, d: 14 } })],
    ['16', 'Date of birth — BS', 'Calendar switch', 'The switch changes the wheels to Bikram Sambat, and the line gives the AD date. Conversion comes from a published table, never a formula.', () => ({ screen: 'profile', stack: ['whos'], pickerCal: 'BS', picker: { cal: 'BS', y: 2050, m: 11, d: 1 } })],
    ['17', 'Profile filled', 'After Done', "The date shows in both calendars, as in Profile's Your details, so the clinic and the patient each see the one they use.", () => ({ screen: 'profile', stack: ['whos'], name: 'Anisha Sharma', dob: '14 / 03 / 1994', sex: 'Female' })],
    ['18', 'Create profile — missing details', 'Branch from 10 — Create profile with fields empty', "Every missing field says what it needs, all at once. The button stays enabled: a disabled button can't say what's wrong. Choosing a sex clears its error.", () => ({ screen: 'profile', stack: ['whos'], nameErr: true, dobErr: 'Enter your date of birth.', sexErr: true })],
    ['19', 'Create profile — future date', 'Branch from 17 — a date typed into the field', "The likeliest 'future' birth date in Nepal is a BS year typed as AD — 2050 BS is 1993–94. The message says so, and the field opens the picker on BS.", () => ({ screen: 'profile', stack: ['whos'], name: 'Anisha Sharma', dob: '01 / 12 / 2050', sex: 'Female', dobErr: "2050 is in the future in AD. If it's your BS year, choose BS in the date picker.", pickerCal: 'BS', bsHint: { y: 2050, m: 11, d: 1 } })],
  ]],
  ['Returning and matching', [
    ['20', 'Returning — signed in', 'Opening the app while signed in', "The splash goes straight to Home — no onboarding. The Health lock still applies: being signed in isn't the same as unlocking the records.", () => ({ screen: 'returning', signedIn: true })],
    ['21', 'Session expired', 'Opening the app after a long time away', 'Says why in one line and that the records are safe. The quickest way back is a code to the number on file; the record chooser follows, as it should on a shared phone. No session length is stated — that\'s a security setting.', () => ({ screen: 'session', phone: '9841000412' })],
    ['22', 'Possible match', 'After Create profile — a close, not exact, match', "A patient can't confirm a partial match: one wrong tap would merge someone else's history into their record. Reception checks it with ID. Nothing from the matching record is shown — it may be someone else's. Booking stays open meanwhile.", () => ({ screen: 'match', stack: ['whos', 'profile'], name: 'Anisha Sharma', dob: '14 / 03 / 1994', sex: 'Female' })],
    ['23', 'Records waiting for confirmation', 'The Health tab for this patient, instead of the lock', "Says why the records aren't here and when they'll appear, and keeps booking one tap away.", () => ({ screen: 'waiting' })],
  ]],
  ['Legal', [
    ['24', 'Terms of use', 'From 06 — the consent line', "Opens from the consent line on Phone number. 'In short' first — the few things a patient needs — then the detail. Draft wording, marked as such, for City Hospital's legal team to replace.", () => ({ screen: 'terms', stack: ['phone'] })],
    ['25', 'Privacy policy', 'From 06 — the consent line', "The same shape. 'In short' says who sees the records, that they're never sold or used for ads, and that the patient can see, correct or close their account. Retention is 'as the law requires' — the clinic's lawyers set the real terms.", () => ({ screen: 'privacy', stack: ['phone'] })],
  ]],
);
export let ALL = [];

export function boot() {
  ALL = FLOW.flatMap(([, items]) => items); // each screen's caption, for the note; the presets are test fixtures
  start('full');
}

// Two ways in: a returning patient with everything, or a new patient with nothing yet.
export let casesOpen = false, starts = 0;
export function start(kind) {
  reset();
  if (kind === 'doctor') Object.assign(S, DOCTOR_START()); // doctor.jsx
  if (kind === 'desk') Object.assign(S, DESK_START()); // desk.jsx
  if (kind === 'staff') Object.assign(S, STAFF_START()); // staff.jsx
  if (kind === 'empty') Object.assign(S, { screen: 'home', signedIn: true, healthEmpty: true, careEmpty: true, followup: null, meds: [], notifs: [] });
  starts++; // the notification-centre picker goes back to 'Visit updates'
  casesOpen = false;
  render();
}
export const jumpTo = n => { reset(ALL.find(x => x[0] === n)[4]()); render(); }; // tests only
export const showCases = () => { casesOpen = true; paint(); }; // tests only

export function currentN() {
  if (S.sheet === 'cal') return 'K02'; if (S.sheet === 'calno') return 'K04'; // calendar sheets, over any screen
  const s = S, hook = NUM[s.screen]?.(s);
  if (hook) return hook;
  switch (s.screen) {
    case 'splash': return '01'; case 'language': return '02';
    case 'onb1': return '03'; case 'onb2': return '04'; case 'onb3': return '05';
    case 'phone': return s.phoneErr ? '11' : '06';
    case 'code': return { typing: '07', wrong: '08', noarrive: '12', expired: '13' }[s.codeState];
    case 'locked': return '14'; case 'whos': return '09';
    case 'profile':
      if (s.picker) return s.picker.cal === 'BS' ? '16' : '15';
      if (s.nameErr || s.sexErr || s.dobErr === 'Enter your date of birth.') return '18';
      if (s.dobErr) return '19';
      return s.name && s.dob && s.sex ? '17' : '10';
    case 'returning': return '20'; case 'session': return '21'; case 'match': return '22';
    case 'waiting': return '23'; case 'terms': return '24'; case 'privacy': return '25';
  }
  return null;
}

// Top tabs: one per role, all on the same day. A staff tab signs straight in as that person.
export const STAFF_TAB = { hr: 'ab', reception: 'sbr', admin: 'rk' };
export let staffTab = 'admin'; // which staff tab stays lit on the signed-out sign-in screen
export function pickTab(t) {
  const who = STAFF_TAB[t];
  if (!who) { showApp(t); return paint(); }
  staffTab = t;
  showApp('staff');
  if (S.stMe !== who) { S.stMe = who; Object.assign(S, { stMenu: null, stack: [], screen: stHome() }); }
  render();
}
// Bottom tabs: the whole flow from sign-in, the empty day, or the edge-case controls.
export function pickCase(c) {
  if (c === 'edge') { casesOpen = !casesOpen; return paint(); }
  if (c === 'full') return start(S.app === 'patient' ? 'full' : S.app);
  if (S.app === 'patient') return start('empty');
  casesOpen = false; // like start(), leaving the edge-case panel
  S[S.app === 'staff' ? 'stHoliday' : 'drNoPatients'] = true;
  render();
}
export const setS = e => { const el = e.target; S[el.dataset.s] = el.type === 'checkbox' ? el.checked : el.value; render(); }; // panel demo controls

// ---------- the page: role tabs, the phone (or desktop) stage, case tabs and the edge-case panel ----------
export function Phone() {
  const ref = useRef();
  useLayoutEffect(() => { // after every commit: per-screen behaviour on a full render, and the app bar's scroll seam
    if (takeRemount()) mount[S.screen]?.();
    const body = ref.current.querySelector('.body'), bar = ref.current.querySelector('.appbar');
    if (body && bar) body.onscroll = () => bar.classList.toggle('seam', body.scrollTop > 0); // Scrolled: a seam, not a shadow
  });
  const desk = S.app === 'desk' || S.app === 'staff'; // the desktop apps (desk.jsx, staff.jsx) render at 1440 × 900
  // The desktop apps are drawn at their real size and scaled to fit between the tab bars; the phones are 1:1.
  const k = desk ? Math.max(.3, Math.min(1, (window.innerWidth - 48) / 1440, (window.innerHeight - 160) / 900)) : 1;
  const el = SCREENS[S.screen](), ov = OVERLAY[S.sheet]?.(); // bottom sheets any screen can open (care.jsx)
  const screen = cloneElement(el, { key: S.screen }, ...[].concat(el.props.children), ...(ov ? [ov] : []));
  const onClick = e => {
    if (!interceptLink(e)) { // calls and maps go through the phone's own prompt first (more.jsx)
      const a = e.target.closest('[data-act]');
      if (a && !a.disabled) {
        const [act, arg] = a.dataset.act.split(/:(.*)/s);
        if (a.tagName === 'A') e.preventDefault();
        ACTIONS[act]?.(arg, a);
      }
    }
    phoneListeners.click.forEach(f => f(e));
  };
  const onKeyDown = e => {
    if (e.key === 'Escape' && S.picker) { S.picker = null; paint(); }
    phoneListeners.keydown.forEach(f => f(e));
  };
  return (
    <div className={`phone${desk ? ' desk' : ''}`} id="phone" aria-live="polite" ref={ref} style={{ '--k': k.toFixed(3) }} onClick={onClick} onKeyDown={onKeyDown}
      onSubmit={e => e.preventDefault()}>{/* a form never navigates; buttons inside one would submit it */}
      {screen}
      {S.picker && <DobSheet />}
    </div>);
}

export function Note() {
  const n = currentN(), item = ALL.find(x => x[0] === n);
  return <section className="note" id="note">{item
    ? <><small>{n} · {item[2]}</small><strong>{item[1]}</strong><p>{item[3]}</p></>
    : <><small>Out of scope</small><strong>{S.endTitle}</strong><p>This screen isn't designed in the Figma sections this prototype covers.</p></>}</section>;
}

// Edge-case panel controls: label above, the Figma numbers each one reaches beside it.
export const pnCheck = (key, text, refs = '') => <label className="pn-check"><input type="checkbox" data-s={key} id={key === 'offline' ? 'offline' : undefined} checked={!!S[key]} onChange={setS} />
  <span>{text}{refs ? <small>{refs}</small> : null}</span></label>;
export const pnField = (text, control) => <label className="pn-field"><span>{text}</span>{control}</label>;
export const pnChoose = (key, text, options) => pnField(text, <select data-s={key} value={S[key] ?? ''} onChange={setS}>
  {options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>);

export function Shell() {
  const [, force] = useReducer(x => x + 1, 0);
  useEffect(() => subscribe(force), []);
  useEffect(() => { window.addEventListener('resize', paint); return () => window.removeEventListener('resize', paint); }, []);
  const openAsRef = useRef();
  const tab = S.app !== 'staff' ? S.app : ({ admin: 'admin', desk: 'reception', hr: 'hr' })[stMe()?.access] || staffTab;
  const kind = casesOpen ? 'edge' : (S.app === 'patient' ? S.careEmpty : S.app === 'staff' ? S.stHoliday : S.drNoPatients) ? 'empty' : 'full';
  const roleTab = (t, l) => <button className="tab" data-tab={t} aria-current={tab === t} onClick={() => pickTab(t)}>{l}</button>;
  const caseTab = (c, l) => <button className="tab" data-case={c} aria-current={kind === c} onClick={() => pickCase(c)}>{l}</button>;
  return (
    <div className="shell">
      <nav className="tabs" aria-label="Who's using Clinica">
        {roleTab('patient', 'Patient')}{roleTab('doctor', 'Doctor (Mobile)')}{roleTab('desk', 'Doctor Dashboard')}
        {roleTab('hr', 'HR Manager')}{roleTab('reception', 'Reception')}{roleTab('admin', 'Top Level Management')}
      </nav>

      <main className="stage"><Phone /></main>

      <nav className="tabs" aria-label="Cases">
        {caseTab('full', 'Full flow')}{caseTab('empty', 'Empty cases')}{caseTab('edge', 'Edge cases')}
      </nav>

      <aside className="panel" id="cases" hidden={!casesOpen} aria-label="Edge cases">
        <header className="pn-head"><div><h2>Edge cases</h2><p>States you can't tap your way into</p></div>
          <button className="icon-btn" aria-label="Close edge cases" onClick={() => pickCase('edge')}><img src={`${A}icon-close.svg`} width="20" height="20" alt="" /></button></header>
        <Note />
        {S.app === 'patient' ? <>
        <section className="pn-sec"><h3>Open the app as</h3>
          <div className="pn-row"><select id="open-as" ref={openAsRef} defaultValue="signedin" aria-label="Open the app as"><option value="signedin">Signed in — Home loads</option><option value="slow">Slow connection</option><option value="session">Session expired</option><option value="update">Update required</option><option value="maint">Maintenance</option><option value="lock">Lock screen — visit updates</option><option value="push">Lock screen — low-stock alert</option></select>
            <button className="btn secondary s" onClick={() => openAs(openAsRef.current.value)}>Open</button></div>
        </section>
        <section className="pn-sec"><h3>Patient app</h3>
          {pnChoose('homeState', 'Home today', [['default', 'Your visit'], ['cancelled', 'Doctor cancelled today'], ['walkin', 'Walk-in, checked in']])}
          {pnChoose('visitDay', "Today's visit (Care, Home)", [['booked', 'Booked'], ['late', 'Doctor running late'], ['ontime', 'Delay cleared'], ['checkedin', 'Checked in'], ['turn', 'Your turn'], ['with', 'With the doctor'], ['done', 'Visit complete'], ['missed', 'Missed']])}
          {pnField('Notification centre shows', <select id="notif-set" key={starts} defaultValue="visits" onChange={e => notifSet(e.target.value)}><option value="visits">Visit updates</option><option value="more">More kinds of update</option><option value="meds">Medicine alerts</option></select>)}
          {pnChoose('failNext', 'Next “Confirm booking”', [['', 'Works'], ['taken', 'Fails — slot taken (B08, SC03)'], ['noreply', 'Gets no reply (SB05)']])}
          <div className="pn-checks">
            {pnCheck('offline', 'Phone is offline', 'A16 · SB04')}
            {pnCheck('notifOff', "Phone blocks Clinica's notifications", 'N03 · P09')}
            {pnCheck('calOff', 'Calendar access is off', 'K04')}
            {pnCheck('fingerChanged', 'A new fingerprint was added', 'HM07')}
            {pnCheck('noSensor', 'No fingerprint sensor', 'HM13')}
            {pnCheck('cancelSoon', 'Follow-up is within 2 hours', 'Late cancel')}
            {pnCheck('rsNone', 'No other times this week', 'Reschedule')}
            {pnCheck('careErr', 'Care fails to load')}
          </div>
        </section>
        <details className="pn-sec pn-tips"><summary>Test data and tips</summary>
          <ul>
            <li>Mobile number: 10 digits starting with 9, e.g. <code>9841234412</code>.</li>
            <li>Code <code>123456</code> is right. <code>000000</code> has expired. Any other code is wrong; three wrong codes lock sign-in.</li>
            <li>Any name containing “Sharma” counts as a possible match (22). Other names create a new profile.</li>
            <li>Signing in lands on Home (B01). Book a visit → Dr. Priya Sharma → pick a time → Book → Confirm.</li>
            <li>Health opens behind a Clinica PIN. The first unlock asks you to create one; after that, a wrong PIN five times locks it for 30 seconds.</li>
            <li>With fingerprint on, the first touch isn't recognised and the second one is, so both states show.</li>
            <li>Ask: tap a suggestion, type a question, or tap the mic (it “hears” “What's coming up?”). Try “I have chest pain”, “Is my thyroid result normal?” or “Show me my insurance details”.</li>
            <li>Care and Profile: Switch person → Ramesh Sharma takes PIN <code>1961</code>.</li>
          </ul>
        </details>
        </> : <>
        {/* Doctor (mobile and dashboard) or staff: only that app's situations and sign-ins */}
        <section className="pn-sec"><h3>{S.app === 'staff' ? 'Staff app' : 'Doctor app'}</h3>
          <div className="pn-checks">{S.app === 'staff' ? pnCheck('stHoliday', 'Public holiday', 'T01b · R01b') : <>{pnCheck('drNoPatients', 'No patients today')}{pnCheck('drOffline', 'Offline', 'D02e · K10c')}</>}</div>
        </section>
        <details className="pn-sec pn-tips"><summary>Test data and tips</summary>
          <ul>
            <li>Every tab shares the same day: what happens here shows on the patient's phone too.</li>
            {S.app === 'staff'
              ? <li>Admin <code>CH-ADM-04</code>, front desk <code>CH-FD-12</code>, HR <code>CH-HR-03</code>. Password <code>clinica</code>.</li>
              : <li>Doctor staff ID <code>CH-0231</code>. Password <code>clinica</code>.</li>}
          </ul>
        </details>
        </>}
      </aside>
    </div>);
}
