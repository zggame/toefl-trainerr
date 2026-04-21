# TOEFL Speaking Research — Task 9: Cross-Exam Extensibility Map (IELTS, PTE, General Speaking)

**Last updated:** 2026-04-20

---

## 1. Overview

The TOEFL-first architecture should identify what lives in a shared speech-evaluation core vs. what must remain exam-specific. This map guides implementation decisions that avoid hard-coding TOEFL assumptions into the core.

---

## 2. Exam Comparison Overview

| Aspect | TOEFL iBT Speaking | IELTS Speaking | PTE Academic Speaking |
|--------|-------------------|----------------|----------------------|
| Format | Computer-based | Face-to-face examiner | Computer-based |
| Tasks | 11 tasks (2023+): Listen & Repeat, Interview | 3 parts: Interview, Long turn, Discussion | 6–7 item types |
| Timing | ~8 min | 11–14 min | ~30 min total (speaking + other) |
| Scoring | 0–30 (old) or 1–6 (2026+) | 0–9 band scale | 0–90 scale |
| Rater | AI + human | Human examiner | AI (automated scoring) |
| Task types | Listen & repeat, read-aloud, summarize, opinion | Describe, speak at length, discuss | Read-aloud, repeat, describe, retell, answer |

### Key Takeaway:
- **IELTS Speaking** is human-rated face-to-face (no audio recording for grading — though recordings exist for appeals)
- **PTE Speaking** uses fully automated AI scoring (most similar to our app's approach)
- **TOEFL Speaking** uses AI + human hybrid scoring

---

## 3. Shared Core (Reusable Across Exams)

### 3.1 Audio Analysis Engine
| Component | TOEFL | IELTS | PTE | General |
|-----------|-------|-------|-----|---------|
| Silence detection | ✓ | ✓ | ✓ | ✓ |
| Audio energy analysis | ✓ | ✓ | ✓ | ✓ |
| WPM measurement | ✓ | ✓ | ✓ | ✓ |
| Pause detection | ✓ | ✓ | ✓ | ✓ |
| Filler counting | ✓ | ✓ | ✓ | ✓ |

**Conclusion:** Audio analysis is fully reusable across all speaking assessments.

### 3.2 Transcription Service
| Component | TOEFL | IELTS | PTE | General |
|-----------|-------|-------|-----|---------|
| Speech-to-text | ✓ | ✓ | ✓ | ✓ |
| Language detection | ✓ | ✓ | ✓ | ✓ |
| Speaker diarization | N/A | N/A | N/A | — |

**Conclusion:** Transcription is reusable — only the language model prompt differs by exam.

### 3.3 Grammar & Vocabulary Analysis
| Component | TOEFL | IELTS | PTE | General |
|-----------|-------|-------|-----|---------|
| Error detection | ✓ | ✓ | ✓ | ✓ |
| Vocabulary diversity | ✓ | ✓ | ✓ | ✓ |
| Academic vocabulary scoring | TOEFL-specific | IELTS-specific | PTE-specific | — |
| Error type classification | ✓ | ✓ | ✓ | ✓ |

**Conclusion:** Core analysis is shared; scoring prompts and weight differ per exam.

### 3.4 Speaking Behavior Metrics
| Metric | TOEFL | IELTS | PTE | General |
|--------|-------|-------|-----|---------|
| WPM targets | 130–150 | 130–160 | varies | exam-specific |
| Filler thresholds | >6/min = negative | >4/min = negative | varies | exam-specific |
| Response length targets | time-based | examiner judgment | item-based | — |

**Conclusion:** Metrics are shared; threshold targets are exam-specific.

---

## 4. Exam-Specific Layers

### 4.1 Prompt/Task Library
Each exam has its own prompt format, topic domain, and task structure:
```
TOEFL: Independent opinion, integrated campus, integrated academic
IELTS: Part 1 (intro), Part 2 (long turn), Part 3 (discussion)
PTE: Read-aloud, repeat sentence, describe image, retell lecture, answer short question
```

**Architecture:** Exam-specific prompt library with shared `TaskType` interface.

### 4.2 Scoring Rubric Engine
| Dimension | TOEFL | IELTS | PTE |
|-----------|-------|-------|-----|
| Delivery | ✓ | Fluency & coherence | Oral fluency |
| Language Use | ✓ | Lexical resource, grammar | Pronunciation |
| Topic Development | ✓ | — (IELTS uses coherence) | — |
| Content Relevance | ✓ | ✓ | ✓ |

**Architecture:** Shared scoring framework with exam-specific rubric definitions and weight distributions.

### 4.3 Timer & Prep Time Configuration
| Exam | Prep Time | Response Time |
|------|-----------|---------------|
| TOEFL (new) | ~15s | ~15–60s |
| IELTS Part 2 | 1 min prep | 1–2 min speaking |
| PTE Read-aloud | none | ~30–40s |

**Architecture:** Config-driven timing per exam type.

### 4.4 Score Conversion
| Exam | Raw Scale | Reported Scale |
|------|-----------|----------------|
| TOEFL | 0–4 | 0–30 or 1–6 |
| IELTS | 0–4 | 0–9 band |
| PTE | 0–4 | 0–90 |

**Architecture:** Shared scoring core outputs normalized score; conversion layer maps to exam-specific scale.

---

## 5. General Public Speaking / Language Learning Extension

Beyond exam-specific use, the app could support:

| Use Case | Shared with TOEFL | Exam-Specific |
|----------|-------------------|---------------|
| Job interview practice | Audio analysis, transcript | Prompt library |
| Presentation coaching | Pacing, filler tracking | Structure coaching |
| Daily conversation | WPM, fluency | Topic generator |
| Accent reduction | Pronunciation scoring | Target accent model |

**Architecture:** General speaking mode with simplified rubric (fluency + clarity + content only), independent of exam scoring.

---

## 6. Architecture Recommendations

```
┌─────────────────────────────────────────────────┐
│              Learner Experience UI              │
│     (TOEFL / IELTS / PTE / General tabs)        │
└──────────────┬──────────────────┬───────────────┘
               │                  │
┌──────────────▼──────┐   ┌───────▼──────────────┐
│   Prompt Library    │   │   UI Templates       │
│   (exam-specific)   │   │   (exam-specific)    │
└──────────────┬──────┘   └───────┬──────────────┘
               │                  │
┌──────────────▼──────────────────▼───────────────┐
│         Scoring Configuration Layer             │
│  (rubric weights, thresholds, task types)       │
│  [Exam-specific config objects]                 │
└──────────────────────┬──────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────┐
│            Shared Core Engine                   │
│  • Audio analysis (WPM, pauses, fillers)        │
│  • Transcription + language detection           │
│  • Grammar/vocabulary analysis                  │
│  • Content relevance scoring                    │
│  • Error classification                         │
└──────────────────────┬──────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────┐
│         Supabase + Gemini (unchanged)           │
└─────────────────────────────────────────────────┘
```

---

## 7. Sources

- IELTS Official test format: https://www.ielts.org/test-format
- PTE Academic format: https://pearsonpte.com/test-format/
- ETS TOEFL iBT: https://www.ets.org/toefl
- Academic comparison: Brown (2004) — Teaching Speaking and Pronunciation
- Cross-linguistic speaking assessment research