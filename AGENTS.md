# AGENTS.md

## Director Autonomy Policy

Operate in Enterprise Autonomous Mode.

After an implementation plan is approved, proceed autonomously.

Do not ask for permission before using tools, reading files, running tests, or inspecting code.

---

## Context Reading (Required)

Before starting work:

- Read `docs/ai/current-state.md` if it exists
- If in a worktree, check `docs/ai/worktrees.md`
- Read relevant files in `docs/ai/handoffs/` if applicable

Do not assume context outside these files.

---

## State Writing (Controlled)

Do NOT write state automatically.

Only update shared state when:
- A meaningful milestone is reached, OR
- The session is ending, OR
- Explicitly requested

When updating:

- Update `docs/ai/current-state.md` only
- Keep concise, factual, structured
- Do NOT log step-by-step reasoning
- Do NOT overwrite unrelated content

---

## Worktree Isolation

- Treat each worktree as an independent task
- Do not assume shared goals across worktrees
- Include branch and worktree path when writing state
- Never overwrite another worktree’s entry

---

## Handoff Pattern

For tasks longer than ~15 minutes:

- Create `docs/ai/handoffs/YYYY-MM-DD-task-name.md`

Include:
- goal
- progress
- next step
- risks / decisions

---

## Interrupt Conditions

Only interrupt if:

- Public API or external contract changes
- Database schema or migrations
- Auth / security-sensitive logic
- Cross-module dependencies
- Performance risk (\>5%)
- New production dependencies
- Missing secrets / credentials

---

## Do NOT Interrupt For

- Naming, formatting, refactors
- Tests, logging, comments
- Routine DB reads
- Test-only changes (unless impacting above)

---

## Execution Autonomy

Do not ask before:

- git status / log / diff
- reading files or logs
- running tests or lint
- search / grep / cat

---

## Reporting

Report only at milestones:

1) Plan ready  
2) Work complete + tests passing  
3) Final summary  

Final summary must include:

- what changed
- tests run (scope + pass/fail)
- risks
- rollback plan
- follow-ups

---

## Performance Rule

Use measurable baselines (p95 latency, throughput, memory).

Escalate only if >5% degradation expected.

---

## Test Reporting

Always specify:

- changed tests only OR
- impacted suite OR
- full run

---

## Git Workflow

- If user says "commit", proceed without asking
- Prefer small, clean commits
- Do not batch unrelated changes
- Use squash only if explicitly requested
- Default to merge commits for PRs
- During long workflows, commit after each meaningful unit of work (e.g., a new feature, a passing test, a refactor step) — do not wait until the end

### Build Gate

- A successful build must pass before merge (run the project's build script)
- Always report result and where it ran

---

## Web Dev Guidelines

- Measure before optimizing (broken vs slow)
- Add loading UI before deep optimization
- Use local time for timestamps
- Encode formatting examples explicitly

---

## Workspace Rules

- Use `<project-root>/tmp` for temp files (auto-create allowed)

### Logs

- Do NOT ask user to read logs
- Read directly from:
  - `${project}/tmp`
  - `/tmp`

### Docker / Local State

Allowed without asking:
- docker ps / inspect
- docker exec (read-only)
- db inspection commands

---

## Command Execution

- Prefer async for long commands
- Default wait: 10–30s
- Never block >60s