# Setup Guide

Local development setup for SubTracker.

## Prerequisites

- **Node.js** 18+ (recommended: 22.x)
- **PostgreSQL** 14+ (local or cloud — Neon, Supabase, Railway, etc.)
- **npm** (comes with Node.js)
- **Git**

## 1. Clone & Install

```bash
git clone <repo-url>
cd subscription-tracker
npm install
```

## 2. Environment Variables

Create `.env.local` in the project root:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/subtracker?schema=public"

# App URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# JWT Secrets (generate random strings)
ACCESS_TOKEN_SECRET="your-access-token-secret-min-32-chars"
REFRESH_TOKEN_SECRET="your-refresh-token-secret-min-32-chars"

# Environment
NODE_ENV="development"

# Email (Resend)
RESEND_API_KEY="re_xxxxxxxxxxxx"
EMAIL_FROM="SubTracker <noreply@yourdomain.com>"

# Cron (for reminder endpoint)
CRON_SECRET="your-cron-secret"
```

### Getting API Keys

**Database URL**:
- Local PostgreSQL: `postgresql://postgres:password@localhost:5432/subtracker`
- [Neon](https://neon.tech): Free tier, get connection string from dashboard
- [Supabase](https://supabase.com): Free tier, Settings → Database → Connection string
- [Railway](https://railway.app): Provision PostgreSQL, copy connection string

**JWT Secrets**: Generate random strings:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Resend API Key**:
1. Sign up at [resend.com](https://resend.com)
2. Create API key in dashboard
3. Verify your sending domain (or use Resend's test domain for development)

## 3. Database Setup

```bash
# Generate Prisma client
npx prisma generate

# Push schema to database (creates all tables)
npx prisma db push

# (Optional) Open database admin UI
npx prisma studio
```

## 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## 5. Verify Setup

1. Visit `http://localhost:3000` — you should see the landing page
2. Click "Get Started" → Sign up with email
3. Check your email for OTP (or check Prisma Studio for the OTP code in the `users` table)
4. After verification, you'll be redirected to the dashboard

## Common Commands

```bash
npm run dev        # Start dev server (Turbopack)
npm run build      # Production build
npm run start      # Start production server
npm run lint       # ESLint

npx prisma generate    # Regenerate Prisma client after schema changes
npx prisma db push     # Sync schema to database
npx prisma studio      # Database admin UI (localhost:5555)
npx prisma migrate dev # Create migration (if using migrations)
```

## Troubleshooting

### "Cannot find module '@/app/generated/prisma'"
Run `npx prisma generate` — the Prisma client output is at `src/app/generated/prisma`.

### "ECONNREFUSED" on database
- Check PostgreSQL is running
- Verify `DATABASE_URL` in `.env.local`
- For cloud databases, check if your IP is allowlisted

### OTP email not arriving
- Check `RESEND_API_KEY` is correct
- Check Resend dashboard for delivery logs
- In development, you can read the OTP directly from Prisma Studio (`users` table → `otpCode` column)

### Port 3000 already in use
```bash
npx kill-port 3000
# or use a different port
npm run dev -- -p 3001
```

## Project Structure Overview

```
subscription-tracker/
├── prisma/
│   └── schema.prisma          # Database schema
├── src/
│   ├── app/                   # Next.js pages and API
│   ├── features/              # Feature modules (auth, subscriptions, budgets)
│   ├── components/            # Shared UI components
│   └── lib/                   # Utilities (db, jwt, email, etc.)
├── stitch/                    # Google Stitch design references (HTML + screenshots)
├── docs/                      # This documentation
├── .env.local                 # Environment variables (not committed)
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```

See [Architecture](./architecture.md) for detailed folder structure.
