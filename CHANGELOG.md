## 2026-06-22

- Moved the `Today Total` metric out of Snapshot Stats and into its own dashboard panel directly below the server entry forms.
- Reduced dashboard page height by using the compact shell spacing and switching the server entry form grid to three columns earlier on desktop to avoid page scrolling.

## 2026-06-15

- Reworked the dashboard entry experience into a denser per-server checklist with clearer today-status indicators and a more compact layout.
- Simplified the shared navigation and header, including a dashboard-focused compact header and tighter nav presentation.
- Reworked stats and breakdown pages to favor on-demand loading: Snapshot Stats load per card, 7-Day Total loads per server, and 30-Day Total now lazy-loads both daily totals and per-server breakdowns while keeping `Show 10 more` pagination.
- Updated Recent Entries and Sales Entries to render the first 10 rows up front and fetch additional batches lazily through authenticated routes.
- Expanded sales tracking with a Sales Snapshot section, server-side derived `price per M`, and clearer value formatting.
- Fixed client-side entry tables so successful deletes immediately remove rows and update counts after lazy-loading was introduced.
- Added an on-demand Snapshot Stats card for all-time average revenue per active day for each server.
- Changed all-time average/day stats to use calendar days since the dataset's first revenue entry instead of only active entry days.

## 2026-05-23

- Initial implementation of the Daily Kamas Revenue Tracker with Next.js App Router, TypeScript, Tailwind CSS, and Prisma.
- Added revenue entry management, dashboard totals, recent entries, and average-per-day reporting across servers.
- Switched database integration to Neon through Prisma and documented project setup in `README.md`.
- Added app polish including validation states, favicon support, and single-user cookie-based authentication.
