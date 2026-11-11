export type WalletRole = "deposit" | "central" | "withdrawal"

export type Chain = "ethereum" | "tron" | "bsc"

export type Currency = "ETH" | "USDT" | "TRX" | "BNB"

export type ActivityRange =
  "00–06 CET" | "06–12 CET" | "12–18 CET" | "18–24 CET"

/** One row of the uploaded CSV (`client_id,slug,address_type,chain`). */
export type WalletRow = {
  clientId: string
  address: string
  role: WalletRole
  chain: Chain
}

/** What the chain says about one client. Amounts are whole EUR. */
export type ClientChainResult = {
  clientId: string
  balance: number
  annualTurnover: number
  turnoverWithUs: number
  activity: ActivityRange | null
  currency: Currency | null
  mainWallet: string | null
  /** A catalog entity name, an unresolved full address, or nothing. */
  topEntity: string | null
  /** 0 = no history; 1–10 = how much there is to scan. Drives sync timing. */
  historySize: number
}

export type SampleFile = {
  wallets: WalletRow[]
  clients: ClientChainResult[]
}

export type SampleFileId = "a" | "b"
