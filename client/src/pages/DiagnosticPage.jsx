import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, AlertCircle, ShieldAlert, ArrowRight, RotateCcw, Zap, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import api from '../services/api';

export default function DiagnosticPage() {
  const navigate = useNavigate();
  const [diagnostic, setDiagnostic] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
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
        particleCount: 80,
        spread: 70,
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
        <p className="text-xs text-slate-400 font-medium">Initializing Baseline Diagnostic...</p>
      </div>
    );
  }

  const questions = diagnostic?.questions || [];
  const currentQ = questions[currentIndex];
  const isLast = currentIndex === questions.length - 1;
  const answeredCount = Object.keys(selectedAnswers).length;

  if (result) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 space-y-8 animate-in fade-in zoom-in-95 duration-500">
        
        {/* Results Card */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-8 shadow-2xl text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 mx-auto flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div>
            <h1 className="text-2xl font-black text-white">Diagnostic Assessment Completed!</h1>
            <p className="text-xs text-slate-400 mt-1">
              Your responses have updated your baseline competency graph and evidence ledger.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto">
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Score</span>
              <span className="text-2xl font-black text-sky-400">{result.score}%</span>
            </div>
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Correct</span>
              <span className="text-2xl font-black text-emerald-400">{result.correctCount} / {result.totalQuestions}</span>
            </div>
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">XP Awarded</span>
              <span className="text-2xl font-black text-amber-400">+{result.gamification?.awardedXP || 50} XP</span>
            </div>
          </div>

          {/* Root Gaps Detected */}
          <div className="bg-red-950/40 border border-red-500/40 p-5 rounded-2xl text-left space-y-3 root-gap-glow">
            <div className="flex items-center space-x-2 text-red-400 font-bold text-xs">
              <ShieldAlert className="w-4 h-4" />
              <span>DIAGNOSTIC ROOT-CAUSE DEFICIT IDENTIFIED</span>
            </div>
            <p className="text-xs text-red-200/90 leading-relaxed">
              Based on your answers, the root deficit lies in <strong className="text-white">Probability Fundamentals</strong> and <strong className="text-white">Missing Value Treatment</strong>. The recommendation engine has updated your personalized learning path.
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-center space-x-4 pt-4">
            <button
              onClick={() => navigate('/graph')}
              className="flex items-center space-x-2 px-6 py-3 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition shadow-lg shadow-sky-600/20"
            >
              <span>View Updated Competency Graph</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => navigate('/learning')}
              className="flex items-center space-x-2 px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition"
            >
              <span>Go to Learning Material</span>
            </button>
          </div>

        </div>

      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-bold text-sky-400 uppercase tracking-wider">MoSPI Official Diagnostic</span>
          <h1 className="text-xl font-black text-white">Price Statistics Baseline Assessment</h1>
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
                <span>{submitting ? 'Submitting...' : 'Submit Diagnostic'}</span>
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
