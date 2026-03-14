export default function PartnershipBanner() {
  return (
    <section className="partnership-banner">
      <div className="banner-inner">
        <div className="banner-lockup">
          <div className="banner-logos">
            <img src="/img/bodybank-logo.png" alt="Body Bank" className="banner-logo-img" />
            <span className="banner-x">×</span>
            <img src="/img/btb-logo.png" alt="Beyond The Body" className="banner-logo-img" />
          </div>
          <div className="banner-lockup-label">
            <span className="banner-bodybank">Body Bank</span>
            <span className="banner-x-char">×</span>
            <span className="banner-btb">
              Beyond <em>The Body</em>
            </span>
          </div>
        </div>
        <div className="banner-text">
          <h3>Revolutionary Partnership</h3>
          <p>Therapy first → Mental clarity → Physical transformation</p>
          <p className="banner-promise">
            Anyone seeking therapy gets <strong>FREE</strong> Body Bank Lifestyle Management
            services
          </p>
        </div>
        <a href="#contact" className="btn btn-light">
          Join the Movement →
        </a>
      </div>
    </section>
  );
}
