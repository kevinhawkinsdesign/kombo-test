export function Header() {
  return (
    <header>
      <nav className="container">
        <a href="/" className="nav-logo">
          <svg width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="30" height="30" rx="8" fill="#6366f1" />
            <path d="M9 8h3v6l5-6h4l-6 7 6 7h-4l-5-6v6H9V8z" fill="white" />
          </svg>
          KomboAI
        </a>

        <div className="nav-items">
          <div className="nav-dropdown">
            <button>
              Product{' '}
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="4 6 8 10 12 6" />
              </svg>
            </button>
            <div className="dropdown-menu">
              <a href="/features">Features</a>
              <a href="/integrations">Integrations</a>
            </div>
          </div>
          <div className="nav-dropdown">
            <button>
              Resources{' '}
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="4 6 8 10 12 6" />
              </svg>
            </button>
            <div className="dropdown-menu">
              <a href="/customers">Customers</a>
              <a href="/podcast">Podcast</a>
              <a href="/newsletter">Newsletter</a>
              <a href="/blog">Blog</a>
            </div>
          </div>
          <div className="nav-dropdown">
            <button>
              Company{' '}
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="4 6 8 10 12 6" />
              </svg>
            </button>
            <div className="dropdown-menu">
              <a href="/contact">Contact</a>
              <a href="/team">Team</a>
              <a href="/about">About</a>
            </div>
          </div>
          <div className="nav-dropdown">
            <button>
              Connect{' '}
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="4 6 8 10 12 6" />
              </svg>
            </button>
            <div className="dropdown-menu">
              <a href="#">LinkedIn</a>
              <a href="#">X</a>
              <a href="#">YouTube</a>
              <a href="#">Instagram</a>
              <a href="#">TikTok</a>
            </div>
          </div>
        </div>

        <a href="/contact" className="btn btn-outline nav-cta">
          See a Demo
        </a>

        <button className="nav-toggle" aria-label="Open menu" aria-expanded="false">
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="3" y1="6" x2="19" y2="6" />
            <line x1="3" y1="11" x2="19" y2="11" />
            <line x1="3" y1="16" x2="19" y2="16" />
          </svg>
        </button>
      </nav>
    </header>
  )
}
