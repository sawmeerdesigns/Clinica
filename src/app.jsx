// Clinica — Onboarding, Sign in and Sign up prototype.
// Figma: zw3saW6ot26E6gWH20K3ux, section 118:6259. Screens 01–25 are screens or states below.
import { cloneElement, useEffect, useLayoutEffect, useReducer, useRef, useState } from 'react';
import { ask, say, src } from './ask.jsx';
import { backTo, bar, label, row, rows, tag, when } from './booking.jsx';
import { emergency, setting, usePerson } from './care.jsx';
import { $phone, A, ACTIONS, FLOW, NUM, OVERLAY, S, SCREENS, after, back, every, go, later, mount, paint, phoneListeners, render, reset, sepJoin, subscribe, takeRemount, toast, tr, NE, nd, ne } from './core.jsx';
import { DESK_START } from './desk.jsx';
import { DOCTOR_START, drOffline, showApp } from './doctor.jsx';
import { HEALTH_SCREENS, PIN_SCREENS, centred, field, lead, list, unlock } from './health.jsx';
import { interceptLink, notifSet, openAs } from './more.jsx';
import { SA, STAFF_START, cell, checks, counts, img, now, patients, person, drJoin, stHome, stMe, wkFilled } from './staff.jsx';

// Phase 8: Nepali for this module's own lines (sign-in, onboarding, create profile, the date picker)
Object.assign(NE, {
  'Your clinic, in your pocket.': 'तपाईंको क्लिनिक, तपाईंको खल्तीमा।', 'City Hospital': 'सिटी हस्पिटल', 'You can change this any time in Profile.': 'यो जुनसुकै बेला प्रोफाइलमा बदल्न सकिन्छ।',
  "Book with your clinic's own doctors.": 'आफ्नै क्लिनिकका डाक्टरसँग बुक गर्नुहोस्।', 'See who is in today and choose a time that suits you.': 'आज को-को हुनुहुन्छ हेर्नुहोस् र आफूलाई मिल्ने समय छान्नुहोस्।',
  'Know the moment something changes.': 'केही बदलिनासाथ थाहा पाउनुहोस्।', "If your doctor is running late or a visit moves, we'll tell you straight away.": 'डाक्टर ढिला हुनुभयो वा भेटको समय सर्‍यो भने हामी तुरुन्तै खबर गर्छौं।',
  "Your slot is kept, and we'll message you when she's ready.": 'तपाईंको समय सुरक्षित छ। उहाँ तयार हुनुभएपछि हामी खबर गर्छौं।',
  'Everything your doctor tells you, in one place.': 'डाक्टरले भन्नुभएका सबै कुरा, एकै ठाउँमा।', 'Visits, prescriptions and reports in one place, to read again later.': 'भेट, प्रेस्क्रिप्सन र रिपोर्ट एकै ठाउँमा, पछि फेरि पढ्न।',
  'Prescription from Dr. Sharma': 'Dr. Sharma को प्रेस्क्रिप्सन', 'Three times a day, after food': 'दिनको 3 पटक, खाना खाएपछि',
  'A doctor in a white coat with a stethoscope': 'सेतो कोट लगाएका, स्टेथोस्कोपसहितका डाक्टर', Back: 'पछाडि', Main: 'मुख्य', 'Phone number': 'फोन नम्बर',
  'Your new mobile number': 'तपाईंको नयाँ मोबाइल नम्बर', "We'll text a code to check it. Your records stay the same.": 'जाँच्न हामी एउटा कोड SMS गर्छौं। तपाईंका रेकर्ड जस्ताको तस्तै रहन्छन्।',
  "Didn't get it? Check the number above is right, then send a new one.": 'कोड आएन? माथिको नम्बर सही छ कि हेर्नुहोस्, अनि नयाँ कोड पठाउनुहोस्।',
  'That code has expired. Send a new one and enter it as soon as it arrives.': 'त्यो कोडको समय सकियो। नयाँ कोड पठाउनुहोस् र आउनासाथ हाल्नुहोस्।', '6-digit code': '6 अङ्कको कोड',
  'For your safety, sign-in is paused for this number. Wait, or ask reception to help you sign in.': 'तपाईंको सुरक्षाका लागि यो नम्बरबाट साइन इन केही समय रोकिएको छ। पर्खनुहोस्, वा साइन इन गर्न रिसेप्सनको मद्दत लिनुहोस्।',
  'Anyone who signs in with this number will be asked this, so each person only sees their own record.': 'यो नम्बरबाट साइन इन गर्ने सबैलाई यही सोधिन्छ, ताकि हरेकले आफ्नै रेकर्ड मात्र देखून्।',
  'Choose date of birth': 'जन्म मिति छान्नुहोस्', 'DD / MM / YYYY': 'गते / महिना / वर्ष', 'Enter a real date, as DD / MM / YYYY.': 'सही मिति लेख्नुहोस्: गते / महिना / वर्ष।',
  'She/her': 'उनी (महिला)', 'He/him': 'उनी (पुरुष)', 'They/them': 'उनी (लिङ्ग नतोकी)', Calendar: 'पात्रो',
  'City Hospital has a record close to the details you entered, but not an exact match. To keep your health records together and correct, reception will check it with you.':
    'तपाईंले हालेको विवरणसँग मिल्दोजुल्दो एउटा रेकर्ड सिटी हस्पिटलमा छ, तर पूरा मिल्दैन। तपाईंका स्वास्थ्य रेकर्ड एकै ठाउँमा र सही राख्न रिसेप्सनले तपाईंसँगै जाँच्नेछ।',
  'Bring your ID to your next visit. You can book now; your health records will show in the app once reception confirms.':
    'अर्को भेटमा आफ्नो परिचयपत्र (ID) ल्याउनुहोस्। अहिले नै बुक गर्न सक्नुहुन्छ; रिसेप्सनले पुष्टि गरेपछि तपाईंका स्वास्थ्य रेकर्ड एपमा देखिनेछन्।',
  'Your records are waiting for reception': 'तपाईंका रेकर्ड रिसेप्सनको पुष्टि पर्खिरहेका छन्',
  'Reception will confirm your details at your next visit. Your visits, prescriptions and reports will appear here then.': 'अर्को भेटमा रिसेप्सनले तपाईंको विवरण पुष्टि गर्नेछ। त्यसपछि तपाईंका भेट, प्रेस्क्रिप्सन र रिपोर्ट यहाँ देखिनेछन्।',
  "For your security, you're signed out after a long time away. Your health records are safe.": 'तपाईंको सुरक्षाका लागि, लामो समय प्रयोग नगर्दा साइन आउट हुन्छ। तपाईंका स्वास्थ्य रेकर्ड सुरक्षित छन्।',
  'Mobile number changed.': 'मोबाइल नम्बर बदलियो।',
});
export const ND = window.NepaliDate.default; // Published Bikram Sambat table (2000–2090 BS), never a formula

// Demo backend
export const CODE_OK = '123456';
export const CODE_EXPIRED = '000000';
export const RECORDS = [{ name: 'Anisha Sharma', born: 'March 1994' }, { name: 'Ramesh Sharma', born: 'June 1961', managedBy: 'Anisha Sharma' }]; // F14/R11: Anisha manages her father's profile
// F22/R22/T22: the demo family's records belong to 9841234412 only. Another number sees none (an empty number is a jumped-to demo state).
export const FAMILY_NO = '9841234412';
export const family = () => !S.phone || digits(S.phone) === FAMILY_NO ? RECORDS : [];

export const AD_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
export const AD_LONG = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
export const BS_MONTHS = ['Baisakh', 'Jestha', 'Asar', 'Shrawan', 'Bhadra', 'Ashwin', 'Kartik', 'Mangsir', 'Poush', 'Magh', 'Falgun', 'Chaitra'];

// ---------- helpers ----------
export const digits = s => s.replace(/\D/g, '');
export const telKey = () => S.codeFor === 'newphone' ? 'newPhone' : 'phone'; // Profile › change number reuses sign-in's screens
export const masked = () => { const d = digits(S[telKey()] || '') || '9841000412'; return `+977 ${d.slice(0, 2)}•• ••• ${d.slice(-3)}`; };
// Run 6 Y26: on screen the masked number; a screen reader hears "number ending in 412", not the bullets.
export const maskedEl = () => <><span aria-hidden="true">{masked()}</span><span className="vh">{ne() ? `${nd(masked().slice(-3))} मा सकिने नम्बर` : `number ending in ${masked().slice(-3)}`}</span></>;
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
    {back && <button className="icon-btn" data-act="back" aria-label={tr('Back')}><img src={`${A}icon-back.svg`} width="24" height="24" alt="" /></button>}
    {title ? <h1 className="title">{tr(title)}</h1> : <div className="title"></div>}<div className="slot"></div>{/* W13: a titled bar is the screen's heading */}
  </div>);
export const heading = (h, p, cls = 'h-xl', H = 'h1') => ( // W13: the screen's heading; pass 'h2' under a titled bar
  <div className="inset"><div className="heading"><H className={cls}>{tr(h)}</H>{p ? <p className="lede">{tr(p)}</p> : null}</div></div>); // F15/R12: tr() in the shared helpers
export const btn = (label, act, { kind = 'primary', disabled = false, size = '' } = {}) =>
  <button className={`btn ${kind} ${size}`} data-act={act} disabled={disabled}>{tr(label)}</button>;
export const support = (msg, tone = '', icon = '') => (
  <div className={`support ${tone}`}>{icon ? <img src={`${A}${icon}`} width="14" height="14" alt="" /> : null}<p>{tr(msg)}</p></div>);

// ---------- screens ----------
Object.assign(SCREENS, {
  splash: (act = 'splash-next') => (
    <div className="screen bold" data-act={act}>
      {statusBar(true)}
      <div className="splash-body"><h1 className="wordmark">Clinica</h1>{/* W13 */}<p style={{ fontSize: 16, lineHeight: '24px' }}>{tr('Your clinic, in your pocket.')}</p></div>
      <div className="clinic">{ne() ? <><p className="h-s">सिटी हस्पिटल</p><p style={{ fontSize: 14, lineHeight: '20px' }}>का लागि</p></> /* Phase 8: 'for' follows the name in Nepali */
        : <><p style={{ fontSize: 14, lineHeight: '20px' }}>for</p><p className="h-s">City Hospital</p></>}</div>
      {homeInd(true)}
    </div>),

  language: () => (
    <div className="screen">
      {statusBar()}
      <div className="body" style={{ paddingTop: 48 }}>
        <div className="inset"><div className="heading" style={{ gap: 4 }}>
          <h1 className="h-xl">Choose your language</h1>{/* W13 */}
          <h2 className="h-xl deva" style={{ color: 'var(--text-secondary)' }}>भाषा छान्नुहोस्</h2>
        </div></div>
        <div className="inset"><div className="tiles" role="radiogroup" aria-label={tr('Language')}>
          {[['en', 'English', ''], ['ne', 'नेपाली', 'deva']].map(([v, l, c]) => (
            <button key={v} className="tile" role="radio" aria-checked={S.lang === v} data-act="lang" data-v={v}>
              <img className="off" src={`${A}translate-secondary.svg`} width="28" height="28" alt="" />
              <img className="on" src={`${A}translate-action.svg`} width="28" height="28" alt="" />
              <span className={c}>{l}</span>
            </button>))}
        </div></div>
        <div className="inset"><p className="body-s">{tr('You can change this any time in Profile.')}</p></div>
      </div>
      <div className="cta">{btn('Continue', 'go:onb1')}</div>
      {homeInd()}
    </div>),

  onb1: () => onboarding(1, "Book with your clinic's own doctors.", 'See who is in today and choose a time that suits you.',
    <div className="card">
      <div className="avatar" aria-hidden="true">PS</div>{/* Run 7: a doctor the demo hospital really has */}
      <div className="doctor"><p className="h-s">Dr. Priya Sharma</p><p className="spec">{tr('General medicine')}</p><span className="tag">{tr('Available today')}</span></div>
    </div>),
  onb2: () => onboarding(2, 'Know the moment something changes.', "If your doctor is running late or a visit moves, we'll tell you straight away.",
    <div className="card info"><div className="text"><p className="h-s">{tr('Dr. Sharma is running late')}</p>
      <p className="body-s">{tr("Your slot is kept, and we'll message you when she's ready.")}</p></div></div>),
  onb3: () => onboarding(3, 'Everything your doctor tells you, in one place.', 'Visits, prescriptions and reports in one place, to read again later.',
    <div className="card">
      <div className="lead-tile"><img src={`${A}icon-prescription.svg`} width="20" height="20" alt="" /></div>
      <div className="text"><p className="item-title">{tr('Prescription from Dr. Sharma')}</p><p className="body-s">{tr('Three times a day, after food')}</p></div>
    </div>),

  phone: () => (
    <div className="screen">
      {statusBar()}{appBar()}
      <div className="body">
        {S.codeFor === 'newphone' ? heading('Your new mobile number', "We'll text a code to check it. Your records stay the same.")
          : heading('Your mobile number', "We'll text a 6-digit code. Use the number your clinic has on file, so we can find your records.")}
        <div className="inset"><div className="field-wrap">
          <label className="label" htmlFor="tel">{tr('Mobile number')}</label>
          <div className={`field ${S.phoneErr ? 'err' : ''}`} id="tel-field">
            <span className="dial"><span className="flag-np" aria-hidden="true"></span>+977<img src={`${A}icon-chevron-down.svg`} width="20" height="20" alt="" /></span>
            <span className="divider"></span>
            <input id="tel" type="tel" inputMode="tel" autoComplete="tel-national" placeholder={tr('Phone number')} aria-describedby="tel-msg"
              value={S[telKey()] || ''}
              onChange={e => { S[telKey()] = e.target.value; S.phoneErr = false; paint(); }}
              onKeyDown={e => { if (e.key === 'Enter') sendCode(); }} />
          </div>
          <div id="tel-msg">{S.phoneErr
            ? support('Nepali mobile numbers are 10 digits, starting with 9.', 'err')
            : support('Only used to sign you in and send visit updates.')}</div>
        </div></div>
        {S.codeFor === 'newphone' ? <div style={{ height: 40, flex: 'none' }}></div> : <div className="inset"><p className="consent">{ne() ? <>जारी राख्दा तपाईं <a href="#" data-act="go:terms">{tr('Terms of use')}</a> र <a href="#" data-act="go:privacy">{tr('Privacy policy')}</a> स्वीकार गर्नुहुन्छ।</>
          : <>By continuing, you agree to the <a href="#" data-act="go:terms">Terms of use</a> and <a href="#" data-act="go:privacy">Privacy policy</a>.</>}</p></div>}
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
                <p style={{ fontWeight: 600, color: 'var(--text-tertiary)' }} id="resend">{ne() ? `${mmss(S.resend)} पछि नयाँ कोड पठाउन सकिन्छ` : `Resend code in ${mmss(S.resend)}`}</p>
                <p>{tr('Wrong number?')} <a href="#" className="link" data-act="back" style={{ color: 'inherit' }}>{tr('Go back to change it.')}</a></p></div>,
      wrong: support(ne() ? `कोड मिलेन। अब ${S.tries} पटक प्रयास गर्न बाँकी छ।` : `That code didn't match. ${S.tries} ${S.tries === 1 ? 'try' : 'tries'} left.`, 'err', 'icon-error.svg'),
      noarrive: support("Didn't get it? Check the number above is right, then send a new one.", '', 'icon-info.svg'),
      expired: support('That code has expired. Send a new one and enter it as soon as it arrives.', 'err', 'icon-error.svg'),
    }[st];
    const canVerify = S.code.length === 6 && st !== 'expired';
    return (
    <div className="screen">
      {statusBar()}{appBar()}
      <div className="body">
        {heading('Enter the code', ne() ? <>{maskedEl()} मा SMS बाट पठाइयो।</> : <>Sent by SMS to {maskedEl()}.</>)}
        <div className="inset"><div className="code-wrap">
          <div className={`code ${err ? 'err' : ''}`} id="code">{cells}
            <input className="cell-input" id="code-in" type="text" inputMode="numeric" autoComplete="one-time-code" maxLength={6}
              aria-label={tr('6-digit code')} aria-describedby="code-msg" aria-invalid={err || undefined} value={S.code} onChange={e => {
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
        <div className="inset">{support(ne() ? <><span id="lock">{mmss(S.lock)}</span> पछि फेरि प्रयास गर्न सक्नुहुन्छ।</> : <>You can try again in <span id="lock">{mmss(S.lock)}</span>.</>, 'warn', 'icon-warning-info.svg')}</div>
        <div className="inset"><a className="btn secondary" href="tel:+97710000000">{tr('Call the clinic')}</a></div>
      </div>
      {homeInd()}
    </div>),

  whos: () => (
    <div className="screen">
      {statusBar()}{appBar({ back: false })}
      <div className="body g20">
        {heading("Who's using the app?", ne() ? `धेरै परिवारले एउटै फोन चलाउने भएकाले यो नम्बरमा सिटी हस्पिटलसँग ${family().length} जनाको रेकर्ड छ। आफ्नो छान्नुहोस्।`
          : `City Hospital has ${family().length} records for this number, because many families share a phone. Choose yours.`)}
        <div className="list">
          {sepJoin([...family().map(r => listItem('icon-person.svg', r.name, ne() ? `जन्म ${nd(r.born)}` : `Born ${r.born}`, `pick:${r.name}`)),
            listItem('icon-add.svg', 'Someone else', 'Create a new profile', 'go:profile')])}
        </div>
        <div className="inset"><p className="body-s tertiary">{tr('Anyone who signs in with this number will be asked this, so each person only sees their own record.')}</p></div>
      </div>
      {homeInd()}
    </div>),

  profile: () => {
    const p = parseDob(S.dob), bs = p && toBS(p.y, p.m, p.d);
    const dobMsg = S.dobErr ? support(dobText(S.dobErr), 'err') : support(bs ? tr(bsText(bs)) : 'AD or BS — choose in the date picker.');
    return (
    <div className="screen">
      {statusBar()}{appBar()}
      <div className="body g20">
        {heading('Create your profile', 'The clinic uses this to find you at reception.')}
        <div className="inset"><form id="pf" noValidate style={{ display: 'flex', flexDirection: 'column', gap: 16 }} onSubmit={e => { e.preventDefault(); createProfile(); }}>
          <div className="field-wrap">
            <label className="label" htmlFor="name">{tr('Full name')}</label>{/* F15/R12 */}
            <div className={`field ${S.nameErr ? 'err' : ''}`}><input id="name" autoComplete="name" placeholder={tr('Your full name')} value={S.name}
              onChange={e => { S.name = e.target.value; if (S.nameErr && S.name.trim()) S.nameErr = false; paint(); }} /></div>
            <div id="name-msg">{S.nameErr ? support('Enter your full name, as the clinic has it.', 'err') : null}</div>
          </div>
          <div className="field-wrap">
            <label className="label" htmlFor="dob">{tr('Date of birth')}</label>
            <div className={`field ${S.dobErr ? 'err' : ''}`}>
              <button type="button" className="cal-btn" data-act="open-picker" aria-label={tr('Choose date of birth')}><img src={`${A}icon-calendar.svg`} width="20" height="20" alt="" /></button>
              <input id="dob" inputMode="numeric" autoComplete="bday" placeholder={tr('DD / MM / YYYY')} value={S.dob}
                onClick={() => { if (!S.dob) openPicker(); }} // F26: tapping the empty field opens the picker; a typed date stays editable
                onChange={e => { S.dob = maskDob(e.target.value); S.dobErr = ''; paint(); }}
                onBlur={() => { if (S.dob.length === 14) { S.dobErr = dobError(); S.dobErr ? render() : paint(); } }} />
            </div>
            <div id="dob-msg">{dobMsg}</div>
          </div>
          <fieldset className={`radio-group ${S.sexErr ? 'err' : ''}`} id="sex">
            <legend>{tr('Sex')}</legend>
            <div className="radio-options roomy">{/* R25: one per row, full-width targets */}
              {['Female', 'Male', 'Other'].map(v => <label key={v} className="radio"><input type="radio" name="sex" value={v} aria-label={tr(v)} checked={S.sex === v}
                onChange={() => { S.sex = v; S.sexErr = false; paint(); }} /><span aria-hidden="true">{tr(v)}</span></label>)}{/* W18: read once, as the radio */}
            </div>
            <div id="sex-msg">{S.sexErr ? support('Choose one.', 'err') : null}</div>
          </fieldset>
          <fieldset className="radio-group" id="pronouns">{/* V16: optional, with Prefer not to say */}
            <legend>{tr('Pronouns (optional)')}</legend>
            <div className="radio-options roomy">
              {['She/her', 'He/him', 'They/them', 'Prefer not to say'].map(v => <label key={v} className="radio"><input type="radio" name="pronouns" value={v} checked={S.pronouns === v}
                onChange={() => { S.pronouns = v; paint(); }} />{tr(v)}</label>)}
            </div>
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
        <div className="inset"><div className="card info"><div className="text"><p className="h-s">{tr('What happens next')}</p>
          <p className="body-s">{tr('Bring your ID to your next visit. You can book now; your health records will show in the app once reception confirms.')}</p></div></div></div>
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
        <nav className="bnav" aria-label={tr('Main')}>
          {[['Home', 'nav-home'], ['Care', 'nav-care'], ['Health', 'nav-health-active'], ['Ask', 'nav-ask'], ['Profile', 'nav-profile']].map(([l, i]) =>
            <a key={l} href="#" aria-current={l === 'Health' ? 'page' : undefined} data-act="end:tab"><span><img src={`${A}${i}.svg`} width="24" height="24" alt="" /></span>{tr(l)}</a>)}
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
          <>{btn(ne() ? `${masked()} मा कोड पठाउनुहोस्` : `Send a code to ${masked()}`, 'session-code', { size: 'l' })}{btn('Use a different number', 'session-other', { kind: 'secondary', size: 'l' })}</>, false, 'h1')}
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
  privacy: () => legal('Privacy policy', PRIVACY[0], PRIVACY[1], SAMPLE), // Phase 8 (T26): a complete sample policy, marked as a sample

  // Home and the rest of the app live in other Figma sections — this marks where this flow ends.
  end: () => (
    <div className="screen">
      {statusBar()}{S.stack.length ? appBar() : null}
      <div className="body" style={{ justifyContent: 'center', padding: '0 16px 16px' }}>
        {empty('icon-person.svg', S.endTitle, S.endBody, btn('Restart prototype', 'restart', { size: 'l' }), true, 'h1')}
      </div>
      {homeInd()}
    </div>),
});

export function onboarding(step, title, body, card) {
  return (
    <div className="screen subtle">
      {statusBar()}
      <div className="body hero-body">
        <div className="inset"><div className="heading"><h1 className="h-display">{tr(title)}</h1>{/* W13 */}<p className="lede">{tr(body)}</p></div></div>
        <div className="hero-inset"><div className="hero"><img src={`${A}hero.png`} alt={tr('A doctor in a white coat with a stethoscope')} />{card}</div></div>
        <div className="dots" role="img" /* A4 */ aria-label={ne() ? `3 मध्ये चरण ${step}` : `Step ${step} of 3`}>{[1, 2, 3].map(i => <i key={i} className={i === step ? 'on' : ''}></i>)}</div>
      </div>
      <div className="cta row">{step < 3 ? <>{btn('Skip', 'go:phone', { kind: 'secondary' })}{btn('Next', `go:onb${step + 1}`)}</> : btn('Get started', 'go:phone')}</div>
      {homeInd()}
    </div>);
}

export function listItem(icon, title, sub, act) {
  return <button className="list-item" data-act={act}>
    <span className="lead-tile"><img src={`${A}${icon}`} width="20" height="20" alt="" /></span>
    <span className="text"><span className="item-title">{tr(title)}</span><span className="body-s">{tr(sub)}</span></span>
    <img src={`${A}icon-chevron-right.svg`} width="20" height="20" alt="" />
  </button>;
}

export function empty(icon, title, body, actions, action = false, H = 'p') { // H: 'h1' when it is the screen's only title (W13)
  return <div className="empty">
    <div className="tile-ic" style={action ? { background: 'var(--surface-icon-neutral-bold)' } : undefined}><img src={`${A}${icon}`} width={action ? 20 : 28} height={action ? 20 : 28} alt="" /></div>
    <H className="h-s">{tr(title)}</H><p className="body-s">{tr(body)}</p>
    <div className="actions">{actions}</div>
  </div>;
}

// Phase 8 (T26): a complete, plain-language sample privacy policy. A section's text is one paragraph or a list of them.
const SAMPLE = ['Sample policy', "Sample policy for this prototype, not legal advice; to be reviewed by the hospital's legal team before release."];
const PRIVACY = ["City Hospital uses your details to run your care and this app. Your care team sees your health records. We never sell them or use them for ads. You can see your details, ask us to correct them, and close your account.", [
  ['What we collect', ['Your name, date of birth, sex and mobile number.',
    'Your appointments, the reasons you give for them, and fees you pay in the app.',
    'The records City Hospital releases to you: visit notes, prescriptions and lab reports. Medicines you add yourself, and questions you save for your doctor.',
    "If you speak to Ask, we use the recording only to turn it into text, and don't keep it. We don't collect your location, contacts or photos."]],
  ['Why we use it', ['To find your hospital record, book your visits and remind you of them, show you what your doctor tells you, and reach you about your care.',
    'To keep the app safe and working. Never for advertising, and we never sell your details.']],
  ['Who sees it', ['You, and the City Hospital staff caring for you — doctors, nurses, reception and the lab — each seeing what their job needs.',
    "On a phone the family shares, each person has their own profile and Clinica PIN, so nobody opens someone else's records by accident. If you manage a family member's profile, such as a parent's, you can see their records.",
    'We share your details outside the hospital only when the law requires it, or with the SMS and payment services below, which get only what they need.']],
  ['Your Health PIN', ["Your Clinica PIN locks your health records on this phone. Choose one only you know, not your phone's PIN. We store it encrypted, so no one at the hospital can read it.",
    'If you forget it, reset it with a code sent by SMS, or at reception with your ID. If you turn on fingerprint, anyone whose fingerprint is saved on this phone could open your records.']],
  ['Text messages (SMS)', ['We send sign-in codes, visit confirmations, reminders, delays and cancellations by SMS. They never include test results or what your doctor found, but anyone who reads your messages could see when and where your visit is.',
    'We never send marketing.']],
  ['Paying with a wallet', ['If you pay in the app, eSewa, Khalti or Fonepay handles the payment under its own privacy policy. We receive only the amount, the time and a receipt number — never your wallet PIN or password.']],
  ['How long we keep it', ["City Hospital keeps your medical records for as long as Nepal's law requires, even if you close your app account.",
    'When you close your account, we delete your sign-in, PIN, settings and saved questions. Records of the SMS we sent are kept for up to 1 year, to sort out delivery problems.']],
  ['Your rights', ['See: your details and records are in the app, and reception can give you a full copy.',
    "Correct: if something is wrong, ask at reception. The clinic's record is the one that counts.",
    'Delete: Profile › Close account deletes your app account, sign-in and PIN. The hospital still keeps your medical records, as the law requires.']],
  ['Contact', ["Ask at reception, call City Hospital on +977 1-4412345, or write to the hospital's privacy officer at City Hospital, Maharajgunj, Kathmandu. We'll reply within 15 days."]],
  ['Changes', ["If we change this policy, we'll tell you in the app before the change takes effect. This version: Aug 28, 2026."]],
]];
// Phase 8: the legal pages in Nepali. The sample policy is translated like the rest; legal review covers both languages.
Object.assign(NE, {
  'Sample policy': 'नमुना नीति', [SAMPLE[1]]: 'यो प्रोटोटाइपका लागि बनाइएको नमुना नीति हो, कानुनी सल्लाह होइन। सार्वजनिक गर्नुअघि अस्पतालको कानुनी टोलीले यसलाई जाँच्नेछ।',
  'Draft wording': 'मस्यौदा', "City Hospital's legal team will replace this wording before launch.": 'सुरु गर्नुअघि सिटी हस्पिटलको कानुनी टोलीले यो लेखाइ बदल्नेछ।', 'In short': 'छोटकरीमा',
  [PRIVACY[0]]: 'सिटी हस्पिटलले तपाईंको विवरण तपाईंको उपचार र यो एप चलाउन प्रयोग गर्छ। तपाईंको उपचार टोलीले तपाईंका स्वास्थ्य रेकर्ड हेर्छ। हामी तिनलाई कहिल्यै बेच्दैनौं वा विज्ञापनमा प्रयोग गर्दैनौं। तपाईं आफ्नो विवरण हेर्न, सच्याउन लगाउन र खाता बन्द गर्न सक्नुहुन्छ।',
  'What we collect': 'हामी के सङ्कलन गर्छौं', 'Your name, date of birth, sex and mobile number.': 'तपाईंको नाम, जन्म मिति, लिङ्ग र मोबाइल नम्बर।',
  'Your appointments, the reasons you give for them, and fees you pay in the app.': 'तपाईंका अपोइन्टमेन्ट, तिनका लागि तपाईंले दिएका कारण, र एपमा तिरेका शुल्क।',
  'The records City Hospital releases to you: visit notes, prescriptions and lab reports. Medicines you add yourself, and questions you save for your doctor.': 'सिटी हस्पिटलले तपाईंलाई दिएका रेकर्ड: भेटका टिप्पणी, प्रेस्क्रिप्सन र ल्याब रिपोर्ट। तपाईं आफैंले थपेका औषधि, र डाक्टरलाई सोध्न सेभ गरेका प्रश्न।',
  "If you speak to Ask, we use the recording only to turn it into text, and don't keep it. We don't collect your location, contacts or photos.": 'तपाईंले बोलेर सोध्नुभयो भने, हामी त्यो रेकर्डिङ लेखाइमा बदल्न मात्र प्रयोग गर्छौं, राख्दैनौं। हामी तपाईंको स्थान, सम्पर्क वा फोटो सङ्कलन गर्दैनौं।',
  'Why we use it': 'किन प्रयोग गर्छौं', 'To find your hospital record, book your visits and remind you of them, show you what your doctor tells you, and reach you about your care.': 'अस्पतालमा तपाईंको रेकर्ड खोज्न, भेट बुक गर्न र सम्झाउन, डाक्टरले भनेको कुरा देखाउन, र तपाईंको उपचारबारे सम्पर्क गर्न।',
  'To keep the app safe and working. Never for advertising, and we never sell your details.': 'एपलाई सुरक्षित र चालु राख्न। विज्ञापनका लागि कहिल्यै होइन, र हामी तपाईंको विवरण कहिल्यै बेच्दैनौं।',
  'Who sees it': 'कसले हेर्छ', 'You, and the City Hospital staff caring for you — doctors, nurses, reception and the lab — each seeing what their job needs.': 'तपाईं, र तपाईंको उपचार गर्ने सिटी हस्पिटलका कर्मचारी — डाक्टर, नर्स, रिसेप्सन र ल्याब — हरेकले आफ्नो कामका लागि चाहिने जति मात्र।',
  "On a phone the family shares, each person has their own profile and Clinica PIN, so nobody opens someone else's records by accident. If you manage a family member's profile, such as a parent's, you can see their records.": 'परिवारले साझा गर्ने फोनमा हरेक व्यक्तिको आफ्नै प्रोफाइल र Clinica PIN हुन्छ, ताकि कसैले अर्काको रेकर्ड गल्तीले नखोलोस्। तपाईंले परिवारको कुनै सदस्यको, जस्तै आमाबुबाको, प्रोफाइल चलाउनुहुन्छ भने उहाँका रेकर्ड हेर्न सक्नुहुन्छ।',
  'We share your details outside the hospital only when the law requires it, or with the SMS and payment services below, which get only what they need.': 'कानुनले माग्दा, वा तल उल्लेख गरिएका SMS र भुक्तानी सेवालाई, उनीहरूलाई चाहिने जति मात्र — यति बाहेक हामी तपाईंको विवरण अस्पताल बाहिर दिँदैनौं।',
  'Your Health PIN': 'तपाईंको स्वास्थ्य PIN', "Your Clinica PIN locks your health records on this phone. Choose one only you know, not your phone's PIN. We store it encrypted, so no one at the hospital can read it.": 'तपाईंको Clinica PIN ले यो फोनमा तपाईंका स्वास्थ्य रेकर्ड लक गर्छ। तपाईंलाई मात्र थाहा हुने PIN छान्नुहोस्, फोनकै PIN होइन। हामी यसलाई इन्क्रिप्ट गरेर राख्छौं, त्यसैले अस्पतालका कसैले पनि पढ्न सक्दैनन्।',
  'If you forget it, reset it with a code sent by SMS, or at reception with your ID. If you turn on fingerprint, anyone whose fingerprint is saved on this phone could open your records.': 'बिर्सनुभयो भने SMS मा पठाइएको कोडबाट, वा परिचयपत्र लिएर रिसेप्सनमा रिसेट गर्नुहोस्। औंठाछाप खोल्नुभयो भने, यो फोनमा औंठाछाप सेभ भएका जो कोहीले तपाईंका रेकर्ड खोल्न सक्छन्।',
  'Text messages (SMS)': 'SMS सन्देश', 'We send sign-in codes, visit confirmations, reminders, delays and cancellations by SMS. They never include test results or what your doctor found, but anyone who reads your messages could see when and where your visit is.': 'हामी साइन इन कोड, भेटको पुष्टि, सम्झना, ढिलाइ र रद्दको खबर SMS बाट पठाउँछौं। तिनमा जाँचको नतिजा वा डाक्टरले भेटेको कुरा कहिल्यै हुँदैन, तर तपाईंका सन्देश पढ्ने जो कोहीले तपाईंको भेट कहिले र कहाँ छ भनेर देख्न सक्छन्।',
  'We never send marketing.': 'हामी कहिल्यै विज्ञापन पठाउँदैनौं।', 'Paying with a wallet': 'वालेटबाट भुक्तानी',
  'If you pay in the app, eSewa, Khalti or Fonepay handles the payment under its own privacy policy. We receive only the amount, the time and a receipt number — never your wallet PIN or password.': 'एपमा तिर्नुभयो भने, भुक्तानी eSewa, Khalti वा Fonepay ले आफ्नै गोपनीयता नीतिअनुसार गर्छ। हामीले रकम, समय र रसिद नम्बर मात्र पाउँछौं — तपाईंको वालेटको PIN वा पासवर्ड कहिल्यै होइन।',
  'How long we keep it': 'कति समय राख्छौं', "City Hospital keeps your medical records for as long as Nepal's law requires, even if you close your app account.": 'एपको खाता बन्द गरे पनि, सिटी हस्पिटलले तपाईंका मेडिकल रेकर्ड नेपालको कानुनले तोकेसम्म राख्छ।',
  'When you close your account, we delete your sign-in, PIN, settings and saved questions. Records of the SMS we sent are kept for up to 1 year, to sort out delivery problems.': 'खाता बन्द गर्दा हामी तपाईंको साइन इन, PIN, सेटिङ र सेभ गरेका प्रश्न मेटाउँछौं। पठाइएका SMS को अभिलेख, पुगेन भने समस्या मिलाउन, बढीमा 1 वर्ष राखिन्छ।',
  'Your rights': 'तपाईंका अधिकार', 'See: your details and records are in the app, and reception can give you a full copy.': 'हेर्ने: तपाईंको विवरण र रेकर्ड एपमै छन्, र रिसेप्सनले पूरा प्रतिलिपि दिन सक्छ।',
  "Correct: if something is wrong, ask at reception. The clinic's record is the one that counts.": 'सच्याउने: केही गलत छ भने रिसेप्सनमा सोध्नुहोस्। क्लिनिकको रेकर्ड नै मान्य हुन्छ।',
  'Delete: Profile › Close account deletes your app account, sign-in and PIN. The hospital still keeps your medical records, as the law requires.': 'मेटाउने: प्रोफाइल › खाता बन्द गर्नुहोस् ले तपाईंको एप खाता, साइन इन र PIN मेटाउँछ। कानुनले तोकेअनुसार अस्पतालले भने तपाईंका मेडिकल रेकर्ड राखिरहन्छ।',
  "Ask at reception, call City Hospital on +977 1-4412345, or write to the hospital's privacy officer at City Hospital, Maharajgunj, Kathmandu. We'll reply within 15 days.": 'रिसेप्सनमा सोध्नुहोस्, सिटी हस्पिटललाई +977 1-4412345 मा फोन गर्नुहोस्, वा सिटी हस्पिटल, महाराजगञ्ज, काठमाडौंका गोपनीयता अधिकृतलाई लेख्नुहोस्। हामी 15 दिनभित्र जवाफ दिन्छौं।',
  "If we change this policy, we'll tell you in the app before the change takes effect. This version: Aug 28, 2026.": 'यो नीति बदलियो भने, लागू हुनुअघि नै हामी एपमा जानकारी दिन्छौं। यो संस्करण: अगस्ट 28, 2026।',
  // The terms of use (still draft wording)
  "Clinica helps you book visits and follow your care at City Hospital. It isn't for emergencies — call 102. Keep your Clinica PIN to yourself. The clinic's records are the official ones.": 'Clinica ले सिटी हस्पिटलमा भेट बुक गर्न र आफ्नो उपचारको जानकारी राख्न मद्दत गर्छ। यो आपतकालका लागि होइन — 102 मा फोन गर्नुहोस्। आफ्नो Clinica PIN कसैलाई नदिनुहोस्। क्लिनिकको रेकर्ड नै आधिकारिक हो।',
  'Using Clinica': 'Clinica प्रयोग गर्दा', "Use the app for your own care, or for someone you're allowed to book for. Don't share your sign-in code or your Clinica PIN.": 'एप आफ्नै उपचारका लागि, वा तपाईंलाई बुक गर्ने अनुमति भएको व्यक्तिका लागि प्रयोग गर्नुहोस्। आफ्नो साइन इन कोड वा Clinica PIN कसैलाई नदिनुहोस्।',
  'Not for emergencies': 'आपतकालका लागि होइन', "Clinica can't check symptoms or reach a doctor in a hurry. In an emergency, call 102 or go to the nearest emergency department.": 'Clinica ले लक्षण जाँच्न वा हतारमा डाक्टरलाई बोलाउन सक्दैन। आपतकालमा 102 मा फोन गर्नुहोस् वा नजिकको आपतकालीन विभाग जानुहोस्।',
  'Your records': 'तपाईंका रेकर्ड', "What the app shows comes from City Hospital. If something looks wrong, ask at reception — the clinic's record counts.": 'एपमा देखिने कुरा सिटी हस्पिटलबाट आउँछ। केही गलत देखिए रिसेप्सनमा सोध्नुहोस् — क्लिनिकको रेकर्ड नै मान्य हुन्छ।',
  Changes: 'परिवर्तन', "If these terms change, we'll tell you in the app before the change takes effect.": 'यी सर्त बदलिए भने, लागू हुनुअघि नै हामी एपमा जानकारी दिन्छौं।',
});

export function legal(title, short, sections, [warnT, warnB] = ['Draft wording', "City Hospital's legal team will replace this wording before launch."]) {
  return (
    <div className="screen legal">
      {statusBar()}{appBar({ title: tr(title) })}
      <div className="body g20" style={{ paddingBottom: 24 }}>
        <div className="inset"><div className="card warn"><div className="text"><p className="h-s">{tr(warnT)}</p><p className="body-s">{tr(warnB)}</p></div></div></div>
        <div className="inset"><div className="card neutral"><div className="text"><p className="h-s">{tr('In short')}</p><p className="body-s">{tr(short)}</p></div></div></div>
        {sections.map(([h, p]) => <div key={h} className="inset"><div className="section"><h3 className="h-s">{tr(h)}</h3>{[].concat(p).map(x => <p key={x} className="lede">{tr(x)}</p>)}</div></div>)}
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
  useEffect(() => { document.getElementById('w-y')?.focus(); }, []); // R25: a date of birth starts at the year
  let conv;
  if (pk.cal === 'AD') { const b = toBS(pk.y, pk.m, pk.d); conv = b ? (ne() ? `यो ${nd(bsText(b))} हो।` : `That's ${bsText(b)}.`) : ne() ? 'वि.सं. 2000 (ई.सं. 1943) भन्दा अघिको मिति वि.सं. मा बदल्न सकिँदैन।' : 'No BS conversion before 2000 BS (1943 AD).'; }
  else { const a = toAD(pk.y, pk.m, pk.d), t = a && `${a.date} ${AD_LONG[a.month]} ${a.year} AD`; conv = a ? (ne() ? `यो ${nd(t)} हो।` : `That's ${t}.`) : ''; }
  return (
    <div id="sheet">
      <div className="scrim" data-act="close-picker"></div>
      <div className="sheet" role="dialog" aria-modal="true" aria-labelledby="sheet-title">
        <div className="grabber"></div>
        <p className="h-s" id="sheet-title">{tr(pk.title || 'Date of birth')}</p>
        <div className="segmented" role="group" aria-label={tr('Calendar')}>
          <button className="seg" aria-pressed={pk.cal === 'AD'} data-act="cal:AD">{tr('AD')}</button>
          <button className="seg" aria-pressed={pk.cal === 'BS'} data-act="cal:BS">{tr('BS')}</button>
        </div>
        <div className="wheels">
          <div className="band"></div>
          {/* A wheel rebuilds when its list changes: a new calendar, or a month with a different number of days. */}
          {/* R25: Year first, then Month and Day */}
          <Wheel key={`y${pk.cal}`} id="w-y" label="Year" items={r.years} idx={r.years.indexOf(pk.y)} onPick={i => { pk.y = r.years[i]; paint(); }} />
          <Wheel key={`m${pk.cal}`} id="w-m" label="Month" items={r.months.map(tr)} idx={pk.m} onPick={i => { pk.m = i; paint(); }} />
          <Wheel key={`d${pk.cal}${r.days}`} id="w-d" label="Day" items={range(1, r.days)} idx={pk.d - 1} onPick={i => { pk.d = i + 1; paint(); }} />
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
    <div className="wheel"><span className="wl">{tr(label)}</span>
      <ul id={id} ref={ul} tabIndex={0} role="listbox" aria-label={tr(label)}
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
// Phase 8: S.dobErr stays English (currentN() reads it); the patient sees it in Nepali.
const dobText = e => { const y = ne() && /^(\d+) is in the future in AD/.exec(e); return y ? `ई.सं. मा ${y[1]} भविष्यको वर्ष हो। यो तपाईंको वि.सं. वर्ष हो भने मिति छान्ने ठाउँमा वि.सं. रोज्नुहोस्।` : e; };
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
    toast('Mobile number changed.'); // W03: the shared live region announces it
    return backTo('pfdetails');
  }
  if (S.code === CODE_OK && S.codeFor === 'addperson') { S.codeFor = null; S.tries = 3; return go(family().length ? 'whos' : 'profile', { replace: true }); } // the other records on this number (F22)
  if (S.code === CODE_OK && S.codeFor === 'pinreset') { S.tries = 3; S.codeFor = null; S.pinEntry = ''; return go('pinnew', { replace: true }); } // PIN reset (health.jsx)
  if (S.code === CODE_OK) { S.tries = 3; S.signedIn = true; S.stack = []; return go(family().length ? 'whos' : 'profile', { replace: true }); } // F22/R22/T22: no records, nobody else's names
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
  S.healthEmpty = true; S.careEmpty = true; S.followup = null; S.meds = []; // a new patient has no visits yet; Run 6 Y01: nor anyone else's medicines
  toHome(); // notifications are asked for later, after the first booking
}

export function endScreen(title, body) { S.endTitle = title; S.endBody = body; go('end'); }
export function toHome() { // leaving Health re-locks it. Run 7: coming Home from anywhere else (a booking) keeps the Home lock open
  if ([S.screen, ...S.stack].some(x => x === 'hempty' || HEALTH_SCREENS.includes(x))) S.unlocked = false;
  S.stack = []; S.screen = 'home'; S.picker = null; S.bio = null; S.sheet = null; render(); }

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
  pick: arg => { usePerson(arg); toHome(); }, // choosing yourself goes straight to Home; Run 6 Y01: with your own record
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
    ['25', 'Privacy policy', 'From 06 — the consent line', "The same shape, with a complete sample policy: what's collected and why, who sees it (care team, family profiles on a shared number), the Health PIN, SMS, wallet payments, retention, rights (see, correct, delete via Close account), contact and changes. Marked as a sample for the hospital's legal team to review.", () => ({ screen: 'privacy', stack: ['phone'] })], // Phase 8
  ]],
);
export let ALL = [];

// Decision (reload), Run 6 Y05: a real reload restores this tab's whole demo state — all of S (every app's data, and where each app was)
// and the staff tab. sessionStorage, this tab only; a plain navigation starts fresh, and blocked storage is ignored. Real persistence is
// out of scope. Left out, because they'd misbehave after a reload: open sheets, menus and the date picker, toasts, a PIN being typed,
// passwords, Ask's conversation and the Health unlock — Health is locked again.
const KEEP = 'clinica-reload', ISO = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/; // dates (a new hire's start) come back as dates
const DROP = { sheet: null, sys: null, toast: null, picker: null, bio: null, stMenu: null, drMenu: null, loading: null, refreshing: false, listening: false,
  pinEntry: '', pinFirst: '', pinErr: false, pinMismatch: false, unlocked: false, askUnlocked: false, chat: [], drPw: '', drPw0: '', drPw1: '', drPw2: '', 'st-pw': '' };
// A PIN being typed goes back to where it was asked for; a records screen opens on the lock, and unlocking returns to it (W16).
const relock = v => {
  if (PIN_SCREENS.includes(v.screen)) v.screen = v.stack.pop() || 'home';
  if (HEALTH_SCREENS.includes(v.screen)) { Object.assign(S, { afterUnlock: v.screen, lockStack: v.stack, lockWhy: null }); Object.assign(v, { screen: 'hlocked', stack: [] }); }
};
export function boot() {
  ALL = FLOW.flatMap(([, items]) => items); // each screen's caption, for the note; the presets are test fixtures
  start('full');
  let k = null;
  try { if (performance.getEntriesByType('navigation')[0]?.type === 'reload') k = JSON.parse(sessionStorage.getItem(KEEP), (_, v) => typeof v === 'string' && ISO.test(v) ? new Date(v) : v); } catch { k = null; }
  if (k?.S) {
    Object.assign(S, k.S, DROP); staffTab = k.staffTab || staffTab;
    if (k.draftOf) S.drDraft = Object.assign(S.drKept[k.draftOf], { restored: true }); // the visit being written is still its kept draft (F03), and says so
    const b = S.booked; if (b) [S.appt, ...S.more].forEach(v => { if (v.doc === b.doc && v.day === b.day && v.time === b.time) v.pay = b.pay; }); // one pay record (V14)
    relock(S.app === 'patient' ? S : S.saved.patient || { stack: [] });
    Object.entries(S.walk).forEach(([x, w]) => { if (w.doc === 'ps') drJoin(x, w); }); // Dr. Sharma's walk-ins rejoin her queue's list
    if (S.screen === 'swalk') S.wkKept = wkFilled(); // T21: the walk-in form came back, and says so
    render();
  }
  addEventListener('pagehide', () => { try { sessionStorage.setItem(KEEP, JSON.stringify({ S, staffTab, draftOf: Object.keys(S.drKept).find(x => S.drKept[x] === S.drDraft) })); } catch { /* storage blocked: start fresh */ } });
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
// W03/W13/W17: the screen's heading takes focus when the screen changes. A screen without an h1 (a device stand-in) focuses its root.
export function focusHeading() {
  const ph = $phone(), h = ph?.querySelector('h1') || ph?.querySelector('.screen');
  if (!h) return;
  if (h.tabIndex < 0 && !h.hasAttribute('tabindex')) h.tabIndex = -1;
  h.focus();
}
export function Phone() {
  const ref = useRef(), was = useRef({});
  useLayoutEffect(() => { // after every commit: per-screen behaviour on a full render, and the app bar's scroll seam
    const ae = document.activeElement; // before inert below can blur it
    if (takeRemount()) mount[S.screen]?.();
    const ph = ref.current, body = ph.querySelector('.body'), bar = ph.querySelector('.appbar');
    if (body && bar) body.onscroll = () => bar.classList.toggle('seam', body.scrollTop > 0); // Scrolled: a seam, not a shadow
    // A5: a scrolling screen body can be reached and scrolled by keyboard, and says what it is.
    ph.querySelectorAll('.body').forEach(b => {
      if (b.scrollHeight > b.clientHeight && getComputedStyle(b).overflowY !== 'hidden') {
        b.tabIndex = 0; b.setAttribute('role', 'region'); b.setAttribute('aria-label', ph.querySelector('h1')?.textContent || 'Screen');
      } else if (b.hasAttribute('tabindex')) { b.removeAttribute('tabindex'); b.removeAttribute('role'); b.removeAttribute('aria-label'); }
    });
    // A6: the stage is the main landmark only when the app hasn't drawn its own <main>.
    if (ph.querySelector('main')) ph.parentElement.removeAttribute('role'); else ph.parentElement.setAttribute('role', 'main');
    // V05: everything behind an open sheet or dialog is inert, so it can't be tabbed to, tapped by voice or read.
    ph.querySelectorAll('[data-inert]').forEach(e => { e.inert = false; e.removeAttribute('data-inert'); });
    const dlg = [...ph.querySelectorAll('[aria-modal="true"]')].at(-1); // Run 6 Y13: the topmost, e.g. the date picker over a desktop sheet
    if (dlg) for (let el = dlg; el !== ph; el = el.parentElement) for (const sib of el.parentElement.children)
      if (sib !== el && !sib.matches('.scrim, .sheet-home, .toast-region')) { sib.inert = true; sib.setAttribute('data-inert', ''); }
    // W03: focus moves only when the screen, the app or a sheet changes — never on a paint while typing.
    const w = was.current, key = `${S.app}/${S.screen}`;
    if (dlg) { // a sheet opened (or replaced another): focus goes into it unless it focused something itself
      if (!w.dlg) w.trigger = ae;
      if (!dlg.contains(document.activeElement) && !document.activeElement?.closest('.toast-region')) { dlg.tabIndex = -1; dlg.focus(); }
    } else if (w.key && key !== w.key) { // a new screen: its heading, unless its mount hook focused a field,
      const cur = document.activeElement; // or focus is out on the page's own controls (role tabs, skip link, edge-case panel)
      if (!(cur !== ae && ph.contains(cur)) && (!ae || ae === document.body || ph.contains(ae))) focusHeading();
    } else if (w.dlg) { // a sheet closed on the same screen: back to what opened it
      const t = w.trigger; if (t?.isConnected && ph.contains(t)) t.focus(); else focusHeading();
    }
    w.dlg = !!dlg; w.key = key;
  });
  // V04: the desktop apps (desk.jsx, staff.jsx) are laid out responsively in CSS (styles.css .phone.desk), not scaled to fit.
  const desk = S.app === 'desk' || S.app === 'staff';
  const el = SCREENS[S.screen](), ov = OVERLAY[S.sheet]?.(); // bottom sheets any screen can open (care.jsx)
  const screen = cloneElement(el, { key: S.screen }, ...[].concat(el.props.children), ...(ov ? [ov] : []));
  const onClick = e => {
    if (!interceptLink(e)) { // calls and maps go through the phone's own prompt first (more.jsx)
      const a = e.target.closest('[data-act]');
      if (a && !a.disabled) {
        const [act, arg] = a.dataset.act.split(/:(.*)/s);
        if (a.tagName === 'A') e.preventDefault();
        ACTIONS[act]?.(arg, a);
        // Run 6 Y11: when the control that was used goes away (Undo, Reopen), focus goes to the screen's heading, not the page
        if (!a.isConnected && (document.activeElement === document.body || !document.activeElement)) focusHeading();
      }
    }
    phoneListeners.click.forEach(f => f(e));
  };
  const onKeyDown = e => {
    if (e.key === 'Escape' && S.picker) { S.picker = null; paint(); }
    phoneListeners.keydown.forEach(f => f(e));
  };
  return (
    <div className={`phone${desk ? ' desk' : ''}`} id="phone" ref={ref} onClick={onClick} onKeyDown={onKeyDown}
      onSubmit={e => e.preventDefault()}>{/* a form never navigates; buttons inside one would submit it */}
      {screen}
      {S.picker && <DobSheet />}
      {/* F24/R20/T11/W07/V09: one live region for success toasts (core.jsx toast()), always present so it's announced */}
      <div className="toast-region" role="status">{S.toast ? <div className="toast"><p>{tr(S.toast.msg)}</p>{/* Phase 8: toasts in Nepali */}
        {S.toast.action ? <button className="toast-act" data-act={S.toast.action[1]}>{tr(S.toast.action[0])}</button> : null}</div> : null}</div>
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
  const openAsRef = useRef();
  const tab = S.app !== 'staff' ? S.app : ({ admin: 'admin', trustee: 'admin', desk: 'reception', hr: 'hr' })[stMe()?.access] || staffTab; // T23: a trustee signs in under Top Level Management
  const kind = casesOpen ? 'edge' : (S.app === 'patient' ? S.careEmpty : S.app === 'staff' ? S.stHoliday : S.drNoPatients) ? 'empty' : 'full';
  const roleTab = (t, l) => <button className="tab" data-tab={t} aria-current={tab === t} onClick={() => pickTab(t)}>{l}</button>;
  const caseTab = (c, l) => <button className="tab" data-case={c} aria-current={kind === c} onClick={() => pickCase(c)}>{l}</button>;
  return (
    <div className="shell">
      {/* W18: skip the role tabs straight to the app's heading */}
      <a className="skip" href="#phone" onClick={e => { e.preventDefault(); focusHeading(); }}>Skip to the app</a>
      <nav className="tabs" aria-label="Who's using Clinica">
        {roleTab('patient', 'Patient')}{roleTab('doctor', 'Doctor (Mobile)')}{roleTab('desk', 'Doctor Dashboard')}
        {roleTab('hr', 'HR Manager')}{roleTab('reception', 'Reception')}{roleTab('admin', 'Top Level Management')}
      </nav>

      {/* A6: a div, so each app's own <main> is the only one (Phone sets role="main" here when the app has none) */}
      <div className="stage"><Phone /></div>

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
              ? <li>Admin <code>CH-ADM-04</code>, front desk <code>CH-FD-12</code>, HR <code>CH-HR-03</code>, trustee (read-only) <code>CH-TRS-01</code>. Password <code>clinica</code>.</li>
              : <li>Doctor staff ID <code>CH-0231</code>. Password <code>clinica</code>.</li>}
          </ul>
        </details>
        </>}
      </aside>
    </div>);
}
