// Clinica — "Section 2": more states across Home, booking, Care, Health, Profile, the Notification centre and Ask,
// and states that apply across the app. Figma: zw3saW6ot26E6gWH20K3ux, section 546:19195.
// Most states live beside the screens they vary (booking.jsx, care.jsx, health.jsx, ask.jsx); this file holds the
// new sheets and standalone screens, and the side-panel entries.
import { Fragment } from 'react';
import { Phone, RECORDS, btn, empty, homeInd, statusBar, toHome } from './app.jsx';
import { T, acts, answer, ask, feedback, say, src, words } from './ask.jsx';
import { BOOKING_STACK, DOCTORS, bookFor, filtMatch, label, plural, rel, row, rows, tag, when } from './booking.jsx';
import { MAPS, NOTIFS, emergency, setting } from './care.jsx';
import { A, ACTIONS, FLOW, NUM, ORDER, OVERLAY, S, SCREENS, after, back, every, fresh, go, later, render, reset } from './core.jsx';
import { errLine, keypad, list, openHealth, pinDots, unlock } from './health.jsx';
import { MED_NOTIFS, ring } from './meds.jsx';
import { clock, filtered, img, now, patients, people, person, results } from './staff.jsx';

export const radioRow = (on, label, act) => <button className="radio-row" role="radio" aria-checked={on} data-act={act}><span className="ring"></span>{label}</button>;
export const sheetOf = (inner, label) => <><div className="scrim" data-act="sheet-close"></div>
  <div className="sheet" role="dialog" aria-modal="true" aria-label={label}><span className="grabber"></span>{inner}</div><div className="sheet-home"></div></>;

Object.assign(OVERLAY, {
  // Only people whose records use this phone number. Choosing closes the sheet — a single choice needs no Done.
  bookfor: () => sheetOf(<>
    <div className="stack4"><p className="h-s">Who is this visit for?</p><p className="body-s">People whose clinic records use this phone number. To add someone, ask at reception.</p></div>
    <div className="stack4" role="radiogroup" aria-label="Booking for"><p className="sec-label lh20" style={{ color: 'var(--text-primary)' }}>Booking for</p>
      {[S.fullName, ...RECORDS.map(r => r.name).filter(n => n !== S.fullName)].map(n =>
        <Fragment key={n}>{radioRow((S.bookFor || S.fullName) === n, n === S.fullName ? `${n} (you)` : n, `book-for:${n}`)}</Fragment>)}</div>
    {btn('Cancel', 'sheet-close', { kind: 'secondary' })}</>, 'Who is this visit for?'),

  // Two filters that matter here. The button states the count before it's applied.
  filter: () => {
    const f = S.fdraft, n = Object.keys(DOCTORS).filter(id => DOCTORS[id].spec === S.specialty && filtMatch(id, f)).length;
    return sheetOf(<>
      <p className="h-s">Filter doctors</p>
      <div className="list" style={{ margin: '0 -16px' }}>{setting('Available today', 'Only doctors with a time left today', f.today, 'fd-today')}</div>
      <div className="stack4" role="radiogroup" aria-label="Doctor"><p className="sec-label lh20" style={{ color: 'var(--text-primary)' }}>Doctor</p>
        <div className="radio-inline">{['Any', 'Female', 'Male'].map(v => <Fragment key={v}>{radioRow(f.sex === v, v, `fd-sex:${v}`)}</Fragment>)}</div></div>
      <div className="stack12">{btn(n ? `Show ${plural(n, 'doctor')}` : 'No doctors match', 'filter-apply', { disabled: !n })}{btn('Clear filters', 'filter-clear', { kind: 'secondary' })}</div></>, 'Filter doctors');
  },

  // The real PIN step, as a sheet over the conversation.
  askpin: () => sheetOf(<>
    <div className="stack4" style={{ textAlign: 'center' }}><p className="h-s">Enter your Clinica PIN</p>
      <p className="body-s">{S.chat.findLast?.(t => t.then)?.then === 'lastvisit' ? 'To see your visit notes.' : 'To see your health records.'}</p></div>
    <div className="entry" style={{ padding: 0 }}>{pinDots(S.pinEntry.length, S.pinErr)}{S.pinErr ? errLine("That PIN didn't match. Try again.") : null}</div>
    <div style={{ margin: '0 -16px' }}>{keypad()}</div>
    {btn('Cancel', 'sheet-close', { kind: 'secondary' })}</>, 'Enter your Clinica PIN'),

  // The phone's own permission prompt. Tapping outside does nothing: the OS alert is modal.
  micperm: () => <><div className="scrim"></div>
    <div className="sys-alert" role="alertdialog" aria-modal="true" aria-labelledby="sa-t">
      <div className="sa-text"><p className="sa-t" id="sa-t">Let Clinica use the microphone?</p><p className="body-s">Clinica listens only while you're asking a question.</p></div>
      <div className="sa-btns"><button data-act="mic-deny">Don't allow</button><button data-act="mic-allow"><b>Allow</b></button></div>
    </div></>,
});

// A notification opened from the lock screen: the most public surface, so no names of tests, medicines or doctors.
export const LOCK_NOTIFS = [
  { t: 'A lab report is ready', b: 'Open Clinica to see it.', when: 'now', act: 'lock-open:report' },
  { t: 'Your 4:30 PM visit is running late', b: "Your slot is kept. We'll message you when it's time.", when: '10m ago', act: 'lock-open:late' },
];
// The Notification centre, with more kinds of update. The follow-up says only that one is due — not what for.
export const MORE_NOTIFS = [
  { g: 'Today', icon: 'lt-check-circle.svg', t: 'Dr. Sharma is back on time', b: 'Your 4:30 PM slot is on time. Check in when you arrive.', when: 'Just now', go: 'ontime' },
  { g: 'Today', icon: 'lt-calendar.svg', t: 'City Hospital cancelled your visit', b: "Dr. Sharma can't see patients that day. Book another time.", when: '1 hour ago', go: 'clinic-cancel' },
  { g: 'Earlier', icon: 'lt-calendar.svg', t: 'A follow-up is due', b: 'Book a time that suits you.', when: 'Yesterday', go: 'fu', read: true },
  { g: 'Earlier', icon: 'lt-document.svg', t: 'Your visit notes are ready', b: 'Open Health to read them.', when: 'Aug 28', go: 'hvisit', read: true },
];

export const blocking = (icon, title, body, actions, after = null) => (
  <div className="screen">
    {statusBar()}
    <div className="body" style={{ justifyContent: 'center', padding: '0 16px 16px', gap: 0 }}>{empty(icon, title, body, actions)}{after}</div>
    {homeInd()}
  </div>);

Object.assign(SCREENS, {
  lockscreen: () => (
    <div className="screen lock">
      <img src={`${A}lt-lock.svg`} width="20" height="20" alt="Locked" />
      <p className="l-clock">9:41</p><p className="l-date">Thursday, 28 August</p>
      <div style={{ height: 32 }}></div>
      {LOCK_NOTIFS.map(n => <a key={n.act} href="#" className="l-card" data-act={n.act}><span className="l-app"><b>CLINICA</b><span>{n.when}</span></span>
        <span className="l-t">{n.t}</span><span className="l-b">{n.b}</span></a>)}
      <div className="l-home"></div>
    </div>),

  // When the app can't be used, a way to reach help stays on screen.
  update: () => blocking('icon-download-secondary-28.svg', 'Update Clinica to keep going', 'This version is out of date. The update is free.',
    <>{btn('Update', 'os:App store', { size: 'l' })}<a className="btn secondary l" href="tel:+97710000000">Call the clinic</a></>,
    <p className="body-s" style={{ padding: '0 16px' }}>In an emergency, call <a className="link" href="tel:102">102</a>.</p>),
  maint: () => blocking('icon-settings-secondary-28.svg', 'Clinica is down for maintenance', 'Scheduled until 6:00 AM. Your records are safe.',
    <><a className="btn primary l" href="tel:+97714412345">Call reception</a><a className="btn secondary l" href="tel:102">Call 102</a></>),
});

Object.assign(ACTIONS, {
  'lock-open': arg => { // opens the app where the update is about
    if (arg === 'report') { S.report = 'hba1c'; return openHealth('hreport'); } // through the Health lock
    S.visitDay = 'late'; toHome();
  },
});

Object.assign(NUM, { lockscreen: () => 'NM03', update: () => 'GX08', maint: () => 'GX09' });
later(() => { // wraps the Notification centre's number from meds.jsx
  const notifsNum = NUM.notifs;
  NUM.notifs = s => s.notifs.some(n => n.go === 'ontime') ? 'NM02' : !s.healthEmpty && s.notifs.length && s.notifs.every(n => n.read) ? 'NM01' : notifsNum(s);
}, ORDER.more);

// ---------- side panel ----------
export let TODAY_HOME; // Figma's Home states show no low stock
later(() => { TODAY_HOME = { screen: 'home', meds: fresh().meds.map(m => ({ ...m, left: m.total })) }; }, ORDER.more);
export const RESCHED = { screen: 'cresched', stack: ['care', 'cappt'], rsKey: 'fu', rsDay: 2 };
export const HU = { unlocked: true };
export const PFS = ['pf'];
FLOW.push(
  ['Home — states', [
    ['SH01', 'Home — nothing booked', 'A patient with nothing booked', "The card keeps its place, so Home doesn't reshuffle when a visit is booked. With nothing new, the bell is quiet: no dot.", () => ({ screen: 'home', careEmpty: true, followup: null, healthEmpty: true })],
    ['SH02', 'Home — running late', 'Visit day — the doctor is delayed', "Warning, as in Care. No estimate: the slot is kept, and the patient will hear when she's ready.", () => ({ ...TODAY_HOME, visitDay: 'late' })],
    ['SH03', 'Home — checked in', 'Visit day — at the clinic', 'Info, as in Care. Says what happens next, not how long it takes.', () => ({ ...TODAY_HOME, visitDay: 'checkedin' })],
    ['SH04', 'Home — visit complete', 'Visit day — after the visit', 'Success, as in Care. Points to the notes, which open through the Health lock.', () => ({ ...TODAY_HOME, visitDay: 'done' })],
  ]],
  ['Book a visit — more', [
    ['SB01', 'Who is this visit for?', 'From Review booking — tapping Booking for', 'Only people whose records use this phone number; adding someone happens at reception. Choosing a person closes the sheet — a single choice needs no Done button.', () => ({ screen: 'review', stack: [...BOOKING_STACK], sheet: 'bookfor' })],
    ['SB02', 'Review booking — for Ramesh', 'Chooses Ramesh', "Booking for Ramesh needs no PIN of his: a daughter booking her father's visit acts for him, she doesn't read his records.", () => ({ screen: 'review', stack: [...BOOKING_STACK], bookFor: 'Ramesh Sharma' })],
    ['SB03', 'Confirmed — for Ramesh', 'Confirms', 'Names who the visit is for, and how to see his appointments: switch to him in Profile, which asks for his PIN.', () => ({ screen: 'confirmed', booked: { doc: 'ps', day: 0, time: '4:30 PM', for: 'Ramesh Sharma' }, taken: { 'ps|0': ['4:30 PM'] } })],
    ['SB04', "Couldn't send your booking", 'Branch from Review booking — no connection', "The request never left the phone, so it's certain nothing was booked. Retrying is safe, and nothing has to be typed again. Warning, not Error: the booking itself is fine.", () => ({ screen: 'failed', failKind: 'offline', offline: true, stack: [...BOOKING_STACK, 'review'], reason: 'Fever for three days, with a headache' })],
    ['SB05', "Couldn't confirm your booking", 'Branch from Review booking — no reply', "The request went out but no answer came back. Retrying straight away risks a double booking, so checking comes first. (Here it did go through: Care shows it.)", () => ({ screen: 'failed', failKind: 'noreply', stack: [...BOOKING_STACK, 'review'], reason: 'Fever for three days, with a headache' })],
    ['SB06', 'Search — a condition', 'From Find doctor — searching', 'A condition search explains itself: which specialty treats it, then those doctors. The rows still open their profiles. Try “fever”, “rash” or “chest pain”.', () => ({ screen: 'finddoctor', stack: ['home'], query: 'fever' })],
    ['SB07', 'Search — no results', 'Branch — nothing matches', 'City Hospital has no eye doctor. The empty state says so and gives the real next step: ask reception about a referral.', () => ({ screen: 'finddoctor', stack: ['home'], query: 'eye' })],
    ['SB08', 'Specialty — Cardiology', 'From a specialty tile', "Filtered to Cardiology. This specialist's profile isn't designed yet, so the row doesn't open.", () => ({ screen: 'finddoctor', stack: ['home'], specialty: 'Cardiology' })],
    ['SB09', 'Specialty — Dermatology', 'From a specialty tile', "Filtered to Dermatology. This specialist's profile isn't designed yet, so the row doesn't open.", () => ({ screen: 'finddoctor', stack: ['home'], specialty: 'Dermatology' })],
    ['SB10', 'Specialty — Paediatrics', 'From a specialty tile', "Filtered to Paediatrics. This specialist's profile isn't designed yet, so the row doesn't open.", () => ({ screen: 'finddoctor', stack: ['home'], specialty: 'Paediatrics' })],
    ['SB11', 'Specialty — Gynaecology', 'From a specialty tile', "Filtered to Gynaecology. This specialist's profile isn't designed yet, so the row doesn't open.", () => ({ screen: 'finddoctor', stack: ['home'], specialty: 'Gynaecology' })],
    ['SB12', 'Filter doctors', 'From the filter icon on Find doctor', "Two filters that matter here: available today, and the doctor's sex — which matters to many patients, especially for gynaecology. The button states the count before it's applied.", () => ({ screen: 'finddoctor', stack: ['home'], sheet: 'filter', fdraft: { today: true, sex: 'Female' } })],
    ['SB13', 'Filtered results', 'Shows 1 doctor', "Says which filters are on, with a way to clear them — a filtered list that doesn't say so looks like the clinic only has one doctor.", () => ({ screen: 'finddoctor', stack: ['home'], filt: { today: true, sex: 'Female' } })],
    ['SB14', 'Doctor profile — saved', 'From the heart on Doctor profile', 'Saved shows as a filled heart, so it reads by shape. Not red: red is kept for errors and destructive actions.', () => ({ screen: 'doctor', stack: ['home', 'finddoctor'], fav: { ps: true } })],
    ['SB15', 'Find doctor — saved doctors', 'Back on Find doctor', "Saved doctors sit at the top of Find doctor. 'Doctors you've seen', filled from visit history, would belong alongside — it needs no action at all.", () => ({ screen: 'finddoctor', stack: ['home'], fav: { ps: true } })],
  ]],
  ['Care — more states', [
    ['SC01', 'Your turn', 'From Checked in — the doctor is ready', "Success: the one moment that needs the patient to move. Says where to go, and what to do if they can't go yet.", () => ({ screen: 'cday', stack: ['care'], visitDay: 'turn' })],
    ['SC02', 'With the doctor', 'From Your turn', 'Says where the notes will appear, and the one thing left to do: pay at reception on the way out. (Figma pairs an Info tag with an Info card, which the Content/Notice rule warns against — kept as designed.)', () => ({ screen: 'cday', stack: ['care'], visitDay: 'with' })],
    ['SC03', 'Reschedule — time taken', 'Branch from Reschedule — the new time was taken', "The taken slot turns disabled, and the button waits for a new choice. The first thing it says after 'what happened' is that the current visit is still booked.", () => ({ ...RESCHED, rsErr: { t: '11:00 AM', wd: 'Fri' }, rsTaken: ['fu|2|11:00 AM'] })],
    ['SC04', 'Reschedule — no times left', 'Branch from Reschedule — nothing free', 'The same reassurance, then the realistic options: keep the visit, or call about next week.', () => ({ ...RESCHED, rsNone: true })],
    ['SC05', 'Delay cleared', 'From Running late — the delay is over', "The card turns Success, and 'Reschedule instead' goes, since it no longer applies.", () => ({ screen: 'cday', stack: ['care'], visitDay: 'ontime' })],
    ['SC06', 'Cancelled by the clinic', 'The clinic cancelled', "Error, because it was done to the patient — a patient's own cancellation stays Neutral. Says why, apologises, and offers another time.", () => ({ screen: 'care', followup: null, cancelled: { date: 'Sep 11', byClinic: true, cal: false } })],
    ['SC07', 'Cancel — late', 'From Cancel — a visit within 2 hours', "Nothing is prepaid, so there's nothing to charge. The sheet encourages cancelling over not turning up, because that frees the time for someone else.", () => ({ screen: 'cappt', stack: ['care'], sheet: 'cancel', cancelSoon: true })],
  ]],
  ['Health — more states', [
    ['HM01', 'Locked — opening a report', "From a 'lab report is ready' notification", "Says why it's being unlocked, so the PIN request makes sense in context.", () => ({ screen: 'hlocked', lockWhy: 'report', afterUnlock: 'hreport', report: 'hba1c', pin: '1234' })],
    ['HM02', 'Enter PIN — to open a report', 'Unlock', 'After the PIN, the patient lands on that report — not the Health hub. (Demo PIN 1234.)', () => ({ screen: 'pin', stack: ['hlocked'], afterUnlock: 'hreport', report: 'hba1c', pin: '1234', pinEntry: '12' })],
    ['HM03', 'Report — needs follow-up', 'After the PIN', "The doctor's own words say what's wrong; the app adds nothing clinical. Book follow-up sits right under them.", () => ({ screen: 'hreport', stack: ['health', 'hlabs'], report: 'hba1c', ...HU })],
    ['HM04', 'Lab reports — needs follow-up', 'Lab reports', 'The report is tagged Needs follow-up in Warning, so it stands out in the list.', () => ({ screen: 'hlabs', stack: ['health'], labs: ['hba1c', 'thyroid'], ...HU })],
    ['HM05', 'Report file', 'From the report card', "The lab's own document, with a download that uses the phone's file prompt (here, a real PDF).", () => ({ screen: 'hfile', stack: ['health', 'hlabs', 'hreport'], report: 'hba1c', ...HU })],
    ['HM06', 'Locked — you left the app', 'Returning to Health after leaving Clinica', 'States why it locked: leaving the app, or 5 minutes without use. A second PIN request is expected, not an error. (Switch browser tabs while Health is open to see it.)', () => ({ screen: 'hlocked', lockWhy: 'left', pin: '1234' })],
    ['HM07', 'Fingerprints changed', 'A new fingerprint was added to the phone', 'Fingerprint unlock is off until the PIN is entered — then the opt-in asks again, since the risk has changed.', () => ({ screen: 'pin', stack: ['hlocked'], pin: '1234', finger: 'on', fingerChanged: true, pinEntry: '12' })],
    ['HM08', 'Follow-ups', 'From the Follow-ups row on Health', 'Each says which visit asked for it, and leads to booking.', () => ({ screen: 'hfollow', stack: ['health'], followup: null, ...HU })],
    ['HM09', 'Visit detail — Aug 12', 'From Visit history', 'An earlier visit: the doctor\'s words, the medicine, and no follow-up — so no booking button.', () => ({ screen: 'hvisit', stack: ['health', 'hvisits'], visit: 'aug12', ...HU })],
    ['HM10', 'Prescription — finished', 'From Prescriptions', "A finished course. No Show to pharmacist — it shouldn't be handed over at a counter. (Figma's avatar reads PS for Dr. Shrestha; shown as RS.)", () => ({ screen: 'hrxd', stack: ['health', 'hrx'], rx: 'aug12', ...HU })],
    ['HM11', 'No prescriptions yet', 'A patient with none yet', 'Says what will appear here, and when.', () => ({ screen: 'hrx', stack: ['health'], rxNone: true, ...HU })],
    ['HM12', 'No lab reports yet', 'A patient with none yet', 'Repeats the rule: reports appear once the doctor has looked at them.', () => ({ screen: 'hlabs', stack: ['health'], labs: [], ...HU })],
    ['HM13', 'Health lock — no fingerprint sensor', 'On a phone without a sensor', 'Fingerprint shows disabled with the reason. First-time setup skips the fingerprint step. The re-lock rule is stated here too.', () => ({ screen: 'pflock', stack: PFS, pin: '1234', noSensor: true })],
  ]],
  ['Profile — more', [
    ['PM01', 'Current PIN', 'From Health lock — Change PIN', "The current PIN first, so someone holding the phone can't change it. Forgot your PIN leads to the reset sheet. (Demo PIN 1234.)", () => ({ screen: 'pin', stack: [...PFS, 'pflock'], afterUnlock: 'pinnew', pin: '1234', pinEntry: '12' })],
    ['PM02', 'Choose a new PIN', 'After the current PIN', 'Says the old PIN stops working, and nothing in the records changes. (The same screen as Health 22.)', () => ({ screen: 'pinnew', stack: [...PFS, 'pflock'], afterUnlock: 'pflock', pin: '1234', pinEntry: '12' })],
    ['PM03', 'Confirm new PIN', 'After 02', 'Then back to Health lock. (The same screen as Health 23.)', () => ({ screen: 'pinnewconfirm', stack: [...PFS, 'pflock', 'pinnew'], afterUnlock: 'pflock', pin: '1234', pinFirst: '2468', pinEntry: '24' })],
    ['PM04', 'Health lock — PIN changed', 'After 03', 'A Success note confirms it.', () => ({ screen: 'pflock', stack: PFS, pin: '2468', finger: 'on', pinChanged: true })],
    ['PM05', 'Enter PIN — to change number', 'From Your details — Mobile number', 'The number is how someone signs in, so changing it needs the PIN: on a shared phone, anyone holding it could otherwise take over the account.', () => ({ screen: 'pin', stack: [...PFS, 'pfdetails'], afterUnlock: 'pfphone', codeFor: 'newphone', pin: '1234', pinEntry: '12' })],
    ['PM06', 'New mobile number', 'After the PIN', 'The records stay the same — only the sign-in number changes.', () => ({ screen: 'phone', stack: [...PFS, 'pfdetails'], codeFor: 'newphone', newPhone: '' })],
    ['PM07', 'Verify new number', 'Send code', 'The code goes to the new number, proving it belongs to the patient. (Code 123456.)', () => ({ screen: 'code', stack: [...PFS, 'pfdetails', 'phone'], codeFor: 'newphone', newPhone: '9761234208', code: '429' })],
    ['PM08', 'Your details — number changed', 'After verifying', "The new number shows at once, and the old number is told by SMS, so a change nobody asked for doesn't go unnoticed.", () => ({ screen: 'pfdetails', stack: PFS, phone: '9761234208', phoneChanged: true })],
    ['PM09', 'Account closed', 'From Close account', "Says what's deleted — the login and PIN — and what isn't: the clinic keeps the medical records by law.", () => ({ screen: 'closed' })],
    ['PM10', 'Health lock — fingerprint off', 'Tapping the fingerprint switch', 'Off takes effect at once: it\'s safer and reversible, so no confirmation. Turning it on goes through the opt-in, which restates the trade-off.', () => ({ screen: 'pflock', stack: PFS, pin: '1234', finger: 'off' })],
    ['PM11', 'Add someone', 'From Switch person — Someone else', 'Sends a code to this phone\'s number to find the other records on it, then the record chooser. Someone with their own phone uses their own number.', () => ({ screen: 'pfadd', stack: [...PFS, 'pfswitch'] })],
    ['PM12', 'Help', 'From Profile — Help', "Emergency guidance stays first: it's what someone looking for help most needs to find.", () => ({ screen: 'pfhelp', stack: PFS })],
    ['PM13', 'About Clinica', 'From Profile — About Clinica', "The version, who it's made for, and the privacy policy.", () => ({ screen: 'pfabout', stack: PFS })],
  ]],
  ['Notification centre — more', [
    ['NM01', 'All read', 'From Mark all as read', "Every update in its read state: no dot, regular weight. Mark all as read hides — there's nothing left to mark.", () => ({ screen: 'notifs', stack: ['home'], notifs: NOTIFS.map(n => ({ ...n, read: true })) })],
    ['NM02', 'More kinds of update', 'More kinds of update', 'Delay cleared, a clinic cancellation and a follow-up due, each opening its own screen. The follow-up says only that one is due — not what for.', () => ({ screen: 'notifs', stack: ['home'], notifs: MORE_NOTIFS.map(n => ({ ...n })) })],
    ['NM03', 'Lock screen', 'Device stand-in — the phone\'s lock screen', "The most public surface there is, so the strictest rule: no test names, no medicines, no doctors, no specialties. 'Your 4:30 PM visit is running late', not 'Dr. Sharma is running late'.", () => ({ screen: 'lockscreen' })],
  ]],
  ['Ask — more', [
    ['AM01', 'Unlock with PIN', 'From Unlock with PIN in a conversation', 'The real PIN step, as a sheet over the conversation, so the patient stays in context. The right PIN opens the answer. (Demo PIN 1234.)', () => ({ screen: 'ask', askSeen: true, pin: '1234', followup: null, sheet: 'askpin', chat: [T('Summarise my last visit', 'lock', { then: 'lastvisit' })] })],
    ['AM02', 'Which visit?', 'An ambiguous question', 'When a question could mean two records, Ask asks rather than guesses — each option leads to its answer.', () => ({ screen: 'ask', askSeen: true, askUnlocked: true, chat: [T('What did the doctor say in August?', 'which')] })],
    ['AM03', 'Microphone permission', 'The first tap on the microphone', "The phone's own prompt, with the reason in one line.", () => ({ screen: 'ask', askSeen: true, sheet: 'micperm' })],
    ['AM04', 'Microphone refused', "After Don't allow", 'Voice is off, how to turn it on, and that typing still works.', () => ({ screen: 'ask', askSeen: true, micPerm: 'denied' })],
    ['AM05', "Didn't catch that", 'Voice not recognised', 'An honest retry — closer to the phone — or type instead. (Stopping the mic before it hears anything shows this.)', () => ({ screen: 'ask', askSeen: true, micPerm: 'granted', chat: [T(null, 'nocatch')] })],
    ['AM06', 'Answer feedback', 'Under an answer', 'Asks about the answer, not the doctor\'s words. Only the rating is sent — never the conversation, which may hold health details.', () => ({ screen: 'ask', askSeen: true, askUnlocked: true, followup: null, chat: [T('Summarise my last visit', 'lastvisit', { fb: undefined })] })],
    ['AM07', 'Not what you needed', 'After No', 'Offers something useful: ask another way, or call the clinic.', () => ({ screen: 'ask', askSeen: true, askUnlocked: true, followup: null, chat: [T('Summarise my last visit', 'lastvisit', { fb: 'no' }), T(null, 'sorry')] })],
    ['AM08', 'Thanks for the feedback', 'After Yes', 'A short thanks, nothing more.', () => ({ screen: 'ask', askSeen: true, askUnlocked: true, followup: null, chat: [T('Summarise my last visit', 'lastvisit', { fb: 'yes' })] })],
  ]],
  ['Across the app', [
    ['GX01', 'Home — offline', 'No connection', 'A slim line at the top, and the saved content stays readable — a full-screen error would hide what the patient can still use. Booking needs a connection, and says so if tried. (Toggle “Phone is offline” in Demo inputs.)', () => ({ screen: 'home', offline: true })],
    ['GX02', 'Care — offline', 'No connection', 'Appointments as last saved. Rescheduling or cancelling needs a connection.', () => ({ screen: 'care', offline: true })],
    ['GX03', 'Health — offline', 'No connection', 'Records as last saved, still behind the Clinica PIN.', () => ({ screen: 'health', offline: true, ...HU })],
    ['GX04', 'Home — first load', 'Opening the app', 'Skeletons shaped like Home\'s real layout, so the wait feels shorter and nothing jumps when the content arrives.', () => ({ screen: 'home', loading: 'first' })],
    ['GX05', 'Care — refreshing', 'Pulling to refresh', 'A spinner row above what\'s already there — the content stays readable while it updates. (Here: tap the Care tab again.)', () => ({ screen: 'care', refreshing: true })],
    ['GX06', 'Home — slow connection', 'Still loading after about 10 seconds', 'Says so in words, with a way to try again. Never an estimate of how long.', () => ({ screen: 'home', loading: 'slow' })],
    ['GX07', 'Something went wrong', 'A load failed', "Says it's not the patient's fault, and that nothing has changed — the two worries after an error.", () => ({ screen: 'care', careErr: true })],
    ['GX08', 'Update required', 'An out-of-date version', "When the app can't be used, a way to reach help stays on screen: the clinic, and 102. 'Update' opens the store.", () => ({ screen: 'update' })],
    ['GX09', 'Maintenance', 'Scheduled maintenance', 'States the window, since it\'s scheduled rather than guessed. Calling reception and 102 stay one tap away.', () => ({ screen: 'maint' })],
  ]],
);

// ---------- System prompts (prototype overlays, section 549:19196) ----------
// The phone's own action sheet before a call, the maps hand-off, settings, a saved file or the calendar.
export function openSys(p) { S.sys = p; S.sheet = 'sys'; render(); }
export const CLINIC_TEL = 'tel:+97714412345';
export const SYS_OS = {
  'Phone settings': () => ({ title: "Open your phone's settings for Clinica?", sub: 'You can turn on notifications or calendar access there.', confirm: 'Open Settings' }),
  Calendar: () => ({ title: `Open your calendar at ${S.cancelled?.day || 'Thu, Sep 11'}?`, sub: 'You can delete the old visit there.', confirm: 'Open Calendar' }),
};
export function interceptLink(e) {
  const ok = e.target.closest('.as a.as-btn');
  if (ok) { // the sheet's own confirm goes through to the phone, then the sheet closes
    if (ok.getAttribute('href') === '#') e.preventDefault();
    setTimeout(() => { S.sheet = null; render(); });
    return true;
  }
  const a = e.target.closest('a[href^="tel:"], a[href^="https://www.google.com/maps"]');
  if (!a) return false;
  e.preventDefault();
  const h = a.getAttribute('href');
  openSys(h === 'tel:102' ? { title: 'Ambulance', sub: '102', confirm: 'Call 102', href: 'tel:102' }
    : h.startsWith('tel:') ? { title: 'City Hospital reception', sub: '+977 1-4412345', confirm: 'Call +977 1-4412345', href: CLINIC_TEL }
    : { title: 'Open Maps for directions to', sub: a.dataset.where || 'City Hospital, Maharajgunj, Kathmandu', confirm: 'Open Maps', href: h, blank: true });
  return true;
}
OVERLAY.sys = () => {
  const p = S.sys, link = p.href ? { href: p.href, ...(p.blank || !p.href.startsWith('tel:') ? { target: '_blank', rel: 'noopener' } : {}) } : { href: '#' };
  return <><div className="scrim" data-act="sheet-close"></div>
  <div className="as" role="dialog" aria-modal="true" aria-label={p.title}>
    <div className="as-group"><div className="as-msg"><p className="as-t">{p.title}</p><p>{p.sub}</p></div>
      <a className="as-btn" {...link}>{p.confirm}</a></div>
    <button className="as-btn as-cancel" data-act="sheet-close">Cancel</button>
  </div></>;
};
export const SYSP = (title, sub, confirm) => () => ({ screen: 'home', sheet: 'sys', sys: { title, sub, confirm, href: '#' } });
FLOW.push(
  ['Book a visit — other doctors', [
    ['OD11', 'Doctor profile — Ramesh Shrestha', 'From Find doctor', "From Find doctor. Available today; the selected day and time are this doctor's.", () => ({ screen: 'doctor', stack: ['home', 'finddoctor'], doc: 'rs', day: 0, time: '11:30 AM' })],
    ['OD12', 'Review booking — Ramesh Shrestha', 'Book 11:30 AM today', 'Same review as the main path, with this doctor and time.', () => ({ screen: 'review', stack: ['home', 'finddoctor', 'doctor'], doc: 'rs', day: 0, time: '11:30 AM' })],
    ['OD13', 'Confirmed — Ramesh Shrestha', 'Confirm booking', "Done goes to Home: the notifications prompt and the calendar sheet are written about Dr. Priya Sharma's visit, and are tested on her path.", () => ({ screen: 'confirmed', doc: 'rs', booked: { doc: 'rs', day: 0, time: '11:30 AM', for: 'Anisha Sharma' }, appt: { doc: 'rs', day: 0, time: '11:30 AM' } })],
    ['OD14', 'Doctor profile — Anita Joshi', 'From Find doctor', "From Find doctor. Next slot tomorrow; the selected day and time are this doctor's.", () => ({ screen: 'doctor', stack: ['home', 'finddoctor'], doc: 'aj', day: 1, time: '9:00 AM' })],
    ['OD15', 'Review booking — Anita Joshi', 'Book tomorrow, 9:00 AM', 'Same review as the main path, with this doctor and time.', () => ({ screen: 'review', stack: ['home', 'finddoctor', 'doctor'], doc: 'aj', day: 1, time: '9:00 AM' })],
    ['OD16', 'Confirmed — Anita Joshi', 'Confirm booking', "Done goes to Home: the notifications prompt and the calendar sheet are written about Dr. Priya Sharma's visit, and are tested on her path.", () => ({ screen: 'confirmed', doc: 'aj', booked: { doc: 'aj', day: 1, time: '9:00 AM', for: 'Anisha Sharma' }, appt: { doc: 'aj', day: 1, time: '9:00 AM' } })],
  ]],
  ['System prompts (prototype overlays)', [
    ['SY1', 'Call City Hospital', 'Any “Call the clinic” or reception button', "The phone's own call prompt: every clinic number is City Hospital reception.", () => ({ screen: 'pfclinic', stack: ['pf'], sheet: 'sys', sys: { title: 'City Hospital reception', sub: '+977 1-4412345', confirm: 'Call +977 1-4412345', href: CLINIC_TEL } })],
    ['SY2', 'Call 102', 'Any “Call 102” button', "The phone's own call prompt for the ambulance number.", () => ({ screen: 'pfclinic', stack: ['pf'], sheet: 'sys', sys: { title: 'Ambulance', sub: '102', confirm: 'Call 102', href: 'tel:102' } })],
    ['SY3', 'Directions', 'Get directions', 'Hands off to Maps with the place filled in.', () => ({ screen: 'cday', stack: ['care'], sheet: 'sys', sys: { title: 'Open Maps for directions to', sub: 'OPD 2, City Hospital, Maharajgunj', confirm: 'Open Maps', href: MAPS, blank: true } })],
    ['SY4', 'Phone settings', 'Open phone settings / Turn them on', 'Notifications and calendar access are the phone\'s to change, so it opens its settings.', () => ({ screen: 'pfnotif', stack: ['pf'], notifOff: true, sheet: 'sys', sys: SYS_OS['Phone settings']() })],
    ['SY5', 'Download', 'Download report', "Saved to the phone's Files, with a way to open it. (Here the PDF is real.)", () => ({ screen: 'hreport', stack: ['health', 'hlabs'], unlocked: true, sheet: 'sys', sys: { title: 'Thyroid panel report.pdf', sub: "Saved to your phone's Files.", confirm: 'Open file', href: '#' } })],
    ['SY6', 'Open calendar', 'Open calendar, after a cancellation', 'Opens the calendar at the old visit, so it can be deleted.', () => ({ screen: 'care', followup: null, cancelled: { date: 'Sep 11', day: 'Thu, Sep 11', cal: true }, sheet: 'sys', sys: SYS_OS.Calendar() })],
  ]],
);
export const SYS_NUM = p => ({ 'City Hospital reception': 'SY1', Ambulance: 'SY2', 'Open Maps for directions to': 'SY3' })[p.title]
  || ({ 'Open Settings': 'SY4', 'Open file': 'SY5', 'Open Calendar': 'SY6' })[p.confirm];
later(() => { const n = { ...NUM }; // system prompts light their own row
  for (const k of Object.keys(n)) NUM[k] = s => (s.sheet === 'sys' && SYS_NUM(s.sys)) || n[k](s);
  NUM.doctor = (f => s => s.doc === 'rs' ? 'OD11' : s.doc === 'aj' ? 'OD14' : f(s))(NUM.doctor);
  NUM.review = (f => s => s.sheet ? f(s) : s.doc === 'rs' ? 'OD12' : s.doc === 'aj' ? 'OD15' : f(s))(NUM.review);
  NUM.confirmed = (f => s => s.sheet ? f(s) : (s.booked || s.appt).doc === 'rs' ? 'OD13' : (s.booked || s.appt).doc === 'aj' ? 'OD16' : f(s))(NUM.confirmed); }, ORDER.more);

// ---------- Demo inputs: situations the patient can't tap their way into ----------
export function openAs(v) { // reopen the app, keeping the patient's data
  const [screen, extra] = { signedin: ['returning'], slow: ['home', { loading: 'slow' }], session: ['session'], update: ['update'], maint: ['maint'], lock: ['lockscreen'], push: ['mtpush'] }[v];
  Object.assign(S, { stack: [], sheet: null, picker: null, bio: null, unlocked: false, loading: null, screen }, extra || {});
  render();
}
export function notifSet(v) { S.notifs = ({ visits: NOTIFS, more: MORE_NOTIFS, meds: MED_NOTIFS })[v].map(n => ({ ...n })); render(); }
