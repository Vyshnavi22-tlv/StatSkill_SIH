import React, { useState, useEffect } from 'react';
import { Award, Zap, Flame, Target, Shield, CheckCircle2, Star, Clock } from 'lucide-react';
import api from '../services/api';

export default function GamificationPage() {
  const [gamification, setGamification] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await api.getGamificationProfile('usr_ananya_sharma');
        setGamification(data);
      } catch (err) {
        console.error('Failed to load gamification profile:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-3">
        <div className="w-8 h-8 border-3 border-amber-400 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-slate-400 font-medium">Loading Gamification Hub & Badges...</p>
      </div>
    );
  }

  const allBadges = gamification?.allBadges || [];
  const unlockedBadges = gamification?.unlockedBadges || [];
  const unlockedIds = new Set(unlockedBadges.map(ub => ub.id));

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-500">
      
      {/* Header */}
      <div>
        <div className="flex items-center space-x-2 mb-1">
          <span className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Award className="w-5 h-5" />
          </span>
          <span className="text-xs uppercase tracking-wider font-extrabold text-amber-400">
            Gamified Progression System
          </span>
        </div>
        <h1 className="text-2xl font-black text-white">Competency Milestones, Badges & Missions</h1>
        <p className="text-xs text-slate-400 mt-1">
          Rewarding meaningful official statistics learning outcomes, diagnostic completions, and prerequisite mastery.
        </p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Tier Card */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl flex items-center space-x-4">
          <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center font-black text-xl">
            L{gamification?.levelNumber || 3}
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Current Tier</span>
            <h3 className="text-lg font-black text-white">{gamification?.level || 'Practitioner'}</h3>
            <span className="text-xs text-indigo-400 font-semibold">{gamification?.xp || 1650} XP Total</span>
          </div>
        </div>

        {/* Streak Card */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl flex items-center space-x-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-black text-xl">
            <Flame className="w-7 h-7 fill-amber-500 text-amber-500 animate-pulse" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Active Streak</span>
            <h3 className="text-lg font-black text-white">{gamification?.streak || 7} Days Consecutive</h3>
            <span className="text-xs text-amber-400 font-semibold">+25 XP Daily Bonus</span>
          </div>
        </div>

        {/* Badges Count Card */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl flex items-center space-x-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-black text-xl">
            <Shield className="w-7 h-7" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Badges Unlocked</span>
            <h3 className="text-lg font-black text-white">{unlockedBadges.length} / {allBadges.length} Badges</h3>
            <span className="text-xs text-emerald-400 font-semibold">MoSPI Price Specialist Track</span>
          </div>
        </div>

      </div>

      {/* Badges Showcase Grid */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
        <h2 className="text-base font-bold text-white">Official Statistics Badges Shelf</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {allBadges.map(badge => {
            const isUnlocked = unlockedIds.has(badge.id);
            return (
              <div
                key={badge.id}
                className={`p-5 rounded-xl border transition flex items-start space-x-4 ${
                  isUnlocked
                    ? 'bg-gradient-to-br from-slate-900 to-slate-950 border-amber-500/40 shadow-lg shadow-amber-500/10'
                    : 'bg-slate-950/40 border-slate-800/60 opacity-45'
                }`}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl flex-shrink-0 ${
                  isUnlocked ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' : 'bg-slate-800 text-slate-600'
                }`}>
                  🏆
                </div>

                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <h4 className="font-bold text-xs text-white leading-tight">{badge.name}</h4>
                    {isUnlocked && (
                      <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-400 text-[9px] font-black uppercase">
                        Unlocked
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-300 leading-snug">{badge.description}</p>
                  <span className="text-[10px] text-slate-500 block pt-1">
                    Criteria: {badge.criteria}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* XP Event History */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <h2 className="text-base font-bold text-white">Recent XP Ledger (Explainable Progression)</h2>

        <div className="space-y-2">
          {(gamification?.recentEvents || []).map((ev, i) => (
            <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs">
              <div className="flex items-center space-x-3">
                <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400">
                  <Zap className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="text-slate-200 font-bold block">{ev.description}</span>
                  <span className="text-[10px] text-slate-500">{ev.event_type} • {new Date(ev.created_at).toLocaleDateString()}</span>
                </div>
              </div>

              <span className="font-mono font-black text-amber-400">+{ev.xp} XP</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
