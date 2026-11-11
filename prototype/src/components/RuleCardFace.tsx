import type { LucideIcon } from "lucide-react"
import { motion } from "motion/react"
import { useEffect, useRef, type Ref } from "react"
import { useTranslation } from "react-i18next"

import { CardChannelPicker } from "@/components/CardChannelPicker"
import { Overline } from "@/components/Overline"
import { RuleHeader } from "@/components/RuleHeader"
import { RULE_MOTION, ruleFrameClass } from "@/components/rule-motion"
import { Button } from "@/components/ui/button"
import { CardDescription, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { CHANNEL_ORDER, channelId, channelsWith } from "@/lib/channel-picker"
import type { ConnectionKind } from "@/lib/connections"
import type { RuleCardStatus } from "@/lib/rule-card"
import type { Channels } from "@/lib/rules"
import { cn } from "@/lib/utils"

type RuleCardFaceProps = {
  layoutId: string
  icon: LucideIcon
  title: string
  meaning: string
  expanded: boolean
  sending: boolean
  status: RuleCardStatus
  channels: Channels
  buttonRef: Ref<HTMLButtonElement>
  onOpen: () => void
  onToggleSending: (on: boolean) => void
  onChannels: (channels: Channels) => void
  onConnectChannel: (kind: ConnectionKind) => void
}

/** Collapsed rule. Only Set up / Edit opens it. */
export function RuleCardFace({
  layoutId,
  icon,
  title,
  meaning,
  expanded,
  sending,
  status,
  channels,
  buttonRef,
  onOpen,
  onToggleSending,
  onChannels,
  onConnectChannel,
}: RuleCardFaceProps) {
  const { t } = useTranslation()
  const { frame, fade } = RULE_MOTION
  const panelRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (expanded) {
      return
    }
    const node = panelRef.current
    if (!node) {
      return
    }
    const restore = () => {
      node.style.opacity = "1"
      node.style.borderRadius = "var(--table-header-radius)"
    }
    const id = window.setTimeout(restore, 400)
    return () => window.clearTimeout(id)
  }, [expanded])
  const muted = status.complete && !sending
  const landing = { layout: { ...frame, delay: fade.duration } }
  const controls = (
    <span
      className={cn("inline-flex", muted && status.sendable && "opacity-50")}
    >
      <Switch
        checked={sending}
        disabled={!status.sendable}
        onCheckedChange={onToggleSending}
        aria-label={
          status.sendable
            ? t(sending ? "rule.row.mute" : "rule.row.unmute")
            : t("rule.row.offUntilSetUp")
        }
      />
    </span>
  )

  return (
    <div
      data-rule-card=""
      className={cn(
        "flex h-full min-w-[360px] flex-col overflow-visible",
        ruleFrameClass()
      )}
    >
      <motion.div
        ref={panelRef}
        layoutId={layoutId}
        layoutDependency={expanded}
        transition={landing}
        data-rule-glow=""
        data-sending={sending ? "on" : undefined}
        style={{ borderRadius: "var(--table-header-radius)" }}
        onLayoutAnimationComplete={() => {
          const node = panelRef.current
          if (node && !expanded) {
            node.style.opacity = "1"
            node.style.borderRadius = "var(--table-header-radius)"
          }
        }}
        className="rule-card-layer relative mx-2 mt-2 overflow-hidden rounded-table-header p-4"
      >
        <RuleHeader
          layoutId={layoutId}
          layoutDependency={expanded}
          transition={landing}
          icon={icon}
          lit={sending}
          title={<CardTitle>{title}</CardTitle>}
          meaning={
            <CardDescription data-rule-meaning="">{meaning}</CardDescription>
          }
        />
        <motion.div
          className="mt-3 grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3"
          initial={false}
          animate={{ opacity: expanded ? 0 : 1 }}
          transition={
            expanded ? fade : { ...fade, delay: frame.visualDuration }
          }
        >
          <Button
            ref={buttonRef}
            type="button"
            variant="outline"
            onClick={onOpen}
          >
            {t("rule.row.setUp")}
          </Button>
          <Overline className="line-clamp-2 text-right leading-tight">
            {t("rule.row.sendNotifications")}
          </Overline>
          {status.sendable || status.blockedReason === null ? (
            controls
          ) : (
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="inline-flex">{controls}</span>
              </TooltipTrigger>
              <TooltipContent>
                {t(
                  status.blockedReason === "chooseChat"
                    ? "rule.row.chooseChat"
                    : "rule.row.setUpFirst"
                )}
              </TooltipContent>
            </Tooltip>
          )}
        </motion.div>
      </motion.div>
      <div className="flex flex-col gap-2 px-6 pt-6 pb-6">
        {CHANNEL_ORDER.map((kind) => (
          <CardChannelPicker
            key={kind}
            kind={kind}
            value={channelId(channels, kind)}
            onChange={(id) => onChannels(channelsWith(channels, kind, id))}
            onConnect={() => onConnectChannel(kind)}
          />
        ))}
      </div>
    </div>
  )
}
