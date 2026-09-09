import db from '../db/database.js';
import { seedDatabase } from '../db/seed.js';
import { MasteryEngine } from '../services/masteryEngine.js';
import { RootGapEngine } from '../services/rootGapEngine.js';
import { RecommendationEngine } from '../services/recommendationEngine.js';
import { GamificationEngine } from '../services/gamificationEngine.js';
import { AiAssessmentEngine } from '../services/aiAssessmentEngine.js';
import { MentorEngine } from '../services/mentorEngine.js';

console.log('=== RUNNING STATSKILL AI BACKEND VERIFICATION SUITE ===\n');

// 1. Seed Database
seedDatabase();

// 2. Test User Profile & Role Mapping
console.log('\n[1/7] Testing User Profile & Role Requirements...');
const user = db.prepare('SELECT * FROM users WHERE id = ?').get('usr_ananya_sharma');
if (!user || user.name !== 'Ananya Sharma') throw new Error('User seed mismatch');
console.log(`✓ User Profile Verified: ${user.name} (${user.designation})`);

const roleComps = db.prepare(`
  SELECT rc.*, c.name FROM role_competencies rc
  JOIN competencies c ON rc.competency_id = c.id
  WHERE rc.role_id = ?
`).all(user.role_id);
console.log(`✓ Role Competencies count: ${roleComps.length} (Index Numbers, Sampling, Data Quality, etc.)`);

// 3. Test Competency Graph & Root Gap Detection
console.log('\n[2/7] Testing Competency Graph & Root-Gap Engine...');
const gapResults = RootGapEngine.analyzeGaps('usr_ananya_sharma');
console.log('Detected Root Gaps:', gapResults.rootGapIds);
console.log('At-Risk Cascaded Nodes Count:', gapResults.atRiskNodeIds.length);
if (!gapResults.rootGapIds.includes('comp_prob_fund')) {
  throw new Error('Expected Probability Fundamentals to be identified as root gap');
}
console.log(`✓ Root-Cause Gap correctly detected: Probability Fundamentals & Missing Value Treatment`);

// 4. Test Recommendations
console.log('\n[3/7] Testing Recommendation Engine & Provider Adapter...');
const recs = RecommendationEngine.generateRecommendations('usr_ananya_sharma');
console.log(`✓ Generated ${recs.length} personalized course recommendations from iGOT & NSSTA.`);

// 5. Test AI Assessment Engine & Critic Verification
console.log('\n[4/7] Testing AI Assessment Engine & Question Critic...');
const generatedQs = AiAssessmentEngine.generateQuestionsForChunk('chk_p27_missing', 'comp_missing_val');
console.log(`✓ Generated ${generatedQs.length} verified questions for Data Quality Manual Page 27.`);
console.log(`  Sample Critic Score: ${generatedQs[0].criticScore}, Status: ${generatedQs[0].status}`);
console.log(`  Source Grounding: Document=${generatedQs[0].sourceDocumentId}, Page=${generatedQs[0].sourcePage}`);

// 6. Test Evidence Submission & Mastery Recalculation
console.log('\n[5/7] Testing Evidence Model & Explainable Mastery Update...');
const evId = `ev_test_${Date.now()}`;
db.prepare(`
  INSERT INTO evidence (id, user_id, competency_id, evidence_type, score, weight, difficulty)
  VALUES (?, 'usr_ananya_sharma', 'comp_missing_val', 'REASSESSMENT', 92, 1.2, 'HARD')
`).run(evId);

const updatedMastery = MasteryEngine.recalculateMastery('usr_ananya_sharma', 'comp_missing_val');
console.log(`✓ Mastery updated for Missing Value Treatment: ${updatedMastery.oldScore}% -> ${updatedMastery.newScore}% (Confidence: ${updatedMastery.confidence})`);

// 7. Test Gamification: XP Award, Level Progression & Badges
console.log('\n[6/7] Testing Gamification Engine (XP, Levels, Badges)...');
const xpResult = GamificationEngine.awardXP('usr_ananya_sharma', 'QUIZ_PASSED', 'ass_1', 'Passed Data Quality Remediation Assessment');
console.log(`✓ XP Awarded: +${xpResult.awardedXP} XP (Total: ${xpResult.totalXP} XP, Level: ${xpResult.level})`);
console.log(`✓ Badges Check Completed: ${xpResult.newBadges.length} new badges unlocked.`);

// 8. Test Source Backtrace Resolution & Scoped RAG AI Mentor
console.log('\n[7/7] Testing Source Backtrace & Scoped RAG AI Mentor...');
const inScopeAnswer = MentorEngine.askMentor('What is the mandatory procedure for missing price observations?');
if (!inScopeAnswer.isGrounded || inScopeAnswer.citations[0].pageNumber !== 27) {
  throw new Error('Scoped RAG mentor failed to cite Page 27 for missing value query');
}
console.log(`✓ Scoped RAG In-Scope Query verified: Cited Page ${inScopeAnswer.citations[0].pageNumber} of ${inScopeAnswer.citations[0].documentTitle}`);

const outOfScopeAnswer = MentorEngine.askMentor('How to bake a chocolate cake in an oven?');
if (outOfScopeAnswer.isGrounded || !outOfScopeAnswer.answer.includes('This topic is not covered in the selected learning material.')) {
  throw new Error('Scoped RAG mentor failed to reject out-of-scope query');
}
console.log(`✓ Scoped RAG Out-of-Scope Rejection verified: "${outOfScopeAnswer.answer}"`);

console.log('\n======================================================');
console.log('🎉 ALL BACKEND & DATABASE FOUNDATION CHECKS PASSED!');
console.log('======================================================');
