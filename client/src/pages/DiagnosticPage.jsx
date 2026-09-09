import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  CheckCircle2, 
  XCircle,
  AlertCircle, 
  ShieldAlert, 
  ArrowRight, 
  RotateCcw, 
  Zap, 
  Sparkles, 
  Layers, 
  HelpCircle,
  ChevronDown,
  ChevronUp,
  BarChart2,
  TrendingUp,
  Award
} from 'lucide-react';
import confetti from 'canvas-confetti';
import api from '../services/api';

export default function DiagnosticPage() {
  const navigate = useNavigate();
  const [diagnostic, setDiagnostic] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [expandedCompId, setExpandedCompId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function initDiagnostic() {
      try {
        const data = await api.startDiagnostic('usr_ananya_sharma');
        setDiagnostic(data);
      } catch (err) {
        console.error('Failed to load diagnostic:', err);
      } finally {
        setLoading(false);
      }
    }
    initDiagnostic();
  }, []);

  const handleSelectOption = (questionId, option) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: option
    }));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const res = await api.submitDiagnostic(diagnostic.diagnosticId, 'usr_ananya_sharma', selectedAnswers);
      setResult(res);
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 }
      });
    } catch (err) {
      console.error('Failed to submit diagnostic:', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-3">
        <div className="w-8 h-8 border-3 border-sky-400 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-slate-400 font-medium">Initializing Role-Specific Price Statistics Diagnostic...</p>
      </div>
    );
  }

  const questions = diagnostic?.questions || [];
  const currentQ = questions[currentIndex];
  const isLast = currentIndex === questions.length - 1;
  const answeredCount = Object.keys(selectedAnswers).length;

  if (result) {
    const summaries = result.competencySummaries || [];

    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-500">
        
        {/* Results Overview Header Card */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl text-center space-y-6 relative overflow-hidden">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 mx-auto flex items-center justify-center">
            <Award className="w-7 h-7" />
          </div>

          <div>
            <span className="text-xs font-bold text-sky-400 uppercase tracking-wider">MoSPI Official Baseline Diagnostic</span>
            <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">Diagnostic Completed — Explainable Mastery Report</h1>
            <p className="text-xs text-slate-400 mt-1 max-w-xl mx-auto">
              Mastery scores updated deterministically across all tested statistical, computing, and data quality competencies.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto">
            <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Overall Diagnostic Score</span>
              <span className="text-3xl font-black text-sky-400">{result.overallScore}%</span>
              <span className="text-[10px] text-slate-500 block mt-0.5">{result.correctCount} of {result.totalQuestions} correct</span>
            </div>

            <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">XP & Level Progress</span>
              <span className="text-3xl font-black text-amber-400">+{result.gamification?.awardedXP || 50} XP</span>
              <span className="text-[10px] text-amber-400 font-semibold block mt-0.5">Total: {result.gamification?.totalXP || 1700} XP</span>
            </div>

            <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Root Gaps Diagnosed</span>
              <span className="text-3xl font-black text-red-400">{result.gapAnalysis?.rootGapIds?.length || 2}</span>
              <span className="text-[10px] text-red-400 font-semibold block mt-0.5">Cascade Bottlenecks Identified</span>
            </div>
          </div>
        </div>

        {/* SECTION: "Why Did I Get This Score?" Explainable Breakdown */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-800">
            <div>
              <div className="flex items-center space-x-2">
                <HelpCircle className="w-5 h-5 text-sky-400" />
                <h2 className="text-lg font-black text-white">Why Did I Get This Score? (Explainable Evidence Breakdown)</h2>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Every score is deterministically calculated from your evidence ledger (diagnostic accuracy, difficulty weights, and historical quizzes).
              </p>
            </div>
          </div>

          {/* Competency Breakdown Cards */}
          <div className="space-y-4">
            {summaries.map(item => {
              const isExpanded = expandedCompId === item.competencyId;
              const isRoot = item.isRootGap;
              const isRisk = item.isAtRisk;
              const isMet = item.mastery >= item.requiredLevel;

              return (
                <div
                  key={item.competencyId}
                  className={`p-5 rounded-2xl border transition ${
                    isRoot 
                      ? 'bg-red-950/20 border-red-500/50 root-gap-glow' 
                      : (isRisk ? 'bg-amber-950/15 border-amber-500/40' : 'bg-slate-950/70 border-slate-800')
                  }`}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    
                    {/* Left Info */}
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-bold text-white">{item.competencyName}</span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                          {item.domain}
                        </span>
                        {isRoot && (
                          <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-red-500/20 text-red-300 border border-red-500/40 animate-pulse">
                            Root Gap
                          </span>
                        )}
                        {isRisk && !isRoot && (
                          <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                            Prereq Blocked
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400">
                        {item.rootCauseExplanation}
                      </p>
                    </div>

                    {/* Right Metrics & Delta */}
                    <div className="flex items-center space-x-6">
                      
                      {/* Before vs After */}
                      <div className="text-right">
                        <span className="text-[10px] text-slate-500 uppercase font-bold block">Mastery Score</span>
                        <div className="flex items-center space-x-1.5">
                          {item.beforeMastery > 0 && item.beforeMastery !== item.mastery && (
                            <span className="text-xs text-slate-500 line-through">{item.beforeMastery}%</span>
                          )}
                          <span className={`text-lg font-black ${isMet ? 'text-emerald-400' : (isRoot ? 'text-red-400' : 'text-amber-400')}`}>
                            {item.mastery}%
                          </span>
                          <span className="text-slate-500 text-[11px]">/ {item.requiredLevel}% req</span>
                        </div>
                      </div>

                      {/* Confidence Tag */}
                      <div className="text-right">
                        <span className="text-[10px] text-slate-500 uppercase font-bold block">Confidence</span>
                        <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                          item.confidence === 'HIGH' ? 'bg-emerald-500/20 text-emerald-300' : (item.confidence === 'MEDIUM' ? 'bg-sky-500/20 text-sky-300' : 'bg-slate-800 text-slate-400')
                        }`}>
                          {item.confidence} ({item.evidenceCount} Ev)
                        </span>
                      </div>

                      {/* Toggle Details */}
                      <button
                        onClick={() => setExpandedCompId(isExpanded ? null : item.competencyId)}
                        className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                        title="Inspect Evidence Ledger"
                      >
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>

                    </div>

                  </div>

                  {/* Expanded Evidence Ledger Details */}
                  {isExpanded && (
                    <div className="mt-4 pt-4 border-t border-slate-800 space-y-3 animate-in fade-in">
                      <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        Evidence Composition for {item.competencyName}
                      </h4>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                        <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                          <span className="text-slate-500 text-[10px] block">Diagnostic Accuracy</span>
                          <span className="font-bold text-white">{item.perfInDiagnostic} correct</span>
                        </div>

                        <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                          <span className="text-slate-500 text-[10px] block">Diagnostic Ev Avg</span>
                          <span className="font-bold text-sky-400">{item.breakdown?.diagnosticAvg ?? 'N/A'}%</span>
                        </div>

                        <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                          <span className="text-slate-500 text-[10px] block">Quiz Ev Items</span>
                          <span className="font-bold text-indigo-400">{item.breakdown?.quizCount || 0} recorded</span>
                        </div>

                        <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                          <span className="text-slate-500 text-[10px] block">Total Evidence Count</span>
                          <span className="font-bold text-emerald-400">{item.evidenceCount} items</span>
                        </div>
                      </div>

                      {/* Questions Review in this competency */}
                      <div className="space-y-2 pt-2">
                        <span className="text-[10px] uppercase font-bold text-slate-500 block">Questions Evaluated</span>
                        {(item.questions || []).map((q, qIdx) => (
                          <div key={qIdx} className="p-3 rounded-lg bg-slate-900/90 border border-slate-800/80 text-xs space-y-1.5">
                            <div className="flex items-center space-x-2">
                              {q.isCorrect ? (
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                              ) : (
                                <XCircle className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
                              )}
                              <span className="text-slate-200 font-medium">{q.text}</span>
                            </div>
                            <div className="text-[11px] text-slate-400 pl-5">
                              <span>Your answer: <strong className={q.isCorrect ? 'text-emerald-400' : 'text-red-400'}>{q.userAns}</strong></span>
                              {!q.isCorrect && <span className="ml-3 text-emerald-400">Correct: {q.correctAns}</span>}
                            </div>
                            <p className="text-[11px] text-slate-400 pl-5 italic">{q.explanation}</p>
                          </div>
                        ))}
                      </div>

                    </div>
                  )}

                </div>
              );
            })}
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-slate-800">
            <button
              onClick={() => {
                setResult(null);
                setCurrentIndex(0);
                setSelectedAnswers({});
              }}
              className="flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold hover:bg-slate-700 transition"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Retake Diagnostic</span>
            </button>

            <div className="flex items-center space-x-3">
              <button
                onClick={() => navigate('/learning')}
                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition"
              >
                Go to Recommended Learning
              </button>
              <button
                onClick={() => navigate('/graph')}
                className="flex items-center space-x-1.5 px-6 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition shadow-lg shadow-sky-600/20"
              >
                <span>View Updated Graph Cascade</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

        </div>

      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-bold text-sky-400 uppercase tracking-wider">MoSPI Official Diagnostic</span>
          <h1 className="text-xl font-black text-white">Assistant Director (Price Statistics) Assessment</h1>
          <p className="text-xs text-slate-400 mt-0.5">13 MCQs covering Sampling, Probability, Data Quality, Index Theory & Computing</p>
        </div>
        <div className="text-right">
          <span className="text-xs font-bold text-slate-400">Question {currentIndex + 1} of {questions.length}</span>
          <div className="w-32 bg-slate-800 h-2 rounded-full mt-1 overflow-hidden">
            <div 
              className="h-full bg-sky-500 rounded-full transition-all"
              style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Question Card */}
      {currentQ && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
          
          <div className="flex items-center justify-between text-xs">
            <span className="px-2.5 py-0.5 rounded bg-slate-800 text-sky-400 font-bold border border-slate-700">
              {currentQ.competency_name}
            </span>
            <span className="text-slate-500">{currentQ.difficulty} • Bloom: {currentQ.bloom_level}</span>
          </div>

          <p className="text-base font-bold text-slate-100 leading-relaxed">
            {currentQ.question_text}
          </p>

          {/* Options */}
          <div className="space-y-3">
            {currentQ.options.map((opt, idx) => {
              const isSelected = selectedAnswers[currentQ.id] === opt;
              return (
                <button
                  key={idx}
                  onClick={() => handleSelectOption(currentQ.id, opt)}
                  className={`w-full text-left p-4 rounded-xl border text-xs font-medium transition flex items-start space-x-3 ${
                    isSelected
                      ? 'bg-sky-500/15 border-sky-500/60 text-white shadow-md shadow-sky-500/10'
                      : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-800/60 hover:border-slate-700'
                  }`}
                >
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] mt-0.5 ${
                    isSelected ? 'bg-sky-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <span className="flex-1 leading-relaxed">{opt}</span>
                </button>
              );
            })}
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-800">
            <button
              onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
              disabled={currentIndex === 0}
              className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 disabled:opacity-40 text-xs font-bold transition"
            >
              Previous
            </button>

            {isLast ? (
              <button
                onClick={handleSubmit}
                disabled={submitting || answeredCount === 0}
                className="flex items-center space-x-1.5 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-lg shadow-emerald-600/20 disabled:opacity-50"
              >
                <span>{submitting ? 'Submitting & Evaluating...' : 'Submit Diagnostic'}</span>
                <CheckCircle2 className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={() => setCurrentIndex(prev => Math.min(questions.length - 1, prev + 1))}
                className="flex items-center space-x-1.5 px-6 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition shadow-lg shadow-sky-600/20"
              >
                <span>Next Question</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>

        </div>
      )}

    </div>
  );
}
