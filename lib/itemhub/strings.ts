/**
 * ItemHub MAP Guardrails — UI strings from spec §15 / uiitemhub §12.
 * Single source of truth for vendor-facing and reviewer-facing copy.
 */

export const ITEMHUB_STRINGS = {
  /** Vendor context (banner near page title) */
  VENDOR_CONTEXT:
    'You are signed in as a Vendor user submitting item attributes and pricing information to Target.',

  /** MAP block inline helper (short) */
  MAP_HELPER_SHORT:
    'MAP is optional. If provided, a specific, uniformly enforced policy is required and will be reviewed by Target.',

  /** MAP block copy above attestations (policy requirement) */
  MAP_POLICY_REQUIREMENT:
    'MAP is optional. If you provide a MAP value, you must upload a MAP policy that is specific and uniformly enforced with no exceptions.',

  /** Guardrail / Target price discretion */
  GUARDRAIL_DISCRETION:
    'MAP prices are not automatically used as a guardrail for price decisions. Price decisions are at the sole discretion of Target Corporation.',

  /** Submission success banner */
  SUBMISSION_BANNER:
    'Your MAP submission will be reviewed by Target. We may request clarification before it can be used.',

  /** Optional comp note when MAP near/above market */
  COMP_NOTE_NEAR_MARKET:
    'Your MAP is close to current market observations. Target may follow up during review.',

  /** MAP > MSRP validation error */
  MAP_EXCEEDS_MSRP: 'MAP cannot exceed MSRP.',

  /** Reviewer console flag labels */
  FLAG_MAP_ABOVE_MARKET: 'MAP above market price',
  FLAG_MAP_NEAR_MARKET: 'MAP near market price',
  FLAG_COMP_INTEL_STALE: 'Market data may be stale',
} as const
