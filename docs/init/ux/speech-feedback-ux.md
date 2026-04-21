# TOEFL Speaking Research — Task 10: UI/UX Best Practices for Speech Feedback

**Last updated:** 2026-04-20

---

## 1. Overview

Speech feedback UI is fundamentally different from text-based feedback because it has three layers: audio (the recording), text (the transcript), and metadata (scores, dimensions, errors). The challenge is presenting all three in a way that is understandable, actionable, and motivating for learners ranging from beginner to advanced.

---

## 2. Feedback Layer Architecture

### 2.1 Three-Layer Feedback Model

| Layer | What it shows | Best for |
|-------|--------------|----------|
| **Audio** | Waveform + playback | Hearing delivery, pauses, fillers |
| **Transcript** | Text with annotations | Reading content, seeing errors |
| **Metadata** | Scores, errors, metrics | Understanding performance, planning improvement |

All three layers should be accessible and linked:
- Clicking a word in the transcript plays that segment of audio
- Error markers in the transcript link to specific feedback cards
- Score breakdown is always visible alongside the audio

### 2.2 Feedback Display Modes

**Mode 1: Summary First (for beginners)**
- Show overall score prominently (large number)
- Show one key strength and one key area for improvement
- Audio and transcript available below
- CTA: Try again / Try targeted retry

**Mode 2: Analysis Dashboard (for intermediate)**
- Score breakdown card (delivery, language, topic dev)
- Annotated transcript with error markers
- Audio waveform with pause markers
- Error summary panel
- CTA: Retry this task / Practice related skill

**Mode 3: Light-Touch (for advanced/simulation mode)**
- Score only (no breakdown unless requested)
- Option to see transcript and audio
- CTA: Done / View full feedback

---

## 3. Annotated Transcript Design

### 3.1 Error Annotation Style

Highlight words/sentences that have issues, with color coding:

| Color | Meaning | Example |
|-------|---------|---------|
| Red underline | Grammar error | I **goed** to the store |
| Orange underline | Vocabulary issue | The **stuff** was interesting |
| Yellow highlight | Vague / needs detail | It was **very good** |
| Blue marker | Filler word | **um** I think |
| Green marker | Strong point | Excellent use of transition |

### 3.2 Annotation Interaction

- **Hover/tap:** Shows the specific feedback for that segment
- **Click:** Plays the audio for that segment
- **Long-press:** Shows coaching tip for fixing that issue
- **Skip button:** Mark as intentional (ignore error for this attempt)

### 3.3 Transcript Formatting

```
[00:05] Speaker: I think the most important experience 
[00:08] I've had was working at a restaurant.
[00:12] ← [Grammar: subject-verb agreement]
[00:12] Speaker: It taught me a lot about teamwork 
[00:15] ← [Strong: specific detail]
[00:15] and communication, which are key skills.
[00:18] Speaker: Um, I think it's very important.
[00:18] ← [Filler: 1st occurrence] ← [Vague: what does 
         'important' mean?]
```

---

## 4. Score Breakdown Display

### 4.1 Score Card Design

```
┌────────────────────────────────────────────┐
│  Overall Score                              │
│           3.5 / 4                           │
│         ████████░░  (87%)                  │
│                                            │
│  Delivery     3.5  ████████░░  Good        │
│  Language     3.0  ███████░░░░  Limited    │
│  Topic Dev    4.0  ██████████  Strong      │
└────────────────────────────────────────────┘
```

### 4.2 Visual Pacing Feedback

Show the audio waveform with overlaid pacing indicators:

```
[======  fast  ====][----  slow  ----][=====  fast  =====]
[wpm: 170]          [wpm: 95]          [wpm: 155]

[▼▼  pause]    [▼  pause]    [▼▼▼▼  long pause]

Target: 130-150 wpm
```

### 4.3 Filler/Pause Heatmap

Show a visual summary of filler usage and pause frequency across the response:

```
Filler count: 6 (target: <4)
Pause count: 3 (target: <2)

[▓▓░░▓▓▓░░▓░] ← 6 fillers spread across response
[▼░▼░▼░░░░░] ← 3 pauses, mostly in middle section

Most fillers occurred in: [sentences 2-3]
Most pauses occurred in: [introduction, transition]
```

---

## 5. Side-by-Side Attempt Comparison

When comparing two attempts:

```
┌─────────────────────────────────────────────┐
│  Attempt 1          Attempt 2               │
│  Score: 3.0         Score: 3.5  ↑          │
│                                             │
│  [Audio waveform]    [Audio waveform]       │
│                                             │
│  Transcript:         Transcript:             │
│  I went to store.    I visited the local    │
│  [grammar error]     market downtown.       │
│                     [strong detail]         │
│                                             │
│  Filler: 8/min       Filler: 4/min  ↓      │
│  WPM: 95             WPM: 138  ↑            │
│  Specific: 0         Specific: 2  ↑         │
│                                             │
│  ✓ Improved in: Delivery, Topic Dev         │
│  → Still working on: Language Use (grammar) │
└─────────────────────────────────────────────┘
```

---

## 6. Audio Snippet Playback

For sentence-level comparison or benchmark comparison:

- **Play original segment** (learner's attempt): 3-second default, adjustable
- **Play benchmark segment** (score-4 example): 3-second default
- **Play both sequentially** (A/B comparison): auto-advances
- **Play both simultaneously** (side-by-side): mono-mix
- **Slow playback** (0.75x speed): for hearing pronunciation details

---

## 7. Beginner vs. Advanced UX

### 7.1 Beginner Mode
- Detailed feedback with full coaching tips
- Suggest retry strategy (targeted vs. full)
- Show what a score-4 response looks like
- Explain rubric dimensions with examples
- Gamify: celebrate improvements

### 7.2 Intermediate Mode
- Show dimensional scores
- Offer comparison to previous attempts
- Suggest skill focus based on weakest dimension
- Allow mode toggle (guided vs. simulation)

### 7.3 Advanced Mode (Simulation)
- Score only (optional full breakdown)
- Minimal coaching — let them self-correct
- Compare to recent attempts only
- Focus on pressure practice

---

## 8. Mobile-First Considerations

Since TOEFL test-takers primarily practice on mobile:

### 8.1 Responsive feedback layout
```
Mobile (< 768px):  Single column
  [Score Card]
  [Audio waveform (full width)]
  [Transcript (scrollable)]
  [Error panel]
  [Retry options]

Tablet/Desktop: Two column
  [Score + Audio] | [Transcript + Errors]
```

### 8.2 Touch-friendly controls
- Large play/pause button (48px minimum)
- Tap transcript to play segment
- Swipe left/right for comparison view
- Long-press for coaching tip

### 8.3 Audio waveform
- Touch to seek
- Pinch to zoom for precise segment selection
- Color coding for pause/filler zones

---

## 9. Motivation Design

### 9.1 Progress Notifications
- Score improvement: Celebrate immediately
- Streak maintained: Acknowledge at end of session
- Skill mastered: Unlock badge or visual indicator
- Plateau detected: Offer help proactively

### 9.2 Feedback Tone
- **Negative feedback:** Be specific but not discouraging
  - Bad: \"Your grammar is terrible\"
  - Good: \"Grammar errors appeared in 2 sentences — both were verb tense issues. Here's a quick exercise.\"
- **Positive feedback:** Be specific too
  - Bad: \"Good job!\"
  - Good: \"Your pacing improved — you averaged 135 wpm this time, up from 110 last session. Almost at target range.\"

### 9.3 Avoid Score Chasing
- Show trend over time rather than single scores
- Celebrate consistency improvements (reducing score variance)
- Encourage targeted retry over full retake when appropriate

---

## 10. Sources

- Duolingo's feedback UI patterns
- Elsa Speak's pronunciation feedback design
- IELTS Liz speaking feedback approach
- Academic research on speech feedback effectiveness (Egi, 2007; Ockey, 2007)
- Mobile UX best practices for language learning apps