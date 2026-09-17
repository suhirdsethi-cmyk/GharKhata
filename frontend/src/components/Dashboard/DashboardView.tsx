import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Landmark, 
  Wallet, 
  Scale, 
  PlusCircle, 
  ArrowUpRight, 
  ArrowDownLeft, 
  ChevronRight,
  Users,
  User,
  UserPlus,
  Receipt,
  ShoppingBag,
  Share2,
  FileText
} from 'lucide-react';

import { GoogleLogin } from '@react-oauth/google';
import { CategoryAnalyticsCard } from '../Analytics/CategoryAnalyticsCard';

export const DashboardView: React.FC = () => {
  const { stats, loading, activeMonth, currentUser, users, loginUserWithGoogle, setActiveTab, setIsAddExpenseOpen, setIsAddInflowOpen, setIsHouseholdModalOpen, setIsReportExportOpen } = useApp();

  if (loading && !stats) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const inflow = stats?.total_monthly_inflow || 0;
  const spentPool = stats?.spent_from_pool || 0;
  const remaining = stats?.remaining_rental_balance || 0;
  const personalTotal = stats?.total_personal_expenses || 0;
  const poolUsagePct = inflow > 0 ? Math.min(100, Math.round((spentPool / inflow) * 100)) : 0;
  const poolRemainingPct = 100 - poolUsagePct;

  return (
    <div className="space-y-4 max-w-xl mx-auto">
      
      {!currentUser && (
        <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 text-white rounded-3xl p-5 shadow-md flex items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold">Welcome to GharKhata!</h3>
            <p className="text-xs text-indigo-100 mt-0.5">Sign in with Google to log rental inflows, expenses & track shared dues.</p>
          </div>
          <div className="shrink-0 overflow-hidden rounded-full shadow-lg">
            <GoogleLogin
              onSuccess={(res) => res.credential && loginUserWithGoogle(res.credential)}
              onError={() => console.error('Google Sign-In Error')}
              shape="pill"
              size="medium"
            />
          </div>
        </div>
      )}
      
      {/* 1. HERO "AT-A-GLANCE" POOL PILL CARD */}
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Rental Reserve ({activeMonth})
            </span>
          </div>

          <button
            onClick={() => setIsAddInflowOpen(true)}
            className="text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-xl border border-emerald-200 transition-all flex items-center gap-1"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>+ Rent Inflow</span>
          </button>
        </div>

        {/* Big Bold Surplus Hero Number */}
        <div>
          <div className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            ₹{remaining.toLocaleString('en-IN')}{' '}
            <span className="text-base font-extrabold text-emerald-600">Remaining</span>
          </div>
          <div className="text-xs font-medium text-slate-500 mt-1">
            Out of <span className="font-bold text-slate-700">₹{inflow.toLocaleString('en-IN')}</span> monthly rent pool inflow
          </div>
        </div>

        {/* Visual Progress Bar */}
        <div className="space-y-1.5">
          <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden p-0.5 border border-slate-200/60">
            <div 
              className="bg-emerald-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${poolRemainingPct}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500">
            <span>Spent from pool: ₹{spentPool.toLocaleString('en-IN')} ({poolUsagePct}%)</span>
            <span className="text-emerald-700 font-bold">{poolRemainingPct}% Available</span>
          </div>
        </div>

      </div>

      {/* 2. SECONDARY STAT CARDS */}
      <div className="grid grid-cols-2 gap-3">
        
        {/* Out-of-Pocket Dues Card */}
        <div 
          onClick={() => setActiveTab('dues')}
          className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm cursor-pointer hover:border-slate-200 transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase">Out-of-Pocket</span>
            <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <Scale className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-extrabold text-slate-900 mt-2">
            ₹{personalTotal.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] font-semibold text-rose-600 mt-1 flex items-center justify-between">
            <span>{stats?.net_dues_list.length || 0} Net Dues</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Grocery/Errand Card */}
        <div 
          onClick={() => setActiveTab('market')}
          className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm cursor-pointer hover:border-slate-200 transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase">Market Beacon</span>
            <div className="w-7 h-7 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-extrabold text-slate-900 mt-2">
            {stats?.active_market_beacons.filter((b: any) => b.is_active).length || 0} Active
          </div>
          <div className="text-[11px] font-semibold text-sky-600 mt-1 flex items-center justify-between">
            <span>Market List</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </div>
        </div>

      </div>

      {/* 3. QUICK ACTIONS ROW */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => setIsAddExpenseOpen(true)}
          className="py-3.5 px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
        >
          <Receipt className="w-4 h-4" />
          <span>+ Log Expense</span>
        </button>

        <button
          onClick={() => setIsReportExportOpen(true)}
          className="py-3.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
        >
          <Share2 className="w-4 h-4" />
          <span>Share / PDF Report</span>
        </button>
      </div>

      {/* 4. SPENDING ANALYTICS CARD */}
      <CategoryAnalyticsCard />

      {/* 5. FAMILY MEMBERS / SOLO PERSONAL ACCOUNT CARD */}
      <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {currentUser?.active_mode === 'PERSONAL' || currentUser?.household_code?.includes('PERS') ? (
              <User className="w-4 h-4 text-amber-600" />
            ) : (
              <Users className="w-4 h-4 text-indigo-600" />
            )}
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
              {currentUser?.active_mode === 'PERSONAL' || currentUser?.household_code?.includes('PERS')
                ? 'Personal Solo Account'
                : `Family Members (${users.length})`}
            </h3>
          </div>
          
          <button
            onClick={() => setIsHouseholdModalOpen(true)}
            className="text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-3 py-1 rounded-xl transition-all flex items-center gap-1"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>+ Invite / Join</span>
          </button>
        </div>

        {currentUser?.active_mode === 'PERSONAL' || currentUser?.household_code?.includes('PERS') ? (
          <div className="p-3 bg-amber-50/80 border border-amber-100 rounded-2xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-amber-900 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                Solo Ledger Active ({currentUser.household_code})
              </span>
              <span className="text-[10px] font-bold text-amber-700 bg-white/80 px-2 py-0.5 rounded-full border border-amber-200">
                Private Mode
              </span>
            </div>
            <p className="text-[11px] text-amber-800/80 font-medium leading-relaxed">
              Your expenses, checklist, and dues are completely private to you in Solo Mode. Click <strong>"Solo Mode"</strong> in the top header anytime to switch back to your shared Family Household.
            </p>
          </div>
        ) : null}

        <div className="divide-y divide-slate-100">
          {(users.length > 0 ? users : currentUser ? [currentUser] : []).map((u: any) => (
            <div key={u.id} className="py-2.5 flex items-center justify-between first:pt-0 last:pb-0">
              <div className="flex items-center gap-3">
                {u.picture ? (
                  <img 
                    src={u.picture} 
                    alt={u.name} 
                    className="w-9 h-9 rounded-full ring-2 ring-indigo-100 object-cover shrink-0"
                  />
                ) : (
                  <div 
                    className="w-9 h-9 rounded-full text-white font-extrabold flex items-center justify-center text-xs shrink-0 shadow-xs"
                    style={{ backgroundColor: u.avatar_color || '#4f46e5' }}
                  >
                    {u.name ? u.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-extrabold text-slate-900">{u.name}</span>
                    {u.id === currentUser?.id && (
                      <span className="text-[9px] font-black text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded-full border border-indigo-100">
                        You
                      </span>
                    )}
                  </div>
                  {u.email && (
                    <span className="text-[11px] text-slate-400 block font-medium">
                      {u.email}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full capitalize">
                  {u.role || 'Member'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
