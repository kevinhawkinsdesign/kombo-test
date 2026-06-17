import { Navigate, Route, Routes } from "react-router-dom"

import { AppLayout } from "@/components/layout/AppLayout"
import { useAuth } from "@/lib/auth"
import Login from "@/pages/Login"
import Signup from "@/pages/Signup"
import Dashboard from "@/pages/Dashboard"
import Search from "@/pages/Search"
import ProspectProfile from "@/pages/ProspectProfile"
import Lists from "@/pages/Lists"
import ListDetail from "@/pages/ListDetail"
import Inbox from "@/pages/Inbox"
import Campaigns from "@/pages/Campaigns"
import Coach from "@/pages/Coach"
import Integrations from "@/pages/Integrations"
import Settings from "@/pages/Settings"

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
        element={
          <RequireAuth>
            <AppLayout />
          </RequireAuth>
        }
      >
        <Route path="/" element={<Dashboard />} />
        <Route path="/search" element={<Search />} />
        <Route path="/prospects/:id" element={<ProspectProfile />} />
        <Route path="/lists" element={<Lists />} />
        <Route path="/lists/:id" element={<ListDetail />} />
        <Route path="/inbox" element={<Inbox />} />
        <Route path="/campaigns" element={<Campaigns />} />
        <Route path="/coach" element={<Coach />} />
        <Route path="/integrations" element={<Integrations />} />
        <Route path="/settings" element={<Settings />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
