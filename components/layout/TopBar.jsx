'use client';

import { signOut } from 'next-auth/react';
import { Menu, LogOut, ShieldCheck, UserCheck } from 'lucide-react';

export default function TopBar({ setMobileOpen, user }) {
  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/80 px-4 backdrop-blur-md sm:px-6 lg:px-8">
      {/* Left: Mobile Toggle & Page Info */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setMobileOpen(true)}
          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="hidden sm:block">
          <p className="text-xs font-semibold text-slate-500">Provider Account</p>
          <p className="text-sm font-bold text-slate-900">
            {user?.providerName || 'Anand Meals & Mess Services'}
          </p>
        </div>
      </div>

      {/* Right: Role indicator badge, Operator info & Logout */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50/80 px-3 py-1 text-xs font-bold text-[#3525CD]">
          {user?.role === 'OWNER' || user?.role === 'ADMIN' ? (
            <ShieldCheck className="h-3.5 w-3.5 text-[#3525CD]" />
          ) : (
            <UserCheck className="h-3.5 w-3.5 text-[#3525CD]" />
          )}
          <span>{user?.role || 'STAFF'}</span>
        </div>

        <div className="hidden items-center gap-2.5 md:flex">
          <img
            src="/avatar.png"
            alt="User avatar"
            className="h-8 w-8 rounded-full border border-slate-200 object-cover"
          />
          <div className="text-left">
            <p className="text-xs font-bold text-slate-900 leading-tight">
              {user?.name || 'Operator'}
            </p>
            <p className="text-[11px] font-medium text-slate-500 leading-tight">
              {user?.email || 'operator@mealtrack.com'}
            </p>
          </div>
        </div>

        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 hover:text-red-600"
          title="Sign out of provider session"
        >
          <LogOut className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
}
