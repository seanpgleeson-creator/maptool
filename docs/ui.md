# MAP Policy Negotiation Tool — UI Findings

Based on the product description, here are structured findings for the user interface of the MVP.

---

## 1. User and goal

- **User:** Merchants in retail organizations.
- **Goal:** Decide whether to push back on a vendor’s MAP (Minimum Advertised Price) policy and values, or to proceed.

The UI should support: entering data (UPC, MAP price, policy), running checks (competitor prices + policy review), and getting a clear “discuss or proceed” recommendation in a simple, chat-like format.

---

## 2. Core flows

### 2.1 Data input

| Input | Single-item | Bulk |
|-------|-------------|------|
| **UPC** | One field | File (e.g. CSV/Excel) with UPC column |
| **MAP price** | One field | Same file, MAP price column |
| **Vendor MAP policy** | One file (.doc or .pdf) | One policy file per run (policy applies to all items in that run) |

**UI implications:**

- **Single-item:** Short form: UPC, MAP price, policy file. Optional: product name/sku for display only.
- **Bulk:** Two steps: (1) Upload file with UPC + MAP price, (2) Upload policy file. Option to preview/confirm column mapping.
- **File upload:** Support .doc and .pdf; drag-and-drop + file picker; show file name and size; clear errors for wrong type/size.

Clarification for product: one policy per “assessment run” (e.g. one vendor) covering many items is the assumed model for bulk.

---

## 3. Processing and feedback

The app does:

1. **Competitor price check** — Scrape Amazon and Walmart for the item, compare to MAP.
2. **Policy review (AI)** — Applicability (all retailers vs segment) and specificity of consequences.
3. **Enforcement signal** — Whether competitors are at/above MAP (enforcement likely).

**UI implications:**

- **Async and slow:** Scraping and AI take time. Need:
  - Single “Run assessment” (or “Analyze”) CTA after input.
  - Clear **loading/progress** (e.g. “Checking Amazon…”, “Checking Walmart…”, “Analyzing policy…”). Prefer step-by-step messages over a single spinner.
  - Graceful **partial results** if one source fails (e.g. “Amazon: $X. Walmart: Unavailable.”) and optional retry.
- **No need to expose** “scraping” or “AI” as implementation details; use merchant language (“Checking competitor prices”, “Reviewing policy”).

---

## 4. Output (results) — chat-like and simple

Requirement: *“The output should be similar to LLM chatbots”* and *“elegant and simple.”*

**Recommended structure:**

- **Format:** Conversational, message-style blocks (not one big form or only tables). Each “message” or card = one idea or section.
- **Sections to show:**
  1. **Competitive prices** — For each item (or summary for bulk): MAP value; **Walmart** price (or “Unavailable”) plus a **“View product →”** link to the comparable product’s page (Walmart search by UPC); **Amazon** shows “Coming soon.” When a source fails, show “Unavailable” and still show the link when available. Whether MAP as a floor would hurt competitiveness → “Worth discussing with vendor” or “OK to proceed from a price perspective.”
  2. **Policy applicability** — Plain-language summary: e.g. “Applies to all retailers” vs “Applies only to [e.g. big box retailers]” with a clear callout if limited.
  3. **Policy consequences** — Whether the policy states **specific** steps (e.g. 1st warning, 2nd 90-day cutoff, 3rd suspension). If vague, call out: “Consequences are not specific; consider asking the vendor for clear steps.”
  4. **Enforcement** — Short statement: e.g. “Competitors are at or above MAP, so the vendor may be enforcing” vs “Competitors are below MAP; enforcement may be loose.”
  5. **Next steps** — One clear line: **“Discuss with vendor”** or **“Proceed.”** Optional 1–2 bullet reasons (e.g. “MAP above market” or “Policy only applies to a segment”).

**Bulk runs:** Keep the chat-like narrative for the *overall* conclusion and policy/enforcement; add a compact **table** (e.g. UPC, MAP, Amazon, Walmart, “Discuss?”) for per-item results, with a summary line at the top.

### 4.1 Info button and “What we look for”

An **info button (ℹ️)** appears next to the “Single item” heading and next to the “Assessment” heading on the results page. When the user clicks it, an **interstitial (modal)** opens titled “What we look for in the policy.” It explains in plain language that the assessment looks at: (1) **Applicability** — whether the policy applies to all retailers or only a segment; (2) **Consequences** — whether the policy spells out specific steps for violations; (3) **Competitive prices** — how MAP compares to Walmart (and Amazon when available); (4) **Next step** — why we recommend “Discuss with vendor” or “Proceed.” The modal can be closed via a × button or by clicking outside. This keeps the UI simple while giving users a clear reference for what the AI is evaluating.

---

## 5. Navigation and information architecture

Keep the MVP to a small set of screens:

- **Home / New assessment** — Choice: “Single item” or “Bulk upload,” then the relevant input flow.
- **Results** — Same “conversation” view for both single and bulk; bulk adds a table or expandable list.
- **History (optional for MVP)** — List of past assessments (date, vendor/policy name, outcome) so merchants can revisit. If omitted for MVP, state it as a post-MVP feature.

No need for a dashboard with KPIs; focus on “run assessment → read result → next steps.”

---

## 6. Tone and clarity

- **Elegant and simple:** Few steps, minimal jargon, one primary action per screen (e.g. “Add item” or “Run assessment”).
- **Copy:** Use “MAP price,” “vendor policy,” “competitor prices,” “next steps.” Avoid “scraping,” “model,” “embedding,” etc.
- **Errors:** Friendly, actionable messages (e.g. “We couldn’t find this item on Amazon. Check the UPC or try again later.”).

---

## 7. Edge cases and states

| Case | UI approach |
|------|-------------|
| Policy not ready | Allow “Run without policy” for price-only check; policy review section shows “No policy uploaded” and only price + enforcement. Or require policy and show a clear message. Product decision needed. |
| Competitor unavailable | Show partial results; “Walmart: —” or “Unavailable”; still show recommendation with a note. |
| Many items in bulk | Pagination or virtualized table; summary and recommendation always visible at top. |
| First-time user | Short empty state: “Add an item or upload a file to see if this MAP is worth discussing with your vendor.” |

---

## 8. Accessibility and technical UX

- **Responsive:** Usable on laptop and tablet (merchants may be in office or on the floor).
- **File upload:** Keyboard-accessible; label and error messages associated for screen readers.
- **Results:** Headings and sections so the chat-like output is navigable (by heading and by section).
- **Contrast and touch targets:** Buttons and links large enough for touch; sufficient contrast for text.

---

## 9. Summary

- **Input:** Simple form (single) or upload + policy (bulk); .doc/.pdf only; optional column mapping for bulk.
- **Process:** One main CTA; step-by-step progress; partial results and retry where needed.
- **Output:** Chat-like, message-by-message summary (competitive price, policy applicability, policy consequences, enforcement, next steps); table for bulk items; single clear recommendation: discuss with vendor or proceed.
- **Navigation:** New assessment (+ single vs bulk) and results; history optional later.
- **Tone:** Simple, elegant, merchant-focused language and minimal steps.

This keeps the MVP focused on the merchant’s decision (discuss or proceed) while supporting both single-item and bulk workflows and the requested chatbot-style output.
