import { useState } from "react"

import { BalanceFields } from "@/components/BalanceFields"
import { ChannelFields } from "@/components/ChannelFields"
import { EntityRuleFields } from "@/components/EntityRuleFields"
import { FirstDepositFields } from "@/components/FirstDepositFields"
import { RuleCard } from "@/components/RuleCard"
import {
  AppliedRuleSummary,
  BalanceSummaryTable,
  EntitySummaryTable,
  FirstDepositSummaryTable,
} from "@/components/RuleSummaryTable"
import { Button } from "@/components/ui/button"
import {
  balanceErrors,
  balanceSummaryRows,
  channelPairs,
  commitBalance,
  commitEntity,
  commitFirstDeposit,
  emptyBalance,
  emptyChannels,
  emptyEntity,
  emptyFirstDeposit,
  entityErrors,
  entitySummaryRows,
  firstDepositErrors,
  firstDepositSummaryRows,
  hasAnyChat,
  isBalanceValid,
  isEntityValid,
  isFirstDepositValid,
  type Channels,
  type EntityErrors,
} from "@/lib/rules"
import { useRuleCard } from "@/hooks/use-rule-card"

const EMPTY_ENTITY_ERRORS: EntityErrors = {}

export function NotificationsPage() {
  const [pageChannels, setPageChannels] = useState<Channels>(emptyChannels)
  const pageInvalid = !hasAnyChat(pageChannels)

  const balance = useRuleCard({
    createEmpty: emptyBalance,
    commit: commitBalance,
    isValid: isBalanceValid,
  })
  const withdrawal = useRuleCard({
    createEmpty: emptyEntity,
    commit: commitEntity,
    isValid: isEntityValid,
  })
  const deposit = useRuleCard({
    createEmpty: emptyEntity,
    commit: commitEntity,
    isValid: isEntityValid,
  })
  const firstDeposit = useRuleCard({
    createEmpty: emptyFirstDeposit,
    commit: commitFirstDeposit,
    isValid: isFirstDepositValid,
  })

  const balanceInvalid = balance.showErrors ? balanceErrors(balance.draft) : {}
  const withdrawalInvalid = withdrawal.showErrors
    ? entityErrors(withdrawal.draft)
    : EMPTY_ENTITY_ERRORS
  const depositInvalid = deposit.showErrors
    ? entityErrors(deposit.draft)
    : EMPTY_ENTITY_ERRORS
  const firstInvalid = firstDeposit.showErrors
    ? firstDepositErrors(firstDeposit.draft)
    : {}

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 py-10">
      <header className="flex flex-col gap-1">
        <p className="text-sm text-muted-foreground">C2B → Notifications</p>
        <h1 className="text-xl font-medium">Notifications</h1>
        <p className="text-sm text-muted-foreground">
          Company-wide alerts for this client table. Slack and Telegram chats
          below are already connected.
        </p>
      </header>

      <ChannelFields
        value={pageChannels}
        onChange={setPageChannels}
        invalid={pageInvalid}
      />

      <div className="flex flex-col gap-3">
        <RuleCard
          title="Wallet balance change"
          meaning="Fires when any labeled client wallet balance jumps up or down past a threshold."
          expanded={balance.expanded}
          applied={balance.applied !== null}
          sending={balance.sending}
          summary={
            balance.applied ? (
              <AppliedRuleSummary
                table={
                  <BalanceSummaryTable
                    rows={balanceSummaryRows(balance.applied)}
                  />
                }
                channels={channelPairs(balance.applied)}
              />
            ) : null
          }
          onOpen={balance.open}
          onCancel={balance.cancel}
          onApply={balance.apply}
          onToggleSending={balance.toggleSending}
        >
          <div className="flex flex-col gap-5">
            <BalanceFields
              value={balance.draft}
              onChange={balance.setDraft}
              invalid={balanceInvalid}
            />
            <ChannelOverride
              value={balance.draft}
              onChange={(channels) =>
                balance.setDraft((current) => ({ ...current, ...channels }))
              }
            />
          </div>
        </RuleCard>

        <RuleCard
          title="Entity withdrawal"
          meaning="Fires when a client withdrew from a platform — money left that venue to the client. Not your payout desk."
          expanded={withdrawal.expanded}
          applied={withdrawal.applied !== null}
          sending={withdrawal.sending}
          summary={
            withdrawal.applied ? (
              <AppliedRuleSummary
                table={
                  <EntitySummaryTable
                    rows={entitySummaryRows(withdrawal.applied)}
                  />
                }
                channels={channelPairs(withdrawal.applied)}
              />
            ) : null
          }
          onOpen={withdrawal.open}
          onCancel={withdrawal.cancel}
          onApply={withdrawal.apply}
          onToggleSending={withdrawal.toggleSending}
        >
          <div className="flex flex-col gap-5">
            <EntityRuleFields
              idPrefix="withdrawal"
              value={withdrawal.draft}
              onChange={withdrawal.setDraft}
              invalid={withdrawalInvalid}
            />
            <ChannelOverride
              value={withdrawal.draft}
              onChange={(channels) =>
                withdrawal.setDraft((current) => ({
                  ...current,
                  ...channels,
                }))
              }
            />
          </div>
        </RuleCard>

        <RuleCard
          title="Entity deposit"
          meaning="Fires when a client deposited to a platform."
          expanded={deposit.expanded}
          applied={deposit.applied !== null}
          sending={deposit.sending}
          summary={
            deposit.applied ? (
              <AppliedRuleSummary
                table={
                  <EntitySummaryTable
                    rows={entitySummaryRows(deposit.applied)}
                  />
                }
                channels={channelPairs(deposit.applied)}
              />
            ) : null
          }
          onOpen={deposit.open}
          onCancel={deposit.cancel}
          onApply={deposit.apply}
          onToggleSending={deposit.toggleSending}
        >
          <div className="flex flex-col gap-5">
            <EntityRuleFields
              idPrefix="deposit"
              value={deposit.draft}
              onChange={deposit.setDraft}
              invalid={depositInvalid}
            />
            <ChannelOverride
              value={deposit.draft}
              onChange={(channels) =>
                deposit.setDraft((current) => ({ ...current, ...channels }))
              }
            />
          </div>
        </RuleCard>

        <RuleCard
          title="First deposit"
          meaning="Fires on a client’s first deposit into a chosen company category."
          expanded={firstDeposit.expanded}
          applied={firstDeposit.applied !== null}
          sending={firstDeposit.sending}
          summary={
            firstDeposit.applied ? (
              <AppliedRuleSummary
                table={
                  <FirstDepositSummaryTable
                    rows={firstDepositSummaryRows(firstDeposit.applied)}
                  />
                }
                channels={channelPairs(firstDeposit.applied)}
              />
            ) : null
          }
          onOpen={firstDeposit.open}
          onCancel={firstDeposit.cancel}
          onApply={firstDeposit.apply}
          onToggleSending={firstDeposit.toggleSending}
        >
          <div className="flex flex-col gap-5">
            <FirstDepositFields
              value={firstDeposit.draft}
              onChange={firstDeposit.setDraft}
              invalid={firstInvalid}
            />
            <ChannelOverride
              value={firstDeposit.draft}
              onChange={(channels) =>
                firstDeposit.setDraft((current) => ({
                  ...current,
                  ...channels,
                }))
              }
            />
          </div>
        </RuleCard>
      </div>
    </div>
  )
}

function ChannelOverride({
  value,
  onChange,
}: {
  value: Channels
  onChange: (next: Channels) => void
}) {
  const [revealed, setRevealed] = useState(false)
  const visible = revealed || hasAnyChat(value)

  if (!visible) {
    return (
      <Button
        type="button"
        variant="link"
        className="h-auto self-start px-0"
        onClick={() => setRevealed(true)}
      >
        Use a different chat
      </Button>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      <Button
        type="button"
        variant="link"
        className="h-auto self-start px-0"
        onClick={() => {
          onChange(emptyChannels())
          setRevealed(false)
        }}
      >
        Use page default
      </Button>
      <ChannelFields value={value} onChange={onChange} title={null} />
    </div>
  )
}
