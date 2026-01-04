'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  ClipboardList, 
  Activity, 
  LogOut,
  Shield,
  Menu,
  X
} from 'lucide-react';
import { useState } from 'react';
import { useAdminAuth } from './AdminAuthContext';

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
}

const navigation: NavItem[] = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Leads', href: '/admin/leads', icon: ClipboardList },
  { name: 'Waitlist', href: '/admin/waitlist', icon: Users },
  { name: 'System Health', href: '/admin/health', icon: Activity },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const { logout } = useAdminAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const NavContent = () => (
    <>
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-6 border-b border-sand-200">
        <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center">
          <Shield className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="font-bold text-sand-900">GlobalCover</h1>
          <p className="text-xs text-sand-500">Admin Panel</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href || 
            (item.href !== '/admin' && pathname.startsWith(item.href));
          
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => setMobileMenuOpen(false)}
              className={`
                flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors
                ${isActive 
                  ? 'bg-primary-50 text-primary-700' 
                  : 'text-sand-600 hover:bg-sand-100 hover:text-sand-900'
                }
              `}
            >
              <item.icon className={`h-5 w-5 ${isActive ? 'text-primary-600' : 'text-sand-400'}`} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-sand-200">
        <button
          onClick={() => {
            logout();
            setMobileMenuOpen(false);
          }}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-sand-600 hover:bg-red-50 hover:text-red-700 transition-colors"
        >
          <LogOut className="h-5 w-5" />
          Sign Out
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 bg-white rounded-xl shadow-lg border border-sand-200"
        >
          {mobileMenuOpen ? (
            <X className="h-6 w-6 text-sand-600" />
          ) : (
            <Menu className="h-6 w-6 text-sand-600" />
          )}
        </button>
      </div>

      {/* Mobile overlay */}
      {mobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <aside className={`
        lg:hidden fixed inset-y-0 left-0 z-40 w-72 bg-white shadow-xl transform transition-transform duration-300
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          <NavContent />
        </div>
      </aside>

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-72 lg:fixed lg:inset-y-0 bg-white border-r border-sand-200">
        <NavContent />
      </aside>
    </>
  );
}
