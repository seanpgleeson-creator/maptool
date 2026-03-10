# ItemHub – Vendor Pricing Update: MAP Guardrails + Target Review Prototype (Spec for Claude Code)

> **User / Persona (MUST INCLUDE IN PROTOTYPE COPY + UI CONTEXT)**
>
> **Primary user:** A **Target vendor (supplier)** using ItemHub to **submit and maintain item attributes** for products sold at Target. This includes **pricing information (e.g., MSRP, MAP)** and other item data (basic details, content, media, supply chain, compliance, etc.).
>
> **Vendor goal:** Provide accurate item and pricing attributes so Target can set up, sell, and maintain items correctly.
>
> **Target goal:** Accept vendor-submitted data while protecting guest experience and pricing integrity.
>
> **This prototype’s goal:** Address **Minimum Advertised Price (MAP)** *at the point of vendor submission* using **guardrails + visibility**, rather than accepting MAP blindly and discovering issues later after negative downstream impact. MAP is **optional**, and when provided, requires a **specific, uniformly enforced policy** and goes through **Target review** before it is eligible to influence guardrails.

---

## 0) Reference UI (Look & Feel Targets)
Match the provided ItemHub screenshot’s structure:
- **Top app bar** with ItemHub logo/wordmark left, search center, icons (help/bell), vendor user avatar right.
- **Left nav rail** with icons and labels: Home, My Items (selected), My Tasks, Item Health.
- Main content area:
  - Breadcrumb: “My Items / Update Item”
  - Page title: “Update Item”
  - Top status line: “3 items selected”, “20 attributes need attention across 2 attribute groups.”
  - Attribute Groups list on left inside main content (Basic Details, Media, Content, … Pricing selected with a progress bar)
  - Right side: **Pricing card** with “Apply to all items / Edit each item” toggle and item rows for MSRP/MAP.

Visual style:
- Light gray app background, white cards, subtle borders, gentle shadows.
- Rounded corners (medium), consistent spacing, thin dividers between rows.
- Blue as primary action color. Warning/orange for “needs attention” banners.
- Typography: modern system sans; headings bold; labels medium.

---

## 1) Prototype Scope (Screens / Flows)
### Screen A: Update Item → Pricing (Vendor view)
This is the **vendor experience**. The vendor is submitting pricing data and related item attributes.

Vendor can:
- Toggle **Apply to all items** vs **Edit each item**
- Enter MSRP (existing behavior)
- Interact with new **MAP guardrails** per item (or apply-to-all)
- Upload MAP policy and complete metadata + attestations
- Submit MAP for Target review
- See status lifecycle: Draft → Submitted → Under review → Accepted / Changes requested / Not accepted
- Open a “Behind the scenes” explainer (info button / popup) showing how Target reviews and uses submissions.

### Screen B: Target Review Console (Internal view, simple)
A separate route or tab (e.g. `/review`) that shows:
- Queue of MAP submissions
- Competitive price flags (from internal Comp Intel)
- Submission detail with policy + metadata + attestations + Comp Intel comparison
- Actions: Accept / Request changes / Not accept

> Prototype does not need authentication. Use a “View as: Vendor | Target Reviewer” toggle in the header for convenience.

---

## 2) Primary Problem & Design Principle
### Current problem
MAP is currently collected as a required field with no validation of policy quality or enforceability. If MAP policy is not strict or not enforced, MAP becomes a poor pricing guardrail and can negatively impact guest experience downstream.

### New principle
Treat MAP as a **gated vendor claim**, not a required free-text number:
- MAP is **optional**
- If vendor claims MAP applies, the vendor must provide:
  - **Policy document** and **structured enforceability details**
  - **Attestations**
- Submission must go through **Target review** before being eligible to influence guardrails.

---

## 3) Layout & Components (Mirror Screenshot)
### 3.1 App Shell
- **TopBar**
  - Left: Target icon + “ItemHub”
  - Center: search input
  - Right: help icon, bell icon, vendor avatar with initials + label “Vendor User”
- **LeftNav**
  - Items with icon + label
  - Selected state on “My Items”
- **Content**
  - Breadcrumbs (My Items / Update Item)
  - Page title “Update Item”
  - Status row (selected count + needs attention message)
  - 2-column area:
    - Left: Attribute Groups list with progress bars; Pricing highlighted
    - Right: Pricing panel card

### 3.2 Pricing Panel Card (Core)
Header row:
- Title: “Pricing”
- Item count “03 Items”
- Search input
- Primary button: “Smart Fill with AI”
- Secondary: “Bulk edit”

Within card:
- Toggle:
  - “Apply to all items” (default inactive)
  - “Edit each item” (active)
- Item rows (repeat for 2–3 items) that show:
  - Thumbnail
  - Product title + TCIN/UPC/DPCI line
  - Initial Retail Price (display)
  - MSRP input
  - MAP section (new) integrated near existing MAP input area

---

## 4) MAP UX (Vendor) – Guardrails + Visibility
### 4.1 MAP Section Placement
For each item row, directly under MSRP/MAP area:
- Replace the old required MAP input with a structured block:

**Block title:** “Minimum Advertised Price (MAP)”
- Right side: Status badge (Not provided / Draft / Submitted / Under review / Accepted / Changes requested / Not accepted / Expired)
- Inline helper text (small):
  - “MAP is optional. If provided, a specific, uniformly enforced policy is required and will be reviewed by Target.”

Controls:
1) **Does a MAP policy apply to this item?** (required)
   - Radio:
     - No (default)
     - Yes
2) If “Yes”:
   - MAP (currency input) – required
   - Upload MAP policy (PDF/DOC/DOCX) – required
   - Policy metadata – required
   - Attestations – required
   - CTA row: Save Draft / Submit for Target review

### 4.2 Policy Metadata Fields (Required if MAP applies)
- Effective date (date)
- Expiration / review date (date)
- Covered products (select: this item only / brand / category / all products)
- **No covered channels** — universal channel enforcement is part of MAP policy validity; covered in attestations (uniform, no channel exceptions).
- Enforcement mechanism (select: notice+cure / immediate / tiered / other)
- Cure period (number days; show only if mechanism includes cure)
- Enforcement contact (name, email)

### 4.3 Required Attestations (All required if MAP applies)
Checkboxes (three):
- Policy is specific (products/terms clearly defined) — channels do not need to be specific.
- Uniformly enforced with no retailer segment or channel exceptions
- Actively enforced (not dormant)
*(No attestation for "Target prices independently.")*

### 4.4 Vendor-Facing Copy (Must include, visible on Screen A)
Inline text above attestations:
- “MAP is optional. If you provide a MAP value, you must upload a MAP policy that is specific and uniformly enforced with no exceptions.”
- “MAP prices are not automatically used as a guardrail for price decisions. Price decisions are at the sole discretion of Target Corporation.”

---

## 5) Competitive Price Comparison (Comp Intel) – “Behind the scenes” + Merchant Flagging
### 5.1 Mock Comp Intel Data
For each item, include:
- `marketPrice` (number)
- `marketTimestamp` (date string)
- `confidence` (high/med/low)

### 5.2 Flag Logic (Configurable constants)
- `NEAR_MARKET_PCT = 0.05` (5%)
- Trigger flags when:
  - MAP > marketPrice  → `MAP_ABOVE_MARKET`
  - MAP within 0%..+NEAR_MARKET_PCT above marketPrice → `MAP_NEAR_MARKET`
  - If marketTimestamp older than 14 days → `COMP_INTEL_STALE`

### 5.3 Where Flags Show
- **Vendor UI:** do NOT block. Show neutral message on submit:
  - “Your MAP submission will be reviewed by Target. We may request clarification before it can be used.”
  - Optional note if near/above market:
    - “Your MAP is close to current market observations. Target may follow up during review.”
- **Backend (Reviewer UI):** create a merchant-facing flag/task so merchants are aware:
  - Show market price, MAP, delta, delta%, timestamp, confidence.
  - Flag pills and severity.

---

## 6) Target Review Workflow (State Machine)
### 6.1 Statuses
- `NOT_PROVIDED`
- `DRAFT`
- `SUBMITTED`
- `UNDER_REVIEW`
- `CHANGES_REQUESTED`
- `ACCEPTED`
- `NOT_ACCEPTED`
- `EXPIRED` (if today > expiration date)

### 6.2 Transitions
Vendor:
- NOT_PROVIDED → DRAFT (select “Yes, MAP applies”)
- DRAFT → SUBMITTED (Submit for review)
System:
- SUBMITTED → UNDER_REVIEW (immediate in prototype)
Reviewer:
- UNDER_REVIEW → ACCEPTED
- UNDER_REVIEW → CHANGES_REQUESTED (comment required)
- UNDER_REVIEW → NOT_ACCEPTED (comment required)
Vendor:
- CHANGES_REQUESTED → DRAFT (edit) → SUBMITTED (resubmit)

### 6.3 Guardrail Eligibility Rule (Critical)
- Only `ACCEPTED` sets `eligibleForGuardrail = true`
- All other statuses must be `eligibleForGuardrail = false`

---

## 7) Comp Intel — Reviewer Only (No Vendor Drawer)
The vendor does **not** need additional information; no "Behind the scenes" info button or drawer on the Update Item screen.

**Comp Intel and live example** are available to the **reviewer only**, in the Reviewer console:
- In the queue and submission detail panel: show market price, submitted MAP, delta, delta%, timestamp, confidence.
- Flag pills and severity (MAP_NEAR_MARKET, MAP_ABOVE_MARKET, COMP_INTEL_STALE).
- This is where the "live" comp intel data and flags live — not in a vendor-facing drawer.

---

## 8) Reviewer Console (Internal) – Minimal Spec
Route: `/review` (or “Reviewer Mode” toggle)
### 8.1 Queue Table
Columns:
- Item (title + TCIN)
- Submitted MAP
- Market price
- Delta / Delta%
- Flags
- Status
- Submitted date
Row click opens detail panel.

### 8.2 Submission Detail Panel
- Policy document link (mock)
- Metadata summary
- Attestations
- Comp Intel comparison + flags
- Comment box (required for Changes requested / Not accepted)
- Actions: Accept / Request changes / Not accept

Action behavior:
- Accept → status ACCEPTED, eligibleForGuardrail true
- Request changes → status CHANGES_REQUESTED with comment
- Not accept → status NOT_ACCEPTED with comment

---

## 9) Data Model (Mock Types)
### Item
- id
- title
- tcin, upc, dpci
- initialRetailPrice
- msrp
- thumbnailUrl
- compIntel: { marketPrice, marketTimestamp, confidence }

### MAPSubmission
- id
- itemId
- mapApplies (bool)
- mapValue
- policyFileName
- metadata: effectiveDate, expirationDate, coveredProducts, coveredChannels[], enforcementMechanism, cureDays?, contactName, contactEmail
- attestations: { specific, uniform, enforced, independentPricing }
- status
- reviewerComment?
- eligibleForGuardrail (derived)
- createdAt, updatedAt, submittedAt?

### MerchantFlag
- id
- itemId
- submissionId
- type (MAP_ABOVE_MARKET | MAP_NEAR_MARKET | COMP_INTEL_STALE)
- severity (info | warn | high)
- createdAt
- status (open | triaged | closed)

---

## 10) Validations (Vendor-Side)
Blocking (disable Submit button):
- If mapApplies = true:
  - mapValue missing
  - policy file missing
  - any required metadata missing
  - any required attestation unchecked
- MAP > MSRP shows blocking error:
  - “MAP cannot exceed MSRP.”

Non-blocking warnings:
- Comp Intel stale (>14 days)
- MAP near/above market (show banner on submit; do not block)

---

## 11) Styling Guidance (Make It Feel Like Screenshot)
Use Tailwind tokens like:
- Background: `bg-slate-50`
- Cards: `bg-white border border-slate-200 rounded-lg shadow-sm`
- Dividers: `border-slate-200`
- Primary buttons: blue fill, rounded, medium height
- Secondary buttons: white with border
- Selected nav item: subtle gray background + left indicator
- Progress bars in Attribute Groups list (thin, blue fill)
- “Needs attention” banner: orange icon + orange text (not full red)

Spacing:
- Card padding 16–24px
- Inputs aligned in grid like screenshot (MSRP left, MAP right)

---

## 12) Seed Data for Demo (3 items)
Create 3 items to demonstrate flags and workflow:
- Item A: MSRP 290, market 185 (high confidence)
- Item B: MSRP 280, market 188 (med confidence)
- Item C: MSRP 120, market 110 (low confidence, stale)

Demonstrate:
- MAP 180 vs market 185 → no comp flag
- MAP 190 vs market 188 → near-market flag
- MAP 210 vs market 185 → above-market flag
- Stale market data warning on Item C

---

## 13) Acceptance Criteria (Prototype Done When…)
- Page visually resembles screenshot layout (top bar, left nav, attribute groups list, pricing card).
- Vendor identity/context is explicit in UI copy: vendor is submitting item attributes + pricing.
- MAP is optional and gated by “MAP applies” radio.
- Policy upload + metadata + attestations required only when MAP applies.
- Submit triggers Target review state and creates merchant flags when comp conditions hit.
- Reviewer console shows Comp Intel and flags (market price, MAP, delta, flag status).
- Reviewer console can accept/request changes/not accept and status updates reflect back in vendor view.
- Guardrail eligibility only true when Accepted.

---

## 14) Preferred Implementation Stack (Claude Code)
- React + TypeScript
- TailwindCSS
- shadcn/ui (Button, Input, Card, Badge, Tabs, Dialog/Drawer, Table, Checkbox, RadioGroup, Select)
- State stored in-memory (Context or Zustand). No backend.
- File upload mocked (store filename only).
- Routes: `/update-item` and `/review` (or mode toggle).

---

## 15) Exact UI Strings (Copy/Phrases to Use)
### Vendor context (place near page title or in a subtle banner)
- “You are signed in as a Vendor user submitting item attributes and pricing information to Target.”

### MAP helper copy (vendor)
- “MAP is optional. If you provide a MAP value, you must upload a MAP policy that is specific and uniformly enforced with no exceptions.”
- “MAP prices are not automatically used as a guardrail for price decisions. Price decisions are at the sole discretion of Target Corporation.”

### Submission banner (vendor)
- “Your MAP submission will be reviewed by Target. We may request clarification before it can be used.”

### Comp Intel neutral note (vendor, optional)
- “Your MAP is close to current market observations. Target may follow up during review.”

### Reviewer flags
- “MAP above market price”
- “MAP near market price”
- “Market data may be stale”