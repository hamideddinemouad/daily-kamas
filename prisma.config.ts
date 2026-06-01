import "dotenv/config";
import { defineConfig } from "prisma/config";

// Maintenance note for future AI/helpers:
// - This project's existing Neon database has already been baselined with Prisma Migrate.
// - For new schema changes in development, use `npm run db:migrate`, then `npx prisma generate`.
// - For applying committed migrations to an existing remote/shared database, use
//   `npx prisma migrate deploy`, then `npx prisma generate`.
// - Avoid `prisma migrate reset` unless you intentionally want to wipe data.
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env.DIRECT_URL ?? process.env.DATABASE_URL ?? "",
  },
});
