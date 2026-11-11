import { BRANDS } from "@/data/brands"
import type { SampleFileId } from "@/data/wallet-types"
import { withPresetItems, withPresetRules } from "@/lib/alert-presets"
import {
  cardsAfter,
  emptyCards,
  type BrandCards,
  type CardAction,
} from "@/lib/brand-cards"
import {
  DEFAULT_LIST,
  finishedUpload,
  type ListSort,
  type ListState,
  type Upload,
} from "@/lib/client-list"
import {
  addItems,
  emptyConnections,
  removeItem,
  type ConnectionKind,
  type Connections,
} from "@/lib/connections"

export type {
  CardAction,
  CardKey,
  CardValues,
  BrandCards,
} from "@/lib/brand-cards"

export type BrandState = {
  /** The sample file this brand's clients came from; null until the first. */
  upload: Upload | null
  list: ListState
  cards: BrandCards
}

export type AppTab = "clients" | "notifications"

export type PrototypeState = {
  /** Account-wide; every brand picks from the same connected items. */
  connections: Connections
  brands: Record<string, BrandState>
  activeBrand: string
  activeTab: AppTab
}

function emptyBrand(): BrandState {
  return {
    upload: null,
    list: DEFAULT_LIST,
    cards: emptyCards(),
  }
}

/** The brand's display name; an unknown id is shown as is. */
export function brandName(id: string): string {
  return BRANDS.find((brand) => brand.id === id)?.name ?? id
}

/** Initial state: every brand empty, first brand active, Clients tab open. */
export function startOver(): PrototypeState {
  return {
    connections: emptyConnections(),
    brands: Object.fromEntries(BRANDS.map((brand) => [brand.id, emptyBrand()])),
    activeBrand: BRANDS[0].id,
    activeTab: "clients",
  }
}

/** The brand's upload is sample file A with sync finished at `now`. */
export function clientsLoaded(
  state: PrototypeState,
  brandId: string,
  now: number
): PrototypeState {
  const next = withBrand(state, brandId, (brand) => ({
    ...brand,
    upload: finishedUpload("a", now),
    list: { ...brand.list, search: "", page: 1 },
  }))
  return next === state ? state : { ...next, activeTab: "clients" }
}

/** Clients loaded, plus the three preset chats on each rule and four applied rules. */
export function alertsSetUp(
  state: PrototypeState,
  brandId: string,
  now: number
): PrototypeState {
  const loaded = clientsLoaded(state, brandId, now)
  const next = withBrand(loaded, brandId, withPresetRules)
  return next === state
    ? state
    : {
        ...next,
        connections: withPresetItems(next.connections),
        activeTab: "notifications",
      }
}

export type PrototypeAction =
  | CardAction
  | { type: "connect"; kind: ConnectionKind; ids: string[] }
  | { type: "removeConnection"; kind: ConnectionKind; id: string }
  | { type: "upload"; brand: string; file: SampleFileId; now: number }
  | { type: "search"; brand: string; text: string }
  | { type: "sort"; brand: string; sort: ListSort }
  | { type: "page"; brand: string; page: number }
  | { type: "clientsLoaded"; brand: string; now: number }
  | { type: "alertsSetUp"; brand: string; now: number }
  | { type: "selectBrand"; brand: string }
  | { type: "selectTab"; tab: AppTab }
  | { type: "startOver" }

function withBrand(
  state: PrototypeState,
  brandId: string,
  change: (brand: BrandState) => BrandState
): PrototypeState {
  const brand = state.brands[brandId]
  if (!brand) {
    return state
  }
  return { ...state, brands: { ...state.brands, [brandId]: change(brand) } }
}

export function prototypeReducer(
  state: PrototypeState,
  action: PrototypeAction
): PrototypeState {
  switch (action.type) {
    case "startOver":
      return startOver()
    case "clientsLoaded":
      return clientsLoaded(state, action.brand, action.now)
    case "alertsSetUp":
      return alertsSetUp(state, action.brand, action.now)
    case "connect":
      return {
        ...state,
        connections: addItems(state.connections, action.kind, action.ids),
      }
    case "removeConnection":
      return removeItem(state, action.kind, action.id)
    case "selectBrand": {
      const next = state.brands[action.brand]
      if (!next) {
        return state
      }
      // Pages open only after a file. An empty brand has nowhere to put the tab.
      return {
        ...state,
        activeBrand: action.brand,
        activeTab: next.upload ? state.activeTab : "clients",
      }
    }
    case "selectTab":
      if (
        action.tab === "notifications" &&
        !state.brands[state.activeBrand]?.upload
      ) {
        return state
      }
      return { ...state, activeTab: action.tab }
    case "upload":
      // A replace restarts sync and clears search; sort, rules and channels stay.
      return withBrand(state, action.brand, (brand) => ({
        ...brand,
        upload: { file: action.file, startedAt: action.now },
        list: { ...brand.list, search: "", page: 1 },
      }))
    case "search":
      return withBrand(state, action.brand, (brand) => ({
        ...brand,
        list: { ...brand.list, search: action.text, page: 1 },
      }))
    case "sort":
      return withBrand(state, action.brand, (brand) => ({
        ...brand,
        list: { ...brand.list, sort: action.sort, page: 1 },
      }))
    case "page":
      return withBrand(state, action.brand, (brand) => ({
        ...brand,
        list: { ...brand.list, page: action.page },
      }))
    case "card":
      return withBrand(state, action.brand, (brand) => ({
        ...brand,
        cards: cardsAfter(brand.cards, action),
      }))
  }
}
