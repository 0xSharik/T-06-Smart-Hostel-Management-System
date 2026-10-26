# Testing Report

## Scope and environment

This report records checks run for this repository revision. Automated test cases use Node's built-in `node:test` runner and do not require PostgreSQL. Frontend production build validates module resolution, JSX compilation, and asset bundling. Prisma validation checks the schema but does not confirm a live database migration.

## Automated test cases

Run from `backend/` with `npm test`.

| Case | Expected result |
|---|---|
| Demo room layout | Exactly 100 unique rooms across 10 floors; 200 seeded students; 380 total beds; 10 reserved and 5 maintenance rooms; 360 assignable beds |
| Allotment preference score | Floor, type, same-course roommate and free-bed weights rank a matching room higher |
| Allotment availability | Full and maintenance rooms are excluded from recommendation scoring |
| Occupancy status | Zero occupancy is available; partial occupancy is occupied; capacity reached is full |
| Admin account directory | Search query, pagination, role filter, linked room details, and password exclusion |

## Checks run

| Check | Command | Result |
|---|---|---|
| Backend unit tests | `npm test` in `backend/` | Passed: 5 tests, 0 failures |
| Prisma schema | `npx prisma validate` in `backend/` | Passed |
| Backend syntax | `node --check` for source, Prisma and test JS files | Passed: 52 files |
| API module load | `node -e "require('./src/app')"` | Passed during preceding bug-fix pass |
| Frontend production build | `npm run build` in `frontend/` | Passed; Vite reports unresolved `/assets/hero-bg.png` reference and a >500 kB bundle warning |
| Room map payload path | Source/API query review | Initial map now requests room summaries only; occupant details load per selected room and student selector filters unassigned at the database |
| Database migration status | `npx prisma migrate status` | Could not complete: Prisma schema engine connection error to configured PostgreSQL host |
| Full UI/API workflow | Browser against a populated disposable database | Not run; database connectivity is unavailable in this environment |

## Manual acceptance checklist

Run these checks against a disposable local PostgreSQL database before submitting:

- [ ] Sign in separately as student, warden, and admin; confirm each role lands on the correct pages and forbidden API roles receive 403.
- [ ] As admin, list accounts, search by name/email/roll number, filter role, paginate, open an account detail, and create an account. Confirm public registration cannot create a warden/admin.
- [ ] Page through the admin student directory and confirm it reaches records beyond the first 20; verify search and total count.
- [ ] Create a room and student profile; assign/unassign; verify room occupancy, floor map, room list, and dashboard update.
- [ ] Open the room map; verify the initial room-list response is compact, then select a room to load only that room's occupants; verify the assignment selector contains only unassigned students.
- [ ] Run allotment with floor/type preferences; confirm recommended available room and successful assignment.
- [ ] Generate QR by roll number and profile ID; scan once; confirm entry appears; confirm second scan is rejected; log exit; confirm exit appears.
- [ ] Confirm expired QR is rejected and unused pass is not counted as inside.
- [ ] Submit maintenance, update lifecycle, verify 48-hour breach list and notification using a ticket timestamp older than 48 hours.
- [ ] Edit mess menu, submit feedback, and inspect trend endpoint.
- [ ] Submit leave request as student; approve/reject as warden; confirm return as the owning student.
- [ ] Check responsive layouts on narrow mobile viewport and keyboard navigation on primary forms.
- [ ] Test camera scanning in browsers with and without `BarcodeDetector`, then verify server-side entry logging.

## Known test gaps

No database-backed integration/browser automation has been configured yet. QR camera scanning needs camera permission and a secure browser context (HTTPS or localhost). The backend migration could not be checked against the live configured database; apply migrations and execute the manual checklist locally before release. The seed is destructive and must only target disposable data.
