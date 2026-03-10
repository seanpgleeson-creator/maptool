'use client'

import React, { useState, useMemo } from 'react'
import { useItemHub } from '@/lib/itemhub/ItemHubProvider'
import type { MAPSubmission, Item } from '@/lib/itemhub/types'
import { ReviewerConsoleUI, setReviewerConsoleUIProps, getEffectiveStatus } from './ReviewerConsoleUI'

export function ReviewerConsole() {
  const { state, reviewerAccept, reviewerRequestChanges, reviewerNotAccept, getFlagsForSubmission } = useItemHub()
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null)
  const [comment, setComment] = useState('')

  const queue = useMemo(() => {
    const entries: { submission: MAPSubmission; item: Item }[] = []
    for (const sub of Object.values(state.submissions)) {
      if (!sub.mapApplies || sub.submittedAt == null) continue
      const item = state.items.find((i) => i.id === sub.itemId)
      if (item) entries.push({ submission: sub, item })
    }
    entries.sort((a, b) => (new Date(b.submission.submittedAt!).getTime() - new Date(a.submission.submittedAt!).getTime()))
    return entries
  }, [state.submissions, state.items])

  const selected = useMemo(() => {
    if (!selectedItemId) return null
    const sub = state.submissions[selectedItemId]
    const item = state.items.find((i) => i.id === selectedItemId)
    return sub && item ? { submission: sub, item } : null
  }, [selectedItemId, state.submissions, state.items])

  const effectiveStatus = selected ? getEffectiveStatus(selected.submission) : null
  const isUnderReview = effectiveStatus === 'UNDER_REVIEW'
  const canAccept = isUnderReview
  const canRequestOrNotAccept = isUnderReview
  const commentRequired = canRequestOrNotAccept && (comment.trim().length === 0)

  const handleAccept = () => {
    if (!selectedItemId || !canAccept) return
    reviewerAccept(selectedItemId)
  }
  const handleRequestChanges = () => {
    if (!selectedItemId || !canRequestOrNotAccept || commentRequired) return
    reviewerRequestChanges(selectedItemId, comment.trim())
    setComment('')
  }
  const handleNotAccept = () => {
    if (!selectedItemId || !canRequestOrNotAccept || commentRequired) return
    reviewerNotAccept(selectedItemId, comment.trim())
    setComment('')
  }

  setReviewerConsoleUIProps({
    queue,
    selectedItemId,
    selected,
    comment,
    setComment,
    setSelectedItemId,
    effectiveStatus,
    canAccept,
    canRequestOrNotAccept,
    commentRequired,
    onAccept: handleAccept,
    onRequestChanges: handleRequestChanges,
    onNotAccept: handleNotAccept,
    getFlagsForSubmission,
  })
  return React.createElement(ReviewerConsoleUI)
}
