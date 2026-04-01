/* ============================================
   BEYOND THE BODY — Main JavaScript
   ============================================ */

// ===================== LOADER =====================
const loader = document.getElementById('loader');
const loaderProgressBar = document.getElementById('loaderProgressBar');
const loaderLoadingText = document.getElementById('loaderLoadingText');
const LOADER_DURATION = 1800;

function runLoader() {
  let progress = 0;
  const start = performance.now();

  function update() {
    const elapsed = performance.now() - start;
    progress = Math.min(100, (elapsed / LOADER_DURATION) * 100);
    if (loaderProgressBar) loaderProgressBar.style.width = progress + '%';

    if (progress < 100) {
      requestAnimationFrame(update);
    }
  }
  requestAnimationFrame(update);

  if (loaderLoadingText) {
    let dotCount = 0;
    const dotInterval = setInterval(() => {
      dotCount = (dotCount % 3) + 1;
      loaderLoadingText.textContent = 'Loading' + '.'.repeat(dotCount);
    }, 400);
    setTimeout(() => clearInterval(dotInterval), LOADER_DURATION);
  }

  setTimeout(() => {
    if (loaderProgressBar) loaderProgressBar.style.width = '100%';
    setTimeout(() => {
      if (loader) loader.classList.add('hidden');
    }, 400);
  }, LOADER_DURATION);
}

window.addEventListener('load', runLoader);

// ===================== ZOOM LOCK =====================
window.addEventListener('wheel', (event) => {
  if (event.ctrlKey) event.preventDefault();
}, { passive: false });

window.addEventListener('keydown', (event) => {
  const ctrlOrMeta = event.ctrlKey || event.metaKey;
  if (!ctrlOrMeta) return;
  if (event.key === '+' || event.key === '-' || event.key === '=' || event.key === '_' || event.key === '0') {
    event.preventDefault();
  }
});

['gesturestart', 'gesturechange', 'gestureend'].forEach((gestureEvent) => {
  window.addEventListener(gestureEvent, (event) => event.preventDefault());
});

// ===================== CUSTOM CURSOR (desktop only) =====================
const isTouchDevice = () => 'ontouchstart' in window || navigator.maxTouchPoints > 0;
const cursor = document.getElementById('cursor');
const cursorFollower = document.getElementById('cursorFollower');
let mouseX = 0, mouseY = 0;
let followerX = 0, followerY = 0;

if (!isTouchDevice() && cursor && cursorFollower) {
  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    cursor.style.left = mouseX + 'px';
    cursor.style.top = mouseY + 'px';
  });

  function animateFollower() {
    followerX += (mouseX - followerX) * 0.1;
    followerY += (mouseY - followerY) * 0.1;
    cursorFollower.style.left = followerX + 'px';
    cursorFollower.style.top = followerY + 'px';
    requestAnimationFrame(animateFollower);
  }
  animateFollower();

  document.querySelectorAll('a, button, .condition-card, .service-card, .bt-card').forEach(el => {
    el.addEventListener('mouseenter', () => {
      cursor.style.width = '20px';
      cursor.style.height = '20px';
      cursorFollower.style.width = '56px';
      cursorFollower.style.height = '56px';
      cursorFollower.style.borderColor = 'rgba(76, 175, 138, 0.8)';
    });
    el.addEventListener('mouseleave', () => {
      cursor.style.width = '10px';
      cursor.style.height = '10px';
      cursorFollower.style.width = '36px';
      cursorFollower.style.height = '36px';
      cursorFollower.style.borderColor = 'rgba(76, 175, 138, 0.5)';
    });
  });
}

// ===================== NAVIGATION =====================
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 80);
});

const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');

hamburger.addEventListener('click', () => {
  mobileMenu.classList.toggle('open');
});

document.querySelectorAll('.mobile-link').forEach(link => {
  link.addEventListener('click', () => {
    mobileMenu.classList.remove('open');
  });
});

// ===================== SMOOTH SCROLL =====================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      const offset = 80;
      const top = target.getBoundingClientRect().top + window.pageYOffset - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  });
});

// ===================== INTERSECTION OBSERVER =====================
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));

// ===================== COUNTER ANIMATION =====================
function animateCounter(el) {
  const target = parseInt(el.getAttribute('data-target'));
  let current = 0;
  const duration = 2000;
  const step = target / (duration / 16);
  
  const timer = setInterval(() => {
    current += step;
    if (current >= target) {
      current = target;
      clearInterval(timer);
    }
    el.textContent = Math.floor(current);
  }, 16);
}

const statsObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.querySelectorAll('.stat-num').forEach(animateCounter);
      statsObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });

const heroStats = document.querySelector('.hero-stats');
if (heroStats) statsObserver.observe(heroStats);

// ===================== AFFIRMATIONS =====================
const affirmations = [
  "I choose to prioritize my mental wellness alongside my physical health.",
  "I am worthy of healing, growth, and unconditional love.",
  "Every day I move beyond limitations and discover my true potential.",
  "My mind and body work in harmony to support my wellbeing.",
  "I embrace the journey of healing with courage and compassion.",
  "I deserve peace, joy, and a life that feels aligned with my soul.",
  "Healing is not linear, and I honor every step of my journey.",
  "I release what no longer serves me and welcome transformation.",
  "My mental health matters and I invest in it every single day.",
  "I am beyond my struggles. I am resilient, strong, and capable."
];

let currentAff = 0;

// Hero affirmation card
const heroAffText = document.querySelector('.aff-text');
const affNextBtn = document.getElementById('affNext');

function updateHeroAff() {
  heroAffText.style.opacity = '0';
  heroAffText.style.transform = 'translateY(10px)';
  setTimeout(() => {
    heroAffText.textContent = affirmations[currentAff];
    heroAffText.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
    heroAffText.style.opacity = '1';
    heroAffText.style.transform = 'translateY(0)';
  }, 300);
}

if (affNextBtn) {
  affNextBtn.addEventListener('click', () => {
    currentAff = (currentAff + 1) % affirmations.length;
    updateHeroAff();
  });
}

// Auto-rotate hero affirmation
setInterval(() => {
  currentAff = (currentAff + 1) % affirmations.length;
  updateHeroAff();
}, 6000);

// Affirmations carousel
const affTrack = document.getElementById('affTrack');
const affDotsContainer = document.getElementById('affDots');
const affPrev = document.getElementById('affPrev');
const affNextBtn2 = document.getElementById('affNextBtn');
let affIndex = 0;

function buildCarousel() {
  if (!affTrack) return;
  
  const count = affirmations.length;
  affTrack.style.setProperty('--slide-count', count);
  affTrack.style.width = `${count * 100}%`;
  
  affirmations.forEach((aff, i) => {
    const slide = document.createElement('div');
    slide.className = 'aff-slide fade-in';
    slide.innerHTML = `<p class="aff-slide-text">${aff}</p>`;
    affTrack.appendChild(slide);
    observer.observe(slide);
    
    const dot = document.createElement('div');
    dot.className = 'aff-dot-nav' + (i === 0 ? ' active' : '');
    dot.addEventListener('click', () => goToSlide(i));
    affDotsContainer.appendChild(dot);
  });
}

function goToSlide(index) {
  affIndex = Math.max(0, Math.min(index, affirmations.length - 1));
  const pct = (affIndex * 100) / affirmations.length;
  affTrack.style.transform = `translateX(-${pct}%)`;
  document.querySelectorAll('.aff-dot-nav').forEach((d, i) => {
    d.classList.toggle('active', i === affIndex);
  });
}

if (affPrev) {
  affPrev.addEventListener('click', () => {
    goToSlide(affIndex - 1);
  });
}

if (affNextBtn2) {
  affNextBtn2.addEventListener('click', () => {
    goToSlide(affIndex + 1);
  });
}

buildCarousel();

// Swipe support for mobile
const affViewport = document.querySelector('.aff-viewport');
if (affViewport) {
  let touchStartX = 0;
  let touchEndX = 0;
  affViewport.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });
  affViewport.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    const diff = touchStartX - touchEndX;
    const minSwipe = 50;
    if (diff > minSwipe) goToSlide(affIndex + 1);
    else if (diff < -minSwipe) goToSlide(affIndex - 1);
  }, { passive: true });
}

// ===================== CONDITIONS =====================
const conditions = [
  {
    name: "Anxiety",
    fact: "Affects 40 million adults annually",
    treatment: "80-90% success rate",
    signs: ["Racing thoughts & constant worry", "Physical symptoms (heart racing, sweating)", "Avoidance of situations or activities", "Difficulty concentrating"],
    treatments: ["Cognitive Behavioral Therapy (CBT)", "Exposure Response Prevention", "Mindfulness-based interventions", "Medication when appropriate"],
    color: "#7B4FBE"
  },
  {
    name: "Depression",
    fact: "17+ million adults experience this annually",
    treatment: "70-80% recovery with treatment",
    signs: ["Persistent sadness or emptiness", "Loss of interest in activities", "Changes in sleep/appetite", "Thoughts of worthlessness"],
    treatments: ["Individual therapy (CBT, IPT, DBT)", "Lifestyle interventions", "Support group therapy"],
    color: "#C2185B"
  },
  {
    name: "Trauma & PTSD",
    fact: "70% of adults experience trauma in lifetime",
    treatment: "85% improvement with trauma-informed care",
    signs: ["Intrusive memories or flashbacks", "Avoidance of trauma reminders", "Hypervigilance or easily startled", "Negative changes in thoughts/mood"],
    treatments: ["EMDR Therapy", "Trauma-Focused CBT", "Somatic therapy approaches", "Group trauma recovery"],
    color: "#1565C0"
  },
  {
    name: "Stress & Burnout",
    fact: "77% experience physical stress symptoms",
    treatment: "94% recovery rate with proper support",
    signs: ["Emotional exhaustion", "Cynicism about work/life", "Reduced sense of accomplishment", "Physical symptoms (headaches, insomnia)"],
    treatments: ["Stress reduction techniques", "Boundary setting strategies", "Work-life balance coaching", "Mindfulness & relaxation training"],
    color: "#2E7D32"
  }
];

const conditionsGrid = document.getElementById('conditionsGrid');

conditions.forEach((cond, i) => {
  const card = document.createElement('div');
  card.className = 'condition-card fade-in';
  card.style.setProperty('--card-color', cond.color);
  card.style.transitionDelay = `${i * 100}ms`;
  
  card.innerHTML = `
    <div class="cc-top">
      <h3 class="cc-name">${cond.name}</h3>
      <span class="cc-badge">${cond.treatment}</span>
    </div>
    <p class="cc-fact">📊 ${cond.fact}</p>
    <span class="cc-treatment" style="background: ${cond.color}20; color: ${cond.color};">${cond.treatment}</span>
    <p class="cc-learn">Learn more & find support →</p>
  `;
  
  card.addEventListener('click', () => openConditionModal(cond));
  conditionsGrid.appendChild(card);
  observer.observe(card);
});

// ===================== CONDITION MODAL =====================
const modal = document.getElementById('conditionModal');
const modalBody = document.getElementById('modalBody');
const modalClose = document.getElementById('modalClose');
const modalOverlay = document.getElementById('modalOverlay');

function openConditionModal(cond) {
  modalBody.innerHTML = `
    <div class="modal-cond-name" style="color: ${cond.color};">${cond.name}</div>
    <p class="modal-cond-fact">📊 ${cond.fact}</p>
    
    <div class="modal-section">
      <h4>Common Signs</h4>
      <ul class="modal-list">
        ${cond.signs.map(s => `<li>${s}</li>`).join('')}
      </ul>
    </div>
    
    <div class="modal-section">
      <h4>Evidence-Based Treatments</h4>
      <ul class="modal-list">
        ${cond.treatments.map(t => `<li>${t}</li>`).join('')}
      </ul>
    </div>
    
    <div class="modal-cta">
      <p>Healing is possible. Connect with a specialist who understands.</p>
      <a href="#contact" class="btn btn-primary" onclick="closeModal()">Book Free Consultation →</a>
    </div>
  `;
  
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  modal.classList.remove('open');
  document.body.style.overflow = '';
}

modalClose.addEventListener('click', closeModal);
modalOverlay.addEventListener('click', closeModal);

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeModal();
});

// ===================== SERVICES MODAL =====================
document.querySelectorAll('.service-card').forEach((card) => {
  card.addEventListener('click', () => {
    const title = card.dataset.title || 'Specialized Support';
    const items = (card.dataset.items || '')
      .split('|')
      .map((v) => v.trim())
      .filter(Boolean);

    if (!items.length) return;

    modalBody.innerHTML = `
      <div class="modal-cond-name">${title}</div>
      <p class="modal-cond-fact">Explore support options in this category.</p>

      <div class="modal-section">
        <h4>Specialized Support</h4>
        <ul class="modal-list">
          ${items.map((item) => `<li>${item}</li>`).join('')}
        </ul>
      </div>

      <div class="modal-cta">
        <a href="#contact" class="btn btn-primary" onclick="closeModal()">Book Free Consultation →</a>
      </div>
    `;

    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
  });
});

const servicesOverviewBtn = document.getElementById('servicesOverviewBtn');
if (servicesOverviewBtn) {
  servicesOverviewBtn.addEventListener('click', () => {
    const serviceCards = Array.from(document.querySelectorAll('.service-card'));
    const sectionsHtml = serviceCards.map((card) => {
      const title = card.dataset.title || '';
      const icon = card.querySelector('.service-icon-inline')?.textContent?.trim() || '';
      const items = (card.dataset.items || '')
        .split('|')
        .map((v) => v.trim())
        .filter(Boolean);
      return `
        <div class="modal-section">
          <h4>${icon} ${title}</h4>
          <ul class="modal-list">
            ${items.map((item) => `<li>${item}</li>`).join('')}
          </ul>
        </div>
      `;
    }).join('');

    modalBody.innerHTML = `
      <div class="all-services-view">
        <div class="modal-cond-name">All Services</div>
        ${sectionsHtml}
        <div class="modal-cta">
          <a href="#contact" class="btn btn-primary" onclick="closeModal()">Book Free Consultation →</a>
        </div>
      </div>
    `;

    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
  });
}

// ===================== BRAIN TIPS =====================
const brainTips = [
  { title: "Box Breathing", description: "Inhale 4s → Hold 4s → Exhale 4s → Hold 4s. Repeat for instant calm.", category: "Anxiety Relief", icon: "🫁" },
  { title: "5-4-3-2-1 Grounding", description: "Name 5 things you see, 4 you touch, 3 you hear, 2 you smell, 1 you taste.", category: "Grounding", icon: "🌿" },
  { title: "Cognitive Reframing", description: "Ask: Is this thought 100% true? What would I tell a friend in this situation?", category: "Mental Clarity", icon: "🧠" },
  { title: "Progressive Relaxation", description: "Tense each muscle group for 5 seconds, then release. Start from your toes.", category: "Stress Relief", icon: "💪" },
  { title: "Body Scan Meditation", description: "Close your eyes and scan from head to toe, releasing tension wherever you find it.", category: "Mindfulness", icon: "✨" },
  { title: "Journaling Reset", description: "Write 3 feelings, 3 gratitudes, 1 intention. Takes 5 minutes, shifts everything.", category: "Emotional Health", icon: "📝" }
];

const btGrid = document.getElementById('btGrid');

brainTips.forEach((tip, i) => {
  const card = document.createElement('div');
  card.className = 'bt-card fade-in';
  card.style.transitionDelay = `${i * 80}ms`;
  
  card.innerHTML = `
    <div class="bt-card-top">
      <span class="bt-icon">${tip.icon}</span>
      <span class="bt-category">${tip.category}</span>
    </div>
    <h3 class="bt-title">${tip.title}</h3>
    <p class="bt-desc">${tip.description}</p>
  `;
  
  btGrid.appendChild(card);
  observer.observe(card);
});

// ===================== BREATHING EXERCISE =====================
const breathBox = document.getElementById('breathBox');
const breathText = document.getElementById('breathText');
const breathStart = document.getElementById('breathStart');
const breathSteps = document.querySelectorAll('.bs');
let breathingActive = false;
let breathTimeout;

const phases = [
  { label: 'Inhale...', duration: 4000, class: 'inhale', step: 'inhale' },
  { label: 'Hold...', duration: 4000, class: '', step: 'hold1' },
  { label: 'Exhale...', duration: 4000, class: 'exhale', step: 'exhale' },
  { label: 'Hold...', duration: 4000, class: '', step: 'hold2' }
];

function runBreathing(phaseIndex = 0, cycles = 0) {
  if (!breathingActive || cycles >= 4) {
    breathText.textContent = 'Well done! 🌿';
    breathBox.className = 'breath-box';
    breathSteps.forEach(s => s.classList.remove('active'));
    breathStart.textContent = 'Try Again';
    breathingActive = false;
    return;
  }
  
  const phase = phases[phaseIndex];
  breathText.textContent = phase.label;
  breathBox.className = 'breath-box ' + phase.class;
  
  breathSteps.forEach(s => {
    s.classList.toggle('active', s.getAttribute('data-phase') === phase.step);
  });
  
  breathTimeout = setTimeout(() => {
    const nextPhase = (phaseIndex + 1) % phases.length;
    const nextCycles = nextPhase === 0 ? cycles + 1 : cycles;
    runBreathing(nextPhase, nextCycles);
  }, phase.duration);
}

breathStart.addEventListener('click', () => {
  if (breathingActive) {
    clearTimeout(breathTimeout);
    breathingActive = false;
    breathBox.className = 'breath-box';
    breathText.textContent = 'Press Start';
    breathStart.textContent = 'Start Breathing';
    breathSteps.forEach(s => s.classList.remove('active'));
  } else {
    breathingActive = true;
    breathStart.textContent = 'Stop';
    runBreathing(0, 0);
  }
});

// ===================== FORMS =====================
async function handleForm(form, endpoint, responseEl) {
  const submitBtn = form.querySelector('button[type="submit"]');
  const btnText = submitBtn.querySelector('span');
  const originalText = btnText.textContent;
  
  btnText.textContent = 'Sending...';
  submitBtn.disabled = true;
  
  const data = {};
  new FormData(form).forEach((val, key) => { data[key] = val; });
  
  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const json = await res.json();
    
    responseEl.className = 'form-response ' + (json.success ? 'success' : 'error');
    responseEl.textContent = json.message;
    
    if (json.success) {
      form.reset();
    }
  } catch {
    responseEl.className = 'form-response error';
    responseEl.textContent = 'Something went wrong. Please try again.';
  }
  
  btnText.textContent = originalText;
  submitBtn.disabled = false;
  
  setTimeout(() => {
    responseEl.className = 'form-response';
  }, 6000);
}

const joinForm = document.getElementById('joinForm');
if (joinForm) {
  joinForm.addEventListener('submit', (e) => {
    e.preventDefault();
    handleForm(joinForm, '/api/contact', document.getElementById('joinResponse'));
  });
}

const consultForm = document.getElementById('consultForm');
if (consultForm) {
  consultForm.addEventListener('submit', (e) => {
    e.preventDefault();
    handleForm(consultForm, '/api/consultation', document.getElementById('consultResponse'));
  });
}

// ===================== FADE-IN ELEMENTS =====================
document.querySelectorAll('.section-header, .about-content, .about-visual, .services-process, .breathing-exercise, .join-content, .join-form-card, .contact-info, .contact-form-card, .service-card, .quote-card, .ci-card, .join-role, .pillar, .process-step').forEach(el => {
  el.classList.add('fade-in');
  observer.observe(el);
});

// Add stagger delays to service cards
document.querySelectorAll('.service-card').forEach((card, i) => {
  card.style.transitionDelay = `${i * 80}ms`;
});

// ===================== PARALLAX EFFECT =====================
window.addEventListener('scroll', () => {
  const scrollY = window.scrollY;
  const heroOrbs = document.querySelectorAll('.hero-orb');
  heroOrbs.forEach((orb, i) => {
    const speed = 0.05 + i * 0.02;
    orb.style.transform = `translateY(${scrollY * speed}px)`;
  });
});

// ===================== ACTIVE NAV LINKS =====================
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-link:not(.nav-cta)');

const navObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const id = entry.target.getAttribute('id');
      navLinks.forEach(link => {
        link.classList.toggle('active', link.getAttribute('href') === '#' + id);
      });
    }
  });
}, { threshold: 0.3 });

sections.forEach(s => navObserver.observe(s));

// Active nav link style
const style = document.createElement('style');
style.textContent = `.nav-link.active { color: var(--green) !important; background: rgba(76, 175, 138, 0.08); }`;
document.head.appendChild(style);

console.log('%cBeyond The Body 🌿', 'font-family: serif; font-size: 24px; font-style: italic; color: #4CAF8A;');
console.log('%cWhere healing goes beyond the body.', 'font-size: 14px; color: #7A9080;');
