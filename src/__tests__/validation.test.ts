/**
 * Validation Tests for GlobalCover
 * 
 * Run with: npx jest src/__tests__/validation.test.ts
 */

import { 
  quoteFormSchema, 
  waitlistFormSchema, 
  productFilterSchema,
  searchQuerySchema 
} from '../lib/validation';
import { generateReferralCode, isValidReferralCode } from '../lib/referrals';

describe('Quote Form Validation', () => {
  const validQuote = {
    productId: 'travel-001',
    productName: 'SafetyWing Nomad Insurance',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    country: 'US',
    startDate: '2025-02-01',
  };

  test('accepts valid quote request', () => {
    const result = quoteFormSchema.safeParse(validQuote);
    expect(result.success).toBe(true);
  });

  test('rejects missing required fields', () => {
    const result = quoteFormSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  test('rejects invalid email', () => {
    const result = quoteFormSchema.safeParse({
      ...validQuote,
      email: 'not-an-email',
    });
    expect(result.success).toBe(false);
  });

  test('accepts valid phone number', () => {
    const result = quoteFormSchema.safeParse({
      ...validQuote,
      phone: '+1 (555) 123-4567',
    });
    expect(result.success).toBe(true);
  });

  test('rejects invalid phone number', () => {
    const result = quoteFormSchema.safeParse({
      ...validQuote,
      phone: 'call me maybe',
    });
    expect(result.success).toBe(false);
  });

  test('accepts empty phone as optional', () => {
    const result = quoteFormSchema.safeParse({
      ...validQuote,
      phone: '',
    });
    expect(result.success).toBe(true);
  });

  test('rejects too-long message', () => {
    const result = quoteFormSchema.safeParse({
      ...validQuote,
      message: 'a'.repeat(1001),
    });
    expect(result.success).toBe(false);
  });
});

describe('Waitlist Form Validation', () => {
  const validWaitlist = {
    email: 'jane@example.com',
    firstName: 'Jane',
    interests: ['travel', 'wellness'],
  };

  test('accepts valid waitlist signup', () => {
    const result = waitlistFormSchema.safeParse(validWaitlist);
    expect(result.success).toBe(true);
  });

  test('rejects empty interests', () => {
    const result = waitlistFormSchema.safeParse({
      ...validWaitlist,
      interests: [],
    });
    expect(result.success).toBe(false);
  });

  test('rejects invalid interest category', () => {
    const result = waitlistFormSchema.safeParse({
      ...validWaitlist,
      interests: ['invalid-category'],
    });
    expect(result.success).toBe(false);
  });
});

describe('Product Filter Validation', () => {
  test('accepts empty filters', () => {
    const result = productFilterSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  test('accepts valid category filter', () => {
    const result = productFilterSchema.safeParse({
      category: 'travel',
    });
    expect(result.success).toBe(true);
  });

  test('rejects invalid category', () => {
    const result = productFilterSchema.safeParse({
      category: 'invalid',
    });
    expect(result.success).toBe(false);
  });

  test('accepts valid price range', () => {
    const result = productFilterSchema.safeParse({
      minPrice: 0,
      maxPrice: 500,
    });
    expect(result.success).toBe(true);
  });

  test('rejects negative price', () => {
    const result = productFilterSchema.safeParse({
      minPrice: -10,
    });
    expect(result.success).toBe(false);
  });
});

describe('Search Query Validation', () => {
  test('accepts valid search query', () => {
    const result = searchQuerySchema.safeParse({
      query: 'travel insurance for nomads',
    });
    expect(result.success).toBe(true);
  });

  test('rejects empty search query', () => {
    const result = searchQuerySchema.safeParse({
      query: '',
    });
    expect(result.success).toBe(false);
  });

  test('rejects too-long search query', () => {
    const result = searchQuerySchema.safeParse({
      query: 'a'.repeat(201),
    });
    expect(result.success).toBe(false);
  });

  test('applies default limit', () => {
    const result = searchQuerySchema.safeParse({
      query: 'test',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.limit).toBe(5);
    }
  });
});

describe('Referral Code Generation', () => {
  test('generates 8-character code', () => {
    const code = generateReferralCode();
    expect(code.length).toBe(8);
  });

  test('generates uppercase alphanumeric code', () => {
    const code = generateReferralCode();
    expect(/^[A-Z0-9]{8}$/.test(code)).toBe(true);
  });

  test('generates unique codes', () => {
    const codes = new Set<string>();
    for (let i = 0; i < 100; i++) {
      codes.add(generateReferralCode());
    }
    // With 36^8 possibilities, 100 codes should all be unique
    expect(codes.size).toBe(100);
  });

  test('validates correct referral code format', () => {
    expect(isValidReferralCode('ABCD1234')).toBe(true);
    expect(isValidReferralCode('abcd1234')).toBe(true); // Should uppercase internally
    expect(isValidReferralCode('ABC123')).toBe(false); // Too short
    expect(isValidReferralCode('ABCD123!')).toBe(false); // Invalid character
  });
});
