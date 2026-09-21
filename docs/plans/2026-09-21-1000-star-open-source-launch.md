# 1000-Star Open Source Launch Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Relaunch PaperSwipe Atlas as a trustworthy open-source research tool and add the local, provenance-backed PaperAtlas workflow that can sustain contributor and user interest.

**Architecture:** Keep the existing Next/Vite discovery interface as the public shell. Add local collection ingestion behind explicit adapters, normalize papers into a provenance-preserving domain model, and render the same model as cards, queues, and a typed research graph. Keep the hosted demo secret-free and make private ingestion local by default.

**Tech Stack:** TypeScript, React, Next-compatible Vinext, Vite, OpenAlex, Node test runner, GitHub Actions.

---

### Task 1: Establish the open-source baseline

**Files:**
- Create: `LICENSE`
- Create: `CONTRIBUTING.md`
- Create: `SECURITY.md`
- Create: `ROADMAP.md`
- Create: `.github/ISSUE_TEMPLATE/bug_report.yml`
- Create: `.github/ISSUE_TEMPLATE/feature_request.yml`
- Create: `.github/ISSUE_TEMPLATE/config.yml`
- Create: `.github/pull_request_template.md`
- Modify: `README.md`

**Steps:**

1. Add the MIT license and contributor/security documentation.
2. Replace commercial placeholder copy in the README with an accurate open-source product description.
3. Add structured issue and pull-request templates.
4. Run `npm run lint`, `npm test`, and `npm run build:pages`; expect all checks to pass.
5. Commit as `docs: establish open-source project baseline`.

### Task 2: Remove placeholder paywall behavior

**Files:**
- Modify: `app/page.tsx`
- Modify: `app/about/page.tsx`
- Test: `tests/rendered-html.test.mjs`

**Steps:**

1. Add assertions that the rendered experience links to source and does not advertise an unavailable checkout.
2. Run `node --test tests/rendered-html.test.mjs`; expect the new assertions to fail.
3. Replace pricing controls with open-source and self-hosting calls to action.
4. Run `npm test`; expect all tests to pass.
5. Commit as `feat: make the public beta explicitly open source`.

### Task 3: Add a local collection contract

**Files:**
- Create: `lib/collection.ts`
- Create: `tests/collection.test.mjs`
- Modify: `lib/openalex.ts`

**Steps:**

1. Add failing tests for stable paper IDs, source provenance, missing metadata, and duplicate records.
2. Run `node --test tests/collection.test.mjs`; expect failure because the module does not exist.
3. Implement the minimal normalized paper and evidence-source types plus deterministic merge rules.
4. Adapt OpenAlex results into the new contract without changing ranking behavior.
5. Run `npm test`; expect all tests to pass.
6. Commit as `feat: add provenance-preserving paper collection model`.

### Task 4: Import local PDFs

**Files:**
- Create: `app/api/import/route.ts`
- Create: `lib/pdf-import.ts`
- Create: `tests/pdf-import.test.mjs`
- Modify: `app/page.tsx`

**Steps:**

1. Add fixtures for a valid PDF, a metadata-poor PDF, and an invalid file.
2. Write failing tests for size limits, MIME validation, deterministic IDs, and failure-safe metadata extraction.
3. Implement a local-only import route with explicit limits and no remote upload.
4. Add an import action and clear privacy copy to the interface.
5. Run unit tests and manually verify keyboard and mobile behavior.
6. Commit as `feat: import a local research collection`.

### Task 5: Build the evidence-backed atlas

**Files:**
- Create: `lib/atlas.ts`
- Create: `tests/atlas.test.mjs`
- Modify: `app/page.tsx`

**Steps:**

1. Write failing tests for typed nodes, directional edges, evidence pointers, and graph export.
2. Implement paper, concept, method, and dataset nodes with evidence-backed edges.
3. Replace decorative map data with the normalized graph.
4. Add filters and portable JSON export.
5. Run the complete quality suite and inspect the production build.
6. Commit as `feat: add provenance-backed research atlas`.

### Task 6: Release and upstream credibility

**Files:**
- Modify: `README.md`
- Modify: `ROADMAP.md`
- Create: `CHANGELOG.md`

**Steps:**

1. Record the verified Windows, macOS, and Linux setup matrix.
2. Add a reproducible sample collection and a short demo asset.
3. Publish a beta release only after CI is green.
4. Track upstream pull requests that improve OpenAlex, document parsing, or scientific RAG.
5. Update the roadmap with merged work and remaining risks.
