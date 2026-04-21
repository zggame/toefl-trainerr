# TOEFL Speaking Research — Task 8: User Profile Metrics & Progress Tracking

**Last updated:** 2026-04-20

---

## 1. Overview

A learner's profile and analytics layer should track more than just test scores. Meaningful progress visualization keeps learners motivated and helps the app provide personalized coaching. This document defines the full data schema and summary metrics for the learner profile.

---

## 2. Core Data Entities

### 2.1 Attempt Record (per recording session)

```typescript
interface Attempt {
  id: string;
  userId: string;
  taskType: 'independent' | 'integrated_campus' | 'integrated_academic' | 'interview';
  taskId: string; // specific prompt variant
  timestamp: Date;

  // Scores
  overallScore: number; // 0–4 raw, or 1–6 new scale
  deliveryScore: number;
  languageUseScore: number;
  topicDevScore: number;
  // For integrated: infoIntegrationScore

  // Transcript
  transcript: string;
  wordCount: number;
  audioDuration: number;

  // Audio analysis
  wpm: number;
  fillerCount: number;
  pauseCount: number;
  avgPauseDuration: number;
  audioEnergyAvg: number;
  hadAudioWarning: boolean;

  // Error flags
  grammarErrorCount: number;
  grammarErrorTypes: string[]; // e.g., ['tense', 'article', 'preposition']
  vocabularyDiversity: number; // type-token ratio
  specificDetailCount: number; // named entities, numbers, etc.

  // Context
  mode: 'guided' | 'simulation';
  usedScaffolding: boolean;
  scaffoldingType?: string;
  retryMode?: 'full' | 'targeted' | 'sentence';
  previousAttemptId?: string;
}
```

### 2.2 Learner Profile (per user)

```typescript
interface LearnerProfile {
  userId: string;
  createdAt: Date;
  lastActiveAt: Date;

  // Current ability estimates
  estimatedOverallScore: number; // rolling average of recent attempts
  estimatedDeliveryScore: number;
  estimatedLanguageUseScore: number;
  estimatedTopicDevScore: number;

  // Weakness tracking
  recurringErrorTypes: string[]; // most frequent grammar errors
  weakestDimension: 'delivery' | 'language_use' | 'topic_dev';
  taskTypeWithLowestScore: string; // which task type needs most work

  // Speaking behavior
  avgWpm: number;
  avgFillerRate: number; // fillers per minute
  avgPauseRate: number;
  avgResponseLength: number; // words per response

  // Progress
  totalAttempts: number;
  totalPracticeMinutes: number;
  sessionsCompleted: number;
  streakDays: number;

  // Aspirational
  targetScore: number; // e.g., 5.0 for graduate school
  targetTestDate?: Date;
}
```

---

## 3. Summary Metrics (Dashboard Display)

### 3.1 Score Trend Chart
- Line chart of overall score over last 20 attempts
- Secondary lines for each dimension (toggle on/off)
- Markers for mode changes (guided ↔ simulation)

### 3.2 Dimension Breakdown (Radar Chart)
Four axes: Delivery, Language Use, Topic Development, Info Integration
Current score vs. target score vs. previous best

### 3.3 Weakness Summary
```
Most frequent errors:
1. Article errors (62% of grammar errors)
2. Verb tense (18%)
3. Prepositions (12%)

Recommended focus: Language Use — Articles
→ Try the Article Drill in Guided Practice
```

### 3.4 Pronunciation/Pacing Pattern
```
Your speaking rate: 118 wpm (target: 130–150 wpm)
Fillers: 4.2 per minute (target: <3)
Pauses: 2.3 per 30s (target: <2)

→ Focus on: Slightly increase pace + reduce fillers
→ Try: Fluency drill → Filler reduction module
```

### 3.5 Task-Type Performance
```
Independent: Avg 3.8 ⭐
Integrated Campus: Avg 3.2 ⭐
Integrated Academic: Avg 2.9 ⭐

→ Recommended: Focus on Academic tasks
→ Try: Academic Vocabulary + Lecture Note-taking drills
```

### 3.6 Progress Milestones
```
🎯 Reached: 10 practice sessions completed
🎯 Reached: 3 consecutive score 4 attempts
🔒 Next: Score 4 on Integrated Academic (2.9 → 4.0 needed)
🔒 Next: Reduce filler rate below 3 per minute
```

### 3.7 Streak & Consistency
```
Last 7 days: 5 practice sessions ⭐
Last 10 attempts score consistency: ±0.3 (very consistent)
Most improved dimension this week: Topic Development (+0.5)
```

---

## 4. Improvement Summaries

### 4.1 Weekly Summary (delivered as notification or in-app card)

```
Your TOEFL Speaking Week:
• 4 practice sessions completed
• Average score: 3.5 (up from 3.2 last week)
• Most improved: Delivery (+0.4) — fewer pauses!
• Still working on: Topic Development — add more specific details
• Practice streak: 5 days
```

### 4.2 Milestone Notifications

- First score 4 achieved
- 7-day streak
- 50 attempts completed
- Task type mastered (score 4+ on all task types)
- Filler rate cut by 50%
- WPM in target range for first time

### 4.3 Plateau Detection

The app should detect score plateau and intervene:

```
⚠️ Score plateau detected
Your score has been 3.2–3.5 for the last 8 attempts.
You're strong in Delivery and Language Use.
Focus shift recommended: Topic Development
→ Try: Adding specific details to responses
→ Or: Practice the Integrated Academic task type
```

---

## 5. Instructor/Coach Dashboard (for teacher/coach use)

If instructors are reviewing learner progress:

### 5.1 Class Overview
- Number of students
- Class average score
- Most common weak areas across all students
- Students needing attention (score declining or stagnant)

### 5.2 Student Detail
- Individual score trend
- Error pattern analysis
- Suggested assignment based on weakness
- Compare student to class average

### 5.3 Assignment Features
- Assign specific task types or prompts
- Set minimum practice sessions per week
- Share benchmark responses for class review

---

## 6. Data Privacy Notes

- All attempt data is private to the learner (and any assigned instructor)
- Audio recordings should be stored with retention policy (e.g., 90 days)
- Transcript and scores can be stored longer
- Allow learner to delete all data (GDPR compliance path)

---

## 7. Sources

- Duolingo's learner progress dashboard design
- Elsa Speak's progress visualization
- ETS MyBest score reporting concept
- Language learning analytics research (Baker & Oxford)