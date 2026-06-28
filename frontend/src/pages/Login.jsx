import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/ui/Toast';
import { login as loginService } from '../services/authService';

export default function Login() {
  // 1. Core Logic State Variables
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login: setAuthUser } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  // 2. Handle Form Submit for traditional email login
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      showToast('Please fill in all fields', 'error');
      return;
    }

    try {
      setIsLoading(true);
      const data = await loginService(email, password);
      setAuthUser(data);
      showToast('Welcome back, Chief!', 'success');
      navigate('/dashboard');
    } catch (error) {
      showToast(error.response?.data?.message || 'Invalid credentials', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // 3. Initiate OAuth Google Redirect Flow
  const handleGoogleSignIn = () => {
    const apiBase = (import.meta.env.VITE_API_URL || 'http://localhost:8080/api').replace(/\/api$/, '');
    window.location.href = `${apiBase}/api/auth/google`;
  };

  return (
    <div className="min-h-screen bg-[#0D1B2A] text-slate-100 flex font-sans">
      
      {/* LEFT SIDE: VALUE PROP & CONCEPT */}
      <aside className="hidden lg:flex w-1/2 bg-[#1B263B] p-12 flex-col justify-between border-r border-slate-700/50">
        <div>
          <div className="flex items-center gap-3 mb-16">
            <div className="h-10 w-10 rounded-xl bg-[#00B4D8] flex items-center justify-center shadow-lg shadow-[#00B4D8]/30">
              <span className="text-2xl">⚓</span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tighter bg-gradient-to-r from-white to-[#00B4D8] bg-clip-text text-transparent">
              LifeSaver AI
            </h1>
          </div>
          
          <div className="space-y-6 max-w-lg">
            <h2 className="text-5xl font-bold tracking-tight leading-tight">
              Your AI doesn't just remind you. 
              <span className="text-[#06D6A0]"> It plans for you.</span>
            </h2>
            <p className="text-lg text-slate-400">
              Describe any goal with a deadline. LifeSaver AI autonomously breaks it into a step-by-step plan, adapts when you fall behind, and syncs everything to Google Calendar — all without lifting a finger.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm text-slate-500">
          <span>Powered by Gemini 1.5 Pro</span>
          <span className="text-[#00B4D8]">✦</span>
          <span>Google AI Studio</span>
        </div>
      </aside>

      {/* RIGHT SIDE: FUNCTIONAL FORM & INTERACTION */}
      <main className="w-full lg:w-1/2 p-6 sm:p-12 flex flex-col justify-center items-center">
        
        <div className="w-full max-w-md p-8 sm:p-10 bg-[#1B263B] rounded-3xl border border-slate-700/40 shadow-2xl shadow-black/30 mb-8">
          <h3 className="text-2xl font-semibold mb-2">Welcome Back, Chief</h3>
          <p className="text-slate-400 mb-8">Gemini is actively monitoring your critical deadlines.</p>

          {/* Google Sign-In Action Component */}
          <button 
            onClick={handleGoogleSignIn}
            className="w-full mb-6 flex items-center justify-center gap-3 py-3.5 bg-white text-slate-900 font-semibold rounded-xl hover:bg-slate-100 transition-all transform active:scale-95 shadow-md"
          >
            <img src="https://authjs.dev/img/providers/google.svg" alt="Google" className="h-5 w-5"/>
            Sign In with Google
          </button>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-700/50"></div></div>
            <div className="relative flex justify-center text-xs uppercase"><span className="bg-[#1B263B] px-3 text-slate-500">Or use email</span></div>
          </div>

          {/* Form Handler Integration */}
          <form onSubmit={handleSubmit} className="space-y-4 mb-6">
            <div>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email Address" 
                className="w-full px-5 py-3.5 bg-slate-800 rounded-xl border border-slate-700/50 focus:ring-2 focus:ring-[#00B4D8] focus:border-[#00B4D8] transition outline-none"
              />
            </div>
            <div>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password" 
                className="w-full px-5 py-3.5 bg-slate-800 rounded-xl border border-slate-700/50 focus:ring-2 focus:ring-[#00B4D8] focus:border-[#00B4D8] transition outline-none"
              />
            </div>

            <button 
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium rounded-xl border border-slate-700/50 transition duration-200 disabled:opacity-50"
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="text-center text-sm text-slate-400">
            Don't have an account?{' '}
            <Link to="/register" className="text-[#00B4D8] hover:underline">
              Get Started for Free
            </Link>
          </div>
        </div>

        {/* Live Simulation Feed Panel */}
        <div className="w-full max-w-md p-6 bg-[#1B263B] rounded-2xl border border-slate-700/40 shadow-xl">
          <h3 className="text-sm font-semibold mb-3 tracking-wider text-slate-400 uppercase">Live Agent Triage Log</h3>
          <div className="space-y-3 text-xs">
            <div className="p-3 bg-slate-800/50 rounded-lg border-l-2 border-[#00B4D8]">
              <p className="text-[#00B4D8] font-semibold">🤖 AI Intervention • Pushed milestone forward by 2h</p>
            </div>
            <div className="p-3 bg-slate-800/50 rounded-lg border-l-2 border-[#06D6A0]">
              <p className="text-[#06D6A0] font-semibold">📅 Calendar Synced • Locked 4 dynamic objects</p>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}