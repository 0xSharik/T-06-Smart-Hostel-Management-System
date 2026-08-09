# T-06 Smart Hostel Management System - Context & Progress

> **Last Updated**: 2026-07-30  
> **Status**: Feature complete, backend workflows connected, bug-fix pass verified

---

## Architecture

```text
D:\hostel_management\
|-- backend/   # Node.js + Express + Prisma + PostgreSQL
`-- frontend/  # React + Vite + React-Query + Recharts
```

### Role-Based Interfaces

| Role | Route Prefix | Color Accent | Purpose |
|---|---|---|---|
| STUDENT | `/student/*` | Indigo (`#6366f1`) | Personal portal: My Room, Maintenance, Mess Menu, Leave Checkout, Notifications |
| WARDEN | `/warden/*` | Emerald (`#10b981`) | Operations: Gate QR Scanner, Live Occupancy Heatmap, Maintenance SLA Queue, Leave Approvals |
| ADMIN | `/admin/*` | Violet (`#8b5cf6`) | Console: User Accounts, Room Allotment Engine, Mess Trend Analytics, System Broadcasts |

---

## Current Session - 2026-07-30

Continued from Antigravity's uncommitted backend feature work and patched bugs in parallel.

### Completed Fixes

- Restored `maintenanceService.getStats()` after it was accidentally replaced while adding SLA breach logic.
- Added `/maintenance/sla-breaches` service/controller/route support while keeping existing stats intact.
- Loaded `.env` inside `backend/src/config/env.js` so backend app imports and server startup see local environment variables.
- Added Prisma migration for visitor QR fields and leave requests:
  - `visitors.qrToken`
  - `visitors.expiresAt`
  - nullable `visitors.inTime` for pre-authorized QR passes
  - new `leave_requests` table
- Added missing inverse Prisma relation: `Student.leaveRequests`.
- Connected leave UI to real backend endpoints:
  - student create leave request
  - student confirm return
  - warden/admin list leave requests
  - warden/admin approve/reject
- Connected QR page to real signed QR pass endpoints:
  - generate QR pass via backend `qrcode` + JWT
  - scan/verify signed QR token
  - prevent a generated QR pass from counting as visitor entry until scanned
  - prevent duplicate QR entry scans
- Connected admin room allotment page to backend greedy allotment endpoint.
- Fixed undefined `setForm` bug in `AdminStudents.jsx` by using `setPrefForm`.
- Wired "Assign Room" recommendation action to real `studentAPI.assignRoom()`.
- Hardened room occupancy status updates on assign, unassign, delete, and auto-allotment flows.
- Exposed and connected weekly mess feedback trend endpoint for admin analytics.
- Fixed frontend 401 loop where dashboard React Query requests kept retrying after auth expiry:
  - clear both `token` and persisted `hostel-auth` on API `401`
  - use `window.location.replace("/login")` to avoid history-loop churn
  - disable React Query retries for `401` and `403` responses

### Verification Run

- `npx.cmd prisma validate` - passed
- `npx.cmd prisma generate` - passed
- Backend JS syntax check over `backend/src` and `backend/prisma` - passed
- `node -e "require('./src/app'); console.log('backend app loaded')"` - passed
- `npm.cmd run build` in `frontend` - passed
  - Vite still reports the expected large chunk warning for the current single-bundle app.
- Re-ran `npm.cmd run build` after the auth-loop patch - passed

### Important Worktree Notes

- The worktree was already dirty when this session started. Existing Antigravity changes were preserved and extended, not reverted.
- `frontend/dist/` and `frontend/node_modules/` are currently untracked/dirty outputs in the repo view.
- `backend/src/lib/slaMonitor.js`, `backend/src/modules/holiday/leave.service.js`, `backend/src/modules/room/allotment.service.js`, and `backend/src/modules/visitor/visitor.qr.js` were pre-existing untracked Antigravity additions and are part of the continued feature work.
- `commit_50_parts.ps1` is untracked and appears unrelated to runtime behavior.

---

## Progress Tracker

### Phase 1 - Foundation & Architecture

- [x] `CONTEXT.md` progress tracker created
- [x] Role-based routing configured in `App.jsx` with automatic role redirection
- [x] `StudentLayout.jsx`, `WardenLayout.jsx`, `AdminLayout.jsx` constructed
- [x] Role-specific CSS custom properties, heatmap styles, SLA banners, and mobile responsive drawer added

### Phase 2 - Student Portal (`/student/*`)

- [x] `StudentDashboard.jsx` - assigned room card, active maintenance status, today's mess menu, announcements
- [x] `MyProfile.jsx` - student profile information and secure password update
- [x] `MyRoom.jsx` - room details, floor, capacity, amenities, roommates list
- [x] `MyMaintenance.jsx` - submit and track maintenance requests
- [x] `MyMess.jsx` - weekly meal schedule, per-meal star ratings
- [x] `MyLeave.jsx` - real leave request submit/list/return confirmation workflow
- [x] `MyNotifications.jsx` - personal notification list and unread indicators

### Phase 3 - Warden Interface (`/warden/*`)

- [x] `WardenDashboard.jsx` - live occupancy rates, urgent SLA alert banner, quick operation hub
- [x] `WardenStudents.jsx` - student directory and room assignment view
- [x] `WardenRooms.jsx` - interactive color-coded occupancy heatmap by floor
- [x] `WardenVisitors.jsx` - visitor entry and exit log tracking
- [x] `QRScanPage.jsx` - signed 8-hour QR pass generation and backend token scan verification
- [x] `WardenMaintenance.jsx` - maintenance queue with 48h SLA breach alerts
- [x] `WardenLeave.jsx` - real student holiday checkout approval/rejection queue
- [x] `WardenMess.jsx` - mess menu schedule management and feedback ratings
- [x] `WardenNotify.jsx` - warden notifications and alert dispatch

### Phase 4 - Admin Console (`/admin/*`)

- [x] `DashboardPage.jsx` - system-wide occupancy charts, maintenance statistics, recent activity
- [x] `AdminUsers.jsx` - create and manage user accounts: STUDENT, WARDEN, ADMIN
- [x] `AdminStudents.jsx` - student directory, backend allotment recommendations, real room assignment
- [x] `AdminMess.jsx` - mess management and backend weekly satisfaction trend chart
- [x] `AdminNotifications.jsx` - role-targeted system broadcast announcement center

---

## Tech Stack

| Layer | Tech |
|---|---|
| Backend | Node.js 18 + Express 4 + Prisma 5 |
| Database | PostgreSQL / Neon-compatible connection |
| Auth | JWT (`jsonwebtoken`) + `bcryptjs` |
| QR | `qrcode` + signed JWT visitor pass tokens |
| Frontend | React 18 + Vite 5 |
| State | Zustand auth + React Query v3 |
| Analytics | Recharts |
| Icons | Lucide React |

---

## Commit History Notes

- `feat: add role-based routing and layout scaffolding`
- `feat(student): add dedicated student portal (dashboard, profile, room, leave)`
- `feat(warden): add warden operations portal (QR scanner, heatmap, leave approvals)`
- `feat(admin): add admin console (user accounts, allotment engine, mess analytics, broadcast)`
- Current uncommitted continuation: backend workflow connection and bug patch pass from 2026-07-30
