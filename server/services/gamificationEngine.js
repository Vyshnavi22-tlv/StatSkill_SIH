import db from '../db/database.js';

export const LEVEL_TIERS = [
  { level: 1, name: 'Explorer', minXP: 0 },
  { level: 2, name: 'Learner', minXP: 500 },
  { level: 3, name: 'Practitioner', minXP: 1500 },
  { level: 4, name: 'Specialist', minXP: 3000 },
  { level: 5, name: 'Advanced Practitioner', minXP: 5000 },
  { level: 6, name: 'Statistical Expert', minXP: 8000 }
];

export const XP_VALUES = {
  DIAGNOSTIC_COMPLETED: 50,
  LESSON_COMPLETED: 100,
  QUIZ_PASSED: 150,
  PRACTICAL_COMPLETED: 200,
  COMPETENCY_MASTERED: 250,
  MISSION_COMPLETED: 300,
  STREAK_MILESTONE: 25
};

export class GamificationEngine {
  /**
   * Determine user level based on total XP
   */
  static calculateLevel(xp) {
    let currentTier = LEVEL_TIERS[0];
    for (const tier of LEVEL_TIERS) {
      if (xp >= tier.minXP) {
        currentTier = tier;
      } else {
        break;
      }
    }
    return currentTier;
  }

  /**
   * Award XP connected to actual learning events
   */
  static awardXP(userId, eventType, referenceId = null, customDescription = null) {
    const xpAmount = XP_VALUES[eventType] || 50;
    const eventId = `xp_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;

    const desc = customDescription || `Earned +${xpAmount} XP for ${eventType.replace(/_/g, ' ')}`;

    // 1. Insert XP Event into immutable ledger
    db.prepare(`
      INSERT INTO xp_events (id, user_id, event_type, xp, reference_id, description)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(eventId, userId, eventType, xpAmount, referenceId, desc);

    // 2. Calculate new XP & Level
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
    const newTotalXP = (user.xp || 0) + xpAmount;
    const tier = this.calculateLevel(newTotalXP);

    const oldLevelNum = user.level_number || 1;
    const oldLevelName = user.level || 'Explorer';
    const leveledUp = tier.level > oldLevelNum;

    db.prepare(`
      UPDATE users 
      SET xp = ?, level = ?, level_number = ?, last_activity_date = CURRENT_DATE
      WHERE id = ?
    `).run(newTotalXP, tier.name, tier.level, userId);

    // 3. Check and unlock badges
    const newlyUnlockedBadges = this.checkBadges(userId);

    // 4. Update Mission Progress
    const completedMissions = this.updateMissionProgress(userId, eventType, referenceId);

    return {
      awardedXP: xpAmount,
      totalXP: newTotalXP,
      level: tier.name,
      levelNumber: tier.level,
      oldLevel: oldLevelName,
      leveledUp,
      newBadges: newlyUnlockedBadges,
      completedMissions
    };
  }

  /**
   * Check badge criteria against verified competencies, diagnostics, and assessments
   */
  static checkBadges(userId) {
    const unlocked = [];
    const allBadges = db.prepare('SELECT * FROM badges').all();
    const userBadges = db.prepare('SELECT badge_id FROM user_badges WHERE user_id = ?').all(userId);
    const ownedBadgeIds = new Set(userBadges.map(ub => ub.badge_id));

    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
    const masteryScores = db.prepare('SELECT * FROM mastery_scores WHERE user_id = ?').all(userId);
    const completedAssessments = db.prepare('SELECT * FROM assessments WHERE user_id = ? AND status = ?').all(userId, 'COMPLETED');
    const completedDiagnostics = db.prepare('SELECT * FROM diagnostics WHERE user_id = ? AND status = ?').all(userId, 'COMPLETED');

    allBadges.forEach(badge => {
      if (!ownedBadgeIds.has(badge.id)) {
        let isEligible = false;

        switch (badge.code) {
          case 'DIAGNOSTIC_STARTER':
            isEligible = completedDiagnostics.length > 0;
            break;

          case 'SAMPLING_FOUNDATIONS':
            const probFund = masteryScores.find(m => m.competency_id === 'comp_prob_fund');
            const probSamp = masteryScores.find(m => m.competency_id === 'comp_prob_samp');
            isEligible = (probFund && probFund.mastery >= 60) || (probSamp && probSamp.mastery >= 60);
            break;

          case 'DATA_QUALITY_GUARDIAN':
            const missingVal = masteryScores.find(m => m.competency_id === 'comp_missing_val');
            const dataQual = masteryScores.find(m => m.competency_id === 'comp_data_qual');
            isEligible = (missingVal && missingVal.mastery >= 60) || (dataQual && dataQual.mastery >= 60);
            break;

          case 'SURVEY_METHODOLOGIST':
            const surveyMeth = masteryScores.find(m => m.competency_id === 'comp_survey_meth');
            isEligible = surveyMeth && surveyMeth.mastery >= 65;
            break;

          case 'STATISTICAL_COMPUTING':
            const statComp = masteryScores.find(m => m.competency_id === 'comp_stat_comp');
            isEligible = statComp && statComp.mastery >= 70;
            break;

          case 'COMPETENCY_MASTER':
            const masteredCount = masteryScores.filter(m => m.mastery >= 75).length;
            isEligible = masteredCount >= 3;
            break;

          case 'CONSISTENCY_CHAMPION':
            isEligible = (user.streak || 0) >= 7;
            break;
        }

        if (isEligible) {
          const ubId = `ub_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
          db.prepare(`
            INSERT INTO user_badges (id, user_id, badge_id, unlocked_at)
            VALUES (?, ?, ?, CURRENT_TIMESTAMP)
          `).run(ubId, userId, badge.id);

          unlocked.push(badge);
        }
      }
    });

    return unlocked;
  }

  /**
   * Update Mission Progress
   */
  static updateMissionProgress(userId, eventType, referenceId) {
    const newlyCompleted = [];
    const missions = db.prepare('SELECT * FROM missions').all();

    missions.forEach(mission => {
      let shouldComplete = false;
      if (mission.target_type === 'COMPLETE_DIAGNOSTIC' && eventType === 'DIAGNOSTIC_COMPLETED') {
        shouldComplete = true;
      } else if (mission.target_type === 'PASS_QUIZ' && (eventType === 'QUIZ_PASSED' || eventType === 'REASSESSMENT')) {
        shouldComplete = true;
      } else if (mission.target_type === 'MASTER_COMPETENCY' && eventType === 'COMPETENCY_MASTERED') {
        shouldComplete = true;
      }

      if (shouldComplete) {
        const existing = db.prepare('SELECT * FROM mission_progress WHERE user_id = ? AND mission_id = ?').get(userId, mission.id);
        if (!existing || existing.status !== 'COMPLETED') {
          db.prepare(`
            INSERT INTO mission_progress (id, user_id, mission_id, progress, status, completed_at)
            VALUES (?, ?, ?, 100, 'COMPLETED', CURRENT_TIMESTAMP)
            ON CONFLICT(user_id, mission_id) DO UPDATE SET
              progress = 100,
              status = 'COMPLETED',
              completed_at = CURRENT_TIMESTAMP
          `).run(`mp_${Date.now()}_${mission.id}`, userId, mission.id);

          newlyCompleted.push(mission);
        }
      }
    });

    return newlyCompleted;
  }
}

export default GamificationEngine;
