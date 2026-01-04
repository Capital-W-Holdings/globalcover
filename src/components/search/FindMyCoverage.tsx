'use client';

import { useState, useCallback } from 'react';
import { ArrowRight, ArrowLeft, Sparkles, Check, Loader2, RefreshCw } from 'lucide-react';
import type { InsuranceCategory, Product } from '@/types';
import Button from '../ui/Button';

interface QuizStep {
  id: string;
  question: string;
  options: {
    value: string;
    label: string;
    icon: string;
    description?: string;
  }[];
  multiSelect?: boolean;
}

interface QuizResult {
  category: InsuranceCategory;
  products: Product[];
  explanation: string;
}

interface FindMyCoverageProps {
  onResults: (results: QuizResult | null) => void;
  onCategorySelect: (category: InsuranceCategory) => void;
}

const quizSteps: QuizStep[] = [
  {
    id: 'lifestyle',
    question: 'What best describes your lifestyle?',
    options: [
      { value: 'nomad', label: 'Digital Nomad', icon: '🌍', description: 'Moving every few months' },
      { value: 'expat', label: 'Expat', icon: '🏠', description: 'Living abroad long-term' },
      { value: 'traveler', label: 'Frequent Traveler', icon: '✈️', description: 'Regular trips, home base' },
      { value: 'remote', label: 'Remote Worker', icon: '💻', description: 'Occasional travel' },
    ],
  },
  {
    id: 'priority',
    question: 'What\'s your top priority?',
    options: [
      { value: 'health', label: 'Health Coverage', icon: '🏥', description: 'Medical & emergency' },
      { value: 'travel', label: 'Trip Protection', icon: '🧳', description: 'Cancellation & delays' },
      { value: 'gear', label: 'Gear & Electronics', icon: '📱', description: 'Laptop, camera, etc.' },
      { value: 'liability', label: 'Professional Liability', icon: '⚖️', description: 'Business protection' },
    ],
  },
  {
    id: 'budget',
    question: 'What\'s your monthly budget?',
    options: [
      { value: 'low', label: 'Under $50', icon: '💵', description: 'Basic coverage' },
      { value: 'mid', label: '$50 - $150', icon: '💰', description: 'Standard coverage' },
      { value: 'high', label: '$150 - $300', icon: '💎', description: 'Comprehensive' },
      { value: 'premium', label: '$300+', icon: '👑', description: 'Premium everything' },
    ],
  },
];

// Map quiz answers to categories
const categoryMapping: Record<string, InsuranceCategory> = {
  'health': 'health',
  'travel': 'travel',
  'gear': 'property',
  'liability': 'liability',
};

const budgetRanges: Record<string, { min: number; max: number }> = {
  'low': { min: 0, max: 50 },
  'mid': { min: 50, max: 150 },
  'high': { min: 150, max: 300 },
  'premium': { min: 300, max: 10000 },
};

export default function FindMyCoverage({ onResults, onCategorySelect }: FindMyCoverageProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleOptionSelect = (stepId: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [stepId]: value }));
  };

  const handleNext = () => {
    if (currentStep < quizSteps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      void submitQuiz();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const submitQuiz = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Determine primary category from answers
      const priority = answers.priority ?? 'travel';
      const category = categoryMapping[priority] ?? 'travel';
      const budget = answers.budget ?? 'mid';
      const budgetRange = budgetRanges[budget] ?? { min: 50, max: 150 };

      // Fetch products for the recommended category
      const params = new URLSearchParams({
        category,
        minPrice: String(budgetRange.min),
        maxPrice: String(budgetRange.max),
        sortBy: 'rating',
      });

      const response = await fetch(`/api/v1/products?${params.toString()}`);
      const result = await response.json() as { success: boolean; data?: Product[]; error?: string };

      if (!response.ok || !result.success) {
        throw new Error(result.error ?? 'Failed to fetch recommendations');
      }

      const products = result.data ?? [];
      
      // Generate explanation based on answers
      const lifestyle = answers.lifestyle ?? 'nomad';
      const explanations: Record<string, string> = {
        health: `Based on your ${lifestyle} lifestyle, we recommend comprehensive health coverage that works across borders.`,
        travel: `As a ${lifestyle}, trip protection will help you handle unexpected changes and cancellations.`,
        property: `Your gear is your livelihood! We found coverage options to protect your electronics and equipment.`,
        liability: `Professional liability coverage is essential for ${lifestyle}s working with clients internationally.`,
      };

      const quizResult: QuizResult = {
        category,
        products: products.slice(0, 4),
        explanation: explanations[category] ?? 'Here are our top recommendations for you.',
      };

      onResults(quizResult);
      onCategorySelect(category);
      setIsOpen(false);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }, [answers, onResults, onCategorySelect]);

  const handleReset = () => {
    setCurrentStep(0);
    setAnswers({});
    setError(null);
    onResults(null);
  };

  const currentQuestion = quizSteps[currentStep];
  const currentAnswer = currentQuestion ? answers[currentQuestion.id] : undefined;
  const progress = ((currentStep + 1) / quizSteps.length) * 100;

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="group flex items-center gap-3 px-5 py-3 bg-gradient-to-r from-accent-500 to-accent-600 
                   text-white rounded-xl hover:from-accent-600 hover:to-accent-700 
                   transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
      >
        <Sparkles className="h-5 w-5" />
        <span className="font-semibold">Find My Coverage</span>
        <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
      </button>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-sand-200 shadow-xl overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-6 py-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Find Your Perfect Coverage
          </h3>
          <button
            onClick={() => setIsOpen(false)}
            className="text-primary-200 hover:text-white transition-colors text-sm"
          >
            Close
          </button>
        </div>
        
        {/* Progress Bar */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-2 bg-primary-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-accent-400 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-sm text-primary-200">
            {currentStep + 1}/{quizSteps.length}
          </span>
        </div>
      </div>

      {/* Question */}
      <div className="p-6">
        {currentQuestion && (
          <>
            <h4 className="text-xl font-display font-semibold text-sand-900 mb-6">
              {currentQuestion.question}
            </h4>

            <div className="grid grid-cols-2 gap-3 mb-6">
              {currentQuestion.options.map((option) => {
                const isSelected = currentAnswer === option.value;
                return (
                  <button
                    key={option.value}
                    onClick={() => handleOptionSelect(currentQuestion.id, option.value)}
                    className={`
                      relative p-4 rounded-xl border-2 text-left transition-all duration-200
                      ${isSelected
                        ? 'border-primary-500 bg-primary-50 shadow-md'
                        : 'border-sand-200 hover:border-sand-300 hover:bg-sand-50'
                      }
                    `}
                  >
                    {isSelected && (
                      <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary-500 flex items-center justify-center">
                        <Check className="h-3 w-3 text-white" />
                      </div>
                    )}
                    <div className="text-2xl mb-2">{option.icon}</div>
                    <div className="font-medium text-sand-900">{option.label}</div>
                    {option.description && (
                      <div className="text-xs text-sand-500 mt-1">{option.description}</div>
                    )}
                  </button>
                );
              })}
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                {error}
              </div>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between">
              <button
                onClick={handleBack}
                disabled={currentStep === 0}
                className="flex items-center gap-2 px-4 py-2 text-sand-600 hover:text-sand-900 
                           disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleReset}
                  className="flex items-center gap-1 px-3 py-2 text-sand-500 hover:text-sand-700 text-sm transition-colors"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  Reset
                </button>
                <Button
                  onClick={handleNext}
                  disabled={!currentAnswer || loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Finding...
                    </>
                  ) : currentStep === quizSteps.length - 1 ? (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Get Recommendations
                    </>
                  ) : (
                    <>
                      Next
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
