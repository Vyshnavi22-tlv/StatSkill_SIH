import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  X, 
  ShieldAlert, 
  AlertTriangle, 
  CheckCircle2, 
  BookOpen, 
  ExternalLink, 
  ArrowRight, 
  FileText, 
  Zap, 
  Layers, 
  Sparkles,
  Award
} from 'lucide-react';

export default function CompetencyDetailPanel({ competency, onClose }) {
  const navigate = useNavigate();

  if (!competency) return null;

  const {
    id,
    code,
    name,
    domain,
    description,
    currentMastery = 0,
    requiredMastery = 70,
    confidence = 'LOW',
    evidenceCount = 0,
    status = 'ON_TRACK',
    isRootGap = false,
    isAtRisk = false,
    prerequisites = [],
    downstream = [],
    courses = [],
    evidence = []
  } = competency;

  const gap = Math.max(0, requiredMastery - currentMastery);

  return (
    <div className="fixed inset-y-0 right-0 w-full sm:w-[460px] bg-slate-900/98 backdrop-blur-xl border-l border-slate-800 shadow-2xl z-50 flex flex-col overflow-hidden animate-in slide-in-from-right duration-300">
      
      {/* Header */}
      <div className="p-5 border-b border-slate-800 flex items-start justify-between bg-slate-950/60">
        <div>
          <div className="flex items-center space-x-2 mb-1.5">
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-sky-400 font-bold border border-slate-700">
              {code}
            </span>
            <span className="text-[11px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
              {domain}
            </span>
          </div>
          <h2 className="text-lg font-bold text-white leading-tight">{name}</h2>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Content Scrollable */}
      <div className="flex-1 overflow-y-auto p-5 space-y-6">
        
        {/* Description */}
        <p className="text-xs text-slate-300 leading-relaxed bg-slate-800/40 p-3 rounded-lg border border-slate-800">
          {description}
        </p>

        {/* Root Gap Alert Banner if applicable */}
        {isRootGap && (
          <div className="p-4 rounded-xl bg-red-950/40 border border-red-500/50 space-y-2 root-gap-glow">
            <div className="flex items-center space-x-2 text-red-400 font-bold text-xs">
              <ShieldAlert className="w-4 h-4 text-red-400 animate-pulse" />
              <span>ROOT-CAUSE COMPETENCY GAP DETECTED</span>
            </div>
            <p className="text-xs text-red-200/90 leading-relaxed">
              This foundational competency is currently at <strong className="text-white">{currentMastery}%</strong> (Target: {requiredMastery}%). Resolving this gap is essential to unblock downstream competencies.
            </p>
          </div>
        )}

        {isAtRisk && !isRootGap && (
          <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-500/50 space-y-2 at-risk-glow">
            <div className="flex items-center space-x-2 text-amber-400 font-bold text-xs">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>DOWNSTREAM DEFICIT (PREREQUISITE BLOCKED)</span>
            </div>
            <p className="text-xs text-amber-200/90 leading-relaxed">
              Current progress is constrained by deficiencies in upstream prerequisite nodes. Address the root cause to build sound mastery here.
            </p>
          </div>
        )}

        {/* Mastery vs Required Metric Cards */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800">
            <span className="text-[11px] text-slate-400 block mb-1">Current Mastery</span>
            <div className="flex items-baseline space-x-1.5">
              <span className={`text-2xl font-black ${currentMastery >= requiredMastery ? 'text-emerald-400' : (isRootGap ? 'text-red-400' : 'text-amber-400')}`}>
                {currentMastery}%
              </span>
              <span className="text-xs text-slate-500">
                ({currentMastery >= requiredMastery ? 'Met' : `-${gap}% gap`})
              </span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
              <div
                className={`h-full rounded-full ${currentMastery >= requiredMastery ? 'bg-emerald-500' : (isRootGap ? 'bg-red-500' : 'bg-amber-500')}`}
                style={{ width: `${Math.min(100, currentMastery)}%` }}
              />
            </div>
          </div>

          <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800">
            <span className="text-[11px] text-slate-400 block mb-1">Evidence & Confidence</span>
            <div className="flex items-baseline space-x-2">
              <span className="text-sm font-bold text-white">{evidenceCount} items</span>
              <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded ${
                confidence === 'HIGH' ? 'bg-emerald-500/20 text-emerald-300' : (confidence === 'MEDIUM' ? 'bg-sky-500/20 text-sky-300' : 'bg-slate-800 text-slate-400')
              }`}>
                {confidence} CONF
              </span>
            </div>
            <span className="text-[10px] text-slate-500 mt-2 block">
              Required: {requiredMastery}% for role
            </span>
          </div>
        </div>

        {/* Prerequisites Section */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center justify-between">
            <span>Direct Prerequisites</span>
            <span className="text-[10px] text-slate-500 font-normal">{prerequisites.length} required</span>
          </h4>
          
          {prerequisites.length === 0 ? (
            <p className="text-xs text-slate-500 italic bg-slate-950/40 p-2.5 rounded-lg border border-slate-800">
              This is a root foundational competency (no prerequisite dependencies).
            </p>
          ) : (
            <div className="space-y-2">
              {prerequisites.map(p => (
                <div key={p.id} className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950/70 border border-slate-800/80">
                  <div>
                    <span className="text-xs font-semibold text-slate-200 block leading-tight">{p.name}</span>
                    <span className="text-[10px] text-slate-400">{p.code} • Req: {p.required_level}%</span>
                  </div>
                  <div className="text-right">
                    <span className={`text-xs font-bold ${p.user_mastery >= p.required_level ? 'text-emerald-400' : 'text-red-400'}`}>
                      {p.user_mastery}%
                    </span>
                    <span className="text-[10px] text-slate-500 block">{p.confidence}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Downstream Dependents */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center justify-between">
            <span>Downstream Dependents</span>
            <span className="text-[10px] text-slate-500 font-normal">{downstream.length} unblocked</span>
          </h4>
          
          {downstream.length === 0 ? (
            <p className="text-xs text-slate-500 italic bg-slate-950/40 p-2.5 rounded-lg border border-slate-800">
              Terminal or specialized competency in official statistical workflows.
            </p>
          ) : (
            <div className="space-y-1.5">
              {downstream.map(d => (
                <div key={d.id} className="flex items-center justify-between p-2 rounded-lg bg-slate-950/40 border border-slate-800/50 text-xs">
                  <span className="text-slate-300 font-medium">{d.name}</span>
                  <span className="text-slate-500 text-[10px]">Mastery: {d.user_mastery}%</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recommended Intervention / Course */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5 flex items-center space-x-1.5">
            <Sparkles className="w-3.5 h-3.5 text-sky-400" />
            <span>Recommended Learning Intervention</span>
          </h4>

          {courses.length > 0 ? (
            <div className="space-y-3">
              {courses.map(c => (
                <div key={c.id} className="p-3.5 rounded-xl bg-gradient-to-br from-slate-950 to-slate-900 border border-sky-500/30 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-sky-500/20 text-sky-400 border border-sky-500/30">
                      {c.provider}
                    </span>
                    <span className="text-[11px] text-slate-400">{c.duration_hours} hrs • {c.level}</span>
                  </div>
                  <h5 className="font-bold text-sm text-white leading-snug">{c.title}</h5>
                  <p className="text-xs text-slate-400">{c.description}</p>
                  
                  <div className="pt-2 flex items-center space-x-2">
                    <button
                      onClick={() => navigate('/learning')}
                      className="flex-1 flex items-center justify-center space-x-1.5 py-2 px-3 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition shadow-lg shadow-sky-600/20"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>Study & Verify Assessment</span>
                    </button>
                    <a
                      href={c.url}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                      title="Open Course Provider"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
              <p className="text-xs text-slate-400">Launch standard MoSPI assessment to establish verified evidence for this competency.</p>
              <button
                onClick={() => navigate('/learning')}
                className="w-full flex items-center justify-center space-x-1.5 py-2 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Take Verified AI Assessment</span>
              </button>
            </div>
          )}
        </div>

      </div>

      {/* Footer Quick Action */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between">
        <span className="text-xs text-slate-400">Target Level: <strong className="text-white">{requiredMastery}%</strong></span>
        <button
          onClick={() => navigate('/learning')}
          className="flex items-center space-x-1.5 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-lg shadow-emerald-600/20"
        >
          <span>Remediate Gap</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
}
