// Clinica — Ask: the Assistant tab.
// Figma: zw3saW6ot26E6gWH20K3ux, section 158:4493. Plugs into core.jsx (SCREENS, mount, ACTIONS, FLOW, NUM)
// and reuses pieces from booking.jsx and health.jsx.
import { Fragment, createElement } from 'react';
import { Phone, btn, empty, heading, homeInd, start, statusBar, support } from './app.jsx';
import { DOCTORS, bar, iconBtn, label, navBar, row, rows, tag, when } from './booking.jsx';
import { emergency, notice, openCal } from './care.jsx';
import { $phone, A, ACTIONS, FLOW, NUM, ORDER, S, SCREENS, after, back, extraState, go, mount, paint, render } from './core.jsx';
import { RX, RX2, VISITS, centred, field, lbl, lead, medText, unlock } from './health.jsx';
import { chip, img, now, patients, person, results } from './staff.jsx';

export const EXTRA_STATE_ASK = () => ({
  askSeen: false, chat: [], askUnlocked: false, askInput: '', listening: false, offline: false,
  followup: null, askDay: 1, askTime: null, askQuestion: 'When can I stop taking paracetamol?',
});
extraState(EXTRA_STATE_ASK, ORDER.ask);

export const CHIPS = [
  ['icon-clipboard-action-18.svg', 'Prepare for my visit'],
  ['icon-location-action-18.svg', 'Where do I go?'],
  ['icon-document-action-18.svg', 'Summarise my last visit'],
  ['icon-calendar-action-18.svg', "What's coming up?"],
];
export const FOLLOW_DAYS = [['Wed', 'Sep 10'], ['Thu', 'Sep 11'], ['Fri', 'Sep 12'], ['Sat', 'Sep 13', true], ['Sun', 'Sep 14'], ['Mon', 'Sep 15'], ['Tue', 'Sep 16']];
export const FOLLOW_TIMES = [['9:00 AM', true], ['10:30 AM'], ['11:00 AM'], ['3:30 PM'], ['4:00 PM', true], ['4:30 PM']];
export const HEALTH_KEYS = ['lastvisit', 'visit12', 'which', 'rx', 'report', 'result', 'reviewing']; // these open through the lock
export const FB_KEYS = ['coming', 'where', 'lastvisit', 'visit12', 'rx', 'prepare', 'report', 'result', 'reviewing', 'insurance', 'unknown']; // answers that can be rated

// ---------- pieces ----------
export const src = (icon, text) => <p className="source"><img src={`${A}${icon}`} width="16" height="16" alt="" />{text}</p>;
export const acts = (...b) => createElement('div', { className: 'ans-acts' }, ...b);
export const obtn = (label, act) => <button className="btn secondary l hug" data-act={act}>{label}</button>;
export const ocall = label => <a className="btn secondary l hug" href="tel:+97710000000">{label}</a>;
export const say = t => <p className="ans-p">{t}</p>;
export const chipRow = items => <div className="chips">{items.map(([i, t, a]) => { const ic = i ? <img src={`${A}${i}`} width="18" height="18" alt="" /> : null;
  return a.startsWith('tel:') ? <a key={t} className="chip" href={a}>{ic}{t}</a> : <button key={t} className="chip" data-act={a}>{ic}{t}</button>; })}</div>;
export const words = (who, text) => <div className="words"><span className="bar"></span><div><p className="w-who">{who} wrote</p><p className="w-text">{text}</p></div></div>;
export const noteCard = (icon, title, body, cls = '', extra = null) => <div className={`card notice-row ${cls}`}>{icon ? lead(icon) : null}
  <div className="nr-t"><div className="text"><p className="h-s">{title}</p><p className="body-s">{body}</p></div>{extra}</div></div>;
export const visitCard = (when, where, act) => { const T = act ? 'button' : 'div'; return <T className="card appt" data-act={act || undefined}>
  <span className="avatar l">PS</span>
  <span className="appt-t"><span className="h-s">Dr. Priya Sharma</span><span className="when">{when}</span><span className="where">{where}</span></span>
  {act ? <img src={`${A}icon-chevron-right.svg`} width="20" height="20" alt="" /> : null}</T>; };
export const todayCard = link => { const a = S.appt; return visitCard(when(a.day, a.time), `${DOCTORS[a.doc].spec}, ${DOCTORS[a.doc].opd}`, link && 'appt:today'); };
export const followCard = f => visitCard(`${f.day}, ${f.time}`, 'Follow-up, OPD 2', S.followup === f && 'appt:fu'); // an old snapshot links nowhere

// App bar, Chat shape: back arrow and its label as one tap target, title centred. The Assistant home (no action) shows the arrow alone (Figma 633:30822).
export const chatBar = (action = true) => (
  <div className="appbar chat">
    <div className="side"><a href="#" className="back-l" data-act="home" aria-label={action ? undefined : 'Back'}><span className="icon-btn"><img src={`${A}icon-back.svg`} width="24" height="24" alt="" /></span>{action ? 'Home' : null}</a></div>
    <div className="c-title">Ask</div>
    <div className="side end">{action ? iconBtn('icon-add-24.svg', 'New conversation', 'ask-new') : <div className="slot"></div>}</div>
  </div>);

// Input bar: Voice beside the field; Send stays disabled until there is a question.
export function inputBar() {
  const typed = S.askInput.trim();
  return <div className="ask-input">
    <div className="ib-row">
      {S.listening
        ? <div className="ib-field" role="status">Listening…</div>
        : <input className="ib-in" id="ask-in" placeholder="Ask about your care" aria-label="Ask about your care" autoComplete="off" value={S.askInput}
            onChange={e => { S.askInput = e.target.value; paint(); }} onKeyDown={e => { if (e.key === 'Enter') ask(e.target.value); }} />}
      <button className={`ib-btn ${S.listening ? 'voice' : 'ghost'}`} data-act="ask-voice" aria-pressed={S.listening} aria-label={S.listening ? 'Stop listening' : 'Ask by voice'}>
        <img src={`${A}icon-mic${S.listening ? '-white' : ''}-24.svg`} width="24" height="24" alt="" /></button>
      <button className={`ib-btn ${typed ? 'send' : ''}`} id="ask-send" data-act="ask-send" aria-label="Send" disabled={!typed}>
        <img src={`${A}icon-send-${typed ? 'white' : 'disabled'}-24.svg`} width="24" height="24" alt="" /></button>
    </div>
    <p className="body-s tertiary" style={{ textAlign: 'center' }}>Answers come from your Clinica records, not a doctor.</p>
  </div>;
}

// ---------- answers ----------
export function answer(turn) {
  const k = turn.key;
  const fu = 'fu' in turn ? turn.fu : S.followup; // an answer stays as it was when it was given
  switch (k) {
    case 'coming': {
      return [say(fu ? 'You have two visits coming up.' : 'You have one visit coming up.'), todayCard(true), fu ? followCard(fu) : null,
        src('icon-calendar-tertiary-16.svg', 'From your appointments'), acts(obtn('View appointments', 'care-tab'))];
    }
    case 'where': return [say('Go to OPD 2 at City Hospital. Arrive by 4:15 PM and check in at reception.'), todayCard(true),
      src('icon-calendar-tertiary-16.svg', 'From your appointments'), acts(obtn('View appointment', 'appt:today'))];
    case 'lock': return [say("That's in your health records, which are locked on this phone."),
      noteCard('lt-lock.svg', 'Enter your Clinica PIN', 'On a shared phone, your records stay locked until you enter your PIN.', '',
        <button className="btn secondary l" data-act="ask-unlock">Unlock with PIN</button>)];
    case 'lastvisit': return [say('Your visit with Dr. Priya Sharma on Aug 28, General medicine.'),
      words('Dr. Priya Sharma', 'A viral infection. Rest, drink plenty of fluids, and take paracetamol for the fever. Come back if the fever lasts more than 3 days.'),
      <div className="card">{lead('lt-rx.svg')}{medText({ ...RX[0], how: '1 tablet, three times a day, after food' })}</div>,
      say(fu ? `Your follow-up is booked for ${fu.day}, ${fu.time}.` : "A follow-up in 2 weeks isn't booked yet."),
      src('icon-description-16.svg', 'From your visit on Aug 28'),
      acts(obtn('View visit', 'ask-visit:aug28'), fu ? null : obtn('Book follow-up', 'ask-book'))];
    // When a question could mean two records, Ask asks rather than guesses.
    case 'which': return [say('You had two visits in August. Which one do you mean?'),
      chipRow([['icon-calendar-action-18.svg', 'Aug 28 · Dr. Priya Sharma', 'ask-chip:Aug 28 · Dr. Priya Sharma'], ['icon-calendar-action-18.svg', 'Aug 12 · Dr. Ramesh Shrestha', 'ask-chip:Aug 12 · Dr. Ramesh Shrestha']])];
    case 'visit12': return [say('Your visit with Dr. Ramesh Shrestha on Aug 12, General medicine.'),
      words('Dr. Ramesh Shrestha', VISITS.aug12.words), <div className="card">{lead('lt-rx.svg')}{medText(RX2[0])}</div>,
      say('No follow-up was needed.'), src('icon-description-16.svg', 'From your visit on Aug 12'), acts(obtn('View visit', 'ask-visit:aug12'))];
    case 'nocatch': return [say("I didn't catch that. Try again a little closer to the phone, or type your question."),
      chipRow([['icon-mic-action-18.svg', 'Speak again', 'ask-voice'], ['', 'Type instead', 'ask-type']])];
    case 'sorry': return [say('Sorry about that. Try asking another way, or call the clinic — reception can help.'),
      chipRow([['', 'Ask another way', 'ask-type'], ['icon-call-action-18.svg', 'Call the clinic', 'tel:+97710000000']])];
    case 'rx': return [say('Your latest prescription is from Dr. Priya Sharma on Aug 28.'),
      noteCard('lt-document.svg', 'Prescription, Aug 28', 'Paracetamol 500 mg, cetirizine 10 mg', 'nowrap-b'),
      src('icon-description-16.svg', 'From your visit on Aug 28'),
      acts(obtn('View prescription', 'ask-open:hrxd'), obtn('Show to pharmacist', 'ask-open:hpharm'))];
    case 'prepare': return [say("It's today at 4:30 PM, with Dr. Priya Sharma."),
      noteCard('lt-clipboard.svg', 'Before you go', "Bring the medicines you're taking and any recent reports. Arrive by 4:15 PM and check in at reception."),
      noteCard('lt-help.svg', 'You could ask Dr. Sharma', 'When will I feel better? When should I come back? What should make me call the clinic?', 'filled'),
      acts(obtn('View appointment', 'appt:today'), obtn('Add a question', 'ask-q'))];
    case 'report': return [say('Your latest report is the thyroid panel from Jul 3. Dr. Anita Joshi has reviewed it.'),
      noteCard('lt-lab.svg', 'Thyroid panel', 'Jul 3, City Hospital lab', '', tag('Ready', 'success')),
      src('icon-lab-tertiary-16.svg', 'From your lab reports'), acts(obtn('View report', 'ask-open:hreport'))];
    case 'result': return [say("I can't read results, but Dr. Anita Joshi reviewed this report and wrote:"),
      words('Dr. Anita Joshi', 'Your thyroid levels are normal. No change to your treatment.'),
      src('icon-lab-tertiary-16.svg', 'From your thyroid panel, Jul 3'), acts(obtn('View report', 'ask-open:hreport'))];
    case 'reviewing': return [say("Your CBC report is still with Dr. Priya Sharma. You'll get it with her explanation, and we'll message you when it's ready."),
      noteCard('lt-lab.svg', 'CBC blood test', 'Aug 28, City Hospital lab', '', tag('Being reviewed', 'neutral')),
      <p className="ans-warn">If you feel worse, don't wait for the report — call the clinic.</p>, acts(ocall('Call the clinic'))];
    case 'insurance': return [say("Clinica doesn't keep insurance details, so I can't find them here. Reception at City Hospital can help."), acts(ocall('Call City Hospital'))];
    case 'unknown': return [say("I can't find that in your Clinica records. Reception at City Hospital can help."), acts(ocall('Call City Hospital'))];
    case 'offline': return [say("You're offline, so I can't look anything up. Here's your next visit, saved when you were last online:"),
      todayCard(true), src('icon-wifi-off-16.svg', 'Saved at 9:12 AM')];
    case 'offline-only': return [say("You're offline, so I can't look anything up.")];
    case 'booked': return [say("Your follow-up is booked. We've sent the details by SMS."), followCard(fu),
      src('icon-calendar-tertiary-16.svg', 'From your appointments'),
      acts(obtn('View appointment', 'appt:fu'), S.cal.fu ? null : obtn('Add to calendar', 'ask-cal'))];
    case 'qsaved': return [say(`Saved with your health records, for today's ${S.appt.time} visit with Dr. Sharma.`),
      noteCard('', 'Your question for Dr. Sharma', turn.text, 'filled'),
      acts(obtn('View appointment', 'appt:today'), obtn('Add another', 'ask-q'))];
  }
  return [];
}

// The Safety card: first and alone, and calling 102 is the first action.
export const safetyCard = () => <div className="safety" role="alert">
  <div className="sf-h"><img src={`${A}icon-emergency-error-24.svg`} width="24" height="24" alt="" /><p className="h-s">If it's severe, call 102 now</p></div>
  <p className="sf-b">Call 102 for an ambulance if the pain is severe or spreads to your arm or jaw, or if you're short of breath.</p>
  <p className="body-s">I can't check symptoms, but the clinic can help.</p>
  <a className="btn primary" href="tel:102"><img src={`${A}icon-call-on-action-24.svg`} width="24" height="24" alt="" />Call 102</a>
  <a className="btn secondary" href="tel:+97710000000"><img src={`${A}icon-call.svg`} width="24" height="24" alt="" />Call City Hospital</a>
</div>;

// Asks about the answer, not the doctor's words. Only the rating is sent — never the conversation.
export const feedback = t => t.fb === 'yes' ? <p className="body-s">Thanks — that helps us improve Ask.</p> : <div className="fb">
  <p className="fb-q">Was this what you needed?</p>{chipRow([['', 'Yes', 'ask-fb:yes'], ['', 'No', 'ask-fb:no']])}
  <p className="body-s tertiary">Only your answer is sent — not this conversation.</p></div>;
export const rateable = (t, i) => i === S.chat.length - 1 && FB_KEYS.includes(t.key) && t.fb !== 'hide' && t.fb !== 'no';

export function turnHtml(t, i) {
  const q = t.q ? <div className="inset"><div className="qb"><p>{t.q}</p></div></div> : null;
  if (t.pending) return q;
  const a = t.key === 'urgent' ? safetyCard() : <div className="answer">{answer(t).map((x, j) => <Fragment key={j}>{x}</Fragment>)}{rateable(t, i) || t.fb === 'yes' ? feedback(t) : null}</div>;
  return <>{q}<div className="inset">{a}</div></>;
}

// ---------- routing a question ----------
export function keyFor(text) {
  const q = text.toLowerCase();
  if (/chest pain|can't breathe|short of breath|breathing|bleeding|faint|unconscious|stroke|seizure|emergency|severe/.test(q)) return 'urgent';
  let k;
  if (/aug(ust)? 12|shrestha/.test(q)) k = 'visit12';
  else if (/aug(ust)? 28/.test(q)) k = 'lastvisit';
  else if (/in august|which visit/.test(q)) k = 'which';
  else if (/where do i go|where.*(go|opd)|direction/.test(q)) k = 'where';
  else if (/coming up|next visit|next appointment|when is my/.test(q)) k = 'coming';
  else if (/prepare|before my visit/.test(q)) k = 'prepare';
  else if (/summar|last visit|doctor (said|told)/.test(q)) k = 'lastvisit';
  else if (/prescription|medicine/.test(q)) k = 'rx';
  else if (/thyroid|result|normal/.test(q)) k = 'result';
  else if (/blood|cbc/.test(q)) k = 'reviewing';
  else if (/report|test/.test(q)) k = 'report';
  else if (/insurance/.test(q)) k = 'insurance';
  else k = 'unknown';
  if (S.offline) return ['coming', 'where', 'prepare'].includes(k) ? 'offline' : 'offline-only';
  return k;
}

export function ask(text) {
  text = text.trim();
  if (!text) return;
  const key = keyFor(text);
  const locked = HEALTH_KEYS.includes(key) && !S.askUnlocked; // the Assistant doesn't bypass the lock
  S.chat.push({ q: text, key: locked ? 'lock' : key, pending: true, then: locked ? key : null, fu: S.followup });
  S.askInput = ''; S.listening = false; S.askSeen = true; S.screen = 'ask';
  render();
  after(() => { S.chat.at(-1).pending = false; render(); }, 600); // answer arrives
}

// Called by health.jsx unlock() when the PIN was asked for from a conversation.
export function resolveAskLock() {
  S.askUnlocked = true; // lasts until the conversation clears
  const t = [...S.chat].reverse().find(x => x.key === 'lock' && x.then);
  if (t) { t.key = t.then; t.then = null; }
  render();
}

// ---------- screens ----------
Object.assign(SCREENS, {
  askfirst: () => (
    <div className="screen">
      {statusBar()}{bar({ back: false, title: 'Ask' })}
      <div className="body g20">
        <div className="inset">{noteCard('', 'Messages is now Ask', 'To reach a person at the clinic, call reception.', 'info')}</div>
        {heading('Ask about your care', 'Find, summarise and prepare, from your own records at City Hospital.')}
        {rows([row('lt-calendar.svg', "What's coming up", 'And where to go when you arrive'), row('lt-document.svg', 'What your doctor told you', 'In their own words'),
          row('lt-clipboard.svg', 'What to do next', 'And how to prepare for a visit')])}
        <div className="inset"><p className="ask-limit">It isn't a doctor. It can't check symptoms or give medical advice — for that, call the clinic, or 102 in an emergency.</p></div>
      </div>
      <div className="cta">{btn('Start', 'ask-start')}</div>
      {homeInd()}
    </div>),

  ask: () => {
    if (!S.chat.length) return (
    <div className="screen">
      {statusBar()}{chatBar(false)}
      <div className={`body g20 ${S.listening ? 'inert' : ''}`}>
        <div className="inset"><p className="lede">Here's what's coming up.</p></div>
        {S.micPerm === 'denied' ? <div className="inset voice-off"><p className="body-s">Voice is off. You can still type.</p><button className="btn secondary s" data-act="os:Phone settings">Settings</button></div> : null}
        <div className="inset stack8">{lbl('Today')}{todayCard(true)}</div>
        <div className="inset stack8">{lbl('You could ask')}
          <div className="chips">{CHIPS.map(([i, t]) => <button key={t} className="chip" data-act={`ask-chip:${t}`} tabIndex={S.listening ? -1 : undefined}><img src={`${A}${i}`} width="18" height="18" alt="" />{t}</button>)}</div></div>
      </div>
      {inputBar()}
      {homeInd()}
    </div>);
    return (
    <div className="screen">
      {statusBar()}{chatBar()}
      <div className="thread" id="thread"><div className="thread-in">{S.chat.map((t, i) => <Fragment key={i}>{turnHtml(t, i)}</Fragment>)}</div></div>
      {inputBar()}
      {homeInd()}
    </div>);
  },

  askempty: () => (
    <div className="screen">
      {statusBar()}{bar({ back: false, title: 'Ask' })}
      {centred(empty('icon-help-28.svg', 'Nothing to look up yet',
        'After your first visit, I can find your notes, medicines and reports. For now, I can help you book one.',
        btn('Book a visit', 'go:finddoctor', { size: 'l' })))}
      {inputBar()}
      {navBar('Ask')}
    </div>),

  askbook: () => {
    const can = S.askTime && !FOLLOW_TIMES.find(t => t[0] === S.askTime)[1];
    const [wd, date] = FOLLOW_DAYS[S.askDay];
    return (
    <div className="screen">
      {statusBar()}{bar({ title: 'Book follow-up' })}
      <div className="body g20">
        <div className="inset"><div className="card"><span className="avatar">PS</span>
          <span className="text doctor"><span className="h-s">Dr. Priya Sharma</span><span className="spec">General medicine</span>{tag('Follow-up from your Aug 28 visit', 'neutral')}</span></div></div>
        <div className="inset stack8">{lbl('Choose a day')}
          <div className="hscroll days" role="radiogroup" aria-label="Day">{FOLLOW_DAYS.map(([d, dt, closed], i) =>
            <button key={i} className="pick day" role="radio" aria-checked={i === S.askDay} disabled={!!closed} data-act={`ask-day:${i}`} aria-label={`${d}, ${dt}${closed ? ', closed' : ''}`}><span className="d1">{d}</span><span className="d2">{dt}</span></button>)}</div></div>
        <div className="inset stack8">{lbl('Choose a time')}
          <div className="times" role="radiogroup" aria-label="Time">{FOLLOW_TIMES.map(([t, off]) =>
            <button key={t} className="pick time" role="radio" aria-checked={t === S.askTime} disabled={!!off} data-act={`ask-time:${t}`} aria-label={`${t}${off ? ', taken' : ''}`}>{t}</button>)}</div></div>
      </div>
      <div className="cta">{btn(can ? `Book ${wd}, ${date}, ${S.askTime}` : 'Choose a time', 'ask-booked', { disabled: !can })}</div>
      {homeInd()}
    </div>);
  },

  askq: () => (
    <div className="screen">
      {statusBar()}{bar({ title: 'Add a question' })}
      <div className="body g20">
        {heading('What would you like to ask Dr. Sharma?', "Write it down now so you don't forget it at your visit.")}
        <div className="inset"><div className="field-wrap">
          <label className="label" htmlFor="askq" style={{ lineHeight: '20px' }}>Your question</label>
          <div className="field textarea"><textarea id="askq" value={S.askQuestion} onChange={e => { S.askQuestion = e.target.value; paint(); }}></textarea></div>
          {support('Kept with your health records, behind your Clinica PIN. Not sent to the clinic.')}
        </div></div>
      </div>
      <div className="cta">{btn('Save question', 'ask-save')}</div>
      {homeInd()}
    </div>),
});

// ---------- behaviour ----------
Object.assign(mount, {
  ask: () => {
    const t = document.getElementById('thread');
    if (t) t.scrollTop = t.scrollHeight; // newest at the bottom, above the input bar
    if (S.listening) after(() => ask("What's coming up?"), 2200); // stand-in for speech recognition
  },
  askbook: () => $phone().querySelector('.days [aria-checked="true"]')?.scrollIntoView({ block: 'nearest', inline: 'nearest' }),
});

Object.assign(ACTIONS, {
  'ask-tab': () => {
    S.stack = []; S.listening = false;
    S.screen = S.healthEmpty ? 'askempty' : S.askSeen ? 'ask' : 'askfirst';
    render();
  },
  'ask-start': () => { S.askSeen = true; S.screen = 'ask'; render(); },
  'ask-chip': arg => ask(arg), // tapping a suggestion reads exactly like asking it
  'ask-send': () => ask(S.askInput),
  'ask-voice': () => {
    if (S.listening) { S.listening = false; S.askSeen = true; S.screen = 'ask'; S.chat.push({ q: null, key: 'nocatch' }); return render(); } // stopped before anything was heard
    if (!S.micPerm) { S.sheet = 'micperm'; return render(); } // the first tap: the phone's own prompt
    if (S.micPerm === 'denied') return render();
    S.listening = true; render();
  },
  'mic-allow': () => { Object.assign(S, { micPerm: 'granted', sheet: null, listening: true }); render(); },
  'mic-deny': () => { Object.assign(S, { micPerm: 'denied', sheet: null }); render(); }, // voice is off; typing still works
  'ask-type': () => document.getElementById('ask-in')?.focus(),
  'ask-visit': arg => { S.visit = arg; go('hvisit'); },
  'ask-fb': arg => {
    const t = S.chat.at(-1); t.fb = arg;
    if (arg === 'no') S.chat.push({ q: null, key: 'sorry' }); // offer something useful instead
    render();
  },
  'ask-new': () => { S.chat = []; S.askUnlocked = false; S.askInput = ''; render(); }, // clears the conversation, and the unlock with it
  'ask-unlock': () => { S.afterUnlock = 'ask'; if (!S.pin) return go('pincreate'); Object.assign(S, { sheet: 'askpin', pinEntry: '', pinErr: false }); render(); }, // a sheet over the conversation
  'ask-open': arg => go(arg), // records open through the unlock this conversation already has
  'ask-book': () => { S.askDay = 1; S.askTime = null; go('askbook'); },
  'ask-day': arg => { S.askDay = +arg; S.askTime = null; render(); },
  'ask-time': arg => { S.askTime = arg; render(); },
  'ask-booked': () => { // the patient books it; the Assistant never books on its own
    const [wd, date] = FOLLOW_DAYS[S.askDay];
    S.followup = { day: `${wd}, ${date}`, time: S.askTime, iso: [2026, 8, 10 + S.askDay] };
    if (S.stack.at(-1) === 'ask') S.chat.push({ q: 'Book follow-up', key: 'booked', fu: S.followup }); // also booked from Care, C10
    S.cal.fu = false;
    back(); // back to the conversation, which now records the booking
  },
  'ask-cal': () => openCal('fu'),
  'ask-q': () => go('askq'),
  'ask-save': () => {
    const text = S.askQuestion.trim();
    if (!text) return;
    S.chat.push({ q: null, key: 'qsaved', text });
    S.askQuestion = '';
    back();
  },
});

export const LAST_NUM = { which: 'AM02', nocatch: 'AM05', sorry: 'AM07', visit12: 'A06', coming: 'A04', lock: 'A05', lastvisit: 'A06', rx: 'A07', prepare: 'A08', report: 'A09', booked: 'A11', urgent: 'A12',
  result: 'A13', reviewing: 'A14', insurance: 'A15', offline: 'A16', qsaved: 'A19' };
Object.assign(NUM, {
  askfirst: () => 'A01',
  ask: s => s.sheet === 'askpin' ? 'AM01' : s.sheet === 'micperm' ? 'AM03' : s.chat.length
    ? (t => t.fb === 'yes' ? 'AM08' : t.key === 'lastvisit' && rateable(t, s.chat.length - 1) ? 'AM06' : LAST_NUM[t.key])(s.chat.at(-1))
    : s.listening ? 'A03' : s.micPerm === 'denied' ? 'AM04' : s.askInput.trim() ? 'A20' : 'A02',
  askbook: () => 'A10', askempty: () => 'A17', askq: () => 'A18',
});

export const T = (q, key, extra = {}) => ({ q, key, fb: 'hide', ...extra }); // Figma's A-screens predate the rating
export const ASK = { screen: 'ask', askSeen: true };
export const FU = { day: 'Thu, Sep 11', time: '10:30 AM', iso: [2026, 8, 11] };
FLOW.push(
  ['Ask — starting', [
    ['A01', 'First open', 'First time the tab opens', "Says what it does and what it isn't. Existing users learn Messages is now Ask — and how to reach a person.", () => ({ screen: 'askfirst' })],
    ['A02', 'Assistant home', 'Start', "Today's visit from real data, and suggestions chosen from the patient's own state. No persona, no sparkle — and no greeting; back is the arrow alone.", () => ({ ...ASK })],
    ['A03', 'Asking by voice', 'Speaks a question', 'Voice sits beside the field, not behind a menu. Many patients will speak rather than type — in Nepali, English or both.', () => ({ ...ASK, listening: true })],
    ['A04', "What's coming up", 'Answer arrives', 'A conversation is full screen: the bottom nav hides, and ← Home leaves it for the Home tab. One sentence answers; the facts are the same appointment cards as Care. Source named, one neutral action.', () => ({ ...ASK, followup: FU, chat: [T("What's coming up?", 'coming')] })],
  ]],
  ['Ask — records and preparing', [
    ['A05', 'Health unlock', 'The answer needs Health records', "The Assistant doesn't bypass the lock. Records ask for the Clinica PIN inline, before any answer.", () => ({ ...ASK, pin: '1234', followup: null, chat: [T('Summarise my last visit', 'lock', { then: 'lastvisit' })] })],
    ['A06', 'Visit summary', 'After unlocking', "The doctor's words quoted, never paraphrased; the medicine as its card; the source; two neutral actions.", () => ({ ...ASK, askUnlocked: true, followup: null, chat: [T('Summarise my last visit', 'lastvisit')] })],
    ['A07', 'Find my prescription', 'Unlocked earlier in the conversation', 'The prescription as a card, with a route to the pharmacist view. Strengths never break across lines. Health was unlocked earlier in this conversation; the unlock lasts until the conversation clears.', () => ({ ...ASK, askUnlocked: true, chat: [T('Find my prescription', 'rx')] })],
    ['A08', 'Prepare for a visit', 'Prepare for my visit', 'Suggestions, not ticks — nothing here is done yet. The questions to ask include when to call the clinic.', () => ({ ...ASK, chat: [T('Prepare for my visit', 'prepare')] })],
    ['A09', 'Find a record', 'Unlocked earlier in the conversation', 'Navigation, not interpretation: where the report is, that the doctor has reviewed it, and a way to open it. Health was unlocked earlier in this conversation; the unlock lasts until the conversation clears.', () => ({ ...ASK, askUnlocked: true, chat: [T("Where's my latest test report?", 'report')] })],
  ]],
  ['Ask — taking action', [
    ['A10', 'Book follow-up', 'From 06 — Book follow-up', 'Pushed on the Ask stack with Dr. Sharma filled in. The patient chooses the time and books it; the Assistant never books on its own.', () => ({ screen: 'askbook', stack: ['ask'], askSeen: true, askUnlocked: true, followup: null, askDay: 1, askTime: '10:30 AM', chat: [T('Summarise my last visit', 'lastvisit')] })],
    ['A11', 'Follow-up booked', 'Books the time', 'Back returns to the conversation, which now records the booking.', () => ({ ...ASK, askUnlocked: true, followup: FU, chat: [T('Summarise my last visit', 'lastvisit', { fu: null }), T('Book follow-up', 'booked')] })],
  ]],
  ['Ask — safety and edge cases', [
    ['A12', 'Safety route', 'Urgent symptoms', 'The Safety card, first and alone. Calling 102 is the first action.', () => ({ ...ASK, chat: [T('I have chest pain', 'urgent')] })],
    ['A13', 'Result question', 'Unlocked earlier in the conversation', "It can't read results. It shows what the reviewing doctor wrote, quoted and attributed. Health was unlocked earlier in this conversation; the unlock lasts until the conversation clears.", () => ({ ...ASK, askUnlocked: true, chat: [T('Is my thyroid result normal?', 'result')] })],
    ['A14', 'Report under review', 'Report not yet released', 'Names the report, reveals nothing of it, and points to the phone if the patient feels worse. Health was unlocked earlier in this conversation; the unlock lasts until the conversation clears.', () => ({ ...ASK, askUnlocked: true, chat: [T('What does my blood test show?', 'reviewing')] })],
    ['A15', "Can't find it", 'Outside what Clinica holds', "Says so honestly and points to who can help. No 'Try again' — retrying wouldn't change the answer.", () => ({ ...ASK, chat: [T('Show me my insurance details', 'insurance')] })],
    ['A16', 'Offline', 'No connection', "What was saved, and when. It says plainly it can't look anything up.", () => ({ ...ASK, offline: true, chat: [T('When is my next visit?', 'offline')] })],
    ['A17', 'Nothing yet', 'A new patient', 'Nothing to look up yet, and one way forward: book a visit.', () => ({ screen: 'askempty', healthEmpty: true })],
    ['A18', 'Add a question', 'From 08 — Add a question', "Pushed on the Ask stack. The field says where the question goes: with the health records, behind the PIN, and not sent to the clinic — there's no message channel, so nothing implies the doctor will read it ahead.", () => ({ screen: 'askq', stack: ['ask'], askSeen: true, chat: [T('Prepare for my visit', 'prepare')] })],
    ['A19', 'Question saved', 'Back in the conversation', "Back in the conversation, with the question and when to use it: at today's visit.", () => ({ ...ASK, chat: [T('Prepare for my visit', 'prepare'), T(null, 'qsaved', { text: 'When can I stop taking paracetamol?' })] })],
    ['A20', 'Typing a question', 'From 02 — tapping the field', 'In Figma the field shows a question already typed, with Send active. Here you can really type; Send gives the same answer as the suggestion.', () => ({ ...ASK, askInput: "What's coming up?" })],
  ]],
);
