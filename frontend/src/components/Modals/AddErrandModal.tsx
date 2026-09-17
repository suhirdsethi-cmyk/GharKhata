import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { createErrand } from '../../api/client';
import { X, ShoppingBag } from 'lucide-react';

export const AddErrandModal: React.FC = () => {
  const { isAddErrandOpen, setIsAddErrandOpen, currentUser, refreshData } = useApp();

  const [name, setName] = useState('');
  const [category, setCategory] = useState('Vegetables & Fruit');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isAddErrandOpen) return null;

  const categories = ['Vegetables & Fruit', 'Dairy & Bread', 'Spices & Staples', 'Chemist/Pharmacy', 'Hardware/Repairs', 'Miscellaneous'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !currentUser) {
      setError('Please enter item name.');
      return;
    }

    try {
      setLoading(true);
      await createErrand({
        name,
        category,
        added_by_id: currentUser.id,
        household_code: currentUser?.household_code
      });
      await refreshData();
      setIsAddErrandOpen(false);
      setName('');
    } catch (err: any) {
      setError(err.message || 'Failed to add errand item');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end bg-slate-900/40 backdrop-blur-xs no-print animate-in fade-in duration-200">
      <div 
        className="fixed inset-0" 
        onClick={() => setIsAddErrandOpen(false)} 
      />

      <div className="relative bg-white rounded-t-3xl p-6 shadow-2xl space-y-4 animate-bottom-sheet max-w-md mx-auto w-full">
        <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto" />

        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-emerald-600" />
            <span>Add Grocery / Errand Item</span>
          </h2>
          <button
            onClick={() => setIsAddErrandOpen(false)}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-50 text-rose-700 text-xs font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Item Name & Quantity</label>
            <input
              type="text"
              required
              autoFocus
              placeholder="e.g. Tomatoes 2 kg, Amul Butter..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-3 light-input rounded-2xl text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3.5 py-3 light-input rounded-2xl text-sm font-semibold"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-2xl text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md transition-all min-h-[48px]"
          >
            {loading ? 'Adding...' : 'Add to Grocery Checklist'}
          </button>
        </form>

      </div>
    </div>
  );
};
