# Product Requirements Document: MAP Policy Negotiation Tool

**Version:** 1.0 (MVP)  
**Status:** Draft  
**Last updated:** February 2025

---

## 1. Overview and vision

### 1.1 Vision

An MVP application that helps **merchants in retail organizations** negotiate MAP (Minimum Advertised Price) policies and values with suppliers. The app ingests item data and vendor MAP policy documents, checks competitor prices (Amazon and Walmart), reviews the policy with AI, and gives a clear recommendation: **discuss with the vendor** or **proceed**.

### 1.2 Problem

Merchants receive MAP policies and MAP prices from vendors but lack a quick way to:

- See if the MAP value, as a floor, would hurt their ability to price competitively.
- Understand whether the policy applies to all retailers or only certain segments.
- Know if the policy spells out specific consequences for violations.
- Gauge whether the vendor is actually enforcing (e.g. competitors at or above MAP).

Without this, merchants cannot confidently decide whether to push back or accept the policy.

### 1.3 Goals

- **Primary:** Enable merchants to decide, with evidence, whether to discuss a vendor’s MAP policy/values or proceed.
- **Experience:** Elegant, simple UI with chat-like output (no internal jargon like “scraping” or “AI”).
- **Scope:** Single-item and bulk workflows; Amazon and Walmart as competitors; .doc and .pdf policy uploads.

---

## 2. User persona

**Merchant (retail organization)**  
- Receives MAP policies and MAP prices from vendors/suppliers.  
- Needs to assess competitiveness, policy fairness, and enforcement before committing.  
- May assess one item at a time or many (e.g. a vendor line list).  
- Uses laptop or tablet; may be in office or on the floor.

---

## 3. User stories and use cases

### 3.1 Single-item assessment

| # | As a… | I want to… | So that… |
|---|--------|-------------|----------|
| S1 | Merchant | Enter one item’s UPC, MAP price, and upload the vendor’s MAP policy (doc/pdf) | I can run an assessment for a single product. |
| S2 | Merchant | Start the assessment with one action (e.g. “Run assessment”) | I don’t have to manage multiple steps. |
| S3 | Merchant | See progress (e.g. “Checking Amazon…”, “Reviewing policy…”) | I know the app is working while I wait. |
| S4 | Merchant | See a chat-like result with competitive prices, policy applicability, consequences, enforcement, and next steps | I can quickly decide to discuss with the vendor or proceed. |

### 3.2 Bulk assessment

| # | As a… | I want to… | So that… |
|---|--------|-------------|----------|
| B1 | Merchant | Upload a file (CSV/Excel) with UPC and MAP price columns and one policy file | I can assess many items under one vendor policy in one run. |
| B2 | Merchant | Optionally confirm column mapping before running | I can fix column mix-ups without re-uploading. |
| B3 | Merchant | See a summary and a table of per-item results plus the same chat-style overall conclusion | I get both detail and a clear recommendation. |

### 3.3 Results and next steps

| # | As a… | I want to… | So that… |
|---|--------|-------------|----------|
| R1 | Merchant | See whether MAP as a floor would hurt competitiveness (MAP vs Amazon/Walmart) | I know if the MAP value is worth renegotiating. |
| R2 | Merchant | See whether the policy applies to all retailers or only a segment (e.g. “big box only”) | I can push back if my segment is unfairly singled out. |
| R3 | Merchant | See whether the policy has specific consequences (e.g. 1st warning, 2nd 90-day cutoff) | I know what I’re agreeing to. |
| R4 | Merchant | See whether competitors are at/above MAP (enforcement signal) | I can gauge if the vendor is enforcing. |
| R5 | Merchant | Get one clear next step: “Discuss with vendor” or “Proceed,” with short reasons | I know what to do next. |

---

## 4. Functional requirements

### 4.1 Input and ingestion

| ID | Requirement | Priority |
|----|-------------|----------|
| F1 | Support single-item entry: UPC, MAP price, one policy file (.doc or .pdf). | P0 |
| F2 | Support bulk upload: file (CSV or Excel) with UPC and MAP price columns; one policy file per run. | P0 |
| F3 | Validate UPC format and MAP price (numeric, > 0); validate policy file type and size (e.g. max 10 MB). | P0 |
| F4 | For bulk: parse file, validate rows; support optional column mapping/preview; report or skip invalid rows. | P1 |
| F5 | Extract text from policy documents for AI analysis; support .pdf and .doc. | P0 |
| F6 | If policy is missing or extraction fails: still allow price-only assessment and surface “No policy” or “Could not read policy” in results. | P1 |

### 4.2 Competitor prices

| ID | Requirement | Priority |
|----|-------------|----------|
| F7 | Retrieve current advertised/display price for each item from **Amazon** and **Walmart** (by UPC or equivalent). | P0 |
| F8 | Run price retrieval asynchronously; return assessment ID and status immediately; process in background. | P0 |
| F9 | Cache competitor prices by UPC and source with TTL (e.g. 24–48 h) to reduce repeated scraping. | P1 |
| F10 | If a source fails for an item: store partial result (e.g. one source only); surface “Unavailable” in UI and still produce recommendation. | P0 |

### 4.3 Policy analysis (AI)

| ID | Requirement | Priority |
|----|-------------|----------|
| F11 | Analyze policy text to determine **applicability**: all retailers vs limited to a segment/channel; if limited, return short description (e.g. “big box retailers only”). | P0 |
| F12 | Analyze policy text to determine **consequence specificity**: whether the policy states specific action steps for violations (e.g. 1st warning, 2nd 90-day cutoff, 3rd suspension); if yes, return a short summary. | P0 |
| F13 | Use structured output (e.g. JSON) from the LLM for reliable parsing. One AI call per assessment (one policy per run). | P0 |

### 4.4 Enforcement and recommendation

| ID | Requirement | Priority |
|----|-------------|----------|
| F14 | Compute **enforcement signal**: “Vendor may be enforcing” when competitors (Amazon/Walmart) are at or above MAP for the item(s). | P0 |
| F15 | Compute **competitiveness**: for each item, determine if MAP as a floor would hurt (MAP higher than market price). | P0 |
| F16 | Produce **recommendation**: **Discuss with vendor** or **Proceed**, with a short list of reasons (e.g. “MAP above market,” “Policy only applies to a segment,” “Consequences not specific”). | P0 |
| F17 | Recommendation logic: Discuss if any of: MAP > market, policy limited to segment, consequences not specific, or (optionally) weak enforcement; otherwise Proceed. | P0 |

### 4.5 API and processing

| ID | Requirement | Priority |
|----|-------------|----------|
| F18 | **POST** endpoint to create single-item assessment (UPC, map_price, policy file); response: assessment_id, status (e.g. pending). | P0 |
| F19 | **POST** endpoint to create bulk assessment (items file, policy file); response: assessment_id, status, item_count. | P0 |
| F20 | **GET** endpoint to fetch assessment by id: status; when completed, full result (items, competitor prices, policy analysis, recommendation). | P0 |
| F21 | Assessment job: extract policy text → fetch/cache competitor prices → run policy AI → compute enforcement and recommendation → persist. | P0 |

### 4.6 User interface

| ID | Requirement | Priority |
|----|-------------|----------|
| F22 | **Home / New assessment:** Choice of “Single item” or “Bulk upload”; then the corresponding input flow. | P0 |
| F23 | Single-item: form with UPC, MAP price, policy file upload (drag-and-drop + file picker); one primary CTA (e.g. “Run assessment”). | P0 |
| F24 | Bulk: upload items file then policy file; optional column mapping/preview; one primary CTA to run assessment. | P0 |
| F25 | **Progress:** Step-by-step messages (e.g. “Checking Amazon…”, “Checking Walmart…”, “Reviewing policy…”) rather than a single spinner. | P0 |
| F26 | **Results:** Chat-like, message-style blocks. Sections: (1) Competitive prices, (2) Policy applicability, (3) Policy consequences, (4) Enforcement, (5) Next steps (Discuss / Proceed + reasons). | P0 |
| F27 | For bulk: same narrative plus a compact table (e.g. UPC, MAP, Amazon, Walmart, “Discuss?”) for per-item results; summary and recommendation at top. | P0 |
| F28 | Copy in merchant language (“MAP price,” “vendor policy,” “competitor prices,” “next steps”); avoid “scraping,” “AI,” “model.” | P0 |
| F29 | Errors: friendly, actionable (e.g. “We couldn’t find this item on Amazon. Check the UPC or try again later.”). | P1 |
| F30 | Responsive layout: usable on laptop and tablet. | P1 |
| F31 | **History (optional for MVP):** List past assessments (date, outcome) for revisit. Defer to post-MVP if needed. | P2 |

---

## 5. Non-functional requirements

| ID | Requirement | Notes |
|----|-------------|--------|
| NFR1 | **Availability** | Core flows (submit, get result) available for normal use; scraping and AI may have transient failures. |
| NFR2 | **Performance** | API responds quickly on submit (async); results available when job completes (polling or similar). |
| NFR3 | **Security** | Validate file types and size; store policy and upload files in private storage; no execution of uploaded files. Secrets (LLM, etc.) in env or secret manager. |
| NFR4 | **Rate limiting** | Apply to submission and GET to prevent abuse. |
| NFR5 | **Accessibility** | Keyboard-accessible file upload; results navigable by headings; sufficient contrast and touch targets (tablet). |

---

## 6. Out of scope for MVP

- Competitors other than Amazon and Walmart.  
- Official Amazon/Walmart APIs or paid price-data providers (MVP uses scraping with known limitations).  
- User accounts, multi-tenant auth, and per-user assessment history (can be added later).  
- Editing or versioning of policies; only one policy per assessment run.  
- In-app vendor communication or contract storage.  
- Dashboard/KPIs; focus is run assessment → read result → next steps.

---

## 7. Success criteria

- Merchants can submit **single-item** and **bulk** assessments (UPC, MAP price, policy file) and receive a **recommendation** (Discuss / Proceed) with reasons.  
- Results are presented in a **chat-like**, easy-to-scan format with competitive prices, policy applicability, consequences, enforcement, and next steps.  
- **Partial failure** is handled: e.g. one competitor unavailable or policy unreadable still yields a useful result.  
- **Tone** is simple and merchant-focused; no implementation jargon in the UI.

---

## 8. Data model (summary)

- **Assessment:** One run (single or bulk); status (pending / running / completed / failed).  
- **AssessmentItem:** UPC, MAP price (optional product label).  
- **PolicyDocument:** File reference, type, extracted text.  
- **CompetitorPrice:** Per item, per source (amazon | walmart); price, scraped_at.  
- **PolicyAnalysis:** applies_to_all_retailers, segment_description, consequences_specific, consequences_summary.  
- **Recommendation:** action (discuss | proceed), reasons, per_item_summary (bulk).

Storage: relational DB (e.g. Postgres or SQLite for MVP); object storage for policy and bulk files; optional Redis cache for competitor prices.

---

## 9. Dependencies and risks

| Item | Mitigation |
|------|------------|
| **Scraping fragility** | Isolate in worker; retries and timeouts; cache; partial results and clear “Unavailable” in UI. |
| **Legal/ToS (scraping)** | Product/legal review; consider moving to APIs or price providers post-MVP. |
| **Policy extraction failure** | Allow price-only run; surface “Could not read policy” and still show price/enforcement/recommendation. |
| **LLM availability/cost** | Use structured output to avoid re-parsing; single call per assessment; consider fallback or degraded message if API fails. |

---

## 10. References

- **description.md** — Original product vision and feature set.  
- **ui.md** — UI findings: flows, output structure, navigation, edge cases, accessibility.  
- **backend.md** — Backend findings: data model, ingestion, scraping, AI, API, security, technology options.
