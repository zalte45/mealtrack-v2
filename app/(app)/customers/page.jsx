'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Users,
  Search,
  Plus,
  Edit,
  Archive,
  RotateCcw,
  CreditCard,
  Phone,
  Mail,
  Loader2,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import CustomerModal from '@/components/customers/CustomerModal';

export default function CustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('ACTIVE');
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/customers?search=${encodeURIComponent(search)}&filter=${filter}`);
      const data = await res.json();
      if (res.ok) {
        setCustomers(data.customers || []);
      }
    } catch (err) {
      console.error('Failed to fetch customers:', err);
    } finally {
      setLoading(false);
    }
  }, [search, filter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCustomers();
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchCustomers]);

  const handleArchiveToggle = async (customer) => {
    const action = customer.isArchived ? 'restore' : 'archive';
    if (!confirm(`Are you sure you want to ${action} customer "${customer.name}" (#${customer.memberId})?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/customers/${customer.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isArchived: !customer.isArchived }),
      });

      if (res.ok) {
        fetchCustomers();
      }
    } catch (err) {
      alert(`Failed to ${action} customer.`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Customer Directory
          </h1>
          <p className="text-sm font-medium text-slate-500">
            Manage provider customers, permanent 4-digit Member IDs & subscription status
          </p>
        </div>
        <button
          onClick={() => {
            setEditingCustomer(null);
            setIsModalOpen(true);
          }}
          className="flex items-center justify-center gap-2 rounded-xl bg-[#3525CD] px-4 py-2.5 text-sm font-bold text-white shadow-md shadow-indigo-600/20 hover:bg-[#2A1DB5]"
        >
          <Plus className="h-4 w-4" />
          <span>Add Customer</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        {/* Search Bar */}
        <div className="relative flex-1 max-w-md">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
            <Search className="h-4 w-4" />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by 4-digit ID (e.g. 1001), name, or phone..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-10 pr-4 py-2 text-sm text-slate-900 focus:border-[#3525CD] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3525CD]/20"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 p-1">
          {['ACTIVE', 'ALL', 'ARCHIVED'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                filter === f
                  ? 'bg-white text-[#3525CD] shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Customer Directory List */}
      {loading ? (
        <div className="flex h-64 items-center justify-center rounded-2xl border border-slate-200 bg-white">
          <Loader2 className="h-8 w-8 animate-spin text-[#3525CD]" />
        </div>
      ) : customers.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-50 text-[#3525CD]">
            <Users className="h-6 w-6" />
          </div>
          <h3 className="mt-3 text-base font-bold text-slate-900">No Customers Found</h3>
          <p className="mt-1 text-sm text-slate-500 max-w-sm">
            {search
              ? 'No matching customer record found for your search query.'
              : 'Add your first customer to generate Member ID #1001.'}
          </p>
          <button
            onClick={() => {
              setEditingCustomer(null);
              setIsModalOpen(true);
            }}
            className="mt-4 flex items-center gap-2 rounded-xl bg-[#3525CD] px-4 py-2 text-xs font-bold text-white"
          >
            <Plus className="h-4 w-4" />
            <span>Add First Customer</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {customers.map((cust) => (
            <div
              key={cust.id}
              className={`stitch-card flex flex-col justify-between p-5 ${
                cust.isArchived ? 'opacity-65 bg-slate-50/80' : ''
              }`}
            >
              <div className="space-y-3">
                {/* ID Badge + Name */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="inline-flex items-center justify-center rounded-xl bg-[#3525CD] px-2.5 py-1 text-xs font-extrabold text-white shadow-sm shadow-indigo-600/30">
                      #{cust.memberId}
                    </span>
                    <div>
                      <h4 className="text-base font-bold text-slate-900 leading-tight">
                        {cust.name}
                      </h4>
                      <p className="flex items-center gap-1 text-xs text-slate-500 mt-0.5">
                        <Phone className="h-3 w-3 text-slate-400" />
                        <span>{cust.mobile}</span>
                      </p>
                    </div>
                  </div>

                  {cust.isArchived && (
                    <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[10px] font-bold text-slate-700">
                      Archived
                    </span>
                  )}
                </div>

                {/* Email & Notes */}
                {(cust.email || cust.notes) && (
                  <div className="space-y-1 text-xs text-slate-600">
                    {cust.email && (
                      <p className="flex items-center gap-1.5 truncate">
                        <Mail className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{cust.email}</span>
                      </p>
                    )}
                    {cust.notes && (
                      <p className="rounded-lg bg-slate-50 p-2 text-[11px] font-medium text-slate-600 italic">
                        &quot;{cust.notes}&quot;
                      </p>
                    )}
                  </div>
                )}

                {/* Active Subscription Status Banner */}
                <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-500">Subscription Status</span>
                    {cust.activeSubStatus === 'ACTIVE' ? (
                      <span className="flex items-center gap-1 font-bold text-emerald-600">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        ACTIVE
                      </span>
                    ) : cust.activeSubStatus === 'EXHAUSTED' || cust.activeSubStatus === 'EXPIRED' ? (
                      <span className="flex items-center gap-1 font-bold text-amber-600">
                        <AlertTriangle className="h-3.5 w-3.5" />
                        {cust.activeSubStatus}
                      </span>
                    ) : (
                      <span className="font-semibold text-slate-400">None Active</span>
                    )}
                  </div>

                  {cust.latestSubscription && (
                    <div className="mt-2 flex items-center justify-between border-t border-slate-200/60 pt-2 text-xs">
                      <span className="truncate font-medium text-slate-700">
                        {cust.latestSubscription.planName}
                      </span>
                      <span className="font-extrabold text-[#3525CD]">
                        {cust.remainingBalance !== null ? `${cust.remainingBalance} left` : ''}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions Footer */}
              <div className="mt-4 flex items-center justify-end gap-2 border-t border-slate-100 pt-3">
                <button
                  onClick={() => {
                    setEditingCustomer(cust);
                    setIsModalOpen(true);
                  }}
                  className="flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  <Edit className="h-3.5 w-3.5" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => handleArchiveToggle(cust)}
                  className={`flex items-center gap-1 rounded-lg border px-3 py-1.5 text-xs font-semibold ${
                    cust.isArchived
                      ? 'border-emerald-200 text-emerald-700 hover:bg-emerald-50'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {cust.isArchived ? (
                    <>
                      <RotateCcw className="h-3.5 w-3.5" />
                      <span>Restore</span>
                    </>
                  ) : (
                    <>
                      <Archive className="h-3.5 w-3.5" />
                      <span>Archive</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Customer Modal */}
      <CustomerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchCustomers}
        initialData={editingCustomer}
      />
    </div>
  );
}
