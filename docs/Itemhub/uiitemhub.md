# ItemHub MAP Guardrails Prototype — UI Findings

This document distills **user interface** requirements and recommendations from [itemhub-map-guardrails-prototype-description.md](itemhub-map-guardrails-prototype-description.md) for the ItemHub MAP guardrails + Target review prototype.

**Design approach:** Modify the **existing** ItemHub vendor-facing "Update Item" / Pricing screen to incorporate MAP guardrails. Do not create a new layout; keep the current look and feel and integrate the new MAP block, status, policy upload, metadata, and attestations into the existing Pricing panel and item rows.

---

## 0. Existing UI (reference — match this look and feel)

The baseline is the current ItemHub **Update Item** page with the **Pricing** attribute group selected. Use this as the visual and structural reference; MAP guardrails are an **in-place change** within this layout.

### 0.1 Top header (global)

- **Left:** Red circular icon + **"ItemHub"** wordmark.
- **Center:** Global search — **"Q Search"** placeholder.
- **Right:** Help icon (question mark), bell (notifications), **user avatar** (green circle with initials, e.g. "JD") + user name (e.g. "John Doe"). This is the vendor user.

### 0.2 Left sidebar (primary nav)

- Vertical list with icon + label: **Home**, **My Items** (selected — light gray background), **My Tasks**, **Item Health**.
- Selected item has subtle gray background and clear selected state.

### 0.3 Main content — top bar

- **Breadcrumb:** "My Items / Update Item".
- **Page title:** "Update Item" (large, bold).
- **Item selection:** "3 items selected" (clickable).
- **Alert:** Orange warning icon + **"20 attributes need attention across 2 attribute groups."** (orange text, not red).
- **Content search:** "Q Search" input (for filtering within the page).
- **Actions:** **"Smart Fill with AI"** (primary blue button), **"Bulk edit"** (outlined/secondary).

### 0.4 Main content — two columns

**Left column — Attribute Groups**

- Title: **"Attribute Groups"** with circular progress (e.g. yellow ring **40%**).
- List of groups, each with icon + name + completion %: Basic Details, Media, Content, … **Pricing**.
- **Pricing** is the selected group: highlighted (blue/green), with a full **100%** progress bar.
- Thin progress bars; consistent spacing; clear selected state.

**Right column — Pricing panel card**

- **Card header:** "Pricing" with subtitle **"Provide attributes such as MSRP and MAP."**
- **Sub-header:** "Pricing" with **"03 Items"** count and expand/collapse arrow.
- **Toggle (two buttons):** **"Apply to all items"** (default inactive/grayed), **"Edit each item"** (active, blue). Same row as item count.
- **Item rows** (repeat per item):
  - Small **thumbnail** (e.g. product image).
  - **Product title** (e.g. "Women's Faux Suede Trench - A New Day") and identifiers: **TCIN**, **UPC**, **DPCI**.
  - **Status tag:** e.g. yellow **"PENDING SETUP"**.
  - **Initial Retail Price:** read-only (e.g. $ 300).
  - **MSRP (in $)\*** — required text input (e.g. "290").
  - **MAP (in $)\*** — required text input (e.g. "180").
- **Item navigation** (when multiple items): "<", ">", and refresh/undo icon at bottom.

### 0.5 Visual style (existing)

- **Background:** Light gray (e.g. slate-50); **cards:** white, subtle border, gentle shadow.
- **Rounded corners** (medium); consistent padding (16–24px); thin dividers between rows.
- **Primary actions:** Blue fill. **Secondary:** White with border.
- **Needs attention:** Orange icon + orange text. **Status tags:** e.g. yellow for PENDING SETUP.
- **Typography:** Modern system sans; headings bold; labels medium.

---

## 1. User context (must be visible)

- **Primary user:** Target **vendor (supplier)** submitting item attributes and pricing (MSRP, MAP) via ItemHub.
- **Vendor goal:** Provide accurate data so Target can set up and sell items correctly.
- **Target goal:** Protect guest experience and pricing integrity; MAP is a **gated vendor claim**, not a required free-text number.

**UI implication:** Vendor identity and context must be explicit—e.g. banner or line near page title: *"You are signed in as a Vendor user submitting item attributes and pricing information to Target."*

---

## 2. What stays vs what changes (integration map)

**Keep unchanged (Section 0):**

- Top header (ItemHub logo, Q Search, help, bell, vendor avatar + name).
- Left nav (Home, My Items, My Tasks, Item Health) and selection state.
- Breadcrumb, page title "Update Item", "3 items selected", orange "attributes need attention" banner, content search, "Smart Fill with AI", "Bulk edit".
- Left column: Attribute Groups list and progress; Pricing selected with 100% bar.
- Right column: Pricing card shell — title "Pricing", subtitle "Provide attributes such as MSRP and MAP.", "03 Items" with expand arrow, **Apply to all items / Edit each item** toggle.
- Per-item row structure: thumbnail, product title, TCIN/UPC/DPCI, status tag (e.g. PENDING SETUP), Initial Retail Price (read-only), **MSRP (in $)\*** input.

**Change in place:**

- **Replace** the single **"MAP (in $)\*"** input with the **MAP block** (Section 4): status badge, "Does MAP apply?" radio (No/Yes), and when Yes: MAP currency input, policy upload, policy metadata, attestations, Save Draft / Submit for Target review. Preserve the same row: MAP lives directly under MSRP in each item row, same card, same spacing and typography.
- **Add** vendor context line or banner near the page title (Section 1).
- **Add** info button "How Target reviews MAP" next to the MAP block title; opens right-side drawer (Section 6).
- **Add** Reviewer console route or "View as: Vendor | Target Reviewer" toggle (Section 8).

**Visual style:** Continue to match Section 0 (light gray background, white cards, blue primary, orange for needs attention, same spacing and borders). New elements (status badge, radio, checkboxes, policy metadata fields) should use the same tokens (borders, radius, input height) as existing ItemHub controls.

---

## 3. Pricing panel card (core) — existing + MAP block

Use the **existing** Pricing card layout (Section 0.4). Do not change the card container, header row, or toggle.

**Header row (unchanged):**

- Title: "Pricing", subtitle: "Provide attributes such as MSRP and MAP."
- "03 Items" (or current count) with expand/collapse arrow.
- Toggle: **"Apply to all items"** (default off) | **"Edit each item"** (on).
- Top bar above card (same page): "Q Search", "Smart Fill with AI", "Bulk edit."

**Body — item rows (modify in place):**

- Each row keeps: thumbnail, product title, TCIN/UPC/DPCI, status tag, Initial Retail Price (read-only), **MSRP (in $)\*** input.
- **In the same row, replace** the old "MAP (in $)\*" single input with the **MAP section** (Section 4): a structured block that includes status badge, optional MAP radio, and when MAP applies: MAP value, policy upload, metadata, attestations, CTAs. Align the MAP block visually with the existing grid (e.g. under MSRP, same card padding and dividers) so it feels like one continuous Pricing form.

---

## 4. MAP section (per item row)

**Placement:** Directly under MSRP/MAP area in each item row.

**Block title:** "Minimum Advertised Price (MAP)"  
**Right side:** Status badge — one of: Not provided | Draft | Submitted | Under review | Accepted | Changes requested | Not accepted | Expired.

**Inline helper (small):**  
*"MAP is optional. If provided, a specific, uniformly enforced policy is required and will be reviewed by Target."*

### 4.1 Controls (required when MAP applies)

1. **Does a MAP policy apply to this item?** (required)
   - Radio: **No** (default) | **Yes**
2. If **Yes**:
   - **MAP** (currency input) — required
   - **Upload MAP policy** (PDF/DOC/DOCX) — required
   - **Policy metadata** — required (see below)
   - **Attestations** — required (all checkboxes)
   - **CTA row:** "Save Draft" | "Submit for Target review"

### 4.2 Policy metadata (required when MAP applies)

- Effective date (date)
- Expiration / review date (date)
- Covered products (select: this item only | brand | category | all products)
- **No covered channels field** — universal channel enforcement is part of MAP policy validity (policy not valid if there are channel limitations); this is covered in attestations (uniform enforcement with no channel exceptions).
- Enforcement mechanism (select: notice+cure | immediate | tiered | other)
- Cure period (number, days) — show only if mechanism includes cure
- Enforcement contact (name, email)

### 4.3 Attestations (all required when MAP applies)

Checkboxes; all three must be checked to submit:

- Policy is specific (products/terms clearly defined) — channels do not need to be specific.
- Uniformly enforced with no retailer segment or channel exceptions
- Actively enforced (not dormant)

*(No attestation for "Target prices independently.")*

### 4.4 Vendor-facing copy (must appear on Screen A)

Place above or near attestations:

- *"MAP is optional. If you provide a MAP value, you must upload a MAP policy that is specific and uniformly enforced with no exceptions."*
- *"MAP prices are not automatically used as a guardrail for price decisions. Price decisions are at the sole discretion of Target Corporation."*

---

## 5. Validations & submit behavior

### 5.1 Blocking (disable Submit)

When MAP applies = Yes:

- MAP value missing
- Policy file missing
- Any required metadata missing
- Any required attestation unchecked  
**Plus:** MAP > MSRP → blocking error: *"MAP cannot exceed MSRP."*

### 5.2 Non-blocking (warnings only)

- Comp Intel data older than 14 days (stale)
- MAP near or above market — show banner on submit; do **not** block submission.

**Submission banner (vendor):**  
*"Your MAP submission will be reviewed by Target. We may request clarification before it can be used."*

**Optional comp note:**  
*"Your MAP is close to current market observations. Target may follow up during review."*

---

## 6. Comp Intel and vendor — no "Behind the scenes" drawer

- **Vendor:** Does **not** need additional information; no info button or drawer on the Update Item screen.
- **Comp Intel and live example:** Available to the **reviewer only**, in the Reviewer console (queue and detail panel). Show market price, submitted MAP, delta, delta%, timestamp, confidence, and flag pills (MAP_NEAR_MARKET, MAP_ABOVE_MARKET, COMP_INTEL_STALE) with severity there.

---

## 7. Competitive price (Comp Intel) in vendor UI

- **Do not block** vendor submission based on comp flags.
- Show **neutral** messaging on submit (see Section 5.2).
- Optional note when MAP is near/above market.
- No raw "rejection" in vendor view; Target review handles flags internally.

---

## 8. Reviewer console (Screen B — internal)

- **Route:** `/review` (or "Reviewer Mode" toggle in header).
- **Prototype convenience:** "View as: Vendor | Target Reviewer" toggle in header (no real auth).

### 8.1 Queue table

Columns: Item (title + TCIN) | Submitted MAP | Market price | Delta / Delta% | Flags | Status | Submitted date.  
Row click → opens submission detail panel.

### 8.2 Submission detail panel

- Policy document link (mock)
- Metadata summary
- Attestations
- **Comp Intel live data and flags** (market price, submitted MAP, delta, delta%, timestamp, confidence; flag pills MAP_ABOVE_MARKET, MAP_NEAR_MARKET, COMP_INTEL_STALE and severity) — Comp Intel and flags live in the reviewer console only.
- **Comment box** (required for "Request changes" and "Not accept")
- **Actions:** Accept | Request changes | Not accept

---

## 9. Status lifecycle (vendor-visible)

Vendor sees status badge on MAP section:

- Not provided → Draft → Submitted → Under review → Accepted | Changes requested | Not accepted | Expired

Transitions visible to vendor: save draft (Draft), submit (Submitted → Under review), and after review: Accepted, Changes requested (with comment), Not accepted (with comment), or Expired (if past expiration date).

---

## 10. Styling guidance (Tailwind-oriented)

- Background: e.g. `bg-slate-50`
- Cards: `bg-white border border-slate-200 rounded-lg shadow-sm`
- Dividers: `border-slate-200`
- Primary buttons: blue fill, rounded, medium height
- Secondary: white with border
- Selected nav: subtle gray background + left indicator
- Attribute Groups: progress bars thin, blue fill
- "Needs attention": orange icon + orange text

Spacing: card padding 16–24px; inputs in grid (e.g. MSRP left, MAP right).

---

## 11. Implementation stack (from spec)

- React + TypeScript
- TailwindCSS
- shadcn/ui: Button, Input, Card, Badge, Tabs, Dialog/Drawer, Table, Checkbox, RadioGroup, Select
- State: in-memory (Context or Zustand); no backend in prototype
- File upload: mocked (store filename only)
- Routes: `/update-item` and `/review` (or mode toggle)

---

## 12. Exact UI strings (reference)

| Context | String |
|--------|--------|
| Vendor context | "You are signed in as a Vendor user submitting item attributes and pricing information to Target." |
| MAP helper | "MAP is optional. If you provide a MAP value, you must upload a MAP policy that is specific and uniformly enforced with no exceptions." |
| Guardrail / price discretion | "MAP prices are not automatically used as a guardrail for price decisions. Price decisions are at the sole discretion of Target Corporation." |
| Submission banner | "Your MAP submission will be reviewed by Target. We may request clarification before it can be used." |
| Comp note (optional) | "Your MAP is close to current market observations. Target may follow up during review." |
| MAP > MSRP error | "MAP cannot exceed MSRP." |
| Reviewer flags | "MAP above market price" / "MAP near market price" / "Market data may be stale" |

---

## 13. Summary: UI priorities

1. **Vendor identity** and **MAP optional + gated** messaging everywhere relevant.
2. **Single pricing card** with Apply-to-all vs Edit-each-item and per-row MAP block (status, radio, policy upload, metadata, attestations, CTAs).
3. **Validations:** block Submit only on missing required data or MAP > MSRP; comp flags = warnings only.
4. **No vendor drawer** — Comp Intel and live example are **reviewer-only** (Reviewer console).
5. **Reviewer console** with queue table, detail panel, **Comp Intel + flags**, comment (for request changes / not accept), and Accept / Request changes / Not accept.
6. **Status badges** and clear lifecycle so vendor understands Draft → Submitted → Under review → outcome.
