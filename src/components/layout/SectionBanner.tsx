import type { ReactNode } from 'react';

interface SectionBannerProps {
  id?: string;
  title: string;
  subtitle: string;
  icon: ReactNode;
  accentColor?: 'primary' | 'accent';
}

export default function SectionBanner({ 
  id,
  title, 
  subtitle, 
  icon,
  accentColor = 'primary' 
}: SectionBannerProps) {
  const gradients = {
    primary: 'from-primary-600 to-primary-800',
    accent: 'from-accent-500 to-accent-700',
  };

  const bgGradients = {
    primary: 'from-primary-50 to-white',
    accent: 'from-accent-50 to-white',
  };

  return (
    <div 
      id={id}
      className={`relative py-8 lg:py-10 bg-gradient-to-b ${bgGradients[accentColor]} overflow-hidden`}
    >
      {/* Decorative background */}
      <div className="absolute inset-0">
        <div 
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, currentColor 1px, transparent 1px)`,
            backgroundSize: '32px 32px',
          }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Icon */}
        <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br ${gradients[accentColor]} text-white mb-4 shadow-lg`}>
          {icon}
        </div>

        {/* Title */}
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-display font-medium text-sand-900 mb-2">
          {title}
        </h2>

        {/* Subtitle */}
        <p className="text-base sm:text-lg text-sand-700 max-w-2xl mx-auto font-light">
          {subtitle}
        </p>
      </div>
    </div>
  );
}
