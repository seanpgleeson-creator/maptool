# ItemHub MAP Guardrails — Execution Checklist

Feature-driven order. Tasks marked **[PARALLEL]** can be executed in parallel with others in the same group (same phase or same "can run with" note). Scope: `app/itemhub/` and `lib/itemhub/` only.

**Sources:** [PRDitemhub.md](PRDitemhub.md), [itemhub-map-guardrails-prototype-description.md](itemhub-map-guardrails-prototype-description.md), [uiitemhub.md](uiitemhub.md), [backenditemhub.md](backenditemhub.md).

---

## Phase 0: Foundation

*Nothing depends on this; everything else does.*

- [x] **0.1** Define TypeScript types in `lib/itemhub/`: `Item` (with `compIntel`), `MAPSubmission` (metadata, attestations, status, reviewerComment, eligibleForGuardrail), `MerchantFlag`, `CompIntel`. Enums for status, flag type, severity.
- [x] **0.2** Create in-memory store (Zustand or Context) in `lib/itemhub/`: hold items, MAP submissions by itemId, merchant flags. Single place for status transitions and eligibility rule (`eligibleForGuardrail` only when status = ACCEPTED).
- [x] **0.3** Add seed data: 3 items per spec (Item A: MSRP 290, market 185 high; Item B: MSRP 280, market 188 med; Item C: MSRP 120, market 110 low, **stale**). Include tcin, upc, dpci, title, thumbnailUrl, initialRetailPrice, compIntel (marketPrice, marketTimestamp, confidence).
- [x] **0.4** Routes: ensure `/itemhub` (Update Item) and `/itemhub/review` (Reviewer) exist and render a minimal shell so navigation works.

**Parallel:** 0.1 and 0.3 can be done together (types first, then seed data conforming to types). 0.2 depends on 0.1. 0.4 can start once 0.1 exists (no store needed for empty routes).

---

## Phase 1: App shell (Vendor view)

*Single feature: full layout so the Pricing card has a home.*

- [x] **1.1** Top bar: ItemHub logo/wordmark left, center "Q Search", right help icon, bell icon, vendor avatar + name (e.g. "John Doe").
- [x] **1.2** Left nav: Home, **My Items** (selected), My Tasks, Item Health. Selected state on My Items (e.g. subtle gray + indicator).
- [x] **1.3** Main content top: breadcrumb "My Items / Update Item", page title "Update Item", "3 items selected" link, orange "20 attributes need attention across 2 attribute groups.", content "Q Search", "Smart Fill with AI" (primary), "Bulk edit" (secondary).
- [x] **1.4** Two-column area: left = Attribute Groups (title + circular progress e.g. 40%), list Basic Details, Media, Content, **Pricing** (selected, 100% bar); right = placeholder for Pricing card. Use Tailwind: bg-slate-50, white cards, border-slate-200, blue primary, orange for needs attention.
- [x] **1.5** Vendor context: banner or line near page title — "You are signed in as a Vendor user submitting item attributes and pricing information to Target."

**Parallel:** 1.1, 1.2, 1.3 can be built in parallel; 1.4 and 1.5 can follow or run with 1.1–1.3 once layout structure exists.

---

## Phase 2: Pricing card and item rows (no MAP block yet)

*Feature: existing Pricing experience so we can drop in the MAP block next.*

- [x] **2.1** Pricing card: header "Pricing", subtitle "Provide attributes such as MSRP and MAP.", "03 Items" (or dynamic count) with expand/collapse arrow.
- [x] **2.2** Toggle: "Apply to all items" (default inactive) | "Edit each item" (active). Same row as item count.
- [x] **2.3** Item rows (from store): thumbnail, product title, TCIN/UPC/DPCI, status tag (e.g. PENDING SETUP), Initial Retail Price (read-only), **MSRP (in $)\*** input. Bind MSRP to store.
- [x] **2.4** Item navigation: "<", ">", refresh/undo when multiple items; show one item at a time in "Edit each item" or all in "Apply to all" (spec: apply-to-all can use same row pattern repeated).

**Parallel:** 2.1 and 2.2 are independent; 2.3 and 2.4 depend on 2.1/2.2. 2.3 and 2.4 can be done in parallel once the card and toggle exist.

---

## Phase 3: MAP block and submit flow (core vendor MAP feature)

*Feature: optional MAP, policy + metadata + attestations, Save Draft / Submit, state machine, validations.*

- [x] **3.1** In each item row, **replace** single MAP input with **MAP section**: block title "Minimum Advertised Price (MAP)", status badge (Not provided | Draft | Submitted | Under review | Accepted | Changes requested | Not accepted | Expired), inline helper "MAP is optional. If provided, a specific, uniformly enforced policy is required and will be reviewed by Target."
- [x] **3.2** "Does a MAP policy apply to this item?" — Radio **No** (default) | **Yes**. When Yes: MAP currency input, Upload MAP policy (mock: store filename), policy metadata form (effective date, expiration date, covered products, covered channels, enforcement mechanism, cure days if applicable, enforcement contact name/email), four attestation checkboxes, CTA row "Save Draft" | "Submit for Target review".
- [x] **3.3** Required vendor copy above or near attestations (all three strings from spec §15 / uiitemhub §12).
- [x] **3.4** State machine in store: NOT_PROVIDED → DRAFT (select Yes); DRAFT → SUBMITTED (Submit); SUBMITTED → UNDER_REVIEW (immediate in prototype). Enforce eligibility: only ACCEPTED → eligibleForGuardrail = true.
- [x] **3.5** Validations: when MAP applies, disable Submit until mapValue present, policy file present, all required metadata and all four attestations complete; and enforce MAP ≤ MSRP (show "MAP cannot exceed MSRP." if violated). Non-blocking: do not block on comp flags or stale data.
- [x] **3.6** On Submit: create MerchantFlag(s) when MAP_ABOVE_MARKET, MAP_NEAR_MARKET (5%), or COMP_INTEL_STALE (marketTimestamp > 14 days). Expose flags in store for reviewer; vendor sees neutral submission banner ("Your MAP submission will be reviewed by Target…") and optional note if near/above market.

**Parallel:** 3.1–3.3 (MAP block UI) can be built in parallel with 3.4–3.5 (state machine + validations in lib/itemhub) if two streams; then 3.6 (flag creation on submit) after 3.4 is done.

---

## Phase 4: "Behind the scenes" drawer (vendor education)

*Feature: transparency and live Comp Intel example.*

- [ ] **4.1** Info button "How Target reviews MAP" next to MAP section title; opens right-side drawer (or modal).
- [ ] **4.2** Drawer content (four sections): (1) What happens when you submit MAP, (2) How MAP may be used, (3) What may cause follow-up, (4) **Live example**: Market Price $X, Submitted MAP $Y, Delta, flag status (MAP_NEAR_MARKET / MAP_ABOVE_MARKET / COMP_INTEL_STALE). Use current item’s compIntel and current submission mapValue.

**Parallel:** Can run in parallel with Phase 5 (Reviewer console) once Phase 3 is done; both only need store and item/submission data.

---

## Phase 5: Reviewer console

*Feature: internal view — queue, detail, actions, comments.*

- [ ] **5.1** Route `/itemhub/review` (or header "View as: Vendor | Target Reviewer" toggle). Reviewer view: queue of MAP submissions.
- [ ] **5.2** Queue table columns: Item (title + TCIN), Submitted MAP, Market price, Delta / Delta%, Flags (pills), Status, Submitted date. Row click opens detail panel.
- [ ] **5.3** Detail panel: policy document link (mock), metadata summary, attestations, Comp Intel comparison + flag pills and severity, comment box (required for Request changes / Not accept), actions: **Accept** | **Request changes** | **Not accept**.
- [ ] **5.4** Wire actions: Accept → status ACCEPTED, eligibleForGuardrail true; Request changes → CHANGES_REQUESTED, persist reviewerComment; Not accept → NOT_ACCEPTED, persist reviewerComment. Vendor view shows updated status and reviewer comment when CHANGES_REQUESTED or NOT_ACCEPTED.
- [ ] **5.5** Expiration: when today > submission metadata expirationDate, treat or set status EXPIRED; eligibleForGuardrail false (e.g. on read or on open of reviewer queue).

**Parallel:** 5.1–5.2 and 5.3 can be split; 5.4–5.5 depend on 5.3. Phase 5 can run in parallel with Phase 4.

---

## Phase 6: Polish and strings

*Feature: mode toggle (if not done in 5.1), all copy, styling pass.*

- [ ] **6.1** Ensure Vendor | Target Reviewer mode toggle is in header (or clearly accessible) so prototype requires no auth.
- [ ] **6.2** All UI strings from spec §15 / uiitemhub §12: vendor context, MAP helper, Target independence, guardrail eligibility, submission banner, comp note, MAP > MSRP error, reviewer flag labels ("MAP above market price", "MAP near market price", "Market data may be stale").
- [ ] **6.3** Styling pass: Tailwind tokens throughout (bg-slate-50, cards, borders, primary blue, orange needs-attention, progress bars, spacing 16–24px). Match existing ItemHub look and feel per uiitemhub §0 and §10.

**Parallel:** 6.1, 6.2, and 6.3 can be done in parallel.

---

## Phase 7: Acceptance check

*Verify against PRD and spec §13.*

- [ ] **7.1** Page matches ItemHub Update Item / Pricing layout; vendor context and MAP optional + gated messaging explicit.
- [ ] **7.2** MAP optional and gated by "MAP applies" radio; policy + metadata + attestations required only when MAP applies; Submit creates review state and merchant flags when comp conditions hit.
- [ ] **7.3** "Behind the scenes" drawer shows dynamic explanation and live calculation; reviewer console Accept / Request changes / Not accept reflect in vendor view; guardrail eligibility only true when Accepted.
- [ ] **7.4** Seed scenarios: MAP 180 vs 185 no flag; MAP 190 vs 188 near-market flag; MAP 210 vs 185 above-market flag; Item C stale warning.

---

## Summary: parallel groups

| After phase | Can run in parallel |
|-------------|----------------------|
| 0 | 1.1, 1.2, 1.3 (shell pieces); 1.4, 1.5 after layout |
| 1 | 2.1, 2.2 then 2.3, 2.4 |
| 2 | 3.1–3.3 (MAP block UI) and 3.4–3.5 (state + validations); then 3.6 |
| 3 | **Phase 4 (drawer)** and **Phase 5 (reviewer console)** |
| 4, 5 | 6.1, 6.2, 6.3 (polish) |
