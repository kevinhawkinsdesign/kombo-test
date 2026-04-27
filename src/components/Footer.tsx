export function Footer() {
  return (
    <footer>
      <div className="container">
        <div className="footer-inner">
          <div className="footer-brand">
            <a href="/" className="nav-logo" style={{ display: 'inline-flex' }}>
              <svg width="28" height="28" viewBox="0 0 30 30" fill="none">
                <rect width="30" height="30" rx="8" fill="#6366f1" />
                <path d="M9 8h3v6l5-6h4l-6 7 6 7h-4l-5-6v6H9V8z" fill="white" />
              </svg>
              KomboAI
            </a>
            <p>AI-powered sales intelligence for B2B teams. Close more deals, faster.</p>
          </div>
          <div className="footer-col">
            <h4>Product</h4>
            <ul>
              <li><a href="/features">Features</a></li>
              <li><a href="/integrations">Integrations</a></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Resources</h4>
            <ul>
              <li><a href="/customers">Customers</a></li>
              <li><a href="/podcast">Podcast</a></li>
              <li><a href="/newsletter">Newsletter</a></li>
              <li><a href="/blog">Blog</a></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Company</h4>
            <ul>
              <li><a href="/contact">Contact</a></li>
              <li><a href="/team">Team</a></li>
              <li><a href="/about">About</a></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Connect</h4>
            <ul>
              <li><a href="#">LinkedIn</a></li>
              <li><a href="#">X</a></li>
              <li><a href="#">YouTube</a></li>
              <li><a href="#">Instagram</a></li>
              <li><a href="#">TikTok</a></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Legal</h4>
            <ul>
              <li><a href="#">Terms &amp; Conditions</a></li>
              <li><a href="#">Privacy Policy</a></li>
              <li><a href="#">Referral Programme</a></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <span className="footer-copy">&copy; 2026 KomboAI. All rights reserved.</span>
          <span className="footer-lang">
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="8" cy="8" r="6" />
              <path d="M8 2a9 9 0 0 1 0 12M8 2a9 9 0 0 0 0 12M2 8h12" />
            </svg>
            English
          </span>
        </div>
      </div>
    </footer>
  )
}
