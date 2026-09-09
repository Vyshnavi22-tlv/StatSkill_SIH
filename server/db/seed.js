import db, { initializeDatabase } from './database.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function seedDatabase() {
  console.log('Initializing database schema...');
  initializeDatabase();

  console.log('Clearing existing records...');
  const tables = [
    'audit_logs', 'mission_progress', 'missions', 'user_badges', 'badges',
    'xp_events', 'recommendations', 'mastery_scores', 'evidence', 'answers',
    'assessment_questions', 'assessments', 'diagnostic_answers',
    'diagnostic_questions', 'diagnostics', 'questions', 'document_chunks',
    'documents', 'course_competencies', 'courses', 'role_competencies',
    'competency_edges', 'competencies', 'users', 'roles'
  ];

  tables.forEach(t => {
    try {
      db.prepare(`DELETE FROM ${t}`).run();
    } catch (e) {
      // ignore
    }
  });

  console.log('Seeding Roles & Competencies for Official Statistics...');
  // 1. Roles
  db.prepare(`
    INSERT INTO roles (id, name, department, description)
    VALUES (?, ?, ?, ?)
  `).run(
    'role_asst_dir_price',
    'Assistant Director — Price Statistics',
    'MoSPI — National Statistical Office (NSO)',
    'Responsible for CPI/WPI index computation, sample survey validation, price quote verification, and official index releases.'
  );

  db.prepare(`
    INSERT INTO roles (id, name, department, description)
    VALUES (?, ?, ?, ?)
  `).run(
    'role_admin',
    'Capacity Building Administrator',
    'MoSPI — Training & Capacity Division (NSSTA)',
    'Oversees national statistical workforce competency distribution, training impact, and skill gap forecasting.'
  );

  // 2. Official Statistics Full Taxonomy Competencies
  const competencies = [
    // Top-Level / Core
    { id: 'comp_official_stat', code: 'OFF-001', name: 'Official Statistics', domain: 'STATISTICAL', description: 'Foundational principles of official statistics, UN Fundamental Principles, MoSPI mandate, and national data architecture.', level: 75, parent_id: null },
    
    // Survey Methodology Subtree
    { id: 'comp_survey_meth', code: 'SURV-100', name: 'Survey Methodology', domain: 'STATISTICAL', description: 'Survey design, sampling frames, response rate management, and survey operations.', level: 75, parent_id: 'comp_official_stat' },
    { id: 'comp_quest_des', code: 'SURV-102', name: 'Questionnaire Design', domain: 'STATISTICAL', description: 'Cognitive testing, item wording, skip patterns, and digital CAPI instrument structuring.', level: 70, parent_id: 'comp_survey_meth' },
    { id: 'comp_sampling', code: 'SAMP-100', name: 'Sampling', domain: 'STATISTICAL', description: 'Sampling theory and design of complex multi-stage probabilistic household and enterprise surveys.', level: 70, parent_id: 'comp_survey_meth' },
    { id: 'comp_prob_samp', code: 'SAMP-101', name: 'Probability Sampling', domain: 'STATISTICAL', description: 'Inclusion probabilities, SRSWOR, sampling weights, and standard error estimations.', level: 70, parent_id: 'comp_sampling' },
    { id: 'comp_prob_fund', code: 'SAMP-102', name: 'Probability Fundamentals', domain: 'STATISTICAL', description: 'Foundational probability axioms, random variables, expectation, and sampling distributions.', level: 70, parent_id: 'comp_prob_samp' },
    { id: 'comp_strat_samp', code: 'SAMP-103', name: 'Stratified Sampling', domain: 'STATISTICAL', description: 'Neyman allocation, proportional stratification, and between vs within stratum variance reduction.', level: 75, parent_id: 'comp_sampling' },
    { id: 'comp_cluster_samp', code: 'SAMP-104', name: 'Cluster Sampling', domain: 'STATISTICAL', description: 'Intraclass correlation coefficient (rho), design effect (Deff), and two-stage cluster selection.', level: 75, parent_id: 'comp_sampling' },

    // National Accounts Subtree
    { id: 'comp_nat_acc', code: 'NACC-100', name: 'National Accounts', domain: 'STATISTICAL', description: 'Macroeconomic accounting frameworks, supply-use tables, and compilation of macroeconomic aggregates.', level: 75, parent_id: 'comp_official_stat' },
    { id: 'comp_gdp', code: 'NACC-101', name: 'GDP Compilation', domain: 'STATISTICAL', description: 'Gross Domestic Product estimation via Production, Expenditure, and Income approaches.', level: 80, parent_id: 'comp_nat_acc' },
    { id: 'comp_gva', code: 'NACC-102', name: 'GVA by Economic Activity', domain: 'STATISTICAL', description: 'Gross Value Added across primary, secondary, and tertiary sectors with intermediate consumption.', level: 75, parent_id: 'comp_nat_acc' },
    { id: 'comp_sna', code: 'NACC-103', name: 'System of National Accounts (SNA 2008)', domain: 'STATISTICAL', description: 'Institutional sectors, financial accounts, balance sheets, and rest-of-the-world accounts.', level: 70, parent_id: 'comp_nat_acc' },

    // Price Statistics Subtree
    { id: 'comp_price_stat', code: 'PRC-100', name: 'Price Statistics', domain: 'STATISTICAL', description: 'Compilation and analysis of inflation and price indices across consumer, wholesale, and producer prices.', level: 80, parent_id: 'comp_official_stat' },
    { id: 'comp_cpi', code: 'PRC-101', name: 'Consumer Price Index (CPI)', domain: 'STATISTICAL', description: 'Monthly retail inflation measurement, rural/urban basket weights, and missing item imputation.', level: 80, parent_id: 'comp_price_stat' },
    { id: 'comp_wpi', code: 'PRC-102', name: 'Wholesale Price Index (WPI)', domain: 'STATISTICAL', description: 'Factory-gate and wholesale transaction price movements across primary articles and manufactured goods.', level: 75, parent_id: 'comp_price_stat' },
    { id: 'comp_index_num', code: 'PRC-103', name: 'Index Number Theory', domain: 'STATISTICAL', description: 'Mathematical properties of Laspeyres, Paasche, Fisher Ideal, and Törnqvist index formulae.', level: 80, parent_id: 'comp_price_stat' },

    // Domain Statistics
    { id: 'comp_labour_stat', code: 'LAB-100', name: 'Labour Statistics', domain: 'STATISTICAL', description: 'Periodic Labour Force Survey (PLFS), LFPR, WPR, UR metrics, and activity status classification.', level: 70, parent_id: 'comp_official_stat' },
    { id: 'comp_agri_stat', code: 'AGR-100', name: 'Agricultural Statistics', domain: 'STATISTICAL', description: 'Crop cutting experiments (CCE), agricultural census, land utilization, and harvest forecasting.', level: 65, parent_id: 'comp_official_stat' },

    // Data Quality Subtree
    { id: 'comp_data_qual', code: 'QUAL-100', name: 'Data Quality Assurance', domain: 'STATISTICAL', description: 'MoSPI National Data Quality Framework, survey auditing, and metadata standards.', level: 75, parent_id: 'comp_official_stat' },
    { id: 'comp_data_val', code: 'QUAL-101', name: 'Data Validation', domain: 'STATISTICAL', description: 'Range validation, relational consistency checks, and field schedule verification.', level: 70, parent_id: 'comp_data_qual' },
    { id: 'comp_missing_val', code: 'QUAL-102', name: 'Missing Value Treatment', domain: 'STATISTICAL', description: 'Imputation methods: hot-deck donor matching, cold-deck analysis, and non-response calibration.', level: 75, parent_id: 'comp_data_qual' },
    { id: 'comp_outlier_det', code: 'QUAL-103', name: 'Outlier Detection', domain: 'STATISTICAL', description: 'IQR bounds, extreme value Winsorization, and multivariate anomaly flagging.', level: 70, parent_id: 'comp_data_qual' },

    // SDG Indicators
    { id: 'comp_sdg_ind', code: 'SDG-100', name: 'SDG Indicators & National Indicator Framework', domain: 'STATISTICAL', description: 'Monitoring India’s progress on 17 UN Sustainable Development Goals via 300+ NIF indicators.', level: 70, parent_id: 'comp_official_stat' },

    // Supporting Technical Skills
    { id: 'comp_stat_comp', code: 'TECH-101', name: 'Statistical Computing', domain: 'TECHNICAL', description: 'Programming in Python and R for data manipulation, cleaning, and aggregation.', level: 65, parent_id: null },
    { id: 'comp_data_viz', code: 'TECH-201', name: 'Data Visualization', domain: 'TECHNICAL', description: 'Dissemination charts, choropleth maps, and executive statistical dashboards.', level: 50, parent_id: null }
  ];

  const insertComp = db.prepare(`
    INSERT INTO competencies (id, code, name, domain, description, required_level, parent_id)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  competencies.forEach(c => insertComp.run(c.id, c.code, c.name, c.domain, c.description, c.level, c.parent_id));

  // 3. Prerequisite Edges in the Competency Graph
  const edges = [
    { id: 'edge_1', src: 'comp_prob_fund', tgt: 'comp_prob_samp', rel: 'PREREQUISITE' },
    { id: 'edge_2', src: 'comp_prob_samp', tgt: 'comp_sampling', rel: 'PREREQUISITE' },
    { id: 'edge_3', src: 'comp_sampling', tgt: 'comp_strat_samp', rel: 'PREREQUISITE' },
    { id: 'edge_4', src: 'comp_sampling', tgt: 'comp_cluster_samp', rel: 'PREREQUISITE' },
    { id: 'edge_5', src: 'comp_sampling', tgt: 'comp_survey_meth', rel: 'PREREQUISITE' },
    { id: 'edge_6', src: 'comp_quest_des', tgt: 'comp_survey_meth', rel: 'PREREQUISITE' },

    { id: 'edge_7', src: 'comp_data_val', tgt: 'comp_missing_val', rel: 'PREREQUISITE' },
    { id: 'edge_8', src: 'comp_missing_val', tgt: 'comp_outlier_det', rel: 'PREREQUISITE' },
    { id: 'edge_9', src: 'comp_missing_val', tgt: 'comp_data_qual', rel: 'PREREQUISITE' },
    { id: 'edge_10', src: 'comp_outlier_det', tgt: 'comp_data_qual', rel: 'PREREQUISITE' },

    { id: 'edge_11', src: 'comp_index_num', tgt: 'comp_cpi', rel: 'PREREQUISITE' },
    { id: 'edge_12', src: 'comp_index_num', tgt: 'comp_wpi', rel: 'PREREQUISITE' },
    { id: 'edge_13', src: 'comp_cpi', tgt: 'comp_price_stat', rel: 'PREREQUISITE' },
    { id: 'edge_14', src: 'comp_wpi', tgt: 'comp_price_stat', rel: 'PREREQUISITE' },

    { id: 'edge_15', src: 'comp_gva', tgt: 'comp_gdp', rel: 'PREREQUISITE' },
    { id: 'edge_16', src: 'comp_gdp', tgt: 'comp_sna', rel: 'PREREQUISITE' },
    { id: 'edge_17', src: 'comp_sna', tgt: 'comp_nat_acc', rel: 'PREREQUISITE' },

    { id: 'edge_18', src: 'comp_stat_comp', tgt: 'comp_data_viz', rel: 'PREREQUISITE' },
    { id: 'edge_19', src: 'comp_data_qual', tgt: 'comp_sdg_ind', rel: 'PREREQUISITE' }
  ];

  const insertEdge = db.prepare(`
    INSERT INTO competency_edges (id, source_id, target_id, relationship_type, weight)
    VALUES (?, ?, ?, ?, 1.0)
  `);
  edges.forEach(e => insertEdge.run(e.id, e.src, e.tgt, e.rel));

  // 4. Role Competencies for Assistant Director — Price Statistics
  const roleComps = [
    { roleId: 'role_asst_dir_price', compId: 'comp_index_num', req: 80, weight: 1.0 },
    { roleId: 'role_asst_dir_price', compId: 'comp_cpi', req: 80, weight: 1.0 },
    { roleId: 'role_asst_dir_price', compId: 'comp_sampling', req: 70, weight: 0.9 },
    { roleId: 'role_asst_dir_price', compId: 'comp_data_qual', req: 75, weight: 0.95 },
    { roleId: 'role_asst_dir_price', compId: 'comp_stat_comp', req: 65, weight: 0.7 },
    { roleId: 'role_asst_dir_price', compId: 'comp_data_viz', req: 50, weight: 0.6 }
  ];

  const insertRoleComp = db.prepare(`
    INSERT INTO role_competencies (id, role_id, competency_id, required_level, role_weight)
    VALUES (?, ?, ?, ?, ?)
  `);
  roleComps.forEach((rc, i) => insertRoleComp.run(`rc_${i+1}`, rc.roleId, rc.compId, rc.req, rc.weight));

  // 5. Seed Users
  db.prepare(`
    INSERT INTO users (
      id, name, email, department, designation, role_id, experience, qualification,
      xp, level, level_number, streak, last_activity_date
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_DATE)
  `).run(
    'usr_ananya_sharma',
    'Ananya Sharma',
    'ananya.sharma@mospi.gov.in',
    'Price Statistics Division, MoSPI',
    'Assistant Director (Price Statistics)',
    'role_asst_dir_price',
    4,
    'M.Sc. Statistics',
    1650,
    'Practitioner',
    3,
    7
  );

  db.prepare(`
    INSERT INTO users (
      id, name, email, department, designation, role_id, experience, qualification,
      xp, level, level_number, streak, last_activity_date
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_DATE)
  `).run(
    'usr_admin_rajesh',
    'Rajesh Verma',
    'rajesh.verma@mospi.gov.in',
    'National Statistical Systems Training Academy (NSSTA)',
    'Joint Director & Capacity Head',
    'role_admin',
    15,
    'Ph.D. Econometrics',
    5400,
    'Advanced Practitioner',
    5,
    28
  );

  // 6. Documents & Chunks
  db.prepare(`
    INSERT INTO documents (id, title, domain, file_type, file_path)
    VALUES (?, ?, ?, ?, ?)
  `).run(
    'doc_dq_manual',
    'MoSPI Manual on Data Quality Assurance & Missing Value Handling',
    'STATISTICAL',
    'pdf',
    '/documents/MoSPI_Data_Quality_Manual_2026.pdf'
  );

  const chunks = [
    {
      id: 'chk_p12_val',
      doc_id: 'doc_dq_manual',
      page: 12,
      idx: 1,
      heading: 'Chapter 2: Data Validation Rules & Consistency Checking',
      content: `Section 2.4 Range & Relational Checks: In all primary price collection schedules for CPI, field investigators must verify item unit prices against the historical IQR (Interquartile Range) boundary of the respective market cluster. A price quote deviating beyond 2.5 times the median price without documentary market justification shall be flagged as an unverified anomaly and escalated to the regional supervisory officer.`,
      comp_id: 'comp_data_val'
    },
    {
      id: 'chk_p27_missing',
      doc_id: 'doc_dq_manual',
      page: 27,
      idx: 2,
      heading: 'Chapter 4: Missing Value Treatment & Imputation Techniques',
      content: `Section 4.2 Hot-Deck vs Cold-Deck Donor Imputation: When a specific commodity price quote is missing in the current month's survey round, hot-deck donor matching within the same stratum and urban/rural market cluster is the mandatory standard under MoSPI guidelines. Cold-deck imputation (using historical static baseline datasets) is strictly discouraged during volatile inflation periods because it creates lagged underestimation. In hot-deck imputation, the donor quotation must be drawn from an active responding unit sharing identical item specifications and outlet grade.`,
      comp_id: 'comp_missing_val'
    },
    {
      id: 'chk_p45_outliers',
      doc_id: 'doc_dq_manual',
      page: 45,
      idx: 3,
      heading: 'Chapter 6: Outlier Treatment & Laspeyres Index Aggregation',
      content: `Section 6.1 Extreme Value Winsorization: Outliers confirmed after field re-verification that reflect transient local supply bottlenecks rather than systemic inflation should undergo 95% Winsorization before aggregation into the elementary Laspeyres price index. Winsorization replaces extreme upper tail values with the 95th percentile price relative of the respective sub-group.`,
      comp_id: 'comp_outlier_det'
    }
  ];

  const insertChunk = db.prepare(`
    INSERT INTO document_chunks (id, document_id, page_number, chunk_index, heading, content, competency_id)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  chunks.forEach(chk => insertChunk.run(chk.id, chk.doc_id, chk.page, chk.idx, chk.heading, chk.content, chk.comp_id));

  // 7. Seed Diagnostic & Backtrace Questions
  const questionsJsonPath = path.join(__dirname, 'diagnostic_questions.json');
  const diagnosticQuestions = JSON.parse(fs.readFileSync(questionsJsonPath, 'utf8'));

  const insertQ = db.prepare(`
    INSERT INTO questions (
      id, question_text, question_type, options, correct_answer, explanation,
      competency_id, difficulty, bloom_level, source_document_id, source_page,
      source_chunk_id, critic_score, status
    ) VALUES (?, ?, 'MCQ', ?, ?, ?, ?, ?, ?, ?, ?, ?, 0.95, 'APPROVED')
  `);

  diagnosticQuestions.forEach(q => {
    insertQ.run(
      q.id, q.text, JSON.stringify(q.options), q.correct, q.explanation,
      q.comp_id, q.diff, q.bloom, null, null, null
    );
  });

  const backtraceQuestions = [
    {
      id: 'q_backtrace_1',
      text: "According to MoSPI Data Quality guidelines on Missing Value Treatment, what is the mandatory standard procedure when a monthly commodity price quote is missing in a survey round?",
      options: [
        "Hot-deck donor matching within the same stratum and market cluster",
        "Cold-deck imputation from static historical decennial census datasets",
        "Replace the missing price quote with 0 in the Laspeyres index equation",
        "Drop the entire commodity category from the official national index calculation"
      ],
      correct: "Hot-deck donor matching within the same stratum and market cluster",
      explanation: "Under MoSPI Guidelines (Page 27, Section 4.2), missing price observations must be treated using hot-deck donor matching from active responding units within the same stratum to preserve local price variability.",
      comp_id: 'comp_missing_val',
      diff: 'MEDIUM',
      bloom: 'APPLICATION',
      doc_id: 'doc_dq_manual',
      page: 27,
      chunk_id: 'chk_p27_missing'
    },
    {
      id: 'q_backtrace_2',
      text: "Why does MoSPI strictly discourage 'Cold-deck imputation' for missing price observations during active inflationary cycles?",
      options: [
        "Cold-deck uses historical baseline datasets that cause lagged underestimation of current prices",
        "Cold-deck requires physical re-enumeration of the entire district population",
        "Cold-deck is mathematically incompatible with arithmetic mean calculation",
        "Cold-deck can only be performed using proprietary mainframe software"
      ],
      correct: "Cold-deck uses historical baseline datasets that cause lagged underestimation of current prices",
      explanation: "Page 27 Section 4.2 explicitly highlights that cold-deck draws values from historical baseline sources, causing lagged underestimation during rapid inflationary trends.",
      comp_id: 'comp_missing_val',
      diff: 'HARD',
      bloom: 'ANALYZE',
      doc_id: 'doc_dq_manual',
      page: 27,
      chunk_id: 'chk_p27_missing'
    }
  ];

  backtraceQuestions.forEach(q => {
    insertQ.run(
      q.id, q.text, JSON.stringify(q.options), q.correct, q.explanation,
      q.comp_id, q.diff, q.bloom, q.doc_id, q.page, q.chunk_id
    );
  });

  // 8. Seed Initial Evidence
  const initialEvidence = [
    { comp: 'comp_prob_fund', type: 'DIAGNOSTIC', score: 40, weight: 1.0, diff: 'MEDIUM' },
    { comp: 'comp_prob_fund', type: 'QUIZ', score: 44, weight: 1.1, diff: 'HARD' },
    { comp: 'comp_prob_samp', type: 'DIAGNOSTIC', score: 55, weight: 1.0, diff: 'MEDIUM' },
    { comp: 'comp_sampling', type: 'DIAGNOSTIC', score: 58, weight: 1.0, diff: 'HARD' },
    { comp: 'comp_data_val', type: 'DIAGNOSTIC', score: 48, weight: 1.0, diff: 'MEDIUM' },
    { comp: 'comp_missing_val', type: 'DIAGNOSTIC', score: 35, weight: 1.0, diff: 'HARD' },
    { comp: 'comp_data_qual', type: 'DIAGNOSTIC', score: 40, weight: 1.0, diff: 'MEDIUM' },
    { comp: 'comp_data_qual', type: 'QUIZ', score: 46, weight: 1.1, diff: 'HARD' },
    { comp: 'comp_index_num', type: 'DIAGNOSTIC', score: 62, weight: 1.0, diff: 'HARD' },
    { comp: 'comp_cpi', type: 'DIAGNOSTIC', score: 65, weight: 1.0, diff: 'MEDIUM' },
    { comp: 'comp_stat_comp', type: 'DIAGNOSTIC', score: 76, weight: 1.0, diff: 'EASY' },
    { comp: 'comp_data_viz', type: 'DIAGNOSTIC', score: 58, weight: 1.0, diff: 'EASY' }
  ];

  const insertEv = db.prepare(`
    INSERT INTO evidence (id, user_id, competency_id, evidence_type, score, weight, difficulty)
    VALUES (?, 'usr_ananya_sharma', ?, ?, ?, ?, ?)
  `);
  initialEvidence.forEach((ev, idx) => {
    insertEv.run(`ev_init_${idx+1}`, ev.comp, ev.type, ev.score, ev.weight, ev.diff);
  });

  // 9. Seed Mastery Scores
  const initialMastery = [
    { comp: 'comp_prob_fund', mastery: 42, conf: 'MEDIUM', evCount: 2, isRoot: 1, impact: 4 },
    { comp: 'comp_prob_samp', mastery: 55, conf: 'LOW', evCount: 1, isRoot: 0, impact: 3 },
    { comp: 'comp_sampling', mastery: 58, conf: 'LOW', evCount: 1, isRoot: 0, impact: 2 },
    { comp: 'comp_strat_samp', mastery: 60, conf: 'LOW', evCount: 1, isRoot: 0, impact: 0 },
    { comp: 'comp_cluster_samp', mastery: 52, conf: 'LOW', evCount: 1, isRoot: 0, impact: 0 },
    { comp: 'comp_quest_des', mastery: 72, conf: 'LOW', evCount: 1, isRoot: 0, impact: 1 },
    { comp: 'comp_survey_meth', mastery: 67, conf: 'LOW', evCount: 1, isRoot: 0, impact: 0 },

    { comp: 'comp_data_val', mastery: 48, conf: 'LOW', evCount: 1, isRoot: 0, impact: 3 },
    { comp: 'comp_missing_val', mastery: 35, conf: 'LOW', evCount: 1, isRoot: 1, impact: 2 },
    { comp: 'comp_outlier_det', mastery: 50, conf: 'LOW', evCount: 1, isRoot: 0, impact: 1 },
    { comp: 'comp_data_qual', mastery: 43, conf: 'MEDIUM', evCount: 2, isRoot: 0, impact: 1 },

    { comp: 'comp_index_num', mastery: 62, conf: 'LOW', evCount: 1, isRoot: 0, impact: 2 },
    { comp: 'comp_cpi', mastery: 65, conf: 'LOW', evCount: 1, isRoot: 0, impact: 1 },
    { comp: 'comp_wpi', mastery: 74, conf: 'HIGH', evCount: 8, isRoot: 0, impact: 1 },
    { comp: 'comp_price_stat', mastery: 70, conf: 'MEDIUM', evCount: 4, isRoot: 0, impact: 0 },

    { comp: 'comp_gva', mastery: 78, conf: 'HIGH', evCount: 8, isRoot: 0, impact: 2 },
    { comp: 'comp_gdp', mastery: 82, conf: 'HIGH', evCount: 9, isRoot: 0, impact: 1 },
    { comp: 'comp_sna', mastery: 75, conf: 'MEDIUM', evCount: 6, isRoot: 0, impact: 1 },
    { comp: 'comp_nat_acc', mastery: 79, conf: 'HIGH', evCount: 8, isRoot: 0, impact: 0 },

    { comp: 'comp_labour_stat', mastery: 71, conf: 'MEDIUM', evCount: 4, isRoot: 0, impact: 0 },
    { comp: 'comp_agri_stat', mastery: 68, conf: 'MEDIUM', evCount: 3, isRoot: 0, impact: 0 },
    { comp: 'comp_sdg_ind', mastery: 64, conf: 'LOW', evCount: 2, isRoot: 0, impact: 0 },
    { comp: 'comp_stat_comp', mastery: 76, conf: 'HIGH', evCount: 8, isRoot: 0, impact: 1 },
    { comp: 'comp_data_viz', mastery: 58, conf: 'MEDIUM', evCount: 3, isRoot: 0, impact: 0 },
    { comp: 'comp_official_stat', mastery: 74, conf: 'HIGH', evCount: 10, isRoot: 0, impact: 0 }
  ];

  const insertMst = db.prepare(`
    INSERT INTO mastery_scores (id, user_id, competency_id, mastery, confidence, evidence_count, is_root_gap, downstream_impact_count)
    VALUES (?, 'usr_ananya_sharma', ?, ?, ?, ?, ?, ?)
  `);
  initialMastery.forEach((m, idx) => {
    insertMst.run(`mst_init_${idx+1}`, m.comp, m.mastery, m.conf, m.evCount, m.isRoot, m.impact);
  });

  // 10. Courses
  const courses = [
    {
      id: 'crs_igot_prob',
      title: 'Foundations of Probability & Sampling Distributions in Official Surveys',
      provider: 'iGOT Karmayogi',
      description: 'Comprehensive online course covering probability axioms, expectation, variance, and simple random sampling fundamentals for official statisticians.',
      duration_hours: 6.0,
      url: 'https://igotkarmayogi.gov.in/courses/prob-sampling-foundations',
      level: 'Foundation',
      comp_id: 'comp_prob_fund',
      target_mastery: 85
    },
    {
      id: 'crs_nssta_sampling',
      title: 'Advanced Survey Methodology & Complex Sampling Designs',
      provider: 'NSSTA',
      description: 'Classroom & hybrid immersive program by NSSTA focusing on multi-stage stratified sampling, cluster design, and weight calibration.',
      duration_hours: 18.0,
      url: 'https://nssta.gov.in/programs/advanced-survey-methodology',
      level: 'Advanced',
      comp_id: 'comp_sampling',
      target_mastery: 80
    },
    {
      id: 'crs_igot_data_qual',
      title: 'Data Quality Assurance, Imputation & Missing Value Treatment',
      provider: 'iGOT Karmayogi',
      description: 'Practical training on statistical imputation rules, hot-deck donor matching, cold-deck analysis, and validation protocols under MoSPI guidelines.',
      duration_hours: 8.0,
      url: 'https://igotkarmayogi.gov.in/courses/data-quality-imputation',
      level: 'Intermediate',
      comp_id: 'comp_missing_val',
      target_mastery: 85
    },
    {
      id: 'crs_nssta_price',
      title: 'Index Numbers Theory and Practical Compilation of CPI / WPI',
      provider: 'NSSTA',
      description: 'Specialized academy module on Laspeyres index formulation, item substitution, base year revisions, and price quote consistency checks.',
      duration_hours: 12.0,
      url: 'https://nssta.gov.in/programs/price-index-compilation',
      level: 'Specialist',
      comp_id: 'comp_index_num',
      target_mastery: 85
    }
  ];

  const insertCourse = db.prepare(`
    INSERT INTO courses (id, title, provider, description, duration_hours, url, level)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  const insertCourseComp = db.prepare(`
    INSERT INTO course_competencies (id, course_id, competency_id, target_mastery)
    VALUES (?, ?, ?, ?)
  `);

  courses.forEach((c, idx) => {
    insertCourse.run(c.id, c.title, c.provider, c.description, c.duration_hours, c.url, c.level);
    insertCourseComp.run(`cc_${idx+1}`, c.id, c.comp_id, c.target_mastery);
  });

  // 11. ALL 7 BADGES REQUIRED BY SPECIFICATION
  const badges = [
    {
      id: 'bdg_diag',
      code: 'DIAGNOSTIC_STARTER',
      name: 'Diagnostic Starter',
      description: 'Completed the baseline competency diagnostic test.',
      icon: 'Compass',
      criteria: 'Complete 1 official baseline diagnostic'
    },
    {
      id: 'bdg_sampling',
      code: 'SAMPLING_FOUNDATIONS',
      name: 'Sampling Foundations',
      description: 'Mastered Probability Sampling and Sampling Theory fundamentals.',
      icon: 'GitBranch',
      criteria: 'Achieve >= 60% mastery in Probability & Sampling'
    },
    {
      id: 'bdg_data_qual',
      code: 'DATA_QUALITY_GUARDIAN',
      name: 'Data Quality Guardian',
      description: 'Demonstrated mastery in Data Validation and Missing Value Treatment.',
      icon: 'ShieldCheck',
      criteria: 'Demonstrate >= 60% mastery in Data Quality'
    },
    {
      id: 'bdg_survey_meth',
      code: 'SURVEY_METHODOLOGIST',
      name: 'Survey Methodologist',
      description: 'Completed advanced survey methodology and sampling frame design.',
      icon: 'Layers',
      criteria: 'Achieve >= 65% mastery in Survey Methodology'
    },
    {
      id: 'bdg_stat_comp',
      code: 'STATISTICAL_COMPUTING',
      name: 'Statistical Computing',
      description: 'Demonstrated hands-on price data analysis in Python / R.',
      icon: 'Cpu',
      criteria: 'Achieve >= 70% mastery in Statistical Computing'
    },
    {
      id: 'bdg_comp_master',
      code: 'COMPETENCY_MASTER',
      name: 'Competency Master',
      description: 'Attained high mastery (>= 75%) across 3 or more official statistical competencies.',
      icon: 'Award',
      criteria: 'Master 3 or more competencies with >= 75% score'
    },
    {
      id: 'bdg_streak',
      code: 'CONSISTENCY_CHAMPION',
      name: 'Consistency Champion',
      description: 'Maintained an active continuous learning streak for 7 consecutive days.',
      icon: 'Flame',
      criteria: 'Maintain a 7-day learning streak'
    }
  ];

  const insertBadge = db.prepare(`
    INSERT INTO badges (id, code, name, description, icon, criteria)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  badges.forEach(b => insertBadge.run(b.id, b.code, b.name, b.description, b.icon, b.criteria));

  // Seed unlocked badges for Ananya
  db.prepare(`INSERT INTO user_badges (id, user_id, badge_id, unlocked_at) VALUES ('ub_1', 'usr_ananya_sharma', 'bdg_diag', CURRENT_TIMESTAMP)`).run();
  db.prepare(`INSERT INTO user_badges (id, user_id, badge_id, unlocked_at) VALUES ('ub_2', 'usr_ananya_sharma', 'bdg_streak', CURRENT_TIMESTAMP)`).run();

  // 12. MISSIONS
  const missions = [
    {
      id: 'msn_sampling_des',
      name: 'Master Sampling Design',
      description: 'Complete the prerequisite chain: Probability Fundamentals → Probability Sampling → Stratified & Cluster Sampling → Final Assessment.',
      competency_id: 'comp_sampling',
      xp_reward: 500,
      badge_reward_id: 'bdg_sampling',
      target_type: 'COMPLETE_COURSE',
      target_value: 'crs_nssta_sampling'
    },
    {
      id: 'msn_missing_val',
      name: 'Master Missing Value Treatment',
      description: 'Study Chapter 4 of MoSPI Data Quality Manual (Page 27), pass the AI-generated assessment, and boost Missing Value Treatment mastery above 70%.',
      competency_id: 'comp_missing_val',
      xp_reward: 150,
      badge_reward_id: 'bdg_data_qual',
      target_type: 'PASS_QUIZ',
      target_value: 'comp_missing_val'
    }
  ];

  const insertMission = db.prepare(`
    INSERT INTO missions (id, name, description, competency_id, xp_reward, badge_reward_id, target_type, target_value)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  missions.forEach(m => insertMission.run(m.id, m.name, m.description, m.competency_id, m.xp_reward, m.badge_reward_id, m.target_type, m.target_value));

  db.prepare(`INSERT INTO mission_progress (id, user_id, mission_id, progress, status) VALUES ('mp_1', 'usr_ananya_sharma', 'msn_missing_val', 25, 'IN_PROGRESS')`).run();
  db.prepare(`INSERT INTO mission_progress (id, user_id, mission_id, progress, status) VALUES ('mp_2', 'usr_ananya_sharma', 'msn_sampling_des', 40, 'IN_PROGRESS')`).run();

  console.log('Seed with all 7 badges and multi-step missions completed successfully!');
}

if (process.argv[1].endsWith('seed.js')) {
  seedDatabase();
}
