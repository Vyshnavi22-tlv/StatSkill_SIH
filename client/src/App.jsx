import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import LearnerDashboard from './pages/LearnerDashboard';
import CompetencyGraphPage from './pages/CompetencyGraphPage';
import DiagnosticPage from './pages/DiagnosticPage';
import LearningAssessmentPage from './pages/LearningAssessmentPage';
import GamificationPage from './pages/GamificationPage';
import AdminAnalyticsPage from './pages/AdminAnalyticsPage';
import api from './services/api';

export default function App() {
  const [user, setUser] = useState(null);
  const [gamification, setGamification] = useState(null);

  useEffect(() => {
    async function initUser() {
      try {
        const [userData, gamifyData] = await Promise.all([
          api.getMe('usr_ananya_sharma'),
          api.getGamificationProfile('usr_ananya_sharma')
        ]);
        setUser(userData);
        setGamification(gamifyData);
      } catch (e) {
        console.error('App init error:', e);
      }
    }
    initUser();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-sky-500 selection:text-white">
      <Navbar user={user} gamification={gamification} />
      
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<LearnerDashboard />} />
          <Route path="/graph" element={<CompetencyGraphPage />} />
          <Route path="/diagnostic" element={<DiagnosticPage />} />
          <Route path="/learning" element={<LearningAssessmentPage />} />
          <Route path="/gamification" element={<GamificationPage />} />
          <Route path="/admin" element={<AdminAnalyticsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 text-center text-xs text-slate-500">
        <p>StatSkill AI — Competency Intelligence Platform for India's Official Statistical System (MoSPI)</p>
      </footer>
    </div>
  );
}
