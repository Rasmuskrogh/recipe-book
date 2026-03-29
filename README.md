# Platemate

A recipe site with a social layer: create and share recipes, friends, groups, direct messages, and realtime updates. The web app is built as a PWA (manifest, service worker, offline support).

## Tech stack

| Area | Choice |
|------|--------|
| Framework | [Next.js](https://nextjs.org) 16 (App Router) |
| UI | React 19, CSS modules |
| Database | PostgreSQL via [Prisma](https://www.prisma.io) |
| Auth | [NextAuth.js](https://next-auth.js.org) v5 (credentials + Prisma adapter) |
| Realtime | [Pusher](https://pusher.com) |
| Uploads | [Uploadthing](https://uploadthing.com) |
| Push | [web-push](https://github.com/web-push-libs/web-push) (VAPID) |
| Other | TipTap (editing), react-hook-form, Zod |

The package name in `package.json` is `recepie-book`; the product name in the UI and manifest is **platemate**.

## Requirements

- Node.js 20+
- PostgreSQL (e.g. Supabase or local Postgres)
- Accounts/keys for Pusher, Uploadthing, and (if you use push) VAPID keys

## Getting started

```bash
npm install
```

Copy environment variables into a `.env` file (see below) and set your database URL.

```bash
npx prisma migrate dev
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

After `npm install`, `prisma generate` runs automatically via `postinstall`, so Prisma Client always matches the schema during builds (e.g. in CI).

## Environment variables

You typically need the following for a full local setup (match names to your existing `.env`):

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | Postgres connection (Prisma) |
| `DIRECT_URL` | Direct connection when using a pooler (e.g. Supabase) |
| `AUTH_SECRET` | Secret for JWT/session (used in middleware) |
| `PUSHER_APP_ID`, `PUSHER_KEY`, `PUSHER_SECRET`, `PUSHER_CLUSTER` | Server (Pusher) |
| `NEXT_PUBLIC_PUSHER_KEY`, `NEXT_PUBLIC_PUSHER_CLUSTER` | Client (Pusher) |
| `VAPID_SUBJECT`, `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY` | Web Push (server) |
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` | Same public VAPID key for the client (subscribe) |

Uploadthing requires its own keys per [Uploadthing’s docs](https://docs.uploadthing.com) (add them to `.env` as their CLI/dashboard specifies).

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run start` | Run production after build |
| `npm run lint` | ESLint |

Database changes: `npx prisma migrate dev` (or `prisma db push` for simple cases).

## Features (overview)

- **Recipes** – create, view, categories, saved recipes, visibility
- **Profiles** – user profiles, editing, recipes on profile
- **Friends** – friend requests and friend list
- **Messages** – conversations with realtime Pusher updates
- **Groups** – groups and group conversations
- **PWA** – `public/sw.js`, manifest, icons
- **Push** – subscriptions stored in `PushSubscription`; notifications can fire on friend requests, messages, and when someone saves your recipe

## Deploy

You can host the app on any Node host (e.g. [Vercel](https://vercel.com)). Set the same environment variables there, run migrations against the production database, and ensure `AUTH_SECRET` and database URLs are correct for HTTPS in production.

## License

Private project (`"private": true` in `package.json`).
