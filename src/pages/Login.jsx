import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle login logic here
    console.log('Login attempt:', { email, password, rememberMe });
    // Navigate to dashboard after successful login
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen flex font-inter">
      {/* Left Side - Login Form */}
      <div className="w-full md:w-1/2 bg-white flex flex-col justify-center px-8 md:px-12 lg:px-16">
        <div className="max-w-md w-full mx-auto">
          {/* Logo & Branding */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center space-x-3 mb-6">
              <div className="w-12 h-12 flex items-center justify-center">
                <img src="/cura-logo.png" alt="CURA Logo" className="w-full h-full object-contain" />
              </div>
              <span className="text-3xl font-bold text-slate-900">CURA</span>
            </div>
          </div>

          {/* Welcome Text */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Welcome Back</h1>
            <p className="text-slate-600">Sign in to access your emergency coordination dashboard</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Input */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-slate-800 mb-2">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/10 transition text-slate-900 placeholder-slate-400"
              />
            </div>

            {/* Password Input */}
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-slate-800 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/10 transition text-slate-900 placeholder-slate-400 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3.5 text-slate-500 hover:text-slate-700 transition"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-600 cursor-pointer"
                />
                <span className="text-sm font-medium text-slate-700">Remember me</span>
              </label>
              <a href="#forgot" className="text-sm font-semibold text-emerald-600 hover:text-emerald-700 transition">
                Forgot password?
              </a>
            </div>

            {/* Sign In Button */}
            <button
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-lg transition transform hover:scale-105 active:scale-95"
            >
              Sign In
            </button>
          </form>

          {/* Sign Up Link */}
          <p className="text-center text-slate-600 mt-8">
            Don't have an account?{' '}
            <a href="#signup" className="font-semibold text-emerald-600 hover:text-emerald-700 transition">
              Create one
            </a>
          </p>
        </div>
      </div>

      {/* Right Side - Visual/Image */}
      <div className="hidden md:flex w-1/2 bg-gradient-to-br from-emerald-900 via-emerald-800 to-slate-900 flex-col items-center justify-center relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 -left-4 w-72 h-72 bg-emerald-400 rounded-full mix-blend-multiply filter blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-72 h-72 bg-slate-600 rounded-full mix-blend-multiply filter blur-3xl"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 text-center text-white px-8">
          <h2 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
            Project CURA
          </h2>

          {/* Decorative accent line */}
          <div className="flex justify-center mb-6">
            <div className="w-24 h-1.5 bg-emerald-400 rounded-full"></div>
          </div>

          <p className="text-2xl md:text-3xl font-light text-emerald-100">
            Your safety is our top priority.
          </p>

          {/* Additional benefit text */}
          <div className="mt-12 space-y-3 text-emerald-100">
            <p className="flex items-center justify-center space-x-2">
              <span className="text-2xl">✓</span>
              <span>Real-time coordination</span>
            </p>
            <p className="flex items-center justify-center space-x-2">
              <span className="text-2xl">✓</span>
              <span>Secure communication</span>
            </p>
            <p className="flex items-center justify-center space-x-2">
              <span className="text-2xl">✓</span>
              <span>Multi-agency integration</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
