// User-created Inbox folders. Originally a manual label a conversation is
// added to or removed from by hand (no saved-filter/auto-match rule), same
// shape as the approvals queue in mock-approvals.ts: a localStorage-backed
// module store read through useSyncExternalStore.
//
// Folders can now ALSO carry filter criteria (an OR of AND-groups over
// Outcome + curated Prospect fields, HubSpot/segment-style) that defines a
// BASE set of matching conversations. Manual add/remove still works on top
// of that base set as an override: `conversationIds` is the manual
// inclusion override (and, for a folder with no filter criteria, is the
// entire membership — unchanged from before), `excludedConversationIds` is
// the manual exclusion override. Effective membership is:
//   (matches filter OR manually included) MINUS manually excluded
// See `folderHasConversation`/`getFolderConversationIds` below — the pure,
// separately-callable functions that compute it.

import * as React from "react"
import type { Conversation, ConvStatus, Prospect } from "@/lib/types"

/* ------------------------------ filter model ----------------------------- */

// The fields a folder's filter criteria can match on: the conversation's
// own funnel Outcome, plus curated Prospect fields resolved via the
// conversation's prospectId.
export type FolderFilterField =
  | "outcome"
  | "company"
  | "industry"
  | "seniority"
  | "department"
  | "tags"
  | "score"

// Categorical fields (everything but score) use is/is_not against a set of
// accepted values (OR'd within the condition). Score uses a numeric
// comparison instead.
export type FolderFilterOperator = "is" | "is_not" | "gt" | "gte" | "lt" | "lte"

export interface FolderFilterCondition {
  id: string
  field: FolderFilterField
  operator: FolderFilterOperator
  // Categorical fields: one or more accepted values. Unused for score.
  values: string[]
  // Score only: the threshold operator compares against. Unused otherwise.
  numericValue?: number
}

// AND within a group, OR across groups — e.g.
// "(outcome=Interested AND score>80) OR (company=Acme)".
export interface FolderFilterGroup {
  id: string
  conditions: FolderFilterCondition[]
}

export interface CustomFolder {
  id: string
  name: string
  // Manual inclusion override. The entire membership when `filterGroups` is
  // empty/unset (today's fully-manual folder, unchanged behavior).
  conversationIds: string[]
  // Tasks are members of a folder the same way conversations are — added/
  // removed by hand via the same "Add to folder" menu, now on task rows too.
  // Tasks aren't part of the filter-criteria system (Task has no Outcome or
  // enrichment fields to match on), so they stay purely manual.
  taskIds: string[]
  createdAt: string
  // Optional filter criteria defining this folder's base matching set.
  // Empty/undefined = no filter criteria set.
  filterGroups?: FolderFilterGroup[]
  // Manual exclusion override — conversations removed from the
  // filter-computed base set by hand. Only meaningful once filterGroups is
  // set; harmless (and normally empty) otherwise.
  excludedConversationIds: string[]
}

function conditionMatches(
  cond: FolderFilterCondition,
  conv: Conversation,
  prospect: Prospect | undefined
): boolean {
  if (cond.field === "score") {
    if (!prospect) return false
    const threshold = cond.numericValue ?? 0
    switch (cond.operator) {
      case "gt":
        return prospect.score > threshold
      case "gte":
        return prospect.score >= threshold
      case "lt":
        return prospect.score < threshold
      case "lte":
        return prospect.score <= threshold
      default:
        return false
    }
  }

  if (cond.field === "outcome") {
    const matches = conv.status ? cond.values.includes(conv.status as ConvStatus) : false
    return cond.operator === "is_not" ? !matches : matches
  }

  if (!prospect) return false

  let matches: boolean
  switch (cond.field) {
    case "company":
      matches = cond.values.includes(prospect.company)
      break
    case "industry":
      matches = cond.values.includes(prospect.industry)
      break
    case "seniority":
      matches = cond.values.includes(prospect.seniority)
      break
    case "department":
      matches = cond.values.includes(prospect.department)
      break
    case "tags":
      matches = prospect.tags.some((t) => cond.values.includes(t))
      break
    default:
      matches = false
  }
  return cond.operator === "is_not" ? !matches : matches
}

// Pure — a group with no conditions never matches (avoids an empty AND
// vacuously matching everything). Groups are OR'd; conditions within a
// group are AND'd.
export function conversationMatchesFilterGroups(
  conv: Conversation,
  prospect: Prospect | undefined,
  groups: FolderFilterGroup[]
): boolean {
  if (groups.length === 0) return false
  return groups.some(
    (g) => g.conditions.length > 0 && g.conditions.every((c) => conditionMatches(c, conv, prospect))
  )
}

// Pure, unit-testable membership check for a single conversation — the
// single source of truth for "is this conversation in this folder", used
// both by the per-conversation filter in the list view and (via
// `getFolderConversationIds`) by anything that needs the whole set.
export function folderHasConversation(
  folder: CustomFolder,
  conv: Conversation,
  prospect: Prospect | undefined
): boolean {
  if (folder.excludedConversationIds.includes(conv.id)) return false
  if (folder.conversationIds.includes(conv.id)) return true
  if (folder.filterGroups && folder.filterGroups.length > 0) {
    return conversationMatchesFilterGroups(conv, prospect, folder.filterGroups)
  }
  return false
}

// The full effective conversation-id set for a folder — built from
// `folderHasConversation` so there's exactly one place membership logic
// lives.
export function getFolderConversationIds(
  folder: CustomFolder,
  conversations: Conversation[],
  getProspectById: (id: string) => Prospect | undefined
): Set<string> {
  const ids = new Set<string>()
  for (const conv of conversations) {
    if (folderHasConversation(folder, conv, getProspectById(conv.prospectId))) {
      ids.add(conv.id)
    }
  }
  return ids
}

/* --------------------------------- store --------------------------------- */

const KEY = "kombo_inbox_folders_v1"

function load(): CustomFolder[] {
  try {
    const raw = localStorage.getItem(KEY)
    // Folders saved before `taskIds`/`excludedConversationIds` existed won't
    // have them — default to [] rather than crashing on the missing array.
    if (raw)
      return (JSON.parse(raw) as CustomFolder[]).map((f) => ({
        ...f,
        taskIds: f.taskIds ?? [],
        excludedConversationIds: f.excludedConversationIds ?? [],
      }))
  } catch {
    /* ignore malformed storage */
  }
  return []
}

let state: CustomFolder[] = load()
const listeners = new Set<() => void>()

let counter = Date.now()
function uid(): string {
  counter += 1
  return `cf_${counter.toString(36)}`
}

function emit() {
  try {
    localStorage.setItem(KEY, JSON.stringify(state))
  } catch {
    /* ignore quota errors */
  }
  listeners.forEach((l) => l())
}

export function newFilterCondition(): FolderFilterCondition {
  return { id: uid(), field: "outcome", operator: "is", values: [] }
}

export function newFilterGroup(): FolderFilterGroup {
  return { id: uid(), conditions: [newFilterCondition()] }
}

export const customFolderStore = {
  create(name: string, filterGroups?: FolderFilterGroup[]): CustomFolder {
    const folder: CustomFolder = {
      id: uid(),
      name,
      conversationIds: [],
      taskIds: [],
      createdAt: new Date().toISOString(),
      filterGroups: filterGroups && filterGroups.length > 0 ? filterGroups : undefined,
      excludedConversationIds: [],
    }
    state = [...state, folder]
    emit()
    return folder
  },
  remove(id: string): void {
    state = state.filter((f) => f.id !== id)
    emit()
  },
  rename(id: string, name: string): void {
    state = state.map((f) => (f.id === id ? { ...f, name } : f))
    emit()
  },
  // Replaces a folder's filter criteria wholesale (the builder UI always
  // saves the full group list). Pass an empty array to clear filtering back
  // to fully-manual.
  setFilterGroups(id: string, filterGroups: FolderFilterGroup[]): void {
    state = state.map((f) =>
      f.id === id
        ? { ...f, filterGroups: filterGroups.length > 0 ? filterGroups : undefined }
        : f
    )
    emit()
  },
  addConversation(id: string, conversationId: string): void {
    state = state.map((f) =>
      f.id === id
        ? {
            ...f,
            conversationIds: f.conversationIds.includes(conversationId)
              ? f.conversationIds
              : [...f.conversationIds, conversationId],
            excludedConversationIds: f.excludedConversationIds.filter(
              (c) => c !== conversationId
            ),
          }
        : f
    )
    emit()
  },
  removeConversation(id: string, conversationId: string): void {
    state = state.map((f) =>
      f.id === id
        ? {
            ...f,
            conversationIds: f.conversationIds.filter((c) => c !== conversationId),
            excludedConversationIds: f.excludedConversationIds.includes(conversationId)
              ? f.excludedConversationIds
              : [...f.excludedConversationIds, conversationId],
          }
        : f
    )
    emit()
  },
  addTask(id: string, taskId: string): void {
    state = state.map((f) =>
      f.id === id && !f.taskIds.includes(taskId)
        ? { ...f, taskIds: [...f.taskIds, taskId] }
        : f
    )
    emit()
  },
  removeTask(id: string, taskId: string): void {
    state = state.map((f) =>
      f.id === id ? { ...f, taskIds: f.taskIds.filter((t) => t !== taskId) } : f
    )
    emit()
  },
}

export function useCustomFolders(): CustomFolder[] {
  return React.useSyncExternalStore(
    (l) => {
      listeners.add(l)
      return () => listeners.delete(l)
    },
    () => state,
    () => state
  )
}
