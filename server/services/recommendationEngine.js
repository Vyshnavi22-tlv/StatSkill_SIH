import db from '../db/database.js';
import { RootGapEngine } from './rootGapEngine.js';

/**
 * Mock Provider Adapter Interface for iGOT Karmayogi and NSSTA
 */
export class MockCourseProviderAdapter {
  static getProviders() {
    return [
      {
        id: 'igot',
        name: 'iGOT Karmayogi Adapter (Mock)',
        type: 'MOCK_ADAPTER',
        description: 'Simulates Government of India iGOT Karmayogi capacity building course registry and learner progress sync.',
        status: 'CONNECTED',
        isLiveProduction: false
      },
      {
        id: 'nssta',
        name: 'NSSTA Academy Adapter (Mock)',
        type: 'MOCK_ADAPTER',
        description: 'Simulates National Statistical Systems Training Academy classroom & hybrid training cohort schedule.',
        status: 'CONNECTED',
        isLiveProduction: false
      }
    ];
  }

  static getCourseCatalog() {
    return db.prepare(`
      SELECT c.*, cc.competency_id, cc.target_mastery, comp.name as competency_name
      FROM courses c
      JOIN course_competencies cc ON c.id = cc.course_id
      JOIN competencies comp ON cc.competency_id = comp.id
    `).all();
  }
}

export class RecommendationEngine {
  /**
   * Personalized Recommendation Algorithm
   * Inputs:
   *  - User Role & Required Competencies
   *  - Current Mastery vs Required Mastery
   *  - Prerequisite DAG structure & Root Gaps
   *  - Learning History (completed courses/assessments)
   *  - Available Provider Course Catalog (iGOT & NSSTA)
   */
  static generateRecommendations(userId) {
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
    if (!user) throw new Error('User not found');

    const role = db.prepare('SELECT * FROM roles WHERE id = ?').get(user.role_id);
    const roleCompetencies = db.prepare(`
      SELECT rc.*, c.name, c.domain, c.required_level as comp_default_req
      FROM role_competencies rc
      JOIN competencies c ON rc.competency_id = c.id
      WHERE rc.role_id = ?
    `).all(user.role_id);

    // Get current mastery scores
    const masteryScores = db.prepare('SELECT * FROM mastery_scores WHERE user_id = ?').all(userId);
    const masteryMap = new Map();
    const confidenceMap = new Map();
    masteryScores.forEach(ms => {
      masteryMap.set(ms.competency_id, ms.mastery);
      confidenceMap.set(ms.competency_id, ms.confidence || 'LOW');
    });

    // Run graph gap analysis
    const gapAnalysis = RootGapEngine.analyzeGaps(userId);
    const rootGapSet = new Set(gapAnalysis.rootGapIds || []);
    const atRiskSet = new Set(gapAnalysis.atRiskNodeIds || []);

    // Get course catalog and learning history
    const allCourses = MockCourseProviderAdapter.getCourseCatalog();
    const completedAssessments = db.prepare('SELECT DISTINCT competency_id FROM assessments WHERE user_id = ? AND status = ?').all(userId, 'COMPLETED');
    const completedCompIds = new Set(completedAssessments.map(a => a.competency_id));

    // Clear old pending recommendations
    db.prepare('DELETE FROM recommendations WHERE user_id = ? AND status = ?').run(userId, 'PENDING');

    const recommendations = [];

    // Map: Find all deficient role competencies and trace to their root prerequisites
    const edges = db.prepare('SELECT * FROM competency_edges').all();
    const prereqMap = new Map();
    edges.forEach(e => {
      if (!prereqMap.has(e.target_id)) prereqMap.set(e.target_id, []);
      prereqMap.get(e.target_id).push(e.source_id);
    });

    // Process Root Gaps FIRST (Priority 1)
    rootGapSet.forEach(rootCompId => {
      const rootComp = db.prepare('SELECT * FROM competencies WHERE id = ?').get(rootCompId);
      if (!rootComp) return;

      const currentMastery = masteryMap.get(rootCompId) ?? 0;
      const requiredMastery = rootComp.required_level || 70;
      const matchingCourses = allCourses.filter(c => c.competency_id === rootCompId);

      matchingCourses.forEach(course => {
        const isCompleted = completedCompIds.has(rootCompId);
        if (isCompleted && currentMastery >= requiredMastery) return; // skip if already mastered

        const explanation = [
          `Root prerequisite bottleneck diagnosed in ${rootComp.name}`,
          `Current mastery is ${currentMastery}% (Target: ${requiredMastery}%)`,
          `Resolving this directly unblocks downstream competencies in Price & Survey Statistics`,
          `Provider: ${course.provider} (${course.level} Level, ~${course.duration_hours} hrs)`
        ];

        const recId = `rec_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
        const expectedOutcome = `Expected to boost ${rootComp.name} mastery to ${course.target_mastery}%+`;
        const prereqStatus = 'ROOT_GAP_INTERVENTION';

        db.prepare(`
          INSERT INTO recommendations (
            id, user_id, competency_id, course_id, title, provider, priority, reason, expected_outcome, prerequisite_status, status
          ) VALUES (?, ?, ?, ?, ?, ?, 'HIGH', ?, ?, ?, 'PENDING')
        `).run(
          recId,
          userId,
          rootCompId,
          course.id,
          `${course.provider}: ${course.title}`,
          course.provider,
          JSON.stringify(explanation),
          expectedOutcome,
          prereqStatus
        );

        recommendations.push({
          id: recId,
          userId,
          courseTitle: course.title,
          provider: course.provider,
          targetCompetencyId: rootCompId,
          targetCompetencyName: rootComp.name,
          currentMastery,
          requiredMastery,
          prerequisiteStatus: prereqStatus,
          prerequisiteStatusLabel: 'Root Gap Action Required',
          priority: 'HIGH',
          expectedOutcome,
          explanation,
          courseUrl: course.url,
          durationHours: course.duration_hours,
          courseLevel: course.level
        });
      });
    });

    // Process Role Competencies where prerequisites are satisfied (Priority 2 / READY_TO_LEARN)
    roleCompetencies.forEach(rc => {
      const currentMastery = masteryMap.get(rc.competency_id) ?? 0;
      const requiredMastery = rc.required_level;
      const isDeficient = currentMastery < requiredMastery;

      if (isDeficient && !rootGapSet.has(rc.competency_id)) {
        const prereqs = prereqMap.get(rc.competency_id) || [];
        const hasUnmetPrereq = prereqs.some(p => (masteryMap.get(p) ?? 0) < 70);

        const matchingCourses = allCourses.filter(c => c.competency_id === rc.competency_id);

        matchingCourses.forEach(course => {
          let prereqStatus = 'READY_TO_LEARN';
          let prereqLabel = 'Prerequisites Satisfied';
          let priority = 'MEDIUM';

          const explanation = [
            `Role requires ${rc.name} (${role ? role.name : 'Price Statistics'})`,
            `Current mastery: ${currentMastery}% (Target: ${requiredMastery}%)`
          ];

          if (hasUnmetPrereq) {
            prereqStatus = 'PREREQUISITE_BLOCKED';
            prereqLabel = 'Prerequisite Incomplete';
            priority = 'LOW';
            explanation.push(`Note: Upstream prerequisite mastery should be addressed first for maximum retention.`);
          } else {
            explanation.push(`All upstream prerequisites satisfied (>70% mastery)`);
            priority = 'HIGH';
          }

          explanation.push(`Provider: ${course.provider} (${course.level} Level)`);

          const recId = `rec_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
          const expectedOutcome = `Expected to boost ${rc.name} mastery to ${course.target_mastery}%+`;

          db.prepare(`
            INSERT INTO recommendations (
              id, user_id, competency_id, course_id, title, provider, priority, reason, expected_outcome, prerequisite_status, status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'PENDING')
          `).run(
            recId,
            userId,
            rc.competency_id,
            course.id,
            `${course.provider}: ${course.title}`,
            course.provider,
            priority,
            JSON.stringify(explanation),
            expectedOutcome,
            prereqStatus
          );

          recommendations.push({
            id: recId,
            userId,
            courseTitle: course.title,
            provider: course.provider,
            targetCompetencyId: rc.competency_id,
            targetCompetencyName: rc.name,
            currentMastery,
            requiredMastery,
            prerequisiteStatus: prereqStatus,
            prerequisiteStatusLabel: prereqLabel,
            priority,
            expectedOutcome,
            explanation,
            courseUrl: course.url,
            durationHours: course.duration_hours,
            courseLevel: course.level
          });
        });
      }
    });

    return recommendations;
  }
}

export default RecommendationEngine;
