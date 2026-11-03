# Clinica — usability fixes

Fixes for the findings from the five synthetic usability runs (F = run 1, R = run 2, T = run 3, V = run 4, W = run 5). Each change cites its finding IDs in a code comment.

## Phase 0 — One source of truth for data

| Finding IDs | File:line | What changed | Status |
|---|---|---|---|
| F07 / R05 / T06 / V07 | src/data.js:46, src/staff.jsx:73, :88, :228 | Every count comes from one arrivals list: Dr. Sharma's queue (`DR_PATIENTS` + `S.drq`) and everyone else's (`ARR` + `S.rq`), both in data.js. `ptToday`, the department cards and the dashboard's "Patients today" all count `arrivals()`. The dashboard, Departments and Reception now show 20. | Fixed |
| F07 | src/staff.jsx:279 | A department's "Patients seen" counts its completed arrivals instead of all its patients today. | Fixed |
| R05 / T06 | src/data.js:67, src/staff.jsx:38 | Reception now covers Dermatology, Paediatrics and Gynaecology, with 7 new arrivals that also have patient records. Which booked patients show is unchanged: Sunita Thapa stays hidden until Phase 4. | Fixed |
| R07 / T08 | src/data.js:42, src/staff.jsx:82 | `DEPTS` holds only each department's name and OPDs. Its doctors are whoever on the roster has that specialty (not case-sensitive), so a doctor added in admin joins her department straight away. | Fixed |
| W20 | src/data.js:20–40, src/staff.jsx:24, src/booking.jsx:14, src/health.jsx:34 | One `DOCTORS` record per doctor holds name, sex, specialty/department, OPD, working days, NMC number, duty, slots and employee ID. The booking app and the staff app both read it. Dr. Sunita Rai is Paediatrics everywhere. Dr. Kiran Gurung is Gynaecology and Dr. Maya Shrestha is Dermatology, following the staff app. The booking app's OPDs also follow the staff app. | Fixed |
| R29 / F26 ("7 OPDs" vs 5 cards) | src/staff.jsx:266 | The header now counts both from the data: "5 departments · 7 OPDs". The old 7 was right, since 7 OPDs serve 5 departments, but the header didn't say so. | Fixed |
| F20 | src/data.js:6–16, src/booking.jsx:12, src/ask.jsx:25, :328, :356, src/care.jsx:28, :36, :391, src/more.jsx:111, src/meds.jsx:121, src/desk.jsx:9 | Weekday labels are generated from real Dates around the fixed demo day, Fri Aug 28, 2026. Saturday is the closed day, matching "Closed Saturdays". That makes tomorrow (Aug 29) closed, so slot maps and edge-case states that pointed at Saturdays were moved by a day (see Decisions taken). | Fixed |
| R04 / T04 / V03 (date grouping) | src/care.jsx:143 | Care groups the appointment by its real date: only a visit today sits under "Today", and a later one goes under "Coming up". The wrong doctor name on the card is Phase 3. | Partial: the doctor name is fixed in Phase 3 |
| T28 / R18 (demo date) | src/staff.jsx:42 | Prasant Khadka's leave request is dated Aug 27, the day before the demo day. The missing reason and undo are Phase 4. | Partial: reason and undo come in Phase 4 |
| (one copy) | src/data.js:81, src/booking.jsx, src/care.jsx, src/more.jsx | The fee (`FEE`) and wallets (`WALLETS`) live in data.js. The chosen wallet stays runtime state in `S.payWith`. | Fixed |

### Decisions taken (Phase 0)
- Specialties and OPDs follow the staff app, which defines the departments, leave and attendance.
- Saturday is the closed day, matching the patient app's "Closed Saturdays" and the staff calendar. Because Aug 28, 2026 is a Friday, Dr. Anita Joshi's next slot moves from "tomorrow" to Sun, Aug 30, and Dr. Ramesh Shrestha is fully booked until Thu, Sep 3. The follow-up stays on Sep 11, now a Friday. The C03, C04, K05 and SC03 states move from the closed Sat, Sep 12 to Sun, Sep 13.
- Doctors' working days are Sun–Fri. Dr. Suman KC works Sun–Thu, which is why he is off today, a Friday.

### check.cjs changes (values that changed on purpose)
- Weekday labels: Thu, Sep 11 → Fri, Sep 11; Wed, Sep 3 → Thu, Sep 3; reschedule and Dr. Joshi steps now pick Sun instead of Fri, and the new times read Sun, Aug 30 or Sun, Sep 13.
- Reception: 13 → 20 and 14 → 21 patients. Dashboard "Not yet arrived": 2 → 3 (Riya Maharjan, Paediatrics). Patients filtered by visit date: 13 of 26 → 20 of 33.

## Phase 1 — Patient-safety and one-line fixes

| Finding IDs | File:line | What changed | Status |
|---|---|---|---|
| F01 / R01 | src/desk.jsx:152, src/doctor.jsx:37, :401 | `k-rep` sets `S.drRep` as well as `S.kRep`. `d-choice` no longer copies any text into the comment: the suggestion is computed at render time from the report on screen (`drSuggest(k)`), so no other patient's comment can land in it, on phone or desktop. | Fixed |
| W06 / F23 (release) | src/doctor.jsx:35, :40, :287, :409, src/desk.jsx:81, :152 | A report opens undecided with an empty comment (`drRelNew`). The report's text shows only as a "Suggested: …" placeholder, with "Leave it blank to send the suggested text." Release is disabled until a decision is picked. The comment box is one shared `drComment` for phone and desktop. Figma frames (D06–D06e, K20–K20e) still preset a decision. | Fixed (reference ranges: Phase 2) |
| T15 | src/doctor.jsx:326, :401, :408 | Changing the decision after writing your own comment opens a "Keep your comment?" sheet (`csheet`): "Keep my comment" or "Use the suggested text". | Fixed |
| W05 | src/doctor.jsx:318, :343 | Both release sheets name the patient and ID and quote the exact comment she will see right away. The follow-up sheet adds that she'll be asked to book a follow-up (what health.jsx `hreport` shows). "Will be told to expect a call" is gone, including from the D06e/K20e captions. The released text is the same `drWords()` the sheet quoted. | Fixed |
| T03 | src/booking.jsx:164, src/health.jsx:512 | Home's "Lab report ready" runs `lab-ready`, which sets `S.report` to the newest released report (first in `S.labs` that isn't being reviewed, HbA1c) before opening Health, as the notification does. | Fixed |
| A1 | src/styles.css:5 | `--text-tertiary` is #646a72. | Fixed |
| A3 | src/staff.jsx:197 | Select all uses `items.length > 0 &&`, so aria-checked is never "0". | Fixed |
| A4 | src/app.jsx:319 | Onboarding step dots have `role="img"`. | Fixed |

### check.cjs changes (Phase 1)
- The phone and desktop release flows pick a decision before releasing. The follow-up sheet's button is now "Release with follow-up request" (it was "Flag for follow-up"), and the K20e sheet text is "Release with a follow-up request?" and quotes the comment.
- 11 new assertions: Release is disabled and the comment empty until a decision; the suggestion is a placeholder; both sheets quote the comment; k-rep sets drRep and toggling gives Kabita's own text (phone and desktop); T15 asks, keeps and replaces; Home "Lab report ready" opens HbA1c.

## Phase 2 — Doctor apps

| Finding IDs | File:line | What changed | Status |
|---|---|---|---|
| F04 / R02 / T01 / V01 / F23 (visit note) | src/doctor.jsx:100, :195, :439, :441, :464 | A visit starts empty: no medicines, no note. The prepared note shows only as a "Suggested: …" placeholder, with "Leave it blank to use the suggested note" (same pattern as the Phase 1 release comment). Each medicine card has Edit (opens the same form, filled in, titled "Edit medicine") and Remove. Phone and desktop share the pieces (`drNoteField`, `drMedList`, `drFollowRadio`). | Fixed |
| R24 | src/doctor.jsx:178, :203, :455 | Add medicine has a required "Dose each time" field, so a card reads "1 tablet, twice a day", and the quantity to dispense travels with it. "In 2 weeks" shows its date while choosing ("In 2 weeks · Fri, Sep 11", from data.js `FU_DAY`/`dayLabel`). | Fixed |
| F03 / R03 / T02 / V02 | src/doctor.jsx:464, src/desk.jsx:148 | `d-start` puts the draft in `drKept` from the start, so every way out of the phone visit (Back, a tab, another patient, the other phone, the desktop X) keeps it. A restored draft shows "Draft kept — your note, medicines and follow-up are as you left them." (`draftCue`, phone and desktop). | Fixed |
| T21 | src/staff.jsx:389, :628 | Coming back to a half-filled walk-in form shows the same "Draft kept" cue. | Fixed |
| F05 / R08 / T12 / V17 | src/doctor.jsx:369, :477, src/desk.jsx:154 | Complete visit opens a review sheet built on the release-sheet pattern: the note as quoted, each medicine with dose, duration and quantity ("Quantity not set" when missing), the follow-up as a real date, and a "Same medicine twice" warning when one drug appears twice at any strength. "Complete visit" completes; "Back to editing" closes it with nothing lost. Same sheet on the desktop. New frames D04f and K11k. | Fixed |
| T10 / W06 (ranges) | src/doctor.jsx:29, :115 | Each lab value shows its reference range ("Range 12.0–15.5 g/dL"); the Normal/High/Low flag is worked out from the value against that range. Ranges are fictional but plausible adult ranges. | Fixed |
| F24 / R20 / T11 / W07 / V09 | src/core.jsx:91, src/app.jsx:685, src/doctor.jsx:393, :406, :506, :212 | One shared toast (`toast(msg, [label, act])` in core.jsx) drawn in an always-present `role="status"` region. Release shows "CBC blood test released to Anisha Sharma." with Undo for 5 s. Undo puts the report back as pending with the decision and comment as they were, reopens it, and removes the patient-side release and notification. Reports (phone and desktop) lists "Released today": patient, report, "Released by Dr. Priya Sharma at 4:52 PM", Released / Follow-up asked. | Fixed |
| T25 / F24 / R20 (history) | src/doctor.jsx:149, :429, :433, src/desk.jsx:54, :77 | "View Anisha's history" on the report (phone: the history screen; desktop: the Queue's history pane, Reports keeps its place). The tag reads "Seen by you", not "Your visit". Every entry opens: today's visit in full, any other as date, department and reason. Lab results are not yet listed in history. | Partial: labs in history not added |
| R30 | src/doctor.jsx:87, src/desk.jsx:22 | The Reports nav item shows the pending count on phone and desktop, with " waiting" for screen readers. | Fixed |
| V21 / F26 (banner) | src/doctor.jsx:238, :475 | "You're with … now." is a link that opens that visit, with its kept draft. | Fixed |

### Decisions taken (Phase 2)
- Follow-up still defaults to "No follow-up"; the review sheet shows it before anything is saved.
- The released-by name is the signed-in doctor (Dr. Priya Sharma, the only doctor account); the time is the demo's moving clock (`now()`).
- Figma frames D04, D04b, K11b and the history frames still preset Anisha's/Nabin's prepared medicines, so those states stay reviewable; Start visit itself begins empty.

### check.cjs changes (Phase 2)
- Changed: D04 now asserts an empty draft with the suggestion as placeholder (it asserted the pre-filled "For fever and headache"). Complete visit clicks through the review sheet (phone, desktop, D04c). "Released, off the list" checks the pending row, since the CBC now appears under Released today. Back to the queue reads 6 of 8.
- Added (about 30): medicine add with dose/quantity, Edit, Remove; draft kept on phone Back with cue; banner opens the visit; review sheet with duplicate warning, Sep 11 / Sep 18 dates, Back to editing; reference ranges and flag (phone, desktop); history from the report and doctor wording, past visit opens; toast + Undo reverts (phone, desktop), re-release; Released today; Reports badge 2 → 1 (phone, desktop); D04f, K11k frames; Reception draft cue.

## Phase 3 — Patient app

| Finding IDs | File:line | What changed | Status |
|---|---|---|---|
| F02 / R04 / T04 / V03 (doctor name) | src/ask.jsx:43, :47, src/care.jsx:145 | `visitCard` takes the booked doctor and shows their initials and name; Care's card and the appointment detail (`todayCard`) pass `S.appt.doc`. The follow-up card stays Dr. Sharma's, as it is. | Fixed |
| F09 / T05 / V06 / W01 | src/booking.jsx:71, :248 | The Fee row says "NPR 800, to pay with Khalti" (or "to pay at reception") until the wallet confirms; it never says "paid" before paying. The doctor page says "Consultation fee. Pay at reception, or with eSewa, Khalti or Fonepay." instead of "paid at reception". | Fixed |
| W01 / W14 (failure) | src/booking.jsx:71, failed screen | The taken, offline and no-reply screens add "You have not been charged." to the Fee row. No reply now says "Trying again is safe: if it did, you'll still be booked only once." | Fixed |
| R13 / T05 / W02 | src/booking.jsx:78, :84, :478, :479, src/more.jsx:217, src/care.jsx:232, :308 | A booking carries `pay: { how, paid, ref }`. The visit shows one of Paid · NPR 800 with Khalti · Receipt KHALTI-48213 / Not paid · Pay now / Pay at reception (`payCard`) on Confirmed, on Home (wallet bookings) and on the appointment detail. Cancelling the wallet sheet leaves it Not paid; Pay now reopens the hand-off. "Pay with X" on the (mocked) system sheet marks it paid, with a toast and a made-up receipt. Profile › Payments lists each payment with its receipt. The "with" visit-day line no longer says to pay at reception when it's paid. | Fixed (cancel from the appointment: not added) |
| W14 | src/booking.jsx:341, :470, :116 | A retry that finds the booking shows "You're booked once — Trying again didn't make a second booking." The reason box says "Saved…" only when it has text; the booking keeps the reason, so the no-reply screen no longer clears it. | Fixed |
| R10 | src/booking.jsx:307, :463, src/core.jsx:77 | Nothing is preselected: Pay at reception is a tile beside the wallets. Confirm reads "Choose how to pay" and is disabled until a choice; a line above it ("NPR 800, to pay at reception.") lifts it off the spot where Book was. `go()` records when the screen changed and Confirm ignores taps for 400 ms after that. | Fixed |
| F25 / R26 | src/health.jsx:432 | Digits tapped while the fourth one is moving on are buffered and replayed on the next PIN screen, so a fast create → confirm keeps every digit. | Partial: per-digit live announcement (R26) not added |
| V14 | src/booking.jsx (confirm, `bookedDone`), src/care.jsx:232, src/core.jsx:35 | The appointment detail has "Your booking": the reason given ("None given" if empty) and the payment card. The demo visit carries Anisha's reason, matching the doctor's queue. | Fixed |
| R23 / T14 | src/care.jsx:228 | The appointment detail offers Reschedule beside Get directions for a booked or back-on-time visit, including today's (it was only offered when running late). | Fixed |
| W11 | src/health.jsx:309, :525, src/booking.jsx:89, :457 | Book follow-up on a report (`report-fu`) opens Dr. Sharma with the reason pre-filled ("Follow-up on my HbA1c blood test from Aug 24. Dr. Sharma asked to see me."), a Follow-up tag on Review, and a warning on the doctor page and Review when a visit with her is already booked ("You already have a visit with Dr. Sharma · Today, 4:30 PM…"). The booking records `fu`. | Fixed |
| W10 | src/care.jsx:20, src/doctor.jsx:399 | In-app lab notifications name the test and reviewing doctor: "Your HbA1c blood test is ready — Dr. Sharma wants to see you" and, on release, "Your CBC blood test is ready — Dr. Sharma wants to see you" (without the second half when no follow-up is asked). The two are no longer identical. The lock-screen notification still names nothing. | Fixed |
| F22 / R22 / T22 | src/app.jsx:21, :512, :514, src/care.jsx:318, src/more.jsx:25 | The demo family belongs to 9841234412. Any other number goes from the SMS code straight to Create profile; Switch person and "Who is this visit for?" list only that number's people. (A jumped-to demo state with no number keeps the family, so the Figma frames still show.) | Partial: T22's "lock appointments too" not done |
| W16 | src/health.jsx:398, :409 | Leaving Clinica remembers the open Health screen and its back stack; unlocking returns there (e.g. the report), not Health's main screen. | Fixed |
| W15 | src/care.jsx:256, :290 | Profile's Notifications row reads "Off. You chose Not now" after Not now (still "Off in phone settings" when the phone blocks it). The Notifications screen says so, with "Turn on notifications". | Fixed |
| R25 / V16 | src/app.jsx:235, :241, :395, src/styles.css:272, src/care.jsx (pfdetails) | The date wheels run Year · Month · Day and the year wheel has focus when the picker opens. Sex options are one per row, 48 px tall. An optional Pronouns group (She/her, He/him, They/them, Prefer not to say) shows in Your details when chosen. | Partial: the typed field stays DD / MM / YYYY |
| V18 | src/booking.jsx:238 | The doctor page's dead "more" icon is removed. | Fixed |
| F15 / R12 | src/booking.jsx:13 | `tr()` and a Nepali string map for the booking flow: Find doctor, the doctor page, Review, the failure screens and Confirmed (titles, buttons, labels, specialty tiles). English stays the default; names, dates and times aren't translated; other flows stay English. | Partial: booking flow only, as scoped |
| F14 / R11 | src/app.jsx:19, src/health.jsx:349, :382, :465, :472, src/care.jsx:318 | Ramesh's profile is "Managed by Anisha Sharma". Anisha's own Clinica PIN switches to him, and on his profile Health asks for "your PIN, or Anisha's own Clinica PIN" (no new PIN to create). Same PIN screen. | Fixed (decision) |
| T28 class (HbA1c date) | src/health.jsx:25, :44 | The HbA1c report is dated Aug 24 (reviewed Aug 26), before the Aug 28 demo day; the list runs CBC, HbA1c, Thyroid, newest first. | Fixed |

### Decisions taken (Phase 3)
- Wallets stay mocked: "Pay with X" on the phone's sheet marks the fee Paid with a made-up receipt reference (KHALTI-48213, …); Cancel leaves it Not paid.
- Pay at reception is no longer a silent default: it's a tile chosen like a wallet. The B04 Figma frame now shows it chosen.
- Home shows the fee only for wallet bookings (Paid / Not paid · Pay now), so the B01 Home stays as designed; Confirmed and the appointment detail show all three states.
- The double-tap guard is the shared `go()` timestamp, used only by Confirm booking (a global tap block would slow every other screen).
- Health PIN caregiver path: a family record can be "Managed by" another person on the same number; that person's own Clinica PIN switches to the profile and opens its Health.
- Lab notifications in the app name the test and doctor (W10); the lock screen, the most public surface, still names neither.
- The demo family (Anisha, Ramesh) belongs to 9841234412 only.

### check.cjs changes (Phase 3)
- Changed: bookings pick "Pay at reception" before Confirm and wait 450 ms after reaching Review (the R10 guard); the B04/B04b asserts read "to pay at reception" / "to pay with eSewa"; the Notification centre clicks the named HbA1c and CBC notifications; the no-reply retry also asserts "You're booked once".
- Added (38; 399 → 437 "ok"): Confirm waits for a payment choice; Khalti + no reply → not charged → booked once → paid with receipt → Home and Profile › Payments; Fonepay + taken → not charged → cancel hand-off → Not paid → Pay now → paid; Pay now on the appointment detail; double-tap ignored; fast PIN typing across create → confirm; Care and detail name Dr. Suman KC; reason, payment and Reschedule on today's visit; HbA1c dated Aug 24; follow-up clash warning, tag and pre-filled reason; a new number goes straight to Create profile; pronouns; picker starts at the year; unlock returns to the report; W15 Not now; caregiver PIN switches and unlocks; no "more" icon; Nepali booking strings.
