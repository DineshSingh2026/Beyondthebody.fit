export default function About() {
  return (
    <section className="about" id="about">
      <div className="container">
        <div className="about-grid">
          <div className="about-visual">
            <div className="about-card main-card">
              <div className="about-quote">
                <svg viewBox="0 0 40 30" fill="currentColor" width="40">
                  <path d="M0 30V18.3C0 10.1 5.2 3.7 15.6 0l2.4 3.9C12.1 6 9 9.8 8.4 14.9H16V30H0zm24 0V18.3C24 10.1 29.2 3.7 39.6 0L42 3.9c-5.9 2.1-9 5.9-9.6 11H40V30H24z" />
                </svg>
                <p>
                  We had it backwards. Mental wellness should come FIRST — physical transformation
                  follows naturally.
                </p>
                <cite>— Body Bank Founder</cite>
              </div>
            </div>
            <div className="about-stat-card">
              <div className="asc-number">85%</div>
              <div className="asc-label">Improvement with trauma-informed care</div>
            </div>
            <div className="about-badge-float">
              <span>🏆</span>
              <span>True Transformation</span>
            </div>
          </div>
          <div className="about-content">
            <div className="section-tag">Our Mission</div>
            <h2 className="section-title">
              We exist to break the stigma around mental wellness
            </h2>
            <p className="about-text">
              Beyond The Body is a safe, judgment-free space where heart, soul, and mind unite. We
              believe that true transformation goes <em>beyond the body</em> — it starts with
              healing the mind first.
            </p>
            <div className="about-pillars">
              <div className="pillar">
                <div className="pillar-icon">🌱</div>
                <div>
                  <h4>Normalize Mental Wellness</h4>
                  <p>Making mental health as accepted and celebrated as physical fitness</p>
                </div>
              </div>
              <div className="pillar">
                <div className="pillar-icon">🔬</div>
                <div>
                  <h4>Evidence-Based Approach</h4>
                  <p>Every technique backed by science, every therapist carefully vetted</p>
                </div>
              </div>
              <div className="pillar">
                <div className="pillar-icon">🤝</div>
                <div>
                  <h4>Community Support</h4>
                  <p>You&apos;re never alone — connecting you with those who truly understand</p>
                </div>
              </div>
            </div>
            <div className="about-disclaimer">
              <span>⚠️</span>
              <p>
                Our content is educational, not diagnostic. Always consult licensed professionals.
                We complement, never replace, your doctor.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
