/**
 * ItemHub MAP Guardrails — In-memory store logic.
 * Single place for status transitions, eligibility rule, and flag creation.
 */
import type {
  CoveredChannel,
  Item,
  ItemHubState,
  MAPSubmission,
  MAPSubmissionStatus,
  MerchantFlag,
  MerchantFlagSeverity,
  MerchantFlagType,
} from './types'
import { seedItems } from './seed-data'

const NEAR_MARKET_PCT = 0.05
const STALE_DAYS = 14

function now(): string {
  return new Date().toISOString()
}

function isStale(marketTimestamp: string): boolean {
  const then = new Date(marketTimestamp).getTime()
  const cutoff = Date.now() - STALE_DAYS * 24 * 60 * 60 * 1000
  return then < cutoff
}

function eligibleForGuardrail(status: MAPSubmissionStatus): boolean {
  return status === 'ACCEPTED'
}

function generateId(): string {
  return `id-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

/** Create merchant flags when submission is submitted (DRAFT → SUBMITTED). */
export function createFlagsForSubmission(
  item: Item,
  submission: MAPSubmission,
  existingFlags: MerchantFlag[]
): MerchantFlag[] {
  const newFlags: MerchantFlag[] = []
  const mapValue = submission.mapValue ?? 0
  const { marketPrice, marketTimestamp, confidence } = item.compIntel

  if (submission.status !== 'SUBMITTED' && submission.status !== 'UNDER_REVIEW') {
    return newFlags
  }

  // COMP_INTEL_STALE
  if (isStale(marketTimestamp)) {
    newFlags.push({
      id: generateId(),
      itemId: item.id,
      submissionId: submission.id,
      type: 'COMP_INTEL_STALE',
      severity: 'info',
      createdAt: now(),
      status: 'open',
    })
  }

  // MAP_ABOVE_MARKET: MAP above market price (any amount)
  if (mapValue > marketPrice) {
    newFlags.push({
      id: generateId(),
      itemId: item.id,
      submissionId: submission.id,
      type: 'MAP_ABOVE_MARKET',
      severity: 'high',
      createdAt: now(),
      status: 'open',
    })
  }

  // MAP_NEAR_MARKET: MAP within 0% to 5% above market
  const upperBound = marketPrice * (1 + NEAR_MARKET_PCT)
  if (mapValue > marketPrice && mapValue <= upperBound) {
    newFlags.push({
      id: generateId(),
      itemId: item.id,
      submissionId: submission.id,
      type: 'MAP_NEAR_MARKET',
      severity: 'warn',
      createdAt: now(),
      status: 'open',
    })
  }

  return [...existingFlags, ...newFlags]
}

export function getInitialState(): ItemHubState {
  return {
    items: seedItems,
    submissions: {},
    flags: [],
  }
}

const emptyMetadata = {
  effectiveDate: '',
  expirationDate: '',
  coveredProducts: 'this_item_only' as const,
  coveredChannels: [] as CoveredChannel[],
  enforcementMechanism: 'notice_cure' as const,
  contactName: '',
  contactEmail: '',
}

const emptyAttestations = {
  specific: false,
  uniform: false,
  enforced: false,
  independentPricing: false,
}

/** Create a NOT_PROVIDED submission (MAP does not apply). */
export function createNotProvidedSubmission(itemId: string): MAPSubmission {
  const nowStr = now()
  return {
    id: `sub-${itemId}`,
    itemId,
    mapApplies: false,
    mapValue: null,
    policyFileName: null,
    metadata: null,
    attestations: null,
    status: 'NOT_PROVIDED',
    reviewerComment: null,
    eligibleForGuardrail: false,
    createdAt: nowStr,
    updatedAt: nowStr,
    submittedAt: null,
  }
}

/** Create a blank DRAFT submission (MAP applies, user will fill form). */
export function createDraftSubmission(itemId: string): MAPSubmission {
  const nowStr = now()
  return {
    id: `sub-${itemId}`,
    itemId,
    mapApplies: true,
    mapValue: null,
    policyFileName: null,
    metadata: { ...emptyMetadata },
    attestations: { ...emptyAttestations },
    status: 'DRAFT',
    reviewerComment: null,
    eligibleForGuardrail: false,
    createdAt: nowStr,
    updatedAt: nowStr,
    submittedAt: null,
  }
}

export type ItemHubAction =
  | { type: 'INIT'; payload: ItemHubState }
  | { type: 'SET_SUBMISSION'; payload: { itemId: string; submission: MAPSubmission } }
  | { type: 'UPDATE_ITEM_MSRP'; payload: { itemId: string; msrp: number } }
  | {
      type: 'SUBMIT_FOR_REVIEW'
      payload: { itemId: string }
    }
  | {
      type: 'REVIEWER_ACTION'
      payload: {
        itemId: string
        action: 'ACCEPT' | 'REQUEST_CHANGES' | 'NOT_ACCEPT'
        reviewerComment?: string
      }
    }

export function itemHubReducer(state: ItemHubState, action: ItemHubAction): ItemHubState {
  switch (action.type) {
    case 'INIT':
      return action.payload

    case 'SET_SUBMISSION': {
      const { itemId, submission } = action.payload
      const next = { ...state.submissions, [itemId]: submission }
      return { ...state, submissions: next }
    }

    case 'UPDATE_ITEM_MSRP': {
      const { itemId, msrp } = action.payload
      const nextItems = state.items.map((i) =>
        i.id === itemId ? { ...i, msrp } : i
      )
      return { ...state, items: nextItems }
    }

    case 'SUBMIT_FOR_REVIEW': {
      const { itemId } = action.payload
      const submission = state.submissions[itemId]
      const item = state.items.find((i) => i.id === itemId)
      const canSubmit = submission?.status === 'DRAFT' || submission?.status === 'CHANGES_REQUESTED'
      if (!submission || !canSubmit || !item) return state

      const updated: MAPSubmission = {
        ...submission,
        status: 'UNDER_REVIEW',
        submittedAt: now(),
        updatedAt: now(),
        eligibleForGuardrail: false,
      }
      const nextSubs = { ...state.submissions, [itemId]: updated }
      const newFlags = createFlagsForSubmission(item, updated, state.flags)
      return { ...state, submissions: nextSubs, flags: newFlags }
    }

    case 'REVIEWER_ACTION': {
      const { itemId, action: reviewerAction, reviewerComment } = action.payload
      const submission = state.submissions[itemId]
      if (!submission || submission.status !== 'UNDER_REVIEW') return state

      let newStatus: MAPSubmissionStatus
      let eligible: boolean
      if (reviewerAction === 'ACCEPT') {
        newStatus = 'ACCEPTED'
        eligible = true
      } else if (reviewerAction === 'REQUEST_CHANGES') {
        newStatus = 'CHANGES_REQUESTED'
        eligible = false
        if (!reviewerComment?.trim()) return state
      } else {
        newStatus = 'NOT_ACCEPTED'
        eligible = false
        if (!reviewerComment?.trim()) return state
      }

      const updated: MAPSubmission = {
        ...submission,
        status: newStatus,
        eligibleForGuardrail: eligible,
        reviewerComment: reviewerComment ?? null,
        updatedAt: now(),
      }
      const nextSubs = { ...state.submissions, [itemId]: updated }
      return { ...state, submissions: nextSubs }
    }

    default:
      return state
  }
}
