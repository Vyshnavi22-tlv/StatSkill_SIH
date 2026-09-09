import db from '../db/database.js';
import { RootGapEngine } from './rootGapEngine.js';

export class RecommendationEngine {
  /**
   * Generate recommendations based on root gaps and prerequisite chains
   */
  static generateRecommendations(userId) {
    const gapAnalysis = RootGapEngine.analyzeGaps(userId);
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
    if (!user) throw new Error('User not found');

    const recommendations = [];

    // Clear old pending recommendations
    db.prepare('DELETE FROM recommendations WHERE user_id = ? AND status = ?').run(userId, 'PENDING');

    // Prioritize root gaps
    const prioritizedCompIds = gapAnalysis.rootGapIds || ['comp_missing_val', 'comp_prob_fund'];

    prioritizedCompIds.forEach(targetCompId => {
      const courses = db.prepare(`
        SELECT c.*, cc.target_mastery 
        FROM courses c
        JOIN course_competencies cc ON c.id = cc.course_id
        WHERE cc.competency_id = ?
      `).all(targetCompId);

      const targetComp = db.prepare('SELECT * FROM competencies WHERE id = ?').get(targetCompId);
      if (!targetComp) return;

      courses.forEach(course => {
        const priority = 'HIGH';
        const reasons = [
          `Prerequisite root gap diagnosed in ${targetComp.name}`,
          `Target mastery of this intervention is ${course.target_mastery}%`,
          `Resolving this directly unblocks downstream capacity in Price & Survey Statistics`
        ];

        const recId = `rec_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
        const expectedOutcome = `Expected to boost ${targetComp.name} mastery to ${course.target_mastery}%+`;
        const prereqStatus = 'PREREQUISITE_ACTION_REQUIRED';

        db.prepare(`
          INSERT INTO recommendations (
            id, user_id, competency_id, course_id, title, provider, priority, reason, expected_outcome, prerequisite_status, status
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'PENDING')
        `).run(
          recId,
          userId,
          targetCompId,
          course.id,
          `${course.provider}: ${course.title}`,
          course.provider,
          priority,
          JSON.stringify(reasons),
          expectedOutcome,
          prereqStatus
        );

        recommendations.push({
          id: recId,
          userId,
          competencyId: targetCompId,
          competencyName: targetComp.name,
          courseId: course.id,
          title: `${course.provider}: ${course.title}`,
          provider: course.provider,
          priority,
          reasons,
          expectedOutcome,
          prerequisiteStatus: prereqStatus
        });
      });
    });

    return recommendations;
  }
}

export default RecommendationEngine;
