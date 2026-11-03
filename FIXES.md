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
