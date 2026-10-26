# Security Policy

## Supported version

Security fixes should target the current default branch. No release support schedule is published yet.

## Reporting a vulnerability

Do not disclose secrets or exploitable details in a public issue. Contact the repository owner or faculty/project mentor through a private channel and include affected component, impact, reproduction steps, and a safe contact method. Replace the owner contact here before public release.

## Data and deployment precautions

- Keep `backend/.env` and all production secrets out of version control.
- Use strong unique JWT/cookie secrets, HTTPS, exact CORS origins, restricted DB access and backups.
- Use synthetic student and visitor data for development and demonstrations.
- Do not expose seeded demo accounts publicly.
- The QR API depends on the signing secret and database; protect them as credentials.
- The Prisma seed deletes student and transactional data. Run it only on a disposable database.
