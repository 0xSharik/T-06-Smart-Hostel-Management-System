# Requirements Traceability

This matrix maps the supplied T-06 requirements to the current implementation and verification evidence. “Implemented” describes available source paths, not a completed user acceptance test unless evidence is linked.

| Requirement | Implementation | Verification/evidence | Status |
|---|---|---|---|
| Student profile and room | Student screens; student/room APIs | Manual acceptance checklist in `TESTING.md` | Implemented; DB workflow pending |
| Preference-based room assignment | `room/allotment.service.js`, `room.rules.js`, room assignment transaction | Unit scoring/status tests | Implemented; DB workflow pending |
| Occupancy map synced to room/student CRUD | Compact room summaries, per-room occupant query, unassigned-student query; shared cache invalidation | Frontend build; manual checklist | Implemented; browser verification pending |
| Visitor QR issue and 8-hour expiry | `visitor/visitor.qr.js`, warden scanner | Manual QR checklist | Implemented; live scan evidence pending |
| Visitor entry and exit | Visitor routes/services and warden page | Unit suite does not exercise DB flow; manual checklist | Implemented; DB verification pending |
| Offline QR fallback | Token paste UI; API signature verification and logging | Documented limitation | Partial: token capture works; authorization is not offline |
| Maintenance category, priority and status | Maintenance module and page | Manual checklist | Implemented; DB workflow pending |
| Breach alert after 48 hours | `slaMonitor.js`, SLA list and notifications | Seeded overdue ticket; manual checklist | Implemented; live alert evidence pending |
| Mess ratings and weekly trend | Mess module and admin analytics | Manual checklist | Implemented; DB workflow pending |
| Holiday checkout/approval/return | Leave request APIs and student/warden pages | Manual checklist | Implemented; DB workflow pending |
| Warden dashboard and live occupancy | Dashboard aggregation and occupancy-by-floor API | Build; DB/browser timing measurement pending | Implemented; <2s target not measured |
| Role-based access | Auth middleware and per-route role middleware | Manual role matrix checklist; no automated API auth test yet | Implemented; acceptance pending |
| Mobile responsive UI | Responsive CSS and layouts | Manual viewport check pending | Present; not yet verified |
| Demo dataset of 100 rooms and 200 students | `backend/prisma/seed.js`, `seed-layout.js` | Unit test verifies counts/capacity; seed itself not run against live DB | Implemented; DB population pending |
| Deployment guide and URL | `docs/DEPLOYMENT.md`, production frontend at `https://hostel-delta-ten.vercel.app/admin/dashboard` | Production URL supplied by project owner; backend/database acceptance remains pending | Frontend deployed; end-to-end verification pending |
| Demo video, final report, slides, progress evidence | Templates and presentation outline in `docs/` | Project team to capture and submit evidence | Templates present; evidence pending |
