/**
 * Database Client Tests
 * 
 * Tests the in-memory database client operations.
 * These same tests can be used when migrating to a real database.
 */

import { db } from '../lib/db';

describe('Database Client', () => {
  beforeAll(async () => {
    await db.connect();
  });

  describe('Lead Operations', () => {
    test('creates a lead with generated ID', async () => {
      const lead = await db.createLead({
        product_id: 'travel-001',
        product_name: 'Test Insurance',
        first_name: 'John',
        last_name: 'Doe',
        email: 'john.doe@test.com',
        phone: '+1234567890',
        country: 'US',
        start_date: '2025-03-01',
        message: 'Test message',
        referral_code: null,
        status: 'new',
      });

      expect(lead.id).toMatch(/^lead_/);
      expect(lead.email).toBe('john.doe@test.com');
      expect(lead.created_at).toBeInstanceOf(Date);
    });

    test('retrieves lead by ID', async () => {
      const created = await db.createLead({
        product_id: 'health-001',
        product_name: 'Health Plan',
        first_name: 'Jane',
        last_name: 'Smith',
        email: 'jane@test.com',
        phone: null,
        country: 'UK',
        start_date: '2025-04-01',
        message: null,
        referral_code: null,
        status: 'new',
      });

      const found = await db.getLeadById(created.id);
      expect(found).not.toBeNull();
      expect(found?.email).toBe('jane@test.com');
    });

    test('retrieves lead by email (case-insensitive)', async () => {
      const email = `test-${Date.now()}@example.com`;
      await db.createLead({
        product_id: 'test',
        product_name: 'Test',
        first_name: 'Test',
        last_name: 'User',
        email: email,
        phone: null,
        country: 'US',
        start_date: '2025-01-01',
        message: null,
        referral_code: null,
        status: 'new',
      });

      const found = await db.getLeadByEmail(email.toUpperCase());
      expect(found).not.toBeNull();
      expect(found?.email).toBe(email);
    });

    test('returns null for non-existent lead', async () => {
      const found = await db.getLeadById('nonexistent-id');
      expect(found).toBeNull();
    });

    test('updates lead status', async () => {
      const lead = await db.createLead({
        product_id: 'test',
        product_name: 'Test',
        first_name: 'Update',
        last_name: 'Test',
        email: `update-${Date.now()}@test.com`,
        phone: null,
        country: 'US',
        start_date: '2025-01-01',
        message: null,
        referral_code: null,
        status: 'new',
      });

      // Small delay to ensure timestamp changes
      await new Promise(resolve => setTimeout(resolve, 10));

      const updated = await db.updateLead(lead.id, { status: 'contacted' });
      expect(updated?.status).toBe('contacted');
      expect(updated?.updated_at.getTime()).toBeGreaterThanOrEqual(lead.updated_at.getTime());
    });
  });

  describe('Waitlist Operations', () => {
    test('creates waitlist entry', async () => {
      const entry = await db.createWaitlistEntry({
        email: `wl-${Date.now()}@test.com`,
        first_name: 'Waitlist',
        interests: ['travel', 'wellness'],
        referral_code: 'TEST1234',
        referred_by: null,
        position: 100,
        verified: false,
        verified_at: null,
      });

      expect(entry.id).toMatch(/^wl_/);
      expect(entry.referral_code).toBe('TEST1234');
    });

    test('finds waitlist entry by referral code', async () => {
      const code = `REF${Date.now()}`;
      await db.createWaitlistEntry({
        email: `ref-${Date.now()}@test.com`,
        first_name: 'Referral',
        interests: ['finance'],
        referral_code: code,
        referred_by: null,
        position: 200,
        verified: false,
        verified_at: null,
      });

      const found = await db.getWaitlistEntryByReferralCode(code.toLowerCase());
      expect(found).not.toBeNull();
      expect(found?.referral_code).toBe(code);
    });

    test('gets next waitlist position', async () => {
      const position = await db.getNextWaitlistPosition();
      expect(position).toBeGreaterThan(2500);
    });
  });

  describe('Payment Operations', () => {
    test('creates payment record', async () => {
      const payment = await db.createPayment({
        stripe_session_id: `cs_test_${Date.now()}`,
        stripe_customer_id: null,
        stripe_subscription_id: null,
        email: 'payment@test.com',
        amount: 9900,
        currency: 'usd',
        status: 'pending',
        plan_type: 'annual',
      });

      expect(payment.id).toMatch(/^pay_/);
      expect(payment.amount).toBe(9900);
    });

    test('retrieves payment by session ID', async () => {
      const sessionId = `cs_session_${Date.now()}`;
      await db.createPayment({
        stripe_session_id: sessionId,
        stripe_customer_id: null,
        stripe_subscription_id: null,
        email: 'session@test.com',
        amount: 999,
        currency: 'usd',
        status: 'pending',
        plan_type: 'monthly',
      });

      const found = await db.getPaymentBySessionId(sessionId);
      expect(found).not.toBeNull();
      expect(found?.stripe_session_id).toBe(sessionId);
    });

    test('updates payment status', async () => {
      const payment = await db.createPayment({
        stripe_session_id: `cs_update_${Date.now()}`,
        stripe_customer_id: null,
        stripe_subscription_id: null,
        email: 'update@test.com',
        amount: 999,
        currency: 'usd',
        status: 'pending',
        plan_type: 'monthly',
      });

      const updated = await db.updatePayment(payment.id, {
        status: 'completed',
        stripe_customer_id: 'cus_123',
      });

      expect(updated?.status).toBe('completed');
      expect(updated?.stripe_customer_id).toBe('cus_123');
    });
  });

  describe('Stats', () => {
    test('returns aggregated stats', async () => {
      const stats = await db.getStats();
      
      expect(stats).toHaveProperty('totalLeads');
      expect(stats).toHaveProperty('newLeads');
      expect(stats).toHaveProperty('convertedLeads');
      expect(stats).toHaveProperty('totalWaitlist');
      expect(stats).toHaveProperty('verifiedWaitlist');
      expect(stats).toHaveProperty('totalPayments');
      expect(stats).toHaveProperty('totalRevenue');
      
      expect(typeof stats.totalLeads).toBe('number');
      expect(typeof stats.totalRevenue).toBe('number');
    });
  });
});
