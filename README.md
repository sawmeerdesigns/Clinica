# Clinica

A clickable prototype of a patient appointment and hospital management system for City Hospital. One shared day plays out across every role: a visit the doctor completes shows up on the patient's phone, and a walk-in the front desk registers lands in the doctor's queue.

## The apps

The tabs along the top switch who's using Clinica:

- **Patient** (phone): sign in by SMS, book a visit, Care, Health records, Ask, Profile
- **Doctor (Mobile)** and **Doctor Dashboard** (desktop): today's queue, complete a visit, review and release lab reports
- **HR Manager**: dashboard, staff directory, leave requests, attendance
- **Reception**: check-in, walk-ins, patients
- **Top Level Management** (admin): doctors, departments, patients, staff roles

The tabs along the bottom show the **Full flow**, the **Empty cases**, and the **Edge cases** panel (states you can't tap your way into, such as offline, an expired session or a public holiday).

## Demo sign-ins

| Role | Staff ID | Password |
|---|---|---|
| Doctor | `CH-0231` | `clinica` |
| Admin | `CH-ADM-04` | `clinica` |
| Front desk | `CH-FD-12` | `clinica` |
| HR | `CH-HR-03` | `clinica` |

Patient: any 10-digit number starting with 9 (e.g. `9841234412`), code `123456`. More test data is under **Edge cases → Test data and tips**.

## Run it

```sh
npm install
npm run dev        # http://localhost:5173
```

`npm run build` builds to `dist/`.

## Check it

`check.cjs` clicks through every flow with Playwright (first time: `npx playwright install chromium`). Start the dev server, then:

```sh
npm run check      # or: URL=http://localhost:4173 npm run check
```

## Built with

React 19 and Vite. The source lives in `src/`, one file per area: `booking.jsx`, `care.jsx`, `health.jsx`, `ask.jsx`, `doctor.jsx`, `desk.jsx`, `staff.jsx` and so on.
