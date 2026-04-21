# TOEFL Speaking Trainer — Research Summary

**Compiled:** 2026-04-20
**Researcher:** Claude (AI Research Agent)
**Project:** TOEFL Speaking adaptation for smart-interview app

---

## Research Completed

All 10 research targets have been researched and documented in `docs/toefl/`. Below is a consolidated summary of findings, ready for the brainstorming and design phase.

---

## Target 1: TOEFL Task Structures

**Key finding:** The TOEFL iBT was significantly revamped in July 2023 and the scoring scale changed in January 2026.

- **Old format:** 4 tasks (1 independent + 3 integrated) in ~16 minutes
- **New format:** 11 tasks (Listen and Repeat, Take an Interview) in ~8 minutes
- **New scoring:** 1–6 CEFR-aligned scale (with 2-year transition period for 0–30 scale)
- **Task types:** Independent opinion, integrated reading/listening/speaking (campus and academic), and new interview-style tasks

**For the app:** The app should support the current (2023+) task format while also offering practice for the classic 4-task format (widely used in third-party prep materials). This gives maximum utility for learners who encounter either format.

**Files:** `docs/toefl/tasks/tasks-and-structure.md`

---

## Target 2: ETS Scoring Rubrics

**Key finding:** Three core dimensions with machine-actionable signals.

| Dimension | What it measures | Key signals |
|-----------|-----------------|-------------|
| Delivery | Speech clarity | WPM (130–150 optimal), pause frequency, filler count, audio energy |
| Language Use | Grammar + vocabulary | Error rate, vocabulary diversity, sentence complexity |
| Topic Development | Content quality | Word count vs. time, prompt coverage, specific detail count |

**Scoring levels:** 0–4 raw → converted to scaled score (0–30 or 1–6)

**For the app:** The scoring engine should measure all three dimensions per attempt. Delivery and Language Use are largely automated via audio analysis + transcription. Topic Development requires AI evaluation of transcript vs. prompt.

**Files:** `docs/toefl/rubrics/scoring-rubrics.md`

---

## Target 3: Common Speech Errors

**Key finding:** Five error categories organized by detectability.

| Category | Type | Detection method |
|----------|------|-----------------|
| A | Acoustic/Delivery | Audio analysis (already built in existing app) |
| B | Lexical/Vocabulary | Transcription |
| C | Grammatical | Transcription + NLP |
| D | Discourse-level | Transcript analysis |
| E | Task-fulfillment | Prompt matching |

**Top coaching priorities:**
1. Response too short / vague content (biggest single score killer)
2. Missing integrated source details (critical for integrated tasks)
3. Excessive fillers / long pauses (most common delivery issue)
4. Grammatical errors (common and fixable)
5. Off-topic answers (often reading/listening comprehension issue)

**Files:** `docs/toefl/samples/common-errors.md`

---

## Target 4: Sample Responses & Benchmark Library

**Key finding:** The app needs a library of annotated responses at each score level, with scorer commentary and audio.

- Minimum: 4 samples per task type × 4 task types = ~16 audio samples
- Each sample needs: audio, transcript, scorer commentary, dimension breakdown, annotation layer
- Samples serve: learner calibration, AI few-shot evaluation prompts, comparison feature

**Architecture note:** Using AI-generated responses calibrated to score descriptors is legally cleaner than using official ETS recordings. This also allows unlimited sample generation and customization per task type.

**Files:** `docs/toefl/samples/benchmark-responses.md`

---

## Target 5: Workflow Options

**Key finding:** Four workflow models analyzed; Hybrid (Workflow D) is recommended.

| Workflow | Best for | Implementation |
|----------|---------|----------------|
| Simulation | Advanced learners, final prep | Low complexity |
| Guided | Beginners, skill building | Medium complexity |
| Modular | Systematic skill building | High complexity |
| Hybrid | All learner types | High complexity |

**Recommended approach:** Start with Guided (Phase 1) → Add Simulation toggle (Phase 2) → Add adaptive transition logic (Phase 3).

**Files:** `docs/toefl/workflows/product-workflows.md`

---

## Target 6: Practice-Feedback-Iterate Loop

**Key finding:** Three granularity levels for retry — full retake, targeted retry, sentence-level retry.

| Level | Time | Best for |
|-------|------|---------|
| Full retake | ~45–60s | Pressure simulation, overall improvement |
| Targeted retry | ~15–30s | Focused skill practice |
| Sentence retry | ~5–10s | Fine-tuning, advanced learners |

**Improvement detection:** Compare overall score, dimension deltas, WPM, filler count, and grammar error rate between attempts.

**Session structure:** Warm-up (sentence retry) → Main practice (2–3 full attempts) → Targeted drill (weakest dimension) → Reflection. ~23 min total.

**Files:** `docs/toefl/workflows/retry-loop-design.md`

---

## Target 7: Scaffolding Tools

**Key finding:** Scaffolding should be configurable from none (simulation) to heavy (first encounter), with a fade-out principle.

**Tools identified:**
- Quick response templates (Independent tasks)
- Outline frames (Integrated tasks)
- Keyword board (prep-time memory aid)
- Mind-map prompts (brainstorming)
- Note-taking helpers (integrated tasks)
- Time-management cues (prep phase)
- Source-detail capture prompts (integrated tasks)

**Warning:** Scaffolding becomes a crutch if over-used. Mitigation: fade out scaffolding as scores improve, vary template styles, keep prep time tight, add reflection prompts.

**Files:** `docs/toefl/scaffolding/scaffolding-tools.md`

---

## Target 8: User Profile Metrics

**Key finding:** Profile tracks far more than scores — speaking behavior, error patterns, progress milestones.

**Core metrics:**
- Score trends per dimension (last 20 attempts)
- Speaking behavior: WPM, filler rate, pause rate, response length
- Error pattern tracking: most frequent error types over time
- Weakness identification: weakest dimension, weakest task type
- Practice engagement: sessions, minutes, streak, consistency

**Summary displays:** Score trend chart, radar chart (dimensions), weakness summary, pronunciation/pacing pattern, task-type performance, progress milestones, streak/consistency.

**For instructors:** Class overview, student detail, assignment features.

**Files:** `docs/toefl/metrics/user-profile-metrics.md`

---

## Target 9: Cross-Exam Extensibility

**Key finding:** TOEFL-first architecture with exam-specific layers on top of shared core.

**Architecture layers:**
- **Shared core:** Audio analysis, transcription, grammar/vocabulary analysis (fully reusable)
- **Scoring configuration:** Exam-specific rubric definitions and weight distributions
- **Exam-specific:** Prompt library, timer configs, score conversion

**IELTS differences:** Human examiner, face-to-face, different task types (Part 1/2/3)
**PTE differences:** Fully AI-scored, different task types (read-aloud, retell lecture, describe image)
**General speaking:** Simplified rubric, no exam scoring

**Files:** `docs/toefl/portability/cross-exam-portability.md`

---

## Target 10: UI/UX Best Practices

**Key finding:** Speech feedback requires three linked layers — audio (waveform), transcript (annotated), metadata (scores/errors).

**Key design decisions:**
- Three feedback modes: Summary First (beginners), Analysis Dashboard (intermediate), Light-Touch (advanced/simulation)
- Annotated transcript with color-coded errors and strong points
- Score breakdown card with visual bars
- Audio waveform with pacing indicators and pause/filler heatmap
- Side-by-side attempt comparison for retry review
- Mobile-first responsive layout
- Motivational feedback tone: specific, actionable, encouraging

**Files:** `docs/toefl/ux/speech-feedback-ux.md`

---

## Deliverable Index

```
docs/toefl/
├── README.md                          ← This summary
├── tasks/
│   └── tasks-and-structure.md         ← Target 1
├── rubrics/
│   └── scoring-rubrics.md             ← Target 2
├── samples/
│   ├── common-errors.md               ← Target 3
│   └── benchmark-responses.md         ← Target 4
├── workflows/
│   ├── product-workflows.md           ← Target 5
│   └── retry-loop-design.md           ← Target 6
├── scaffolding/
│   └── scaffolding-tools.md           ← Target 7
├── metrics/
│   └── user-profile-metrics.md        ← Target 8
├── portability/
│   └── cross-exam-portability.md      ← Target 9
└── ux/
    └── speech-feedback-ux.md          ← Target 10
```

---

## Key Decisions Made During Research

1. **Scoring scale:** Use the 1–6 scale (CEFR-aligned, 2026+ standard) as primary; show 0–30 conversion for backward compatibility
2. **Task support:** Support both the new 11-task format and the classic 4-task format for maximum utility
3. **Workflow:** Hybrid (Guided → Simulation transition) with phased implementation
4. **Retry granularity:** All three levels (full, targeted, sentence) — user choice
5. **Scaffolding:** Default on for beginners, fade out as scores improve, always off in simulation mode
6. **Architecture:** Shared core engine + exam-specific config layer + prompt library
7. **Benchmark library:** AI-generated samples calibrated to score descriptors (avoid copyright issues)

---

## Open Questions Remaining

1. Confirm exact task breakdown for the new 11-task Speaking format (need more ETS detail)
2. Find official ETS speaking rubric PDF for current format (2023+)
3. Confirm AI e-Rater (ERS) scoring approach for app's scoring engine alignment
4. Decide on audio retention policy (how long to keep recordings)
5. Confirm whether instructor dashboard is in scope for initial release

---

## Next Steps

1. **Brainstorming session:** Review this research package and confirm design direction before writing specs
2. **Design phase:** Use `brainstorming` skill to create TOEFL Speaking trainer design document
3. **Database schema design:** Plan new tables for TOEFL tasks, attempts, scores, learner profiles
4. **API design:** Plan new routes for question generation, scoring, and attempt management
5. **MVP scope definition:** Decide which features are in-scope for Phase 1 vs. Phase 2+