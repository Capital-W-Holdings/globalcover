'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Globe, Mail, Twitter, Linkedin, Instagram } from 'lucide-react';

const footerLinks = {
  Insurance: [
    { label: 'Travel Insurance', href: '/#insurance' },
    { label: 'Health Insurance', href: '/#insurance' },
    { label: 'Property Insurance', href: '/#insurance' },
    { label: 'Liability Insurance', href: '/#insurance' },
    { label: 'Compare All', href: '/#insurance' },
  ],
  Membership: [
    { label: 'Benefits Overview', href: '/join' },
    { label: 'Partner Deals', href: '/join' },
    { label: 'Pricing', href: '/join' },
    { label: 'Member Dashboard', href: '/dashboard' },
  ],
  Resources: [
    { label: 'Nomad Guides', href: null },
    { label: 'Insurance 101', href: null },
    { label: 'Country Guides', href: null },
    { label: 'Blog', href: null },
    { label: 'FAQ', href: null },
  ],
  Company: [
    { label: 'About Us', href: null },
    { label: 'Careers', href: null },
    { label: 'Press', href: null },
    { label: 'Contact', href: 'mailto:hello@globalcover.com' },
  ],
};

export default function Footer() {
  const pathname = usePathname();

  // Don't render on dashboard, login, or admin pages
  if (pathname.startsWith('/dashboard') || pathname.startsWith('/login') || pathname.startsWith('/admin')) {
    return null;
  }

  return (
    <footer className="bg-sand-950 text-sand-300">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 lg:gap-12">
          {/* Brand Column */}
          <div className="col-span-2 md:col-span-3 lg:col-span-2">
            <Link href="/" className="flex items-center gap-2.5 mb-6">
              <div className="bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl p-2">
                <Globe className="h-6 w-6 text-white" />
              </div>
              <span className="font-display text-xl font-bold text-white">
                Global<span className="text-primary-400">Cover</span>
              </span>
            </Link>
            <p className="text-sand-400 mb-6 max-w-sm">
              The insurance marketplace built for digital nomads and global citizens. 
              Compare, purchase, and manage all your coverage in one place.
            </p>
            <div className="flex items-center gap-4">
              <a 
                href="https://twitter.com" 
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-sand-800 hover:bg-sand-700 rounded-lg transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a 
                href="https://linkedin.com" 
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-sand-800 hover:bg-sand-700 rounded-lg transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin className="h-5 w-5" />
              </a>
              <a 
                href="https://instagram.com" 
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-sand-800 hover:bg-sand-700 rounded-lg transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a 
                href="mailto:hello@globalcover.com" 
                className="p-2 bg-sand-800 hover:bg-sand-700 rounded-lg transition-colors"
                aria-label="Email"
              >
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Link Columns */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h3 className="font-semibold text-white mb-4">{title}</h3>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    {link.href ? (
                      <Link 
                        href={link.href}
                        className="hover:text-white transition-colors"
                      >
                        {link.label}
                      </Link>
                    ) : (
                      <span className="text-sand-500 cursor-not-allowed">
                        {link.label} <span className="text-xs">(Soon)</span>
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-sand-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-sand-500">
              © {new Date().getFullYear()} GlobalCover. All rights reserved.
            </p>
            <div className="flex items-center gap-6 text-sm">
              <span className="text-sand-600 cursor-not-allowed">
                Privacy Policy
              </span>
              <span className="text-sand-600 cursor-not-allowed">
                Terms of Service
              </span>
              <span className="text-sand-600 cursor-not-allowed">
                Cookie Policy
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
