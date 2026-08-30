"use client";

import Link from "next/link";
import DemoBookingWidget from "@/components/DemoBookingWidget";

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Zest",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  description:
    "Free scheduling and intake form platform for coaches, tutors, therapists, and consultants in Nigeria.",
  url: "https://zestbook.org.ng",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "NGN",
    description: "Free plan with 1 event type. Pro plan at NGN 4,000/month.",
  },
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "5",
    ratingCount: "3",
  },
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Is Zest free to start?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. Create an account and you get a 7-day Pro trial with no card required. After the trial you keep a free plan with 1 event type — forever.",
      },
    },
    {
      "@type": "Question",
      name: "How does payment work?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Pro is paid by bank transfer to Zest's Kuda account (shown on your billing page). Include your payment reference in the narration — your account activates automatically within a few minutes. No card, no auto-deduction.",
      },
    },
    {
      "@type": "Question",
      name: "What happens after my 7-day trial?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "You drop to the free plan: your booking links keep working, and you keep 1 event type. Upgrade anytime with a transfer to unlock unlimited event types, custom branding, and WhatsApp notify.",
      },
    },
    {
      "@type": "Question",
      name: "Can I cancel anytime?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. It's a simple monthly subscription — pay for the months you want. There's nothing to cancel because nothing is charged automatically.",
      },
    },
    {
      "@type": "Question",
      name: "Is this like Calendly?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "It's the same idea, built for how people work in Nigeria: no card, bank transfer payments, WhatsApp-first sharing and confirmations, and intake forms baked into every booking.",
      },
    },
    {
      "@type": "Question",
      name: "Does my client need an account?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No. They just open your link, pick a time, answer your questions, and they're done. No signup, no app.",
      },
    },
  ],
};

export default function Home() {
  return (
    <div className="landing-page">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      {/* Background blobs - fixed position */}
      <div className="blob blob-1" />
      <div className="blob blob-2" />
      <div className="blob blob-3" />

      {/* Navigation */}
      <nav className="nav">
        <div className="nav-container">
          <div className="logo-wrap">
            <span className="logo-icon">🍋</span>
            <span className="logo-text">ZestBook</span>
          </div>
          <div className="nav-links">
            <Link href="#features" className="nav-link">Features</Link>
            <Link href="#audience" className="nav-link">Who it&apos;s for</Link>
            <Link href="#pricing" className="nav-link">Pricing</Link>
            <Link href="#faq" className="nav-link">FAQ</Link>
            <Link href="/blog" className="nav-link">Blog</Link>
            <Link href="/login" className="nav-link">Sign in</Link>
            <Link href="/signup" className="nav-cta">Get started</Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <div className="hero-card">
            <h1 className="hero-title">
              Know your client&apos;s story <br />
              <span className="hero-highlight">before they walk in</span>
            </h1>
            <p className="hero-subtitle">
              Book clients, ask intake questions, and get insights on who comes
              back — plus your own business page.
            </p>
            <div className="hero-actions">
              <Link href="/signup" className="btn-primary">
                Get started free
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </Link>
              <Link href="#demo" className="btn-secondary">
                See how it works
              </Link>
            </div>
            <p className="hero-note">
              Free plan forever · No card required · Set up in under 2 minutes
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features">
        <div className="container">
          <h2 className="section-title">Everything you need to book clients</h2>
          <p className="section-subtitle">No complexity. Just booking, questions, and a clean dashboard.</p>

          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">📅</div>
              <h3 className="feature-title">Unlimited services</h3>
              <p className="feature-desc">Create as many services as you need — consultations, discovery calls, workshops, sessions.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">⏰</div>
              <h3 className="feature-title">Your schedule, your rules</h3>
              <p className="feature-desc">Set your available hours once. Clients only see the times you&apos;re free.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">📋</div>
              <h3 className="feature-title">Questions before you meet</h3>
              <p className="feature-desc">Ask your clients questions before you meet. Text, multiple choice, or dropdown.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">🔗</div>
              <h3 className="feature-title">Shareable booking links</h3>
              <p className="feature-desc">Each service gets its own link. Share it on WhatsApp, Instagram, or anywhere.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">📊</div>
              <h3 className="feature-title">Clean dashboard</h3>
              <p className="feature-desc">See all your bookings and client answers in one place.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">🌐</div>
              <h3 className="feature-title">Business page</h3>
              <p className="feature-desc">A page that shows all your services in one place. Share one link everywhere — it&apos;s like your own website.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">🧠</div>
              <h3 className="feature-title">Client insights</h3>
              <p className="feature-desc">See who books again, who needs a follow-up, and what changed between visits — automatically.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">💬</div>
              <h3 className="feature-title">WhatsApp-first</h3>
              <p className="feature-desc">Share your link on WhatsApp. Confirm with one tap. That&apos;s how your clients already communicate.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">🔒</div>
              <h3 className="feature-title">Simple, fair pricing</h3>
              <p className="feature-desc">Free forever. Pro is NGN 4,000/month — pay by bank transfer, no card needed.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Who it's for */}
      <section id="audience" className="audience">
        <div className="container">
          <h2 className="section-title">Built for service providers</h2>
          <p className="section-subtitle">If people book time with you, Zest makes you look professional.</p>

          <div className="audience-grid">
            <div className="audience-card">
              <div className="audience-icon">🎯</div>
              <h3 className="audience-title">Coaches &amp; consultants</h3>
              <p className="audience-desc">
                Know what a client needs before the meeting. Ask questions upfront, skip the back-and-forth.
              </p>
            </div>

            <div className="audience-card">
              <div className="audience-icon">📚</div>
              <h3 className="audience-title">Tutors &amp; trainers</h3>
              <p className="audience-desc">
                Share one link. Parents or students pick a time. You ask about class level, topics, and goals.
              </p>
            </div>

            <div className="audience-card">
              <div className="audience-icon">📸</div>
              <h3 className="audience-title">Creatives &amp; makers</h3>
              <p className="audience-desc">
                Photographers, therapists, stylists, barbers — any job where a booking form makes things smoother.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="how-it-works">
        <div className="container">
          <h2 className="section-title">How it works</h2>
          <div className="steps">
            <div className="step">
              <div className="step-number">1</div>
              <h3 className="step-title">Set up your services</h3>
              <p className="step-desc">Add your services, set your hours, and write your questions. Takes minutes.</p>
            </div>
            <div className="step-arrow">→</div>
            <div className="step">
              <div className="step-number">2</div>
              <h3 className="step-title">Share your link</h3>
              <p className="step-desc">Share your link on WhatsApp, Instagram, email, or anywhere.</p>
            </div>
            <div className="step-arrow">→</div>
            <div className="step">
              <div className="step-number">3</div>
              <h3 className="step-title">Clients book</h3>
              <p className="step-desc">Clients pick a time, answer your questions, and it shows up in your dashboard.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Your Business Page */}
      <section className="business-demo">
        <div className="container">
          <h2 className="section-title">Your own booking website — in minutes</h2>
          <p className="section-subtitle">
            No designer. No developer. No hosting fees. Just your services, your
            logo, and a &ldquo;Book&rdquo; button.
          </p>

          <div className="bpd-window">
            <div className="bpd-frame">
              <div className="bpd-cover" />
              <div className="bpd-profile">
                <div className="bpd-avatar">A</div>
                <h3 className="bpd-name">Adaeze Okafor</h3>
                <p className="bpd-bio">Photography &amp; visual arts in Lagos</p>
                <div className="bpd-links">
                  <span className="bpd-link-item">🌐 ada.com</span>
                  <span className="bpd-link-item">💬 WhatsApp</span>
                </div>
              </div>
              <div className="bpd-services">
                <h4 className="bpd-services-title">Our Services</h4>
                <div className="bpd-services-grid">
                  <div className="bpd-service-card">
                    <div className="bpd-service-header">
                      <div className="bpd-service-icon">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                          <line x1="16" y1="2" x2="16" y2="6" />
                          <line x1="8" y1="2" x2="8" y2="6" />
                          <line x1="3" y1="10" x2="21" y2="10" />
                        </svg>
                      </div>
                      <span className="bpd-service-duration">30 min</span>
                    </div>
                    <div className="bpd-service-name">Consultation</div>
                    <div className="bpd-service-footer">
                      <span className="bpd-service-book">Book now →</span>
                    </div>
                  </div>
                  <div className="bpd-service-card">
                    <div className="bpd-service-header">
                      <div className="bpd-service-icon">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                          <line x1="16" y1="2" x2="16" y2="6" />
                          <line x1="8" y1="2" x2="8" y2="6" />
                          <line x1="3" y1="10" x2="21" y2="10" />
                        </svg>
                      </div>
                      <span className="bpd-service-duration">60 min</span>
                    </div>
                    <div className="bpd-service-name">Photo Shoot</div>
                    <div className="bpd-service-footer">
                      <span className="bpd-service-book">Book now →</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bpd-note">
              <h3 className="bpd-note-title">More than a booking link</h3>
              <p className="bpd-note-text">
                Every Pro user gets a page that shows all their services in one
                place — like your own website, but you don&apos;t need a
                developer.
              </p>
              <ul className="bpd-note-list">
                <li>One link for your Instagram bio, WhatsApp status, and business card</li>
                <li>Your clients see all your services and book instantly</li>
                <li>Google can find your page — people discover you online</li>
                <li>Add your logo, colors, bio, and social links</li>
              </ul>
              <Link href="/signup" className="bpd-cta">
                Create your free page →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Demo */}
      <section id="demo" className="demo">
        <div className="container">
          <h2 className="section-title">Try it yourself</h2>
          <p className="section-subtitle">
            This is exactly what your clients see. Pick a time, fill the form, done.
          </p>
          <DemoBookingWidget />
        </div>
      </section>

      {/* Testimonials */}
      <section className="testimonials">
        <div className="container">
          <h2 className="section-title">What our users say</h2>
          <div className="testimonials-grid">
            <div className="testimonial-card">
              <div className="testimonial-stars">★★★★★</div>
              <p className="testimonial-quote">
                “My clients fill in the details before our call, so I never
                waste the first ten minutes asking the same questions.”
              </p>
              <div className="testimonial-author">Chiamaka, Career Coach · Lagos</div>
            </div>
            <div className="testimonial-card">
              <div className="testimonial-stars">★★★★★</div>
              <p className="testimonial-quote">
                &ldquo;I share one link on WhatsApp and the whole week books itself.
                No more &lsquo;are you free on Friday?&rsquo; texts.&rdquo;
              </p>
              <div className="testimonial-author">Tunde, Fitness Trainer · Ibadan</div>
            </div>
            <div className="testimonial-card">
              <div className="testimonial-stars">★★★★★</div>
              <p className="testimonial-quote">
                &ldquo;I see each student&apos;s level before the lesson starts. It looks
                professional and it saves me real time.&rdquo;
              </p>
              <div className="testimonial-author">Aisha, Math Tutor · Abuja</div>
            </div>
          </div>

          <div className="stats-row">
            <div className="stat">
              <div className="stat-number">Under 2 min</div>
              <div className="stat-label">to set up your first link</div>
            </div>
            <div className="stat-divider" />
            <div className="stat">
              <div className="stat-number">1</div>
              <div className="stat-label">free service, forever</div>
            </div>
            <div className="stat-divider" />
            <div className="stat">
              <div className="stat-number">₦4,000</div>
              <div className="stat-label">per month for Pro, no card</div>
            </div>
            <div className="stat-divider" />
            <div className="stat">
              <div className="stat-number">0</div>
              <div className="stat-label">cards needed, ever</div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="pricing">
        <div className="container">
          <h2 className="section-title">Simple pricing</h2>
          <p className="section-subtitle">
            Every account starts with a 7-day free trial. No card needed. Cancel anytime.
          </p>

          <div className="pricing-table-wrap">
            <table className="pricing-table">
              <thead>
                <tr>
                  <th className="pricing-feature-col" />
                  <th className="pricing-col-free">
                    <div className="pricing-col-name">Free</div>
                    <div className="pricing-col-price">₦0</div>
                    <div className="pricing-col-period">forever</div>
                    <Link href="/signup" className="pricing-btn">
                      Start free
                    </Link>
                  </th>
                  <th className="pricing-col-pro">
                    <div className="pricing-badge">Most popular</div>
                    <div className="pricing-col-name">Pro</div>
                    <div className="pricing-col-price">NGN 4,000</div>
                    <div className="pricing-col-period">/month</div>
                    <Link href="/signup" className="pricing-btn premium-btn">
                      Start free trial
                    </Link>
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="pricing-feature-col">Services</td>
                  <td>1</td>
                  <td className="pro-cell">Unlimited</td>
                </tr>
                <tr>
                  <td className="pricing-feature-col">Custom questions</td>
                  <td>✓</td>
                  <td className="pro-cell">✓</td>
                </tr>
                <tr>
                  <td className="pricing-feature-col">Shareable booking link</td>
                  <td>✓</td>
                  <td className="pro-cell">✓</td>
                </tr>
                <tr>
                  <td className="pricing-feature-col">Unlimited bookings</td>
                  <td>✓</td>
                  <td className="pro-cell">✓</td>
                </tr>
                <tr>
                  <td className="pricing-feature-col">Custom branding (logo + colors)</td>
                  <td className="muted-cell">—</td>
                  <td className="pro-cell">✓</td>
                </tr>
                <tr>
                  <td className="pricing-feature-col">One-tap WhatsApp notify</td>
                  <td className="muted-cell">—</td>
                  <td className="pro-cell">✓</td>
                </tr>
                <tr>
                  <td className="pricing-feature-col">Public business page</td>
                  <td className="muted-cell">—</td>
                  <td className="pro-cell">✓</td>
                </tr>
              </tbody>
            </table>
          </div>

          <p className="pricing-note">
            Pay by bank transfer to Zest&apos;s account — your account activates
            automatically when we match your payment.
          </p>

          <div className="trust-badges">
            <div className="trust-badge">
              <span className="trust-icon">🏦</span>
              <span>Bank transfer</span>
            </div>
            <div className="trust-badge">
              <span className="trust-icon">🔒</span>
              <span>No auto-deduction</span>
            </div>
            <div className="trust-badge">
              <span className="trust-icon">✓</span>
              <span>Cancel anytime</span>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="faq">
        <div className="container">
          <h2 className="section-title">Questions, answered</h2>

          <div className="faq-list">
            <details className="faq-item">
              <summary>Is Zest free to start?</summary>
              <p>
                Yes. Sign up and you get 7 days of Pro for free. No card. After
                that, you keep a free plan with 1 service — forever.
              </p>
            </details>

            <details className="faq-item">
              <summary>How does payment work?</summary>
              <p>
                Send money to Zest&apos;s bank account (shown on your billing
                page). Put your payment reference in the narration. Your account
                activates automatically in minutes. No card, no auto-deduction.
              </p>
            </details>

            <details className="faq-item">
              <summary>What happens after my 7-day trial?</summary>
              <p>
                You drop to the free plan. Your links keep working. You keep 1
                service. Upgrade anytime by transferring money to unlock
                unlimited services, your own logo/colors, and WhatsApp
                confirmations.
              </p>
            </details>

            <details className="faq-item">
              <summary>Can I cancel anytime?</summary>
              <p>
                Yes. Pay for the months you want. Nothing is taken automatically,
                so there&apos;s nothing to cancel.
              </p>
            </details>

            <details className="faq-item">
              <summary>Is this like Calendly?</summary>
              <p>
                Same idea, built for Nigeria. No card needed. Pay by bank
                transfer. Share and confirm on WhatsApp. Questions built into
                every booking.
              </p>
            </details>

            <details className="faq-item">
              <summary>What is WhatsApp notify?</summary>
              <p>
                One tap opens WhatsApp with a ready message for your client.
                Confirm where they already chat — on WhatsApp.
              </p>
            </details>

            <details className="faq-item">
              <summary>Does my client need an account?</summary>
              <p>
                No. They open your link, pick a time, answer your questions.
                Done. No signup, no app.
              </p>
            </details>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta">
        <div className="container">
          <div className="cta-card">
            <h2 className="cta-title">Start booking clients today</h2>
            <p className="cta-text">Join thousands of coaches, tutors, and consultants in Nigeria who use Zest.</p>
            <Link href="/signup" className="btn-primary btn-large">
              Get started free
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </Link>
            <p className="cta-note">
              Free 7-day Pro trial · No card needed · Set up in 2 minutes
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-logo">
              <span className="logo-icon">🍋</span>
              <span className="logo-text">zest</span>
            </div>
            <div className="footer-links">
              <Link href="#features" className="footer-link">Features</Link>
              <Link href="#pricing" className="footer-link">Pricing</Link>
              <Link href="/blog" className="footer-link">Blog</Link>
              <Link href="#faq" className="footer-link">FAQ</Link>
              <Link href="/login" className="footer-link">Sign in</Link>
              <Link href="/signup" className="footer-link">Sign up</Link>
            </div>
          </div>
          <div className="footer-trust">
            <span>Paid via bank transfer</span>
            <span className="footer-dot">·</span>
            <span>Activated automatically</span>
            <span className="footer-dot">·</span>
            <span>Cancel anytime</span>
          </div>
          <div className="footer-legals">
            <Link href="/terms" className="footer-link">Terms</Link>
            <span className="footer-dot">·</span>
            <Link href="/privacy" className="footer-link">Privacy</Link>
          </div>
          <div className="footer-copyright">
            © {new Date().getFullYear()} Zest. All rights reserved.
          </div>
        </div>
      </footer>

    </div>
  );
}