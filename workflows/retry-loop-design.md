# TOEFL Speaking Research — Task 5: Practice-Feedback-Iterate Loop

**Last updated:** 2026-04-20

---

## 1. Overview

The core learning loop for a speaking trainer is: **Record → Transcribe → Score → Diagnose → Correct → Re-record**. The granularity of this loop determines how fast learners improve and how engaged they stay. This document defines the loop at three levels of granularity and the decision logic for choosing between them.

---

## 2. The Loop at Three Granularity Levels

### 2.1 Level 1: Full Retake

**What it is:** Re-record the entire response to the same task prompt. Compare two full attempts.

**Best for:**
- Practice under pressure
- Building fluency across the full response
- After seeing overall score — learner decides to try again on full task

**User flow:**
1. Record response
2. See score + feedback
3. Choose: re-record full answer
4. Record again
5. See comparison: Attempt 1 vs Attempt 2 scores
6. Optional: compare transcripts side-by-side

**Data required:**
- Two recordings + transcripts
- Two scores (overall + dimensions)
- Comparison metadata

**Pro:** Maximum test-pressure simulation
**Con:** Time-intensive; may not focus on weakest areas

### 2.2 Level 2: Targeted Retry

**What it is:** Re-record only a specific segment (introduction, body paragraph, conclusion, or a particular claim) that was flagged as weak. The rest of the response stays as-is.

**Best for:**
- After seeing dimensional breakdown — delivery is weak, but content is fine
- When time is limited and learner wants focused practice
- Drill mode: master one structure at a time

**User flow:**
1. Record response
2. See score + feedback
3. App highlights weak dimension or weak segment
4. Choose: re-record specific segment only
5. Record just that segment (e.g., introduction)
6. See comparison: new segment vs. old segment
7. App shows updated overall score if segment is replaced

**Segment options:**
- Introduction (first 10–15 seconds)
- Main point 1
- Main point 2
- Supporting example for point 1
- Supporting example for point 2
- Conclusion (last 10–15 seconds)

**Data required:**
- Full recording + segment-level timestamps
- Segment-level scores or quality indicators
- Updated composite score after segment replacement

**Pro:** Focused, time-efficient practice on specific weakness
**Con:** Loses the holistic pressure-test feel

### 2.3 Level 3: Sentence-Level Retry

**What it is:** Pinpoint specific weak phrases within the transcript. Re-record just those sentences. Compare at the sentence level.

**Best for:**
- Advanced learners fine-tuning delivery
- When specific phrases or grammar constructions are the issue
- After seeing transcript — learner identifies the exact problem

**User flow:**
1. Record response
2. See score + feedback
3. App highlights specific weak sentences (low ASR confidence, grammar errors, vague phrasing)
4. Choose: re-record specific sentence(s)
5. Record just those sentences
6. See before/after: old sentence vs. new sentence
7. Audio playback comparison

**Targetable sentence types:**
- Vague sentences (e.g., very important, really good)
- Grammatically incorrect sentences
- Sentences with excessive fillers
- Sentences with poor pronunciation signals
- Sentences missing specific detail

**Data required:**
- Sentence-level transcription + timestamps
- Sentence-level quality scores
- Before/after audio snippets
- Annotation layer on transcript

**Pro:** Maximum precision improvement
**Con:** Most complex to implement; may feel less like TOEFL practice

---

## 3. Decision Logic: When to Use Each Level

### Automatic triggers:
- **Score < 2.5 on any dimension** → prompt for targeted retry (Level 2)
- **Score < 3 on overall** → suggest full retake (Level 1)
- **Score >= 4 on overall** → offer sentence-level retry (Level 3) as optional
- **Time since last attempt < 5 minutes** → offer Level 2/3 only (no full retake)

### User choice override:
- Always let the user choose the retry mode regardless of auto-suggestion
- Users may prefer full retake for pressure practice even if score is good

### Confidence signaling:
- Use ASR confidence per segment as a proxy for pronunciation/clarity
- Flag segments with low ASR confidence as candidates for targeted retry

---

## 4. Improvement Detection

How does the app decide if the latest attempt is actually better?

### Score comparison:
- Overall score delta between attempts
- Dimension-level delta (improvement on specific dimensions)
- Word count delta (longer response often signals better development)

### Qualitative indicators:
- Fillers per minute — reduced = improvement
- WPM stability — more consistent = improvement
- Transcript specificity — more named entities and details = improvement
- Grammar error rate — reduced = improvement

### Improvement confirmation UI:
- Show side-by-side comparison with visual indicators
- Use color coding: green = improved, yellow = same, red = declined
- Celebrate improvement with positive feedback
- When score declines: show empathy + suggest targeted retry instead

### Improvement display:
```
Attempt 1: Score 3.5 (Delivery: 3.5, Language: 3.0, Topic Dev: 3.5)
Attempt 2: Score 4.0 (Delivery: 4.0, Language: 3.5, Topic Dev: 4.0) ↑

Your delivery improved significantly — fewer pauses and better pacing.
Language Use is still your weakest dimension — consider practicing grammar
in context.
```

---

## 5. Retry Mode Architecture

```
[Record Attempt N]
    ↓
[Transcribe + Score]
    ↓
[Show Feedback + Highlight Weak Areas]
    ↓
┌────────────────────────────────────────────────────┐
│           Retry Mode Selection UI                  │
│                                                    │
│  [Full Retake]  [Targeted Retry]  [Sentence Retry] │
│   ~45s-60s       ~15-30s          ~5-10s           │
│   High pressure  Focused skill    Fine-tuning      │
└────────────────────────────────────────────────────┘
    ↓                   ↓               ↓
[Re-record           [Select          [Select
 full answer]        segment]         sentence(s)]
    ↓                   ↓               ↓
[Transcribe + Score  [Score segment   [Record
 new attempt]        + update         specific
    ↓                composite]        sentence]
    ↓                   ↓               ↓
[Side-by-side        [Segment          [Sentence
 comparison]         comparison]       comparison]
```

---

## 6. Session Flow with Loop Integration

### Typical guided practice session:
1. **Warm-up:** 1 sentence-level retry on previous session's weak area (2 min)
2. **Main practice:** 2–3 full attempts on current task type (15 min)
3. **Targeted drill:** 1–2 targeted retries on weakest dimension (5 min)
4. **Reflection:** Review score trend for the session (1 min)

### Total session time: ~23 min (reasonable for mobile)

### Session flow design notes:
- Start with low-stakes sentence retry to build confidence
- Progress to full attempts which are harder
- End with targeted drill on weakest area
- Close with positive reflection on improvement

---

## 7. Sources

- Duolingo's spaced repetition and retry research
- Elsa Speak's pronunciation drill loop design
- Language learning research on corrective feedback (Lyster & Ranta, 1997)
- TOEFL speaking coaching methodology (ETS partner programs)