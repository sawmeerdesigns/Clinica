import { Fragment } from 'react';
import { flushSync } from 'react-dom';

// Clinica — shared state and registries. Every module plugs its screens, actions and panel entries in here.
// No imports from the feature modules, so it always evaluates first.

export const A = 'assets/';

export const SCREENS = {}; // screen → () => JSX
export const mount = {}; // screen → behaviour after a full render (timers, focus, scroll)
export const ACTIONS = {}; // data-act="name:arg" → ACTIONS.name(arg, el)
export const NUM = {}; // screen → panel number, for screens added by the feature modules
export const OVERLAY = {}; // S.sheet → sheet markup drawn over the current screen
export const FLOW = []; // review panel: every Figma screen and its caption

// The old <script> order, which decides who wins when two modules set the same thing.
export const ORDER = { app: 0, booking: 1, health: 2, ask: 3, care: 4, meds: 5, more: 6, doctor: 7, desk: 8, staff: 9 };
const byOrder = list => list.sort((a, b) => a.n - b.n).map(x => x.f);

// Each module adds its own slice of the starting state: extraState(() => ({ ... }), ORDER.care).
const EXTRA = [];
export const extraState = (f, n) => EXTRA.push({ f, n });
export const fresh = () => Object.assign({
  screen: 'splash', stack: [], signedIn: false,
  lang: 'en',
  phone: '', phoneErr: false,
  code: '', codeState: 'typing', tries: 3, resend: 42, lock: 14 * 60 + 52,
  name: '', nameErr: false, dob: '', dobErr: '', sex: '', sexErr: false,
  picker: null, pickerCal: 'AD', bsHint: null,
  endTitle: '', endBody: '',
  // Booking (booking.jsx)
  first: 'Anisha', fullName: 'Anisha Sharma',
  doc: 'ps', day: 0, time: '4:30 PM', reason: '', reasonSaved: false, taken: {}, fav: {},
  specialty: 'General medicine', query: '',
  homeState: 'default', appt: { doc: 'ps', day: 0, time: '4:30 PM', reason: 'Fever for three days, with a headache' }, // V14: her reason, as the doctor's queue has it
  notif: 'ask', notNow: 0,
  loading: null, refreshing: false, careErr: false, micPerm: null,
  bookFor: null, booked: null, failKind: 'taken', failNext: '', filt: { today: false, sex: 'Any' }, fdraft: null,
  payWith: null, payFor: null, payments: [], bookedOnce: false, fuOf: null, pronouns: '', // Phase 3: payment (W02), retry (W14), follow-up (W11), pronouns (V16)
}, ...byOrder(EXTRA).map(f => f()));

export let S = {};
export const reset = (over = {}) => { S = Object.assign(fresh(), over); }; // a new day, keeping nothing

// render(): a full re-render — clears timers and re-runs the screen's mount hook, as the old innerHTML render did.
// paint(): re-render only, for what used to be a direct DOM patch (typing, a countdown tick, a wheel scroll).
const subs = new Set();
let remount = true;
export const subscribe = f => { subs.add(f); return () => subs.delete(f); };
export const paint = () => flushSync(() => subs.forEach(f => f())); // synchronous, like the old innerHTML: code after it can read the new DOM
export const render = () => { clearTimers(); remount = true; paint(); }; // timers set right after render() survive, as before
export const takeRemount = () => { const r = remount; remount = false; return r; };

let timers = [];
export const every = (fn, ms) => timers.push(setInterval(fn, ms));
export const after = (fn, ms) => timers.push(setTimeout(fn, ms));
let leave = null;
export const onLeave = fn => { leave = fn; }; // e.g. release a screen wake lock
export const clearTimers = () => {
  leave?.(); leave = null;
  timers.forEach(t => { clearInterval(t); clearTimeout(t); });
  timers = [];
};

// Extra listeners on the phone, run after the data-act dispatch (e.g. the staff app closes its menus).
export const phoneListeners = { click: [], keydown: [] };
export const onPhone = (type, fn) => phoneListeners[type].push(fn);
export const $phone = () => document.getElementById('phone');

// Setup that reads or wraps another module's entries waits until every module has loaded: later(() => { ... }, ORDER.more).
// main.jsx runs these in the old script order, before the first render.
const LATER = [];
export const later = (f, n) => LATER.push({ f, n });
export const runLater = () => byOrder(LATER.splice(0)).forEach(f => f());

// R10: when the screen last changed, so a double-tap's second tap can be ignored (booking.jsx confirm).
export let shownAt = 0;
export function go(screen, { replace = false } = {}) {
  if (S.screen !== screen) shownAt = Date.now();
  if (!replace && S.screen !== screen) S.stack.push(S.screen);
  S.screen = screen;
  S.picker = null;
  render();
}
export function back() {
  const prev = S.stack.pop();
  if (!prev) return;
  S.screen = prev; S.picker = null;
  render();
}

// Joins a list with the hairline separator lists use between rows.
export const sepJoin = items => items.map((x, i) => <Fragment key={i}>{i > 0 && <div className="sep" aria-hidden="true" />}{x}</Fragment>);

// One toast for success messages, with an optional action (e.g. Undo). app.jsx draws it in a role="status" live region.
// It outlives render(), so its timer is its own. F24/R20/T11/W07/V09; Phase 5 reuses it for every success state.
let toastT;
export const toast = (msg, action = null, ms = 5000) => { // action: [label, 'data-act'] or null
  clearTimeout(toastT); S.toast = { msg, action };
  toastT = setTimeout(() => { S.toast = null; paint(); }, ms);
};
export const toastClear = () => { clearTimeout(toastT); S.toast = null; };

// F15/R12: Nepali for the patient app's own words: titles, tabs, labels, buttons and short lines. Names, IDs, amounts and digits stay as they are.
// Phase 8: everything else follows too — clinical text written for patients (report explanations, medicine instructions, what the doctor
// said) and the legal pages. What someone typed (a doctor's own note, a patient's reason) and medicine names stay as written.
// Each module adds its own lines with Object.assign(NE, { ... }), next to the screens that use them.
// Shared helpers (btn, heading, listItem, row, notice, setting, bar…) pass their text through tr(), so a string here changes everywhere
// it's used. Only the patient app translates; the care team's apps share these helpers but stay English.
export const NE = {
  'Choose how to pay to confirm.': 'पुष्टि गर्न कसरी तिर्ने छान्नुहोस्।', 'For example: fever for three days': 'जस्तै: तीन दिनदेखि ज्वरो', // Figma sync: B04
  'Find doctor': 'डाक्टर खोज्नुहोस्', 'Doctor, specialty or condition': 'डाक्टर, विशेषज्ञता वा समस्या', 'Search doctors': 'डाक्टर खोज्नुहोस्', 'Specialty': 'विशेषज्ञता',
  'General medicine': 'सामान्य चिकित्सा', Cardiology: 'मुटु रोग', Dermatology: 'छाला रोग', Paediatrics: 'बाल रोग', Gynaecology: 'स्त्री रोग',
  'Available today': 'आज उपलब्ध', 'Choose a day': 'दिन छान्नुहोस्', 'Choose a time': 'समय छान्नुहोस्', 'Closed on Saturdays': 'शनिबार बन्द',
  Book: 'बुक गर्नुहोस्', 'Review booking': 'बुकिङ जाँच्नुहोस्', 'Booking for': 'कसका लागि', Fee: 'शुल्क', Confirmation: 'पुष्टि', Doctor: 'डाक्टर',
  "How you'll pay": 'कसरी तिर्ने', 'Pay at reception': 'रिसेप्सनमा तिर्ने', 'Choose how to pay': 'कसरी तिर्ने छान्नुहोस्', 'Confirm booking': 'बुकिङ पक्का गर्नुहोस्',
  'Reason for visit (optional)': 'आउनुको कारण (ऐच्छिक)', 'Appointment booked': 'अपोइन्टमेन्ट बुक भयो', Done: 'सकियो', 'Add to calendar': 'क्यालेन्डरमा थप्नुहोस्',
  'Choose another time': 'अर्को समय छान्नुहोस्', 'Try again': 'फेरि प्रयास गर्नुहोस्', 'Check my appointments': 'मेरा अपोइन्टमेन्ट हेर्नुहोस्',
  'Consultation fee': 'परामर्श शुल्क', 'You have not been charged.': 'तपाईंबाट कुनै पैसा काटिएको छैन।', 'Pay now': 'अहिले तिर्नुहोस्', 'Follow-up': 'फलो-अप',
  // Home and the tab bar
  Home: 'गृहपृष्ठ', Care: 'हेरचाह', Health: 'स्वास्थ्य', Ask: 'सोध्नुहोस्', Profile: 'प्रोफाइल', 'Good morning,': 'शुभ प्रभात,',
  'Your next appointment': 'तपाईंको अर्को अपोइन्टमेन्ट', 'Nothing booked yet': 'अहिलेसम्म केही बुक गरिएको छैन', 'When you book a visit, it shows here.': 'भेट बुक गरेपछि यहाँ देखिन्छ।',
  'Book a visit': 'भेट बुक गर्नुहोस्', 'Lab reports': 'ल्याब रिपोर्टहरू', Prescriptions: 'प्रेस्क्रिप्सनहरू', "Today's visit": 'आजको भेट', Recent: 'हालैका',
  'Lab report ready': 'ल्याब रिपोर्ट तयार छ', 'Open Health to see it': 'हेर्न स्वास्थ्य खोल्नुहोस्', 'Prescription updated': 'प्रेस्क्रिप्सन अद्यावधिक भयो', 'Follow-up due': 'फलो-अपको समय भयो',
  "You're checked in": 'तपाईं चेक इन हुनुभयो', 'Visit complete': 'भेट सकियो', 'Appointments and medicines': 'अपोइन्टमेन्ट र औषधिहरू',
  'Locked on this shared phone': 'साझा फोनमा लक गरिएको', 'Enter your Clinica PIN to see them': 'हेर्न आफ्नो Clinica PIN हाल्नुहोस्',
  // Care
  Appointment: 'अपोइन्टमेन्ट', Today: 'आज', 'Coming up': 'आउँदै गरेका', Earlier: 'पहिलेका', 'Past visits': 'पुराना भेटहरू',
  "Kept in Health with your doctor's notes": 'डाक्टरको टिप्पणीसहित स्वास्थ्यमा राखिएको', 'Your booking': 'तपाईंको बुकिङ', 'Reason for visit': 'आउनुको कारण', 'None given': 'दिइएको छैन',
  'When you arrive': 'आइपुगेपछि', 'Then check in at reception': 'त्यसपछि रिसेप्सनमा चेक इन गर्नुहोस्', 'Get directions': 'बाटो हेर्नुहोस्', Reschedule: 'समय सार्नुहोस्',
  'Reschedule instead': 'बरु समय सार्नुहोस्', 'Cancel visit': 'भेट रद्द गर्नुहोस्', 'Keep my visit': 'मेरो भेट राख्नुहोस्', Cancelled: 'रद्द भयो', 'Book again': 'फेरि बुक गर्नुहोस्',
  'Book another time': 'अर्को समय बुक गर्नुहोस्', 'Before you come': 'आउनुअघि', Details: 'विवरण', 'So you get a reminder too': 'ताकि तपाईंलाई पनि सम्झना आओस्',
  'No upcoming visits': 'आउँदा भेटहरू छैनन्', 'When you book a visit, it will show up here.': 'भेट बुक गरेपछि यहाँ देखिनेछ।', 'While you wait': 'पर्खँदा',
  'On your way out': 'फर्कँदा', 'Next step': 'अर्को कदम', 'Go to Health': 'स्वास्थ्यमा जानुहोस्', 'Call the clinic': 'क्लिनिकमा फोन गर्नुहोस्', 'In progress': 'जाँच हुँदैछ',
  'Your turn': 'तपाईंको पालो', 'Book follow-up': 'फलो-अप बुक गर्नुहोस्', 'No follow-up needed': 'फलो-अप आवश्यक छैन', 'Follow-up in 2 weeks': '2 हप्तामा फलो-अप',
  "If you can't go now": 'अहिले जान सक्नुहुन्न भने', Paid: 'तिरिसकियो', 'Not paid': 'तिरिएको छैन', 'In your calendar': 'तपाईंको क्यालेन्डरमा',
  // Health and the Health lock
  'Your health records are locked': 'तपाईंको स्वास्थ्य रेकर्ड लक छ', Unlock: 'अनलक गर्नुहोस्', 'Enter your PIN': 'आफ्नो PIN हाल्नुहोस्',
  'To open your lab report.': 'ल्याब रिपोर्ट खोल्न।', 'To open your health records.': 'स्वास्थ्य रेकर्ड खोल्न।', 'To see your appointments and medicines.': 'अपोइन्टमेन्ट र औषधिहरू हेर्न।',
  'Forgot your PIN?': 'PIN बिर्सनुभयो?', 'Taking now': 'अहिले खाइरहेका', 'Visit history': 'भेटको इतिहास', 'Follow-ups': 'फलो-अपहरू', 'Your records': 'तपाईंका रेकर्डहरू',
  'What your doctor says': 'डाक्टर के भन्नुहुन्छ', 'What your doctor told you': 'डाक्टरले के भन्नुभयो', Prescribed: 'लेखिएका औषधि', Prescription: 'प्रेस्क्रिप्सन',
  "Doctor's note": 'डाक्टरको टिप्पणी', 'Download report': 'रिपोर्ट डाउनलोड गर्नुहोस्', Report: 'रिपोर्ट', 'Needs follow-up': 'फलो-अप चाहिन्छ', Ready: 'तयार',
  'Being reviewed': 'जाँच हुँदैछ', 'No prescriptions yet': 'अहिलेसम्म प्रेस्क्रिप्सन छैन', 'No lab reports yet': 'अहिलेसम्म ल्याब रिपोर्ट छैन',
  'All prescriptions': 'सबै प्रेस्क्रिप्सन', 'Show to pharmacist': 'फार्मासिस्टलाई देखाउनुहोस्', 'Nothing here yet': 'अहिले यहाँ केही छैन',
  'Choose a PIN for your health records': 'स्वास्थ्य रेकर्डका लागि PIN छान्नुहोस्', 'Enter it again': 'फेरि हाल्नुहोस्', "So we know it's right.": 'मिल्यो कि मिलेन भनेर जान्न।',
  'Use your fingerprint next time?': 'अर्को पटक औंठाछाप प्रयोग गर्ने?', 'Just use my PIN': 'PIN मात्र प्रयोग गर्छु', 'Unlock your health records': 'स्वास्थ्य रेकर्ड अनलक गर्नुहोस्',
  'Use PIN instead': 'बरु PIN प्रयोग गर्नुहोस्', 'Too many tries': 'धेरै पटक प्रयास भयो', 'Reset with an SMS code': 'SMS कोडबाट रिसेट गर्नुहोस्',
  'Reset at reception': 'रिसेप्सनमा रिसेट गर्नुहोस्', 'Choose a new PIN': 'नयाँ PIN छान्नुहोस्', 'Enter your current PIN': 'हालको PIN हाल्नुहोस्',
  'Health lock': 'स्वास्थ्य लक', 'Lock and unlock': 'लक र अनलक', 'Locks automatically': 'आफैं लक हुन्छ',
  'When you leave Clinica, or after 5 idle minutes': 'Clinica छोड्दा, वा 5 मिनेट प्रयोग नगर्दा', 'Change PIN': 'PIN बदल्नुहोस्', 'Choose a new 4-digit PIN': '4 अङ्कको नयाँ PIN छान्नुहोस्',
  'Use fingerprint': 'औंठाछाप प्रयोग गर्नुहोस्', 'Off. Your PIN opens your records.': 'बन्द। तपाईंको PIN ले रेकर्ड खोल्छ।', 'On this shared phone': 'यो साझा फोनमा',
  'Also lock appointments and medicines': 'अपोइन्टमेन्ट र औषधिहरू पनि लक गर्नुहोस्', 'Home shows them after your PIN': 'PIN हालेपछि गृहपृष्ठमा देखिन्छन्',
  'Off. Anyone with this phone sees them on Home': 'बन्द। यो फोन चलाउने जो कोहीले गृहपृष्ठमा देख्छन्', 'If you forget': 'बिर्सनुभयो भने', 'Reset your PIN': 'PIN रिसेट गर्नुहोस्',
  'With a code sent by SMS': 'SMS मा पठाइएको कोडबाट', 'PIN changed': 'PIN बदलियो', 'Use your new PIN from now on.': 'अबदेखि नयाँ PIN प्रयोग गर्नुहोस्।',
  // Medicines
  Medicines: 'औषधिहरू', 'Your medicines': 'तपाईंका औषधिहरू', 'Add a medicine': 'औषधि थप्नुहोस्', 'Add medicine': 'औषधि थप्नुहोस्', 'Medicine name': 'औषधिको नाम',
  Form: 'किसिम', Strength: 'मात्रा', 'Total you have': 'तपाईंसँग जम्मा', 'How much you take': 'एक पटकमा कति', 'How often': 'कति पटक', 'Save medicine': 'औषधि सेभ गर्नुहोस्',
  Refill: 'थप किन्नुहोस्', 'Review your medicine': 'आफ्नो औषधि जाँच्नुहोस्', 'Tracking since': 'ट्र्याक गरेको', Schedule: 'तालिका', 'Stock left': 'बाँकी', Instructions: 'निर्देशन',
  'I took a dose': 'मैले औषधि खाएँ', 'Last taken': 'पछिल्लो पटक खाएको', 'Dose logged': 'टिपियो', 'Tell me about your medicine': 'आफ्नो औषधिबारे भन्नुहोस्',
  // Profile and More
  You: 'तपाईं', 'Your details': 'तपाईंको विवरण', 'Name, birth date and mobile number': 'नाम, जन्म मिति र मोबाइल नम्बर', Payments: 'भुक्तानी',
  'Fees paid in the app, with receipts': 'एपमा तिरेका शुल्क, रसिदसहित', Settings: 'सेटिङ', Language: 'भाषा', Notifications: 'सूचनाहरू', On: 'खुला',
  'PIN and fingerprint': 'PIN र औंठाछाप', 'Set up when you first open Health': 'पहिलो पटक स्वास्थ्य खोल्दा सेट गर्नुहोस्', 'Your clinic': 'तपाईंको क्लिनिक',
  'Phone, address and opening hours': 'फोन, ठेगाना र खुल्ने समय', 'Help and about': 'मद्दत र जानकारी', Help: 'मद्दत',
  'Emergencies, contacting the clinic, privacy': 'आपतकाल, क्लिनिकलाई सम्पर्क, गोपनीयता', 'About Clinica': 'Clinica बारे', 'Version, privacy': 'संस्करण, गोपनीयता',
  'This phone': 'यो फोन', 'Switch person': 'अर्को व्यक्ति', 'For a phone the family shares': 'परिवारले साझा गर्ने फोनका लागि', 'Sign out': 'साइन आउट',
  'Close account': 'खाता बन्द गर्नुहोस्', 'Your records stay with the clinic': 'तपाईंका रेकर्ड क्लिनिकमै रहन्छन्', 'Patient at City Hospital': 'सिटी हस्पिटलको बिरामी',
  'No payments yet': 'अहिलेसम्म भुक्तानी छैन', 'Your appointments': 'तपाईंका अपोइन्टमेन्ट', 'Appointment reminders': 'अपोइन्टमेन्टको सम्झना',
  'Delays and cancellations': 'ढिलाइ र रद्द', 'Follow-up reminders': 'फलो-अपको सम्झना', 'Lab reports ready': 'ल्याब रिपोर्ट तयार', Contact: 'सम्पर्क', Address: 'ठेगाना',
  'Opening hours': 'खुल्ने समय', 'Call reception': 'रिसेप्सनमा फोन गर्नुहोस्', Reception: 'रिसेप्सन', 'Sign out of Clinica?': 'Clinica बाट साइन आउट गर्ने?',
  'Stay signed in': 'साइन इन नै रहनुहोस्', 'Close your Clinica account?': 'Clinica खाता बन्द गर्ने?', 'Keep my account': 'मेरो खाता राख्नुहोस्', 'In an emergency': 'आपतकालमा',
  'Call 102': '102 मा फोन गर्नुहोस्', "Who's using the app?": 'एप कसले चलाउँदै हुनुहुन्छ?', People: 'मानिसहरू', 'You, right now': 'अहिले तपाईं', 'Someone else': 'अरू कोही',
  'Create a new profile': 'नयाँ प्रोफाइल बनाउनुहोस्', 'Sign in with their own record': 'उहाँको आफ्नै रेकर्डबाट साइन इन', 'Privacy policy': 'गोपनीयता नीति',
  'Terms of use': 'प्रयोगका सर्तहरू', Version: 'संस्करण', 'Kept by City Hospital': 'सिटी हस्पिटलले राखेको', 'Patient number': 'बिरामी नम्बर',
  // Sign-in and Create profile
  'Your mobile number': 'तपाईंको मोबाइल नम्बर', 'Mobile number': 'मोबाइल नम्बर', 'Only used to sign you in and send visit updates.': 'साइन इन गर्न र भेटको खबर पठाउन मात्र प्रयोग हुन्छ।',
  'Send code': 'कोड पठाउनुहोस्', 'Enter the code': 'कोड हाल्नुहोस्', 'Wrong number?': 'नम्बर गलत भयो?', 'Go back to change it.': 'बदल्न पछाडि जानुहोस्।', Verify: 'पुष्टि गर्नुहोस्',
  'Send a new code': 'नयाँ कोड पठाउनुहोस्', 'Nepali mobile numbers are 10 digits, starting with 9.': 'नेपाली मोबाइल नम्बर 9 बाट सुरु हुने 10 अङ्कको हुन्छ।',
  'Create your profile': 'आफ्नो प्रोफाइल बनाउनुहोस्', 'The clinic uses this to find you at reception.': 'रिसेप्सनमा तपाईंलाई खोज्न क्लिनिकले यो प्रयोग गर्छ।',
  'Full name': 'पूरा नाम', 'Your full name': 'तपाईंको पूरा नाम', 'Date of birth': 'जन्म मिति', 'AD or BS — choose in the date picker.': 'AD वा BS — मिति छान्ने ठाउँमा रोज्नुहोस्।',
  Sex: 'लिङ्ग', Female: 'महिला', Male: 'पुरुष', Other: 'अन्य', 'Pronouns (optional)': 'सम्बोधन (ऐच्छिक)', 'Prefer not to say': 'भन्न चाहन्नँ', 'Create profile': 'प्रोफाइल बनाउनुहोस्',
  'Enter your full name, as the clinic has it.': 'क्लिनिकमा भएजस्तै पूरा नाम लेख्नुहोस्।', 'Enter your date of birth.': 'जन्म मिति लेख्नुहोस्।', 'Choose one.': 'एउटा छान्नुहोस्।',
  Year: 'वर्ष', Month: 'महिना', Day: 'गते', Cancel: 'रद्द गर्नुहोस्', 'Please sign in again': 'कृपया फेरि साइन इन गर्नुहोस्', 'Use a different number': 'अर्को नम्बर प्रयोग गर्नुहोस्',
  Continue: 'जारी राख्नुहोस्', 'Get started': 'सुरु गर्नुहोस्', Skip: 'छोड्नुहोस्', Next: 'अर्को', 'Check my details': 'मेरो विवरण जाँच्नुहोस्',
  'We may already know you': 'हामी तपाईंलाई पहिले नै चिन्न सक्छौं', 'What happens next': 'अब के हुन्छ',
  "We'll text a 6-digit code. Use the number your clinic has on file, so we can find your records.": 'हामी 6 अङ्कको कोड SMS गर्छौं। क्लिनिकमा दर्ता भएको नम्बर प्रयोग गर्नुहोस्, ताकि तपाईंका रेकर्ड भेटियोस्।',
  // Figma sync (Phase 7): strings that stayed English in Nepali — time phrases, B06, the walk-in card, the Health lock and the fingerprint sheet
  Tomorrow: 'भोलि', Where: 'कहाँ', 'Your visit': 'तपाईंको भेट', 'when you check in': 'चेक इन गर्दा',
  'Pay at reception, or with eSewa, Khalti or Fonepay.': 'रिसेप्सनमा, वा eSewa, Khalti वा Fonepay बाट तिर्नुहोस्।',
  'Allow notifications': 'सूचना अनुमति दिनुहोस्', 'Not now': 'अहिले होइन', "Turn this off and we'll still send updates by SMS.": 'यो बन्द गरे पनि हामी SMS बाट खबर पठाइरहन्छौं।',
  "We'll only tell you about your own appointments — reminders, delays and cancellations. No marketing, ever.": 'हामी तपाईंलाई आफ्नै अपोइन्टमेन्टबारे मात्र खबर गर्छौं — सम्झना, ढिलाइ र रद्द। विज्ञापन कहिल्यै होइन।',
  'Walk-ins are seen between booked patients, so waits vary. Reception will call your name.': 'वाक-इन बिरामीलाई बुक भएका बिरामीहरूको बीचमा हेरिन्छ, त्यसैले पर्खने समय फरक पर्छ। रिसेप्सनले तपाईंको नाम बोलाउनेछ।',
  'This phone may be shared, so your visits and prescriptions stay locked until you unlock them with your Clinica PIN.': 'यो फोन अरूले पनि चलाउन सक्छन्, त्यसैले Clinica PIN ले अनलक नगरेसम्म तपाईंका भेट र प्रेस्क्रिप्सन लक रहन्छन्।',
  'Unlock to see your new lab report. This phone may be shared, so your records stay locked until you enter your Clinica PIN.': 'नयाँ ल्याब रिपोर्ट हेर्न अनलक गर्नुहोस्। यो फोन अरूले पनि चलाउन सक्छन्, त्यसैले Clinica PIN नहालेसम्म तपाईंका रेकर्ड लक रहन्छन्।',
  'Locked because you left Clinica. On a shared phone, your records lock when you leave the app, or after 5 minutes without use.': 'तपाईंले Clinica छोड्नुभएकाले लक भयो। साझा फोनमा, एप छोड्दा वा 5 मिनेट प्रयोग नगर्दा तपाईंका रेकर्ड लक हुन्छन्।',
  "It's quicker than your PIN. But anyone whose fingerprint is saved on this phone could open your records too.": 'यो PIN भन्दा छिटो हुन्छ। तर यो फोनमा औंठाछाप सेभ भएका जो कोहीले पनि तपाईंका रेकर्ड खोल्न सक्छन्।',
  'Touch the fingerprint sensor': 'औंठाछाप सेन्सर छुनुहोस्', 'Not recognised. Try again.': 'चिनिएन। फेरि प्रयास गर्नुहोस्।', 'Fingerprint sensor': 'औंठाछाप सेन्सर',
};
export const ne = () => S.lang === 'ne' && S.app === 'patient'; // patient app only; for lines whose Nepali word order differs (Figma sync)
// Phase 8: a date or time on its own ('Fri, Sep 11, 10:30 AM', 'August 2026', '1 Chaitra 2050 BS') gets Nepali month, weekday and
// time-of-day words; its digits stay Latin. nd() does the same inside a sentence.
const DW = { January: 'जनवरी', February: 'फेब्रुअरी', March: 'मार्च', April: 'अप्रिल', June: 'जुन', July: 'जुलाई', August: 'अगस्ट', September: 'सेप्टेम्बर',
  October: 'अक्टोबर', November: 'नोभेम्बर', December: 'डिसेम्बर', Jan: 'जनवरी', Feb: 'फेब्रुअरी', Mar: 'मार्च', Apr: 'अप्रिल', May: 'मे', Jun: 'जुन', Jul: 'जुलाई',
  Aug: 'अगस्ट', Sep: 'सेप्टेम्बर', Oct: 'अक्टोबर', Nov: 'नोभेम्बर', Dec: 'डिसेम्बर', Sunday: 'आइतबार', Monday: 'सोमबार', Tuesday: 'मङ्गलबार',
  Wednesday: 'बुधबार', Thursday: 'बिहीबार', Friday: 'शुक्रबार', Saturday: 'शनिबार', Sun: 'आइत', Mon: 'सोम', Tue: 'मङ्गल', Wed: 'बुध', Thu: 'बिही', Fri: 'शुक्र',
  Sat: 'शनि', Today: 'आज', Tomorrow: 'भोलि', Yesterday: 'हिजो', Baisakh: 'बैशाख', Jestha: 'जेठ', Asar: 'असार', Shrawan: 'साउन', Bhadra: 'भदौ', Ashwin: 'असोज',
  Kartik: 'कात्तिक', Mangsir: 'मंसिर', Poush: 'पुस', Magh: 'माघ', Falgun: 'फागुन', Chaitra: 'चैत', BS: 'वि.सं.', AD: 'ई.सं.' };
const DWRE = new RegExp(`\\b(${Object.keys(DW).sort((a, b) => b.length - a.length).join('|')})\\b`, 'g');
const DATEISH = new RegExp(`^(?:[\\d\\s:,·–—-]|AM|PM|${Object.keys(DW).join('|')})+$`);
export const nd = s => !ne() ? s : String(s) // '4:30 PM' → 'दिउँसो 4:30'
  .replace(/(\d{1,2})(:\d{2})? ?(AM|PM)\b/g, (_, h, m = '', ap) => `${ap === 'AM' ? 'बिहान' : +h % 12 < 5 ? 'दिउँसो' : 'बेलुका'} ${h}${m}`).replace(DWRE, w => DW[w]);
export const tr = s => !ne() ? s : NE[s] || (typeof s === 'string' && DATEISH.test(s) ? nd(s) : s);
