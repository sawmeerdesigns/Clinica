// Clinica — Patient flow: booking a visit, and its unhappy paths.
// Figma: zw3saW6ot26E6gWH20K3ux, section 118:6257. Plugs into core.jsx: SCREENS, mount, ACTIONS, FLOW, NUM.
import { btn, empty, endScreen, family, heading, homeInd, listItem, masked, onboarding, pad, start, statusBar, support, toHome } from './app.jsx';
import { T, acts, answer, ask, src } from './ask.jsx';
import { CAL_NOTE, calBtn, csheet, inCal, notice, unread } from './care.jsx';
import { $phone, A, ACTIONS, FLOW, NE, NUM, OVERLAY, S, SCREENS, after, back, go, mount, nd, ne, paint, render, sepJoin, shownAt, toast, tr } from './core.jsx';
import { chev, field, lbl, lead, list } from './health.jsx';
import { openSys } from './more.jsx';
import { img, now, patients, person } from './staff.jsx';
import { DAY_TIMES, DOCTORS, FEE, GM, TODAY, WALLETS, week } from './data.js';

// F15/R12: tr() and the Nepali strings now live in core.jsx, shared by the whole patient app.
// Phase 8: Nepali for this module's own lines
Object.assign(NE, {
  Back: 'पछाडि', Close: 'बन्द गर्नुहोस्', Main: 'मुख्य', 'Your profile': 'तपाईंको प्रोफाइल', 'City Hospital': 'सिटी हस्पिटल', Time: 'समय', Clear: 'हटाउनुहोस्',
  'Filter doctors': 'डाक्टर फिल्टर गर्नुहोस्', 'Save doctor': 'डाक्टर सेभ गर्नुहोस्', 'Remove from saved': 'सेभबाट हटाउनुहोस्', 'Clear search': 'खोज हटाउनुहोस्',
  'Clear filters': 'फिल्टर हटाउनुहोस्', doctor: 'डाक्टर', tablets: 'ट्याब्लेट', 'View history': 'इतिहास हेर्नुहोस्', Loading: 'लोड हुँदैछ',
  'Taking longer than usual': 'सामान्यभन्दा बढी समय लाग्दैछ', "Check your connection. We'll keep trying.": 'इन्टरनेट जडान जाँच्नुहोस्। हामी प्रयास गरिरहन्छौं।',
  'Helps your doctor prepare. Only the clinic sees this.': 'यसले डाक्टरलाई तयारी गर्न मद्दत गर्छ। यो क्लिनिकले मात्र देख्छ।',
  "Saved. You won't need to type this again.": 'सेभ भयो। फेरि लेख्नु पर्दैन।',
  'Your notes will be in Health after your visit.': 'भेटपछि डाक्टरको टिप्पणी स्वास्थ्यमा आउनेछ।', "Book again when you're ready.": 'तयार हुँदा फेरि बुक गर्नुहोस्।',
  'Next slot tomorrow': 'अर्को समय भोलि', 'No openings this week': 'यो हप्ता समय खाली छैन', 'No times left today': 'आज समय बाँकी छैन',
  'There are no openings this week. Call the clinic to ask about the next one.': 'यो हप्ता कुनै समय खाली छैन। अर्को कहिले खुल्छ, क्लिनिकमा फोन गरेर सोध्नुहोस्।',
  "If your doctor is running late, we'll message you. We won't guess a wait time.": 'डाक्टर ढिला हुनुभयो भने हामी तपाईंलाई खबर गर्छौं। पर्खने समयको अनुमान गर्दैनौं।',
  'Someone else booked it while you were confirming. Everything you entered is saved.': 'तपाईंले पुष्टि गर्दै गर्दा अरू कसैले यो समय बुक गर्नुभयो। तपाईंले लेखेका सबै कुरा सेभ छन्।',
  "Couldn't send your booking": 'बुकिङ पठाउन सकिएन', "We couldn't confirm your booking": 'बुकिङ पुष्टि गर्न सकिएन',
  "Nothing has been booked: you're not connected. Your details are saved, so just try again when you're online.": 'केही बुक भएको छैन: तपाईं इन्टरनेटमा जोडिनुभएको छैन। तपाईंको विवरण सेभ छ, अनलाइन भएपछि फेरि प्रयास गर्नुहोस्।',
  "It may have gone through. Trying again is safe: if it did, you'll still be booked only once.": 'बुकिङ भइसकेको हुन सक्छ। फेरि प्रयास गर्दा केही बिग्रँदैन: भइसकेको भए पनि एक पटक मात्र बुक हुन्छ।',
  "You're booked once": 'तपाईं एक पटक मात्र बुक हुनुभयो', "Trying again didn't make a second booking.": 'फेरि प्रयास गर्दा दोस्रो बुकिङ भएन।',
  'Arrive 15 minutes early and check in at the reception desk.': '15 मिनेट अगाडि आइपुग्नुहोस् र रिसेप्सनमा चेक इन गर्नुहोस्।',
  'No doctors match': 'मिल्ने डाक्टर भेटिएनन्', 'Try clearing the filters, or call the clinic to ask who can see you.': 'फिल्टर हटाएर हेर्नुहोस्, वा कुन डाक्टरले हेर्न सक्नुहुन्छ भनेर क्लिनिकमा फोन गरेर सोध्नुहोस्।',
  'Try another specialty, or call the clinic to ask who can see you.': 'अर्को विशेषज्ञता छान्नुहोस्, वा कुन डाक्टरले हेर्न सक्नुहुन्छ भनेर क्लिनिकमा फोन गरेर सोध्नुहोस्।',
  'Keep just the one': 'एउटा मात्र राख्नुहोस्', 'Book a second visit': 'दोस्रो भेट बुक गर्नुहोस्', // Run 6 Y02
});
const L = (en, np) => ne() ? np : en; // Phase 8: a line whose Nepali is built around names, times or numbers

// F20: the booking week, labelled from real dates (Saturday closed).
export const DAYS = week(TODAY).map((x, i) => ({ ...x, d: i === 0 ? 'Today' : x.wd }));
// One doctor list for every app (data.js, W20).
export { DAY_TIMES, DOCTORS, GM };
export const SPECIALTIES = ['General medicine', 'Cardiology', 'Dermatology', 'Paediatrics', 'Gynaecology'];
// A condition search explains itself: which specialty treats it, then those doctors. null = none at this clinic.
export const CONDITIONS = [[/fever|cold|cough|flu|headache|stomach|diabet|sugar|blood pressure/, GM], [/skin|rash|acne|itch|eczema/, 'Dermatology'],
  [/child|baby|infant|kid/, 'Paediatrics'], [/heart|chest|palpitation/, 'Cardiology'], [/pregnan|period|menstru/, 'Gynaecology'],
  [/eye|vision|sight/, null, 'eye'], [/tooth|teeth|dental/, null, 'dental']];
export const specIcon = (s, on) => `${A}sp-${s === GM ? 'general' : s.toLowerCase()}${on ? '-active' : ''}.svg`;

// ---------- slot logic ----------
export const listHas = (l, t) => l === 'all' || (l || []).includes(t);
// Run 6 Y02: a slot this person already holds can't be booked again; the doctor page shows it as "Your visit".
export const isTaken = (doc, day, t) => DAYS[day].closed || listHas(DOCTORS[doc].busy[day], t) || listHas(S.taken[`${doc}|${day}`], t) || !!holds(doc, day, t);
export const holds = (doc, day, t) => visits().find(v => v.doc === doc && v.day === day && (!t || v.time === t));
// Run 6 Y02: a person can have several visits booked. S.appt is the one the care team's apps follow (Anisha's 4:30 today); S.more
// holds the rest. Soonest first; i is null for S.appt, else its place in S.more (Care opens it with appt:i).
const mins = t => { const [, h, m, ap] = /(\d+):(\d+) (AM|PM)/.exec(t); return (h % 12 + (ap === 'PM' ? 12 : 0)) * 60 + +m; };
export const visits = () => [...(S.careEmpty ? [] : [{ ...S.appt, i: null }]), ...S.more.map((v, i) => ({ ...v, i }))].sort((a, b) => a.day - b.day || mins(a.time) - mins(b.time));
export const openVisit = () => S.vOpen == null ? S.appt : S.more[S.vOpen]; // the visit Care has open
export const freeTimes = (doc, day) => DOCTORS[doc].times.filter(t => !isTaken(doc, day, t));
export const nextOpen = (doc, from = 0) => DAYS.findIndex((_, i) => i >= from && freeTimes(doc, i).length);
export const dayName = i => `${DAYS[i].wd}, ${DAYS[i].date}`;
export const rel = i => i === 0 ? 'today' : i === 1 ? 'tomorrow' : `on ${dayName(i)}`;
export const when = (i, t) => tr(i === 0 ? `Today, ${t}` : i === 1 ? `Tomorrow, ${t}` : `${dayName(i)}, ${t}`); // Phase 8: 'आज, दिउँसो 4:30' in Nepali
export const bookWhen = (i, t) => i === 0 ? `${t} today` : i === 1 ? `tomorrow, ${t}` : `${dayName(i)}, ${t}`; // 'Book 11:30 AM today', 'Book tomorrow, 9:00 AM'
// Figma sync: Nepali puts the time first — 'आज 4:30 PM मा बुक गर्नुहोस्', not 'बुक गर्नुहोस् 4:30 PM today'.
export const bookLabel = (i, t) => ne() ? `${when(i, t).replace(/^(आज|भोलि),/, '$1')} मा ${tr('Book')}` : `Book ${bookWhen(i, t)}`;
export const surname = n => n.split(' ').pop();
export const initials = n => n.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

// ---------- pieces ----------
// extra: more attributes for the button, e.g. { 'aria-pressed': true }
export const iconBtn = (icon, label, act, extra = {}) =>
  <button className="icon-btn" data-act={act} aria-label={tr(label)} {...extra}><img src={`${A}${icon}`} width="24" height="24" alt="" /></button>;
export const bar = ({ back = true, title = '', actions = null, big = false } = {}) => (
  <div className="appbar">
    {back ? iconBtn('icon-back.svg', 'Back', 'back') : null}
    {title ? <h1 className="title" style={big ? { fontSize: 20 } : undefined}>{tr(title)}</h1> : <div className="title"></div>}{/* W13: a titled bar is the screen's heading */}
    <div className="bar-acts">{actions || <div className="slot"></div>}</div>
  </div>);
export const label = t => <p className="sec-label">{tr(t)}</p>; // F15/R12
export const tag = (text, tone = '') => <span className={`tag ${tone}`}>{tr(text)}</span>;
export const row = (icon, title, sub) => (
  <div className="list-item static">
    <span className="lead-tile"><img src={`${A}${icon}`} width="20" height="20" alt="" /></span>
    <span className="text"><span className="item-title">{tr(title)}</span><span className="body-s">{tr(sub)}</span></span>
  </div>);
export const rows = items => <div className="list">{sepJoin(items)}</div>;

// Pay now (Figma 641:31182). R10: nothing is chosen until the patient picks — Pay at reception is an explicit option, like the wallets.
// F09/R13/T05/V06/W01: the Fee row says "to pay" until the wallet confirms; on a failure screen it says nothing was charged.
export { WALLETS };
const howText = how => ne() ? (how === 'reception' ? 'रिसेप्सनमा तिर्ने' : how ? `${WALLETS[how][0]} बाट तिर्ने` : 'तल कसरी तिर्ने छान्नुहोस्') // Figma sync: B04 fee line in Nepali
  : how === 'reception' ? 'to pay at reception' : how ? `to pay with ${WALLETS[how][0]}` : 'choose how to pay below';
export const feeRow = (failed = false) => row('lt-fee.svg', tr('Fee'), `NPR ${FEE}, ${howText(S.payWith)}${failed ? `. ${tr('You have not been charged.')}` : ''}`);
export const payBlock = () => <div className="pay-block">{label(tr("How you'll pay"))}
  <div className="pay-tiles" role="radiogroup" aria-label={tr("How you'll pay")}>
    <button className="pay-tile" role="radio" aria-checked={S.payWith === 'reception'} data-act="pay:reception"><span className="pay-mark reception" aria-hidden="true"><img src={`${A}lt-fee.svg`} width="16" height="16" alt="" /></span>{tr('Pay at reception')}</button>
    {Object.entries(WALLETS).map(([id, [name, mark]]) =>
    <button key={id} className="pay-tile" role="radio" aria-checked={S.payWith === id} data-act={`pay:${id}`}><span className={`pay-mark ${id}`} aria-hidden="true">{mark}</span>{name}</button>)}</div></div>;
// F09/R13/T05/V06/W02: a booked visit's fee is one of Paid · receipt / Not paid · Pay now / Pay at reception. A visit with no pay record pays at reception.
export const payState = a => { const p = a.pay || { how: 'reception' }, w = WALLETS[p.how]?.[0];
  return p.paid ? ['Paid', L(`NPR ${FEE} with ${w} · Receipt ${p.ref}`, `NPR ${FEE}, ${w} बाट · रसिद ${p.ref}`)] : w ? ['Not paid', L(`NPR ${FEE} with ${w}. Your visit is still booked.`, `NPR ${FEE}, ${w} बाट। तपाईंको भेट अझै बुक छ।`)] : ['Pay at reception', `NPR ${FEE}, ${tr('when you check in')}`]; }; // Figma sync: Nepali
export const payCard = a => { const [t, sub] = payState(a), due = t === 'Not paid';
  return <div className="card neutral"><span className="lead-tile"><img src={`${A}lt-fee.svg`} width="20" height="20" alt="" /></span>
    <span className="text"><span className="item-title">{tr(t)}</span><span className="body-s">{sub}</span></span>{due ? btn(tr('Pay now'), 'pay-now', { kind: 'secondary', size: 's' }) : null}</div>; };
// The wallet hand-off, through the phone's own prompt (more.jsx). Mocked: "Pay with X" marks it paid with a made-up receipt; Cancel leaves it Not paid.
export function payHandOff(a) {
  const w = WALLETS[a.pay.how][0]; S.payFor = a;
  openSys(ne() ? { title: `${w} बाट NPR ${FEE} तिर्ने?`, sub: `${DOCTORS[a.doc].name} सँगको भेटको परामर्श शुल्क।`, confirm: `${w} बाट तिर्नुहोस्`, href: '#', act: 'pay-ok' }
    : { title: `Pay NPR ${FEE} with ${w}?`, sub: `Consultation fee for your visit with ${DOCTORS[a.doc].name}.`, confirm: `Pay with ${w}`, href: '#', act: 'pay-ok' });
}
// W11: a follow-up booked from a report warns about a visit already booked with the same doctor.
export const fuClash = () => { const a = visits().find(v => v.doc === S.doc); // Run 6 Y02: any of her visits, not only S.appt
  return S.fuOf && a ? notice('warn', L(`You already have a visit with Dr. ${surname(DOCTORS[a.doc].name)}`, `Dr. ${surname(DOCTORS[a.doc].name)} सँग तपाईंको भेट पहिले नै छ`),
    L(`${when(a.day, a.time)}. You can talk about this report then, so you may not need another visit.`, `${when(a.day, a.time)}। त्यतिबेला यो रिपोर्टबारे कुरा गर्न सक्नुहुन्छ, त्यसैले अर्को भेट नचाहिन सक्छ।`)) : null; };
export const callBtn = size => <a className={`btn secondary ${size}`} href="tel:+97710000000"><img src={`${A}icon-call.svg`} width="24" height="24" alt="" />{tr('Call the clinic')}</a>;

// Item, Content/Appointment. A chevron means the whole card is interactive.
export function apptCard(a, link = false) { // link: true for S.appt, or the data-act of another visit
  const d = DOCTORS[a.doc], T = link ? 'button' : 'div';
  return <T className="card appt" data-act={link ? (link === true ? 'appt:today' : link) : undefined}>
    <span className="avatar l" aria-hidden="true">{d.ini}</span>
    <span className="appt-t"><span className="h-s">{d.name}</span><span className="when">{when(a.day, a.time)}</span><span className="where">{d.opd}, {tr('City Hospital')}</span></span>
    {link ? <img src={`${A}icon-chevron-right.svg`} width="20" height="20" alt="" /> : null}
  </T>;
}

export function navBar(active) {
  const tabs = [['Home', 'nav-home'], ['Care', 'nav-care'], ['Health', 'nav-health'], ['Ask', 'nav-ask'], ['Profile', 'nav-profile']];
  return <div className="bottom"><nav className="bnav" aria-label={tr('Main')}>
    {tabs.map(([l, i]) => <a key={l} href="#" data-act={{ Home: 'home', Care: 'care-tab', Health: 'health-tab', Ask: 'ask-tab', Profile: 'pf-tab' }[l]} aria-current={l === active ? 'page' : undefined}>
      <span><img src={`${A}${i}${l === active ? '-active' : ''}.svg`} width="24" height="24" alt="" /></span>{tr(l)}</a>)}
  </nav>{homeInd()}</div>;
}

export function textArea(saved) {
  return <div className="inset"><div className="field-wrap">
    <label className="label" htmlFor="reason" style={{ lineHeight: '20px' }}>{tr('Reason for visit (optional)')}</label>
    <div className="field textarea"><textarea id="reason" placeholder={tr("For example: fever for three days")} value={S.reason} onChange={e => { S.reason = e.target.value; paint(); }}></textarea></div>
    {support(saved && S.reason.trim() ? "Saved. You won't need to type this again." : 'Helps your doctor prepare. Only the clinic sees this.')}{/* W14: never "Saved" while empty */}
  </div></div>;
}

// Low-stock banner on Home, from the medicines list in Health (health.jsx). Hidden once restocked.
export function lowBanner() {
  const m = !S.healthEmpty && !S.offline && (S.meds || []).find(x => x.left / x.perDay <= 3); // a new patient has no medicines yet
  return m ? <div className="inset"><button className="banner" data-act="health-go:mtlist">
    <img src={`${A}icon-warning-18.svg`} width="18" height="18" alt="" />
    <span className="t"><span className="t1">{L(`${m.title.split(' ')[0]} is running low`, `${m.title.split(' ')[0]} सकिन लाग्यो`)}</span><span className="t2">{L(`${m.left} ${m.unit} left · tap to restock`, `${m.left} ${tr(m.unit)} बाँकी · थप किन्न थिच्नुहोस्`)}</span></span>
    <img src={`${A}icon-chevron-right-16.svg`} width="16" height="16" alt="" /></button></div> : null;
}

// The card keeps its place, so Home doesn't reshuffle. On visit day it says the state, in Care's tones — never an estimate.
export function homeVisit() {
  const a = visits()[0];
  if (!a) return <div className="inset stack8">{label('Your next appointment')}
    <div className="card neutral"><div className="text"><p className="h-s">{tr('Nothing booked yet')}</p><p className="body-s">{tr('When you book a visit, it shows here.')}</p></div></div></div>;
  const d = DOCTORS[a.doc], dr = `Dr. ${surname(d.name)}`, she = a.doc === 'ps' ? 'she' : 'the doctor', t = nd(a.time);
  const v = a.i == null && a.day === 0 && { // Run 6 Y02: the soonest visit; visit-day states belong to S.appt
    late: ['warn', L(`${dr} is running late`, `${dr} ढिला हुनुहुन्छ`), L(`Your ${a.time} slot is kept. We'll message you when ${she}'s ready.`,
      `तपाईंको ${t} को समय सुरक्षित छ। ${a.doc === 'ps' ? 'उहाँ' : 'डाक्टर'} तयार हुनुभएपछि हामी खबर गर्छौं।`), 'appt:today'], // Phase 8: Nepali
    checkedin: ['info', "You're checked in", L(`Reception will call you when ${dr} is ready.`, `${dr} तयार हुनुभएपछि रिसेप्सनले तपाईंलाई बोलाउनेछ।`), 'appt:today'],
    turn: ['success', L(`${dr} is ready for you`, `${dr} तपाईंलाई हेर्न तयार हुनुहुन्छ`), L(`Please go to ${d.opd} now.`, `कृपया अहिले ${d.opd} मा जानुहोस्।`), 'appt:today'],
    with: ['info', L(`You're with ${dr}`, `तपाईं ${dr} सँग हुनुहुन्छ`), 'Your notes will be in Health after your visit.', 'appt:today'],
    done: ['success', 'Visit complete', L(`${dr}'s notes are in Health.`, `${dr} को टिप्पणी स्वास्थ्यमा छ।`), 'health-go:hvisit'], // the notes open through the Health lock
    missed: ['warn', L(`We missed you at ${a.time}`, `${t} मा हामीले तपाईंलाई भेटेनौं`), "Book again when you're ready.", 'care-tab'],
  }[S.visitDay];
  // W02: a wallet booking shows its fee state on Home (Paid / Not paid · Pay now); pay-at-reception visits keep Home as designed.
  if (!v) return <div className="inset stack8">{label('Your next appointment')}{apptCard(a, a.i == null || `appt:${a.i}`)}{WALLETS[a.pay?.how] ? payCard(a) : null}</div>;
  return <div className="inset stack8">{label("Today's visit")}<button className={`card notice ${v[0]}`} data-act={v[3]}><div className="text"><p className="h-s">{tr(v[1])}</p><p className="body-s">{tr(v[2])}</p></div></button></div>; // Figma sync: 'You're checked in', 'Visit complete' in Nepali
}

// T22: on a shared number, a person with a Health PIN has Home's appointments and medicines locked too, unless they turned it off (Health lock).
export const homeLocked = () => !!S.pin && family().length > 1 && S.homeLock[S.fullName] !== false && !S.unlocked;
export const homeLockRow = () => <div className="inset stack8">{label('Appointments and medicines')}<div className="list">
  {listItem('lt-lock.svg', 'Locked on this shared phone', 'Enter your Clinica PIN to see them', 'home-unlock')}</div></div>;

// No connection: a slim line, and the saved content stays readable.
export const offLine = () => S.offline ? <p className="off-line" role="status">{L("You're offline. Showing what was saved at 9:12 AM.", `तपाईं अफलाइन हुनुहुन्छ। ${nd('9:12 AM')} मा सेभ भएको देखाइँदै।`)}</p> : null;

// Skeletons shaped like Home's real layout, so nothing jumps when the content arrives.
export const sk = (w, h, r = 'full', key) => <span key={key} className="sk" style={{ width: w, height: h, borderRadius: `var(--radius-${r})` }}></span>;
export const homeSkeleton = () => <div className="body g20" aria-busy="true"><p className="vh" role="status">{tr('Loading')}</p>
  {S.loading === 'slow' ? <div className="inset">{notice('', 'Taking longer than usual', "Check your connection. We'll keep trying.", btn('Try again', 'home-retry', { kind: 'secondary', size: 'l' }))}</div> : null}
  <div className="inset stack8" aria-hidden="true">{sk('90px', 12)}{sk('160px', 20)}</div>
  <div className="inset" aria-hidden="true">{sk('100%', 72, 'large')}</div>
  <div className="inset sk-tiles" aria-hidden="true">{[0, 1, 2].map(i => sk('100%', 88, 'large', i))}</div>
  <div className="inset stack16" aria-hidden="true">{[0, 1, 2].map(i => <div key={i} className="sk-row">{sk('40px', 40)}<div className="stack8">{sk('180px', 12)}{sk('120px', 12)}</div></div>)}</div>
</div>;

// ---------- screens ----------
Object.assign(SCREENS, {
  home: () => {
    const st = S.homeState, a = S.appt, d = DOCTORS[a.doc];
    const photo = st === 'default' && S.fullName === 'Anisha Sharma';
    const today = st === 'cancelled' ?
      <div className="card error notice">
        <div className="text"><p className="h-s">{L(`Your ${a.time} visit was cancelled`, `तपाईंको ${nd(a.time)} को भेट रद्द भयो`)}</p>
          <p className="body-s">{L(`${d.name} can't see patients today. The clinic is sorry for the change.`, `${d.name} आज बिरामी हेर्न सक्नुहुन्न। यो परिवर्तनका लागि क्लिनिक माफी चाहन्छ।`)}</p></div>
        {btn('Book another time', 'rebook', { size: 'l' })}{callBtn('l')}
      </div> :
      <div className="card notice">
        <div className="text"><p className="h-s">{tr("You're checked in")}</p>{/* Figma sync: Nepali */}
          <p className="body-s">{tr('Walk-ins are seen between booked patients, so waits vary. Reception will call your name.')}</p></div>
        {tag(L(`Waiting for ${DOCTORS.aj.name}`, `${DOCTORS.aj.name} लाई पर्खँदै`), 'info')}
      </div>;
    return (
    <div className="screen">
      {statusBar()}
      <div className="appbar">
        <h1 className="vh">{tr('Home')}</h1>{/* W13: Home's heading, for screen readers */}<div className="brand">Clinica</div>
        <button className="icon-btn bell" data-act="go:notifs" aria-label={`${tr('Notifications')}${unread() ? L(', unread', ', नयाँ छ') : ''}`}>
          <img src={`${A}icon-bell.svg`} width="24" height="24" alt="" />{unread() ? <img className="dot" src={`${A}unread-dot.svg`} width="12" height="12" alt="" /> : null}</button>
        <button className="icon-btn" data-act="go:history" aria-label={tr('Your profile')}>
          {photo ? <img className="av32" src={`${A}avatar-anisha.png`} alt="" /> : <span className="av32 ini">{initials(S.fullName)}</span>}</button>
      </div>
      {offLine()}
      {S.loading ? homeSkeleton() : <div className="body g20">
        <div className="inset greet"><p>{tr('Good morning,')}</p><p className="name">{S.first}</p></div>
        {st === 'default' ? homeLocked() ? homeLockRow() : <>{homeVisit()}{lowBanner()}</>
          : <div className="inset stack8">{label('Today')}{today}</div>}
        {st !== 'walkin' ? <div className="inset"><div className="qa">
          <button className="tile" data-act="go:finddoctor"><img src={`${A}qa-book.svg`} width="28" height="28" alt="" />{tr('Book a visit')}</button>
          <button className="tile" data-act="health-go:hlabs"><img src={`${A}qa-lab.svg`} width="28" height="28" alt="" />{tr('Lab reports')}</button>
          <button className="tile" data-act="health-go:hrx"><img src={`${A}qa-rx.svg`} width="28" height="28" alt="" />{tr('Prescriptions')}</button>
        </div></div> : null}
        {st === 'default' && !S.healthEmpty && !homeLocked() ? <div><div className="inset">{label('Recent')}</div><div className="list">
            {sepJoin([listItem('lt-lab.svg', 'Lab report ready', 'Open Health to see it', 'lab-ready') /* T03 */,
               listItem('lt-rx.svg', 'Prescription updated', L('From Dr. Sharma, Aug 25', `Dr. Sharma बाट, ${nd('Aug 25')}`), 'health-go:hrxd'),
               listItem('lt-followup.svg', 'Follow-up due', `${tr('Dermatology')}, ${tr('Sep 14')}`, 'stub:Follow-up')])}
          </div></div> : null}
        {st === 'walkin' ? <div className="stack7"><div className="inset">{label('Your visit')}</div>
          {rows([row('lt-doctor.svg', 'Doctor', `${DOCTORS.aj.name}, ${tr(DOCTORS.aj.spec)}`), row('lt-location.svg', 'Where', `${DOCTORS.aj.opd}, ${tr('City Hospital')}`), row('lt-fee.svg', 'Fee', L(`NPR ${FEE}, paid at reception`, `NPR ${FEE}, रिसेप्सनमा तिरिएको`))])}</div> : null}
      </div>}
      {navBar('Home')}
    </div>);
  },

  finddoctor: () => (
    <div className="screen">
      {statusBar()}
      <div>
        {bar({ title: tr('Find doctor'), actions: iconBtn('icon-filter.svg', 'Filter doctors', 'filter-open') })}
        <div className="docked"><div className="field">
          <img src={`${A}icon-search.svg`} width="20" height="20" alt="" />
          <input id="q" type="search" placeholder={tr('Doctor, specialty or condition')} aria-label={tr('Search doctors')} value={S.query}
            onChange={e => { S.query = e.target.value; paint(); }} />
          <button className="cal-btn" data-act="clear-q" aria-label={tr('Clear search')}><img src={`${A}icon-close.svg`} width="20" height="20" alt="" /></button>
        </div></div>
      </div>
      <div className="body" style={{ gap: 16, padding: '16px 0' }}>
        <div className="hscroll specs" role="radiogroup" aria-label={tr('Specialty')} hidden={!!S.query.trim()}>
          {SPECIALTIES.map(s => <button key={s} className="tile spec" role="radio" aria-checked={S.specialty === s} data-act={`spec:${s}`}>
            <img src={specIcon(s, S.specialty === s)} width="28" height="28" alt="" />{tr(s)}</button>)}
        </div>
        {Object.keys(DOCTORS).some(k => S.fav[k]) && !S.query.trim() ? <div className="stack4"><div className="inset">{lbl(L('Saved', 'सेभ गरिएका'))}</div>
          <div className="list">{sepJoin(Object.keys(DOCTORS).filter(k => S.fav[k]).map(docRow))}</div></div> : null}
        <div id="doclist">{docList()}</div><p className="vh" aria-live="polite">{S.query.trim() ? docCount : ''}</p>{/* W18: the result count is announced */}
      </div>
      {homeInd()}
    </div>),

  doctor: () => {
    const d = DOCTORS[S.doc], free = freeTimes(S.doc, S.day), n0 = nextOpen(S.doc), nxt = nextOpen(S.doc, S.day + 1);
    const canBook = free.includes(S.time);
    return (
    <div className="screen">
      {statusBar()}
      {/* V18: the "more" icon did nothing, so it's gone */}
      {bar({ actions: iconBtn(S.fav[S.doc] ? 'icon-heart-filled.svg' : 'icon-heart-outline.svg', S.fav[S.doc] ? 'Remove from saved' : 'Save doctor', `fav:${S.doc}`, { 'aria-pressed': !!S.fav[S.doc] }) })}
      <div className="body g20">
        <div className="inset"><div className="doc-head">
          <span className="avatar xl" aria-hidden="true">{d.ini}</span>
          <div className="doc-details"><h1 className="name">{d.name}</h1>{/* W13: the bar has no title here */}<p className="spec">{tr(d.spec)}</p><p className="opd">{d.opd}, {tr('City Hospital')}</p>
            {n0 === 0 ? tag(tr('Available today'), 'success') : tag(n0 === 1 ? 'Next slot tomorrow' : n0 > 0 ? L(`Next slot ${dayName(n0)}`, `अर्को समय ${nd(dayName(n0))}`) : 'No openings this week', 'neutral')}</div>
        </div></div>
        <div className="inset"><div className="card neutral">
          <span className="lead-tile"><img src={`${A}lt-fee.svg`} width="20" height="20" alt="" /></span>
          <span className="text"><span className="item-title">NPR {FEE}</span><span className="body-s">{tr('Consultation fee')}{ne() ? '। ' : '. '}{tr('Pay at reception, or with eSewa, Khalti or Fonepay.')}</span></span>{/* F09/T05/W01: no "paid at reception" when a wallet is possible */}
        </div></div>
        {S.fuOf ? <div className="inset">{fuClash()}</div> : null}
        <div className="inset stack8">
          {label(tr('Choose a day'))}
          <div className="hscroll days" role="radiogroup" aria-label={L('Day', 'दिन')}>
            {DAYS.map((x, i) => {
              const sel = i === S.day, off = !freeTimes(S.doc, i).length;
              return <button key={i} className="pick day" role="radio" aria-checked={sel} disabled={off && !sel} data-act={`day:${i}`}
                aria-label={`${tr(`${i === 0 ? 'Today' : x.wd}, ${x.date}`)}${x.closed ? L(', closed', ', बन्द') : off ? L(', fully booked', ', सबै बुक भइसके') : ''}`}><span className="d1">{tr(x.d)}</span><span className="d2">{tr(x.date)}</span></button>;
            })}
          </div>
          <p className="hint">{n0 > 1 ? L(`Fully booked until ${dayName(n0)}. Closed on Saturdays.`, `${nd(dayName(n0))} सम्म सबै समय बुक भइसके। शनिबार बन्द।`) : tr('Closed on Saturdays')}</p>
        </div>
        {free.length ?
        <div className="inset stack8">
          {label(tr('Choose a time'))}
          <div className="times" role="radiogroup" aria-label={tr('Time')}>
            {d.times.map(t => {
              const off = isTaken(S.doc, S.day, t), mine = holds(S.doc, S.day, t); // Run 6 Y02: her own booked slot says so
              return <button key={t} className={`pick time${mine ? ' mine' : ''}`} role="radio" aria-checked={t === S.time} disabled={off} data-act={`time:${t}`}
                aria-label={`${tr(t)}${mine ? L(', your visit', ', तपाईंको भेट') : off ? L(', taken', ', बुक भइसक्यो') : ''}`}>{tr(t)}{mine ? <span className="d1">{tr('Your visit')}</span> : null}</button>;
            })}
          </div>
          <div className="note-line"><img src={`${A}icon-info-18.svg`} width="18" height="18" alt="" /><p>{tr("If your doctor is running late, we'll message you. We won't guess a wait time.")}</p></div>
        </div> : empty('icon-schedule-28.svg', S.day === 0 ? 'No times left today' : L(`No times left on ${dayName(S.day)}`, `${nd(dayName(S.day))} मा समय बाँकी छैन`),
          nxt >= 0 ? L(`The next opening is ${dayName(nxt)}. You can book that, or call the clinic to ask about coming in ${S.day === 0 ? 'today' : 'that day'}.`,
            `अर्को खाली समय ${nd(dayName(nxt))} मा छ। त्यो बुक गर्न सक्नुहुन्छ, वा ${S.day === 0 ? 'आज' : 'त्यो दिन'} आउनेबारे क्लिनिकमा फोन गरेर सोध्नुहोस्।`)
                   : 'There are no openings this week. Call the clinic to ask about the next one.',
          <>{nxt >= 0 ? btn(L(`See ${dayName(nxt)}`, `${nd(dayName(nxt))} हेर्नुहोस्`), `day:${nxt}`, { size: 'l' }) : null}{callBtn('l')}</>)}
      </div>
      {free.length ? <div className="cta bordered">{btn(canBook ? bookLabel(S.day, S.time) : tr('Choose a time'), 'book', { disabled: !canBook })}</div> : null}
      {homeInd()}
    </div>);
  },

  history: () => (
    <div className="screen">
      {statusBar()}{bar({ title: 'Visit history', big: true })}
      <div className="body">
        <div className="inset"><div className="pt-head"><span className="avatar l" aria-hidden="true">{initials(S.fullName)}</span>
          <div><p className="name">{S.fullName}</p><p className="body-s">{tr('Female')} · 32 · CH-2381</p></div></div></div>
        <div className="inset"><button className="list-item" data-act="stub:Visit history">
          <span className="lead-tile"><img src={`${A}lt-history.svg`} width="20" height="20" alt="" /></span>
          <span className="text"><span className="item-title">{tr('View history')}</span><span className="body-s">{tr('Aug 12, Jul 3, Jun 20')}</span></span>
          <img src={`${A}icon-chevron-right-dark.svg`} width="20" height="20" alt="" /></button></div>
      </div>
      {homeInd()}
    </div>),

  review: () => (
    <div className="screen">
      {statusBar()}{bar({ title: tr('Review booking') })}
      <div className="body g20">
        {S.fuOf ? <div className="inset stack8">{tag(tr('Follow-up'), 'info')}{fuClash()}</div> : null}{/* W11 */}
        <div className="inset">{apptCard({ doc: S.doc, day: S.day, time: S.time })}</div>
        {rows([<button className="list-item" data-act="sheet:bookfor">{lead('icon-person.svg')}<span className="text"><span className="item-title">{tr('Booking for')}</span><span className="body-s">{bookFor()}</span></span></button>,
          feeRow(), payBlock(), row('lt-sms.svg', tr('Confirmation'), L(`By SMS to ${masked()}`, `${masked()} मा SMS बाट`))])}
        {textArea(false)}
      </div>
      {/* R10: the line above lifts Confirm off the spot where Book was, and Confirm waits for a payment choice */}
      <div className="cta bordered"><p className="body-s">{S.payWith ? `NPR ${FEE}, ${howText(S.payWith)}${ne() ? '।' : '.'}` : tr('Choose how to pay to confirm.')}</p>
        {btn(S.payWith ? tr('Confirm booking') : tr('Choose how to pay'), 'confirm', { disabled: !S.payWith })}</div>
      {homeInd()}
    </div>),

  failed: () => {
    const d = DOCTORS[S.doc], k = S.failKind;
    return (
    <div className="screen">
      {statusBar()}{bar({ title: tr('Review booking') })}
      <div className="body g20">
        <div className="inset"><div className={`card ${k === 'taken' ? 'error' : 'warn'}`} role="alert"><div className="text">{{
          taken: <><p className="h-s">{L(`${S.time} was just taken`, `${nd(S.time)} को समय भर्खरै बुक भयो`)}</p><p className="body-s">{tr('Someone else booked it while you were confirming. Everything you entered is saved.')}</p></>,
          offline: <><p className="h-s">{tr("Couldn't send your booking")}</p><p className="body-s">{tr("Nothing has been booked: you're not connected. Your details are saved, so just try again when you're online.")}</p></>,
          noreply: <><p className="h-s">{tr("We couldn't confirm your booking")}</p><p className="body-s">{tr("It may have gone through. Trying again is safe: if it did, you'll still be booked only once.")}</p></>, // W14
        }[k]}</div></div></div>
        {rows([row('lt-doctor.svg', tr('Doctor'), `${d.name}, ${tr(d.spec)}`), row('icon-person.svg', tr('Booking for'), bookFor()), feeRow(true)])}{/* W01: not charged */}
        {textArea(true)}
      </div>
      <div className="cta bordered">{{ taken: btn(tr('Choose another time'), 'another-time'), offline: btn(tr('Try again'), 'confirm'),
        noreply: <>{btn(tr('Check my appointments'), 'care-tab')}{btn(tr('Try again'), 'confirm', { kind: 'secondary' })}</> }[k]}</div>
      {homeInd()}
    </div>);
  },

  confirmed: () => {
    const a = S.booked || S.appt, d = DOCTORS[a.doc], other = a.for && a.for !== S.fullName, first = other && a.for.split(' ')[0];
    return (
    <div className="screen">
      {statusBar()}{bar({ back: false, actions: iconBtn('icon-close-24.svg', 'Close', 'home') })}
      <div className="body center">
        <div className="success-mark"><img src={`${A}icon-task-alt.svg`} width="36" height="36" alt="" /></div>
        <h1 className="h-lp">{tr('Appointment booked')}</h1>{/* W03/W13: focused on arrival */}
        <div className="inset"><p className="confirm-line">{ne() ? `${other ? first : 'तपाईं'} ${d.name} सँग ${when(a.day, a.time).replace(/^(आज|भोलि),/, '$1')} मा बुक हुनुभयो।` /* Phase 8 */
          : <>{other ? `${first} is` : "You're"} booked with {d.name} {a.day === 0 ? `at ${a.time} today` : `${rel(a.day)} at ${a.time}`}.</>}</p></div>
        {S.bookedOnce ? <div className="inset" style={{ alignSelf: 'stretch' }}>{notice('success', "You're booked once", "Trying again didn't make a second booking.")}</div> : null}{/* W14 */}
        <div className="inset stack8" style={{ alignSelf: 'stretch' }}>{apptCard(a)}{payCard(a)}</div>{/* F09/T05/W02 */}
        <div className="inset" style={{ alignSelf: 'stretch' }}><div className="notes">
          <div className="note-line"><img src={`${A}icon-schedule.svg`} width="18" height="18" alt="" /><p>{tr('Arrive 15 minutes early and check in at the reception desk.')}</p></div>
          <div className="note-line"><img src={`${A}icon-chat.svg`} width="18" height="18" alt="" /><p>{other
            ? L(`Details sent by SMS. To see ${first}'s appointments, switch to him in Profile.`, `विवरण SMS बाट पठाइयो। ${first} का अपोइन्टमेन्ट हेर्न प्रोफाइलमा उहाँमा स्विच गर्नुहोस्।`)
            : L(`Details sent by SMS to ${masked()}.`, `विवरण ${masked()} मा SMS बाट पठाइयो।`)}</p></div>
        </div></div>
        {S.cal.appt ? <div style={{ alignSelf: 'stretch' }}>{inCal}</div> : null}
      </div>
      <div className="cta">{S.cal.appt ? null : calBtn('appt', tr('Add to calendar'))}{btn(tr('Done'), 'done-confirmed')}</div>
      {homeInd()}
    </div>);
  },

  notif: () => {
    const a = S.booked || S.appt, d = DOCTORS[a.doc]; // Run 6 Y02: the visit just booked, which may not be S.appt
    return (
    <div className="screen">
      {statusBar()}
      <div className="body center" style={{ justifyContent: 'center', gap: 20, padding: '8px 0 16px' }}>
        <div className="notif-tile"><img src={`${A}icon-notifications-48.svg`} width="48" height="48" alt="" /></div>
        <div className="inset"><div className="heading" style={{ textAlign: 'center' }}><h1 className="h-xl">{ne() ? `Dr. ${surname(d.name)} ढिला हुनुभयो भने थाहा पाउनुहोस्` : `Know if Dr. ${surname(d.name)} is running late`}</h1>{/* W13; Figma sync: B06 in Nepali */}
          <p className="lede">{ne() ? `तपाईंको भेट ${when(a.day, a.time).replace(/^(आज|भोलि),/, '$1')} मा छ।` : `Your visit is ${rel(a.day)} at ${a.time}.`} {tr("We'll only tell you about your own appointments — reminders, delays and cancellations. No marketing, ever.")}</p></div></div>
        <div className="inset" style={{ alignSelf: 'stretch' }}>{apptCard(a)}</div>
        <div className="inset"><p className="body-s tertiary" style={{ textAlign: 'center' }}>{tr("Turn this off and we'll still send updates by SMS.")}</p></div>
      </div>
      <div className="cta">{btn('Allow notifications', 'allow-notif')}{btn('Not now', 'not-now', { kind: 'secondary' })}</div>
      {homeInd()}
    </div>);
  },
});

export function docRow(id) {
  const d = DOCTORS[id], n = nextOpen(id);
  const day = n > 0 && (d.spec !== GM ? dayName(n) : DAYS[n].date);
  const t = n === 0 ? tag('Available today', 'success') : n === 1 ? tag(L(`Next slot tomorrow, ${freeTimes(id, 1)[0]}`, `अर्को समय भोलि, ${nd(freeTimes(id, 1)[0])}`), 'neutral')
    : tag(n > 0 ? L(`Next slot ${day}`, `अर्को समय ${nd(day)}`) : 'No openings this week', 'neutral'); // specialists name the weekday (Figma 260:10739)
  const inner = <><span className="avatar" aria-hidden="true">{d.ini}</span><span className="text doctor"><span className="h-s">{d.name}</span><span className="spec">{tr(d.spec)}</span>{t}</span></>;
  return d.noProfile ? <div className="list-item static">{inner}</div> : <button className="list-item" data-act={`doctor:${id}`}>{inner}{chev}</button>;
}
export const filtersOn = () => S.filt.today || S.filt.sex !== 'Any';
export const filtMatch = (id, f = S.filt) => (!f.today || nextOpen(id) === 0) && (f.sex === 'Any' || DOCTORS[id].sex === f.sex);
export const plural = (n, w) => ne() ? `${n} ${tr(w)}` : `${n} ${w}${n === 1 ? '' : 's'}`; // Phase 8: Nepali nouns don't take an s

export let docCount = ''; // W18: what the search found, for the live region under the list
export function docList() {
  const q = S.query.trim().toLowerCase(), cond = q && CONDITIONS.find(([re]) => re.test(q));
  const w = cond && { eye: 'आँखा', dental: 'दाँत' }[cond[2]]; // Phase 8
  docCount = cond && !cond[1] ? L(`No ${cond?.[2]} doctors at City Hospital`, `सिटी हस्पिटलमा ${w}का डाक्टर हुनुहुन्न`) : '';
  if (cond && !cond[1]) return empty('icon-search-secondary-28.svg', docCount,
    L(`For ${cond[2] === 'eye' ? 'an eye' : 'a dental'} problem, ask reception about a referral. Or search for a doctor's name or another specialty.`,
      `${w}को समस्याका लागि रिफरलबारे रिसेप्सनमा सोध्नुहोस्। वा डाक्टरको नाम वा अर्को विशेषज्ञता खोज्नुहोस्।`),
    <a className="btn secondary l" href="tel:+97710000000">{tr('Call the clinic')}</a>);
  const spec = cond ? cond[1] : S.specialty;
  const docs = Object.keys(DOCTORS).filter(id => DOCTORS[id].spec === spec && filtMatch(id) && (cond || !q || `${DOCTORS[id].name} ${DOCTORS[id].spec}`.toLowerCase().includes(q)));
  if (!docs.length) docCount = tr('No doctors match');
  if (!docs.length) return empty('icon-search-secondary-28.svg', q ? L(`No doctors match “${S.query.trim()}”`, `“${S.query.trim()}” सँग मिल्ने डाक्टर भेटिएनन्`) : L(`No ${spec.toLowerCase()} doctors match`, `मिल्ने ${tr(spec)} डाक्टर भेटिएनन्`),
    filtersOn() ? 'Try clearing the filters, or call the clinic to ask who can see you.' : 'Try another specialty, or call the clinic to ask who can see you.',
    <>{filtersOn() ? btn('Clear filters', 'filter-clear', { size: 'l' }) : null}<a className="btn secondary l" href="tel:+97710000000">{tr('Call the clinic')}</a></>);
  const count = docCount = filtersOn() ? plural(docs.length, 'doctor') : spec === GM && !cond ? L(`${plural(docs.length, 'doctor')} at City Hospital`, `सिटी हस्पिटलमा ${plural(docs.length, 'doctor')}`)
    : L(`${plural(docs.length, 'doctor')} in ${spec}`, `${tr(spec)}मा ${plural(docs.length, 'doctor')}`);
  return <>{cond ? <div className="inset"><p className="search-hint">{S.query.trim()[0].toUpperCase() + S.query.trim().slice(1)} {L(`is usually seen in ${spec}.`, `सामान्यतया ${tr(spec)}मा हेरिन्छ।`)}</p></div> : null}
    {filtersOn() ? <div className="inset filt-row"><p>{[S.filt.today && tr('Available today'), S.filt.sex !== 'Any' && L(`${S.filt.sex} doctor`, `${tr(S.filt.sex)} डाक्टर`)].filter(Boolean).join(' · ')}</p>
      <button className="btn secondary s" data-act="filter-clear">{tr('Clear')}</button></div> : null}
    <div className="inset"><p className="sec-label">{count}</p></div>
    <div className="list">{sepJoin(docs.map(docRow))}</div></>;
}

// ---------- behaviour ----------
Object.assign(mount, {
  home: () => { if (S.loading === 'first') after(() => { S.loading = null; render(); }, 900); },
  doctor: () => $phone().querySelector('.days [aria-checked="true"]')?.scrollIntoView({ block: 'nearest', inline: 'nearest' }),
});


export function backTo(screen) {
  const i = S.stack.lastIndexOf(screen);
  S.stack = i >= 0 ? S.stack.slice(0, i) : S.stack;
  S.screen = screen;
  render();
}

export const bookFor = () => !S.bookFor || S.bookFor === S.fullName ? `${S.fullName} ${L('(you)', '(तपाईं)')}` : S.bookFor;
export function bookedDone() { // the patient's own visit becomes theirs; a visit for someone else lives in that person's records
  const b = S.booked, o = b.for === S.fullName ? S : S.people[b.for]; // Run 6 Y01: someone else's goes into their own record
  // V14: the visit keeps its reason and payment (the same pay object as S.booked, so paying later updates both).
  const v = { doc: b.doc, day: b.day, time: b.time, reason: b.reason, pay: b.pay, fu: b.fu };
  // Run 6 Y02: it joins their visits. It takes S.appt's place only when that one is gone (none, cancelled or missed).
  if (o?.careEmpty || o?.homeState === 'cancelled' || o?.visitDay === 'missed') Object.assign(o, { appt: v, homeState: 'default', careEmpty: false, visitDay: 'booked' });
  else if (o) o.more = [...o.more, v];
  S.cal.appt = false;
}

export function takeSlot(doc, day, t) {
  const k = `${doc}|${day}`;
  if (S.taken[k] !== 'all') S.taken[k] = [...(S.taken[k] || []), t];
}

// The phone's add-event file: no doctor or specialty in the title, alerts matching the app's reminders.
// e.g. downloadIcs({ iso: [2026, 7, 28], time: '4:30 PM', loc: 'OPD 2, City Hospital, Maharajgunj' })
export function downloadIcs({ iso: [y, mo, dd], time, loc }) {
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
  spec: arg => { S.specialty = arg; render(); },
  'clear-q': () => { S.query = ''; paint(); document.getElementById('q').focus(); },
  'find-spec': arg => { S.specialty = arg; S.query = ''; go('finddoctor'); },
  'filter-open': () => { S.fdraft = { ...S.filt }; S.sheet = 'filter'; render(); },
  'fd-today': () => { S.fdraft.today = !S.fdraft.today; render(); },
  'fd-sex': arg => { S.fdraft.sex = arg; render(); },
  'filter-apply': () => { S.filt = { ...S.fdraft }; S.sheet = null; render(); },
  'filter-clear': () => { S.filt = { today: false, sex: 'Any' }; S.sheet = null; render(); },
  doctor: arg => { S.doc = arg; S.day = 0; S.time = null; S.fuOf = null; go('doctor'); },
  fav: arg => { S.fav[arg] = !S.fav[arg]; render(); },
  day: arg => { S.day = +arg; S.time = null; render(); },
  time: arg => { S.time = arg; render(); },
  book: () => { if (holds(S.doc, S.day)) { S.sheet = 'dupvisit'; return render(); } go('review'); }, // Run 6 Y02: a second visit that day asks first
  'book-anyway': () => { S.sheet = null; go('review'); },
  confirm: () => {
    if (!S.payWith || Date.now() - shownAt < 400) return; // R10: a payment choice first, and a second tap of a double-tap is ignored
    const fail = S.offline ? 'offline' : S.failNext, mine = S.booked && S.booked.doc === S.doc && S.booked.day === S.day && S.booked.time === S.time;
    const toFailed = kind => { S.failKind = kind; S.screen === 'failed' ? render() : go('failed'); };
    if (fail === 'offline') return toFailed('offline'); // never left the phone: certainly nothing booked, retrying is safe
    if (!mine && fail === 'taken') { S.failNext = ''; takeSlot(S.doc, S.day, S.time); return toFailed('taken'); } // taken while confirming
    if (!mine) { takeSlot(S.doc, S.day, S.time); S.booked = { doc: S.doc, day: S.day, time: S.time, for: S.bookFor || S.fullName,
      reason: S.reason.trim(), pay: { how: S.payWith, paid: false, ref: null }, fu: S.fuOf }; } // V14, W11: reason, payment and follow-up travel with it
    S.bookedOnce = !!mine; // W14: a retry that finds the booking says so
    if (!mine && fail === 'noreply') { S.failNext = ''; bookedDone(); return toFailed('noreply'); } // it went through, but no answer came back
    bookedDone(); S.reason = ''; S.payWith = null; S.fuOf = null;
    toast(ne() ? `${tr('Appointment booked')}: ${DOCTORS[S.booked.doc].name}, ${when(S.booked.day, S.booked.time)}.` // Figma sync: when() is Nepali now, so the toast is too
      : `Appointment booked with ${DOCTORS[S.booked.doc].name}, ${when(S.booked.day, S.booked.time)}.`); // W03: success goes through the one live region
    S.stack = []; S.screen = 'confirmed'; render(); // no back arrow
    if (WALLETS[S.booked.pay.how] && !S.booked.pay.paid) payHandOff(S.booked); // booked: now hand off to the wallet, through the phone's own prompt (more.jsx)
  },
  pay: arg => { S.payWith = S.payWith === arg ? null : arg; paint(); },
  // W02: a cancelled hand-off can be retried from the visit; the mocked wallet's "Pay with X" marks it paid with a receipt.
  'pay-now': () => payHandOff(S.screen === 'confirmed' ? S.booked || S.appt : S.screen === 'home' ? visits()[0] : openVisit()), // Run 6 Y02: the visit on screen
  'pay-ok': () => {
    const a = S.payFor, p = a.pay, w = WALLETS[p.how][0];
    Object.assign(p, { paid: true, ref: `${w.toUpperCase()}-${48213 + S.payments.length}` });
    S.payments.unshift({ ref: p.ref, how: w, doc: DOCTORS[a.doc].name, day: a.day, time: a.time, for: a.for || S.fullName }); // Figma sync: keep day/time, not a phrase in the language of the moment
    S.sheet = null; toast(L(`Paid NPR ${FEE} with ${w}. Receipt ${p.ref}.`, `${w} बाट NPR ${FEE} तिरियो। रसिद ${p.ref}।`)); render();
  },
  'book-for': arg => { S.bookFor = arg; S.sheet = null; render(); }, // choosing closes the sheet: a single choice needs no Done
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
    : s.offline ? 'GX01' : s.careEmpty && !s.more.length ? 'SH01' : s.appt.day === 0 && ({ late: 'SH02', checkedin: 'SH03', done: 'SH04' })[s.visitDay] || 'B01',
  finddoctor: s => s.sheet === 'filter' ? 'SB12' : filtersOn() ? 'SB13' : s.query.trim() ? (CONDITIONS.find(([re]) => re.test(s.query.toLowerCase()))?.[1] ? 'SB06' : 'SB07')
    : ({ Cardiology: 'SB08', Dermatology: 'SB09', Paediatrics: 'SB10', Gynaecology: 'SB11' })[s.specialty] || (Object.values(s.fav).some(Boolean) ? 'SB15' : 'B02'),
  doctor: s => !freeTimes(s.doc, s.day).length ? 'B07' : s.fav[s.doc] ? 'SB14' : 'B03',
  history: () => 'B03b', confirmed: () => 'B05', notif: () => 'B06', failed: s => ({ taken: 'B08', offline: 'SB04', noreply: 'SB05' })[s.failKind],
  review: s => s.sheet === 'bookfor' ? 'SB01' : s.bookFor && s.bookFor !== s.fullName ? 'SB02' : s.payWith && s.payWith !== 'reception' ? 'B04b' : 'B04',
});

export const BOOKING_STACK = ['home', 'finddoctor', 'doctor'];
// Run 6 Y02: a second visit with the same doctor on the same day asks first. The B03/B04 frames show her before her 4:30 was booked.
OVERLAY.dupvisit = () => { const c = holds(S.doc, S.day), dr = `Dr. ${surname(DOCTORS[c.doc].name)}`;
  return csheet(L(`You already have a visit with ${dr} that day`, `त्यो दिन ${dr} सँग तपाईंको भेट पहिले नै छ`), L(`${when(c.day, c.time)}. Book a second visit as well?`, `${when(c.day, c.time)}। अर्को भेट पनि बुक गर्ने?`),
    btn('Keep just the one', 'sheet-close'), btn('Book a second visit', 'book-anyway', { kind: 'secondary' })); };
FLOW.push(
  ['Booking — happy path', [
    ['B01', 'Home', 'Taps ‘Book a visit’', 'Next appointment as a Neutral card; quick actions are Specialty tiles; Recent names no drug.', () => ({ screen: 'home' })],
    ['B02', 'Find doctor', 'Taps Dr. Priya Sharma', "Docked search, specialty filter clipped at the edge as the scroll cue, one clinic's doctors, no ratings.", () => ({ screen: 'finddoctor', stack: ['home'] })],
    ['B03', 'Doctor profile', 'Picks 4:30 PM, taps Book', 'Contained header, fee up front, Saturday closed, taken slots shown as taken, no wait estimate.', () => ({ screen: 'doctor', stack: ['home', 'finddoctor'], careEmpty: true })],
    ['B03b', 'Visit history', 'Linked from the avatar on Home', 'Sits beside 03 in Figma with no caption or arrow; this prototype opens it from the profile avatar on Home.', () => ({ screen: 'history', stack: ['home'] })],
    ['B04', 'Review booking', 'Taps Confirm booking', 'Summary rows carry no chevrons because nothing on them is tappable. Pay at reception.', () => ({ screen: 'review', stack: [...BOOKING_STACK], payWith: 'reception', careEmpty: true })],
    ['B04b', 'Review booking — pay now', 'Taps eSewa', 'Nothing is preselected (R10): Pay at reception, eSewa, Khalti or Fonepay is chosen before Confirm. The Fee row says “to pay with eSewa” until the wallet confirms.', () => ({ screen: 'review', stack: [...BOOKING_STACK], payWith: 'esewa', careEmpty: true })],
    ['B05', 'Confirmed', 'Taps Done', 'Success tone earned. No back arrow. Check in at reception, not by QR. Done leads to 06.', () => ({ screen: 'confirmed', taken: { 'ps|0': ['4:30 PM'] } })],
    ['B06', 'Notifications', 'After Done', "Asked only after an accomplishment — here, a confirmed booking — so the value is concrete: this visit, this doctor. Skipped if notifications are already on. After 'Not now', ask again only after the next booking; after a second 'Not now', only from Profile. SMS updates continue either way.", () => ({ screen: 'notif' })],
  ]],
  ['Booking — unhappy paths', [
    ['B07', 'No slots available', 'Branches from 03 Doctor profile', 'Every visible day shown as taken, not hidden. The Empty state offers the next opening and the phone, and there is no Book button because there is nothing to book.', () => ({ screen: 'doctor', doc: 'rs', time: null, stack: ['home', 'finddoctor'] })],
    ['B08', 'Booking failed', 'Branches from 04 Review booking', 'The realistic failure: the slot was taken while confirming. Everything typed is kept, and the only action is at the thumb.', () => ({ screen: 'failed', stack: [...BOOKING_STACK, 'review'], reason: 'Fever for three days, with a headache', taken: { 'ps|0': ['4:30 PM'] } })],
    ['B09', 'Doctor cancelled', 'Replaces the card on 01 Home', "Error tone, two explicit actions, no chevron. The doctor's reason stays private. 'Book another time' returns to her availability.", () => ({ screen: 'home', homeState: 'cancelled' })],
    ['B10', 'Walk-in, checked in', 'Registered at reception, not in the app', "A walk-in who needs the app isn't a walk-in. This is what a patient who has it sees: a state, an honest line that the wait can change, no position, no minutes.", () => ({ screen: 'home', homeState: 'walkin' })],
  ]],
);
