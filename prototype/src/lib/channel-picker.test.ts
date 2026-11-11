import { describe, expect, it } from "vitest"

import {
  CHANNEL_ORDER,
  channelId,
  channelsWith,
  channelTabMode,
} from "@/lib/channel-picker"
import { emptyChannels } from "@/lib/rules"

const chats = {
  slackChatId: "slack-c2b",
  telegramChatId: "tg-risk",
  emailId: "ops@acme.io",
}

describe("channel pickers", () => {
  it("runs Slack, then Telegram, then Email", () => {
    expect(CHANNEL_ORDER).toEqual(["slack", "telegram", "email"])
  })

  it("choosing a chat changes only that messenger", () => {
    expect(channelsWith(chats, "telegram", "tg-c2b")).toEqual({
      ...chats,
      telegramChatId: "tg-c2b",
    })
  })

  it("clearing a chat leaves the other messengers", () => {
    expect(channelsWith(chats, "slack", null)).toEqual({
      ...chats,
      slackChatId: null,
    })
  })

  it("reads back only the chat that messenger has", () => {
    expect(channelId(chats, "email")).toBe("ops@acme.io")
    expect(channelId(emptyChannels(), "slack")).toBeNull()
  })

  it("choosing the first chat on an empty card leaves the rest empty", () => {
    expect(channelsWith(emptyChannels(), "email", "ops@acme.io")).toEqual({
      slackChatId: null,
      telegramChatId: null,
      emailId: "ops@acme.io",
    })
  })
})

describe("channel tab", () => {
  it("a tab with nothing connected shows its connect steps", () => {
    expect(channelTabMode(0, false)).toBe("connect")
  })

  it("a tab with connected items shows the list", () => {
    expect(channelTabMode(2, false)).toBe("manage")
  })

  it("opening Connect from a card shows connect steps even when items exist", () => {
    expect(channelTabMode(2, true)).toBe("connect")
  })
})
