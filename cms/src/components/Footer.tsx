export function Footer() {
  return (
    <footer>
      <div className="container">
        <div className="footer-inner">
          <div className="footer-brand">
            <a href="/" className="nav-logo" style={{ display: 'inline-flex' }}>
              <img src="/icon-green.svg" alt="KomboAI" width="32" height="32" />
              KomboAI
            </a>
            <p>AI-powered sales intelligence for B2B teams. Close more deals, faster.</p>
          </div>
          <div className="footer-col">
            <h4>Product</h4>
            <ul>
              <li><a href="/features">ICP Finder</a></li>
              <li><a href="/features">Data Enrichment</a></li>
              <li><a href="/features">Dynamic Playlists</a></li>
              <li><a href="/features">Buying Signals</a></li>
              <li><a href="/features">AI Agents</a></li>
              <li><a href="/features">AI Sequencer</a></li>
              <li><a href="/how-it-works">AI Note Taker</a></li>
              <li><a href="/features">AI Coach</a></li>
              <li><a href="/crm-cleanup">CRM Cleanup</a></li>
              <li><a href="/security">Security</a></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Use Cases</h4>
            <ul>
              <li><a href="/use-cases/prospecting">Prospecting</a></li>
              <li><a href="/use-cases/signals">Act on Signals</a></li>
              <li><a href="/use-cases/inbound">Qualify Inbound</a></li>
              <li><a href="/use-cases/crm-enrichment">CRM Enrichment</a></li>
              <li><a href="/use-cases/coaching">Coach Reps</a></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Solutions</h4>
            <ul>
              <li><a href="/for-sales-reps">Sales Reps</a></li>
              <li><a href="/for-sales-leaders">Managers</a></li>
              <li><a href="/for-revenue-operations">Ops</a></li>
              <li><a href="/for-startups">Startups</a></li>
              <li><a href="/for-enterprises">Enterprise</a></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Resources</h4>
            <ul>
              <li><a href="/customers">Customers</a></li>
              <li><a href="/blog">Blog</a></li>
              <li><a href="/podcast">Podcast</a></li>
              <li><a href="/community">Community</a></li>
              <li><a href="/newsletter">Newsletter</a></li>
              <li><a href="https://resources.getkombo.ai/" rel="noopener noreferrer" target="_blank">ROI Calculator ↗</a></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Company</h4>
            <ul>
              <li><a href="/about">About</a></li>
              <li><a href="/contact">Contact</a></li>
              <li><a href="https://www.linkedin.com/company/kombo-ai/jobs/" rel="noopener noreferrer" target="_blank">Jobs ↗</a></li>
              <li><a href="https://security.getkombo.ai/" rel="noopener noreferrer" target="_blank">Trust Center ↗</a></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Connect</h4>
            <ul>
              <li><a href="https://www.linkedin.com/company/kombo-ai/" rel="noopener noreferrer" target="_blank">LinkedIn</a></li>
              <li><a href="https://www.youtube.com/@KomboAI" rel="noopener noreferrer" target="_blank">YouTube</a></li>
              <li><a href="https://www.instagram.com/kombo.ai/" rel="noopener noreferrer" target="_blank">Instagram</a></li>
              <li><a href="https://www.tiktok.com/@kombo.ai" rel="noopener noreferrer" target="_blank">TikTok</a></li>
              <li><a href="https://open.spotify.com/show/4jgyK2kED9Gv8fiqD2n1re" rel="noopener noreferrer" target="_blank">Spotify</a></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <span className="footer-copy">&copy; 2026 KomboAI. All rights reserved.</span>
          <nav className="footer-legal" aria-label="Legal">
            <a href="/terms">Terms &amp; Conditions</a>
            <a href="/privacy">Privacy Policy</a>
            <a href="/cookies">Cookie Policy</a>
            <a href="/referral">Referral Programme</a>
          </nav>
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
