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
3. Recommends personalized learning paths connected to **iGOT Karmayogi** and **NSSTA**.
4. Generates **Critic-Validated AI Assessments** grounded directly in official MoSPI manual chunks.
5. Provides **Source-Level Answer Backtrace** (instantly navigating incorrect answers to exact PDF page numbers, e.g., Page 27 of the Data Quality Manual).
6. Recalculates transparent **Evidence-Backed Mastery Scores** and measures real **Before vs. After Training Outcomes** (+28.7% average gain) on admin analytics.
7. Engages officers through structured **Gamification** (XP, Levels: Explorer → Statistical Expert, Badges, Missions, Streaks).

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
   - See **Level 3 Practitioner**, **1,650 XP**, **7-Day Streak**, and **61% Overall Mastery**.
   - Review **Today's Mission** (*Master Missing Value Treatment*).
   - View **Root Gap Alert**: *Missing Value Treatment (35%)* affecting *Data Quality (43%)*.
   - Review **Recommended Course**: *iGOT Karmayogi — Data Quality Assurance & Missing Value Imputation*.

2. **Official Statistics Competency Graph (`/graph`)**:
   - Interactive 2D Directed Acyclic Graph (DAG) using React Flow.
   - Inspect the **Prerequisite Cascades**:
     - $\text{Probability Fundamentals (42\% Root Gap)} \rightarrow \text{Probability Sampling (At Risk)} \rightarrow \text{Sampling (At Risk)} \rightarrow \text{Survey Methodology}$
     - $\text{Data Validation} \rightarrow \text{Missing Value Treatment (35\% Root Gap)} \rightarrow \text{Data Quality (43\% At Risk)}$
   - Click any node to open the **Detail Panel** showing: Current Mastery, Required Mastery, Confidence Tag, Evidence Count, Prerequisite Chain, and 1-Click Learning Interventions.

3. **Baseline Diagnostic (`/diagnostic`)**:
   - 5–10 baseline questions across sampling, price indices, computing, and data validation.
   - Submitting calculates instant evidence, highlights root causes, and awards baseline XP.

4. **Targeted Learning & Source Backtrace (`/learning`)**:
   - View **MoSPI Manual on Data Quality Assurance (Chapter 4, Page 27)**.
   - See **Question Critic Verification** (Critic Score: 0.95, Bloom: Application, Grounding: Verified).
   - Take the verified assessment.
   - On selecting an answer / wrong answer, click **"Source: Page 27"** to open the **Source-Level Backtrace Modal** citing the exact official regulatory excerpt.
   - See mastery recalculate in real-time ($35\% \rightarrow 74\%$), awarding $+150\text{ XP}$ and unlocking the **Data Quality Guardian Badge**.

5. **Gamification Hub (`/gamification`)**:
   - View Tier Ladder (*Explorer* $\rightarrow$ *Statistical Expert*), Badges shelf (*Diagnostic Explorer*, *Consistency Champion*, *Data Quality Guardian*), and the explainable XP ledger.

6. **Admin Workforce Analytics (`/admin`)**:
   - View organization-wide mastery across 128 officers.
   - Review the centerpiece **Before vs After Training Effectiveness** delta chart ($+25\%$ to $+39\%$ measurable competency lift).
   - Inspect the transparent **Competency Audit Log**.

---

## 🛠️ Architecture & Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, Vite, Tailwind CSS, `@xyflow/react` (React Flow), Lucide Icons, Canvas Confetti |
| **Backend API** | Node.js, Express REST API |
| **Database** | SQLite via `better-sqlite3` (WAL Mode, Foreign Key Enforcement) |
| **Intelligence Engines** | Mastery Engine (Weighted Evidence), Root-Gap Engine (Reverse DAG Traversal), AI Critic Assessment Engine, Gamification Engine |
| **Integration Adapters** | Mock iGOT Karmayogi & NSSTA Provider Adapters |

