import { createContext, useContext, type Dispatch } from "react"

import type { SampleFileId } from "@/data/wallet-types"
import { isUploadSyncing, type ListSort } from "@/lib/client-list"
import type { ConnectionKind } from "@/lib/connections"
import {
  CARD_KINDS,
  type CardKey,
  type CardOp,
  type CardValues,
} from "@/lib/brand-cards"
import {
  brandName,
  startOver,
  type AppTab,
  type BrandState,
  type PrototypeAction,
  type PrototypeState,
} from "@/lib/prototype-state"
import {
  ruleCardStatus,
  type DraftUpdate,
  type RuleCardKind,
  type RuleCardState,
  type RuleCardStatus,
} from "@/lib/rule-card"
import type { Channels } from "@/lib/rules"

export type PrototypeStore = {
  state: PrototypeState
  dispatch: Dispatch<PrototypeAction>
  /** Ticks while some brand is syncing; stale otherwise. */
  now: number
}

export const PrototypeContext = createContext<PrototypeStore>({
  state: startOver(),
  now: 0,
  dispatch: () => {
    throw new Error("PrototypeProvider is missing")
  },
})

export type CardView<K extends CardKey> = RuleCardState<CardValues[K]> & {
  status: RuleCardStatus
  setDraft: (next: DraftUpdate<CardValues[K]>) => void
  open: () => void
  cancel: () => void
  apply: () => void
  toggleSending: (on: boolean) => void
  setChannels: (channels: Channels) => void
}

export function usePrototype() {
  const { state, dispatch, now } = useContext(PrototypeContext)
  const brandId = state.activeBrand
  const brand: BrandState = state.brands[brandId]

  const card = <K extends CardKey>(key: K): CardView<K> => {
    const send = (op: CardOp<CardValues[K]>) =>
      // One cast: TS cannot correlate a generic key with its matching op.
      dispatch({
        type: "card",
        brand: brandId,
        card: key,
        op,
      } as PrototypeAction)
    const current = brand.cards[key] as RuleCardState<CardValues[K]>
    const kind = CARD_KINDS[key] as RuleCardKind<CardValues[K]>
    return {
      ...current,
      status: ruleCardStatus(current, kind),
      setDraft: (next: DraftUpdate<CardValues[K]>) =>
        send({ kind: "setDraft", next }),
      open: () => send({ kind: "open" }),
      cancel: () => send({ kind: "cancel" }),
      apply: () => send({ kind: "apply" }),
      toggleSending: (on: boolean) => send({ kind: "toggleSending", on }),
      setChannels: (channels: Channels) =>
        send({ kind: "setChannels", channels }),
    }
  }

  const upload = brand.upload
  const syncing = upload !== null && isUploadSyncing(upload, now)

  return {
    state,
    now,
    upload,
    syncing,
    list: brand.list,
    uploadSample: (file: SampleFileId) =>
      dispatch({ type: "upload", brand: brandId, file, now: Date.now() }),
    setSearch: (text: string) =>
      dispatch({ type: "search", brand: brandId, text }),
    setSort: (sort: ListSort) =>
      dispatch({ type: "sort", brand: brandId, sort }),
    setPage: (page: number) => dispatch({ type: "page", brand: brandId, page }),
    activeBrand: brandId,
    activeBrandName: brandName(brandId),
    activeTab: state.activeTab,
    selectBrand: (brand: string) => dispatch({ type: "selectBrand", brand }),
    selectTab: (tab: AppTab) => dispatch({ type: "selectTab", tab }),
    startOver: () => dispatch({ type: "startOver" }),
    clientsLoaded: () =>
      dispatch({ type: "clientsLoaded", brand: brandId, now: Date.now() }),
    alertsSetUp: () =>
      dispatch({ type: "alertsSetUp", brand: brandId, now: Date.now() }),
    connections: state.connections,
    connect: (kind: ConnectionKind, ids: string[]) =>
      dispatch({ type: "connect", kind, ids }),
    removeConnection: (kind: ConnectionKind, id: string) =>
      dispatch({ type: "removeConnection", kind, id }),
    card,
  }
}
