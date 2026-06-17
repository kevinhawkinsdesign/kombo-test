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

export type Channel = "email" | "linkedin"

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
}

export interface ProspectList {
  id: string
  name: string
  description: string
  prospectIds: string[]
  createdAt: string
  color: string
  source: "linkedin" | "salesnav" | "csv" | "search"
}

export interface Message {
  id: string
  channel: Channel
  direction: "inbound" | "outbound"
  body: string
  timestamp: string
  read: boolean
}

export interface Conversation {
  id: string
  prospectId: string
  channel: Channel
  subject: string
  messages: Message[]
  unread: number
  lastMessageAt: string
}

export type CampaignStatus = "active" | "paused" | "draft" | "completed"

export interface CampaignStep {
  id: string
  channel: Channel
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
  ownerId: string
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
}
