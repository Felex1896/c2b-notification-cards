import type { LucideIcon } from "lucide-react"
import { motion } from "motion/react"
import { useEffect, useRef, type Ref } from "react"
import { useTranslation } from "react-i18next"

import { CardChannelPicker } from "@/components/CardChannelPicker"
import { RuleHeader } from "@/components/RuleHeader"
import { RULE_MOTION, ruleFrameClass } from "@/components/rule-motion"
import { HoverTooltip } from "@/components/HoverTooltip"
import { Button } from "@/components/ui/button"
import { CardDescription, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
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
  const landing = { layout: { ...frame, delay: fade.duration } }
  const controls = (
    <span className="inline-flex">
      <Switch
        checked={sending}
        disabled={!status.sendable}
        onCheckedChange={onToggleSending}
        aria-label={
          status.sendable
            ? t(sending ? "rule.row.mute" : "rule.row.unmute")
            : t("rule.row.chooseChat")
        }
      />
    </span>
  )

  return (
    <div
      data-rule-card=""
      className={cn(
        "flex h-full min-w-0 flex-col overflow-visible min-[760px]:min-w-[360px]",
        ruleFrameClass()
      )}
    >
      <motion.div
        ref={panelRef}
        layoutId={layoutId}
        layoutDependency={expanded}
        transition={landing}
        data-rule-glow=""
        data-sending={!expanded && sending ? "on" : undefined}
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
          className={cn(
            "mt-4",
            status.complete
              ? "grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-4"
              : "flex"
          )}
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
            className={cn(!status.complete && "w-full")}
            onClick={onOpen}
          >
            {t(status.complete ? "rule.row.edit" : "rule.row.setUp")}
          </Button>
          {status.complete ? (
            <>
              <span className="text-right text-sm font-medium">
                {t("rule.row.notifications")}
              </span>
              {status.sendable ? (
                controls
              ) : (
                <HoverTooltip content={t("rule.row.chooseChat")}>
                  <span className="inline-flex *:pointer-events-none">
                    {controls}
                  </span>
                </HoverTooltip>
              )}
            </>
          ) : null}
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
