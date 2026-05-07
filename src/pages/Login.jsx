import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import {
  EnvelopeIcon,
  LockClosedIcon,
} from '@heroicons/react/24/outline';
import { supabase } from '../lib/supabase';

export default function Login() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);

    if (!authError && data?.user) {
      const role = data.user.user_metadata?.role ?? 'citizen';
      if (role === 'station') navigate('/station');
      else navigate('/dashboard');
      return;
    }

    // Fallback: legacy hardcoded navigation (dev convenience)
    if (email === 'stations@email.com') { navigate('/station'); return; }
    if (email.includes('@') && password) { navigate('/dashboard'); return; }

    setError(authError?.message ?? 'Invalid email or password.');
  };

  return (
    <div className="min-h-screen flex font-inter">

      {/* Left Side — Login Form */}
      <div className="w-full md:w-1/2 bg-white flex flex-col justify-center px-8 md:px-12 lg:px-16 relative overflow-hidden">
        {/* Subtle background decorations */}
        <div className="absolute -top-20 -right-20 w-72 h-72 bg-emerald-50 rounded-full opacity-60 pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-52 h-52 bg-slate-50 rounded-full pointer-events-none" />

        <div className="max-w-md w-full mx-auto relative z-10">

          {/* Logo + Authorized badge */}
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center space-x-3">
              <div className="w-11 h-11 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center justify-center">
                <img src="/cura-logo.png" alt="CURA Logo" className="w-8 h-8 object-contain" />
              </div>
              <div>
                <div className="text-xl font-black text-slate-900 tracking-tight">CURA</div>
              </div>
            </div>
          </div>

          {/* Welcome text */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Welcome back</h1>
            <p className="text-slate-500 text-sm">Sign in to access the emergency coordination dashboard</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <EnvelopeIcon className="w-5 h-5 text-slate-400" />
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="operator@cura.gov.ph"
                  className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 transition-all text-slate-900 placeholder-slate-400 bg-slate-50 focus:bg-white text-sm"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-slate-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <LockClosedIcon className="w-5 h-5 text-slate-400" />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-11 py-3 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 transition-all text-slate-900 placeholder-slate-400 bg-slate-50 focus:bg-white text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Remember me + Forgot */}
            <div className="flex items-center justify-between">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                />
                <span className="text-sm text-slate-600">Remember me</span>
              </label>
              <a href="#forgot" className="text-sm font-semibold text-emerald-600 hover:text-emerald-700 transition-colors">
                Forgot password?
              </a>
            </div>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-bold py-3.5 rounded-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-emerald-600/20"
            >
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          {/* Footer links */}
          <div className="mt-8 pt-6 border-t border-slate-100">
            <p className="text-center text-sm text-slate-500">
              Need access?{' '}
              <a href="#admin" className="font-semibold text-emerald-600 hover:text-emerald-700 transition-colors">
                Contact your system administrator
              </a>
            </p>
          </div>

          <p className="text-center text-xs text-slate-400 mt-4">
            © 2026 VERPTO · CURA Emergency Coordination Platform
          </p>
        </div>
      </div>

      {/* Right Side — Visual Panel */}
      <div className="hidden md:flex w-1/2 bg-gradient-to-br from-emerald-950 via-emerald-900 to-slate-900 items-center justify-center relative overflow-hidden">

        {/* Background layers */}
        <div className="absolute inset-0 pointer-events-none">
          <div
            className="absolute inset-0 opacity-[0.06]"
            style={{
              backgroundImage:
                'linear-gradient(rgba(255,255,255,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.4) 1px, transparent 1px)',
              backgroundSize: '48px 48px',
            }}
          />
          <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-emerald-500/15 rounded-full blur-[120px]" />
          <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-teal-400/10 rounded-full blur-[100px]" />
        </div>

        {/* Centered logo + wordmark */}
        <div className="relative z-10 flex flex-col items-center text-center">
          <img src="/cura-logo.png" alt="CURA Logo" className="w-28 h-28 object-contain mb-8 drop-shadow-2xl" />
          <h2 className="text-6xl font-black text-white leading-none mb-3">
            Project <span className="text-emerald-400">CURA</span>
          </h2>
          <div className="w-16 h-1 bg-emerald-400 rounded-full mb-6" />
          <p className="text-emerald-100/70 text-lg font-light tracking-wide">
            Your safety is our top priority.
          </p>
        </div>
      </div>
    </div>
  );
}
