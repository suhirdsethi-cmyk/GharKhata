import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { createExpense } from '../../api/client';
import { X, ShoppingBag, Check } from 'lucide-react';

export const QuickExpenseFromErrandModal: React.FC = () => {
  const { 
    quickErrandToExpense, 
    setQuickErrandToExpense, 
    currentUser, 
    refreshData 
  } = useApp();

  const [amount, setAmount] = useState('');
  const [fundingSource, setFundingSource] = useState<'RENTAL_POOL' | 'PERSONAL'>('PERSONAL');
  const [loading, setLoading] = useState(false);

  if (!quickErrandToExpense) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) return;

    try {
      setLoading(true);
      await createExpense({
        title: quickErrandToExpense.name,
        amount: numAmount,
        category: quickErrandToExpense.category || 'Groceries',
        payer_id: currentUser?.id || quickErrandToExpense.added_by_id,
        funding_source: fundingSource,
        split_type: 'EQUAL',
        date: new Date().toISOString().split('T')[0],
        receipt_note: `Purchased from grocery checklist`,
        household_code: currentUser?.household_code
      });

      await refreshData();
      setQuickErrandToExpense(null);
      setAmount('');
    } catch (err) {
      console.error('Failed 1-tap conversion:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end bg-slate-900/40 backdrop-blur-xs no-print animate-in fade-in duration-200">
      <div 
        className="fixed inset-0" 
        onClick={() => setQuickErrandToExpense(null)} 
      />

      <div className="relative bg-white rounded-t-3xl p-6 shadow-2xl space-y-4 animate-bottom-sheet max-w-md mx-auto w-full">
        <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto" />

        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-emerald-600" />
            <div>
              <h2 className="text-base font-black text-slate-900">Add Purchase to Diary</h2>
              <p className="text-xs text-emerald-600 font-bold">Item: {quickErrandToExpense.name}</p>
            </div>
          </div>
          <button
            onClick={() => setQuickErrandToExpense(null)}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Enter Paid Amount (₹)</label>
            <input
              type="number"
              step="0.01"
              required
              autoFocus
              placeholder="e.g. 240.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-3.5 py-3 light-input rounded-2xl text-xl font-black text-emerald-600 text-center"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Funding Source</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setFundingSource('PERSONAL')}
                className={`py-3 px-3 rounded-2xl text-xs font-bold border transition-all ${
                  fundingSource === 'PERSONAL'
                    ? 'bg-rose-50 text-rose-700 border-rose-300'
                    : 'bg-slate-50 text-slate-600 border-slate-200'
                }`}
              >
                Out-of-Pocket
              </button>
              <button
                type="button"
                onClick={() => setFundingSource('RENTAL_POOL')}
                className={`py-3 px-3 rounded-2xl text-xs font-bold border transition-all ${
                  fundingSource === 'RENTAL_POOL'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                    : 'bg-slate-50 text-slate-600 border-slate-200'
                }`}
              >
                Rental Pool
              </button>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setQuickErrandToExpense(null)}
              className="px-4 py-3 rounded-2xl text-xs font-bold text-slate-500 hover:bg-slate-100"
            >
              Skip
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3.5 rounded-2xl text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md transition-all flex items-center justify-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>{loading ? 'Saving...' : 'Add to Expense Diary'}</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
