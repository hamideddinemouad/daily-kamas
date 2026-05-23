# Daily Kamas Revenue Tracker

Small Next.js dashboard to replace the Excel kamas revenue tracker. It uses Neon Postgres through Prisma, lets you edit or delete entries, and shows totals per server plus a grand total on one page.

## Project Purpose

This app keeps the workflow intentionally simple:

- Choose one fixed server from a dropdown
- Enter a `revenu` decimal value
- Let the app store the entry date automatically
- Review recent entries, per-server totals, and the grand total

## Tech Stack

- Next.js with App Router
- TypeScript
- Tailwind CSS
- Neon Postgres
- Prisma ORM
- Server Actions for create, update, and delete flows

## Fixed Servers

- `draco`
- `imagiro`
- `orukam`
- `tylezia`
- `hellmina`
- `talkasha`

## Database Schema

Main model: `RevenueEntry`

- `id`: string primary key
- `server`: enum restricted to the fixed server names
- `date`: PostgreSQL date column, defaults automatically when the entry is created
- `revenu`: decimal value stored as `Decimal(18,4)`
- `createdAt`: timestamp created automatically
- `updatedAt`: timestamp updated automatically

The Prisma schema lives in [prisma/schema.prisma](/Users/mouad/Desktop/daily-kamas/prisma/schema.prisma).

## Features

- Create a revenue entry by selecting `server` and entering `revenu`
- Automatic date handling on create
- Validation for empty server, invalid server, empty revenu, and non-numeric revenu
- Inline edit action for existing entries
- Delete action for existing entries
- Recent entries table ordered newest first
- Summary totals per server
- Grand total
- Average revenu per active day for each server
- Average revenu per active day across all servers
- Loading and error states for dashboard actions
- Graceful setup state when `DATABASE_URL` is missing

## Neon Setup

1. Put your Neon pooled connection string in `.env` as `DATABASE_URL`.

2. Optionally add `DIRECT_URL` for Prisma CLI commands like migrations and `db push`.

3. Generate Prisma Client:

```bash
npx prisma generate
```

4. Push the schema to Neon if the database is still empty:

```bash
npx prisma db push
```

If you prefer migrations and you have `DIRECT_URL` set:

```bash
npx prisma migrate dev --name init
```

## How To Run The App

1. Install dependencies:

```bash
npm install
```

2. Make sure `.env` contains your Neon URL.

3. Start the development server:

```bash
npm run dev
```

4. Open:

```text
http://localhost:3000
```

## Available Scripts

- `npm run dev`
- `npm run build`
- `npm run start`
- `npm run lint`
- `npm run typecheck`
- `npm run db:generate`
- `npm run db:migrate`
- `npm run db:push`

## Future Modification Notes

- Add server/date filters on the dashboard
- Add monthly and weekly aggregates
- Add export to CSV
- Add authentication if multiple users will manage entries
- Add charts if you want a more visual revenue overview

## Notes

- Runtime database access uses Prisma's Neon adapter.
- Prisma CLI reads `DIRECT_URL` when available, otherwise it falls back to `DATABASE_URL`.
- The displayed dashboard date formatting is presentation-only; the stored `date` comes from the database default.
