'use client';

import { useState, useEffect } from 'react';
import { Globe, Shield, Zap, ArrowRight, Check, Star, TrendingUp } from 'lucide-react';
import Button from '../ui/Button';
import WaitlistModal from '../forms/WaitlistModal';

const heroFeatures = [
  'Compare 30+ insurance products',
  'Exclusive member benefits',
  'AI-powered recommendations',
];

// Real testimonials for social proof
const testimonials = [
  { name: 'Sarah K.', location: 'Lisbon', text: 'Finally, insurance that gets nomads!', avatar: 'S' },
  { name: 'Marcus T.', location: 'Bali', text: 'Saved $200/month on health coverage', avatar: 'M' },
  { name: 'Elena R.', location: 'Mexico City', text: 'Best comparison tool I\'ve found', avatar: 'E' },
];

export default function Hero() {
  const [showWaitlist, setShowWaitlist] = useState(false);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  // Rotate testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const scrollToInsurance = () => {
    document.getElementById('insurance')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      <section className="relative min-h-[65vh] lg:min-h-[60vh] flex items-center overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-sand-50 via-white to-primary-50">
          <div className="absolute top-10 right-10 w-48 h-48 bg-primary-200/20 rounded-full blur-3xl" />
          <div className="absolute bottom-10 left-10 w-64 h-64 bg-accent-200/15 rounded-full blur-3xl" />
          
          <div 
            className="absolute inset-0 opacity-[0.02]"
            style={{
              backgroundImage: `linear-gradient(to right, #0b3f6d 1px, transparent 1px),
                               linear-gradient(to bottom, #0b3f6d 1px, transparent 1px)`,
              backgroundSize: '60px 60px',
            }}
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-12 lg:py-10">
          <div className="grid lg:grid-cols-2 gap-6 lg:gap-10 items-center">
            {/* Left Column - Content */}
            <div className="space-y-3 lg:space-y-4">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary-100 text-primary-700 rounded-full text-sm font-normal">
                <Zap className="h-3.5 w-3.5" />
                <span>Built for Digital Nomads & Expats</span>
              </div>

              {/* Headline */}
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-medium text-sand-900 leading-tight">
                Insurance That{' '}
                <span className="relative whitespace-nowrap">
                  <span className="relative z-10 text-primary-600">Travels</span>
                  <span className="absolute bottom-1 sm:bottom-2 left-0 right-0 h-2 sm:h-3 bg-primary-200/60 -rotate-1" />
                </span>{' '}
                With You
              </h1>

              {/* Subheadline */}
              <p className="text-base lg:text-lg text-sand-800 max-w-xl font-light">
                The only insurance marketplace designed for location-independent professionals. 
                Compare, purchase, and manage coverage from anywhere in the world.
              </p>

              {/* Features List - Compact */}
              <div className="flex flex-wrap gap-x-4 gap-y-1.5">
                {heroFeatures.map((feature) => (
                  <div key={feature} className="flex items-center gap-1.5 text-sand-800 text-sm font-light">
                    <div className="flex-shrink-0 w-4 h-4 rounded-full bg-primary-100 flex items-center justify-center">
                      <Check className="h-2.5 w-2.5 text-primary-600" />
                    </div>
                    <span>{feature}</span>
                  </div>
                ))}
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-1">
                <Button 
                  size="lg" 
                  onClick={() => setShowWaitlist(true)}
                  className="group w-full sm:w-auto justify-center"
                >
                  Join the Waitlist
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button 
                  variant="outline" 
                  size="lg"
                  onClick={scrollToInsurance}
                  className="w-full sm:w-auto justify-center"
                >
                  Explore Insurance
                </Button>
              </div>

              {/* Social Proof - Compact */}
              <div className="flex items-center gap-4">
                <div className="flex -space-x-2">
                  {['S', 'M', 'E', 'J'].map((letter, i) => (
                    <div
                      key={i}
                      className="w-7 h-7 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-xs font-medium border-2 border-white"
                    >
                      {letter}
                    </div>
                  ))}
                </div>
                <div className="text-sm text-sand-800 font-light">
                  <span className="font-medium text-sand-900">2,500+</span>
                  {' '}nomads on waitlist
                </div>
                <div className="hidden sm:flex items-center gap-1 text-sm text-sand-700 font-light">
                  <span className="w-1 h-1 rounded-full bg-sand-400" />
                  <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                  4.9 rating
                </div>
              </div>
            </div>

            {/* Right Column - Compact Visual */}
            <div className="relative hidden lg:block">
              <div className="relative h-[340px]">
                {/* Main Card */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 bg-white rounded-2xl shadow-xl p-4 animate-fade-in">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
                      <Globe className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-medium text-sand-900 text-sm">GlobalCover</h3>
                      <p className="text-xs text-sand-700 font-light">Your Insurance Hub</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="p-2.5 bg-sand-50 rounded-lg">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-sand-800 font-light">Travel Insurance</span>
                        <span className="text-xs font-medium text-primary-600">Active</span>
                      </div>
                      <div className="h-1 bg-sand-200 rounded-full overflow-hidden">
                        <div className="h-full w-3/4 bg-primary-500 rounded-full" />
                      </div>
                    </div>
                    <div className="p-2.5 bg-sand-50 rounded-lg">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-sand-800 font-light">Health Coverage</span>
                        <span className="text-xs font-medium text-accent-600">Pending</span>
                      </div>
                      <div className="h-1 bg-sand-200 rounded-full overflow-hidden">
                        <div className="h-full w-1/2 bg-accent-500 rounded-full" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating Card - Top Right */}
                <div 
                  className="absolute top-0 right-0 bg-white rounded-lg shadow-lg p-2.5 animate-slide-up"
                  style={{ animationDelay: '0.2s' }}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-green-100 flex items-center justify-center">
                      <Shield className="h-3.5 w-3.5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-sand-900">Coverage Active</p>
                      <p className="text-xs text-sand-700 font-light">180+ countries</p>
                    </div>
                  </div>
                </div>

                {/* Floating Card - Bottom Left */}
                <div 
                  className="absolute bottom-4 left-0 bg-white rounded-lg shadow-lg p-2.5 animate-slide-up"
                  style={{ animationDelay: '0.4s' }}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-accent-100 flex items-center justify-center">
                      <TrendingUp className="h-3.5 w-3.5 text-accent-600" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-sand-900">$127 saved</p>
                      <p className="text-xs text-sand-700 font-light">This month</p>
                    </div>
                  </div>
                </div>

                {/* Testimonial Card - Bottom Right */}
                <div 
                  className="absolute bottom-0 right-0 bg-white rounded-lg shadow-lg p-2.5 max-w-[160px] animate-slide-up"
                  style={{ animationDelay: '0.6s' }}
                >
                  <div className="flex items-center gap-0.5 mb-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} className="h-2 w-2 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-xs text-sand-800 font-light mb-0.5">
                    &ldquo;{testimonials[currentTestimonial]?.text ?? 'Great service!'}&rdquo;
                  </p>
                  <p className="text-xs text-sand-700 font-light">
                    {testimonials[currentTestimonial]?.name ?? 'User'}
                  </p>
                </div>
              </div>
            </div>

            {/* Mobile Stats - Compact */}
            <div className="lg:hidden grid grid-cols-3 gap-2">
              <div className="bg-white rounded-lg p-2 text-center shadow-sm border border-sand-100">
                <div className="text-base font-medium text-primary-600">30+</div>
                <div className="text-xs text-sand-700 font-light">Products</div>
              </div>
              <div className="bg-white rounded-lg p-2 text-center shadow-sm border border-sand-100">
                <div className="text-base font-medium text-primary-600">180+</div>
                <div className="text-xs text-sand-700 font-light">Countries</div>
              </div>
              <div className="bg-white rounded-lg p-2 text-center shadow-sm border border-sand-100">
                <div className="text-base font-medium text-primary-600">40%</div>
                <div className="text-xs text-sand-700 font-light">Avg Savings</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <WaitlistModal 
        isOpen={showWaitlist} 
        onClose={() => setShowWaitlist(false)} 
      />
    </>
  );
}
