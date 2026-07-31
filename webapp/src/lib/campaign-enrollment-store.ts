// Live, editable campaign enrollment state — pause/resume, read through
// useSyncExternalStore. Mirrors inbox-folders.ts's pattern: a localStorage-
// backed module store seeded once from mock-depth.ts's static
// `campaignEnrollments`, so both the Inbox prospect card and CampaignDetail's
// Prospects tab read/write the exact same live data and stay in sync.
//
// Scope is deliberately narrow — the only mutations are pause and resume
// (toggling `CampaignEnrollment.status` between "active" and "paused").
// Nothing else here changes an enrollment's step, touch date, or outcome.

import * as React from "react"

import { campaignEnrollments as seedEnrollments } from "./mock-depth"
import type { CampaignEnrollment } from "./types"

const KEY = "kombo_campaign_enrollments_v1"

function load(): Record<string, CampaignEnrollment[]> {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return JSON.parse(raw) as Record<string, CampaignEnrollment[]>
  } catch {
    /* ignore malformed storage */
  }
  // Seed once from the static mock data — a fresh deep copy so mutating the
  // live store never touches the original seed arrays/objects.
  return JSON.parse(JSON.stringify(seedEnrollments)) as Record<string, CampaignEnrollment[]>
}

let state: Record<string, CampaignEnrollment[]> = load()
const listeners = new Set<() => void>()

// Stable empty array so `getForCampaign`/the reactive hook never hand
// useSyncExternalStore a freshly-allocated snapshot for a campaign with no
// enrollments — a fresh `[]` on every call would look like a change on every
// render and defeat useSyncExternalStore's Object.is check.
const EMPTY: CampaignEnrollment[] = []

function emit() {
  try {
    localStorage.setItem(KEY, JSON.stringify(state))
  } catch {
    /* ignore quota errors */
  }
  listeners.forEach((l) => l())
}

// `getForProspect` builds a fresh array by scanning every campaign — memoize
// it per prospectId against the current `state` reference (only reassigned
// on an actual pause/resume) so the reactive hook below can hand
// useSyncExternalStore a stable snapshot between unrelated re-renders.
let prospectCacheState: Record<string, CampaignEnrollment[]> | null = null
const prospectCache = new Map<string, { campaignId: string; enrollment: CampaignEnrollment }[]>()

function getForProspectMemoized(
  prospectId: string
): { campaignId: string; enrollment: CampaignEnrollment }[] {
  if (prospectCacheState !== state) {
    prospectCacheState = state
    prospectCache.clear()
  }
  let cached = prospectCache.get(prospectId)
  if (!cached) {
    cached = computeForProspect(prospectId)
    prospectCache.set(prospectId, cached)
  }
  return cached
}

function computeForProspect(
  prospectId: string
): { campaignId: string; enrollment: CampaignEnrollment }[] {
  const out: { campaignId: string; enrollment: CampaignEnrollment }[] = []
  for (const campaignId of Object.keys(state)) {
    const enrollment = state[campaignId].find((e) => e.prospectId === prospectId)
    if (enrollment) out.push({ campaignId, enrollment })
  }
  return out
}

export const campaignEnrollmentStore = {
  /** All enrollments for one campaign — same shape as the old static map. */
  getForCampaign(campaignId: string): CampaignEnrollment[] {
    return state[campaignId] ?? EMPTY
  },
  /** Every campaign a given prospect has an enrollment record in, any status. */
  getForProspect(prospectId: string): { campaignId: string; enrollment: CampaignEnrollment }[] {
    return getForProspectMemoized(prospectId)
  },
  // Pausing a manually-enrolled prospect (CampaignDetail's Prospects tab
  // shows these — real people on the campaign, they just never got a mock
  // `CampaignEnrollment` seeded) creates a record for them on the spot,
  // rather than being a no-op just because the seed data didn't anticipate
  // it — currentStep 1 matches how the rest of the app already treats a
  // freshly, manually-enrolled prospect.
  pause(campaignId: string, prospectId: string): void {
    const existing = state[campaignId] ?? []
    const found = existing.some((e) => e.prospectId === prospectId)
    state = {
      ...state,
      [campaignId]: found
        ? existing.map((e) => (e.prospectId === prospectId ? { ...e, status: "paused" } : e))
        : [
            ...existing,
            {
              prospectId,
              currentStep: 1,
              status: "paused",
              lastTouch: new Date().toISOString(),
            },
          ],
    }
    emit()
  },
  resume(campaignId: string, prospectId: string): void {
    state = {
      ...state,
      [campaignId]: (state[campaignId] ?? []).map((e) =>
        e.prospectId === prospectId && e.status === "paused"
          ? { ...e, status: "active" }
          : e
      ),
    }
    emit()
  },
}

/**
 * Reactive read of the entire enrollment map, all campaigns at once — for
 * call sites (Inbox's "which campaigns is this prospect in" pill, its next-
 * step timeline preview) that scan across every campaign rather than one.
 * `state` itself is only ever reassigned on an actual pause/resume, so it's
 * already a stable snapshot reference between unrelated re-renders.
 */
export function useAllCampaignEnrollments(): Record<string, CampaignEnrollment[]> {
  return React.useSyncExternalStore(
    (l) => {
      listeners.add(l)
      return () => listeners.delete(l)
    },
    () => state,
    () => state
  )
}

/** Reactive read of one campaign's enrollments (CampaignDetail's Prospects tab). */
export function useCampaignEnrollments(campaignId: string): CampaignEnrollment[] {
  return React.useSyncExternalStore(
    (l) => {
      listeners.add(l)
      return () => listeners.delete(l)
    },
    () => state[campaignId] ?? EMPTY,
    () => state[campaignId] ?? EMPTY
  )
}

/** Reactive read of every campaign a prospect is enrolled in (Inbox prospect card). */
export function useProspectEnrollments(
  prospectId: string
): { campaignId: string; enrollment: CampaignEnrollment }[] {
  return React.useSyncExternalStore(
    (l) => {
      listeners.add(l)
      return () => listeners.delete(l)
    },
    () => getForProspectMemoized(prospectId),
    () => getForProspectMemoized(prospectId)
  )
}
