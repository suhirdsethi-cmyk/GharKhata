import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Plus, Receipt, ShoppingBag, X } from 'lucide-react';

export const FloatingActionButton: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { setIsAddExpenseOpen, setIsAddErrandOpen } = useApp();

  return (
    <>
      {/* Floating Button Anchored Bottom Right Above Bottom Nav */}
      <div className="fixed bottom-[calc(4.5rem+env(safe-area-inset-bottom))] right-4 z-40 no-print">
        <button
          onClick={() => setIsOpen(true)}
          className="w-13 h-13 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center shadow-lg shadow-indigo-500/30 ring-4 ring-indigo-50 transition-all active:scale-95"
          aria-label="Add New"
        >
          <Plus className="w-6 h-6" />
        </button>
      </div>

      {/* Slide-Up Bottom Action Sheet Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end bg-slate-900/40 backdrop-blur-xs no-print animate-in fade-in duration-200">
          <div 
            className="fixed inset-0" 
            onClick={() => setIsOpen(false)} 
          />

          <div className="relative bg-white rounded-t-3xl p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] shadow-2xl space-y-4 animate-bottom-sheet max-w-md mx-auto w-full">
            {/* Drag Handle indicator */}
            <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-1" />

            <div className="flex items-center justify-between pb-1">
              <h3 className="text-base font-bold text-slate-800">Quick Add Action</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-3 pt-1">
              
              {/* Button 1: Add Expense */}
              <button
                onClick={() => {
                  setIsOpen(false);
                  setIsAddExpenseOpen(true);
                }}
                className="flex items-center gap-4 p-4 rounded-2xl bg-indigo-50 hover:bg-indigo-100/80 text-indigo-700 font-bold text-left transition-all border border-indigo-100 min-h-[56px] active:scale-[0.98]"
              >
                <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Receipt className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-extrabold text-indigo-950">+ Add Expense</div>
                  <div className="text-xs text-indigo-600/80 font-normal">Log milk, utilities, repairs, or dining</div>
                </div>
              </button>

              {/* Button 2: Add Errand / Grocery */}
              <button
                onClick={() => {
                  setIsOpen(false);
                  setIsAddErrandOpen(true);
                }}
                className="flex items-center gap-4 p-4 rounded-2xl bg-emerald-50 hover:bg-emerald-100/80 text-emerald-800 font-bold text-left transition-all border border-emerald-100 min-h-[56px] active:scale-[0.98]"
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-extrabold text-emerald-950">+ Add Errand / Grocery</div>
                  <div className="text-xs text-emerald-700/80 font-normal">Add items to live market checklist</div>
                </div>
              </button>

            </div>
          </div>
        </div>
      )}
    </>
  );
};
