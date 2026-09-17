import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { fetchErrands, updateErrand, deleteErrand, createErrand } from '../../api/client';
import { ErrandItem, ErrandStatus } from '../../types';
import { 
  ShoppingBag, 
  Store, 
  PlusCircle, 
  CheckCircle2, 
  Circle, 
  Send, 
  Trash2, 
  Tag, 
  ArrowRight,
  Plus
} from 'lucide-react';

export const ErrandTrackerView: React.FC = () => {
  const { 
    currentUser, 
    setIsAddErrandOpen, 
    setQuickErrandToExpense,
    toggleUserMarketBeacon,
    isCurrentUserAtMarket,
    stats,
    refreshData
  } = useApp();

  const [errands, setErrands] = useState<ErrandItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [inlineItemName, setInlineItemName] = useState('');
  const [isSubmittingInline, setIsSubmittingInline] = useState(false);
  const [recentlyBoughtSnackbarItem, setRecentlyBoughtSnackbarItem] = useState<ErrandItem | null>(null);

  const loadErrands = async () => {
    try {
      setLoading(true);
      const data = await fetchErrands(
        selectedCategory === 'ALL' ? undefined : selectedCategory,
        undefined,
        currentUser?.household_code
      );
      setErrands(data);
    } catch (err) {
      console.error('Failed loading errands:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadErrands();
  }, [selectedCategory, currentUser?.household_code]);

  const handleToggleBought = async (item: ErrandItem) => {
    const nextStatus: ErrandStatus = item.status === 'BOUGHT' ? 'PENDING' : 'BOUGHT';
    try {
      await updateErrand(item.id, { status: nextStatus });
      await loadErrands();
      await refreshData();

      if (nextStatus === 'BOUGHT') {
        setRecentlyBoughtSnackbarItem(item);
      }
    } catch (err) {
      console.error('Failed toggling status:', err);
    }
  };

  const handleInlineQuickAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inlineItemName.trim() || !currentUser) return;
    try {
      setIsSubmittingInline(true);
      await createErrand({
        name: inlineItemName,
        category: selectedCategory === 'ALL' ? 'Vegetables & Fruit' : selectedCategory,
        added_by_id: currentUser.id,
        household_code: currentUser.household_code
      });
      setInlineItemName('');
      await loadErrands();
      await refreshData();
    } catch (err) {
      console.error('Failed inline quick add:', err);
    } finally {
      setIsSubmittingInline(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteErrand(id);
      await loadErrands();
      await refreshData();
    } catch (err) {
      console.error('Failed deleting errand:', err);
    }
  };

  const categories = ['ALL', 'Vegetables & Fruit', 'Dairy & Bread', 'Spices & Staples', 'Chemist/Pharmacy', 'Hardware/Repairs', 'Miscellaneous'];
  const activeShoppers = stats?.active_market_beacons.filter((b: any) => b.is_active) || [];

  return (
    <div className="space-y-4 max-w-xl mx-auto pb-8">
      
      {/* 1. STICKY MARKET BEACON BANNER WITH QUICK INLINE INPUT */}
      <div className={`rounded-3xl p-5 border transition-all ${
        activeShoppers.length > 0
          ? 'bg-sky-50 border-sky-200 text-sky-900 shadow-sm'
          : 'bg-white border-slate-100 shadow-sm'
      }`}>
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className={`w-9 h-9 rounded-2xl flex items-center justify-center ${
              activeShoppers.length > 0 ? 'bg-sky-600 text-white animate-pulse' : 'bg-slate-100 text-slate-600'
            }`}>
              <Store className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-extrabold">
                {activeShoppers.length > 0 
                  ? `🛒 ${activeShoppers.map((s: any) => s.user?.name.split(' ')[0]).join(', ')} is at the market right now!`
                  : "Market Beacon Status"
                }
              </h2>
              <p className="text-[11px] text-slate-500 font-medium">
                {activeShoppers.length > 0 
                  ? "Send any pending grocery requests directly!"
                  : "Tap to alert family when you go shopping."
                }
              </p>
            </div>
          </div>

          <button
            onClick={toggleUserMarketBeacon}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              isCurrentUserAtMarket
                ? 'bg-sky-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {isCurrentUserAtMarket ? "I'm Done" : "I'm Shopping"}
          </button>
        </div>

        {/* Quick Inline Add Input under Sticky Banner */}
        <form onSubmit={handleInlineQuickAdd} className="mt-3 flex items-center gap-2">
          <input
            type="text"
            placeholder="Quick-add an item (e.g. Milk 2L)..."
            value={inlineItemName}
            onChange={(e) => setInlineItemName(e.target.value)}
            className="flex-1 px-3.5 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs text-slate-800 focus:outline-none focus:border-indigo-500 shadow-xs min-h-[44px]"
          />
          <button
            type="submit"
            disabled={isSubmittingInline || !inlineItemName.trim()}
            className="w-11 h-11 rounded-2xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white flex items-center justify-center shrink-0 shadow-xs transition-all"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* 2. CATEGORY SELECTION CHIPS */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              selectedCategory === cat
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-100 hover:bg-slate-50'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* 3. CHECKABLE GROCERY ITEMS LIST */}
      <div className="space-y-2">
        {errands.length > 0 ? (
          errands.map((item) => {
            const isBought = item.status === 'BOUGHT';
            return (
              <div 
                key={item.id}
                className={`bg-white rounded-2xl p-4 border transition-all flex items-center justify-between gap-3 min-h-[56px] ${
                  isBought ? 'border-slate-100 opacity-60' : 'border-slate-100 shadow-sm light-card-hover'
                }`}
              >
                <div 
                  onClick={() => handleToggleBought(item)}
                  className="flex items-center gap-3.5 flex-1 cursor-pointer min-h-[44px]"
                >
                  {/* Single Tap Circle Checkbox */}
                  <div className="shrink-0">
                    {isBought ? (
                      <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                    ) : (
                      <Circle className="w-6 h-6 text-slate-300 hover:text-emerald-500 transition-colors" />
                    )}
                  </div>

                  <div>
                    <span className={`text-sm font-bold block ${
                      isBought ? 'line-through text-slate-400' : 'text-slate-800'
                    }`}>
                      {item.name}
                    </span>
                    <span className="text-[11px] text-slate-400 font-medium">
                      {item.category} • Added by {item.added_by?.name?.split(' ')[0] || 'Member'}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => handleDelete(item.id)}
                  className="text-slate-300 hover:text-rose-500 p-2 shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            );
          })
        ) : (
          <div className="bg-white rounded-2xl p-8 text-center border border-slate-100 text-slate-400 text-xs">
            No items found in grocery checklist.
          </div>
        )}
      </div>

      {/* 4. RECENTLY BOUGHT SNACKBAR POPUP */}
      {recentlyBoughtSnackbarItem && (
        <div className="fixed bottom-20 inset-x-4 max-w-md mx-auto z-40 bg-slate-900 text-white p-4 rounded-2xl shadow-xl flex items-center justify-between gap-3 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <div className="text-xs">
            <span className="font-bold text-emerald-400">✓ Moved to bought:</span>
            <span className="ml-1 font-semibold text-slate-200">{recentlyBoughtSnackbarItem.name}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setQuickErrandToExpense(recentlyBoughtSnackbarItem);
                setRecentlyBoughtSnackbarItem(null);
              }}
              className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition-all shadow-xs"
            >
              + Add Price
            </button>
            <button
              onClick={() => setRecentlyBoughtSnackbarItem(null)}
              className="text-slate-400 hover:text-white text-xs font-semibold px-1"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
