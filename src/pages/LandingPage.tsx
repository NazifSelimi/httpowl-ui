/**
 * Marketing page: hero with a demo live feed, features, the daily note,
 * connection options, pricing and a final call to action.
 * Copy and demo rows live in features/landing/content.ts.
 */

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CONNECTIONS, DEMO_REQUESTS, FEATURES, INTEGRATIONS, PLANS } from '@/features/landing/content';
import { OwlMark } from '@/components/layout/Brand';
import { ArrowDownRight, ArrowRight, ArrowUpRight, Check, ChevronRight, Globe2, LockKeyhole, Menu, RotateCcw, Shield, X } from 'lucide-react';

/** "Get started" → the sign-up page with the email already filled in. */
function SignupForm({ compact = false }: { compact?: boolean }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const id = compact ? 'email-bottom' : 'email-top';
  return (
    <form
      className={`signup-form${compact ? ' signup-form-compact' : ''}`}
      onSubmit={(event) => {
        event.preventDefault();
        navigate(`/signup?email=${encodeURIComponent(email)}`);
      }}
    >
      <label className="sr-only" htmlFor={id}>
        Your email address
      </label>
      <input id={id} type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@yourwebsite.com" required />
      <button className="button button-amber" type="submit">
        Get started free <ArrowRight size={16} />
      </button>
    </form>
  );
}

function LiveFeed() {
  const [blocked, setBlocked] = useState(false);
  return (
    <div className="console-wrap" aria-label="Example live request dashboard">
      <div className="console-top">
        <div className="window-dots">
          <i />
          <i />
          <i />
        </div>
        <span className="console-site">
          <span className="status-dot" /> yourstore.com
        </span>
        <span className="live-label">
          <span className="live-pulse" /> LIVE
        </span>
      </div>
      <div className="console-stats">
        <div>
          <span>Requests today</span>
          <strong>
            12,408 <small className="positive">↗ 18%</small>
          </strong>
        </div>
        <div>
          <span>Blocked threats</span>
          <strong className="amber-text">23</strong>
        </div>
        <div>
          <span>Visitors now</span>
          <strong>08</strong>
        </div>
      </div>
      <div className="feed-head">
        <span>TIME</span>
        <span>REQUEST</span>
        <span>VISITOR</span>
        <span>STATUS</span>
      </div>
      <div className="feed-rows">
        {DEMO_REQUESTS.map((request, index) => (
          <div className="feed-row" key={`${request.time}-${request.path}`} style={{ animationDelay: `${index * 0.12}s` }}>
            <span className="mono feed-time">{request.time}</span>
            <span className="feed-path">
              <b className="mono">{request.method}</b>
              {request.path}
            </span>
            <span className={`kind kind-${request.tone}`}>
              <i />
              {request.kind}
            </span>
            <span className={`code code-${request.tone}`}>{request.code}</span>
          </div>
        ))}
      </div>
      <div className={`alert-card${blocked ? ' alert-blocked' : ''}`}>
        <span className="alert-icon">
          <Shield size={17} />
        </span>
        <div className="alert-copy">
          <strong>{blocked ? 'That IP is blocked.' : 'One IP is trying to guess your admin password'}</strong>
          <span>{blocked ? 'You can undo this anytime.' : '185.220.101.42 · 38 attempts in 2 minutes'}</span>
        </div>
        <button
          onClick={() => setBlocked(!blocked)}
          className={blocked ? 'undo-button' : 'block-button'}
          aria-label={blocked ? 'Undo IP block' : 'Block suspicious IP'}
        >
          {blocked ? (
            <>
              <RotateCcw size={14} /> Undo
            </>
          ) : (
            <>
              Block <ArrowUpRight size={14} />
            </>
          )}
        </button>
      </div>
      <div className="console-foot">
        <span>
          <span className="status-dot" /> All systems protected
        </span>
        <span>Updated just now</span>
      </div>
    </div>
  );
}

function Header() {
  const [open, setOpen] = useState(false);
  const links = [
    ['Features', '#features'],
    ['How it connects', '#connect'],
    ['Works with', '#works-with'],
    ['Pricing', '#pricing'],
  ];
  return (
    <header className="site-header">
      <a className="brand" href="#top" aria-label="HTTPowl home">
        <OwlMark />
        <span>
          httpowl<span className="brand-dot">.</span>
        </span>
      </a>
      <button className="mobile-menu" onClick={() => setOpen(!open)} aria-label={open ? 'Close navigation' : 'Open navigation'} aria-expanded={open}>
        {open ? <X /> : <Menu />}
      </button>
      <nav className={open ? 'nav-links nav-open' : 'nav-links'} aria-label="Main navigation">
        {links.map(([label, href]) => (
          <a key={label} href={href} onClick={() => setOpen(false)}>
            {label}
          </a>
        ))}
        <Link className="nav-signin" to="/login">
          Sign in
        </Link>
        <a className="button button-small button-amber" href="#early-access">
          Get early access <ArrowRight size={14} />
        </a>
      </nav>
    </header>
  );
}

function Hero() {
  return (
    <section className="hero section-shell" id="top">
      <div className="hero-copy">
        <div className="eyebrow">
          <span className="eyebrow-line" /> YOUR WEBSITE, WITH ITS EYES OPEN
        </div>
        <h1>
          See every request.
          <br />
          <span>Stop the bad ones.</span>
        </h1>
        <p className="hero-subtitle">A clear view of who&apos;s visiting your website — and a simple way to show the troublemakers the door.</p>
        <SignupForm />
        <div className="trust-points">
          <span>
            <Check /> Free for 1 website
          </span>
          <span>
            <Check /> Set up in 2 minutes
          </span>
          <span>
            <Check /> No code needed
          </span>
        </div>
      </div>
      <LiveFeed />
      <div className="hero-bottom-note">
        <span className="mono">01 / ALWAYS ON WATCH</span>
        <span>Protection that makes sense, right from day one.</span>
      </div>
    </section>
  );
}

function WorksWith() {
  return (
    <section className="works section-shell" id="works-with">
      <div className="section-kicker">PLAYS WELL WITH YOUR SETUP</div>
      <div className="works-content">
        <p>
          Already running a website?
          <br />
          <span>HTTPowl fits right in.</span>
        </p>
        <div className="tech-list">
          {INTEGRATIONS.map((item, i) => (
            <span key={item} className={`tech tech-${i}`}>
              {item}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

function Features() {
  return (
    <section className="section-shell section-block" id="features">
      <div className="section-heading">
        <div>
          <div className="section-kicker">A LITTLE MORE PEACE OF MIND</div>
          <h2>
            Your website, <span>translated.</span>
          </h2>
        </div>
        <p>All the visibility you need. None of the complexity you don&apos;t.</p>
      </div>
      <div className="feature-grid">
        {FEATURES.map(({ n, icon: Icon, title, desc }) => (
          <article className="feature-card" key={title}>
            <div className="feature-top">
              <span className="feature-icon">
                <Icon />
              </span>
              <span className="mono feature-num">{n}</span>
            </div>
            <h3>{title}</h3>
            <p>{desc}</p>
            <span className="feature-line" />
          </article>
        ))}
      </div>
    </section>
  );
}

function DailyNote() {
  return (
    <section className="note-section section-shell">
      <div className="note-intro">
        <div className="section-kicker">THE DAILY OWL NOTE</div>
        <h2>
          It talks like
          <br />
          <span>a person.</span>
        </h2>
        <p>No charts to decode. Just a helpful heads-up about what happened while you were busy.</p>
        <a className="text-link" href="#early-access">
          Get the whole picture <ArrowRight size={16} />
        </a>
      </div>
      <div className="note-card">
        <div className="note-card-head">
          <span>
            <OwlMark /> Your morning website note
          </span>
          <span className="mono">TODAY · 8:00 AM</span>
        </div>
        <div className="note-item">
          <span className="note-indicator normal">
            <Check />
          </span>
          <div>
            <span className="note-tag normal-tag">NORMAL</span>
            <p>Most visitors browsed your shop and checked out as usual.</p>
          </div>
          <span className="note-count">
            1,284 <small>visits</small>
          </span>
        </div>
        <div className="note-item">
          <span className="note-indicator worth">
            <ArrowDownRight />
          </span>
          <div>
            <span className="note-tag worth-tag">WORTH A LOOK</span>
            <p>A crawler visited 40 pages in a few seconds. Probably a search engine.</p>
          </div>
          <span className="note-count">
            40 <small>pages</small>
          </span>
        </div>
        <div className="note-item">
          <span className="note-indicator act">
            <Shield />
          </span>
          <div>
            <span className="note-tag act-tag">ACT NOW</span>
            <p>Someone tried to log in 38 times from the same address.</p>
          </div>
          <span className="note-count">
            38 <small>tries</small>
          </span>
        </div>
        <div className="note-card-foot">
          <span>
            <span className="status-dot" /> Your site is up and running
          </span>
          <span>See you tomorrow</span>
        </div>
      </div>
    </section>
  );
}

function Connections() {
  return (
    <section className="connect-section section-shell section-block" id="connect">
      <div className="section-heading">
        <div>
          <div className="section-kicker">THREE EASY WAYS IN</div>
          <h2>
            Fits your setup.
            <br />
            <span>Not the other way around.</span>
          </h2>
        </div>
        <p>Whether you&apos;re a shop owner or a server tinkerer, getting started is simple.</p>
      </div>
      <div className="connect-grid">
        {CONNECTIONS.map((item) => (
          <article className={`connect-card connect-${item.accent}`} key={item.title}>
            <div className="connect-card-meta">
              <span className="mono">{item.num} / 03</span>
              <span>{item.label}</span>
            </div>
            <h3>{item.title}</h3>
            <p>{item.desc}</p>
            <code>{item.code}</code>
            <a href="#early-access" aria-label={`Learn about ${item.title}`}>
              <ArrowUpRight />
            </a>
          </article>
        ))}
      </div>
    </section>
  );
}

function Pricing() {
  return (
    <section className="pricing section-shell section-block" id="pricing">
      <div className="pricing-heading">
        <div className="section-kicker">STRAIGHTFORWARD PRICING</div>
        <h2>
          Start free. <span>Sleep better.</span>
        </h2>
        <p>No card needed to get started. No surprises later.</p>
      </div>
      <div className="pricing-grid">
        {PLANS.map((plan) => (
          <article key={plan.name} className={`price-card${plan.featured ? ' price-featured' : ''}`}>
            <div className="price-top">
              <h3>{plan.name}</h3>
              {plan.featured && <span className="popular-label">MOST POPULAR</span>}
            </div>
            <p>{plan.desc}</p>
            <div className="price">
              <strong>{plan.price}</strong>
              <span>{plan.suffix}</span>
            </div>
            <a className={`button ${plan.featured ? 'button-amber' : 'button-outline'}`} href="#early-access">
              {plan.action} <ArrowRight size={15} />
            </a>
            <div className="price-divider" />
            <ul>
              {plan.items.map((item) => (
                <li key={item}>
                  <Check />
                  {item}
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </section>
  );
}

function FinalCta() {
  return (
    <section className="final-cta section-shell" id="early-access">
      <div className="cta-owl">
        <OwlMark />
      </div>
      <div className="section-kicker">A QUIETER KIND OF SECURITY</div>
      <h2>
        Your website never sleeps.
        <br />
        <span>Now neither does its guard.</span>
      </h2>
      <p>Get early access and be first to see your website clearly.</p>
      <SignupForm compact />
      <div className="cta-small">
        <LockKeyhole size={13} /> No spam. Just your invite when it&apos;s ready.
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="site-footer section-shell">
      <a className="brand" href="#top">
        <OwlMark />
        <span>
          httpowl<span className="brand-dot">.</span>
        </span>
      </a>
      <span className="footer-copy">A clearer view of your website. © 2026 HTTPowl</span>
      <div className="footer-links">
        <a href="#features">Features</a>
        <a href="#pricing">Pricing</a>
        <a href="mailto:hello@httpowl.net">Contact</a>
        <a href="https://httpowl.net">
          httpowl.net <Globe2 size={13} />
        </a>
      </div>
    </footer>
  );
}

/** The public homepage at https://httpowl.net. Styles: styles/02-landing.css. */
export default function LandingPage() {
  return (
    <div className="site-frame">
      <Header />
      <main>
        <Hero />
        <WorksWith />
        <Features />
        <DailyNote />
        <Connections />
        <Pricing />
        <FinalCta />
      </main>
      <Footer />
      <a className="back-to-top" href="#top" aria-label="Back to top">
        <ChevronRight />
      </a>
    </div>
  );
}
