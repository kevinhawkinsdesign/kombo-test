// Domain types for the Kombo 2.0 web app prototype.
// These mirror the concepts used in the Kombo chrome extension
// (prospects, lists, inbox, campaigns, coaching, CRM) but are UI-only.

import type { Locale } from "./locale"

export type ProspectStatus =
  | "new"
  | "contacted"
  | "replied"
  | "meeting"
  | "customer"
  | "not_interested"

// The channels Kombo actually automates. Anything else (SMS, Instagram,
// Messenger…) is a manual task, not a channel.
export type Channel =
  | "email"
  | "linkedin"
  | "whatsapp"

// How a prospect entered the workspace (search, a list, a CSV import, or the
// browser extension while prospecting on LinkedIn).
export type ProspectSource = "search" | "list" | "import" | "extension"

export interface Prospect {
  id: string
  firstName: string
  lastName: string
  title: string
  company: string
  companyDomain: string
  location: string
  email: string
  phone?: string
  linkedinUrl: string
  avatarColor: string
  score: number // 0-100 AI lead score
  status: ProspectStatus
  tags: string[]
  lastActivity: string // ISO date
  addedAt: string // ISO date
  // Enrichment data points (Kombo enriches prospects with ~30 data points)
  seniority: string
  department: string
  headcount: string
  industry: string
  revenue: string
  about: string
  signals: string[] // buying / intent signals
  // Enrichment status — false when a contact was sourced but not yet enriched
  // (verified email/direct dial + full data points). Undefined counts as enriched
  // so existing seed contacts stay clean.
  enriched?: boolean
  // How this prospect entered the workspace. Undefined reads as "search".
  source?: ProspectSource
  // The rep who owns this lead. Undefined reads as unassigned.
  ownerId?: string
}

export interface SavedSearchCriteria {
  titles: string[]
  seniority: string[]
  industries: string[]
  headcount: string[]
  locations: string[]
  keywords: string
  signals: string[]
}

export type EnrichmentMode = "once" | "continuous"
export type SendMode = "once" | "continuous"
// How a dynamic list routes its new matches: straight into a campaign, or
// held for the owner to review manually (each new match creates a Task).
export type ReviewMode = "auto_campaign" | "manual_review"

export interface ProspectList {
  id: string
  name: string
  description: string
  prospectIds: string[]
  createdAt: string
  color: string
  source: "linkedin" | "salesnav" | "csv" | "search"
  // Lists hold either people (prospectIds) or companies (accountIds).
  // Undefined kind reads as a people list so existing lists stay valid.
  kind?: "people" | "company"
  accountIds?: string[]
  // Dynamic "playlist" automation. Static lists omit these; a dynamic list is
  // fed by a saved search that keeps adding matching prospects over time.
  dynamic?: boolean
  criteria?: SavedSearchCriteria
  enrichment?: EnrichmentMode
  newPerWeek?: number // estimated inflow from the saved search
  campaignId?: string // campaign new prospects auto-enroll into
  sendMode?: SendMode
  // Undefined reads as "auto_campaign" so existing dynamic lists stay valid.
  reviewMode?: ReviewMode
  lastSyncedAt?: string
  // Default owner stamped onto prospects that enter via this list (unless a
  // prospect already has an owner — this never overwrites one).
  assigneeId?: string
}

// --- Sequence / diagram builder ---
export type SequenceChannelType =
  | "email"
  | "linkedin"
  | "whatsapp"
  | "call"
  | "ai_call"
  | "wait"

export type StepTriggerType =
  | "delay" // after N days
  | "on_open" // when a prior email is opened
  | "on_no_reply" // when no reply by the delay
  | "on_reply" // when the prospect replies
  | "on_signal" // when a data point / intent signal fires
  | "on_click" // when a link is clicked
  | "manual" // wait for the rep to action

export interface StepTrigger {
  type: StepTriggerType
  days?: number
  label?: string // the data point / signal description, when relevant
}

export interface BuilderStep {
  id: string
  channel: SequenceChannelType
  title: string
  subtitle?: string
  trigger: StepTrigger
  parallel?: boolean // runs alongside the previous step (fan-out)
  branch?: "reply" | "no_reply" // conditional branch label
}

// --- Coaching scorecard (critical, actionable) ---
export type SectionGrade = "strong" | "okay" | "weak"

export interface CoachSection {
  label: string
  grade: SectionGrade
  score: number // 0-100
  quote: string
  critique: string
}

export interface StartStopContinue {
  start: string[]
  stop: string[]
  continue: string[]
}

export interface CoachScorecard {
  overall: number // 0-100
  headline: string
  sections: CoachSection[]
  startStopContinue: StartStopContinue
  risks: string[]
}

export type ChatLang = "en" | "es"

// Outcome the conversation has been set to — a fixed list, not a
// user-customizable tag (see the "Outcome" picker in the Inbox).
export type ConvStatus =
  | "interested"
  | "not_interested"
  | "qualified"
  | "disqualified"
  | "meeting_booked"
  | "need_review"
  | "won"
  | "lost"

export interface Message {
  id: string
  channel: Channel
  direction: "inbound" | "outbound"
  body: string
  timestamp: string
  read: boolean
  lang?: ChatLang // language the message was written in
  aiGenerated?: boolean // outbound message was drafted by Kai
  // A recorded voice note (LinkedIn/WhatsApp only) instead of a text body —
  // `body` still carries a plain-text fallback (for search/translation), and
  // `voiceDurationSec` drives the mock waveform/playback bubble.
  kind?: "text" | "voice"
  voiceDurationSec?: number
}

// A non-message activity that happened in the thread (connection sent, post
// liked, auto-tag applied, email opened, a campaign step firing, a task
// changing state). Rendered as a quiet system row.
export type ConvEventKind =
  | "connection"
  | "like"
  | "view"
  | "open"
  | "click"
  | "tag"
  | "step"
  | "task"
  | "scheduled_reply" // a queued reply not yet sent — synthesized, not stored
  | "next_step" // the prospect's next not-yet-fired sequence step — synthesized, not stored

export type TaskEventState = "todo" | "reminder" | "done"

export interface ConvEvent {
  id: string
  kind: ConvEventKind
  label: string
  detail?: string
  timestamp: string
  status?: ConvStatus // for kind === "tag"
  stepChannel?: SequenceChannelType // for kind === "step"
  taskState?: TaskEventState // for kind === "task"
}

export interface Conversation {
  id: string
  prospectId: string
  channel: Channel
  subject: string
  messages: Message[]
  unread: number
  lastMessageAt: string
  assigneeId?: string // team member the thread is assigned to
  archived?: boolean
  recipientLang?: ChatLang // the prospect's preferred language
  status?: ConvStatus // auto-tagged intent
  aiDraft?: string // Kai's suggested reply, ready to send
  scheduledAt?: string | null // ISO date; a reply queued to send later
  events?: ConvEvent[] // activity timeline interleaved with messages
  // When true, an inbound reply on this thread auto-populates aiDraft via the
  // same draftReply() generator the composer's "Kai draft" uses — the rep
  // still reviews and sends it manually, it's never auto-sent.
  autoReply?: boolean
}

export type CampaignStatus = "active" | "paused" | "draft" | "completed"

export type StepChannel =
  | "email"
  | "whatsapp"
  | "call" // a normal phone call the rep places
  | "ai_call" // an agentic AI voice call placed via ElevenLabs
  | "linkedin_message"
  | "linkedin_dm"
  | "linkedin_inmail"
  | "manual" // channel-less offline activity (a visit, a handwritten note, etc.)

// The specific LinkedIn action a linkedin_* step performs — separate from
// StepChannel so it doesn't collide with the existing message/DM/InMail
// channel split. "connect"/"like_post"/"view_profile" carry no message
// content (subject/body stay unused); "voice_message" is a recorded note
// instead of typed body text.
export type LinkedInAction = "message" | "connect" | "like_post" | "view_profile" | "voice_message"

// WhatsApp only ever has these two — no Connect/Like Post/View Profile
// equivalent exists on that channel.
export type WhatsAppAction = "message" | "voice_message"

export interface CampaignStep {
  id: string
  channel: StepChannel
  delayDays: number
  subject?: string
  body: string
  // Only meaningful when channel is linkedin_message/linkedin_dm/
  // linkedin_inmail; undefined reads as "message" (the existing behavior).
  linkedinAction?: LinkedInAction
  // Only meaningful when channel is whatsapp; undefined reads as "message".
  whatsappAction?: WhatsAppAction
  // A real recorded voice note for a linkedinAction/whatsappAction of
  // "voice_message" — an object URL (URL.createObjectURL), so it only lives
  // for the current browser session (no backend to persist the blob to).
  voiceRecordingUrl?: string
  voiceDurationSec?: number
  // When true, this step creates a task for the assigned rep to complete by
  // hand (a manual LinkedIn touch, a handwritten note, etc.) instead of
  // auto-sending. `subject` becomes the task title and `body` becomes
  // optional notes; status is binary (to-do vs done) on the rep's task list.
  isManualTask?: boolean
  // Hour of day (0-23) the task is due at; undefined reads as the first
  // entry in TASK_START_TIME_OPTIONS (9am).
  taskStartTime?: number
  // Minutes before the task's start time to surface a reminder; 0 reads as
  // "no reminder." Undefined reads as 0.
  taskReminderMinutes?: number
  // The ElevenLabs voice used for an `ai_call` step; `body` doubles as the
  // call script/instructions given to the agent.
  aiVoice?: string
  // Which mocked ElevenLabs agent/goal handles this call. Undefined reads
  // as the first entry in AI_CALL_AGENTS.
  aiCallAgentId?: string
  // When true, an unanswered call (no answer/voicemail is unaffected) is
  // retried on the aiCallRetryCadence schedule below.
  aiCallRetryEnabled?: boolean
  // Which fixed retry-delay preset to use; undefined reads as "rapid" once
  // retry is enabled (matches the extension's default-on-enable behavior).
  aiCallRetryCadence?: "rapid" | "relaxed"
  // The rep the manual task is assigned to. Undefined reads as the campaign
  // owner / current user.
  assigneeId?: string
  // A condition creates a fork anchored at this step: two mutually-
  // exclusive tracks that both reconnect into whatever follows. Steps
  // inside a track never carry their own `fork` or `parallelSteps`
  // (enforced by the UI, not this type) so the model stays exactly one
  // level deep.
  fork?: StepFork
  // Steps that fire at the same time as this one — concurrent, not a fork:
  // the sequence continues as a single line afterward, with no rejoin/
  // dead-end concept. Each entry is a plain leaf step (no `fork` or
  // `parallelSteps` of its own).
  parallelSteps?: CampaignStep[]
}

// What the fork's two tracks are conditioned on.
export type ConditionKind = "reply" | "open" | "click"

// The two fixed, mutually-exclusive arms of a condition. Which pair
// applies is determined by the fork's `condition`.
export type StepTrackKind =
  | "reply"
  | "no_reply"
  | "opened"
  | "not_opened"
  | "clicked"
  | "not_clicked"

export interface StepTrack {
  id: string
  kind: StepTrackKind
  steps: CampaignStep[]
}

export interface StepFork {
  // Exactly two tracks — the condition's met/not-met pair. Both always
  // reconnect into the step that follows the fork in the parent list;
  // there is no dead-ending arm.
  condition: ConditionKind
  tracks: StepTrack[]
}

export interface Campaign {
  id: string
  name: string
  status: CampaignStatus
  steps: CampaignStep[]
  enrolled: number
  opened: number
  replied: number
  meetings: number
  createdAt: string
  goal?: string // free-text goal / intent
  listId?: string // the single attached list (1-to-1)
  enrolledIds?: string[] // manually-added prospect ids
  // When set to a future ISO time, the campaign is queued to start then rather
  // than sending immediately. Cleared once it activates (or the user cancels).
  scheduledAt?: string | null
  // Sending account + language. Both default to the current user and locale and
  // stay editable until the campaign is made active. All optional for
  // back-compat with seeded campaigns.
  senderAccount?: string // display name of the account the campaign sends from
  senderAccountId?: string
  language?: Locale
  endedAt?: string | null // ISO when the campaign was Ended
  // Recipient ids that already received at least one message, so re-activation
  // after being made inactive skips them.
  messagedIds?: string[]
  // Whether the sequence pauses itself the instant a prospect replies.
  // Undefined behaves as true (the sensible default) for back-compat with
  // seeded campaigns that predate this field.
  autoPauseOnReply?: boolean
}

export interface CoachRecording {
  id: string
  title: string
  prospectName: string
  company: string
  date: string
  durationMin: number
  score: number
  talkRatio: number // % rep talked
  sentiment: "positive" | "neutral" | "negative"
  highlights: string[]
  nextSteps: string[]
  // Where the call happened. LinkedIn calls can't embed their recording — the
  // player links out to the original instead; every other source plays the
  // full video inline.
  videoSource?: "meet" | "teams" | "linkedin" | "phone"
}

export interface Integration {
  id: string
  name: string
  description: string
  connected: boolean
  category: "crm" | "email" | "calendar" | "social" | "outreach"
}

export interface CurrentUser {
  id: string
  name: string
  email: string
  role: string
  company: string
  plan: string
  avatarColor: string
  avatarUrl?: string // user-uploaded profile photo (data URL)
}

export interface DashboardStat {
  label: string
  value: string
  delta: number // percentage change
  hint: string
}

export interface ActivityItem {
  id: string
  type: "reply" | "meeting" | "enriched" | "added" | "opened"
  prospectName: string
  detail: string
  timestamp: string
}

export type AccountTier = "Enterprise" | "Mid-market" | "SMB"

export interface Account {
  id: string
  name: string
  domain: string
  industry: string
  employees: string
  revenue: string
  location: string
  logoColor: string
  tier: AccountTier
  healthScore: number // 0-100
  openDeals: number
  pipeline: number // $
  contacts: number
  ownerId: string
  lastActivity: string
  about: string
  signals: string[]
  keyExecutives: { name: string; title: string }[]
}

// Outcome-based pipeline stages — a top-of-funnel view of where each
// prospect/account stands. Deliberately NOT classic deal stages (Lead,
// Proposal, Negotiation…): only outcomes.
export type DealStage =
  | "interested"
  | "meeting_booked"
  | "needs_review"
  | "qualified"
  | "won"
  | "not_interested"
  | "disqualified"
  | "lost"

export interface Deal {
  id: string
  name: string
  accountId: string
  ownerId: string
  stage: DealStage
  value: number
  probability: number // %
  closeDate: string
  createdAt: string
  contactName: string
}

export interface EmailTemplate {
  id: string
  name: string
  folder: string
  channel: Channel
  subject: string
  body: string
  sent: number
  replyRate: number // %
  updatedAt: string
  tags: string[]
}

export type TaskType = "call" | "email" | "linkedin" | "manual" | "follow_up"

// Whether a task is completed inside the app (a message we can send) or
// offline (a call to place, a manual to-do logged by hand).
export type TaskMode = "in_app" | "offline"

export interface Task {
  id: string
  title: string
  type: TaskType
  prospectId?: string
  ownerId: string // assignee — a team member or the current user
  // Who created/assigned the task: "kai" (AI), "system", or a user/rep id.
  assignedById?: string
  dueDate: string
  done: boolean
  ignored?: boolean // dismissed/snoozed out of the active queue
  priority: "high" | "medium" | "low"
}

export type NotificationType =
  | "reply"
  | "meeting"
  | "deal"
  | "mention"
  | "system"

export interface NotificationItem {
  id: string
  type: NotificationType
  title: string
  body: string
  timestamp: string
  read: boolean
}

export interface KaiMessage {
  id: string
  role: "user" | "assistant"
  content: string
  tools?: string[] // MCP tools the assistant used to answer
}

// --- Depth: campaigns ---
export interface CampaignDailyStat {
  date: string // ISO
  sent: number
  opened: number
  replied: number
  bounced: number
}

export type EnrollmentStatus =
  | "active"
  | "replied"
  | "completed"
  | "bounced"
  | "paused"

export interface CampaignEnrollment {
  prospectId: string
  currentStep: number // 1-based
  status: EnrollmentStatus
  lastTouch: string // ISO
}

// --- Depth: coaching ---
export interface TranscriptTurn {
  id: string
  speaker: "rep" | "prospect"
  name: string
  time: string // mm:ss
  text: string
}

export interface KeyMoment {
  time: string // mm:ss
  label: string
  type: "positive" | "risk" | "action" | "question"
}

export type CallType = "Discovery" | "Demo" | "Intro" | "Negotiation" | "Follow-up"

export interface CallParticipant {
  name: string
  role: "rep" | "prospect"
  title: string
  talkPct: number
}

export interface Personality {
  disc: string // e.g. "Driver (D)"
  summary: string
  tips: string[]
}

export interface RecordingAnalysis {
  longestMonologueMin: number
  questionsAsked: number
  patience: number // seconds avg pause before responding
  topics: { label: string; pct: number }[]
  objections: string[]
  keyMoments: KeyMoment[]
  actionItems: string[]
  coachingTips: string[]
  transcript: TranscriptTurn[]
  callType?: CallType
  participants?: CallParticipant[]
  personality?: Personality
}

// --- Depth: company intelligence ---
export interface NewsItem {
  id: string
  title: string
  source: string
  date: string // ISO
  sentiment: "positive" | "neutral" | "negative"
}

// --- Depth: CRM add-to-record ---
export interface CrmProvider {
  id: string
  name: string
  logoColor: string
  connected: boolean
  objectName: string // e.g. "Contact", "Lead"
}
