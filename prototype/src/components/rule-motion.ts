import { motion } from "motion/react"

import { Card } from "@/components/ui/card"

/**
 * Row ↔ modal timing. The frame is a spring (not a design-system token);
 * fades use the brand motion.role.color pair: 150 ms, standard easing.
 */
export const RULE_MOTION = {
  frame: { type: "spring", visualDuration: 0.35, bounce: 0.15 },
  fade: { duration: 0.15, ease: [0.4, 0, 0.2, 1] },
} as const

/** Frame chrome. Fill, blur and the send glow live in index.css on [data-rule-card]. */
export function ruleFrameClass() {
  return "relative isolate gap-0 border border-border bg-transparent py-0 shadow-none ring-0"
}

export const MotionCard = motion.create(Card)
