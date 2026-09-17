import React from 'react';
import { useApp } from '../context/AppContext';
import { ShoppingBag, PlusCircle } from 'lucide-react';

export const MarketBeaconBanner: React.FC = () => {
  const { stats, setActiveTab, setIsAddErrandOpen } = useApp();

  if (!stats || !stats.active_market_beacons || stats.active_market_beacons.length === 0) {
    return null;
  }

  const activeShoppers = stats.active_market_beacons.filter((b: any) => b.is_active);
  if (activeShoppers.length === 0) return null;

  return (
    <div className="bg-sky-50 text-sky-900 px-4 py-3 border-b border-sky-200 no-print animate-pulse">
      <div className="max-w-xl mx-auto flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-sky-600 text-white flex items-center justify-center shrink-0">
            <ShoppingBag className="w-4 h-4" />
          </div>
          <div className="text-xs font-semibold">
            <span className="font-extrabold text-sky-950">
              🛒 {activeShoppers.map((s: any) => s.user?.name.split(' ')[0]).join(', ')} is shopping!
            </span>
            <span className="block text-[11px] text-sky-700">Add pending grocery items now</span>
          </div>
        </div>

        <button
          onClick={() => {
            setActiveTab('market');
            setIsAddErrandOpen(true);
          }}
          className="flex items-center gap-1 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow-xs shrink-0"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span>Add Item</span>
        </button>
      </div>
    </div>
  );
};
