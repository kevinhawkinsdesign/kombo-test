// Mock data for: warm-intro / network search, channel-send infrastructure,
// and MCP-backed AI tool connections.

// --- Warm intros / network paths ---
export type IntroStrength = "strong" | "medium" | "weak"

export interface IntroPath {
  id: string
  prospectId: string
  connectorName: string
  connectorTitle: string
  connectorAvatarColor: string
  via: string // how they're connected
  strength: IntroStrength
  source: "team" | "linkedin" | "alumni" | "investor"
  connectorIsTeam?: boolean
}

export const introPaths: IntroPath[] = [
  {
    id: "ip_1",
    prospectId: "p_1",
    connectorName: "Maya Patel",
    connectorTitle: "Account Executive · Kombo",
    connectorAvatarColor: "#7c3aed",
    via: "Worked together at Stripe (2019–2021)",
    strength: "strong",
    source: "team",
    connectorIsTeam: true,
  },
  {
    id: "ip_2",
    prospectId: "p_1",
    connectorName: "Daniel Wu",
    connectorTitle: "CRO · Northwind Logistics",
    connectorAvatarColor: "#0ea5e9",
    via: "Reports into Sarah — internal champion",
    strength: "medium",
    source: "linkedin",
  },
  {
    id: "ip_3",
    prospectId: "p_9",
    connectorName: "Priya Nair",
    connectorTitle: "Demand Gen Lead · CloudNine",
    connectorAvatarColor: "#14b8a6",
    via: "Stanford GSB alumni — same cohort",
    strength: "medium",
    source: "alumni",
  },
  {
    id: "ip_4",
    prospectId: "p_12",
    connectorName: "Jordan Lee",
    connectorTitle: "Account Executive · Kombo",
    connectorAvatarColor: "#0ea5e9",
    via: "2nd-degree — mutual connection at Meridian",
    strength: "weak",
    source: "team",
    connectorIsTeam: true,
  },
  {
    id: "ip_5",
    prospectId: "p_2",
    connectorName: "Accel Partners",
    connectorTitle: "Investor · shared portfolio",
    connectorAvatarColor: "#f59e0b",
    via: "Both Accel portfolio companies — partner intro",
    strength: "strong",
    source: "investor",
  },
  {
    id: "ip_6",
    prospectId: "p_4",
    connectorName: "Maya Patel",
    connectorTitle: "Account Executive · Kombo",
    connectorAvatarColor: "#7c3aed",
    via: "Connected on LinkedIn — engaged with her posts",
    strength: "weak",
    source: "linkedin",
    connectorIsTeam: true,
  },
]

export function getIntroPaths(prospectId: string): IntroPath[] {
  const order: Record<IntroStrength, number> = { strong: 0, medium: 1, weak: 2 }
  return introPaths
    .filter((p) => p.prospectId === prospectId)
    .sort((a, b) => order[a.strength] - order[b.strength])
}

// --- Channel-send infrastructure (SmartLead / HeyReach / mailboxes) ---
export type ChannelType = "email" | "linkedin"
export type ChannelStatus = "active" | "warming" | "paused"

export interface SendingChannel {
  id: string
  type: ChannelType
  label: string
  provider: string
  status: ChannelStatus
  dailyLimit: number
  sentToday: number
  warmupPct: number
  health: number // deliverability / account health 0-100
}

export const sendingChannels: SendingChannel[] = [
  { id: "ch_1", type: "email", label: "kevin@getkombo.ai", provider: "Gmail", status: "active", dailyLimit: 50, sentToday: 34, warmupPct: 100, health: 96 },
  { id: "ch_2", type: "email", label: "k.hawkins@getkombo.io", provider: "SmartLead", status: "warming", dailyLimit: 40, sentToday: 12, warmupPct: 62, health: 88 },
  { id: "ch_3", type: "linkedin", label: "Kevin Hawkins", provider: "HeyReach", status: "active", dailyLimit: 25, sentToday: 18, warmupPct: 100, health: 92 },
  { id: "ch_4", type: "email", label: "sales@getkombo.ai", provider: "Outlook", status: "paused", dailyLimit: 50, sentToday: 0, warmupPct: 100, health: 74 },
  { id: "ch_5", type: "linkedin", label: "Maya Patel", provider: "HeyReach", status: "active", dailyLimit: 25, sentToday: 20, warmupPct: 100, health: 90 },
]

// --- MCP-backed AI tool connections (what Kai can use) ---
export interface McpConnection {
  id: string
  name: string
  description: string
  category: string
  connected: boolean
  tools: string[]
}

export const mcpConnections: McpConnection[] = [
  { id: "hubspot", name: "HubSpot MCP", description: "Read & write CRM contacts, deals, and activities.", category: "CRM", connected: true, tools: ["search_contacts", "create_deal", "log_activity"] },
  { id: "gcal", name: "Google Calendar", description: "Check availability and book meetings.", category: "Calendar", connected: true, tools: ["get_availability", "create_event"] },
  { id: "gmail", name: "Gmail", description: "Draft and send tracked emails.", category: "Email", connected: true, tools: ["draft_email", "send_email"] },
  { id: "websearch", name: "Web Search", description: "Look up company news and buying signals.", category: "Research", connected: true, tools: ["search_web"] },
  { id: "smartlead", name: "SmartLead", description: "Enroll prospects in multi-channel sequences.", category: "Outreach", connected: true, tools: ["enroll_prospect"] },
  { id: "slack", name: "Slack", description: "Post deal updates to your team channels.", category: "Messaging", connected: false, tools: ["post_message"] },
]

export const connectedToolCount = mcpConnections.filter((c) => c.connected).length
