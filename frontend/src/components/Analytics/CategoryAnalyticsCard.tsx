import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  PieChart, 
  BarChart3, 
  ShoppingBag, 
  Zap, 
  Wrench, 
  Pill, 
  HelpCircle, 
  Landmark, 
  Wallet, 
  User as UserIcon,
  TrendingUp,
  Award
} from 'lucide-react';

export const CategoryAnalyticsCard: React.FC = () => {
  const { stats, activeMonth, users } = useApp();
  const [activeSubTab, setActiveSubTab] = useState<'categories' | 'funding' | 'members'>('categories');

  if (!stats) return null;

  const categoryTotals: { [cat: string]: number } = stats.category_breakdown || {};
  const totalSpent = Object.values(categoryTotals).reduce((a, b) => a + b, 0);

  const getCategoryIcon = (cat: string) => {
    switch (cat.toLowerCase()) {
      case 'groceries':
        return <ShoppingBag className="w-4 h-4 text-emerald-600" />;
      case 'utilities':
        return <Zap className="w-4 h-4 text-amber-600" />;
      case 'maintenance':
      case 'hardware/repairs':
        return <Wrench className="w-4 h-4 text-sky-600" />;
      case 'medical/chemist':
      case 'chemist/pharmacy':
        return <Pill className="w-4 h-4 text-rose-600" />;
      default:
        return <HelpCircle className="w-4 h-4 text-indigo-600" />;
    }
  };

  const getCategoryColor = (index: number) => {
    const colors = [
      'bg-emerald-500 text-emerald-700 bg-emerald-50 border-emerald-200',
      'bg-amber-500 text-amber-700 bg-amber-50 border-amber-200',
      'bg-sky-500 text-sky-700 bg-sky-50 border-sky-200',
      'bg-rose-500 text-rose-700 bg-rose-50 border-rose-200',
      'bg-indigo-500 text-indigo-700 bg-indigo-50 border-indigo-200',
      'bg-purple-500 text-purple-700 bg-purple-50 border-purple-200'
    ];
    return colors[index % colors.length];
  };

  // Sorted categories by amount descending
  const sortedCategories = Object.entries(categoryTotals)
    .sort(([, a], [, b]) => b - a);

  // Funding Breakdown
  const poolSpent = stats.spent_from_pool || 0;
  const personalSpent = stats.total_personal_expenses || 0;
  const totalFunding = poolSpent + personalSpent;
  const poolPct = totalFunding > 0 ? Math.round((poolSpent / totalFunding) * 100) : 0;
  const personalPct = totalFunding > 0 ? 100 - poolPct : 0;

  return (
    <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm space-y-4">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <PieChart className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
              Spending Analytics ({activeMonth})
            </h3>
            <p className="text-[11px] text-slate-400 font-medium">
              Total Logged: <span className="font-extrabold text-slate-800">₹{totalSpent.toLocaleString('en-IN')}</span>
            </p>
          </div>
        </div>

        {/* Sub-tab Selector */}
        <div className="flex bg-slate-100 p-1 rounded-xl text-[11px] font-bold">
          <button
            onClick={() => setActiveSubTab('categories')}
            className={`px-2.5 py-1 rounded-lg transition-all ${
              activeSubTab === 'categories' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Category
          </button>
          <button
            onClick={() => setActiveSubTab('funding')}
            className={`px-2.5 py-1 rounded-lg transition-all ${
              activeSubTab === 'funding' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Fund Source
          </button>
        </div>
      </div>

      {/* 1. CATEGORY BREAKDOWN TAB */}
      {activeSubTab === 'categories' && (
        <div className="space-y-3">
          {sortedCategories.length === 0 ? (
            <div className="py-6 text-center text-xs font-semibold text-slate-400">
              No category expenses recorded for {activeMonth} yet.
            </div>
          ) : (
            sortedCategories.map(([cat, amount], idx) => {
              const pct = totalSpent > 0 ? Math.round((amount / totalSpent) * 100) : 0;
              const colorClasses = getCategoryColor(idx);
              const barBg = colorClasses.split(' ')[0];

              return (
                <div key={cat} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 font-bold text-slate-800">
                      {getCategoryIcon(cat)}
                      <span>{cat}</span>
                    </div>
                    <div className="font-extrabold text-slate-900">
                      ₹{amount.toLocaleString('en-IN')}{' '}
                      <span className="text-[10px] font-semibold text-slate-400">({pct}%)</span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${barBg} rounded-full transition-all duration-500`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })
          )}

          {sortedCategories.length > 0 && (
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-semibold">
              <span className="flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5 text-indigo-600" />
                Top Category: <strong className="text-slate-800">{sortedCategories[0][0]}</strong>
              </span>
              <span>{sortedCategories.length} Categories Active</span>
            </div>
          )}
        </div>
      )}

      {/* 2. FUNDING SOURCE TAB */}
      {activeSubTab === 'funding' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            
            {/* Rental Pool Card */}
            <div className="p-3.5 bg-emerald-50 border border-emerald-100 rounded-2xl space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold text-emerald-700 uppercase">Rental Pool</span>
                <Landmark className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-lg font-black text-emerald-950">
                ₹{poolSpent.toLocaleString('en-IN')}
              </div>
              <span className="text-[10px] font-bold text-emerald-600 block">
                {poolPct}% of Total Spent
              </span>
            </div>

            {/* Personal Out-of-Pocket Card */}
            <div className="p-3.5 bg-indigo-50 border border-indigo-100 rounded-2xl space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold text-indigo-700 uppercase">Personal / Out of Pocket</span>
                <Wallet className="w-4 h-4 text-indigo-600" />
              </div>
              <div className="text-lg font-black text-indigo-950">
                ₹{personalSpent.toLocaleString('en-IN')}
              </div>
              <span className="text-[10px] font-bold text-indigo-600 block">
                {personalPct}% of Total Spent
              </span>
            </div>

          </div>

          {/* Dual Bar */}
          <div className="space-y-1">
            <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden flex">
              <div 
                className="bg-emerald-500 h-full transition-all duration-500" 
                style={{ width: `${poolPct}%` }}
                title={`Rental Pool: ${poolPct}%`}
              />
              <div 
                className="bg-indigo-600 h-full transition-all duration-500" 
                style={{ width: `${personalPct}%` }}
                title={`Personal: ${personalPct}%`}
              />
            </div>
            <div className="flex justify-between text-[10px] font-bold text-slate-400">
              <span className="text-emerald-600">● Rental Pool ({poolPct}%)</span>
              <span className="text-indigo-600">● Personal Shared ({personalPct}%)</span>
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
