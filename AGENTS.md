# Director Autonomy Policy

Operate in Enterprise Autonomous Mode.

After an implementation plan is approved by the user/director, proceed autonomously.

Do not ask for permission or confirmation before using "superpower" skills or any other specialized agent skills; execute them as part of your autonomous workflow.

Do not ask for approval or provide explanations before:
- Running `git log`, `git status`, or other source control state commands.
- Reading files, running tests (`npm run test`), or running lint.
- Running common 'read-only' commands (grep, glob, cat, etc.).

Only interrupt me if any of these change or are required:

- Public API surface or external contract
- Database schema or migrations
- AuthN/AuthZ or security-sensitive logic
- Cross-module dependency boundaries
- Performance risk (expected >5% degradation) or large memory increase
- New production dependencies
- Missing required secrets/credentials (API keys, tokens, account IDs)

Do not interrupt for:

- naming, formatting, internal refactors, test improvements, logging, comments
- routine DB reads
- test-file changes unless they affect API/schema/security/dependencies/perf-risk

Batch reporting at milestones:

1) Plan ready
2) Work completed + tests passing
3) Final diff + risks + rollback

Always include in final message:

- what changed
- tests run/results (scope covered + pass/fail)
- risks
- rollback plan
- follow-ups

Performance guideline for escalation:

- Use measurable baselines when evaluating the >5% rule (for example: p95 route latency, throughput, or memory RSS).

Test reporting scope guideline:

- "Tests passing" should state whether this means changed tests only, impacted suite, or full project CI subset.

# Git Workflow

- Do not ask for git command confirmation when the user prompt is already about committing.
- When the user says "commit", do not ask follow-up questions about running `git add` or `git commit`; execute the commit workflow directly.
- Prefer small, sequential commits after each coherent change so history stays readable.
- Do not batch unrelated or loosely related work into one large commit when it can be split cleanly.
- Use squash only for explicit WIP cleanup or when the user specifically asks for it.
- Default to `--merge` for PR merges to preserve full commit history.
- Prefer branch-first workflow when PR-only is desired; avoid direct pushes to initial-v1 unless explicitly requested.
- Treat `npm run build` as a mandatory branch review and PR merge gate for app changes. Run it on the branch head before review sign-off, and do not merge while it is failing.
- When documenting PR readiness or merge readiness, explicitly report the latest `npm run build` result and whether it was run on the branch head or merge target.

# Web Dev

- For perceived navigation issues, measure route timings first and separate "link broken" from "slow route."
- When route latency is known, add/keep route-level loading UI before deeper query optimization.
- Use local-time display for activity timestamps (relative | date | local time).
- When adding UX formatting rules, encode explicit examples in plan/comments (e.g., "11750 Fair Lakes Parkway, Fair Oaks, Virginia").

# Workspace & File System

- Use `${project folder}/tmp` as the primary temporary working folder for generated files, intermediate data, or scratchpad work.
- You have autonomous permission to create the `tmp` directory and write to it without asking for user confirmation, unless the writes are exceptionally large or potentially destructive.
- Never prompt the user to read log files (e.g. `*.log`, `*.txt`). Instead, read them directly yourself — whether they are in `${project folder}/tmp/` or the system `/tmp/` folder. Any file in those two folders should be read directly without asking the user.
- When the user asks to inspect local Docker or Supabase state, treat read-only Docker commands and read-only inspection inside running containers as pre-approved. Do not ask for confirmation for routine reads such as `docker ps`, `docker inspect`, `docker exec ... psql`, `docker exec ... find`, `docker exec ... cat`, or similar non-mutating checks.
- When executing terminal commands, do not wait an excessively long time for completion. Suggest waiting no more than 30 seconds, and most times it should be 10 seconds or less. It should never be more than 60 seconds. Always set a short `WaitMsBeforeAsync` duration and monitor long-running commands asynchronously using `command_status`. Command outputs often fail to capture when waiting synchronously for long periods.
