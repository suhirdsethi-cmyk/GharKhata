import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { createExpense, uploadReceipt } from '../../api/client';
import { X, Upload, Check, AlertCircle } from 'lucide-react';

export const AddExpenseModal: React.FC = () => {
  const { 
    isAddExpenseOpen, 
    setIsAddExpenseOpen, 
    users, 
    currentUser, 
    activeMonth,
    refreshData 
  } = useApp();

  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Groceries');
  const [payerId, setPayerId] = useState<number>(currentUser?.id || 1);
  const [fundingSource, setFundingSource] = useState<'RENTAL_POOL' | 'PERSONAL'>('RENTAL_POOL');
  const [splitType, setSplitType] = useState<'EQUAL' | 'CUSTOM' | 'FULL_BEHALF'>('EQUAL');
  const [date, setDate] = useState(`${activeMonth}-15`);
  const [notes, setNotes] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (currentUser) setPayerId(currentUser.id);
  }, [currentUser]);

  if (!isAddExpenseOpen) return null;

  const categories = ['Groceries', 'Utilities', 'Maintenance', 'Chemist/Pharmacy', 'Hardware/Repairs', 'Miscellaneous'];

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsUploading(true);
      const res = await uploadReceipt(file);
      setImageUrl(res.url);
    } catch (err) {
      console.error('File upload failed:', err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const numAmount = parseFloat(amount);
    if (!title.trim() || isNaN(numAmount) || numAmount <= 0) {
      setError('Please provide a valid title and positive amount.');
      return;
    }

    try {
      setLoading(true);
      await createExpense({
        title,
        amount: numAmount,
        category,
        payer_id: payerId,
        funding_source: fundingSource,
        split_type: splitType,
        date,
        receipt_note: notes,
        image_url: imageUrl,
        household_code: currentUser?.household_code
      });

      await refreshData();
      setIsAddExpenseOpen(false);
      setTitle('');
      setAmount('');
      setNotes('');
      setImageUrl('');
    } catch (err: any) {
      setError(err.message || 'Failed to record expense.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end bg-slate-900/40 backdrop-blur-xs no-print animate-in fade-in duration-200">
      <div 
        className="fixed inset-0" 
        onClick={() => setIsAddExpenseOpen(false)} 
      />

      <div className="relative bg-white rounded-t-3xl p-6 shadow-2xl space-y-4 animate-bottom-sheet max-w-lg mx-auto w-full max-h-[90vh] overflow-y-auto">
        
        {/* Touch Handle */}
        <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto" />

        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h2 className="text-base font-black text-slate-900">Log Household Expense</h2>
          <button
            onClick={() => setIsAddExpenseOpen(false)}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-50 text-rose-700 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Item / Expense Title</label>
            <input
              type="text"
              required
              placeholder="e.g. Milk token, Electricity bill..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-3 light-input rounded-2xl text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Amount (₹)</label>
              <input
                type="number"
                step="0.01"
                required
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-3.5 py-3 light-input rounded-2xl text-base font-black text-indigo-600"
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
          </div>

          {/* Funding Source Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1.5">Funding Source</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setFundingSource('RENTAL_POOL')}
                className={`p-3 rounded-2xl text-xs font-bold border transition-all text-left ${
                  fundingSource === 'RENTAL_POOL'
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300 shadow-xs'
                    : 'bg-slate-50 text-slate-600 border-slate-200'
                }`}
              >
                <div>🏦 Rental Pool</div>
                <div className="text-[10px] font-normal text-emerald-700/80 mt-0.5">Central rent reserve</div>
              </button>

              <button
                type="button"
                onClick={() => setFundingSource('PERSONAL')}
                className={`p-3 rounded-2xl text-xs font-bold border transition-all text-left ${
                  fundingSource === 'PERSONAL'
                    ? 'bg-rose-50 text-rose-800 border-rose-300 shadow-xs'
                    : 'bg-slate-50 text-slate-600 border-slate-200'
                }`}
              >
                <div>💳 Out-of-Pocket</div>
                <div className="text-[10px] font-normal text-rose-700/80 mt-0.5">Shared dues ledger</div>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Paid By</label>
              <select
                value={payerId}
                onChange={(e) => setPayerId(Number(e.target.value))}
                className="w-full px-3 py-2.5 light-input rounded-2xl text-xs font-semibold"
              >
                {users.map((u: any) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-600">Expense Date</label>
                <div className="flex items-center gap-1 text-[10px]">
                  <button
                    type="button"
                    onClick={() => setDate(new Date().toISOString().split('T')[0])}
                    className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-bold hover:bg-indigo-100 border border-indigo-200/60"
                  >
                    Today
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const y = new Date();
                      y.setDate(y.getDate() - 1);
                      setDate(y.toISOString().split('T')[0]);
                    }}
                    className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-bold hover:bg-slate-200"
                  >
                    Yesterday
                  </button>
                </div>
              </div>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2.5 light-input rounded-2xl text-xs font-semibold"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Receipt Attachment</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
              id="sheet-receipt-upload"
            />
            <label
              htmlFor="sheet-receipt-upload"
              className="flex items-center justify-center gap-2 py-3 px-4 bg-slate-50 border border-dashed border-slate-300 rounded-2xl text-xs font-bold text-slate-700 cursor-pointer hover:bg-slate-100 transition-all min-h-[48px]"
            >
              <Upload className="w-4 h-4 text-indigo-600" />
              <span>{isUploading ? 'Uploading...' : imageUrl ? 'Receipt Attached ✓' : 'Upload Receipt Photo'}</span>
            </label>
          </div>

          <button
            type="submit"
            disabled={loading || isUploading}
            className="w-full py-3.5 rounded-2xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md transition-all min-h-[48px]"
          >
            {loading ? 'Saving...' : 'Save Expense Log'}
          </button>

        </form>

      </div>
    </div>
  );
};
