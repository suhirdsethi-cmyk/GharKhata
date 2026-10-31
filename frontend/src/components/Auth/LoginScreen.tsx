import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { GoogleLogin } from '@react-oauth/google';
import { 
  Sparkles, 
  Users, 
  Landmark, 
  ShoppingBag, 
  ShieldCheck, 
  ArrowRight, 
  PlusCircle, 
  KeyRound, 
  Home,
  CheckCircle2,
  Info
} from 'lucide-react';

export const LoginScreen: React.FC = () => {
  const { loginUserWithGoogle, quickLoginUser } = useApp();
  
  const [activeTab, setActiveTab] = useState<'create' | 'join'>('create');
  
  // Create Household state
  const [createName, setCreateName] = useState('');
  const [customCode, setCustomCode] = useState('');

  // Join Household state
  const [joinCode, setJoinCode] = useState('');
  const [joinName, setJoinName] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [inviteDetected, setInviteDetected] = useState(false);

  // Check URL parameters for invite links: ?join=CODE or ?code=CODE
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const code = params.get('join') || params.get('code') || params.get('household');
      if (code) {
        setJoinCode(code.trim().toUpperCase());
        setActiveTab('join');
        setInviteDetected(true);
      }
    } catch (e) {}
  }, []);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createName.trim()) {
      setError('Please enter your name');
      return;
    }
    try {
      setLoading(true);
      setError('');
      await quickLoginUser(
        createName.trim(),
        customCode.trim() ? customCode.trim().toUpperCase() : undefined,
        true // isCreatingNewHousehold
      );
    } catch (err: any) {
      setError(err.message || 'Failed to create new household account');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCode.trim()) {
      setError('Please enter the Household Code (e.g. GHAR-9481)');
      return;
    }
    if (!joinName.trim()) {
      setError('Please enter your name');
      return;
    }
    try {
      setLoading(true);
      setError('');
      await quickLoginUser(
        joinName.trim(),
        joinCode.trim().toUpperCase(),
        false // joining existing
      );
    } catch (err: any) {
      setError(err.message || 'Failed to join family household');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse: any) => {
    if (credentialResponse.credential) {
      try {
        setLoading(true);
        setError('');
        const targetCode = activeTab === 'join' && joinCode.trim()
          ? joinCode.trim().toUpperCase()
          : undefined;

        await loginUserWithGoogle(credentialResponse.credential, targetCode);
      } catch (err: any) {
        setError(err.message || 'Google authentication failed. Please enter your name above.');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleUseDemo = () => {
    setJoinCode('GHAR-SINGHFAMILY');
    setJoinName('Guest Visitor');
    setActiveTab('join');
    setError('');
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col justify-center items-center p-4 relative overflow-hidden">
      
      {/* Background Glow Accents */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md space-y-4 relative z-10 py-6">
        
        {/* Header Branding */}
        <div className="text-center space-y-1">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center mx-auto shadow-lg shadow-indigo-500/30 p-2.5">
            <Sparkles className="w-6 h-6 animate-pulse text-amber-300" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">GharKhata</h1>
          <p className="text-xs font-semibold text-slate-400">
            Shared Household Expenses & Rental Income Ledger
          </p>
        </div>

        {/* Invite Banner if joining from link */}
        {inviteDetected && (
          <div className="p-3 rounded-2xl bg-indigo-500/20 border border-indigo-500/40 text-indigo-200 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              Family invite link detected! Joining household code: <strong className="text-white">{joinCode}</strong>
            </span>
          </div>
        )}

        {error && (
          <div className="p-3 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-semibold text-center">
            {error}
          </div>
        )}

        {/* MAIN CARD CONTAINER */}
        <div className="bg-slate-800/90 backdrop-blur-md rounded-3xl p-5 sm:p-6 border border-slate-700/80 shadow-2xl space-y-4">
          
          {/* TAB SELECTOR: Create Household vs Join Household */}
          <div className="grid grid-cols-2 p-1 bg-slate-900/90 rounded-2xl border border-slate-700/60">
            <button
              type="button"
              onClick={() => { setActiveTab('create'); setError(''); }}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'create'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Home className="w-3.5 h-3.5" />
              <span>New Household</span>
            </button>

            <button
              type="button"
              onClick={() => { setActiveTab('join'); setError(''); }}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'join'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Join Family</span>
            </button>
          </div>

          {/* TAB 1: CREATE NEW HOUSEHOLD (Separate Account) */}
          {activeTab === 'create' && (
            <form onSubmit={handleCreateSubmit} className="space-y-3.5 pt-1">
              <div>
                <h2 className="text-sm font-extrabold text-white">Create Your Household Account</h2>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Start fresh with your own private ledger. A unique Household Code will be generated for your family or flat.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-slate-300">
                  Your Full Name <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Rahul Sharma"
                  value={createName}
                  onChange={(e) => setCreateName(e.target.value)}
                  disabled={loading}
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-900/90 border border-slate-700 rounded-2xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-slate-300">
                  Custom Household Code <span className="text-slate-500 font-normal">(Optional)</span>
                </label>
                <input
                  type="text"
                  placeholder="Leave blank to auto-generate (e.g. GHAR-9481)"
                  value={customCode}
                  onChange={(e) => setCustomCode(e.target.value)}
                  disabled={loading}
                  className="w-full px-3.5 py-2.5 bg-slate-900/90 border border-slate-700 rounded-2xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 uppercase"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition-all disabled:opacity-50"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-b-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <PlusCircle className="w-4 h-4" />
                    <span>Create My Household & Enter</span>
                    <ArrowRight className="w-3.5 h-3.5 ml-auto" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* TAB 2: JOIN AN EXISTING FAMILY (With Code) */}
          {activeTab === 'join' && (
            <form onSubmit={handleJoinSubmit} className="space-y-3.5 pt-1">
              <div>
                <h2 className="text-sm font-extrabold text-white">Join an Existing Family Household</h2>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Enter the code shared with you by your family member or housemate to share their ledger.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-slate-300">
                  Family Household Code <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="e.g. GHAR-SINGHFAMILY or GHAR-9481"
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value)}
                    disabled={loading}
                    required
                    className="w-full px-3.5 py-2.5 bg-slate-900/90 border border-slate-700 rounded-2xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 uppercase"
                  />
                  <KeyRound className="w-4 h-4 text-slate-500 absolute right-3.5 top-3" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-slate-300">
                  Your Full Name <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Priya Verma"
                  value={joinName}
                  onChange={(e) => setJoinName(e.target.value)}
                  disabled={loading}
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-900/90 border border-slate-700 rounded-2xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition-all disabled:opacity-50"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-b-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Users className="w-4 h-4" />
                    <span>Join Family Household</span>
                    <ArrowRight className="w-3.5 h-3.5 ml-auto" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* GOOGLE SIGN IN OR DIVIDER */}
          <div className="pt-2 border-t border-slate-700/60 space-y-2 text-center">
            <div className="text-[10px] text-slate-400 font-medium">
              {activeTab === 'join' && joinCode.trim()
                ? `Or sign in with Google to join ${joinCode.trim().toUpperCase()}:`
                : 'Or continue with Google Account:'}
            </div>

            <div className="flex justify-center">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => setError('Google Authentication Failed. Please use the name form above.')}
                shape="pill"
                size="medium"
                text="continue_with"
              />
            </div>
          </div>

          {/* Demo helper */}
          <div className="pt-2 text-center">
            <button
              type="button"
              onClick={handleUseDemo}
              className="text-[11px] text-indigo-400 hover:text-indigo-300 underline font-semibold transition-colors"
            >
              Want to explore sample demo data? Click here to try GHAR-SINGHFAMILY
            </button>
          </div>

        </div>

        {/* Feature Highlights Grid */}
        <div className="bg-slate-800/40 backdrop-blur-md rounded-3xl p-3.5 border border-slate-700/40 shadow-sm space-y-2">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] text-slate-300">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-md bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
                <Users className="w-3 h-3" />
              </div>
              <span>Shared Family Ledger</span>
            </div>

            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-md bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                <Landmark className="w-3 h-3" />
              </div>
              <span>Rental Reserve Pool</span>
            </div>

            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-md bg-sky-500/20 text-sky-400 flex items-center justify-center shrink-0">
                <ShoppingBag className="w-3 h-3" />
              </div>
              <span>Live Market Beacon</span>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="text-[10px] text-slate-500 flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Each household is strictly isolated with its own private ledger & invite code.</span>
        </div>

      </div>

    </div>
  );
};
