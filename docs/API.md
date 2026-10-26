# API Reference

Base URL in local development: `http://localhost:5000/api`. Successful responses use `{ success, message, data }`; paginated responses add `meta`. Error responses use `{ success: false, message, errors? }`. Send the JWT using `Authorization: Bearer <token>` (the frontend shared client does this automatically).

All routes require authentication unless marked **Public**. Role labels: **Admin**, **Warden**, **Student**. Some authenticated read/update endpoints enforce record ownership in the service. Request validators return HTTP 422 for invalid input.

## Auth

| Method | Path | Access | Purpose |
|---|---|---|---|
| POST | `/auth/register` | Public | Register a student account; public requests cannot grant staff/admin roles |
| POST | `/auth/login` | Public | Authenticate and receive token/user |
| GET | `/auth/me` | Any signed-in role | Current account |
| POST | `/auth/logout` | Any signed-in role | Logout response / client token clear |
| PATCH | `/auth/change-password` | Any signed-in role | Change password |

## Students and rooms

| Method | Path | Access | Purpose |
|---|---|---|---|
| GET | `/users` | Admin | Paginated account directory; optional `search` (name/email/roll number), `role`, `page`, and `limit`; omits password hashes and includes linked student/room details |
| POST | `/users` | Admin | Create an account with the selected role |
| GET | `/students` | Authenticated | Search/paginated student list; `unassigned=true` returns only students without a room |
| GET | `/students/:id` | Authenticated | Student profile |
| POST | `/students` | Admin, Warden | Create profile for an existing student user |
| PUT | `/students/:id` | Admin, Warden | Update profile |
| DELETE | `/students/:id` | Admin | Delete profile |
| POST | `/students/:id/assign-room` | Admin, Warden | Assign student to room |
| POST | `/students/:id/unassign-room` | Admin, Warden | Remove assignment |
| GET | `/rooms` | Authenticated | Paginated rooms; filters include floor, type, status |
| GET | `/rooms/stats` | Authenticated | Room and occupancy totals |
| GET | `/rooms/:id` | Authenticated | Room details and occupants |
| POST | `/rooms` | Admin, Warden | Create room |
| PUT | `/rooms/:id` | Admin, Warden | Update room |
| DELETE | `/rooms/:id` | Admin | Delete an unoccupied room |
| POST | `/rooms/allot` | Admin, Warden | Score and rank room preferences |

## Visitors

| Method | Path | Access | Purpose |
|---|---|---|---|
| GET | `/visitors` | Admin, Warden | Paginated visitor log; optional date/studentId filters |
| GET | `/visitors/student/:studentId` | Authenticated | Student visitor history |
| POST | `/visitors` | Admin, Warden | Log walk-in entry (`studentId` may be profile ID or roll number) |
| POST | `/visitors/generate-qr` | Admin, Warden | Create stored visitor pass and return signed QR (`studentId`, `name`, `phone`, `relation`, optional `purpose`) |
| POST | `/visitors/scan-qr` | Admin, Warden | Verify `{ "qrToken": "…" }` and log entry once |
| PATCH | `/visitors/:id/exit` | Admin, Warden | Log exit after a valid entry |

## Maintenance

| Method | Path | Access | Purpose |
|---|---|---|---|
| GET | `/maintenance` | Authenticated | Students see own requests; staff can view queue |
| GET | `/maintenance/stats` | Admin, Warden | Counts by status and urgent tickets |
| GET | `/maintenance/sla-breaches` | Admin, Warden | Open requests older than 48 hours |
| GET | `/maintenance/:id` | Authenticated | Request details, ownership checked for student |
| POST | `/maintenance` | Authenticated | Create maintenance request |
| PUT | `/maintenance/:id` | Authenticated | Update request, student may edit own pending request |
| PATCH | `/maintenance/:id/status` | Admin, Warden | Update status/remarks |
| DELETE | `/maintenance/:id` | Authenticated | Delete request, ownership checked for student |

## Mess, holidays, dashboard, notifications

| Method | Path | Access | Purpose |
|---|---|---|---|
| GET | `/mess/menu`, `/mess/menu/:id` | Authenticated | Weekly menu or a menu item |
| POST/PUT/DELETE | `/mess/menu[/:id]` | Admin, Warden | Manage weekly menu |
| GET | `/mess/feedback` | Authenticated | Feedback list and average |
| GET | `/mess/feedback/trend` | Admin, Warden | Weekly ratings by weekday |
| POST | `/mess/feedback` | Authenticated | Submit rating/comment |
| GET | `/holidays`, `/holidays/upcoming`, `/holidays/:id` | Authenticated | Calendar queries |
| POST | `/holidays`, PUT `/holidays/:id` | Admin, Warden | Manage holidays |
| DELETE | `/holidays/:id` | Admin | Delete holiday |
| POST/GET | `/holidays/leave-request(s)` | Authenticated | Submit/list leave requests; student list is scoped |
| PATCH | `/holidays/leave-requests/:id/status` | Admin, Warden | Approve/reject leave request |
| PATCH | `/holidays/leave-requests/:id/confirm-return` | Authenticated | Confirm return; student ownership checked |
| GET | `/dashboard/stats`, `/dashboard/occupancy-by-floor`, `/dashboard/maintenance-by-status` | Admin, Warden | Dashboard aggregates |
| GET | `/notifications` | Authenticated | Current user's notices |
| PATCH | `/notifications/mark-all-read`, `/notifications/:id/read` | Authenticated | Mark notices read |
| DELETE | `/notifications/:id` | Authenticated | Delete own notice |
| POST | `/notifications`, `/notifications/broadcast` | Admin, Warden | Create notice or broadcast |
| GET | `/health` | Public | API health and timestamp |
