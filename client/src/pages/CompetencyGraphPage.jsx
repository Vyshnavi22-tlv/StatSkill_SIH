import React, { useState } from 'react';
import CompetencyGraph from '../components/CompetencyGraph';
import { Network, Sparkles, ShieldAlert, AlertTriangle, CheckCircle2, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function CompetencyGraphPage() {
  const navigate = useNavigate();
  const [selectedComp, setSelectedComp] = useState(null);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <span className="p-1.5 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20">
              <Network className="w-5 h-5" />
            </span>
            <span className="text-xs uppercase tracking-wider font-extrabold text-sky-400">
              Official Statistics Competency Graph
            </span>
          </div>
          <h1 className="text-2xl font-black text-white">Interactive Competency DAG & Prerequisite Cascade</h1>
          <p className="text-xs text-slate-400 mt-1">
            Visualizing direct prerequisite chains, identified root gaps (red glow), and downstream at-risk competencies (amber).
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate('/diagnostic')}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition border border-slate-700"
          >
            Retake Diagnostic
          </button>
          <button
            onClick={() => navigate('/learning')}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition shadow-lg shadow-sky-600/20"
          >
            <span>Remediate Root Gap</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Graph Visual Centerpiece */}
      <CompetencyGraph
        userId="usr_ananya_sharma"
        onSelectCompetency={(comp) => setSelectedComp(comp)}
      />

    </div>
  );
}
