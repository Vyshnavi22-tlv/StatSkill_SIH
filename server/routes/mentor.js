import { Router } from 'express';
import { MentorEngine } from '../services/mentorEngine.js';
import db from '../db/database.js';

const router = Router();

// Ask the scoped RAG mentor
router.post('/ask', (req, res) => {
  try {
    const { query, documentId } = req.body;
    const response = MentorEngine.askMentor(query, documentId);
    res.json(response);
  } catch (err) {
    console.error('Mentor query error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Get scoped uploaded materials available for AI mentoring
router.get('/materials', (req, res) => {
  try {
    const docs = db.prepare(`
      SELECT d.*, COUNT(dc.id) as chunk_count
      FROM documents d
      LEFT JOIN document_chunks dc ON d.id = dc.document_id
      GROUP BY d.id
    `).all();
    res.json(docs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
