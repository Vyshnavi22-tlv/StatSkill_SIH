const API_BASE = '/api';

export const api = {
  // Auth & Profile
  getMe: async (userId = 'usr_ananya_sharma') => {
    const res = await fetch(`${API_BASE}/auth/me?userId=${userId}`);
    return res.json();
  },

  // Competencies & Graph
  getCompetencyGraph: async (userId = 'usr_ananya_sharma') => {
    const res = await fetch(`${API_BASE}/competencies/user/${userId}/graph`);
    return res.json();
  },
  getCompetencyDetail: async (competencyId, userId = 'usr_ananya_sharma') => {
    const res = await fetch(`${API_BASE}/competencies/${competencyId}?userId=${userId}`);
    return res.json();
  },
  getGapAnalysis: async (userId = 'usr_ananya_sharma') => {
    const res = await fetch(`${API_BASE}/competencies/user/${userId}/gap-analysis`);
    return res.json();
  },

  // Diagnostics
  startDiagnostic: async (userId = 'usr_ananya_sharma') => {
    const res = await fetch(`${API_BASE}/diagnostics/start?userId=${userId}`);
    return res.json();
  },
  submitDiagnostic: async (diagnosticId, userId, answers) => {
    const res = await fetch(`${API_BASE}/diagnostics/${diagnosticId}/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, answers })
    });
    return res.json();
  },

  // AI Assessments
  getAssessmentForCompetency: async (competencyId, userId = 'usr_ananya_sharma') => {
    const res = await fetch(`${API_BASE}/assessments/for-competency/${competencyId}?userId=${userId}`);
    return res.json();
  },
  submitAssessment: async (assessmentId, userId, competencyId, answers) => {
    const res = await fetch(`${API_BASE}/assessments/${assessmentId}/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, competencyId, answers })
    });
    return res.json();
  },

  // Recommendations
  getRecommendations: async (userId = 'usr_ananya_sharma') => {
    const res = await fetch(`${API_BASE}/recommendations?userId=${userId}`);
    return res.json();
  },

  // Documents
  getDocuments: async () => {
    const res = await fetch(`${API_BASE}/documents`);
    return res.json();
  },
  getDocumentChunks: async (docId) => {
    const res = await fetch(`${API_BASE}/documents/${docId}/chunks`);
    return res.json();
  },

  // Gamification
  getGamificationProfile: async (userId = 'usr_ananya_sharma') => {
    const res = await fetch(`${API_BASE}/gamification/profile?userId=${userId}`);
    return res.json();
  },

  // Admin Analytics
  getAdminAnalytics: async () => {
    const res = await fetch(`${API_BASE}/admin/analytics`);
    return res.json();
  },
  getInterventionEffectiveness: async () => {
    const res = await fetch(`${API_BASE}/admin/intervention-effectiveness`);
    return res.json();
  },
  getAuditLogs: async () => {
    const res = await fetch(`${API_BASE}/admin/audit-logs`);
    return res.json();
  },

  // Scoped RAG AI Mentor
  askMentor: async (query, documentId = null) => {
    const res = await fetch(`${API_BASE}/mentor/ask`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, documentId })
    });
    return res.json();
  },
  getMentorMaterials: async () => {
    const res = await fetch(`${API_BASE}/mentor/materials`);
    return res.json();
  }
};

export default api;
