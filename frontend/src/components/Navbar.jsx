import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, Shield, MapPin, User as UserIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
      <div className="flex h-16 items-center justify-between px-6">
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-500 pulse-glow-amber">
            <Shield className="h-6 w-6" />
          </div>
          <div>
            <span className="font-display text-xl font-extrabold tracking-wider text-slate-100">
              KRISTALLBALL
            </span>
            <span className="ml-1 text-xs font-semibold tracking-widest text-amber-500">
              MAMS
            </span>
          </div>
        </div>

        {user && (
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-4 text-sm text-slate-400">
              <div className="flex items-center gap-1 bg-slate-900/60 px-3 py-1.5 rounded border border-slate-800">
                <UserIcon className="h-4 w-4 text-amber-500" />
                <span className="font-semibold text-slate-200">{user.username}</span>
                <span className="text-xs px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                  {user.role}
                </span>
              </div>

              <div className="flex items-center gap-1 bg-slate-900/60 px-3 py-1.5 rounded border border-slate-800">
                <MapPin className="h-4 w-4 text-emerald-500" />
                <span className="text-slate-200">
                  {user.role === 'ADMIN' ? 'Global Control' : user.baseName || `Base #${user.baseId}`}
                </span>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 rounded bg-slate-905 border border-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-350 hover:bg-slate-900 hover:text-red-400 transition cursor-pointer"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
