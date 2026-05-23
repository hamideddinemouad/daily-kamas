# Changelog

## 2026-05-23

- Initial implementation of the Daily Kamas Revenue Tracker
- Added Next.js App Router project with TypeScript and Tailwind CSS
- Added Prisma schema for `RevenueEntry` and fixed `Server` enum
- Added dashboard UI with create, edit, and delete flows
- Added recent entries table, totals per server, and grand total
- Added average revenu per active day for each server and overall
- Added validation, loading states, and error states
- Added setup and usage documentation in `README.md`
- Switched runtime database integration to Neon using Prisma's Neon adapter
- Removed local Docker PostgreSQL setup in favor of `.env`-based Neon configuration
- Added a custom favicon for the app
- Added site-wide single-user login UI with cookie-based auth
