# GlobalCover Launch Checklist

## Pre-Launch (T-1 day)

### Infrastructure ✅
- [ ] Vercel project deployed
- [ ] Custom domain configured (SSL auto-enabled)
- [ ] Supabase database running
- [ ] Database schema initialized (`scripts/init-db.sql`)
- [ ] Upstash Redis configured
- [ ] All environment variables set in Vercel

### Payments ✅
- [ ] Stripe account verified
- [ ] Products created (Monthly $9.99, Annual $99)
- [ ] Webhook endpoint configured
- [ ] Test transaction successful (test mode)
- [ ] Live mode keys ready (don't activate until launch)

### Email ✅
- [ ] SendGrid API key set
- [ ] Sender domain authenticated
- [ ] Test email sent successfully

### Security ✅
- [ ] Strong ADMIN_API_KEY generated (32+ chars)
- [ ] Admin dashboard accessible at `/admin`
- [ ] Webhook signature verification working
- [ ] Rate limiting active

### Monitoring ✅
- [ ] Health check returns 200: `/api/v1/health`
- [ ] Vercel Analytics enabled
- [ ] Error tracking set up (Sentry optional)

---

## Launch Day (T-0)

### Morning
- [ ] Run validation script: `./scripts/validate-production.sh https://your-domain.com`
- [ ] Check all services healthy in admin dashboard
- [ ] Verify database connection
- [ ] Test quote form submission
- [ ] Test waitlist signup

### Go Live
- [ ] Switch Stripe to LIVE mode
- [ ] Update `STRIPE_SECRET_KEY` to live key
- [ ] Update `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` to live key
- [ ] Update `STRIPE_WEBHOOK_SECRET` for live webhook
- [ ] Redeploy with new keys
- [ ] Test real payment ($1 test if possible)

### Post-Launch (same day)
- [ ] Monitor error logs in Vercel
- [ ] Check first few signups in admin dashboard
- [ ] Verify emails being delivered
- [ ] Monitor Stripe dashboard for payments
- [ ] Check health endpoint every hour

---

## Post-Launch (T+1 week)

### Analytics Review
- [ ] Check Vercel Analytics for traffic
- [ ] Review Segment events (if configured)
- [ ] Analyze waitlist growth
- [ ] Track lead conversion rates

### Performance
- [ ] Review Core Web Vitals in Vercel
- [ ] Check API response times
- [ ] Monitor database query performance

### Security
- [ ] Review access logs
- [ ] Check for unusual patterns
- [ ] Rotate ADMIN_API_KEY if shared

---

## Quick Commands

```bash
# Validate deployment
./scripts/validate-production.sh https://globalcover.com YOUR_ADMIN_KEY

# Check health
curl https://globalcover.com/api/v1/health | jq

# View admin stats
curl -H "Authorization: Bearer YOUR_ADMIN_KEY" \
  https://globalcover.com/api/v1/admin/stats | jq

# Local development
npm run dev

# Run all checks before deploy
npm run validate
```

---

## Emergency Contacts

- **Vercel Status**: https://vercel-status.com
- **Supabase Status**: https://status.supabase.com
- **Stripe Status**: https://status.stripe.com
- **SendGrid Status**: https://status.sendgrid.com

---

## Rollback Procedure

If something goes wrong:

1. **Vercel**: Go to Deployments → Click previous deployment → "..." → "Promote to Production"
2. **Database**: Restore from Supabase backup (automatic daily backups)
3. **Stripe**: Disable webhook to prevent new subscriptions
4. **Kill Switch**: Set `ADMIN_API_KEY` to invalid value to lock admin

---

✅ **Ready to launch when all items above are checked!**
