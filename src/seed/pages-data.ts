export const seedPages = [
  {
    slug: "home",
    title: "KomboAI — AI-Powered Sales Intelligence",
    bodyHtml: `<!-- MOBILE MENU -->
<div class="mobile-menu">
  <details><summary>Product</summary><div class="sub-links"><a href="/features">Features</a><a href="/integrations">Integrations</a></div></details>
  <details><summary>Resources</summary><div class="sub-links"><a href="/customers">Customers</a><a href="/podcast">Podcast</a><a href="/newsletter">Newsletter</a><a href="/blog">Blog</a></div></details>
  <details><summary>Company</summary><div class="sub-links"><a href="/contact">Contact</a><a href="/team">Team</a><a href="/about">About</a></div></details>
  <details><summary>Connect</summary><div class="sub-links"><a href="#">LinkedIn</a><a href="#">X</a><a href="#">YouTube</a><a href="#">Instagram</a><a href="#">TikTok</a></div></details>
  <a href="/contact" class="btn btn-primary mobile-btn">See a Demo</a>
</div>

<!-- HERO -->
<section class="home-hero">
  <div class="container">
    <h1>Close More Deals<br><span>With AI</span></h1>
    <p>KomboAI gives your sales team the intelligence of a 20-year veteran — at the speed of AI. Rank leads, predict pipeline, and outreach on autopilot.</p>
    <div class="home-hero-btns">
      <a href="/contact" class="btn btn-primary">See a Demo &rarr;</a>
      <a href="/features" class="btn btn-ghost">See How It Works</a>
    </div>
    <div class="home-stats">
      <div class="stat-item">
        <span class="stat-num">500+</span>
        <div class="stat-label">B2B teams</div>
      </div>
      <div class="stat-item">
        <span class="stat-num">40%</span>
        <div class="stat-label">Higher close rate</div>
      </div>
      <div class="stat-item">
        <span class="stat-num">60%</span>
        <div class="stat-label">Less manual research</div>
      </div>
      <div class="stat-item">
        <span class="stat-num">94%</span>
        <div class="stat-label">Forecast accuracy</div>
      </div>
    </div>
  </div>
</section>

<!-- LOGOS -->
<section class="logos-section">
  <div class="container">
    <p class="logos-label">Trusted by fast-growing B2B sales teams</p>
    <div class="logos-row">
      <span class="logo-pill">NovaTech Solutions</span>
      <span class="logo-pill">Meridian Group</span>
      <span class="logo-pill">ScaleUp Partners</span>
      <span class="logo-pill">Apex Revenue</span>
      <span class="logo-pill">PipelineCo</span>
    </div>
  </div>
</section>

<!-- VIDEO -->
<section style="padding:48px 0 64px;">
  <div class="container">
    <div style="position:relative;border-radius:16px;overflow:hidden;box-shadow:0 24px 64px rgba(0,0,0,.12);aspect-ratio:16/9;">
      <iframe
        src="https://www.youtube.com/embed/9Ew_VEJYm3k"
        title="KomboAI product demo"
        frameborder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowfullscreen
        style="position:absolute;inset:0;width:100%;height:100%;">
      </iframe>
    </div>
  </div>
</section>

<!-- FEATURES OVERVIEW -->
<section class="home-features surface">
  <div class="container">
    <div class="section-header">
      <span class="eyebrow">Product</span>
      <h2>Everything your team needs to win</h2>
      <p>From lead scoring to pipeline analytics — KomboAI gives your sales team an unfair advantage at every stage of the deal cycle.</p>
    </div>
    <div class="card-grid-3">
      <div class="card">
        <div class="feature-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3"/><line x1="12" y1="3" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="21"/><line x1="3" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="21" y2="12"/></svg>
        </div>
        <h3>AI Lead Scoring</h3>
        <p>Automatically rank and prioritize leads based on buying signals, engagement history, and fit — updated in real time.</p>
      </div>
      <div class="card">
        <div class="feature-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
        </div>
        <h3>Pipeline Intelligence</h3>
        <p>See the health of every deal at a glance. KomboAI flags stale opportunities and forecasts revenue with 94% accuracy.</p>
      </div>
      <div class="card">
        <div class="feature-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
        </div>
        <h3>Automated Outreach</h3>
        <p>Craft personalized email sequences powered by AI. Reach the right prospects with the right message at the right moment — at scale.</p>
      </div>
      <div class="card">
        <div class="feature-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>
        </div>
        <h3>CRM Intelligence</h3>
        <p>Sync with HubSpot or Salesforce. KomboAI enriches contacts, flags stale deals, and recommends next-best actions.</p>
      </div>
      <div class="card">
        <div class="feature-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
        </div>
        <h3>Ask KomboAI Anything</h3>
        <p>Get instant answers about your pipeline, forecasts, and deal status — all in natural language. Like a revenue analyst on speed dial.</p>
      </div>
      <div class="card">
        <div class="feature-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
        </div>
        <h3>Integrations</h3>
        <p>Connect with the tools your team already uses — HubSpot, Salesforce, Outreach, LinkedIn, and dozens more — in one click.</p>
      </div>
    </div>
    <div style="text-align:center;margin-top:36px;">
      <a href="/features" class="btn btn-primary">Explore All Features &rarr;</a>
    </div>
  </div>
</section>

<!-- TESTIMONIALS -->
<section>
  <div class="container">
    <div class="section-header">
      <span class="eyebrow">Customers</span>
      <h2>Loved by sales teams worldwide</h2>
      <p>From 5-person startups to 500-seat enterprises — teams that use KomboAI close more deals, faster.</p>
    </div>
    <div class="testimonials-grid">
      <div class="testimonial-card">
        <p class="quote-text">"Since switching to KomboAI, our reps spend 60% less time on manual lead research. Pipeline velocity has never been higher."</p>
        <div class="quote-author">
          <div class="avatar">SC</div>
          <div>
            <div class="author-name">Sarah Chen</div>
            <div class="author-title">VP of Sales, NovaTech Solutions</div>
          </div>
        </div>
      </div>
      <div class="testimonial-card">
        <p class="quote-text">"The AI lead scoring is a game-changer. We went from guessing to knowing which deals to prioritize — and our close rate jumped 40%."</p>
        <div class="quote-author">
          <div class="avatar">JW</div>
          <div>
            <div class="author-name">James Whitfield</div>
            <div class="author-title">Head of Revenue, Meridian Group</div>
          </div>
        </div>
      </div>
      <div class="testimonial-card">
        <p class="quote-text">"As a growing startup, we needed a sales tool that could scale. KomboAI's pipeline insights grew with us from 5 reps to 50."</p>
        <div class="quote-author">
          <div class="avatar">LF</div>
          <div>
            <div class="author-name">Lucia Fernández</div>
            <div class="author-title">COO, ScaleUp Partners</div>
          </div>
        </div>
      </div>
    </div>
    <div style="text-align:center;margin-top:36px;">
      <a href="/customers" class="btn btn-ghost">See All Case Studies &rarr;</a>
    </div>
  </div>
</section>

<!-- CTA -->
<section class="cta-section">
  <div class="container">
    <div class="cta-banner">
      <h2>Ready to Close More Deals<br>With AI?</h2>
      <p>Join 500+ B2B sales teams using KomboAI to hit quota faster.</p>
      <div class="cta-btns">
        <a href="/contact" class="btn btn-outline">See a Demo</a>
        <a href="/contact" class="btn btn-ghost">Contact Us</a>
      </div>
    </div>
  </div>
</section>

<!-- FOOTER -->`,
  },
  {
    slug: "about",
    title: "About — KomboAI",
    bodyHtml: `<!-- MOBILE MENU -->
<div class="mobile-menu">
  <details><summary>Product</summary><div class="sub-links"><a href="/features">Features</a><a href="/integrations">Integrations</a></div></details>
  <details><summary>Resources</summary><div class="sub-links"><a href="/customers">Customers</a><a href="/podcast">Podcast</a><a href="/newsletter">Newsletter</a><a href="/blog">Blog</a></div></details>
  <details><summary>Company</summary><div class="sub-links"><a href="/contact">Contact</a><a href="/team">Team</a><a href="/about">About</a></div></details>
  <details><summary>Connect</summary><div class="sub-links"><a href="#">LinkedIn</a><a href="#">X</a><a href="#">YouTube</a><a href="#">Instagram</a><a href="#">TikTok</a></div></details>
  <a href="/contact" class="btn btn-primary mobile-btn">See a Demo</a>
</div>

<main>

  <!-- HERO -->
  <section class="page-hero">
    <div class="container">
      <span class="eyebrow">ABOUT</span>
      <h1>We believe sales should be smarter</h1>
      <p>KomboAI was born from a simple frustration: sales teams waste too much time on the wrong leads. We're building AI that fixes that — so reps can focus on what they do best: selling.</p>
    </div>
  </section>

  <!-- MISSION / VISION -->
  <section>
    <div class="container">
      <div class="mv-grid">
        <div class="mv-card">
          <h3>Mission</h3>
          <p>Give every B2B sales rep the intelligence of a 20-year veteran and the efficiency of an AI-powered machine — without replacing the human element that closes deals.</p>
        </div>
        <div class="mv-card">
          <h3>Vision</h3>
          <p>A world where no sales rep wastes time on a deal that won't close — where AI surfaces the right lead, at the right time, with the right approach.</p>
        </div>
      </div>
    </div>
  </section>

  <!-- TIMELINE -->
  <section class="timeline-section">
    <div class="container">
      <span class="eyebrow">Our Journey</span>
      <div class="timeline">
        <div class="timeline-item">
          <div class="timeline-year">2023</div>
          <div class="timeline-content">
            <h4>KomboAI founded</h4>
            <p>Two ex-sales leaders frustrated by guesswork-driven selling.</p>
          </div>
        </div>
        <div class="timeline-item">
          <div class="timeline-year">2024</div>
          <div class="timeline-content">
            <h4>Launched AI lead scoring and personality detection</h4>
            <p>First 100 teams onboarded.</p>
          </div>
        </div>
        <div class="timeline-item">
          <div class="timeline-year">2025</div>
          <div class="timeline-content">
            <h4>HubSpot and Salesforce integrations go live</h4>
            <p>500+ B2B teams active.</p>
          </div>
        </div>
        <div class="timeline-item">
          <div class="timeline-year">2026</div>
          <div class="timeline-content">
            <h4>KomboAI 2.0</h4>
            <p>Pipeline intelligence, automated outreach, and natural-language sales assistant.</p>
          </div>
        </div>
      </div>
      <div>
        <a href="/team" class="btn btn-ghost timeline-cta">Meet the Team &rarr;</a>
      </div>
    </div>
  </section>

  <!-- CTA BANNER -->
  <section class="cta-section">
    <div class="container">
      <div class="cta-banner">
        <h2>Ready to Close More Deals<br>With AI?</h2>
        <p>Join 500+ B2B sales teams using KomboAI to hit quota faster.</p>
        <div class="cta-btns">
          <a href="/contact" class="btn btn-outline">See a Demo</a>
          <a href="/contact" class="btn btn-ghost">Contact Us</a>
        </div>
      </div>
    </div>
  </section>

</main>`,
  },
  {
    slug: "blog",
    title: "Blog — KomboAI",
    bodyHtml: `<!-- MOBILE MENU -->
<div class="mobile-menu">
  <details><summary>Product</summary><div class="sub-links"><a href="/features">Features</a><a href="/integrations">Integrations</a></div></details>
  <details><summary>Resources</summary><div class="sub-links"><a href="/customers">Customers</a><a href="/podcast">Podcast</a><a href="/newsletter">Newsletter</a><a href="/blog">Blog</a></div></details>
  <details><summary>Company</summary><div class="sub-links"><a href="/contact">Contact</a><a href="/team">Team</a><a href="/about">About</a></div></details>
  <details><summary>Connect</summary><div class="sub-links"><a href="#">LinkedIn</a><a href="#">X</a><a href="#">YouTube</a><a href="#">Instagram</a><a href="#">TikTok</a></div></details>
  <a href="/contact" class="btn btn-primary mobile-btn">See a Demo</a>
</div>

<main>

  <!-- HERO -->
  <section class="page-hero">
    <div class="container">
      <span class="eyebrow">BLOG</span>
      <h1>Insights for modern sales teams</h1>
      <p>Strategy, AI, outreach, leadership — everything your team needs to sell smarter.</p>
    </div>
  </section>

  <!-- BLOG GRID -->
  <section>
    <div class="container">
      <div class="blog-grid">

        <!-- Card 1 -->
        <div class="blog-card">
          <div class="blog-meta">
            <span class="blog-tag">Strategy</span>
            <span class="blog-read-time">7 min</span>
          </div>
          <h3>The 5 pipeline metrics every sales leader should track weekly</h3>
          <p>Most teams drown in dashboards. Here are the five numbers that actually predict revenue — and how to act on them.</p>
          <div class="blog-footer">
            <span class="blog-date">Feb 25, 2026</span>
            <a href="#" class="blog-read-link">Read &rarr;</a>
          </div>
        </div>

        <!-- Card 2 -->
        <div class="blog-card">
          <div class="blog-meta">
            <span class="blog-tag">AI</span>
            <span class="blog-read-time">9 min</span>
          </div>
          <h3>How AI lead scoring actually works (and why yours might be broken)</h3>
          <p>Not all scoring models are created equal. We break down what separates accurate predictions from expensive noise.</p>
          <div class="blog-footer">
            <span class="blog-date">Feb 20, 2026</span>
            <a href="#" class="blog-read-link">Read &rarr;</a>
          </div>
        </div>

        <!-- Card 3 -->
        <div class="blog-card">
          <div class="blog-meta">
            <span class="blog-tag">Outreach</span>
            <span class="blog-read-time">6 min</span>
          </div>
          <h3>Cold email is not dead — you're just doing it wrong</h3>
          <p>We analyzed 50,000 outbound sequences. Here's what the top 1% of emails have in common.</p>
          <div class="blog-footer">
            <span class="blog-date">Feb 15, 2026</span>
            <a href="#" class="blog-read-link">Read &rarr;</a>
          </div>
        </div>

        <!-- Card 4 -->
        <div class="blog-card">
          <div class="blog-meta">
            <span class="blog-tag">Leadership</span>
            <span class="blog-read-time">8 min</span>
          </div>
          <h3>Building a sales culture that survives the founder</h3>
          <p>What happens when the CEO stops closing deals? The best companies build systems, not dependencies.</p>
          <div class="blog-footer">
            <span class="blog-date">Feb 10, 2026</span>
            <a href="#" class="blog-read-link">Read &rarr;</a>
          </div>
        </div>

        <!-- Card 5 -->
        <div class="blog-card">
          <div class="blog-meta">
            <span class="blog-tag">Product</span>
            <span class="blog-read-time">10 min</span>
          </div>
          <h3>Inside KomboAI's personality detection engine</h3>
          <p>How we analyze thousands of behavioral patterns to predict communication preferences — and why it matters for your close rate.</p>
          <div class="blog-footer">
            <span class="blog-date">Feb 5, 2026</span>
            <a href="#" class="blog-read-link">Read &rarr;</a>
          </div>
        </div>

        <!-- Card 6 -->
        <div class="blog-card">
          <div class="blog-meta">
            <span class="blog-tag">Coaching</span>
            <span class="blog-read-time">5 min</span>
          </div>
          <h3>The one-on-one framework that turned our worst rep into our best</h3>
          <p>A structured coaching cadence that transforms performance in 90 days. Steal the template.</p>
          <div class="blog-footer">
            <span class="blog-date">Jan 30, 2026</span>
            <a href="#" class="blog-read-link">Read &rarr;</a>
          </div>
        </div>

      </div>
    </div>
  </section>

  <!-- CTA BANNER -->
  <section class="cta-section">
    <div class="container">
      <div class="cta-banner">
        <h2>Ready to Close More Deals<br>With AI?</h2>
        <p>Join 500+ B2B sales teams using KomboAI to hit quota faster.</p>
        <div class="cta-btns">
          <a href="/contact" class="btn btn-outline">See a Demo</a>
          <a href="/contact" class="btn btn-ghost">Contact Us</a>
        </div>
      </div>
    </div>
  </section>

</main>`,
  },
  {
    slug: "contact",
    title: "Contact — KomboAI",
    bodyHtml: `<!-- MOBILE MENU -->
<div class="mobile-menu">
  <details><summary>Product</summary><div class="sub-links"><a href="/features">Features</a><a href="/integrations">Integrations</a></div></details>
  <details><summary>Resources</summary><div class="sub-links"><a href="/customers">Customers</a><a href="/podcast">Podcast</a><a href="/newsletter">Newsletter</a><a href="/blog">Blog</a></div></details>
  <details><summary>Company</summary><div class="sub-links"><a href="/contact">Contact</a><a href="/team">Team</a><a href="/about">About</a></div></details>
  <details><summary>Connect</summary><div class="sub-links"><a href="#">LinkedIn</a><a href="#">X</a><a href="#">YouTube</a><a href="#">Instagram</a><a href="#">TikTok</a></div></details>
  <a href="/contact" class="btn btn-primary mobile-btn">See a Demo</a>
</div>

<main>

  <!-- HERO -->
  <section class="page-hero">
    <div class="container">
      <span class="eyebrow">CONTACT</span>
      <h1>Let's talk</h1>
      <p>Whether you're exploring KomboAI for your team or need support — we'd love to hear from you.</p>
    </div>
  </section>

  <!-- CONTACT GRID -->
  <section>
    <div class="container">
      <div class="contact-grid">

        <!-- Card 1: Book a Demo -->
        <div class="contact-card">
          <div class="contact-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="5" y1="12" x2="19" y2="12"/>
              <polyline points="12 5 19 12 12 19"/>
            </svg>
          </div>
          <h3>Book a Demo</h3>
          <p>See KomboAI in action with a personalized walkthrough tailored to your team's workflow and goals.</p>
        </div>

        <!-- Card 2: Email Us -->
        <div class="contact-card">
          <div class="contact-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
              <polyline points="22,6 12,13 2,6"/>
            </svg>
          </div>
          <h3>Email Us</h3>
          <p>Reach out at <a href="mailto:hello@getkombo.ai">hello@getkombo.ai</a> — we typically respond within a few hours.</p>
        </div>

        <!-- Card 3: Support -->
        <div class="contact-card">
          <div class="contact-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
              <polyline points="22,6 12,13 2,6"/>
            </svg>
          </div>
          <h3>Support</h3>
          <p>Having trouble with your account? Contact <strong>support@getkombo.ai</strong> and we'll sort it out.</p>
        </div>

        <!-- Card 4: Based in Europe -->
        <div class="contact-card">
          <div class="contact-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
          </div>
          <h3>Based in Europe</h3>
          <p>Serving B2B sales teams worldwide from our European headquarters. Remote-first, globally available.</p>
        </div>

      </div>
    </div>
  </section>

  <!-- CTA BANNER -->
  <section class="cta-section">
    <div class="container">
      <div class="cta-banner">
        <h2>Ready to Close More Deals<br>With AI?</h2>
        <p>Join 500+ B2B sales teams using KomboAI to hit quota faster.</p>
        <div class="cta-btns">
          <a href="/contact" class="btn btn-outline">See a Demo</a>
          <a href="/contact" class="btn btn-ghost">Contact Us</a>
        </div>
      </div>
    </div>
  </section>

</main>`,
  },
  {
    slug: "customers",
    title: "Customers — KomboAI",
    bodyHtml: `<!-- MOBILE MENU -->
<div class="mobile-menu">
  <details><summary>Product</summary><div class="sub-links"><a href="/features">Features</a><a href="/integrations">Integrations</a></div></details>
  <details><summary>Resources</summary><div class="sub-links"><a href="/customers">Customers</a><a href="/podcast">Podcast</a><a href="/newsletter">Newsletter</a><a href="/blog">Blog</a></div></details>
  <details><summary>Company</summary><div class="sub-links"><a href="/contact">Contact</a><a href="/team">Team</a><a href="/about">About</a></div></details>
  <details><summary>Connect</summary><div class="sub-links"><a href="#">LinkedIn</a><a href="#">X</a><a href="#">YouTube</a><a href="#">Instagram</a><a href="#">TikTok</a></div></details>
  <a href="/contact" class="btn btn-primary mobile-btn">See a Demo</a>
</div>

<main>

  <!-- HERO -->
  <section class="page-hero">
    <div class="container">
      <span class="eyebrow">CUSTOMERS</span>
      <h1>Learn how teams close more deals with KomboAI</h1>
      <p>From 5-person startups to 500-seat enterprises — see how B2B sales teams are selling smarter.</p>
    </div>
  </section>

  <!-- SUMMARY CASE CARDS -->
  <section>
    <div class="container">
      <div class="case-cards">

        <div class="case-card">
          <h3>NovaTech Solutions</h3>
          <p>KomboAI enables NovaTech to proactively address pipeline bottlenecks and accelerate deal flow.</p>
          <a href="#">Read case study &rarr;</a>
        </div>

        <div class="case-card">
          <h3>Meridian Group</h3>
          <p>Meridian Group uses KomboAI to predict deal outcomes and resolve forecast risks.</p>
          <a href="#">Read case study &rarr;</a>
        </div>

        <div class="case-card">
          <h3>ScaleUp Partners</h3>
          <p>KomboAI streamlines pipeline management for ScaleUp Partners as they scale.</p>
          <a href="#">Read case study &rarr;</a>
        </div>

      </div>
      <div class="see-all">
        <a href="#" class="btn btn-primary">See all Case Studies</a>
      </div>
    </div>
  </section>

  <!-- DETAILED CASE STUDIES -->
  <section>
    <div class="container">

      <!-- Case Study 1: NovaTech Solutions (normal) -->
      <div class="case-study">
        <div class="case-text">
          <span class="case-tag">SAAS &middot; SERIES B</span>
          <h2>How NovaTech Solutions uses KomboAI</h2>
          <ul class="case-points">
            <li>KomboAI helps NovaTech's sales team save significant time, freeing them up to be drivers of revenue for the rest of the company.</li>
            <li>With KomboAI, NovaTech is able to implement data-driven sales strategies in an Enterprise environment, at scale.</li>
            <li>NovaTech now has full visibility into pipeline risks and can instantly close potential gaps using KomboAI.</li>
          </ul>
          <a href="#" class="case-link">Read case study &rarr;</a>
        </div>
        <div class="quote-card">
          <div class="quote-card-header">
            <div class="quote-card-avatar">SC</div>
            <div>
              <div class="quote-card-name">Sarah Chen</div>
              <div class="quote-card-company">NovaTech Solutions</div>
            </div>
          </div>
          <blockquote>Since switching to KomboAI, our reps spend 60% less time on manual lead research. Pipeline velocity has never been higher.</blockquote>
          <div class="quote-card-attribution">Sarah Chen, VP of Sales at NovaTech Solutions</div>
        </div>
      </div>

      <!-- Case Study 2: Meridian Group (reverse) -->
      <div class="case-study reverse">
        <div class="case-text">
          <span class="case-tag">FINANCIAL SERVICES</span>
          <h2>How Meridian Group uses KomboAI</h2>
          <ul class="case-points">
            <li>Through KomboAI, Meridian discovers deal risks and gains visibility no other tool can provide.</li>
            <li>Meridian can quickly conduct pipeline reviews and transfer insights across teams.</li>
            <li>KomboAI empowers reps to easily resolve forecast inaccuracies without taking up administrative time.</li>
          </ul>
          <a href="#" class="case-link">Read case study &rarr;</a>
        </div>
        <div class="quote-card">
          <div class="quote-card-header">
            <div class="quote-card-avatar">JW</div>
            <div>
              <div class="quote-card-name">James Whitfield</div>
              <div class="quote-card-company">Meridian Group</div>
            </div>
          </div>
          <blockquote>The AI lead scoring is a game-changer. We went from guessing to knowing which deals to prioritize — and our close rate jumped 40%.</blockquote>
          <div class="quote-card-attribution">James Whitfield, Head of Revenue at Meridian Group</div>
        </div>
      </div>

      <!-- Case Study 3: ScaleUp Partners (normal) -->
      <div class="case-study">
        <div class="case-text">
          <span class="case-tag">CONSULTING</span>
          <h2>How ScaleUp Partners uses KomboAI</h2>
          <ul class="case-points">
            <li>KomboAI makes pipeline reviews four times more productive and successful for ScaleUp Partners.</li>
            <li>ScaleUp can safeguard deal progression with ease, with more visibility and control than ever before.</li>
            <li>Bulk pipeline changes on upwards of a thousand deals are completed in hours using KomboAI.</li>
          </ul>
          <a href="#" class="case-link">Read case study &rarr;</a>
        </div>
        <div class="quote-card">
          <div class="quote-card-header">
            <div class="quote-card-avatar">LF</div>
            <div>
              <div class="quote-card-name">Lucia Fern&#225;ndez</div>
              <div class="quote-card-company">ScaleUp Partners</div>
            </div>
          </div>
          <blockquote>As a growing startup, we needed a sales tool that could scale. KomboAI's pipeline insights grew with us from 5 reps to 50.</blockquote>
          <div class="quote-card-attribution">Lucia Fern&#225;ndez, COO at ScaleUp Partners</div>
        </div>
      </div>

    </div>
  </section>

  <!-- CTA BANNER -->
  <section class="cta-section">
    <div class="container">
      <div class="cta-banner">
        <h2>Ready to Close More Deals<br>With AI?</h2>
        <p>Join 500+ B2B sales teams using KomboAI to hit quota faster.</p>
        <div class="cta-btns">
          <a href="/contact" class="btn btn-outline">See a Demo</a>
          <a href="/contact" class="btn btn-ghost">Contact Us</a>
        </div>
      </div>
    </div>
  </section>

</main>`,
  },
  {
    slug: "features",
    title: "Features — KomboAI",
    bodyHtml: `<!-- MOBILE MENU -->
<div class="mobile-menu">
  <details><summary>Product</summary><div class="sub-links"><a href="/features">Features</a><a href="/integrations">Integrations</a></div></details>
  <details><summary>Resources</summary><div class="sub-links"><a href="/customers">Customers</a><a href="/podcast">Podcast</a><a href="/newsletter">Newsletter</a><a href="/blog">Blog</a></div></details>
  <details><summary>Company</summary><div class="sub-links"><a href="/contact">Contact</a><a href="/team">Team</a><a href="/about">About</a></div></details>
  <details><summary>Connect</summary><div class="sub-links"><a href="#">LinkedIn</a><a href="#">X</a><a href="#">YouTube</a><a href="#">Instagram</a><a href="#">TikTok</a></div></details>
  <a href="/contact" class="btn btn-primary mobile-btn">See a Demo</a>
</div>

<main>

  <!-- HERO -->
  <section class="page-hero">
    <div class="container">
      <span class="eyebrow">FEATURES</span>
      <h1>Everything your team needs to win</h1>
      <p>From lead scoring to pipeline analytics — KomboAI gives your sales team an unfair advantage at every stage of the deal cycle.</p>
      <a href="/contact" class="btn btn-primary">See a Demo &rarr;</a>
    </div>
  </section>

  <!-- FEATURE ROWS -->
  <section>
    <div class="container">

      <!-- 1. AI Lead Scoring (normal) -->
      <div class="feature-row">
        <div class="feature-text">
          <div class="feature-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <circle cx="12" cy="12" r="6"/>
              <circle cx="12" cy="12" r="2"/>
            </svg>
          </div>
          <h2>AI Lead Scoring</h2>
          <p>Automatically rank and prioritize leads based on buying signals, engagement history, and fit. Your reps focus on deals that actually close.</p>
          <p>Our scoring model analyzes 100+ signals per prospect — from email opens to LinkedIn activity to technographic data — and updates in real time.</p>
        </div>
        <div class="feature-visual"></div>
      </div>

      <!-- 2. Pipeline Intelligence (reverse) -->
      <div class="feature-row reverse">
        <div class="feature-text">
          <div class="feature-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="20" x2="18" y2="10"/>
              <line x1="12" y1="20" x2="12" y2="4"/>
              <line x1="6" y1="20" x2="6" y2="14"/>
            </svg>
          </div>
          <h2>Pipeline Intelligence</h2>
          <p>See the health of every deal at a glance. KomboAI flags stale opportunities, highlights momentum shifts, and forecasts revenue with 94% accuracy.</p>
          <p>Built on thousands of closed-won and closed-lost patterns, our pipeline engine learns your team's selling rhythms and adapts weekly.</p>
        </div>
        <div class="feature-visual"></div>
      </div>

      <!-- 3. Automated Outreach (normal) -->
      <div class="feature-row">
        <div class="feature-text">
          <div class="feature-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
          </div>
          <h2>Automated Outreach</h2>
          <p>Craft personalized email sequences powered by AI. Reach the right prospects with the right message at the right moment — at scale.</p>
          <p>Dynamic personalization pulls from CRM data, recent news, and social signals. Every email feels handwritten.</p>
        </div>
        <div class="feature-visual"></div>
      </div>

      <!-- 4. CRM Intelligence (reverse) -->
      <div class="feature-row reverse">
        <div class="feature-text">
          <div class="feature-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-5 0v-15A2.5 2.5 0 0 1 9.5 2z"/>
              <path d="M14.5 8A2.5 2.5 0 0 1 17 10.5v9a2.5 2.5 0 0 1-5 0v-9A2.5 2.5 0 0 1 14.5 8z"/>
              <circle cx="5" cy="17" r="2.5"/>
            </svg>
          </div>
          <h2>CRM Intelligence</h2>
          <p>Sync with HubSpot or Salesforce. KomboAI enriches contacts, flags stale deals, and recommends next-best actions for every opportunity.</p>
          <p>Two-way sync means your CRM is always up to date. No more manual data entry or missing follow-ups.</p>
        </div>
        <div class="feature-visual"></div>
      </div>

      <!-- 5. Ask KomboAI Anything (normal) -->
      <div class="feature-row">
        <div class="feature-text">
          <div class="feature-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
            </svg>
          </div>
          <h2>Ask KomboAI Anything</h2>
          <p>Get instant answers about your pipeline, forecasts, and deal status — all in natural language. Like having a revenue analyst on speed dial.</p>
          <p>Ask questions like "Which deals close this quarter?" or "Show me top performance trends" and get visual, actionable answers in seconds.</p>
        </div>
        <div class="feature-visual"></div>
      </div>

    </div>
  </section>

  <!-- CTA BANNER -->
  <section class="cta-section">
    <div class="container">
      <div class="cta-banner">
        <h2>Ready to Close More Deals<br>With AI?</h2>
        <p>Join 500+ B2B sales teams using KomboAI to hit quota faster.</p>
        <div class="cta-btns">
          <a href="/contact" class="btn btn-outline">See a Demo</a>
          <a href="/contact" class="btn btn-ghost">Contact Us</a>
        </div>
      </div>
    </div>
  </section>

</main>`,
  },
  {
    slug: "integrations",
    title: "Integrations — KomboAI",
    bodyHtml: `<!-- MOBILE MENU -->
<div class="mobile-menu">
  <details><summary>Product</summary><div class="sub-links"><a href="/features">Features</a><a href="/integrations">Integrations</a></div></details>
  <details><summary>Resources</summary><div class="sub-links"><a href="/customers">Customers</a><a href="/podcast">Podcast</a><a href="/newsletter">Newsletter</a><a href="/blog">Blog</a></div></details>
  <details><summary>Company</summary><div class="sub-links"><a href="/contact">Contact</a><a href="/team">Team</a><a href="/about">About</a></div></details>
  <details><summary>Connect</summary><div class="sub-links"><a href="#">LinkedIn</a><a href="#">X</a><a href="#">YouTube</a><a href="#">Instagram</a><a href="#">TikTok</a></div></details>
  <a href="/contact" class="btn btn-primary mobile-btn">See a Demo</a>
</div>

<main>

  <!-- HERO -->
  <section class="page-hero">
    <div class="container">
      <span class="eyebrow">INTEGRATIONS</span>
      <h1>Connect the tools your team already uses</h1>
      <p>KomboAI syncs seamlessly with your existing stack. Set up in minutes, not weeks.</p>
    </div>
  </section>

  <!-- INTEGRATIONS -->
  <section>
    <div class="container">

      <!-- CRM -->
      <div class="int-section">
        <h3>CRM</h3>
        <div class="int-grid">
          <div class="int-card">
            <div class="int-logo">HS</div>
            <div>
              <div class="int-name">HubSpot</div>
              <div class="int-desc">Two-way sync for contacts, deals, and activities.</div>
            </div>
          </div>
          <div class="int-card">
            <div class="int-logo">SF</div>
            <div>
              <div class="int-name">Salesforce</div>
              <div class="int-desc">Enterprise-grade sync with full pipeline visibility.</div>
            </div>
          </div>
          <div class="int-card">
            <div class="int-logo">PD</div>
            <div>
              <div class="int-name">Pipedrive</div>
              <div class="int-desc">Lightweight CRM sync for fast-moving teams.</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Outreach & Email -->
      <div class="int-section">
        <h3>Outreach &amp; Email</h3>
        <div class="int-grid">
          <div class="int-card">
            <div class="int-logo">Ou</div>
            <div>
              <div class="int-name">Outreach</div>
              <div class="int-desc">Sync sequences and engagement signals.</div>
            </div>
          </div>
          <div class="int-card">
            <div class="int-logo">SL</div>
            <div>
              <div class="int-name">Salesloft</div>
              <div class="int-desc">Bi-directional cadence and call data sync.</div>
            </div>
          </div>
          <div class="int-card">
            <div class="int-logo">Gm</div>
            <div>
              <div class="int-name">Gmail</div>
              <div class="int-desc">Log emails and track opens automatically.</div>
            </div>
          </div>
          <div class="int-card">
            <div class="int-logo">Ou</div>
            <div>
              <div class="int-name">Outlook</div>
              <div class="int-desc">Full calendar and email integration.</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Data & Enrichment -->
      <div class="int-section">
        <h3>Data &amp; Enrichment</h3>
        <div class="int-grid">
          <div class="int-card">
            <div class="int-logo">LI</div>
            <div>
              <div class="int-name">LinkedIn Sales Navigator</div>
              <div class="int-desc">Import prospects and signal data.</div>
            </div>
          </div>
          <div class="int-card">
            <div class="int-logo">Cl</div>
            <div>
              <div class="int-name">Clearbit</div>
              <div class="int-desc">Enrich contacts with firmographic data.</div>
            </div>
          </div>
          <div class="int-card">
            <div class="int-logo">ZI</div>
            <div>
              <div class="int-name">ZoomInfo</div>
              <div class="int-desc">Access 300M+ verified business contacts.</div>
            </div>
          </div>
        </div>
      </div>

    </div>
  </section>

  <!-- CTA BANNER -->
  <section class="cta-section">
    <div class="container">
      <div class="cta-banner">
        <h2>Ready to Close More Deals<br>With AI?</h2>
        <p>Join 500+ B2B sales teams using KomboAI to hit quota faster.</p>
        <div class="cta-btns">
          <a href="/contact" class="btn btn-outline">See a Demo</a>
          <a href="/contact" class="btn btn-ghost">Contact Us</a>
        </div>
      </div>
    </div>
  </section>

</main>`,
  },
  {
    slug: "newsletter",
    title: "Newsletter — KomboAI",
    bodyHtml: `<!-- MOBILE MENU -->
<div class="mobile-menu">
  <details><summary>Product</summary><div class="sub-links"><a href="/features">Features</a><a href="/integrations">Integrations</a></div></details>
  <details><summary>Resources</summary><div class="sub-links"><a href="/customers">Customers</a><a href="/podcast">Podcast</a><a href="/newsletter">Newsletter</a><a href="/blog">Blog</a></div></details>
  <details><summary>Company</summary><div class="sub-links"><a href="/contact">Contact</a><a href="/team">Team</a><a href="/about">About</a></div></details>
  <details><summary>Connect</summary><div class="sub-links"><a href="#">LinkedIn</a><a href="#">X</a><a href="#">YouTube</a><a href="#">Instagram</a><a href="#">TikTok</a></div></details>
  <a href="/contact" class="btn btn-primary mobile-btn">See a Demo</a>
</div>

<main>

  <!-- HERO -->
  <section class="page-hero">
    <div class="container">
      <div class="hero-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="2" y="4" width="20" height="16" rx="2"/>
          <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
        </svg>
      </div>
      <span class="eyebrow">NEWSLETTER</span>
      <h1>B2B sales insights, weekly</h1>
      <p>Actionable strategies, deal teardowns, and AI-powered selling tips — delivered every Friday. Trusted by 2,000+ sales professionals.</p>
      <form class="nl-form" onsubmit="return false;">
        <input type="email" placeholder="Your email address" required />
        <button type="submit" class="btn btn-primary">Subscribe</button>
      </form>
    </div>
  </section>

  <!-- PAST ISSUES -->
  <section>
    <div class="container">
      <h2 style="margin-bottom:24px;font-size:1.25rem;font-weight:700;">Past Issues</h2>
      <div class="issues-list">
        <div class="issue-row">
          <span class="issue-title">Why your pipeline forecast is lying to you</span>
          <span class="issue-meta">Feb 21, 2026 &middot; 4 min</span>
        </div>
        <div class="issue-row">
          <span class="issue-title">The 3 signals that predict a deal will close</span>
          <span class="issue-meta">Feb 14, 2026 &middot; 5 min</span>
        </div>
        <div class="issue-row">
          <span class="issue-title">How top reps handle the 'send me pricing' objection</span>
          <span class="issue-meta">Feb 7, 2026 &middot; 3 min</span>
        </div>
        <div class="issue-row">
          <span class="issue-title">AI in sales: what works, what's hype, what's next</span>
          <span class="issue-meta">Jan 31, 2026 &middot; 6 min</span>
        </div>
        <div class="issue-row">
          <span class="issue-title">Building a sales culture that retains A-players</span>
          <span class="issue-meta">Jan 24, 2026 &middot; 4 min</span>
        </div>
        <div class="issue-row">
          <span class="issue-title">Cold email teardown: 5 real sequences that convert</span>
          <span class="issue-meta">Jan 17, 2026 &middot; 5 min</span>
        </div>
      </div>
    </div>
  </section>

  <!-- CTA BANNER -->
  <section class="cta-section">
    <div class="container">
      <div class="cta-banner">
        <h2>Ready to Close More Deals<br>With AI?</h2>
        <p>Join 500+ B2B sales teams using KomboAI to hit quota faster.</p>
        <div class="cta-btns">
          <a href="/contact" class="btn btn-outline">See a Demo</a>
          <a href="/contact" class="btn btn-ghost">Contact Us</a>
        </div>
      </div>
    </div>
  </section>

</main>`,
  },
  {
    slug: "podcast",
    title: "Podcast — KomboAI",
    bodyHtml: `<!-- MOBILE MENU -->
<div class="mobile-menu">
  <details><summary>Product</summary><div class="sub-links"><a href="/features">Features</a><a href="/integrations">Integrations</a></div></details>
  <details><summary>Resources</summary><div class="sub-links"><a href="/customers">Customers</a><a href="/podcast">Podcast</a><a href="/newsletter">Newsletter</a><a href="/blog">Blog</a></div></details>
  <details><summary>Company</summary><div class="sub-links"><a href="/contact">Contact</a><a href="/team">Team</a><a href="/about">About</a></div></details>
  <details><summary>Connect</summary><div class="sub-links"><a href="#">LinkedIn</a><a href="#">X</a><a href="#">YouTube</a><a href="#">Instagram</a><a href="#">TikTok</a></div></details>
  <a href="/contact" class="btn btn-primary mobile-btn">See a Demo</a>
</div>

<main>

  <!-- HERO -->
  <section class="page-hero">
    <div class="container">
      <div class="hero-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/>
          <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
          <line x1="12" y1="19" x2="12" y2="22"/>
          <line x1="8" y1="22" x2="16" y2="22"/>
        </svg>
      </div>
      <span class="eyebrow">THE SALES PODCAST</span>
      <h1>Learn to sell better</h1>
      <p>Ignacio Gaminde (co-founder of Kombo, former sales director) and guests help you grow your career in B2B sales. Episodes include insights and strategies from the field.</p>
      <div class="podcast-btns">
        <a href="#" class="btn btn-outline" style="display:inline-flex;align-items:center;gap:8px;">
          <span class="play-icon"><svg viewBox="0 0 10 10" fill="currentColor"><polygon points="2,1 9,5 2,9"/></svg></span>
          Watch &amp; Listen on Spotify
        </a>
        <a href="#" class="btn btn-outline" style="display:inline-flex;align-items:center;gap:8px;">
          <span class="play-icon"><svg viewBox="0 0 10 10" fill="currentColor"><polygon points="2,1 9,5 2,9"/></svg></span>
          Watch &amp; Listen on YouTube
        </a>
      </div>
    </div>
  </section>

  <!-- RECENT EPISODES -->
  <section>
    <div class="container">
      <div class="episodes-label">Recent Episodes</div>
      <div class="card-grid-3">

        <!-- Episode 1 -->
        <div class="card">
          <div class="ep-thumb">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/>
              <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
              <line x1="12" y1="19" x2="12" y2="22"/>
              <line x1="8" y1="22" x2="16" y2="22"/>
            </svg>
          </div>
          <div class="blog-meta">
            <span class="blog-tag">Sales</span>
            <span class="blog-read-time">8 min read</span>
          </div>
          <h3>Ten strategies for leading remote sales teams</h3>
          <p>Build trust and momentum when your team works across distances and time zones.</p>
          <a href="#" class="blog-read-link">Read more &#8599;</a>
        </div>

        <!-- Episode 2 -->
        <div class="card">
          <div class="ep-thumb">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/>
              <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
              <line x1="12" y1="19" x2="12" y2="22"/>
              <line x1="8" y1="22" x2="16" y2="22"/>
            </svg>
          </div>
          <div class="blog-meta">
            <span class="blog-tag">Coaching</span>
            <span class="blog-read-time">6 min read</span>
          </div>
          <h3>Setting winning sales goals and making them stick</h3>
          <p>Purpose-driven objectives sharpen focus and drive the results that matter most.</p>
          <a href="#" class="blog-read-link">Read more &#8599;</a>
        </div>

        <!-- Episode 3 -->
        <div class="card">
          <div class="ep-thumb">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/>
              <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
              <line x1="12" y1="19" x2="12" y2="22"/>
              <line x1="8" y1="22" x2="16" y2="22"/>
            </svg>
          </div>
          <div class="blog-meta">
            <span class="blog-tag">Leadership</span>
            <span class="blog-read-time">7 min read</span>
          </div>
          <h3>How neuroscience shapes better sales decisions</h3>
          <p>Understand the brain's role in persuasion and learn to influence with science.</p>
          <a href="#" class="blog-read-link">Read more &#8599;</a>
        </div>

      </div>
      <div style="text-align:center;margin-top:32px;">
        <a href="#" class="btn btn-ghost">View all</a>
      </div>
    </div>
  </section>

  <!-- NEWSLETTER SIGNUP -->
  <section style="border-top:1px solid var(--border);padding:72px 0;">
    <div class="container">
      <div class="pod-nl">
        <div>
          <h2>The KomboAI Newsletter</h2>
          <p style="color:var(--muted);">Join thousands of subscribers</p>
        </div>
        <div>
          <p style="margin-bottom:20px;color:var(--muted);">Join our weekly email for B2B sales insights aimed at enhancing your career and work quality. Plus, subscribe now to receive actionable strategies from Ignacio and guests on stepping into sales leadership.</p>
          <form class="nl-form" onsubmit="return false;">
            <input type="email" placeholder="Your email address" required />
            <button type="submit" class="btn btn-primary">Subscribe</button>
          </form>
        </div>
      </div>
    </div>
  </section>

  <!-- CTA BANNER -->
  <section class="cta-section">
    <div class="container">
      <div class="cta-banner">
        <h2>Ready to Close More Deals<br>With AI?</h2>
        <p>Join 500+ B2B sales teams using KomboAI to hit quota faster.</p>
        <div class="cta-btns">
          <a href="/contact" class="btn btn-outline">See a Demo</a>
          <a href="/contact" class="btn btn-ghost">Contact Us</a>
        </div>
      </div>
    </div>
  </section>

</main>`,
  },
  {
    slug: "team",
    title: "Team — KomboAI",
    bodyHtml: `<!-- MOBILE MENU -->
<div class="mobile-menu">
  <details><summary>Product</summary><div class="sub-links"><a href="/features">Features</a><a href="/integrations">Integrations</a></div></details>
  <details><summary>Resources</summary><div class="sub-links"><a href="/customers">Customers</a><a href="/podcast">Podcast</a><a href="/newsletter">Newsletter</a><a href="/blog">Blog</a></div></details>
  <details><summary>Company</summary><div class="sub-links"><a href="/contact">Contact</a><a href="/team">Team</a><a href="/about">About</a></div></details>
  <details><summary>Connect</summary><div class="sub-links"><a href="#">LinkedIn</a><a href="#">X</a><a href="#">YouTube</a><a href="#">Instagram</a><a href="#">TikTok</a></div></details>
  <a href="/contact" class="btn btn-primary mobile-btn">See a Demo</a>
</div>

<main>

  <!-- HERO -->
  <section class="page-hero">
    <div class="container">
      <span class="eyebrow">TEAM</span>
      <h1>The people behind KomboAI</h1>
      <p>A small team of sales practitioners and engineers building the AI tools we wished we had.</p>
    </div>
  </section>

  <!-- TEAM GRID -->
  <section>
    <div class="container">
      <div class="card-grid-2">

        <!-- Ignacio Gaminde -->
        <div class="card team-card">
          <div class="team-avatar">I</div>
          <h3>Ignacio Gaminde</h3>
          <span class="team-role">Co-Founder &amp; CEO</span>
          <p>Former Sales Director with 10+ years in B2B. Built and scaled sales teams across Europe and LATAM. Obsessed with making reps more effective through AI.</p>
          <a href="#" class="team-linkedin">
            <svg viewBox="0 0 16 16" fill="currentColor" width="14" height="14"><path d="M0 1.146C0 .513.526 0 1.175 0h13.65C15.474 0 16 .513 16 1.146v13.708c0 .633-.526 1.146-1.175 1.146H1.175C.526 16 0 15.487 0 14.854V1.146zm4.943 12.248V6.169H2.542v7.225h2.401zm-1.2-8.212c.837 0 1.358-.554 1.358-1.248-.015-.709-.52-1.248-1.342-1.248-.822 0-1.359.54-1.359 1.248 0 .694.521 1.248 1.327 1.248h.016zm4.908 8.212V9.359c0-.216.016-.432.08-.586.173-.431.568-.878 1.232-.878.869 0 1.216.662 1.216 1.634v3.865h2.401V9.25c0-2.22-1.184-3.252-2.764-3.252-1.274 0-1.845.7-2.165 1.193v.025h-.016a5.54 5.54 0 0 1 .016-.025V6.169h-2.4c.03.678 0 7.225 0 7.225h2.4z"/></svg>
            LinkedIn
          </a>
        </div>

        <!-- Co-Founder & CTO -->
        <div class="card team-card">
          <div class="team-avatar">C</div>
          <h3>Co-Founder &amp; CTO</h3>
          <span class="team-role">Co-Founder &amp; CTO</span>
          <p>Engineering leader with deep expertise in machine learning and NLP. Previously built ML pipelines processing millions of data points daily.</p>
          <a href="#" class="team-linkedin">
            <svg viewBox="0 0 16 16" fill="currentColor" width="14" height="14"><path d="M0 1.146C0 .513.526 0 1.175 0h13.65C15.474 0 16 .513 16 1.146v13.708c0 .633-.526 1.146-1.175 1.146H1.175C.526 16 0 15.487 0 14.854V1.146zm4.943 12.248V6.169H2.542v7.225h2.401zm-1.2-8.212c.837 0 1.358-.554 1.358-1.248-.015-.709-.52-1.248-1.342-1.248-.822 0-1.359.54-1.359 1.248 0 .694.521 1.248 1.327 1.248h.016zm4.908 8.212V9.359c0-.216.016-.432.08-.586.173-.431.568-.878 1.232-.878.869 0 1.216.662 1.216 1.634v3.865h2.401V9.25c0-2.22-1.184-3.252-2.764-3.252-1.274 0-1.845.7-2.165 1.193v.025h-.016a5.54 5.54 0 0 1 .016-.025V6.169h-2.4c.03.678 0 7.225 0 7.225h2.4z"/></svg>
            LinkedIn
          </a>
        </div>

        <!-- Head of Product -->
        <div class="card team-card">
          <div class="team-avatar">H</div>
          <h3>Head of Product</h3>
          <span class="team-role">Head of Product</span>
          <p>Product strategist who's shipped tools used by thousands of sales professionals. Bridges the gap between AI capability and rep usability.</p>
          <a href="#" class="team-linkedin">
            <svg viewBox="0 0 16 16" fill="currentColor" width="14" height="14"><path d="M0 1.146C0 .513.526 0 1.175 0h13.65C15.474 0 16 .513 16 1.146v13.708c0 .633-.526 1.146-1.175 1.146H1.175C.526 16 0 15.487 0 14.854V1.146zm4.943 12.248V6.169H2.542v7.225h2.401zm-1.2-8.212c.837 0 1.358-.554 1.358-1.248-.015-.709-.52-1.248-1.342-1.248-.822 0-1.359.54-1.359 1.248 0 .694.521 1.248 1.327 1.248h.016zm4.908 8.212V9.359c0-.216.016-.432.08-.586.173-.431.568-.878 1.232-.878.869 0 1.216.662 1.216 1.634v3.865h2.401V9.25c0-2.22-1.184-3.252-2.764-3.252-1.274 0-1.845.7-2.165 1.193v.025h-.016a5.54 5.54 0 0 1 .016-.025V6.169h-2.4c.03.678 0 7.225 0 7.225h2.4z"/></svg>
            LinkedIn
          </a>
        </div>

        <!-- Head of Growth -->
        <div class="card team-card">
          <div class="team-avatar">H</div>
          <h3>Head of Growth</h3>
          <span class="team-role">Head of Growth</span>
          <p>Growth operator who's helped multiple B2B SaaS companies scale from seed to Series B. Data-driven and customer-obsessed.</p>
          <a href="#" class="team-linkedin">
            <svg viewBox="0 0 16 16" fill="currentColor" width="14" height="14"><path d="M0 1.146C0 .513.526 0 1.175 0h13.65C15.474 0 16 .513 16 1.146v13.708c0 .633-.526 1.146-1.175 1.146H1.175C.526 16 0 15.487 0 14.854V1.146zm4.943 12.248V6.169H2.542v7.225h2.401zm-1.2-8.212c.837 0 1.358-.554 1.358-1.248-.015-.709-.52-1.248-1.342-1.248-.822 0-1.359.54-1.359 1.248 0 .694.521 1.248 1.327 1.248h.016zm4.908 8.212V9.359c0-.216.016-.432.08-.586.173-.431.568-.878 1.232-.878.869 0 1.216.662 1.216 1.634v3.865h2.401V9.25c0-2.22-1.184-3.252-2.764-3.252-1.274 0-1.845.7-2.165 1.193v.025h-.016a5.54 5.54 0 0 1 .016-.025V6.169h-2.4c.03.678 0 7.225 0 7.225h2.4z"/></svg>
            LinkedIn
          </a>
        </div>

      </div>
    </div>
  </section>

  <!-- CTA BANNER -->
  <section class="cta-section">
    <div class="container">
      <div class="cta-banner">
        <h2>Ready to Close More Deals<br>With AI?</h2>
        <p>Join 500+ B2B sales teams using KomboAI to hit quota faster.</p>
        <div class="cta-btns">
          <a href="/contact" class="btn btn-outline">See a Demo</a>
          <a href="/contact" class="btn btn-ghost">Contact Us</a>
        </div>
      </div>
    </div>
  </section>

</main>`,
  },
];
