# Deployment Guide

This is a deployment checklist, not a claim that the project is currently deployed. No deployment URL or production environment was supplied.

## Topology

- Build the Vite frontend and serve `frontend/dist` from a static host/CDN.
- Run the Express API as a Node.js 18+ service.
- Use a managed PostgreSQL database with automated backups.
- Route the frontend's `/api` requests to the API, or configure the frontend API base URL and API CORS allowlist for the production origin.
- Use HTTPS for the web client and API; HTTPS is required for camera access outside localhost.

## Example: Vercel frontend + Render API + Neon PostgreSQL

This split deployment keeps the React site static and the Express service connected to PostgreSQL. Use the host URLs assigned to your project; this repository has not been deployed yet.

### 1. Create the database

Use the existing Neon database. Copy its **pooled** URI into `DATABASE_URL` for API traffic and its **direct (non-pooler)** URI into `DIRECT_URL` for Prisma migrations. Add `pgbouncer=true` to the pooled URI's query string for this Prisma 5 project if Neon has not already included it. Keep both values private. The schema now uses separate runtime and migration URLs; Prisma recommends a direct URL for migrations when the runtime URL uses a pooler.

### 2. Deploy the API on Render

Create a **Web Service** from the repository and set its root directory to `backend`.

| Setting | Value |
| --- | --- |
| Build command | `npm ci --include=dev && npx prisma generate` |
| Start command | `npm start` |
| Health check path | `/api/health` |

Set these values in Render's Environment page (use secrets for credentials):

```text
NODE_ENV=production
DATABASE_URL=<Neon pooled URI with pgbouncer=true>
DIRECT_URL=<Neon direct, non-pooler URI>
JWT_SECRET=<long random secret>
JWT_EXPIRES_IN=7d
COOKIE_SECRET=<different long random secret>
FRONTEND_URL=https://<your-frontend-domain>
```

If more than one web instance is enabled, run the SLA monitor as a single worker instead of starting one copy per API process. The current server starts its in-process monitor on every instance.

### 3. Deploy the frontend on Vercel

Import the repository as a Vercel project and set **Root Directory** to `frontend`. Use `npm run build` as the build command and `dist` as the output directory. Set this build-time variable:

```text
VITE_API_URL=https://<your-render-service>.onrender.com/api
```

The included `frontend/vercel.json` routes deep links (for example `/admin/users`) back to the Vite SPA entry point. After Vercel assigns the final domain, add that exact origin to Render's `FRONTEND_URL` and redeploy the API.

### 4. Apply schema and verify

From the repository root, make sure both production URLs are in your local `backend/.env` (do not commit them), then run the migration against the production database only after reviewing the migration and confirming a backup. `DIRECT_URL` is used by the migration command:

```powershell
cd backend
npm run db:migrate:prod
```

Then verify the Render health check, sign in for each role, confirm API reads/writes, test visitor issue/scan/exit, and check SLA-monitor logs. Do not run the demo seed against production.

### Local production-like build

```powershell
cd frontend
$env:VITE_API_URL = "http://localhost:5000/api"
npm run build
```

For local development, leave `VITE_API_URL` unset; Vite proxies `/api` to `http://localhost:5000`.

## Release sequence

1. Provision PostgreSQL and a restricted application user; configure backup/restore.
2. Set `NODE_ENV=production`, `PORT`, `DATABASE_URL`, strong unique `JWT_SECRET` and `COOKIE_SECRET`, and exact `FRONTEND_URL` origin(s) in the hosting secret manager.
3. Install dependencies from lockfiles, generate Prisma client, and run `npm run db:migrate:prod` from `backend/`.
4. Build frontend with `npm run build` from `frontend/`; deploy the generated `dist/` directory.
5. Start API with `npm start` from `backend/` and verify `/api/health`.
6. Verify login, role restrictions, database read/write, SLA monitor logs, visitor entry/exit and restore procedures.

## Production controls

- Never deploy demo seed accounts or run the destructive seed against production.
- Restrict database ingress and use least privilege; rotate secrets and never log them.
- Set CORS to the actual frontend origin only.
- Monitor API errors, database health, SLA monitor, and backup completion.
- Use a rollback plan and tested database backup before migrations.
- HTTPS is needed for camera-based QR scanning on phones; test the manual token fallback as well.
- Confirm your chosen host's sleep/idle policy and backup retention meet the deployment needs.
