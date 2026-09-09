import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Award, 
  Flame, 
  Network, 
  BookOpen, 
  CheckCircle2, 
  BarChart3, 
  ShieldAlert, 
  User, 
  Zap,
  Layers
} from 'lucide-react';

export default function Navbar({ user, gamification }) {
  const location = useLocation();

  const navLinks = [
    { to: '/', label: 'Dashboard', icon: Layers },
    { to: '/graph', label: 'Competency Graph', icon: Network, highlight: true },
    { to: '/diagnostic', label: 'Diagnostic', icon: CheckCircle2 },
    { to: '/learning', label: 'Learning & Assessment', icon: BookOpen },
    { to: '/gamification', label: 'Badges & Missions', icon: Award },
    { to: '/admin', label: 'Admin Analytics', icon: BarChart3 }
  ];

  return (
    <header className="bg-slate-900/90 backdrop-blur-md border-b border-slate-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & MoSPI Branding */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-sky-500 to-emerald-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 font-bold text-white text-lg">
              Σ
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-lg text-white tracking-tight">StatSkill <span className="text-sky-400">AI</span></span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20">MoSPI — NSO</span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">Competency Intelligence & Learning</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1">
            {navLinks.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.to;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-sky-500/15 text-sky-400 border border-sky-500/30 shadow-sm shadow-sky-500/10'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-sky-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Gamification Stats & User Pill */}
          <div className="flex items-center space-x-3">
            {/* Streak */}
            <div className="flex items-center space-x-1 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold" title="7-Day Streak">
              <Flame className="w-4 h-4 text-amber-500 fill-amber-500 animate-pulse" />
              <span>{gamification?.streak || 7}d</span>
            </div>

            {/* XP & Level */}
            <div className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold">
              <Zap className="w-4 h-4 text-indigo-400 fill-indigo-400" />
              <span>{gamification?.xp || 1650} XP</span>
              <span className="text-slate-600">•</span>
              <span className="text-sky-400 font-bold">{gamification?.level || 'Practitioner'}</span>
            </div>

            {/* User Avatar */}
            <div className="flex items-center space-x-2 pl-2 border-l border-slate-800">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-sky-600 to-indigo-600 flex items-center justify-center text-white font-bold text-xs shadow">
                AS
              </div>
              <div className="hidden lg:block text-left">
                <p className="text-xs font-bold text-white leading-tight">{user?.name || 'Ananya Sharma'}</p>
                <p className="text-[10px] text-slate-400 leading-tight truncate max-w-[140px]">{user?.designation || 'Asst. Director (Price)'}</p>
              </div>
            </div>

          </div>

        </div>
      </div>
    </header>
  );
}
