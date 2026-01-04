# GlobalCover Infrastructure Analysis
## COO / Infra Lead Assessment

**Product**: Insurance Marketplace & Membership Platform for Digital Nomads  
**Assessment Date**: January 2026  
**Tech Stack**: Next.js 14 (App Router), TypeScript (strict), PostgreSQL, Redis, Stripe, SendGrid, Segment

---

## Executive Summary

GlobalCover is a production-ready insurance marketplace with 30+ products across 6 categories, membership benefits with 32+ partner integrations, and a referral-driven waitlist system. The codebase passes all 110 tests and compiles cleanly in TypeScript strict mode. This document outlines deployment strategy, cost projections at scale, failure scenarios, monetization levers, and analytics to track.

---

## 1. Deployment Strategy

### Recommended Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLOUDFLARE                               │
│                    (CDN + DDoS Protection)                       │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                         VERCEL EDGE                              │
│              (Next.js Deployment + Edge Functions)               │
│                                                                  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │   Static    │  │   App      │  │     API Routes          │  │
│  │   Assets    │  │   Router   │  │  /api/v1/*              │  │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
           │                  │                    │
           ▼                  ▼                    ▼
┌──────────────────────────────────────────────────────────────────┐
│                      EXTERNAL SERVICES                            │
│                                                                   │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐ ┌───────────┐│
│  │ PostgreSQL  │  │   Upstash   │  │   Stripe    │ │ SendGrid  ││
│  │  (Neon/     │  │   Redis     │  │  Payments   │ │  Email    ││
│  │  Supabase)  │  │ Rate Limit  │  │  Webhooks   │ │           ││
│  └─────────────┘  └─────────────┘  └─────────────┘ └───────────┘│
│                                                                   │
│  ┌─────────────┐  ┌─────────────┐                                │
│  │  Segment    │  │   Sentry    │                                │
│  │  Analytics  │  │   Errors    │                                │
│  └─────────────┘  └─────────────┘                                │
└──────────────────────────────────────────────────────────────────┘
```

### Deployment Phases

#### Phase 1: MVP Launch (Week 1-2)
| Component | Service | Config |
|-----------|---------|--------|
| Hosting | Vercel Pro | Automatic deploys from GitHub |
| Database | Neon (Serverless Postgres) | Free tier → Pro as needed |
| Rate Limiting | Upstash Redis | Pay-per-request |
| Payments | Stripe | Test → Live keys |
| Email | SendGrid | Free tier (100/day) |
| Analytics | Segment | Free tier |
| Monitoring | Vercel Analytics + Sentry | Included/Free |

#### Phase 2: Growth (Month 2-6)
- Database: Upgrade to Neon Pro or Supabase Pro
- Add read replicas for analytics queries
- Enable Vercel Edge Functions for latency
- Add Cloudflare for global CDN

#### Phase 3: Scale (Month 6+)
- Consider dedicated Postgres (AWS RDS / GCP Cloud SQL)
- Kubernetes if multi-region needed
- Add message queue (BullMQ) for async processing

### Environment Variables Required

```bash
# Core
DATABASE_URL=postgresql://...
ADMIN_API_KEY=<32+ char secure random>

# Payments
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_PRICE_MONTHLY=price_...
STRIPE_PRICE_ANNUAL=price_...

# Email
SENDGRID_API_KEY=SG....
EMAIL_FROM=hello@globalcover.com
EMAIL_FROM_NAME=GlobalCover
EMAIL_REPLY_TO=support@globalcover.com
ADMIN_EMAIL=team@globalcover.com

# Analytics
SEGMENT_WRITE_KEY=...
GA_TRACKING_ID=G-...

# Rate Limiting (Production)
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=...
```

---

## 2. Cost Profile at Scale

### Summary Table

| Scale | Monthly Active Users | Monthly Cost | Cost/User |
|-------|---------------------|--------------|-----------|
| **1K MAU** | 1,000 | $47-85 | $0.05-0.09 |
| **10K MAU** | 10,000 | $285-450 | $0.03-0.05 |
| **1M MAU** | 1,000,000 | $8,500-15,000 | $0.009-0.015 |

### Detailed Cost Breakdown

#### 1,000 MAU (Early Stage)

| Service | Tier | Monthly Cost | Notes |
|---------|------|--------------|-------|
| Vercel | Pro | $20 | Includes analytics |
| Neon DB | Free/Launch | $0-19 | 0.5-10GB storage |
| Upstash Redis | Pay-as-you-go | $0-5 | ~100K requests |
| Stripe | 2.9% + $0.30 | Variable | Per transaction |
| SendGrid | Free | $0 | 100 emails/day |
| Segment | Free | $0 | 1K MTU free |
| Sentry | Free | $0 | 5K errors/month |
| Domain + SSL | Annual | $2/mo | GoDaddy/Cloudflare |
| **TOTAL** | | **$47-85** | |

#### 10,000 MAU (Growth Stage)

| Service | Tier | Monthly Cost | Notes |
|---------|------|--------------|-------|
| Vercel | Pro | $20 | May need Team ($40) |
| Neon DB | Pro | $19-69 | 10-50GB, compute |
| Upstash Redis | Pro | $10-25 | ~1M requests |
| Stripe | 2.9% + $0.30 | Variable | Volume discounts possible |
| SendGrid | Essentials | $20 | 50K emails/month |
| Segment | Team | $120 | 10K MTU |
| Sentry | Team | $26 | 50K errors/month |
| Cloudflare | Pro | $20 | DDoS protection |
| **TOTAL** | | **$285-450** | |

#### 1,000,000 MAU (Scale)

| Service | Tier | Monthly Cost | Notes |
|---------|------|--------------|-------|
| Vercel | Enterprise | $1,000-2,000 | Custom pricing |
| AWS RDS Postgres | db.r6g.xlarge | $800-1,200 | Multi-AZ, read replicas |
| Redis (ElastiCache) | r6g.large | $200-400 | Cluster mode |
| Stripe | Negotiated | 2.5% + $0.25 | Volume discount |
| SendGrid | Pro | $450 | 1.5M emails/month |
| Segment | Business | $1,000+ | 100K+ MTU |
| Sentry | Business | $80 | 500K errors |
| Cloudflare | Business | $200 | Enterprise DDoS |
| CDN/Bandwidth | AWS CloudFront | $500-1,000 | ~10TB/month |
| DevOps/Monitoring | Datadog/NewRelic | $500-1,000 | APM, logs |
| **TOTAL** | | **$8,500-15,000** | |

### Revenue vs Cost Model

Assuming $9.99/month membership:

| Scale | Subscribers | Monthly Revenue | Monthly Cost | Margin |
|-------|-------------|-----------------|--------------|--------|
| 1K MAU | 100 (10%) | $999 | $85 | 91.5% |
| 10K MAU | 1,000 (10%) | $9,990 | $450 | 95.5% |
| 1M MAU | 50,000 (5%) | $499,500 | $15,000 | 97.0% |

**Note**: Insurance commission revenue is additional (typically 5-15% of premium).

---

## 3. Failure Scenarios & Mitigations

### Critical Path Analysis

```
User Journey: Quote Request
─────────────────────────────
1. Load page (Vercel CDN) ──────────▶ Fallback: Static export
2. Submit form (API route) ─────────▶ Rate limit: 10/min/IP
3. Validate input (Zod) ────────────▶ 400 error with details
4. Create lead (PostgreSQL) ────────▶ Retry 3x, then queue
5. Send confirmation email ─────────▶ Queue, async, retry
6. Track analytics ─────────────────▶ Fire-and-forget
7. Notify admin ────────────────────▶ Queue, non-blocking
```

### Failure Matrix

| Failure | Impact | Detection | Mitigation | RTO |
|---------|--------|-----------|------------|-----|
| **Database Down** | Critical - No writes | Health check, Sentry | Connection pooling, retry logic, read replica failover | 5 min |
| **Stripe Down** | High - No payments | Webhook failures, Stripe status | Display message, queue checkout, retry | 15 min |
| **SendGrid Down** | Medium - No emails | Delivery webhooks | Queue emails, fallback to AWS SES | 30 min |
| **Redis Down** | Low - Rate limiting off | Health check | Fallback to in-memory (already implemented) | Immediate |
| **Vercel Down** | Critical - Site offline | Uptime monitors | Static fallback on Cloudflare Pages | 10 min |
| **DDoS Attack** | Critical - Availability | Traffic spike alerts | Cloudflare rate limiting, bot protection | 5 min |
| **Webhook Signature Failure** | Medium - Missed events | Error logs | Alert, manual reconciliation | 1 hour |

### Implemented Safeguards

1. **Rate Limiting**: All mutation endpoints protected
   - Quote requests: 10/minute/IP
   - Waitlist signups: 5/minute/IP
   - Checkout: 3/minute/IP

2. **Input Validation**: Zod schemas on all endpoints
   - Email format validation
   - Phone number sanitization
   - Country code validation

3. **Webhook Security**: 
   - Stripe signature verification (timing-safe)
   - Timestamp replay attack protection (5-min window)
   - Rejects unsigned webhooks when not configured

4. **Admin Auth**: 
   - API key with timing-safe comparison
   - Separate admin endpoints under /api/v1/admin

5. **Error Handling**:
   - Custom error classes with codes
   - Production error sanitization
   - Structured logging

### Recommended Additions

```typescript
// Add to production checklist:
// 1. Database connection pooling
const pool = new Pool({
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// 2. Circuit breaker for external services
// 3. Dead letter queue for failed operations
// 4. Health check endpoint
// GET /api/health → { db: "ok", redis: "ok", stripe: "ok" }
```

---

## 4. Monetization Levers

### Current Revenue Streams

| Stream | Status | Pricing | Est. Revenue/User |
|--------|--------|---------|-------------------|
| **Membership** | Active | $9.99/mo or $99/yr | $99-120/yr |
| **Insurance Commissions** | Ready | 5-15% of premium | $50-200/yr |
| **Partner Referrals** | Ready | CPA/Rev share | $10-50/user |

### Optimization Opportunities

#### 1. Membership Tiers (High Priority)

```
┌─────────────────────────────────────────────────────────────────┐
│                    MEMBERSHIP TIERS                              │
├─────────────────┬─────────────────┬─────────────────────────────┤
│    BASIC        │    PRO          │    PREMIUM                  │
│    $9.99/mo     │    $19.99/mo    │    $49.99/mo               │
├─────────────────┼─────────────────┼─────────────────────────────┤
│ ✓ Basic deals   │ ✓ All Basic     │ ✓ All Pro                  │
│ ✓ 10% discounts │ ✓ 20% discounts │ ✓ 40% discounts            │
│                 │ ✓ Priority      │ ✓ Concierge service        │
│                 │   quotes        │ ✓ Family coverage          │
│                 │ ✓ Travel        │ ✓ Dedicated advisor        │
│                 │   assistance    │                             │
└─────────────────┴─────────────────┴─────────────────────────────┘

Est. ARPU uplift: +60% (from $10 → $16 blended)
```

#### 2. Insurance Commission Structure

| Category | Typical Commission | Annual Premium | Revenue/Policy |
|----------|-------------------|----------------|----------------|
| Travel | 15-25% | $200-500 | $30-125 |
| Health (Expat) | 10-15% | $2,000-8,000 | $200-1,200 |
| Property | 8-12% | $500-2,000 | $40-240 |
| Liability | 10-15% | $300-1,000 | $30-150 |
| Life | 50-100% 1st year | $1,000-5,000 | $500-5,000 |
| Vehicle | 5-10% | $500-1,500 | $25-150 |

**Revenue Model**: 
- 10% of members purchase 1 policy/year = 100 policies @ 1K users
- Avg commission: $150 = $15,000/year additional revenue

#### 3. Waitlist Monetization

```
Current: 2,500+ on waitlist
Opportunity: Early access tiers

┌──────────────────────────────────────────────────────┐
│  FOUNDING MEMBER OFFER (Waitlist Conversion)         │
├──────────────────────────────────────────────────────┤
│  Position 1-100:    Lifetime membership @ $499       │
│  Position 101-500:  40% off first year               │
│  Position 501-1000: 30% off first year               │
│  Position 1001+:    20% off first year               │
└──────────────────────────────────────────────────────┘

Conversion estimate: 15-25% → $12-50K launch revenue
```

#### 4. B2B / Enterprise Opportunities

- **Group Plans**: Companies with remote workers
- **White-Label**: Insurance comparison for other platforms
- **API Access**: Lead gen for insurance brokers
- **Data Insights**: Anonymized market research

#### 5. Affiliate / Partner Revenue

| Partner Type | Model | Est. Revenue |
|--------------|-------|--------------|
| Wearables (Oura, Whoop) | $20-50 CPA | $2-5/user |
| Travel Services | 5-10% rev share | $5-20/booking |
| Financial Services | $50-200 CPA | $5-20/user |
| Wellness Apps | $10-30 CPA | $1-3/user |

### Revenue Projection

| Scenario | 1K MAU | 10K MAU | 100K MAU |
|----------|--------|---------|----------|
| Membership only | $12K/yr | $120K/yr | $1.2M/yr |
| + Insurance commissions | $27K/yr | $270K/yr | $2.7M/yr |
| + Partner revenue | $32K/yr | $320K/yr | $3.2M/yr |
| + B2B/Enterprise | $35K/yr | $400K/yr | $5M/yr |

---

## 5. Analytics to Track

### Implemented Events (via Segment)

| Event | Properties | Priority |
|-------|------------|----------|
| `quote_requested` | product_id, product_name, country, has_referral | P0 |
| `waitlist_signup` | email, position, interests, has_referral | P0 |
| `waitlist_verified` | email, position | P1 |
| `search_performed` | query, result_count, confidence | P1 |
| `product_viewed` | product_id, category, price | P1 |
| `product_compared` | product_ids[], category | P2 |
| `referral_code_used` | referrer_id, new_user_id | P1 |
| `checkout_started` | plan_type, price, email | P0 |
| `payment_completed` | plan_type, amount, stripe_session_id | P0 |
| `payment_failed` | plan_type, error | P0 |

### Dashboard KPIs

#### Acquisition Funnel

```
┌─────────────────────────────────────────────────────────────────┐
│                    CONVERSION FUNNEL                             │
├─────────────────────────────────────────────────────────────────┤
│  Visitors        ████████████████████████████████  100%         │
│  Search/Browse   ████████████████████             60%           │
│  Product View    █████████████████                50%           │
│  Quote Request   ███████                          20%           │
│  Waitlist Join   █████                            15%           │
│  Checkout Start  ██                               5%            │
│  Payment Done    █                                2%            │
└─────────────────────────────────────────────────────────────────┘
```

#### Revenue Metrics

| Metric | Formula | Target |
|--------|---------|--------|
| **MRR** | Sum of monthly subscriptions | Track growth |
| **ARPU** | Revenue / Active Users | $10+ |
| **LTV** | ARPU × Avg Months | $120+ |
| **CAC** | Marketing Spend / New Users | <$30 |
| **LTV:CAC** | LTV / CAC | >4:1 |

#### Engagement Metrics

| Metric | Tracking Method | Target |
|--------|-----------------|--------|
| **DAU/MAU** | Page views | >20% |
| **Searches/User** | search_performed events | >3/session |
| **Quotes/User** | quote_requested events | >0.5/month |
| **Referral Rate** | has_referral % | >15% |
| **Churn** | Subscription cancellations | <5%/month |

### Recommended Additional Tracking

```typescript
// Add these events for deeper insights:

// Engagement
'benefit_viewed'        // Which benefits drive signups
'benefit_redeemed'      // Actual value delivery
'comparison_started'    // Intent signals

// Funnel optimization
'form_abandoned'        // Where users drop off
'form_field_error'      // UX friction points
'page_time_spent'       // Content engagement

// Retention
'email_opened'          // SendGrid webhook
'email_clicked'         // Campaign effectiveness
'return_visit'          // Retention signals

// Revenue
'upgrade_started'       // Tier upgrade intent
'upgrade_completed'     // Actual upgrades
'renewal_upcoming'      // Churn prediction
```

### Data Export Strategy

| Destination | Data | Frequency | Purpose |
|-------------|------|-----------|---------|
| BigQuery/Snowflake | All events | Real-time | Analytics |
| Amplitude/Mixpanel | User events | Real-time | Product analytics |
| HubSpot/Salesforce | Leads | Real-time | Sales CRM |
| Looker/Metabase | Aggregates | Daily | Business dashboards |
| Google Analytics 4 | Web traffic | Real-time | Marketing |

---

## 6. Production Checklist

### Pre-Launch

- [ ] Set `ADMIN_API_KEY` to secure random 32+ char string
- [ ] Configure Stripe live credentials + webhook secret
- [ ] Set up Upstash Redis for production rate limiting
- [ ] Configure PostgreSQL (Neon/Supabase)
- [ ] Set up SendGrid with verified sender
- [ ] Enable Segment production workspace
- [ ] Configure Sentry error tracking
- [ ] Set up uptime monitoring (Better Uptime, Pingdom)
- [ ] Enable Vercel Analytics
- [ ] Configure Cloudflare DNS + SSL

### Security

- [ ] Enable Vercel password protection for staging
- [ ] Configure CSP headers
- [ ] Set up CORS properly
- [ ] Review rate limit thresholds
- [ ] Test webhook signature verification
- [ ] Penetration test critical endpoints

### Monitoring

- [ ] Set up Sentry alerts for errors
- [ ] Configure Stripe webhook failure alerts
- [ ] Database connection monitoring
- [ ] API latency tracking
- [ ] Daily backup verification

---

## Appendix: Quick Reference

### API Endpoints

| Endpoint | Method | Rate Limit | Auth |
|----------|--------|------------|------|
| `/api/v1/products` | GET | 100/min | Public |
| `/api/v1/benefits` | GET | 100/min | Public |
| `/api/v1/search` | POST | 30/min | Public |
| `/api/v1/leads/quote` | POST | 10/min | Public |
| `/api/v1/waitlist` | POST | 5/min | Public |
| `/api/v1/checkout` | POST | 3/min | Public |
| `/api/v1/webhooks/stripe` | POST | - | Signature |
| `/api/v1/admin/*` | GET | 100/min | API Key |

### Test Results

```
Test Suites: 7 passed, 7 total
Tests:       110 passed, 110 total
TypeScript:  Strict mode ✓ 
Coverage:    Validation, Errors, Rate Limiting, AI, DB
```

### Key Files

```
src/lib/
├── db/client.ts        # Database operations
├── payments/service.ts # Stripe integration
├── email/service.ts    # SendGrid (5 templates)
├── analytics/service.ts# Segment (10 events)
├── rate-limit.ts       # Memory-based limiter
├── rate-limit-redis.ts # Production Redis limiter
├── validation.ts       # Zod schemas
└── errors.ts           # Error handling
```

---

**Document Version**: 1.0  
**Last Updated**: January 2026  
**Author**: Infrastructure Assessment
