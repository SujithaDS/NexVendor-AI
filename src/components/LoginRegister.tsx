import React, { useState } from 'react';
import { ShieldCheck, FileText, BarChart3, AlertCircle, Eye, EyeOff, CheckCircle2, RefreshCw } from 'lucide-react';

interface LoginRegisterProps {
  onLoginSuccess: (user: { name: string; email: string }, token: string) => void;
}

export default function LoginRegister({ onLoginSuccess }: LoginRegisterProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // Password toggle states
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleForgotPassword = (e: React.MouseEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email address first to reset your password.');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSuccess(`A password reset link has been simulated & sent to ${email}. Please check your inbox.`);
    }, 800);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (!isLogin && password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    const url = isLogin ? '/api/login' : '/api/signup';
    const payload = isLogin 
      ? { email, password }
      : { name, email, password, confirmPassword };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Something went wrong');
      }

      // Store in localStorage
      localStorage.setItem('vendor_analysis_token', data.token);
      localStorage.setItem('vendor_analysis_user', JSON.stringify(data.user));

      onLoginSuccess(data.user, data.token);
    } catch (err: any) {
      setError(err.message || 'Server error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans bg-cover bg-center bg-no-repeat relative overflow-y-auto"
      style={{ backgroundImage: "url('/src/assets/images/nexvendor_ai_bg_1783338182545.jpg')" }}
    >
      {/* Dark overlay to enhance text readability and glow contrast */}
      <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-[2px]" />

      <div className="relative z-10 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="flex justify-center">
          <div className="bg-indigo-600/95 p-3.5 rounded-2xl shadow-lg shadow-indigo-500/20 ring-1 ring-white/10 animate-pulse">
            <ShieldCheck className="h-10 w-10 text-white" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-display font-extrabold text-white tracking-tight drop-shadow-sm">
          NexVendor AI
        </h2>
        <p className="mt-2 text-center text-sm text-slate-300 max-w-sm mx-auto leading-relaxed">
          Analyze vendor proposals using Artificial Intelligence and choose the best vendor based on quality, price, delivery, experience, compliance, and business requirements.
        </p>
      </div>

      <div className="relative z-10 mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-slate-900/90 py-8 px-4 shadow-2xl border border-slate-800 rounded-2xl sm:px-10 backdrop-blur-md">
          
          {error && (
            <div className="mb-4 bg-red-950/50 border-l-4 border-red-500 p-4 rounded-xl flex items-start space-x-3 ring-1 ring-red-500/15">
              <AlertCircle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
              <p className="text-sm text-red-200 font-medium">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-4 bg-emerald-950/50 border-l-4 border-emerald-500 p-4 rounded-xl flex items-start space-x-3 ring-1 ring-emerald-500/15">
              <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
              <p className="text-sm text-emerald-200 font-medium">{success}</p>
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-slate-300">
                  Full Name
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                    className="appearance-none block w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl shadow-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-white transition-all bg-slate-950/30"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-300">
                Email Address
              </label>
              <div className="mt-1">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="johndoe@company.com"
                  className="appearance-none block w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl shadow-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-white transition-all bg-slate-950/30"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-sm font-medium text-slate-300">
                  Password
                </label>
                {isLogin && (
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 hover:underline transition-colors cursor-pointer"
                  >
                    Forgot Password?
                  </button>
                )}
              </div>
              <div className="relative rounded-xl shadow-sm">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="appearance-none block w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl shadow-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-white transition-all bg-slate-950/30 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-200 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-slate-300">
                  Confirm Password
                </label>
                <div className="mt-1 relative rounded-xl shadow-sm">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="appearance-none block w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl shadow-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-white transition-all bg-slate-950/30 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-200 cursor-pointer"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            )}

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-xl shadow-md text-sm font-semibold text-white bg-indigo-600 disabled:opacity-50 transition-all cursor-pointer shadow-indigo-600/20 hover:bg-indigo-550 hover:bg-indigo-500"
              >
                {loading ? (
                  <span className="flex items-center space-x-2">
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>Processing...</span>
                  </span>
                ) : isLogin ? (
                  'Sign In'
                ) : (
                  'Create Account'
                )}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-800" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-3.5 bg-slate-900 text-slate-400 font-medium">
                  {isLogin ? 'New to the system?' : 'Already have an account?'}
                </span>
              </div>
            </div>

            <div className="mt-6 flex justify-center">
              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError('');
                  setSuccess('');
                }}
                className="text-sm font-semibold text-indigo-400 hover:text-indigo-300 underline transition-colors cursor-pointer"
              >
                {isLogin ? 'Sign up for an account' : 'Log in to your account'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10 mt-12 sm:mx-auto sm:w-full sm:max-w-2xl text-center px-4">
        <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
          Comprehensive Evaluation Standard
        </h4>
        <div className="mt-4 grid grid-cols-3 gap-4">
          <div className="bg-slate-900/60 p-4 border border-slate-800/80 rounded-2xl flex flex-col items-center backdrop-blur-sm">
            <FileText className="h-5 w-5 text-indigo-400 mb-2" />
            <span className="text-xs font-semibold text-slate-300">Proposal Parsing</span>
          </div>
          <div className="bg-slate-900/60 p-4 border border-slate-800/80 rounded-2xl flex flex-col items-center backdrop-blur-sm">
            <BarChart3 className="h-5 w-5 text-emerald-400 mb-2" />
            <span className="text-xs font-semibold text-slate-300">Weighted Rankings</span>
          </div>
          <div className="bg-slate-900/60 p-4 border border-slate-800/80 rounded-2xl flex flex-col items-center backdrop-blur-sm">
            <ShieldCheck className="h-5 w-5 text-amber-400 mb-2" />
            <span className="text-xs font-semibold text-slate-300">Risk Assessment</span>
          </div>
        </div>
      </div>
    </div>
  );
}
