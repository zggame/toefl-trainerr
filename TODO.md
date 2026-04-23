# TOEFL Speaking Trainer - Issue Tracker & Roadmap

## 🎨 UX/UI Polish
- [x] **Header Spacing:** Add more gap/padding to the top section of pages (Landing and Dashboard) to improve visual breathing room.
- [x] **Simulation Transitions:** Added Part 1 (Listen & Repeat) and Part 2 (Interview) transition screens to the simulation flow.
- [ ] **Responsive Desktop Layout:** Design and implement a layout for larger screens (iPad, Desktop) that uses horizontal space better, moving beyond the centered mobile-first column style.

## ⚙️ Simulation Engine Improvements
- [x] **Background Scoring:** Refactor simulation logic to submit recordings for AI scoring in the background immediately after each item, reducing wait time at the end.
- [ ] **Topic Relevance:** Verify and refine the `topic_domain` grouping logic to ensure all 4 interview questions in a simulation are tightly related.

## 🎙️ AI Audio & Speech
- [ ] **Gemini Speech Integration:** Replace browser TTS fallback with Gemini-generated audio prompts for a more natural testing experience.
- [ ] **Model Example Answers:** Generate "Ideal Model Answers" (audio + transcript) on-demand for users to hear how a top-scoring response sounds.
- [ ] **Speaker Selection:** Allow selection of different AI speakers/personas and document the choices.

## 🚀 High Priority (Post-Revamp Merge)
- [ ] **Final Merge & Deploy:** Deploy `main` branch to Vercel/Supabase Cloud.
- [x] **User-Level Usage Limit:** Implement a daily scoring cap (e.g., 5-10 attempts/day) in `toefl_profiles` to protect API budget.
- [x] **Token Monitoring:** Log real prompt/candidate token usage in `toefl_attempts` JSONB for cost analysis.
- [x] **Usage Reporting:** Create a script to monitor user activity and AI costs (`scripts/monitor-usage.ts`).

## 🛠️ Feature Roadmap
- [ ] **Account Management & Monetization:**
    - Integrate payment gateway (Stripe/Lemon Squeezy) to support a "Premium/Paid User" tier (e.g., unlimited scoring).
    - Add user tier field to `toefl_profiles` (free vs premium).
    - Build Admin Dashboard to manage users (remove, disable, or adjust limits).
- [ ] **History Enhancements:**
    - Add search by task transcript/content.
    - Add filter by score range (e.g., "See all 4.0 scores").
    - Add filter by practice mode (Guided vs Simulation).
- [ ] **Simulation Result Details:**
    - Ensure every score in the simulation summary links directly to its detailed `/toefl/attempt/[id]` page. (Note: Initial support is in `SimulationResultList`, needs verification).
- [ ] **Phase 2 - Targeted Retry:**
    - Sentence-level retry logic for specific delivery errors.
    - Side-by-side attempt comparison.

## 📦 Technical Debt
- [ ] **Refactor Practice Page:** Fully migrate any remaining legacy inline styles to Tailwind v4 atomic components.
- [ ] **Supabase Isolation:** Move production build to a dedicated Supabase project (separate from `smart-interview`).
