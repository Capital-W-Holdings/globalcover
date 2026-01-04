// =============================================================================
// CATEGORY CONSTANTS - Single Source of Truth
// =============================================================================
// These const arrays are the canonical definition of all categories.
// Types are derived from these arrays to ensure consistency.
// =============================================================================

export const INSURANCE_CATEGORIES = [
  'travel',
  'health', 
  'property',
  'liability',
  'life',
  'vehicle',
] as const;

export const BENEFIT_CATEGORIES = [
  'wearables',
  'wellness',
  'travel',
  'lifestyle',
  'finance',
  'professional',
] as const;

export const LEAD_STATUSES = [
  'new',
  'contacted',
  'qualified',
  'converted',
  'lost',
] as const;

export const AVAILABILITY_OPTIONS = [
  'global',
  'us-only',
  'eu-only',
  'select-countries',
] as const;

export const SORT_OPTIONS = {
  products: ['price-asc', 'price-desc', 'rating', 'popular'] as const,
  benefits: ['discount', 'popular', 'newest'] as const,
};

// =============================================================================
// DERIVED TYPES
// =============================================================================

export type InsuranceCategory = typeof INSURANCE_CATEGORIES[number];
export type BenefitCategory = typeof BENEFIT_CATEGORIES[number];
export type LeadStatus = typeof LEAD_STATUSES[number];
export type AvailabilityOption = typeof AVAILABILITY_OPTIONS[number];
export type ProductSortOption = typeof SORT_OPTIONS.products[number];
export type BenefitSortOption = typeof SORT_OPTIONS.benefits[number];

export interface Product {
  id: string;
  name: string;
  provider: string;
  category: InsuranceCategory;
  description: string;
  shortDescription: string;
  priceFrom: number;
  pricePeriod: 'month' | 'year' | 'trip';
  currency: string;
  rating: number;
  reviewCount: number;
  features: string[];
  highlights: string[];
  coverageLimit: string;
  deductible: string;
  eligibility: string[];
  bestFor: string[];
  logoUrl?: string;
}

export interface Benefit {
  id: string;
  name: string;
  provider: string;
  category: BenefitCategory;
  description: string;
  shortDescription: string;
  discountPercent?: number;
  memberPrice?: number;
  retailPrice?: number;
  currency: string;
  features: string[];
  redemptionMethod: 'code' | 'link' | 'app' | 'card';
  availability: AvailabilityOption;
  countries?: string[];
  logoUrl?: string;
  exclusive: boolean;
}

export interface Category {
  id: string;
  name: string;
  slug: InsuranceCategory | BenefitCategory;
  description: string;
  icon: string;
  productCount: number;
}

// Form Types
export interface QuoteFormData {
  productId: string;
  productName: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  country: string;
  startDate: string;
  message?: string;
  referralCode?: string;
}

export interface WaitlistFormData {
  email: string;
  firstName: string;
  interests: BenefitCategory[];
  referralCode?: string;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Lead Types
export interface Lead {
  id: string;
  productId: string;
  productName: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  country: string;
  startDate: string;
  message?: string;
  referralCode?: string;
  status: LeadStatus;
  createdAt: string;
  updatedAt: string;
}

export interface WaitlistEntry {
  id: string;
  email: string;
  firstName: string;
  interests: BenefitCategory[];
  referralCode?: string;
  referredBy?: string;
  position: number;
  verified: boolean;
  createdAt: string;
}

// Filter Types
export interface ProductFilters {
  category?: InsuranceCategory;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  sortBy?: ProductSortOption;
  search?: string;
}

export interface BenefitFilters {
  category?: BenefitCategory;
  exclusive?: boolean;
  availability?: AvailabilityOption;
  sortBy?: BenefitSortOption;
}

// Component Props Types
export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
}

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  fullWidth?: boolean;
}

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}
