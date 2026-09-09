# StatSkill AI — Technical Specification

**Version:** 1.0
**Status:** Hackathon MVP
**Problem Statement:** SIH 2026 — 26101
**Domain:** Official Statistics / Government Capacity Building

---

# 1. Product Definition

StatSkill AI is an individual-level competency intelligence and gamified learning platform for India's Official Statistical System.

The system shall:

1. Build an individual competency profile.
2. Map the individual's role to required competencies.
3. Diagnose competency levels.
4. Identify prerequisite/root-cause gaps.
5. Recommend personalized learning.
6. Generate competency-linked assessments from learning material.
7. Validate generated questions.
8. Provide evidence-backed explanations.
9. Backtrace incorrect answers to source material.
10. Recalculate competency mastery.
11. Reward learning progression through gamification.
12. Provide learner and administrator analytics.

---

# 2. Product Philosophy

```text
                 LANGUAGE INTELLIGENCE
                         |
                         v
                       LLM
                         |
          +--------------+--------------+
          |              |              |
          v              v              v
       Generate       Explain         Retrieve
          |
          v
                 DECISION INTELLIGENCE
                         |
                         v
              Explicit Evidence Model
                         |
          +--------------+--------------+
          |              |              |
          v              v              v
       Mastery       Gap Analysis   Recommendation
```

The LLM must not be the final authority for competency scores.

---

# 3. Core User Flow

```text
LOGIN
  |
  v
ROLE / PROFILE
  |
  v
REQUIRED COMPETENCIES
  |
  v
DIAGNOSTIC
  |
  v
MASTERY MODEL
  |
  v
COMPETENCY GRAPH
  |
  v
ROOT-CAUSE GAP
  |
  v
PERSONALIZED RECOMMENDATION
  |
  v
LEARNING
  |
  v
ASSESSMENT
  |
  v
SOURCE BACKTRACE
  |
  v
MASTERY UPDATE
  |
  v
XP / BADGE / LEVEL
  |
  v
REASSESSMENT
```

---

# 4. Roles

## 4.1 Learner

Permissions:

```text
profile.read
diagnostic.attempt
assessment.attempt
competency.read.self
recommendation.read.self
learning.access
gamification.read.self
```

---

## 4.2 Trainer

Permissions:

```text
learner.read.assigned
assessment.review
recommendation.assign
competency.read.assigned
analytics.read.assigned
```

---

## 4.3 Administrator

Permissions:

```text
organization.read
analytics.read
competency.manage
content.manage
role.manage
assessment.manage
```

---

# 5. Competency Model

Every competency is represented as a graph node.

```text
Competency
------------
id
code
name
description
domain
required_level
role_weight
parent_id
status
```

### Domains

```text
STATISTICAL
TECHNICAL
DIGITAL_GOVERNANCE
BEHAVIOURAL_MANAGERIAL
```

---

# 6. Competency Graph

Competencies support directed prerequisite relationships.

Example:

```text
Probability Fundamentals
          |
          v
Probability Sampling
          |
          v
Sampling Design
          |
          v
Survey Methodology
```

Graph relationship:

```text
source_competency
        |
        v
relationship
        |
        v
target_competency
```

Relationship model:

```text
CompetencyEdge
--------------
id
source_id
target_id
relationship_type
weight
```

Supported relationship:

```text
PREREQUISITE
```

---

# 7. Initial Competency Taxonomy

## Statistical

```text
Official Statistics
|
+-- Survey Methodology
|   |
|   +-- Sampling
|   |   |
|   |   +-- Probability Sampling
|   |   +-- Stratified Sampling
|   |   +-- Cluster Sampling
|   |
|   +-- Questionnaire Design
|
+-- National Accounts
|   |
|   +-- GDP
|   +-- GVA
|   +-- SNA
|
+-- Price Statistics
|   |
|   +-- CPI
|   +-- WPI
|   +-- Index Numbers
|
+-- Labour Statistics
+-- Agricultural Statistics
+-- Data Quality
|   |
|   +-- Validation
|   +-- Missing Values
|   +-- Outlier Detection
|
+-- SDG Indicators
```

This domain-specific ontology is the foundation of the differentiating competency graph.

---

# 8. Learner Profile

```text
User
----
id
name
email
department
designation
role_id
experience
qualification
preferred_language
avatar
xp
level
streak
```

---

# 9. Role Requirements

```text
Role
----
id
name
department
description
```

```text
RoleCompetency
--------------
role_id
competency_id
required_level
role_weight
```

Example:

```text
Assistant Director — Price Statistics

Index Number Theory       80%
Sampling                  70%
Data Quality              75%
Statistical Computing     65%
Data Visualization       50%
```

---

# 10. Mastery Model

The MVP uses a transparent weighted-evidence model.

Conceptually:

```text
Mastery =
    Diagnostic Evidence
  + Assessment Evidence
  + Practical Evidence
  + Recency
  + Question Difficulty
  + Prerequisite Status
```

Implementation should normalize the final value to:

```text
0 — 100
```

---

# 11. Confidence

Mastery and confidence must remain separate.

```text
Mastery: 82%
Confidence: LOW
Evidence Count: 2
```

is valid.

Confidence should increase as evidence becomes:

* More numerous
* More recent
* More consistent
* More diverse

Example:

```text
Evidence Count < 3       → LOW
Evidence Count 3–7       → MEDIUM
Evidence Count > 7       → HIGH
```

These thresholds are MVP defaults and should remain configurable.

---

# 12. Evidence Model

```text
Evidence
--------
id
user_id
competency_id
assessment_id
question_id
evidence_type
score
weight
created_at
```

Possible evidence types:

```text
DIAGNOSTIC
QUIZ
PRACTICAL
COURSE_COMPLETION
REASSESSMENT
```

Every mastery update should be explainable through its evidence.

---

# 13. Diagnostic Engine

A diagnostic contains:

```text
10–15 questions
```

Each question must contain:

```text
competency_id
difficulty
weight
```

The diagnostic produces:

```text
competency
mastery
confidence
evidence_count
root_gap
```

---

# 14. Root-Cause Gap Detection

Given:

```text
Probability = 42%
Sampling = 58%
Survey Design = 67%
```

and:

```text
Probability → Sampling → Survey Design
```

the system should identify:

```text
ROOT GAP = Probability
```

rather than recommending Survey Design directly.

Algorithm:

```text
1. Find competencies below required level.
2. Traverse prerequisite edges backward.
3. Find lowest-level/root prerequisite gap.
4. Calculate downstream impact.
5. Prioritize root gap.
```

---

# 15. Recommendation Engine

Input:

```text
user
role
required_competencies
mastery
competency_graph
learning_history
course_catalog
```

Output:

```text
recommendation
reason
priority
source
prerequisite_status
expected_outcome
```

Example:

```json
{
  "course": "Advanced Survey Methodology",
  "provider": "NSSTA",
  "reason": [
    "Role requires Advanced Sampling",
    "Current mastery is 48%",
    "Probability Sampling prerequisite is 76%",
    "Course has not been completed"
  ],
  "priority": "HIGH"
}
```

---

# 16. Course Integration

Use an abstraction layer:

```text
CourseProvider
|
+-- iGOTProvider
|
+-- NSSTAProvider
```

Interface:

```text
searchCourses()
getCourse()
getCoursesForCompetency()
getCourseProgress()
```

During the hackathon:

```text
StatSkill
    |
    v
Provider Adapter
    |
    v
Mock iGOT / NSSTA API
```

Production integration can replace the adapter implementation.

The source documentation explicitly recommends this mock-first integration strategy because production iGOT credentials are ecosystem-controlled.

---

# 17. Document Ingestion

Supported MVP input:

```text
PDF
TXT
DOCX
```

Pipeline:

```text
DOCUMENT
   |
   v
TEXT EXTRACTION
   |
   v
PAGE DETECTION
   |
   v
CHUNKING
   |
   v
EMBEDDING
   |
   v
VECTOR STORAGE
```

Every chunk must retain:

```text
document_id
page_number
chunk_id
text
embedding
```

---

# 18. AI Question Generation

Input:

```text
source_chunk
competency
difficulty
question_type
```

Output:

```text
question
options
correct_answer
explanation
competency
difficulty
bloom_level
source_chunk
```

---

# 19. Question Critic

Every generated question should pass through validation.

Checks:

```text
Source grounding
Correct answer support
Single correct answer
No ambiguity
Appropriate difficulty
Competency alignment
No unsupported claims
```

If validation fails:

```text
GENERATED
   |
   v
CRITIC
   |
   v
REJECTED
```

Otherwise:

```text
GENERATED
   |
   v
CRITIC
   |
   v
APPROVED
```

Low-confidence questions should not automatically enter the learner assessment.

---

# 20. Question Data Model

```text
Question
--------
id
question_text
question_type
options
correct_answer
explanation
competency_id
difficulty
bloom_level
source_document_id
source_page
source_chunk_id
critic_score
status
created_at
```

---

# 21. Source Backtrace

The system must store the relationship:

```text
Document
   |
   v
Page
   |
   v
Chunk
   |
   v
Concept
   |
   v
Competency
   |
   v
Question
```

When an answer is incorrect:

```text
Answer
 |
 v
Question
 |
 v
Source Chunk
 |
 v
Document + Page
```

The source location must be retrieved from stored metadata, not generated at answer time.

---

# 22. Gamification Engine

Gamification is an engagement layer over competency progression.

## XP Events

```text
DIAGNOSTIC_COMPLETED
LESSON_COMPLETED
QUIZ_COMPLETED
QUIZ_PASSED
COMPETENCY_MASTERED
MISSION_COMPLETED
PRACTICAL_COMPLETED
STREAK_MILESTONE
```

```text
XPEvent
-------
id
user_id
event_type
xp
reference_id
created_at
```

---

# 23. Levels

Example:

```text
0 XP       → Explorer
500 XP     → Learner
1500 XP    → Practitioner
3000 XP    → Specialist
5000 XP    → Advanced Practitioner
8000 XP    → Statistical Expert
```

The exact thresholds must be configurable.

---

# 24. Badges

```text
Badge
-----
id
name
description
icon
criteria
```

Examples:

```text
Sampling Foundations
Data Quality Guardian
Survey Methodologist
Statistical Computing
Competency Master
Consistency Champion
```

Badges should represent meaningful milestones rather than simple activity counts.

---

# 25. Missions

A mission groups related competencies and learning actions.

```text
Mission
-------
id
name
description
competency_id
xp_reward
badge_reward
```

Example:

```text
MISSION
Master Sampling Design

[Completed] Probability Fundamentals
[Completed] Probability Sampling
[ ] Stratified Sampling
[ ] Cluster Sampling
[ ] Assessment

Reward
500 XP
Sampling Specialist
```

---

# 26. Streaks

The system may maintain:

```text
current_streak
longest_streak
last_activity_date
```

Streaks must reward consistency without affecting competency mastery.

Important:

```text
STREAK ≠ MASTERY
```

A user must never lose competency points simply because they did not log in.

---

# 27. Leaderboards

For the MVP, avoid public individual ranking.

Preferred:

```text
Personal Progress
Cohort Percentile
Anonymous Benchmark
```

Example:

> You are in the top 30% of your competency cohort.

This aligns with the privacy-sensitive nature of a government workforce.

---

# 28. Adaptive Learning

Adaptive logic:

```text
IF performance < threshold
    |
    v
reduce difficulty

IF performance > threshold
    |
    v
increase difficulty

IF mastery remains low after repeated interventions
    |
    v
move one prerequisite level down
    OR
recommend human trainer intervention
```

Learner speed must not directly reduce mastery.

---

# 29. Assessment Flow

```text
START ASSESSMENT
       |
       v
SELECT QUESTIONS
       |
       v
ANSWER
       |
       v
INSTANT FEEDBACK
       |
       v
SHOW EXPLANATION
       |
       v
IF WRONG
       |
       v
SOURCE BACKTRACE
       |
       v
UPDATE EVIDENCE
       |
       v
RECALCULATE MASTERY
       |
       v
AWARD XP
       |
       v
CHECK BADGES
```

---

# 30. Before / After Learning

Every targeted intervention should be measurable.

Example:

```text
                 BEFORE      AFTER

Missing Values     29%  ---->  74%
Data Quality       43%  ---->  61%
```

Admin analytics should use these changes to measure intervention effectiveness.

This moves the platform from course-completion tracking to learning-outcome tracking.

---

# 31. Learner Dashboard

The learner homepage should prioritize:

```text
+--------------------------------------------+
| Welcome, Ananya                            |
|                                            |
| LEVEL 4 — SPECIALIST       3,420 XP       |
|                                            |
| Progress                                   |
| ████████████████░░░░                       |
|                                            |
| 7 DAY STREAK                               |
+--------------------------------------------+
| TODAY'S MISSION                            |
|                                            |
| Master Missing Value Treatment             |
|                                            |
| ████████████░░░  75%                       |
|                                            |
| +150 XP                                    |
+--------------------------------------------+
| COMPETENCY MAP                             |
|                                            |
| Data Quality       61%                     |
| Sampling           48%                     |
| Statistical Comp.  76%                     |
+--------------------------------------------+
```

---

# 32. Admin Dashboard

Minimum widgets:

```text
Organization Mastery
Competency Distribution
Top Skill Gaps
Training Effectiveness
Department Comparison
Predictive Capacity Needs
Assessment Quality
```

Example:

```text
DATA QUALITY

Before Training       43%
After Training        68%

Improvement           +25%
```

---

# 33. AI Mentor

The MVP mentor is RAG-grounded.

Allowed:

```text
User Question
   |
   v
Uploaded Material
   |
   v
Retrieval
   |
   v
Answer
   |
   v
Page Citation
```

If the answer isn't present:

> "This topic is not covered in the selected learning material."

The mentor must not silently switch to unrestricted general-knowledge generation.

---

# 34. Frontend Pages

```text
/login

/dashboard

/profile

/competencies

/competencies/:id

/diagnostic

/assessment/:id

/results/:id

/learning

/missions

/badges

/mentor

/admin

/admin/analytics

/admin/competencies

/admin/interventions
```

---

# 35. Backend API

## Authentication

```http
POST /api/auth/login
GET  /api/auth/me
```

## Profile

```http
GET /api/profile
PUT /api/profile
```

## Competencies

```http
GET /api/competencies
GET /api/competencies/:id
GET /api/users/:id/competencies
GET /api/users/:id/competency-graph
```

## Diagnostics

```http
POST /api/diagnostics
GET  /api/diagnostics/:id
POST /api/diagnostics/:id/submit
```

## Assessments

```http
POST /api/assessments
GET  /api/assessments/:id
POST /api/assessments/:id/submit
```

## Recommendations

```http
GET /api/recommendations
GET /api/recommendations/:id
```

## Documents

```http
POST /api/documents/upload
GET  /api/documents/:id
POST /api/documents/:id/generate-questions
```

## Gamification

```http
GET /api/gamification/profile
GET /api/gamification/badges
GET /api/gamification/missions
POST /api/gamification/events
```

## Analytics

```http
GET /api/admin/analytics
GET /api/admin/intervention-effectiveness
GET /api/admin/predictive-needs
```

---

# 36. Database Tables

Minimum MVP schema:

```text
users
roles
user_roles
competencies
competency_edges
role_competencies

courses
course_competencies

diagnostics
diagnostic_questions
diagnostic_answers

assessments
questions
assessment_questions
answers

evidence
mastery_scores

documents
document_chunks

recommendations

xp_events
badges
user_badges
missions
mission_progress

audit_logs
```

---

# 37. Security Requirements

The system must implement:

```text
RBAC
JWT authentication
Input validation
API authorization
Audit logging
Secure file handling
Database access controls
```

Users must only access data permitted by their role.

---

# 38. Privacy Requirements

Individual competency information should not automatically appear in organization-wide dashboards.

Admin views should primarily use:

```text
Aggregated
Anonymized
Role-based
Department-level
```

HR/APAR integration is a future governance decision and must not be treated as an automatic consequence of mastery scores.

---

# 39. Auditability

Every mastery update should record:

```text
user
competency
old_score
new_score
evidence
assessment
timestamp
calculation_version
```

Example:

```text
Data Quality

43% → 61%

Reason:
Assessment #182
Question evidence: 6
Recent quiz performance: 78%
```

---

# 40. Integration Architecture

```text
                 StatSkill Core
                       |
              +--------+--------+
              |                 |
              v                 v
        iGOT Adapter       NSSTA Adapter
              |                 |
              v                 v
        iGOT API/Mock       NSSTA API/Mock
```

The recommendation engine should never directly depend on provider-specific API structures.

---

# 41. Non-Functional Requirements

## Performance

Target:

```text
Dashboard API       < 500ms
Graph load          < 1s
Recommendation      < 3s
Question generation asynchronous
```

These are engineering targets for the prototype, not measured results.

## Availability

The MVP should prioritize demo reliability over production-scale availability.

## Scalability

The architecture should allow:

```text
1 user
   |
   v
100 users
   |
   v
10,000+ users
```

without changing the core domain model.

---

# 42. MVP Scope

## MUST HAVE

```text
[ ] Authentication
[ ] Learner profile
[ ] Role mapping
[ ] Competency graph
[ ] Diagnostic
[ ] Mastery scoring
[ ] Root-gap detection
[ ] Recommendation engine
[ ] Mock iGOT API
[ ] Mock NSSTA API
[ ] PDF ingestion
[ ] MCQ generation
[ ] Question critic
[ ] Source backtrace
[ ] Assessment
[ ] Before/after mastery
[ ] XP
[ ] Levels
[ ] Badges
[ ] Missions
[ ] Learner dashboard
[ ] Admin dashboard
```

---

# 43. SHOULD HAVE

```text
[ ] RAG Mentor
[ ] Adaptive difficulty
[ ] Streaks
[ ] Cohort percentile
[ ] Practical assessment
[ ] Intervention effectiveness
[ ] Predictive admin analytics
```

---

# 44. FUTURE

```text
[ ] Production iGOT integration
[ ] Parichay SSO
[ ] Video timestamp question generation
[ ] Multilingual content
[ ] Offline-first mode
[ ] Competency Passport
[ ] Future Skill Radar
[ ] HR/APAR integration
[ ] Virtual Laboratory
[ ] Evidence-based work-artifact competency capture
```

The source documentation explicitly recommends keeping most of these as roadmap items rather than allowing them to consume the 36-hour MVP.

---

# 45. Demo Scenario

Use one fixed scenario:

```text
Employee:
Assistant Director

Domain:
Price Statistics
```

Required competencies:

```text
Index Number Theory
Sampling
Data Quality
Statistical Computing
Data Visualization
```

Diagnostic:

```text
Data Quality = 43%
Sampling = 48%
```

Graph:

```text
Probability
    |
    v
Sampling
    |
    v
Survey Design
```

Root cause:

```text
Probability Fundamentals
```

Recommendation:

```text
NSSTA Advanced Survey Methodology
```

Assessment:

```text
Upload:
Data_Quality_Manual.pdf
```

Question:

```text
Generated
→ Competency mapped
→ Critic validated
→ Source stored
```

Wrong answer:

```text
Page 27
Missing Value Treatment
```

Reassessment:

```text
Missing Value Handling
29% → 74%
```

Gamification:

```text
+250 XP
Data Quality Guardian Badge
Streak maintained
```

Final dashboard:

```text
DATA QUALITY

43% → 61%

LEVEL UP
```

---

# 46. Definition of Done

The MVP is considered complete when a judge can perform the following journey without manual developer intervention:

```text
1. Login
2. Select/view official profile
3. View required competencies
4. Start diagnostic
5. Receive mastery scores
6. Open competency graph
7. See prerequisite/root-gap cascade
8. Receive explainable recommendation
9. Open learning material
10. Generate assessment
11. See validated questions
12. Answer incorrectly
13. Navigate to exact source page
14. Complete remediation
15. Reassess
16. See mastery improvement
17. Earn XP
18. Unlock badge
19. See updated learner dashboard
20. See intervention effectiveness on admin dashboard
```

---

# 47. Golden Rule

> **Never build a feature just because it sounds AI-powered.**

Every AI feature must improve one of these:

```text
DIAGNOSE
EXPLAIN
RECOMMEND
ASSESS
VERIFY
ENGAGE
```

And every competency decision must have evidence behind it.

---

# 48. Product Mantra

```text
              DON'T JUST TEACH.

                 DIAGNOSE.
                    |
                    v
                 EXPLAIN.
                    |
                    v
                PERSONALIZE.
                    |
                    v
                  ASSESS.
                    |
                    v
                 VERIFY.
                    |
                    v
                CELEBRATE.
                    |
                    v
                LEVEL UP.
```

**StatSkill AI**

> *Measure skills. Close gaps. Prove growth.*
