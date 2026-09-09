# StatSkill AI — Official Statistics Competency Intelligence & Gamified Learning Platform

> **Problem Statement:** SIH 2026 — 26101  
> **Domain:** Official Statistics / MoSPI / National Statistical Office (NSO) / NSSTA  
> **Mantra:** *Diagnose → Explain → Learn → Assess → Verify → Level Up*

---

## 🏛️ Overview

**StatSkill AI** is an individual-level competency intelligence and gamified learning platform tailored specifically for India's Official Statistical System (**MoSPI**, **NSSTA**, **iGOT Karmayogi**).

Instead of tracking meaningless course completions, StatSkill AI:
1. Builds an individual **Official Statistics Competency Graph (DAG)** with prerequisite chaining.
2. Identifies **Root-Cause Competency Gaps** (e.g., *Probability Fundamentals* blocking *Sampling*, or *Missing Value Treatment* blocking *Data Quality*).
3. Recommends personalized learning paths connected to **iGOT Karmayogi** and **NSSTA** with clear *"Why this course?"* explanations.
4. Generates **Critic-Validated AI Assessments** grounded directly in official MoSPI manual chunks.
5. Provides **Metadata-Grounded Source-Level Backtrace** (instantly navigating incorrect answers to exact PDF page numbers, e.g., Page 27 of the Data Quality Manual).
6. Provides a **Scoped RAG AI Mentor** that answers strictly from authorized official manuals and refuses out-of-scope queries.
7. Recalculates transparent **Deterministic Evidence-Backed Mastery Scores** and measures real **Before vs. After Training Outcomes** (+28.7% average gain) on admin analytics.
8. Engages officers through structured **Gamification** (XP, 6-level ladder: Explorer → Statistical Expert, Badges, Missions, Streaks).

---

## 🚀 Quick Start (Local Run)

### 1. Requirements
- Node.js >= 18.0.0
- npm >= 9.0.0

### 2. Install & Seed
```bash
# Seed SQLite database with Official Statistics taxonomy & Ananya Sharma demo profile
npm run seed
```

### 3. Run Development Servers
```bash
# Start Backend API (Port 5000)
npm run server

# In a separate terminal, start Frontend Client (Port 3000)
npm run client
```

Open your browser at `http://localhost:3000`.

### 4. Run Test Suite
```bash
npm run test:server
```

---

## 🌟 Demo Walkthrough (Judges Journey)

1. **Learner Dashboard (`/`)**:
   - Meet **Ananya Sharma** (Assistant Director — Price Statistics).
   - See **Level 3 Practitioner**, **1,800 XP**, **5-Day Streak**, and **61% Overall Mastery**.
   - Review **Today's Mission** (*Master Missing Value Treatment*).
   - View **Root Gap Alert**: *Missing Value Treatment (35%)* affecting *Data Quality (43%)*.
   - Review **Recommended Course**: *iGOT Karmayogi — Data Quality Assurance & Missing Value Imputation* with transparent "Why this course?" box.

2. **Official Statistics Competency Graph (`/graph`)**:
   - Interactive 2D Directed Acyclic Graph (DAG) using `@xyflow/react`.
   - Inspect the **Prerequisite Cascades**:
     - $\text{Probability Fundamentals (42\% Root Gap)} \rightarrow \text{Probability Sampling (At Risk)} \rightarrow \text{Sampling (At Risk)} \rightarrow \text{Survey Methodology}$
     - $\text{Data Validation} \rightarrow \text{Missing Value Treatment (35\% Root Gap)} \rightarrow \text{Data Quality (43\% At Risk)}$
   - Click any node to open the **Detail Panel** showing: Current Mastery, Required Mastery, Confidence Tag, Evidence Count, Prerequisite Chain, and 1-Click Learning Interventions.

3. **Baseline Diagnostic (`/diagnostic`)**:
   - 13 role-mapped baseline questions across sampling, price indices, computing, and data validation.
   - Submitting calculates instant evidence, highlights root causes, and presents the explainable *"Why did I get this score?"* modal.

4. **Targeted Learning & Source Backtrace (`/learning`)**:
   - View **MoSPI Manual on Data Quality Assurance (Chapter 4, Page 27)**.
   - See **Question Critic Verification** (Critic Score: 0.95, Bloom: Application, Grounding: Verified).
   - Answer the verified assessment.
   - On incorrect answer, see the structured format:
     - **Incorrect Answer** & **Correct Answer**
     - **Review this concept**: Document: `Data_Quality_Manual.pdf`, Page: `27`, Section: `Missing Value Treatment`.
   - See mastery recalculate in real-time ($35\% \rightarrow 68\%$), awarding $+150\text{ XP}$ and unlocking the **Data Quality Guardian Badge**.

5. **Scoped RAG AI Mentor (`/mentor`)**:
   - Ask: *"What is mandatory for missing price observations?"* $\rightarrow$ Synthesizes grounded answer and cites **Data_Quality_Manual.pdf, Page 27, Section 4.2**.
   - Ask out-of-scope question (e.g. *"How to bake a cake?"*) $\rightarrow$ Refuses with: *"This topic is not covered in the selected learning material."*

6. **Gamification Hub (`/gamification`)**:
   - View Tier Ladder (*Explorer* $\rightarrow$ *Statistical Expert*), Badges shelf (7 official badges), active multi-step missions, and the explainable XP ledger.

7. **Admin Workforce Analytics (`/admin`)**:
   - View organization-wide competency distribution across 128 cadre officers.
   - Review **Department-level Mastery Heatmap** (Price, Survey, National Accounts, Field Operations).
   - Review **Before vs After Training Effectiveness** delta chart (**Data Quality: Before 43%, After 68%, Improvement: +25 percentage points**).
   - Review **Predictive Capacity-Building Indicators** (e.g., *"32% of Price Statistics officials are projected to remain below the Index Number Theory threshold at the current learning pace."*).

---

## 🛠️ Architecture & Implementation Status

| Feature | Status | Implementation Type |
|---|---|---|
| **Role & Profile Engine** | ✅ Complete | Live SQLite Backend |
| **Competency Graph (DAG)** | ✅ Complete | `@xyflow/react` Interactive 2D Graph |
| **Root-Gap Diagnosis Engine** | ✅ Complete | Reverse DAG Traversal (Deterministic) |
| **Explainable Mastery Score** | ✅ Complete | Weighted Evidence Formula ($0-100\%$) |
| **AI Assessment Pipeline** | ✅ Complete | 5-Step Pipeline + 6-Rule Question Critic |
| **Source Backtrace** | ✅ Complete | Stored Question Metadata Resolution |
| **Scoped RAG AI Mentor** | ✅ Complete | Lexical Chunk Retriever + Strict Refusal |
| **Gamification Engine** | ✅ Complete | XP Ledger, 6-Tier Ladder, Badges, Missions |
| **Admin Analytics Dashboard** | ✅ Complete | Distribution, Heatmap, Before/After Deltas |
| **iGOT / NSSTA Adapters** | 🔄 Clean Mock | Standardized REST Provider Interface |

---

## 🔒 Non-Hallucinatory Principles & Boundaries
- **Scoring**: Mastery scores are calculated strictly via mathematical weighted evidence formulas; LLMs are never permitted to score officers.
- **Backtrace**: Page numbers and section titles come from verified SQLite metadata, never guessed post-hoc.
- **Provider Adapters**: External government LMS systems (iGOT Karmayogi, NSSTA LMS) are integrated via clean mock adapter interfaces without faking live production endpoints.

