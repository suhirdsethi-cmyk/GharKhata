import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { resetAllData } from '../api/client';
import { Calendar, Sparkles, RotateCcw, LogOut, Users, User, Copy, Check, ChevronLeft, ChevronRight, Loader2, KeyRound } from 'lucide-react';
import { getRecentMonthsList, formatMonthHuman, getPreviousMonthStr, getNextMonthStr } from '../utils/dateUtils';

export const Navbar: React.FC = () => {
  const { 
    activeMonth, 
    setActiveMonth, 
    currentUser, 
    setIsHouseholdModalOpen,
    switchUserMode,
    logoutUser, 
    refreshData 
  } = useApp();

  const [copiedCode, setCopiedCode] = useState(false);
  const [isSwitchingMode, setIsSwitchingMode] = useState(false);
  const months = getRecentMonthsList(24);

  const handlePrevMonth = () => {
    setActiveMonth(getPreviousMonthStr(activeMonth));
  };

  const handleNextMonth = () => {
    setActiveMonth(getNextMonthStr(activeMonth));
  };

  const isPersonal = currentUser?.active_mode === 'PERSONAL' || currentUser?.household_code?.includes('PERS');

  const handleToggleLedgerMode = async () => {
    if (!currentUser || isSwitchingMode) return;
    const targetMode = isPersonal ? 'FAMILY' : 'PERSONAL';
    try {
      setIsSwitchingMode(true);
      await switchUserMode(targetMode);
    } catch (err) {
      console.error('Failed to switch ledger mode:', err);
    } finally {
      setIsSwitchingMode(false);
    }
  };

  const handleCopyHouseholdCode = () => {
    if (!currentUser?.household_code) return;
    navigator.clipboard.writeText(currentUser.household_code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleResetData = async () => {
    if (!window.confirm('Reset all expenses, inflows, errands, and settlements to start 100% fresh?')) return;
    try {
      await resetAllData(currentUser?.household_code);
      await refreshData();
      alert('App reset successfully! You are now on a 100% fresh clean slate in MongoDB Atlas.');
    } catch (err) {
      console.error('Failed to reset app:', err);
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-xs no-print pt-[env(safe-area-inset-top,0px)]">
      <div className="max-w-md mx-auto px-3.5 py-2.5 space-y-2">
        
        {/* Main Row: Logo & Profile / Mode Controls */}
        <div className="flex items-center justify-between gap-2">
          
          {/* Brand Logo & Household Code */}
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-sm shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h1 className="text-sm font-extrabold text-slate-800 leading-none">GharKhata</h1>
              {currentUser?.household_code && (
                <button
                  onClick={handleCopyHouseholdCode}
                  className="text-[10px] text-indigo-600 font-bold hover:underline flex items-center gap-1 mt-0.5"
                  title="Click to copy Household Code"
                >
                  <span className="truncate max-w-[95px]">{currentUser.household_code}</span>
                  {copiedCode ? <Check className="w-3 h-3 text-emerald-600 shrink-0" /> : <Copy className="w-3 h-3 shrink-0" />}
                </button>
              )}
            </div>
          </div>

          {/* Right Controls: Mode Toggle & User Avatar */}
          <div className="flex items-center gap-1.5 shrink-0">
            
            {/* Solo vs Family Mode Switcher */}
            {currentUser && (
              <button
                onClick={handleToggleLedgerMode}
                disabled={isSwitchingMode}
                className={`px-2.5 py-1.5 rounded-xl font-bold text-[11px] flex items-center gap-1 border transition-all shrink-0 active:scale-95 ${
                  isPersonal 
                    ? 'bg-amber-50 hover:bg-amber-100 text-amber-900 border-amber-200' 
                    : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border-indigo-200'
                } ${isSwitchingMode ? 'opacity-70 cursor-wait' : ''}`}
                title={isPersonal ? "Switch to Family Household" : "Switch to Solo Personal"}
              >
                {isSwitchingMode ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-600" />
                ) : isPersonal ? (
                  <User className="w-3.5 h-3.5 text-amber-600" />
                ) : (
                  <Users className="w-3.5 h-3.5 text-indigo-600" />
                )}
                <span>{isSwitchingMode ? '...' : isPersonal ? 'Solo' : 'Family'}</span>
              </button>
            )}

            {/* Codes Button */}
            {currentUser && (
              <button
                onClick={() => setIsHouseholdModalOpen(true)}
                className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200/80 transition-all shrink-0"
                title="Manage Household Codes"
              >
                <KeyRound className="w-4 h-4 text-slate-600" />
              </button>
            )}

            {/* Profile Avatar & Logout */}
            {currentUser && (
              <div className="flex items-center gap-1 bg-slate-100/90 pl-1.5 pr-1 py-1 rounded-xl text-[11px] font-bold text-slate-700 border border-slate-200/60 shrink-0">
                {currentUser.picture ? (
                  <img src={currentUser.picture} alt="Avatar" className="w-5 h-5 rounded-full shrink-0" />
                ) : (
                  <div
                    className="w-4 h-4 rounded-full ring-2 ring-white shrink-0"
                    style={{ backgroundColor: currentUser.avatar_color || '#4f46e5' }}
                  />
                )}
                <button
                  onClick={logoutUser}
                  className="p-1 text-slate-400 hover:text-rose-600 transition-colors rounded-lg hover:bg-white"
                  title="Log out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

          </div>
        </div>

        {/* Second Sub-Row: Month Stepper & Reset Button */}
        <div className="flex items-center justify-between gap-2 pt-0.5">
          
          {/* Month Stepper & Selector */}
          <div className="flex-1 flex items-center justify-between bg-slate-100/90 px-2 py-1 rounded-xl text-[11px] font-semibold text-slate-700 border border-slate-200/60 min-w-0">
            <button
              onClick={handlePrevMonth}
              className="p-1 text-slate-500 hover:text-indigo-600 rounded-lg hover:bg-white transition-colors shrink-0"
              title="Previous Month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-1.5 px-1 min-w-0">
              <Calendar className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
              <select
                value={activeMonth}
                onChange={(e) => setActiveMonth(e.target.value)}
                className="bg-transparent text-slate-900 font-bold focus:outline-none cursor-pointer text-xs truncate max-w-[140px]"
              >
                {months.map((m) => (
                  <option key={m} value={m} className="bg-white text-slate-800">
                    {formatMonthHuman(m)}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handleNextMonth}
              className="p-1 text-slate-500 hover:text-indigo-600 rounded-lg hover:bg-white transition-colors shrink-0"
              title="Next Month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Reset App Button */}
          <button
            onClick={handleResetData}
            className="p-1.5 rounded-xl bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-400 transition-colors shrink-0 border border-slate-200/60"
            title="Reset to fresh clean slate in MongoDB Atlas"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

        </div>

      </div>
    </header>
  );
};
