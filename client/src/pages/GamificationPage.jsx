import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Award, 
  Zap, 
  Flame, 
  Target, 
  Shield, 
  CheckCircle2, 
  Circle, 
  Star, 
  Clock, 
  ChevronRight, 
  Sparkles, 
  Layers, 
  Cpu, 
  Compass, 
  GitBranch, 
  ShieldCheck, 
  Info,
  ArrowRight
} from 'lucide-react';
import confetti from 'canvas-confetti';
import api from '../services/api';

const LEVEL_MILESTONES = [
  { level: 1, name: 'Explorer', xp: 0, desc: 'Starting official statistics onboarding' },
  { level: 2, name: 'Learner', xp: 500, desc: 'Completed baseline diagnostics & foundational lessons' },
  { level: 3, name: 'Practitioner', xp: 1500, desc: 'Verified competence in survey sampling and price indices' },
  { level: 4, name: 'Specialist', xp: 3000, desc: 'Expert in national statistical quality frameworks' },
  { level: 5, name: 'Advanced Practitioner', xp: 5000, desc: 'Directing complex survey operations and index re-basing' },
  { level: 6, name: 'Statistical Expert', xp: 8000, desc: 'National authority in Official Statistical Systems' }
];

const BADGE_ICONS = {
  DIAGNOSTIC_STARTER: Compass,
  SAMPLING_FOUNDATIONS: GitBranch,
  DATA_QUALITY_GUARDIAN: ShieldCheck,
  SURVEY_METHODOLOGIST: Layers,
  STATISTICAL_COMPUTING: Cpu,
  COMPETENCY_MASTER: Award,
  CONSISTENCY_CHAMPION: Flame
};

export default function GamificationPage() {
  const navigate = useNavigate();
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
        <p className="text-xs text-slate-400 font-medium">Loading MoSPI Gamification Hub & Badges...</p>
      </div>
    );
  }

  const allBadges = gamification?.allBadges || [];
  const unlockedBadges = gamification?.unlockedBadges || [];
  const unlockedIds = new Set(unlockedBadges.map(ub => ub.id));
  const currentXP = gamification?.xp || 1650;
  const currentLevelNum = gamification?.levelNumber || 3;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <span className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Award className="w-5 h-5" />
            </span>
            <span className="text-xs uppercase tracking-wider font-extrabold text-amber-400">
              Gamified Competency Progression
            </span>
          </div>
          <h1 className="text-2xl font-black text-white">Official Statistics Milestones, Badges & Missions</h1>
          <p className="text-xs text-slate-400 mt-1">
            Rewarding meaningful learning outcomes, prerequisite mastery, and verified assessment performance.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <span className="px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xs font-bold flex items-center space-x-1.5">
            <Zap className="w-4 h-4" />
            <span>{currentXP} Total XP</span>
          </span>
        </div>
      </div>

      {/* TOP 3 STAT CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Tier Card */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl flex items-center space-x-4">
          <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center font-black text-xl">
            L{currentLevelNum}
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Current Tier</span>
            <h3 className="text-lg font-black text-white">{gamification?.level || 'Practitioner'}</h3>
            <span className="text-xs text-indigo-400 font-semibold">{currentXP} XP • Level {currentLevelNum} of 6</span>
          </div>
        </div>

        {/* Streak Card */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl flex items-center space-x-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-black text-xl">
            <Flame className="w-7 h-7 fill-amber-500 text-amber-500 animate-pulse" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Learning Streak</span>
            <h3 className="text-lg font-black text-white">{gamification?.streak || 7} Days Consecutive</h3>
            <span className="text-[10px] text-slate-400 font-medium block">Streak ≠ Mastery (Reward for consistency)</span>
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
            <span className="text-xs text-emerald-400 font-semibold">MoSPI Official Blueprint</span>
          </div>
        </div>

      </div>

      {/* 1. LEVEL PROGRESSION LADDER */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-white">Official Statistics Level Ladder</h2>
            <p className="text-xs text-slate-400">Structured progression tiers based on verified learning outcomes</p>
          </div>
          <span className="text-xs font-bold text-sky-400">{gamification?.progressToNext || 55}% to Level 4</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
          {LEVEL_MILESTONES.map(tier => {
            const isReached = currentLevelNum >= tier.level;
            const isCurrent = currentLevelNum === tier.level;

            return (
              <div
                key={tier.level}
                className={`p-4 rounded-xl border flex flex-col justify-between space-y-2 transition ${
                  isCurrent
                    ? 'bg-sky-500/15 border-sky-500 text-white shadow-lg shadow-sky-500/10'
                    : (isReached ? 'bg-slate-950/80 border-slate-700 text-slate-200' : 'bg-slate-950/40 border-slate-800/60 opacity-40')
                }`}
              >
                <div>
                  <div className="flex justify-between items-center text-[10px] text-slate-400 mb-1">
                    <span className="font-bold uppercase">Level {tier.level}</span>
                    {isCurrent && <span className="px-1.5 py-0.2 rounded bg-sky-500 text-slate-950 font-black text-[9px]">YOU</span>}
                  </div>
                  <h4 className="font-black text-xs text-white leading-tight">{tier.name}</h4>
                  <span className="text-[10px] text-indigo-300 font-mono mt-0.5 block">{tier.xp} XP</span>
                </div>
                <p className="text-[10px] text-slate-400 leading-snug">{tier.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. STRUCTURED MISSIONS SECTION */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Target className="w-5 h-5 text-indigo-400" />
            <h2 className="text-base font-bold text-white">Active Competency Missions</h2>
          </div>
          <span className="text-xs font-bold text-slate-400">Prerequisite & Milestone Quests</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          
          {/* Mission 1: Master Sampling Design */}
          <div className="p-5 rounded-xl bg-gradient-to-br from-slate-950 to-slate-900 border border-indigo-500/40 space-y-4 shadow-lg">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Prerequisite Chain Mission
              </span>
              <span className="text-xs font-black text-amber-400">+500 XP</span>
            </div>

            <div>
              <h3 className="text-sm font-black text-white">MISSION: Master Sampling Design</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Complete the foundational prerequisite chain to achieve advanced sampling mastery.
              </p>
            </div>

            {/* Checklist */}
            <div className="space-y-2 text-xs">
              <div className="flex items-center space-x-2 text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
                <span>Probability Fundamentals (Foundations Complete)</span>
              </div>
              <div className="flex items-center space-x-2 text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
                <span>Probability Sampling (Inclusion Probabilities Verified)</span>
              </div>
              <div className="flex items-center space-x-2 text-amber-300">
                <Circle className="w-4 h-4 text-amber-400 animate-pulse" />
                <span>Stratified Sampling (In Progress — 40%)</span>
              </div>
              <div className="flex items-center space-x-2 text-slate-500">
                <Circle className="w-4 h-4 text-slate-600" />
                <span>Cluster Sampling (Pending)</span>
              </div>
              <div className="flex items-center space-x-2 text-slate-500">
                <Circle className="w-4 h-4 text-slate-600" />
                <span>Final NSSTA Assessment (Pending)</span>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between border-t border-slate-800">
              <span className="text-[10px] text-slate-400">Reward: <strong>Sampling Foundations Badge</strong></span>
              <button
                onClick={() => navigate('/learning')}
                className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition flex items-center space-x-1"
              >
                <span>Continue</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Mission 2: Master Missing Value Treatment */}
          <div className="p-5 rounded-xl bg-gradient-to-br from-slate-950 to-slate-900 border border-sky-500/40 space-y-4 shadow-lg">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-500/30">
                Data Quality Mission
              </span>
              <span className="text-xs font-black text-amber-400">+150 XP</span>
            </div>

            <div>
              <h3 className="text-sm font-black text-white">MISSION: Master Missing Value Treatment</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Remediate your biggest root gap to unblock official CPI price validation.
              </p>
            </div>

            {/* Checklist */}
            <div className="space-y-2 text-xs">
              <div className="flex items-center space-x-2 text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
                <span>Data Validation Rules (IQR range checks complete)</span>
              </div>
              <div className="flex items-center space-x-2 text-amber-300">
                <Circle className="w-4 h-4 text-amber-400 animate-pulse" />
                <span>Study MoSPI Manual Chapter 4 (Page 27 in progress)</span>
              </div>
              <div className="flex items-center space-x-2 text-slate-500">
                <Circle className="w-4 h-4 text-slate-600" />
                <span>Pass AI-Generated Critic Assessment</span>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between border-t border-slate-800">
              <span className="text-[10px] text-slate-400">Reward: <strong>Data Quality Guardian Badge</strong></span>
              <button
                onClick={() => navigate('/learning')}
                className="px-4 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition flex items-center space-x-1"
              >
                <span>Take Quiz</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* 3. ALL 7 OFFICIAL STATISTICS BADGES */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-white">Official Statistics Badges Shelf</h2>
            <p className="text-xs text-slate-400">All 7 competency and consistency milestones defined for MoSPI capacity building</p>
          </div>
          <span className="text-xs font-bold text-amber-400">{unlockedBadges.length} of {allBadges.length} Unlocked</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {allBadges.map(badge => {
            const isUnlocked = unlockedIds.has(badge.id);
            const Icon = BADGE_ICONS[badge.code] || Award;

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
                  <Icon className="w-6 h-6" />
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

      {/* 4. EXPLAINABLE XP LEDGER */}
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
