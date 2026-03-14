export default function Services() {
  const services = [
    { icon: '🪪', title: 'Licensed Therapists', items: ['Anxiety & Depression', 'Relationship Counseling', 'Life Transitions'], featured: false, delay: 0 },
    { icon: '⚡', title: 'Specialized Experts', items: ['Eating Disorders', 'Workplace Stress', 'Family Therapy'], featured: true, badge: 'Most Popular', delay: 100 },
    { icon: '💜', title: 'Trauma Specialists', items: ['PTSD & Complex Trauma', 'Childhood Trauma Recovery', 'Crisis Intervention'], featured: false, delay: 200 },
    { icon: '🤝', title: 'Group Facilitators', items: ['Support Circles', 'Grief & Loss Groups', 'Addiction Recovery'], featured: false, delay: 300 },
  ];

  const steps = [
    { num: '01', title: 'Free 15-min Consult', desc: 'We listen to understand your needs' },
    { num: '02', title: 'Expert Matching', desc: 'Get paired with your ideal specialist' },
    { num: '03', title: 'Begin Healing', desc: 'Your transformation starts here' },
    { num: '04', title: 'Thrive', desc: 'Mind heals, body follows naturally' },
  ];

  return (
    <section className="services" id="services">
      <div className="container">
        <div className="section-header">
          <div className="section-tag">What We Offer</div>
          <h2 className="section-title">
            Specialists seeking <em>you</em>
          </h2>
          <p className="section-desc">
            We match you with the perfect professional for your unique journey — no guesswork, no
            generic care.
          </p>
        </div>
        <div className="services-grid">
          {services.map((svc) => (
            <div
              key={svc.title}
              className={`service-card${svc.featured ? ' featured' : ''}`}
              style={{ transitionDelay: `${svc.delay}ms` } as React.CSSProperties}
            >
              {svc.badge && <div className="service-badge">{svc.badge}</div>}
              <div className="service-icon">{svc.icon}</div>
              <h3>{svc.title}</h3>
              <ul className="service-list">
                {svc.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <div className="service-glow" />
            </div>
          ))}
        </div>
        <div className="services-process">
          {steps.map((step, i) => (
            <div key={step.num} style={{ display: 'contents' }}>
              <div className="process-step">
                <div className="process-num">{step.num}</div>
                <div className="process-text">
                  <h4>{step.title}</h4>
                  <p>{step.desc}</p>
                </div>
              </div>
              {i < steps.length - 1 && <div className="process-arrow">→</div>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
