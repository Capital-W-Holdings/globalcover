import { products } from '@/data/products';
import type { Product, InsuranceCategory } from '@/types';

interface RecommendationResult {
  products: Product[];
  suggestedCategory: InsuranceCategory | null;
  confidence: 'high' | 'medium' | 'low';
  explanation: string;
}

// Keyword mappings for different insurance categories
const categoryKeywords: Record<InsuranceCategory, string[]> = {
  travel: [
    'travel', 'trip', 'vacation', 'abroad', 'overseas', 'flight', 'nomad', 
    'backpack', 'adventure', 'explore', 'world', 'countries', 'international',
    'luggage', 'baggage', 'delay', 'cancel', 'medical abroad', 'emergency abroad'
  ],
  health: [
    'health', 'medical', 'doctor', 'hospital', 'prescription', 'expat', 
    'chronic', 'dental', 'vision', 'mental', 'therapy', 'wellness',
    'coverage', 'insurance abroad', 'international health', 'global health'
  ],
  property: [
    'property', 'home', 'apartment', 'rent', 'tenant', 'belongings', 
    'electronics', 'laptop', 'gear', 'equipment', 'theft', 'damage',
    'contents', 'personal items', 'tech', 'camera', 'drone'
  ],
  liability: [
    'liability', 'business', 'professional', 'freelance', 'contractor', 
    'errors', 'omissions', 'lawsuit', 'client', 'cyber', 'data breach',
    'D&O', 'directors', 'officers', 'company', 'startup'
  ],
  life: [
    'life', 'death', 'family', 'dependents', 'kids', 'children', 'spouse',
    'mortgage', 'term', 'whole life', 'beneficiary', 'estate', 'inheritance'
  ],
  vehicle: [
    'car', 'vehicle', 'auto', 'motorcycle', 'bike', 'rv', 'camper', 'van',
    'rental car', 'driving', 'road trip', 'mileage'
  ],
};

// Persona mappings for better recommendations
const personaKeywords: Record<string, { categories: InsuranceCategory[]; products: string[] }> = {
  'digital nomad': {
    categories: ['travel', 'health'],
    products: ['travel-001', 'travel-005', 'health-006', 'property-002'],
  },
  'remote worker': {
    categories: ['health', 'liability'],
    products: ['health-001', 'liability-001', 'property-002'],
  },
  'freelancer': {
    categories: ['liability', 'health'],
    products: ['liability-001', 'liability-004', 'health-004'],
  },
  'expat': {
    categories: ['health', 'life'],
    products: ['health-001', 'health-002', 'life-004'],
  },
  'backpacker': {
    categories: ['travel'],
    products: ['travel-002', 'travel-004'],
  },
  'adventurer': {
    categories: ['travel'],
    products: ['travel-002', 'travel-006'],
  },
  'family': {
    categories: ['health', 'life'],
    products: ['health-001', 'health-002', 'life-001', 'life-002'],
  },
  'startup founder': {
    categories: ['liability'],
    products: ['liability-005', 'liability-003', 'liability-001'],
  },
  'content creator': {
    categories: ['property', 'liability'],
    products: ['property-002', 'liability-001'],
  },
  'van lifer': {
    categories: ['vehicle', 'health'],
    products: ['vehicle-004', 'health-006', 'travel-001'],
  },
};

function normalizeQuery(query: string): string {
  return query.toLowerCase().trim();
}

function findMatchingCategories(query: string): { category: InsuranceCategory; score: number }[] {
  const normalizedQuery = normalizeQuery(query);
  const scores: { category: InsuranceCategory; score: number }[] = [];

  for (const [category, keywords] of Object.entries(categoryKeywords)) {
    let score = 0;
    for (const keyword of keywords) {
      if (normalizedQuery.includes(keyword)) {
        // Longer keyword matches get higher scores
        score += keyword.length;
      }
    }
    if (score > 0) {
      scores.push({ category: category as InsuranceCategory, score });
    }
  }

  return scores.sort((a, b) => b.score - a.score);
}

function findMatchingPersona(query: string): { persona: string; match: typeof personaKeywords[string] } | null {
  const normalizedQuery = normalizeQuery(query);
  
  for (const [persona, match] of Object.entries(personaKeywords)) {
    if (normalizedQuery.includes(persona)) {
      return { persona, match };
    }
  }
  
  // Check for partial matches
  const partialMatches: Record<string, string[]> = {
    'digital nomad': ['nomad', 'location independent', 'work remotely', 'work abroad'],
    'remote worker': ['remote', 'wfh', 'work from home', 'distributed'],
    'freelancer': ['freelance', 'self-employed', 'independent contractor', 'consultant'],
    'expat': ['expatriate', 'living abroad', 'moved overseas', 'relocate'],
    'backpacker': ['backpacking', 'budget travel', 'hostel'],
    'adventurer': ['adventure', 'extreme sports', 'outdoor', 'hiking', 'climbing'],
    'family': ['wife', 'husband', 'kids', 'children', 'spouse', 'partner'],
    'startup founder': ['startup', 'founder', 'entrepreneur', 'ceo', 'co-founder'],
    'content creator': ['youtube', 'influencer', 'blogger', 'photographer', 'videographer'],
    'van lifer': ['van life', 'campervan', 'rv life', 'full-time rv'],
  };

  for (const [persona, aliases] of Object.entries(partialMatches)) {
    for (const alias of aliases) {
      if (normalizedQuery.includes(alias)) {
        const match = personaKeywords[persona];
        if (match) {
          return { persona, match };
        }
      }
    }
  }

  return null;
}

function scoreProduct(product: Product, query: string): number {
  const normalizedQuery = normalizeQuery(query);
  let score = 0;

  // Check name match
  if (normalizedQuery.includes(product.name.toLowerCase())) {
    score += 50;
  }

  // Check provider match
  if (normalizedQuery.includes(product.provider.toLowerCase())) {
    score += 30;
  }

  // Check description match
  const descWords = normalizedQuery.split(/\s+/);
  for (const word of descWords) {
    if (word.length > 3 && product.description.toLowerCase().includes(word)) {
      score += 5;
    }
  }

  // Check bestFor match
  for (const target of product.bestFor) {
    if (normalizedQuery.includes(target.toLowerCase())) {
      score += 20;
    }
  }

  // Check features match
  for (const feature of product.features) {
    for (const word of descWords) {
      if (word.length > 3 && feature.toLowerCase().includes(word)) {
        score += 3;
      }
    }
  }

  // Boost by rating
  score += product.rating * 2;

  return score;
}

export function getRecommendations(query: string, limit: number = 5): RecommendationResult {
  if (!query || query.trim().length < 3) {
    return {
      products: products.slice(0, limit),
      suggestedCategory: null,
      confidence: 'low',
      explanation: 'Please provide more details about your insurance needs.',
    };
  }

  const normalizedQuery = normalizeQuery(query);
  
  // Check for persona match first
  const personaMatch = findMatchingPersona(normalizedQuery);
  
  if (personaMatch) {
    const { persona, match } = personaMatch;
    const recommendedProducts = match.products
      .map((id) => products.find((p) => p.id === id))
      .filter((p): p is Product => p !== undefined)
      .slice(0, limit);

    if (recommendedProducts.length > 0) {
      return {
        products: recommendedProducts,
        suggestedCategory: match.categories[0] ?? null,
        confidence: 'high',
        explanation: `Based on your profile as a ${persona}, I recommend these insurance products that are popular with similar users.`,
      };
    }
  }

  // Check for category matches
  const categoryMatches = findMatchingCategories(normalizedQuery);
  
  if (categoryMatches.length > 0) {
    const primaryCategory = categoryMatches[0];
    if (primaryCategory) {
      const categoryProducts = products
        .filter((p) => p.category === primaryCategory.category)
        .map((p) => ({ product: p, score: scoreProduct(p, query) }))
        .sort((a, b) => b.score - a.score)
        .map((item) => item.product)
        .slice(0, limit);

      const confidence = primaryCategory.score > 10 ? 'high' : primaryCategory.score > 5 ? 'medium' : 'low';

      return {
        products: categoryProducts,
        suggestedCategory: primaryCategory.category,
        confidence,
        explanation: `I found ${categoryProducts.length} ${primaryCategory.category} insurance options that match your needs.`,
      };
    }
  }

  // Fall back to general scoring
  const scoredProducts = products
    .map((p) => ({ product: p, score: scoreProduct(p, query) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  const topScore = scoredProducts[0]?.score ?? 0;
  const confidence = topScore > 30 ? 'high' : topScore > 15 ? 'medium' : 'low';

  return {
    products: scoredProducts.map((item) => item.product),
    suggestedCategory: scoredProducts[0]?.product.category ?? null,
    confidence,
    explanation: confidence === 'low'
      ? "I found some options that might be relevant. Try being more specific about your needs."
      : `Here are the top ${scoredProducts.length} insurance products based on your search.`,
  };
}

export function getSimilarProducts(productId: string, limit: number = 3): Product[] {
  const product = products.find((p) => p.id === productId);
  if (!product) return [];

  // Find products in the same category, excluding the current product
  const sameCategory = products
    .filter((p) => p.category === product.category && p.id !== productId)
    .sort((a, b) => b.rating - a.rating)
    .slice(0, limit);

  return sameCategory;
}
