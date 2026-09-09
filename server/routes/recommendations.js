import { Router } from 'express';
import db from '../db/database.js';
import { RecommendationEngine } from '../services/recommendationEngine.js';

const router = Router();

// Get personalized recommendations for a user
router.get('/', (req, res) => {
  const userId = req.query.userId || 'usr_ananya_sharma';
  
  // Refresh recommendations
  RecommendationEngine.generateRecommendations(userId);

  const recs = db.prepare(`
    SELECT r.*, c.name as competency_name, crs.duration_hours, crs.level as course_level, crs.url as course_url
    FROM recommendations r
    JOIN competencies c ON r.competency_id = c.id
    LEFT JOIN courses crs ON r.course_id = crs.id
    WHERE r.user_id = ?
    ORDER BY 
      CASE r.priority 
        WHEN 'HIGH' THEN 1 
        WHEN 'MEDIUM' THEN 2 
        ELSE 3 
      END
  `).all(userId);

  const formatted = recs.map(r => ({
    ...r,
    reasons: JSON.parse(r.reason)
  }));

  res.json(formatted);
});

export default router;
