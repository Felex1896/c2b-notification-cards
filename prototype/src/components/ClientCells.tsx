import { Moon, Sun, Sunrise, Sunset, type LucideIcon } from "lucide-react"
import { useTranslation } from "react-i18next"

import bnb from "@/assets/coins/bnb.svg"
import eth from "@/assets/coins/eth.svg"
import trx from "@/assets/coins/trx.svg"
import usdt from "@/assets/coins/usdt.svg"
import { CopyAddress } from "@/components/CopyAddress"
import { Skeleton } from "@/components/ui/skeleton"
import type { ActivityRange, Currency } from "@/data/wallet-types"
import type { MessageKey } from "@/i18n/keys"
import { activityLabel, type TimeOfDay } from "@/lib/client-cells"
import { DASH } from "@/lib/client-list"
import { cn } from "@/lib/utils"

const ACTIVITY: Record<
  TimeOfDay,
  { icon: LucideIcon; className: string; labelKey: MessageKey }
> = {
  night: {
    icon: Moon,
    className: "bg-activity-night-bg text-activity-night",
    labelKey: "clients.activity.night",
  },
  morning: {
    icon: Sunrise,
    className: "bg-activity-morning-bg text-activity-morning",
    labelKey: "clients.activity.morning",
  },
  day: {
    icon: Sun,
    className: "bg-activity-day-bg text-activity-day",
    labelKey: "clients.activity.day",
  },
  evening: {
    icon: Sunset,
    className: "bg-activity-evening-bg text-activity-evening",
    labelKey: "clients.activity.evening",
  },
}

const COIN: Record<Currency, string> = {
  ETH: eth,
  USDT: usdt,
  TRX: trx,
  BNB: bnb,
}

export function CellSkeleton() {
  return <Skeleton className="h-4 w-16" />
}

export function ActivityCell({ range }: { range: ActivityRange | null }) {
  const { t } = useTranslation()
  if (!range) {
    return DASH
  }
  const { kind, hours } = activityLabel(range)
  const { icon: Icon, className, labelKey } = ACTIVITY[kind]
  const label = t(labelKey)
  return (
    <span
      title={label}
      aria-label={label}
      className={cn(
        "inline-flex h-6 items-center gap-1 rounded-full px-2 text-xs font-medium",
        className
      )}
    >
      <Icon className="size-3.5" />
      {hours}
    </span>
  )
}

export function CurrencyCell({ currency }: { currency: Currency | null }) {
  if (!currency) {
    return DASH
  }
  return (
    <span className="inline-flex items-center gap-2">
      <img src={COIN[currency]} alt="" className="size-5 rounded-full" />
      {currency}
    </span>
  )
}

export function AddressCell({
  value,
  text,
  copyable,
}: {
  value: string | null
  text: string
  copyable: boolean
}) {
  if (!value) {
    return DASH
  }
  if (!copyable) {
    return <span className="truncate">{text}</span>
  }
  return <CopyAddress value={value} text={text} />
}
