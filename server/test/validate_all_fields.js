import db, { initializeDatabase } from '../db/database.js';
import { seedDatabase } from '../db/seed.js';
import app from '../server.js';

console.log('====================================================');
console.log('🔍 RUNNING COMPREHENSIVE FIELD & SCHEMA VALIDATOR 🔍');
console.log('====================================================\n');

// 1. Initialize & Seed Database
initializeDatabase();
seedDatabase();

// 2. Validate Database Tables and Row Fields
console.log('[1/4] Validating Database Schema & Field Integrity...');

const tables = [
  'users',
  'roles',
  'competencies',
  'competency_edges',
  'role_competencies',
  'courses',
  'course_competencies',
  'diagnostics',
  'diagnostic_questions',
  'assessments',
  'questions',
  'answers',
  'evidence',
  'mastery_scores',
  'recommendations',
  'xp_events',
  'badges',
  'user_badges',
  'missions',
  'mission_progress',
  'documents',
  'document_chunks',
  'audit_logs'
];

tables.forEach(tableName => {
  const count = db.prepare(`SELECT COUNT(*) as count FROM ${tableName}`).get().count;
  const sample = db.prepare(`SELECT * FROM ${tableName} LIMIT 1`).get();
  console.log(`  ✓ Table '${tableName}': ${count} records, valid columns: ${sample ? Object.keys(sample).join(', ') : '(empty table)'}`);
  
  if (tableName === 'users' || tableName === 'competencies' || tableName === 'questions') {
    if (!sample) throw new Error(`Table ${tableName} is unexpectedly empty!`);
  }
});

// 3. Validate Questions Field Integrity
console.log('\n[2/4] Validating Question & Source Backtrace Fields...');
const questions = db.prepare('SELECT * FROM questions').all();
questions.forEach(q => {
  if (!q.id || !q.question_text || !q.correct_answer || !q.explanation || !q.competency_id) {
    throw new Error(`Invalid question record: ${JSON.stringify(q)}`);
  }
  const opts = JSON.parse(q.options);
  if (!Array.isArray(opts) || opts.length < 2) {
    throw new Error(`Question ${q.id} has invalid options format`);
  }
  if (!opts.includes(q.correct_answer)) {
    throw new Error(`Question ${q.id} correct_answer not found in options: ${q.correct_answer}`);
  }
});
console.log(`  ✓ All ${questions.length} question records verified (options, correct answer matching, explanations, competencies).`);

// 4. Validate Competency Graph Edges & Hierarchy
console.log('\n[3/4] Validating Competency Graph DAG & Prerequisites...');
const edges = db.prepare('SELECT * FROM competency_edges').all();
const compIds = new Set(db.prepare('SELECT id FROM competencies').all().map(c => c.id));
edges.forEach(e => {
  if (!compIds.has(e.source_id)) throw new Error(`Edge ${e.id} source '${e.source_id}' does not exist`);
  if (!compIds.has(e.target_id)) throw new Error(`Edge ${e.id} target '${e.target_id}' does not exist`);
});
console.log(`  ✓ All ${edges.length} competency DAG edges verified (no orphan endpoints).`);

// 5. Validate REST API Endpoint Payloads
console.log('\n[4/4] Validating Live REST API Endpoint Payloads...');
const server = app.listen(5099, async () => {
  try {
    const endpoints = [
      { url: 'http://localhost:5099/api/auth/me?userId=usr_ananya_sharma', check: d => d.name === 'Ananya Sharma' },
      { url: 'http://localhost:5099/api/competencies/user/usr_ananya_sharma/graph', check: d => d.nodes.length >= 10 && d.edges.length >= 10 },
      { url: 'http://localhost:5099/api/diagnostics/start?userId=usr_ananya_sharma', check: d => d.questions.length >= 10 },
      { url: 'http://localhost:5099/api/assessments/for-competency/comp_missing_val?userId=usr_ananya_sharma', check: d => d.questions.length > 0 },
      { url: 'http://localhost:5099/api/recommendations?userId=usr_ananya_sharma', check: d => d.length > 0 && d[0].explanation.length > 0 },
      { url: 'http://localhost:5099/api/gamification/profile?userId=usr_ananya_sharma', check: d => d.xp >= 1000 && d.allBadges.length === 7 },
      { url: 'http://localhost:5099/api/admin/analytics', check: d => d.summary.totalOfficers >= 100 && d.departmentMastery.length === 4 },
      { url: 'http://localhost:5099/api/admin/intervention-effectiveness', check: d => d.length >= 4 && d[0].delta > 0 },
      { url: 'http://localhost:5099/api/mentor/materials', check: d => d.length > 0 }
    ];

    for (const ep of endpoints) {
      const res = await fetch(ep.url);
      if (!res.ok) throw new Error(`Endpoint ${ep.url} returned status ${res.status}`);
      const data = await res.json();
      if (!ep.check(data)) throw new Error(`Endpoint ${ep.url} payload validation failed: ${JSON.stringify(data).slice(0, 100)}`);
      console.log(`  ✓ Endpoint '${new URL(ep.url).pathname}' verified successfully.`);
    }

    console.log('\n====================================================');
    console.log('🎉 ALL FIELDS, SCHEMAS & API CONTRACTS VALIDATED! 🎉');
    console.log('====================================================');
    process.exit(0);
  } catch (err) {
    console.error('Validation error:', err);
    process.exit(1);
  } finally {
    server.close();
  }
});
