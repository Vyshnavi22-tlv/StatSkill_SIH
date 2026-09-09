import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Zap, 
  Flame, 
  Award, 
  Target, 
  TrendingUp, 
  ShieldAlert, 
  ArrowRight, 
  BookOpen, 
  Network, 
  Sparkles, 
  CheckCircle2, 
  ExternalLink,
  ChevronRight,
  Layers,
  BarChart2
} from 'lucide-react';
import api from '../services/api';

export default function LearnerDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [gamification, setGamification] = useState(null);
  const [graphData, setGraphData] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const [userData, gamifyData, graphRes, recsData] = await Promise.all([
          api.getMe('usr_ananya_sharma'),
          api.getGamificationProfile('usr_ananya_sharma'),
          api.getCompetencyGraph('usr_ananya_sharma'),
          api.getRecommendations('usr_ananya_sharma')
        ]);

        setUser(userData);
        setGamification(gamifyData);
        setGraphData(graphRes);
        setRecommendations(recsData);
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-4 border-sky-400 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-slate-400 font-medium">Loading MoSPI Competency Intelligence Platform...</p>
      </div>
    );
  }

  // Calculate Overall Role Mastery
  const roleNodes = graphData?.nodes?.filter(n => n.role_required_level) || [];
  const avgMastery = roleNodes.length > 0 
    ? Math.round(roleNodes.reduce((acc, n) => acc + (n.user_mastery || 0), 0) / roleNodes.length)
    : 61;

  // Active mission
  const activeMission = gamification?.missions?.[0] || {
    name: 'Master Missing Value Treatment',
    description: 'Study Chapter 4 of MoSPI Data Quality Manual and pass the AI assessment.',
    user_progress: 25,
    xp_reward: 150
  };

  // Top Recommendation
  const topRec = recommendations[0] || {
    title: 'iGOT Karmayogi: Data Quality Assurance & Missing Value Imputation',
    provider: 'iGOT Karmayogi',
    reasons: [
      'Role requires Data Quality (Target: 75%)',
      'Root prerequisite gap detected in Missing Value Treatment (Mastery: 35%)',
      'Resolving this unblocks Data Quality and Price Index Validation'
    ],
    expected_outcome: 'Expected to boost Missing Value Treatment mastery to 85%'
  };

  // 6 Competency Snapshot Cards
  const snapshotCompetencies = graphData?.nodes?.filter(n => 
    ['comp_missing_val', 'comp_prob_fund', 'comp_index_num', 'comp_stat_comp', 'comp_data_qual', 'comp_sampling'].includes(n.id)
  ) || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-500">
      
      {/* 1. HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-950 p-6 rounded-2xl border border-slate-800 shadow-xl relative overflow-hidden">
        
        {/* Background decorative glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-sky-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-sky-500 via-indigo-600 to-emerald-500 p-0.5 shadow-lg shadow-indigo-500/20">
            <div className="w-full h-full bg-slate-950 rounded-2xl flex items-center justify-center font-black text-xl text-white">
              AS
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl font-black text-white tracking-tight">Welcome back, {user?.name || 'Ananya'}</h1>
              <span className="px-2.5 py-0.5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20 text-xs font-bold">
                Level {gamification?.levelNumber || 3}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {user?.designation || 'Assistant Director (Price Statistics)'} • {user?.department || 'MoSPI — National Statistical Office'}
            </p>
          </div>
        </div>

        {/* Quick Gamification Pills */}
        <div className="flex items-center space-x-3">
          {/* XP & Level Card */}
          <div className="bg-slate-950/80 px-4 py-2.5 rounded-xl border border-slate-800 flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Zap className="w-5 h-5 fill-indigo-400" />
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Level & XP</div>
              <div className="text-sm font-extrabold text-white">
                {gamification?.level || 'Practitioner'} <span className="text-indigo-400">({gamification?.xp || 1650} XP)</span>
              </div>
            </div>
          </div>

          {/* Streak Card */}
          <div className="bg-slate-950/80 px-4 py-2.5 rounded-xl border border-slate-800 flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Flame className="w-5 h-5 fill-amber-500" />
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Learning Streak</div>
              <div className="text-sm font-extrabold text-amber-400">
                {gamification?.streak || 7} Days Active
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* 2. HERO SECTION & PROGRESS BAR */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Your Competency Journey */}
        <div className="lg:col-span-2 bg-gradient-to-br from-slate-900 to-slate-950 p-6 rounded-2xl border border-slate-800 shadow-xl flex flex-col justify-between space-y-5">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center space-x-2 mb-1">
                <Sparkles className="w-4 h-4 text-sky-400" />
                <span className="text-xs uppercase tracking-wider font-extrabold text-sky-400">Your Competency Journey</span>
              </div>
              <h2 className="text-xl font-black text-white">Price Statistics Competency Index</h2>
              <p className="text-xs text-slate-400 mt-1 max-w-xl">
                Real-time evidence aggregation across official diagnostics, verified quizzes, and practical data schedules.
              </p>
            </div>

            <div className="text-right">
              <span className="text-3xl font-black text-emerald-400">{avgMastery}%</span>
              <span className="text-[10px] text-slate-400 block">Overall Role Mastery</span>
            </div>
          </div>

          {/* Level Progress Slider */}
          <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800/80 space-y-2">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-slate-300">Next Milestone: <strong className="text-sky-400">Level 4 (Specialist)</strong></span>
              <span className="text-indigo-400 font-bold">{gamification?.xp || 1650} / 3000 XP ({gamification?.progressToNext || 55}%)</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-sky-500 via-indigo-500 to-emerald-400 rounded-full transition-all duration-700"
                style={{ width: `${gamification?.progressToNext || 55}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>Current: Practitioner (1500 XP)</span>
              <span>Need 1350 XP to rank up</span>
            </div>
          </div>

          {/* Direct Graph Entry Banner */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center space-x-2 text-xs text-slate-400">
              <Network className="w-4 h-4 text-sky-400" />
              <span>12 Official Statistics Competencies mapped with prerequisite graph</span>
            </div>
            <button
              onClick={() => navigate('/graph')}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-sky-500/15 hover:bg-sky-500/25 text-sky-400 border border-sky-500/30 text-xs font-bold transition shadow-sm"
            >
              <span>Explore Competency Graph</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>

        {/* 3. TODAY'S MISSION CARD */}
        <div className="bg-gradient-to-br from-indigo-950/40 via-slate-900 to-slate-950 p-6 rounded-2xl border border-indigo-500/30 shadow-xl flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] font-extrabold uppercase tracking-wider">
                <Target className="w-3.5 h-3.5" />
                <span>Today's Mission</span>
              </div>
              <span className="text-xs font-black text-amber-400">+{activeMission.xp_reward} XP</span>
            </div>

            <h3 className="text-base font-bold text-white leading-tight">
              {activeMission.name}
            </h3>

            <p className="text-xs text-slate-300 leading-relaxed">
              {activeMission.description}
            </p>

            <div className="space-y-1.5 pt-2">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-400">Mission Progress</span>
                <span className="text-indigo-300 font-bold">{activeMission.user_progress}%</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                <div 
                  className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                  style={{ width: `${activeMission.user_progress}%` }}
                />
              </div>
            </div>
          </div>

          <button
            onClick={() => navigate('/learning')}
            className="mt-6 w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-sky-600 hover:from-indigo-500 hover:to-sky-500 text-white text-xs font-extrabold transition shadow-lg shadow-indigo-600/20"
          >
            <span>Continue Mission</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>

      {/* 4. ROOT GAP & RECOMMENDED ACTION SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* ROOT GAP CARD */}
        <div className="bg-gradient-to-br from-red-950/40 via-slate-900 to-slate-950 p-6 rounded-2xl border border-red-500/40 shadow-xl space-y-4 root-gap-glow">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-red-400 font-black text-xs uppercase tracking-wider">
              <ShieldAlert className="w-4 h-4 animate-pulse" />
              <span>Your Biggest Root Gap</span>
            </div>
            <span className="text-xs font-extrabold px-2.5 py-0.5 rounded bg-red-500/20 text-red-300 border border-red-500/30">
              35% Mastery
            </span>
          </div>

          <div>
            <h3 className="text-lg font-black text-white">Missing Value Treatment</h3>
            <p className="text-xs text-red-200/90 mt-1 leading-relaxed">
              This foundational competency is directly affecting your <strong>Data Validation</strong> (48%) and <strong>Data Quality Assurance</strong> (43%) mastery in monthly CPI compilation.
            </p>
          </div>

          <div className="bg-slate-950/70 p-3 rounded-xl border border-red-900/40 space-y-1.5 text-xs text-slate-300">
            <div className="font-semibold text-slate-200">Prerequisite Impact Cascade:</div>
            <div className="flex items-center space-x-2 text-[11px] font-mono">
              <span className="px-2 py-0.5 rounded bg-red-900/60 text-red-300 font-bold">Missing Value Treatment (35%)</span>
              <span>→</span>
              <span className="px-2 py-0.5 rounded bg-amber-900/60 text-amber-300">Data Quality (43%)</span>
            </div>
          </div>

          <button
            onClick={() => navigate('/learning')}
            className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition shadow-lg shadow-red-600/20"
          >
            <span>Study MoSPI Data Quality Manual & Verify</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* RECOMMENDED ACTION CARD */}
        <div className="bg-gradient-to-br from-sky-950/40 via-slate-900 to-slate-950 p-6 rounded-2xl border border-sky-500/40 shadow-xl space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-sky-400 font-black text-xs uppercase tracking-wider">
                <Sparkles className="w-4 h-4" />
                <span>Recommended Action</span>
              </div>
              <span className="text-xs font-bold text-slate-400">{topRec.provider}</span>
            </div>

            <div>
              <h3 className="text-base font-bold text-white leading-tight">{topRec.title}</h3>
              <p className="text-xs text-emerald-400 font-medium mt-1">{topRec.expected_outcome}</p>
            </div>

            {/* Why it is recommended */}
            <div className="bg-slate-950/70 p-3.5 rounded-xl border border-sky-900/40 space-y-2">
              <span className="text-[10px] uppercase font-extrabold text-slate-400 tracking-wider block">Why Recommended</span>
              <ul className="space-y-1 text-xs text-slate-300">
                {(topRec.reasons || []).map((r, i) => (
                  <li key={i} className="flex items-start space-x-1.5">
                    <span className="text-sky-400 mt-0.5">•</span>
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <button
            onClick={() => navigate('/learning')}
            className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition shadow-lg shadow-sky-600/20"
          >
            <span>Start Recommended Learning</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>

      {/* 5. COMPETENCY SNAPSHOT (4-6 CARDS) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white">Competency Snapshot</h2>
            <p className="text-xs text-slate-400">Core required capabilities for Assistant Director — Price Statistics</p>
          </div>
          <button
            onClick={() => navigate('/graph')}
            className="text-xs text-sky-400 hover:text-sky-300 font-bold flex items-center space-x-1"
          >
            <span>View Complete Graph (12 Nodes)</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {snapshotCompetencies.map(comp => {
            const isRoot = comp.isRootGap;
            const isRisk = comp.isAtRisk;
            const isMet = comp.user_mastery >= (comp.role_required_level || 70);

            return (
              <div
                key={comp.id}
                onClick={() => navigate('/graph')}
                className={`p-4 rounded-xl border bg-slate-900/80 hover:scale-[1.02] transition cursor-pointer flex flex-col justify-between space-y-3 ${
                  isRoot ? 'border-red-500/60 root-gap-glow' : (isRisk ? 'border-amber-500/50' : (isMet ? 'border-emerald-500/40' : 'border-slate-800'))
                }`}
              >
                <div>
                  <div className="flex justify-between items-start text-[10px] text-slate-400 mb-1">
                    <span className="font-mono">{comp.code}</span>
                    <span className={`px-1.5 py-0.2 rounded font-extrabold ${
                      isRoot ? 'bg-red-500/20 text-red-400' : (isRisk ? 'bg-amber-500/20 text-amber-300' : (isMet ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-400'))
                    }`}>
                      {comp.badgeText || (isMet ? 'Mastered' : 'On Track')}
                    </span>
                  </div>
                  <h4 className="font-bold text-xs text-white leading-tight min-h-[28px]">{comp.name}</h4>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-400">Mastery</span>
                    <span className="font-bold text-white">{comp.user_mastery}%</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${isRoot ? 'bg-red-500' : (isRisk ? 'bg-amber-500' : (isMet ? 'bg-emerald-500' : 'bg-sky-500'))}`}
                      style={{ width: `${comp.user_mastery}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 6. RECENT ACHIEVEMENTS & BADGES SHELF */}
      <div className="bg-slate-900/90 p-6 rounded-2xl border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Award className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-bold text-white">Recent Achievements & Badges</h2>
          </div>
          <button
            onClick={() => navigate('/gamification')}
            className="text-xs text-sky-400 hover:text-sky-300 font-bold flex items-center space-x-1"
          >
            <span>View All Badges & XP Logs</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {(gamification?.allBadges || []).map(badge => {
            const isUnlocked = gamification?.unlockedBadges?.some(ub => ub.id === badge.id);
            return (
              <div
                key={badge.id}
                className={`p-3.5 rounded-xl border text-center flex flex-col items-center justify-between space-y-2 transition ${
                  isUnlocked
                    ? 'bg-gradient-to-b from-slate-900 to-slate-950 border-amber-500/40 shadow-lg shadow-amber-500/10'
                    : 'bg-slate-950/40 border-slate-800/60 opacity-50'
                }`}
              >
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg ${
                  isUnlocked ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-slate-800 text-slate-500'
                }`}>
                  🏆
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white leading-tight">{badge.name}</h4>
                  <span className="text-[10px] text-slate-400 mt-0.5 block leading-tight">
                    {isUnlocked ? 'Unlocked' : badge.criteria}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
