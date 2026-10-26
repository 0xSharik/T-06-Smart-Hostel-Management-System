# Smart Hostel Management System

A role based web application for hostel room allocation, visitor entry, maintenance, mess feedback, holiday leave, and warden operations. This repository is the T-06 CUSoC project for the supplied smart hostel problem statement.

## Project status

The repository contains a React/Vite frontend and a Node.js/Express/Prisma API backed by PostgreSQL. Core student, warden, and admin screens and APIs are implemented. A development seed now targets **100 rooms and 200 student records**. Automated tests cover the seed layout and room-allotment scoring. Database-backed end-to-end tests, deployment, field work, and presentation evidence still require a configured environment and project team activity; see [Testing](docs/TESTING.md) and [Project status](docs/PROJECT_STATUS.md).

## Features

- Student, warden, and admin role based access.
- Room CRUD, student assignment, preference based recommendations, and an occupancy map.
- Signed visitor QR passes with an eight-hour expiry, camera scanning where the browser supports `BarcodeDetector`, and entry/exit logging.
- Maintenance request status and priority tracking, with a 48-hour SLA monitor.
- Weekly mess menus, ratings, and weekly trend aggregation.
- Holiday calendar and student leave request, approval, and return confirmation.
- Dashboard aggregation, notifications, and demo data.

## Technology

| Layer | Implementation |
|---|---|
| Frontend | React 18, Vite, React Router, React Query, Zustand, Recharts |
| API | Node.js 18+, Express 4 |
| Database | PostgreSQL via Prisma 5 |
| Authentication | JWT and bcryptjs |
| QR | `qrcode`, signed JWT, native `BarcodeDetector` with `jsQR` camera fallback |

## Quick start

Prerequisites: Node.js 18 or later, npm, and PostgreSQL.

1. Configure `backend/.env` from `backend/.env.example`. Use a **disposable local database** for the demo seed.
2. Install dependencies in `backend/` and `frontend/` with `npm install`.
3. From `backend/`, run `npm run db:generate`, `npm run db:migrate`, and optionally `npm run db:seed`.
4. Start the API with `npm run dev` in `backend/`.
5. Start the web app with `npm run dev` in `frontend/`; open `http://localhost:5173`.

See the [installation guide](docs/INSTALLATION.md) for detailed setup and the [user guide](docs/USER_GUIDE.md) for demo workflows. The seed deletes existing student and transactional data; read its warning before running it.

## Documentation

- [Installation](docs/INSTALLATION.md)
- [User guide](docs/USER_GUIDE.md)
- [API reference](docs/API.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Database schema](docs/DATABASE.md)
- [Testing and results](docs/TESTING.md)
- [Deployment guide](docs/DEPLOYMENT.md)
- [Project proposal and plan](docs/PROJECT_PLAN.md)
- [Project status](docs/PROJECT_STATUS.md)
- [Requirements traceability](docs/REQUIREMENTS_TRACEABILITY.md)
- [Final report template](docs/FINAL_REPORT_TEMPLATE.md)
- [Presentation outline](docs/PRESENTATION_OUTLINE.md)
- [Changelog](CHANGELOG.md)
- [Contribution guide](CONTRIBUTING.md)
- [Security policy](SECURITY.md)

## Demo accounts

When the seed completes successfully, it creates these local demo accounts:

| Role | Email | Password |
|---|---|---|
| Admin | `admin@hostel.com` | `Admin@1234` |
| Warden | `warden@hostel.com` | `Warden@1234` |
| Student | `student1@hostel.com` | `Student@1234` |

These are public demo credentials. Never deploy seeded credentials or a seeded database to a public environment.

## Limitations and evidence

The QR token can be captured by camera or pasted while offline, but the API must be reachable to verify the signature against the saved pass and record entry. No production deployment URL, QR demo video, field study evidence, or mentor approval is included in this source checkout. Do not present those deliverables as complete without collecting the evidence.

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE).
