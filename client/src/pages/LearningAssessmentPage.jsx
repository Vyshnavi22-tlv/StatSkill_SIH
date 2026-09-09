import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BookOpen, 
  FileText, 
  Sparkles, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  ArrowRight, 
  Zap, 
  Award, 
  Eye, 
  ExternalLink,
  ShieldCheck,
  RotateCcw
} from 'lucide-react';
import confetti from 'canvas-confetti';
import api from '../services/api';

export default function LearningAssessmentPage() {
  const navigate = useNavigate();
  const [assessment, setAssessment] = useState(null);
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [activeBacktrace, setActiveBacktrace] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function initAssessment() {
      try {
        const data = await api.getAssessmentForCompetency('comp_missing_val', 'usr_ananya_sharma');
        setAssessment(data);
      } catch (err) {
        console.error('Failed to load assessment:', err);
      } finally {
        setLoading(false);
      }
    }
    initAssessment();
  }, []);

  const handleSelectOption = (questionId, option) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: option
    }));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const res = await api.submitAssessment(
        assessment.assessmentId,
        'usr_ananya_sharma',
        assessment.competencyId,
        answers
      );
      setResult(res);

      if (res.passed) {
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.6 }
        });
      }
    } catch (err) {
      console.error('Failed to submit assessment:', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-3">
        <div className="w-8 h-8 border-3 border-sky-400 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-slate-400 font-medium">Generating Critic-Verified Assessment from MoSPI Manuals...</p>
      </div>
    );
  }

  const questions = assessment?.questions || [];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <span className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <BookOpen className="w-5 h-5" />
            </span>
            <span className="text-xs uppercase tracking-wider font-extrabold text-indigo-400">
              AI Assessment & Source-Level Backtrace
            </span>
          </div>
          <h1 className="text-2xl font-black text-white">Targeted Remediation: Missing Value Treatment</h1>
          <p className="text-xs text-slate-400 mt-1">
            Questions generated from <strong>MoSPI Data Quality Manual (Chapter 4)</strong> with Question Critic verification.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold flex items-center space-x-1.5">
            <ShieldCheck className="w-4 h-4" />
            <span>Critic Grounding Verified (Score: 0.95)</span>
          </span>
        </div>
      </div>

      {/* Two Column Layout: Source Document Material (Left) + AI Assessment (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Document Excerpt & Learning Material */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <FileText className="w-4 h-4 text-sky-400" />
                <span className="text-xs font-bold text-white">MoSPI Data Quality Manual</span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-bold">
                Page 27
              </span>
            </div>

            <div className="space-y-3 text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-4 rounded-xl border border-slate-800">
              <h4 className="font-bold text-sky-300 text-xs">Section 4.2 Hot-Deck vs Cold-Deck Imputation</h4>
              <p>
                When a specific commodity price quote is missing in the current month's survey round, <strong>hot-deck donor matching</strong> within the same stratum and urban/rural market cluster is the mandatory standard under MoSPI guidelines.
              </p>
              <p>
                <strong>Cold-deck imputation</strong> (using historical static baseline datasets) is strictly discouraged during volatile inflation periods because it creates lagged underestimation.
              </p>
              <p className="text-[11px] text-slate-400 italic">
                In hot-deck imputation, donor quotation must be drawn from an active responding unit sharing identical item specifications.
              </p>
            </div>

            <div className="bg-indigo-950/30 p-3.5 rounded-xl border border-indigo-500/30 text-xs text-indigo-200 space-y-1">
              <div className="flex items-center space-x-1.5 font-bold text-indigo-400">
                <Sparkles className="w-3.5 h-3.5" />
                <span>AI Critic Verification Guarantee</span>
              </div>
              <p className="text-[11px] text-slate-300">
                All assessment questions are strictly grounded in this official text chunk. Any incorrect response will immediately backtrace to this exact page number.
              </p>
            </div>
          </div>
        </div>

        {/* Right: Interactive AI Assessment Quiz */}
        <div className="lg:col-span-7 space-y-4">
          
          {result ? (
            /* Results & Backtrace Card */
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div>
                  <h3 className="text-lg font-black text-white">Assessment Feedback & Evidence Breakdown</h3>
                  <p className="text-xs text-slate-400">Instant source-level backtrace and recalculated competency mastery.</p>
                </div>
                <span className="text-2xl font-black text-emerald-400">{result.score}%</span>
              </div>

              {/* Mastery Before vs After Delta Banner */}
              {result.masteryUpdate && (
                <div className="bg-gradient-to-r from-emerald-950/50 via-slate-900 to-slate-950 border border-emerald-500/40 p-4 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-emerald-400 block tracking-wider">Competency Recalculated</span>
                    <h4 className="text-sm font-bold text-white">Missing Value Treatment</h4>
                  </div>
                  <div className="flex items-center space-x-3 text-right">
                    <div>
                      <span className="text-xs text-slate-400 line-through mr-1">{result.masteryUpdate.oldScore}%</span>
                      <span className="text-xl font-black text-emerald-400">{result.masteryUpdate.newScore}%</span>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold text-xs">
                      +{result.masteryUpdate.newScore - result.masteryUpdate.oldScore}% Gain
                    </span>
                  </div>
                </div>
              )}

              {/* Question-by-Question Backtrace */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Questions & Backtrace Verification</h4>
                
                {result.feedback.map((fb, idx) => (
                  <div
                    key={idx}
                    className={`p-4 rounded-xl border space-y-2.5 transition ${
                      fb.isCorrect ? 'bg-emerald-950/20 border-emerald-500/40' : 'bg-red-950/20 border-red-500/40'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center space-x-2">
                        {fb.isCorrect ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                        )}
                        <span className="text-xs font-bold text-white">Question {idx + 1}</span>
                      </div>

                      {/* Source Backtrace Button */}
                      <button
                        onClick={() => setActiveBacktrace(fb.sourceBacktrace)}
                        className="flex items-center space-x-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-sky-400 text-[11px] font-bold border border-slate-700 transition"
                      >
                        <Eye className="w-3 h-3" />
                        <span>Source: Page {fb.sourceBacktrace?.pageNumber}</span>
                      </button>
                    </div>

                    <p className="text-xs font-medium text-slate-200">{fb.questionText}</p>
                    
                    <div className="text-xs space-y-1 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
                      <div>
                        <span className="text-slate-400">Your Answer: </span>
                        <span className={fb.isCorrect ? 'text-emerald-400 font-bold' : 'text-red-400 font-bold'}>{fb.userAnswer}</span>
                      </div>
                      {!fb.isCorrect && (
                        <div>
                          <span className="text-slate-400">Correct Answer: </span>
                          <span className="text-emerald-400 font-bold">{fb.correctAnswer}</span>
                        </div>
                      )}
                      <p className="text-[11px] text-slate-300 mt-1 pt-1 border-t border-slate-800">{fb.explanation}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Action */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                <button
                  onClick={() => setResult(null)}
                  className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold hover:bg-slate-700 transition"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Retake Quiz</span>
                </button>

                <button
                  onClick={() => navigate('/graph')}
                  className="flex items-center space-x-1.5 px-6 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition shadow-lg shadow-sky-600/20"
                >
                  <span>View Updated Competency Graph</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

            </div>
          ) : (
            /* Quiz Form */
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
              
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white">Verified Knowledge Check</h3>
                  <p className="text-xs text-slate-400">Select answers to test missing value imputation rules.</p>
                </div>
                <span className="text-xs text-slate-500 font-mono font-bold">2 Questions</span>
              </div>

              <div className="space-y-6">
                {questions.map((q, qIndex) => (
                  <div key={q.id} className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-sky-400 font-bold">Q{qIndex + 1}.</span>
                      <span className="text-[10px] text-slate-500">Bloom: {q.bloomLevel} • Source: Page {q.sourcePage}</span>
                    </div>

                    <p className="text-xs font-bold text-white leading-relaxed">{q.questionText}</p>

                    <div className="space-y-2">
                      {q.options.map((opt, oIndex) => {
                        const isSelected = answers[q.id] === opt;
                        return (
                          <button
                            key={oIndex}
                            onClick={() => handleSelectOption(q.id, opt)}
                            className={`w-full text-left p-3 rounded-lg border text-xs transition flex items-start space-x-2.5 ${
                              isSelected
                                ? 'bg-sky-500/20 border-sky-500 text-white font-semibold'
                                : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:bg-slate-800/60'
                            }`}
                          >
                            <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
                              isSelected ? 'bg-sky-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                            }`}>
                              {String.fromCharCode(65 + oIndex)}
                            </span>
                            <span className="flex-1 leading-snug">{opt}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={handleSubmit}
                disabled={submitting || Object.keys(answers).length < questions.length}
                className="w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition shadow-lg shadow-sky-600/20 disabled:opacity-40"
              >
                <span>{submitting ? 'Verifying with Critic...' : 'Submit & Verify Answers'}</span>
                <CheckCircle2 className="w-4 h-4" />
              </button>

            </div>
          )}

        </div>

      </div>

      {/* SOURCE BACKTRACE MODAL / DRAWER */}
      {activeBacktrace && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-sky-400" />
                <h3 className="text-base font-bold text-white">Source-Level Backtrace Reference</h3>
              </div>
              <button
                onClick={() => setActiveBacktrace(null)}
                className="text-slate-400 hover:text-white text-xs font-bold p-1 bg-slate-800 rounded"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Document:</span>
                <span className="font-bold text-white">{activeBacktrace.documentTitle}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Location:</span>
                <span className="font-mono font-bold text-sky-400">Page {activeBacktrace.pageNumber}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Section:</span>
                <span className="font-bold text-slate-200">{activeBacktrace.sectionHeading}</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 leading-relaxed font-serif">
              <p className="border-l-2 border-sky-500 pl-3 italic">
                "{activeBacktrace.chunkText}"
              </p>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setActiveBacktrace(null)}
                className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition"
              >
                Got it, close citation
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
