// Clinica — Care, Profile, Notification centre and Add to calendar.
// Figma: zw3saW6ot26E6gWH20K3ux, section 542:19194. Plugs into core.jsx (SCREENS, mount, ACTIONS, FLOW, NUM, OVERLAY)
// and reuses pieces from booking.jsx, health.jsx and ask.jsx.
import { Fragment } from 'react';
import { AD_SHORT, Phone, RECORDS, bsText, family, btn, empty, endScreen, heading, homeInd, listItem, masked, onboarding, pad, parseDob, statusBar, toBS, toHome } from './app.jsx';
import { FOLLOW_DAYS, FOLLOW_TIMES, T, acts, ask, src, todayCard, visitCard } from './ask.jsx';
import { DAYS, DOCTORS, bar, callBtn, dayName, downloadIcs, freeTimes, iconBtn, initials, isTaken, label, navBar, offLine, payCard, rel, row, surname, tag, takeSlot, when } from './booking.jsx';
import { $phone, A, ACTIONS, FLOW, NE, NUM, ORDER, OVERLAY, S, SCREENS, after, back, every, extraState, go, later, mount, nd, ne, render, reset, toast, tr } from './core.jsx';
import { drShort } from './doctor.jsx';
import { centred, chev, errLine, keypad, lbl, lead, list, openHealth, pinScreen, unlock } from './health.jsx';
import { med } from './meds.jsx';
import { SYS_OS, openSys } from './more.jsx';
import { FEE, FU_DAY, TODAY, WALLETS, dayLabel, isoOf } from './data.js';
import { counts, img, now, patients, people, person } from './staff.jsx';

// Phase 8: Nepali for this module's own lines. Sentences with a name, time or date are written with ne() where they're used.
Object.assign(NE, {
  'Dr. Sharma is running late': 'Dr. Sharma ढिला हुनुहुन्छ', "Your 4:30 PM slot is kept. We'll message you when she's ready.": 'तपाईंको दिउँसो 4:30 को समय कायम छ। उहाँ तयार हुनुभएपछि हामी सन्देश पठाउँछौं।',
  '10 min ago': '10 मिनेटअघि', '2 hours ago': '2 घण्टाअघि', 'Unread: ': 'नपढिएको: ',
  'Your HbA1c blood test is ready — Dr. Sharma wants to see you': 'तपाईंको HbA1c रगत जाँचको नतिजा तयार छ — Dr. Sharma तपाईंलाई भेट्न चाहनुहुन्छ',
  'Open Health to read what she wrote.': 'उहाँले के लेख्नुभयो, पढ्न स्वास्थ्य खोल्नुहोस्।', 'Your visit is tomorrow': 'तपाईंको भेट भोलि छ',
  '4:30 PM with Dr. Priya Sharma at OPD 2. Arrive by 4:15 PM.': 'दिउँसो 4:30 मा OPD 2 मा Dr. Priya Sharma सँग। दिउँसो 4:15 सम्म आइपुग्नुहोस्।',
  'Your visit notes are ready': 'तपाईंको भेटको टिप्पणी तयार छ', 'From your visit on Aug 12. Open Health to read them.': 'अगस्ट 12 को भेटबाट। पढ्न स्वास्थ्य खोल्नुहोस्।',
  'Alerts 1 day and 2 hours before': '1 दिन र 2 घण्टाअघि सम्झाउँछ', 'Add the new time': 'नयाँ समय थप्नुहोस्', 'Follow-up, OPD 2': 'फलो-अप, OPD 2', 'City Hospital': 'सिटी हस्पिटल',
  "It's soon, but cancelling still helps — someone else can have the time. You won't be charged.": 'समय नजिकै छ, तर रद्द गर्दा पनि मद्दत हुन्छ — अरू कसैले यो समय पाउन सक्छ। तपाईंबाट पैसा लिइँदैन।',
  'The time goes back to other patients. You can book again whenever you need to.': 'यो समय अरू बिरामीहरूलाई फर्किन्छ। चाहिएको बेला फेरि बुक गर्न सक्नुहुन्छ।',
  "You'll need a code by SMS to sign back in. Your records stay safe with City Hospital.": 'फेरि साइन इन गर्न SMS मा कोड चाहिन्छ। तपाईंका रेकर्ड सिटी हस्पिटलमा सुरक्षित रहन्छन्।',
  'Your login and PIN are deleted. Your medical records stay with City Hospital, as the law requires. Ask at reception for a copy.': 'तपाईंको लगइन र PIN मेटिन्छ। कानुनले भनेअनुसार तपाईंका स्वास्थ्य रेकर्ड सिटी हस्पिटलमै रहन्छन्। प्रतिलिपिका लागि रिसेप्सनमा सोध्नुहोस्।',
  "Clinica can't add to your calendar": 'Clinica ले तपाईंको क्यालेन्डरमा थप्न सक्दैन', 'Open phone settings': 'फोनको सेटिङ खोल्नुहोस्',
  "Calendar access is off in your phone's settings. Your visit is still in Care, and reminders come by SMS.": 'फोनको सेटिङमा क्यालेन्डर पहुँच बन्द छ। तपाईंको भेट हेरचाहमा छँदै छ, र सम्झना SMS बाट आउँछ।',
  'New event': 'नयाँ कार्यक्रम', Add: 'थप्नुहोस्', 'Appointment — City Hospital': 'अपोइन्टमेन्ट — सिटी हस्पिटल', Starts: 'सुरु', Ends: 'अन्त्य', Alert: 'सम्झना',
  'Second alert': 'दोस्रो सम्झना', '1 day before': '1 दिनअघि', '2 hours before': '2 घण्टाअघि',
  'Check in at reception 15 minutes early. Details are in the Clinica app.': '15 मिनेट अगाडि रिसेप्सनमा चेक इन गर्नुहोस्। विवरण Clinica एपमा छ।',
  "Call 102 for an ambulance, or go straight to an emergency department. Don't wait for the app.": 'एम्बुलेन्सका लागि 102 मा फोन गर्नुहोस्, वा सिधै आपतकालीन विभागमा जानुहोस्। एपको भर नपर्नुहोस्।',
  "Things come up. Book again when you're ready, or call the clinic to be seen today.": 'कहिलेकाहीँ यस्तो हुन्छ। तयार हुँदा फेरि बुक गर्नुहोस्, वा आजै जँचाउन क्लिनिकमा फोन गर्नुहोस्।',
  "Dr. Sharma can't see patients that day. We're sorry for the change.": 'Dr. Sharma त्यो दिन बिरामी हेर्न सक्नुहुन्न। यो परिवर्तनका लागि हामी माफी चाहन्छौं।',
  'The time has gone back to other patients. Book again whenever you need to.': 'यो समय अरू बिरामीहरूलाई फर्कियो। चाहिएको बेला फेरि बुक गर्नुहोस्।',
  'Remove it from your calendar': 'आफ्नो क्यालेन्डरबाट हटाउनुहोस्', 'Open calendar': 'क्यालेन्डर खोल्नुहोस्',
  "If you added this visit to your calendar, it's still there. We can't delete it for you.": 'यो भेट क्यालेन्डरमा थप्नुभएको थियो भने, त्यो अझै त्यहीँ छ। हामी त्यसलाई मेटाउन सक्दैनौं।',
  'Something went wrong': 'केही गडबड भयो', 'Updating…': 'अद्यावधिक हुँदैछ…',
  "We couldn't load your appointments. It's not something you did, and nothing has changed.": 'तपाईंका अपोइन्टमेन्ट लोड गर्न सकिएन। यो तपाईंको गल्ती होइन, र केही बदलिएको छैन।',
  "Arrive 15 minutes early and check in at reception. Bring any medicines you're taking.": '15 मिनेट अगाडि आइपुगेर रिसेप्सनमा चेक इन गर्नुहोस्। अहिले खाइरहेका औषधिहरू लिएर आउनुहोस्।',
  'Ground floor. Get directions': 'भुइँ तला। बाटो हेर्नुहोस्', Currently: 'अहिलेको समय', 'No other times this week': 'यो हप्ता अरू समय छैन',
  'Choose a new day': 'नयाँ दिन छान्नुहोस्', 'Choose a new time': 'नयाँ समय छान्नुहोस्', 'Visit moved': 'भेटको समय सारियो',
  "We can't change events in your calendar. Add the new time, then delete the old one.": 'हामी तपाईंको क्यालेन्डरका कार्यक्रम बदल्न सक्दैनौं। नयाँ समय थप्नुहोस्, अनि पुरानो मेटाउनुहोस्।',
  'Ground floor, past the pharmacy': 'भुइँ तला, फार्मेसी पार गरेपछि', 'No need to watch the app': 'एप हेरिरहनु पर्दैन', "We'll message you here": 'हामी यहीँ सन्देश पठाउनेछौं',
  "Need to step out? Tell reception first, so your turn isn't missed.": 'बाहिर जानुपर्‍यो? पालो नछुटोस् भनेर पहिले रिसेप्सनलाई भन्नुहोस्।',
  "Can't go right now? Tell reception, so you don't lose your turn.": 'अहिल्यै जान सक्नुहुन्न? पालो नगुमोस् भनेर रिसेप्सनलाई भन्नुहोस्।',
  'Pay the fee at reception. Your SMS confirmation has the amount.': 'शुल्क रिसेप्सनमा तिर्नुहोस्। रकम तपाईंको SMS पुष्टिमा छ।',
  'Come back only if it gets worse.': 'झन् बिग्रिएमा मात्र फेरि आउनुहोस्।', 'Follow-up needed': 'फलो-अप चाहिन्छ',
  'Book now to get a time that suits you.': 'आफूलाई मिल्ने समय पाउन अहिल्यै बुक गर्नुहोस्।',
  'Around Sep 11. Book now to get a time that suits you.': 'सेप्टेम्बर 11 तिर। आफूलाई मिल्ने समय पाउन अहिल्यै बुक गर्नुहोस्।',
  'No notifications yet': 'अहिलेसम्म कुनै सूचना छैन', 'Reminders, delays and updates about your reports will appear here.': 'सम्झना, ढिलाइ र तपाईंका रिपोर्टबारे खबर यहाँ देखिनेछन्।',
  'Notifications are off on this phone': 'यो फोनमा सूचना बन्द छन्', 'Turn them on': 'खोल्नुहोस्',
  'This list still updates, but nothing will pop up. SMS updates still arrive.': 'यो सूची अद्यावधिक भइरहन्छ, तर केही पप अप हुँदैन। SMS बाट खबर आइरहन्छ।',
  'Mark all as read': 'सबै पढेको चिन्ह लगाउनुहोस्', 'Notification settings': 'सूचना सेटिङ', 'Off in phone settings': 'फोनको सेटिङमा बन्द',
  'Off. You chose Not now': 'बन्द। तपाईंले "अहिले होइन" रोज्नुभयो', 'Mobile number changed': 'मोबाइल नम्बर बदलियो', "We've let your old number know too.": 'हामीले तपाईंको पुरानो नम्बरमा पनि खबर गरेका छौं।',
  "To change your name, date of birth or sex, ask at reception — the clinic's record is the one that counts.": 'नाम, जन्म मिति वा लिङ्ग बदल्न रिसेप्सनमा सोध्नुहोस् — क्लिनिकको रेकर्ड नै मान्य हुन्छ।',
  'On file at reception': 'रिसेप्सनको रेकर्डमा छ', 'At reception': 'रिसेप्सनमा', Pronouns: 'सम्बोधन',
  "Changes straight away. Your doctor's notes stay in the language they were written in.": 'तुरुन्तै बदलिन्छ। डाक्टरका टिप्पणी जुन भाषामा लेखिएका हुन्, त्यही भाषामा रहन्छन्।',
  'Notifications are off for Clinica': 'Clinica का सूचना बन्द छन्', 'You chose Not now': 'तपाईंले "अहिले होइन" रोज्नुभयो', 'Turn on notifications': 'सूचना खोल्नुहोस्',
  "They're turned off in your phone's settings, so nothing below reaches you here. SMS updates still arrive.": 'फोनको सेटिङमा बन्द गरिएकाले तलका कुनै पनि सूचना यहाँ आउँदैनन्। SMS बाट खबर आइरहन्छ।',
  'Nothing pops up on this phone. SMS updates still arrive.': 'यो फोनमा केही पप अप हुँदैन। SMS बाट खबर आइरहन्छ।',
  'The day before, and 2 hours before': 'अघिल्लो दिन, र 2 घण्टाअघि', 'Always on, so the clinic can reach you': 'सधैं खुला, ताकि क्लिनिकले तपाईंलाई खबर गर्न सकोस्',
  'When a follow-up is due': 'फलो-अपको समय हुँदा', 'When your doctor releases a report': 'डाक्टरले रिपोर्ट पठाउँदा',
  'Appointment updates also come by SMS, whatever you choose here. We never send marketing.': 'यहाँ जे रोजे पनि अपोइन्टमेन्टका खबर SMS बाट पनि आउँछन्। हामी कहिल्यै विज्ञापन पठाउँदैनौं।',
  'This phone has no fingerprint sensor.': 'यो फोनमा औंठाछाप सेन्सर छैन।', 'Fingerprint data saved on this phone could open your records': 'यो फोनमा सेभ भएका औंठाछापले तपाईंका रेकर्ड खोल्न सक्छन्',
  "Your Clinica PIN isn't your phone's PIN. On a shared phone, it's the one thing only you know.": 'तपाईंको Clinica PIN फोनको PIN होइन। साझा फोनमा यो तपाईंलाई मात्र थाहा हुने कुरा हो।',
  'Paid in the app': 'एपमा तिरिएको',
  'Fees you pay in the app show here, with their receipt. Fees paid at reception are on the receipt they give you.': 'एपमा तिरेका शुल्क रसिदसहित यहाँ देखिन्छन्। रिसेप्सनमा तिरेको शुल्क उनीहरूले दिने रसिदमा हुन्छ।',
  'Maharajgunj, Kathmandu': 'महाराजगञ्ज, काठमाडौं', 'Sun to Fri, 9 AM to 5 PM. Closed Saturdays.': 'आइतबारदेखि शुक्रबार, बिहान 9 देखि बेलुका 5 सम्म। शनिबार बन्द।',
  'Current person': 'हालको व्यक्ति',
  "Switching asks for that person's Clinica PIN, so nobody opens someone else's records by accident.": 'व्यक्ति बदल्दा उहाँको Clinica PIN सोधिन्छ, ताकि कसैले गल्तीले अरूको रेकर्ड नखोलोस्।',
  'Get help': 'मद्दत लिनुहोस्', 'How your records are kept private': 'तपाईंका रेकर्ड कसरी गोप्य राखिन्छन्', 'Who sees them, and your choices': 'कसले हेर्छ, र तपाईंका विकल्प',
  'What using Clinica means': 'Clinica प्रयोग गर्नुको अर्थ', 'Made for City Hospital': 'सिटी हस्पिटलका लागि बनाइएको',
  'Add someone on this phone': 'यो फोनमा अरू कसैलाई थप्नुहोस्', 'They have their own number': 'उहाँको आफ्नै नम्बर छ', 'Your account is closed': 'तपाईंको खाता बन्द भयो',
  'Your login and PIN are deleted. City Hospital keeps your medical records, as the law requires — ask at reception for a copy.': 'तपाईंको लगइन र PIN मेटियो। कानुनले भनेअनुसार सिटी हस्पिटलले तपाईंका स्वास्थ्य रेकर्ड राख्छ — प्रतिलिपिका लागि रिसेप्सनमा सोध्नुहोस्।',
  "That PIN didn't match. Try again.": 'PIN मिलेन। फेरि प्रयास गर्नुहोस्।', 'Added to your calendar.': 'तपाईंको क्यालेन्डरमा थपियो।', 'Forgot the PIN?': 'PIN बिर्सनुभयो?',
  'Each person resets their own PIN from their own Profile, or at reception with ID.': 'हरेक व्यक्तिले आफ्नो PIN आफ्नै प्रोफाइलबाट, वा ID लिएर रिसेप्सनमा रिसेट गर्नुहुन्छ।',
  'On a phone this hands off to the system or to a screen outside these Figma sections.': 'फोनमा यसले सिस्टम वा यी Figma खण्डबाहिरको स्क्रिनमा पुर्‍याउँछ।',
});
// Phase 8: 'OPD 2, City Hospital, Maharajgunj' with the place names in Devanagari; 'today' / 'tomorrow' / 'on Fri, Sep 11' as Nepali.
const place = s => ne() ? s.replace('City Hospital', 'सिटी हस्पिटल').replace('Maharajgunj', 'महाराजगञ्ज') : s;
const relNe = i => i === 0 ? 'आजको' : i === 1 ? 'भोलिको' : `${nd(dayName(i))} को`;

export const MAPS = 'https://www.google.com/maps/search/?api=1&query=City+Hospital+Maharajgunj+Kathmandu';
export const CAL_NOTE = 'Check in at reception 15 minutes early. Details are in the Clinica app.';
export const NOTIFS = [
  { g: 'Today', icon: 'lt-schedule.svg', t: 'Dr. Sharma is running late', b: "Your 4:30 PM slot is kept. We'll message you when she's ready.", when: '10 min ago', go: 'late' },
  // W10: names the test and the doctor who reviewed it (the lock screen, more.jsx, still names neither).
  { g: 'Today', icon: 'lt-lab.svg', t: 'Your HbA1c blood test is ready — Dr. Sharma wants to see you', b: 'Open Health to read what she wrote.', when: '2 hours ago', go: 'hreport' },
  { g: 'Earlier', icon: 'lt-calendar.svg', t: 'Your visit is tomorrow', b: '4:30 PM with Dr. Priya Sharma at OPD 2. Arrive by 4:15 PM.', when: 'Yesterday', go: 'today', read: true },
  { g: 'Earlier', icon: 'lt-document.svg', t: 'Your visit notes are ready', b: 'From your visit on Aug 12. Open Health to read them.', when: 'Aug 13', go: 'hvisit', read: true },
];
// Shown, not edited — the clinic's record counts. Other people's details are at reception.
export const DETAILS = { 'Anisha Sharma': { dob: '14 / 03 / 1994', sex: 'Female', no: 'CH-2381' } };

export const EXTRA_STATE_CARE = () => ({
  followup: { day: dayLabel(FU_DAY), time: '10:30 AM', iso: isoOf(FU_DAY) }, // booked, as Care 01 and Ask 04 show it; F20: weekday from the date
  careEmpty: false, visitDay: 'booked', cancelled: null, moved: null,
  rsKey: 'fu', rsDay: null, rsTime: null, rsErr: null, rsTaken: [], rsNone: false, cancelSoon: false,
  cal: { appt: false, fu: false }, calFor: 'appt', calOff: false, notifOff: false,
  nset: { remind: true, late: true, fu: false, labs: true },
  notifs: NOTIFS.map(n => ({ ...n })), switchTo: 1,
});
extraState(EXTRA_STATE_CARE, ORDER.care);
// F20: the moved follow-up in C04/K05 — Sun, Sep 13, since Sat, Sep 12 is closed.
const MOVED_FU = { day: dayLabel(new Date(2026, 8, 13)), time: '11:00 AM', iso: [2026, 8, 13] };

// ---------- pieces ----------
export const unread = () => !S.healthEmpty && S.notifs.some(n => !n.read);
export const sect = (label, inner, gap = 4) => <div className="sect" style={{ gap }}><div className="inset">{lbl(label)}</div>{inner}</div>;
export const listP = items => <div className="list">{items.map((x, i) => <Fragment key={i}>{i > 0 && <div className="sep page" aria-hidden="true" />}{x}</Fragment>)}</div>; // Separator, Page inset
export const notice = (tone, title, body, extra = null) => <div className={`card notice ${tone}`}><div className="text"><p className="h-s">{tr(title)}</p><p className="body-s">{tr(body)}</p></div>{extra}</div>; // F15/R12
export const linkRow = (icon, title, sub, href) => <a className="list-item" href={href} {...(href.startsWith('http') ? { target: '_blank', rel: 'noopener' } : {})}>
  {lead(icon)}<span className="text"><span className="item-title">{tr(title)}</span><span className="body-s">{tr(sub)}</span></span>{chev}</a>;
const calRow = () => row('lt-followup.svg', 'In your calendar', 'Alerts 1 day and 2 hours before');
export let inCal; // iOS reports the save; Android can't
// Phase 8: rebuilt as booking.jsx's Confirmed screen renders, so it follows the language (it was built once, in English).
later(() => { const conf = SCREENS.confirmed; SCREENS.confirmed = () => { inCal = calRow(); return conf(); }; }, ORDER.care);
export const calBtn = (key, label = 'Add to calendar') => <button className="btn secondary" data-act={`add-cal:${key}`}><img src={`${A}icon-calendar-add.svg`} width="24" height="24" alt="" />{tr(label)}</button>;
export const dirBtn = (opd = 'OPD 2') => <a className="btn primary" href={MAPS} target="_blank" rel="noopener" data-where={`${opd}, City Hospital, Maharajgunj`}><img src={`${A}icon-map-white-24.svg`} width="24" height="24" alt="" />{tr('Get directions')}</a>;
export const fuCard = (act = '') => visitCard(nd(`${S.followup.day}, ${S.followup.time}`), tr('Follow-up, OPD 2'), act);
export const switchEl = (on, off) => <span className={`switch ${on ? 'on' : ''}`} aria-hidden="true"><span className="thumb">{on ? <img src={`${A}icon-tick-${off ? 'disabled' : 'action'}-16.svg`} width="16" height="16" alt="" /> : null}</span></span>;
export const setting = (title, body, on, act, off, tile = null) => <button className="list-item setting" role="switch" aria-checked={on} data-act={act} disabled={!!off}>
  {tile}<span className="text st"><span className="st-t">{tr(title)}</span><span className="body-s">{tr(body)}</span></span>{switchEl(on, off)}</button>;

// body: the screen's content, or a whole .body (e.g. centred()) used as it is
export const frame = (title, body, { cta = null, actions = null, back = true, tab = '', gap = 20 } = {}) => (
  <div className="screen">
    {statusBar()}{bar({ back, title, actions })}{tab ? offLine() : null}
    {body?.props?.className === 'body' ? body : <div className="body" style={{ gap }}>{body}</div>}
    {cta ? <div className="cta">{cta}</div> : null}
    {tab ? navBar(tab) : homeInd()}
  </div>);

// e.g. addMin('4:30 PM', -15) → '4:15 PM'
export function addMin(t, m) {
  const [, h, mm, ap] = /(\d+):(\d+) (AM|PM)/.exec(t);
  const x = ((+h % 12) + (ap === 'PM' ? 12 : 0)) * 60 + +mm + m, H = Math.floor(x / 60) % 24;
  return `${H % 12 || 12}:${pad(x % 60)} ${H < 12 ? 'AM' : 'PM'}`;
}
export const pinOf = i => RECORDS[i].name === 'Ramesh Sharma' ? '1961' : S.pin || '1234'; // demo PINs

// What the phone's add-event sheet is pre-filled with. Names the clinic, never the doctor or specialty.
export function calEvent(key) {
  if (key === 'fu') { const f = S.followup; return { starts: `${f.day}, ${f.time}`, ends: addMin(f.time, 30), iso: f.iso, time: f.time, loc: 'OPD 2, City Hospital, Maharajgunj' }; }
  const a = S.appt;
  return { starts: when(a.day, a.time), ends: addMin(a.time, 30), iso: DAYS[a.day].iso, time: a.time, loc: `${DOCTORS[a.doc].opd}, City Hospital, Maharajgunj` };
}

// Reschedule works for the follow-up (Sep dates, from Ask) and for today's visit (the booking week).
export function reschedOpts() {
  if (S.rsKey === 'fu') {
    const f = S.followup, cur = FOLLOW_DAYS.findIndex(([w, d]) => `${w}, ${d}` === f.day);
    return { cur, now: nd(`${f.day}, ${f.time}`), who: `Dr. Priya Sharma, ${tr('General medicine')}`,
      days: FOLLOW_DAYS.slice(0, 5).map(([wd, date, off], i) => ({ i, wd, date, off })),
      times: i => FOLLOW_TIMES.map(([t, off]) => ({ t, off: off || (i === cur && t === f.time) || S.rsTaken.includes(`fu|${i}|${t}`) })) };
  }
  const a = S.appt, d = DOCTORS[a.doc], mine = (i, t) => i === a.day && t === a.time;
  return { cur: a.day, now: nd(when(a.day, a.time)), who: `${d.name}, ${tr(d.spec)}`,
    days: DAYS.map((x, i) => ({ i, wd: x.wd, date: x.date, off: !freeTimes(a.doc, i).some(t => !mine(i, t)) })).slice(1),
    times: i => d.times.map(t => ({ t, off: isTaken(a.doc, i, t) || mine(i, t) })) }; // a slot taken meanwhile goes into S.taken
}

export const notifRow = (n, i) => <button className="list-item" data-act={`notif-open:${i}`}>{n.tile ? <span className={`lead-tile ${n.tile}`}><img src={`${A}${n.icon}`} width="20" height="20" alt="" /></span> : lead(n.icon)}
  <span className={`nt ${n.read ? '' : 'unread'}`}><span className="nt-dot" aria-hidden="true"></span>
    <span className="text"><span className="nt-t">{n.read ? null : <span className="vh">{tr('Unread: ')}</span>}{tr(n.t)}</span><span className="body-s">{tr(n.b)}</span><span className="body-s tertiary">{tr(n.when)}</span></span></span>{chev}</button>;

// ---------- sheets ----------
export const csheet = (title, body, primary, secondary) => <>
  <div className="scrim" data-act="sheet-close"></div>
  <div className="csheet" role="dialog" aria-modal="true" aria-labelledby="cs-t">
    <span className="handle"></span>
    <div className="cs-text"><h2 className="cs-t" id="cs-t">{tr(title)}</h2><p className="lede">{tr(body)}</p></div>
    <div className="cs-acts">{primary}{secondary}</div>
  </div><div className="sheet-home"></div></>;

// Sign-out confirmation for every role. Reversible, so Brand, not red. Centred on the desktop apps (.phone.desk).
export const signoutSheet = (body, act) => csheet('Sign out of Clinica?', body,
  btn(<><img src={`${A}icon-check-white-14.svg`} width="14" height="14" alt="" />{tr('Sign out')}</>, act), btn('Cancel', 'sheet-close', { kind: 'secondary' }));

Object.assign(OVERLAY, {
  cancel: () => csheet(ne() ? `${nd(S.followup.day)} को भेट रद्द गर्ने?` : `Cancel your visit on ${S.followup.day}?`, S.cancelSoon // within 2 hours: nothing is prepaid, so nothing to charge
    ? "It's soon, but cancelling still helps — someone else can have the time. You won't be charged."
    : 'The time goes back to other patients. You can book again whenever you need to.',
    btn('Cancel visit', 'cancel-fu', { kind: 'destructive' }), btn('Keep my visit', 'sheet-close', { kind: 'secondary' })),
  // R13: today's visit can be cancelled in the app until check-in, with the follow-up's sheet. A wallet fee goes back to the wallet (mocked).
  cancelt: () => { const a = S.appt, w = a.pay?.paid && WALLETS[a.pay.how]?.[0];
    return csheet(...(ne() ? [`आज ${nd(a.time)} को भेट रद्द गर्ने?`, `यो समय अरू बिरामीहरूलाई फर्किन्छ। ${w ? `तपाईंको NPR ${FEE} ${w} वालेटमा फर्किन्छ।` : 'तपाईंबाट पैसा लिइँदैन।'}`]
      : [`Cancel your visit today at ${a.time}?`, `The time goes back to other patients. ${w ? `Your NPR ${FEE} goes back to your ${w} wallet.` : "You won't be charged."}`]),
      btn('Cancel visit', 'cancel-fu:today', { kind: 'destructive' }), btn('Keep my visit', 'sheet-close', { kind: 'secondary' })); },
  signout: () => csheet('Sign out of Clinica?', "You'll need a code by SMS to sign back in. Your records stay safe with City Hospital.",
    btn('Sign out', 'sign-out'), btn('Stay signed in', 'sheet-close', { kind: 'secondary' })), // reversible, so Brand, not red
  close: () => csheet('Close your Clinica account?', 'Your login and PIN are deleted. Your medical records stay with City Hospital, as the law requires. Ask at reception for a copy.',
    btn('Close account', 'close-account', { kind: 'destructive' }), btn('Keep my account', 'sheet-close', { kind: 'secondary' })),
  calno: () => csheet("Clinica can't add to your calendar", "Calendar access is off in your phone's settings. Your visit is still in Care, and reminders come by SMS.",
    btn('Open phone settings', 'os:Phone settings'), btn('Not now', 'sheet-close', { kind: 'secondary' })),
  // System calendar sheet — device chrome, a stand-in for the phone's own add-event sheet.
  cal: () => {
    const e = calEvent(S.calFor), grp = r => <div className="sc-g">{r.map((x, i) => <Fragment key={i}>{i > 0 && <div className="sc-sep" aria-hidden="true" />}{x}</Fragment>)}</div>;
    const one = t => <div className="sc-r"><span>{t}</span></div>, kv = (k, v) => <div className="sc-r"><span>{k}</span><span className="v">{v}</span></div>;
    return <>
      <div className="scrim" data-act="sheet-close"></div>
      <div className="syscal" role="dialog" aria-modal="true" aria-label={tr('New event')}>
        <div className="sc-h"><button data-act="sheet-close">{tr('Cancel')}</button><span>{tr('New event')}</span><button className="add" data-act="cal-add">{tr('Add')}</button></div>
        {grp([one(tr('Appointment — City Hospital')), one(place(e.loc))])}{grp([kv(tr('Starts'), nd(e.starts)), kv(tr('Ends'), nd(e.ends))])}
        {grp([kv(tr('Alert'), tr('1 day before')), kv(tr('Second alert'), tr('2 hours before'))])}{grp([one(tr(CAL_NOTE))])}
      </div><div className="sheet-home"></div></>;
  },
});

// ---------- screens ----------
export const emergency = () => notice('', 'In an emergency', "Call 102 for an ambulance, or go straight to an emergency department. Don't wait for the app.",
  <a className="btn secondary l" href="tel:102"><img src={`${A}icon-call.svg`} width="24" height="24" alt="" />{tr('Call 102')}</a>);
export const clinicCall = () => <a className="btn secondary l" href="tel:+97710000000">{tr('Call the clinic')}</a>; // a function, so tr() reads the current language

Object.assign(SCREENS, {
  care: () => {
    const a = S.appt, f = S.followup;
    // R04/T04/V03: grouped by the visit's real date — only a visit today sits under Today; a later one joins Coming up.
    const card = visitCard(nd(when(a.day, a.time)), place(`${DOCTORS[a.doc].opd}, City Hospital`), 'appt:today', a.doc), isToday = a.day === 0; // F02/R04
    const today = <div className="inset stack8">{lbl(isToday ? 'Today' : 'Coming up')}{card}</div>;
    const coming = f ? <div className="inset stack8">{lbl('Coming up')}{isToday ? null : card}{fuCard('appt:fu')}</div> : null;
    let body;
    if (S.visitDay === 'missed') body = <><div className="inset">{notice('warn', ne() ? `${nd(a.time)} मा हामीले तपाईंलाई भेट्न पाएनौं` : `We missed you at ${a.time}`, "Things come up. Book again when you're ready, or call the clinic to be seen today.",
      <>{btn('Book again', 'go:finddoctor', { size: 'l' })}{callBtn('l')}</>)}</div>{coming}</>;
    else if (S.cancelled) body = <><div className="inset">{S.cancelled.byClinic // done to the patient: Error. Their own choice: Neutral.
      ? notice('error', ne() ? `क्लिनिकले तपाईंको ${nd(S.cancelled.date)} को भेट रद्द गर्‍यो` : `The clinic cancelled your ${S.cancelled.date} visit`, "Dr. Sharma can't see patients that day. We're sorry for the change.",
        <>{tag('Cancelled', 'neutral')}{btn('Book another time', 'doctor:ps', { size: 'l' })}</>)
      : notice('', ne() ? `तपाईंको ${nd(S.cancelled.date)} को भेट रद्द भयो` : `Your ${S.cancelled.date} visit is cancelled`, 'The time has gone back to other patients. Book again whenever you need to.',
        <>{tag('Cancelled', 'neutral')}{btn('Book again', 'go:finddoctor', { size: 'l' })}</>)}</div>
      {S.cancelled.cal ? <div className="inset">{notice('warn', 'Remove it from your calendar', "If you added this visit to your calendar, it's still there. We can't delete it for you.",
        btn('Open calendar', 'os:Calendar', { kind: 'secondary', size: 'l' }))}</div> : null}{S.careEmpty ? coming : today}</>; // R13: today's own visit is gone
    else if (S.careErr) body = centred(empty('icon-info-secondary-28.svg', 'Something went wrong', // not the patient's fault, and nothing has changed
      "We couldn't load your appointments. It's not something you did, and nothing has changed.",
      <>{btn('Try again', 'care-refresh', { size: 'l' })}{clinicCall()}</>));
    else if (S.careEmpty && !f) body = centred(empty('icon-event-secondary-28.svg', 'No upcoming visits', 'When you book a visit, it will show up here.', btn('Book a visit', 'go:finddoctor', { size: 'l' })));
    else body = <>{S.refreshing ? <div className="refresh" role="status"><img src={`${A}icon-spinner-24.svg`} width="24" height="24" alt="" />{tr('Updating…')}</div> : null}{isToday || !f ? today : null}{coming}
      <div><div className="inset">{lbl('Earlier')}</div>{list([listItem('lt-followup.svg', 'Past visits', "Kept in Health with your doctor's notes", 'health-go:hvisits')])}</div>
      <div className="inset"><button className="btn secondary" data-act="go:finddoctor"><img src={`${A}icon-add-24.svg`} width="24" height="24" alt="" />{tr('Book a visit')}</button></div></>;
    return frame('Care', body, { back: false, tab: 'Care' });
  },

  cappt: () => frame('Appointment', <>
    <div className="inset">{fuCard()}</div>
    <div className="inset stack8">{lbl('Before you come')}<p className="body-m">{tr("Arrive 15 minutes early and check in at reception. Bring any medicines you're taking.")}</p></div>
    {sect('Details', list([linkRow('lt-location.svg', place('OPD 2, City Hospital'), 'Ground floor. Get directions', MAPS), row('lt-fee.svg', 'Fee', ne() ? `NPR ${FEE}, रिसेप्सनमा तिर्ने` : `NPR ${FEE}, paid at reception`),
      S.cal.fu ? calRow() : listItem('lt-calendar.svg', 'Add to calendar', 'So you get a reminder too', 'add-cal:fu')]), 8)}</>,
    { cta: <>{btn('Reschedule', 'resched:fu', { kind: 'secondary' })}{btn('Cancel visit', 'sheet:cancel', { kind: 'secondary' })}</> }), // red waits for the confirmation

  cresched: () => {
    const o = reschedOpts(), sel = S.rsDay, times = sel == null ? [] : o.times(sel);
    const can = S.rsTime && times.some(x => x.t === S.rsTime && !x.off), day = o.days.find(x => x.i === sel);
    const N = ne(), whichNe = S.rsKey === 'fu' ? `तपाईंको ${nd(S.followup.day)} को भेट` : `${relNe(S.appt.day)} तपाईंको भेट`; // Phase 8
    const still = N ? `${S.rsKey === 'fu' ? `तपाईंको ${nd(S.followup.day.split(', ')[1])} को भेट` : `${relNe(S.appt.day)} तपाईंको भेट`} बुक नै छ।`
      : S.rsKey === 'fu' ? `Your ${S.followup.day.split(', ')[1]} visit is still booked.` : `Your visit ${rel(S.appt.day)} is still booked.`;
    const now = sect('Currently', list([row('lt-calendar.svg', o.now, o.who)]), 0);
    if (S.rsNone || o.days.every(x => x.off)) return frame('Reschedule', <>{now}{empty('icon-event-secondary-28.svg', 'No other times this week',
      N ? `${whichNe} बुक नै छ। अर्को हप्ताबारे सोध्न क्लिनिकमा फोन गर्नुहोस्।`
      : `${S.rsKey === 'fu' ? `Your ${S.followup.day} visit` : `Your visit ${rel(S.appt.day)}`} is still booked. Call the clinic to ask about next week.`,
      <>{btn('Keep my visit', 'back', { size: 'l' })}{clinicCall()}</>)}</>);
    return frame('Reschedule', <>
      {S.rsErr ? <div className="inset" role="alert">{notice('error', N ? `${nd(S.rsErr.wd)} ${nd(S.rsErr.t)} को समय भर्खरै अरू कसैले लियो` : `${S.rsErr.t} on ${S.rsErr.wd} was just taken`,
        N ? `${still} अर्को समय छान्नुहोस्।` : `${still} Choose another time.`)}</div> : null}
      {now}
      <div className="inset stack8">{lbl('Choose a new day')}
        <div className="hscroll days" role="radiogroup" aria-label={N ? 'दिन' : 'Day'}>{o.days.map(x =>
          <button key={x.i} className="pick day" role="radio" aria-checked={x.i === sel} disabled={!!x.off} data-act={`rs-day:${x.i}`} aria-label={N ? `${nd(x.wd)}, ${nd(x.date)}${x.off ? ', उपलब्ध छैन' : ''}` : `${x.wd}, ${x.date}${x.off ? ', unavailable' : ''}`}><span className="d1">{tr(x.wd)}</span><span className="d2">{tr(x.date)}</span></button>)}</div></div>
      <div className="inset stack8">{lbl('Choose a new time')}
        <div className="times" role="radiogroup" aria-label={N ? 'समय' : 'Time'}>{times.map(x =>
          <button key={x.t} className="pick time" role="radio" aria-checked={x.t === S.rsTime} disabled={!!x.off} data-act={`rs-time:${x.t}`} aria-label={N ? `${nd(x.t)}${x.off ? ', बुक भइसक्यो' : ''}` : `${x.t}${x.off ? ', taken' : ''}`}>{tr(x.t)}</button>)}</div></div></>,
      { cta: btn(can ? (N ? `${nd(day.wd)}, ${nd(S.rsTime)} मा सार्नुहोस्` : `Move to ${day.wd}, ${S.rsTime}`) : S.rsErr ? 'Choose a new time' : 'Choose a time', 'rs-move', { disabled: !can }) });
  },

  cmoved: () => {
    const m = S.moved, added = S.cal[m.key], N = ne();
    const fromNe = () => { const t = /^slot today at (.+)$/.exec(m.from); return t ? `आज ${nd(t[1])} को समय` : `${nd(m.from.replace(/ slot$/, ''))} को समय`; }; // Phase 8: m.from is English data
    return frame('Appointment', <>
      <div className="inset">{notice('success', 'Visit moved', N ? `तपाईंको ${fromNe()} छोडियो। नयाँ समय SMS बाट पठाइएको छ।` : `Your ${m.from} has been released. We've sent the new time by SMS.`)}</div>
      {m.stale ? <div className="inset">{notice('warn', N ? `क्यालेन्डरमा अझै ${nd(m.stale.replace(/^t(oday|omorrow)/, 'T$1'))} देखिन्छ` : `Calendar still shows ${m.stale}`, "We can't change events in your calendar. Add the new time, then delete the old one.")}</div> : null}
      <div className="inset">{m.key === 'fu' ? fuCard() : todayCard(false)}</div>{added ? calRow() : null}</>,
      { cta: added ? null : calBtn(m.key, m.stale ? 'Add the new time' : 'Add to calendar') });
  },

  // Visit day: a state, never an estimate — booked, running late, checked in, done.
  cday: () => {
    const v = S.visitDay, a = S.appt, d = DOCTORS[a.doc], dr = `Dr. ${surname(d.name)}`, she = a.doc === 'ps' ? 'she' : 'the doctor';
    const N = ne(), u = a.doc === 'ps' ? 'उहाँ' : 'डाक्टर', tm = nd(a.time); // Phase 8: Nepali, honorific for the doctor
    const top = (N ? {
      late: () => notice('info', `${dr} ढिला हुनुहुन्छ`, `तपाईंको ${tm} को समय कायम छ। ${u} तयार हुनासाथ हामी सन्देश पठाउँछौं।`),
      checkedin: () => notice('', "You're checked in", `${dr} तयार हुनुभएपछि रिसेप्सनले तपाईंलाई बोलाउनेछ।`, tag(`${d.name} लाई पर्खँदै`, 'info')),
      done: () => notice('success', 'Visit complete', `${u}ले थपेपछि ${dr} को टिप्पणी र तपाईंको प्रेस्क्रिप्सन स्वास्थ्यमा देखिनेछन्।`),
      turn: () => notice('success', `${dr} तपाईंका लागि तयार हुनुहुन्छ`, `कृपया अहिले ${d.opd} मा जानुहोस्। यो भुइँ तलामा, फार्मेसी पार गरेपछि छ।`, tag('Your turn', 'info')),
      with: () => notice('info', `तपाईं ${dr} सँग हुनुहुन्छ`, `${u}का टिप्पणी र प्रेस्क्रिप्सन भेटपछि स्वास्थ्यमा हुनेछन्।`, tag('In progress', 'info')),
      ontime: () => notice('success', `${dr} फेरि समयमै हुनुहुन्छ`, `तपाईंको ${tm} को समय ठीक छ। आइपुगेपछि रिसेप्सनमा चेक इन गर्नुहोस्।`),
    } : {
      late: () => notice('info', `${dr} is running late`, `Your ${a.time} slot is kept. We'll message you as soon as ${she}'s ready.`),
      checkedin: () => notice('', "You're checked in", `Reception will call you when ${dr} is ready.`, tag(`Waiting for ${d.name}`, 'info')),
      done: () => notice('success', 'Visit complete', `${dr}'s notes and your prescription will appear in Health once ${she} has added them.`),
      turn: () => notice('success', `${dr} is ready for you`, `Please go to ${d.opd} now. It's on the ground floor, past the pharmacy.`, tag('Your turn', 'info')),
      with: () => notice('info', `You're with ${dr}`, `${a.doc === 'ps' ? 'Her' : "The doctor's"} notes and any prescriptions will be in Health after your visit.`, tag('In progress', 'info')),
      ontime: () => notice('success', `${dr} is back on time`, `Your ${a.time} slot is on time. Check in at reception when you arrive.`),
    })[v]?.();
    const arrive = sect('When you arrive', list([row('lt-location.svg', place(`${d.opd}, City Hospital`), 'Ground floor, past the pharmacy'),
      row('lt-schedule.svg', N ? `${nd(addMin(a.time, -15))} सम्म आइपुग्नुहोस्` : `Arrive by ${addMin(a.time, -15)}`, 'Then check in at reception'),
      v === 'late' || v === 'ontime' ? row('lt-bell.svg', N ? `${u} तयार हुनासाथ हामी खबर गर्नेछौं` : `We'll tell you when ${she}'s ready`, 'No need to watch the app')
      : row('lt-bell.svg', N ? `${dr} ढिला हुनुभएमा` : `If ${dr} is running late`, "We'll message you here")]), 0);
    const rest = {
      checkedin: () => <div className="inset stack8">{lbl('While you wait')}<p className="body-m">{tr("Need to step out? Tell reception first, so your turn isn't missed.")}</p></div>,
      turn: () => <div className="inset stack8">{lbl("If you can't go now")}<p className="body-m">{tr("Can't go right now? Tell reception, so you don't lose your turn.")}</p></div>,
      with: () => <div className="inset stack8">{lbl('On your way out')}<p className="body-m">{a.pay?.paid ? (N ? `तपाईंको शुल्क तिरिसकियो (रसिद ${a.pay.ref})। रिसेप्सनमा केही तिर्नु पर्दैन।` : `Your fee is paid (receipt ${a.pay.ref}). Nothing to pay at reception.`) // W02
        : tr('Pay the fee at reception. Your SMS confirmation has the amount.')}</p></div>,
      done: () => <div className="inset stack8">{lbl('Next step')}{S.followup ? fuCard('appt:fu')
        : S.fuAdvice === 'none' ? notice('', 'No follow-up needed', 'Come back only if it gets worse.') // as the doctor advised
        : S.fuAdvice === 'other' ? notice('', S.fuDate ? (N ? `${nd(drShort(S.fuDate))} मा फलो-अप` : `Follow-up on ${drShort(S.fuDate)}`) : 'Follow-up needed', 'Book now to get a time that suits you.', btn('Book follow-up', 'cday-fu', { size: 'l' })) // the date the doctor chose
        : notice('', 'Follow-up in 2 weeks', 'Around Sep 11. Book now to get a time that suits you.', btn('Book follow-up', 'cday-fu', { size: 'l' }))}</div>,
    }[v]?.() || arrive;
    // R23/T14: today's visit (or a later one) can be moved from here too, not only when running late.
    const cancel = a.day === 0 ? btn('Cancel visit', 'sheet:cancelt', { kind: 'secondary' }) : null; // R13: until she's checked in
    const cta = { booked: () => <>{dirBtn(d.opd)}{btn('Reschedule', 'resched:appt', { kind: 'secondary' })}{cancel}</>, ontime: () => <>{dirBtn(d.opd)}{btn('Reschedule', 'resched:appt', { kind: 'secondary' })}{cancel}</>,
      late: () => <>{dirBtn(d.opd)}{btn('Reschedule instead', 'resched:appt', { kind: 'secondary' })}{cancel}</>,
      done: () => btn('Go to Health', 'health-tab', { kind: 'secondary' }) }[v]?.() || null;
    // V14: the reason given and how the fee is paid (F09/W02: Paid · receipt / Not paid · Pay now / Pay at reception).
    const booking = v === 'done' ? null : <div className="stack8">{sect('Your booking', list([row('lt-clipboard.svg', 'Reason for visit', a.reason || 'None given')]), 0)}<div className="inset">{payCard(a)}</div></div>;
    return frame('Appointment', <>{top ? <div className="inset">{top}</div> : null}<div className="inset">{todayCard(false)}</div>{rest}{booking}</>, { cta });
  },

  notifs: () => {
    const ns = S.healthEmpty ? [] : S.notifs;
    if (!ns.length) return frame('Notifications', centred(empty('icon-bell-secondary-28.svg', 'No notifications yet',
      'Reminders, delays and updates about your reports will appear here.', <div style={{ height: 104 }}></div>)));
    const group = g => sect(g, list(ns.map((n, i) => n.g === g ? notifRow(n, i) : null).filter(Boolean)), 0);
    return frame('Notifications', <>
      {S.notifOff ? <div className="inset">{notice('warn', 'Notifications are off on this phone', 'This list still updates, but nothing will pop up. SMS updates still arrive.',
        btn('Turn them on', 'os:Phone settings', { size: 'l' }))}</div> : null}
      {group('Today')}{group('Earlier')}</>,
      { gap: 16, actions: <>{ns.some(n => !n.read) ? iconBtn('icon-task-alt-24.svg', tr('Mark all as read'), 'notif-read') : null}{iconBtn('icon-settings-24.svg', tr('Notification settings'), 'go:pfnotif')}</> });
  },

  // ---------- Profile ----------
  pf: () => frame('Profile', <>
    <div className="inset"><div className="who"><span className="avatar l" aria-hidden="true">{initials(S.fullName)}</span>
      <div><p className="who-n">{S.fullName}</p><p className="body-s">{tr('Patient at City Hospital')}</p><p className="body-s tertiary">{masked()}</p></div></div></div>
    {sect('You', list([listItem('icon-person.svg', 'Your details', 'Name, birth date and mobile number', 'go:pfdetails'),
      listItem('lt-fee.svg', 'Payments', S.payments.length ? (ne() ? `एपमा ${S.payments.length} पटक तिरिएको` : `${S.payments.length} paid in the app`) : 'Fees paid in the app, with receipts', 'go:pfpay')]))}{/* T05/W02 */}
    {sect('Settings', list([listItem('lt-translate.svg', 'Language', S.lang === 'ne' ? 'नेपाली' : 'English', 'go:pflang'),
      listItem('lt-bell.svg', 'Notifications', S.notifOff ? 'Off in phone settings' : S.notif !== 'on' && S.notNow ? 'Off. You chose Not now' : 'On', 'go:pfnotif'), /* W15: her own answer too */
      listItem('lt-lock.svg', 'Health lock', S.finger === 'on' && !S.noSensor ? 'PIN and fingerprint' : S.pin ? 'PIN' : 'Set up when you first open Health', 'pf-lock')]))}
    {sect('Your clinic', list([listItem('lt-hospital.svg', 'City Hospital', 'Phone, address and opening hours', 'go:pfclinic')]))}
    {sect('Help and about', list([listItem('lt-help-circle.svg', 'Help', 'Emergencies, contacting the clinic, privacy', 'go:pfhelp'), listItem('lt-info.svg', 'About Clinica', 'Version, privacy', 'go:pfabout')]))}
    {sect('This phone', list([listItem('icon-person.svg', 'Switch person', 'For a phone the family shares', 'go:pfswitch'),
      listItem('lt-lock-open.svg', 'Sign out', masked(), 'sheet:signout'), listItem('lt-close.svg', 'Close account', 'Your records stay with the clinic', 'sheet:close')]))}</>,
    { back: false, tab: 'Profile' }),

  pfdetails: () => {
    const me = DETAILS[S.fullName] || { dob: S.dob, sex: S.sex, no: 'At reception' }, p = parseDob(me.dob || ''), b = p && toBS(p.y, p.m, p.d);
    return frame('Your details', <>
      {S.phoneChanged ? <div className="inset">{notice('success', 'Mobile number changed', "We've let your old number know too.")}</div> : null}
      <div className="inset">{notice('', 'Kept by City Hospital', "To change your name, date of birth or sex, ask at reception — the clinic's record is the one that counts.")}</div>
      {sect('Details', list([row('icon-person.svg', 'Full name', S.fullName),
        row('lt-calendar-month.svg', 'Date of birth', p ? nd(`${p.d} ${AD_SHORT[p.m]} ${p.y}${b ? `${ne() ? ', वा' : ', or'} ${bsText(b)}` : ''}`) : 'On file at reception'),
        row('icon-person.svg', 'Sex', me.sex || 'On file at reception'), ...(S.pronouns ? [row('icon-person.svg', 'Pronouns', S.pronouns)] : []), row('lt-clipboard.svg', 'Patient number', me.no),
        listItem('lt-call.svg', 'Mobile number', masked(), 'pf-phone')]))}</>);
  },

  pflang: () => frame('Language', <>
    <div className="inset"><div className="tiles" role="radiogroup" aria-label={tr('Language')}>
      {[['en', 'English', ''], ['ne', 'नेपाली', 'deva']].map(([v, l, c]) =>
        <button key={v} className="tile" role="radio" aria-checked={S.lang === v} data-act="lang" data-v={v}>
          <img className="off" src={`${A}translate-secondary.svg`} width="28" height="28" alt="" /><img className="on" src={`${A}translate-action.svg`} width="28" height="28" alt="" />
          <span className={c}>{l}</span></button>)}
    </div></div>
    <div className="inset"><p className="body-s">{tr("Changes straight away. Your doctor's notes stay in the language they were written in.")}</p></div></>),

  // Switches take effect at once. When the phone blocks Clinica, each keeps its value but can't change.
  pfnotif: () => {
    const n = S.nset, off = S.notifOff;
    return frame('Notifications', <>
      {off ? <div className="inset">{notice('warn', 'Notifications are off for Clinica', "They're turned off in your phone's settings, so nothing below reaches you here. SMS updates still arrive.",
        btn('Open phone settings', 'os:Phone settings', { size: 'l' }))}</div>
      : S.notif !== 'on' && S.notNow ? <div className="inset">{notice('', 'You chose Not now', "Nothing pops up on this phone. SMS updates still arrive.", btn('Turn on notifications', 'notif-on', { size: 'l' }))}</div> : null}{/* W15 */}
      {sect('Your appointments', listP([setting('Appointment reminders', 'The day before, and 2 hours before', n.remind, 'nset:remind', off),
        setting('Delays and cancellations', 'Always on, so the clinic can reach you', true, '', true),
        setting('Follow-up reminders', 'When a follow-up is due', n.fu, 'nset:fu', off)]))}
      {sect('Your records', listP([setting('Lab reports ready', 'When your doctor releases a report', n.labs, 'nset:labs', off)]))}
      <div className="inset"><p className="body-s">{tr('Appointment updates also come by SMS, whatever you choose here. We never send marketing.')}</p></div></>);
  },

  pflock: () => frame('Health lock', <>
    {S.pinChanged ? <div className="inset">{notice('success', 'PIN changed', 'Use your new PIN from now on.')}</div> : null}
    {sect('Lock and unlock', <div className="list">{row('lt-lock.svg', 'Locks automatically', 'When you leave Clinica, or after 5 idle minutes')}
      {listItem('lt-lock.svg', 'Change PIN', 'Choose a new 4-digit PIN', 'pf-pin')}<div className="sep" aria-hidden="true"></div>
      {S.noSensor ? setting('Use fingerprint', 'This phone has no fingerprint sensor.', false, '', true, lead('lt-fingerprint.svg')) // disabled, with the reason
        : setting('Use fingerprint', S.finger === 'on' ? 'Fingerprint data saved on this phone could open your records' : 'Off. Your PIN opens your records.', S.finger === 'on', 'pf-finger', false, lead('lt-fingerprint.svg'))}</div>)}
    {family().length > 1 ? sect('On this shared phone', list([setting('Also lock appointments and medicines', S.homeLock[S.fullName] !== false ? 'Home shows them after your PIN' : 'Off. Anyone with this phone sees them on Home',
      S.homeLock[S.fullName] !== false, 'pf-homelock', false, lead('lt-calendar.svg'))])) : null}{/* T22: each person chooses */}
    {sect('If you forget', list([listItem('lt-sms.svg', 'Reset your PIN', 'With a code sent by SMS', 'pf-reset')]))}
    <div className="inset"><p className="body-s">{tr("Your Clinica PIN isn't your phone's PIN. On a shared phone, it's the one thing only you know.")}</p></div></>),

  // T05/W02: fees paid in the app, each with its receipt. The wallet is mocked, so the receipt references are made up.
  pfpay: () => frame('Payments', S.payments.length ? sect('Paid in the app', list(S.payments.map(x => row('lt-fee.svg', ne() ? `NPR ${FEE}, ${x.how} बाट · रसिद ${x.ref}` : `NPR ${FEE} with ${x.how} · Receipt ${x.ref}`, // Phase 8
      ne() ? `${x.doc}, ${nd(when(x.day, x.time))}${x.for !== S.fullName ? ` · ${x.for} का लागि` : ''}` : `${x.doc}, ${when(x.day, x.time)}${x.for !== S.fullName ? ` · for ${x.for}` : ''}`))))
    : centred(empty('icon-info-secondary-28.svg', 'No payments yet', 'Fees you pay in the app show here, with their receipt. Fees paid at reception are on the receipt they give you.'))),

  pfclinic: () => frame('City Hospital', <>
    <div className="inset">{emergency()}</div>
    {sect('Contact', list([linkRow('lt-call.svg', 'Reception', '+977 1-4412345', 'tel:+97714412345'), linkRow('lt-location.svg', 'Address', 'Maharajgunj, Kathmandu', MAPS),
      row('lt-schedule.svg', 'Opening hours', 'Sun to Fri, 9 AM to 5 PM. Closed Saturdays.')]))}</>,
    { cta: <a className="btn primary" href="tel:+97714412345"><img src={`${A}icon-call-on-action-24.svg`} width="24" height="24" alt="" />{tr('Call reception')}</a> }),

  pfswitch: () => {
    const others = RECORDS.map((r, i) => [r, i]).filter(([r]) => r.name !== S.fullName && family().includes(r)); // F22/R22/T22: only this number's people
    return frame('Switch person', <>
      {heading("Who's using the app?", ne() ? `सिटी हस्पिटलका ${others.length + 1} जना यो फोन साझा गर्नुहुन्छ, र हरेकको आफ्नै PIN छ।` : `${others.length + 1} people at City Hospital share this phone, and each has their own PIN.`, undefined, 'h2')}
      {sect('People', list([<div className="list-item static">{lead('icon-person.svg')}<span className="text"><span className="item-title">{S.fullName}</span><span className="body-s">{tr('You, right now')}</span></span>
          <img src={`${A}icon-check-circle-20.svg`} width="20" height="20" alt={tr('Current person')} /></div>,
        ...others.map(([r, i]) => listItem('icon-person.svg', r.name, ne() ? `जन्म ${nd(r.born)}${r.managedBy ? ` · ${r.managedBy} ले हेर्नुहुन्छ` : ''}` : `Born ${r.born}${r.managedBy ? ` · Managed by ${r.managedBy}` : ''}`, `pf-switch:${i}`)),
        listItem('icon-add.svg', 'Someone else', 'Sign in with their own record', 'pf-other')]))}
      <div className="inset"><p className="body-s">{tr("Switching asks for that person's Clinica PIN, so nobody opens someone else's records by accident.")}</p></div></>);
  },

  // Emergency guidance stays first: it's what someone looking for help most needs to find.
  pfhelp: () => frame('Help', <>
    <div className="inset">{emergency()}</div>
    {sect('Get help', list([linkRow('lt-call.svg', 'Reception', '+977 1-4412345', 'tel:+97714412345'),
      listItem('lt-lock.svg', 'How your records are kept private', 'Who sees them, and your choices', 'go:privacy'),
      listItem('lt-document.svg', 'Terms of use', 'What using Clinica means', 'go:terms')]))}</>),

  pfabout: () => frame('About Clinica', sect('Clinica', list([row('lt-info.svg', 'Version', '1.0.0'), row('lt-hospital.svg', 'Made for City Hospital', 'Maharajgunj, Kathmandu'),
    listItem('lt-lock.svg', 'Privacy policy', 'How your records are kept private', 'go:privacy')]))),

  pfadd: () => frame('', centred(empty('icon-person-secondary-28.svg', 'Add someone on this phone',
    ne() ? `यो नम्बरमा भएका सिटी हस्पिटलका अरू रेकर्ड खोज्न हामी ${masked()} मा कोड पठाउँछौं।` : `We'll text a code to ${masked()} to find the other City Hospital records on this number.`,
    <>{btn('Send code', 'add-code', { size: 'l' })}{btn('They have their own number', 'own-number', { kind: 'secondary', size: 'l' })}</>, false, 'h1'))), // W13

  closed: () => (
    <div className="screen">
      {statusBar()}
      {centred(empty('icon-check-circle-secondary-28.svg', 'Your account is closed',
        'Your login and PIN are deleted. City Hospital keeps your medical records, as the law requires — ask at reception for a copy.', btn('Done', 'restart', { size: 'l' }), false, 'h1'))}{/* W13 */}
      {homeInd()}
    </div>),

  pfpin: () => {
    const r = RECORDS[S.switchTo], first = r.name.split(' ')[0];
    return pinScreen(...(ne() ? [`${first} को PIN हाल्नुहोस्`, `${r.name} को रेकर्डमा जान।`] : [`Enter ${first}'s PIN`, `To switch to ${r.name}'s records.`]),
      <>{S.pinErr ? errLine("That PIN didn't match. Try again.") : null}<button className="btn secondary l hug" data-act="pf-forgot">{tr('Forgot your PIN?')}</button></>);
  },
});

// ---------- behaviour ----------
export function openCal(key) { S.calFor = key; S.sheet = S.calOff ? 'calno' : 'cal'; render(); }
export function switchTo(i) { S.fullName = RECORDS[i].name; S.first = S.fullName.split(' ')[0]; S.pinEntry = ''; S.pinErr = false; toHome(); S.unlocked = true; render(); } // opens their Home, not Health; T22: their PIN just opened it
export const tabRoot = screen => { Object.assign(S, { stack: [], sheet: null, screen }); render(); };

Object.assign(mount, {
  cresched: () => $phone().querySelector('.days [aria-checked="true"]')?.scrollIntoView({ block: 'nearest', inline: 'nearest' }),
});

Object.assign(ACTIONS, {
  'care-tab': () => { if (S.screen === 'care') return ACTIONS['care-refresh'](); S.cancelled = null; tabRoot('care'); }, // tapping the tab again refreshes
  'care-refresh': () => { // a spinner row above what's already there; the content stays readable
    if (S.offline) return;
    Object.assign(S, { careErr: false, refreshing: true }); render();
    after(() => { S.refreshing = false; render(); }, 1200);
  },
  'pf-tab': () => tabRoot('pf'),
  appt: arg => arg === 'fu' ? go('cappt') : S.visitDay === 'missed' ? ACTIONS['care-tab']() : go('cday'),
  sheet: arg => { S.sheet = arg; render(); },
  os: arg => SYS_OS[arg] ? openSys(SYS_OS[arg]()) : endScreen(arg, 'On a phone this hands off to the system or to a screen outside these Figma sections.'),
  'add-cal': openCal,
  'cal-add': () => { S.cal[S.calFor] = true; downloadIcs(calEvent(S.calFor)); S.sheet = null; toast(tr('Added to your calendar.')); render(); }, // W03 // iOS reports the save
  'cancel-fu': key => {
    if (key === 'today') { // R13: her visit today, before check-in
      const a = S.appt, w = a.pay?.paid && WALLETS[a.pay.how]?.[0];
      S.cancelled = { date: dayLabel(TODAY).split(', ')[1], day: dayLabel(TODAY), cal: S.cal.appt };
      Object.assign(S, { careEmpty: true, sheet: null, stack: [], screen: 'care' }); S.cal.appt = false;
      toast(ne() ? `आज ${nd(a.time)} को तपाईंको भेट रद्द भयो।${w ? ` NPR ${FEE} तपाईंको ${w} वालेटमा फर्किँदैछ।` : ''}` // Phase 8
        : `Your visit today at ${a.time} is cancelled.${w ? ` NPR ${FEE} is going back to your ${w} wallet.` : ''}`);
      return render();
    }
    S.cancelled = { date: S.followup.day.split(', ')[1], day: S.followup.day, cal: S.cal.fu }; // a calendar copy would now be stale
    Object.assign(S, { followup: null, sheet: null, stack: [], screen: 'care' });
    S.cal.fu = false;
    toast(ne() ? `${nd(S.cancelled.day)} को तपाईंको भेट रद्द भयो।` : `Your visit on ${S.cancelled.day} is cancelled.`); // W03
    render();
  },
  resched: key => {
    S.rsKey = key; S.rsTime = null; S.rsErr = null;
    const o = reschedOpts();
    S.rsDay = o.days.some(x => x.i === o.cur && !x.off) ? o.cur : o.days.find(x => !x.off)?.i ?? null;
    go('cresched');
  },
  'rs-day': arg => { S.rsDay = +arg; S.rsTime = null; render(); },
  'rs-time': arg => { S.rsTime = arg; render(); },
  'rs-move': () => {
    const key = S.rsKey, x = reschedOpts().days.find(d => d.i === S.rsDay), a = S.appt;
    if (S.failNext === 'taken') { // someone else took it while choosing: the current visit stays booked
      S.failNext = '';
      if (key === 'fu') S.rsTaken.push(`fu|${x.i}|${S.rsTime}`); else takeSlot(a.doc, x.i, S.rsTime);
      S.rsErr = { t: S.rsTime, wd: x.wd }; S.rsTime = null;
      return render();
    }
    const from = key === 'fu' ? `${S.followup.day} slot` : a.day === 0 ? `slot today at ${a.time}` : `${dayName(a.day)} slot`;
    const stale = S.cal[key] ? (key === 'fu' ? S.followup.day : when(a.day, a.time).replace(/^T(oday|omorrow)/, 't$1')) : null;
    if (key === 'fu') S.followup = { day: `${x.wd}, ${x.date}`, time: S.rsTime, iso: FOLLOW_DAYS[x.i][3] }; // F20
    else { takeSlot(a.doc, x.i, S.rsTime); S.appt = { ...a, day: x.i, time: S.rsTime }; S.visitDay = 'booked'; }
    S.cal[key] = false; S.moved = { key, from, stale };
    toast(ne() ? `भेट ${nd(x.wd)}, ${nd(S.rsTime)} मा सारियो।` : `Visit moved to ${x.wd}, ${S.rsTime}.`); // W03: announced once, by the shared toast
    S.screen = 'cmoved'; render(); // replaces the picker, so Back returns to the appointment
  },
  'cday-fu': () => { S.askDay = 1; S.askTime = null; go('askbook'); }, // the same Book follow-up screen as Ask
  'notif-open': i => { // each row opens where it is about
    const n = S.notifs[+i];
    n.read = true;
    if (n.go === 'late' && S.visitDay === 'booked') S.visitDay = 'late';
    if (n.go === 'ontime') S.visitDay = 'ontime';
    if (n.go === 'clinic-cancel') { // the clinic cancelled the follow-up
      if (S.followup) S.cancelled = { date: S.followup.day.split(', ')[1], byClinic: true, cal: S.cal.fu };
      Object.assign(S, { followup: null }); S.cal.fu = false;
      return tabRoot('care');
    }
    if (n.go === 'late' || n.go === 'today' || n.go === 'ontime') return go('cday');
    if (n.go === 'fu') return S.followup ? go('cappt') : go('finddoctor');
    if (n.go.startsWith('med:')) S.medI = +n.go.slice(4); // a medicine (meds.jsx)
    if (n.go === 'hreport') S.report = 'hba1c'; // the new report
    if (n.go === 'hreport-cbc') { S.report = 'cbc'; return openHealth('hreport'); } // released by the doctor (doctor.jsx)
    openHealth(n.go.startsWith('med:') ? 'mtmed' : n.go); // medicines, reports and notes, through the Health lock
  },
  'notif-read': () => { S.notifs.forEach(n => { n.read = true; }); render(); },
  nset: key => { S.nset[key] = !S.nset[key]; render(); },
  'notif-on': () => { S.notif = 'on'; render(); }, // W15
  // Off at once — safer and reversible. On goes through the opt-in, which restates the trade-off.
  'pf-finger': () => { if (S.finger === 'on') { S.finger = 'off'; return render(); } S.afterUnlock = 'pflock'; go('finger'); },
  'pf-homelock': () => { S.homeLock = { ...S.homeLock, [S.fullName]: S.homeLock[S.fullName] === false }; render(); }, // T22
  'home-unlock': () => { Object.assign(S, { afterUnlock: 'home', pinEntry: '', pinErr: false }); go('pin'); }, // T22: the same PIN as Health
  'pf-lock': () => { S.pinChanged = false; go('pflock'); },
  'pf-phone': () => { // the number is how someone signs in, so changing it needs the PIN
    Object.assign(S, { codeFor: 'newphone', newPhone: '', phoneErr: false, afterUnlock: 'pfphone', pinEntry: '', pinErr: false });
    go(S.pin ? 'pin' : 'phone');
  },
  'add-code': () => { Object.assign(S, { codeFor: 'addperson', code: '', codeState: 'typing', resend: 42 }); go('code'); },
  'pf-pin': () => { // the current PIN first, then Health's new-PIN screens
    Object.assign(S, { pinEntry: '', pinErr: false, pinMismatch: false, afterUnlock: S.pin ? 'pinnew' : 'pflock' });
    go(S.pin ? 'pin' : 'pinnew');
  },
  'pf-reset': () => { S.afterUnlock = 'pflock'; S.sheet = 'reset'; render(); },
  'pf-switch': i => { Object.assign(S, { switchTo: +i, pinEntry: '', pinErr: false }); go('pfpin'); },
  'pf-forgot': () => endScreen('Forgot the PIN?', 'Each person resets their own PIN from their own Profile, or at reception with ID.'),
  'pf-other': () => go('pfadd'),
  'own-number': () => { reset({ stack: ['splash'], screen: 'phone' }); render(); }, // they sign in on their own phone
  'sign-out': () => { reset({ stack: ['splash'], screen: 'phone' }); render(); },
  'close-account': () => { reset({ screen: 'closed' }); render(); },
});
later(() => { ACTIONS['sheet-close'] = () => { S.sheet = null; render(); }; }, ORDER.care); // the safe choice; keeps the scroll under the sheet (over health.jsx's)

Object.assign(NUM, {
  care: s => s.careErr ? 'GX07' : s.refreshing ? 'GX05' : s.offline ? 'GX02' : s.visitDay === 'missed' ? 'C11' : s.cancelled ? (s.cancelled.byClinic ? 'SC06' : s.cancelled.cal ? 'K06' : 'C06') : s.careEmpty && !s.followup ? 'C12' : 'C01',
  cappt: s => s.sheet === 'cancel' ? (s.cancelSoon ? 'SC07' : 'C05') : 'C02',
  cresched: s => s.rsNone ? 'SC04' : s.rsErr ? 'SC03' : 'C03', cmoved: s => s.moved.stale ? 'K05' : 'C04',
  cday: s => s.sheet === 'cancelt' ? 'C05' : ({ booked: 'C07', late: 'C08', checkedin: 'C09', done: 'C10', turn: 'SC01', with: 'SC02', ontime: 'SC05' })[s.visitDay],
  notifs: s => s.healthEmpty ? 'N02' : s.notifOff ? 'N03' : 'N01',
  pf: s => ({ signout: 'P08', close: 'P10' })[s.sheet] || 'P01',
  pfdetails: s => s.phoneChanged ? 'PM08' : 'P02', pflang: () => 'P03', pfnotif: s => s.notifOff ? 'P09' : 'P04',
  pflock: s => s.pinChanged ? 'PM04' : s.noSensor ? 'HM13' : s.finger !== 'on' ? 'PM10' : 'P05',
  pfclinic: () => 'P06', pfswitch: () => 'P07', pfpay: () => 'P12', pfpin: () => 'P11', pfhelp: () => 'PM12', pfabout: () => 'PM13', pfadd: () => 'PM11', closed: () => 'PM09',
});
later(() => { NUM.confirmed = s => s.cal.appt ? 'K03' : s.booked?.for && s.booked.for !== s.fullName ? 'SB03' : 'B05'; }, ORDER.care); // over booking.jsx's; Figma sync: booked for someone else is SB03, not B05

export const PF = ['pf'], BOOKED = { screen: 'confirmed', taken: { 'ps|0': ['4:30 PM'] } };
FLOW.push(
  ['Care — your appointments', [
    ['C01', 'Care', 'Care tab', "The Care tab holds appointments. Today first, then what's coming up. Past visits point to Health rather than being listed twice.", () => ({ screen: 'care' })],
    ['C02', 'Appointment detail', 'Taps a visit', 'What to bring and where to go. Reschedule and Cancel are both neutral — red waits for the confirmation.', () => ({ screen: 'cappt', stack: ['care'] })],
    ['C03', 'Reschedule', 'From 02 — Reschedule', 'The current time stays visible while choosing a new one. Taken times are shown as taken.', () => ({ screen: 'cresched', stack: ['care', 'cappt'], rsKey: 'fu', rsDay: 3, rsTime: '11:00 AM' })],
    ['C04', 'Rescheduled', 'Moves the visit', 'Success tone, earned: the move is done, the old slot released, the new time sent by SMS.', () => ({ screen: 'cmoved', stack: ['care', 'cappt'], followup: MOVED_FU, moved: { key: 'fu', from: `${dayLabel(FU_DAY)} slot`, stale: null } })],
    ['C05', 'Cancel visit', 'From 02 — Cancel visit', 'The Bottom sheet, with the only red on the screen on the confirming button. Keep my visit — or tapping outside — is the safe choice.', () => ({ screen: 'cappt', stack: ['care'], sheet: 'cancel' })],
    ['C06', 'Cancelled', 'Confirms the cancel', "The patient's own choice, so Neutral with a Cancelled tag. The clinic cancelling (Booking B09) is Error: done to them, not by them.", () => ({ screen: 'care', followup: null, cancelled: { date: 'Sep 11', cal: false } })],
  ]],
  ['Care — visit day', [
    ['C07', 'Visit day', "From 01 — today's visit", 'Where to go, when to arrive, and the one promise: a message if the doctor is running late. State, never an estimate: the clinic can\'t observe the consult room, so the app never guesses at minutes.', () => ({ screen: 'cday', stack: ['care'] })],
    ['C08', 'Running late', 'The clinic flags a delay', 'Info tone: something is happening now. The slot is kept; no estimate of how late.', () => ({ screen: 'cday', stack: ['care'], visitDay: 'late' })],
    ['C09', 'Checked in', 'Checked in at reception', 'State only — waiting. No queue position and no minutes, which the clinic cannot observe honestly.', () => ({ screen: 'cday', stack: ['care'], visitDay: 'checkedin' })],
    ['C10', 'Visit complete', 'After the consultation', 'Notes arrive in Health when the doctor adds them. The follow-up is bookable right here.', () => ({ screen: 'cday', stack: ['care'], visitDay: 'done', followup: null })],
  ]],
  ['Care — unhappy and empty', [
    ['C11', 'Missed visit', 'Replaces the visit on 01 after a no-show', 'Warning tone from the status vocabulary, and no blame — people who feel judged for one missed visit tend to miss the next.', () => ({ screen: 'care', visitDay: 'missed' })],
    ['C12', 'No appointments', 'Nothing booked', 'One way forward: book a visit.', () => ({ screen: 'care', careEmpty: true, followup: null })],
  ]],
  ['Profile — you and your settings', [
    ['P01', 'Profile', 'Profile tab', "Where the rest of the app sends people: language, notifications, the Health lock. Shown here at full scroll length — the hub for everything other screens point to.", () => ({ screen: 'pf', pin: '1234', finger: 'on' })],
    ['P02', 'Your details', 'From 01', 'Shown, not edited: change them at reception, or the next search stops matching and a duplicate record is born. Date of birth in AD and BS.', () => ({ screen: 'pfdetails', stack: PF })],
    ['P03', 'Language', 'From 01', 'The same tiles as onboarding. Changes straight away; a doctor\'s notes stay in the language they were written in.', () => ({ screen: 'pflang', stack: PF })],
    ['P12', 'Payments', 'From 01 — Payments', 'New (T05/W02): fees paid in the app, each with its receipt reference. The wallet is mocked, so references are made up.', () => ({ screen: 'pfpay', stack: PF })],
    ['P04', 'Notifications', 'From 01, or the gear in the Notification centre', 'Switches take effect at once. Delays and cancellations are always on, so the clinic can reach you. SMS continues either way; never marketing.', () => ({ screen: 'pfnotif', stack: PF })],
  ]],
  ['Profile — lock, clinic and this phone', [
    ['P05', 'Health lock', 'From 01', 'Change PIN asks for the current PIN, then reuses Health\'s new-PIN screens (H22, H23). The fingerprint trade-off is stated again here, where it can be turned off.', () => ({ screen: 'pflock', stack: PF, pin: '1234', finger: 'on' })],
    ['P06', 'Your clinic', 'From 01', "Emergency guidance first: call 102, don't wait for an app. Then reception, address and hours.", () => ({ screen: 'pfclinic', stack: PF })],
    ['P07', 'Switch person', 'From 01', 'Switching asks for that person\'s Clinica PIN. An SMS code proves nothing when the family shares the number.', () => ({ screen: 'pfswitch', stack: PF })],
    ['P11', "Enter Ramesh's PIN", 'From 07 — switching to Ramesh', "Switching person asks for that person's Clinica PIN. The keypad opens their Home — not Health, which a shared Enter PIN screen would have done. Ramesh's demo PIN is 1961.", () => ({ screen: 'pfpin', stack: [...PF, 'pfswitch'], switchTo: 1, pinEntry: '19' })],
  ]],
  ['Profile — sheets and states', [
    ['P08', 'Sign out', 'From 01 — Sign out', 'Reversible with one SMS code, so the confirm is Brand, not red.', () => ({ screen: 'pf', sheet: 'signout' })],
    ['P09', 'Notifications off', 'Replaces 04 when the phone blocks Clinica', 'Every switch disabled but keeping its value, with the reason and the way to fix it. SMS still arrives.', () => ({ screen: 'pfnotif', stack: PF, notifOff: true })],
    ['P10', 'Close account', 'From 01 — Close account', 'Cannot be undone, so red. Honest about what is not deleted: the clinic keeps medical records by law, and the patient can ask for a copy.', () => ({ screen: 'pf', sheet: 'close' })],
  ]],
  ['Notification centre', [
    ['N01', 'Notifications', 'From the bell on Home', "Updates about the patient's care — distinct from Messages, which are conversations. Unread: dot and bold title. Each row opens where it is about — the delay in Care, reports and notes through the Health lock. A lab report names the test and the doctor who reviewed it (W10); only the lock screen keeps them private. The gear opens Profile's notification settings.", () => ({ screen: 'notifs', stack: ['home'] })],
    ['N02', 'Nothing yet', 'A new patient', 'Says what will arrive here, so the empty list reads as waiting rather than broken.', () => ({ screen: 'notifs', stack: ['home'], healthEmpty: true })],
    ['N03', 'Phone notifications off', 'Replaces 01 when the phone blocks Clinica', "Shown at full length — it scrolls. The list keeps updating; the banner says what doesn't happen and how to fix it, and that SMS still arrives.", () => ({ screen: 'notifs', stack: ['home'], notifOff: true })],
  ]],
  ['Add to calendar', [
    ['K02', 'Add event', 'Taps Add to calendar on B05 Confirmed (K01 in Figma)', "The phone's own sheet, not a silent insert and no broad calendar access. Titled 'Appointment — City Hospital': never the doctor or specialty. Alerts match the app's reminders. Also on Appointment detail, Rescheduled, and the Assistant's follow-up — all open the same sheet. Add also saves a real .ics file.", () => ({ ...BOOKED, sheet: 'cal', calFor: 'appt' })],
    ['K03', 'In your calendar', 'Taps Add — when the phone confirms the save', "iOS reports the save; Android's handoff doesn't, so there the button stays 'Add to calendar'. The app never claims what it can't know.", () => ({ ...BOOKED, cal: { appt: true, fu: false } })],
    ['K04', 'Calendar access off', 'Branch from 02 — iOS, access refused', 'Answered in a sheet at the moment of the tap. The visit is still in Care and reminders still come by SMS, so nothing is lost.', () => ({ ...BOOKED, sheet: 'calno', calOff: true })],
    ['K05', 'Time changed', 'After a reschedule', "The calendar copy doesn't update itself, and the app can't edit it. It says so, and offers to add the new time.", () => ({ screen: 'cmoved', stack: ['care', 'cappt'], followup: MOVED_FU, moved: { key: 'fu', from: `${dayLabel(FU_DAY)} slot`, stale: dayLabel(FU_DAY) } })],
    ['K06', 'Cancelled', 'After a cancellation', "A stale event is how someone turns up for a visit that isn't happening. Worded 'if you added it', since Android can't tell us.", () => ({ screen: 'care', followup: null, cancelled: { date: 'Sep 11', cal: true } })],
  ]],
);
