import { KomboLogo } from "@/components/KomboLogo"

const BULLETS = [
  "Find your best-fit leads with AI scoring",
  "Enrich prospects with 30+ data points",
  "Personalize outreach across email & LinkedIn",
  "Sync everything to your CRM automatically",
]

export function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="bg-primary text-primary-foreground relative hidden flex-col justify-between p-10 lg:flex">
        <KomboLogo className="[&_span]:text-primary-foreground [&_.text-primary]:text-primary-foreground/70" />
        <div className="space-y-6">
          <h2 className="text-3xl font-semibold leading-tight">
            The AI sales workspace for modern revenue teams.
          </h2>
          <ul className="space-y-3">
            {BULLETS.map((b) => (
              <li key={b} className="flex items-start gap-3">
                <span className="bg-primary-foreground/20 mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full text-xs">
                  ✓
                </span>
                <span className="text-primary-foreground/90 text-sm">{b}</span>
              </li>
            ))}
          </ul>
        </div>
        <p className="text-primary-foreground/60 text-xs">
          © 2026 Kombo AI · Prototype
        </p>
        <div className="pointer-events-none absolute -right-24 -bottom-24 size-72 rounded-full bg-white/10 blur-3xl" />
      </div>

      <div className="flex items-center justify-center p-6">
        <div className="w-full max-w-sm">{children}</div>
      </div>
    </div>
  )
}
