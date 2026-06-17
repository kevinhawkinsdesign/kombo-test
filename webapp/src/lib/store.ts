import * as React from "react"

import {
  prospects as seedProspects,
  prospectLists as seedLists,
  campaigns as seedCampaigns,
  setLiveProspects,
  setLiveLists,
  setLiveCampaigns,
} from "./mock-data"
import {
  deals as seedDeals,
  tasks as seedTasks,
  emailTemplates as seedTemplates,
  setLiveDeals,
  setLiveTasks,
  setLiveTemplates,
} from "./mock-extra"
import type {
  Prospect,
  ProspectList,
  Campaign,
  Deal,
  Task,
  EmailTemplate,
} from "./types"

interface StoreState {
  prospects: Prospect[]
  lists: ProspectList[]
  campaigns: Campaign[]
  deals: Deal[]
  tasks: Task[]
  templates: EmailTemplate[]
}

const KEY = "kombo_store_v1"

function seed(): StoreState {
  return {
    prospects: seedProspects,
    lists: seedLists,
    campaigns: seedCampaigns,
    deals: seedDeals,
    tasks: seedTasks,
    templates: seedTemplates,
  }
}

function load(): StoreState {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<StoreState>
      const base = seed()
      return {
        prospects: parsed.prospects ?? base.prospects,
        lists: parsed.lists ?? base.lists,
        campaigns: parsed.campaigns ?? base.campaigns,
        deals: parsed.deals ?? base.deals,
        tasks: parsed.tasks ?? base.tasks,
        templates: parsed.templates ?? base.templates,
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

export function resetStore(): void {
  state = seed()
  sync()
  persist()
  listeners.forEach((l) => l())
}
