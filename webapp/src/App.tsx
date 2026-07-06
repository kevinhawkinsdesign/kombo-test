import { Navigate, Route, Routes } from "react-router-dom"

import { AppLayout } from "@/components/layout/AppLayout"
import { useAuth } from "@/lib/auth"
import Login from "@/pages/Login"
import Signup from "@/pages/Signup"
import Onboarding from "@/pages/Onboarding"
import Dashboard from "@/pages/Dashboard"
import Home from "@/pages/Home"
import Search from "@/pages/Search"
import QuickSearch from "@/pages/QuickSearch"
import ProspectProfile from "@/pages/ProspectProfile"
import Companies from "@/pages/Companies"
import People from "@/pages/People"
import CompanyDetail from "@/pages/CompanyDetail"
import Lists from "@/pages/Lists"
import ListDetail from "@/pages/ListDetail"
import Workspaces from "@/pages/Workspaces"
import WorkspaceDetail from "@/pages/WorkspaceDetail"
import Inbox from "@/pages/Inbox"
import Campaigns from "@/pages/Campaigns"
import CampaignDetail from "@/pages/CampaignDetail"
import SequenceBuilderPage from "@/pages/SequenceBuilder"
import Sequences from "@/pages/Sequences"
import Channels from "@/pages/Channels"
import Templates from "@/pages/Templates"
import Playbook from "@/pages/Playbook"
import Tasks from "@/pages/Tasks"
import Deals from "@/pages/Deals"
import Analytics from "@/pages/Analytics"
import Coach from "@/pages/Coach"
import CoachRecordingDetail from "@/pages/CoachRecordingDetail"
import Team from "@/pages/Team"
import Referral from "@/pages/Referral"
import Usage from "@/pages/Usage"
import Integrations from "@/pages/Integrations"
import Extension from "@/pages/Extension"
import Settings from "@/pages/Settings"
import GetStarted from "@/pages/GetStarted"
import NotificationsPage from "@/pages/Notifications"

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return <>{children}</>
}

function App() {
  const { isAuthenticated } = useAuth()

  return (
    <Routes>
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/" replace /> : <Login />}
      />
      <Route
        path="/signup"
        element={isAuthenticated ? <Navigate to="/" replace /> : <Signup />}
      />
      <Route
        path="/onboarding"
        element={
          <RequireAuth>
            <Onboarding />
          </RequireAuth>
        }
      />

      <Route
        element={
          <RequireAuth>
            <AppLayout />
          </RequireAuth>
        }
      >
        {/* Home is a quick-actions launcher + the customizable module grid;
            the sales Dashboard is its own page; /search (Signals) is the
            AI-suggestion feed + results view; /find is the dedicated search
            page (hero + module grid), kept distinct from Signals. */}
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/search" element={<Search />} />
        <Route path="/find" element={<QuickSearch />} />
        <Route path="/prospects/:id" element={<ProspectProfile />} />
        <Route path="/companies" element={<Companies />} />
        <Route path="/companies/:id" element={<CompanyDetail />} />
        <Route path="/people" element={<People />} />
        <Route path="/discover" element={<Navigate to="/companies" replace />} />
        <Route path="/intros" element={<People />} />
        <Route path="/lists" element={<Lists />} />
        <Route path="/lists/:id" element={<ListDetail />} />
        <Route path="/workspaces" element={<Workspaces />} />
        <Route path="/workspaces/:id" element={<WorkspaceDetail />} />
        <Route path="/inbox" element={<Inbox />} />
        <Route path="/campaigns" element={<Campaigns />} />
        <Route path="/campaigns/:id" element={<CampaignDetail />} />
        <Route path="/sequences" element={<Sequences />} />
        <Route path="/sequence-builder" element={<SequenceBuilderPage />} />
        <Route path="/channels" element={<Channels />} />
        <Route path="/templates" element={<Templates />} />
        <Route path="/playbook" element={<Playbook />} />
        <Route path="/tasks" element={<Tasks />} />
        <Route path="/deals" element={<Deals />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/coach" element={<Coach />} />
        <Route path="/coach/:id" element={<CoachRecordingDetail />} />
        <Route path="/team" element={<Team />} />
        <Route path="/referrals" element={<Referral />} />
        <Route path="/usage" element={<Usage />} />
        <Route path="/integrations" element={<Integrations />} />
        <Route path="/extension" element={<Extension />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/get-started" element={<GetStarted />} />
        <Route path="/notifications" element={<NotificationsPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
