import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { AlertTriangle, AlertCircle, CheckCircle2, TrendingUp, ShieldAlert, Zap } from 'lucide-react';

const CompetencyGraphNode = ({ data, selected }) => {
  const {
    id,
    code,
    name,
    domain,
    user_mastery = 0,
    required_level = 70,
    status = 'ON_TRACK',
    badgeText = 'On Track',
    confidence = 'LOW',
    isRootGap = false,
    isAtRisk = false,
    downstream_impact_count = 0
  } = data;

  const isMastered = status === 'MASTERED';

  // Status-based styling
  let statusBadgeClasses = 'bg-sky-500/10 text-sky-400 border-sky-500/30';
  let cardBorderClasses = 'border-slate-700/80 bg-slate-900/90';
  let progressBarColor = 'bg-sky-500';
  let StatusIcon = TrendingUp;

  if (status === 'ROOT_GAP' || isRootGap) {
    statusBadgeClasses = 'bg-red-500/20 text-red-400 border-red-500/40 animate-pulse';
    cardBorderClasses = 'border-red-500/80 bg-slate-900/95 root-gap-glow';
    progressBarColor = 'bg-red-500';
    StatusIcon = ShieldAlert;
  } else if (status === 'AT_RISK' || isAtRisk) {
    statusBadgeClasses = 'bg-amber-500/20 text-amber-300 border-amber-500/40';
    cardBorderClasses = 'border-amber-500/70 bg-slate-900/90 at-risk-glow';
    progressBarColor = 'bg-amber-500';
    StatusIcon = AlertTriangle;
  } else if (isMastered) {
    statusBadgeClasses = 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
    cardBorderClasses = 'border-emerald-500/50 bg-slate-900/90';
    progressBarColor = 'bg-emerald-500';
    StatusIcon = CheckCircle2;
  }

  return (
    <div
      className={`relative rounded-xl border p-3.5 shadow-xl transition-all cursor-pointer w-[240px] select-none ${cardBorderClasses} ${
        selected ? 'ring-2 ring-sky-400 ring-offset-2 ring-offset-slate-950 scale-[1.03]' : 'hover:scale-[1.02] hover:border-slate-500'
      }`}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="w-2.5 h-2.5 !bg-sky-400 !border-slate-900"
      />
      <Handle
        type="target"
        position={Position.Left}
        id="left"
        className="w-2.5 h-2.5 !bg-sky-400 !border-slate-900"
      />

      {/* Top Bar: Domain & Code */}
      <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1.5">
        <span className="font-mono uppercase tracking-wider text-slate-400">{code}</span>
        <span className="truncate max-w-[100px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-medium">
          {domain}
        </span>
      </div>

      {/* Competency Name */}
      <h3 className="font-bold text-slate-100 text-sm leading-tight mb-2 min-h-[34px] line-clamp-2">
        {name}
      </h3>

      {/* Mastery Bar */}
      <div className="space-y-1 mb-2.5">
        <div className="flex justify-between items-center text-xs">
          <span className="text-slate-400 text-[11px]">Mastery:</span>
          <div className="flex items-center space-x-1 font-bold">
            <span className={user_mastery >= required_level ? 'text-emerald-400' : (status === 'ROOT_GAP' ? 'text-red-400' : 'text-amber-400')}>
              {user_mastery}%
            </span>
            <span className="text-slate-500 text-[10px]">/ {required_level}% req</span>
          </div>
        </div>
        
        {/* Progress Track */}
        <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden relative">
          <div
            className={`h-full rounded-full transition-all duration-500 ${progressBarColor}`}
            style={{ width: `${Math.min(100, Math.max(5, user_mastery))}%` }}
          />
          {/* Required level marker line */}
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-white/70"
            style={{ left: `${required_level}%` }}
            title={`Required: ${required_level}%`}
          />
        </div>
      </div>

      {/* Bottom Status Badge */}
      <div className="flex items-center justify-between pt-1 border-t border-slate-800/80">
        <div className={`flex items-center space-x-1 px-2 py-0.5 rounded-md text-[10px] font-bold border ${statusBadgeClasses}`}>
          <StatusIcon className="w-3 h-3" />
          <span>{badgeText}</span>
        </div>

        {isRootGap && (
          <span className="text-[10px] font-extrabold text-red-400 bg-red-950/60 px-1.5 py-0.5 rounded border border-red-800/60">
            ROOT GAP
          </span>
        )}

        {isAtRisk && !isRootGap && (
          <span className="text-[9px] text-amber-400/90 font-medium">
            Prereq Blocked
          </span>
        )}
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        className="w-2.5 h-2.5 !bg-sky-400 !border-slate-900"
      />
      <Handle
        type="source"
        position={Position.Right}
        id="right"
        className="w-2.5 h-2.5 !bg-sky-400 !border-slate-900"
      />
    </div>
  );
};

export default memo(CompetencyGraphNode);
