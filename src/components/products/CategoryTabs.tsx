'use client';

import { 
  Plane, Heart, Home, Shield, Users, Car,
  Watch, Sparkles, CreditCard, Briefcase
} from 'lucide-react';
import type { InsuranceCategory, BenefitCategory, Category } from '@/types';

const iconMap: Record<string, React.ElementType> = {
  Plane,
  Heart,
  Home,
  Shield,
  Users,
  Car,
  Watch,
  Sparkles,
  CreditCard,
  Briefcase,
};

interface CategoryTabsProps<T extends InsuranceCategory | BenefitCategory> {
  categories: Category[];
  activeCategory: T | 'all';
  onCategoryChange: (category: T | 'all') => void;
  showAll?: boolean;
  allLabel?: string;
}

export default function CategoryTabs<T extends InsuranceCategory | BenefitCategory>({
  categories,
  activeCategory,
  onCategoryChange,
  showAll = true,
  allLabel = 'All',
}: CategoryTabsProps<T>) {
  return (
    <div className="relative">
      {/* Gradient fade indicators */}
      <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none lg:hidden" />
      <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none lg:hidden" />
      
      <div className="overflow-x-auto scrollbar-hide -mx-4 px-4">
        <div className="flex items-center gap-2 min-w-max pb-2">
          {/* All Tab */}
          {showAll && (
            <button
              onClick={() => onCategoryChange('all' as T | 'all')}
              className={`
                flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm
                transition-all duration-200 whitespace-nowrap
                ${activeCategory === 'all'
                  ? 'bg-primary-600 text-white shadow-md shadow-primary-200'
                  : 'bg-sand-100 text-sand-700 hover:bg-sand-200'
                }
              `}
            >
              <span>{allLabel}</span>
            </button>
          )}

          {/* Category Tabs */}
          {categories.map((category) => {
            const Icon = iconMap[category.icon] ?? Shield;
            const isActive = activeCategory === category.slug;

            return (
              <button
                key={category.id}
                onClick={() => onCategoryChange(category.slug as T)}
                className={`
                  flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm
                  transition-all duration-200 whitespace-nowrap
                  ${isActive
                    ? 'bg-primary-600 text-white shadow-md shadow-primary-200'
                    : 'bg-sand-100 text-sand-700 hover:bg-sand-200'
                  }
                `}
              >
                <Icon className="h-4 w-4" />
                <span>{category.name.replace(' Insurance', '')}</span>
                <span className={`
                  text-xs px-1.5 py-0.5 rounded-md
                  ${isActive ? 'bg-white/20' : 'bg-sand-200'}
                `}>
                  {category.productCount}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
