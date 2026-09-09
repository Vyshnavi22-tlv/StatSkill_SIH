import { Router } from 'express';
import db from '../db/database.js';
import { RootGapEngine } from '../services/rootGapEngine.js';

const router = Router();

// Get all competencies
router.get('/', (req, res) => {
  const comps = db.prepare('SELECT * FROM competencies ORDER BY domain, name').all();
  res.json(comps);
});

// Get competency by ID with full details (for detail panel)
router.get('/:id', (req, res) => {
  const userId = req.query.userId || 'usr_ananya_sharma';
  const comp = db.prepare('SELECT * FROM competencies WHERE id = ?').get(req.params.id);
  if (!comp) return res.status(404).json({ error: 'Competency not found' });

  const masteryRow = db.prepare('SELECT * FROM mastery_scores WHERE user_id = ? AND competency_id = ?').get(userId, req.params.id);
  const gapAnalysis = RootGapEngine.analyzeGaps(userId);
  const statusInfo = gapAnalysis.nodeStatuses[req.params.id] || { status: 'ON_TRACK', badgeText: 'On Track', color: 'blue' };

  const prerequisites = db.prepare(`
    SELECT c.*, COALESCE(ms.mastery, 0) as user_mastery, COALESCE(ms.confidence, 'LOW') as confidence
    FROM competencies c
    JOIN competency_edges ce ON c.id = ce.source_id
    LEFT JOIN mastery_scores ms ON c.id = ms.competency_id AND ms.user_id = ?
    WHERE ce.target_id = ?
  `).all(userId, req.params.id);

  const downstream = db.prepare(`
    SELECT c.*, COALESCE(ms.mastery, 0) as user_mastery
    FROM competencies c
    JOIN competency_edges ce ON c.id = ce.target_id
    LEFT JOIN mastery_scores ms ON c.id = ms.competency_id AND ms.user_id = ?
    WHERE ce.source_id = ?
  `).all(userId, req.params.id);

  const courses = db.prepare(`
    SELECT c.*, cc.target_mastery FROM courses c
    JOIN course_competencies cc ON c.id = cc.course_id
    WHERE cc.competency_id = ?
  `).all(req.params.id);

  const evidence = db.prepare(`
    SELECT * FROM evidence 
    WHERE user_id = ? AND competency_id = ?
    ORDER BY created_at DESC
  `).all(userId, req.params.id);

  const roleComp = db.prepare(`
    SELECT * FROM role_competencies rc
    JOIN users u ON rc.role_id = u.role_id
    WHERE u.id = ? AND rc.competency_id = ?
  `).get(userId, req.params.id);

  res.json({
    ...comp,
    currentMastery: masteryRow ? masteryRow.mastery : 0,
    requiredMastery: roleComp ? roleComp.required_level : comp.required_level,
    confidence: masteryRow ? masteryRow.confidence : 'LOW',
    evidenceCount: masteryRow ? masteryRow.evidence_count : 0,
    status: statusInfo.status,
    badgeText: statusInfo.badgeText,
    color: statusInfo.color,
    isRootGap: statusInfo.status === 'ROOT_GAP',
    isAtRisk: statusInfo.status === 'AT_RISK',
    prerequisites,
    downstream,
    courses,
    evidence
  });
});

// Get user competency graph with mastery, cascade statuses & edges
router.get('/user/:userId/graph', (req, res) => {
  const { userId } = req.params;
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
  if (!user) return res.status(404).json({ error: 'User not found' });

  // Refresh gap analysis & cascade statuses
  const gapAnalysis = RootGapEngine.analyzeGaps(userId);

  const nodes = db.prepare(`
    SELECT 
      c.*,
      rc.required_level as role_required_level,
      rc.role_weight,
      COALESCE(ms.mastery, 0) as user_mastery,
      COALESCE(ms.confidence, 'LOW') as confidence,
      COALESCE(ms.evidence_count, 0) as evidence_count
    FROM competencies c
    LEFT JOIN role_competencies rc ON c.id = rc.competency_id AND rc.role_id = ?
    LEFT JOIN mastery_scores ms ON c.id = ms.competency_id AND ms.user_id = ?
    ORDER BY c.domain, c.name
  `).all(user.role_id, userId);

  const edges = db.prepare('SELECT * FROM competency_edges').all();

  // Attach calculated statuses & cascade info to each node
  const enrichedNodes = nodes.map(node => {
    const statusInfo = gapAnalysis.nodeStatuses[node.id] || { status: 'ON_TRACK', badgeText: 'On Track', color: 'blue' };
    return {
      ...node,
      status: statusInfo.status,
      badgeText: statusInfo.badgeText,
      color: statusInfo.color,
      isRootGap: statusInfo.status === 'ROOT_GAP',
      isAtRisk: statusInfo.status === 'AT_RISK',
      required_level: node.role_required_level || node.required_level
    };
  });

  res.json({
    nodes: enrichedNodes,
    edges,
    gapAnalysis,
    user: {
      id: user.id,
      name: user.name,
      roleId: user.role_id
    }
  });
});

export default router;
