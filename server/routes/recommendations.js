import { Router } from 'express';
import db from '../db/database.js';
import { RecommendationEngine, MockCourseProviderAdapter } from '../services/recommendationEngine.js';

const router = Router();

// Get personalized recommendations for a user
router.get('/', (req, res) => {
  const userId = req.query.userId || 'usr_ananya_sharma';
  
  // Run Recommendation Algorithm
  const recs = RecommendationEngine.generateRecommendations(userId);
  res.json(recs);
});

// Provider adapter status & registry
router.get('/providers', (req, res) => {
  const providers = MockCourseProviderAdapter.getProviders();
  res.json(providers);
});

export default router;
