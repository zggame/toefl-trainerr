# TOEFL Speaking Research — Task 3: Common Errors & Low-Score Patterns

**Last updated:** 2026-04-20

---

## 1. Overview

This document catalogs the most common speech errors that push TOEFL speaking responses into mid and low score bands. Errors are organized by the rubric dimension they impact most, then by detectability category for the app.

---

## 2. Delivery Errors

### 2.1 Fluency Disruptions

| Error | Description | Detectability |
|-------|-------------|---------------|
| Excessive fillers | Overuse of um, uh, like, you know | Audio analysis + transcription |
| Hesitation pauses | Long (>2s) unnatural pauses mid-sentence | Audio analysis |
| Self-restart loops | Starting a sentence, stopping, re-starting | Audio analysis + transcription |
| Word-finding pauses | Silence while searching for vocabulary | Audio analysis + transcription |
| Rate collapse | Speaking very slowly when nervous or uncertain | WPM measurement |
| Over-acceleration | Speaking too fast with unclear pronunciation | WPM measurement + audio quality |

**Threshold targets for app:**
- Fillers: >6 per 60s response = high penalty
- Long pauses: >2 pauses >2s in 45s response = significant penalty
- WPM: <100 or >170 = penalty

### 2.2 Pronunciation Issues

| Error | Description | Detectability |
|-------|-------------|---------------|
| Consonant cluster simplification | Dropping sounds at word ends (e.g., -ed, -s) | Transcription + ASR confidence |
| Vowel confusion | Mixing similar vowels (ship/sheep, bit/beat) | Transcription |
| Stress errors | Wrong syllable stress (FOReign vs. foreIGHN) | Audio analysis + transcription |
| Intonation flatness | Monotone delivery with no pitch variation | Audio analysis |
| Linking failures | Not connecting sounds naturally between words | Audio analysis |

**App approach:** Use transcription confidence scores as proxy for pronunciation clarity. Low-confidence ASR segments often indicate pronunciation problems.

### 2.3 Audio Quality Issues

| Error | Description | Detectability |
|-------|-------------|---------------|
| Mumbling/low volume | Voice too soft, unclear | Audio energy analysis |
| Mic distance changes | Moving away/closer to mic during recording | Audio level variance |
| Background noise | Extraneous sounds interfering | Audio analysis |
| Silent segments | No speech detected during expected response | Audio analysis (already built in existing app) |

---

## 3. Language Use Errors

### 3.1 Grammatical Error Categories

| Error Type | Example | Frequency |
|------------|---------|-----------|
| Verb tense errors | Yesterday I go / I have went | Very common |
| Subject-verb agreement | He don't / She likes | Common |
| Article errors | I went to school yesterday / I read book | Very common for non-native speakers |
| Preposition errors | Interested on / Listen to vs. listen for | Common |
| Word order | Very much important / I have been here since three years | Common |
| Missing subjects/objects | Is very interesting / She not like it | Common in some L1 groups |
| Run-on sentences | Speaking without stopping, no punctuation | Common |
| Sentence fragments | Going to, because want | Common |

### 3.2 Vocabulary Errors

| Error Type | Example | Frequency |
|------------|---------|-----------|
| Word form errors | Very importance / I am interest in | Very common |
| False friends | Using L1-originated word in wrong context | L1-dependent |
| Register errors | Too informal (like, stuff, things) vs. too stiff | Common |
| Repetitive vocabulary | Using same words without synonyms | Common |
| Academic vocabulary absence | Using only casual words in academic contexts | Common |

### 3.3 Code-Switching

| Pattern | Description | Detection |
|---------|-------------|-----------|
| Full L1 sentences | Switching entire sentences to L1 | Transcription + language detection |
| Borrowed words | Using L1 words as fillers or content | Transcription + dictionary |
| Mixed discourse | Alternating mid-sentence | Transcription |

---

## 4. Topic Development Errors

### 4.1 Content Problems

| Error | Description | Impact |
|-------|-------------|--------|
| Response too short | Not filling the time allocation | Major — directly lowers score |
| Off-topic answers | Not addressing the prompt's specific question | Major — may cap at score 2 |
| Vague generalities | No specific details, examples, or reasons | Major — topic development score capped |
| One-sided answers | Only stating opinion without supporting reasons | Moderate — affects development |
| Repeating same idea | Saying the same thing in different words | Moderate — shows low development |
| Missing integrated sources | Not referencing reading/listening content | Critical for integrated tasks |
| Fabricating source info | Making up facts from reading/listening | Very serious — major score penalty |

### 4.2 Structural/Organization Problems

| Error | Description | Detection |
|-------|-------------|-----------|
| No introduction or conclusion | Jumping straight into content without framing | Transcription + length |
| Missing transitions | Ideas not connected logically | Transcription analysis |
| Incomplete answers | Running out of time before finishing the point | Time + transcription |
| Disorganized flow | Ideas jumping randomly without logical sequence | Transcription analysis |

### 4.3 Integrated Task-Specific Problems

| Error | Description | Impact |
|-------|-------------|--------|
| Ignoring the reading | Only discusses listening content | Caps score at 2 |
| Only summarizing reading | Never references listening content | Caps score at 2 |
| Confusing two sources | Attribute listening point to reading or vice versa | Significant penalty |
| Missing main point | Fails to identify the central concept | Major penalty |

---

## 5. Error Taxonomy for App Design

### Category A: Acoustic/Delivery Errors (detectable via audio analysis)
- Silent segments
- Excessive fillers (um, uh, like)
- Long hesitations
- WPM out of range
- Low audio energy
- Background noise

### Category B: Lexical/Vocabulary Errors (detectable via transcription)
- Word form errors
- Vocabulary repetition
- Register issues
- Missing academic vocabulary
- L1 borrowing

### Category C: Grammatical Errors (detectable via transcription + NLP)
- Tense errors
- Article errors
- Subject-verb agreement
- Preposition errors
- Word order
- Fragment/run-on

### Category D: Discourse-Level Errors (detectable via transcription analysis)
- Off-topic content
- Vague responses
- Missing details/examples
- Organization problems
- Transition usage

### Category E: Task-Fulfillment Errors (detectable via prompt matching)
- Not answering the question
- Missing required sources (integrated)
- Fabricating content
- Response too short
- Time management failures

---

## 6. Error Priority Matrix for Coaching

Based on frequency and score impact, rank errors by coaching priority:

| Priority | Error Category | Why |
|----------|---------------|-----|
| 1 (Highest) | Response too short / vague content | Biggest single score killer |
| 2 | Missing integrated sources | Critical for integrated tasks |
| 3 | Excessive fillers / long pauses | Most common delivery issue |
| 4 | Grammatical errors (tense, articles) | Common and easy to fix |
| 5 | Off-topic answers | Often stems from poor reading/listening |
| 6 | Pronunciation clarity | Important for delivery score |
| 7 | Vocabulary range | Important for language use score |

---

## 7. Common Error Patterns by L1 Background

This information is useful for personalized coaching:

| L1 Group | Common Grammatical Errors | Common Vocabulary Errors | Common Delivery Errors |
|----------|--------------------------|-------------------------|----------------------|
| Chinese (Mandarin/Cantonese) | Article errors, verb tense, subject-verb | Word form errors | Flat intonation, sentence stress |
| Japanese | Article errors, prepositions, articles | False friends (katakana words) | Flat intonation |
| Korean | Article errors, prepositions | Word order confusion | Initial consonant clarity |
| Spanish | Verb tense errors (subjunctive) | False friends | Over-enthusiastic intonation |
| Arabic | Article errors, prepositions | Word order | Pharyngeal sounds, stress |
| Vietnamese | Verb tense, articles, prepositions | Word form errors | Initial sound confusion |

*This is general guidance — the app should detect actual errors rather than assume by L1.*

---

## 8. Sources

- TOEFL Speaking rubrics (ETS official, various compilations)
- Magoosh TOEFL Blog — common speaking mistakes
- E2 Language (YouTube/website) — TOEFL speaking error analysis
- IELTS Liz — speaking error analysis (cross-applicable)
- Academic research on L2 speaking assessment errors