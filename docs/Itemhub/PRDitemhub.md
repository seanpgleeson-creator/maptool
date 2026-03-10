# ItemHub MAP Guardrails — Product Requirements Document

**Summary:** A vendor-facing ItemHub prototype that treats Minimum Advertised Price (MAP) as an optional, gated vendor claim. When MAP is provided, vendors must submit a policy, metadata, and attestations; submissions go through Target review before becoming eligible to influence pricing guardrails.

---

## 1. Problem and principle

### Problem

MAP is currently collected as a required field with no validation of policy quality or enforceability. If the MAP policy is not strict or not enforced, MAP becomes a poor pricing guardrail and can negatively impact guest experience downstream.

### Principle

Treat MAP as a **gated vendor claim**, not a required free-text number:

- MAP is **optional**.
- If the vendor claims MAP applies, they must provide a **policy document**, **structured enforceability details** (metadata), and **attestations**.
- Submission must go through **Target review** before being eligible to influence guardrails.

---

## 2. Goals

| Stakeholder | Goal |
|-------------|------|
| **Vendor** | Provide accurate item and pricing attributes so Target can set up, sell, and maintain items correctly. |
| **Target** | Accept vendor-submitted data while protecting guest experience and pricing integrity. |
| **Prototype** | Address MAP at the point of vendor submission using guardrails and visibility—rather than accepting MAP blindly and discovering issues later—with a specific, uniformly enforced policy and Target review before guardrail eligibility. |

---

## 3. Users and context

- **Primary user:** A **Target vendor (supplier)** using ItemHub to submit and maintain item attributes, including pricing (e.g. MSRP, MAP) and other item data.
- **Secondary user:** **Target reviewer** (internal) who accepts, requests changes, or does not accept MAP submissions.

Vendor identity and context must be explicit in the UI (e.g. banner or line near the page title): *"You are signed in as a Vendor user submitting item attributes and pricing information to Target."*

---

## 4. Scope

### In scope

- **Screen A — Update Item → Pricing (vendor view):** Modify the existing ItemHub Update Item / Pricing screen. Replace the single MAP input with a **MAP block** per item row: status badge, "Does MAP apply?" (No/Yes), and when Yes: MAP value, policy upload, policy metadata, attestations, Save Draft / Submit for Target review. Keep existing shell: top bar, left nav, Attribute Groups list, Pricing card, "Apply to all items / Edit each item" toggle.
- **Screen B — Reviewer console (internal view):** A separate route or "View as: Vendor | Target Reviewer" toggle. Queue of MAP submissions, competitive price flags (Comp Intel), submission detail with policy + metadata + attestations + actions: Accept / Request changes / Not accept (with required comment for the latter two).
- **Vendor education:** "How Target reviews MAP" info control opening a right-side drawer with explanation and live Comp Intel example (market price, MAP, delta, flag status).
- **Guardrail eligibility:** Only ACCEPTED submissions set `eligibleForGuardrail = true`; all other statuses do not.

### Prototype constraints

- No authentication; use a mode toggle (Vendor | Target Reviewer) for convenience.
- State in-memory (e.g. Context or Zustand); no persistent backend.
- File upload mocked (store filename only).
- Routes live under the existing `/itemhub` app (e.g. update-item, review or mode toggle).

---

## 5. Key product requirements

| Area | Requirement |
|------|-------------|
| **MAP optional and gated** | MAP is optional. When "MAP applies" = Yes, vendor must provide: MAP value, policy upload (PDF/DOC/DOCX), policy metadata (effective/expiration date, covered products/channels, enforcement mechanism, contact), and all four attestations. |
| **Target review workflow** | Status lifecycle: Not provided → Draft → Submitted → Under review → Accepted / Changes requested / Not accepted / Expired. Only reviewer can move from Under review to Accepted, Request changes, or Not accept. Request changes and Not accept require a reviewer comment. |
| **Guardrail eligibility** | Only status **ACCEPTED** sets `eligibleForGuardrail = true`. All other statuses must have `eligibleForGuardrail = false`. |
| **Validations** | When MAP applies: block Submit if MAP value missing, policy missing, any required metadata or attestation missing, or **MAP > MSRP** (show error: "MAP cannot exceed MSRP."). Comp Intel conditions (MAP above/near market, stale data) do **not** block submission; they create internal flags for reviewer and may show neutral vendor messaging. |
| **Comp Intel and flags** | On submit, evaluate item's mock Comp Intel vs submitted MAP. Create merchant flags when: MAP > market (MAP_ABOVE_MARKET), MAP within 5% above market (MAP_NEAR_MARKET), or market data older than 14 days (COMP_INTEL_STALE). Flags are for reviewer visibility; vendor sees neutral submission message and optional note if near/above market. |
| **Vendor copy** | Required vendor-facing copy (policy requirement, Target independence, guardrail eligibility) must appear in UI; exact strings are in the spec and UI findings docs. |

---

## 6. Success criteria

The prototype is done when:

- The page visually matches the existing ItemHub Update Item / Pricing layout (top bar, left nav, Attribute Groups, Pricing card with item rows).
- Vendor context and MAP optional + gated messaging are explicit in the UI.
- MAP is optional and gated by "MAP applies" radio; policy upload, metadata, and attestations are required only when MAP applies.
- Submit triggers Target review state and creates merchant flags when Comp Intel conditions are met.
- Vendor can open the "Behind the scenes" drawer with dynamic explanation and live calculation (market price, MAP, delta, flag).
- Reviewer console can Accept / Request changes / Not accept; status and comments reflect back in the vendor view.
- Guardrail eligibility is true only when status is Accepted.

---

## 7. Out of scope / assumptions

- **Authentication:** Not in scope; use a simple Vendor | Target Reviewer toggle.
- **Backend / persistence:** In-memory only; no database or file storage (policy upload stores filename only).
- **Real Comp Intel:** Mock data per item (marketPrice, marketTimestamp, confidence); no live integration.
- **Production deployment:** This is a prototype; production would add APIs, persistence, auth, and real Comp Intel integration.

---

## 8. References

For detailed UI, backend, and copy, see:

- **[itemhub-map-guardrails-prototype-description.md](itemhub-map-guardrails-prototype-description.md)** — Full spec: personas, screens, MAP UX, state machine, data model, validations, exact UI strings, acceptance criteria, implementation stack, seed data.
- **[uiitemhub.md](uiitemhub.md)** — UI findings: existing UI reference, what stays vs what changes (integration map), MAP block and drawer, reviewer console, validations, styling, strings table.
- **[backenditemhub.md](backenditemhub.md)** — Backend findings: data model (Item, MAPSubmission, MerchantFlag), state machine and transitions, Comp Intel and flag logic, validations, reviewer actions, expiration, prototype vs production, seed data.
