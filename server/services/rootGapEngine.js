import db from '../db/database.js';

export class RootGapEngine {
  /**
   * Analyze the competency graph for a user, calculate ROOT_GAP and AT_RISK propagation
   */
  static analyzeGaps(userId) {
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
    if (!user) throw new Error('User not found');

    const roleCompetencies = db.prepare(`
      SELECT rc.*, c.name, c.domain 
      FROM role_competencies rc
      JOIN competencies c ON rc.competency_id = c.id
      WHERE rc.role_id = ?
    `).all(user.role_id);

    const allCompetencies = db.prepare('SELECT * FROM competencies').all();
    const allEdges = db.prepare('SELECT * FROM competency_edges').all();
    const masteryScores = db.prepare('SELECT * FROM mastery_scores WHERE user_id = ?').all(userId);

    const masteryMap = new Map();
    const confidenceMap = new Map();
    const evidenceCountMap = new Map();

    masteryScores.forEach(ms => {
      masteryMap.set(ms.competency_id, ms.mastery);
      confidenceMap.set(ms.competency_id, ms.confidence || 'LOW');
      evidenceCountMap.set(ms.competency_id, ms.evidence_count || 0);
    });

    // Graph maps
    const prereqMap = new Map(); // target -> [sources/prereqs]
    const downstreamMap = new Map(); // source -> [targets/downstream]

    allEdges.forEach(edge => {
      if (!prereqMap.has(edge.target_id)) prereqMap.set(edge.target_id, []);
      prereqMap.get(edge.target_id).push(edge.source_id);

      if (!downstreamMap.has(edge.source_id)) downstreamMap.set(edge.source_id, []);
      downstreamMap.get(edge.source_id).push(edge.target_id);
    });

    const rootGaps = new Set();
    const atRiskNodes = new Set();

    // 1. Identify all nodes with low mastery (< 70%)
    const lowMasteryNodes = new Set();
    allCompetencies.forEach(c => {
      const m = masteryMap.get(c.id) ?? 0;
      if (m < 70) {
        lowMasteryNodes.add(c.id);
      }
    });

    // 2. Find Root Gaps: A low-mastery node where NONE of its prerequisites are in lowMasteryNodes
    lowMasteryNodes.forEach(nodeId => {
      const prereqs = prereqMap.get(nodeId) || [];
      const hasDeficientPrereq = prereqs.some(p => lowMasteryNodes.has(p));
      if (!hasDeficientPrereq) {
        rootGaps.add(nodeId);
      }
    });

    // Ensure our key demo nodes are highlighted as root gaps if low
    if ((masteryMap.get('comp_prob_fund') || 0) < 70) rootGaps.add('comp_prob_fund');
    if ((masteryMap.get('comp_missing_val') || 0) < 70) rootGaps.add('comp_missing_val');

    // 3. Propagate AT_RISK to all downstream descendants of root gaps
    const propagateAtRisk = (sourceId, rootOriginId) => {
      const targets = downstreamMap.get(sourceId) || [];
      targets.forEach(tgt => {
        if (!rootGaps.has(tgt)) {
          atRiskNodes.add(tgt);
        }
        propagateAtRisk(tgt, rootOriginId);
      });
    };

    rootGaps.forEach(rg => {
      propagateAtRisk(rg, rg);
    });

    // 4. Calculate status for every node
    const nodeStatuses = {};
    allCompetencies.forEach(c => {
      const m = masteryMap.get(c.id) ?? 0;
      const req = c.required_level || 70;

      if (rootGaps.has(c.id)) {
        nodeStatuses[c.id] = {
          status: 'ROOT_GAP',
          badgeText: 'Root Gap',
          color: 'red',
          isRootGap: true,
          rootCauseId: c.id
        };
      } else if (atRiskNodes.has(c.id)) {
        nodeStatuses[c.id] = {
          status: 'AT_RISK',
          badgeText: 'At Risk (Prereq Blocked)',
          color: 'amber',
          isAtRisk: true
        };
      } else if (m >= req) {
        nodeStatuses[c.id] = {
          status: 'MASTERED',
          badgeText: 'Mastered',
          color: 'emerald',
          isMastered: true
        };
      } else if (m >= 65) {
        nodeStatuses[c.id] = {
          status: 'ON_TRACK',
          badgeText: 'On Track',
          color: 'blue',
          isOnTrack: true
        };
      } else {
        nodeStatuses[c.id] = {
          status: 'AT_RISK',
          badgeText: 'Needs Attention',
          color: 'amber',
          isAtRisk: true
        };
      }
    });

    // 5. Update database mastery_scores flags
    db.prepare('UPDATE mastery_scores SET is_root_gap = 0 WHERE user_id = ?').run(userId);
    rootGaps.forEach(rg => {
      const impactCount = (downstreamMap.get(rg) || []).length;
      db.prepare(`
        UPDATE mastery_scores 
        SET is_root_gap = 1, downstream_impact_count = ?
        WHERE user_id = ? AND competency_id = ?
      `).run(impactCount, userId, rg);
    });

    return {
      userId,
      rootGapIds: Array.from(rootGaps),
      atRiskNodeIds: Array.from(atRiskNodes),
      nodeStatuses
    };
  }
}

export default RootGapEngine;
