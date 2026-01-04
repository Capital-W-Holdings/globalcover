# GlobalCover Deployment Guide

## Quick Start (15 minutes to production)

This guide walks you through deploying GlobalCover to production using free tiers.

### Cost Estimate

| Service | Free Tier | Paid (if needed) |
|---------|-----------|------------------|
| Vercel | 100GB bandwidth, unlimited deploys | $20/mo Pro |
| Supabase | 500MB DB, 2GB bandwidth | $25/mo Pro |
| Upstash Redis | 10K commands/day | $0.20/100K |
| SendGrid | 100 emails/day | Free to 100/day |
| Stripe | 2.9% + $0.30 per txn | Same |
| **Total** | **$0/mo** | ~$45/mo at scale |

---

## Step 1: GitHub Repository (2 min)

1. Create a new GitHub repository
2. Push the code:
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/globalcover.git
git push -u origin main
```

---

## Step 2: Supabase Database (3 min)

1. Go to [supabase.com](https://supabase.com) and create account
2. Click "New Project"
3. Choose a name and strong password
4. Select region closest to your users (e.g., `us-east-1`)
5. Wait for project to provision (~2 min)

### Get Connection String
1. Go to **Settings → Database**
2. Copy the **Connection string (URI)**
3. Replace `[YOUR-PASSWORD]` with your database password
4. Save as `DATABASE_URL`

### Initialize Schema
1. Go to **SQL Editor**
2. Paste contents of `scripts/init-db.sql`
3. Click **Run**

---

## Step 3: Upstash Redis (2 min)

1. Go to [upstash.com](https://upstash.com) and create account
2. Click "Create Database"
3. Select same region as Supabase
4. Copy the **REST URL** and **REST Token**
5. Save as `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`

---

## Step 4: Stripe Setup (5 min)

1. Go to [stripe.com](https://stripe.com) and create account
2. Get API keys from **Developers → API keys**:
   - Save **Publishable key** as `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   - Save **Secret key** as `STRIPE_SECRET_KEY`

### Create Products
1. Go to **Products → Add product**
2. Create "GlobalCover Monthly":
   - Price: $9.99/month, recurring
   - Copy Price ID as `STRIPE_PRICE_MONTHLY`
3. Create "GlobalCover Annual":
   - Price: $99/year, recurring
   - Copy Price ID as `STRIPE_PRICE_ANNUAL`

### Webhook (after Vercel deploy)
1. Go to **Developers → Webhooks**
2. Add endpoint: `https://YOUR_DOMAIN/api/v1/webhooks/stripe`
3. Select events:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
4. Copy **Signing secret** as `STRIPE_WEBHOOK_SECRET`

---

## Step 5: SendGrid Email (2 min)

1. Go to [sendgrid.com](https://sendgrid.com) and create account
2. Go to **Settings → API Keys**
3. Create API key with "Full Access"
4. Save as `SENDGRID_API_KEY`

### Domain Authentication (recommended)
1. Go to **Settings → Sender Authentication**
2. Add your domain for better deliverability

---

## Step 6: Vercel Deployment (3 min)

### First-time Setup
1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. Click "Add New Project"
3. Import your `globalcover` repository
4. Configure environment variables (see below)
5. Click "Deploy"

### Environment Variables

Add these in Vercel dashboard → Settings → Environment Variables:

```
# Database
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres

# Redis
UPSTASH_REDIS_REST_URL=https://[ID].upstash.io
UPSTASH_REDIS_REST_TOKEN=[TOKEN]

# Stripe
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_MONTHLY=price_...
STRIPE_PRICE_ANNUAL=price_...

# SendGrid
SENDGRID_API_KEY=SG....

# Admin
ADMIN_API_KEY=[generate: openssl rand -base64 32]

# Analytics (optional)
SEGMENT_WRITE_KEY=...

# App
NEXT_PUBLIC_BASE_URL=https://your-domain.com
```

### Generate Admin API Key
```bash
openssl rand -base64 32
# Example output: K7xP9mN2qR5sT8vW1yB4cE6gH3jL0nM2
```

---

## Step 7: Custom Domain (optional)

1. In Vercel dashboard → Settings → Domains
2. Add your domain (e.g., `globalcover.com`)
3. Update DNS records as instructed
4. SSL is automatic

---

## Step 8: GitHub Actions CI/CD

1. In Vercel dashboard → Settings → Tokens
2. Create a new token
3. In GitHub repo → Settings → Secrets → Actions
4. Add secrets:
   - `VERCEL_TOKEN`: Your Vercel token
   - `VERCEL_ORG_ID`: From `.vercel/project.json` after first deploy
   - `VERCEL_PROJECT_ID`: From `.vercel/project.json` after first deploy

Now every push to `main` will:
1. Run TypeScript checks
2. Run all tests
3. Build the app
4. Deploy to Vercel

---

## Post-Deployment Checklist

### Immediate (Day 1)
- [ ] Verify homepage loads
- [ ] Test quote form submission
- [ ] Test waitlist signup
- [ ] Test Stripe checkout (use test mode first!)
- [ ] Verify emails are sending
- [ ] Login to admin dashboard at `/admin`
- [ ] Check `/api/v1/health` returns healthy

### Before Going Live
- [ ] Switch Stripe to live mode
- [ ] Update Stripe webhook URL
- [ ] Set up Stripe live webhook secret
- [ ] Verify SendGrid domain authentication
- [ ] Set strong `ADMIN_API_KEY`
- [ ] Test full checkout flow with real card

### Monitoring
- [ ] Set up Vercel Analytics (free)
- [ ] Add Sentry for error tracking (free tier)
- [ ] Set up uptime monitoring (e.g., UptimeRobot free)

---

## Troubleshooting

### Build Fails
```bash
# Check TypeScript
npm run typecheck

# Check tests
npm test

# Try local build
npm run build
```

### Database Connection Issues
- Verify `DATABASE_URL` format
- Check Supabase is not paused (free tier pauses after 7 days inactivity)
- Ensure connection pooling is enabled in Supabase

### Stripe Webhook Errors
- Verify webhook URL is correct
- Check webhook secret matches
- Ensure events are selected in Stripe dashboard

### Rate Limiting Not Working
- Verify Upstash credentials
- Check Redis is accessible
- Falls back to in-memory (resets on deploy)

---

## Scaling Checklist

When you hit limits:

### 1K+ Users
- [ ] Upgrade Supabase to Pro ($25/mo)
- [ ] Enable connection pooling
- [ ] Add database indexes if needed

### 10K+ Users
- [ ] Upgrade Vercel to Pro ($20/mo)
- [ ] Add Vercel Analytics
- [ ] Consider CDN for static assets

### 100K+ Users
- [ ] Move to dedicated infrastructure
- [ ] Add read replicas
- [ ] Implement caching layer
- [ ] Consider multi-region deployment
