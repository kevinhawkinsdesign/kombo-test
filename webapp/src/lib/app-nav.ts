import type { ComponentType } from "react"
import {
  LayoutDashboard,
  Sparkles,
  Inbox,
  Search,
  Building2,
  FolderKanban,
  Waypoints,
  Puzzle,
  Send,
  Workflow,
  Mail,
  Radio,
  CheckSquare,
  Briefcase,
  BarChart3,
  GraduationCap,
  BookOpen,
  Users,
  Zap,
  Gift,
  Plug,
  Settings,
  Rocket,
} from "lucide-react"

export interface AppDestination {
  to: string
  labelKey: string
  icon: ComponentType<{ className?: string }>
  // English synonyms so search matches intent, not just the visible label.
  keywords?: string[]
}

// Flat, searchable index of every in-app destination. Used by the top-bar
// "search the app" combobox to jump straight to a page.
export const APP_DESTINATIONS: AppDestination[] = [
  { to: "/", labelKey: "nav.dashboard", icon: LayoutDashboard, keywords: ["home", "overview"] },
  { to: "/copilot", labelKey: "nav.copilot", icon: Sparkles, keywords: ["signals", "copilot", "kai", "automations", "approvals"] },
  { to: "/inbox", labelKey: "nav.inbox", icon: Inbox, keywords: ["messages", "replies", "conversations"] },
  { to: "/search", labelKey: "nav.search", icon: Search, keywords: ["prospects", "find", "leads", "people"] },
  { to: "/companies", labelKey: "nav.companies", icon: Building2, keywords: ["accounts", "discover"] },
  { to: "/people", labelKey: "nav.people", icon: Users, keywords: ["prospects", "contacts", "leads", "persons"] },
  { to: "/lists", labelKey: "nav.lists", icon: FolderKanban, keywords: ["segments"] },
  { to: "/intros", labelKey: "nav.intros", icon: Waypoints, keywords: ["warm", "introductions", "referrals"] },
  { to: "/extension", labelKey: "nav.extension", icon: Puzzle, keywords: ["chrome", "browser"] },
  { to: "/campaigns", labelKey: "nav.campaigns", icon: Send, keywords: ["outreach"] },
  { to: "/sequences", labelKey: "nav.sequences", icon: Workflow, keywords: ["cadence", "steps"] },
  { to: "/templates", labelKey: "nav.templates", icon: Mail, keywords: ["snippets", "emails"] },
  { to: "/channels", labelKey: "nav.channels", icon: Radio, keywords: ["linkedin", "email", "senders"] },
  { to: "/tasks", labelKey: "nav.tasks", icon: CheckSquare, keywords: ["todo"] },
  { to: "/deals", labelKey: "nav.deals", icon: Briefcase, keywords: ["pipeline", "crm"] },
  { to: "/analytics", labelKey: "nav.analytics", icon: BarChart3, keywords: ["reports", "metrics"] },
  { to: "/coach", labelKey: "nav.coach", icon: GraduationCap, keywords: ["calls", "recordings"] },
  { to: "/playbook", labelKey: "nav.playbook", icon: BookOpen, keywords: ["strategy", "icp"] },
  { to: "/team", labelKey: "nav.team", icon: Users, keywords: ["members", "reps"] },
  { to: "/usage", labelKey: "nav.usage", icon: Zap, keywords: ["credits", "billing", "plan"] },
  { to: "/referrals", labelKey: "nav.referrals", icon: Gift, keywords: ["invite"] },
  { to: "/integrations", labelKey: "nav.integrations", icon: Plug, keywords: ["connect", "salesforce", "hubspot", "crm"] },
  { to: "/settings", labelKey: "nav.settings", icon: Settings, keywords: ["preferences", "profile", "account", "password"] },
  { to: "/get-started", labelKey: "nav.getStarted", icon: Rocket, keywords: ["onboarding", "setup"] },
]

// Shown when the search box is focused but empty — common jump-off points.
export const DEFAULT_DESTINATIONS = ["/", "/inbox", "/campaigns", "/lists", "/settings"]
