export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-top">
          <div className="footer-brand">
            <div className="footer-logo">
              <img src="/img/btb-logo.png" alt="Beyond The Body" className="footer-logo-img" />
              <span>
                Beyond <em>The Body</em>
              </span>
            </div>
            <p>
              Your safe space to embrace your heart, soul, and mind. Together, let&apos;s look
              &apos;Beyond The Body&apos; and unlock your true potential.
            </p>
            <div className="footer-socials">
              <a
                href="https://www.instagram.com/beyondthebody_?igsh=bGhlNHc0c3hqN3Zs"
                target="_blank"
                rel="noopener noreferrer"
                className="instagram-link"
                aria-label="Follow us on Instagram"
              >
                <svg
                  className="instagram-icon"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                </svg>
                <span className="instagram-handle">@beyondthebody_</span>
              </a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <div className="footer-disclaimer">
            ⚠️ Content is educational, not diagnostic. Always consult qualified professionals.
            Emergency situations require immediate medical care.
          </div>
          <div className="footer-copy">
            © 2025 Beyond The Body. All rights reserved. Built with 💚 for healing.
          </div>
        </div>

        <div className="footer-platform">
          <h4 className="platform-title">The Beyond Wellness Platform</h4>
          <div className="platform-brands">
            <a
              href="https://beyondthebody.fit"
              target="_blank"
              rel="noopener noreferrer"
              className="platform-brand"
            >
              <img src="/img/btb-logo.png" alt="Beyond The Body" className="platform-logo" />
              <span className="platform-domain">BeyondThebody.fit</span>
            </a>
            <span className="platform-dot">•</span>
            <a
              href="https://bodybank.fit"
              target="_blank"
              rel="noopener noreferrer"
              className="platform-brand"
            >
              <img src="/img/bodybank-logo.png" alt="Body Bank" className="platform-logo" />
              <span className="platform-domain">BodyBank.fit</span>
            </a>
            <span className="platform-dot">•</span>
            <a
              href="https://fitchef.fit"
              target="_blank"
              rel="noopener noreferrer"
              className="platform-brand"
            >
              <img
                src="/img/Fitchef%20logo.png"
                alt="FitChef"
                className="platform-logo"
              />
              <span className="platform-domain">FitChef.fit</span>
            </a>
          </div>
          <p className="platform-tagline">Healing • Strength • Nutrition</p>
        </div>
      </div>
    </footer>
  );
}
