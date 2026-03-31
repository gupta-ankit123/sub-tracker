# Project Structure

```
src/
├── app/
│   ├── (auth)/                         # Public auth pages
│   │   ├── sign-in/page.tsx
│   │   ├── sign-up/page.tsx
│   │   ├── verify-otp/page.tsx
│   │   ├── forgot-password/page.tsx
│   │   ├── reset-password/page.tsx
│   │   └── layout.tsx                  # Glassmorphic auth layout
│   ├── (dashboard)/                    # Protected pages
│   │   ├── dashboard/page.tsx          # Main overview
│   │   ├── subscriptions/page.tsx      # All subscriptions
│   │   ├── utility-bills/page.tsx      # Variable bills
│   │   ├── budgets/page.tsx            # Budget management
│   │   ├── bill-calendar/page.tsx      # Calendar view (new)
│   │   ├── upcoming/page.tsx           # Upcoming bills
│   │   ├── billing-history/page.tsx    # Payment history
│   │   ├── analytics/page.tsx          # Redirects to dashboard
│   │   ├── settings/page.tsx           # User settings
│   │   └── layout.tsx                  # Sidebar + Navbar layout
│   ├── (marketing)/                    # Public landing
│   │   ├── page.tsx                    # Landing page
│   │   └── layout.tsx
│   ├── api/
│   │   ├── [[...route]]/route.ts       # Hono API entry point
│   │   └── cron/reminders/route.ts     # Bill reminder cron
│   └── layout.tsx                      # Root layout
│
├── components/
│   ├── ui/                             # Shadcn/Radix primitives
│   │   ├── alert-dialog.tsx
│   │   ├── avatar.tsx
│   │   ├── badge.tsx
│   │   ├── button.tsx
│   │   ├── calendar.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── dropdown-menu.tsx
│   │   ├── form.tsx
│   │   ├── input.tsx
│   │   ├── label.tsx
│   │   ├── popover.tsx
│   │   ├── progress.tsx
│   │   ├── select.tsx
│   │   ├── separator.tsx
│   │   ├── sheet.tsx
│   │   ├── sonner.tsx
│   │   ├── switch.tsx
│   │   ├── table.tsx
│   │   └── textarea.tsx
│   ├── landing/                        # Landing page sections
│   │   ├── hero-section.tsx
│   │   ├── features-grid.tsx
│   │   ├── how-it-works.tsx
│   │   ├── stats-section.tsx
│   │   ├── pricing-section.tsx
│   │   ├── testimonials-section.tsx
│   │   ├── faq-section.tsx
│   │   ├── cta-banner.tsx
│   │   ├── landing-navbar.tsx
│   │   └── landing-footer.tsx
│   ├── sidebar.tsx
│   ├── navbar.tsx
│   ├── navigation.tsx                  # Nav items config
│   ├── mobile-sidebar.tsx
│   ├── query-provider.tsx
│   └── dotted-separator.tsx
│
├── features/
│   ├── auth/
│   │   ├── api/                        # 11 hooks (login, register, OTP, etc.)
│   │   ├── components/                 # Sign-in/up cards, settings, user button
│   │   ├── server/route.ts             # All auth API routes
│   │   ├── action.ts                   # Server action: getCurrent
│   │   └── schemas.ts
│   ├── subscriptions/
│   │   ├── api/                        # 14 hooks (CRUD, mark-paid, export, etc.)
│   │   ├── components/                 # Dashboard, lists, forms, dialogs
│   │   ├── server/route.ts             # All subscription API routes
│   │   ├── data/                       # Popular subscriptions list
│   │   └── schemas.ts
│   └── budgets/
│       ├── api/                        # 11 hooks (CRUD, analytics, safe-to-spend)
│       ├── components/                 # Budget page, cards, dialogs, analytics
│       ├── server/route.ts             # All budget API routes
│       └── schemas.ts
│
└── lib/
    ├── db.ts                           # Prisma client singleton
    ├── rpc.ts                          # Hono RPC client
    ├── sessionMiddleware.ts            # JWT auth middleware
    ├── jwt.ts                          # Token creation/verification
    ├── rateLimiter.ts                  # IP-based rate limiting
    ├── csrf.ts                         # CSRF protection
    ├── sanitize.ts                     # Input sanitization
    ├── securityHeaders.ts              # OWASP security headers
    ├── resend.ts                       # Email service client
    ├── send-reminders.ts               # Cron job: bill reminders
    ├── email-templates.ts              # HTML email templates
    └── utils.ts                        # cn() and utilities
```
