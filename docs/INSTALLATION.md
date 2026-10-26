# Installation and Local Development

## Requirements

- Node.js 18 or newer and npm.
- PostgreSQL 14 or newer (or another PostgreSQL-compatible service supported by Prisma).
- A camera-capable browser over HTTPS or `localhost` for browser QR scanning. Token paste remains available without a camera.

## 1. Configure PostgreSQL

Create a local database, for example `hostel_db`, and copy `backend/.env.example` to `backend/.env`. Set `DATABASE_URL` to the local connection string. Replace `JWT_SECRET` and `COOKIE_SECRET` with private random values. Set `FRONTEND_URL=http://localhost:5173` for local development.

Never commit `.env`. Do not point the destructive seed at production or shared data.

## 2. Install and prepare the backend

```powershell
cd backend
npm install
npm run db:generate
npm run db:migrate
```

`db:migrate` runs development migrations and may ask Prisma to create a migration if the schema changes. For a deployment database with committed migrations, use `npm run db:migrate:prod` after reviewing the target and backup plan.

To create the demo dataset in a **disposable database only**:

```powershell
npm run db:seed
```

The seeder clears student and transactional records, rooms, and holidays before inserting 100 rooms, 200 students, menu items, sample feedback, maintenance tickets, visitor logs, and holidays. It is destructive and should not be used against a database with valuable data.

## 3. Start the API

```powershell
npm run dev
```

The API listens on `http://localhost:5000`; health is available at `http://localhost:5000/api/health`.

## 4. Install and start the frontend

In a second terminal:

```powershell
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`. Vite proxies `/api` requests to `http://localhost:5000`.

## 5. Checks

From `backend/` run `npm test`, `npm run db:generate`, and `npx prisma validate`. From `frontend/` run `npm run build`. The frontend package does not currently define a separate unit-test runner.

## Troubleshooting

- **Database connection errors:** check PostgreSQL is running, `DATABASE_URL` uses the right host/port/database, and the database accepts connections.
- **Prisma client/model mismatch:** rerun `npm run db:generate` after schema changes.
- **CORS errors:** make `FRONTEND_URL` exactly match the browser origin, including scheme and port.
- **Login or API 401:** log in again; the frontend clears expired auth state and redirects to login.
- **Camera not available:** use HTTPS or localhost, allow camera permission, and use a browser that supports `BarcodeDetector`; otherwise paste the token.
