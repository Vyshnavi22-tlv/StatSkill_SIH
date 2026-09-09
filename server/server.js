import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

import { initializeDatabase } from './db/database.js';
import authRoutes from './routes/auth.js';
import competencyRoutes from './routes/competencies.js';
import diagnosticRoutes from './routes/diagnostics.js';
import assessmentRoutes from './routes/assessments.js';
import recommendationRoutes from './routes/recommendations.js';
import documentRoutes from './routes/documents.js';
import gamificationRoutes from './routes/gamification.js';
import adminRoutes from './routes/admin.js';
import mentorRoutes from './routes/mentor.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Initialize Database on boot
initializeDatabase();

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/competencies', competencyRoutes);
app.use('/api/diagnostics', diagnosticRoutes);
app.use('/api/assessments', assessmentRoutes);
app.use('/api/recommendations', recommendationRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/gamification', gamificationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/mentor', mentorRoutes);

// Mock External Provider Adapters (iGOT Karmayogi & NSSTA)
app.get('/api/providers/igot/status', (req, res) => {
  res.json({
    provider: 'iGOT Karmayogi Mock Adapter',
    status: 'HEALTHY',
    activeCourses: 14,
    syncInterval: 'Realtime'
  });
});

app.get('/api/providers/nssta/status', (req, res) => {
  res.json({
    provider: 'NSSTA Academy Mock Adapter',
    status: 'HEALTHY',
    scheduledCohorts: 6,
    capacityAllocated: '92%'
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    name: 'StatSkill AI Backend Engine',
    version: '1.0.0-hackathon-mvp',
    status: 'ONLINE',
    database: 'SQLite (WAL Mode)',
    timestamp: new Date().toISOString()
  });
});

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`🚀 StatSkill AI Backend running on http://localhost:${PORT}`);
  });
}

export default app;
