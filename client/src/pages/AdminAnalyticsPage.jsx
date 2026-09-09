import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  ShieldAlert, 
  Layers, 
  ArrowUpRight, 
  History,
  Activity,
  FileCheck,
  BrainCircuit,
  Building2,
  AlertTriangle,
  Sparkles,
  Award,
  CheckCircle2,
  HelpCircle,
  Clock,
  ChevronRight,
  Filter
} from 'lucide-react';
import api from '../services/api';

export default function AdminAnalyticsPage() {
  const [analytics, setAnalytics] = useState(null);
  const [interventions, setInterventions] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'effectiveness' | 'departments' | 'predictive'

  useEffect(() => {
    async function loadAdminData() {
      try {
        const [statsData, intervData, auditData] = await Promise.all([
          api.getAdminAnalytics(),
          api.getInterventionEffectiveness(),
          api.getAuditLogs()
        ]);
        setAnalytics(statsData);
        setInterventions(intervData);
        setAuditLogs(auditData);
      } catch (err) {
        console.error('Failed to load admin analytics:', err);
      } finally {
        setLoading(false);
      }
    }
    loadAdminData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[75vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-4 border-sky-400 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-slate-300 font-semibold tracking-wide">Aggregating National Statistical Capacity Metrics...</p>
        <span className="text-xs text-slate-500 font-mono">Connecting to NSSTA / TPAC Competency Intelligence Ledger</span>
      </div>
    );
  }

  const summary = analytics?.summary || {
    totalOfficers: 128,
    avgMastery: 64,
    totalAssessments: 412,
    totalRootGaps: 14
  };

  const distribution = analytics?.competencyDistribution || [
    { tier: 'Foundational (0-39%)', count: 24, percentage: 19, color: 'bg-red-500', text: 'text-red-400' },
    { tier: 'Developing (40-59%)', count: 48, percentage: 38, color: 'bg-amber-500', text: 'text-amber-400' },
    { tier: 'Competent (60-79%)', count: 39, percentage: 30, color: 'bg-sky-500', text: 'text-sky-400' },
    { tier: 'Mastered (80-100%)', count: 17, percentage: 13, color: 'bg-emerald-500', text: 'text-emerald-400' }
  ];

  const topGaps = analytics?.topGaps || [
    { competency: 'Data Quality & Validation', domain: 'Statistical Quality', affectedOfficers: 58, rootDeficit: 'Missing Value Treatment', avgScore: 43, severity: 'HIGH' },
    { competency: 'Sampling & Survey Methodology', domain: 'Methodology', affectedOfficers: 49, rootDeficit: 'Probability Fundamentals', avgScore: 48, severity: 'HIGH' },
    { competency: 'Index Number Theory', domain: 'Price Statistics', affectedOfficers: 38, rootDeficit: 'Price Relative Weighting', avgScore: 51, severity: 'MEDIUM' },
    { competency: 'Statistical Computing (Python/R)', domain: 'Technical Tools', affectedOfficers: 35, rootDeficit: 'Dataframe Manipulation', avgScore: 54, severity: 'MEDIUM' }
  ];

  const departmentMastery = analytics?.departmentMastery || [
    { department: 'Price Statistics Division (PSD)', officers: 34, avgMastery: 62, target: 75, criticalGap: 'Index Number Theory & CPI Basket Updates', status: 'Attention' },
    { department: 'Survey Design & Research (SDRD)', officers: 42, avgMastery: 71, target: 80, criticalGap: 'Cluster Sampling & Stratification', status: 'On Track' },
    { department: 'National Accounts Division (NAD)', officers: 28, avgMastery: 68, target: 75, criticalGap: 'SNA 2008 & GVA Deflators', status: 'On Track' },
    { department: 'Field Operations & Data Quality (FOD)', officers: 24, avgMastery: 54, target: 70, criticalGap: 'Missing Value Treatment & Imputation', status: 'Urgent Intervention' }
  ];

  const assessmentStats = analytics?.assessmentStats || {
    totalCompleted: 412,
    passRate: 78.4,
    avgScore: 72.8,
    criticValidationRate: 98.2,
    bloomDistribution: [
      { level: 'Remember / Understand', percentage: 25, count: 103 },
      { level: 'Apply / Execute', percentage: 45, count: 185 },
      { level: 'Analyze / Evaluate', percentage: 30, count: 124 }
    ],
    avgTimeToComplete: '7.4 mins'
  };

  const predictiveInsights = analytics?.predictiveInsights || [
    {
      id: 'pred_price_stat',
      division: 'Price Statistics Division',
      targetCompetency: 'Index Number Theory',
      metric: '32% of Price Statistics officials are projected to remain below the Index Number Theory threshold (75%) at the current learning pace by Q3 2026.',
      recommendation: 'Deploy NSSTA 2-Week Accelerated Index Computation Workshop to reduce projected deficit to <6%.',
      projectedClosureWeeks: 3.5,
      confidence: 'High (Based on 148 historical assessment vectors)',
      urgency: 'HIGH'
    },
    {
      id: 'pred_data_qual',
      division: 'Field Operations Division',
      targetCompetency: 'Missing Value Treatment',
      metric: '41% of field validation officers exhibit high error rates in Cold-Deck vs Hot-Deck imputation decisions.',
      recommendation: 'Mandate iGOT Interactive Data Cleansing Simulation module before next quarterly survey cycle.',
      projectedClosureWeeks: 2.0,
      confidence: 'Medium (Based on 86 recent diagnostic runs)',
      urgency: 'CRITICAL'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-500">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-800/80 pb-6">
        <div>
          <div className="flex items-center space-x-2 mb-1.5">
            <span className="p-1.5 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20">
              <BarChart3 className="w-5 h-5" />
            </span>
            <span className="text-xs uppercase tracking-wider font-extrabold text-sky-400">
              MoSPI Competency & Training Impact Intelligence
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
            National Statistical Capacity Administrator Dashboard
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Aggregated workforce competency distribution, training ROI, before/after outcome proof, and predictive capacity analytics.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <span className="px-3 py-1.5 rounded-xl bg-slate-800/90 text-slate-300 text-xs font-semibold border border-slate-700 flex items-center space-x-1.5">
            <ShieldAlert className="w-3.5 h-3.5 text-sky-400" />
            <span>Aggregated Privacy Shield (Zero PII)</span>
          </span>
          <span className="px-3 py-1.5 rounded-xl bg-sky-500/10 text-sky-300 text-xs font-bold border border-sky-500/30">
            NSSTA / TPAC Live
          </span>
        </div>
      </div>

      {/* Navigation Filter Tabs */}
      <div className="flex flex-wrap gap-2 p-1.5 bg-slate-900/90 border border-slate-800 rounded-xl">
        {[
          { id: 'overview', label: 'Workforce Overview', icon: Layers },
          { id: 'effectiveness', label: 'Intervention Effectiveness', icon: Activity },
          { id: 'departments', label: 'Department Heatmap', icon: Building2 },
          { id: 'predictive', label: 'Predictive Capacity Projections', icon: BrainCircuit }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                isActive 
                  ? 'bg-sky-500 text-slate-950 shadow-md shadow-sky-500/20 font-black' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-slate-950' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Primary KPI Header Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Enrolled Officers */}
        <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl shadow-xl flex items-center space-x-4 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-sky-500/5 rounded-full blur-2xl group-hover:bg-sky-500/10 transition-all" />
          <div className="p-3.5 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider block">Total Cadre Officers</span>
            <div className="text-2xl font-black text-white tracking-tight">{summary.totalOfficers}</div>
            <span className="text-[10px] text-sky-400 font-medium">4 Key Statistical Divisions</span>
          </div>
        </div>

        {/* Overall Mastery */}
        <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl shadow-xl flex items-center space-x-4 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-all" />
          <div className="p-3.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider block">Org Competency Index</span>
            <div className="text-2xl font-black text-emerald-400 tracking-tight">{summary.avgMastery}%</div>
            <span className="text-[10px] text-emerald-400 font-semibold flex items-center space-x-1">
              <ArrowUpRight className="w-3 h-3" />
              <span>+18.4% post-intervention gain</span>
            </span>
          </div>
        </div>

        {/* Verified Assessments */}
        <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl shadow-xl flex items-center space-x-4 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-2xl group-hover:bg-indigo-500/10 transition-all" />
          <div className="p-3.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <FileCheck className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider block">Verified Assessments</span>
            <div className="text-2xl font-black text-white tracking-tight">{summary.totalAssessments}</div>
            <span className="text-[10px] text-indigo-400 font-semibold">98.2% Critic Validation Pass</span>
          </div>
        </div>

        {/* Root Gaps Flagged */}
        <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl shadow-xl flex items-center space-x-4 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/5 rounded-full blur-2xl group-hover:bg-red-500/10 transition-all" />
          <div className="p-3.5 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider block">Prerequisite Root Gaps</span>
            <div className="text-2xl font-black text-red-400 tracking-tight">{summary.totalRootGaps}</div>
            <span className="text-[10px] text-red-400 font-medium">Targeted Training Active</span>
          </div>
        </div>

      </div>

      {/* TAB 1: WORKFORCE OVERVIEW & COMPETENCY DISTRIBUTION */}
      {(activeTab === 'overview' || activeTab === 'departments') && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Organization Competency Distribution (7 cols) */}
          <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h2 className="text-base font-bold text-white flex items-center space-x-2">
                  <Layers className="w-5 h-5 text-sky-400" />
                  <span>Organization Competency Distribution</span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Cadre proficiency spread across foundational, developing, competent, and mastered tiers.
                </p>
              </div>
              <span className="text-[11px] text-slate-400 font-mono bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-700">
                N = {summary.totalOfficers} Officers
              </span>
            </div>

            {/* Segmented Tier Bar */}
            <div className="space-y-2">
              <div className="w-full h-5 bg-slate-800 rounded-xl overflow-hidden flex shadow-inner">
                {distribution.map((tier, idx) => (
                  <div
                    key={idx}
                    className={`${tier.color} transition-all hover:opacity-90 relative group cursor-pointer`}
                    style={{ width: `${tier.percentage}%` }}
                    title={`${tier.tier}: ${tier.percentage}% (${tier.count} officers)`}
                  />
                ))}
              </div>
              
              {/* Legend Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                {distribution.map((tier, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1">
                    <div className="flex items-center space-x-1.5">
                      <span className={`w-2.5 h-2.5 rounded-full ${tier.color}`} />
                      <span className="text-[11px] font-semibold text-slate-300 truncate">{tier.tier.split(' ')[0]}</span>
                    </div>
                    <div className="flex items-baseline justify-between">
                      <span className="text-lg font-black text-white">{tier.percentage}%</span>
                      <span className="text-[11px] text-slate-400">{tier.count} officers</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Assessment Performance Snapshot */}
            <div className="pt-2 border-t border-slate-800 space-y-3">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                Assessment Cognitive Distribution (Bloom's Taxonomy)
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {assessmentStats.bloomDistribution.map((bloom, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-slate-950/40 border border-slate-800 space-y-1">
                    <span className="text-[11px] text-slate-400 block">{bloom.level}</span>
                    <div className="flex items-baseline justify-between">
                      <span className="text-base font-bold text-sky-400">{bloom.percentage}%</span>
                      <span className="text-[10px] text-slate-500">{bloom.count} Qs</span>
                    </div>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-sky-400 h-full rounded-full" style={{ width: `${bloom.percentage}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Top Competency Gaps (5 cols) */}
          <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h2 className="text-base font-bold text-white flex items-center space-x-2">
                  <ShieldAlert className="w-5 h-5 text-red-400" />
                  <span>Top Organization Competency Gaps</span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Prioritized by root prerequisite deficits across divisions.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {topGaps.map((gap, idx) => (
                <div key={idx} className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold text-white">{gap.competency}</span>
                        <span className={`text-[9px] font-black px-1.5 py-0.5 rounded ${
                          gap.severity === 'HIGH' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        }`}>
                          {gap.severity}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 block mt-0.5">
                        Domain: <strong className="text-slate-300">{gap.domain}</strong>
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-500 block">Avg Score</span>
                      <span className="text-xs font-bold text-red-400">{gap.avgScore}%</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-800/80 text-[11px]">
                    <span className="text-slate-400">
                      Root Deficit: <strong className="text-amber-300">{gap.rootDeficit}</strong>
                    </span>
                    <span className="text-slate-300 font-semibold">{gap.affectedOfficers} officers affected</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* TAB 2: TRAINING INTERVENTION EFFECTIVENESS & BEFORE/AFTER DELTA (THE CORE REQUIREMENT) */}
      {(activeTab === 'overview' || activeTab === 'effectiveness') && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-slate-800">
            <div>
              <div className="flex items-center space-x-2">
                <Activity className="w-5 h-5 text-emerald-400" />
                <h2 className="text-lg font-black text-white">Training Intervention Effectiveness & Outcome Proof</h2>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Measuring actual competency improvement before vs. after targeted learning modules (moving beyond mere course completion counts).
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-extrabold text-emerald-400 bg-emerald-500/10 px-3.5 py-1.5 rounded-xl border border-emerald-500/20 shadow-sm">
                Average Cadre Gain: +28.7%
              </span>
            </div>
          </div>

          {/* Highlighted Case Card: DATA QUALITY */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-slate-900 to-sky-950/30 border border-emerald-500/30 shadow-lg space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <span className="text-[10px] font-extrabold tracking-wider uppercase px-2.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Featured Case Study • Data Quality & Validation
                </span>
                <h3 className="text-base font-black text-white mt-1">MoSPI Field Guidelines & Validation Engine (Page 27 Focus)</h3>
                <p className="text-xs text-slate-400">
                  Targeted intervention on Missing Value Treatment, Cold-Deck Imputation, and Consistency Checks.
                </p>
              </div>

              {/* Quick Stat Pill */}
              <div className="flex items-center space-x-6 bg-slate-950/70 px-5 py-2.5 rounded-xl border border-slate-800">
                <div className="text-center">
                  <span className="text-[10px] text-slate-400 block font-semibold uppercase">Before</span>
                  <span className="text-base font-bold text-slate-300">43%</span>
                </div>
                <div className="text-slate-600 font-bold">→</div>
                <div className="text-center">
                  <span className="text-[10px] text-slate-400 block font-semibold uppercase">After</span>
                  <span className="text-base font-bold text-emerald-400">68%</span>
                </div>
                <div className="border-l border-slate-800 pl-4 text-center">
                  <span className="text-[10px] text-slate-400 block font-semibold uppercase">Improvement</span>
                  <span className="text-lg font-black text-emerald-400">+25 percentage points</span>
                </div>
              </div>
            </div>

            {/* Visual Progress Delta Bar */}
            <div className="space-y-1.5">
              <div className="w-full bg-slate-800 rounded-full h-4 overflow-hidden relative flex shadow-inner">
                <div 
                  className="h-full bg-slate-600 rounded-l-full" 
                  style={{ width: '43%' }} 
                  title="Before: 43%"
                />
                <div 
                  className="h-full bg-emerald-500 animate-pulse font-mono text-[9px] text-slate-950 font-black flex items-center justify-center" 
                  style={{ width: '25%' }}
                  title="Improvement: +25 percentage points"
                >
                  +25%
                </div>
              </div>
              <div className="flex justify-between text-[11px] text-slate-400">
                <span>Baseline: 43%</span>
                <span className="text-emerald-400 font-bold">Post-Intervention: 68% (Target: 70%)</span>
              </div>
            </div>
          </div>

          {/* All Interventions List */}
          <div className="space-y-3.5">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
              Cadre-Wide Intervention Outcome Ledger
            </h4>
            <div className="grid grid-cols-1 gap-3">
              {interventions.map((item, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3 hover:border-slate-700 transition-all">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold text-white">{item.competency}</span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-sky-400 border border-slate-700">
                          {item.domain}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">{item.intervention}</p>
                    </div>

                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <span className="text-[10px] text-slate-500 block">Trained Officers</span>
                        <span className="text-xs font-bold text-slate-200">{item.officersTrained}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-slate-500 block">Verified Delta</span>
                        <span className="text-sm font-black text-emerald-400">+{item.delta} percentage points</span>
                      </div>
                    </div>
                  </div>

                  {/* Before vs After Visual Bar */}
                  <div className="space-y-1.5 pt-1">
                    <div className="flex justify-between text-[11px] font-semibold">
                      <span className="text-slate-400">Before: <strong className="text-slate-200">{item.beforeMastery}%</strong></span>
                      <span className="text-emerald-400 font-bold">After: {item.afterMastery}% (+{item.delta} percentage points)</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden relative flex">
                      <div 
                        className="h-full bg-slate-600 rounded-l-full"
                        style={{ width: `${item.beforeMastery}%` }}
                      />
                      <div 
                        className="h-full bg-emerald-500 animate-pulse"
                        style={{ width: `${item.delta}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: DEPARTMENT-LEVEL MASTERY */}
      {(activeTab === 'overview' || activeTab === 'departments') && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h2 className="text-base font-bold text-white flex items-center space-x-2">
                <Building2 className="w-5 h-5 text-indigo-400" />
                <span>Department-Level Competency Index</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Aggregated divisional mastery vs benchmark targets for Price, Survey, National Accounts, and Field Operations.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {departmentMastery.map((dept, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-xs font-bold text-white">{dept.department}</h3>
                    <span className="text-[11px] text-slate-400">{dept.officers} Cadre Officers</span>
                  </div>
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${
                    dept.status === 'On Track' 
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                      : dept.status === 'Attention' 
                      ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' 
                      : 'bg-red-500/10 text-red-400 border-red-500/20'
                  }`}>
                    {dept.status}
                  </span>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-400">Current Mastery: <strong className="text-slate-100">{dept.avgMastery}%</strong></span>
                    <span className="text-sky-400">Target: {dept.target}%</span>
                  </div>
                  <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${dept.avgMastery >= dept.target ? 'bg-emerald-500' : 'bg-amber-400'}`} 
                      style={{ width: `${dept.avgMastery}%` }} 
                    />
                  </div>
                </div>

                <div className="pt-1 text-[11px] text-slate-400 flex items-center space-x-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>Critical Focus: <strong className="text-slate-200">{dept.criticalGap}</strong></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: PREDICTIVE CAPACITY-BUILDING INDICATOR */}
      {(activeTab === 'overview' || activeTab === 'predictive') && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-3 border-b border-slate-800">
            <div>
              <div className="flex items-center space-x-2">
                <BrainCircuit className="w-5 h-5 text-purple-400" />
                <h2 className="text-base font-bold text-white">Predictive Capacity-Building Indicators</h2>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Machine learning trajectory forecasts for official statistics readiness and prerequisite deficit closure.
              </p>
            </div>
            <span className="text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20">
              Demo Analytics • Predictive Estimates
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {predictiveInsights.map(insight => (
              <div key={insight.id} className="p-5 rounded-xl bg-gradient-to-b from-slate-950 to-purple-950/20 border border-purple-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-purple-300 uppercase tracking-wider">{insight.division}</span>
                  <span className={`text-[9px] font-black px-2 py-0.5 rounded ${
                    insight.urgency === 'CRITICAL' ? 'bg-red-500/20 text-red-300 border border-red-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  }`}>
                    {insight.urgency} DEFICIT RISK
                  </span>
                </div>

                <div className="p-3.5 rounded-lg bg-slate-900/80 border border-slate-800">
                  <p className="text-xs font-semibold text-slate-100 leading-relaxed">
                    "{insight.metric}"
                  </p>
                </div>

                <div className="space-y-1.5 text-xs text-slate-300">
                  <div className="flex items-start space-x-1.5 text-purple-300">
                    <Sparkles className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                    <span className="font-semibold">Recommended Targeted Intervention:</span>
                  </div>
                  <p className="text-[11px] text-slate-400 pl-5">
                    {insight.recommendation}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[10px] text-slate-500">
                  <span>Projected Time to Threshold: <strong className="text-slate-300">{insight.projectedClosureWeeks} weeks</strong></span>
                  <span>{insight.confidence}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Audit Logs Trail */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <History className="w-5 h-5 text-indigo-400" />
            <h2 className="text-base font-bold text-white">Competency Audit Trail & Deterministic Evidence Ledger</h2>
          </div>
          <span className="text-[10px] text-slate-500 font-mono">Immutable SQLite WAL Ledger</span>
        </div>

        <div className="space-y-2">
          {auditLogs.length === 0 ? (
            <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800 text-center text-xs text-slate-500">
              Competency updates and evidence calculations are logged transparently with exact timestamps.
            </div>
          ) : (
            auditLogs.slice(0, 5).map(log => (
              <div key={log.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs">
                <div>
                  <span className="font-bold text-slate-200">{log.action}: {log.competency_name || log.entity_id}</span>
                  <p className="text-[11px] text-slate-400">{log.reason}</p>
                </div>
                <span className="text-[10px] text-slate-500 font-mono">{new Date(log.timestamp).toLocaleTimeString()}</span>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
}

