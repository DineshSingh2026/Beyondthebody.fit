export default function Professionals() {
  return (
    <section className="professionals" id="professionals">
      <div className="prof-bg" aria-hidden="true">
        <div className="prof-orb-1" />
        <div className="prof-orb-2" />
      </div>
      <div className="container">
        <div className="section-header">
          <div className="section-tag">Meet The Minds</div>
          <h2 className="section-title">
            Our Mental Health <em>Professionals</em>
          </h2>
          <p className="section-desc">
            Exceptional minds dedicated to your transformation. Each carefully chosen for their
            expertise, empathy, and unwavering commitment to evidence-based care.
          </p>
        </div>
        <div className="prof-grid prof-grid--single">
          <div className="prof-card">
            <div className="prof-image-wrap">
              <div className="prof-image-frame">
                <img
                  src="/img/Soumya half.jpeg"
                  alt="Soumya Prakash"
                  className="prof-img"
                />
              </div>
              <span className="prof-badge">Board Member</span>
            </div>
            <div className="prof-info">
              <div className="prof-gold-line" />
              <h3 className="prof-name">Soumya Prakash</h3>
              <p className="prof-role">Board Member &amp; Healthcare Strategist</p>
              <p className="prof-credentials">
                MSc Healthcare Management &nbsp;·&nbsp; BSc (Hons) Neuroscience
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
