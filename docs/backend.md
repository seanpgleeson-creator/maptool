# MAP Policy Negotiation Tool — Backend Findings

Based on the product description, here are structured findings for the backend of the MVP.

---

## 1. Responsibilities of the backend

The backend must:

1. **Ingest** item data (UPC, MAP price) and vendor MAP policy files (.doc, .pdf), either single-item or bulk.
2. **Obtain competitor prices** for each UPC from Amazon and Walmart (scraping for MVP).
3. **Analyze the policy** with AI for (a) applicability (all retailers vs segment/channel), (b) specificity of consequences and action steps.
4. **Derive** whether the vendor appears to be enforcing (competitors at or above MAP).
5. **Compute** whether MAP as a floor would hurt competitiveness (MAP higher than market).
6. **Produce** a recommendation and next steps: discuss with vendor or proceed.

---

## 2. Data model and persistence

### 2.1 Core entities

| Entity | Purpose |
|--------|--------|
| **Assessment** | One run: single or bulk items, one policy, one set of results. Fields: id, created_at, status (pending / running / completed / failed), merchant/user reference (if auth exists). |
| **AssessmentItem** | One item in an assessment. Fields: assessment_id, upc, map_price, optional product_label. |
| **PolicyDocument** | Stored policy for an assessment. Fields: assessment_id, file_key (object storage path), file_type (doc/pdf), extracted_text (for AI), extracted_at. |
| **CompetitorPrice** | One scraped result. Fields: assessment_item_id (or assessment_id + upc), source (amazon | walmart), price, currency, scraped_at, raw_response or listing_url (optional). |
| **PolicyAnalysis** | AI output for one policy. Fields: assessment_id, applies_to_all_retailers (bool), segment_description (text, e.g. "big box only"), consequences_specific (bool), consequences_summary (text), enforcement_signal (optional; can be derived). |
| **Recommendation** | Final outcome. Fields: assessment_id, action (discuss | proceed), reasons (JSON or text), per_item_summary (for bulk). |

### 2.2 Storage

- **Relational DB (e.g. Postgres):** Assessments, items, policy metadata, policy analysis, competitor prices, recommendations. Supports history and querying.
- **Object storage (e.g. S3/GCS):** Original policy files (.doc, .pdf) and bulk upload files (CSV/Excel). Reference by key in DB.
- **Cache (e.g. Redis):** Optional cache for competitor prices keyed by UPC (and source) with TTL (e.g. 24–48 hours) to reduce scraping and improve latency on repeat assessments.

---

## 3. Ingestion and validation

### 3.1 Single-item

- **Input:** UPC (string), MAP price (number), policy file (binary).
- **Validation:** UPC format/length; MAP price > 0; file type in {.doc, .pdf}; file size limit (e.g. 10 MB).
- **Flow:** Create Assessment (single AssessmentItem), upload policy to object storage, store PolicyDocument record, enqueue assessment job.

### 3.2 Bulk upload

- **Input:** File (CSV or Excel) with at least: UPC column, MAP price column. One policy file for the run.
- **Validation:** Parse file; validate each row (UPC, numeric MAP); reject or skip invalid rows (with report). Policy file same as single.
- **Flow:** Create Assessment, create many AssessmentItems, upload both files to object storage, store policy, enqueue one assessment job for the whole run.

### 3.3 Policy text extraction

- **Needed for AI:** Plain text from .pdf and .doc.
- **PDF:** Use a library (e.g. pdfplumber, PyMuPDF, or pypdf) or a cloud doc API. Handle scanned PDFs (OCR) if required later.
- **DOC:** Use a library (e.g. python-docx, mammoth) or cloud API. Store extracted text in PolicyDocument.extracted_text (or in object storage if large).
- **Failure:** If extraction fails, assessment can still run price checks; policy analysis section returns "Could not read policy document."

---

## 4. Competitor price retrieval (scraping)

### 4.1 Scope

- **Sources:** Amazon and Walmart only for MVP.
- **Per item:** Look up by UPC (or product identifier); retrieve current advertised/display price(s).

### 4.2 Implementation options

| Approach | Pros | Cons |
|----------|------|------|
| **Direct scraping** | No partner agreement, full control | Fragile (markup changes, blocks, CAPTCHA), rate limits, legal/ToS risk |
| **Headless browser (Playwright/Puppeteer)** | Handles JS-rendered pages | Heavier, slower, still detectable |
| **Official/affiliate APIs** | Stable, compliant | Amazon Product API restricted; Walmart has partner programs — may not be available for all merchants |
| **Third-party price data provider** | Reliable, often UPC-based | Cost, dependency, may be post-MVP |

**MVP recommendation:** Use scraping (or headless if pages require it) with clear product/legal understanding. Isolate in a dedicated worker; implement retries, timeouts, and graceful failure (return partial results).

### 4.3 Design details

- **Async:** Run scraping in a background job per assessment so the API can return quickly (e.g. assessment_id + status).
- **Per UPC:** One or two requests per UPC (Amazon, Walmart). For bulk, fan-out per item; consider rate limiting (e.g. delay between requests, max concurrency) to avoid blocks.
- **Caching:** Cache by (upc, source) with TTL (e.g. 24–48 h). On cache hit, skip scrape and use cached price and scraped_at.
- **Output:** Store in CompetitorPrice (price, listingUrl, errorMessage, scrapedAt). If a source fails, record no row or a row with null price and error reason; UI shows "Unavailable" and continues with other data. When listingUrl is present, the UI shows a “View product” link.
- **Identification:** Amazon/Walmart often use UPC in product pages or search. Implement search-by-UPC or product URL pattern; document and maintain selectors.

### 4.4 Current implementation

- **Walmart:** `lib/walmart.ts` — `getWalmartByUpc(upc)` fetches `https://www.walmart.com/search?q=<upc>`, attempts to parse current price from the response, and always returns a **listing URL** (the search URL). Result is stored in CompetitorPrice (source: walmart). Price may be null if the request is blocked, times out, or the page structure changes; the listing URL is still stored so the user can open Walmart search for that UPC.
- **Amazon:** Placeholder only: a CompetitorPrice row with source amazon, null price, and errorMessage `"Coming soon"`. No fetch implemented yet.
- Both competitor rows are created during the single-item assessment flow (step `checking_prices`) before policy extraction and AI analysis.

---

## 5. Policy analysis (AI)

### 5.1 Inputs and outputs

- **Input:** Extracted policy text (from PolicyDocument).
- **Outputs:**
  1. **Applicability:** Boolean or enum: applies to all retailers vs limited to a segment/channel. If limited, short description (e.g. "big box retailers only").
  2. **Consequences:** Boolean: are there specific action steps for violations? Optional: extracted summary (e.g. "1st warning, 2nd 90-day cutoff, 3rd suspension").

### 5.2 Implementation

- **Model:** Use an LLM API (e.g. OpenAI, Anthropic) with a structured prompt. Prefer **structured output** (JSON) so the app can reliably read applicability and consequences without parsing prose.
- **Prompt:** Include the policy text; ask (a) whether the policy applies to all retailers or only to a segment, and if segment, describe it; (b) whether the policy states specific consequences and steps for violations, and if yes, summarize them.
- **One call per assessment:** Single policy per run; one AI call per assessment. No vector DB or RAG needed for MVP.
- **Failure:** On API failure or timeout, store a failure state in PolicyAnalysis and surface "Policy could not be analyzed" in the result.

---

## 6. Enforcement signal

- **Definition:** "Vendor may be enforcing" if market (Amazon and Walmart) is at or above MAP for the item(s).
- **Computation:** After competitor prices are in:
  - Per item: compare min(Amazon_price, Walmart_price) or each source to MAP; flag "at_or_above_map" per source if price >= MAP.
  - Aggregate (e.g. for summary): e.g. "Enforcement likely if most items / both competitors at or above MAP."
- **Storage:** Can be derived on read from CompetitorPrice + AssessmentItem, or stored in PolicyAnalysis / Recommendation for quick display.

---

## 7. Recommendation and next steps

- **Inputs:** Per-item competitive result (MAP vs market), policy applicability, policy consequence specificity, enforcement signal.
- **Logic (deterministic):** Rule-based, e.g.:
  - **Discuss with vendor** if any of: MAP > market for one or more items (floor would hurt competitiveness); policy applies only to a segment; consequences not specific; optional: enforcement weak (competitors below MAP) so policy may be negotiable.
  - **Proceed** if: MAP ≤ market (or acceptable), policy applies to all, consequences specific, and optionally enforcement present.
- **Output:** action (discuss | proceed), list of reasons (short strings), and per-item summary for bulk. Stored in Recommendation and returned in the chat-like response.

---

## 8. API and job design

### 8.1 Synchronous endpoints

- **POST /assessments** (or /assessments/single): Body: UPC, map_price, policy file (multipart). Response: assessment_id, status: pending.
- **POST /assessments/bulk:** Body: items file (CSV/Excel), policy file (multipart). Response: assessment_id, status: pending, item_count.
- **GET /assessments/:id:** Response: status, and if completed: full result (items, competitor prices, policy analysis, recommendation). If pending/running: status only (or minimal payload).

### 8.2 Async processing

- **Queue:** One assessment job per run. Job steps:
  1. Extract policy text (if not already).
  2. For each item: fetch or use cached competitor prices (Amazon, Walmart).
  3. Call AI for policy analysis (once per assessment).
  4. Compute enforcement and recommendation; persist; optionally notify (e.g. webhook or polling).

- **Polling:** Front end polls GET /assessments/:id until status is completed or failed. Alternatively, WebSocket or SSE to push status updates (optional for MVP).

---

## 9. Security and operations

- **Auth:** If merchants are identified, protect POST/GET with auth and scope assessments by user/org. API keys or JWT as appropriate.
- **Files:** Validate type (allow only .doc, .pdf and CSV/Excel for bulk); limit size; store in private buckets; do not execute or serve as executable.
- **Secrets:** LLM API keys, any proxy credentials — in env or secret manager, not in code.
- **Scraping:** Use timeouts and retries; consider proxy rotation if needed; respect robots.txt and legal constraints.
- **Rate limiting:** Apply to submission and to GET to avoid abuse.

---

## 10. Technology suggestions (stack-agnostic)

| Layer | Options |
|-------|--------|
| **Runtime** | Python (good for scraping, AI SDKs, doc parsing) or Node.js (if team prefers same language as front end). |
| **DB** | Postgres for production; SQLite acceptable for MVP. |
| **Queue** | Redis + Celery (Python), or Bull (Node), or serverless queue (SQS, Cloud Tasks). |
| **Object storage** | S3, GCS, or local filesystem for MVP. |
| **AI** | OpenAI API (or Anthropic, etc.) with structured output. |
| **PDF/DOC** | pdfplumber / PyMuPDF, python-docx / mammoth; or Google Document AI / AWS Textract if OCR needed. |
| **Scraping** | Playwright or Puppeteer (headless); or requests + BeautifulSoup if pages are static. |

---

## 11. Summary

- **Persistence:** Assessments, items, policy metadata + extracted text, competitor prices, policy analysis, recommendation in DB; raw files in object storage; optional Redis cache for prices.
- **Ingestion:** Validate single/bulk input; extract policy text; enqueue one job per assessment.
- **Scraping:** Async worker; Amazon + Walmart per UPC; cache by UPC/source; tolerate partial failure.
- **AI:** One LLM call per assessment for applicability and consequence specificity; structured output.
- **Logic:** Enforcement from market vs MAP; recommendation from rules on competitiveness, policy, and enforcement.
- **API:** POST to create assessment (single or bulk), GET to retrieve status and result; processing asynchronous with polling (or push) for completion.

This gives a clear backend shape for the MVP while leaving room to replace scraping with APIs or price providers and to add auth/history later.
