import {
  BanknoteArrowDown,
  BanknoteArrowUp,
  Sparkles,
  Wallet,
} from "lucide-react"
import { useLayoutEffect, useRef, useState } from "react"
import { useTranslation } from "react-i18next"

import { BalanceFields } from "@/components/BalanceFields"
import { ChannelsDialog } from "@/components/ChannelsDialog"
import {
  EntityMinAmount,
  EntityRuleFields,
} from "@/components/EntityRuleFields"
import { FirstDepositFields } from "@/components/FirstDepositFields"
import { PageTabs } from "@/components/PageTabs"
import { RuleCard } from "@/components/RuleCard"
import { Button } from "@/components/ui/button"
import { useCssHeight } from "@/hooks/use-css-height"
import { usePrototype } from "@/hooks/use-prototype"
import { channelsWith } from "@/lib/channel-picker"
import type { ConnectionKind } from "@/lib/connections"
import type { CardKey } from "@/lib/brand-cards"
import {
  balanceErrors,
  entityErrors,
  firstDepositErrors,
  type EntityErrors,
  type FirstDepositErrors,
} from "@/lib/rules"

const NO_ENTITY_ERRORS: EntityErrors = { categories: {} }
const NO_FIRST_ERRORS: FirstDepositErrors = { subRules: {} }

type ChannelsDialogState = {
  tab: ConnectionKind
  card: CardKey | null
}

export function NotificationsPage() {
  const { t, i18n } = useTranslation()
  const { card } = usePrototype()
  const gridRef = useRef<HTMLDivElement>(null)
  const bandRef = useCssHeight("--band-height")
  const [channelsDialog, setChannelsDialog] =
    useState<ChannelsDialogState | null>(null)

  const balance = card("balance")
  const withdrawal = card("withdrawal")
  const deposit = card("deposit")
  const firstDeposit = card("firstDeposit")

  const balanceInvalid = balance.showErrors ? balanceErrors(balance.draft) : {}
  const withdrawalInvalid = withdrawal.showErrors
    ? entityErrors(withdrawal.draft)
    : NO_ENTITY_ERRORS
  const depositInvalid = deposit.showErrors
    ? entityErrors(deposit.draft)
    : NO_ENTITY_ERRORS
  const firstDepositInvalid = firstDeposit.showErrors
    ? firstDepositErrors(firstDeposit.draft)
    : NO_FIRST_ERRORS

  const openChannels = (tab: ConnectionKind, target: CardKey | null) =>
    setChannelsDialog({ tab, card: target })

  useLayoutEffect(() => {
    const root = gridRef.current
    if (!root) {
      return
    }
    const measure = () => {
      const nodes = [
        ...root.querySelectorAll<HTMLElement>("[data-rule-meaning]"),
      ]
      if (nodes.length === 0) {
        return
      }
      for (const node of nodes) {
        node.style.minHeight = "0px"
      }
      const max = Math.max(...nodes.map((node) => node.scrollHeight))
      for (const node of nodes) {
        node.style.minHeight = ""
      }
      const next = `${max}px`
      if (root.style.getPropertyValue("--rule-meaning-height") !== next) {
        root.style.setProperty("--rule-meaning-height", next)
      }
    }
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(root)
    return () => observer.disconnect()
  }, [i18n.language])

  return (
    <div className="flex w-full flex-col">
      <header
        ref={bandRef}
        className="sticky top-(--chrome-height) z-40 bg-background py-3"
      >
        <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-3 px-4 md:flex-row md:items-center">
          <PageTabs />
          <Button
            type="button"
            variant="outline"
            className="w-full md:ml-auto md:w-auto"
            onClick={() => openChannels("slack", null)}
          >
            {t("notifications.channels")}
          </Button>
        </div>
      </header>

      {/* 360px cards, 8px gap, 16px page padding: 2 from 760px, 4 from 1496px. */}
      <div className="mx-auto w-full max-w-[1600px] px-4 pb-[calc(2.5rem+var(--toolbar-height))]">
        <div
          ref={gridRef}
          className="grid auto-rows-fr grid-cols-1 gap-2 min-[760px]:grid-cols-[repeat(2,minmax(360px,1fr))] min-[1496px]:grid-cols-[repeat(4,minmax(360px,1fr))]"
        >
          <RuleCard
            icon={Wallet}
            title={t("rule.balance.title")}
            meaning={t("rule.balance.meaning")}
            card={balance}
            onConnectChannel={(kind) => openChannels(kind, "balance")}
          >
            <BalanceFields
              value={balance.draft}
              onChange={balance.setDraft}
              invalid={balanceInvalid}
            />
          </RuleCard>

          <RuleCard
            icon={BanknoteArrowUp}
            title={t("rule.withdrawal.title")}
            meaning={t("rule.withdrawal.meaning")}
            card={withdrawal}
            onConnectChannel={(kind) => openChannels(kind, "withdrawal")}
            applyError={
              withdrawalInvalid.selection
                ? t(withdrawalInvalid.selection)
                : null
            }
            pinned={
              <EntityMinAmount
                idPrefix="withdrawal"
                value={withdrawal.draft}
                onChange={withdrawal.setDraft}
                invalid={withdrawalInvalid}
              />
            }
          >
            <EntityRuleFields
              idPrefix="withdrawal"
              value={withdrawal.draft}
              onChange={withdrawal.setDraft}
              invalid={withdrawalInvalid}
            />
          </RuleCard>

          <RuleCard
            icon={BanknoteArrowDown}
            title={t("rule.deposit.title")}
            meaning={t("rule.deposit.meaning")}
            card={deposit}
            onConnectChannel={(kind) => openChannels(kind, "deposit")}
            applyError={
              depositInvalid.selection ? t(depositInvalid.selection) : null
            }
            pinned={
              <EntityMinAmount
                idPrefix="deposit"
                value={deposit.draft}
                onChange={deposit.setDraft}
                invalid={depositInvalid}
              />
            }
          >
            <EntityRuleFields
              idPrefix="deposit"
              value={deposit.draft}
              onChange={deposit.setDraft}
              invalid={depositInvalid}
            />
          </RuleCard>

          <RuleCard
            icon={Sparkles}
            title={t("rule.firstDeposit.title")}
            meaning={t("rule.firstDeposit.meaning")}
            card={firstDeposit}
            onConnectChannel={(kind) => openChannels(kind, "firstDeposit")}
            applyError={
              firstDepositInvalid.selection
                ? t(firstDepositInvalid.selection)
                : null
            }
          >
            <FirstDepositFields
              value={firstDeposit.draft}
              onChange={firstDeposit.setDraft}
              invalid={firstDepositInvalid}
            />
          </RuleCard>
        </div>

        {channelsDialog ? (
          <ChannelsDialog
            initialTab={channelsDialog.tab}
            chooseFor={channelsDialog.card ? channelsDialog.tab : null}
            onChoose={(id) => {
              if (!channelsDialog.card) {
                return
              }
              const current = card(channelsDialog.card)
              current.setChannels(
                channelsWith(current.channels, channelsDialog.tab, id)
              )
            }}
            onClose={() => setChannelsDialog(null)}
          />
        ) : null}
      </div>
    </div>
  )
}
