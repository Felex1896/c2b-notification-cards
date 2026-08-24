import { useState } from "react"

export function useRuleCard<T>(options: {
  createEmpty: () => T
  /** Fresh object, idempotent, safe to call on both Apply and Cancel. */
  commit: (value: T) => T
  isValid: (draft: T) => boolean
}) {
  const { createEmpty, commit, isValid } = options
  const [expanded, setExpanded] = useState(false)
  const [sending, setSending] = useState(false)
  const [applied, setApplied] = useState<T | null>(null)
  const [draft, setDraft] = useState<T>(createEmpty)
  const [showErrors, setShowErrors] = useState(false)

  const open = () => {
    if (!expanded) {
      setExpanded(true)
    }
  }

  const cancel = () => {
    setDraft(applied ? commit(applied) : createEmpty())
    setShowErrors(false)
    setExpanded(false)
  }

  const apply = () => {
    if (!isValid(draft)) {
      setShowErrors(true)
      return
    }
    const next = commit(draft)
    const firstApply = applied === null
    setApplied(next)
    setDraft(next)
    if (firstApply) {
      setSending(true)
    }
    setShowErrors(false)
    setExpanded(false)
  }

  const toggleSending = (on: boolean) => {
    if (applied === null) {
      return
    }
    setSending(on)
  }

  return {
    expanded,
    sending,
    applied,
    draft,
    setDraft,
    showErrors,
    open,
    cancel,
    apply,
    toggleSending,
  }
}
