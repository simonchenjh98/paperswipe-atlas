# Roadmap

The one-month goal is to turn a polished demo into a useful, auditable,
contributor-ready research tool. One thousand GitHub stars is a launch target,
not a guarantee; product usefulness and retained contributors are the primary
quality signals.

## Week 1: Open-source release baseline

- Publish an explicit license, contribution guide, security policy, templates, and roadmap.
- Remove placeholder subscription language from the public experience.
- Make the README explain the problem, differentiation, quick start, limits, and architecture.
- Add repository topics, homepage metadata, Discussions, and a tagged beta release.

## Week 2: Local research collection

- Import a folder of PDFs without uploading the collection.
- Extract stable metadata and preserve source provenance.
- Generate contribution cards with evidence pointers and confidence states.
- Add deterministic fixtures and failure-safe parsing tests.

## Week 3: PaperAtlas graph

- Model papers, concepts, methods, and datasets as distinct node types.
- Store directional, evidence-backed relationships.
- Add filters, search, and an explainable “read next” queue.
- Export BibTeX and a portable JSON graph.

## Week 4: Release and distribution

- Publish a reproducible sample collection and a 60-second demo.
- Ship a stable release with migration notes and a one-command local setup.
- Submit useful upstream contributions to research-tooling projects.
- Launch through research-engineering communities and respond to every actionable issue.

## Launch gates

- Clean install succeeds on Windows, macOS, and Linux CI.
- The demo works without an account or secret.
- Every generated relationship retains a source pointer.
- No private document content leaves the user's environment by default.
- New contributors can complete setup and tests from the public documentation.
