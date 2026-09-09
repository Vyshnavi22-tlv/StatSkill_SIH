import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Award, 
  Flame, 
  Network, 
  BookOpen, 
  CheckCircle2, 
  BarChart3, 
  Zap,
  Layers,
  BrainCircuit,
  Menu,
  X
} from 'lucide-react';

export default function Navbar({ user, gamification }) {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { to: '/', label: 'Dashboard', icon: Layers },
    { to: '/graph', label: 'Competency Graph', icon: Network },
    { to: '/diagnostic', label: 'Diagnostic', icon: CheckCircle2 },
    { to: '/learning', label: 'Learning & Assessment', icon: BookOpen },
    { to: '/mentor', label: 'AI Mentor', icon: BrainCircuit },
    { to: '/gamification', label: 'Badges & Missions', icon: Award },
    { to: '/admin', label: 'Admin Analytics', icon: BarChart3 }
  ];

  return (
    <header className="bg-slate-900/95 backdrop-blur-md border-b border-slate-800 sticky top-0 z-50">
      <div className="max-w-[1440px] mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & MoSPI Branding */}
          <Link to="/" className="flex items-center space-x-2.5 flex-shrink-0 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 via-sky-500 to-emerald-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 font-bold text-white text-base group-hover:scale-105 transition flex-shrink-0">
              Σ
            </div>
            <div className="flex flex-col justify-center">
              <div className="flex items-center space-x-1.5 leading-none">
                <span className="font-extrabold text-base text-white tracking-tight whitespace-nowrap">
                  StatSkill <span className="text-sky-400">AI</span>
                </span>
                <span className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20 whitespace-nowrap">
                  MoSPI — NSO
                </span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1 hidden sm:block whitespace-nowrap leading-none">
                Competency Intelligence & Learning
              </p>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden xl:flex items-center space-x-1 flex-shrink-0">
            {navLinks.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.to;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-sky-500/15 text-sky-400 border border-sky-500/30 shadow-sm shadow-sky-500/10'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 flex-shrink-0 ${isActive ? 'text-sky-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Medium Screen (lg) Compact Navigation */}
          <nav className="hidden md:flex xl:hidden items-center space-x-1 flex-shrink-0">
            {navLinks.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.to;
              const shortLabels = {
                '/': 'Dashboard',
                '/graph': 'Graph',
                '/diagnostic': 'Diagnostic',
                '/learning': 'Learning',
                '/mentor': 'Mentor',
                '/gamification': 'Badges',
                '/admin': 'Admin'
              };
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  title={item.label}
                  className={`flex items-center space-x-1 px-2 py-1.5 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-sky-500/15 text-sky-400 border border-sky-500/30'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 flex-shrink-0 ${isActive ? 'text-sky-400' : 'text-slate-400'}`} />
                  <span>{shortLabels[item.to] || item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Gamification Stats & User Profile Shelf */}
          <div className="hidden sm:flex items-center space-x-2.5 flex-shrink-0">
            {/* Streak */}
            <div className="flex items-center space-x-1 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold whitespace-nowrap" title="7-Day Active Learning Streak">
              <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500 animate-pulse flex-shrink-0" />
              <span>{gamification?.streak || 7}d</span>
            </div>

            {/* XP & Level */}
            <div className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold whitespace-nowrap">
              <Zap className="w-3.5 h-3.5 text-indigo-400 fill-indigo-400 flex-shrink-0" />
              <span>{gamification?.xp || 1650} XP</span>
              <span className="text-slate-600">•</span>
              <span className="text-sky-400 font-bold">{gamification?.level || 'Practitioner'}</span>
            </div>

            {/* User Avatar */}
            <div className="flex items-center space-x-2 pl-2 border-l border-slate-800 flex-shrink-0">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-sky-600 to-indigo-600 flex items-center justify-center text-white font-bold text-xs shadow flex-shrink-0">
                AS
              </div>
              <div className="hidden 2xl:block text-left">
                <p className="text-xs font-bold text-white leading-tight whitespace-nowrap">{user?.name || 'Ananya Sharma'}</p>
                <p className="text-[10px] text-slate-400 leading-tight truncate max-w-[130px] whitespace-nowrap">{user?.designation || 'Asst. Director (Price)'}</p>
              </div>
            </div>

          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center space-x-2">
            <div className="flex items-center space-x-1 px-2 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-bold">
              <Zap className="w-3 h-3 text-indigo-400" />
              <span>{gamification?.xp || 1650}</span>
            </div>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-3 border-t border-slate-800 space-y-1 animate-in slide-in-from-top-2">
            {navLinks.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.to;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center space-x-2.5 px-3 py-2 rounded-lg text-xs font-semibold ${
                    isActive
                      ? 'bg-sky-500/15 text-sky-400 border border-sky-500/30'
                      : 'text-slate-300 hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-sky-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}

            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between px-3 text-xs text-slate-400">
              <span>{user?.name || 'Ananya Sharma'}</span>
              <span className="text-amber-400 font-bold">{gamification?.streak || 7}d Streak</span>
            </div>
          </div>
        )}

      </div>
    </header>
  );
}
