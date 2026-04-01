 'use client';

import { useState } from 'react';

export default function Services() {
  type ServiceItem = {
    icon: string;
    title: string;
    items: string[];
    featured: boolean;
    delay: number;
    color: string;
    badge?: string;
  };

  const services: ServiceItem[] = [
    {
      icon: '🪪',
      title: 'Licensed Therapists',
      items: ['Anxiety & Depression', 'Relationship Counseling', 'Life Transitions'],
      featured: false,
      delay: 0,
      color: '44 168 143',
    },
    {
      icon: '⚡',
      title: 'Specialized Experts',
      items: ['Eating Disorders', 'Workplace Stress', 'Family Therapy'],
      featured: false,
      delay: 100,
      color: '82 159 245',
    },
    {
      icon: '💚',
      title: 'Trauma Specialists',
      items: ['PTSD & Complex Trauma', 'Childhood Trauma Recovery', 'Crisis Intervention'],
      featured: false,
      delay: 200,
      color: '76 191 115',
    },
    {
      icon: '🧠',
      title: 'Neuroplasticity Boosters',
      items: [
        'Music Tutors - Learn an instrument or singing to rewire your brain for better mood, memory & emotional resilience',
        'Language Tutors - Master a new language to sharpen focus, cognitive flexibility & confidence',
        'Creative Brain Sessions - Guided drawing, writing & mindfulness to unlock lasting mental growth',
      ],
      featured: false,
      delay: 300,
      color: '176 108 214',
    },
    {
      icon: '🤝',
      title: 'Group Facilitators',
      items: ['Support Circles', 'Grief & Loss Groups', 'Addiction Recovery'],
      featured: false,
      delay: 400,
      color: '219 178 78',
    },
  ];
  const [activeService, setActiveService] = useState<ServiceItem | null>(null);
  const [showAllServices, setShowAllServices] = useState(false);

  const closeServicesModal = () => {
    setActiveService(null);
    setShowAllServices(false);
  };

  const scrollToContact = () => {
    closeServicesModal();
    const el = document.getElementById('contact');
    if (el) {
      window.scrollTo({
        top: el.getBoundingClientRect().top + window.pageYOffset - 80,
        behavior: 'smooth',
      });
    }
  };

  const steps = [
    { num: '01', title: 'Free 15-min Consult', desc: 'Share your needs' },
    { num: '02', title: 'Expert Matching', desc: 'Get the right specialist' },
    { num: '03', title: 'Begin Healing', desc: 'Start your sessions' },
    { num: '04', title: 'Thrive', desc: 'Mind first, body follows' },
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
            Expert matching, clear next steps, and integrated support.
          </p>
        </div>
        <div className="services-grid">
          {services.map((svc) => (
            <button
              key={svc.title}
              type="button"
              className={`service-card${svc.featured ? ' featured' : ''}`}
              onClick={() => setActiveService(svc)}
              style={{ '--service-color': svc.color } as React.CSSProperties}
            >
              {svc.badge && <div className="service-badge">{svc.badge}</div>}
              <h3 className="service-title">
                <span className="service-icon-inline" aria-hidden="true">
                  {svc.icon}
                </span>
                <span>{svc.title}</span>
              </h3>
              <div className="service-glow" />
            </button>
          ))}
        </div>
        <div className="services-tap-wrap">
          <button type="button" className="services-tap-btn" onClick={() => setShowAllServices(true)}>
            Tap to view Details
          </button>
        </div>
        <div className="services-process">
          {steps.map((step) => (
            <div key={step.num} className="process-step">
              <div className="process-num">{step.num}</div>
              <div className="process-text">
                <h4>{step.title}</h4>
                <p>{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="affiliate-strip">
          <div className="affiliate-strip-inner">
            <img src="/img/bodybank-logo.png" alt="Body Bank Lifestyle Management" className="affiliate-strip-logo" />
            <p>
              <strong>After your session,</strong> unlock Body Bank Lifestyle Management support for nutrition, fitness, and recovery.
              <br />
              <a
                href="https://bodybank.fit"
                target="_blank"
                rel="noopener noreferrer"
                className="affiliate-strip-link"
              >
                Discover Body Bank programmes →
              </a>
            </p>
          </div>
        </div>
      </div>

      <div className={`modal${activeService || showAllServices ? ' open' : ''}`} aria-hidden={!(activeService || showAllServices)}>
        <div className="modal-overlay" onClick={closeServicesModal} />
        <div className="modal-content">
          <button className="modal-close" onClick={closeServicesModal}>
            ✕
          </button>
          {showAllServices && (
            <div className="all-services-view">
              <div className="modal-cond-name">All Services</div>
              {services.map((svc) => (
                <div className="modal-section" key={svc.title}>
                  <h4>
                    <span aria-hidden="true">{svc.icon}</span> {svc.title}
                  </h4>
                  <ul className="modal-list">
                    {svc.items.map((item) => (
                      <li key={`${svc.title}-${item}`}>{item}</li>
                    ))}
                  </ul>
                </div>
              ))}
              <div className="modal-cta">
                <button className="btn btn-primary" onClick={scrollToContact}>
                  Book Free Consultation →
                </button>
              </div>
            </div>
          )}
          {activeService && (
            <div>
              <div className="modal-cond-name">{activeService.title}</div>
              <p className="modal-cond-fact">Explore support options in this category.</p>
              <div className="modal-section">
                <h4>Specialized Support</h4>
                <ul className="modal-list">
                  {activeService.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
              <div className="modal-cta">
                <button className="btn btn-primary" onClick={scrollToContact}>
                  Book Free Consultation →
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
