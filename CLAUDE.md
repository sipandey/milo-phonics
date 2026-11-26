# CLAUDE.md — phonics

This file is read automatically by Claude Code. The actual guidance lives in
[`AGENTS.md`](AGENTS.md) and [`.agent-room/`](.agent-room/) — read those
first, this file only adds Claude Code-specific mechanics.

## Skills

The skills in `.agent-room/skills/` are mirrored into `.claude/skills/` so
Claude Code can discover and invoke them (`/brainstorming`,
`/writing-plans`, `/test-driven-development`, `/systematic-debugging`,
`/verification-before-completion`, `/closing-the-loop`).

`.agent-room/skills/` is the source of truth. If you edit a skill, re-run
`create-agent-room sync` to refresh the `.claude/skills/` copies — don't
edit the `.claude/skills/` copies directly, they'll be overwritten.

## Closing-the-loop hook

A `Stop` hook is wired up in `.claude/settings.json`, running
`.agent-room/hooks/close-the-loop-check.js` at the end of every turn. If the
turn changed tracked files outside the agent-room scaffold but didn't touch
`.agent-room/anti-patterns.md` or `.agent-room/decisions.md`, the hook
blocks the turn from ending and explains why. This is mechanical
enforcement of `.agent-room/skills/closing-the-loop.md` — it can't judge
whether an entry is *good*, only that the check wasn't silently skipped.

The exit hatch is a one-line waiver in `decisions.md`:
`<!-- no-log: routine change, no decision or anti-pattern worth recording -->`

The hook only looks at `git status --porcelain`, so unrelated pre-existing
dirty files in the work tree will also trigger it — commit or stash them
first if that gets noisy.

## Browser testing (Playwright MCP)

`.mcp.json` registers the Playwright MCP server (`@playwright/mcp@0.0.86`,
pinned). It drives the installed Google Chrome with `--isolated`, so every
run uses a fresh temporary profile and never touches the user's own Chrome
sign-ins. Claude Code asks once to approve project MCP servers; approve
`playwright`, then restart the session to load its `browser_*` tools.

Before pushing any change that affects screens or audio:

1. Start the dev server (`npm run dev`, port 3000; or the `phonics-dev`
   entry in `.claude/launch.json`).
2. Use the Playwright tools to walk through every changed flow, including
   the parent gate where relevant, and check the browser console for errors.
3. Report what was exercised and what was not (audio can be triggered but
   not listened to).

Scripted walkthroughs live in `scripts/walkthrough/` and drive the same
Playwright MCP server over stdio, so they work even when the `browser_*`
tools are not loaded in the session. With the dev server running, run
`npm run walkthrough` (or `npm run walkthrough -- http://localhost:3100`).
Add a walkthrough script for each new screen.

Playwright output goes to `.playwright-mcp/`, which is git-ignored.

## Git identity & rules

Use this identity for commits in this repo:

```bash
git config user.name "Siddharth Pandey"
git config user.email "siddharth.pandey06@gmail.com"
```

Re-verify (`git config user.name && git config user.email`) before any
push, not just at session start — a global config change or a fresh clone
mid-session can silently reset it.

- Always start a new task by updating main and cutting from latest origin:
  ```bash
  git checkout main && git pull origin main && git checkout -b feature/<name>
  ```
  Never cut a feature branch directly from another unmerged or pre-squashed feature branch, as squashed remote merges will cause false merge conflicts.
- Do not run `git push` unless explicitly asked.
- Do not amend or rewrite history on shared branches without being asked.