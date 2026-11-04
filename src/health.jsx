// Clinica — Health tab: lock and PIN, visits, prescriptions, reports, medicines.
// Figma: zw3saW6ot26E6gWH20K3ux, section 539:16334. Plugs into core.jsx (SCREENS, mount, ACTIONS, FLOW, NUM)
// and reuses pieces from booking.jsx (bar, label, tag, rows, callBtn, backTo).
import { RECORDS, appBar, btn, digits, empty, heading, homeInd, listItem, masked, mmss, start, statusBar, support } from './app.jsx';
import { acts, answer, ask, resolveAskLock, src, words } from './ask.jsx';
import { backTo, bar, callBtn, homeLockRow, homeLocked, label, navBar, offLine, row, rows, tag, when } from './booking.jsx';
import { csheet, notice, pinOf, switchTo } from './care.jsx';
import { A, ACTIONS, FLOW, NE, NUM, ORDER, OVERLAY, S, SCREENS, after, back, every, extraState, go, mount, nd, ne, onLeave, paint, render, reset, sepJoin, toast, tr } from './core.jsx';
import { labOf, labTrend } from './doctor.jsx';
import { med, ring } from './meds.jsx';
import { openSys } from './more.jsx';
import { img, now, person, results } from './staff.jsx';
import { DOCTORS } from './data.js';

// Phase 8: Nepali for this module's own lines — incl. the canned clinical text below (RX, LABS, VISITS, PRESCRIPTIONS) and the
// Medicines tracker's demo data. The data stays English; the screens pass it through tr(). Medicine names stay Latin.
Object.assign(NE, {
  // RX / RX2
  'For fever and headache': 'ज्वरो र टाउको दुखाइका लागि', '1 tablet 3 times a day, after food': 'दिनको 3 पटक 1 ट्याब्लेट, खाना खाएपछि',
  'For 5 days, until Sep 2': '5 दिनसम्म, सेप्टेम्बर 2 सम्म', 'Tablet — 1, 3 times a day, after food': 'ट्याब्लेट — दिनको 3 पटक 1, खाना खाएपछि',
  '5 days · Dispense 15 tablets': '5 दिन · 15 ट्याब्लेट दिनुहोस्', 'For the runny nose': 'नाक बगेकोका लागि', '1 tablet at night': 'राति 1 ट्याब्लेट',
  'Tablet — 1 at night': 'ट्याब्लेट — राति 1', '5 days · Dispense 5 tablets': '5 दिन · 5 ट्याब्लेट दिनुहोस्', 'For the ear infection': 'कानको संक्रमणका लागि',
  '1 capsule 3 times a day': 'दिनको 3 पटक 1 क्याप्सुल', 'For 7 days, finished Aug 19': '7 दिनसम्म, अगस्ट 19 मा सकियो',
  // LABS
  'HbA1c blood test': 'HbA1c रगत जाँच', 'CBC blood test': 'CBC रगत जाँच', 'Thyroid panel': 'थाइराइड जाँच',
  'Aug 24, City Hospital lab': 'अगस्ट 24, सिटी हस्पिटल ल्याब', 'Jun 20, City Hospital lab': 'जुन 20, सिटी हस्पिटल ल्याब', // Phase 8: the trend
  "Your blood sugar is a little above normal. We'll check it again in two months.": 'तपाईंको रगतमा चिनीको मात्रा सामान्यभन्दा अलि बढी छ। दुई महिनापछि फेरि जाँच्नेछौं।',
  'Over time': 'समयसँगै', 'Higher in the latest test': 'पछिल्लो जाँचमा बढी', 'Lower in the latest test': 'पछिल्लो जाँचमा कम', 'No change in the latest test': 'पछिल्लो जाँचमा उस्तै', 'Aug 28, City Hospital lab': 'अगस्ट 28, सिटी हस्पिटल ल्याब', 'Jul 3, City Hospital lab': 'जुलाई 3, सिटी हस्पिटल ल्याब',
  'Your blood sugar is higher than it should be. Please book a follow-up so we can talk about what to do next.': 'तपाईंको रगतमा चिनीको मात्रा हुनुपर्नेभन्दा बढी छ। अब के गर्ने भनेर कुरा गर्न कृपया फलो-अप बुक गर्नुहोस्।',
  'Your thyroid levels are normal. No change to your treatment.': 'तपाईंको थाइराइडको मात्रा सामान्य छ। उपचारमा कुनै परिवर्तन छैन।',
  // VISITS / PRESCRIPTIONS
  'General medicine, OPD 1': 'सामान्य चिकित्सा, OPD 1', 'General medicine, OPD 2': 'सामान्य चिकित्सा, OPD 2', 'General medicine, walk-in': 'सामान्य चिकित्सा, वाक-इन',
  'A viral infection. Rest, drink plenty of fluids, and take paracetamol for the fever. Come back if the fever is not better in 2 days.': 'भाइरल संक्रमण। आराम गर्नुहोस्, प्रशस्त झोल पदार्थ पिउनुहोस्, र ज्वरोका लागि Paracetamol खानुहोस्। 2 दिनमा ज्वरो कम नभए फेरि आउनुहोस्।',
  "An ear infection. Take all of the amoxicillin, even once it feels better. Come back if the pain gets worse or there's discharge.": 'कानको संक्रमण। सन्चो भएजस्तो लागे पनि Amoxicillin पूरै खानुहोस्। दुखाइ बढे वा कानबाट पीप बगे फेरि आउनुहोस्।',
  'Finish the whole course, even if you feel better sooner.': 'चाँडै सन्चो भएजस्तो लागे पनि औषधिको पूरा कोर्स सक्नुहोस्।',
  'Take all of it, even once it feels better.': 'सन्चो भएजस्तो लागे पनि सबै औषधि खानुहोस्।',
  // Health, visits, follow-ups, prescriptions
  'Last visit Aug 28, General medicine': 'पछिल्लो भेट अगस्ट 28, सामान्य चिकित्सा', '2 medicines to take now': 'अहिले खानुपर्ने 2 औषधि', 'All stocked up': 'सबै पर्याप्त छ',
  'None yet': 'अहिलेसम्म छैन', '1 due around Sep 11': 'सेप्टेम्बर 11 तिर 1 वटा',
  'After your first visit, what your doctor tells you, your prescriptions and your reports will appear here.': 'पहिलो भेटपछि, डाक्टरले भनेका कुरा, तपाईंका प्रेस्क्रिप्सन र रिपोर्टहरू यहाँ देखिनेछन्।',
  'Around Sep 11. Book now to get a time that suits you.': 'सेप्टेम्बर 11 तिर। आफूलाई मिल्ने समय पाउन अहिले नै बुक गर्नुहोस्।', 'Come back only if it gets worse.': 'झन् बिग्रिएमा मात्र फेरि आउनुहोस्।',
  Due: 'गर्नुपर्ने', 'Around Sep 11 · asked for at your Aug 28 visit': 'सेप्टेम्बर 11 तिर · तपाईंको अगस्ट 28 को भेटमा भनिएको',
  'Sep 14 · asked for at your Jul 3 visit': 'सेप्टेम्बर 14 · तपाईंको जुलाई 3 को भेटमा भनिएको',
  'When a doctor prescribes medicine, it appears here with how to take it.': 'डाक्टरले औषधि लेखिदिएपछि, कसरी खाने भन्ने सहित यहाँ देखिन्छ।',
  '2 medicines': '2 औषधि', '1 medicine, finished': '1 औषधि, सकियो', 'Prescribed by Dr. Priya Sharma': 'Dr. Priya Sharma ले लेख्नुभएको',
  'NMC reg. no. 12345': 'NMC दर्ता नं. 12345', 'City Hospital, Aug 28, 2026': 'सिटी हस्पिटल, अगस्ट 28, 2026', 'Prescription no. RX-0828-4821': 'प्रेस्क्रिप्सन नं. RX-0828-4821',
  "This screen stays on while it's open.": 'खुला रहेसम्म यो स्क्रिन बन्द हुँदैन।',
  // Lab reports
  "When your doctor orders a test, the report appears here once they've looked at it.": 'डाक्टरले जाँच गराउन भन्नुभएपछि, उहाँले हेरिसकेपछि रिपोर्ट यहाँ देखिन्छ।',
  'Dr. Sharma asked to see you': 'Dr. Sharma ले तपाईंलाई भेट्न चाहनुभएको छ', 'Book a follow-up to talk about this report.': 'यो रिपोर्टबारे कुरा गर्न फलो-अप बुक गर्नुहोस्।',
  'City Hospital Laboratory': 'सिटी हस्पिटल ल्याबोरेटरी', 'Maharajgunj, Kathmandu': 'महाराजगञ्ज, काठमाडौं', 'Page 1 of 1': 'पेज 1 / 1',
  'Your doctor is reviewing this report': 'तपाईंको डाक्टरले यो रिपोर्ट हेर्दै हुनुहुन्छ',
  "Results reach you once Dr. Priya Sharma has looked at them, so they come with an explanation. We'll message you when it's ready. Feeling worse? Don't wait for it — call the clinic.": 'Dr. Priya Sharma ले हेरिसकेपछि मात्र नतिजा तपाईंसम्म आउँछ, त्यसैले साथमा व्याख्या पनि हुन्छ। तयार भएपछि हामी तपाईंलाई खबर गर्छौं। झन् बिसन्चो लाग्दैछ? यसको लागि नपर्खनुहोस् — क्लिनिकमा फोन गर्नुहोस्।',
  "Saved to your phone's Files.": 'तपाईंको फोनको Files मा सेभ भयो।', 'Open file': 'फाइल खोल्नुहोस्',
  // PIN and the Health lock
  'PIN did not match': 'PIN मिलेन', 'PIN keypad': 'PIN किप्याड', Delete: 'मेटाउनुहोस्', "Those PINs didn't match. Choose one again.": 'दुवै PIN मिलेनन्। फेरि छान्नुहोस्।',
  'Fingerprint unlock is off': 'औंठाछापले अनलक बन्द छ', 'A new fingerprint was added to this phone. For your safety, enter your PIN.': 'यो फोनमा नयाँ औंठाछाप थपिएको छ। तपाईंको सुरक्षाका लागि PIN हाल्नुहोस्।',
  "Your phone's own PIN may be known to others who use it. This one is only yours.": 'तपाईंको फोनको आफ्नै PIN यो फोन चलाउने अरूलाई थाहा हुन सक्छ। यो PIN तपाईंको मात्र हो।',
  "So we know it's you before you change it.": 'बदल्नुअघि तपाईं नै हो भनेर जान्न।', 'To change your mobile number.': 'मोबाइल नम्बर बदल्न।',
  'Your old PIN stops working. Your records stay as they are.': 'पुरानो PIN अब चल्दैन। तपाईंका रेकर्ड जस्ताको तस्तै रहन्छन्।', 'PIN changed.': 'PIN बदलियो।', 'PIN set.': 'PIN राखियो।', 'No visits or reports yet': 'अहिलेसम्म कुनै भेट वा रिपोर्ट छैन', 'Pay later': 'पछि तिर्छु', 'not booked yet': 'अझै बुक गरिएको छैन',
  "The lab's reference range": 'प्रयोगशालाको सामान्य दायरा', 'Until you see your doctor': 'डाक्टरलाई नभेटुन्जेल',
  'Below 5.7% is normal; 5.7% to 6.4% is above normal. For people with diabetes, the usual aim is below 7%.': '5.7% भन्दा कम सामान्य हो; 5.7% देखि 6.4% सामान्यभन्दा माथि हो। मधुमेह भएकाहरूका लागि सामान्यतया 7% भन्दा कम राख्ने लक्ष्य हुन्छ।',
  'Until your visit, keep taking your medicines as usual. If you feel very unwell, call reception, or 102 in an emergency.': 'भेट नहुन्जेल आफ्ना औषधि सधैँझैँ खाइरहनुहोस्। धेरै अस्वस्थ महसुस भए रिसेप्सनमा, वा आपत्कालमा 102 मा फोन गर्नुहोस्।', 'Set a PIN': 'PIN राख्नुहोस्', 'Choose a 4-digit PIN': '4 अङ्कको PIN छान्नुहोस्',
  'Set a PIN first. Until then, anyone with this phone sees them on Home.': 'पहिले PIN राख्नुहोस्। त्यतिन्जेल यो फोन चलाउने जो कोहीले तिनलाई गृहपृष्ठमा देख्छन्।',
  // Medicines: save errors, the form's placeholders and the tracker's demo data (shown by meds.jsx)
  "Enter the medicine's name.": 'औषधिको नाम लेख्नुहोस्।', 'Enter how many you have, as a number — for example 20 tablets.': 'तपाईंसँग कति छ, अङ्कमा लेख्नुहोस् — जस्तै 20 ट्याब्लेट।',
  'e.g. Paracetamol': 'जस्तै Paracetamol', 'e.g. Tablet, capsule, syrup': 'जस्तै ट्याब्लेट, क्याप्सुल, सिरप', 'e.g. 500 mg': 'जस्तै 500 mg',
  'e.g. 20 tablets, or 100 ml': 'जस्तै 20 ट्याब्लेट, वा 100 ml', 'e.g. 1 tablet': 'जस्तै 1 ट्याब्लेट', 'e.g. Twice a day, after meals': 'जस्तै दिनको 2 पटक, खाना खाएपछि',
  'Acetaminophen tablets': 'Acetaminophen ट्याब्लेट', 'Metformin hydrochloride tablets': 'Metformin hydrochloride ट्याब्लेट', 'Cetirizine hydrochloride syrup': 'Cetirizine hydrochloride सिरप',
  'Cetirizine 10 mg (syrup)': 'Cetirizine 10 mg (सिरप)', Tablet: 'ट्याब्लेट', Syrup: 'सिरप', '1 tablet': '1 ट्याब्लेट',
  'Twice a day': 'दिनको 2 पटक', 'After breakfast': 'बिहानको खानापछि', 'At night': 'राति', 'Twice daily': 'दिनको 2 पटक', 'Once daily': 'दिनको 1 पटक', 'As needed': 'आवश्यक पर्दा',
  '1 tablet, twice a day': 'दिनको 2 पटक 1 ट्याब्लेट', '1 tablet, after breakfast': 'बिहानको खानापछि 1 ट्याब्लेट', '5 ml, at night': 'राति 5 ml',
  '3 weeks': '3 हप्ता', '2 months': '2 महिना', '1 week': '1 हप्ता',
});
// Phase 8: the data's dated lines, in Nepali word order ('Visit on Aug 28' → 'अगस्ट 28 को भेट'). English passes through unchanged.
const dated = s => !ne() ? s : String(s).replace(/^Visit on (.+)$/, (_, d) => `${nd(d)} को भेट`).replace(/^Prescribed (.+)$/, (_, d) => `${nd(d)} मा लेखिएको`)
  .replace(/^Reviewed by (.+) on (.+)$/, (_, who, d) => `${who} ले ${nd(d)} मा हेर्नुभएको`);
const reportTitle = t => ne() ? `${tr(t)} रिपोर्ट` : `${t} report`; // '<title> report'

export const RX = [
  { name: 'Paracetamol 500 mg', for: 'For fever and headache', how: '1 tablet 3 times a day, after food', dur: 'For 5 days, until Sep 2',
    form: 'Tablet — 1, 3 times a day, after food', disp: '5 days · Dispense 15 tablets' },
  { name: 'Cetirizine 10 mg', for: 'For the runny nose', how: '1 tablet at night', dur: 'For 5 days, until Sep 2',
    form: 'Tablet — 1 at night', disp: '5 days · Dispense 5 tablets' },
];

export const RX2 = [{ name: 'Amoxicillin 500 mg', for: 'For the ear infection', how: '1 capsule 3 times a day', dur: 'For 7 days, finished Aug 19' }];
// Lab reports reach the patient only once a doctor has looked at them.
// Run 6 Y17: the lab's printed reference range, so a value means something. Clinical wording to be confirmed by the hospital.
const HBA1C_RANGE = 'Below 5.7% is normal; 5.7% to 6.4% is above normal. For people with diabetes, the usual aim is below 7%.';
export const LABS = {
  // T28 class: dated before the Aug 28 demo day (it read Sep 2, reviewed Sep 4).
  hba1c: { title: 'HbA1c blood test', sub: 'Aug 24, City Hospital lab', month: 'August 2026', date: 'Aug 24, 2026', tag: ['Needs follow-up', 'warn'], pages: 1, follow: true, value: '7.2%',
    words: 'Your blood sugar is higher than it should be. Please book a follow-up so we can talk about what to do next.', by: 'Reviewed by Dr. Priya Sharma on Aug 26', range: HBA1C_RANGE,
    meanwhile: 'Until your visit, keep taking your medicines as usual. If you feel very unwell, call reception, or 102 in an emergency.' }, // Run 6 Y17
  // Phase 8: the same test two months earlier, from her Jun 20 walk-in, so HbA1c has a trend (labTrend, doctor.jsx). Metformin started after it.
  hba1cJun: { title: 'HbA1c blood test', sub: 'Jun 20, City Hospital lab', month: 'June 2026', date: 'Jun 20, 2026', tag: ['Ready', 'success'], pages: 1, value: '6.1%',
    words: "Your blood sugar is a little above normal. We'll check it again in two months.", by: 'Reviewed by Dr. Anita Joshi on Jun 22', range: HBA1C_RANGE },
  cbc: { title: 'CBC blood test', sub: 'Aug 28, City Hospital lab', month: 'August 2026', tag: ['Being reviewed', 'neutral'], reviewing: true },
  thyroid: { title: 'Thyroid panel', sub: 'Jul 3, City Hospital lab', month: 'July 2026', date: 'Jul 3, 2026', tag: ['Ready', 'success'], pages: 2,
    words: 'Your thyroid levels are normal. No change to your treatment.', by: 'Reviewed by Dr. Anita Joshi on Jul 5' },
};
export const VISITS = {
  aug28: { title: 'Visit on Aug 28', doc: ['PS', 'Dr. Priya Sharma', 'Aug 28, 4:30 PM', 'General medicine, OPD 2'], rx: 'aug28',
    words: 'A viral infection. Rest, drink plenty of fluids, and take paracetamol for the fever. Come back if the fever is not better in 2 days.' },
  aug12: { title: 'Visit on Aug 12', doc: ['RS', 'Dr. Ramesh Shrestha', 'Aug 12, 11:00 AM', `General medicine, ${DOCTORS.rs.opd}`] /* W20: his OPD from the one doctor list */, rx: 'aug12',
    words: "An ear infection. Take all of the amoxicillin, even once it feels better. Come back if the pain gets worse or there's discharge." },
};
export const PRESCRIPTIONS = {
  aug28: { doc: ['PS', 'Dr. Priya Sharma', 'Prescribed Aug 28', 'General medicine, OPD 2'], meds: RX, note: 'Finish the whole course, even if you feel better sooner.' },
  aug12: { doc: ['RS', 'Dr. Ramesh Shrestha', 'Prescribed Aug 12', `General medicine, ${DOCTORS.rs.opd}`] /* W20: his OPD from the one doctor list */, meds: RX2, note: 'Take all of it, even once it feels better.', finished: 'Aug 19' },
};

extraState(() => ({
  unlocked: false, afterUnlock: null, healthEmpty: false, lockWhy: null, fingerChanged: false, pinChanged: false,
  labs: ['cbc', 'hba1c', 'thyroid', 'hba1cJun'], report: 'thyroid', visit: 'aug28', rx: 'aug28', rxNone: false, // labs newest first: CBC Aug 28, HbA1c Aug 24 … HbA1c Jun 20 (Phase 8)
  homeLock: {}, // T22: name → false when that person turned off "Also lock appointments and medicines"
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
export const lbl = t => <h2 className="sec-label lh20">{tr(t)}</h2>; // F15/R12; Run 6 Y21: a heading
export const chev = <img src={`${A}icon-chevron-right.svg`} width="20" height="20" alt="" />;
export const lead = icon => <span className="lead-tile"><img src={`${A}${icon}`} width="20" height="20" alt="" /></span>;
export const list = items => <div className="list">{sepJoin(items)}</div>;

// Content/Medicine: what it is, what it is FOR, how to take it, for how long.
export const medText = m => <span className="med-t"><span className="m1">{m.name}</span><span className="m2">{tr(m.for)}</span><span className="m3">{tr(m.how)}</span><span className="m4">{tr(m.dur)}</span></span>;
export const medRow = (m, act) => act
  ? <button className="list-item" data-act={act}>{lead('lt-rx.svg')}{medText(m)}{chev}</button>
  : <div className="list-item static">{lead('lt-rx.svg')}{medText(m)}</div>;

export const docCard = (ini, name, l2, l3) => <div className="card appt">
  <span className="avatar l" aria-hidden="true">{ini}</span>
  <span className="appt-t"><span className="h-s">{name}</span><span className="when">{tr(dated(l2))}</span><span className="where">{tr(l3)}</span></span></div>;

export const reportRow = (title, sub, status, act) => <button className="list-item" data-act={act}>{lead('lt-lab.svg')}
  <span className="report-t"><span className="text"><span className="h-s">{tr(title)}</span><span className="body-s">{tr(sub)}</span></span>{status}</span>{chev}</button>;

const medsItem = () => listItem('lt-rx.svg', 'Medicines', (n => n ? (ne() ? `${n} वटा सकिन लागेको` : `${n} running low`) : 'All stocked up')(S.meds.filter(lowStock).length), 'go:mtlist');
export const centred = inner => <div className="body" style={{ justifyContent: 'center' }}>{inner}</div>;

// ---------- PIN ----------
export const pinDots = (n, err) => <><div className="pin-dots" role="img" aria-label={tr(err ? 'PIN did not match' : digitsIn(n))}>
  {[0, 1, 2, 3].map(i => <span key={i} className={`dot ${err ? 'err' : i < n ? 'on' : ''}`}></span>)}</div>
  <p className="vh" aria-live="polite">{n && !err ? digitsIn(n) : ''}</p></>; // R26: each digit is announced
const digitsIn = n => ne() ? `4 मध्ये ${n} अङ्क हालियो` : `${n} of 4 digits entered`; // Phase 8
export const keypad = () => <div className="inset"><div className="keypad" aria-label={tr('PIN keypad')}>
  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(d => <button key={d} className="key" data-act={`pin-digit:${d}`}>{d}</button>)}
  <span className="key blank"></span><button className="key" data-act="pin-digit:0">0</button>
  <button className="key" data-act="pin-del" aria-label={tr('Delete')}><img src={`${A}icon-backspace.svg`} width="24" height="24" alt="" /></button>
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
    <div className="cs-text"><h2 className="cs-t" id="cs-t">{tr('Reset your PIN')}</h2>
      <p className="lede">{ne() ? `हामी ${masked()} मा कोड SMS गर्छौं। यो फोनका सन्देश अरूले पनि पढ्छन् भने, बरु रिसेप्सनमा रिसेट गर्नुहोस् — आफ्नो ID लिएर आउनुहोस्।`
        : `We'll text a code to ${masked()}. If others read this phone's messages, reset at reception instead — bring your ID.`}</p></div>
    <div className="cs-acts">{btn('Send code', 'reset-send')}{btn('Reset at reception', 'sheet-close', { kind: 'secondary' })}</div>
  </div><div className="sheet-home"></div></>;
OVERLAY.reset = resetSheet;

// System biometric prompt — a stand-in for the OS sheet. 'Use PIN instead' is always there.
export const bioSheet = () => {
  const fail = S.bio === 'fail';
  return <>
  <div className="scrim" data-act="bio-cancel"></div>
  <div className="bio-sheet" role="dialog" aria-modal="true" aria-labelledby="bio-t">
    <p className="cs-t" id="bio-t">{tr('Unlock your health records')}</p>{/* Figma sync: the fingerprint sheet in Nepali */}
    <p className="body-s">Clinica</p>
    <button className={`sensor ${fail ? 'err' : ''}`} data-act="bio-touch" aria-label={tr('Fingerprint sensor')}>
      <img src={`${A}icon-fingerprint-40${fail ? '-error' : ''}.svg`} width="40" height="40" alt="" /></button>
    <p className={fail ? 'bio-err' : 'body-s'} role="status">{tr(fail ? 'Not recognised. Try again.' : 'Touch the fingerprint sensor')}</p>
    <button className="btn secondary" data-act="bio-pin">{tr('Use PIN instead')}</button>
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
    <label className="label" htmlFor={`mf-${key}`}>{tr(labelText)}</label>
    <div className={`field ${err ? 'err' : ''}`}><input id={`mf-${key}`} data-f={key} placeholder={tr(ph)} value={S.mform[key] || ''}
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
            S.offline ? null : medsItem(), // stock needs a live count
            listItem('lt-lab.svg', 'Lab reports', (r => [r.filter(k => !labOf(k).reviewing).length && `${r.filter(k => !labOf(k).reviewing).length} ${ne() ? 'तयार' : 'ready'}`,
              r.filter(k => labOf(k).reviewing).length && `${r.filter(k => labOf(k).reviewing).length} ${ne() ? 'जाँच हुँदै' : 'being reviewed'}`].filter(Boolean).join(', ') || 'None yet')(S.labs), 'go:hlabs'),
            listItem('lt-clipboard.svg', 'Follow-ups', '1 due around Sep 11', 'go:hfollow'),
          ].filter(Boolean))}
        </div>
      </div>
      {navBar('Health')}
    </div>),

  hempty: () => (
    <div className="screen">
      {statusBar()}{bar({ back: false, title: 'Health' })}
      {centred(empty('qa-book.svg', S.meds.length ? 'No visits or reports yet' : 'Nothing here yet', // Run 7: not "nothing" when he tracks a medicine
        'After your first visit, what your doctor tells you, your prescriptions and your reports will appear here.',
        btn('Book a visit', 'go:finddoctor', { size: 'l' })))}
      {S.meds.length ? homeLocked() ? homeLockRow() : <div className="inset" style={{ paddingBottom: 16 }}>{list([medsItem()])}</div> : null}{/* Run 6 Y01: medicines someone tracks themselves, like Ramesh's; behind his Home lock when it's on */}
      {navBar('Health')}
    </div>),

  hvisits: () => {
    const row = (title, sub, act) => listItem('lt-followup.svg', title, sub, act);
    return (
    <div className="screen">
      {statusBar()}{bar({ title: 'Visit history' })}
      <div className="body" style={{ gap: 12 }}>
        <div><div className="inset">{lbl('August 2026')}</div>{list([row('General medicine', nd('Aug 28, Dr. Priya Sharma'), 'visit:aug28'), row('General medicine', nd('Aug 12, Dr. Ramesh Shrestha'), 'visit:aug12')])}</div>
        <div><div className="inset">{lbl('July 2026')}</div>{list([row('Dermatology', nd('Jul 3, Dr. Anita Joshi'), 'stub:Visit on Jul 3')])}</div>
        <div><div className="inset">{lbl('June 2026')}</div>{list([row('General medicine, walk-in', nd('Jun 20, Dr. Anita Joshi'), 'stub:Visit on Jun 20')])}</div>
      </div>
      {homeInd()}
    </div>);
  },

  hvisit: () => {
    const v = VISITS[S.visit];
    return (
    <div className="screen">
      {statusBar()}{bar({ title: dated(v.title) })}
      <div className="body g20">
        <div className="inset">{docCard(...v.doc)}</div>
        <div className="inset stack8">{lbl('What your doctor told you')}<p className="note-body">{S.visit === 'aug28' && S.drNotes?.as || tr(v.words)}</p></div>
        <div className="stack8"><div className="inset">{lbl('Prescribed')}</div>{list(PRESCRIPTIONS[v.rx].meds.map(m => medRow(m, `rx:${v.rx}`)))}</div>
        <div className="inset stack8">{lbl('Next step')}
          {S.visit === 'aug28' && S.fuAdvice !== 'none' ? <div className="card notice"><div className="text"><p className="h-s">{tr('Follow-up in 2 weeks')}</p>
            <p className="body-s">{tr('Around Sep 11. Book now to get a time that suits you.')}</p></div>
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
        listItem('lt-calendar.svg', 'General medicine', S.followup ? (ne() ? `${nd(S.followup.day)}, ${nd(S.followup.time)} का लागि बुक भयो · तपाईंको अगस्ट 28 को भेटमा भनिएको` : `Booked for ${S.followup.day}, ${S.followup.time} · asked for at your Aug 28 visit`) : 'Around Sep 11 · asked for at your Aug 28 visit', S.followup ? 'appt:fu' : 'doctor:ps'),
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
          listItem('lt-document.svg', nd('Dr. Priya Sharma, Aug 28'), '2 medicines', 'rx:aug28'),
          listItem('lt-document.svg', nd('Dr. Ramesh Shrestha, Aug 12'), '1 medicine, finished', 'rx:aug12')])}</div></>}
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
        <div className="inset stack8">{lbl("Doctor's note")}<p className="note-body">{tr(r.note)}</p></div>
      </div>
      <div className="cta">{r.finished // a finished course isn't handed over at a counter
        ? <p className="body-s">{ne() ? `यो कोर्स ${nd(r.finished)} मा सकियो।` : `This course finished on ${r.finished}.`}</p> : <button className="btn secondary" data-act="go:hpharm">{tr('Show to pharmacist')}</button>}</div>
      {homeInd()}
    </div>);
  },

  // 07 — read across a counter: 24 and 20px, all in primary ink, and no purpose line.
  hpharm: () => (
    <div className="screen">
      {statusBar()}{bar({ title: 'Show to pharmacist' })}
      <div className="body g20" style={{ padding: '8px 16px 16px' }}>
        <div className="pharm-who"><p className="pw-name">{S.fullName}, {ne() ? 'उमेर' : 'age'} 32</p><p>{tr('Prescribed by Dr. Priya Sharma')}</p><p>{tr('NMC reg. no. 12345')}</p><p>{tr('City Hospital, Aug 28, 2026')}</p></div>
        <div className="rx-list">{RX.map(m => <div key={m.name} className="rx-line"><p className="rx-n">{m.name}</p><p className="rx-d">{tr(m.form)}</p><p className="rx-q">{tr(m.disp)}</p></div>)}</div>
        <div className="stack6"><p className="rx-ref">{tr('Prescription no. RX-0828-4821')}</p><p className="body-s">{tr("This screen stays on while it's open.")}</p></div>
      </div>
      <div className="cta"><button className="btn secondary" data-act="back">{tr('Done')}</button></div>
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
        <div className="inset"><div className="card">{lead('lt-lab.svg')}<span className="text"><span className="item-title">{tr(l.title)}</span><span className="body-s">{tr(l.sub)}</span></span></div></div>
        <div className="inset stack8">{lbl('What your doctor says')}
          <p className="note-body">{tr(l.words)}</p>
          <p className="body-s tertiary">{dated(l.by)}</p></div>
        {labTrend(S.report) ? <div className="inset">{labTrend(S.report)}</div> : null}{/* Phase 8: a repeated test shows previous → latest */}
        {l.range ? <div className="inset stack8">{lbl("The lab's reference range")}<p className="body-s">{tr(l.range)}</p></div> : null}{/* Run 6 Y17 */}
        {l.meanwhile && l.follow ? <div className="inset">{notice('', 'Until you see your doctor', l.meanwhile)}</div> : null}
        {l.follow ? <div className="inset">{notice('warn', 'Dr. Sharma asked to see you', 'Book a follow-up to talk about this report.', btn('Book follow-up', 'report-fu', { size: 'l' }))}</div> : null}{/* W11 */}
        <div className="inset stack8">{lbl('Report')}
          <button className="card neutral" data-act="go:hfile">{lead('lt-document.svg')}<span className="text"><span className="item-title">{reportTitle(l.title)}</span><span className="body-s">{ne() ? `PDF, ${l.pages} पेज` : `PDF, ${l.pages} page${l.pages > 1 ? 's' : ''}`}</span></span>{chev}</button></div>
      </div>
      <div className="cta"><button className="btn secondary" data-act="report-dl"><img src={`${A}icon-download.svg`} width="24" height="24" alt="" />{tr('Download report')}</button></div>
      {homeInd()}
    </div>);
  },

  // The lab's own document; results stand in as bars.
  hfile: () => {
    const l = labOf(S.report);
    return (
    <div className="screen">
      {statusBar()}{bar({ title: reportTitle(l.title) })}
      <div className="doc-view">
        <div className="doc-page" role="img" aria-label={ne() ? `सिटी हस्पिटल ल्याबोरेटरीबाट ${reportTitle(l.title)}, पेज 1` : `${l.title} report from City Hospital Laboratory, page 1`}>
          <p className="dp-lab">{tr('City Hospital Laboratory')}</p><p className="body-s tertiary">{tr('Maharajgunj, Kathmandu')}</p>
          <p className="dp-test">{tr(l.title)} · {tr(l.date)}</p><p className="body-s">{ne() ? 'बिरामी' : 'Patient'}: {S.fullName} · CH-2381</p>
          {[280, 280, 160, 280, 280, 160, 280].map((w, i) => <span key={i} className="dp-bar" style={{ width: w }}></span>)}
        </div>
        <p className="body-s">{tr('Page 1 of 1')}</p>
      </div>
      <div className="cta"><button className="btn secondary" data-act="report-dl"><img src={`${A}icon-download.svg`} width="24" height="24" alt="" />{tr('Download report')}</button></div>
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
  pin: () => pinScreen(...(managedBy() ? ['Enter your PIN', ne() ? `वा ${managedBy().split(' ')[0]} को आफ्नै Clinica PIN — उहाँले यो प्रोफाइल सम्हाल्नुहुन्छ।` : `Or ${managedBy().split(' ')[0]}'s own Clinica PIN — she manages this profile.`] : { pinnew: ['Enter your current PIN', "So we know it's you before you change it."], pfphone: ['Enter your PIN', 'To change your mobile number.'],
      hreport: ['Enter your PIN', 'To open your lab report.'], home: ['Enter your PIN', 'To see your appointments and medicines.'] /* T22 */ }[S.afterUnlock] || ['Enter your PIN', 'To open your health records.']),
    <>{S.pinErr ? errLine(ne() ? `PIN मिलेन। अझै ${S.pinTries} पटक प्रयास गर्न सक्नुहुन्छ।` : `That PIN didn't match. ${S.pinTries} ${S.pinTries === 1 ? 'try' : 'tries'} left.`) : null}
      <button className="btn secondary l hug" data-act="forgot">{tr('Forgot your PIN?')}</button></>),
  pinnew: () => S.pin ? pinScreen('Choose a new PIN', 'Your old PIN stops working. Your records stay as they are.', S.pinMismatch ? errLine(MISMATCH) : null)
    : pinScreen('Choose a PIN for your health records', "Your phone's own PIN may be known to others who use it. This one is only yours.", S.pinMismatch ? errLine(MISMATCH) : null), // Run 6 Y09: a first PIN from Profile
  pinnewconfirm: () => pinScreen('Enter it again', "So we know it's right."),

  finger: () => (
    <div className="screen">
      {statusBar()}{bar({ back: false })}
      <div className="body" style={{ justifyContent: 'center', alignItems: 'center', gap: 16 }}>
        {empty('icon-fingerprint-28.svg', 'Use your fingerprint next time?',
          "It's quicker than your PIN. But anyone whose fingerprint is saved on this phone could open your records too.",
          <>{btn('Use fingerprint', 'finger:on', { size: 'l' })}{btn('Just use my PIN', 'finger:off', { kind: 'secondary', size: 'l' })}</>, false, 'h1')}
      </div>
      {homeInd()}
    </div>),

  toomany: () => (
    <div className="screen">
      {statusBar()}{appBar()}
      <div className="body" style={{ justifyContent: 'center', alignItems: 'center', gap: 16 }}>
        {empty('icon-lock.svg', 'Too many tries', ne() ? `तपाईंको सुरक्षाका लागि, फेरि प्रयास गर्नुअघि पर्खनुहोस्, वा ${masked()} मा पठाइएको कोडबाट PIN रिसेट गर्नुहोस्।`
          : `For your safety, wait before trying again, or reset your PIN with a code sent to ${masked()}.`,
          btn('Reset with an SMS code', 'forgot', { size: 'l' }), false, 'h1')}
        <p className="wait">{ne() ? <><span id="pinwait">{mmss(S.pinWait)}</span> पछि फेरि प्रयास गर्न सक्नुहुन्छ</> : <>You can try again in <span id="pinwait">{mmss(S.pinWait)}</span></>}</p>
      </div>
      {homeInd()}
      </div>),

});

// ---------- behaviour ----------
// F14/R11: who manages the signed-in person's profile, if anyone (app.jsx RECORDS). Their own PIN opens this person's Health too.
export const managedBy = () => RECORDS.find(r => r.name === S.fullName)?.managedBy;

export function openHealth(target = 'health') {
  S.stack = []; S.bio = null; S.sheet = null; S.lockStack = null;
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
  // T22: Home's locked row comes back to Home, with nothing behind it
  S.stack = t === 'health' || t === 'ask' || t === 'home' ? [] : t === 'pflock' ? ['pf'] : t === 'mtmed' ? ['health', 'mtlist'] : t === 'hreport' ? ['health', 'hlabs'] : ['health'];
  if (S.lockStack) { S.stack = S.lockStack; S.lockStack = null; } // W16: back where they were when Clinica locked
  S.screen = t;
  if (t === 'ask') return resolveAskLock(); // ask.jsx: the locked answer now shows
  render();
}

// Leaving Clinica locks the records again (the design also locks after 5 idle minutes).
export const HEALTH_SCREENS = ['health', 'hvisits', 'hvisit', 'hfollow', 'hrx', 'hrxd', 'hpharm', 'hlabs', 'hreport', 'hfile', 'hreviewing', 'mtlist', 'mtmed', 'mtdose'];
document.addEventListener('visibilitychange', () => {
  if (document.hidden || !S.unlocked || !HEALTH_SCREENS.includes(S.screen)) return;
  // W16: unlocking returns to the screen that was open (e.g. the report), not Health's main screen.
  Object.assign(S, { unlocked: false, lockWhy: 'left', afterUnlock: S.screen, lockStack: S.stack, stack: [], screen: 'hlocked', bio: null, sheet: null });
  render();
});

// A PDF of the report, through the browser's own save prompt.
export function downloadReport(l) {
  const lines = ['City Hospital Laboratory', // the PDF stays English: its built-in Helvetica has no Devanagari
    'Maharajgunj, Kathmandu', `${l.title} - ${l.date}`, `Patient: ${S.fullName} - CH-2381`, '', l.words, l.by];
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
  openSys({ title: `${l.title} report.pdf`, sub: tr("Saved to your phone's Files."), confirm: tr('Open file'), href: url }); // the phone's own save prompt
}

export const PIN_SCREENS = ['pincreate', 'pinconfirm', 'pin', 'pinnew', 'pinnewconfirm', 'pfpin'];

// F25/R26: taps that land while the fourth digit is moving on (pincreate → pinconfirm) are kept and replayed on the next screen.
let pinBuf = [];
export function pinDigit(d) {
  if (S.pinEntry.length >= 4) { pinBuf.push(d); return; }
  if (S.pinErr || S.pinMismatch) { S.pinErr = false; S.pinMismatch = false; S.pinEntry = ''; }
  S.pinEntry += d;
  render();
  if (S.pinEntry.length === 4) after(() => { // the fourth digit moves on; there is no button
    const buf = pinBuf; pinBuf = [];
    pinComplete();
    if (PIN_SCREENS.includes(S.screen) || S.sheet === 'askpin') buf.forEach(pinDigit);
  }, 180);
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
      S.pinChanged = S.afterUnlock === 'pflock' && !!S.pin; S.pin = e; if (S.pinChanged) toast(tr('PIN changed.')); else if (S.afterUnlock === 'pflock') toast(tr('PIN set.')); /* W03 */ return unlock(); // then straight back into Health, or to Health lock
    case 'pfpin': // care.jsx — Switch person
      if (e === pinOf(S.switchTo)) return switchTo(S.switchTo, e);
      if (RECORDS[S.switchTo].managedBy === S.fullName && e === (S.pin || '1234')) return switchTo(S.switchTo); // F14/R11: the caregiver's own PIN
      S.pinErr = true; return render();
    case 'pin':
      if (e === S.pin && S.fingerChanged) { // a new fingerprint on the phone: the opt-in asks again, since the risk has changed
        Object.assign(S, { fingerChanged: false, finger: null, pinErr: false, pinTries: 5, stack: [], screen: 'finger' });
        return render();
      }
      if (e === S.pin || (managedBy() && [S.fullName, managedBy()].some(n => e === pinOf(RECORDS.findIndex(r => r.name === n))))) return unlock(); // F14/R11: caregiver's PIN or their own
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
  // T03: Home's "Lab report ready" opens the newest ready report (S.labs runs newest first), as the notification does (care.jsx).
  // W11: a follow-up from a report: reason filled in from the report, tagged as a follow-up, and a clash with an existing visit is flagged (booking.jsx fuClash).
  'report-fu': () => { const l = labOf(S.report);
    Object.assign(S, { doc: 'ps', day: 0, time: null, fuOf: S.report, reason: `Follow-up on my ${l.title} from ${l.date.replace(/, \d{4}$/, '')}. Dr. Sharma asked to see me.` }); go('doctor'); },
  'lab-ready': () => { S.report = S.labs.find(k => !labOf(k).reviewing) || S.report; openHealth('hreport'); },
  'unlock-start': () => {
    if (!S.pin && !managedBy()) return go('pincreate'); // first unlock: create the PIN now, when it protects something
    if (managedBy()) return go('pin'); // F14/R11: a managed profile opens with the caregiver's PIN, no new one to make
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
  hlabs: s => !s.labs.length ? 'HM12' : s.labs.includes('cbc') ? 'H08' : 'HM04', hreport: s => s.report === 'hba1c' ? 'HM03' : s.report === 'hba1cJun' ? 'H09b' : 'H09', hreviewing: () => 'H10', hempty: () => 'H11',
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
    ['H09b', 'Report detail — trend', 'A test done more than once', "HbA1c, Jun 20 and Aug 24: previous → latest with dates, the direction in words and an arrow, and a small line for those who read one. Nothing relies on colour. The doctor's history shows the same trend.", () => ({ screen: 'hreport', stack: ['health', 'hlabs'], report: 'hba1cJun', ...U })], // Phase 8
  ]],
  ['Health — unhappy paths', [
    ['H10', 'Report being reviewed', 'Branch from 08 — a report not yet released', 'Results reach the patient after the doctor sees them. The screen says why, and points to the phone if they feel worse.', () => ({ screen: 'hreviewing', stack: ['health', 'hlabs'], ...U })],
    ['H11', 'No visits yet', 'Replaces 02 for a new patient', 'Nothing to lock yet, and one way forward: book the first visit.', () => ({ screen: 'hempty', healthEmpty: true, meds: [] })],
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
