# ItemHub MAP Guardrails Prototype — Backend Findings

This document distills **backend** requirements and recommendations from [itemhub-map-guardrails-prototype-description.md](itemhub-map-guardrails-prototype-description.md) for the ItemHub MAP guardrails + Target review prototype.

---

## 1. Design principle (backend implication)

MAP is a **gated vendor claim**:

- MAP is **optional**; when provided, it requires policy + metadata + attestations.
- Submission must go through **Target review** before it can influence guardrails.
- **Guardrail eligibility** is a derived field: `eligibleForGuardrail = true` **only** when status is `ACCEPTED`; otherwise `false`.

The backend must enforce status transitions, store reviewer decisions and comments, and expose eligibility for downstream systems.

---

## 2. Data model (from spec)

### 2.1 Item

- `id`
- `title`
- `tcin`, `upc`, `dpci`
- `initialRetailPrice`
- `msrp`
- `thumbnailUrl`
- `compIntel`: `{ marketPrice, marketTimestamp, confidence }` (mock Comp Intel per item)

### 2.2 MAPSubmission

- `id`
- `itemId` (FK to Item)
- `mapApplies` (boolean)
- `mapValue` (number, currency)
- `policyFileName` (string; prototype can mock file upload)
- **metadata:**  
  `effectiveDate`, `expirationDate`, `coveredProducts`, `coveredChannels[]`, `enforcementMechanism`, `cureDays?`, `contactName`, `contactEmail`
- **attestations:**  
  `{ specific, uniform, enforced, independentPricing }` (booleans)
- `status` (enum; see state machine)
- `reviewerComment?` (required when status is CHANGES_REQUESTED or NOT_ACCEPTED)
- `eligibleForGuardrail` (derived: true only when status = ACCEPTED)
- `createdAt`, `updatedAt`, `submittedAt?`

### 2.3 MerchantFlag

- `id`
- `itemId`
- `submissionId`
- `type`: `MAP_ABOVE_MARKET` | `MAP_NEAR_MARKET` | `COMP_INTEL_STALE`
- `severity`: `info` | `warn` | `high`
- `createdAt`
- `status`: `open` | `triaged` | `closed`

Flags are created for **reviewer/merchant** visibility when comp conditions are met; they do not block vendor submission.

---

## 3. State machine (MAP submission status)

### 3.1 Statuses

- `NOT_PROVIDED`
- `DRAFT`
- `SUBMITTED`
- `UNDER_REVIEW`
- `CHANGES_REQUESTED`
- `ACCEPTED`
- `NOT_ACCEPTED`
- `EXPIRED` (when `today > expirationDate`)

### 3.2 Transitions (who can do what)

| From           | To              | Actor   | Notes |
|----------------|-----------------|---------|--------|
| NOT_PROVIDED   | DRAFT           | Vendor  | Select "Yes, MAP applies" |
| DRAFT          | SUBMITTED       | Vendor  | Submit for review |
| SUBMITTED      | UNDER_REVIEW    | System  | Immediate in prototype |
| UNDER_REVIEW   | ACCEPTED        | Reviewer| Sets eligibleForGuardrail = true |
| UNDER_REVIEW   | CHANGES_REQUESTED | Reviewer | reviewerComment required |
| UNDER_REVIEW   | NOT_ACCEPTED    | Reviewer| reviewerComment required |
| CHANGES_REQUESTED | DRAFT         | Vendor  | Edit and resubmit |
| DRAFT          | SUBMITTED       | Vendor  | Resubmit after changes |
| *              | EXPIRED         | System  | When current date > expirationDate |

### 3.3 Guardrail eligibility (critical rule)

- **Only** `ACCEPTED` → `eligibleForGuardrail = true`.
- **All** other statuses → `eligibleForGuardrail = false`.

This must be enforced on every status transition (e.g. in a single place that updates status and recomputes eligibility).

---

## 4. Comp Intel and flag logic

### 4.1 Mock Comp Intel per item

- `marketPrice` (number)
- `marketTimestamp` (date string; used for staleness)
- `confidence`: `high` | `med` | `low`

### 4.2 Configurable constants

- `NEAR_MARKET_PCT = 0.05` (5%)
- Stale threshold: `marketTimestamp` older than **14 days** → `COMP_INTEL_STALE`

### 4.3 Flag trigger rules

Given item’s `compIntel` and submission’s `mapValue`:

1. **MAP_ABOVE_MARKET:** `mapValue > marketPrice`
2. **MAP_NEAR_MARKET:** `mapValue` within `[marketPrice, marketPrice * (1 + NEAR_MARKET_PCT)]` (i.e. 0% to 5% above market)
3. **COMP_INTEL_STALE:** `marketTimestamp` is older than 14 days from today

Multiple flags can apply (e.g. above market + stale). Severity can be derived (e.g. above market = high, near = warn, stale = info) or stored explicitly.

### 4.4 When to create flags

- On **Submit for Target review** (DRAFT → SUBMITTED): evaluate comp logic for that item/submission and create **MerchantFlag** records as needed.
- Flags are for **reviewer/merchant** use; vendor UI does not block on them but may show neutral messaging.

### 4.5 Delta for reviewer UI

- `delta = mapValue - marketPrice`
- `deltaPct = (delta / marketPrice) * 100` (or equivalent)
- Expose in reviewer queue and detail panel along with market price, MAP, timestamp, confidence.

---

## 5. Validations (backend enforcement)

### 5.1 Blocking (reject or disable submit)

When `mapApplies === true`, require:

- `mapValue` present and valid number
- `policyFileName` (or policy file reference) present
- All required **metadata** fields present and valid (effective date, expiration date, covered products/channels, enforcement mechanism, contact name/email; cure days if mechanism requires it)
- All four **attestations** true

**Business rule:** `mapValue` must not exceed item’s `msrp`. If MAP > MSRP → return validation error: *"MAP cannot exceed MSRP."*

### 5.2 Non-blocking (warnings only)

- Comp Intel stale (>14 days) → create flag and/or set warning; do **not** block submission.
- MAP near/above market → create MerchantFlag(s); do **not** block submission.

Vendor submission always succeeds from a validation perspective when blocking rules pass; reviewer then sees flags and can request changes or not accept.

---

## 6. Reviewer actions (API / state updates)

- **Accept**  
  - Set status = `ACCEPTED`.  
  - Set `eligibleForGuardrail = true`.  
  - No comment required.

- **Request changes**  
  - Set status = `CHANGES_REQUESTED`.  
  - Require `reviewerComment`; persist and show to vendor.  
  - `eligibleForGuardrail = false`.

- **Not accept**  
  - Set status = `NOT_ACCEPTED`.  
  - Require `reviewerComment`; persist and show to vendor.  
  - `eligibleForGuardrail = false`.

All transitions that set status must recompute (or set) `eligibleForGuardrail` according to the rule in Section 3.3.

---

## 7. Expiration (EXPIRED status)

- When `expirationDate` (from policy metadata) is before today’s date, status should be treated as or set to `EXPIRED`.
- Can be computed on read (e.g. “effective status”) or updated by a job/cron; prototype may do it on read for simplicity.
- `EXPIRED` → `eligibleForGuardrail = false`.

---

## 8. Prototype vs production

**Spec says:** State in-memory (Context or Zustand); no backend. File upload mocked (store filename only). Routes: `/update-item` and `/review`.

**Backend findings still matter for:**

- **In-memory store shape:** Same entities (Item, MAPSubmission, MerchantFlag) and relationships so that a future backend can replace the store with a DB and APIs without redoing the logic.
- **Single source of truth for:** status transitions, eligibility rule, flag creation rules, and validation rules. Implement these in one place (e.g. reducers or service functions) so both UI and (later) API can call them.
- **Reviewer flow:** Accept / Request changes / Not accept with comments must update the same submission state that the vendor sees (status badge, comment text).

If/when adding a real backend:

- REST or similar: e.g. `GET/POST /items`, `GET/POST/PATCH /items/:id/map-submission`, `GET/POST /review/queue`, `PATCH /review/submissions/:id` (with action + comment).
- Persist Item, MAPSubmission, MerchantFlag; run validations and flag creation on submit; enforce transitions and eligibility in API layer.
- File upload: store policy file in blob storage; store key/URL in MAPSubmission (and optionally keep `policyFileName` for display).

---

## 9. Seed data for demo (from spec)

Three items to demonstrate flags and workflow:

- **Item A:** MSRP 290, market 185 (high confidence)
- **Item B:** MSRP 280, market 188 (med confidence)
- **Item C:** MSRP 120, market 110 (low confidence, **stale**)

Scenarios:

- MAP 180 vs market 185 → no comp flag (MAP below market).
- MAP 190 vs market 188 → **MAP_NEAR_MARKET** (within 5%).
- MAP 210 vs market 185 → **MAP_ABOVE_MARKET**.
- Item C: stale market data → **COMP_INTEL_STALE** (and optionally show warning in vendor UI).

---

## 10. Summary: backend priorities

1. **Data model:** Item (with compIntel), MAPSubmission (with metadata, attestations, status, reviewerComment, submittedAt), MerchantFlag (type, severity, status).
2. **State machine:** Enforce allowed transitions; on any status change, set `eligibleForGuardrail` only when status = ACCEPTED.
3. **Comp Intel and flags:** On submit, compute MAP_ABOVE_MARKET, MAP_NEAR_MARKET, COMP_INTEL_STALE; create MerchantFlag records; expose in reviewer queue and detail.
4. **Validations:** Block submit when MAP applies but required fields/attestations missing or MAP > MSRP; never block on comp flags.
5. **Reviewer actions:** Accept / Request changes / Not accept with required comment for the latter two; persist comment and status.
6. **Expiration:** Treat or set EXPIRED when current date > expirationDate; eligibility false.
7. **Prototype:** Implement the above in-memory with clear boundaries so a future backend can replace the store and reuse the same rules.
