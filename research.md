# Raksha Bandhu — Research Paper Agenda

**Project:** Raksha Bandhu — Fire Safety & Emergency Response Infrastructure Platform
**Purpose of this document:** Working agenda for turning the existing project into a research paper submission (Avishkar: Maharashtra State Inter-University Research Convention), covering code cleanup, documentation, evaluation, and writing.

---

## Overview

The project has two layers worth separating clearly in the paper:

1. **Application layer** — NOC applications, safety inspections, admin panel, SOS/WhatsApp alerts.
2. **Infrastructure layer** — multi-container Docker architecture with health checks, resource limits, isolated networking. *(This is the strongest, most paper-worthy contribution.)*

Before writing, a few real issues in the codebase need to be resolved or explicitly documented as limitations, most importantly: both backends currently use in-memory storage instead of the MongoDB integration they're set up for, and admin authentication is a hardcoded client-side check. See Phase 2 for details.

---

## Phase 1 — Scope Decision

**What needs to be done:**
- Decide the paper's framing:
  - **Option A (Infrastructure paper):** Focus on the Docker/containerization architecture as the core contribution.
  - **Option B (Full-system paper):** Present it as an end-to-end e-governance/fire-safety platform (requires more code fixes to avoid overclaiming).
  - **Recommended:** Option A, with application features described as use cases the infrastructure supports.

---

## Phase 2 — Codebase Cleanup

**What needs to be done:**
1. Add a `.gitignore` (exclude `node_modules/`, `.env`, `uploads/*`).
2. Remove already-committed `node_modules` and sample uploaded PDF from the repo.
3. Resolve the MongoDB inconsistency: either wire up the existing Mongoose model/routes (`inspectionBackend/models/safetyReview.js`, `inspectionBackend/routes/safetyReview.js`) into both servers and retire the in-memory arrays, **or** delete the orphaned Mongo files and document in-memory storage as an intentional demo-scope decision with MongoDB integration as future work.
4. Replace the hardcoded client-side admin login with at least a server-side credential check.
5. Add basic auth middleware (API key or JWT) on mutating admin/inspection endpoints.
6. Restrict CORS to the actual frontend origin instead of `*`.
7. Add a real healthcheck for the inspection-backend container (current one, `["CMD","ps"]`, always passes).
8. Add `.env.example` files; keep real `.env` out of version control.

**Outcome:**
- A cleaned repository where the code and the paper's claims match.
- A documented, defensible list of "current limitations / future work" items for anything not fully fixed.

**Resources:**
- Docker build best practices (non-root users, multi-stage builds): https://docs.docker.com/build/building/best-practices/
- Healthchecks reference: https://docs.docker.com/reference/dockerfile/#healthcheck
- OWASP REST API security cheat sheet (for the auth/CORS fixes): search "OWASP REST Security Cheat Sheet"

---

## Phase 3 — Literature Review & Positioning

**What needs to be done:**
- Search for and read 8–15 sources covering:
  - Municipal e-governance digitization systems.
  - Fire-NOC / permit management systems (if any prior work exists).
  - Containerized microservice deployment for public-sector or resource-constrained applications.
  - Container vs. VM performance/overhead comparisons.
  - Emergency SOS / alerting systems using messaging APIs.
- Position the project's contribution relative to this prior work (e.g., "lightweight container orchestration suitable for resource-constrained municipal IT infrastructure").

**Outcome:**
- Annotated bibliography (8–15 sources) with 1–2 sentence summaries each.
- A drafted "Related Work" section outline.

**Resources:**
- Google Scholar search: "container orchestration lightweight virtualization comparison"
- Google Scholar search: "Docker performance overhead virtual machines" (Felter et al., IBM study, is the standard starting citation for container-vs-VM benchmarking)
- Google Scholar search: "e-governance digitization municipal services"

---

## Phase 4 — System Design Documentation

**What needs to be done:**
- Turn the existing README architecture diagram into a proper figure (frontend → NOC backend / inspection backend → network).
- Create a data-flow diagram for the NOC submission workflow.
- Create a sequence diagram for the SOS/WhatsApp emergency workflow.
- Document the finalized data model (using the Mongoose schema as the canonical model, even if the demo runs in-memory).
- Produce an API specification table (endpoint, method, purpose, auth requirement).
- Write up the Docker infrastructure design rationale: why per-service containers vs. a monolith, why Alpine images, why the specific network/health-check/resource-limit choices.

**Outcome:**
- 3–4 finished figures (architecture, data flow, sequence diagram).
- A written "System Design" section draft.
- An API specification table.

**Resources:**
- Docker Compose file reference: https://docs.docker.com/compose/
- Docker networking (bridge networks): https://docs.docker.com/engine/network/
- Any diagramming tool (draw.io, Mermaid, Excalidraw) for figures.

---

## Phase 5 — Evaluation / Results

**What needs to be done:**
- Measure container resource usage under load (`docker stats` output, or a simple load test with a tool like `autocannon` or `ab`).
- Measure API response latency for key endpoints.
- Measure container startup time; compare qualitatively to a hypothetical monolithic deployment.
- If persistence was fixed in Phase 2, test data durability across container restarts and report it as a result.
- Do a functional walkthrough of the SOS workflow with timing and screenshots.

**Outcome:**
- A results section with at least one table and one chart (resource usage, latency, or startup time).
- A short functional demo write-up (SOS workflow trace).

**Resources:**
- Docker resource constraints reference: https://docs.docker.com/engine/containers/resource_constraints/
- `autocannon` (Node.js load-testing tool) or Apache Bench (`ab`) documentation.

---

## Phase 6 — Writing the Paper

**What needs to be done:**
- Draft each section in order: Abstract → Introduction → Related Work (Phase 3) → System Architecture (Phase 4) → Implementation → Evaluation (Phase 5) → Limitations & Future Work → Conclusion.
- Be explicit in "Limitations" about anything not fully fixed in Phase 2 (e.g., in-memory storage, minimal auth) rather than glossing over it.
- Iterate on the abstract last, once the full paper is stable.

**Outcome:**
- A complete first draft of the paper, formatted to the target template.

**Resources:**
- Avishkar's official paper template (from Phase 1).
- General academic writing guide: Purdue OWL (https://owl.purdue.edu/) for structure and style conventions.

---

## Phase 7 — Figures & Polish

**What needs to be done:**
- Finalize all diagrams from Phase 4 and charts from Phase 5.
- Add UI screenshots (NOC form, admin panel, inspection page, SOS flow).
- Full proofreading pass; check citation formatting matches the required style.
- Tighten the abstract and introduction to fit any word/page limits.

**Outcome:**
- A polished, submission-ready draft.

**Resources:**
- Reference manager (Zotero or Mendeley) for consistent citation formatting.

---


## Summary Table

| Phase | Focus | Key Tasks | Outcome | Key Resource(s) |
|---|---|---|---|---|
| 1 | Scope Decision | Choose paper framing (infra vs. full-system); confirm template & page limit | Scope statement + confirmed format | Avishkar CFP / guidelines |
| 2 | Codebase Cleanup | Fix persistence inconsistency, fake auth, CORS, healthchecks, repo hygiene | Cleaned repo matching paper's claims | Docker best practices; OWASP REST cheat sheet |
| 3 | Literature Review | Find & summarize 8–15 sources on e-governance, containerization, SOS systems | Annotated bibliography + Related Work outline | Google Scholar searches |
| 4 | System Design Documentation | Architecture/data-flow/sequence diagrams, data model, API spec | 3–4 figures + System Design section + API table | Docker Compose & networking docs |
| 5 | Evaluation / Results | Resource usage, latency, startup time, durability, SOS workflow trace | Results section with table/chart | Docker resource constraints docs; autocannon/ab |
| 6 | Writing the Paper | Draft all sections in order; document limitations honestly | Complete first draft | Avishkar template; Purdue OWL |
| 7 | Figures & Polish | Finalize diagrams/screenshots, proofread, format citations | Submission-ready draft | Zotero/Mendeley |
