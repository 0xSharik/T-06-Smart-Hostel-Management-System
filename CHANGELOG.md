# Changelog

Project changes are recorded here by date. This log summarizes repository changes and is not a release/version guarantee.

## 2026-10-26

- Fixed student room assignment to update assignments transactionally with a capacity guard.
- Fixed visitor QR roll-number resolution, one-time check-in, exit eligibility, and dashboard/cache refresh behavior.
- Added camera QR scanning where supported, with manual token paste fallback.
- Made floor filters reflect actual rooms and refreshed dependent occupancy views after CRUD/allotment.
- Added `QUAD` and `QUINT` room enum migration.
- Repaired invalid existing CSS declarations that blocked the production build.
- Corrected demo seeder to create the stated 100 rooms and 200 student profiles; removed a reference to a nonexistent Prisma model; made it clear holidays as part of repeatable seeding.
- Added Node built-in tests and project, installation, usage, API, architecture, database, test, deployment, proposal, progress, report, and presentation documentation.
- Added an admin-only user directory with search, role filters, pagination, and account detail views; public registration is restricted to the Student role.
- Added pagination to the admin student directory so every student record is reachable.
- Added a `jsQR` camera decoder fallback for browsers without native `BarcodeDetector` support.
