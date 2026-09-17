import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { createInflow, updateInflow } from '../../api/client';
import { X, Landmark } from 'lucide-react';

export const AddInflowModal: React.FC = () => {
  const { isAddInflowOpen, setIsAddInflowOpen, editingInflow, setEditingInflow, activeMonth, refreshData, currentUser } = useApp();

  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (editingInflow) {
      setTitle(editingInflow.title);
      setAmount(editingInflow.amount.toString());
    } else {
      setTitle('');
      setAmount('');
    }
    setError('');
  }, [editingInflow, isAddInflowOpen]);

  if (!isAddInflowOpen) return null;

  const handleClose = () => {
    setIsAddInflowOpen(false);
    setEditingInflow(null);
    setTitle('');
    setAmount('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const numAmount = parseFloat(amount);
    if (!title.trim() || isNaN(numAmount) || numAmount <= 0) {
      setError('Please provide a valid property title and amount.');
      return;
    }

    try {
      setLoading(true);
      if (editingInflow) {
        await updateInflow(editingInflow.id, {
          title,
          amount: numAmount,
          month_year: editingInflow.month_year || activeMonth
        });
      } else {
        await createInflow({
          title,
          amount: numAmount,
          month_year: activeMonth,
          household_code: currentUser?.household_code
        });
      }
      await refreshData();
      handleClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save rental inflow');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end bg-slate-900/40 backdrop-blur-xs no-print animate-in fade-in duration-200">
      <div 
        className="fixed inset-0" 
        onClick={handleClose} 
      />

      <div className="relative bg-white rounded-t-3xl p-6 shadow-2xl space-y-4 animate-bottom-sheet max-w-md mx-auto w-full">
        <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto" />

        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
            <Landmark className="w-5 h-5 text-emerald-600" />
            <span>{editingInflow ? 'Edit Rental Inflow' : 'Add Monthly Rental Inflow'}</span>
          </h2>
          <button
            onClick={handleClose}
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
            <label className="block text-xs font-bold text-slate-600 mb-1">Property / Inflow Title</label>
            <input
              type="text"
              required
              placeholder="e.g. Ground Floor Rent - Flat 101"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-3 light-input rounded-2xl text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Amount (₹)</label>
            <input
              type="number"
              step="100"
              required
              placeholder="e.g. 35000"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-3.5 py-3 light-input rounded-2xl text-lg font-black text-emerald-600"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-2xl text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md transition-all min-h-[48px]"
          >
            {loading ? (editingInflow ? 'Updating...' : 'Adding...') : (editingInflow ? 'Update Rental Inflow' : 'Add Rental Inflow')}
          </button>
        </form>

      </div>
    </div>
  );
};

