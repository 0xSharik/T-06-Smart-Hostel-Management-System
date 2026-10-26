# User Guide

## Sign in

Open the landing page, choose the account role, and sign in. After authentication, the app routes the account to its student, warden, or admin workspace. Demo credentials are listed in the repository README and work only after seeding a local database.

## Student

- **Dashboard:** view personal room, recent maintenance, menu, notices, and holiday information.
- **Profile and room:** view the student profile and assigned room information.
- **Maintenance:** submit a ticket and track its status. Warden/admin users manage status and SLA queue.
- **Mess:** view the weekly schedule and submit a rating/comment for a menu item.
- **Leave:** submit a checkout request with dates and reason, monitor approval, then confirm return.
- **Notifications:** view and mark personal notices as read.

## Warden

- **Dashboard:** review occupancy, floors, maintenance, and alerts.
- **Rooms:** use actual floor filters and occupancy colors. Select a room to review occupants and assign or unassign students.
- **Visitors:** log a walk-in, view visitor history, and record exit only after entry.
- **QR scanner:** issue an eight-hour pass using the student profile ID or roll number and visitor details. At the gate, scan the QR using the camera (native decoder where available, `jsQR` fallback otherwise) or paste the token. A successful scan logs the entry; record exit from the visitor list.
- **Maintenance:** process requests and inspect the 48-hour SLA queue.
- **Leave:** approve/reject requests and follow return confirmations.
- **Mess and notifications:** manage menu slots, inspect feedback, and send notices.

## Admin

- **Dashboard and reports:** review system totals, occupancy, maintenance, and analytics.
- **Users and students:** manage accounts and profiles; use the allotment recommendation flow to rank rooms by floor, type, course, and available capacity.
- **Holidays, configuration, audit, notifications:** use available administration pages to manage the calendar and system communications.

## Visitor QR notes

Passes expire eight hours after creation. A generated pass is not an entry record until scanned. The same pass cannot be checked in twice. QR scans can be decoded locally by a compatible browser, but server verification and logging require an online API connection. A pasted token is the fallback when camera scanning is unavailable.

## Role boundaries

The backend enforces role checks on administrative APIs. The frontend hides or routes pages by role, but that UI behavior is not a substitute for API authorization.
