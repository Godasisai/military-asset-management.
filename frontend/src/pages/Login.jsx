import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Shield, ShieldAlert, ArrowRight } from 'lucide-react';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      await login(username, password);
      navigate('/');
    } catch (err) {
      setError(err);
    } finally {
      setSubmitting(false);
    }
  };

  const quickSwitch = (u, p) => {
    setUsername(u);
    setPassword(p);
  };

  const testAccounts = [
    {
      role: 'Global Admin',
      username: 'admin_user',
      pass: 'AdminPass123!',
      scope: 'Global Ops',
      bg: 'border-amber-500/30 text-amber-500 hover:bg-amber-500/5',
    },
    {
      role: 'Base Commander',
      username: 'commander_alpha',
      pass: 'CommandPass123!',
      scope: 'Fort Alpha (Base #1)',
      bg: 'border-emerald-500/30 text-emerald-555 hover:bg-emerald-500/5',
    },
    {
      role: 'Logistics Officer',
      username: 'logistics_officer',
      pass: 'LogisticsPass123!',
      scope: 'Global Logs / Base #1',
      bg: 'border-blue-500/30 text-blue-500 hover:bg-blue-500/5',
    },
  ];

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-12">
      <div className="w-full max-w-lg space-y-8">
        {/* Brand Header */}
        <div className="flex flex-col items-center justify-center text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/35 text-amber-500 pulse-glow-amber">
            <Shield className="h-8 w-8" />
          </div>
          <h2 className="mt-4 font-display text-3xl font-extrabold tracking-wider text-slate-100 uppercase">
            Kristallball
          </h2>
          <p className="mt-1 text-sm font-semibold tracking-widest text-amber-500 uppercase">
            Military Asset Management System
          </p>
        </div>

        {/* Login Form Card */}
        <div className="glass-card rounded-xl p-8 shadow-2xl">
          <h3 className="text-lg font-bold text-slate-200 mb-6">
            Authentication Gate
          </h3>

          {error && (
            <div className="mb-6 flex items-center gap-2.5 rounded border border-red-500/30 bg-red-500/10 p-3.5 text-sm text-red-400">
              <ShieldAlert className="h-5 w-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Operator Username
              </label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full rounded border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-200 placeholder-slate-700 outline-none focus:border-amber-500 transition"
                placeholder="Enter military username..."
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Access Code
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-200 placeholder-slate-700 outline-none focus:border-amber-500 transition"
                placeholder="Enter password..."
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="flex w-full items-center justify-center gap-2 rounded bg-amber-500 px-4 py-3 text-sm font-bold text-slate-950 hover:bg-amber-400 transition disabled:opacity-50 cursor-pointer"
            >
              {submitting ? 'Decrypting Session...' : 'Authorize Terminal'}
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>
        </div>

        {/* Quick Switch Panel */}
        <div className="rounded-xl border border-slate-900 bg-slate-900/30 p-6">
          <h4 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4 text-center">
            Quick Switch Credentials (Testing)
          </h4>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {testAccounts.map((acc) => (
              <button
                key={acc.role}
                onClick={() => quickSwitch(acc.username, acc.pass)}
                className={`flex flex-col items-center justify-center rounded border p-3 text-center transition cursor-pointer ${acc.bg}`}
              >
                <span className="text-xs font-bold">{acc.role}</span>
                <span className="mt-1 text-[10px] font-mono opacity-80">{acc.username}</span>
                <span className="text-[9px] mt-0.5 opacity-50">{acc.scope}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
