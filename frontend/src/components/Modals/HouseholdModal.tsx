import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { resetAllData } from '../../api/client';
import { Users, User, Copy, Check, Plus, ArrowRight, X, ShieldCheck, Share2 } from 'lucide-react';

export const HouseholdModal: React.FC = () => {
  const { 
    isHouseholdModalOpen, 
    setIsHouseholdModalOpen, 
    currentUser, 
    users,
    createGroupHousehold, 
    joinUserHousehold, 
    switchUserMode,
    refreshData 
  } = useApp();

  const [copiedCode, setCopiedCode] = useState(false);
  const [modalTab, setModalTab] = useState<'create' | 'join'>('create');
  
  const [customCreateCode, setCustomCreateCode] = useState('');
  const [targetJoinCode, setTargetJoinCode] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loadingAction, setLoadingAction] = useState(false);

  useEffect(() => {
    if (isHouseholdModalOpen) {
      setErrorMsg('');
    }
  }, [isHouseholdModalOpen]);

  if (!isHouseholdModalOpen) return null;

  const isPersonal = currentUser?.active_mode === 'PERSONAL' || currentUser?.household_code?.includes('PERS');

  const handleModeSwitch = async (mode: 'PERSONAL' | 'FAMILY') => {
    try {
      setLoadingAction(true);
      setErrorMsg('');
      await switchUserMode(mode);
      await refreshData();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to switch ledger mode');
    } finally {
      setLoadingAction(false);
    }
  };

  const handleCopyCode = () => {
    if (!currentUser?.household_code) return;
    navigator.clipboard.writeText(currentUser.household_code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleShareWhatsApp = () => {
    if (!currentUser?.household_code) return;
    const text = encodeURIComponent(
      `Hey! Join our family household on GharKhata using our Household Code: ${currentUser.household_code}`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const handleCreateHouseholdSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoadingAction(true);
      setErrorMsg('');
      await createGroupHousehold(customCreateCode.trim() ? customCreateCode.trim().toUpperCase() : undefined);
      setIsHouseholdModalOpen(false);
      setCustomCreateCode('');
      alert('New Household Code created & linked successfully!');
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to create household code');
    } finally {
      setLoadingAction(false);
    }
  };

  const handleJoinHouseholdSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetJoinCode.trim()) return;
    try {
      setLoadingAction(true);
      setErrorMsg('');
      await joinUserHousehold(targetJoinCode.trim().toUpperCase());
      setIsHouseholdModalOpen(false);
      setTargetJoinCode('');
      alert(`Joined Household ${targetJoinCode.toUpperCase()} successfully!`);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to join household code');
    } finally {
      setLoadingAction(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm no-print animate-in fade-in duration-200">
      
      {/* Background Overlay Click to Close */}
      <div 
        className="fixed inset-0" 
        onClick={() => setIsHouseholdModalOpen(false)} 
      />

      {/* Centered Modal Card */}
      <div className="relative bg-white rounded-3xl p-6 shadow-2xl max-w-md w-full space-y-4 border border-slate-100 z-10 max-h-[90vh] overflow-y-auto">
        
        {/* Header & Close Button */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-600" />
            <h3 className="text-base font-black text-slate-900">Family & Personal Ledger</h3>
          </div>
          <button
            onClick={() => setIsHouseholdModalOpen(false)}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Ledger Mode Selector Card */}
        <div className="p-3.5 bg-slate-100/90 rounded-2xl space-y-2 border border-slate-200/60">
          <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">
            Select Active Ledger Mode
          </span>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleModeSwitch('PERSONAL')}
              disabled={loadingAction}
              className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
                isPersonal 
                  ? 'bg-white border-amber-400 shadow-sm text-amber-950 ring-2 ring-amber-400/20' 
                  : 'bg-white/60 border-slate-200 text-slate-600 hover:bg-white'
              }`}
            >
              <div className="flex items-center justify-between">
                <User className={`w-4 h-4 ${isPersonal ? 'text-amber-600' : 'text-slate-400'}`} />
                {isPersonal && <span className="w-2 h-2 rounded-full bg-amber-500"></span>}
              </div>
              <div className="mt-2">
                <span className="text-xs font-black block">Solo Personal</span>
                <span className="text-[10px] text-slate-400 block font-medium">Private ledger</span>
              </div>
            </button>

            <button
              onClick={() => handleModeSwitch('FAMILY')}
              disabled={loadingAction}
              className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
                !isPersonal 
                  ? 'bg-white border-indigo-500 shadow-sm text-indigo-950 ring-2 ring-indigo-500/20' 
                  : 'bg-white/60 border-slate-200 text-slate-600 hover:bg-white'
              }`}
            >
              <div className="flex items-center justify-between">
                <Users className={`w-4 h-4 ${!isPersonal ? 'text-indigo-600' : 'text-slate-400'}`} />
                {!isPersonal && <span className="w-2 h-2 rounded-full bg-indigo-600"></span>}
              </div>
              <div className="mt-2">
                <span className="text-xs font-black block">Family Shared</span>
                <span className="text-[10px] text-slate-400 block font-medium">Synced with family</span>
              </div>
            </button>
          </div>
        </div>

        {/* Active Household Code Badge */}
        {currentUser?.household_code && (
          <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-2xl space-y-2">
            <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider block">
              Current Active Code ({isPersonal ? 'Personal' : 'Family'})
            </span>
            <div className="flex items-center justify-between gap-2">
              <span className="text-lg font-black text-indigo-950 tracking-wider">
                {currentUser.household_code}
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={handleCopyCode}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl flex items-center gap-1 shadow-xs transition-all"
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCode ? 'Copied' : 'Copy'}</span>
                </button>
                <button
                  onClick={handleShareWhatsApp}
                  className="p-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl shadow-xs transition-all"
                  title="Share Code via WhatsApp"
                >
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">
              Share this code with your family members so they can see & edit the same household ledger.
            </p>
          </div>
        )}

        {/* Connected Family Members List */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Family Members ({users.length})
            </h4>
            <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
              Synced Live
            </span>
          </div>

          <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
            {users.map((u: any) => (
              <div 
                key={u.id}
                className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-50 border border-slate-100"
              >
                <div className="flex items-center gap-3">
                  {u.picture ? (
                    <img 
                      src={u.picture} 
                      alt={u.name} 
                      className="w-8 h-8 rounded-full ring-2 ring-indigo-200 object-cover shrink-0" 
                    />
                  ) : (
                    <div 
                      className="w-8 h-8 rounded-full text-white font-bold flex items-center justify-center text-xs shrink-0"
                      style={{ backgroundColor: u.avatar_color || '#4f46e5' }}
                    >
                      {u.name ? u.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                  )}
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-slate-900">{u.name}</span>
                      {u.id === currentUser?.id && (
                        <span className="text-[10px] font-extrabold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">
                          You
                        </span>
                      )}
                    </div>
                    {u.email && (
                      <span className="text-[10px] text-slate-400 block font-medium">
                        {u.email}
                      </span>
                    )}
                  </div>
                </div>

                <span className="text-[10px] font-bold text-slate-500 bg-slate-200/60 px-2 py-0.5 rounded-full capitalize">
                  {u.role || 'Member'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Tab Selector: Create Code vs Join Existing Code */}
        <div className="grid grid-cols-2 gap-1.5 bg-slate-100 p-1 rounded-2xl text-xs font-bold">
          <button
            onClick={() => { setModalTab('create'); setErrorMsg(''); }}
            className={`py-2 rounded-xl transition-all ${
              modalTab === 'create'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            + Create New Code
          </button>
          <button
            onClick={() => { setModalTab('join'); setErrorMsg(''); }}
            className={`py-2 rounded-xl transition-all ${
              modalTab === 'join'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            🔗 Join Family Code
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-50 text-rose-700 text-xs font-semibold">
            {errorMsg}
          </div>
        )}

        {/* Tab 1: Create New Household Code */}
        {modalTab === 'create' && (
          <form onSubmit={handleCreateHouseholdSubmit} className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Custom Code Name <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <input
                type="text"
                placeholder="e.g. SINGHFAMILY (or leave blank for random)"
                value={customCreateCode}
                onChange={(e) => setCustomCreateCode(e.target.value)}
                className="w-full px-3.5 py-3 border border-slate-200 rounded-2xl text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-500 uppercase"
              />
              <p className="text-[10px] text-slate-400 mt-1">
                Generates a new separate household code for family members to share.
              </p>
            </div>

            <button
              type="submit"
              disabled={loadingAction}
              className="w-full py-3.5 rounded-2xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md transition-all flex items-center justify-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>{loadingAction ? 'Generating...' : 'Generate New Household Code'}</span>
            </button>
          </form>
        )}

        {/* Tab 2: Join Existing Household Code */}
        {modalTab === 'join' && (
          <form onSubmit={handleJoinHouseholdSubmit} className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Enter Family Member's Code</label>
              <input
                type="text"
                required
                placeholder="e.g. GHAR-9481"
                value={targetJoinCode}
                onChange={(e) => setTargetJoinCode(e.target.value)}
                className="w-full px-3.5 py-3 border border-slate-200 rounded-2xl text-sm font-extrabold text-indigo-700 tracking-wider text-center uppercase focus:outline-none focus:border-indigo-500"
              />
              <p className="text-[10px] text-slate-400 mt-1 text-center">
                Connects your account to your family member's shared GharKhata.
              </p>
            </div>

            <button
              type="submit"
              disabled={loadingAction}
              className="w-full py-3.5 rounded-2xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md transition-all flex items-center justify-center gap-1.5"
            >
              <ArrowRight className="w-4 h-4" />
              <span>{loadingAction ? 'Connecting...' : 'Connect to Family Household'}</span>
            </button>
          </form>
        )}

      </div>
    </div>
  );
};
