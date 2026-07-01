import * as React from "react"

import {
  prospects as seedProspects,
  prospectLists as seedLists,
  campaigns as seedCampaigns,
  conversations as seedConversations,
  setLiveProspects,
  setLiveLists,
  setLiveCampaigns,
} from "./mock-data"
import {
  deals as seedDeals,
  tasks as seedTasks,
  emailTemplates as seedTemplates,
  accounts as seedAccounts,
  setLiveDeals,
  setLiveTasks,
  setLiveTemplates,
  setLiveAccounts,
} from "./mock-extra"
import type {
  Prospect,
  ProspectList,
  Campaign,
  CampaignStep,
  StepChannel,
  Deal,
  Task,
  EmailTemplate,
  Account,
  Conversation,
  Message,
  ChatLang,
  ConvStatus,
} from "./types"
import type { EnrichScope } from "./enrichment"

// Deterministic mock direct-dial derived from a contact id, so the same
// contact always "reveals" the same number across renders.
function mockPhone(seed: string): string {
  let h = 0
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0
  const area = 200 + (h % 800)
  const mid = 100 + ((h >> 4) % 900)
  const last = 1000 + ((h >> 8) % 9000)
  return `+1 (${area}) ${mid}-${last}`
}

interface StoreState {
  prospects: Prospect[]
  lists: ProspectList[]
  campaigns: Campaign[]
  deals: Deal[]
  tasks: Task[]
  templates: EmailTemplate[]
  accounts: Account[]
  conversations: Conversation[]
  convSeedVersion?: number
}

const KEY = "kombo_store_v1"

// Bump when the conversation seed changes shape so the inbox re-seeds on load
// without wiping the user's edits to other slices (prospects, lists, etc.).
const CONV_SEED_VERSION = 2

function seed(): StoreState {
  return {
    prospects: seedProspects,
    lists: seedLists,
    campaigns: seedCampaigns,
    deals: seedDeals,
    tasks: seedTasks,
    templates: seedTemplates,
    accounts: seedAccounts,
    conversations: seedConversations,
    convSeedVersion: CONV_SEED_VERSION,
  }
}

function load(): StoreState {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<StoreState>
      const base = seed()
      const convOutdated = parsed.convSeedVersion !== CONV_SEED_VERSION
      return {
        prospects: parsed.prospects ?? base.prospects,
        lists: parsed.lists ?? base.lists,
        campaigns: parsed.campaigns ?? base.campaigns,
        deals: parsed.deals ?? base.deals,
        tasks: parsed.tasks ?? base.tasks,
        templates: parsed.templates ?? base.templates,
        accounts: parsed.accounts ?? base.accounts,
        conversations: convOutdated
          ? base.conversations
          : parsed.conversations ?? base.conversations,
        convSeedVersion: CONV_SEED_VERSION,
      }
    }
  } catch {
    /* ignore malformed storage */
  }
  return seed()
}

let state: StoreState = load()
const listeners = new Set<() => void>()

function sync(): void {
  setLiveProspects(state.prospects)
  setLiveLists(state.lists)
  setLiveCampaigns(state.campaigns)
  setLiveDeals(state.deals)
  setLiveTasks(state.tasks)
  setLiveTemplates(state.templates)
  setLiveAccounts(state.accounts)
}
sync()

function persist(): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(state))
  } catch {
    /* ignore quota errors */
  }
}

function setState(patch: Partial<StoreState>): void {
  state = { ...state, ...patch }
  sync()
  persist()
  listeners.forEach((l) => l())
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

function useSlice<T>(selector: (s: StoreState) => T): T {
  return React.useSyncExternalStore(
    subscribe,
    () => selector(state),
    () => selector(state)
  )
}

// Stable, increasing ids (seeded once at module load — not during render).
let counter = Date.now()
function uid(prefix: string): string {
  counter += 1
  return `${prefix}_${counter.toString(36)}`
}
function nowISO(): string {
  return new Date().toISOString()
}

/* -------------------------------- hooks -------------------------------- */
export function useProspects(): Prospect[] {
  return useSlice((s) => s.prospects)
}
export function useLists(): ProspectList[] {
  return useSlice((s) => s.lists)
}
export function useCampaigns(): Campaign[] {
  return useSlice((s) => s.campaigns)
}
export function useDeals(): Deal[] {
  return useSlice((s) => s.deals)
}
export function useTasks(): Task[] {
  return useSlice((s) => s.tasks)
}
export function useTemplates(): EmailTemplate[] {
  return useSlice((s) => s.templates)
}
export function useAccounts(): Account[] {
  return useSlice((s) => s.accounts)
}
export function useConversations(): Conversation[] {
  return useSlice((s) => s.conversations)
}

/* ------------------------------- actions ------------------------------- */
export const listStore = {
  create(
    data: Pick<ProspectList, "name" | "description" | "color"> &
      Partial<Omit<ProspectList, "id" | "createdAt">>
  ): ProspectList {
    const list: ProspectList = {
      ...data,
      id: uid("ls"),
      createdAt: nowISO(),
      prospectIds: data.prospectIds ?? [],
      accountIds: data.accountIds ?? [],
      source: data.source ?? "search",
    }
    setState({ lists: [list, ...state.lists] })
    return list
  },
  update(id: string, patch: Partial<ProspectList>): void {
    setState({
      lists: state.lists.map((l) => (l.id === id ? { ...l, ...patch } : l)),
    })
  },
  remove(id: string): void {
    setState({ lists: state.lists.filter((l) => l.id !== id) })
  },
  addProspects(id: string, ids: string[]): void {
    setState({
      lists: state.lists.map((l) =>
        l.id === id
          ? { ...l, prospectIds: Array.from(new Set([...l.prospectIds, ...ids])) }
          : l
      ),
    })
  },
  removeProspect(id: string, prospectId: string): void {
    setState({
      lists: state.lists.map((l) =>
        l.id === id
          ? { ...l, prospectIds: l.prospectIds.filter((x) => x !== prospectId) }
          : l
      ),
    })
  },
  addAccounts(id: string, ids: string[]): void {
    setState({
      lists: state.lists.map((l) =>
        l.id === id
          ? {
              ...l,
              accountIds: Array.from(
                new Set([...(l.accountIds ?? []), ...ids])
              ),
            }
          : l
      ),
    })
  },
  removeAccount(id: string, accountId: string): void {
    setState({
      lists: state.lists.map((l) =>
        l.id === id
          ? {
              ...l,
              accountIds: (l.accountIds ?? []).filter((x) => x !== accountId),
            }
          : l
      ),
    })
  },
}

export const dealStore = {
  create(data: Omit<Deal, "id" | "createdAt">): Deal {
    const deal: Deal = { ...data, id: uid("deal"), createdAt: nowISO() }
    setState({ deals: [deal, ...state.deals] })
    return deal
  },
  update(id: string, patch: Partial<Deal>): void {
    setState({
      deals: state.deals.map((d) => (d.id === id ? { ...d, ...patch } : d)),
    })
  },
  remove(id: string): void {
    setState({ deals: state.deals.filter((d) => d.id !== id) })
  },
  move(id: string, stage: Deal["stage"]): void {
    setState({
      deals: state.deals.map((d) => (d.id === id ? { ...d, stage } : d)),
    })
  },
}

export const taskStore = {
  create(data: Omit<Task, "id">): Task {
    const task: Task = { ...data, id: uid("task") }
    setState({ tasks: [task, ...state.tasks] })
    return task
  },
  update(id: string, patch: Partial<Task>): void {
    setState({
      tasks: state.tasks.map((t) => (t.id === id ? { ...t, ...patch } : t)),
    })
  },
  remove(id: string): void {
    setState({ tasks: state.tasks.filter((t) => t.id !== id) })
  },
  toggle(id: string): void {
    setState({
      tasks: state.tasks.map((t) =>
        t.id === id ? { ...t, done: !t.done } : t
      ),
    })
  },
}

export const templateStore = {
  create(
    data: Omit<EmailTemplate, "id" | "updatedAt" | "sent" | "replyRate"> &
      Partial<Pick<EmailTemplate, "sent" | "replyRate">>
  ): EmailTemplate {
    const tpl: EmailTemplate = {
      ...data,
      id: uid("tpl"),
      sent: data.sent ?? 0,
      replyRate: data.replyRate ?? 0,
      updatedAt: nowISO(),
    }
    setState({ templates: [tpl, ...state.templates] })
    return tpl
  },
  update(id: string, patch: Partial<EmailTemplate>): void {
    setState({
      templates: state.templates.map((t) =>
        t.id === id ? { ...t, ...patch, updatedAt: nowISO() } : t
      ),
    })
  },
  remove(id: string): void {
    setState({ templates: state.templates.filter((t) => t.id !== id) })
  },
}

export const campaignStore = {
  create(data: Pick<Campaign, "name"> & Partial<Campaign>): Campaign {
    const campaign: Campaign = {
      id: uid("cm"),
      name: data.name,
      status: data.status ?? "draft",
      steps: data.steps ?? [],
      enrolled: data.enrolled ?? 0,
      opened: data.opened ?? 0,
      replied: data.replied ?? 0,
      meetings: data.meetings ?? 0,
      createdAt: nowISO(),
      goal: data.goal,
      listId: data.listId,
      enrolledIds: data.enrolledIds,
    }
    setState({ campaigns: [campaign, ...state.campaigns] })
    return campaign
  },
  update(id: string, patch: Partial<Campaign>): void {
    setState({
      campaigns: state.campaigns.map((c) =>
        c.id === id ? { ...c, ...patch } : c
      ),
    })
  },
  remove(id: string): void {
    setState({ campaigns: state.campaigns.filter((c) => c.id !== id) })
  },
  addStep(campaignId: string, channel: StepChannel): void {
    setState({
      campaigns: state.campaigns.map((c) => {
        if (c.id !== campaignId) return c
        const step: CampaignStep = {
          id: uid("s"),
          channel,
          delayDays: c.steps.length === 0 ? 0 : 3,
          subject: "",
          body: "",
        }
        return { ...c, steps: [...c.steps, step] }
      }),
    })
  },
  updateStep(
    campaignId: string,
    stepId: string,
    patch: Partial<CampaignStep>
  ): void {
    setState({
      campaigns: state.campaigns.map((c) =>
        c.id === campaignId
          ? {
              ...c,
              steps: c.steps.map((s) =>
                s.id === stepId ? { ...s, ...patch } : s
              ),
            }
          : c
      ),
    })
  },
  removeStep(campaignId: string, stepId: string): void {
    setState({
      campaigns: state.campaigns.map((c) =>
        c.id === campaignId
          ? { ...c, steps: c.steps.filter((s) => s.id !== stepId) }
          : c
      ),
    })
  },
  moveStep(campaignId: string, stepId: string, dir: -1 | 1): void {
    setState({
      campaigns: state.campaigns.map((c) => {
        if (c.id !== campaignId) return c
        const index = c.steps.findIndex((s) => s.id === stepId)
        const target = index + dir
        if (index === -1 || target < 0 || target >= c.steps.length) return c
        const steps = [...c.steps]
        const [moved] = steps.splice(index, 1)
        steps.splice(target, 0, moved)
        return { ...c, steps }
      }),
    })
  },
  attachList(campaignId: string, listId: string): void {
    const campaign = state.campaigns.find((c) => c.id === campaignId)
    const previousListId = campaign?.listId
    const targetList = state.lists.find((l) => l.id === listId)
    const conflictCampaignId = targetList?.campaignId
    setState({
      campaigns: state.campaigns.map((c) => {
        if (c.id === campaignId) return { ...c, listId }
        // The list was already linked to another campaign — clear that link.
        if (conflictCampaignId && c.id === conflictCampaignId)
          return { ...c, listId: undefined }
        return c
      }),
      lists: state.lists.map((l) => {
        if (l.id === listId)
          return {
            ...l,
            campaignId,
            sendMode: l.sendMode ?? "continuous",
          }
        // This campaign already had a different list — detach it.
        if (previousListId && l.id === previousListId)
          return { ...l, campaignId: undefined }
        return l
      }),
    })
  },
  detachList(campaignId: string): void {
    const campaign = state.campaigns.find((c) => c.id === campaignId)
    const listId = campaign?.listId
    setState({
      campaigns: state.campaigns.map((c) =>
        c.id === campaignId ? { ...c, listId: undefined } : c
      ),
      lists: listId
        ? state.lists.map((l) =>
            l.id === listId ? { ...l, campaignId: undefined } : l
          )
        : state.lists,
    })
  },
  addProspects(campaignId: string, ids: string[]): void {
    setState({
      campaigns: state.campaigns.map((c) => {
        if (c.id !== campaignId) return c
        const existing = new Set(c.enrolledIds ?? [])
        const added = ids.filter((id) => !existing.has(id))
        if (added.length === 0) return c
        return {
          ...c,
          enrolledIds: [...(c.enrolledIds ?? []), ...added],
          enrolled: c.enrolled + added.length,
        }
      }),
    })
  },
  removeProspect(campaignId: string, prospectId: string): void {
    setState({
      campaigns: state.campaigns.map((c) => {
        if (c.id !== campaignId) return c
        const had = (c.enrolledIds ?? []).includes(prospectId)
        return {
          ...c,
          enrolledIds: (c.enrolledIds ?? []).filter((id) => id !== prospectId),
          enrolled: had ? Math.max(0, c.enrolled - 1) : c.enrolled,
        }
      }),
    })
  },
}

export const accountStore = {
  create(
    data: Omit<Account, "id" | "lastActivity"> &
      Partial<Pick<Account, "lastActivity">>
  ): Account {
    const account: Account = {
      ...data,
      id: uid("acc"),
      lastActivity: data.lastActivity ?? nowISO(),
    }
    setState({ accounts: [account, ...state.accounts] })
    return account
  },
  update(id: string, patch: Partial<Account>): void {
    setState({
      accounts: state.accounts.map((a) =>
        a.id === id ? { ...a, ...patch } : a
      ),
    })
  },
}

export const prospectStore = {
  create(
    data: Omit<Prospect, "id" | "addedAt" | "lastActivity"> &
      Partial<Pick<Prospect, "addedAt" | "lastActivity">>
  ): Prospect {
    const prospect: Prospect = {
      ...data,
      id: uid("p"),
      addedAt: data.addedAt ?? nowISO(),
      lastActivity: data.lastActivity ?? nowISO(),
      // Freshly sourced contacts start un-enriched unless caller says otherwise.
      enriched: data.enriched ?? false,
    }
    setState({ prospects: [prospect, ...state.prospects] })
    return prospect
  },
  update(id: string, patch: Partial<Prospect>): void {
    setState({
      prospects: state.prospects.map((p) =>
        p.id === id ? { ...p, ...patch } : p
      ),
    })
  },
  enrich(ids: string[], scope: EnrichScope = "profile"): void {
    const set = new Set(ids)
    setState({
      prospects: state.prospects.map((p) => {
        if (!set.has(p.id)) return p
        const next: Prospect = { ...p }
        if (scope === "email") {
          next.email =
            p.email ||
            `${p.firstName}.${p.lastName}@${p.companyDomain}`
              .toLowerCase()
              .replace(/\s+/g, "")
        }
        if (scope === "phone") {
          next.phone = p.phone || mockPhone(p.id)
        }
        // "profile" reveals the ~30 data points — the master enrichment flag.
        if (scope === "profile") {
          next.enriched = true
        }
        return next
      }),
    })
  },
  remove(id: string): void {
    setState({
      prospects: state.prospects.filter((p) => p.id !== id),
      lists: state.lists.map((l) => ({
        ...l,
        prospectIds: l.prospectIds.filter((x) => x !== id),
      })),
    })
  },
}

function patchConversation(id: string, fn: (c: Conversation) => Conversation): void {
  setState({
    conversations: state.conversations.map((conv) =>
      conv.id === id ? fn(conv) : conv
    ),
  })
}

export const conversationStore = {
  sendMessage(id: string, body: string, lang: ChatLang, aiGenerated = false): Message {
    const message: Message = {
      id: uid("msg"),
      channel: state.conversations.find((c) => c.id === id)?.channel ?? "email",
      direction: "outbound",
      body,
      timestamp: nowISO(),
      read: true,
      lang,
      aiGenerated,
    }
    patchConversation(id, (c) => ({
      ...c,
      messages: [...c.messages, message],
      lastMessageAt: message.timestamp,
      unread: 0,
      snoozedUntil: null,
      scheduledAt: null,
      aiDraft: undefined,
      archived: false,
    }))
    return message
  },
  setStatus(id: string, status: ConvStatus | undefined): void {
    patchConversation(id, (c) => ({ ...c, status }))
  },
  schedule(id: string, untilISO: string, body?: string): void {
    patchConversation(id, (c) => ({
      ...c,
      scheduledAt: untilISO,
      aiDraft: body ?? c.aiDraft,
    }))
  },
  unschedule(id: string): void {
    patchConversation(id, (c) => ({ ...c, scheduledAt: null }))
  },
  setDraft(id: string, body: string | undefined): void {
    patchConversation(id, (c) => ({ ...c, aiDraft: body }))
  },
  markRead(id: string): void {
    patchConversation(id, (c) => ({
      ...c,
      unread: 0,
      messages: c.messages.map((m) => ({ ...m, read: true })),
    }))
  },
  markUnread(id: string): void {
    patchConversation(id, (c) => ({ ...c, unread: Math.max(1, c.unread) }))
  },
  snooze(id: string, untilISO: string): void {
    patchConversation(id, (c) => ({ ...c, snoozedUntil: untilISO }))
  },
  unsnooze(id: string): void {
    patchConversation(id, (c) => ({ ...c, snoozedUntil: null }))
  },
  assign(id: string, assigneeId: string | undefined): void {
    patchConversation(id, (c) => ({ ...c, assigneeId }))
  },
  archive(id: string): void {
    patchConversation(id, (c) => ({ ...c, archived: true, unread: 0 }))
  },
  unarchive(id: string): void {
    patchConversation(id, (c) => ({ ...c, archived: false }))
  },
  setRecipientLang(id: string, lang: ChatLang): void {
    patchConversation(id, (c) => ({ ...c, recipientLang: lang }))
  },
  remove(id: string): void {
    setState({ conversations: state.conversations.filter((c) => c.id !== id) })
  },
}

export function resetStore(): void {
  state = seed()
  sync()
  persist()
  listeners.forEach((l) => l())
}
