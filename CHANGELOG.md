# Changelog

## 2026-06-15

- Replaced the dashboard's generic add-entry dropdown form with an always-visible server checklist
- Added per-server green-dot status when at least one revenue entry already exists for today
- Removed the dashboard checklist `Quick 0` action while keeping normal per-server entry submission available
- Updated dashboard data shaping to expose today-status per server instead of the old missing-in-24-hours list
- Limited the Recent Entries page to 10 rows at a time with a `Show 10 more` action for loading the next batch
- Limited the 30-Day Total page lists to 10 rows at a time with `Show 10 more` loading for both the overall daily totals and each server breakdown card
- Reworked the 7-Day Total page to lazy-load each server separately through an authenticated API route, so no server breakdown query runs until that specific server is opened
- Removed client-side reuse for 7-Day server breakdowns so each server open always fetches fresh data
- Reworked the Snapshot Stats page to load each stat card on demand through an authenticated API route, with a fresh fetch every time a card is opened
- Removed `price per M` from the Sales page UI and now derive/store it automatically from amount and kamas quantity on the server
- Added an on-demand Snapshot Stats card for all-time average revenue per active day across the full entry history

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
