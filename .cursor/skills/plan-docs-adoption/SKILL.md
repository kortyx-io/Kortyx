---
name: plan-docs-adoption
description: Use when auditing or improving Kortyx/framework documentation for developer adoption. Produces a dead-simple onboarding path for beginners plus deep-dive structure for advanced users, with concrete next-step edits.
---

# Plan Docs Adoption

## Purpose

Turn broad documentation feedback into a concrete, shippable docs plan that improves adoption and time-to-first-success.

## When to use

Use this skill when the request asks for any of the following:

- improve onboarding docs
- compare current docs against successful framework patterns
- reduce DX friction / adoption risk
- collect common docs complaints and convert them into fixes

## Required inputs

- docs root path (for this repo: `apps/website/src/docs`)
- target audience split (beginner, advanced)
- primary framework path(s) to optimize first (e.g. Next.js)

If one is missing, infer from repo and state assumptions.

## Workflow

1. **Audit current docs IA**
   - List sections/pages and identify missing layers:
     - Quickstart
     - Concepts
     - Task guides
     - Reference
     - Troubleshooting
     - Migration
2. **Define onboarding spine (10–15 min path)**
   - First successful outcome
   - 3–5 follow-up tasks in sequence
   - “what to read next” links per step
3. **Capture adoption blockers**
   - Map common complaints to actionable fixes:
     - no runnable examples → add copy/paste recipe
     - unclear production path → add production checklist
     - weak error docs → add error catalog with fixes
4. **Design dual-track docs**
   - Beginner track: outcome-first, minimal concepts
   - Advanced track: architecture + complete API details
5. **Ship concrete artifacts**
   - Add/update at least one docs page
   - Add/update a docs `README.MD` with prioritized next steps

## Output format

Always produce:

1. **Current gaps** (bullets)
2. **Proposed structure** (ordered sections)
3. **Immediate next 3–7 edits** (repo-specific)
4. **Success metrics**
   - time-to-first-success
   - quickstart completion rate
   - % errors with documented fixes

## Quality bar

A docs update is successful only if:

- a new user can run one complete example without guessing hidden steps
- advanced users can find precise API/protocol details in under 2 clicks
- every major guide ends with explicit next pages
