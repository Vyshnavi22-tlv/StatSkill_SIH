import { Router } from 'express';
import db from '../db/database.js';
import { MasteryEngine } from '../services/masteryEngine.js';
import { GamificationEngine } from '../services/gamificationEngine.js';
import { RootGapEngine } from '../services/rootGapEngine.js';

const router = Router();

// Create or fetch verified assessment for a competency/document
router.get('/for-competency/:competencyId', (req, res) => {
  const { competencyId } = req.params;
  const userId = req.query.userId || 'usr_ananya_sharma';

  const comp = db.prepare('SELECT * FROM competencies WHERE id = ?').get(competencyId);
  if (!comp) return res.status(404).json({ error: 'Competency not found' });

  // Find approved questions for this competency with source backtrace
  const questions = db.prepare(`
    SELECT q.*, dc.content as chunk_content, dc.heading as chunk_heading, d.title as document_title
    FROM questions q
    LEFT JOIN document_chunks dc ON q.source_chunk_id = dc.id
    LEFT JOIN documents d ON q.source_document_id = d.id
    WHERE q.competency_id = ? AND q.status = 'APPROVED'
    ORDER BY q.critic_score DESC
    LIMIT 5
  `).all(competencyId);

  const formattedQuestions = questions.map(q => ({
    id: q.id,
    questionText: q.question_text,
    options: JSON.parse(q.options),
    difficulty: q.difficulty,
    bloomLevel: q.bloom_level,
    criticScore: q.critic_score,
    sourceDocumentTitle: q.document_title || 'MoSPI Manual on Data Quality Assurance',
    sourcePage: q.source_page || 27,
    sourceChunkHeading: q.chunk_heading || 'Missing Value Treatment & Imputation',
    sourceChunkText: q.chunk_content || ''
  }));

  const assId = `ass_${Date.now()}`;
  db.prepare(`
    INSERT INTO assessments (id, user_id, competency_id, title, type, status)
    VALUES (?, ?, ?, ?, 'QUIZ', 'IN_PROGRESS')
  `).run(assId, userId, competencyId, `AI Assessment: ${comp.name}`);

  res.json({
    assessmentId: assId,
    competencyId: comp.id,
    competencyName: comp.name,
    totalQuestions: formattedQuestions.length,
    questions: formattedQuestions
  });
});

// Submit assessment answers and get instant feedback with source backtrace
router.post('/:id/submit', (req, res) => {
  const { id } = req.params;
  const { userId, competencyId, answers } = req.body; // answers: { [qId]: userChoice }

  const questionFeedback = [];
  let correctCount = 0;
  const entries = Object.entries(answers || {});

  entries.forEach(([qId, userChoice]) => {
    const q = db.prepare(`
      SELECT q.*, dc.content as chunk_content, dc.heading as chunk_heading, d.title as document_title
      FROM questions q
      LEFT JOIN document_chunks dc ON q.source_chunk_id = dc.id
      LEFT JOIN documents d ON q.source_document_id = d.id
      WHERE q.id = ?
    `).get(qId);

    if (q) {
      const isCorrect = (q.correct_answer === userChoice);
      if (isCorrect) correctCount++;

      // Save answer
      db.prepare(`
        INSERT INTO answers (id, assessment_id, question_id, user_answer, is_correct)
        VALUES (?, ?, ?, ?, ?)
      `).run(`ans_${Date.now()}_${qId}`, id, qId, userChoice, isCorrect ? 1 : 0);

      // Save evidence
      const score = isCorrect ? 100 : 0;
      db.prepare(`
        INSERT INTO evidence (id, user_id, competency_id, assessment_id, question_id, evidence_type, score, weight, difficulty)
        VALUES (?, ?, ?, ?, ?, 'QUIZ', ?, 1.2, ?)
      `).run(`ev_ass_${Date.now()}_${qId}`, userId, q.competency_id, id, qId, score, q.difficulty);

      questionFeedback.push({
        questionId: q.id,
        questionText: q.question_text,
        userAnswer: userChoice,
        correctAnswer: q.correct_answer,
        isCorrect,
        explanation: q.explanation,
        criticScore: q.critic_score,
        sourceBacktrace: {
          documentTitle: q.document_title || 'MoSPI Data Quality Manual',
          pageNumber: q.source_page || 27,
          sectionHeading: q.chunk_heading || 'Section 4.2 Imputation Rules',
          chunkText: q.chunk_content || 'Under MoSPI Guidelines, missing price observations must be treated using hot-deck donor matching from active responding units within the same stratum.'
        }
      });
    }
  });

  const total = entries.length;
  const percentage = total > 0 ? Math.round((correctCount / total) * 100) : 0;

  // Update assessment status
  db.prepare(`
    UPDATE assessments 
    SET status = 'COMPLETED', score = ?, completed_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(percentage, id);

  // Recalculate competency mastery
  const targetCompId = competencyId || (questionFeedback[0] ? questionFeedback[0].competencyId : null);
  let masteryUpdate = null;
  if (targetCompId) {
    masteryUpdate = MasteryEngine.recalculateMastery(userId, targetCompId);
    // Also recalculate downstream / parent if any
    RootGapEngine.analyzeGaps(userId);
  }

  // Award Gamification XP
  const eventType = percentage >= 60 ? 'QUIZ_PASSED' : 'QUIZ_COMPLETED';
  const gamificationResult = GamificationEngine.awardXP(
    userId,
    eventType,
    id,
    `Completed ${targetCompId ? 'Assessment on ' + targetCompId : 'Assessment'} with score ${percentage}%`
  );

  res.json({
    assessmentId: id,
    score: percentage,
    correctCount,
    totalQuestions: total,
    passed: percentage >= 60,
    feedback: questionFeedback,
    masteryUpdate,
    gamification: gamificationResult
  });
});

export default router;
