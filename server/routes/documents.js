import { Router } from 'express';
import db from '../db/database.js';
import { AiAssessmentEngine } from '../services/aiAssessmentEngine.js';

const router = Router();

// Get all uploaded documents
router.get('/', (req, res) => {
  const docs = db.prepare(`
    SELECT d.*, COUNT(dc.id) as chunk_count 
    FROM documents d
    LEFT JOIN document_chunks dc ON d.id = dc.document_id
    GROUP BY d.id
  `).all();
  res.json(docs);
});

// Get chunks for a document
router.get('/:id/chunks', (req, res) => {
  const chunks = db.prepare(`
    SELECT dc.*, c.name as competency_name 
    FROM document_chunks dc
    LEFT JOIN competencies c ON dc.competency_id = c.id
    WHERE dc.document_id = ?
    ORDER BY dc.page_number, dc.chunk_index
  `).all(req.params.id);
  res.json(chunks);
});

// Trigger AI Question Generation on a chunk with critic validation
router.post('/chunks/:chunkId/generate-questions', (req, res) => {
  try {
    const { competencyId } = req.body;
    const questions = AiAssessmentEngine.generateQuestionsForChunk(req.params.chunkId, competencyId);
    res.json({
      success: true,
      count: questions.length,
      questions
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
