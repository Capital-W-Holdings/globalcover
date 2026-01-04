# GlobalCover - Insurance Marketplace for Digital Nomads

A modern insurance marketplace and membership platform built with Next.js 14, TypeScript, and Tailwind CSS.

## Features

### Insurance Marketplace
- 30+ insurance products across 6 categories (travel, health, property, liability, life, vehicle)
- AI-powered semantic search with persona detection
- Advanced filtering (price range, rating, sort options)
- Side-by-side product comparison (up to 4 products)
- Quote request system with email notifications

### Membership Benefits
- 32+ partner benefits across 6 categories (wearables, wellness, travel, lifestyle, finance, professional)
- Exclusive member-only discounts up to 40%
- Referral system with position tracking
- Monthly and annual subscription plans

### Technical Features
- Next.js 14 App Router with TypeScript strict mode
- PostgreSQL-ready database layer
- SendGrid-ready email service with 5 templates
- Segment-ready analytics with 10 event types
- Stripe payment integration with webhooks
- Admin API with API key authentication
- Rate limiting on all mutation endpoints
- Circuit breaker pattern for third-party services
- Health check endpoint for monitoring
- Comprehensive error handling
- Mobile-first responsive design

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/globalcover.git
cd globalcover

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Start development server
npm run dev
```

### Environment Variables

See `.env.example` for all available configuration options:

```bash
# Required for full functionality
DATABASE_URL=postgresql://...
SENDGRID_API_KEY=SG.xxx
STRIPE_SECRET_KEY=sk_xxx
ADMIN_API_KEY=your-secure-key
```

## API Endpoints

### Public Endpoints
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/categories` | GET | List insurance categories |
| `/api/v1/products` | GET | List/filter products |
| `/api/v1/benefits` | GET | List/filter benefits |
| `/api/v1/search` | POST | AI-powered search |
| `/api/v1/leads/quote` | POST | Submit quote request |
| `/api/v1/waitlist` | POST | Join waitlist |
| `/api/v1/checkout` | GET/POST | Pricing & checkout |
| `/api/v1/health` | GET | Health check & service status |

### Admin Endpoints (require `Authorization: Bearer <ADMIN_API_KEY>`)
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/admin/leads` | GET | List all leads |
| `/api/v1/admin/waitlist` | GET | List waitlist entries |
| `/api/v1/admin/stats` | GET | Dashboard metrics |
| `/api/v1/admin/circuits` | GET | Circuit breaker status |

### Webhook Endpoints
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/webhooks/stripe` | POST | Handle Stripe events |

## Admin Dashboard

The admin dashboard is available at `/admin` and requires API key authentication.

### Features
- **Dashboard Overview**: Real-time metrics (leads, waitlist, revenue)
- **Leads Management**: View, filter, and search quote requests
- **Waitlist Management**: View signups, referral tracking
- **System Health**: Service status and circuit breaker monitoring

### Access
1. Navigate to `/admin`
2. Enter your `ADMIN_API_KEY`
3. Session persists in browser storage

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── admin/             # Admin dashboard pages
│   │   ├── leads/         # Lead management
│   │   ├── waitlist/      # Waitlist management
│   │   └── health/        # System monitoring
│   ├── api/v1/            # API routes
│   ├── checkout/          # Checkout flow pages
│   ├── dashboard/         # Member dashboard
│   └── join/              # Pricing/signup page
├── components/
│   ├── admin/             # Admin dashboard components
│   ├── ui/                # Base UI components
│   ├── layout/            # Layout components
│   ├── products/          # Product-related components
│   ├── benefits/          # Benefit-related components
│   ├── search/            # Search components
│   └── forms/             # Form modals
├── data/                  # Static product/benefit data
├── lib/
│   ├── ai/                # AI recommendation engine
│   ├── analytics/         # Segment integration
│   ├── circuit-breaker.ts # Circuit breaker for resilience
│   ├── db/                # Database client
│   ├── email/             # Email service
│   └── payments/          # Stripe integration
└── types/                 # TypeScript type definitions
```


## Development

```bash
# Run development server
npm run dev

# Type check
npm run typecheck

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Build for production
npm run build

# Start production server
npm start
```

## Testing

The project includes comprehensive tests for:
- **Validation** - Form schemas and input validation (23 tests)
- **Error Handling** - Custom error classes and helpers (15 tests)
- **Rate Limiting** - Request throttling logic (10 tests)
- **AI Recommendations** - Search and recommendation engine (13 tests)
- **Database Operations** - CRUD operations for leads, waitlist, payments (12 tests)

Run all tests:
```bash
npm test
```

## Security Considerations

This codebase has been hardened with the following security measures:

1. **Webhook Signature Verification** - Stripe webhooks are cryptographically verified
2. **Timing-Safe Auth** - Admin authentication uses timing-safe string comparison
3. **Rate Limiting** - All mutation endpoints are rate-limited
4. **Input Validation** - All inputs validated with Zod schemas
5. **Error Sanitization** - Internal errors are sanitized in production

### Production Checklist

Before deploying to production:

- [ ] Set `ADMIN_API_KEY` to a secure random string (32+ chars)
- [ ] Configure Stripe credentials and webhook secret
- [ ] Set up Upstash Redis for rate limiting (see `src/lib/rate-limit-redis.ts`)
- [ ] Configure PostgreSQL database
- [ ] Set up SendGrid for email delivery
- [ ] Enable Segment analytics

## Deployment

### Vercel (Recommended for MVP)

1. Push to GitHub
2. Connect repository to Vercel
3. Configure environment variables
4. Deploy

### Docker

Build and run with Docker:

```bash
# Build the image
docker build -t globalcover .

# Run with environment variables
docker run -p 3000:3000 \
  -e DATABASE_URL=postgresql://... \
  -e STRIPE_SECRET_KEY=sk_... \
  globalcover
```

### Docker Compose (Full Stack)

Run the complete stack locally:

```bash
# Start all services (app, PostgreSQL, Redis)
docker-compose up -d

# View logs
docker-compose logs -f app

# Stop all services
docker-compose down
```

### Production Docker

```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY . .
RUN npm ci && npm run build

FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
EXPOSE 3000
CMD ["node", "server.js"]
```

### Health Checks

The `/api/v1/health` endpoint provides service status:

```bash
curl https://your-domain.com/api/v1/health
```

Response:
```json
{
  "status": "healthy",
  "services": {
    "database": { "status": "up", "latency": 5 },
    "payments": { "status": "up" },
    "analytics": { "status": "up" },
    "email": { "status": "up" }
  }
}
```

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS 3.3
- **Validation**: Zod
- **Icons**: Lucide React
- **Database**: PostgreSQL (production) / In-memory (development)
- **Email**: SendGrid
- **Payments**: Stripe
- **Analytics**: Segment

## License

MIT License - see LICENSE for details.

## Support

For support, email support@globalcover.com or open an issue.
