// Clinica — Care, Profile, Notification centre and Add to calendar.
// Figma: zw3saW6ot26E6gWH20K3ux, section 542:19194. Plugs into app.js (SCREENS, mount, ACTIONS, FLOW, NUM, OVERLAY)
// and reuses pieces from booking.js, health.js and ask.js.

const MAPS = 'https://www.google.com/maps/search/?api=1&query=City+Hospital+Maharajgunj+Kathmandu';
const CAL_NOTE = 'Check in at reception 15 minutes early. Details are in the Clinica app.';
const NOTIFS = [
  { g: 'Today', icon: 'lt-schedule.svg', t: 'Dr. Sharma is running late', b: "Your 4:30 PM slot is kept. We'll message you when she's ready.", when: '10 min ago', go: 'late' },
  { g: 'Today', icon: 'lt-lab.svg', t: 'A lab report is ready', b: 'Open Health to see it.', when: '2 hours ago', go: 'hreport' },
  { g: 'Earlier', icon: 'lt-calendar.svg', t: 'Your visit is tomorrow', b: '4:30 PM with Dr. Priya Sharma at OPD 2. Arrive by 4:15 PM.', when: 'Yesterday', go: 'today', read: true },
  { g: 'Earlier', icon: 'lt-document.svg', t: 'Your visit notes are ready', b: 'From your visit on Aug 12. Open Health to read them.', when: 'Aug 13', go: 'hvisit', read: true },
];
// Shown, not edited — the clinic's record counts. Other people's details are at reception.
const DETAILS = { 'Anisha Sharma': { dob: '14 / 03 / 1994', sex: 'Female', no: 'CH-2381' } };

const EXTRA_STATE_CARE = () => ({
  followup: { day: 'Thu, Sep 11', time: '10:30 AM', iso: [2026, 8, 11] }, // booked, as Care 01 and Ask 04 show it
  careEmpty: false, visitDay: 'booked', cancelled: null, moved: null,
  rsKey: 'fu', rsDay: null, rsTime: null, rsErr: null, rsTaken: [], rsNone: false, cancelSoon: false,
  cal: { appt: false, fu: false }, calFor: 'appt', calOff: false, notifOff: false,
  nset: { remind: true, late: true, fu: false, labs: true },
  notifs: NOTIFS.map(n => ({ ...n })), switchTo: 1,
});
{ const base = window.EXTRA_STATE; window.EXTRA_STATE = () => ({ ...base(), ...EXTRA_STATE_CARE() }); }
Object.assign(S, EXTRA_STATE_CARE());

// ---------- pieces ----------
const unread = () => !S.healthEmpty && S.notifs.some(n => !n.read);
const sect = (label, inner, gap = 4) => `<div class="sect" style="gap:${gap}px"><div class="inset">${lbl(label)}</div>${inner}</div>`;
const listP = items => `<div class="list">${items.join('<div class="sep page" aria-hidden="true"></div>')}</div>`; // Separator, Page inset
const notice = (tone, title, body, extra = '') => `<div class="card notice ${tone}"><div class="text"><p class="h-s">${title}</p><p class="body-s">${body}</p></div>${extra}</div>`;
const linkRow = (icon, title, sub, href) => `<a class="list-item" href="${href}" ${href.startsWith('http') ? 'target="_blank" rel="noopener"' : ''}>
  ${lead(icon)}<span class="text"><span class="item-title">${title}</span><span class="body-s">${sub}</span></span>${chev}</a>`;
const inCal = row('lt-followup.svg', 'In your calendar', 'Alerts 1 day and 2 hours before'); // iOS reports the save; Android can't
const calBtn = (key, label = 'Add to calendar') => `<button class="btn secondary" data-act="add-cal:${key}"><img src="${A}icon-calendar-add.svg" width="24" height="24" alt="">${label}</button>`;
const dirBtn = (opd = 'OPD 2') => `<a class="btn primary" href="${MAPS}" target="_blank" rel="noopener" data-where="${opd}, City Hospital, Maharajgunj"><img src="${A}icon-map-white-24.svg" width="24" height="24" alt="">Get directions</a>`;
const fuCard = (act = '') => visitCard(`${S.followup.day}, ${S.followup.time}`, 'Follow-up, OPD 2', act);
const switchEl = (on, off) => `<span class="switch ${on ? 'on' : ''}" aria-hidden="true"><span class="thumb">${on ? `<img src="${A}icon-tick-${off ? 'disabled' : 'action'}-16.svg" width="16" height="16" alt="">` : ''}</span></span>`;
const setting = (title, body, on, act, off, tile = '') => `<button class="list-item setting" role="switch" aria-checked="${on}" data-act="${act}" ${off ? 'disabled' : ''}>
  ${tile}<span class="text st"><span class="st-t">${title}</span><span class="body-s">${body}</span></span>${switchEl(on, off)}</button>`;

const frame = (title, body, { cta = '', actions = '', back = true, tab = '', gap = 20 } = {}) => `
  <div class="screen">
    ${statusBar()}${bar({ back, title, actions })}${tab ? offLine() : ''}
    ${body.startsWith('<div class="body"') ? body : `<div class="body" style="gap:${gap}px">${body}</div>`}
    ${cta ? `<div class="cta">${cta}</div>` : ''}
    ${tab ? navBar(tab) : homeInd()}
  </div>`;

// e.g. addMin('4:30 PM', -15) → '4:15 PM'
function addMin(t, m) {
  const [, h, mm, ap] = /(\d+):(\d+) (AM|PM)/.exec(t);
  const x = ((+h % 12) + (ap === 'PM' ? 12 : 0)) * 60 + +mm + m, H = Math.floor(x / 60) % 24;
  return `${H % 12 || 12}:${pad(x % 60)} ${H < 12 ? 'AM' : 'PM'}`;
}
const pinOf = i => RECORDS[i].name === 'Ramesh Sharma' ? '1961' : S.pin || '1234'; // demo PINs

// What the phone's add-event sheet is pre-filled with. Names the clinic, never the doctor or specialty.
function calEvent(key) {
  if (key === 'fu') { const f = S.followup; return { starts: `${f.day}, ${f.time}`, ends: addMin(f.time, 30), iso: f.iso, time: f.time, loc: 'OPD 2, City Hospital, Maharajgunj' }; }
  const a = S.appt;
  return { starts: when(a.day, a.time), ends: addMin(a.time, 30), iso: DAYS[a.day].iso, time: a.time, loc: `${DOCTORS[a.doc].opd}, City Hospital, Maharajgunj` };
}

// Reschedule works for the follow-up (Sep dates, from Ask) and for today's visit (the booking week).
function reschedOpts() {
  if (S.rsKey === 'fu') {
    const f = S.followup, cur = FOLLOW_DAYS.findIndex(([w, d]) => `${w}, ${d}` === f.day);
    return { cur, now: `${f.day}, ${f.time}`, who: 'Dr. Priya Sharma, General medicine',
      days: FOLLOW_DAYS.slice(0, 5).map(([wd, date, off], i) => ({ i, wd, date, off })),
      times: i => FOLLOW_TIMES.map(([t, off]) => ({ t, off: off || (i === cur && t === f.time) || S.rsTaken.includes(`fu|${i}|${t}`) })) };
  }
  const a = S.appt, d = DOCTORS[a.doc], mine = (i, t) => i === a.day && t === a.time;
  return { cur: a.day, now: when(a.day, a.time), who: `${d.name}, ${d.spec}`,
    days: DAYS.map((x, i) => ({ i, wd: x.wd, date: x.date, off: !freeTimes(a.doc, i).some(t => !mine(i, t)) })).slice(1),
    times: i => d.times.map(t => ({ t, off: isTaken(a.doc, i, t) || mine(i, t) })) }; // a slot taken meanwhile goes into S.taken
}

const notifRow = (n, i) => `<button class="list-item" data-act="notif-open:${i}">${n.tile ? `<span class="lead-tile ${n.tile}"><img src="${A}${n.icon}" width="20" height="20" alt=""></span>` : lead(n.icon)}
  <span class="nt ${n.read ? '' : 'unread'}"><span class="nt-dot" aria-hidden="true"></span>
    <span class="text"><span class="nt-t">${n.read ? '' : '<span class="vh">Unread: </span>'}${n.t}</span><span class="body-s">${n.b}</span><span class="body-s tertiary">${n.when}</span></span></span>${chev}</button>`;

// ---------- sheets ----------
const csheet = (title, body, primary, secondary) => `
  <div class="scrim" data-act="sheet-close"></div>
  <div class="csheet" role="dialog" aria-modal="true" aria-labelledby="cs-t">
    <span class="handle"></span>
    <div class="cs-text"><h2 class="cs-t" id="cs-t">${title}</h2><p class="lede">${body}</p></div>
    <div class="cs-acts">${primary}${secondary}</div>
  </div><div class="sheet-home"></div>`;

Object.assign(OVERLAY, {
  cancel: () => csheet(`Cancel your visit on ${S.followup.day}?`, S.cancelSoon // within 2 hours: nothing is prepaid, so nothing to charge
    ? "It's soon, but cancelling still helps — someone else can have the time. You won't be charged."
    : 'The time goes back to other patients. You can book again whenever you need to.',
    btn('Cancel visit', 'cancel-fu', { kind: 'destructive' }), btn('Keep my visit', 'sheet-close', { kind: 'secondary' })),
  signout: () => csheet('Sign out of Clinica?', "You'll need a code by SMS to sign back in. Your records stay safe with City Hospital.",
    btn('Sign out', 'sign-out'), btn('Stay signed in', 'sheet-close', { kind: 'secondary' })), // reversible, so Brand, not red
  close: () => csheet('Close your Clinica account?', 'Your login and PIN are deleted. Your medical records stay with City Hospital, as the law requires. Ask at reception for a copy.',
    btn('Close account', 'close-account', { kind: 'destructive' }), btn('Keep my account', 'sheet-close', { kind: 'secondary' })),
  calno: () => csheet("Clinica can't add to your calendar", "Calendar access is off in your phone's settings. Your visit is still in Care, and reminders come by SMS.",
    btn('Open phone settings', 'os:Phone settings'), btn('Not now', 'sheet-close', { kind: 'secondary' })),
  // System calendar sheet — device chrome, a stand-in for the phone's own add-event sheet.
  cal: () => {
    const e = calEvent(S.calFor), grp = r => `<div class="sc-g">${r.join('<div class="sc-sep" aria-hidden="true"></div>')}</div>`;
    const one = t => `<div class="sc-r"><span>${t}</span></div>`, kv = (k, v) => `<div class="sc-r"><span>${k}</span><span class="v">${v}</span></div>`;
    return `<div class="scrim" data-act="sheet-close"></div>
    <div class="syscal" role="dialog" aria-modal="true" aria-label="New event">
      <div class="sc-h"><button data-act="sheet-close">Cancel</button><span>New event</span><button class="add" data-act="cal-add">Add</button></div>
      ${grp([one('Appointment — City Hospital'), one(e.loc)])}${grp([kv('Starts', e.starts), kv('Ends', e.ends)])}
      ${grp([kv('Alert', '1 day before'), kv('Second alert', '2 hours before')])}${grp([one(CAL_NOTE)])}
    </div><div class="sheet-home"></div>`;
  },
});

// ---------- screens ----------
Object.assign(SCREENS, {
  care: () => {
    const a = S.appt, f = S.followup;
    const today = `<div class="inset stack8">${lbl('Today')}${visitCard(when(a.day, a.time), `${DOCTORS[a.doc].opd}, City Hospital`, 'appt:today')}</div>`;
    const coming = f ? `<div class="inset stack8">${lbl('Coming up')}${fuCard('appt:fu')}</div>` : '';
    let body;
    if (S.visitDay === 'missed') body = `<div class="inset">${notice('warn', `We missed you at ${a.time}`, "Things come up. Book again when you're ready, or call the clinic to be seen today.",
      btn('Book again', 'go:finddoctor', { size: 'l' }) + callBtn('l'))}</div>${coming}`;
    else if (S.cancelled) body = `<div class="inset">${S.cancelled.byClinic // done to the patient: Error. Their own choice: Neutral.
      ? notice('error', `The clinic cancelled your ${S.cancelled.date} visit`, "Dr. Sharma can't see patients that day. We're sorry for the change.",
        tag('Cancelled', 'neutral') + btn('Book another time', 'doctor:ps', { size: 'l' }))
      : notice('', `Your ${S.cancelled.date} visit is cancelled`, 'The time has gone back to other patients. Book again whenever you need to.',
        tag('Cancelled', 'neutral') + btn('Book again', 'go:finddoctor', { size: 'l' }))}</div>
      ${S.cancelled.cal ? `<div class="inset">${notice('warn', 'Remove it from your calendar', "If you added this visit to your calendar, it's still there. We can't delete it for you.",
        btn('Open calendar', 'os:Calendar', { kind: 'secondary', size: 'l' }))}</div>` : ''}${today}`;
    else if (S.careErr) body = centred(empty('icon-info-secondary-28.svg', 'Something went wrong', // not the patient's fault, and nothing has changed
      "We couldn't load your appointments. It's not something you did, and nothing has changed.",
      btn('Try again', 'care-refresh', { size: 'l' }) + '<a class="btn secondary l" href="tel:+97710000000">Call the clinic</a>'));
    else if (S.careEmpty && !f) body = centred(empty('icon-event-secondary-28.svg', 'No upcoming visits', 'When you book a visit, it will show up here.', btn('Book a visit', 'go:finddoctor', { size: 'l' })));
    else body = `${S.refreshing ? `<div class="refresh" role="status"><img src="${A}icon-spinner-24.svg" width="24" height="24" alt="">Updating…</div>` : ''}${today}${coming}
      <div>${`<div class="inset">${lbl('Earlier')}</div>`}${list([listItem('lt-followup.svg', 'Past visits', "Kept in Health with your doctor's notes", 'health-go:hvisits')])}</div>
      <div class="inset"><button class="btn secondary" data-act="go:finddoctor"><img src="${A}icon-add-24.svg" width="24" height="24" alt="">Book a visit</button></div>`;
    return frame('Care', body, { back: false, tab: 'Care' });
  },

  cappt: () => frame('Appointment', `
    <div class="inset">${fuCard()}</div>
    <div class="inset stack8">${lbl('Before you come')}<p class="body-m">Arrive 15 minutes early and check in at reception. Bring any medicines you're taking.</p></div>
    ${sect('Details', list([linkRow('lt-location.svg', 'OPD 2, City Hospital', 'Ground floor. Get directions', MAPS), row('lt-fee.svg', 'Fee', 'NPR 800, paid at reception'),
      S.cal.fu ? inCal : listItem('lt-calendar.svg', 'Add to calendar', 'So you get a reminder too', 'add-cal:fu')]), 8)}`,
    { cta: btn('Reschedule', 'resched:fu', { kind: 'secondary' }) + btn('Cancel visit', 'sheet:cancel', { kind: 'secondary' }) }), // red waits for the confirmation

  cresched: () => {
    const o = reschedOpts(), sel = S.rsDay, times = sel == null ? [] : o.times(sel);
    const can = S.rsTime && times.some(x => x.t === S.rsTime && !x.off), day = o.days.find(x => x.i === sel);
    const still = S.rsKey === 'fu' ? `Your ${S.followup.day.split(', ')[1]} visit is still booked.` : `Your visit ${rel(S.appt.day)} is still booked.`;
    const now = sect('Currently', list([row('lt-calendar.svg', o.now, o.who)]), 0);
    if (S.rsNone || o.days.every(x => x.off)) return frame('Reschedule', `${now}${empty('icon-event-secondary-28.svg', 'No other times this week',
      `${S.rsKey === 'fu' ? `Your ${S.followup.day} visit` : `Your visit ${rel(S.appt.day)}`} is still booked. Call the clinic to ask about next week.`,
      btn('Keep my visit', 'back', { size: 'l' }) + '<a class="btn secondary l" href="tel:+97710000000">Call the clinic</a>')}`);
    return frame('Reschedule', `
      ${S.rsErr ? `<div class="inset" role="alert">${notice('error', `${S.rsErr.t} on ${S.rsErr.wd} was just taken`, `${still} Choose another time.`)}</div>` : ''}
      ${now}
      <div class="inset stack8">${lbl('Choose a new day')}
        <div class="hscroll days" role="radiogroup" aria-label="Day">${o.days.map(x =>
          `<button class="pick day" role="radio" aria-checked="${x.i === sel}" ${x.off ? 'disabled' : ''} data-act="rs-day:${x.i}" aria-label="${x.wd}, ${x.date}${x.off ? ', unavailable' : ''}"><span class="d1">${x.wd}</span><span class="d2">${x.date}</span></button>`).join('')}</div></div>
      <div class="inset stack8">${lbl('Choose a new time')}
        <div class="times" role="radiogroup" aria-label="Time">${times.map(x =>
          `<button class="pick time" role="radio" aria-checked="${x.t === S.rsTime}" ${x.off ? 'disabled' : ''} data-act="rs-time:${x.t}" aria-label="${x.t}${x.off ? ', taken' : ''}">${x.t}</button>`).join('')}</div></div>`,
      { cta: btn(can ? `Move to ${day.wd}, ${S.rsTime}` : S.rsErr ? 'Choose a new time' : 'Choose a time', 'rs-move', { disabled: !can }) });
  },

  cmoved: () => {
    const m = S.moved, added = S.cal[m.key];
    return frame('Appointment', `
      <div class="inset" role="status">${notice('success', 'Visit moved', `Your ${m.from} has been released. We've sent the new time by SMS.`)}</div>
      ${m.stale ? `<div class="inset">${notice('warn', `Calendar still shows ${m.stale}`, "We can't change events in your calendar. Add the new time, then delete the old one.")}</div>` : ''}
      <div class="inset">${m.key === 'fu' ? fuCard() : todayCard(false)}</div>${added ? inCal : ''}`,
      { cta: added ? '' : calBtn(m.key, m.stale ? 'Add the new time' : 'Add to calendar') });
  },

  // Visit day: a state, never an estimate — booked, running late, checked in, done.
  cday: () => {
    const v = S.visitDay, a = S.appt, d = DOCTORS[a.doc], dr = `Dr. ${surname(d.name)}`, she = a.doc === 'ps' ? 'she' : 'the doctor';
    const top = {
      late: notice('info', `${dr} is running late`, `Your ${a.time} slot is kept. We'll message you as soon as ${she}'s ready.`),
      checkedin: notice('', "You're checked in", `Reception will call you when ${dr} is ready.`, tag(`Waiting for ${d.name}`, 'info')),
      done: notice('success', 'Visit complete', `${dr}'s notes and your prescription will appear in Health once ${she} has added them.`),
      turn: notice('success', `${dr} is ready for you`, `Please go to ${d.opd} now. It's on the ground floor, past the pharmacy.`, tag('Your turn', 'info')),
      with: notice('info', `You're with ${dr}`, `${a.doc === 'ps' ? 'Her' : "The doctor's"} notes and any prescriptions will be in Health after your visit.`, tag('In progress', 'info')),
      ontime: notice('success', `${dr} is back on time`, `Your ${a.time} slot is on time. Check in at reception when you arrive.`),
    }[v];
    const arrive = sect('When you arrive', list([row('lt-location.svg', `${d.opd}, City Hospital`, 'Ground floor, past the pharmacy'),
      row('lt-schedule.svg', `Arrive by ${addMin(a.time, -15)}`, 'Then check in at reception'),
      v === 'late' || v === 'ontime' ? row('lt-bell.svg', `We'll tell you when ${she}'s ready`, 'No need to watch the app') : row('lt-bell.svg', `If ${dr} is running late`, "We'll message you here")]), 0);
    const rest = {
      checkedin: `<div class="inset stack8">${lbl('While you wait')}<p class="body-m">Need to step out? Tell reception first, so your turn isn't missed.</p></div>`,
      turn: `<div class="inset stack8">${lbl("If you can't go now")}<p class="body-m">Can't go right now? Tell reception, so you don't lose your turn.</p></div>`,
      with: `<div class="inset stack8">${lbl('On your way out')}<p class="body-m">Pay the fee at reception. Your SMS confirmation has the amount.</p></div>`,
      done: `<div class="inset stack8">${lbl('Next step')}${S.followup ? fuCard('appt:fu')
        : S.fuAdvice === 'none' ? notice('', 'No follow-up needed', 'Come back only if it gets worse.') // as the doctor advised
        : notice('', 'Follow-up in 2 weeks', 'Around Sep 11. Book now to get a time that suits you.', btn('Book follow-up', 'cday-fu', { size: 'l' }))}</div>`,
    }[v] || arrive;
    const cta = { booked: dirBtn(d.opd), ontime: dirBtn(d.opd), late: dirBtn(d.opd) + btn('Reschedule instead', 'resched:appt', { kind: 'secondary' }), done: btn('Go to Health', 'health-tab', { kind: 'secondary' }) }[v] || '';
    return frame('Appointment', `${top ? `<div class="inset">${top}</div>` : ''}<div class="inset">${todayCard(false)}</div>${rest}`, { cta });
  },

  notifs: () => {
    const ns = S.healthEmpty ? [] : S.notifs;
    if (!ns.length) return frame('Notifications', centred(empty('icon-bell-secondary-28.svg', 'No notifications yet',
      'Reminders, delays and updates about your reports will appear here.', '<div style="height:104px"></div>')));
    const group = g => sect(g, list(ns.map((n, i) => n.g === g ? notifRow(n, i) : '').filter(Boolean)), 0);
    return frame('Notifications', `
      ${S.notifOff ? `<div class="inset">${notice('warn', 'Notifications are off on this phone', 'This list still updates, but nothing will pop up. SMS updates still arrive.',
        btn('Turn them on', 'os:Phone settings', { size: 'l' }))}</div>` : ''}
      ${group('Today')}${group('Earlier')}`,
      { gap: 16, actions: (ns.some(n => !n.read) ? iconBtn('icon-task-alt-24.svg', 'Mark all as read', 'notif-read') : '') + iconBtn('icon-settings-24.svg', 'Notification settings', 'go:pfnotif') });
  },

  // ---------- Profile ----------
  pf: () => frame('Profile', `
    <div class="inset"><div class="who"><span class="avatar l">${initials(S.fullName)}</span>
      <div><p class="who-n">${esc(S.fullName)}</p><p class="body-s">Patient at City Hospital</p><p class="body-s tertiary">${masked()}</p></div></div></div>
    ${sect('You', list([listItem('icon-person.svg', 'Your details', 'Name, birth date and mobile number', 'go:pfdetails')]))}
    ${sect('Settings', list([listItem('lt-translate.svg', 'Language', S.lang === 'ne' ? 'नेपाली' : 'English', 'go:pflang'),
      listItem('lt-bell.svg', 'Notifications', S.notifOff ? 'Off in phone settings' : 'On', 'go:pfnotif'),
      listItem('lt-lock.svg', 'Health lock', S.finger === 'on' && !S.noSensor ? 'PIN and fingerprint' : S.pin ? 'PIN' : 'Set up when you first open Health', 'pf-lock')]))}
    ${sect('Your clinic', list([listItem('lt-hospital.svg', 'City Hospital', 'Phone, address and opening hours', 'go:pfclinic')]))}
    ${sect('Help and about', list([listItem('lt-help-circle.svg', 'Help', 'Emergencies, contacting the clinic, privacy', 'go:pfhelp'), listItem('lt-info.svg', 'About Clinica', 'Version, privacy', 'go:pfabout')]))}
    ${sect('This phone', list([listItem('icon-person.svg', 'Switch person', 'For a phone the family shares', 'go:pfswitch'),
      listItem('lt-lock-open.svg', 'Sign out', masked(), 'sheet:signout'), listItem('lt-close.svg', 'Close account', 'Your records stay with the clinic', 'sheet:close')]))}`,
    { back: false, tab: 'Profile' }),

  pfdetails: () => {
    const me = DETAILS[S.fullName] || { dob: S.dob, sex: S.sex, no: 'At reception' }, p = parseDob(me.dob || ''), b = p && toBS(p.y, p.m, p.d);
    return frame('Your details', `
      ${S.phoneChanged ? `<div class="inset" role="status">${notice('success', 'Mobile number changed', "We've let your old number know too.")}</div>` : ''}
      <div class="inset">${notice('', 'Kept by City Hospital', "To change your name, date of birth or sex, ask at reception — the clinic's record is the one that counts.")}</div>
      ${sect('Details', list([row('icon-person.svg', 'Full name', esc(S.fullName)),
        row('lt-calendar-month.svg', 'Date of birth', p ? `${p.d} ${AD_SHORT[p.m]} ${p.y}${b ? `, or ${bsText(b)}` : ''}` : 'On file at reception'),
        row('icon-person.svg', 'Sex', me.sex || 'On file at reception'), row('lt-clipboard.svg', 'Patient number', me.no),
        listItem('lt-call.svg', 'Mobile number', masked(), 'pf-phone')]))}`);
  },

  pflang: () => frame('Language', `
    <div class="inset"><div class="tiles" role="radiogroup" aria-label="Language">
      ${[['en', 'English', ''], ['ne', 'नेपाली', 'deva']].map(([v, l, c]) => `
        <button class="tile" role="radio" aria-checked="${S.lang === v}" data-act="lang" data-v="${v}">
          <img class="off" src="${A}translate-secondary.svg" width="28" height="28" alt=""><img class="on" src="${A}translate-action.svg" width="28" height="28" alt="">
          <span class="${c}">${l}</span></button>`).join('')}
    </div></div>
    <div class="inset"><p class="body-s">Changes straight away. Your doctor's notes stay in the language they were written in.</p></div>`),

  // Switches take effect at once. When the phone blocks Clinica, each keeps its value but can't change.
  pfnotif: () => {
    const n = S.nset, off = S.notifOff;
    return frame('Notifications', `
      ${off ? `<div class="inset">${notice('warn', 'Notifications are off for Clinica', "They're turned off in your phone's settings, so nothing below reaches you here. SMS updates still arrive.",
        btn('Open phone settings', 'os:Phone settings', { size: 'l' }))}</div>` : ''}
      ${sect('Your appointments', listP([setting('Appointment reminders', 'The day before, and 2 hours before', n.remind, 'nset:remind', off),
        setting('Delays and cancellations', 'Always on, so the clinic can reach you', true, '', true),
        setting('Follow-up reminders', 'When a follow-up is due', n.fu, 'nset:fu', off)]))}
      ${sect('Your records', listP([setting('Lab reports ready', 'When your doctor releases a report', n.labs, 'nset:labs', off)]))}
      <div class="inset"><p class="body-s">Appointment updates also come by SMS, whatever you choose here. We never send marketing.</p></div>`);
  },

  pflock: () => frame('Health lock', `
    ${S.pinChanged ? `<div class="inset" role="status">${notice('success', 'PIN changed', 'Use your new PIN from now on.')}</div>` : ''}
    ${sect('Lock and unlock', `<div class="list">${row('lt-lock.svg', 'Locks automatically', 'When you leave Clinica, or after 5 idle minutes')}
      ${listItem('lt-lock.svg', 'Change PIN', 'Choose a new 4-digit PIN', 'pf-pin')}<div class="sep" aria-hidden="true"></div>
      ${S.noSensor ? setting('Use fingerprint', 'This phone has no fingerprint sensor.', false, '', true, lead('lt-fingerprint.svg')) // disabled, with the reason
        : setting('Use fingerprint', S.finger === 'on' ? 'Fingerprint data saved on this phone could open your records' : 'Off. Your PIN opens your records.', S.finger === 'on', 'pf-finger', false, lead('lt-fingerprint.svg'))}</div>`)}
    ${sect('If you forget', list([listItem('lt-sms.svg', 'Reset your PIN', 'With a code sent by SMS', 'pf-reset')]))}
    <div class="inset"><p class="body-s">Your Clinica PIN isn't your phone's PIN. On a shared phone, it's the one thing only you know.</p></div>`),

  pfclinic: () => frame('City Hospital', `
    <div class="inset">${notice('', 'In an emergency', "Call 102 for an ambulance, or go straight to an emergency department. Don't wait for the app.",
      `<a class="btn secondary l" href="tel:102"><img src="${A}icon-call.svg" width="24" height="24" alt="">Call 102</a>`)}</div>
    ${sect('Contact', list([linkRow('lt-call.svg', 'Reception', '+977 1-4412345', 'tel:+97714412345'), linkRow('lt-location.svg', 'Address', 'Maharajgunj, Kathmandu', MAPS),
      row('lt-schedule.svg', 'Opening hours', 'Sun to Fri, 9 AM to 5 PM. Closed Saturdays.')]))}`,
    { cta: `<a class="btn primary" href="tel:+97714412345"><img src="${A}icon-call-on-action-24.svg" width="24" height="24" alt="">Call reception</a>` }),

  pfswitch: () => {
    const others = RECORDS.map((r, i) => [r, i]).filter(([r]) => r.name !== S.fullName);
    return frame('Switch person', `
      ${heading("Who's using the app?", `${others.length + 1} people at City Hospital share this phone, and each has their own PIN.`)}
      ${sect('People', list([`<div class="list-item static">${lead('icon-person.svg')}<span class="text"><span class="item-title">${esc(S.fullName)}</span><span class="body-s">You, right now</span></span>
          <img src="${A}icon-check-circle-20.svg" width="20" height="20" alt="Current person"></div>`,
        ...others.map(([r, i]) => listItem('icon-person.svg', r.name, `Born ${r.born}`, `pf-switch:${i}`)),
        listItem('icon-add.svg', 'Someone else', 'Sign in with their own record', 'pf-other')]))}
      <div class="inset"><p class="body-s">Switching asks for that person's Clinica PIN, so nobody opens someone else's records by accident.</p></div>`);
  },

  // Emergency guidance stays first: it's what someone looking for help most needs to find.
  pfhelp: () => frame('Help', `
    <div class="inset">${notice('', 'In an emergency', "Call 102 for an ambulance, or go straight to an emergency department. Don't wait for the app.",
      `<a class="btn secondary l" href="tel:102"><img src="${A}icon-call.svg" width="24" height="24" alt="">Call 102</a>`)}</div>
    ${sect('Get help', list([linkRow('lt-call.svg', 'Reception', '+977 1-4412345', 'tel:+97714412345'),
      listItem('lt-lock.svg', 'How your records are kept private', 'Who sees them, and your choices', 'go:privacy'),
      listItem('lt-document.svg', 'Terms of use', 'What using Clinica means', 'go:terms')]))}`),

  pfabout: () => frame('About Clinica', sect('Clinica', list([row('lt-info.svg', 'Version', '1.0.0'), row('lt-hospital.svg', 'Made for City Hospital', 'Maharajgunj, Kathmandu'),
    listItem('lt-lock.svg', 'Privacy policy', 'How your records are kept private', 'go:privacy')]))),

  pfadd: () => frame('', centred(empty('icon-person-secondary-28.svg', 'Add someone on this phone',
    `We'll text a code to ${masked()} to find the other City Hospital records on this number.`,
    btn('Send code', 'add-code', { size: 'l' }) + btn('They have their own number', 'own-number', { kind: 'secondary', size: 'l' })))),

  closed: () => `
    <div class="screen">
      ${statusBar()}
      ${centred(empty('icon-check-circle-secondary-28.svg', 'Your account is closed',
        'Your login and PIN are deleted. City Hospital keeps your medical records, as the law requires — ask at reception for a copy.', btn('Done', 'restart', { size: 'l' })))}
      ${homeInd()}
    </div>`,

  pfpin: () => {
    const r = RECORDS[S.switchTo], first = r.name.split(' ')[0];
    return pinScreen(`Enter ${first}'s PIN`, `To switch to ${r.name}'s records.`,
      (S.pinErr ? errLine("That PIN didn't match. Try again.") : '') + `<button class="btn secondary l hug" data-act="pf-forgot">Forgot your PIN?</button>`);
  },
});

// ---------- behaviour ----------
function openCal(key) { S.calFor = key; S.sheet = S.calOff ? 'calno' : 'cal'; rerender(); }
function switchTo(i) { S.fullName = RECORDS[i].name; S.first = S.fullName.split(' ')[0]; S.pinEntry = ''; S.pinErr = false; toHome(); } // opens their Home, not Health
const tabRoot = screen => { Object.assign(S, { stack: [], sheet: null, screen }); render(); };

Object.assign(mount, {
  cresched: () => phone.querySelector('.days [aria-checked="true"]')?.scrollIntoView({ block: 'nearest', inline: 'nearest' }),
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
  sheet: arg => { S.sheet = arg; rerender(); },
  'sheet-close': () => { S.sheet = null; rerender(); }, // the safe choice; keeps the scroll under the sheet
  os: arg => SYS_OS[arg] ? openSys(SYS_OS[arg]()) : endScreen(arg, 'On a phone this hands off to the system or to a screen outside these Figma sections.'),
  'add-cal': openCal,
  'cal-add': () => { S.cal[S.calFor] = true; downloadIcs(calEvent(S.calFor)); S.sheet = null; rerender(); }, // iOS reports the save
  'cancel-fu': () => {
    S.cancelled = { date: S.followup.day.split(', ')[1], day: S.followup.day, cal: S.cal.fu }; // a calendar copy would now be stale
    Object.assign(S, { followup: null, sheet: null, stack: [], screen: 'care' });
    S.cal.fu = false;
    render();
  },
  resched: key => {
    S.rsKey = key; S.rsTime = null; S.rsErr = null;
    const o = reschedOpts();
    S.rsDay = o.days.some(x => x.i === o.cur && !x.off) ? o.cur : o.days.find(x => !x.off)?.i ?? null;
    go('cresched');
  },
  'rs-day': arg => { S.rsDay = +arg; S.rsTime = null; rerender(); },
  'rs-time': arg => { S.rsTime = arg; rerender(); },
  'rs-move': () => {
    const key = S.rsKey, x = reschedOpts().days.find(d => d.i === S.rsDay), a = S.appt;
    if (S.failNext === 'taken') { // someone else took it while choosing: the current visit stays booked
      S.failNext = '';
      if (key === 'fu') S.rsTaken.push(`fu|${x.i}|${S.rsTime}`); else takeSlot(a.doc, x.i, S.rsTime);
      S.rsErr = { t: S.rsTime, wd: x.wd }; S.rsTime = null;
      return rerender();
    }
    const from = key === 'fu' ? `${S.followup.day} slot` : a.day === 0 ? `slot today at ${a.time}` : `${dayName(a.day)} slot`;
    const stale = S.cal[key] ? (key === 'fu' ? S.followup.day : when(a.day, a.time).replace(/^T(oday|omorrow)/, 't$1')) : null;
    if (key === 'fu') S.followup = { day: `${x.wd}, ${x.date}`, time: S.rsTime, iso: [2026, 8, 10 + x.i] };
    else { takeSlot(a.doc, x.i, S.rsTime); S.appt = { ...a, day: x.i, time: S.rsTime }; S.visitDay = 'booked'; }
    S.cal[key] = false; S.moved = { key, from, stale };
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
    if (n.go.startsWith('med:')) S.medI = +n.go.slice(4); // a medicine (meds.js)
    if (n.go === 'hreport') S.report = 'hba1c'; // the new report
    if (n.go === 'hreport-cbc') { S.report = 'cbc'; return openHealth('hreport'); } // released by the doctor (doctor.js)
    openHealth(n.go.startsWith('med:') ? 'mtmed' : n.go); // medicines, reports and notes, through the Health lock
  },
  'notif-read': () => { S.notifs.forEach(n => { n.read = true; }); rerender(); },
  nset: key => { S.nset[key] = !S.nset[key]; rerender(); },
  // Off at once — safer and reversible. On goes through the opt-in, which restates the trade-off.
  'pf-finger': () => { if (S.finger === 'on') { S.finger = 'off'; return rerender(); } S.afterUnlock = 'pflock'; go('finger'); },
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
  'pf-reset': () => { S.afterUnlock = 'pflock'; S.sheet = 'reset'; rerender(); },
  'pf-switch': i => { Object.assign(S, { switchTo: +i, pinEntry: '', pinErr: false }); go('pfpin'); },
  'pf-forgot': () => endScreen('Forgot the PIN?', 'Each person resets their own PIN from their own Profile, or at reception with ID.'),
  'pf-other': () => go('pfadd'),
  'own-number': () => { S = Object.assign(fresh(), { stack: ['splash'], screen: 'phone' }); render(); }, // they sign in on their own phone
  'sign-out': () => { S = fresh(); S.stack = ['splash']; S.screen = 'phone'; render(); },
  'close-account': () => { S = Object.assign(fresh(), { screen: 'closed' }); render(); },
});

Object.assign(NUM, {
  care: s => s.careErr ? 'GX07' : s.refreshing ? 'GX05' : s.offline ? 'GX02' : s.visitDay === 'missed' ? 'C11' : s.cancelled ? (s.cancelled.byClinic ? 'SC06' : s.cancelled.cal ? 'K06' : 'C06') : s.careEmpty && !s.followup ? 'C12' : 'C01',
  cappt: s => s.sheet === 'cancel' ? (s.cancelSoon ? 'SC07' : 'C05') : 'C02',
  cresched: s => s.rsNone ? 'SC04' : s.rsErr ? 'SC03' : 'C03', cmoved: s => s.moved.stale ? 'K05' : 'C04',
  cday: s => ({ booked: 'C07', late: 'C08', checkedin: 'C09', done: 'C10', turn: 'SC01', with: 'SC02', ontime: 'SC05' })[s.visitDay],
  notifs: s => s.healthEmpty ? 'N02' : s.notifOff ? 'N03' : 'N01',
  pf: s => ({ signout: 'P08', close: 'P10' })[s.sheet] || 'P01',
  pfdetails: s => s.phoneChanged ? 'PM08' : 'P02', pflang: () => 'P03', pfnotif: s => s.notifOff ? 'P09' : 'P04',
  pflock: s => s.pinChanged ? 'PM04' : s.noSensor ? 'HM13' : s.finger !== 'on' ? 'PM10' : 'P05',
  pfclinic: () => 'P06', pfswitch: () => 'P07', pfpin: () => 'P11', pfhelp: () => 'PM12', pfabout: () => 'PM13', pfadd: () => 'PM11', closed: () => 'PM09',
  confirmed: s => s.cal.appt ? 'K03' : 'B05',
});

const PF = ['pf'], BOOKED = { screen: 'confirmed', taken: { 'ps|0': ['4:30 PM'] } };
FLOW.push(
  ['Care — your appointments', [
    ['C01', 'Care', 'Care tab', "The Care tab holds appointments. Today first, then what's coming up. Past visits point to Health rather than being listed twice.", () => ({ screen: 'care' })],
    ['C02', 'Appointment detail', 'Taps a visit', 'What to bring and where to go. Reschedule and Cancel are both neutral — red waits for the confirmation.', () => ({ screen: 'cappt', stack: ['care'] })],
    ['C03', 'Reschedule', 'From 02 — Reschedule', 'The current time stays visible while choosing a new one. Taken times are shown as taken.', () => ({ screen: 'cresched', stack: ['care', 'cappt'], rsKey: 'fu', rsDay: 2, rsTime: '11:00 AM' })],
    ['C04', 'Rescheduled', 'Moves the visit', 'Success tone, earned: the move is done, the old slot released, the new time sent by SMS.', () => ({ screen: 'cmoved', stack: ['care', 'cappt'], followup: { day: 'Fri, Sep 12', time: '11:00 AM', iso: [2026, 8, 12] }, moved: { key: 'fu', from: 'Thu, Sep 11 slot', stale: null } })],
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
    ['N01', 'Notifications', 'From the bell on Home', "Updates about the patient's care — distinct from Messages, which are conversations. Unread: dot and bold title. Each row opens where it is about — the delay in Care, reports and notes through the Health lock, which is why they never name the test. The gear opens Profile's notification settings.", () => ({ screen: 'notifs', stack: ['home'] })],
    ['N02', 'Nothing yet', 'A new patient', 'Says what will arrive here, so the empty list reads as waiting rather than broken.', () => ({ screen: 'notifs', stack: ['home'], healthEmpty: true })],
    ['N03', 'Phone notifications off', 'Replaces 01 when the phone blocks Clinica', "Shown at full length — it scrolls. The list keeps updating; the banner says what doesn't happen and how to fix it, and that SMS still arrives.", () => ({ screen: 'notifs', stack: ['home'], notifOff: true })],
  ]],
  ['Add to calendar', [
    ['K02', 'Add event', 'Taps Add to calendar on B05 Confirmed (K01 in Figma)', "The phone's own sheet, not a silent insert and no broad calendar access. Titled 'Appointment — City Hospital': never the doctor or specialty. Alerts match the app's reminders. Also on Appointment detail, Rescheduled, and the Assistant's follow-up — all open the same sheet. Add also saves a real .ics file.", () => ({ ...BOOKED, sheet: 'cal', calFor: 'appt' })],
    ['K03', 'In your calendar', 'Taps Add — when the phone confirms the save', "iOS reports the save; Android's handoff doesn't, so there the button stays 'Add to calendar'. The app never claims what it can't know.", () => ({ ...BOOKED, cal: { appt: true, fu: false } })],
    ['K04', 'Calendar access off', 'Branch from 02 — iOS, access refused', 'Answered in a sheet at the moment of the tap. The visit is still in Care and reminders still come by SMS, so nothing is lost.', () => ({ ...BOOKED, sheet: 'calno', calOff: true })],
    ['K05', 'Time changed', 'After a reschedule', "The calendar copy doesn't update itself, and the app can't edit it. It says so, and offers to add the new time.", () => ({ screen: 'cmoved', stack: ['care', 'cappt'], followup: { day: 'Fri, Sep 12', time: '11:00 AM', iso: [2026, 8, 12] }, moved: { key: 'fu', from: 'Thu, Sep 11 slot', stale: 'Thu, Sep 11' } })],
    ['K06', 'Cancelled', 'After a cancellation', "A stale event is how someone turns up for a visit that isn't happening. Worded 'if you added it', since Android can't tell us.", () => ({ screen: 'care', followup: null, cancelled: { date: 'Sep 11', cal: true } })],
  ]],
);
