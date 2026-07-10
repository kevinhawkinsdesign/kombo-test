import * as React from "react"

import {
  prospects as seedProspects,
  prospectLists as seedLists,
  campaigns as seedCampaigns,
  conversations as seedConversations,
  currentUser,
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
  StepTrackKind,
  ConditionKind,
  Deal,
  Task,
  EmailTemplate,
  Account,
  Conversation,
  Message,
  ChatLang,
  ConvStatus,
} from "./types"
import type { Locale } from "./locale"
import type { EnrichScope } from "./enrichment"
import {
  blacklistedCompanies as seedBlacklist,
  type BlacklistedCompany,
} from "./mock-settings"

// Mock ElevenLabs voice roster for ai_call steps — no real ElevenLabs
// account is wired up in this prototype.
export const AI_VOICES = ["Rachel", "Adam", "Bella", "Antoni"]

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
  // Companies KomboAI must never surface in search results or campaigns.
  blacklist: BlacklistedCompany[]
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
    blacklist: seedBlacklist,
    convSeedVersion: CONV_SEED_VERSION,
  }
}

// One-time migration for campaigns persisted before `CampaignStep.branch`
// was generalized into `CampaignStep.fork` — converts a legacy
// `{ replySteps, noReplySteps }` shape into an equivalent `fork` so nothing
// a user already built gets silently dropped.
type LegacyStep = CampaignStep & {
  branch?: { replySteps: LegacyStep[]; noReplySteps: LegacyStep[] }
}
function migrateStep(s: LegacyStep): CampaignStep {
  if (s.fork) {
    return {
      ...s,
      fork: {
        ...s.fork,
        tracks: s.fork.tracks.map((t) => ({ ...t, steps: t.steps.map(migrateStep) })),
      },
    }
  }
  if (s.branch) {
    const { branch, ...rest } = s
    return {
      ...rest,
      fork: {
        condition: "reply",
        tracks: [
          { id: uid("trk"), kind: "reply", steps: branch.replySteps.map(migrateStep) },
          { id: uid("trk"), kind: "no_reply", steps: branch.noReplySteps.map(migrateStep) },
        ],
      },
    }
  }
  return s
}
function migrateCampaigns(campaigns: Campaign[]): Campaign[] {
  return campaigns.map((c) => ({ ...c, steps: c.steps.map(migrateStep) }))
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
        campaigns: migrateCampaigns(parsed.campaigns ?? base.campaigns),
        deals: parsed.deals ?? base.deals,
        tasks: parsed.tasks ?? base.tasks,
        templates: parsed.templates ?? base.templates,
        accounts: parsed.accounts ?? base.accounts,
        conversations: convOutdated
          ? base.conversations
          : parsed.conversations ?? base.conversations,
        blacklist: parsed.blacklist ?? base.blacklist,
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
export function uid(prefix: string): string {
  counter += 1
  return `${prefix}_${counter.toString(36)}`
}

// The met/not-met track-kind pair a condition's fork is built from.
export const CONDITION_TRACK_KINDS: Record<ConditionKind, [StepTrackKind, StepTrackKind]> = {
  reply: ["reply", "no_reply"],
  open: ["opened", "not_opened"],
  click: ["clicked", "not_clicked"],
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
export function useBlacklist(): BlacklistedCompany[] {
  return useSlice((s) => s.blacklist)
}

// Build a fast-lookup Set of lowercased company names + domains. Used to
// exclude blacklisted companies from search results and campaign enrollment.
function keysFromBlacklist(list: BlacklistedCompany[]): Set<string> {
  const set = new Set<string>()
  for (const b of list) {
    if (b.name) set.add(b.name.trim().toLowerCase())
    if (b.domain) set.add(b.domain.trim().toLowerCase())
  }
  return set
}
export function blacklistedKeySet(): Set<string> {
  return keysFromBlacklist(state.blacklist)
}
// Reactive variant for components that must re-filter as the blacklist changes.
export function useBlacklistedKeys(): Set<string> {
  const list = useBlacklist()
  return React.useMemo(() => keysFromBlacklist(list), [list])
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
    setState({
      lists: [list, ...state.lists],
      // Same stamping as addProspects for lists born with members.
      ...(list.assigneeId && list.prospectIds.length > 0
        ? {
            prospects: state.prospects.map((p) =>
              list.prospectIds.includes(p.id) && !p.ownerId
                ? { ...p, ownerId: list.assigneeId }
                : p
            ),
          }
        : {}),
    })
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
    // A list's default owner is stamped onto incoming prospects that don't
    // already have one — it never overwrites an existing owner.
    const assigneeId = state.lists.find((l) => l.id === id)?.assigneeId
    setState({
      lists: state.lists.map((l) =>
        l.id === id
          ? { ...l, prospectIds: Array.from(new Set([...l.prospectIds, ...ids])) }
          : l
      ),
      ...(assigneeId
        ? {
            prospects: state.prospects.map((p) =>
              ids.includes(p.id) && !p.ownerId
                ? { ...p, ownerId: assigneeId }
                : p
            ),
          }
        : {}),
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

// Applies `fn` to whichever array in the one-level-deep step tree actually
// contains `stepId` — the top-level list, or one of a fork's tracks — and
// returns a new tree with that array replaced. Steps inside a track never
// carry their own `fork`, so this never needs to recurse deeper than one
// level.
export function updateStepTree(
  steps: CampaignStep[],
  stepId: string,
  fn: (list: CampaignStep[], index: number) => CampaignStep[]
): CampaignStep[] {
  const index = steps.findIndex((s) => s.id === stepId)
  if (index !== -1) return fn(steps, index)
  return steps.map((s) => {
    if (s.parallelSteps) {
      const pIndex = s.parallelSteps.findIndex((p) => p.id === stepId)
      if (pIndex !== -1) {
        return { ...s, parallelSteps: fn(s.parallelSteps, pIndex) }
      }
    }
    return s.fork
      ? {
          ...s,
          fork: {
            ...s.fork,
            tracks: s.fork.tracks.map((t) => ({
              ...t,
              steps: updateStepTree(t.steps, stepId, fn),
            })),
          },
        }
      : s
  })
}

// Flattens the tree in render order (a step, its parallel siblings, then
// each of its fork tracks' steps in order, then the next top-level step) —
// used for cosmetic per-step stats that degrade by position.
export function flattenCampaignSteps(steps: CampaignStep[]): CampaignStep[] {
  return steps.flatMap((s) => [
    s,
    ...(s.parallelSteps ?? []),
    ...(s.fork ? s.fork.tracks.flatMap((t) => t.steps) : []),
  ])
}

export function findCampaignStep(
  steps: CampaignStep[],
  stepId: string
): CampaignStep | undefined {
  for (const s of steps) {
    if (s.id === stepId) return s
    if (s.parallelSteps) {
      const found = s.parallelSteps.find((p) => p.id === stepId)
      if (found) return found
    }
    if (s.fork) {
      for (const t of s.fork.tracks) {
        const found = findCampaignStep(t.steps, stepId)
        if (found) return found
      }
    }
  }
  return undefined
}

// Finds the array a step actually lives in (top-level, a step's parallel
// siblings, or one of a fork's tracks) plus its index there — the
// collection that "move up/down" and "is first/last" checks need to
// reason about.
export function locateCampaignStep(
  steps: CampaignStep[],
  stepId: string
): { list: CampaignStep[]; index: number } {
  const topIndex = steps.findIndex((s) => s.id === stepId)
  if (topIndex !== -1) return { list: steps, index: topIndex }
  for (const s of steps) {
    if (s.parallelSteps) {
      const pIndex = s.parallelSteps.findIndex((p) => p.id === stepId)
      if (pIndex !== -1) return { list: s.parallelSteps, index: pIndex }
    }
    if (!s.fork) continue
    for (const t of s.fork.tracks) {
      const found = locateCampaignStep(t.steps, stepId)
      if (found.index !== -1) return found
    }
  }
  return { list: steps, index: -1 }
}

export const campaignStore = {
  // The caller passes the current locale so a new campaign defaults its
  // send language to what the user is working in.
  create(
    data: Pick<Campaign, "name"> & Partial<Campaign> & { locale?: Locale }
  ): Campaign {
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
      senderAccount: data.senderAccount ?? currentUser.name,
      senderAccountId: data.senderAccountId ?? currentUser.id,
      language: data.language ?? data.locale ?? "en",
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
          // The "manual" channel is inherently a hand-done task — no
          // automated send exists for it, so it's always a manual task.
          ...(channel === "manual" ? { isManualTask: true } : {}),
          ...(channel === "ai_call" ? { aiVoice: AI_VOICES[0] } : {}),
        }
        return { ...c, steps: [...c.steps, step] }
      }),
    })
  },
  // Same as addStep, but splices the new step at a specific position in the
  // top-level sequence instead of always appending — the diagram view's
  // between-step "+" controls insert here rather than only at the end.
  insertStep(campaignId: string, at: number, channel: StepChannel): void {
    setState({
      campaigns: state.campaigns.map((c) => {
        if (c.id !== campaignId) return c
        const step: CampaignStep = {
          id: uid("s"),
          channel,
          delayDays: at === 0 ? 0 : 3,
          subject: "",
          body: "",
          ...(channel === "manual" ? { isManualTask: true } : {}),
          ...(channel === "ai_call" ? { aiVoice: AI_VOICES[0] } : {}),
        }
        const steps = [...c.steps]
        steps.splice(at, 0, step)
        return { ...c, steps }
      }),
    })
  },
  // Same as addStep, but seeded from a saved Template's content instead of
  // starting blank. The caller resolves the template's Channel to a
  // StepChannel first (channels a campaign step can't represent, like
  // "messenger", already fall back to "email").
  addStepFromTemplate(
    campaignId: string,
    data: { channel: StepChannel; subject?: string; body: string }
  ): CampaignStep | undefined {
    let created: CampaignStep | undefined
    setState({
      campaigns: state.campaigns.map((c) => {
        if (c.id !== campaignId) return c
        const step: CampaignStep = {
          id: uid("s"),
          channel: data.channel,
          delayDays: c.steps.length === 0 ? 0 : 3,
          subject: data.subject ?? "",
          body: data.body,
        }
        created = step
        return { ...c, steps: [...c.steps, step] }
      }),
    })
    return created
  },
  // Works whether stepId lives in the top-level sequence or inside a
  // branch's reply/no-reply track.
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
              steps: updateStepTree(c.steps, stepId, (list, index) =>
                list.map((s, i) => (i === index ? { ...s, ...patch } : s))
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
          ? {
              ...c,
              steps: updateStepTree(c.steps, stepId, (list, index) =>
                list.filter((_, i) => i !== index)
              ),
            }
          : c
      ),
    })
  },
  // Moves within whichever list (top-level, or a branch track) the step
  // belongs to — branches don't reorder relative to each other.
  moveStep(campaignId: string, stepId: string, dir: -1 | 1): void {
    setState({
      campaigns: state.campaigns.map((c) =>
        c.id === campaignId
          ? {
              ...c,
              steps: updateStepTree(c.steps, stepId, (list, index) => {
                const target = index + dir
                if (target < 0 || target >= list.length) return list
                const next = [...list]
                const [moved] = next.splice(index, 1)
                next.splice(target, 0, moved)
                return next
              }),
            }
          : c
      ),
    })
  },
  // Adds a fresh, blank condition fork to a step — two tracks (the
  // condition's met/not-met pair) that both reconnect into the next step
  // in the parent array. A step already inside a track can't itself fork
  // (enforced by the UI only offering this on top-level steps).
  addCondition(campaignId: string, stepId: string, condition: ConditionKind): void {
    const [metKind, notMetKind] = CONDITION_TRACK_KINDS[condition]
    setState({
      campaigns: state.campaigns.map((c) =>
        c.id === campaignId
          ? {
              ...c,
              steps: updateStepTree(c.steps, stepId, (list, index) =>
                list.map((s, i) =>
                  i === index
                    ? {
                        ...s,
                        fork: {
                          condition,
                          tracks: [
                            { id: uid("trk"), kind: metKind, steps: [] },
                            { id: uid("trk"), kind: notMetKind, steps: [] },
                          ],
                        },
                      }
                    : s
                )
              ),
            }
          : c
      ),
    })
  },
  // Clears a step's condition fork.
  removeFork(campaignId: string, stepId: string): void {
    setState({
      campaigns: state.campaigns.map((c) =>
        c.id === campaignId
          ? {
              ...c,
              steps: updateStepTree(c.steps, stepId, (list, index) =>
                list.map((s, i) =>
                  i === index ? { ...s, fork: undefined } : s
                )
              ),
            }
          : c
      ),
    })
  },
  // Adds a blank step to one track of a condition fork.
  addForkStep(
    campaignId: string,
    stepId: string,
    trackId: string,
    channel: StepChannel
  ): void {
    setState({
      campaigns: state.campaigns.map((c) =>
        c.id === campaignId
          ? {
              ...c,
              steps: updateStepTree(c.steps, stepId, (list, index) =>
                list.map((s, i) => {
                  if (i !== index || !s.fork) return s
                  const step: CampaignStep = {
                    id: uid("s"),
                    channel,
                    delayDays: 3,
                    subject: "",
                    body: "",
                    ...(channel === "manual" ? { isManualTask: true } : {}),
                  }
                  return {
                    ...s,
                    fork: {
                      ...s.fork,
                      tracks: s.fork.tracks.map((t) =>
                        t.id === trackId
                          ? { ...t, steps: [...t.steps, step] }
                          : t
                      ),
                    },
                  }
                })
              ),
            }
          : c
      ),
    })
  },
  // Adds one step that fires at the same time as `stepId` — concurrent,
  // not a fork. Each call appends another single, independent step;
  // parallel steps never chain and never carry their own fork or
  // parallelSteps.
  addParallelStep(campaignId: string, stepId: string, channel: StepChannel): void {
    setState({
      campaigns: state.campaigns.map((c) =>
        c.id === campaignId
          ? {
              ...c,
              steps: updateStepTree(c.steps, stepId, (list, index) =>
                list.map((s, i) => {
                  if (i !== index) return s
                  const step: CampaignStep = {
                    id: uid("s"),
                    channel,
                    delayDays: 0,
                    subject: "",
                    body: "",
                    ...(channel === "manual" ? { isManualTask: true } : {}),
                  }
                  return { ...s, parallelSteps: [...(s.parallelSteps ?? []), step] }
                })
              ),
            }
          : c
      ),
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
  // Activate the campaign now: clears any queued start, applies an optional
  // account/language override, and marks the currently-enrolled recipients as
  // messaged (union of manual enrolledIds and the attached list's members) so
  // a later re-activation skips anyone who already received a message.
  activate(
    id: string,
    opts?: { senderAccountId?: string; senderAccount?: string; language?: Locale }
  ): void {
    const campaign = state.campaigns.find((c) => c.id === id)
    if (!campaign) return
    const listMembers = campaign.listId
      ? state.lists.find((l) => l.id === campaign.listId)?.prospectIds ?? []
      : []
    const recipients = Array.from(
      new Set([...(campaign.enrolledIds ?? []), ...listMembers])
    )
    const messagedIds = Array.from(
      new Set([...(campaign.messagedIds ?? []), ...recipients])
    )
    setState({
      campaigns: state.campaigns.map((c) =>
        c.id === id
          ? {
              ...c,
              status: "active",
              scheduledAt: null,
              senderAccountId: opts?.senderAccountId ?? c.senderAccountId,
              senderAccount: opts?.senderAccount ?? c.senderAccount,
              language: opts?.language ?? c.language,
              messagedIds,
            }
          : c
      ),
    })
  },
  // Make a campaign inactive. Keeps messagedIds so re-activation skips them.
  deactivate(id: string): void {
    setState({
      campaigns: state.campaigns.map((c) =>
        c.id === id ? { ...c, status: "paused" } : c
      ),
    })
  },
  // End a campaign: unschedule all incomplete sequences (messages not yet sent)
  // and mark it finished. Cannot be resumed.
  end(id: string): void {
    setState({
      campaigns: state.campaigns.map((c) =>
        c.id === id
          ? { ...c, status: "completed", endedAt: nowISO(), scheduledAt: null }
          : c
      ),
    })
  },
  // Update the sending account / language. Only allowed while the campaign is
  // still editable (not yet active and not ended).
  setSender(
    id: string,
    patch: { senderAccountId: string; senderAccount: string; language: Locale }
  ): void {
    setState({
      campaigns: state.campaigns.map((c) => {
        if (c.id !== id) return c
        if (c.status === "active" || c.status === "completed") return c
        return { ...c, ...patch }
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
      scheduledAt: null,
      aiDraft: undefined,
      archived: false,
    }))
    return message
  },
  sendVoiceMessage(id: string, durationSec: number, lang: ChatLang): Message {
    const message: Message = {
      id: uid("msg"),
      channel: state.conversations.find((c) => c.id === id)?.channel ?? "whatsapp",
      direction: "outbound",
      body: "🎤 Voice message",
      timestamp: nowISO(),
      read: true,
      lang,
      kind: "voice",
      voiceDurationSec: durationSec,
    }
    patchConversation(id, (c) => ({
      ...c,
      messages: [...c.messages, message],
      lastMessageAt: message.timestamp,
      unread: 0,
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
  setAutoReply(id: string, autoReply: boolean): void {
    patchConversation(id, (c) => ({ ...c, autoReply }))
  },
  remove(id: string): void {
    setState({ conversations: state.conversations.filter((c) => c.id !== id) })
  },
}

export const blacklistStore = {
  add(company: Omit<BlacklistedCompany, "id"> & Partial<Pick<BlacklistedCompany, "id">>): BlacklistedCompany {
    const entry: BlacklistedCompany = {
      id: company.id ?? uid("bl"),
      name: company.name,
      domain: company.domain,
      reason: company.reason,
    }
    // De-dupe on name so associating a list twice doesn't pile up entries.
    const existing = new Set(state.blacklist.map((b) => b.name.toLowerCase()))
    if (existing.has(entry.name.toLowerCase())) return entry
    setState({ blacklist: [...state.blacklist, entry] })
    return entry
  },
  addMany(companies: Array<Omit<BlacklistedCompany, "id">>): void {
    const existing = new Set(state.blacklist.map((b) => b.name.toLowerCase()))
    const additions: BlacklistedCompany[] = []
    for (const co of companies) {
      const key = co.name.toLowerCase()
      if (!co.name.trim() || existing.has(key)) continue
      existing.add(key)
      additions.push({ id: uid("bl"), name: co.name, domain: co.domain, reason: co.reason })
    }
    if (additions.length === 0) return
    setState({ blacklist: [...state.blacklist, ...additions] })
  },
  remove(id: string): void {
    setState({ blacklist: state.blacklist.filter((b) => b.id !== id) })
  },
}

export function resetStore(): void {
  state = seed()
  sync()
  persist()
  listeners.forEach((l) => l())
}
