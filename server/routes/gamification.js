import { Router } from 'express';
import db from '../db/database.js';
import { GamificationEngine, LEVEL_TIERS } from '../services/gamificationEngine.js';

const router = Router();

// Get gamification profile (XP, level tiers, streak, recent events)
router.get('/profile', (req, res) => {
  const userId = req.query.userId || 'usr_ananya_sharma';
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
  if (!user) return res.status(404).json({ error: 'User not found' });

  const currentLevel = GamificationEngine.calculateLevel(user.xp || 0);
  const nextTierIndex = LEVEL_TIERS.findIndex(t => t.level === currentLevel.level) + 1;
  const nextTier = LEVEL_TIERS[nextTierIndex] || null;

  let progressToNext = 100;
  if (nextTier) {
    const xpInCurrent = user.xp - currentLevel.minXP;
    const range = nextTier.minXP - currentLevel.minXP;
    progressToNext = Math.min(100, Math.round((xpInCurrent / range) * 100));
  }

  const events = db.prepare(`
    SELECT * FROM xp_events 
    WHERE user_id = ? 
    ORDER BY created_at DESC 
    LIMIT 10
  `).all(userId);

  const unlockedBadges = db.prepare(`
    SELECT b.*, ub.unlocked_at 
    FROM badges b
    JOIN user_badges ub ON b.id = ub.badge_id
    WHERE ub.user_id = ?
    ORDER BY ub.unlocked_at DESC
  `).all(userId);

  const allBadges = db.prepare('SELECT * FROM badges').all();

  const missions = db.prepare(`
    SELECT m.*, COALESCE(mp.progress, 0) as user_progress, COALESCE(mp.status, 'IN_PROGRESS') as user_status
    FROM missions m
    LEFT JOIN mission_progress mp ON m.id = mp.mission_id AND mp.user_id = ?
  `).all(userId);

  res.json({
    userId: user.id,
    xp: user.xp,
    level: currentLevel.name,
    levelNumber: currentLevel.level,
    streak: user.streak,
    progressToNext,
    currentTier: currentLevel,
    nextTier,
    unlockedBadges,
    allBadges,
    missions,
    recentEvents: events
  });
});

export default router;
