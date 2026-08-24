import type { ReactNode } from "react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

type RuleCardProps = {
  title: string
  meaning: string
  expanded: boolean
  applied: boolean
  sending: boolean
  summary: ReactNode
  onOpen: () => void
  onCancel: () => void
  onApply: () => void
  onToggleSending: (on: boolean) => void
  children: ReactNode
}

export function RuleCard({
  title,
  meaning,
  expanded,
  applied,
  sending,
  summary,
  onOpen,
  onCancel,
  onApply,
  onToggleSending,
  children,
}: RuleCardProps) {
  const titleBlock = (
    <div className="min-w-0 flex-1 text-left">
      <CardTitle>{title}</CardTitle>
      <CardDescription className="mt-1">{meaning}</CardDescription>
    </div>
  )

  return (
    <Card className={cn(expanded && "overflow-visible")}>
      <CardHeader className="grid-cols-[1fr_auto] items-start gap-3">
        {expanded ? (
          <div className="col-start-1 min-w-0">{titleBlock}</div>
        ) : (
          <div className="col-start-1 flex min-w-0 flex-col gap-2">
            <button
              type="button"
              className="flex min-w-0 cursor-pointer items-start rounded-md text-left outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
              onClick={onOpen}
            >
              {titleBlock}
            </button>
            {summary ? (
              <div
                className={cn(
                  "min-w-0 cursor-pointer rounded-md outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                  !sending && "opacity-70"
                )}
                onClick={onOpen}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault()
                    onOpen()
                  }
                }}
                role="button"
                tabIndex={0}
              >
                {summary}
              </div>
            ) : null}
          </div>
        )}
        <CardAction className="row-start-1 flex items-center pt-0.5">
          {applied ? (
            <Switch
              checked={sending}
              onCheckedChange={onToggleSending}
              aria-label={sending ? "Mute alerts" : "Unmute alerts"}
            />
          ) : (
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="inline-flex">
                  <Switch
                    checked={false}
                    disabled
                    aria-label="Alerts off until the rule is set up"
                  />
                </span>
              </TooltipTrigger>
              <TooltipContent>Set up the rule first</TooltipContent>
            </Tooltip>
          )}
        </CardAction>
      </CardHeader>
      {expanded ? (
        <>
          <CardContent className="flex flex-col gap-5 pb-16">
            {children}
          </CardContent>
          <CardFooter className="sticky bottom-0 z-10 justify-end gap-2 bg-muted">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="button" onClick={onApply}>
              Apply
            </Button>
          </CardFooter>
        </>
      ) : (
        <CardFooter className="justify-end">
          <Button type="button" variant="outline" onClick={onOpen}>
            {applied ? "Edit" : "Set up"}
          </Button>
        </CardFooter>
      )}
    </Card>
  )
}
