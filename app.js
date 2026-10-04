// Clinica — Onboarding, Sign in and Sign up prototype.
// Figma: zw3saW6ot26E6gWH20K3ux, section 118:6259. Screens 01–25 are screens or states below.

const ND = window.NepaliDate.default; // Published Bikram Sambat table (2000–2090 BS), never a formula
const A = 'assets/';
const phone = document.getElementById('phone');

// Demo backend
const CODE_OK = '123456';
const CODE_EXPIRED = '000000';
const RECORDS = [{ name: 'Anisha Sharma', born: 'March 1994' }, { name: 'Ramesh Sharma', born: 'June 1961' }];

const AD_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const AD_LONG = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const BS_MONTHS = ['Baisakh', 'Jestha', 'Asar', 'Shrawan', 'Bhadra', 'Ashwin', 'Kartik', 'Mangsir', 'Poush', 'Magh', 'Falgun', 'Chaitra'];

const fresh = () => ({
  screen: 'splash', stack: [], signedIn: false,
  lang: 'en',
  phone: '', phoneErr: false,
  code: '', codeState: 'typing', tries: 3, resend: 42, lock: 14 * 60 + 52,
  name: '', nameErr: false, dob: '', dobErr: '', sex: '', sexErr: false,
  picker: null, pickerCal: 'AD', bsHint: null,
  endTitle: '', endBody: '',
  // Booking (booking.js)
  first: 'Anisha', fullName: 'Anisha Sharma',
  doc: 'ps', day: 0, time: '4:30 PM', reason: '', reasonSaved: false, taken: {}, fav: {},
  specialty: 'General medicine', query: '',
  homeState: 'default', appt: { doc: 'ps', day: 0, time: '4:30 PM' },
  notif: 'ask', notNow: 0,
  loading: null, refreshing: false, careErr: false, micPerm: null,
  bookFor: null, booked: null, failKind: 'taken', failNext: '', filt: { today: false, sex: 'Any' }, fdraft: null,
  ...(window.EXTRA_STATE?.() || {}), // Health (health.js)
});
let S = fresh();

// ---------- helpers ----------
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const digits = s => s.replace(/\D/g, '');
const telKey = () => S.codeFor === 'newphone' ? 'newPhone' : 'phone'; // Profile › change number reuses sign-in's screens
const masked = () => { const d = digits(S[telKey()] || '') || '9841000412'; return `+977 ${d.slice(0, 2)}•• ••• ${d.slice(-3)}`; };
const mmss = s => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
const pad = n => String(n).padStart(2, '0');
const todayAD = new Date();

function toBS(y, m, d) { try { return ND.fromAD(new Date(y, m, d)).getBS(); } catch { return null; } }
function toAD(y, m, d) { try { return new ND(y, m, d).getAD(); } catch { return null; } }
function bsDays(y, m) { for (let d = 32; d >= 28; d--) { try { if (new ND(y, m, d).getMonth() === m) return d; } catch {} } return 30; }
const adDays = (y, m) => new Date(y, m + 1, 0).getDate();
const bsText = b => `${b.date} ${BS_MONTHS[b.month]} ${b.year} BS`;

function parseDob(t) {
  const m = /^(\d{2}) \/ (\d{2}) \/ (\d{4})$/.exec(t);
  if (!m) return null;
  const [d, mo, y] = [+m[1], +m[2] - 1, +m[3]];
  const date = new Date(y, mo, d);
  return date.getMonth() === mo && date.getDate() === d ? { y, m: mo, d } : null;
}
function maskDob(v) {
  const x = digits(v).slice(0, 8);
  return [x.slice(0, 2), x.slice(2, 4), x.slice(4)].filter(Boolean).join(' / ');
}

// ---------- shared pieces ----------
const statusBar = light => `
  <div class="status" style="color:${light ? '#fff' : 'var(--text-primary)'}">
    <span>9:41</span>
    <span class="sys"><span class="signal"><i></i><i></i><i></i><i></i></span>
      <img src="${A}wifi-${light ? 'light' : 'dark'}.svg" width="17" height="17" alt=""><span class="battery"></span></span>
  </div>`;
const homeInd = light => `<div class="home-ind" style="color:${light ? '#fff' : 'var(--text-primary)'}"></div>`;
const appBar = ({ back = true, title = '' } = {}) => `
  <div class="appbar">
    ${back ? `<button class="icon-btn" data-act="back" aria-label="Back"><img src="${A}icon-back.svg" width="24" height="24" alt=""></button>` : ''}
    <div class="title">${title}</div><div class="slot"></div>
  </div>`;
const heading = (h, p, cls = 'h-xl') => `
  <div class="inset"><div class="heading"><h2 class="${cls}">${h}</h2>${p ? `<p class="lede">${p}</p>` : ''}</div></div>`;
const btn = (label, act, { kind = 'primary', disabled = false, size = '' } = {}) =>
  `<button class="btn ${kind} ${size}" data-act="${act}" ${disabled ? 'disabled' : ''}>${label}</button>`;
const support = (msg, tone = '', icon = '') => `
  <div class="support ${tone}">${icon ? `<img src="${A}${icon}" width="14" height="14" alt="">` : ''}<p>${msg}</p></div>`;

// ---------- screens ----------
const SCREENS = {
  splash: () => `
    <div class="screen bold" data-act="splash-next">
      ${statusBar(true)}
      <div class="splash-body"><div class="wordmark">Clinica</div><p style="font-size:16px;line-height:24px">Your clinic, in your pocket.</p></div>
      <div class="clinic"><p style="font-size:14px;line-height:20px">for</p><p class="h-s">City Hospital</p></div>
      ${homeInd(true)}
    </div>`,

  language: () => `
    <div class="screen">
      ${statusBar()}
      <div class="body" style="padding-top:48px">
        <div class="inset"><div class="heading" style="gap:4px">
          <h2 class="h-xl">Choose your language</h2>
          <h2 class="h-xl deva" style="color:var(--text-secondary)">भाषा छान्नुहोस्</h2>
        </div></div>
        <div class="inset"><div class="tiles" role="radiogroup" aria-label="Language">
          ${[['en', 'English', ''], ['ne', 'नेपाली', 'deva']].map(([v, l, c]) => `
            <button class="tile" role="radio" aria-checked="${S.lang === v}" data-act="lang" data-v="${v}">
              <img class="off" src="${A}translate-secondary.svg" width="28" height="28" alt="">
              <img class="on" src="${A}translate-action.svg" width="28" height="28" alt="">
              <span class="${c}">${l}</span>
            </button>`).join('')}
        </div></div>
        <div class="inset"><p class="body-s">You can change this any time in Profile.</p></div>
      </div>
      <div class="cta">${btn('Continue', 'go:onb1')}</div>
      ${homeInd()}
    </div>`,

  onb1: () => onboarding(1, "Book with your clinic's own doctors.", 'See who is in today and choose a time that suits you.', `
    <div class="card">
      <div class="avatar">SA</div>
      <div class="doctor"><p class="h-s">Dr. Sameer Acharya</p><p class="spec">General medicine</p><span class="tag">Available today</span></div>
    </div>`),
  onb2: () => onboarding(2, 'Know the moment something changes.', "If your doctor is running late or a visit moves, we'll tell you straight away.", `
    <div class="card info"><div class="text"><p class="h-s">Dr. Acharya is running late</p>
      <p class="body-s">Your slot is kept, and we'll message you when he's ready.</p></div></div>`),
  onb3: () => onboarding(3, 'Everything your doctor tells you, in one place.', 'Visits, prescriptions and reports in one place, to read again later.', `
    <div class="card">
      <div class="lead-tile"><img src="${A}icon-prescription.svg" width="20" height="20" alt=""></div>
      <div class="text"><p class="item-title">Prescription from Dr. Acharya</p><p class="body-s">Three times a day, after food</p></div>
    </div>`),

  phone: () => `
    <div class="screen">
      ${statusBar()}${appBar()}
      <div class="body">
        ${S.codeFor === 'newphone' ? heading('Your new mobile number', "We'll text a code to check it. Your records stay the same.")
          : heading('Your mobile number', "We'll text a 6-digit code. Use the number your clinic has on file, so we can find your records.")}
        <div class="inset"><div class="field-wrap">
          <label class="label" for="tel">Mobile number</label>
          <div class="field ${S.phoneErr ? 'err' : ''}" id="tel-field">
            <span class="dial"><span class="flag-np" aria-hidden="true"></span>+977<img src="${A}icon-chevron-down.svg" width="20" height="20" alt=""></span>
            <span class="divider"></span>
            <input id="tel" type="tel" inputmode="tel" autocomplete="tel-national" placeholder="Phone number" value="${esc(S[telKey()] || '')}" aria-describedby="tel-msg">
          </div>
          <div id="tel-msg">${S.phoneErr
            ? support('Nepali mobile numbers are 10 digits, starting with 9.', 'err')
            : support('Only used to sign you in and send visit updates.')}</div>
        </div></div>
        ${S.codeFor === 'newphone' ? '<div style="height:40px;flex:none"></div>' : `<div class="inset"><p class="consent">By continuing, you agree to the <a href="#" data-act="go:terms">Terms of use</a> and <a href="#" data-act="go:privacy">Privacy policy</a>.</p></div>`}
      </div>
      <div class="cta">${btn('Send code', 'send-code')}</div>
      ${homeInd()}
    </div>`,

  code: () => {
    const st = S.codeState, err = st === 'wrong' || st === 'expired';
    const cells = [...Array(6)].map((_, i) =>
      `<div class="cell ${!err && i === S.code.length ? 'focus' : ''}">${S.code[i] || ''}</div>`).join('');
    const msg = {
      typing: `<div class="body-s" style="display:flex;flex-direction:column;gap:4px">
                 <p style="font-weight:600;color:var(--text-tertiary)" id="resend">Resend code in ${mmss(S.resend)}</p>
                 <p>Wrong number? <a href="#" class="link" data-act="back" style="color:inherit">Go back to change it.</a></p></div>`,
      wrong: support(`That code didn't match. ${S.tries} ${S.tries === 1 ? 'try' : 'tries'} left.`, 'err', 'icon-error.svg'),
      noarrive: support("Didn't get it? Check the number above is right, then send a new one.", '', 'icon-info.svg'),
      expired: support('That code has expired. Send a new one and enter it as soon as it arrives.', 'err', 'icon-error.svg'),
    }[st];
    const canVerify = S.code.length === 6 && st !== 'expired';
    return `
    <div class="screen">
      ${statusBar()}${appBar()}
      <div class="body">
        ${heading('Enter the code', `Sent by SMS to ${masked()}.`)}
        <div class="inset"><div class="code-wrap">
          <div class="code ${err ? 'err' : ''}" id="code">${cells}
            <input class="cell-input" id="code-in" type="text" inputmode="numeric" autocomplete="one-time-code" maxlength="6"
              aria-label="6-digit code" aria-describedby="code-msg" value="${S.code}" ${err ? 'aria-invalid="true"' : ''}>
          </div>
          ${st === 'typing' ? '' : `<div id="code-msg">${msg}</div>`}
        </div></div>
        ${st === 'typing' ? `<div class="inset" id="code-msg">${msg}</div>` : `<div class="inset">${btn('Send a new code', 'new-code', { kind: 'secondary' })}</div>`}
      </div>
      <div class="cta">${btn('Verify', 'verify', { disabled: !canVerify })}</div>
      ${homeInd()}
    </div>`;
  },

  locked: () => `
    <div class="screen">
      ${statusBar()}${appBar()}
      <div class="body">
        ${heading('Too many tries', 'For your safety, sign-in is paused for this number. Wait, or ask reception to help you sign in.')}
        <div class="inset">${support(`You can try again in <span id="lock">${mmss(S.lock)}</span>.`, 'warn', 'icon-warning-info.svg')}</div>
        <div class="inset"><a class="btn secondary" href="tel:+97710000000">Call the clinic</a></div>
      </div>
      ${homeInd()}
    </div>`,

  whos: () => `
    <div class="screen">
      ${statusBar()}${appBar({ back: false })}
      <div class="body g20">
        ${heading("Who's using the app?", `City Hospital has ${RECORDS.length} records for this number, because many families share a phone. Choose yours.`)}
        <div class="list">
          ${RECORDS.map(r => listItem('icon-person.svg', r.name, `Born ${r.born}`, `pick:${r.name}`)).join('<div class="sep" aria-hidden="true"></div>')}
          <div class="sep" aria-hidden="true"></div>
          ${listItem('icon-add.svg', 'Someone else', 'Create a new profile', 'go:profile')}
        </div>
        <div class="inset"><p class="body-s tertiary">Anyone who signs in with this number will be asked this, so each person only sees their own record.</p></div>
      </div>
      ${homeInd()}
    </div>`,

  profile: () => {
    const p = parseDob(S.dob), bs = p && toBS(p.y, p.m, p.d);
    const dobMsg = S.dobErr ? support(S.dobErr, 'err') : support(bs ? bsText(bs) : 'AD or BS — choose in the date picker.');
    return `
    <div class="screen">
      ${statusBar()}${appBar()}
      <div class="body g20">
        ${heading('Create your profile', 'The clinic uses this to find you at reception.')}
        <div class="inset"><form id="pf" novalidate style="display:flex;flex-direction:column;gap:16px">
          <div class="field-wrap">
            <label class="label" for="name">Full name</label>
            <div class="field ${S.nameErr ? 'err' : ''}"><input id="name" autocomplete="name" placeholder="Your full name" value="${esc(S.name)}"></div>
            <div id="name-msg">${S.nameErr ? support('Enter your full name, as the clinic has it.', 'err') : ''}</div>
          </div>
          <div class="field-wrap">
            <label class="label" for="dob">Date of birth</label>
            <div class="field ${S.dobErr ? 'err' : ''}">
              <button type="button" class="cal-btn" data-act="open-picker" aria-label="Choose date of birth"><img src="${A}icon-calendar.svg" width="20" height="20" alt=""></button>
              <input id="dob" inputmode="numeric" autocomplete="bday" placeholder="DD / MM / YYYY" value="${esc(S.dob)}">
            </div>
            <div id="dob-msg">${dobMsg}</div>
          </div>
          <fieldset class="radio-group ${S.sexErr ? 'err' : ''}" id="sex">
            <legend>Sex</legend>
            <div class="radio-options">
              ${['Female', 'Male', 'Other'].map(v => `<label class="radio"><input type="radio" name="sex" value="${v}" ${S.sex === v ? 'checked' : ''}>${v}</label>`).join('')}
            </div>
            <div id="sex-msg">${S.sexErr ? support('Choose one.', 'err') : ''}</div>
          </fieldset>
        </form></div>
      </div>
      <div class="cta">${btn('Create profile', 'create-profile')}</div>
      ${homeInd()}
    </div>`;
  },

  match: () => `
    <div class="screen">
      ${statusBar()}${appBar()}
      <div class="body g20">
        ${heading('We may already know you', 'City Hospital has a record close to the details you entered, but not an exact match. To keep your health records together and correct, reception will check it with you.')}
        <div class="inset"><div class="card info"><div class="text"><p class="h-s">What happens next</p>
          <p class="body-s">Bring your ID to your next visit. You can book now; your health records will show in the app once reception confirms.</p></div></div></div>
      </div>
      <div class="cta">${btn('Continue', 'go:waiting')}${btn('Check my details', 'back', { kind: 'secondary' })}</div>
      ${homeInd()}
    </div>`,

  waiting: () => `
    <div class="screen">
      ${statusBar()}${appBar({ back: false, title: 'Health' })}
      <div class="body g20" style="justify-content:center">
        ${empty('icon-clipboard.svg', 'Your records are waiting for reception', 'Reception will confirm your details at your next visit. Your visits, prescriptions and reports will appear here then.',
          btn('Book a visit', 'end:book', { size: 'l' }))}
      </div>
      <div class="bottom">
        <nav class="bnav" aria-label="Main">
          ${[['Home', 'nav-home'], ['Care', 'nav-care'], ['Health', 'nav-health-active'], ['Ask', 'nav-ask'], ['Profile', 'nav-profile']].map(([l, i]) =>
            `<a href="#" ${l === 'Health' ? 'aria-current="page"' : ''} data-act="end:tab"><span><img src="${A}${i}.svg" width="24" height="24" alt=""></span>${l}</a>`).join('')}
        </nav>
        ${homeInd()}
      </div>
    </div>`,

  returning: () => SCREENS.splash().replace('data-act="splash-next"', 'data-act="returning-next"'),

  session: () => `
    <div class="screen">
      ${statusBar()}
      <div class="body" style="justify-content:center;padding:0 16px 16px">
        ${empty('icon-lock.svg', 'Please sign in again', "For your security, you're signed out after a long time away. Your health records are safe.",
          btn(`Send a code to ${masked()}`, 'session-code', { size: 'l' }) + btn('Use a different number', 'session-other', { kind: 'secondary', size: 'l' }))}
      </div>
      ${homeInd()}
    </div>`,

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
  end: () => `
    <div class="screen">
      ${statusBar()}${S.stack.length ? appBar() : ''}
      <div class="body" style="justify-content:center;padding:0 16px 16px">
        ${empty('icon-person.svg', S.endTitle, S.endBody, btn('Restart prototype', 'restart', { size: 'l' }), true)}
      </div>
      ${homeInd()}
    </div>`,
};

function onboarding(step, title, body, card) {
  return `
    <div class="screen subtle">
      ${statusBar()}
      <div class="body hero-body">
        <div class="inset"><div class="heading"><h2 class="h-display">${title}</h2><p class="lede">${body}</p></div></div>
        <div class="hero-inset"><div class="hero"><img src="${A}hero.png" alt="A doctor in a white coat with a stethoscope">${card}</div></div>
        <div class="dots" aria-label="Step ${step} of 3">${[1, 2, 3].map(i => `<i class="${i === step ? 'on' : ''}"></i>`).join('')}</div>
      </div>
      <div class="cta row">${step < 3 ? btn('Skip', 'go:phone', { kind: 'secondary' }) + btn('Next', `go:onb${step + 1}`) : btn('Get started', 'go:phone')}</div>
      ${homeInd()}
    </div>`;
}

function listItem(icon, title, sub, act) {
  return `<button class="list-item" data-act="${esc(act)}">
    <span class="lead-tile"><img src="${A}${icon}" width="20" height="20" alt=""></span>
    <span class="text"><span class="item-title">${esc(title)}</span><span class="body-s">${esc(sub)}</span></span>
    <img src="${A}icon-chevron-right.svg" width="20" height="20" alt="">
  </button>`;
}

function empty(icon, title, body, actions, action = false) {
  return `<div class="empty">
    <div class="tile-ic" ${action ? 'style="background:var(--surface-icon-neutral-bold)"' : ''}><img src="${A}${icon}" width="${action ? 20 : 28}" height="${action ? 20 : 28}" alt=""></div>
    <p class="h-s">${title}</p><p class="body-s">${body}</p>
    <div class="actions">${actions}</div>
  </div>`;
}

function legal(title, short, sections) {
  return `
    <div class="screen legal">
      ${statusBar()}${appBar({ title })}
      <div class="body g20" style="padding-bottom:24px">
        <div class="inset"><div class="card warn"><div class="text"><p class="h-s">Draft wording</p><p class="body-s">City Hospital's legal team will replace this wording before launch.</p></div></div></div>
        <div class="inset"><div class="card neutral"><div class="text"><p class="h-s">In short</p><p class="body-s">${short}</p></div></div></div>
        ${sections.map(([h, p]) => `<div class="inset"><div class="section"><h3 class="h-s">${h}</h3><p class="lede">${p}</p></div></div>`).join('')}
      </div>
      ${homeInd()}
    </div>`;
}

// ---------- date of birth sheet ----------
function openPicker() {
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
  renderSheet();
}

function pickerRanges(pk) {
  if (pk.cal === 'AD') {
    const y0 = 1920, y1 = todayAD.getFullYear();
    return { years: range(y0, y1), months: AD_SHORT, days: adDays(pk.y, pk.m) };
  }
  const y1 = ND.fromAD(todayAD).getYear();
  return { years: range(2000, y1), months: BS_MONTHS, days: bsDays(pk.y, pk.m) };
}
const range = (a, b) => Array.from({ length: b - a + 1 }, (_, i) => a + i);

function renderSheet() {
  document.getElementById('sheet')?.remove();
  if (!S.picker) return;
  const pk = S.picker;
  const el = document.createElement('div');
  el.id = 'sheet';
  el.innerHTML = `
    <div class="scrim" data-act="close-picker"></div>
    <div class="sheet" role="dialog" aria-modal="true" aria-labelledby="sheet-title">
      <div class="grabber"></div>
      <p class="h-s" id="sheet-title">Date of birth</p>
      <div class="segmented" role="group" aria-label="Calendar">
        <button class="seg" aria-pressed="${pk.cal === 'AD'}" data-act="cal:AD">AD</button>
        <button class="seg" aria-pressed="${pk.cal === 'BS'}" data-act="cal:BS">BS</button>
      </div>
      <div class="wheels">
        <div class="band"></div>
        <div class="wheel"><span class="wl">Day</span><ul id="w-d" tabindex="0" role="listbox" aria-label="Day"></ul></div>
        <div class="wheel"><span class="wl">Month</span><ul id="w-m" tabindex="0" role="listbox" aria-label="Month"></ul></div>
        <div class="wheel"><span class="wl">Year</span><ul id="w-y" tabindex="0" role="listbox" aria-label="Year"></ul></div>
      </div>
      <div class="conversion" id="conv" aria-live="polite"></div>
      <div style="display:flex;flex-direction:column;gap:12px">${btn('Done', 'picker-done')}${btn('Cancel', 'close-picker', { kind: 'secondary' })}</div>
    </div>
    <div class="sheet-home"></div>`;
  phone.appendChild(el);
  fillWheels();
  el.querySelector('.seg[aria-pressed="true"]').focus();
}

function fillWheels() {
  const pk = S.picker, r = pickerRanges(pk);
  pk.y = Math.min(Math.max(pk.y, r.years[0]), r.years.at(-1));
  pk.d = Math.min(pk.d, r.days);
  wheel('w-y', r.years, r.years.indexOf(pk.y), i => { pk.y = r.years[i]; refreshDays(); });
  wheel('w-m', r.months, pk.m, i => { pk.m = i; refreshDays(); });
  wheel('w-d', range(1, r.days), pk.d - 1, i => { pk.d = i + 1; updateConversion(); });
  updateConversion();
}
function refreshDays() {
  const pk = S.picker, n = pickerRanges(pk).days;
  if (document.getElementById('w-d').children.length !== n) {
    pk.d = Math.min(pk.d, n);
    wheel('w-d', range(1, n), pk.d - 1, i => { pk.d = i + 1; updateConversion(); });
  }
  updateConversion();
}
function updateConversion() {
  const pk = S.picker, c = document.getElementById('conv');
  if (pk.cal === 'AD') {
    const b = toBS(pk.y, pk.m, pk.d);
    c.textContent = b ? `That's ${bsText(b)}.` : 'No BS conversion before 2000 BS (1943 AD).';
  } else {
    const a = toAD(pk.y, pk.m, pk.d);
    c.textContent = a ? `That's ${a.date} ${AD_LONG[a.month]} ${a.year} AD.` : '';
  }
}

// Scroll-snap wheel: 44px rows, selection is the centred row.
function wheel(id, items, idx, onChange) {
  const ul = document.getElementById(id);
  ul.innerHTML = items.map(t => `<li role="option">${t}</li>`).join('');
  ul.scrollTop = idx * 44;
  const cur = () => Math.max(0, Math.min(items.length - 1, Math.round(ul.scrollTop / 44)));
  const paint = () => {
    const c = cur();
    [...ul.children].forEach((li, i) => { li.className = i === c ? 'sel' : Math.abs(i - c) === 1 ? 'n1' : ''; li.ariaSelected = i === c; });
  };
  let t;
  ul.onscroll = () => { paint(); clearTimeout(t); t = setTimeout(() => onChange(cur()), 100); };
  ul.onclick = e => { const i = [...ul.children].indexOf(e.target.closest('li')); if (i >= 0) ul.scrollTo({ top: i * 44, behavior: 'smooth' }); };
  ul.onkeydown = e => {
    const k = { ArrowDown: 1, ArrowUp: -1 }[e.key];
    if (k) { e.preventDefault(); ul.scrollTo({ top: (cur() + k) * 44 }); }
  };
  paint();
}

function switchCal(cal) {
  const pk = S.picker;
  if (pk.cal === cal) return;
  const r = cal === 'BS' ? toBS(pk.y, pk.m, pk.d) : toAD(pk.y, pk.m, pk.d);
  if (!r) return;
  S.picker = { cal, y: r.year, m: r.month, d: r.date };
  S.pickerCal = cal;
  document.querySelectorAll('.seg').forEach(b => b.setAttribute('aria-pressed', b.dataset.act === `cal:${cal}`));
  fillWheels();
}

function pickerDone() {
  const pk = S.picker;
  const ad = pk.cal === 'AD' ? { y: pk.y, m: pk.m, d: pk.d } : (a => a && { y: a.year, m: a.month, d: a.date })(toAD(pk.y, pk.m, pk.d));
  if (!ad) return;
  S.dob = `${pad(ad.d)} / ${pad(ad.m + 1)} / ${ad.y}`;
  S.picker = null; S.bsHint = null;
  S.dobErr = dobError();
  render();
}

// ---------- validation ----------
function dobError() {
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

// ---------- navigation ----------
let timers = [];
const every = (fn, ms) => timers.push(setInterval(fn, ms));
const after = (fn, ms) => timers.push(setTimeout(fn, ms));

function go(screen, { replace = false } = {}) {
  if (!replace && S.screen !== screen) S.stack.push(S.screen);
  S.screen = screen;
  S.picker = null;
  render();
}
function back() {
  const prev = S.stack.pop();
  if (!prev) return;
  S.screen = prev; S.picker = null;
  render();
}

function render() {
  window.onLeave?.(); window.onLeave = null; // e.g. release a screen wake lock
  timers.forEach(t => { clearInterval(t); clearTimeout(t); });
  timers = [];
  phone.classList.toggle('desk', S.app === 'desk' || S.app === 'staff'); // the desktop apps (desk.js, staff.js) render at 1440 × 900
  phone.innerHTML = SCREENS[S.screen]();
  fitStage();
  mount[S.screen]?.();
  renderSheet();
  const ov = OVERLAY[S.sheet]?.(); // bottom sheets any screen can open (care.js)
  if (ov) phone.firstElementChild.insertAdjacentHTML('beforeend', ov);
  const body = phone.querySelector('.body'), bar = phone.querySelector('.appbar');
  if (body && bar) body.onscroll = () => bar.classList.toggle('seam', body.scrollTop > 0); // Scrolled: a seam, not a shadow
  syncPanel();
}

// Per-screen behaviour after render
const mount = {
  splash: () => after(() => go('language', { replace: true }), 1800),
  returning: () => after(() => { S.loading = 'first'; toHome(); }, 1800), // signed in: straight to Home, no onboarding — skeletons while it loads

  phone: () => {
    const input = document.getElementById('tel');
    if (S.codeFor === 'newphone') input.focus();
    input.oninput = () => {
      S[telKey()] = input.value;
      if (S.phoneErr) { S.phoneErr = false; setPhoneError(false); }
    };
    input.onkeydown = e => { if (e.key === 'Enter') sendCode(); };
  },

  code: () => {
    const input = document.getElementById('code-in');
    input.focus({ preventScroll: true });
    input.setSelectionRange(6, 6);
    input.oninput = () => {
      S.code = digits(input.value).slice(0, 6); // paste and SMS autofill fill all six at once
      if (S.codeState !== 'typing' && S.codeState !== 'noarrive') { S.codeState = 'typing'; return render(); }
      paintCells();
      if (S.code.length === 6) verify(); // verifies on the sixth digit
    };
    if (S.codeState === 'typing') every(() => {
      S.resend--;
      if (S.resend <= 0) { S.codeState = 'noarrive'; S.code = ''; return render(); } // the countdown becomes the button
      document.getElementById('resend').textContent = `Resend code in ${mmss(S.resend)}`;
    }, 1000);
  },

  locked: () => every(() => {
    S.lock--;
    if (S.lock <= 0) { S.tries = 3; S.lock = 14 * 60 + 52; S.stack = ['splash']; return go('phone', { replace: true }); }
    document.getElementById('lock').textContent = mmss(S.lock);
  }, 1000),

  profile: () => {
    const name = document.getElementById('name'), dob = document.getElementById('dob');
    name.oninput = () => { S.name = name.value; if (S.nameErr && S.name.trim()) { S.nameErr = false; clearErr(name, 'name-msg', ''); } };
    dob.oninput = () => {
      const before = dob.value.length;
      dob.value = S.dob = maskDob(dob.value);
      if (dob.value.length < before) dob.setSelectionRange(dob.value.length, dob.value.length);
      if (S.dobErr) { S.dobErr = ''; clearErr(dob, 'dob-msg', support('AD or BS — choose in the date picker.')); }
    };
    dob.onblur = () => { if (S.dob.length === 14) { S.dobErr = dobError(); if (S.dobErr) render(); else document.getElementById('dob-msg').innerHTML = support(bsFromField()); } };
    document.querySelectorAll('input[name="sex"]').forEach(r => r.onchange = () => {
      S.sex = r.value;
      if (S.sexErr) { S.sexErr = false; document.getElementById('sex').classList.remove('err'); document.getElementById('sex-msg').innerHTML = ''; } // choosing a sex clears its error
    });
    document.getElementById('pf').onsubmit = e => { e.preventDefault(); createProfile(); };
  },
};

function bsFromField() { const p = parseDob(S.dob), b = p && toBS(p.y, p.m, p.d); return b ? bsText(b) : 'AD or BS — choose in the date picker.'; }
function clearErr(input, msgId, html) { input.closest('.field').classList.remove('err'); document.getElementById(msgId).innerHTML = html; }

function setPhoneError(on) {
  document.getElementById('tel-field').classList.toggle('err', on);
  document.getElementById('tel-msg').innerHTML = on
    ? support('Nepali mobile numbers are 10 digits, starting with 9.', 'err')
    : support('Only used to sign you in and send visit updates.');
}

function paintCells() {
  const cells = document.querySelectorAll('#code .cell');
  cells.forEach((c, i) => { c.textContent = S.code[i] || ''; c.classList.toggle('focus', i === S.code.length); });
  const v = document.querySelector('[data-act="verify"]');
  v.disabled = S.code.length < 6;
}

// ---------- actions ----------
function sendCode() {
  const d = digits(S[telKey()] || '');
  if (!/^9\d{9}$/.test(d)) { S.phoneErr = true; setPhoneError(true); document.getElementById('tel').focus(); return; } // keeps what was typed
  S.code = ''; S.codeState = 'typing'; S.resend = 42;
  go('code');
}

function verify() {
  if (S.code.length < 6 || S.codeState === 'expired') return;
  if (S.code === CODE_OK && S.codeFor === 'newphone') { // the old number is told by SMS too
    Object.assign(S, { phone: S.newPhone, phoneChanged: true, codeFor: null, tries: 3 });
    return backTo('pfdetails');
  }
  if (S.code === CODE_OK && S.codeFor === 'addperson') { S.codeFor = null; S.tries = 3; return go('whos', { replace: true }); } // the other records on this number
  if (S.code === CODE_OK && S.codeFor === 'pinreset') { S.tries = 3; S.codeFor = null; S.pinEntry = ''; return go('pinnew', { replace: true }); } // PIN reset (health.js)
  if (S.code === CODE_OK) { S.tries = 3; S.signedIn = true; S.stack = []; return go('whos', { replace: true }); }
  if (S.code === CODE_EXPIRED) { S.codeState = 'expired'; return render(); }
  S.tries--;
  if (S.tries <= 0) { S.stack = ['splash', 'phone']; return go('locked', { replace: true }); }
  S.codeState = 'wrong'; // digits kept, tries left stated
  render();
}

function createProfile() {
  S.name = document.getElementById('name').value;
  S.nameErr = !S.name.trim();
  S.dobErr = dobError();
  S.sexErr = !S.sex;
  if (S.nameErr || S.dobErr || S.sexErr) return render(); // every missing field says what it needs, all at once
  if (/sharma/i.test(S.name)) return go('match'); // demo: a close, not exact, match
  S.fullName = S.name.trim(); S.first = S.fullName.split(' ')[0];
  S.healthEmpty = true; S.careEmpty = true; S.followup = null; // a new patient has no visits yet
  toHome(); // notifications are asked for later, after the first booking
}

function endScreen(title, body) { S.endTitle = title; S.endBody = body; go('end'); }
function toHome() { S.stack = []; S.screen = 'home'; S.picker = null; S.unlocked = false; S.bio = null; S.sheet = null; render(); } // leaving the tab re-locks Health

phone.addEventListener('click', e => {
  if (window.interceptLink?.(e)) return; // calls and maps go through the phone's own prompt first (more.js)
  const el = e.target.closest('[data-act]');
  if (!el || el.disabled) return;
  const [act, arg] = el.dataset.act.split(/:(.*)/s);
  if (el.tagName === 'A') e.preventDefault();
  ACTIONS[act]?.(arg, el);
});
phone.addEventListener('keydown', e => { if (e.key === 'Escape' && S.picker) { S.picker = null; renderSheet(); } });

// data-act="name:arg" → ACTIONS.name(arg, el). booking.js adds its own.
const ACTIONS = {
    go: arg => go(arg),
    back,
    'splash-next': () => go('language', { replace: true }),
    'returning-next': () => toHome(),
    lang: (_, el) => { S.lang = el.dataset.v; phone.querySelectorAll('.tile').forEach(t => t.setAttribute('aria-checked', t === el)); },
    'send-code': sendCode,
    verify,
    'new-code': () => { S.code = ''; S.codeState = 'typing'; S.resend = 42; render(); },
    pick: arg => { S.fullName = arg; S.first = arg.split(' ')[0]; toHome(); }, // choosing yourself goes straight to Home
    'open-picker': openPicker,
    'close-picker': () => { S.picker = null; renderSheet(); },
    cal: arg => switchCal(arg),
    'picker-done': pickerDone,
    'create-profile': createProfile,
    'session-code': () => { S.phone = S.phone || '9841000412'; S.code = ''; S.codeState = 'typing'; S.resend = 42; go('code'); },
    'session-other': () => { S.phone = ''; go('phone'); },
    end: arg => arg === 'book' ? go('finddoctor') : endScreen('Not in these flows', 'This tab is designed in another Figma section.'),
    restart: () => start('full'),
};

// ---------- review panel: every Figma screen and its caption ----------
const FLOW = [
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
];
let ALL = [];

function boot() {
  ALL = FLOW.flatMap(([, items]) => items); // each screen's caption, for the note; the presets are test fixtures
  start('full');
}

// Two ways in: a returning patient with everything, or a new patient with nothing yet.
function start(kind) {
  S = fresh();
  if (kind === 'doctor') Object.assign(S, DOCTOR_START()); // doctor.js
  if (kind === 'desk') Object.assign(S, DESK_START()); // desk.js
  if (kind === 'staff') Object.assign(S, STAFF_START()); // staff.js
  if (kind === 'empty') Object.assign(S, { screen: 'home', signedIn: true, healthEmpty: true, careEmpty: true, followup: null, meds: [], notifs: [] });
  const ns = document.getElementById('notif-set'); if (ns) ns.value = 'visits';
  document.getElementById('cases').hidden = true;
  render();
}
window.jumpTo = n => { S = Object.assign(fresh(), ALL.find(x => x[0] === n)[4]()); render(); }; // tests only

function currentN() {
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
function syncPanel() {
  const n = currentN(), item = ALL.find(x => x[0] === n);
  document.querySelectorAll('[data-s]').forEach(c => { c[c.type === 'checkbox' ? 'checked' : 'value'] = S[c.dataset.s] ?? ''; });
  document.getElementById('note').innerHTML = item
    ? `<small>${n} · ${esc(item[2])}</small><strong>${esc(item[1])}</strong><p>${esc(item[3])}</p>`
    : `<small>Out of scope</small><strong>${S.endTitle}</strong><p>This screen isn't designed in the Figma sections this prototype covers.</p>`;
}
const NUM = {}; // screen → panel number, for screens added by booking.js
const OVERLAY = {}; // S.sheet → sheet markup drawn over the current screen
// The desktop apps are drawn at their real size and scaled to fit between the tab bars; the phones are 1:1.
function fitStage() {
  const k = S.app === 'desk' || S.app === 'staff' ? Math.max(.3, Math.min(1, (window.innerWidth - 48) / 1440, (window.innerHeight - 160) / 900)) : 1;
  phone.style.setProperty('--k', k.toFixed(3));
  const tab = S.app !== 'staff' ? S.app : ({ admin: 'admin', desk: 'reception', hr: 'hr' })[stMe()?.access] || staffTab;
  document.querySelectorAll('[data-tab]').forEach(b => b.setAttribute('aria-current', b.dataset.tab === tab));
  const cases = document.getElementById('cases');
  const kind = !cases.hidden ? 'edge' : (S.app === 'patient' ? S.careEmpty : S.app === 'staff' ? S.stHoliday : S.drNoPatients) ? 'empty' : 'full';
  document.querySelectorAll('[data-case]').forEach(b => b.setAttribute('aria-current', b.dataset.case === kind));
}
// Top tabs: one per role, all on the same day. A staff tab signs straight in as that person.
const STAFF_TAB = { hr: 'ab', reception: 'sbr', admin: 'rk' };
let staffTab = 'admin'; // which staff tab stays lit on the signed-out sign-in screen
function pickTab(t) {
  const who = STAFF_TAB[t];
  if (!who) { showApp(t); return fitStage(); }
  staffTab = t;
  showApp('staff');
  if (S.stMe !== who) { S.stMe = who; Object.assign(S, { stMenu: null, stack: [], screen: stHome() }); }
  render();
}
// Bottom tabs: the whole flow from sign-in, the empty day, or the edge-case controls.
function pickCase(c) {
  const cases = document.getElementById('cases');
  if (c === 'edge') { cases.hidden = !cases.hidden; return fitStage(); }
  if (c === 'full') return start(S.app === 'patient' ? 'full' : S.app);
  if (S.app === 'patient') return start('empty');
  S[S.app === 'staff' ? 'stHoliday' : 'drNoPatients'] = true;
  render();
}
window.addEventListener('resize', fitStage);
const setS = el => { S[el.dataset.s] = el.type === 'checkbox' ? el.checked : el.value; render(); }; // panel demo controls

document.addEventListener('DOMContentLoaded', boot); // after booking.js has added its screens
