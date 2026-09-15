'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Utensils,
  LayoutDashboard,
  Users,
  CreditCard,
  History,
  BarChart3,
  Settings,
  X,
} from 'lucide-react';

const NAV_ITEMS = [
  {
    name: 'Meal Counter',
    href: '/counter',
    icon: Utensils,
    primary: true,
  },
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    name: 'Customers',
    href: '/customers',
    icon: Users,
  },
  {
    name: 'Subscriptions',
    href: '/subscriptions',
    icon: CreditCard,
  },
  {
    name: 'Meal History',
    href: '/history',
    icon: History,
  },
  {
    name: 'Reports',
    href: '/reports',
    icon: BarChart3,
  },
  {
    name: 'Settings',
    href: '/settings',
    icon: Settings,
  },
];

export default function Sidebar({ mobileOpen, setMobileOpen, user }) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[240px] flex-col border-r border-slate-200 bg-white transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header / Brand */}
        <div className="flex h-16 items-center justify-between border-b border-slate-100 px-5">
          <Link href="/counter" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#3525CD] text-white shadow-sm shadow-indigo-500/20">
              <Utensils className="h-5 w-5" />
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-slate-900">
                Meal<span className="text-[#3525CD]">Track</span>
              </span>
              <span className="ml-1.5 rounded bg-indigo-50 px-1.5 py-0.5 text-[10px] font-bold text-[#3525CD]">
                V2
              </span>
            </div>
          </Link>
          <button
            onClick={() => setMobileOpen(false)}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 space-y-1.5 px-3 py-4 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-all ${
                  isActive
                    ? item.primary
                      ? 'bg-[#3525CD] text-white shadow-md shadow-indigo-600/20'
                      : 'bg-indigo-50 text-[#3525CD]'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <Icon
                  className={`h-4.5 w-4.5 ${
                    isActive ? (item.primary ? 'text-white' : 'text-[#3525CD]') : 'text-slate-400'
                  }`}
                />
                <span>{item.name}</span>
                {item.primary && !isActive && (
                  <span className="ml-auto rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                    POS
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Provider Profile Box Footer */}
        <div className="border-t border-slate-100 p-3.5">
          <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-2.5">
            <img
              src="/avatar.png"
              alt="Avatar"
              className="h-9 w-9 rounded-lg object-cover ring-2 ring-indigo-500/20"
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-bold text-slate-900">
                {user?.providerName || 'Anand Meals'}
              </p>
              <div className="flex items-center gap-1.5">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
                <span className="truncate text-[11px] font-medium text-slate-500">
                  {user?.name || 'Operator'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
