/* ================================================
   main.js — Portfolio JavaScript
   Navigation, Particles, TypeWriter, Filter,
   Search, Modal, Form Validation, Scroll Reveal
   ================================================ */

'use strict';

/* ===========================
   UTILITIES
   =========================== */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

/* ===========================
   NAV BAR SCROLL + MOBILE MENU
   =========================== */
(function initNav() {
  const navbar = $('#navbar');
  const navToggle = $('#navToggle');
  const navMenu = $('#navMenu');
  const navLinks = $$('.nav-link');

  // Scroll: add class to navbar
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 30);
  }, { passive: true });

  // Mobile toggle
  navToggle.addEventListener('click', () => {
    const isOpen = navMenu.classList.toggle('open');
    navToggle.classList.toggle('open', isOpen);
    navToggle.setAttribute('aria-expanded', isOpen.toString());
  });

  // Close menu on link click (mobile)
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      navMenu.classList.remove('open');
      navToggle.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });

  // Close on outside click
  document.addEventListener('click', (e) => {
    if (!navbar.contains(e.target)) {
      navMenu.classList.remove('open');
      navToggle.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    }
  });

  // Active nav link on scroll (Intersection Observer)
  const sections = $$('section[id]');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navLinks.forEach(l => l.classList.remove('active'));
        const active = navLinks.find(l => l.dataset.section === entry.target.id);
        if (active) active.classList.add('active');
      }
    });
  }, { threshold: 0.35 });

  sections.forEach(s => observer.observe(s));
})();

/* ===========================
   PARTICLE CANVAS
   =========================== */
(function initParticles() {
  const canvas = document.getElementById('particleCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let particles = [];
  let animId;
  let W, H;

  const PARTICLE_COUNT = Math.min(80, Math.floor(window.innerWidth / 14));
  const CONNECT_DIST = 120;
  const COLORS = ['rgba(56,189,248,', 'rgba(167,139,250,', 'rgba(244,114,182,'];

  function resize() {
    W = canvas.width = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }

  function Particle() {
    this.x = Math.random() * W;
    this.y = Math.random() * H;
    this.vx = (Math.random() - 0.5) * 0.5;
    this.vy = (Math.random() - 0.5) * 0.5;
    this.r = Math.random() * 2 + 1;
    this.color = COLORS[Math.floor(Math.random() * COLORS.length)];
    this.alpha = Math.random() * 0.5 + 0.2;
  }

  Particle.prototype.update = function() {
    this.x += this.vx;
    this.y += this.vy;
    if (this.x < 0 || this.x > W) this.vx *= -1;
    if (this.y < 0 || this.y > H) this.vy *= -1;
  };

  Particle.prototype.draw = function() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
    ctx.fillStyle = this.color + this.alpha + ')';
    ctx.fill();
  };

  function connectParticles() {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < CONNECT_DIST) {
          const alpha = (1 - dist / CONNECT_DIST) * 0.15;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(56,189,248,${alpha})`;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      }
    }
  }

  function animate() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => { p.update(); p.draw(); });
    connectParticles();
    animId = requestAnimationFrame(animate);
  }

  function init() {
    resize();
    particles = Array.from({ length: PARTICLE_COUNT }, () => new Particle());
    if (animId) cancelAnimationFrame(animId);
    animate();
  }

  window.addEventListener('resize', () => {
    clearTimeout(window._resizeTimer);
    window._resizeTimer = setTimeout(init, 250);
  });

  // Pause when not in viewport
  const heroObs = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting) { if (!animId) animate(); }
    else { cancelAnimationFrame(animId); animId = null; }
  });
  heroObs.observe(canvas.closest('section'));

  // Respect prefers-reduced-motion
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    init();
  }
})();

/* ===========================
   TYPEWRITER EFFECT
   =========================== */
(function initTypewriter() {
  const el = document.getElementById('typewriter');
  if (!el) return;

  const phrases = [
    'Full Stack Developer',
    'Software Engineer',
    'Problem Solver',
  ];

  let phraseIdx = 0;
  let charIdx = 0;
  let deleting = false;
  let pauseTimer = null;

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    el.textContent = phrases[0];
    return;
  }

  function type() {
    const current = phrases[phraseIdx];
    if (deleting) {
      charIdx--;
      el.textContent = current.substring(0, charIdx);
      if (charIdx === 0) {
        deleting = false;
        phraseIdx = (phraseIdx + 1) % phrases.length;
        pauseTimer = setTimeout(type, 500);
        return;
      }
      pauseTimer = setTimeout(type, 60);
    } else {
      charIdx++;
      el.textContent = current.substring(0, charIdx);
      if (charIdx === current.length) {
        deleting = true;
        pauseTimer = setTimeout(type, 1800);
        return;
      }
      pauseTimer = setTimeout(type, 95);
    }
  }

  setTimeout(type, 600);
})();

/* ===========================
   SCROLL REVEAL
   =========================== */
(function initScrollReveal() {
  const elements = $$('.glass-card, .section-header, .about-text, .hero-content, .contact-info');
  elements.forEach(el => el.classList.add('reveal'));

  const obs = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => entry.target.classList.add('revealed'), i * 60);
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  elements.forEach(el => obs.observe(el));
})();

/* ===========================
   PROJECT FILTERING + SEARCH
   =========================== */
(function initProjects() {
  const grid = $('#projectsGrid');
  const cards = $$('.project-card');
  const filterBtns = $$('.filter-btn');
  const searchInput = $('#projectSearch');
  const noResults = $('#noResults');
  let activeFilter = 'all';

  function applyFiltersAndSearch() {
    const query = (searchInput.value || '').toLowerCase().trim();
    let visible = 0;

    cards.forEach(card => {
      const tags = card.dataset.tags || '';
      const titleText = (card.querySelector('.project-title')?.textContent || '').toLowerCase();
      const descText = (card.querySelector('.project-description')?.textContent || '').toLowerCase();
      const techText = $$('.tech-badge', card).map(b => b.textContent.toLowerCase()).join(' ');

      const matchFilter = activeFilter === 'all' || tags.includes(activeFilter);
      const matchSearch = !query || titleText.includes(query) || descText.includes(query) || techText.includes(query);

      const show = matchFilter && matchSearch;
      card.style.display = show ? '' : 'none';
      if (show) visible++;
    });

    noResults.style.display = (visible === 0) ? 'block' : 'none';
  }

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeFilter = btn.dataset.filter;
      applyFiltersAndSearch();
    });
  });

  let searchDebounce;
  searchInput.addEventListener('input', () => {
    clearTimeout(searchDebounce);
    searchDebounce = setTimeout(applyFiltersAndSearch, 220);
  });
})();

/* ===========================
   PROJECT MODAL
   =========================== */
(function initModal() {
  const modal = $('#projectModal');
  const modalContent = $('#modalContent');
  const closeBtn = $('#modalClose');

  const projectData = {
    projectReborn: {
      icon: '👕',
      title: 'REBORN — Custom Clothing Platform',
      tech: [
        { label: 'Spring Boot', cls: 'tech-badge--java' },
        { label: 'React', cls: 'tech-badge--web' },
        { label: 'MySQL', cls: 'tech-badge--db' },
        { label: 'Tailwind CSS', cls: '' },
        { label: 'JWT', cls: '' },
      ],
      description: 'A full-stack e-commerce platform for customizable clothing with JWT-based authentication, user dashboards, and real-time customization features built on a scalable architecture.',
      highlights: [
        'Implemented JWT-based secure authentication for personalized user sessions',
        'Developed real-time clothing customization features for a unique shopping experience',
        'Architected a production-ready scalable backend using Spring Boot and MySQL',
        'Built a responsive and dynamic frontend using React and Tailwind CSS'
      ],
      date: '2024',
      github: 'https://github.com/nishantpathak53',
    },
    projectRideMyCar: {
      icon: '🚗',
      title: 'Ride My Car — Vehicle Rental Web App',
      tech: [
        { label: 'HTML', cls: 'tech-badge--web' },
        { label: 'CSS', cls: 'tech-badge--web' },
        { label: 'JavaScript', cls: 'tech-badge--web' },
        { label: 'Clean Architecture', cls: '' },
      ],
      description: 'A responsive web-based vehicle rental platform with secure login/signup. Features a clean architecture and modular design for an optimized frontend experience.',
      highlights: [
        'Implemented a responsive vehicle rental web platform with seamless login/signup flows',
        'Designed a clean architecture with modular code structure for better maintainability',
        'Optimized frontend performance and accessibility for an enhanced user experience'
      ],
      date: '2024',
      github: 'https://github.com/nishantpathak53',
    },
  };

  function openModal(projectId) {
    const data = projectData[projectId];
    if (!data) return;

    const techHTML = data.tech.map(t =>
      `<span class="tech-badge ${t.cls}">${t.label}</span>`
    ).join('');

    const highlightsHTML = data.highlights.map(h => `<li>${h}</li>`).join('');

    modalContent.innerHTML = `
      <div class="modal-project-icon">${data.icon}</div>
      <h2 class="gradient-text">${data.title}</h2>
      <div class="modal-tech">${techHTML}</div>
      <p class="modal-desc">${data.description}</p>
      <h4>Key Achievements</h4>
      <ul>${highlightsHTML}</ul>
      <p class="cert-date" style="margin-top:12px">📅 ${data.date}</p>
      <div class="modal-actions">
        <a href="${data.github}" target="_blank" rel="noopener noreferrer" class="btn btn-primary">
          <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16" aria-hidden="true"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>
          View on GitHub
        </a>
        <button class="btn btn-secondary" onclick="document.getElementById('projectModal').style.display='none'">Close</button>
      </div>
    `;

    modal.style.display = 'flex';
    modal.focus();
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    modal.style.display = 'none';
    document.body.style.overflow = '';
  }

  // Open on card click or Enter/Space
  $$('.project-card').forEach(card => {
    card.addEventListener('click', (e) => {
      if (e.target.closest('.project-link')) return;
      openModal(card.id);
    });
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openModal(card.id);
      }
    });
    // "Details" button inside card
    const detailsBtn = card.querySelector('.btn-details');
    if (detailsBtn) {
      detailsBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        openModal(card.id);
      });
    }
  });

  closeBtn.addEventListener('click', closeModal);

  // Close on overlay click
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  // ESC key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.style.display !== 'none') closeModal();
  });
})();

/* ===========================
   CONTACT FORM VALIDATION
   =========================== */
(function initContactForm() {
  const form = $('#contactForm');
  if (!form) return;

  const fields = {
    contactName: { errorId: 'nameError', label: 'Name', rules: { required: true, minLen: 2 } },
    contactEmail: { errorId: 'emailError', label: 'Email', rules: { required: true, email: true } },
    contactSubject: { errorId: 'subjectError', label: 'Subject', rules: { required: true, minLen: 3 } },
    contactMessage: { errorId: 'messageError', label: 'Message', rules: { required: true, minLen: 15 } },
  };

  const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  function validateField(id) {
    const config = fields[id];
    const input = document.getElementById(id);
    const errorEl = document.getElementById(config.errorId);
    const val = input.value.trim();
    let msg = '';

    if (config.rules.required && !val) {
      msg = `${config.label} is required.`;
    } else if (config.rules.minLen && val.length < config.rules.minLen) {
      msg = `${config.label} must be at least ${config.rules.minLen} characters.`;
    } else if (config.rules.email && !EMAIL_REGEX.test(val)) {
      msg = 'Please enter a valid email address.';
    }

    errorEl.textContent = msg;
    input.classList.toggle('error', !!msg);
    return !msg;
  }

  // Live validation on blur
  Object.keys(fields).forEach(id => {
    const input = document.getElementById(id);
    input.addEventListener('blur', () => validateField(id));
    input.addEventListener('input', () => {
      if (input.classList.contains('error')) validateField(id);
    });
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Validate all
    let allValid = true;
    Object.keys(fields).forEach(id => {
      if (!validateField(id)) allValid = false;
    });

    if (!allValid) return;

    const submitBtn = $('#formSubmitBtn');
    const btnText = submitBtn.querySelector('.btn-text');
    const btnLoading = submitBtn.querySelector('.btn-loading');
    const feedback = $('#formFeedback');

    // Show loading
    btnText.style.display = 'none';
    btnLoading.style.display = 'inline-flex';
    submitBtn.disabled = true;
    feedback.className = 'form-feedback';
    feedback.style.display = 'none';

    // Simulate async submission (client-side demo)
    await new Promise(resolve => setTimeout(resolve, 1600));

    // Reset button
    btnText.style.display = '';
    btnLoading.style.display = 'none';
    submitBtn.disabled = false;

    // Success state
    feedback.textContent = '✅ Message sent! Thank you — Nishant will get back to you soon.';
    feedback.className = 'form-feedback success';
    form.reset();

    // Clear errors
    Object.keys(fields).forEach(id => {
      document.getElementById(fields[id].errorId).textContent = '';
      document.getElementById(id).classList.remove('error');
    });

    // Auto-hide after 6s
    setTimeout(() => {
      feedback.className = 'form-feedback';
      feedback.style.display = 'none';
    }, 6000);
  });
})();

/* ===========================
   SMOOTH ANCHOR SCROLL
   =========================== */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    const href = this.getAttribute('href');
    if (href === '#') return;
    const target = document.querySelector(href);
    if (target) {
      e.preventDefault();
      const offset = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--navbar-height')) || 70;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  });
});

/* ===========================
   CERT TAG FILTER
   =========================== */
(function initCertFilter() {
  const filterBtns = $$('.cert-filter-btn');
  const certCards  = $$('.cert-card');
  const noResults  = $('#certNoResults');
  if (!filterBtns.length) return;

  let activeFilter = 'all';

  function applyCertFilter() {
    let visible = 0;
    certCards.forEach(card => {
      const tags = (card.dataset.certTags || '').split(' ');
      const show = activeFilter === 'all' || tags.includes(activeFilter);
      card.style.display = show ? '' : 'none';
      if (show) visible++;
    });
    if (noResults) noResults.style.display = visible === 0 ? 'block' : 'none';
  }

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeFilter = btn.dataset.certFilter;
      applyCertFilter();
    });
  });
})();

/* ===========================
   CERTIFICATE VIEWER MODAL
   =========================== */
(function initCertViewer() {
  const overlay    = $('#certViewerModal');
  const closeBtn   = $('#certViewerClose');
  const imgEl      = $('#certViewerImg');
  const loader     = $('#certViewerLoader');
  const titleEl    = $('#certViewerTitle');
  const issuerEl   = $('#certViewerIssuer');
  const idEl       = $('#certViewerId');
  if (!overlay) return;

  function openCertViewer(btn) {
    const src    = btn.dataset.certImg;
    const title  = btn.dataset.certTitle;
    const issuer = btn.dataset.certIssuer;
    const certId = btn.dataset.certId || '';

    titleEl.textContent  = title  || '';
    issuerEl.textContent = issuer || '';
    idEl.textContent     = certId ? `🪪 ${certId}` : '';
    idEl.style.display   = certId ? '' : 'none';

    // Reset image state
    imgEl.classList.remove('loaded');
    imgEl.src = '';
    loader.style.display = 'flex';

    overlay.style.display = 'flex';
    overlay.focus();
    document.body.style.overflow = 'hidden';

    // Load image
    const tempImg = new Image();
    tempImg.onload = () => {
      imgEl.src = src;
      imgEl.alt = title;
      imgEl.classList.add('loaded');
      loader.style.display = 'none';
    };
    tempImg.onerror = () => {
      loader.style.display = 'none';
      imgEl.alt = 'Certificate image not found';
    };
    tempImg.src = src;
  }

  function closeCertViewer() {
    overlay.style.display = 'none';
    imgEl.classList.remove('loaded');
    imgEl.src = '';
    document.body.style.overflow = '';
  }

  // Attach to all "View Certificate" buttons
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.cert-view-btn');
    if (btn && btn.dataset.certImg) {
      e.stopPropagation();
      openCertViewer(btn);
    }
  });

  closeBtn.addEventListener('click', closeCertViewer);

  // Click outside image area closes
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeCertViewer();
  });

  // ESC closes
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && overlay.style.display !== 'none') closeCertViewer();
  });
})();

/* ===========================
   SERVICE WORKER REGISTRATION
   =========================== */
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js')
      .then((reg) => console.log('Service Worker registered successfully.', reg))
      .catch((err) => console.error('Service Worker registration failed:', err));
  });
}
