import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { GoogleLogin } from '@react-oauth/google';
import { Sparkles, Users, Landmark, ShoppingBag, Scale, ShieldCheck, ArrowRight, Check } from 'lucide-react';

export const LoginScreen: React.FC = () => {
  const { loginUserWithGoogle } = useApp();
  const [householdCode, setHouseholdCode] = useState('');
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
        setError(err.message || 'Google authentication failed');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col justify-center items-center p-4 relative overflow-hidden">
      
      {/* Background Glow Accents */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md space-y-6 relative z-10">
        
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white flex items-center justify-center mx-auto shadow-lg shadow-indigo-500/30">
            <Sparkles className="w-8 h-8 animate-pulse" />
          </div>
          <h1 className="text-3xl font-black tracking-tight text-white">GharKhata</h1>
          <p className="text-xs font-semibold text-slate-400">
            Shared Household Expenses & Rental Income Ledger
          </p>
        </div>

        {/* Feature Highlights Grid */}
        <div className="bg-slate-800/60 backdrop-blur-md rounded-3xl p-5 border border-slate-700/60 shadow-xl space-y-3">
          <h2 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-2">
            Why GharKhata?
          </h2>

          <div className="space-y-2.5 text-xs">
            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0 mt-0.5">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-slate-200">Family Household Sharing</span>
                <p className="text-[11px] text-slate-400">Connect family members using a shared Household Code (e.g. GHAR-9481).</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                <Landmark className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-slate-200">Rental Income Reserve</span>
                <p className="text-[11px] text-slate-400">Fund central electricity, milk, & maintenance bills directly from rental cash.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center shrink-0 mt-0.5">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-slate-200">Live Market Beacon</span>
                <p className="text-[11px] text-slate-400">Alert housemates when shopping & check off errands in real-time.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Google Authentication Box */}
        <div className="bg-slate-800/80 backdrop-blur-md rounded-3xl p-6 border border-slate-700/80 shadow-2xl space-y-4">
          <div className="text-center">
            <h3 className="text-sm font-bold text-white">Sign In to Access Household</h3>
            <p className="text-[11px] text-slate-400 mt-0.5">Sign in securely with your Google account</p>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-semibold text-center">
              {error}
            </div>
          )}

          {/* Optional Join Family Household Input */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-bold text-slate-300">
              Have a Family Household Code? <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <input
              type="text"
              placeholder="e.g. GHAR-9481 (Leave blank to create new)"
              value={householdCode}
              onChange={(e) => setHouseholdCode(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-900/90 border border-slate-700 rounded-2xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Prominent Google Login Button */}
          <div className="flex justify-center pt-2">
            {loading ? (
              <div className="py-2.5 px-6 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-b-transparent rounded-full animate-spin" />
                <span>Signing in...</span>
              </div>
            ) : (
              <div className="scale-105">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() => setError('Google Authentication Failed')}
                  shape="pill"
                  size="large"
                  text="continue_with"
                />
              </div>
            )}
          </div>

          <div className="text-[10px] text-center text-slate-500 flex items-center justify-center gap-1 pt-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Encrypted database powered by MongoDB Atlas & Google OAuth</span>
          </div>

        </div>

      </div>

    </div>
  );
};
