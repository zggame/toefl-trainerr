# TOEFL Speaking Research — Task 4: Workflow Options

**Last updated:** 2026-04-20

---

## 1. Overview

Four primary workflow models were considered for the TOEFL speaking trainer app. Each serves different learner profiles and has distinct implications for feature set, data storage, and retention/learning outcomes.

---

## 2. Workflow A: Simulation-First (Test Simulation)

### Concept
Replicate the TOEFL speaking test as closely as possible — timed tasks, full pressure, no help during recording. Score-only feedback after each attempt.

### User Flow
1. Select task type (Independent, Integrated, or Full Test)
2. See prompt, prep countdown (15–30s), record response
3. Submit → receive score + dimensional breakdown
4. Done

### Who it serves best
- Learners near test date (final preparation)
- Advanced learners who only need pressure practice
- Users with strong self-directed improvement habits

### Screens needed
- Task selection screen
- Timer + prompt display (full-screen)
- Record button with countdown
- Score report screen

### Data stored
- Attempt: recording, score, timestamp, task type
- Aggregate: average score, score trend, attempt count

### Pros
- Maximum test-day familiarity
- Minimal time investment per session
- Clear score progress tracking

### Cons
- Minimal learning during the session
- No coaching or improvement guidance
- Users may repeat the same mistakes

### Retention impact
- Moderate — score chasing drives repeat attempts
- Score improvement may plateau without feedback loop

---

## 3. Workflow B: Guided Instruction

### Concept
Instruction, coaching, and templates available *during* practice. Looser timing, focused on teaching a specific skill or rubric dimension in each session.

### User Flow
1. Select skill focus (e.g., delivery, topic development, integrated task structure)
2. Learn the skill: read rubric, watch example, see tip card
3. Guided practice: template or outline provided before recording
4. Record with scaffolding visible (not hidden)
5. Receive detailed feedback + coaching on the specific skill
6. Mini-exercise to reinforce the skill

### Who it serves best
- Beginners learning TOEFL format
- Learners with specific weak dimensions
- Students in structured courses with instructor guidance

### Screens needed
- Skill selection / lesson list
- Instruction card with rubric excerpt
- Template/outline builder (for independent tasks)
- Note-taking field (for integrated tasks)
- Record screen with scaffolding visible
- Detailed feedback screen with coaching tips

### Data stored
- Attempt + recording + score + coaching feedback
- Skill focus per attempt
- Coaching history (which tips were shown)
- Improvement per skill dimension over time

### Pros
- Maximum learning per session
- Targeted improvement on specific weaknesses
- Supports learners who need structure

### Cons
- Requires more time per session
- May reduce test-day pressure familiarity
- More complex UI required

### Retention impact
- High — learning progression and visible skill improvement
- Coaching tips create engagement loop

---

## 4. Workflow C: Modular Skill-Building

### Concept
Separate speaking skills into independent modules. Learners drill one skill at a time (pronunciation, fluency, grammar in speech, structure, integrated listening/speaking). Tests appear only after module mastery.

### User Flow
1. Take diagnostic to identify weakest module
2. Work through module (e.g., fluency drills → filler reduction → timed practice)
3. Module quiz: demonstrate skill in simulated task
4. Move to next module
5. Full test simulation only after all modules complete

### Who it serves best
- Early-stage learners building fundamentals
- Learners with known specific weaknesses
- Self-study learners without instructor support

### Screens needed
- Diagnostic assessment screen
- Module list with progress indicators
- Skill-specific practice screens (varies per module)
- Module completion screen
- Full test simulation screen

### Data stored
- Diagnostic results
- Module progress per skill
- Drill history and scores
- Full test simulation results

### Pros
- Systematic approach to building all skills
- Clear progress milestones
- Prevents learners from only practicing what they're good at

### Cons
- Longest time-to-test-readiness
- May feel disconnected from actual TOEFL format
- High complexity for early-stage implementation

### Retention impact
- Very high — clear progression and milestones
- Gamification opportunities per module

---

## 5. Workflow D: Hybrid Progression (Recommended)

### Concept
Learners start in Guided mode building skills, gradually transition to Simulation mode as they gain confidence. The app adapts based on score progression and user behavior.

### User Flow — Phase 1 (Building)
1. Guided practice with scaffolding + coaching
2. Detailed feedback + skill-specific tips
3. Retry with coaching visible
4. Progress check: score trend improving
5. **Transition trigger**: 3 consecutive attempts at score 4 or above

### User Flow — Phase 2 (Testing)
1. Simulation mode — timed tasks, no scaffolding
2. Score-only feedback (with option to see detailed breakdown)
3. On decline: prompt to return to guided mode for specific skill

### Transition Logic
- Score consistently >= 4 → suggest simulation mode
- Score drops 2+ points → suggest returning to guided mode
- User can manually toggle between modes at any time

### Who it serves best
- All learner types
- Both self-study and instructor-assigned use
- Scalable from beginner to advanced

### Screens needed
- Home dashboard showing current mode
- Guided practice screens (Workflow B)
- Simulation screens (Workflow A)
- Transition prompt screen
- Mode preference toggle

### Data stored
- All data from both guided and simulation modes
- Mode transition history
- Performance per mode (guiding improvement decisions)
- Time-in-mode metrics

### Pros
- Adapts to learner level automatically
- Best of both worlds — learning + pressure practice
- Supports both self-learners and instructor-assigned practice
- Natural progression keeps learners engaged

### Cons
- Most complex to implement
- Requires good data model for mode-aware feedback

### Retention impact
- Highest — continuous engagement loop with adaptive difficulty

---

## 6. Workflow Comparison Matrix

| Aspect | Simulation | Guided | Modular | Hybrid |
|--------|-----------|--------|---------|--------|
| Implementation complexity | Low | Medium | High | High |
| Learning per session | Low | High | High | High |
| Test familiarity | High | Low | Low | High |
| Beginner friendly | Medium | High | High | High |
| Advanced learner | High | Medium | Low | High |
| Self-study support | Medium | High | High | High |
| Instructor assignment | Low | High | High | High |
| Retention impact | Medium | High | Very high | Highest |
| Time to score improvement | Fast | Fast | Slow | Fast |
| Data requirements | Low | Medium | High | High |

---

## 7. Recommendation for Initial Build

**Start with Hybrid**, but implement it in phases:

**Phase 1 (MVP):** Pure guided mode — learner picks task, gets scaffolding, records, gets detailed feedback. No transition logic yet.

**Phase 2:** Add simulation mode as a toggle option — learner can choose guided or simulation.

**Phase 3:** Implement transition logic — auto-detect when learner is ready to switch, prompt accordingly.

**Rationale:** Hybrid captures the most value for the most users. Starting with guided keeps the feedback loop front and center. Adding simulation as a toggle is low-cost. Transition logic adds the most retention value but is not required for initial release.

---

## 8. Sources

- Product design principles for language learning apps (Duolingo, Elsa Speak, Elsa AI)
- TOEFL prep platform analysis (Magoosh, GregMat, TOEFL Master)
- Educational research on spaced repetition and adaptive learning