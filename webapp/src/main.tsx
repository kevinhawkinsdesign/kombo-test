import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { BrowserRouter, HashRouter } from "react-router-dom"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"

import "./index.css"
import App from "./App.tsx"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/lib/auth"
import { Toaster } from "@/components/ui/sonner"

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 5 * 60 * 1000, refetchOnWindowFocus: false },
  },
})

// Use hash routing for static hosting (e.g. GitHub Pages preview),
// browser routing everywhere else. Controlled at build time.
const Router = import.meta.env.VITE_ROUTER === "hash" ? HashRouter : BrowserRouter

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider defaultTheme="light">
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <Router>
            <App />
            <Toaster richColors position="bottom-right" />
          </Router>
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  </StrictMode>
)
