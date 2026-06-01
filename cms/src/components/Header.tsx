const CaretIcon = () => (
  <svg className="caret" width="10" height="10" viewBox="0 0 10 10" aria-hidden="true">
    <path d="M1.5 3.5 L5 7 L8.5 3.5" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

interface MegaLinkProps {
  href: string
  label: string
  desc?: string
  iconBg?: string
  icon?: string
  external?: boolean
}

function MegaLink({ href, label, desc, iconBg = '#ede9fe', icon = '✦', external }: MegaLinkProps) {
  return (
    <a
      href={href}
      className="mega-link"
      {...(external ? { rel: 'noopener noreferrer', target: '_blank' } : {})}
    >
      <span className="mega-link-icon" style={{ background: iconBg }}>{icon}</span>
      <span className="mega-link-body">
        <span className="mega-link-title">{label}</span>
        {desc && <span className="mega-link-desc">{desc}</span>}
      </span>
    </a>
  )
}

interface MegaColProps {
  header?: string
  children: React.ReactNode
}

function MegaCol({ header, children }: MegaColProps) {
  return (
    <div className="mega-col">
      {header && <p className="mega-col-header">{header}</p>}
      <ul className="mega-col-list">{children}</ul>
    </div>
  )
}

interface FeaturedCardProps {
  label: string
  title: string
  href: string
  external?: boolean
}

function FeaturedCard({ label, title, href, external }: FeaturedCardProps) {
  return (
    <a
      href={href}
      className="mega-featured"
      {...(external ? { rel: 'noopener noreferrer', target: '_blank' } : {})}
    >
      <div className="mega-featured-bg" />
      <div className="mega-featured-content">
        <p className="mega-featured-label">{label}</p>
        <p className="mega-featured-title">{title}</p>
      </div>
    </a>
  )
}

export function Header() {
  return (
    <header className="site-header">
      {/* ── Top bar ── */}
      <div className="nav-bar">
        <div className="container nav-inner">
          <a className="nav-logo" href="/">
            <img src="/icon-green.svg" alt="KomboAI" className="logo-img" width="32" height="32" />
            <span className="logo-text">KomboAI</span>
          </a>

          <div className="nav-links">
            {(['product', 'use-cases', 'solutions', 'resources', 'company', 'connect'] as const).map((id) => (
              <button key={id} type="button" className="nav-trigger" data-nav={id}>
                {id === 'use-cases' ? 'Use Cases' : id.charAt(0).toUpperCase() + id.slice(1)}
                <CaretIcon />
              </button>
            ))}
          </div>

          <div className="nav-end">
            <div className="locale-switcher" aria-label="Language">
              <a className="locale-pill active" hrefLang="en" aria-current="true" href="/">EN</a>
              <a className="locale-pill" hrefLang="es" href="/es/">ES</a>
              <a className="locale-pill" hrefLang="it" href="/it/">IT</a>
            </div>
            <a href="/demo" className="btn btn-primary nav-cta">Book a demo</a>
            <button className="nav-toggle" aria-label="Open menu" aria-expanded="false">
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                <path d="M3 6h16M3 11h16M3 16h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* ── Mega panel ── */}
      <div className="mega-panel" id="mega-panel" aria-hidden="true">
        <div className="mega-panel-inner" id="mega-panel-inner">

          {/* PRODUCT */}
          <div className="mega-section" data-section="product">
            <div className="container mega-layout">
              <MegaCol header="FEATURES">
                <MegaLink href="/features" label="ICP finder" desc="Build your ideal customer profile at scale" iconBg="#e0e7ff" icon="🎯" />
                <MegaLink href="/features" label="Data enrichment" desc="Enrich any record with 50+ data providers" iconBg="#ede9fe" icon="📊" />
                <MegaLink href="/features" label="Dynamic playlists" desc="Auto-updating lists that match your ICP" iconBg="#fce7f3" icon="♾️" />
                <MegaLink href="/features" label="Buying signals" desc="Detect intent before your competitors do" iconBg="#fef3c7" icon="⚡" />
                <MegaLink href="/features" label="AI agents" desc="Research companies and people with AI" iconBg="#dcfce7" icon="🤖" />
              </MegaCol>
              <MegaCol>
                <MegaLink href="/features" label="AI sequencer" desc="Personalize outreach at any volume" iconBg="#e0e7ff" icon="✉️" />
                <MegaLink href="/how-it-works" label="AI note taker" desc="Auto-capture every call, meeting, and demo" iconBg="#ede9fe" icon="📝" />
                <MegaLink href="/features" label="AI coach" desc="Rep coaching from every conversation" iconBg="#fce7f3" icon="🏋️" />
                <MegaLink href="/crm-cleanup" label="CRM cleanup" desc="Keep your data accurate and complete" iconBg="#fef3c7" icon="🧹" />
                <MegaLink href="/security" label="Security" desc="Enterprise-grade security and compliance" iconBg="#dcfce7" icon="🔒" />
              </MegaCol>
              <FeaturedCard label="See it live" title="Watch how KomboAI finds your next 100 customers in minutes" href="/demo" />
            </div>
          </div>

          {/* USE CASES */}
          <div className="mega-section" data-section="use-cases">
            <div className="container mega-layout">
              <MegaCol>
                <MegaLink href="/use-cases/prospecting" label="Prospecting" desc="Find and prioritize your best-fit accounts" iconBg="#e0e7ff" icon="🔍" />
                <MegaLink href="/use-cases/signals" label="Act on signals" desc="Trigger outreach when the moment is right" iconBg="#ede9fe" icon="⚡" />
                <MegaLink href="/use-cases/inbound" label="Qualify inbound" desc="Score and route leads automatically" iconBg="#fce7f3" icon="✅" />
              </MegaCol>
              <MegaCol>
                <MegaLink href="/use-cases/crm-enrichment" label="CRM enrichment" desc="Keep every record fresh and accurate" iconBg="#fef3c7" icon="💾" />
                <MegaLink href="/use-cases/coaching" label="Coach reps" desc="Elevate every rep with AI-powered feedback" iconBg="#dcfce7" icon="🏆" />
              </MegaCol>
              <FeaturedCard label="Customer story" title="How Kombo helped Acme Corp 3× their pipeline in 60 days" href="/customers" />
            </div>
          </div>

          {/* SOLUTIONS */}
          <div className="mega-section" data-section="solutions">
            <div className="container mega-layout">
              <MegaCol>
                <MegaLink href="/for-sales-reps" label="For Sales Reps" desc="Spend more time selling, less time searching" iconBg="#e0e7ff" icon="💼" />
                <MegaLink href="/for-sales-leaders" label="For Managers" desc="Forecast accurately and coach at scale" iconBg="#ede9fe" icon="📈" />
                <MegaLink href="/for-revenue-operations" label="For Ops" desc="Automate the workflows your team hates" iconBg="#fce7f3" icon="⚙️" />
              </MegaCol>
              <MegaCol>
                <MegaLink href="/for-startups" label="For Startups" desc="Go to market faster with less manual work" iconBg="#fef3c7" icon="🚀" />
                <MegaLink href="/for-enterprises" label="For Enterprise" desc="Security, scale, and dedicated support" iconBg="#dcfce7" icon="🏢" />
              </MegaCol>
              <FeaturedCard label="See a demo" title="Get a personalized walkthrough for your team's workflow" href="/demo" />
            </div>
          </div>

          {/* RESOURCES */}
          <div className="mega-section" data-section="resources">
            <div className="container mega-layout">
              <MegaCol>
                <MegaLink href="/customers" label="Customers" desc="Real stories from teams like yours" iconBg="#e0e7ff" icon="⭐" />
                <MegaLink href="/blog" label="Blog" desc="Playbooks, guides, and GTM strategy" iconBg="#ede9fe" icon="📖" />
                <MegaLink href="/podcast" label="Podcast" desc="Weekly conversations with revenue leaders" iconBg="#fce7f3" icon="🎙️" />
              </MegaCol>
              <MegaCol>
                <MegaLink href="/community" label="Community" desc="Join 10k+ sales professionals" iconBg="#fef3c7" icon="👥" />
                <MegaLink href="/newsletter" label="Newsletter" desc="Weekly GTM insights in your inbox" iconBg="#dcfce7" icon="📬" />
                <MegaLink href="https://resources.getkombo.ai/" label="ROI Calculator ↗" desc="See your expected return in minutes" iconBg="#e0e7ff" icon="💰" external />
              </MegaCol>
              <FeaturedCard label="Latest post" title="The 2025 Outbound Playbook: What actually works now" href="/blog" />
            </div>
          </div>

          {/* COMPANY */}
          <div className="mega-section" data-section="company">
            <div className="container mega-layout">
              <MegaCol>
                <MegaLink href="/about" label="About" desc="Our mission, team, and story" iconBg="#e0e7ff" icon="🌟" />
                <MegaLink href="/contact" label="Contact" desc="Get in touch with our team" iconBg="#ede9fe" icon="💬" />
                <MegaLink href="https://www.linkedin.com/company/kombo-ai/jobs/" label="Jobs ↗" desc="Join us — we're hiring" iconBg="#fce7f3" icon="👋" external />
                <MegaLink href="https://security.getkombo.ai/" label="Trust Center ↗" desc="Security, privacy, and compliance docs" iconBg="#fef3c7" icon="🛡️" external />
              </MegaCol>
              <FeaturedCard label="We're hiring" title="Help build the future of AI-powered sales intelligence" href="https://www.linkedin.com/company/kombo-ai/jobs/" external />
            </div>
          </div>

          {/* CONNECT */}
          <div className="mega-section" data-section="connect">
            <div className="container mega-layout">
              <MegaCol>
                <MegaLink href="https://www.linkedin.com/company/kombo-ai/" label="LinkedIn" desc="Company news and job posts" iconBg="#0077b5" icon="💼" external />
                <MegaLink href="https://www.youtube.com/@KomboAI" label="YouTube" desc="Product walkthroughs and webinars" iconBg="#ff0000" icon="▶️" external />
                <MegaLink href="https://www.instagram.com/kombo.ai/" label="Instagram" desc="Behind the scenes and culture" iconBg="#e1306c" icon="📸" external />
              </MegaCol>
              <MegaCol>
                <MegaLink href="https://www.tiktok.com/@kombo.ai" label="TikTok" desc="Short-form sales tips" iconBg="#010101" icon="🎵" external />
                <MegaLink href="https://open.spotify.com/show/4jgyK2kED9Gv8fiqD2n1re" label="Spotify" desc="Listen to the KomboAI podcast" iconBg="#1db954" icon="🎧" external />
              </MegaCol>
              <FeaturedCard label="New episode" title="How top reps use AI signals to book 40% more meetings" href="/podcast" />
            </div>
          </div>

        </div>
      </div>

      {/* ── Mobile menu (full-screen takeover) ── */}
      <nav className="mobile-menu" aria-label="Mobile navigation">
        <div className="mobile-menu-header">
          <a className="nav-logo" href="/">
            <img src="/icon-green.svg" alt="KomboAI" className="logo-img" width="32" height="32" />
            <span className="logo-text">KomboAI</span>
          </a>
          <button className="mobile-close" aria-label="Close menu">
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <path d="M4 4l14 14M18 4L4 18" />
            </svg>
          </button>
        </div>
        <div className="mobile-menu-body">
          {[
            { label: 'Product', href: '/features' },
            { label: 'Use Cases', href: '/use-cases/prospecting' },
            { label: 'Solutions', href: '/for-sales-reps' },
            { label: 'Resources', href: '/blog' },
            { label: 'Company', href: '/about' },
            { label: 'Connect', href: 'https://www.linkedin.com/company/kombo-ai/' },
          ].map(({ label, href }) => (
            <a key={label} href={href}>{label}</a>
          ))}
          <a href="/demo" className="btn btn-primary mobile-btn">Book a demo</a>
        </div>
      </nav>
    </header>
  )
}
