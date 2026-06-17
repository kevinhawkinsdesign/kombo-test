import * as React from "react"
import { Link, useNavigate } from "react-router-dom"
import { Loader2 } from "lucide-react"

import { AuthLayout } from "@/components/layout/AuthLayout"
import { KomboLogo } from "@/components/KomboLogo"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/lib/auth"

export default function Login() {
  const { login, loginWithDemo } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = React.useState("kevin@getkombo.ai")
  const [password, setPassword] = React.useState("demo1234")
  const [loading, setLoading] = React.useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    await login(email, password)
    navigate("/")
  }

  return (
    <AuthLayout>
      <div className="mb-8 lg:hidden">
        <KomboLogo />
      </div>
      <div className="mb-6 space-y-1.5">
        <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
        <p className="text-muted-foreground text-sm">
          Sign in to your Kombo workspace.
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Work email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <button
              type="button"
              className="text-primary text-xs hover:underline"
            >
              Forgot password?
            </button>
          </div>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading && <Loader2 className="size-4 animate-spin" />}
          Sign in
        </Button>
      </form>

      <div className="my-6 flex items-center gap-3">
        <div className="bg-border h-px flex-1" />
        <span className="text-muted-foreground text-xs">or</span>
        <div className="bg-border h-px flex-1" />
      </div>

      <Button
        variant="outline"
        className="w-full"
        onClick={() => {
          loginWithDemo()
          navigate("/")
        }}
      >
        Explore the demo workspace
      </Button>

      <p className="text-muted-foreground mt-6 text-center text-sm">
        Don&apos;t have an account?{" "}
        <Link to="/signup" className="text-primary font-medium hover:underline">
          Start free
        </Link>
      </p>
    </AuthLayout>
  )
}
