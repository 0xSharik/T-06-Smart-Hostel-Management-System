# Project Proposal and Plan

## Project

**T-06: Smart Hostel Management System** — Web Development, IoT, and Data Engineering.

## Problem

University hostel teams often split room allocation, visitor records, maintenance requests, mess feedback, and holiday movement across paper and disconnected tools. The result is inconsistent data, slow response, and limited operational visibility.

## Objectives

1. Digitize room assignment using floor, room type, course/batch, and availability preferences.
2. Issue time-limited visitor passes and record gate entry/exit.
3. Track maintenance priority, status, and 48-hour SLA breaches.
4. Collect mess ratings and summarize weekly feedback trends.
5. Manage holiday checkout approval and return confirmation.
6. Provide staff dashboards and occupancy by floor.

## Scope and users

- **Student:** own profile/room, maintenance, mess, leave, and notifications.
- **Warden:** room map, visitors, QR scanning, maintenance, leave approvals, mess and notices.
- **Admin:** accounts, student/room administration, reports, calendar and broadcasts.

Out of the current implementation scope: production IoT door control, WhatsApp integration, predictive forecasting, and offline cryptographic QR authorization. QR capture can use camera or pasted token, but the API must be online to validate and log.

## Proposed milestones

| Week | Goal | Evidence |
|---|---|---|
| 1 | Schema, auth, role boundaries | ER diagram, migrations, role checks |
| 2 | Room matching and student portal | allotment checks, room workflow demo |
| 3 | Visitor QR | pass issue, scan, expiry and exit evidence |
| 4 | Maintenance and SLA | ticket lifecycle and 48-hour alert evidence |
| 5 | Mess and holiday workflows | feedback trend and leave approval evidence |
| 6 | Warden dashboard, verification, documentation | test report, demo, final report and presentation |

## Stack and design

React/Vite frontend, Express/Node API, Prisma/PostgreSQL, JWT/bcrypt auth, signed QR JWT and QR image generation. The system uses a modular monolith with domain modules and one shared database. See [architecture](ARCHITECTURE.md).

## Success criteria

- Demo data includes 100 rooms and 200 students.
- Role checks protect staff actions.
- Room assignment respects capacity and the map reflects changes.
- Visitor passes expire after eight hours and cannot be checked in twice.
- Maintenance breach detection uses a 48-hour threshold.
- Leave status and return confirmation are persisted.
- Setup, API, database, usage, testing, and deployment are documented.

## Risks and assumptions

- PostgreSQL connectivity and migration permissions are required for live workflows.
- Camera QR API support differs by browser; token paste is the fallback.
- A connected API is needed to verify and log passes.
- The seed is destructive and belongs only on disposable databases.
- Stakeholder interviews, field evidence, deployment ownership, and mentor approval must be completed by the project team; they are not inferred from source code.
