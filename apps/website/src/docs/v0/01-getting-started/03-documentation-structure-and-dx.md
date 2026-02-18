---
id: v0-documentation-structure-and-dx
title: "Documentation Structure for Fast Adoption"
description: "A practical playbook for structuring Kortyx docs so beginners ship quickly and advanced users can go deep."
keywords: [kortyx, docs, documentation, onboarding, developer-experience, dx]
sidebar_label: "Docs Structure & DX"
---

# Documentation Structure for Fast Adoption

If developers cannot become productive fast, they will churn. The best framework docs optimize for **time-to-first-success** and then provide clear paths for deeper understanding.

This page proposes a docs structure for Kortyx based on common framework documentation patterns and repeated community feedback.

## What successful framework docs do well

Most high-adoption framework docs follow the same layered model:

1. **Start in minutes**
   - One copy-paste quickstart.
   - A visible “you should now see X” success state.
2. **Teach core mental models**
   - Explain 3–5 key concepts with small diagrams/examples.
   - Keep language consistent across pages.
3. **Task-oriented guides**
   - “How do I do X?” pages (streaming, persistence, auth, tools).
4. **Reference docs**
   - Complete API surface with types, defaults, edge cases.
5. **Troubleshooting + migration**
   - Known errors, FAQs, version changes, and upgrade steps.

This pattern works because beginners need outcomes, while advanced users need precision.

## What developers usually complain about

Repeated complaints across dev communities (including Reddit/HN/GitHub discussions) are very consistent:

- “Too much concept, not enough runnable examples.”
- “No obvious path for my stack.”
- “Quickstart works, but production patterns are unclear.”
- “API reference is incomplete or scattered.”
- “Hard to debug because error messages are undocumented.”
- “Version mismatch between docs and released package.”

If your docs avoid these six failures, adoption improves quickly.

## What makes developers adopt a new framework

Adoption tends to increase when documentation makes these outcomes obvious:

- **Fast payoff:** first useful result in 5–15 minutes.
- **Low risk:** clear install steps, compatibility notes, and fallback paths.
- **Trust:** examples that match real project structures.
- **Scalability:** guidance for moving from toy example to production.
- **Discoverability:** users can answer “where do I look next?” instantly.

## Recommended information architecture for Kortyx

Use this top-level flow in your docs sidebar:

1. **Getting Started**
   - Installation
   - 10-minute quickstart for one default stack
   - “Choose your stack” links (Next.js, Express, etc.)
   - Glossary of core terms
2. **Core Concepts**
   - Workflows
   - Nodes
   - Agent lifecycle
   - Runtime hooks / interrupts
3. **Guides (Task-based)**
   - Add streaming
   - Add persistence
   - Add provider failover
   - Human-in-the-loop patterns
4. **Recipes**
   - Short copy/paste solutions for common tasks
5. **Reference**
   - Package overview
   - API per package
   - Config schema
   - Stream protocol details
6. **Production**
   - Observability
   - Reliability patterns
   - Security checklist
   - Performance tuning
7. **Troubleshooting**
   - Error catalog with causes + fixes
   - FAQ
8. **Migration / Versions**
   - “Upgrade from vX to vY”
   - Breaking changes

## Suggested onboarding path (for DX)

Make this path explicit on the docs home page:

- **Step 1:** Install + run the quickstart.
- **Step 2:** Modify one node and see output change.
- **Step 3:** Add streaming.
- **Step 4:** Add persistence.
- **Step 5:** Read the architecture/concepts pages.

Each step should end with:

- “You now have…” (success criteria)
- “Next 2 pages to read…”
- “Common mistakes…”

## Formatting rules that improve comprehension

- Use short intros: 2–4 lines max before first code block.
- Put complete runnable code before deep explanation.
- Add a “When to use this” section at top of each page.
- Keep one concern per page (avoid mixed tutorial/reference content).
- Always include TypeScript signatures in API docs.
- Add “Last verified with version X.Y.Z” callout for trust.

## A quality checklist for every page

Before publishing, verify:

- [ ] Audience is explicit (beginner/intermediate/advanced).
- [ ] Prerequisites are listed.
- [ ] Example is runnable without hidden steps.
- [ ] Expected output is shown.
- [ ] Failure modes are documented.
- [ ] Next pages are linked.
- [ ] Version compatibility is stated.

## Recommended next improvements in this repo

1. Add a dedicated **Troubleshooting** section with top 10 errors.
2. Add **Recipes** for common integrations.
3. Add a “Start here” landing page with role-based entry points:
   - “I want a chatbot quickly”
   - “I want custom workflow orchestration”
   - “I need provider-level control”
4. Add **production readiness** docs (monitoring, retries, failure handling).

If you do these, Kortyx docs will stay simple for new users while still being strong for advanced teams.
