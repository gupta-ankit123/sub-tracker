# Deployment Guide

How to deploy SubTracker to production.

## Recommended: Vercel + Neon PostgreSQL

### 1. Database Setup (Neon)

1. Create account at [neon.tech](https://neon.tech)
2. Create a new project
3. Copy the connection string:
   ```
   postgresql://user:password@ep-xxxx.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```

### 2. Deploy to Vercel

1. Push code to GitHub
2. Import project in [vercel.com](https://vercel.com)
3. Set environment variables in Vercel dashboard:

| Variable | Value |
|---|---|
| `DATABASE_URL` | Neon connection string |
| `NEXT_PUBLIC_APP_URL` | `https://your-domain.vercel.app` |
| `ACCESS_TOKEN_SECRET` | Random 32+ char string |
| `REFRESH_TOKEN_SECRET` | Random 32+ char string |
| `RESEND_API_KEY` | Your Resend API key |
| `EMAIL_FROM` | `SubTracker <noreply@yourdomain.com>` |
| `CRON_SECRET` | Random string for cron auth |
| `NODE_ENV` | `production` |

4. Deploy. Vercel will:
   - Run `npm run build`
   - Prisma client is generated during build via `postinstall` script

### 3. Database Migration

After first deploy, push the schema to your production database:

```bash
# Set DATABASE_URL to production
DATABASE_URL="postgresql://..." npx prisma db push
```

Or run it from Vercel dashboard → Functions → Console.

### 4. Set Up Cron for Reminders

Add to `vercel.json` in project root:

```json
{
  "crons": [
    {
      "path": "/api/cron/reminders",
      "schedule": "0 8 * * *"
    }
  ]
}
```

This runs reminders daily at 8:00 AM UTC. The endpoint requires:
- Header: `Authorization: Bearer <CRON_SECRET>`
- Vercel Cron automatically adds this header when `CRON_SECRET` is set as an env var

### 5. Custom Domain (Optional)

1. In Vercel dashboard → Settings → Domains
2. Add your domain
3. Update DNS records as instructed
4. Update `NEXT_PUBLIC_APP_URL` env var to your custom domain

---

## Alternative: Railway

1. Create account at [railway.app](https://railway.app)
2. New Project → Deploy from GitHub repo
3. Add PostgreSQL service
4. Set environment variables (same as Vercel list above)
5. Railway auto-detects Next.js and deploys

---

## Alternative: Self-Hosted (VPS)

### Prerequisites
- Ubuntu 22.04+ VPS
- Node.js 18+
- PostgreSQL 14+
- Nginx (reverse proxy)
- PM2 (process manager)

### Steps

```bash
# Clone
git clone <repo-url>
cd subscription-tracker
npm install

# Environment
cp .env.example .env.local
nano .env.local  # Fill in all variables

# Database
npx prisma generate
npx prisma db push

# Build
npm run build

# Start with PM2
pm2 start npm --name "subtracker" -- start
pm2 save
pm2 startup
```

### Nginx Config

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Add SSL with Certbot:
```bash
sudo certbot --nginx -d yourdomain.com
```

### Cron Setup (Self-Hosted)

```bash
crontab -e
# Add:
0 8 * * * curl -H "Authorization: Bearer YOUR_CRON_SECRET" https://yourdomain.com/api/cron/reminders
```

---

## Pre-Deployment Checklist

- [ ] All environment variables set
- [ ] Database schema pushed (`prisma db push`)
- [ ] Resend domain verified for production emails
- [ ] `NEXT_PUBLIC_APP_URL` matches actual deployment URL
- [ ] JWT secrets are unique and strong (32+ characters)
- [ ] CRON_SECRET is set for reminder endpoint
- [ ] Test sign-up flow end-to-end (registration → OTP → login → dashboard)
- [ ] Test email delivery (reminders, OTP)
- [ ] Check build succeeds (`npm run build`)

## Post-Deployment

1. Create your account via the sign-up page
2. Verify email with OTP
3. Add your first subscription
4. Check analytics and dashboard
5. Monitor Vercel/Railway logs for any errors

## Known Production Considerations

- **Rate Limiting**: Not implemented. Consider adding before public launch.
- **Forgot Password**: Not implemented. Users can't recover locked accounts.
- **Backups**: Set up automated PostgreSQL backups (Neon/Supabase do this automatically).
- **Monitoring**: Consider adding error tracking (Sentry) and uptime monitoring.
