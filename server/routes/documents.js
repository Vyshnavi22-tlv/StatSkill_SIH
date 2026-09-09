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
    ORDER BY d.uploaded_at DESC
  `).all();
  res.json(docs);
});

// Get chunks for a document
router.get('/:id/chunks', (req, res) => {
  const chunks = db.prepare(`
    SELECT dc.*, c.name as competency_name, c.code as competency_code
    FROM document_chunks dc
    LEFT JOIN competencies c ON dc.competency_id = c.id
    WHERE dc.document_id = ?
    ORDER BY dc.page_number, dc.chunk_index
  `).all(req.params.id);
  res.json(chunks);
});

// Run the Document-to-Assessment AI Pipeline
router.post('/pipeline/run', (req, res) => {
  try {
    const { 
      documentTitle = 'MoSPI Data Quality Manual (Chapter 4)',
      domain = 'STATISTICAL',
      pageNumber = 27,
      rawText = `Section 4.2 Hot-Deck vs Cold-Deck Imputation: When a specific commodity price quote is missing in the current month's survey round, hot-deck donor matching within the same stratum and urban/rural market cluster is the mandatory standard under MoSPI guidelines. Cold-deck imputation (using historical static baseline datasets) is strictly discouraged during volatile inflation periods because it creates lagged underestimation. In hot-deck imputation, the donor quotation must be drawn from an active responding unit sharing identical item specifications and outlet grade.`,
      competencyId = 'comp_missing_val'
    } = req.body;

    const result = AiAssessmentEngine.runDocumentAssessmentPipeline({
      documentTitle,
      domain,
      pageNumber,
      rawText,
      competencyId
    });

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
