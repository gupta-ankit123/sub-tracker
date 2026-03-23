# SubTracker Documentation

A full-stack subscription and utility bill management app built for the Indian market. Track recurring payments, monitor spending, detect unused services, manage budgets, and export financial data.

## Quick Links

| Document | Description |
|---|---|
| [Architecture](./architecture.md) | System design, data flow, folder structure |
| [Features](./features.md) | Detailed feature documentation |
| [API Reference](./api-reference.md) | All REST endpoints with request/response |
| [Database Schema](./database-schema.md) | Models, enums, relationships |
| [Setup Guide](./setup-guide.md) | Local development setup |
| [Deployment Guide](./deployment-guide.md) | Production deployment to Vercel |

## Tech Stack

| Layer | Technology | Version |
|---|---|---|
| Framework | Next.js (App Router) | 16.1.6 |
| UI | React | 19.2.3 |
| Language | TypeScript | 5.x |
| API Server | Hono (inside Next.js) | 4.11.9 |
| Database | PostgreSQL via Prisma | 7.4.0 |
| Data Fetching | TanStack React Query | 5.90.21 |
| Forms | React Hook Form + Zod | 7.71 + 4.3 |
| UI Components | Shadcn UI + Radix UI + Tailwind CSS 4 | Latest |
| Auth | JWT + bcryptjs | 9.0.3 |
| Email | Resend | 6.9.2 |
| PDF Export | jsPDF | 4.2.0 |

## Quick Start

```bash
# Clone and install
git clone <repo-url>
cd subscription-tracker
npm install

# Set up environment
cp .env.example .env.local
# Fill in DATABASE_URL, ACCESS_TOKEN_SECRET, REFRESH_TOKEN_SECRET, RESEND_API_KEY

# Set up database
npx prisma generate
npx prisma db push

# Run dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project Status

- **42 features** complete across 8 modules
- **9 database models** with full CRUD
- **30+ API endpoints** with JWT auth
- **72% overall completion** — see [PROJECT_TRACKER.html](../PROJECT_TRACKER.html) for details

## License

Private project.
