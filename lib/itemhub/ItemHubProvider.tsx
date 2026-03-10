'use client'

import React, { createContext, useCallback, useContext, useMemo, useReducer } from 'react'
import type { ItemHubState, MAPSubmission } from './types'
import { getInitialState, itemHubReducer, type ItemHubAction } from './store'

const ItemHubStateContext = createContext<ItemHubState | null>(null)
const ItemHubDispatchContext = createContext<React.Dispatch<ItemHubAction> | null>(null)

export function ItemHubProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(itemHubReducer, null, () => getInitialState())

  return (
    <ItemHubStateContext.Provider value={state}>
      <ItemHubDispatchContext.Provider value={dispatch}>{children}</ItemHubDispatchContext.Provider>
    </ItemHubStateContext.Provider>
  )
}

export function useItemHubState(): ItemHubState {
  const ctx = useContext(ItemHubStateContext)
  if (!ctx) throw new Error('useItemHubState must be used within ItemHubProvider')
  return ctx
}

export function useItemHubDispatch(): React.Dispatch<ItemHubAction> {
  const ctx = useContext(ItemHubDispatchContext)
  if (!ctx) throw new Error('useItemHubDispatch must be used within ItemHubProvider')
  return ctx
}

/** Convenience hook: state + dispatch + helpers for common actions. */
export function useItemHub() {
  const state = useItemHubState()
  const dispatch = useItemHubDispatch()

  const setSubmission = useCallback(
    (itemId: string, submission: MAPSubmission) => {
      dispatch({ type: 'SET_SUBMISSION', payload: { itemId, submission } })
    },
    [dispatch]
  )

  const setItemMsrp = useCallback(
    (itemId: string, msrp: number) => {
      dispatch({ type: 'UPDATE_ITEM_MSRP', payload: { itemId, msrp } })
    },
    [dispatch]
  )

  const submitForReview = useCallback(
    (itemId: string) => {
      dispatch({ type: 'SUBMIT_FOR_REVIEW', payload: { itemId } })
    },
    [dispatch]
  )

  const reviewerAccept = useCallback(
    (itemId: string) => {
      dispatch({ type: 'REVIEWER_ACTION', payload: { itemId, action: 'ACCEPT' } })
    },
    [dispatch]
  )

  const reviewerRequestChanges = useCallback(
    (itemId: string, reviewerComment: string) => {
      dispatch({
        type: 'REVIEWER_ACTION',
        payload: { itemId, action: 'REQUEST_CHANGES', reviewerComment },
      })
    },
    [dispatch]
  )

  const reviewerNotAccept = useCallback(
    (itemId: string, reviewerComment: string) => {
      dispatch({
        type: 'REVIEWER_ACTION',
        payload: { itemId, action: 'NOT_ACCEPT', reviewerComment },
      })
    },
    [dispatch]
  )

  const getSubmissionForItem = useCallback(
    (itemId: string): MAPSubmission | undefined => state.submissions[itemId],
    [state.submissions]
  )

  const getFlagsForSubmission = useCallback(
    (submissionId: string) => state.flags.filter((f) => f.submissionId === submissionId),
    [state.flags]
  )

  return useMemo(
    () => ({
      state,
      dispatch,
      setSubmission,
      setItemMsrp,
      submitForReview,
      reviewerAccept,
      reviewerRequestChanges,
      reviewerNotAccept,
      getSubmissionForItem,
      getFlagsForSubmission,
    }),
    [
      state,
      setSubmission,
      setItemMsrp,
      submitForReview,
      reviewerAccept,
      reviewerRequestChanges,
      reviewerNotAccept,
      getSubmissionForItem,
      getFlagsForSubmission,
    ]
  )
}
