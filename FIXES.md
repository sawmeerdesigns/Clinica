# Clinica — usability fixes

Fixes for the findings from the five synthetic usability runs: F = run 1, R = run 2, T = run 3, V = run 4 (with axe A1–A6), W = run 5. There is no V15 or V20. Each change cites its finding IDs in a code comment. A finding reported in more than one run has one row, listing every ID. Line numbers are for the current tree.

Status key: **Fixed**, **Partial** (what's missing is named), **Deferred** (with the reason), **Not a code defect** (with the reason).

## Master table

| Finding IDs | File:line | What changed | Status |
|---|---|---|---|
| F01 · R01 | src/desk.jsx:155, src/doctor.jsx:39, :493 | `k-rep` sets `S.drRep` as well as `S.kRep`. `d-choice` no longer copies text into the comment: the suggestion is computed at render time from the report on screen (`drSuggest`), so another patient's comment can't land in it, on phone or desktop. | Fixed |
| F23 · W06 · T10 | src/doctor.jsx:28, :37, :42, :114, :194, :492, src/desk.jsx:155 | A report opens undecided with an empty comment, and Release stays disabled until a decision is picked. The suggested text is only a "Suggested: …" placeholder ("Leave it blank to send the suggested text"). A visit note starts empty, with the prepared note as a placeholder. Each lab value shows its reference range ("Range 12.0–15.5 g/dL"), and the Normal/High/Low flag is worked out from the value. The ranges are fictional but plausible. | Fixed |
| T15 | src/doctor.jsx:364, :495, :500 | Changing the decision after writing your own comment opens "Keep your comment?" with "Keep my comment" and "Use the suggested text". | Fixed |
| W05 | src/doctor.jsx:355, :398, src/desk.jsx:198 | Both release sheets name the patient and ID and quote the exact comment she'll see. The follow-up sheet says she'll be asked to book a follow-up. "Will be told to expect a call" is gone. | Fixed |
| T03 | src/booking.jsx:197, src/health.jsx:524 | Home's "Lab report ready" sets `S.report` to the newest released report (HbA1c) before opening Health, as the notification already did. | Fixed |
| F04 · R02 · T01 · V01 | src/doctor.jsx:99, :194, :439, :468 | A visit starts with no medicines, and nothing is pre-filled from the booking reason. Each medicine card has Edit (the same form, filled in) and Remove. Phone and desktop share these pieces. | Fixed |
| R24 | src/doctor.jsx:178, :202, :449 | Add medicine has a required "Dose each time" field, so a card reads "1 tablet, twice a day", and the quantity travels with it. "In 2 weeks" shows its date while you choose ("In 2 weeks · Fri, Sep 11"). | Fixed |
| F03 · R03 · T02 · V02 | src/doctor.jsx:206, :469, src/desk.jsx:148 | The draft lives in `drKept` from `d-start`, so every way out of the phone visit keeps it. A restored draft shows "Draft kept — your note, medicines and follow-up are as you left them." | Fixed |
| T21 | src/staff.jsx:502, :798 | Coming back to a half-filled walk-in form shows the same "Draft kept" cue. | Fixed |
| F05 · R08 · T12 · V17 | src/doctor.jsx:367, :478, src/desk.jsx:154, :199 | Complete visit opens a review sheet built on the release-sheet pattern. It shows the note, each medicine with dose, duration and quantity, the follow-up as a real date, and a "Same medicine twice" warning. "Back to editing" loses nothing. Same on desktop. | Fixed |
| F24 · R20 · T11 · W07 · V09 | src/core.jsx:96, src/app.jsx:742, src/doctor.jsx:53, :211, :402, :507, src/desk.jsx:77 | One shared `toast()` live region. Release shows "CBC blood test released to Anisha Sharma." with Undo for 5 s, and Undo fully reverts it. Reports (phone and desktop) lists "Released today" with who released it and when. | Fixed |
| T25 | src/doctor.jsx:147, :150, :155, :161, :285, :451, src/desk.jsx:56, :79 | "View Anisha's history" is on the report. The tag reads "Seen by you". Every entry opens. History also lists "Lab results" (CBC Aug 28, HbA1c Aug 24, Thyroid Jul 3; Kabita's lipid panel). A result waiting on the doctor opens for review; any other opens read-only with its values (when the lab sent them), who reviewed it and what the patient was told, on phone and desktop. No test repeats in the data, so there is no trend line (marked `ponytail:` at :155). | Fixed |
| R30 | src/doctor.jsx:86, src/desk.jsx:22 | The Reports nav item shows the pending count (and " waiting" for screen readers), on phone and desktop. | Fixed |
| V21 | src/doctor.jsx:237, :476 | "You're with … now." is a link that opens that visit, with its kept draft. | Fixed |
| F02 · R04 · T04 · V03 | src/ask.jsx:42, src/care.jsx:144, :145 | `visitCard` shows the booked doctor's initials and name. Care groups visits by their real date, so only a visit today sits under "Today". | Fixed |
| F09 · R13 · T05 · V06 · W01 · W02 | src/booking.jsx:68, :77, :248, :342, :481, src/care.jsx:116, :161, :232, :233, :254, :307, :387, src/more.jsx:217 | The fee says "to pay with Khalti" until the wallet confirms, and "You have not been charged" on any failure. A booking carries `pay`, and the visit shows Paid · receipt ref, Not paid · Pay now, or Pay at reception (Confirmed, Home, appointment detail). A cancelled hand-off can be retried. Profile › Payments lists receipts. The doctor page no longer says "paid at reception". Reschedule is offered (see R23 · T14). R13: today's visit has Cancel visit until check-in, with the follow-up's confirm sheet; a wallet-paid fee "goes back to your eSewa wallet" (mocked), then a toast, and she leaves the doctor's queue. | Fixed |
| W14 | src/booking.jsx:116, :341, :473 | A retry that finds the booking says "You're booked once — Trying again didn't make a second booking." The reason box says "Saved" only when it has text, and the reason survives the failure. | Fixed |
| R10 | src/booking.jsx:306, :466, src/core.jsx:76 | Nothing is preselected: Confirm reads "Choose how to pay" and stays disabled until a choice is made. A line above it lifts it off the spot where Book was. Confirm ignores taps for 400 ms after a screen change. | Fixed |
| F25 · R26 | src/health.jsx:83, :432 | Digits tapped during the PIN screen change are buffered and replayed. A hidden live line says "n of 4 digits entered". | Fixed |
| V14 | src/booking.jsx:472, src/care.jsx:232, src/core.jsx:35 | The appointment detail has "Your booking": the reason given ("None given" if empty) and the payment card. | Fixed |
| R23 · T14 | src/care.jsx:228 | Today's appointment offers Reschedule beside Get directions. | Fixed |
| W11 | src/health.jsx:310, :525, src/booking.jsx:88, :300 | Book follow-up pre-fills the reason from the report, tags the booking as a follow-up, and warns when a visit with the same doctor is already booked. | Fixed |
| W10 | src/care.jsx:20, src/doctor.jsx:399 | In-app lab notifications name the test and the reviewing doctor, and the two are no longer identical. | Fixed |
| F22 · R22 · T22 | src/app.jsx:20, :515, src/care.jsx:308, :318, :366, :447, src/more.jsx:25, src/booking.jsx:136, src/health.jsx:46, :352, :399 | The demo family belongs to 9841234412 only. Any other number goes from the SMS code straight to Create profile. Switch person and "Who is this visit for?" list only that number's people. T22: on a shared number, a person with a Health PIN has Home's appointments and medicines locked too ("Locked on this shared phone"), opened by the same PIN screen. Each person can turn it off in Health lock ("Also lock appointments and medicines"). Switching person with their PIN opens their Home unlocked. | Fixed |
| W16 | src/health.jsx:399, :409 | Unlocking after leaving the app returns to the screen that was open, with its back stack. | Fixed |
| W15 | src/care.jsx:256, :290 | Profile's Notifications row reflects the user's choice ("Off. You chose Not now"). | Fixed |
| R25 · V16 | src/app.jsx:235, :241, :395, src/styles.css:275 | The date wheels run Year · Month · Day, and the year has focus when the picker opens. Sex options are one per row, 48 px tall. There's an optional Pronouns group with "Prefer not to say". The typed field stays DD / MM / YYYY, Nepal's convention (decision, Phase 6). | Fixed (decision) |
| V18 | src/booking.jsx:238 | The doctor page's dead "more" icon is removed. | Fixed |
| F15 · R12 | src/core.jsx:104, src/app.jsx:68, :218, src/booking.jsx:12, :47, src/health.jsx:61, src/care.jsx:44, src/meds.jsx:98 | `tr()` and its Nepali strings moved to core.jsx. The shared helpers (heading, btn, support, listItem, empty, bar, label, tag, row, tab bar, lbl, notice, setting, sheets, form labels) pass text through it, so Home, the tab bar, Care, Health, Medicines, Profile, sign-in, Create profile and the Health lock follow the language, as well as booking. Only the patient app translates. Names, dates, times, amounts, long clinical text (notes, report wording) and the legal pages stay English. | Fixed |
| F14 · R11 | src/app.jsx:19, src/health.jsx:382, :466, :473 | Caregiver path: Ramesh's profile is "Managed by Anisha Sharma", and Anisha's own Clinica PIN switches to him and unlocks his Health. The lock screen already says what's behind it ("your visits and prescriptions"). | Fixed (decision) |
| F20 | src/data.js:6, src/booking.jsx:25, src/ask.jsx:25, :329, :357, src/care.jsx:29, :37, :404, src/more.jsx:111, src/meds.jsx:121, src/desk.jsx:9 | Weekday labels are generated from real dates around the demo day, Fri Aug 28, 2026. | Fixed |
| T28 | src/staff.jsx:47, src/health.jsx:25 | Prasant's request is dated Aug 27, and the HbA1c report is dated Aug 24, both before the demo day. Full doctor names replace "Dr. Shrestha" (see R29). | Fixed |
| F07 · R05 · T06 · V07 | src/data.js:52, :73, src/staff.jsx:94, :307, src/doctor.jsx:16 | Every count comes from one arrivals list that covers all five departments. The dashboard, Departments and Reception agree. V07's per-department waiting is in the F13 row. | Fixed |
| R07 · T08 | src/data.js:42, src/staff.jsx:130, :155 | A department's doctors are whoever on the roster has that specialty, so a doctor added in admin joins her department at once. A doctor not in today reads "Not in today · works Sun–Thu · next in Sun, Aug 30", worked out from her working days and TODAY (doctor page and department page). | Fixed |
| W20 | src/data.js:22, :34, src/booking.jsx:27, src/staff.jsx:26, src/health.jsx:35 | One `DOCTORS` record per doctor. Dr. Sunita Rai is Paediatrics everywhere. | Fixed |
| R29 | src/staff.jsx:351, :353 | The header reads "5 departments · 7 OPDs", counted from the data. The cards use full names ("Dr. Maya Shrestha on leave"). | Fixed |
| F10 · R09 · T19 · V08 | src/data.js:82, src/staff.jsx:469 | Every booking for today is in arrivals from the start. Search matches name, phone digits, CH- ID, doctor and department. | Fixed (decision: reverses Figma R06/R07) |
| F11 | src/data.js:87, src/staff.jsx:281, :735, :861 | Rows show age and "phone ending 8821". Check in opens a confirm sheet naming the patient, age, sex, ID, last 4 digits and doctor. | Fixed |
| F21 | src/staff.jsx:281 | Each arrival row gives doctor · department · OPD. It's a list, so the department is a field, not a column. | Fixed |
| W12 · R15 | src/data.js:44, src/staff.jsx:495, :712, :873 | A typed department or symptom lists that department's doctors on duty to choose from. Nothing is picked silently, and unknown text isn't accepted ("Choose one of the … doctors below"). | Fixed |
| T09 · V10 | src/staff.jsx:483, :710, :890 | A matched walk-in says "Matched to CH-1187". The booking's reason, "Told the desk today" and a "Note for doctor" are all kept. | Fixed |
| F12 · R14 · T20 | src/staff.jsx:504, :768, :773 | Age and Sex are required, a new walk-in gets a CH- number, and saving shows a toast and highlights the new row. | Fixed |
| F26 | src/staff.jsx:522, :351, :287, :796, :963, src/styles.css:915, src/app.jsx:228, src/doctor.jsx:251 | Polish batch: Enter submits the walk-in form; "7 OPDs" is explained ("5 departments · 7 OPDs"); the "You're with…" banner opens the visit. Tapping the empty date-of-birth field opens the picker (a typed date stays editable). A new staff member is highlighted in the directory (`--surface-info`, as a new walk-in) and scrolled into view. | Fixed |
| F18 · R19 · T13 | src/staff.jsx:101, :557, :571, :581, :926, :941 | Add staff has a start date (required), grade and council number. Required and optional fields are marked. The hire shows Pending until the start date, and every record has Edit. New staff join Attendance from their start date. T13: "Export for payroll" on Staff downloads a CSV (name, employee ID, job title, department, start date, grade, and August's working, present, leave and absent days). | Fixed |
| F16 · R18 · T16 · V11 · W08 | src/staff.jsx:644, :655, :763, :922, :933, :423 | The request shows the reason. A prominent, accurate coverage warning is worked out from the staff list. Approve and Deny each confirm, Deny takes an optional reason that is sent to the employee, and a toast offers Undo for 5 s. The approver and time are recorded. The page says who can decide. W08: after the Undo window a decided request has Reopen, which returns it to Pending and writes to the audit log (Settings › Role and leave changes). | Fixed |
| W19 | src/staff.jsx:612 | Leave rows read "Nurse · Cardiology · Annual leave". | Fixed |
| F17 · R17 · T17 · V12 | src/staff.jsx:55, :114, :666, :685 | Attendance is worked out day by day from the requests. There's one "Absent" label, every leave day links to its request, and requests say "8 calendar days · 7 working days". Attendance counts working days in the month shown only, and Recent days stops at the demo day. Phase 6: the working week is Sun–Fri, like the OPDs (August 2026 has 24 working days so far; Prasant's Sat–Mon is "3 calendar days · 2 working days"). | Fixed |
| V13 | src/staff.jsx:603, :635 | The dashboard's leave rows have status chips. There's one Sort control, and the period stays visible while searching. | Fixed |
| F06 · R06 · T24 | src/staff.jsx:106, :344, :754, :844 | Fallbacks are gone: a blank field shows "Not set · Add". Specialty and OPD are pick-lists. Saving without an OPD or working days asks first. | Fixed |
| W09 | src/staff.jsx:401, :540, :549 | The Staff column is "Job title", and the record shows "Access: …" with a Change link. Role changes are logged. | Fixed |
| F08 · F19 · R16 · T18 | src/staff.jsx:19, :31, :401, :439, :748, :838 | New Nurse access role, given to the nurses and the lab technician. Assign role states the one-role rule, and a switch lists what access will be lost. Every role change goes to an audit log (Settings › Role changes). | Fixed |
| W04 | src/staff.jsx:67, :107, :439 | An "Also approves leave" add-on with an optional end date. Whoever has it gets Leave requests and keeps their own pages. | Fixed |
| F13 · R21 · T07 | src/staff.jsx:139, :316, :364 | The dashboard has "Waiting by department". A closed department is flagged with the reason, the cover and the reopening time. | Fixed |
| T27 | src/staff.jsx:140, :308 | "Waiting on doctor review" is now "Reports awaiting review". The closure reason and reopening time are in the F13 row. | Fixed |
| T23 | src/data.js:44, src/staff.jsx:23, :64, :92, :222, :326, :372, :385, src/app.jsx:767 | Plain-language subtitles ("Cardiology · heart"). A read-only Trustee access level (sign-in `CH-TRS-01`, under Top Level Management) sees Dashboard and Departments only, with Add department, the cover control and the links into editable records hidden. Trustees are kept off the staff list and Assign roles. | Fixed |
| T26 | src/app.jsx:357 | No change. The policy is placeholder legal text, marked "Draft wording" in the UI on purpose for City Hospital's legal team to replace. | Not a code defect: content owned by legal |
| W03 · W17 | src/app.jsx:678, :705, src/core.jsx:96 | When the screen, app or sheet changes, focus moves to the new screen's h1 (`tabindex="-1"`). Closing a sheet returns focus to its trigger. Every success state goes through the one toast live region, and duplicate `role="status"` notices are removed. The SMS code's 6th digit lands on the next heading. | Fixed |
| W13 | src/booking.jsx:55, src/app.jsx:65, :67, src/doctor.jsx:80, src/desk.jsx:30, src/staff.jsx:231, src/ask.jsx:54, src/meds.jsx:66 | Titled app bars render an h1. Untitled screens and desktop detail pages get their own h1. Every one of the 332 Figma frames has exactly one h1 (MT09 is a push-notification stand-in). | Fixed |
| V05 | src/app.jsx:700 | While an `aria-modal` dialog is open, everything behind it is `inert` (the scrim, home indicator and toast stay live). | Fixed |
| A2 · R28 · V19 | src/staff.jsx:264, :275 | `sTable` uses table › rowgroup › row › columnheader/cell roles. Each row's name is a real link. | Fixed |
| R27 · W18 | src/staff.jsx:226, :230, :265, src/booking.jsx:227, src/app.jsx:237, :772, src/styles.css:68 | `aria-sort` on sorted columns, live result counts, unique back-link names, a skip link, avatar initials hidden, Sex read once. Day and time picks were already `role="radio"` with `aria-checked` (the right pattern, so no `aria-pressed`). Tabs already had `aria-current`. The code auto-submit is covered by W17. | Fixed |
| A1 | src/styles.css:5 | `--text-tertiary` is #646a72. | Fixed |
| A3 | src/staff.jsx:270 | `items.length > 0 &&`, so aria-checked is never "0". | Fixed |
| A4 | src/app.jsx:329 | Onboarding step dots have `role="img"`. | Fixed |
| A5 | src/app.jsx:692 | A `.body` that actually scrolls gets `tabindex="0"`, `role="region"` and the screen's heading as its name. | Fixed |
| A6 | src/app.jsx:698, :779 | `main.stage` is a div. It takes `role="main"` only when the app has no `<main>` of its own. | Fixed |
| V04 | src/styles.css:814, :1033, src/app.jsx:718 | The `scale(var(--k))` frame is gone. The desktop apps fill the width up to 1440 px and fit the window's height (600–900 px). Below 1024 CSS px, the side nav becomes a wrapping top bar, columns stack, the page grows to its content, and data tables scroll sideways in their own container. Sheets and the toast are pinned to the viewport. At 720×450 (200% zoom), 13 desktop screens have no page-level horizontal scroll, median text is 14 CSS px, and nothing is transformed. | Fixed |

Also fixed, outside the catalogue:
- **"OPDs running" restored, Phase 6** (src/staff.jsx:388). Phase 0 left it inside a `//` comment on the department page, so the row never showed.
- **Phase 3 regression, fixed in Phase 5a** (src/health.jsx:45). Phase 3 left the default `visit`, `rx` and `rxNone` inside a trailing comment, so H04 Visit detail threw. They're restored, and all 332 Figma frames render without errors.
- **"Closed today" chip contrast** (WCAG 1.4.11, run 4) (src/styles.css:515, src/staff.jsx:320, :355). The chip has a 1 px `--border-strong` edge at 3.09:1.

### Phase 7 (Figma sync bugs)
- **NM03 weekday** (src/more.jsx:82). The lock screen said "Thursday, 28 August"; it now formats `TODAY` (data.js), so it reads "Friday, 28 August". No other hard-coded weekday + date pairs on lock screens or notifications (captions' "Tue, Sep 1", "Thu, Sep 3", "Sun, Aug 30" and "Sun, Sep 13" are correct).
- **Pay at reception icon** (src/booking.jsx:65, src/styles.css:963). `lt-fee.svg` is white, so the unselected tile showed white on white. It now sits in a `pay-mark` with the lead tiles' `--surface-icon-neutral-bold`, like the wallets' marks (B04, B04b, SB02, OD12…).
- **SY7 behind the prompt** (src/more.jsx:259). The preset's booking had no pay record, so the card said "Pay at reception". It is now an unpaid eSewa booking: "Not paid · NPR 800 with eSewa".
- **Nepali gaps** (src/core.jsx:184–197, src/booking.jsx:32–35, :73, :135, :168–169, :244, :272, :358–361, :472, :83, :386, :392, src/health.jsx:126–131, :267, :281, :315, :334, :354, src/care.jsx:143, :360, src/app.jsx:189, src/ask.jsx:34–38). New `ne()` in core.jsx (the same patient-only test `tr()` uses) for lines whose Nepali word order differs: "आज 4:30 PM मा बुक गर्नुहोस्" and B06's heading and first line. `when()` gives "आज, 4:30 PM"/"भोलि, …". Raw labels now go through `tr()`: Call the clinic, Show to pharmacist, Download report, Forgot your PIN?, Use PIN instead, Done, the payment card's title and "when you check in", Home's visit-day card titles, the walk-in card, and the fingerprint sheet. New Nepali for Tomorrow, Where, Your visit, B06, the fee line, the three Health lock bodies, H14's body and the sheet. `clinicCall` became a function so it reads the current language. Ask's action buttons and chips (`obtn`, `ocall`, `chipRow`) pass through `tr()`. Clinical text, Ask's answers and the legal pages stay English, as decided.
- **Medicine names on the lock screen** (src/more.jsx:61, :100, src/meds.jsx:166). Following W10: the in-app centre (MT07) may name the medicine; the lock screen now has a medicine alert that doesn't ("Time for your medicine · Open Clinica to log it.", opening Metformin through the Health lock). MT07's caption says so instead of "kept as designed, flagged".
- **Pager on one-page tables** (src/staff.jsx:267, src/styles.css). No table pages its rows, so "Previous / 1 / Next" only ever had one page. The pager and its CSS are removed from all five staff tables (R09 and the four others that shared `sPager`).
- **Review panel** (src/care.jsx:480). SB03 showed B05's ID and caption because `NUM.confirmed` always returned B05; a booking for someone else now maps to SB03, so its own caption shows. D02 was already in FLOW (src/doctor.jsx:571). Every one of the 351 FLOW frames now maps back to its own ID. The all-frames list `ns.json` was stale (332 IDs, built by a source scan that skipped double-quoted titles and escaped apostrophes, e.g. 09, 12, D02, R01, T04a2–a4, T04b2, T04c2–c6); it is regenerated from FLOW (351).

## Decisions taken

From the spec:
- **Booked patients in arrivals.** Every booking for today shows in Reception's arrivals from the start. This reverses Figma R06/R07, whose captions were rewritten. R07 now shows the "Matched to CH-1187" path.
- **Health PIN caregiver path.** A family record can be "Managed by" another person on the same number. That person's own Clinica PIN switches to the profile and unlocks its Health, with no second PIN.
- **Reload** (src/app.jsx:601, Phase 5b). After a reload, the drafts come back from sessionStorage: the doctor's visit drafts (`drKept`), the reception walk-in (`S.wk`, shown with "Draft kept") and the patient's booking reason. Staff stay in their own app, signed in, on its home screen: a doctor on the queue, Reception on arrivals. Only a real reload restores. A plain navigation starts the demo fresh, so tests and links are unaffected. Blocked storage is ignored. Real persistence is out of scope. The run 5 report filed reload as a prototype limit, not a W finding.
- **Wallets stay mocked.** "Pay with X" on the mocked sheet marks the fee Paid with a made-up receipt reference (KHALTI-48213…). Cancel leaves it Not paid.

Data (Phase 0):
- Specialties and OPDs follow the staff app.
- Saturday is the closed day. Aug 28, 2026 is a Friday, so the slots and edge-case states that pointed at Saturdays moved by one day (Dr. Joshi's next slot is Sun, Aug 30; C03/C04/K05/SC03 are on Sun, Sep 13).
- Doctors work Sun–Fri. Dr. Suman KC works Sun–Thu, which is why he is off today.

Doctor apps (Phase 2):
- Follow-up still defaults to "No follow-up". The review sheet shows it before anything is saved.
- "Released by" is the signed-in doctor, at the demo's moving clock.
- Figma frames D04, D04b, K11b and the history frames keep the prepared medicines, so those states stay reviewable. Start visit itself begins empty. The D06/K20 frames still preset a decision.

Patient app (Phase 3):
- Pay at reception is a tile you choose, like a wallet, not a silent default. The B04 frame shows it chosen.
- Home shows the fee only for wallet bookings. Confirmed and the appointment detail show all three states.
- The double-tap guard is the shared `go()` timestamp, used only by Confirm booking.
- Lab notifications in the app name the test and the doctor. The lock screen, the most public surface, still names neither.
- The demo family (Anisha, Ramesh) belongs to 9841234412 only.

Reception, HR, Admin (Phase 4):
- Cardiology's cover while it's closed is Dr. Ramesh Shrestha, General medicine, OPD 1 (`COVER` in data.js). It reopens on the next day a department doctor works.
- Every patient has a masked phone with real last-4 digits (`PHONE_END`).
- Leave requests were added for Aug 17–21 (Maya), Aug 19 (Dr. Ramesh Shrestha) and Aug 7 (Dr. Sunita Rai), so every leave day has a request. Earlier approvals are recorded as Anjali Basnet's.
- HR working days were Mon–Fri (changed in Phase 6, below).
- Age and Sex are required for walk-ins. Phone stays optional.
- Searching arrivals covers doctors, so "sunita" also returns Dr. Sunita Rai's patients.
- The nurse view reuses today's arrivals, filtered to the nurse's department.

Accessibility and the shell (Phase 5):
- A role-tab click leaves focus on the tab. The skip link gets into the app, and in-app navigation moves focus to the new heading.
- Booking confirmed is announced both by the toast and by focusing "Appointment booked".
- A5, A6 and V05 are applied in the shell's layout effect, so new screens get them automatically.
- V04: the desktop breakpoint is 1024 CSS px. Above it the layout matches Figma, with the frame up to 1440 px wide and 600–900 px tall. Below it, the top bar and stacked columns don't have a Figma design.

Phase 6 (the product questions, answered with defaults):
- **Sunday.** HR attendance counts Sun–Fri, matching the OPDs (Nepal's working week); only Saturday is off. August 2026 has 24 working days up to the demo day, and Prasant's Sat–Mon leave is "3 calendar days · 2 working days".
- **Cover for a closed department.** The department's admin page shows who covers it, with a select to change it (doctors on duty in other departments). `COVER` in data.js stays the default.
- **Nurses checking patients in.** Kept as is: the Nurse role can check patients in for their department.
- **Family privacy (T22).** On a shared number, a person with a Health PIN has Home's appointments and medicines locked too by default, opened with the same PIN. Each person can turn it off in Health lock.
- **Trustee view (T23).** A read-only Trustee access level in the staff app (Dashboard and Departments, nothing that changes data). Trustees aren't staff, so they're not in the directory, Attendance or Assign roles.
- **Payroll (T13).** HR's Staff page has "Export for payroll", a CSV made in the browser (no dependency).
- **Cancelling today's visit (R13).** The patient can cancel in the app until checked in. A wallet-paid fee goes back to the wallet (mocked).
- **Reopening leave (W08).** A decided request has Reopen once the Undo window has gone; it returns to Pending and is logged.
- **Nepali (F15 · R12).** The patient app's chrome is translated through one `tr()` in core.jsx. Long clinical text (doctors' notes, report wording) and the legal pages (privacy policy, terms) stay English until there's reviewed translation. The care team's apps stay English.
- **Date of birth (R25 · V16).** The typed field stays DD / MM / YYYY, Nepal's convention. Tapping the empty field opens the picker (F26).
- **Doctor history (T25).** No lab test repeats in the demo data, so there's no trend yet.

## Needs product input

- **Privacy policy (T26).** The legal text itself.
- **Narrow desktop layout (V04).** Design the below-1024 px layout in Figma.

## check.cjs changes

- **Phase 0:** weekday labels and Reception counts follow the real dates and the single arrivals list (13 → 20 patients).
- **Phase 1:** release flows pick a decision first, and the follow-up button is "Release with follow-up request". 11 new assertions.
- **Phase 2:** D04 asserts an empty draft with a placeholder suggestion, and Complete visit goes through the review sheet. About 30 new assertions (medicines, draft cue, ranges, history, toast + Undo, badge).
- **Phase 3:** bookings choose a payment and wait 450 ms on Review (R10). 38 new assertions; 399 → 437 "ok".
- **Phase 4:** arrivals 20 → 21; check-in, approve and Add doctor confirm in sheets. 30 new assertions; 437 → 467.
- **Phase 5a:** 13 new assertions (skip link, one main, focus to the h1, table roles, aria-sort, inert, toast); 467 → 480.
- **Phase 5b:** no change, still 480 "ok", exit 0. V04 and the reload decision are checked by scratchpad scripts (`v04/reflow.cjs`, `v04/reload.cjs`).
- **Phase 6:** 480 → 512 "ok", exit 0. New assertions cover T25 (labs in history, read-only and review paths, desktop), R13 (cancel today, wallet refund, toast, queue, none after check-in), T22 (locked Home, same PIN, per-person toggle), F15 · R12 (Nepali on Home, tab bar, Care, Health lock, Medicines, Profile, Create profile, sign-in), T08, cover select, F26 (date picker, highlighted staff row), T13 (CSV download), W08 (Reopen + audit log) and T23 (trustee). Changed by the decisions: the first-run flow switches back to English after choosing Nepali; Profile switches back to English after P03; `#dob` is focused rather than clicked before typing (a click now opens the picker); "← Home" now lands on the locked row and unlocks with the PIN; HR04 expects "3 calendar days · 2 working days" (was 1) and HR08 "24 working days so far (Sun–Fri)" (was 20).
- **Phase 7:** 16 new assertions (lock-screen weekday and medicine alert, pay tile icon, SY7, R09 pager, SB03 and D02 in the panel, Nepali on B06, B03, B05, B10, H01, H06, H07, H09, H15, H17, B07); 512 → 528 "ok", exit 0, `page errors: []`.
