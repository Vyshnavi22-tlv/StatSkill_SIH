# StatSkill AI

### AI-Powered Competency Intelligence & Gamified Learning Platform for India's Official Statistical System

> **Diagnose → Explain → Learn → Assess → Verify → Level Up**

StatSkill AI is an individual-level competency intelligence platform for officials in India's Official Statistical System.

It works alongside **iGOT Karmayogi** and **NSSTA/TPAC** to identify what an individual official actually knows, discover prerequisite-level competency gaps, recommend personalized learning, generate verified assessments, and measure whether learning actually improved competency.

The platform combines:

* Competency Intelligence
* Prerequisite-based Competency Graph
* Explainable Mastery Scoring
* AI Assessment Generation
* Source-Level Answer Backtrace
* Personalized Learning Paths
* Gamified Learning
* Badges, XP, Levels & Missions
* Learner & Admin Analytics

---

## Core Experience

```text
                    OFFICIAL
                       |
                       v
                 ROLE PROFILE
                       |
                       v
                  DIAGNOSTIC
                       |
                       v
              COMPETENCY GRAPH
                       |
                       v
                  ROOT GAP
                       |
                       v
                 EXPLANATION
                       |
                       v
             PERSONALIZED PATH
                  /        \
                 v          v
               iGOT       NSSTA
                  \        /
                   v      v
                    LEARNING
                       |
                       v
                 AI ASSESSMENT
                       |
                       v
                 SOURCE TRACE
                       |
                       v
                 MASTERY UPDATE
                       |
                       v
                XP / BADGE / LEVEL
                       |
                       v
                  REASSESSMENT
                       |
                       +----------> CONTINUOUS LOOP
```

---

## Gamified Learning

StatSkill AI turns competency development into a structured progression system.

### XP

Officials earn XP for meaningful learning activity:

| Activity                    |      XP |
| --------------------------- | ------: |
| Complete diagnostic         |     +50 |
| Complete learning module    |    +100 |
| Pass assessment             |    +150 |
| Master a competency         |    +250 |
| Complete prerequisite chain |    +300 |
| Complete practical task     |    +200 |
| Maintain learning streak    | +25/day |

XP should reward **learning outcomes**, not meaningless clicks.

### Levels

```text
Level 1   Explorer
Level 2   Learner
Level 3   Practitioner
Level 4   Specialist
Level 5   Advanced Practitioner
Level 6   Statistical Expert
```

### Competency Badges

Examples:

* Sampling Foundations
* Data Quality Guardian
* Price Statistics Specialist
* Statistical Computing
* Digital Governance
* Survey Methodology
* Competency Master

### Learning Streak

Encourage consistent learning without penalizing slower learners.

```text
7 Day Streak

███████░░░

Next reward:
+100 XP
```

### Competency Missions

Instead of simply showing a course list:

```text
MISSION: Master Sampling Design

[Completed] Probability Fundamentals
[Completed] Sampling Basics
[ ] Stratified Sampling
[ ] Cluster Sampling
[ ] Final Assessment

Reward:
500 XP
Sampling Specialist Badge
```

---

## Competency Skill Tree

The central UI is a visual competency graph.

```text
                 OFFICIAL STATISTICS
                         |
          +--------------+--------------+
          |              |              |
          v              v              v
     Survey Methods  Price Stats   Data Quality
          |              |              |
          v              v              v
      Sampling          CPI       Data Validation
          |                             |
          v                             v
    Probability                  Missing Values
       42%                           35%
       |                              |
       v                              v
    Sampling                    Root Competency
       58%
       |
       v
  Survey Design
       67%
```

A weak prerequisite can automatically place downstream competencies **At Risk**.

The graph is the primary differentiator of StatSkill AI.

---

## Explainable Mastery

StatSkill does **not** allow an LLM to arbitrarily decide an official's competency score.

The LLM handles language tasks such as:

* Question generation
* Explanation
* Concept extraction
* Content understanding

A deterministic evidence model calculates mastery using:

* Assessment performance
* Question difficulty
* Competency weights
* Recency
* Evidence quantity
* Prerequisite relationships

Example:

```text
DATA QUALITY

Mastery       43%
Confidence    HIGH

Evidence
----------------
Diagnostic      4 / 10
Quiz            3 / 8
Practical       62%
Training        Completed

Root Cause
----------------
Missing Value Treatment
```

This keeps competency decisions explainable and auditable.

---

## AI Assessment Pipeline

```text
Upload PDF / Document
          |
          v
     Text Extraction
          |
          v
       Chunking
          |
          v
   Concept Extraction
          |
          v
 Competency Mapping
          |
          v
    MCQ Generation
          |
          v
   Critic / Validator
          |
          v
 Difficulty + Bloom Level
          |
          v
      Save Question
          |
          v
      Assessment
```

Each generated question is associated with:

```text
Question
 |
 +-- Competency
 +-- Difficulty
 +-- Bloom Level
 +-- Source Document
 +-- Page / Timestamp
 +-- Source Chunk
```

This enables reliable source backtrace instead of asking an LLM to guess the source later.

---

## Answer Backtrace

When an official answers incorrectly:

```text
Incorrect

Your answer:
Mean imputation

Correct:
Hot-deck imputation

Review this concept:

Data_Quality_Manual.pdf
Page 27
Section: Missing Value Treatment
```

The source location is stored when the question is generated.

---

## Personalized Recommendations

Recommendations are generated from:

```text
Role
  +
Required Competencies
  +
Current Mastery
  +
Prerequisite Graph
  +
Learning History
  +
Available Content
```

Example:

> **Recommended:** NSSTA — Advanced Survey Methodology
> **Why:** Advanced Sampling is required for the role, current mastery is 48%, and Probability Sampling is already satisfied at 76%.

The recommendation engine can orchestrate learning content from iGOT and NSSTA/TPAC.

---

# Architecture

```text
+-------------------------------------------------------------+
|                         FRONTEND                            |
|                  React + TypeScript                        |
|                                                             |
| Dashboard | Skill Tree | Missions | Quiz | Profile | Admin |
+-------------------------------+-----------------------------+
                                |
                             REST API
                                |
                                v
+-------------------------------------------------------------+
|                         BACKEND                             |
|                         FastAPI                             |
|                                                             |
| Auth | Profile | Competency | Diagnostic | Assessment      |
| Recommendation | Gamification | Analytics | Integration    |
+---------------+---------------+---------------+-------------+
                |               |               |
                v               v               v
          PostgreSQL         pgvector          LLM API
                |               |               |
                |               |          Generation
                |               |          Explanation
                |               |          Critic
                |               |
                v               v
         Competency Graph       RAG
         Evidence Model        Retrieval
                |
                v
+-------------------------------------------------------------+
|                 GOVERNMENT ECOSYSTEM                        |
|                                                             |
|             iGOT Karmayogi | NSSTA / TPAC                  |
|                    API Adapter Layer                        |
+-------------------------------------------------------------+
```

---

# Tech Stack

| Layer               | Technology                            |
| ------------------- | ------------------------------------- |
| Frontend            | React + TypeScript                    |
| UI                  | Tailwind CSS                          |
| Graph Visualization | React Flow                            |
| Charts              | Recharts                              |
| Animations          | Framer Motion                         |
| Backend             | FastAPI + Python                      |
| Database            | PostgreSQL                            |
| Vector Search       | pgvector                              |
| ORM                 | SQLAlchemy                            |
| Authentication      | JWT / SSO-ready adapter               |
| AI                  | LLM API                               |
| RAG                 | Embeddings + pgvector                 |
| Document Processing | PDF/Text extraction                   |
| Graph Logic         | PostgreSQL adjacency model / NetworkX |
| API Documentation   | OpenAPI / Swagger                     |
| Deployment          | Docker                                |

The recommended architecture intentionally avoids unnecessary infrastructure during the hackathon; PostgreSQL can handle structured evidence and the competency graph, while pgvector keeps retrieval in the same database.

---

# Project Structure

```text
statskill-ai/
|
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── features/
│   │   │   ├── competency/
│   │   │   ├── diagnostics/
│   │   │   ├── assessments/
│   │   │   ├── learning/
│   │   │   ├── gamification/
│   │   │   └── analytics/
│   │   ├── services/
│   │   └── hooks/
│   └── package.json
│
├── backend/
│   ├── app/
│   │   ├── api/
│   │   ├── models/
│   │   ├── schemas/
│   │   ├── services/
│   │   │   ├── competency/
│   │   │   ├── mastery/
│   │   │   ├── assessment/
│   │   │   ├── recommendation/
│   │   │   ├── gamification/
│   │   │   └── rag/
│   │   ├── integrations/
│   │   │   ├── igot/
│   │   │   └── nssta/
│   │   └── main.py
│   └── requirements.txt
│
├── database/
│   ├── migrations/
│   └── seed/
│
├── docs/
│   ├── spec.md
│   └── architecture.md
│
├── assets/
│   ├── logo/
│   ├── icons/
│   └── screenshots/
│
├── docker-compose.yml
└── README.md
```

---

# Visual Identity

Use a modern **GovTech + EdTech + Game** visual language.

### Logo Concept

```text
       STATSKILL
          AI
```

Suggested visual elements:

* Statistical graph
* Competency nodes
* Target / mastery
* Achievement
* Progress

### Ecosystem Logos

Keep official ecosystem logos visually separate from the StatSkill brand:

```text
STATSKILL AI
     |
     +-- iGOT Karmayogi
     |
     +-- NSSTA / TPAC
```

Only use official logos/assets where permitted.

---

# User Roles

### Official / Learner

* View competency profile
* Take diagnostics
* Follow learning missions
* Complete assessments
* Earn XP
* Unlock badges
* Track mastery
* View source explanations
* View personalized recommendations

### Trainer / Mentor

* View assigned learners
* Review competency gaps
* Assign interventions
* Review assessment quality
* Monitor improvement

### Administrator

* Organization competency distribution
* Training effectiveness
* Department-level gaps
* Predictive capacity-building insights
* Aggregate analytics

---

# Design Principles

1. **LLM for language, deterministic model for decisions**
2. **Evidence before confidence**
3. **Prerequisites before symptoms**
4. **Explain every recommendation**
5. **Store source provenance**
6. **Gamify progress, not scores**
7. **Never use diagnostic mastery as an automatic HR decision**
8. **Privacy-first individual competency data**
9. **API-first integration**
10. **Build for iGOT/NSSTA interoperability**

---

# MVP

The hackathon MVP focuses on five core capabilities:

1. Statistical Competency Graph
2. Explainable Mastery Model
3. Recommendation Engine
4. Verified MCQ Generator
5. Assessment-to-Source Backtrace

The complete demonstration should show one official progressing through the entire loop:

**Role → Diagnostic → Root Gap → Recommendation → Learning → Assessment → Backtrace → Updated Mastery → XP/Badge**

---

# Project Positioning

> **StatSkill doesn't just recommend learning — it measures individual competency, explains the root-cause gap, prescribes the right iGOT/NSSTA learning, and verifies that the gap was actually closed.**

StatSkill AI is designed as a **companion intelligence and verification layer**, not a replacement for iGOT Karmayogi or NSSTA.

---

# Problem Statement

**Smart India Hackathon 2026 — Problem Statement 26101**

**Ministry:** MoSPI
**Division:** Data Informatics & Innovation Division (DIID)

---

# Status

**Hackathon MVP — In Development**

Built for demonstration and validation. Production deployment would require formal integration, security, governance, validation, and ecosystem approval.
