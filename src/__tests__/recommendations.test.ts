/**
 * AI Recommendations Tests
 */

import { getRecommendations, getSimilarProducts } from '../lib/ai/recommendations';

describe('AI Recommendations', () => {
  describe('getRecommendations', () => {
    test('returns products for short query with low confidence', () => {
      const result = getRecommendations('hi', 5);
      expect(result.confidence).toBe('low');
      expect(result.products.length).toBeGreaterThan(0);
      expect(result.explanation).toContain('more details');
    });

    test('finds travel insurance for "nomad" query', () => {
      const result = getRecommendations('digital nomad insurance', 5);
      expect(result.confidence).toBe('high');
      expect(result.suggestedCategory).toBe('travel');
      expect(result.products.some(p => p.category === 'travel')).toBe(true);
    });

    test('finds health insurance for "medical" query', () => {
      const result = getRecommendations('need medical coverage', 5);
      expect(result.suggestedCategory).toBe('health');
    });

    test('finds liability insurance for "freelancer" persona', () => {
      const result = getRecommendations('freelancer insurance options', 5);
      expect(result.confidence).toBe('high');
      expect(['liability', 'health']).toContain(result.suggestedCategory);
    });

    test('respects limit parameter', () => {
      const result = getRecommendations('travel insurance', 3);
      expect(result.products.length).toBeLessThanOrEqual(3);
    });

    test('handles empty query', () => {
      const result = getRecommendations('', 5);
      expect(result.confidence).toBe('low');
      expect(result.products.length).toBeGreaterThan(0);
    });

    test('finds property insurance for "laptop" query', () => {
      const result = getRecommendations('protect my laptop and electronics', 5);
      expect(result.suggestedCategory).toBe('property');
    });

    test('handles multi-word persona matches', () => {
      const result = getRecommendations('startup founder liability', 5);
      expect(result.confidence).toBe('high');
      expect(result.suggestedCategory).toBe('liability');
    });

    test('matches by product provider name', () => {
      const result = getRecommendations('SafetyWing', 5);
      expect(result.products.some(p => 
        p.provider.toLowerCase().includes('safetywing')
      )).toBe(true);
    });
  });

  describe('getSimilarProducts', () => {
    test('returns empty for non-existent product', () => {
      const result = getSimilarProducts('fake-id-123');
      expect(result).toEqual([]);
    });

    test('returns products in same category', () => {
      // Assuming travel-001 exists
      const result = getSimilarProducts('travel-001', 3);
      expect(result.length).toBeLessThanOrEqual(3);
      result.forEach(product => {
        expect(product.category).toBe('travel');
        expect(product.id).not.toBe('travel-001');
      });
    });

    test('respects limit parameter', () => {
      const result = getSimilarProducts('travel-001', 2);
      expect(result.length).toBeLessThanOrEqual(2);
    });

    test('sorts by rating descending', () => {
      const result = getSimilarProducts('travel-001', 5);
      if (result.length > 1) {
        for (let i = 0; i < result.length - 1; i++) {
          const current = result[i];
          const next = result[i + 1];
          if (current && next) {
            expect(current.rating).toBeGreaterThanOrEqual(next.rating);
          }
        }
      }
    });
  });
});
