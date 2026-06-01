<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Prisma Migration Notes

- This project's existing Neon database has already been baselined with Prisma Migrate.
- For new schema changes in development, use `npm run db:migrate`, then `npx prisma generate`.
- For applying committed migrations to an existing remote/shared database, use `npx prisma migrate deploy`, then `npx prisma generate`.
- Avoid `prisma migrate reset` unless you intentionally want to wipe data.
