// Domain types for the Kombo 2.0 web app prototype.
// These mirror the concepts used in the Kombo chrome extension
// (prospects, lists, inbox, campaigns, coaching, CRM) but are UI-only.

export type ProspectStatus =
  | "new"
  | "contacted"
  | "replied"
  | "meeting"
  | "customer"
  | "not_interested"

export type Channel =
  | "email"
  | "linkedin"
  | "whatsapp"
  | "sms"
  | "messenger"
  | "instagram"

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
  // Extended profile fields
  ageRange?: string // e.g. "35-44"
  yearsExperience?: string // e.g. "10+"
  languages?: string[] // ISO 639-1 codes e.g. ["en", "es"]
  personalityDisc?: "D" | "I" | "S" | "C"
  companyLocation?: string
  companyLinkedinUrl?: string
  // Enrichment status — false when a contact was sourced but not yet enriched
  // (verified email/direct dial + full data points). Undefined counts as enriched
  // so existing seed contacts stay clean.
  enriched?: boolean
  // How this prospect entered the workspace. Undefined reads as "search".
  source?: ProspectSource
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
  lastSyncedAt?: string
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

// Intent the conversation has been auto-tagged with (sentiment of the reply).
// Mirrors the "Set outcome" dropdown in the Kombo chrome extension.
export type ConvStatus =
  | "interested"
  | "qualified"
  | "meeting_booked"
  | "won"
  | "not_interested"
  | "disqualified"
  | "need_review"
  | "referred"
  | "bad_timing"
  | "positive"

export interface Message {
  id: string
  channel: Channel
  direction: "inbound" | "outbound"
  body: string
  timestamp: string
  read: boolean
  lang?: ChatLang // language the message was written in
  aiGenerated?: boolean // outbound message was drafted by Kai
}

// A non-message activity that happened in the thread (connection sent,
// post liked, auto-tag applied, email opened). Rendered as a quiet system row.
export type ConvEventKind = "connection" | "like" | "view" | "open" | "click" | "tag"

export interface ConvEvent {
  id: string
  kind: ConvEventKind
  label: string
  detail?: string
  timestamp: string
  status?: ConvStatus // for kind === "tag"
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
  snoozedUntil?: string | null // ISO date; thread is snoozed until then
  archived?: boolean
  recipientLang?: ChatLang // the prospect's preferred language
  status?: ConvStatus // auto-tagged intent
  aiDraft?: string // Kai's suggested reply, ready to send
  scheduledAt?: string | null // ISO date; a reply queued to send later
  events?: ConvEvent[] // activity timeline interleaved with messages
}

export type CampaignStatus = "active" | "paused" | "draft" | "completed"

export type StepChannel =
  | "email"
  | "sms"
  | "whatsapp"
  | "instagram"
  | "linkedin_message"
  | "linkedin_dm"
  | "linkedin_inmail"

export interface CampaignStep {
  id: string
  channel: StepChannel
  delayDays: number
  subject?: string
  body: string
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

export type DealStage =
  | "lead"
  | "qualified"
  | "proposal"
  | "negotiation"
  | "won"
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

export type TaskType = "call" | "email" | "linkedin" | "follow_up"

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
