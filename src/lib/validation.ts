import { z } from 'zod';
import { 
  INSURANCE_CATEGORIES, 
  BENEFIT_CATEGORIES, 
  AVAILABILITY_OPTIONS,
  SORT_OPTIONS 
} from '@/types';

// Quote form validation
export const quoteFormSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  productName: z.string().min(1, 'Product name is required'),
  firstName: z.string().min(1, 'First name is required').max(50, 'First name too long'),
  lastName: z.string().min(1, 'Last name is required').max(50, 'Last name too long'),
  email: z.string().email('Invalid email address').max(254, 'Email too long'),
  phone: z.string()
    .regex(/^[\d\s\-\+\(\)\.]{7,20}$/, 'Invalid phone format')
    .optional()
    .or(z.literal('')),
  country: z.string().min(1, 'Country is required'),
  startDate: z.string().min(1, 'Start date is required'),
  message: z.string().max(1000, 'Message too long').optional(),
  referralCode: z.string().max(20, 'Referral code too long').optional(),
});

// Waitlist form validation
export const waitlistFormSchema = z.object({
  email: z.string().email('Invalid email address'),
  firstName: z.string().min(1, 'First name is required').max(50),
  interests: z.array(z.enum(BENEFIT_CATEGORIES)).min(1, 'Select at least one interest'),
  referralCode: z.string().max(20).optional(),
});

// Product filter validation
export const productFilterSchema = z.object({
  category: z.enum(INSURANCE_CATEGORIES).optional(),
  minPrice: z.number().min(0).optional(),
  maxPrice: z.number().min(0).optional(),
  minRating: z.number().min(0).max(5).optional(),
  sortBy: z.enum(SORT_OPTIONS.products).optional(),
  search: z.string().max(100).optional(),
});

// Benefit filter validation
export const benefitFilterSchema = z.object({
  category: z.enum(BENEFIT_CATEGORIES).optional(),
  exclusive: z.boolean().optional(),
  availability: z.enum(AVAILABILITY_OPTIONS).optional(),
  sortBy: z.enum(SORT_OPTIONS.benefits).optional(),
});

// Search query validation
export const searchQuerySchema = z.object({
  query: z.string().min(1, 'Search query is required').max(200),
  limit: z.number().min(1).max(20).optional().default(5),
});

// Type exports
export type QuoteFormInput = z.infer<typeof quoteFormSchema>;
export type WaitlistFormInput = z.infer<typeof waitlistFormSchema>;
export type ProductFilterInput = z.infer<typeof productFilterSchema>;
export type BenefitFilterInput = z.infer<typeof benefitFilterSchema>;
export type SearchQueryInput = z.infer<typeof searchQuerySchema>;
