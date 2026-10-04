// Clinica — Patient flow: booking a visit, and its unhappy paths.
// Figma: zw3saW6ot26E6gWH20K3ux, section 118:6257. Plugs into app.js: SCREENS, mount, ACTIONS, FLOW, NUM.

const DAYS = [
  { d: 'Today', wd: 'Thu', date: 'Aug 28', iso: [2026, 7, 28] },
  { d: 'Fri', wd: 'Fri', date: 'Aug 29', iso: [2026, 7, 29] },
  { d: 'Sat', wd: 'Sat', date: 'Aug 30', iso: [2026, 7, 30], closed: true },
  { d: 'Sun', wd: 'Sun', date: 'Aug 31', iso: [2026, 7, 31] },
  { d: 'Mon', wd: 'Mon', date: 'Sep 1', iso: [2026, 8, 1] },
  { d: 'Tue', wd: 'Tue', date: 'Sep 2', iso: [2026, 8, 2] },
  { d: 'Wed', wd: 'Wed', date: 'Sep 3', iso: [2026, 8, 3] },
];
const DAY_TIMES = ['10:30 AM', '11:00 AM', '11:30 AM', '4:30 PM', '5:00 PM', '5:30 PM'];
const GM = 'General medicine';
// busy: day index → taken times, or 'all' when the day is fully booked
const DOCTORS = {
  ps: { name: 'Dr. Priya Sharma', ini: 'PS', spec: GM, sex: 'Female', opd: 'OPD 2', times: DAY_TIMES, busy: { 0: ['10:30 AM', '11:30 AM'], 1: ['11:00 AM'], 3: ['5:30 PM'] } },
  rs: { name: 'Dr. Ramesh Shrestha', ini: 'RS', spec: GM, sex: 'Male', opd: 'OPD 2', times: DAY_TIMES, busy: { 0: ['10:30 AM'] } },
  aj: { name: 'Dr. Anita Joshi', ini: 'AJ', spec: GM, sex: 'Female', opd: 'OPD 2', times: ['9:00 AM', '11:00 AM', '11:30 AM', '4:30 PM', '5:00 PM', '5:30 PM'], busy: { 0: 'all', 1: ['11:30 AM'] } },
  sk: { name: 'Dr. Suman KC', ini: 'SK', spec: GM, sex: 'Male', opd: 'OPD 4', times: DAY_TIMES, busy: { 0: 'all', 1: 'all', 3: 'all', 4: 'all', 5: 'all' } },
  // Other specialists: their profiles aren't designed yet, so their rows don't open.
  bt: { name: 'Dr. Bikash Thapa', ini: 'BT', spec: 'Cardiology', sex: 'Male', opd: 'OPD 6', times: DAY_TIMES, busy: { 0: 'all', 1: 'all', 3: 'all' }, noProfile: true },
  sr: { name: 'Dr. Sunita Rai', ini: 'SR', spec: 'Dermatology', sex: 'Female', opd: 'OPD 7', times: DAY_TIMES, busy: {}, noProfile: true },
  kg: { name: 'Dr. Kiran Gurung', ini: 'KG', spec: 'Paediatrics', sex: 'Male', opd: 'OPD 8', times: DAY_TIMES, busy: {}, noProfile: true },
  ms: { name: 'Dr. Maya Shrestha', ini: 'MS', spec: 'Gynaecology', sex: 'Female', opd: 'OPD 9', times: ['10:00 AM', '10:30 AM', '2:00 PM'], busy: { 0: 'all' }, noProfile: true },
};
const SPECIALTIES = ['General medicine', 'Cardiology', 'Dermatology', 'Paediatrics', 'Gynaecology'];
// A condition search explains itself: which specialty treats it, then those doctors. null = none at this clinic.
const CONDITIONS = [[/fever|cold|cough|flu|headache|stomach|diabet|sugar|blood pressure/, GM], [/skin|rash|acne|itch|eczema/, 'Dermatology'],
  [/child|baby|infant|kid/, 'Paediatrics'], [/heart|chest|palpitation/, 'Cardiology'], [/pregnan|period|menstru/, 'Gynaecology'],
  [/eye|vision|sight/, null, 'eye'], [/tooth|teeth|dental/, null, 'dental']];
const specIcon = (s, on) => `${A}sp-${s === GM ? 'general' : s.toLowerCase()}${on ? '-active' : ''}.svg`;

// ---------- slot logic ----------
const listHas = (l, t) => l === 'all' || (l || []).includes(t);
const isTaken = (doc, day, t) => DAYS[day].closed || listHas(DOCTORS[doc].busy[day], t) || listHas(S.taken[`${doc}|${day}`], t);
const freeTimes = (doc, day) => DOCTORS[doc].times.filter(t => !isTaken(doc, day, t));
const nextOpen = (doc, from = 0) => DAYS.findIndex((_, i) => i >= from && freeTimes(doc, i).length);
const dayName = i => `${DAYS[i].wd}, ${DAYS[i].date}`;
const rel = i => i === 0 ? 'today' : i === 1 ? 'tomorrow' : `on ${dayName(i)}`;
const when = (i, t) => i === 0 ? `Today, ${t}` : i === 1 ? `Tomorrow, ${t}` : `${dayName(i)}, ${t}`;
const bookWhen = (i, t) => i === 0 ? `${t} today` : i === 1 ? `tomorrow, ${t}` : `${dayName(i)}, ${t}`; // 'Book 11:30 AM today', 'Book tomorrow, 9:00 AM'
const surname = n => n.split(' ').pop();
const initials = n => n.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

// ---------- pieces ----------
const iconBtn = (icon, label, act, extra = '') =>
  `<button class="icon-btn" data-act="${act}" aria-label="${label}" ${extra}><img src="${A}${icon}" width="24" height="24" alt=""></button>`;
const bar = ({ back = true, title = '', actions = '', big = false } = {}) => `
  <div class="appbar">
    ${back ? iconBtn('icon-back.svg', 'Back', 'back') : ''}
    <div class="title" ${big ? 'style="font-size:20px"' : ''}>${title}</div>
    <div class="bar-acts">${actions || '<div class="slot"></div>'}</div>
  </div>`;
const label = t => `<p class="sec-label">${t}</p>`;
const tag = (text, tone = '') => `<span class="tag ${tone}">${text}</span>`;
const row = (icon, title, sub) => `
  <div class="list-item static">
    <span class="lead-tile"><img src="${A}${icon}" width="20" height="20" alt=""></span>
    <span class="text"><span class="item-title">${title}</span><span class="body-s">${sub}</span></span>
  </div>`;
const rows = items => `<div class="list">${items.join('<div class="sep" aria-hidden="true"></div>')}</div>`;
const callBtn = size => `<a class="btn secondary ${size}" href="tel:+97710000000"><img src="${A}icon-call.svg" width="24" height="24" alt="">Call the clinic</a>`;

// Item, Content/Appointment. A chevron means the whole card is interactive.
function apptCard(a, link = false) {
  const d = DOCTORS[a.doc], tagName = link ? 'button' : 'div';
  return `<${tagName} class="card appt" ${link ? 'data-act="appt:today"' : ''}>
    <span class="avatar l">${d.ini}</span>
    <span class="appt-t"><span class="h-s">${d.name}</span><span class="when">${when(a.day, a.time)}</span><span class="where">${d.opd}, City Hospital</span></span>
    ${link ? `<img src="${A}icon-chevron-right.svg" width="20" height="20" alt="">` : ''}
  </${tagName}>`;
}

function navBar(active) {
  const tabs = [['Home', 'nav-home'], ['Care', 'nav-care'], ['Health', 'nav-health'], ['Ask', 'nav-ask'], ['Profile', 'nav-profile']];
  return `<div class="bottom"><nav class="bnav" aria-label="Main">
    ${tabs.map(([l, i]) => `<a href="#" data-act="${{ Home: 'home', Care: 'care-tab', Health: 'health-tab', Ask: 'ask-tab', Profile: 'pf-tab' }[l]}" ${l === active ? 'aria-current="page"' : ''}>
      <span><img src="${A}${i}${l === active ? '-active' : ''}.svg" width="24" height="24" alt=""></span>${l}</a>`).join('')}
  </nav>${homeInd()}</div>`;
}

function textArea(saved) {
  return `<div class="inset"><div class="field-wrap">
    <label class="label" for="reason" style="line-height:20px">Reason for visit (optional)</label>
    <div class="field textarea"><textarea id="reason" placeholder="For example: fever for three days">${esc(S.reason)}</textarea></div>
    ${support(saved ? "Saved. You won't need to type this again." : 'Helps your doctor prepare. Only the clinic sees this.')}
  </div></div>`;
}

// Low-stock banner on Home, from the medicines list in Health (health.js). Hidden once restocked.
function lowBanner() {
  const m = !S.healthEmpty && !S.offline && (S.meds || []).find(x => x.left / x.perDay <= 3); // a new patient has no medicines yet
  return m ? `<div class="inset"><button class="banner" data-act="health-go:mtlist">
    <img src="${A}icon-warning-18.svg" width="18" height="18" alt="">
    <span class="t"><span class="t1">${esc(m.title.split(' ')[0])} is running low</span><span class="t2">${m.left} ${m.unit} left · tap to restock</span></span>
    <img src="${A}icon-chevron-right-16.svg" width="16" height="16" alt=""></button></div>` : '';
}

// The card keeps its place, so Home doesn't reshuffle. On visit day it says the state, in Care's tones — never an estimate.
function homeVisit() {
  const a = S.appt, d = DOCTORS[a.doc], dr = `Dr. ${surname(d.name)}`, she = a.doc === 'ps' ? 'she' : 'the doctor';
  if (S.careEmpty) return `<div class="inset stack8">${label('Your next appointment')}
    <div class="card neutral"><div class="text"><p class="h-s">Nothing booked yet</p><p class="body-s">When you book a visit, it shows here.</p></div></div></div>`;
  const v = a.day === 0 && {
    late: ['warn', `${dr} is running late`, `Your ${a.time} slot is kept. We'll message you when ${she}'s ready.`, 'appt:today'],
    checkedin: ['info', "You're checked in", `Reception will call you when ${dr} is ready.`, 'appt:today'],
    turn: ['success', `${dr} is ready for you`, `Please go to ${d.opd} now.`, 'appt:today'],
    with: ['info', `You're with ${dr}`, 'Your notes will be in Health after your visit.', 'appt:today'],
    done: ['success', 'Visit complete', `${dr}'s notes are in Health.`, 'health-go:hvisit'], // the notes open through the Health lock
    missed: ['warn', `We missed you at ${a.time}`, "Book again when you're ready.", 'care-tab'],
  }[S.visitDay];
  if (!v) return `<div class="inset stack8">${label('Your next appointment')}${apptCard(a, true)}</div>`;
  return `<div class="inset stack8">${label("Today's visit")}<button class="card notice ${v[0]}" data-act="${v[3]}"><div class="text"><p class="h-s">${v[1]}</p><p class="body-s">${v[2]}</p></div></button></div>`;
}

// No connection: a slim line, and the saved content stays readable.
const offLine = () => S.offline ? `<p class="off-line" role="status">You're offline. Showing what was saved at 9:12 AM.</p>` : '';

// Skeletons shaped like Home's real layout, so nothing jumps when the content arrives.
const sk = (w, h, r = 'full') => `<span class="sk" style="width:${w};height:${h}px;border-radius:var(--radius-${r})"></span>`;
const homeSkeleton = () => `<div class="body g20" aria-busy="true"><p class="vh" role="status">Loading</p>
  ${S.loading === 'slow' ? `<div class="inset">${notice('', 'Taking longer than usual', "Check your connection. We'll keep trying.", btn('Try again', 'home-retry', { kind: 'secondary', size: 'l' }))}</div>` : ''}
  <div class="inset stack8" aria-hidden="true">${sk('90px', 12)}${sk('160px', 20)}</div>
  <div class="inset" aria-hidden="true">${sk('100%', 72, 'large')}</div>
  <div class="inset sk-tiles" aria-hidden="true">${sk('100%', 88, 'large').repeat(3)}</div>
  <div class="inset stack16" aria-hidden="true">${`<div class="sk-row">${sk('40px', 40)}<div class="stack8">${sk('180px', 12)}${sk('120px', 12)}</div></div>`.repeat(3)}</div>
</div>`;

// ---------- screens ----------
Object.assign(SCREENS, {
  home: () => {
    const st = S.homeState, a = S.appt, d = DOCTORS[a.doc];
    const photo = st === 'default' && S.fullName === 'Anisha Sharma';
    const today = st === 'cancelled' ? `
      <div class="card error notice">
        <div class="text"><p class="h-s">Your ${a.time} visit was cancelled</p>
          <p class="body-s">${d.name} can't see patients today. The clinic is sorry for the change.</p></div>
        ${btn('Book another time', 'rebook', { size: 'l' })}${callBtn('l')}
      </div>` : `
      <div class="card notice">
        <div class="text"><p class="h-s">You're checked in</p>
          <p class="body-s">Walk-ins are seen between booked patients, so waits vary. Reception will call your name.</p></div>
        ${tag('Waiting for Dr. Anita Joshi', 'info')}
      </div>`;
    return `
    <div class="screen">
      ${statusBar()}
      <div class="appbar">
        <div class="brand">Clinica</div>
        <button class="icon-btn bell" data-act="go:notifs" aria-label="Notifications${unread() ? ', unread' : ''}">
          <img src="${A}icon-bell.svg" width="24" height="24" alt="">${unread() ? `<img class="dot" src="${A}unread-dot.svg" width="12" height="12" alt="">` : ''}</button>
        <button class="icon-btn" data-act="go:history" aria-label="Your profile">
          ${photo ? `<img class="av32" src="${A}avatar-anisha.png" alt="">` : `<span class="av32 ini">${initials(S.fullName)}</span>`}</button>
      </div>
      ${offLine()}
      ${S.loading ? homeSkeleton() : `<div class="body g20">
        <div class="inset greet"><p>Good morning,</p><p class="name">${esc(S.first)}</p></div>
        ${st === 'default' ? homeVisit() + lowBanner()
          : `<div class="inset stack8">${label('Today')}${today}</div>`}
        ${st !== 'walkin' ? `<div class="inset"><div class="qa">
          <button class="tile" data-act="go:finddoctor"><img src="${A}qa-book.svg" width="28" height="28" alt="">Book a visit</button>
          <button class="tile" data-act="health-go:hlabs"><img src="${A}qa-lab.svg" width="28" height="28" alt="">Lab reports</button>
          <button class="tile" data-act="health-go:hrx"><img src="${A}qa-rx.svg" width="28" height="28" alt="">Prescriptions</button>
        </div></div>` : ''}
        ${st === 'default' && !S.healthEmpty ? `<div>${`<div class="inset">${label('Recent')}</div>`}<div class="list">
            ${[listItem('lt-lab.svg', 'Lab report ready', 'Open Health to see it', 'health-go:hreport'),
               listItem('lt-rx.svg', 'Prescription updated', 'From Dr. Sharma, Aug 25', 'health-go:hrxd'),
               listItem('lt-followup.svg', 'Follow-up due', 'Dermatology, Sep 14', 'stub:Follow-up')].join('<div class="sep" aria-hidden="true"></div>')}
          </div></div>` : ''}
        ${st === 'walkin' ? `<div class="stack7"><div class="inset">${label('Your visit')}</div>
          ${rows([row('lt-doctor.svg', 'Doctor', 'Dr. Anita Joshi, General medicine'), row('lt-location.svg', 'Where', 'OPD 3, City Hospital'), row('lt-fee.svg', 'Fee', 'NPR 800, paid at reception')])}</div>` : ''}
      </div>`}
      ${navBar('Home')}
    </div>`;
  },

  finddoctor: () => `
    <div class="screen">
      ${statusBar()}
      <div>
        ${bar({ title: 'Find doctor', actions: iconBtn('icon-filter.svg', 'Filter doctors', 'filter-open') })}
        <div class="docked"><div class="field">
          <img src="${A}icon-search.svg" width="20" height="20" alt="">
          <input id="q" type="search" placeholder="Doctor, specialty or condition" aria-label="Search doctors" value="${esc(S.query)}">
          <button class="cal-btn" data-act="clear-q" aria-label="Clear search"><img src="${A}icon-close.svg" width="20" height="20" alt=""></button>
        </div></div>
      </div>
      <div class="body" style="gap:16px;padding:16px 0">
        <div class="hscroll specs" role="radiogroup" aria-label="Specialty" ${S.query.trim() ? 'hidden' : ''}>
          ${SPECIALTIES.map(s => `<button class="tile spec" role="radio" aria-checked="${S.specialty === s}" data-act="spec:${s}">
            <img src="${specIcon(s, S.specialty === s)}" width="28" height="28" alt="">${s}</button>`).join('')}
        </div>
        ${Object.keys(DOCTORS).some(k => S.fav[k]) && !S.query.trim() ? `<div class="stack4"><div class="inset">${lbl('Saved')}</div>
          <div class="list">${Object.keys(DOCTORS).filter(k => S.fav[k]).map(docRow).join('<div class="sep" aria-hidden="true"></div>')}</div></div>` : ''}
        <div id="doclist">${docList()}</div>
      </div>
      ${homeInd()}
    </div>`,

  doctor: () => {
    const d = DOCTORS[S.doc], free = freeTimes(S.doc, S.day), n0 = nextOpen(S.doc), nxt = nextOpen(S.doc, S.day + 1);
    const canBook = free.includes(S.time);
    return `
    <div class="screen">
      ${statusBar()}
      ${bar({ actions: iconBtn(S.fav[S.doc] ? 'icon-heart-filled.svg' : 'icon-heart-outline.svg', S.fav[S.doc] ? 'Remove from saved' : 'Save doctor', `fav:${S.doc}`, `aria-pressed="${!!S.fav[S.doc]}"`)
        + `<span class="icon-btn" aria-hidden="true"><img src="${A}icon-more.svg" width="24" height="24" alt=""></span>` })}
      <div class="body g20">
        <div class="inset"><div class="doc-head">
          <span class="avatar xl">${d.ini}</span>
          <div class="doc-details"><p class="name">${d.name}</p><p class="spec">${d.spec}</p><p class="opd">${d.opd}, City Hospital</p>
            ${n0 === 0 ? tag('Available today', 'success') : tag(n0 === 1 ? 'Next slot tomorrow' : n0 > 0 ? `Next slot ${dayName(n0)}` : 'No openings this week', 'neutral')}</div>
        </div></div>
        <div class="inset"><div class="card neutral">
          <span class="lead-tile"><img src="${A}lt-fee.svg" width="20" height="20" alt=""></span>
          <span class="text"><span class="item-title">NPR 800</span><span class="body-s">Consultation fee, paid at reception</span></span>
        </div></div>
        <div class="inset stack8">
          ${label('Choose a day')}
          <div class="hscroll days" role="radiogroup" aria-label="Day">
            ${DAYS.map((x, i) => {
              const sel = i === S.day, off = !freeTimes(S.doc, i).length;
              return `<button class="pick day" role="radio" aria-checked="${sel}" ${off && !sel ? 'disabled' : ''} data-act="day:${i}"
                aria-label="${i === 0 ? 'Today' : x.wd}, ${x.date}${x.closed ? ', closed' : off ? ', fully booked' : ''}"><span class="d1">${x.d}</span><span class="d2">${x.date}</span></button>`;
            }).join('')}
          </div>
          <p class="hint">${n0 > 1 ? `Fully booked until ${dayName(n0)}. Closed on Saturdays.` : 'Closed on Saturdays'}</p>
        </div>
        ${free.length ? `
        <div class="inset stack8">
          ${label('Choose a time')}
          <div class="times" role="radiogroup" aria-label="Time">
            ${d.times.map(t => {
              const off = isTaken(S.doc, S.day, t);
              return `<button class="pick time" role="radio" aria-checked="${t === S.time}" ${off ? 'disabled' : ''} data-act="time:${t}" aria-label="${t}${off ? ', taken' : ''}">${t}</button>`;
            }).join('')}
          </div>
          <div class="note-line"><img src="${A}icon-info-18.svg" width="18" height="18" alt=""><p>If your doctor is running late, we'll message you. We won't guess a wait time.</p></div>
        </div>` : empty('icon-schedule-28.svg', S.day === 0 ? 'No times left today' : `No times left on ${dayName(S.day)}`,
          nxt >= 0 ? `The next opening is ${dayName(nxt)}. You can book that, or call the clinic to ask about coming in ${S.day === 0 ? 'today' : 'that day'}.`
                   : 'There are no openings this week. Call the clinic to ask about the next one.',
          (nxt >= 0 ? btn(`See ${dayName(nxt)}`, `day:${nxt}`, { size: 'l' }) : '') + callBtn('l'))}
      </div>
      ${free.length ? `<div class="cta bordered">${btn(canBook ? `Book ${bookWhen(S.day, S.time)}` : 'Choose a time', 'book', { disabled: !canBook })}</div>` : ''}
      ${homeInd()}
    </div>`;
  },

  history: () => `
    <div class="screen">
      ${statusBar()}${bar({ title: 'Visit history', big: true })}
      <div class="body">
        <div class="inset"><div class="pt-head"><span class="avatar l">${initials(S.fullName)}</span>
          <div><p class="name">${esc(S.fullName)}</p><p class="body-s">Female · 32 · CH-2381</p></div></div></div>
        <div class="inset"><button class="list-item" data-act="stub:Visit history">
          <span class="lead-tile"><img src="${A}lt-history.svg" width="20" height="20" alt=""></span>
          <span class="text"><span class="item-title">View history</span><span class="body-s">Aug 12, Jul 3, Jun 20</span></span>
          <img src="${A}icon-chevron-right-dark.svg" width="20" height="20" alt=""></button></div>
      </div>
      ${homeInd()}
    </div>`,

  review: () => `
    <div class="screen">
      ${statusBar()}${bar({ title: 'Review booking' })}
      <div class="body g20">
        <div class="inset">${apptCard({ doc: S.doc, day: S.day, time: S.time })}</div>
        ${rows([`<button class="list-item" data-act="sheet:bookfor">${lead('icon-person.svg')}<span class="text"><span class="item-title">Booking for</span><span class="body-s">${esc(bookFor())}</span></span></button>`,
          row('lt-fee.svg', 'Fee', 'NPR 800, paid at reception'), row('lt-sms.svg', 'Confirmation', `By SMS to ${masked()}`)])}
        ${textArea(false)}
      </div>
      <div class="cta bordered">${btn('Confirm booking', 'confirm')}</div>
      ${homeInd()}
    </div>`,

  failed: () => {
    const d = DOCTORS[S.doc], k = S.failKind;
    return `
    <div class="screen">
      ${statusBar()}${bar({ title: 'Review booking' })}
      <div class="body g20">
        <div class="inset"><div class="card ${k === 'taken' ? 'error' : 'warn'}" role="alert"><div class="text">${{
          taken: `<p class="h-s">${S.time} was just taken</p><p class="body-s">Someone else booked it while you were confirming. Everything you entered is saved.</p>`,
          offline: `<p class="h-s">Couldn't send your booking</p><p class="body-s">Nothing has been booked: you're not connected. Your details are saved, so just try again when you're online.</p>`,
          noreply: `<p class="h-s">We couldn't confirm your booking</p><p class="body-s">It may have gone through. Check your appointments before trying again, so you don't book twice.</p>`,
        }[k]}</div></div></div>
        ${rows([row('lt-doctor.svg', 'Doctor', `${d.name}, ${d.spec}`), row('icon-person.svg', 'Booking for', esc(bookFor())), row('lt-fee.svg', 'Fee', 'NPR 800, paid at reception')])}
        ${textArea(true)}
      </div>
      <div class="cta bordered">${{ taken: btn('Choose another time', 'another-time'), offline: btn('Try again', 'confirm'),
        noreply: btn('Check my appointments', 'care-tab') + btn('Try again', 'confirm', { kind: 'secondary' }) }[k]}</div>
      ${homeInd()}
    </div>`;
  },

  confirmed: () => {
    const a = S.booked || S.appt, d = DOCTORS[a.doc], other = a.for && a.for !== S.fullName, first = other && a.for.split(' ')[0];
    return `
    <div class="screen">
      ${statusBar()}${bar({ back: false, actions: iconBtn('icon-close-24.svg', 'Close', 'home') })}
      <div class="body center">
        <div class="success-mark"><img src="${A}icon-task-alt.svg" width="36" height="36" alt=""></div>
        <h2 class="h-lp">Appointment booked</h2>
        <div class="inset"><p class="confirm-line">${other ? `${first} is` : "You're"} booked with ${d.name} ${a.day === 0 ? `at ${a.time} today` : `${rel(a.day)} at ${a.time}`}.</p></div>
        <div class="inset" style="align-self:stretch">${apptCard(a)}</div>
        <div class="inset" style="align-self:stretch"><div class="notes">
          <div class="note-line"><img src="${A}icon-schedule.svg" width="18" height="18" alt=""><p>Arrive 15 minutes early and check in at the reception desk.</p></div>
          <div class="note-line"><img src="${A}icon-chat.svg" width="18" height="18" alt=""><p>${other
            ? `Details sent by SMS. To see ${first}'s appointments, switch to him in Profile.` : `Details sent by SMS to ${masked()}.`}</p></div>
        </div></div>
        ${S.cal.appt ? `<div style="align-self:stretch">${inCal}</div>` : ''}
      </div>
      <div class="cta">${S.cal.appt ? '' : calBtn('appt')}${btn('Done', 'done-confirmed')}</div>
      ${homeInd()}
    </div>`;
  },

  notif: () => {
    const a = S.appt, d = DOCTORS[a.doc];
    return `
    <div class="screen">
      ${statusBar()}
      <div class="body center" style="justify-content:center;gap:20px;padding:8px 0 16px">
        <div class="notif-tile"><img src="${A}icon-notifications-48.svg" width="48" height="48" alt=""></div>
        <div class="inset"><div class="heading" style="text-align:center"><h2 class="h-xl">Know if Dr. ${surname(d.name)} is running late</h2>
          <p class="lede">Your visit is ${rel(a.day)} at ${a.time}. We'll only tell you about your own appointments — reminders, delays and cancellations. No marketing, ever.</p></div></div>
        <div class="inset" style="align-self:stretch">${apptCard(a)}</div>
        <div class="inset"><p class="body-s tertiary" style="text-align:center">Turn this off and we'll still send updates by SMS.</p></div>
      </div>
      <div class="cta">${btn('Allow notifications', 'allow-notif')}${btn('Not now', 'not-now', { kind: 'secondary' })}</div>
      ${homeInd()}
    </div>`;
  },
});

function docRow(id) {
  const d = DOCTORS[id], n = nextOpen(id);
  const t = n === 0 ? tag('Available today', 'success') : n === 1 ? tag(`Next slot tomorrow, ${freeTimes(id, 1)[0]}`, 'neutral')
    : tag(n > 0 ? `Next slot ${d.noProfile ? dayName(n) : DAYS[n].date}` : 'No openings this week', 'neutral');
  const inner = `<span class="avatar">${d.ini}</span><span class="text doctor"><span class="h-s">${d.name}</span><span class="spec">${d.spec}</span>${t}</span>`;
  return d.noProfile ? `<div class="list-item static">${inner}</div>` : `<button class="list-item" data-act="doctor:${id}">${inner}${chev}</button>`;
}
const filtersOn = () => S.filt.today || S.filt.sex !== 'Any';
const filtMatch = (id, f = S.filt) => (!f.today || nextOpen(id) === 0) && (f.sex === 'Any' || DOCTORS[id].sex === f.sex);
const plural = (n, w) => `${n} ${w}${n === 1 ? '' : 's'}`;

function docList() {
  const q = S.query.trim().toLowerCase(), cond = q && CONDITIONS.find(([re]) => re.test(q));
  if (cond && !cond[1]) return empty('icon-search-secondary-28.svg', `No ${cond[2]} doctors at City Hospital`,
    `For ${cond[2] === 'eye' ? 'an eye' : 'a dental'} problem, ask reception about a referral. Or search for a doctor's name or another specialty.`,
    '<a class="btn secondary l" href="tel:+97710000000">Call the clinic</a>');
  const spec = cond ? cond[1] : S.specialty;
  const docs = Object.keys(DOCTORS).filter(id => DOCTORS[id].spec === spec && filtMatch(id) && (cond || !q || `${DOCTORS[id].name} ${DOCTORS[id].spec}`.toLowerCase().includes(q)));
  if (!docs.length) return empty('icon-search-secondary-28.svg', q ? `No doctors match “${esc(S.query.trim())}”` : `No ${spec.toLowerCase()} doctors match`,
    filtersOn() ? 'Try clearing the filters, or call the clinic to ask who can see you.' : 'Try another specialty, or call the clinic to ask who can see you.',
    (filtersOn() ? btn('Clear filters', 'filter-clear', { size: 'l' }) : '') + '<a class="btn secondary l" href="tel:+97710000000">Call the clinic</a>');
  const label = filtersOn() ? plural(docs.length, 'doctor') : spec === GM && !cond ? `${plural(docs.length, 'doctor')} at City Hospital` : `${plural(docs.length, 'doctor')} in ${spec}`;
  return `${cond ? `<div class="inset"><p class="search-hint">${esc(S.query.trim()[0].toUpperCase() + S.query.trim().slice(1))} is usually seen in ${spec}.</p></div>` : ''}
    ${filtersOn() ? `<div class="inset filt-row"><p>${[S.filt.today && 'Available today', S.filt.sex !== 'Any' && `${S.filt.sex} doctor`].filter(Boolean).join(' · ')}</p>
      <button class="btn secondary s" data-act="filter-clear">Clear</button></div>` : ''}
    <div class="inset">${label.replace(/^/, '<p class="sec-label">').replace(/$/, '</p>')}</div>
    <div class="list">${docs.map(docRow).join('<div class="sep" aria-hidden="true"></div>')}</div>`;
}

// ---------- behaviour ----------
Object.assign(mount, {
  home: () => { if (S.loading === 'first') after(() => { S.loading = null; render(); }, 900); },
  finddoctor: () => {
    const q = document.getElementById('q');
    q.oninput = () => { S.query = q.value; phone.querySelector('.specs').hidden = !!q.value.trim(); document.getElementById('doclist').innerHTML = docList(); };
  },
  doctor: () => phone.querySelector('.days [aria-checked="true"]')?.scrollIntoView({ block: 'nearest', inline: 'nearest' }),
  review: bindReason,
  failed: bindReason,
});
function bindReason() { const r = document.getElementById('reason'); r.oninput = () => { S.reason = r.value; }; }

// Re-render in place, keeping scroll positions, for selections on the same screen.
function rerender() {
  const body = phone.querySelector('.body'), top = body?.scrollTop, lefts = [...phone.querySelectorAll('.hscroll')].map(h => h.scrollLeft);
  render();
  const b = phone.querySelector('.body'); if (b) b.scrollTop = top;
  phone.querySelectorAll('.hscroll').forEach((h, i) => { h.scrollLeft = lefts[i] ?? 0; });
}

function backTo(screen) {
  const i = S.stack.lastIndexOf(screen);
  S.stack = i >= 0 ? S.stack.slice(0, i) : S.stack;
  S.screen = screen;
  render();
}

const bookFor = () => !S.bookFor || S.bookFor === S.fullName ? `${S.fullName} (you)` : S.bookFor;
function bookedDone() { // the patient's own visit becomes theirs; a visit for someone else lives in that person's records
  const b = S.booked;
  if (b.for === S.fullName) Object.assign(S, { appt: { doc: b.doc, day: b.day, time: b.time }, homeState: 'default', careEmpty: false, visitDay: 'booked' });
  S.reason = ''; S.cal.appt = false;
}

function takeSlot(doc, day, t) {
  const k = `${doc}|${day}`;
  if (S.taken[k] !== 'all') S.taken[k] = [...(S.taken[k] || []), t];
}

// The phone's add-event file: no doctor or specialty in the title, alerts matching the app's reminders.
// e.g. downloadIcs({ iso: [2026, 7, 28], time: '4:30 PM', loc: 'OPD 2, City Hospital, Maharajgunj' })
function downloadIcs({ iso: [y, mo, dd], time, loc }) {
  const [, h, m, ap] = /(\d+):(\d+) (AM|PM)/.exec(time);
  const start = new Date(y, mo, dd, (+h % 12) + (ap === 'PM' ? 12 : 0), +m), end = new Date(start.getTime() + 30 * 60000);
  const fmt = t => `${t.getFullYear()}${pad(t.getMonth() + 1)}${pad(t.getDate())}T${pad(t.getHours())}${pad(t.getMinutes())}00`;
  const alarm = trigger => ['BEGIN:VALARM', 'ACTION:DISPLAY', 'DESCRIPTION:Appointment — City Hospital', `TRIGGER:${trigger}`, 'END:VALARM'];
  const ics = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Clinica//Prototype//EN', 'BEGIN:VEVENT',
    `UID:${Date.now()}@clinica.prototype`, `DTSTAMP:${new Date().toISOString().replace(/[-:]|\.\d+/g, '')}`,
    `DTSTART:${fmt(start)}`, `DTEND:${fmt(end)}`, 'SUMMARY:Appointment — City Hospital', `LOCATION:${loc.replace(/,/g, '\\,')}`,
    `DESCRIPTION:${CAL_NOTE.replace(/,/g, '\\,')}`, ...alarm('-P1D'), ...alarm('-PT2H'), 'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
  const link = Object.assign(document.createElement('a'), { href: URL.createObjectURL(new Blob([ics], { type: 'text/calendar' })), download: 'clinica-visit.ics' });
  link.click();
  URL.revokeObjectURL(link.href);
}

Object.assign(ACTIONS, {
  home: toHome,
  'home-retry': () => { S.loading = 'first'; render(); },
  stub: arg => endScreen(arg, 'Not part of the onboarding, sign-in or booking flows in Figma.'),
  spec: arg => { S.specialty = arg; rerender(); },
  'clear-q': () => { S.query = ''; const q = document.getElementById('q'); q.value = ''; q.focus(); phone.querySelector('.specs').hidden = false; document.getElementById('doclist').innerHTML = docList(); },
  'find-spec': arg => { S.specialty = arg; S.query = ''; go('finddoctor'); },
  'filter-open': () => { S.fdraft = { ...S.filt }; S.sheet = 'filter'; rerender(); },
  'fd-today': () => { S.fdraft.today = !S.fdraft.today; rerender(); },
  'fd-sex': arg => { S.fdraft.sex = arg; rerender(); },
  'filter-apply': () => { S.filt = { ...S.fdraft }; S.sheet = null; rerender(); },
  'filter-clear': () => { S.filt = { today: false, sex: 'Any' }; S.sheet = null; rerender(); },
  doctor: arg => { S.doc = arg; S.day = 0; S.time = null; go('doctor'); },
  fav: arg => { S.fav[arg] = !S.fav[arg]; rerender(); },
  day: arg => { S.day = +arg; S.time = null; rerender(); },
  time: arg => { S.time = arg; rerender(); },
  book: () => go('review'),
  confirm: () => {
    const fail = S.offline ? 'offline' : S.failNext, mine = S.booked && S.booked.doc === S.doc && S.booked.day === S.day && S.booked.time === S.time;
    const toFailed = kind => { S.failKind = kind; S.screen === 'failed' ? rerender() : go('failed'); };
    if (fail === 'offline') return toFailed('offline'); // never left the phone: certainly nothing booked, retrying is safe
    if (!mine && fail === 'taken') { S.failNext = ''; takeSlot(S.doc, S.day, S.time); return toFailed('taken'); } // taken while confirming
    if (!mine) { takeSlot(S.doc, S.day, S.time); S.booked = { doc: S.doc, day: S.day, time: S.time, for: S.bookFor || S.fullName }; }
    if (!mine && fail === 'noreply') { S.failNext = ''; bookedDone(); return toFailed('noreply'); } // it went through, but no answer came back
    bookedDone();
    S.stack = []; S.screen = 'confirmed'; render(); // no back arrow
  },
  'book-for': arg => { S.bookFor = arg; S.sheet = null; rerender(); }, // choosing closes the sheet: a single choice needs no Done
  'another-time': () => { S.time = null; backTo('doctor'); },
  // Asked only after a booking; skipped if already on; after a second 'Not now', only from Profile.
  // The notifications prompt is written about Dr. Sharma's visit, so other doctors' bookings go straight Home.
  'done-confirmed': () => (S.notif === 'on' || S.notNow >= 2 || (S.booked || S.appt).doc !== 'ps') ? toHome() : go('notif', { replace: true }),
  'allow-notif': () => { S.notif = 'on'; toHome(); },
  'not-now': () => { S.notNow++; toHome(); },
  rebook: () => { // 'Book another time' returns to her availability, with today gone
    S.taken[`${S.appt.doc}|0`] = 'all';
    S.doc = S.appt.doc; S.day = 0; S.time = null;
    go('doctor');
  },
});

Object.assign(NUM, {
  home: s => s.loading === 'first' ? 'GX04' : s.loading === 'slow' ? 'GX06' : s.homeState !== 'default' ? ({ cancelled: 'B09', walkin: 'B10' })[s.homeState]
    : s.offline ? 'GX01' : s.careEmpty ? 'SH01' : s.appt.day === 0 && ({ late: 'SH02', checkedin: 'SH03', done: 'SH04' })[s.visitDay] || 'B01',
  finddoctor: s => s.sheet === 'filter' ? 'SB12' : filtersOn() ? 'SB13' : s.query.trim() ? (CONDITIONS.find(([re]) => re.test(s.query.toLowerCase()))?.[1] ? 'SB06' : 'SB07')
    : ({ Cardiology: 'SB08', Dermatology: 'SB09', Paediatrics: 'SB10', Gynaecology: 'SB11' })[s.specialty] || (Object.values(s.fav).some(Boolean) ? 'SB15' : 'B02'),
  doctor: s => !freeTimes(s.doc, s.day).length ? 'B07' : s.fav[s.doc] ? 'SB14' : 'B03',
  history: () => 'B03b', confirmed: () => 'B05', notif: () => 'B06', failed: s => ({ taken: 'B08', offline: 'SB04', noreply: 'SB05' })[s.failKind],
  review: s => s.sheet === 'bookfor' ? 'SB01' : s.bookFor && s.bookFor !== s.fullName ? 'SB02' : 'B04',
});

const BOOKING_STACK = ['home', 'finddoctor', 'doctor'];
FLOW.push(
  ['Booking — happy path', [
    ['B01', 'Home', 'Taps ‘Book a visit’', 'Next appointment as a Neutral card; quick actions are Specialty tiles; Recent names no drug.', () => ({ screen: 'home' })],
    ['B02', 'Find doctor', 'Taps Dr. Priya Sharma', "Docked search, specialty filter clipped at the edge as the scroll cue, one clinic's doctors, no ratings.", () => ({ screen: 'finddoctor', stack: ['home'] })],
    ['B03', 'Doctor profile', 'Picks 4:30 PM, taps Book', 'Contained header, fee up front, Saturday closed, taken slots shown as taken, no wait estimate.', () => ({ screen: 'doctor', stack: ['home', 'finddoctor'] })],
    ['B03b', 'Visit history', 'Linked from the avatar on Home', 'Sits beside 03 in Figma with no caption or arrow; this prototype opens it from the profile avatar on Home.', () => ({ screen: 'history', stack: ['home'] })],
    ['B04', 'Review booking', 'Taps Confirm booking', 'Summary rows carry no chevrons because nothing on them is tappable. Pay at reception.', () => ({ screen: 'review', stack: [...BOOKING_STACK] })],
    ['B05', 'Confirmed', 'Taps Done', 'Success tone earned. No back arrow. Check in at reception, not by QR. Done leads to 06.', () => ({ screen: 'confirmed', taken: { 'ps|0': ['4:30 PM'] } })],
    ['B06', 'Notifications', 'After Done', "Asked only after an accomplishment — here, a confirmed booking — so the value is concrete: this visit, this doctor. Skipped if notifications are already on. After 'Not now', ask again only after the next booking; after a second 'Not now', only from Profile. SMS updates continue either way.", () => ({ screen: 'notif' })],
  ]],
  ['Booking — unhappy paths', [
    ['B07', 'No slots available', 'Branches from 03 Doctor profile', 'Every visible day shown as taken, not hidden. The Empty state offers the next opening and the phone, and there is no Book button because there is nothing to book.', () => ({ screen: 'doctor', doc: 'sk', time: null, stack: ['home', 'finddoctor'] })],
    ['B08', 'Booking failed', 'Branches from 04 Review booking', 'The realistic failure: the slot was taken while confirming. Everything typed is kept, and the only action is at the thumb.', () => ({ screen: 'failed', stack: [...BOOKING_STACK, 'review'], reason: 'Fever for three days, with a headache', taken: { 'ps|0': ['4:30 PM'] } })],
    ['B09', 'Doctor cancelled', 'Replaces the card on 01 Home', "Error tone, two explicit actions, no chevron. The doctor's reason stays private. 'Book another time' returns to her availability.", () => ({ screen: 'home', homeState: 'cancelled' })],
    ['B10', 'Walk-in, checked in', 'Registered at reception, not in the app', "A walk-in who needs the app isn't a walk-in. This is what a patient who has it sees: a state, an honest line that the wait can change, no position, no minutes.", () => ({ screen: 'home', homeState: 'walkin' })],
  ]],
);

