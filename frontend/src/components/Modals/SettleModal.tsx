import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { recordSettlement } from '../../api/client';
import { X, Scale, CheckCircle2 } from 'lucide-react';

export const SettleModal: React.FC = () => {
  const { isSettleOpen, setIsSettleOpen, users, currentUser, refreshData } = useApp();

  const [payerId, setPayerId] = useState<number>(currentUser?.id || users[0]?.id || 1);
  const [receiverId, setReceiverId] = useState<number>(users[1]?.id || 2);
  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('Cash settlement');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isSettleOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const numAmount = parseFloat(amount);
    if (payerId === receiverId) {
      setError('Payer and receiver must be different members.');
      return;
    }
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Please enter a valid settlement amount.');
      return;
    }

    try {
      setLoading(true);
      await recordSettlement({
        payer_id: payerId,
        receiver_id: receiverId,
        amount: numAmount,
        notes,
        household_code: currentUser?.household_code
      });
      await refreshData();
      setIsSettleOpen(false);
      setAmount('');
    } catch (err: any) {
      setError(err.message || 'Failed to record settlement');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end bg-slate-900/40 backdrop-blur-xs no-print animate-in fade-in duration-200">
      <div 
        className="fixed inset-0" 
        onClick={() => setIsSettleOpen(false)} 
      />

      <div className="relative bg-white rounded-t-3xl p-6 shadow-2xl space-y-4 animate-bottom-sheet max-w-md mx-auto w-full">
        <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto" />

        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
            <Scale className="w-5 h-5 text-indigo-600" />
            <span>Record Cash Settlement</span>
          </h2>
          <button
            onClick={() => setIsSettleOpen(false)}
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
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Payer (Paid Cash)</label>
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
              <label className="block text-xs font-bold text-slate-600 mb-1">Receiver (Got Cash)</label>
              <select
                value={receiverId}
                onChange={(e) => setReceiverId(Number(e.target.value))}
                className="w-full px-3 py-2.5 light-input rounded-2xl text-xs font-semibold"
              >
                {users.map((u: any) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Settlement Amount (₹)</label>
            <input
              type="number"
              step="0.01"
              required
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-3.5 py-3 light-input rounded-2xl text-lg font-black text-indigo-600"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Note / Method</label>
            <input
              type="text"
              placeholder="e.g. Handed cash in person..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-3 light-input rounded-2xl text-xs"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-2xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md transition-all min-h-[48px]"
          >
            {loading ? 'Recording...' : 'Confirm Cash Settlement'}
          </button>
        </form>

      </div>
    </div>
  );
};
