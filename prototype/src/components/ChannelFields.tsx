import { useId } from "react"
import { XIcon } from "lucide-react"

import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { SLACK_CHATS, TELEGRAM_CHATS } from "@/data/catalog"
import { fieldPrefixClassName } from "@/lib/field-chrome"
import { REQUIRED, type Channels } from "@/lib/rules"
import { cn } from "@/lib/utils"

type ChannelFieldsProps = {
  value: Channels
  onChange: (next: Channels) => void
  invalid?: boolean
  title?: string | null
}

type ChannelSelectFieldProps = {
  id: string
  label: string
  value: string | null
  chats: typeof SLACK_CHATS
  onChange: (value: string | null) => void
  invalid: boolean
}

export function ChannelFields({
  value,
  onChange,
  invalid = false,
  title = "Send alerts to *",
}: ChannelFieldsProps) {
  const idPrefix = useId().replaceAll(":", "")

  return (
    <div className="flex flex-col gap-2">
      {title ? <p className="text-sm font-medium">{title}</p> : null}
      <div className="flex flex-col gap-2">
        <ChannelSelectField
          id={`${idPrefix}-slack-channel`}
          label="Slack"
          value={value.slackChatId}
          chats={SLACK_CHATS}
          onChange={(slackChatId) => onChange({ ...value, slackChatId })}
          invalid={invalid}
        />
        <ChannelSelectField
          id={`${idPrefix}-telegram-channel`}
          label="Telegram"
          value={value.telegramChatId}
          chats={TELEGRAM_CHATS}
          onChange={(telegramChatId) => onChange({ ...value, telegramChatId })}
          invalid={invalid}
        />
      </div>
      <FieldError>{invalid ? REQUIRED : null}</FieldError>
    </div>
  )
}

function ChannelSelectField({
  id,
  label,
  value,
  chats,
  onChange,
  invalid,
}: ChannelSelectFieldProps) {
  return (
    <Field data-invalid={invalid || undefined}>
      <div className="flex max-w-sm">
        <FieldLabel htmlFor={id} className={fieldPrefixClassName}>
          {label}
        </FieldLabel>
        <div className="relative min-w-0 flex-1">
          <Select value={value ?? ""} onValueChange={onChange}>
            <SelectTrigger
              id={id}
              className={cn(
                "w-full min-w-0 rounded-l-none",
                value && "*:data-[slot=select-value]:pe-6"
              )}
              aria-invalid={invalid || undefined}
            >
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              {chats.map((chat) => (
                <SelectItem key={chat.id} value={chat.id}>
                  {chat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {value ? (
            <button
              type="button"
              aria-label={`Clear ${label}`}
              className="absolute top-1/2 right-8 z-10 -translate-y-1/2 rounded-sm text-muted-foreground hover:text-foreground"
              onPointerDown={(event) => {
                event.preventDefault()
                event.stopPropagation()
              }}
              onClick={() => onChange(null)}
            >
              <XIcon className="size-4" />
            </button>
          ) : null}
        </div>
      </div>
    </Field>
  )
}
