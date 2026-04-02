export default function PartnershipBanner() {
  return (
    <section className="partnership-banner">
      <div className="banner-inner">
        <div className="banner-lockup">
          <div className="banner-logos">
            <img src="/img/bodybank-logo.png" alt="Body Bank" className="banner-logo-img" />
            <span className="banner-x">×</span>
            <img
              src="/img/BeyondthebodyNBG.png"
              alt="Beyond The Body"
              className="banner-logo-img banner-logo-btb"
            />
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
          <div className="banner-pill">Exclusive Partnership</div>
          <h3>Mind heals first. Body follows.</h3>
          <p>The only platform where mental therapy and physical transformation work as one.</p>
          <p className="banner-promise">
            Mind heals first. Body follows.
            <br />
            Every therapy client <span className="banner-unlocks">unlocks</span> <strong>FREE</strong>
            <br />
            Body Bank Lifestyle Management:
            <br />
            Nutrition • Fitness • Recovery support.
          </p>
          <div className="banner-badges">
            <span className="banner-badge">✓ RCI Compliant</span>
            <span className="banner-badge">✓ Ethically Governed</span>
            <span className="banner-badge">✓ Evidence-Based</span>
          </div>
        </div>
        <a href="#contact" className="btn btn-light">
          Start Your Journey →
        </a>
      </div>
    </section>
  );
}
