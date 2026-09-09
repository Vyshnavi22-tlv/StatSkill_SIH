import { Router } from 'express';
import db from '../db/database.js';
import { MasteryEngine } from '../services/masteryEngine.js';
import { RootGapEngine } from '../services/rootGapEngine.js';
import { GamificationEngine } from '../services/gamificationEngine.js';

const router = Router();

// Start or fetch role-specific diagnostic for Assistant Director — Price Statistics
router.get('/start', (req, res) => {
  const userId = req.query.userId || 'usr_ananya_sharma';
  
  // Fetch all 13 diagnostic MCQs
  const questions = db.prepare(`
    SELECT q.id, q.question_text, q.options, q.competency_id, q.difficulty, q.bloom_level, c.name as competency_name, c.domain
    FROM questions q
    JOIN competencies c ON q.competency_id = c.id
    WHERE q.source_document_id IS NULL
    ORDER BY c.domain, q.id
  `).all();

  const formattedQuestions = questions.map(q => ({
    ...q,
    options: JSON.parse(q.options)
  }));

  const diagId = `diag_${Date.now()}`;
  db.prepare(`
    INSERT INTO diagnostics (id, user_id, title, status, total_questions)
    VALUES (?, ?, 'Assistant Director — Price Statistics Baseline Diagnostic', 'IN_PROGRESS', ?)
  `).run(diagId, userId, formattedQuestions.length);

  res.json({
    diagnosticId: diagId,
    roleTitle: 'Assistant Director — Price Statistics',
    title: 'Price Statistics Official Baseline Diagnostic',
    totalQuestions: formattedQuestions.length,
    competenciesTested: ['Probability', 'Sampling', 'Data Quality', 'Index Number Theory', 'Statistical Computing'],
    questions: formattedQuestions
  });
});

// Submit diagnostic answers & return deterministic explainable breakdown ("Why did I get this score?")
router.post('/:id/submit', (req, res) => {
  const { id } = req.params;
  const { userId = 'usr_ananya_sharma', answers = {} } = req.body;

  let totalCorrect = 0;
  const competencyPerformance = {}; // compId -> { correct: 0, total: 0, items: [] }
  const answerEntries = Object.entries(answers);

  // 1. Evaluate answers & record evidence
  answerEntries.forEach(([qId, userAns]) => {
    const q = db.prepare('SELECT * FROM questions WHERE id = ?').get(qId);
    if (!q) return;

    const isCorrect = (q.correct_answer === userAns) ? 1 : 0;
    if (isCorrect) totalCorrect++;

    if (!competencyPerformance[q.competency_id]) {
      competencyPerformance[q.competency_id] = { correct: 0, total: 0, questions: [] };
    }
    competencyPerformance[q.competency_id].total++;
    if (isCorrect) competencyPerformance[q.competency_id].correct++;
    competencyPerformance[q.competency_id].questions.push({
      questionId: q.id,
      text: q.question_text,
      userAns,
      correctAns: q.correct_answer,
      isCorrect,
      explanation: q.explanation
    });

    // Insert diagnostic answer
    db.prepare(`
      INSERT INTO diagnostic_answers (id, diagnostic_id, question_id, user_answer, is_correct)
      VALUES (?, ?, ?, ?, ?)
    `).run(`da_${Date.now()}_${qId}`, id, qId, userAns, isCorrect);

    // Insert discrete evidence item
    const score = isCorrect ? 100 : 0;
    db.prepare(`
      INSERT INTO evidence (id, user_id, competency_id, diagnostic_id, question_id, evidence_type, score, weight, difficulty)
      VALUES (?, ?, ?, ?, ?, 'DIAGNOSTIC', ?, 1.0, ?)
    `).run(`ev_diag_${Date.now()}_${qId}`, userId, q.competency_id, id, qId, score, q.difficulty);
  });

  // 2. Deterministic recalculation of mastery for each tested competency
  const competencySummaries = [];
  const affectedCompIds = Object.keys(competencyPerformance);

  affectedCompIds.forEach(compId => {
    const comp = db.prepare('SELECT * FROM competencies WHERE id = ?').get(compId);
    const roleComp = db.prepare(`
      SELECT rc.* FROM role_competencies rc
      JOIN users u ON rc.role_id = u.role_id
      WHERE u.id = ? AND rc.competency_id = ?
    `).get(userId, compId);

    const masteryResult = MasteryEngine.recalculateMastery(userId, compId);

    competencySummaries.push({
      competencyId: compId,
      competencyName: comp ? comp.name : compId,
      domain: comp ? comp.domain : 'STATISTICAL',
      mastery: masteryResult.newScore,
      beforeMastery: masteryResult.oldScore,
      delta: masteryResult.newScore - masteryResult.oldScore,
      requiredLevel: roleComp ? roleComp.required_level : (comp ? comp.required_level : 70),
      confidence: masteryResult.confidence,
      evidenceCount: masteryResult.evidenceCount,
      perfInDiagnostic: `${competencyPerformance[compId].correct}/${competencyPerformance[compId].total}`,
      breakdown: masteryResult.breakdown,
      questions: competencyPerformance[compId].questions
    });
  });

  // 3. Update diagnostic status
  const overallScore = answerEntries.length > 0 ? Math.round((totalCorrect / answerEntries.length) * 100) : 0;
  db.prepare(`
    UPDATE diagnostics 
    SET status = 'COMPLETED', score = ?, completed_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(overallScore, id);

  // 4. Graph gap analysis & root cause detection
  const gapAnalysis = RootGapEngine.analyzeGaps(userId);

  // Attach root gap reason to each summary
  competencySummaries.forEach(s => {
    s.isRootGap = gapAnalysis.rootGapIds.includes(s.competencyId);
    s.isAtRisk = gapAnalysis.atRiskNodeIds.includes(s.competencyId);
    if (s.isRootGap) {
      s.rootCauseExplanation = `Direct root prerequisite bottleneck detected in ${s.competencyName}.`;
    } else if (s.isAtRisk) {
      s.rootCauseExplanation = `Deficit constrained by upstream prerequisite gap (e.g. Probability Fundamentals / Missing Values).`;
    } else {
      s.rootCauseExplanation = `Mastery supported by verified evidence ledger.`;
    }
  });

  // 5. Award XP and check badges
  const gamificationResult = GamificationEngine.awardXP(
    userId, 
    'DIAGNOSTIC_COMPLETED', 
    id, 
    `Completed Assistant Director Price Statistics Baseline Diagnostic (${overallScore}%)`
  );

  res.json({
    diagnosticId: id,
    status: 'COMPLETED',
    overallScore,
    correctCount: totalCorrect,
    totalQuestions: answerEntries.length,
    competencySummaries,
    gapAnalysis,
    gamification: gamificationResult
  });
});

export default router;
