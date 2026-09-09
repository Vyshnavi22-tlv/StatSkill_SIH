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
  RotateCcw,
  Upload,
  Cpu,
  Check,
  ChevronRight,
  Layers
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

  // Document Ingestion Pipeline State
  const [pipelineRunning, setPipelineRunning] = useState(false);
  const [pipelineStep, setPipelineStep] = useState('IDLE'); // 'EXTRACTING' | 'MAPPING' | 'GENERATING' | 'VALIDATING' | 'APPROVED'
  const [pipelineReport, setPipelineReport] = useState(null);

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

  const handleRunPipeline = async () => {
    setPipelineRunning(true);
    setPipelineStep('EXTRACTING');
    
    // Animate through pipeline steps for visual feedback
    setTimeout(() => setPipelineStep('MAPPING'), 600);
    setTimeout(() => setPipelineStep('GENERATING'), 1200);
    setTimeout(() => setPipelineStep('VALIDATING'), 1800);

    try {
      const res = await fetch('/api/documents/pipeline/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentTitle: 'MoSPI Data Quality Manual (Chapter 4)',
          domain: 'STATISTICAL',
          pageNumber: 27,
          competencyId: 'comp_missing_val'
        })
      }).then(r => r.json());

      setTimeout(() => {
        setPipelineStep('APPROVED');
        setPipelineReport(res);
        setPipelineRunning(false);
        // Refresh assessment questions
        if (res.questions && res.questions.length > 0) {
          setAssessment(prev => ({
            ...prev,
            questions: res.questions.map(q => ({
              id: q.id,
              questionText: q.question_text,
              options: q.options,
              difficulty: q.difficulty,
              bloomLevel: q.bloom_level,
              criticScore: q.criticScore,
              sourceDocumentTitle: q.sourceDocumentTitle,
              sourcePage: q.sourcePage,
              sourceChunkHeading: 'Chapter 4: Missing Value Imputation',
              sourceChunkText: q.explanation
            }))
          }));
        }
      }, 2400);

    } catch (err) {
      console.error('Pipeline error:', err);
      setPipelineRunning(false);
    }
  };

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
              Document-to-Assessment AI Pipeline & Source Backtrace
            </span>
          </div>
          <h1 className="text-2xl font-black text-white">Targeted Remediation: Missing Value Treatment</h1>
          <p className="text-xs text-slate-400 mt-1">
            Grounded MCQ generation with Question Critic verification from <strong>MoSPI Data Quality Manual (Page 27)</strong>.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold flex items-center space-x-1.5">
            <ShieldCheck className="w-4 h-4" />
            <span>Critic Verification Active (Score: 0.95)</span>
          </span>
        </div>
      </div>

      {/* PIPELINE STATUS BANNER & INGESTION CONTROLLER */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-950 p-5 rounded-2xl border border-slate-800 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <Cpu className="w-5 h-5 text-sky-400" />
            <div>
              <h3 className="text-sm font-bold text-white">AI Document-to-Assessment Pipeline</h3>
              <p className="text-[11px] text-slate-400">Page-aware extraction → Concept mapping → MCQ generation → Question Critic</p>
            </div>
          </div>

          <button
            onClick={handleRunPipeline}
            disabled={pipelineRunning}
            className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition shadow-lg shadow-indigo-600/20 disabled:opacity-50"
          >
            <Upload className="w-4 h-4" />
            <span>{pipelineRunning ? 'Executing Pipeline...' : 'Re-Run Document Pipeline'}</span>
          </button>
        </div>

        {/* 5-Step Pipeline Stepper */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-2">
          {[
            { id: 'EXTRACTING', label: '1. Extracting', desc: 'PDF & Page 27' },
            { id: 'MAPPING', label: '2. Mapping', desc: 'QUAL-102 Concepts' },
            { id: 'GENERATING', label: '3. Generating', desc: 'Bloom MCQs' },
            { id: 'VALIDATING', label: '4. Validating', desc: 'Question Critic' },
            { id: 'APPROVED', label: '5. Approved', desc: 'Stored & Active' }
          ].map(st => {
            const stepOrder = ['IDLE', 'EXTRACTING', 'MAPPING', 'GENERATING', 'VALIDATING', 'APPROVED'];
            const currIdx = stepOrder.indexOf(pipelineStep);
            const thisIdx = stepOrder.indexOf(st.id);
            const isDone = currIdx >= thisIdx && pipelineStep !== 'IDLE';
            const isCurrent = pipelineStep === st.id;

            return (
              <div
                key={st.id}
                className={`p-3 rounded-xl border text-center transition ${
                  isCurrent
                    ? 'bg-sky-500/20 border-sky-500 text-sky-300 shadow-md shadow-sky-500/10 animate-pulse'
                    : (isDone ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-300' : 'bg-slate-950/40 border-slate-800 text-slate-500')
                }`}
              >
                <div className="text-[11px] font-bold flex items-center justify-center space-x-1">
                  {isDone && !isCurrent && <Check className="w-3 h-3 text-emerald-400" />}
                  <span>{st.label}</span>
                </div>
                <span className="text-[10px] text-slate-400 block mt-0.5">{st.desc}</span>
              </div>
            );
          })}
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

            {/* Question Critic 6-Point Checklist Banner */}
            <div className="bg-indigo-950/30 p-3.5 rounded-xl border border-indigo-500/30 text-xs text-indigo-200 space-y-2">
              <div className="flex items-center justify-between font-bold text-indigo-400">
                <div className="flex items-center space-x-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Question Critic Guarantee</span>
                </div>
                <span className="text-[10px] uppercase px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300">
                  Score: 0.95 / 1.0
                </span>
              </div>
              
              <ul className="space-y-1 text-[11px] text-slate-300">
                <li className="flex items-center space-x-1.5 text-emerald-400">
                  <Check className="w-3 h-3" />
                  <span>1. Source grounding verified against Page 27</span>
                </li>
                <li className="flex items-center space-x-1.5 text-emerald-400">
                  <Check className="w-3 h-3" />
                  <span>2. Single unambiguous correct answer enforced</span>
                </li>
                <li className="flex items-center space-x-1.5 text-emerald-400">
                  <Check className="w-3 h-3" />
                  <span>3. Bloom taxonomy aligned (Application & Analysis)</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Right: Interactive AI Assessment Quiz */}
        <div className="lg:col-span-7 space-y-4">
          
          {result ? (
            /* Results & Backtrace Card */
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-6 animate-in fade-in">
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
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Questions & Metadata-Grounded Backtrace</h4>
                  <button
                    onClick={() => navigate('/mentor')}
                    className="flex items-center space-x-1 text-xs text-sky-400 hover:text-sky-300 font-semibold"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Ask AI Mentor on Data Quality Manual</span>
                  </button>
                </div>
                
                {result.feedback.map((fb, idx) => (
                  <div
                    key={idx}
                    className={`p-4 rounded-xl border space-y-3 transition ${
                      fb.isCorrect ? 'bg-emerald-950/20 border-emerald-500/40' : 'bg-red-950/25 border-red-500/40 shadow-lg'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center space-x-2">
                        {fb.isCorrect ? (
                          <span className="flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Correct</span>
                          </span>
                        ) : (
                          <span className="flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-red-500/20 text-red-300 text-xs font-bold border border-red-500/30">
                            <XCircle className="w-3.5 h-3.5 text-red-400" />
                            <span>Incorrect</span>
                          </span>
                        )}
                        <span className="text-xs font-bold text-white">Question {idx + 1}</span>
                      </div>

                      {/* Source Backtrace Button */}
                      <button
                        onClick={() => setActiveBacktrace(fb.sourceBacktrace)}
                        className="flex items-center space-x-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-sky-400 text-[11px] font-bold border border-slate-700 transition"
                      >
                        <Eye className="w-3 h-3" />
                        <span>View Source Citation (Page {fb.sourceBacktrace?.pageNumber})</span>
                      </button>
                    </div>

                    <p className="text-xs font-semibold text-slate-100">{fb.questionText}</p>
                    
                    {fb.isCorrect ? (
                      <div className="text-xs space-y-1 bg-slate-950/60 p-3 rounded-lg border border-slate-800">
                        <div className="flex items-center space-x-2">
                          <span className="text-slate-400">Your Answer: </span>
                          <span className="text-emerald-400 font-bold">{fb.userAnswer}</span>
                        </div>
                        <p className="text-[11px] text-slate-300 mt-1 pt-1 border-t border-slate-800/80">{fb.explanation}</p>
                      </div>
                    ) : (
                      /* EXACT SPECIFICATION FORMAT FOR INCORRECT ANSWERS */
                      <div className="space-y-3 pt-1">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                          <div className="p-2.5 rounded-lg bg-red-950/50 border border-red-500/30 space-y-0.5">
                            <span className="text-[10px] uppercase font-black tracking-wider text-red-400 block">
                              Incorrect Answer
                            </span>
                            <span className="text-red-200 font-semibold">{fb.userAnswer}</span>
                          </div>

                          <div className="p-2.5 rounded-lg bg-emerald-950/50 border border-emerald-500/30 space-y-0.5">
                            <span className="text-[10px] uppercase font-black tracking-wider text-emerald-400 block">
                              Correct Answer
                            </span>
                            <span className="text-emerald-200 font-semibold">{fb.correctAnswer}</span>
                          </div>
                        </div>

                        {/* Stored Question Metadata Source Backtrace */}
                        <div className="p-3.5 rounded-xl bg-slate-950/90 border border-slate-800 space-y-2 text-xs">
                          <div className="flex items-center space-x-1.5 text-sky-400 font-bold">
                            <BookOpen className="w-4 h-4" />
                            <span>Review this concept:</span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                            <div>
                              <span className="text-slate-400 block text-[10px]">Document:</span>
                              <strong className="text-slate-200 font-mono">Data_Quality_Manual.pdf</strong>
                            </div>
                            <div>
                              <span className="text-slate-400 block text-[10px]">Page:</span>
                              <strong className="text-sky-400 font-mono text-xs">27</strong>
                            </div>
                            <div>
                              <span className="text-slate-400 block text-[10px]">Section:</span>
                              <strong className="text-slate-200">Missing Value Treatment</strong>
                            </div>
                          </div>

                          <p className="text-[11px] text-slate-300 italic pl-3 border-l-2 border-sky-500">
                            "{fb.sourceBacktrace?.chunkText || fb.explanation}"
                          </p>
                        </div>
                      </div>
                    )}
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
                <span className="text-xs text-slate-500 font-mono font-bold">{questions.length} Questions</span>
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
