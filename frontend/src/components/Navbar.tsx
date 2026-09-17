import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { resetAllData } from '../api/client';
import { Calendar, Sparkles, RotateCcw, LogOut, Users, User, Copy, Check, ChevronLeft, ChevronRight } from 'lucide-react';
import { getRecentMonthsList, formatMonthHuman, getPreviousMonthStr, getNextMonthStr } from '../utils/dateUtils';

export const Navbar: React.FC = () => {
  const { 
    activeMonth, 
    setActiveMonth, 
    users, 
    currentUser, 
    setCurrentUser, 
    setIsHouseholdModalOpen,
    switchUserMode,
    logoutUser, 
    refreshData 
  } = useApp();

  const [copiedCode, setCopiedCode] = useState(false);
  const months = getRecentMonthsList(24);

  const handlePrevMonth = () => {
    setActiveMonth(getPreviousMonthStr(activeMonth));
  };

  const handleNextMonth = () => {
    setActiveMonth(getNextMonthStr(activeMonth));
  };

  const isPersonal = currentUser?.active_mode === 'PERSONAL' || currentUser?.household_code?.includes('PERS');

  const handleToggleLedgerMode = async () => {
    if (!currentUser) return;
    const targetMode = isPersonal ? 'FAMILY' : 'PERSONAL';
    try {
      await switchUserMode(targetMode);
      await refreshData();
    } catch (err) {
      console.error('Failed to switch ledger mode:', err);
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
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-100 px-3 py-2.5 shadow-xs no-print">
      <div className="max-w-xl mx-auto flex items-center justify-between gap-2">
        
        {/* Brand Logo & Household Code Badge */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-sm shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-sm font-extrabold text-slate-800 leading-none">GharKhata</h1>
            {currentUser?.household_code && (
              <button
                onClick={handleCopyHouseholdCode}
                className="text-[10px] text-indigo-600 font-bold hover:underline flex items-center gap-1 mt-0.5"
                title="Click to copy Household Code for family members"
              >
                <span>Code: {currentUser.household_code}</span>
                {copiedCode ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
              </button>
            )}
          </div>
        </div>

        {/* Controls: Family Household, Month & User Profile */}
        <div className="flex items-center gap-1.5 min-w-0">
          
          {/* Solo vs Family Mode Switcher Button */}
          {currentUser && (
            <button
              onClick={handleToggleLedgerMode}
              className={`px-2.5 py-1.5 rounded-xl font-bold text-[11px] flex items-center gap-1 border transition-all shrink-0 ${
                isPersonal 
                  ? 'bg-amber-50 hover:bg-amber-100 text-amber-900 border-amber-200' 
                  : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border-indigo-200'
              }`}
              title={isPersonal ? "Currently on Solo Personal Ledger. Click to switch to Shared Family Household." : "Currently on Shared Family Household. Click to switch to Solo Personal Ledger."}
            >
              {isPersonal ? <User className="w-3.5 h-3.5 text-amber-600" /> : <Users className="w-3.5 h-3.5 text-indigo-600" />}
              <span>{isPersonal ? 'Solo Mode' : 'Family Mode'}</span>
            </button>
          )}

          {/* Family Household Settings Button */}
          {currentUser && (
            <button
              onClick={() => setIsHouseholdModalOpen(true)}
              className="px-2 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] flex items-center gap-1 border border-slate-200/80 transition-all shrink-0"
              title="Manage Family Household Code"
            >
              <Users className="w-3.5 h-3.5" />
              <span>Codes</span>
            </button>
          )}

          {/* Month Dropdown & Stepper */}
          <div className="flex items-center gap-0.5 bg-slate-100/90 px-1.5 py-1 rounded-xl text-[11px] font-semibold text-slate-700 shrink-0 border border-slate-200/60">
            <button
              onClick={handlePrevMonth}
              className="p-1 text-slate-500 hover:text-indigo-600 rounded-lg hover:bg-white transition-colors"
              title="Go to Previous Month"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>

            <div className="flex items-center gap-1 px-1">
              <Calendar className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
              <select
                value={activeMonth}
                onChange={(e) => setActiveMonth(e.target.value)}
                className="bg-transparent text-slate-900 font-bold focus:outline-none cursor-pointer text-[11px]"
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
              className="p-1 text-slate-500 hover:text-indigo-600 rounded-lg hover:bg-white transition-colors"
              title="Go to Next Month"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Logged In User Profile & Logout */}
          {currentUser && (
            <div className="flex items-center gap-1 bg-slate-100/90 px-2 py-1.5 rounded-xl text-[11px] font-bold text-slate-700 border border-slate-200/60 shrink-0">
              {currentUser.picture ? (
                <img src={currentUser.picture} alt="Avatar" className="w-4 h-4 rounded-full shrink-0" />
              ) : (
                <div
                  className="w-3.5 h-3.5 rounded-full ring-2 ring-white shrink-0"
                  style={{ backgroundColor: currentUser.avatar_color || '#4f46e5' }}
                />
              )}

              {users.length > 1 ? (
                <select
                  value={currentUser.id}
                  onChange={(e) => {
                    const target = users.find((u: any) => u.id === Number(e.target.value));
                    if (target) setCurrentUser(target);
                  }}
                  className="bg-transparent text-slate-800 font-bold focus:outline-none cursor-pointer max-w-[65px] truncate"
                >
                  {users.map((u: any) => (
                    <option key={u.id} value={u.id} className="bg-white text-slate-800">
                      {u.name.split(' ')[0]}
                    </option>
                  ))}
                </select>
              ) : (
                <span className="font-extrabold text-slate-800 max-w-[65px] truncate">
                  {currentUser.name.split(' ')[0]}
                </span>
              )}

              {/* Logout Button */}
              <button
                onClick={logoutUser}
                className="ml-0.5 text-slate-400 hover:text-rose-600 transition-colors p-0.5"
                title="Log out of Google account"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Reset App / Clear Data */}
          <button
            onClick={handleResetData}
            className="p-1.5 rounded-xl bg-slate-100/80 hover:bg-rose-50 hover:text-rose-600 text-slate-400 transition-colors shrink-0"
            title="Reset to fresh clean slate in MongoDB Atlas"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

        </div>

      </div>
    </header>
  );
};
