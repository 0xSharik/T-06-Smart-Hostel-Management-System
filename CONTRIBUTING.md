# Contributing

Contributions for the CUSoC project should follow the approved problem scope and academic integrity requirements.

## Before contributing

- Read the README and relevant architecture/API documentation.
- Check existing issues and coordinate scope with the project team/mentor.
- Do not publish private student, visitor, or hostel data. Use synthetic demo data.

## Workflow

1. Create a focused branch from the current default branch.
2. Make a small, reviewable change using existing module conventions.
3. Add or update tests for behavior changes and update documentation/API notes.
4. Run `npm test`, `npx prisma validate`, backend syntax checks, and frontend build as applicable.
5. Open a pull request with purpose, implementation summary, test results, migration notes, screenshots for UI changes, and limitations.

Use meaningful commit messages such as `fix(visitor): reject duplicate QR check-ins`. Never commit `.env`, credentials, real personal data, database dumps, or generated build output. Database migrations must be committed and reviewed; do not run destructive seed/reset commands against shared environments.

## Reporting issues

Include steps to reproduce, expected/actual behavior, environment versions, and sanitized logs. For security vulnerabilities, follow [SECURITY.md](SECURITY.md) and do not open a public issue containing exploit details.
