# CommunityMatcher

A community-based dating app where friends, family, and trusted people vet and approve potential matches. Your "Community Circle" reviews matches and provides an approval score visible on each profile.

## Tech Stack

- **Framework**: Next.js 15 (App Router, Turbopack)
- **Database**: PostgreSQL + Prisma ORM
- **Auth**: Auth.js (NextAuth v5) — Google OAuth + email/password
- **Styling**: Tailwind CSS + shadcn/ui
- **Real-time**: Socket.io for messaging
- **Uploads**: UploadThing (photo uploads)
- **Validation**: Zod + React Hook Form

## Features

- **Swipe Feed** — Browse and accept/pass on candidate profiles
- **Community Circle** — Invite trusted friends/family to vet your matches
- **Vetting Dashboard** — Vetters approve/deny/comment on matches with a community score
- **Matching** — Mutual swipes create a match with a conversation
- **Real-time Messaging** — Chat with matches via Socket.io
- **Profile Management** — Bio, photos, dating preferences, location

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL (or use Prisma's built-in local Postgres)

### 1. Clone & Install

```bash
git clone https://github.com/MShreyas1/CommunityMatcher.git
cd CommunityMatcher
npm install
```

### 2. Environment Variables

```bash
cp .env.example .env
```

Edit `.env` with your values. At minimum you need `DATABASE_URL` and `AUTH_SECRET`.

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `AUTH_SECRET` | Yes | Secret for Auth.js sessions (`openssl rand -base64 32`) |
| `AUTH_GOOGLE_ID` | No | Google OAuth client ID |
| `AUTH_GOOGLE_SECRET` | No | Google OAuth client secret |
| `UPLOADTHING_TOKEN` | No | UploadThing API token for photo uploads |
| `NEXT_PUBLIC_APP_URL` | No | App URL (defaults to `http://localhost:3000`) |

### 3. Set Up the Database

**Option A — Prisma's built-in local Postgres (no install needed):**

```bash
npx prisma dev
```

This starts a local Postgres and prints connection strings. Copy the **TCP** `DATABASE_URL` into your `.env`. Keep this terminal running.

**Option B — Your own Postgres:**

Set `DATABASE_URL` in `.env`, e.g.:

```
DATABASE_URL="postgres://user:password@localhost:5432/community_matcher"
```

### 4. Run Migrations & Generate Client

```bash
npx prisma generate
npx prisma migrate dev --name init
```

### 5. Seed Test Data (Optional)

```bash
npm run seed
```

Creates 6 test accounts (all passwords: `password123`):

| Email | Description |
|---|---|
| `alice@example.com` | Main user — has matches, messages, community circle |
| `bob@example.com` | Vetter in Alice's circle |
| `carol@example.com` | Vetter in Alice's circle |
| `dave@example.com` | Matched with Alice, has his own community circle |
| `emma@example.com` | Pending community invite from Dave |
| `frank@example.com` | Matched with Alice, vetter for Dave |

### 6. Start the App

```bash
npm run dev          # Socket.io + Next.js (real-time messaging)
# or
npm run dev:next     # Next.js only (no real-time)
```

Open [http://localhost:3000](http://localhost:3000).

## Project Structure

```
src/
├── actions/          # Server actions (auth, feed, community, match, message, profile)
├── app/
│   ├── (auth)/       # Login & register pages (centered card layout)
│   ├── (main)/       # Authenticated pages with navbar
│   │   ├── feed/         # Swipeable match cards
│   │   ├── profile/      # View & edit profile
│   │   ├── matches/      # Grid of matched users
│   │   ├── messages/     # Conversations & chat
│   │   └── community/    # Manage circle & vetting dashboard
│   └── api/          # Auth.js route handler, profile API
├── components/
│   ├── feed/         # SwipeStack, SwipeCard, CommunityScoreBadge
│   ├── ui/           # shadcn/ui components
│   ├── navbar.tsx    # Responsive nav (top bar desktop, bottom tabs mobile)
│   └── providers.tsx # SessionProvider + Toaster
├── lib/              # Prisma client, Auth.js config
└── types/            # TypeScript declarations
prisma/
├── schema.prisma     # Database schema (13 models)
├── seed.ts           # Test data seeder
└── migrations/       # SQL migrations
server.ts             # Custom Node server (Next.js + Socket.io)
```

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start dev server with Socket.io |
| `npm run dev:next` | Start Next.js dev server only |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run seed` | Seed database with test data |
| `npm run lint` | Run ESLint |

## Troubleshooting

- **"Asynchronous response" error on sign-in**: This is caused by browser extensions (password managers, ad blockers). The auth is working — try disabling extensions or using incognito mode.
- **Slow page loads**: If using `npx prisma dev`, the local Postgres can be slow. A real Postgres instance will be faster.
- **Google sign-in not working**: You need to set `AUTH_GOOGLE_ID` and `AUTH_GOOGLE_SECRET` in `.env`. Email/password auth works without it.
