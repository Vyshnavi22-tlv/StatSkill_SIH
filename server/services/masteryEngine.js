import db from '../db/database.js';

export class MasteryEngine {
  /**
   * Deterministic Weighted Evidence Mastery Calculation
   * Formula:
   * Mastery = Σ(score_i * weight_i * recency_i * difficulty_weight_i) / Σ(weight_i * recency_i * difficulty_weight_i)
   * Confidence is evaluated separately based on evidence count and diversity:
   *   - Evidence Count < 3: LOW
   *   - Evidence Count 3 - 7: MEDIUM
   *   - Evidence Count > 7: HIGH
   */
  static recalculateMastery(userId, competencyId) {
    const evidenceList = db.prepare(`
      SELECT * FROM evidence 
      WHERE user_id = ? AND competency_id = ? 
      ORDER BY created_at ASC
    `).all(userId, competencyId);

    const prevMasteryRow = db.prepare(`
      SELECT * FROM mastery_scores WHERE user_id = ? AND competency_id = ?
    `).get(userId, competencyId);

    const oldScore = prevMasteryRow ? prevMasteryRow.mastery : 0;
    const evidenceCount = evidenceList.length;

    let newScore = 0;
    let confidence = 'LOW';

    // Breakdown for explainability ("Why did I get this score?")
    const breakdown = {
      diagnosticCount: 0,
      diagnosticAvg: 0,
      quizCount: 0,
      quizAvg: 0,
      practicalCount: 0,
      practicalAvg: 0,
      reassessmentCount: 0,
      reassessmentAvg: 0,
      totalEvidenceItems: evidenceCount
    };

    if (evidenceCount === 0) {
      newScore = 0;
      confidence = 'LOW';
    } else {
      let weightedSum = 0;
      let totalWeight = 0;

      let diagSum = 0, diagN = 0;
      let quizSum = 0, quizN = 0;
      let practSum = 0, practN = 0;
      let reassessSum = 0, reassessN = 0;

      evidenceList.forEach((ev, index) => {
        // Recency factor: later evidence receives up to 1.3x higher weight
        const recencyFactor = 1.0 + (index / Math.max(evidenceCount, 1)) * 0.3;
        
        // Difficulty weight
        let diffWeight = 1.0;
        if (ev.difficulty === 'HARD') diffWeight = 1.25;
        if (ev.difficulty === 'EASY') diffWeight = 0.8;

        const weight = (ev.weight || 1.0) * recencyFactor * diffWeight;
        weightedSum += ev.score * weight;
        totalWeight += weight;

        // Categorize for breakdown
        if (ev.evidence_type === 'DIAGNOSTIC') {
          diagSum += ev.score;
          diagN++;
        } else if (ev.evidence_type === 'QUIZ') {
          quizSum += ev.score;
          quizN++;
        } else if (ev.evidence_type === 'PRACTICAL') {
          practSum += ev.score;
          practN++;
        } else if (ev.evidence_type === 'REASSESSMENT') {
          reassessSum += ev.score;
          reassessN++;
        }
      });

      newScore = Math.min(100, Math.max(0, Math.round(weightedSum / totalWeight)));

      breakdown.diagnosticCount = diagN;
      breakdown.diagnosticAvg = diagN > 0 ? Math.round(diagSum / diagN) : null;
      breakdown.quizCount = quizN;
      breakdown.quizAvg = quizN > 0 ? Math.round(quizSum / quizN) : null;
      breakdown.practicalCount = practN;
      breakdown.practicalAvg = practN > 0 ? Math.round(practSum / practN) : null;
      breakdown.reassessmentCount = reassessN;
      breakdown.reassessmentAvg = reassessN > 0 ? Math.round(reassessSum / reassessN) : null;

      // Confidence thresholds
      if (evidenceCount < 3) {
        confidence = 'LOW';
      } else if (evidenceCount <= 7) {
        confidence = 'MEDIUM';
      } else {
        confidence = 'HIGH';
      }
    }

    // Upsert mastery_scores
    const id = prevMasteryRow ? prevMasteryRow.id : `mst_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    
    db.prepare(`
      INSERT INTO mastery_scores (id, user_id, competency_id, mastery, confidence, evidence_count, last_updated)
      VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(user_id, competency_id) DO UPDATE SET
        mastery = excluded.mastery,
        confidence = excluded.confidence,
        evidence_count = excluded.evidence_count,
        last_updated = CURRENT_TIMESTAMP
    `).run(id, userId, competencyId, newScore, confidence, evidenceCount);

    // Audit log
    if (prevMasteryRow && prevMasteryRow.mastery !== newScore) {
      db.prepare(`
        INSERT INTO audit_logs (id, user_id, action, entity_type, entity_id, old_value, new_value, reason)
        VALUES (?, ?, 'MASTERY_UPDATE', 'competency', ?, ?, ?, ?)
      `).run(
        `aud_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        userId,
        competencyId,
        JSON.stringify({ score: oldScore, confidence: prevMasteryRow.confidence }),
        JSON.stringify({ score: newScore, confidence, evidenceCount }),
        `Deterministic recalculation with ${evidenceCount} evidence items.`
      );
    }

    return {
      userId,
      competencyId,
      oldScore,
      newScore,
      confidence,
      evidenceCount,
      breakdown
    };
  }

  /**
   * Get explainable evidence summary for a competency
   */
  static getExplainableSummary(userId, competencyId) {
    const comp = db.prepare('SELECT * FROM competencies WHERE id = ?').get(competencyId);
    const masteryRow = db.prepare('SELECT * FROM mastery_scores WHERE user_id = ? AND competency_id = ?').get(userId, competencyId);
    const evidenceList = db.prepare('SELECT * FROM evidence WHERE user_id = ? AND competency_id = ? ORDER BY created_at DESC').all(userId, competencyId);

    const breakdown = {
      diagnostic: evidenceList.filter(e => e.evidence_type === 'DIAGNOSTIC'),
      quiz: evidenceList.filter(e => e.evidence_type === 'QUIZ'),
      practical: evidenceList.filter(e => e.evidence_type === 'PRACTICAL'),
      reassessment: evidenceList.filter(e => e.evidence_type === 'REASSESSMENT')
    };

    return {
      competency: comp,
      mastery: masteryRow ? masteryRow.mastery : 0,
      confidence: masteryRow ? masteryRow.confidence : 'LOW',
      evidenceCount: masteryRow ? masteryRow.evidence_count : 0,
      isRootGap: masteryRow ? Boolean(masteryRow.is_root_gap) : false,
      breakdown,
      evidenceList
    };
  }
}

export default MasteryEngine;
