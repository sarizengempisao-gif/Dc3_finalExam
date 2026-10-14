You are working on TaxiGo, a Vue 3 + Vite + Vue Router + LocalStorage taxi booking management capstone (no backend). Your goal: make it build cleanly, work end-to-end with no runtime errors, and be ready for school submission. Work autonomously and verify each fix by actually running things. Do not just read the code and assume it works.

## Phase 1: Build and static health
1. Run `npm install`, then `npm run build`. Fix every error until the build passes with no errors and no warnings.
   - KNOWN BUG: src/App.vue imports `Taxi` from 'lucide-vue-next', which does not exist. Replace it with a valid icon (e.g. CarTaxiFront or CarFront). Check that icon names exist in the installed version by inspecting node_modules/lucide-vue-next.
   - Verify EVERY icon import in all .vue files the same way.
2. Run `npm run dev` and confirm the app loads with a clean browser console on every route (no Vue warnings, no unresolved imports, no 404s).
3. Remove dead code (e.g. the unused `Page` helper in src/router.js, unused imports and variables).

## Phase 2: Code review for bugs
Read every file in src/ (router.js, main.js, App.vue, services/*, views/*, style.css) and fix bugs, focusing on:
- Reactivity: views must refresh after data changes (the `taxigo:data-updated` event from storage.writeData). Check that listeners are added in onMounted and removed in onBeforeUnmount.
- Route guards in main.js: login/logout redirects, role redirects (admin vs passenger), no redirect loops, session persists after refresh, a stale or corrupt session in LocalStorage doesn't crash the app, and a deleted or changed user doesn't leave a ghost session.
- Corrupt or missing LocalStorage data must recover gracefully (readData fallback).
- Direct URL access and browser refresh on every route (Vite dev and `npm run preview`).
- Passengers must only see and edit their own bookings. Admin-only routes and actions must not be reachable by passengers.
- Input validation on every form: required fields, whitespace-only input, negative or zero numbers, out-of-range numbers, past dates, duplicate plate numbers or licenses or emails, passenger count vs vehicle capacity, phone format.
- Date handling: datetime-local strings vs ISO strings, timezone off-by-one errors, "minDate" logic.
- Money: rounding and PHP formatting are consistent. Booking fare, fare preview and payments all agree.
- Delete and edit safety: deleting a driver or vehicle assigned to an active booking must be blocked or handled. Payments must reference valid bookings.

## Phase 3: Verify every feature by testing it
Verify these flows by writing and running small scripts or Vitest/Playwright tests (devDependencies only, no changes to production dependencies), or by running the app and checking manually. Report PASS/FAIL for each item.
1. Login with admin@taxigo.local / Admin123! and passenger@taxigo.local / Passenger123!. Wrong-password errors show. Logout works.
2. Register a new passenger (valid, duplicate email, short password, bad phone), then confirm auto-login and that data persists after refresh.
3. Passenger: create, edit and cancel a booking. The fare preview matches the saved fare. History persists after refresh.
4. Admin: search and filter bookings. Confirm a booking and assign a driver and vehicle.
5. Assignment rules: an occupied driver is rejected, an occupied vehicle is rejected, an inactive driver is rejected, a vehicle in Maintenance is rejected, and a vehicle with too few seats is rejected.
6. Status workflow: Pending → Confirmed → In Progress → Completed. Only Confirmed can start. Invalid transitions are blocked. Completing or cancelling releases the driver and vehicle.
7. Drivers CRUD and availability. Vehicles CRUD, capacity and maintenance status.
8. Payments: record a payment for a completed booking, change its status, and block duplicates or overpayment if applicable.
9. Dashboard and Reports: totals, status counts and revenue match the data. CSV export downloads with correct, properly escaped content (commas and quotes in addresses).
10. Fare settings: changing base fare, rate and service fee updates new estimates.
11. Profile page: update name and phone, and change password if it exists.
12. "Reset demo data" restores the seed state, clears the session, and redirects to login.
13. Edge cases: empty states on every list, very long text, rapid double-click submit (no duplicate bookings), and 20+ records.

## Phase 4: UI/UX and responsiveness
- Test at 360px, 768px and 1280px widths. Fix overflowing tables, modals taller than the viewport, and an unusable mobile sidebar (open and close, close on route change).
- Every button, form and modal has working loading, empty and error states. Modals close on Esc and backdrop click. Icon-only buttons have aria-labels. Inputs have labels. Focus is visible.
- Consistent terminology and PHP currency formatting. No console.log left in the code.

## Phase 5: Submission readiness
- Make the README accurate: fix the "Project structure" section to match the real folders, or reorganize the code to match it. Keep demo credentials and limitations documented.
- `npm run build` and `npm run preview` both work from a fresh clone (`rm -rf node_modules dist && npm install && npm run build`).
- .gitignore covers node_modules and dist. Add a `lint`-free sanity check if cheap. Don't add heavy tooling.
- Don't add a backend, map API, or payment gateway, and don't change the stack. Keep changes minimal and in the existing code style.

## Rules
- Fix issues as you find them, and re-run the build after each batch of fixes.
- Don't rewrite working code just for style.
- Do not claim something works unless you ran it.

## Final output
Give me: (1) a list of every bug found and fixed (file + what changed), (2) the PASS/FAIL checklist from Phase 3, (3) anything you couldn't verify or that remains risky, and (4) a short manual test script I can run for my defense/demo.

# TaxiGo — Taxi Booking Management System

A student-scale taxi booking management capstone built with **Vue 3, Vite, JavaScript, CSS, Vue Router, and browser LocalStorage**. No Laravel, PHP, MySQL, backend API, map API, or real payment gateway is used.

## Requirements
- Node.js 18+ (Node 20+ recommended)
- npm

## Run locally
1. Extract the `TaxiGo.zip` archive.
2. Open the `TaxiGo` folder in VS Code.
3. Open a terminal in that folder.
4. Run:
   ```bash
   npm install
   npm run dev
   ```
5. Open the local URL printed by Vite.
6. For a production build, run `npm run build`.

## Demo accounts
The app seeds demo data on first launch:
- **Admin:** `admin@taxigo.local` / `Admin123!`
- **Passenger:** `passenger@taxigo.local` / `Passenger123!`

These are demonstration credentials only. Accounts and passwords are stored locally in the browser and are **not secure for production**. Do not use real personal information or passwords.

## Included modules
- Dashboard and activity summary
- Passenger registration/login and admin login
- Passenger booking creation and history
- Admin booking search, status management, and driver/vehicle assignment
- Driver CRUD and availability
- Vehicle CRUD, capacity and maintenance status
- Payment recording and status handling
- Reports with date-independent totals and status summaries
- Fare settings (base fare, rate per estimated kilometre, service fee)
- LocalStorage persistence, demo-data reset, responsive UI and validation

## Booking workflow
`Pending → Confirmed → In Progress → Completed`; bookings can also be cancelled. Only confirmed bookings can start. Completing or cancelling a ride releases its assigned driver and vehicle. The assignment checks prevent the same driver/vehicle from being used on another active ride, and vehicles must have enough seats.

## Fare estimate
`Base fare + (manually entered estimated kilometres × per-km rate) + service fee`.

The initial example rates are ₱50 base fare, ₱15/km, and ₱10 service fee. They are illustrative demo settings, not official taxi tariffs. There is no GPS or automatic road-distance calculation.

## Data and limitations
- Records are stored in the current browser profile's LocalStorage.
- Data does not synchronize across devices, browser profiles, or users.
- Local role separation is a classroom simulation, not secure authorization.
- Payment status is a record only; no actual money is processed.
- Use **Reset demo data** from the admin sidebar to restore the initial demo dataset.

## Project structure
```text
src/
  services/        Storage, auth, fare, and booking rules
  views/           Login, dashboard, bookings, drivers, vehicles, payments, reports, profile
  App.vue
  main.js
  router.js
  style.css
```

## Verification before submission
Run `npm install` and `npm run build`. Then manually verify:
1. Login with both demo accounts.
2. Create a passenger booking and refresh the browser.
3. Confirm and assign a driver and vehicle as admin.
4. Attempt to assign an occupied driver or vehicle.
5. Start and complete a ride, then record a payment.
6. Check dashboard/reports and refresh.
7. Cancel a separate booking and verify resources are released.
8. Reset demo data and verify the app returns to its seeded state.

This project is provided as a complete educational starter implementation. Always run it and perform the above checks in your own environment before submission; no software can be guaranteed error-free on every machine.
