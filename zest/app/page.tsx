"use client";

import Link from "next/link";

export default function Home() {
  return (
    <div className="landing-page">
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
              Know your clients <br />
              <span className="hero-highlight">before they walk in</span>
            </h1>
            <p className="hero-subtitle">
              Zest combines scheduling and intake forms so you stop wasting sessions on discovery. 
              Perfect for coaches, therapists, photographers, and consultants.
            </p>
            <div className="hero-actions">
              <Link href="/signup" className="btn-primary">
                Get started
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </Link>
            </div>
            <p className="hero-note">
              Free plan forever. No card required — upgrade only if you need it.
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features">
        <div className="container">
          <h2 className="section-title">Everything you need to book clients</h2>
          <p className="section-subtitle">No complexity. Just booking, forms, and a clean dashboard.</p>

          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">📅</div>
              <h3 className="feature-title">Unlimited event types</h3>
              <p className="feature-desc">Create as many booking types as you need — consultations, discovery calls, workshops, sessions.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">⏰</div>
              <h3 className="feature-title">Smart availability</h3>
              <p className="feature-desc">Set your hours once. We&apos;ll show only open slots to your clients based on your schedule.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">📋</div>
              <h3 className="feature-title">Custom intake forms</h3>
              <p className="feature-desc">Add text fields, multiple choice, dropdowns — like a Google Form built into every booking.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">🔗</div>
              <h3 className="feature-title">Shareable booking links</h3>
              <p className="feature-desc">One unique link per event type. Share it anywhere and watch bookings roll in.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">📊</div>
              <h3 className="feature-title">Clean dashboard</h3>
              <p className="feature-desc">See all upcoming bookings and client responses in one place. No clutter, no noise.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">💬</div>
              <h3 className="feature-title">WhatsApp-first</h3>
              <p className="feature-desc">Share your booking link on WhatsApp and confirm bookings with one tap — how your clients actually communicate.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">🔒</div>
              <h3 className="feature-title">Simple, fair pricing</h3>
              <p className="feature-desc">Free plan forever. Pro at NGN 3,500/month — paid by bank transfer, no card, no auto-deduction.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Who it's for */}
      <section id="audience" className="audience">
        <div className="container">
          <h2 className="section-title">Built for service providers</h2>
          <p className="section-subtitle">If your clients book time with you, Zest makes you look professional.</p>

          <div className="audience-grid">
            <div className="audience-card">
              <div className="audience-icon">🎯</div>
              <h3 className="audience-title">Coaches &amp; consultants</h3>
              <p className="audience-desc">
                Know what a discovery call is about before it starts. Send intake questions, skip the back-and-forth.
              </p>
            </div>

            <div className="audience-card">
              <div className="audience-icon">📚</div>
              <h3 className="audience-title">Tutors &amp; trainers</h3>
              <p className="audience-desc">
                Share one link and let parents or students pick a slot. Custom questions capture class level, topics, and goals.
              </p>
            </div>

            <div className="audience-card">
              <div className="audience-icon">📸</div>
              <h3 className="audience-title">Creatives &amp; makers</h3>
              <p className="audience-desc">
                Photographers, therapists, stylists, barbers — anything where a booking plus a few questions makes the visit smoother.
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
              <h3 className="step-title">Create event types</h3>
              <p className="step-desc">Set up your services, availability, and custom questions in minutes.</p>
            </div>
            <div className="step-arrow">→</div>
            <div className="step">
              <div className="step-number">2</div>
              <h3 className="step-title">Share your link</h3>
              <p className="step-desc">Send your unique booking link to clients via email, social, or your website.</p>
            </div>
            <div className="step-arrow">→</div>
            <div className="step">
              <div className="step-number">3</div>
              <h3 className="step-title">Clients book</h3>
              <p className="step-desc">They pick a time, answer your questions, and it lands in your dashboard.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Demo */}
      <section className="demo">
        <div className="container">
          <h2 className="section-title">This is what your clients see</h2>
          <p className="section-subtitle">Your link, your branding, their time picked in seconds.</p>

          <div className="demo-window">
            <div className="demo-frame">
              <div className="demo-header">
                <span className="demo-avatar">A</span>
                <div>
                  <div className="demo-business">Adaeze Okafor</div>
                  <div className="demo-type">Photography Consultation</div>
                </div>
              </div>

              <div className="demo-body">
                <div className="demo-section-title">Select a time</div>
                <div className="demo-days">
                  <div className="demo-day active">
                    <span>Mon</span><strong>18</strong>
                  </div>
                  <div className="demo-day">
                    <span>Tue</span><strong>19</strong>
                  </div>
                  <div className="demo-day">
                    <span>Wed</span><strong>20</strong>
                  </div>
                  <div className="demo-day">
                    <span>Thu</span><strong>21</strong>
                  </div>
                </div>
                <div className="demo-slots">
                  <div className="demo-slot selected">9:00 AM</div>
                  <div className="demo-slot">11:00 AM</div>
                  <div className="demo-slot">2:00 PM</div>
                  <div className="demo-slot">4:30 PM</div>
                </div>
                <div className="demo-btn">Continue</div>
              </div>
            </div>

            <div className="demo-note">
              <p>
                One link, your logo and colors, no app for the client to
                install. They pick a slot, answer your questions, done.
              </p>
              <Link href="/signup" className="demo-cta">
                See it on your own page →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="testimonials">
        <div className="container">
          <h2 className="section-title">Loved by busy professionals</h2>
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
              <div className="stat-number">2 min</div>
              <div className="stat-label">to set up your first link</div>
            </div>
            <div className="stat-divider" />
            <div className="stat">
              <div className="stat-number">1</div>
              <div className="stat-label">free event type, forever</div>
            </div>
            <div className="stat-divider" />
            <div className="stat">
              <div className="stat-number">₦3,500</div>
              <div className="stat-label">per month for Pro, no card</div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="pricing">
        <div className="container">
          <h2 className="section-title">Simple, transparent pricing</h2>
          <p className="section-subtitle">
            Every new account includes a 7-day Pro trial. No card, no
            auto-deduction, cancel anytime.
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
                    <div className="pricing-col-price">NGN 3,500</div>
                    <div className="pricing-col-period">/month</div>
                    <Link href="/signup" className="pricing-btn premium-btn">
                      Start free trial
                    </Link>
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="pricing-feature-col">Event types</td>
                  <td>1</td>
                  <td className="pro-cell">Unlimited</td>
                </tr>
                <tr>
                  <td className="pricing-feature-col">Custom intake questions</td>
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
              </tbody>
            </table>
          </div>

          <p className="pricing-note">
            Pay by bank transfer to Zest&apos;s account — your account activates
            automatically when we match your payment.
          </p>
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
                Yes. Create an account and you get a 7-day Pro trial with no
                card required. After the trial you keep a free plan with 1
                event type — forever.
              </p>
            </details>

            <details className="faq-item">
              <summary>How does payment work?</summary>
              <p>
                Pro is paid by bank transfer to Zest&apos;s Kuda account (shown
                on your billing page). Include your payment reference in the
                narration — your account activates automatically within a few
                minutes. No card, no auto-deduction.
              </p>
            </details>

            <details className="faq-item">
              <summary>What happens after my 7-day trial?</summary>
              <p>
                You drop to the free plan: your booking links keep working, and
                you keep 1 event type. Upgrade anytime with a transfer to unlock
                unlimited event types, custom branding, and WhatsApp notify.
              </p>
            </details>

            <details className="faq-item">
              <summary>Can I cancel anytime?</summary>
              <p>
                Yes. It&apos;s a simple monthly subscription — pay for the months
                you want. There&apos;s nothing to cancel because nothing is
                charged automatically.
              </p>
            </details>

            <details className="faq-item">
              <summary>Is this like Calendly?</summary>
              <p>
                It&apos;s the same idea, built for how people work in Nigeria:
                no card, bank transfer payments, WhatsApp-first sharing and
                confirmations, and intake forms baked into every booking.
              </p>
            </details>

            <details className="faq-item">
              <summary>What is WhatsApp notify?</summary>
              <p>
                One tap opens WhatsApp with a ready-made message to your client
                or you, so confirmations happen where your clients actually
                chat — on WhatsApp.
              </p>
            </details>

            <details className="faq-item">
              <summary>Does my client need an account?</summary>
              <p>
                No. They just open your link, pick a time, answer your
                questions, and they&apos;re done. No signup, no app.
              </p>
            </details>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta">
        <div className="container">
          <div className="cta-card">
            <h2 className="cta-title">Ready to get zesty?</h2>
            <p className="cta-text">Join hundreds of service providers who start every client conversation with context.</p>
            <Link href="/signup" className="btn-primary btn-large">
              Get started
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </Link>
            <p className="cta-note">
              Free forever on the Free plan. Pro is NGN 3,500/month, paid by
              bank transfer — no card needed, no auto-deduction.
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