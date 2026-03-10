/**
 * ItemHub MAP Guardrails — TypeScript types and enums.
 * See docs/Itemhub/backenditemhub.md for data model reference.
 */

// --- Comp Intel (mock per item) ---
export type CompIntelConfidence = 'high' | 'med' | 'low'

export interface CompIntel {
  marketPrice: number
  marketTimestamp: string // ISO date string
  confidence: CompIntelConfidence
}

// --- Item ---
export interface Item {
  id: string
  title: string
  tcin: string
  upc: string
  dpci: string
  initialRetailPrice: number
  msrp: number
  thumbnailUrl: string
  compIntel: CompIntel
}

// --- MAP submission status ---
export type MAPSubmissionStatus =
  | 'NOT_PROVIDED'
  | 'DRAFT'
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'CHANGES_REQUESTED'
  | 'ACCEPTED'
  | 'NOT_ACCEPTED'
  | 'EXPIRED'

// --- Policy metadata ---
export type CoveredProducts = 'this_item_only' | 'brand' | 'category' | 'all_products'
export type CoveredChannel = 'online' | 'in_store' | 'marketplace' | 'other'
export type EnforcementMechanism = 'notice_cure' | 'immediate' | 'tiered' | 'other'

export interface MAPSubmissionMetadata {
  effectiveDate: string
  expirationDate: string
  coveredProducts: CoveredProducts
  coveredChannels: CoveredChannel[]
  enforcementMechanism: EnforcementMechanism
  cureDays?: number
  contactName: string
  contactEmail: string
}

// --- Attestations ---
export interface MAPAttestations {
  specific: boolean
  uniform: boolean
  enforced: boolean
  independentPricing: boolean
}

// --- MAP submission ---
export interface MAPSubmission {
  id: string
  itemId: string
  mapApplies: boolean
  mapValue: number | null
  policyFileName: string | null
  metadata: MAPSubmissionMetadata | null
  attestations: MAPAttestations | null
  status: MAPSubmissionStatus
  reviewerComment: string | null
  eligibleForGuardrail: boolean
  createdAt: string
  updatedAt: string
  submittedAt: string | null
}

// --- Merchant flag ---
export type MerchantFlagType = 'MAP_ABOVE_MARKET' | 'MAP_NEAR_MARKET' | 'COMP_INTEL_STALE'
export type MerchantFlagSeverity = 'info' | 'warn' | 'high'
export type MerchantFlagStatus = 'open' | 'triaged' | 'closed'

export interface MerchantFlag {
  id: string
  itemId: string
  submissionId: string
  type: MerchantFlagType
  severity: MerchantFlagSeverity
  createdAt: string
  status: MerchantFlagStatus
}

// --- Store state ---
export interface ItemHubState {
  items: Item[]
  submissions: Record<string, MAPSubmission> // keyed by itemId (one submission per item in prototype)
  flags: MerchantFlag[]
}
