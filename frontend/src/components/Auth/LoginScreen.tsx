import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { GoogleLogin } from '@react-oauth/google';
import { Sparkles, Users, Landmark, ShoppingBag, ShieldCheck, ArrowRight, Check, Zap, UserCheck } from 'lucide-react';

export const LoginScreen: React.FC = () => {
  const { loginUserWithGoogle, quickLoginUser } = useApp();
  const [householdCode, setHouseholdCode] = useState('');
  const [customName, setCustomName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGoogleSuccess = async (credentialResponse: any) => {
    if (credentialResponse.credential) {
      try {
        setLoading(true);
        setError('');
        await loginUserWithGoogle(
          credentialResponse.credential,
          householdCode.trim() ? householdCode.trim().toUpperCase() : undefined
        );
      } catch (err: any) {
        setError(err.message || 'Google authentication failed. You can sign in using Quick Member Access above.');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleQuickLogin = async (name: string) => {
    try {
      setLoading(true);
      setError('');
      await quickLoginUser(name, householdCode.trim() ? householdCode.trim().toUpperCase() : undefined);
    } catch (err: any) {
      setError(err.message || 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  const members = [
    { name: 'Suhird Singh', role: 'Admin', color: 'from-blue-600 to-indigo-600' },
    { name: 'Aman Sharma', role: 'Member', color: 'from-emerald-600 to-teal-600' },
    { name: 'Priya Verma', role: 'Member', color: 'from-pink-600 to-rose-600' }
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col justify-center items-center p-4 relative overflow-hidden">
      
      {/* Background Glow Accents */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md space-y-5 relative z-10 py-6">
        
        {/* Header Branding */}
        <div className="text-center space-y-1.5">
          <div className="w-13 h-13 rounded-2xl bg-indigo-600 text-white flex items-center justify-center mx-auto shadow-lg shadow-indigo-500/30 p-2.5">
            <Sparkles className="w-7 h-7 animate-pulse text-amber-300" />
          </div>
          <h1 className="text-3xl font-black tracking-tight text-white">GharKhata</h1>
          <p className="text-xs font-semibold text-slate-400">
            Shared Household Expenses & Rental Income Ledger
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-semibold text-center">
            {error}
          </div>
        )}

        {/* 1. INSTANT ONE-CLICK ACCESS CARD */}
        <div className="bg-slate-800/90 backdrop-blur-md rounded-3xl p-5 border border-indigo-500/30 shadow-2xl space-y-3.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-extrabold text-indigo-300 uppercase tracking-wider">
              <Zap className="w-4 h-4 text-amber-400 fill-amber-400" />
              <span>Instant Access (1-Tap)</span>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-bold border border-indigo-500/30">
              GHAR-SINGHFAMILY
            </span>
          </div>

          <p className="text-[11px] text-slate-300">
            Choose your profile to enter immediately:
          </p>

          <div className="grid grid-cols-1 gap-2">
            {members.map((m) => (
              <button
                key={m.name}
                onClick={() => handleQuickLogin(m.name)}
                disabled={loading}
                className="w-full p-2.5 rounded-2xl bg-slate-900/80 hover:bg-slate-700/80 border border-slate-700 hover:border-indigo-400 transition-all flex items-center justify-between group active:scale-[0.99] text-left"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${m.color} flex items-center justify-center text-xs font-bold text-white shadow-sm`}>
                    {m.name.charAt(0)}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white group-hover:text-indigo-200 transition-colors">
                      {m.name}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {m.role}
                    </div>
                  </div>
                </div>
                <div className="w-7 h-7 rounded-xl bg-slate-800 group-hover:bg-indigo-600 flex items-center justify-center text-slate-400 group-hover:text-white transition-all">
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </button>
            ))}
          </div>

          {/* Custom Name / Guest Input */}
          <div className="pt-2 border-t border-slate-700/60 space-y-2">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Or enter your name..."
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                className="flex-1 px-3 py-2 bg-slate-900/90 border border-slate-700 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
              />
              <button
                onClick={() => customName.trim() && handleQuickLogin(customName.trim())}
                disabled={loading || !customName.trim()}
                className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1"
              >
                <span>Enter</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[10px] text-slate-400">Household:</span>
              <input
                type="text"
                placeholder="GHAR-SINGHFAMILY"
                value={householdCode}
                onChange={(e) => setHouseholdCode(e.target.value)}
                className="flex-1 px-2.5 py-1 bg-slate-900/60 border border-slate-700/80 rounded-lg text-[11px] text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 uppercase"
              />
            </div>
          </div>
        </div>

        {/* Feature Highlights Grid */}
        <div className="bg-slate-800/50 backdrop-blur-md rounded-3xl p-4 border border-slate-700/50 shadow-lg space-y-2.5">
          <div className="space-y-2 text-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-6 h-6 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
                <Users className="w-3.5 h-3.5" />
              </div>
              <span className="text-[11px] text-slate-300">Shared family expenses & automatic debt simplification</span>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                <Landmark className="w-3.5 h-3.5" />
              </div>
              <span className="text-[11px] text-slate-300">Pay bills directly from central rental income cashflow</span>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="w-6 h-6 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center shrink-0">
                <ShoppingBag className="w-3.5 h-3.5" />
              </div>
              <span className="text-[11px] text-slate-300">Live grocery checklist with Market Beacon broadcast</span>
            </div>
          </div>
        </div>

        {/* Optional Google Authentication Section */}
        <div className="bg-slate-800/40 backdrop-blur-md rounded-3xl p-4 border border-slate-700/40 shadow-md text-center space-y-2.5">
          <div className="text-[11px] text-slate-400 font-medium">
            Or sign in with Google Account:
          </div>

          <div className="flex justify-center">
            {loading ? (
              <div className="py-2 px-5 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center gap-2">
                <div className="w-3.5 h-3.5 border-2 border-white border-b-transparent rounded-full animate-spin" />
                <span>Entering...</span>
              </div>
            ) : (
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => setError('Google Authentication Failed. Use Quick Member Access above.')}
                shape="pill"
                size="medium"
                text="continue_with"
              />
            )}
          </div>

          <div className="text-[10px] text-slate-500 flex items-center justify-center gap-1">
            <ShieldCheck className="w-3 h-3 text-emerald-400" />
            <span>Encrypted database & instant offline local backup</span>
          </div>
        </div>

      </div>

    </div>
  );
};
