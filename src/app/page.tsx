'use client';

import { useState, useEffect, useCallback } from 'react';
import { Shield, Gift } from 'lucide-react';
import { Hero, SectionBanner } from '@/components/layout';
import { CategoryTabs, ProductGrid, ProductFilters, ProductComparison } from '@/components/products';
import { BenefitsGrid } from '@/components/benefits';
import { SearchBar, SearchResults, FindMyCoverage } from '@/components/search';
import { WaitlistModal } from '@/components/forms';
import { insuranceCategories, products } from '@/data/products';
import { benefitCategories, benefits } from '@/data/benefits';
import type { InsuranceCategory, BenefitCategory, Product, Benefit } from '@/types';

interface SearchResult {
  query: string;
  results: Product[];
  suggestedCategory: InsuranceCategory | null;
  confidence: 'high' | 'medium' | 'low';
  explanation: string;
  resultCount: number;
}

interface QuizResult {
  category: InsuranceCategory;
  products: Product[];
  explanation: string;
}

interface ProductFilterState {
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  sortBy?: 'price-asc' | 'price-desc' | 'rating' | 'popular';
}

export default function HomePage() {
  // Insurance state
  const [activeInsuranceCategory, setActiveInsuranceCategory] = useState<InsuranceCategory | 'all'>('all');
  const [filteredProducts, setFilteredProducts] = useState<Product[]>(products);
  const [productsLoading, setProductsLoading] = useState(false);
  const [productsError, setProductsError] = useState<string | null>(null);
  const [productFilters, setProductFilters] = useState<ProductFilterState>({});
  
  // Search state
  const [searchResults, setSearchResults] = useState<SearchResult | null>(null);
  
  // Quiz state
  const [quizResults, setQuizResults] = useState<QuizResult | null>(null);
  
  // Comparison state
  const [compareProducts, setCompareProducts] = useState<Product[]>([]);

  // Benefits state
  const [activeBenefitCategory, setActiveBenefitCategory] = useState<BenefitCategory | 'all'>('all');
  const [filteredBenefits, setFilteredBenefits] = useState<Benefit[]>(benefits);
  const [benefitsLoading, setBenefitsLoading] = useState(false);
  const [benefitsError, setBenefitsError] = useState<string | null>(null);

  // Waitlist modal state
  const [showWaitlist, setShowWaitlist] = useState(false);

  // Fetch products when category or filters change
  const fetchProducts = useCallback(async () => {
    setProductsLoading(true);
    setProductsError(null);
    
    try {
      const params = new URLSearchParams();
      if (activeInsuranceCategory !== 'all') {
        params.set('category', activeInsuranceCategory);
      }
      if (productFilters.minPrice !== undefined) {
        params.set('minPrice', String(productFilters.minPrice));
      }
      if (productFilters.maxPrice !== undefined) {
        params.set('maxPrice', String(productFilters.maxPrice));
      }
      if (productFilters.minRating !== undefined) {
        params.set('minRating', String(productFilters.minRating));
      }
      if (productFilters.sortBy) {
        params.set('sortBy', productFilters.sortBy);
      }
      
      const response = await fetch(`/api/v1/products?${params.toString()}`);
      const result = await response.json() as { success: boolean; data?: Product[]; error?: string };
      
      if (!response.ok || !result.success) {
        throw new Error(result.error ?? 'Failed to fetch products');
      }
      
      setFilteredProducts(result.data ?? []);
    } catch (err) {
      setProductsError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setProductsLoading(false);
    }
  }, [activeInsuranceCategory, productFilters]);

  useEffect(() => {
    // Only fetch when not showing search or quiz results
    if (!searchResults && !quizResults) {
      void fetchProducts();
    }
  }, [fetchProducts, searchResults, quizResults]);

  // Fetch benefits when category changes
  useEffect(() => {
    async function fetchBenefits() {
      setBenefitsLoading(true);
      setBenefitsError(null);
      
      try {
        const params = new URLSearchParams();
        if (activeBenefitCategory !== 'all') {
          params.set('category', activeBenefitCategory);
        }
        
        const response = await fetch(`/api/v1/benefits?${params.toString()}`);
        const result = await response.json() as { success: boolean; data?: Benefit[]; error?: string };
        
        if (!response.ok || !result.success) {
          throw new Error(result.error ?? 'Failed to fetch benefits');
        }
        
        setFilteredBenefits(result.data ?? []);
      } catch (err) {
        setBenefitsError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setBenefitsLoading(false);
      }
    }

    void fetchBenefits();
  }, [activeBenefitCategory]);

  const handleSearchResults = (results: SearchResult | null) => {
    setSearchResults(results);
    setQuizResults(null); // Clear quiz results when searching
  };

  const handleQuizResults = (results: QuizResult | null) => {
    setQuizResults(results);
    setSearchResults(null); // Clear search results when using quiz
  };

  const handleClearSearch = () => {
    setSearchResults(null);
    setQuizResults(null);
  };

  const handleViewAllCategory = (category: InsuranceCategory) => {
    setSearchResults(null);
    setQuizResults(null);
    setActiveInsuranceCategory(category);
  };

  const handleFiltersChange = (filters: ProductFilterState) => {
    setProductFilters(filters);
  };

  const handleCompareToggle = (product: Product) => {
    setCompareProducts((prev) => {
      const isSelected = prev.some((p) => p.id === product.id);
      if (isSelected) {
        return prev.filter((p) => p.id !== product.id);
      }
      if (prev.length >= 4) {
        return prev;
      }
      return [...prev, product];
    });
  };

  const handleCompareRemove = (productId: string) => {
    setCompareProducts((prev) => prev.filter((p) => p.id !== productId));
  };

  const handleCompareClear = () => {
    setCompareProducts([]);
  };

  const retryProducts = () => {
    void fetchProducts();
  };

  const retryBenefits = () => {
    setActiveBenefitCategory(activeBenefitCategory);
  };

  // Determine which products to display
  const displayProducts = quizResults?.products ?? searchResults?.results ?? filteredProducts;

  return (
    <>
      {/* Hero Section */}
      <Hero />

      {/* Insurance Section */}
      <SectionBanner
        id="insurance"
        title="Insurance Marketplace"
        subtitle="Compare 30+ insurance products from trusted providers. Find the perfect coverage for your nomadic lifestyle."
        icon={<Shield className="h-8 w-8" />}
        accentColor="primary"
      />

      <section className="py-6 lg:py-8 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Search & Quiz Row */}
          <div className="flex flex-col lg:flex-row gap-4 mb-6 items-start">
            {/* AI Search Bar */}
            <div className="flex-1 w-full">
              <SearchBar 
                onResults={handleSearchResults}
                onCategoryChange={setActiveInsuranceCategory}
              />
            </div>
            
            {/* Find My Coverage Quiz Button */}
            <div className="w-full lg:w-auto">
              <FindMyCoverage 
                onResults={handleQuizResults}
                onCategorySelect={setActiveInsuranceCategory}
              />
            </div>
          </div>

          {/* Quiz/Search Results or Regular View */}
          {quizResults ? (
            <div className="space-y-6">
              {/* Quiz Results Header */}
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-accent-50 to-primary-50 rounded-xl border border-accent-200">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">✨</span>
                    <span className="font-semibold text-sand-900">Personalized for You</span>
                  </div>
                  <p className="text-sm text-sand-600">{quizResults.explanation}</p>
                </div>
                <button
                  onClick={handleClearSearch}
                  className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                >
                  View all products
                </button>
              </div>
              
              {/* Products Grid */}
              <ProductGrid
                products={displayProducts}
                loading={productsLoading}
                error={productsError ?? undefined}
                onRetry={retryProducts}
                selectedForComparison={compareProducts.map((p) => p.id)}
                onCompareToggle={handleCompareToggle}
                maxComparison={4}
                showQuickQuote
              />
            </div>
          ) : searchResults ? (
            <SearchResults
              query={searchResults.query}
              results={searchResults.results}
              suggestedCategory={searchResults.suggestedCategory}
              confidence={searchResults.confidence}
              explanation={searchResults.explanation}
              onClear={handleClearSearch}
              onViewAll={handleViewAllCategory}
            />
          ) : (
            <>
              {/* Category Tabs */}
              <div className="mb-6">
                <CategoryTabs
                  categories={insuranceCategories}
                  activeCategory={activeInsuranceCategory}
                  onCategoryChange={setActiveInsuranceCategory}
                  showAll
                  allLabel="All Insurance"
                />
              </div>

              {/* Advanced Filters */}
              <ProductFilters
                minPrice={productFilters.minPrice}
                maxPrice={productFilters.maxPrice}
                minRating={productFilters.minRating}
                sortBy={productFilters.sortBy}
                onFiltersChange={handleFiltersChange}
              />

              {/* Product Grid */}
              <ProductGrid
                products={filteredProducts}
                loading={productsLoading}
                error={productsError ?? undefined}
                onRetry={retryProducts}
                selectedForComparison={compareProducts.map((p) => p.id)}
                onCompareToggle={handleCompareToggle}
                maxComparison={4}
                showQuickQuote
              />
            </>
          )}
        </div>
      </section>

      {/* Membership Benefits Section */}
      <SectionBanner
        id="membership"
        title="Membership Benefits"
        subtitle="Unlock exclusive discounts on wearables, wellness, travel perks, and more. Save hundreds every year."
        icon={<Gift className="h-8 w-8" />}
        accentColor="accent"
      />

      <section className="py-6 lg:py-8 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Category Tabs */}
          <div className="mb-6">
            <CategoryTabs
              categories={benefitCategories}
              activeCategory={activeBenefitCategory}
              onCategoryChange={setActiveBenefitCategory}
              showAll
              allLabel="All Benefits"
            />
          </div>

          {/* Benefits Grid with Progressive Disclosure */}
          <BenefitsGrid
            benefits={filteredBenefits}
            loading={benefitsLoading}
            error={benefitsError ?? undefined}
            onRetry={retryBenefits}
            showProgressiveDisclosure={true}
            unlockedCount={3}
            onJoinClick={() => setShowWaitlist(true)}
          />
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 lg:py-16 bg-gradient-to-br from-primary-900 via-primary-800 to-primary-900 text-white relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-600/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-accent-500/10 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold mb-6">
            Ready to simplify your insurance?
          </h2>
          <p className="text-lg sm:text-xl text-primary-100 mb-10 max-w-2xl mx-auto">
            Join thousands of digital nomads who trust GlobalCover for their insurance needs. 
            Get early access to our membership and save up to 40%.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="#insurance"
              className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold bg-white text-primary-700 rounded-xl hover:bg-primary-50 transition-colors shadow-lg"
            >
              Browse Insurance
            </a>
            <button 
              onClick={() => setShowWaitlist(true)}
              className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold bg-accent-500 text-white rounded-xl hover:bg-accent-600 transition-colors shadow-lg"
            >
              Join Waitlist
            </button>
          </div>
        </div>
      </section>

      {/* Product Comparison Bar */}
      <ProductComparison
        products={compareProducts}
        onRemove={handleCompareRemove}
        onClear={handleCompareClear}
      />

      {/* Spacer for comparison bar */}
      {compareProducts.length > 0 && <div className="h-20" />}

      {/* Waitlist Modal */}
      <WaitlistModal 
        isOpen={showWaitlist} 
        onClose={() => setShowWaitlist(false)} 
      />
    </>
  );
}
