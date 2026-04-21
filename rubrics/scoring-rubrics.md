# TOEFL Speaking Research — Task 2: Scoring Rubrics

**Last updated:** 2026-04-20

---

## 1. Overview

TOEFL Speaking is scored on a **1–4 raw score** per task (converted to 0–30 scaled score on the old scale, 0–6 on the new scale). Each response is evaluated by certified ETS raters on three dimensions, plus a special handling for Integrated tasks.

---

## 2. The Three Rubric Dimensions

### Dimension 1: Delivery

**What it measures:** How clearly the speaker communicates.

**Scoring signals:**
- **Clarity of speech** — pronunciation, enunciation, intonation
- **Fluency** — smooth flow without excessive hesitation or unnatural pauses
- **Pacing** — neither too fast (mumbling) nor too slow (stops)
- **Confidence** — natural, assured delivery
- **Audio quality** — voice recorded clearly

**Observable signals for automated scoring:**
- Word-per-minute rate (optimal range: 120–160 wpm for TOEFL)
- Pause frequency and length (excessive pauses above 2s are negative)
- Pronunciation accuracy of key words
- Audio energy/volume consistency

**Low-score patterns:**
- Over-reliance on fillers (um, uh, like)
- Repeated restarts and self-corrections
- Very slow speech indicating search for words
- Rapid mumbled delivery

### Dimension 2: Language Use

**What it measures:** Accuracy and range of grammatical and vocabulary usage.

**Scoring signals:**
- **Grammar accuracy** — verb tense, subject-verb agreement, article usage
- **Vocabulary range** — appropriate word choice, varied vocabulary
- **Sentence complexity** — ability to produce simple and complex sentences
- **Lexical precision** — word choice suits the context

**Observable signals for automated scoring:**
- Grammatical error rate (per clause or per sentence)
- Vocabulary diversity (type-token ratio, use of academic vocabulary)
- Error types: article errors, verb form errors, sentence fragment errors, word order errors
- Lexical sophistication markers

**Low-score patterns:**
- Repeated grammatical errors (same error type multiple times)
- Very simple sentence structures only
- Frequent word-finding pauses
- Code-switching (shifting to L1) without clear reason
- Register inconsistency (too informal or too stiff)

### Dimension 3: Topic Development

**What it measures:** How well the response addresses and develops the topic.

**Scoring signals:**
- **Relevance** — stays on topic, directly answers the question
- **Completeness** — provides a full answer with enough content
- **Organization** — coherent structure with clear main points
- **Support quality** — uses reasons, examples, details (not just vague statements)
- **Development** — builds ideas, doesn't just repeat one point

**Observable signals for automated scoring:**
- Response length relative to time limit (e.g., 45s response should be 80–120 words)
- Relevance score (keyword coverage, prompt-element coverage)
- Presence of supporting detail (examples, reasons, specific information)
- Logical structure markers (transition words, discourse markers)
- Filler/non-answer detection (vague generalities vs. specific content)

**Low-score patterns:**
- Very short responses (under 30 seconds of content)
- Vague answers without specific detail
- Missing the point of the question
- One-sided without development (independent task)
- Not synthesizing reading/listening sources (integrated tasks)
- Repetition of the same point in different words

---

## 3. Score Level Descriptors (0–4 Scale)

Based on publicly available TOEFL speaking rubric documentation:

### Score 4 (Strong)
- Well-developed response that directly addresses the topic
- Clear organization with effective use of supporting details
- Few or no grammatical errors; natural fluency
- Sophisticated vocabulary used appropriately
- Audio is clear and easy to understand

### Score 3 (Good)
- Adequately addresses the topic
- Some organization, mostly logical progression
- Minor grammatical errors that don't impede meaning
- Generally appropriate vocabulary with occasional imprecise word choice
- Minor fluency issues (some hesitation, but communication is clear)

### Score 2 (Limited)
- Partially addresses the topic or goes off-topic
- Weak organization or minimal development
- Noticeable grammatical errors that may cause some confusion
- Limited vocabulary range; frequent word-finding difficulty
- Hesitation and pausing impede flow significantly

### Score 1 (Weak)
- Barely addresses the topic
- Minimal content and organization
- Frequent and severe grammatical errors
- Very limited vocabulary; many word-finding pauses
- Very halting speech with frequent long pauses or silence

### Score 0
- No speech recorded, or completely off-topic/nonsensical response

---

## 4. Integrated Task-Specific Rubric Additions

For Tasks 2, 3, and 4 (integrated tasks), an additional scoring dimension applies:

- **Information Integration** — accurately and completely combines information from the reading/listening sources
- Missing key source details → score capped at 3
- Fabricating source information → serious negative signal
- Only reading OR only listening → score capped at 2

### Integrated Task Scoring Details

**Strong (4):**
- Accurately summarizes key information from both sources
- Shows clear relationship between sources
- Response is complete and well-developed

**Good (3):**
- Accurately covers most important information
- Shows some relationship between sources
- Minor omissions or inaccuracies don't significantly affect meaning

**Limited (2):**
- Major omissions or inaccuracies in source information
- May only reference one source
- Some confusion between the two sources

**Weak (1):**
- Heavily inaccurate or fabricated source information
- Ignores source materials almost entirely
- Response is incoherent or off-topic

---

## 5. Conversion to Scaled Scores

| Raw Score (0–4) | Old Scaled Score (0–30) | New Scale (2026+) |
|----------------|------------------------|-------------------|
| 4 | 30 | 6 |
| 3.5 | 28–29 | 5.5 |
| 3 | 25–27 | 5 |
| 2.5 | 22–24 | 4.5 |
| 2 | 18–21 | 4 |
| 1.5 | 14–17 | 3.5 |
| 1 | 10–13 | 3 |
| 0.5 | 8–9 | 2.5 |
| 0 | 0–7 | 1–2 |

---

## 6. Automated Scoring Approach for App Design

For the app's scoring engine, each dimension maps to observable signals:

### Delivery signals (measurable):
- WPM rate: target 130–150 wpm; penalize <100 or >180
- Pause frequency: penalize >3 pauses >2s per 30s segment
- Fillers: count um/uh/like per response; flag >8 per minute
- Audio clarity: energy level, silence detection (already built in existing app)

### Language Use signals (measurable via transcription + analysis):
- Error rate: count grammatical errors per 100 words; penalize >8%
- Vocabulary diversity: unique words / total words; reward >0.6 ratio
- Error type classification: articles, verb tense, subject-verb agreement, word order
- Sentence variety: ratio of complex sentences (with subordinating conjunctions) to total

### Topic Development signals (measurable via transcription + prompt matching):
- Word count vs. time limit (ratio of actual to expected)
- Prompt keyword coverage (AI evaluates relevance)
- Specific detail detection (named entities, numbers, specific examples vs. vague statements)
- Organization markers (first, second, however, in conclusion, etc.)
- For integrated tasks: source detail recall from reading/listening content

### Score composite formula (suggested):
```
final_score = delivery_score * 0.3 + language_use_score * 0.3 + topic_development_score * 0.4
```

For integrated tasks: add information_accuracy modifier ±0.5 points.

---

## 7. Open Questions / Gaps to Fill

1. Confirm whether the new 2023+ speaking format (Listen and Repeat + Interview) uses the same three-dimension rubric
2. Find official ETS speaking rubric PDF from current test format (the old PDF is widely available but may not match current tasks)
3. Confirm how AI-powered scoring (ERS — e-Rater) is used alongside human raters
4. Find sample responses at each score level with annotations