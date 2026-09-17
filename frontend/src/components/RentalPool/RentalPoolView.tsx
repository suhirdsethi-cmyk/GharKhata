import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { fetchInflows, deleteInflow, fetchExpenses } from '../../api/client';
import { InflowPool, Expense } from '../../types';
import { Landmark, PlusCircle, Trash2, Pencil, ShieldCheck, Wallet, ArrowDownRight, Layers } from 'lucide-react';

export const RentalPoolView: React.FC = () => {
  const { activeMonth, stats, setIsAddInflowOpen, setEditingInflow, refreshData } = useApp();

  const [inflows, setInflows] = useState<InflowPool[]>([]);
  const [poolExpenses, setPoolExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

  const loadPoolData = async () => {
    try {
      setLoading(true);
      const fetchedInflows = await fetchInflows(activeMonth);
      setInflows(fetchedInflows);

      const fetchedPoolExp = await fetchExpenses({
        month_year: activeMonth,
        funding_source: 'RENTAL_POOL'
      });
      setPoolExpenses(fetchedPoolExp);
    } catch (err) {
      console.error('Failed loading rental pool data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPoolData();
  }, [activeMonth]);

  const handleEditInflow = (item: InflowPool) => {
    setEditingInflow(item);
    setIsAddInflowOpen(true);
  };

  const handleDeleteInflow = async (id: number) => {
    if (!window.confirm('Delete this rental inflow entry?')) return;
    try {
      await deleteInflow(id);
      await loadPoolData();
      await refreshData();
    } catch (err) {
      console.error('Delete inflow failed:', err);
    }
  };

  const totalInflow = inflows.reduce((acc, curr) => acc + curr.amount, 0);
  const totalSpent = poolExpenses.reduce((acc, curr) => acc + curr.amount, 0);
  const remaining = totalInflow - totalSpent;

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-card p-6 rounded-2xl border border-slate-700/60">
        <div>
          <div className="flex items-center gap-2">
            <Landmark className="w-6 h-6 text-sky-400" />
            <h1 className="text-xl font-bold text-white">Rental Income Reserve & Central Cash Pool</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Monthly rental income inflows fund central household bills, maintenance, and utility expenses.
          </p>
        </div>

        <button
          onClick={() => {
            setEditingInflow(null);
            setIsAddInflowOpen(true);
          }}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 shadow-lg shadow-emerald-500/20 transition-all self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          Add Rental Inflow Entry
        </button>
      </div>

      {/* 3 Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        <div className="glass-card rounded-2xl p-5 border border-slate-700/60">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Monthly Rental Inflow</div>
          <div className="text-2xl font-extrabold text-emerald-400 mt-2">₹{totalInflow.toLocaleString('en-IN')}</div>
          <p className="text-[11px] text-slate-400 mt-1">{inflows.length} active rental sources for {activeMonth}</p>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-slate-700/60">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Spent Directly from Reserve</div>
          <div className="text-2xl font-extrabold text-amber-300 mt-2">₹{totalSpent.toLocaleString('en-IN')}</div>
          <p className="text-[11px] text-slate-400 mt-1">{poolExpenses.length} central expenses paid</p>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-slate-700/60">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Remaining Central Cash Balance</div>
          <div className="text-2xl font-extrabold text-sky-300 mt-2">₹{remaining.toLocaleString('en-IN')}</div>
          <p className="text-[11px] text-sky-400 font-medium mt-1">Available for upcoming household bills</p>
        </div>

      </div>

      {/* Two Columns: Rental Inflows List & Funded Expenses List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left: Rental Inflow Entries */}
        <div className="glass-card rounded-2xl p-5 border border-slate-700/60">
          <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Landmark className="w-4 h-4 text-emerald-400" />
              <span>Rental Inflows ({activeMonth})</span>
            </h3>
            <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              ₹{totalInflow.toLocaleString('en-IN')}
            </span>
          </div>

          {inflows.length > 0 ? (
            <div className="space-y-3">
              {inflows.map((item) => (
                <div 
                  key={item.id} 
                  className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs"
                >
                  <div>
                    <div className="font-bold text-slate-200">{item.title}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">Month: {item.month_year}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-sm text-emerald-400 mr-1">
                      ₹{item.amount.toLocaleString('en-IN')}
                    </span>
                    <button
                      onClick={() => handleEditInflow(item)}
                      className="text-slate-400 hover:text-emerald-400 p-1 transition-colors"
                      title="Edit inflow entry"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteInflow(item.id)}
                      className="text-slate-500 hover:text-rose-400 p-1 transition-colors"
                      title="Delete inflow entry"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-500 text-xs">
              No rental inflows recorded for {activeMonth}. Click "+ Add Rental Inflow Entry".
            </div>
          )}
        </div>

        {/* Right: Expenses Funded via Rental Pool */}
        <div className="glass-card rounded-2xl p-5 border border-slate-700/60">
          <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Wallet className="w-4 h-4 text-sky-400" />
              <span>Expenses Funded from Reserve</span>
            </h3>
            <span className="text-xs font-semibold text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
              ₹{totalSpent.toLocaleString('en-IN')}
            </span>
          </div>

          {poolExpenses.length > 0 ? (
            <div className="space-y-3">
              {poolExpenses.map((exp) => (
                <div 
                  key={exp.id} 
                  className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs"
                >
                  <div>
                    <div className="font-bold text-slate-200">{exp.title}</div>
                    <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                      <span>Date: {exp.date}</span>
                      <span>•</span>
                      <span className="text-sky-400 font-medium">{exp.category}</span>
                    </div>
                  </div>
                  <div className="font-extrabold text-sm text-amber-300">
                    ₹{exp.amount.toLocaleString('en-IN')}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-500 text-xs">
              No central expenses deducted from rental pool yet for {activeMonth}.
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
