import { Router } from 'express';
import db from '../db/database.js';
import { MasteryEngine } from '../services/masteryEngine.js';
import { RootGapEngine } from '../services/rootGapEngine.js';
import { GamificationEngine } from '../services/gamificationEngine.js';

const router = Router();

// Start or get active diagnostic
router.get('/start', (req, res) => {
  const userId = req.query.userId || 'usr_ananya_sharma';
  
  // Fetch diagnostic questions
  const questions = db.prepare(`
    SELECT q.id, q.question_text, q.options, q.competency_id, q.difficulty, q.bloom_level, c.name as competency_name
    FROM questions q
    JOIN competencies c ON q.competency_id = c.id
    WHERE q.source_document_id IS NULL
    LIMIT 10
  `).all();

  const formattedQuestions = questions.map(q => ({
    ...q,
    options: JSON.parse(q.options)
  }));

  const diagId = `diag_${Date.now()}`;
  db.prepare(`
    INSERT INTO diagnostics (id, user_id, title, status, total_questions)
    VALUES (?, ?, 'Price Statistics Official Diagnostic', 'IN_PROGRESS', ?)
  `).run(diagId, userId, formattedQuestions.length);

  res.json({
    diagnosticId: diagId,
    title: 'Price Statistics Baseline Diagnostic',
    totalQuestions: formattedQuestions.length,
    questions: formattedQuestions
  });
});

// Submit diagnostic answers
router.post('/:id/submit', (req, res) => {
  const { id } = req.params;
  const { userId, answers } = req.body; // answers: { [questionId]: selectedOption }

  let correctCount = 0;
  const answerEntries = Object.entries(answers || {});

  answerEntries.forEach(([qId, userAns]) => {
    const q = db.prepare('SELECT * FROM questions WHERE id = ?').get(qId);
    if (q) {
      const isCorrect = (q.correct_answer === userAns) ? 1 : 0;
      if (isCorrect) correctCount++;

      // Record answer
      db.prepare(`
        INSERT INTO diagnostic_answers (id, diagnostic_id, question_id, user_answer, is_correct)
        VALUES (?, ?, ?, ?, ?)
      `).run(`da_${Date.now()}_${qId}`, id, qId, userAns, isCorrect);

      // Record evidence
      const score = isCorrect ? 100 : 0;
      db.prepare(`
        INSERT INTO evidence (id, user_id, competency_id, diagnostic_id, question_id, evidence_type, score, weight, difficulty)
        VALUES (?, ?, ?, ?, ?, 'DIAGNOSTIC', ?, 1.0, ?)
      `).run(`ev_diag_${Date.now()}_${qId}`, userId, q.competency_id, id, qId, score, q.difficulty);

      // Recalculate mastery
      MasteryEngine.recalculateMastery(userId, q.competency_id);
    }
  });

  const finalScore = answerEntries.length > 0 ? Math.round((correctCount / answerEntries.length) * 100) : 0;

  db.prepare(`
    UPDATE diagnostics 
    SET status = 'COMPLETED', score = ?, completed_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(finalScore, id);

  // Award XP
  const xpReward = GamificationEngine.awardXP(userId, 'DIAGNOSTIC_COMPLETED', id, 'Completed baseline diagnostic assessment');

  // Analyze Gaps
  const gaps = RootGapEngine.analyzeGaps(userId);

  res.json({
    diagnosticId: id,
    status: 'COMPLETED',
    score: finalScore,
    correctCount,
    totalQuestions: answerEntries.length,
    gamification: xpReward,
    gapAnalysis: gaps
  });
});

export default router;
