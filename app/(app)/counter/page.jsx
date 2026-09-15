'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import {
  Utensils,
  Search,
  CheckCircle2,
  AlertCircle,
  Clock,
  Delete,
  CornerDownLeft,
  RotateCcw,
  Sparkles,
  Loader2,
  Volume2,
  VolumeX,
} from 'lucide-react';

export default function MealCounterPage() {
  const [memberIdInput, setMemberIdInput] = useState('');
  const [lookupResult, setLookupResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [recording, setRecording] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successToast, setSuccessToast] = useState(null);

  // Meal type selection
  const [selectedMealType, setSelectedMealType] = useState('LUNCH');
  const [chimeEnabled, setChimeEnabled] = useState(true);

  // Recent activity stream
  const [recentActivity, setRecentActivity] = useState([]);

  const inputRef = useRef(null);

  // Focus input automatically
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Audio Chime synthesizer for meal confirmation feedback
  const playChime = useCallback(() => {
    if (!chimeEnabled) return;
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5

      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } catch (e) {
      // Audio context error fallback
    }
  }, [chimeEnabled]);

  // Handle member ID lookup
  const handleLookup = useCallback(
    async (idToLookup) => {
      const cleanId = (idToLookup || memberIdInput).trim();
      if (!/^\d{4}$/.test(cleanId)) {
        setErrorMsg('Please enter a valid 4-digit Member ID (e.g. 1001)');
        setLookupResult(null);
        return;
      }

      setLoading(true);
      setErrorMsg('');
      setLookupResult(null);

      try {
        const res = await fetch(`/api/counter/lookup?memberId=${cleanId}`);
        const data = await res.json();

        if (!res.ok || !data.success) {
          setErrorMsg(data.message || 'Lookup failed.');
          setLookupResult(null);
        } else {
          setLookupResult(data);
        }
      } catch (err) {
        setErrorMsg('Server error during lookup.');
      } finally {
        setLoading(false);
      }
    },
    [memberIdInput]
  );

  // Auto-trigger lookup when 4 digits are entered
  useEffect(() => {
    if (memberIdInput.length === 4) {
      handleLookup(memberIdInput);
    } else if (memberIdInput.length < 4) {
      setLookupResult(null);
      setErrorMsg('');
    }
  }, [memberIdInput, handleLookup]);

  // Handle Record Meal action
  const handleRecordMeal = async () => {
    if (!lookupResult || !lookupResult.success || recording) return;

    const { customer, subscription } = lookupResult;
    setRecording(true);

    try {
      const idempotencyKey = `meal_${subscription.id}_${Date.now()}`;
      const res = await fetch('/api/counter/record', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: customer.id,
          subscriptionId: subscription.id,
          mealType: selectedMealType,
          idempotencyKey,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || 'Failed to record meal.');
      } else {
        playChime();
        const newBalance = data.remainingBalance;

        // Show Success Toast
        setSuccessToast({
          customerName: customer.name,
          memberId: customer.memberId,
          remainingBalance: newBalance,
        });

        // Add to Recent Activity
        setRecentActivity((prev) => [
          {
            id: data.mealRecord?.id || Date.now().toString(),
            memberId: customer.memberId,
            name: customer.name,
            mealType: selectedMealType,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            remainingBalance: newBalance,
          },
          ...prev.slice(0, 7),
        ]);

        // Reset Counter Input & Ready state
        setMemberIdInput('');
        setLookupResult(null);
        setErrorMsg('');
        setTimeout(() => setSuccessToast(null), 4000);
      }
    } catch (err) {
      setErrorMsg('Transaction failed. Please try again.');
    } finally {
      setRecording(false);
      inputRef.current?.focus();
    }
  };

  // Keypad press handler
  const handleKeypadPress = (val) => {
    if (val === 'CLEAR') {
      setMemberIdInput('');
      setLookupResult(null);
      setErrorMsg('');
      inputRef.current?.focus();
    } else if (val === 'BACKSPACE') {
      setMemberIdInput((prev) => prev.slice(0, -1));
    } else {
      if (memberIdInput.length < 4) {
        setMemberIdInput((prev) => prev + val);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Bar Banner: Shift Indicator & Preferences */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-2xl bg-gradient-to-r from-[#3525CD] to-indigo-700 p-4 text-white shadow-lg shadow-indigo-600/20">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur-md">
            <Utensils className="h-5 w-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-block h-2 w-2 rounded-full bg-[#6CF8BB] animate-pulse" />
              <h2 className="text-base font-extrabold tracking-tight">
                Meal Counter Station POS
              </h2>
            </div>
            <p className="text-xs text-indigo-100 font-medium">
              Enter 4-digit Member ID to record meal in 2–4 seconds
            </p>
          </div>
        </div>

        {/* Meal Type Switcher & Audio Chime Toggle */}
        <div className="flex items-center gap-2">
          <div className="flex rounded-xl bg-black/20 p-1 backdrop-blur-md">
            {['BREAKFAST', 'LUNCH', 'DINNER'].map((type) => (
              <button
                key={type}
                onClick={() => setSelectedMealType(type)}
                className={`rounded-lg px-2.5 py-1 text-xs font-bold transition ${
                  selectedMealType === type
                    ? 'bg-[#6CF8BB] text-slate-900 shadow-sm'
                    : 'text-white/80 hover:text-white'
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          <button
            onClick={() => setChimeEnabled(!chimeEnabled)}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-white hover:bg-white/20"
            title={chimeEnabled ? 'Chime sound enabled' : 'Chime sound muted'}
          >
            {chimeEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Success Notification Banner */}
      {successToast && (
        <div className="flex items-center justify-between rounded-2xl border border-emerald-300 bg-emerald-500 p-4 text-white shadow-xl animate-in slide-in-from-top-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
              <CheckCircle2 className="h-6 w-6 text-white" />
            </div>
            <div>
              <h4 className="text-base font-extrabold leading-tight">
                Meal Recorded Successfully!
              </h4>
              <p className="text-xs font-medium text-emerald-100">
                #{successToast.memberId} — {successToast.customerName} | Balance:{' '}
                <span className="font-extrabold text-white">
                  {successToast.remainingBalance} meals left
                </span>
              </p>
            </div>
          </div>
          <span className="rounded-lg bg-white/20 px-2.5 py-1 text-xs font-bold">
            READY FOR NEXT
          </span>
        </div>
      )}

      {/* Main Counter Layout (Grid: Counter Input / Preview vs Keypad / Recent Stream) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Column: 4-digit ID Box & Customer Preview */}
        <div className="space-y-6 lg:col-span-7">
          {/* Member ID Input Box */}
          <div className="stitch-card p-6 space-y-4">
            <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-500">
              Member ID (4-Digits)
            </label>

            <div className="relative flex items-center">
              <span className="absolute left-4 text-2xl font-black text-slate-300">#</span>
              <input
                ref={inputRef}
                type="text"
                maxLength={4}
                value={memberIdInput}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '');
                  setMemberIdInput(val);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && lookupResult?.success) {
                    handleRecordMeal();
                  }
                }}
                placeholder="1001"
                className="w-full rounded-2xl border-2 border-[#3525CD]/30 bg-slate-50/50 pl-10 pr-12 py-3.5 text-4xl font-extrabold tracking-widest text-[#3525CD] placeholder-slate-300 focus:border-[#3525CD] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#3525CD]/20"
              />
              {loading ? (
                <div className="absolute right-4 text-[#3525CD]">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : (
                memberIdInput && (
                  <button
                    onClick={() => handleKeypadPress('CLEAR')}
                    className="absolute right-4 text-slate-400 hover:text-slate-600"
                  >
                    <RotateCcw className="h-5 w-5" />
                  </button>
                )
              )}
            </div>

            {errorMsg && (
              <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-bold text-red-700">
                <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
                <span>{errorMsg}</span>
              </div>
            )}
          </div>

          {/* Customer Lookup Preview Card */}
          {lookupResult?.success ? (
            <div className="stitch-card p-6 border-2 border-emerald-500/40 bg-white space-y-5 animate-in fade-in">
              <div className="flex items-start justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#3525CD] text-lg font-black text-white shadow-md shadow-indigo-600/30">
                    #{lookupResult.customer.memberId}
                  </span>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">
                      {lookupResult.customer.name}
                    </h3>
                    <p className="text-xs font-semibold text-slate-500">
                      {lookupResult.customer.mobile}
                    </p>
                  </div>
                </div>

                <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">
                  {lookupResult.subscription.planName}
                </span>
              </div>

              {/* Balance & Daily Rule Meter */}
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-xl bg-indigo-50/70 p-3.5 text-center">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#3525CD]">
                    Remaining Balance
                  </span>
                  <p className="mt-1 text-3xl font-black text-[#3525CD]">
                    {lookupResult.subscription.remainingBalance}{' '}
                    <span className="text-sm font-semibold text-slate-600">meals</span>
                  </p>
                </div>

                <div className="rounded-xl bg-slate-50 p-3.5 text-center">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                    Daily Allowance
                  </span>
                  <p className="mt-1 text-3xl font-black text-slate-800">
                    {lookupResult.subscription.todayMealsCount}/
                    {lookupResult.subscription.mealsPerDay}
                  </p>
                </div>
              </div>

              {/* Record Action Button */}
              <button
                onClick={handleRecordMeal}
                disabled={recording || !lookupResult.subscription.canRecordToday}
                className="btn-mint w-full flex items-center justify-center gap-2 py-4 text-lg shadow-lg shadow-emerald-500/20 disabled:opacity-60"
              >
                {recording ? (
                  <>
                    <Loader2 className="h-6 w-6 animate-spin" />
                    <span>Processing Meal...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-6 w-6 text-slate-900" />
                    <span>CONFIRM & RECORD MEAL (-1)</span>
                    <span className="ml-2 rounded-lg bg-black/10 px-2 py-0.5 text-xs font-bold">
                      [ENTER]
                    </span>
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white/60 p-10 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-[#3525CD]">
                <Search className="h-6 w-6" />
              </div>
              <p className="mt-3 text-sm font-bold text-slate-700">
                Awaiting 4-Digit Member ID
              </p>
              <p className="mt-1 text-xs text-slate-400">
                Enter customer number (e.g. 1001) to preview balance & record meal
              </p>
            </div>
          )}
        </div>

        {/* Right Column: Touch Keypad & Recent Activity Stream */}
        <div className="space-y-6 lg:col-span-5">
          {/* Touch Numeric Keypad */}
          <div className="stitch-card p-5">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-3">
              POS Express Touchpad
            </h4>
            <div className="grid grid-cols-3 gap-2.5">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
                <button
                  key={digit}
                  onClick={() => handleKeypadPress(digit)}
                  className="flex h-14 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-2xl font-bold text-slate-800 shadow-sm transition active:scale-95 hover:bg-white hover:border-[#3525CD]"
                >
                  {digit}
                </button>
              ))}
              <button
                onClick={() => handleKeypadPress('CLEAR')}
                className="flex h-14 items-center justify-center rounded-xl border border-red-200 bg-red-50 text-xs font-bold text-red-700 transition active:scale-95 hover:bg-red-100"
              >
                CLEAR
              </button>
              <button
                onClick={() => handleKeypadPress('0')}
                className="flex h-14 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-2xl font-bold text-slate-800 shadow-sm transition active:scale-95 hover:bg-white hover:border-[#3525CD]"
              >
                0
              </button>
              <button
                onClick={() => handleKeypadPress('BACKSPACE')}
                className="flex h-14 items-center justify-center rounded-xl border border-slate-200 bg-slate-100 text-slate-700 transition active:scale-95 hover:bg-slate-200"
              >
                <Delete className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Recent Activity Stream */}
          <div className="stitch-card p-5 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
                Recent Counter Activity
              </h4>
              <span className="text-[11px] font-bold text-[#3525CD]">Live</span>
            </div>

            {recentActivity.length === 0 ? (
              <p className="py-4 text-center text-xs text-slate-400">
                No meals recorded in current session yet.
              </p>
            ) : (
              <div className="space-y-2">
                {recentActivity.map((act, idx) => (
                  <div
                    key={act.id + idx}
                    className="flex items-center justify-between rounded-xl bg-slate-50 p-2.5 text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-[#3525CD]">
                        #{act.memberId}
                      </span>
                      <span className="font-bold text-slate-900">{act.name}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-500">
                      <span className="rounded bg-indigo-50 px-1.5 py-0.5 text-[10px] font-bold text-[#3525CD]">
                        {act.mealType}
                      </span>
                      <span>{act.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
