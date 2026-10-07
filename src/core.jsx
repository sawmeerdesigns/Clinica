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
  homeState: 'default', appt: { doc: 'ps', day: 0, time: '4:30 PM' },
  notif: 'ask', notNow: 0,
  loading: null, refreshing: false, careErr: false, micPerm: null,
  bookFor: null, booked: null, failKind: 'taken', failNext: '', filt: { today: false, sex: 'Any' }, fdraft: null,
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

export function go(screen, { replace = false } = {}) {
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
