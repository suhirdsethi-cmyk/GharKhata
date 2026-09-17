import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { fetchNetDues, fetchSettlementHistory, recordSettlement } from '../../api/client';
import { NetBalanceItem, Settlement } from '../../types';
import { Scale, CheckCircle2, History, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';

export const DuesLedgerView: React.FC = () => {
  const { currentUser, stats, setIsSettleOpen, refreshData } = useApp();

  const [netDues, setNetDues] = useState<NetBalanceItem[]>([]);
  const [history, setHistory] = useState<Settlement[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const dues = await fetchNetDues(currentUser?.household_code);
      setNetDues(dues);

      const stHistory = await fetchSettlementHistory(currentUser?.household_code);
      setHistory(stHistory);
    } catch (err) {
      console.error('Failed loading dues:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [stats, currentUser?.household_code]);

  const handleQuickSettle = async (debt: NetBalanceItem) => {
    if (!window.confirm(`Mark ₹${debt.amount} settled in cash between ${debt.from_user_name} and ${debt.to_user_name}?`)) return;
    try {
      await recordSettlement({
        payer_id: debt.from_user_id,
        receiver_id: debt.to_user_id,
        amount: debt.amount,
        notes: 'Quick cash settlement',
        household_code: currentUser?.household_code
      });
      await loadData();
      await refreshData();
    } catch (err) {
      console.error('Failed settlement:', err);
    }
  };

  return (
    <div className="space-y-4 max-w-xl mx-auto pb-8">
      
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Scale className="w-5 h-5 text-indigo-600" />
          <div>
            <h2 className="text-base font-extrabold text-slate-900">Shared Dues Ledger</h2>
            <p className="text-[11px] text-slate-400 font-medium">Simplified net peer balances</p>
          </div>
        </div>

        <button
          onClick={() => setIsSettleOpen(true)}
          className="px-3 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-xs transition-all flex items-center gap-1"
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>Settle Cash</span>
        </button>
      </div>

      {/* Net Debt Algorithm Alert Pill */}
      <div className="px-4 py-3 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-900 text-xs font-medium flex items-center gap-2">
        <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0" />
        <span>Multi-party debts automatically simplified to minimum bilateral cash payments.</span>
      </div>

      {/* Conversational Debt Cards List */}
      <div className="space-y-3">
        <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider px-1">
          Active Net Balances ({netDues.length})
        </h3>

        {netDues.length > 0 ? (
          netDues.map((debt, idx) => {
            const isPayerMe = currentUser?.id === debt.from_user_id;
            const isReceiverMe = currentUser?.id === debt.to_user_id;

            let cardHeadline = `${debt.from_user_name} owes ${debt.to_user_name}`;
            if (isPayerMe) cardHeadline = `You owe ${debt.to_user_name}`;
            if (isReceiverMe) cardHeadline = `${debt.from_user_name} owes you`;

            return (
              <div 
                key={idx}
                className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex items-center justify-between gap-3 min-h-[64px] light-card-hover"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-11 h-11 rounded-2xl flex items-center justify-center font-bold text-sm ${
                    isReceiverMe 
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                      : isPayerMe
                      ? 'bg-rose-50 text-rose-700 border border-rose-200'
                      : 'bg-slate-50 text-slate-700 border border-slate-200'
                  }`}>
                    ₹
                  </div>

                  <div>
                    <h4 className="text-sm font-extrabold text-slate-900">
                      {cardHeadline}
                    </h4>
                    <span className="text-xs font-black text-indigo-600">
                      ₹{debt.amount.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => handleQuickSettle(debt)}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-all shrink-0 min-h-[44px]"
                >
                  Settle Cash
                </button>
              </div>
            );
          })
        ) : (
          <div className="bg-white rounded-2xl p-8 text-center border border-slate-100 text-slate-400 text-xs">
            <ShieldCheck className="w-8 h-8 text-emerald-600 mx-auto mb-2 opacity-80" />
            <span>All personal dues are currently fully settled!</span>
          </div>
        )}
      </div>

      {/* Cash Settlement History Audit Log */}
      <div className="space-y-2 pt-2">
        <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider px-1 flex items-center gap-1">
          <History className="w-3.5 h-3.5 text-slate-400" />
          <span>Settlement Audit Log</span>
        </h3>

        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm space-y-3">
          {history.length > 0 ? (
            history.map((st) => (
              <div 
                key={st.id}
                className="flex items-center justify-between text-xs py-2 border-b border-slate-50 last:border-0"
              >
                <div>
                  <div className="font-bold text-slate-800 flex items-center gap-1">
                    <span>{st.payer?.name?.split(' ')[0] || 'User'}</span>
                    <ArrowRight className="w-3 h-3 text-slate-400" />
                    <span className="text-emerald-600">{st.receiver?.name?.split(' ')[0] || 'User'}</span>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    {st.notes || 'Cash settlement'} • {new Date(st.created_at).toLocaleDateString()}
                  </div>
                </div>
                <div className="font-extrabold text-sm text-emerald-600">
                  +₹{st.amount.toLocaleString('en-IN')}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-4 text-slate-400 text-xs">
              No cash settlements recorded yet.
            </div>
          )}
        </div>
      </div>

    </div>
  );
};
