import db from '../db/database.js';

export class MasteryEngine {
  /**
   * Recalculate mastery score for a user and competency based on all recorded evidence
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

    if (evidenceCount === 0) {
      newScore = 0;
      confidence = 'LOW';
    } else {
      let weightedSum = 0;
      let totalWeight = 0;

      evidenceList.forEach((ev, index) => {
        // Recency factor: later items get slightly higher weight (up to 1.3x)
        const recencyFactor = 1.0 + (index / Math.max(evidenceCount, 1)) * 0.3;
        
        // Difficulty weight
        let diffWeight = 1.0;
        if (ev.difficulty === 'HARD') diffWeight = 1.25;
        if (ev.difficulty === 'EASY') diffWeight = 0.8;

        const weight = (ev.weight || 1.0) * recencyFactor * diffWeight;
        weightedSum += ev.score * weight;
        totalWeight += weight;
      });

      newScore = Math.min(100, Math.max(0, Math.round(weightedSum / totalWeight)));

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
        JSON.stringify({ score: newScore, confidence }),
        `Recalculated with ${evidenceCount} evidence items.`
      );
    }

    return {
      userId,
      competencyId,
      oldScore,
      newScore,
      confidence,
      evidenceCount
    };
  }
}

export default MasteryEngine;
