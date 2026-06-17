import { Navigate, Route, Routes } from "react-router-dom"

import { AppLayout } from "@/components/layout/AppLayout"
import { useAuth } from "@/lib/auth"
import Login from "@/pages/Login"
import Signup from "@/pages/Signup"
import Onboarding from "@/pages/Onboarding"
import Dashboard from "@/pages/Dashboard"
import Search from "@/pages/Search"
import ProspectProfile from "@/pages/ProspectProfile"
import Companies from "@/pages/Companies"
import CompanyDetail from "@/pages/CompanyDetail"
import Lists from "@/pages/Lists"
import ListDetail from "@/pages/ListDetail"
import Inbox from "@/pages/Inbox"
import Campaigns from "@/pages/Campaigns"
import Templates from "@/pages/Templates"
import Tasks from "@/pages/Tasks"
import Deals from "@/pages/Deals"
import Analytics from "@/pages/Analytics"
import Coach from "@/pages/Coach"
import Team from "@/pages/Team"
import Integrations from "@/pages/Integrations"
import Settings from "@/pages/Settings"
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
        <Route path="/" element={<Dashboard />} />
        <Route path="/search" element={<Search />} />
        <Route path="/prospects/:id" element={<ProspectProfile />} />
        <Route path="/companies" element={<Companies />} />
        <Route path="/companies/:id" element={<CompanyDetail />} />
        <Route path="/lists" element={<Lists />} />
        <Route path="/lists/:id" element={<ListDetail />} />
        <Route path="/inbox" element={<Inbox />} />
        <Route path="/campaigns" element={<Campaigns />} />
        <Route path="/templates" element={<Templates />} />
        <Route path="/tasks" element={<Tasks />} />
        <Route path="/deals" element={<Deals />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/coach" element={<Coach />} />
        <Route path="/team" element={<Team />} />
        <Route path="/integrations" element={<Integrations />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/notifications" element={<NotificationsPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
