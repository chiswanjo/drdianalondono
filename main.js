/* =============================================
   main.js — Dr. Diana Londoño Website
   Interactive behaviors & enhancements
   ============================================= */

(function () {
  'use strict';

  /* ── Footer Year ─────────────────────────── */
  const yearEl = document.getElementById('footer-year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ── Sticky Nav on Scroll ────────────────── */
  const navHeader = document.getElementById('nav-header');

  function handleNavScroll() {
    if (window.scrollY > 40) {
      navHeader.classList.add('scrolled');
    } else {
      navHeader.classList.remove('scrolled');
    }
  }

  window.addEventListener('scroll', handleNavScroll, { passive: true });
  handleNavScroll();

  /* ── Active Nav Link on Scroll ───────────── */
  const sections = document.querySelectorAll('main section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id');
          navLinks.forEach((link) => {
            link.classList.toggle(
              'active',
              link.getAttribute('href') === `#${id}`
            );
          });
        }
      });
    },
    { threshold: 0.3 }
  );

  sections.forEach((section) => sectionObserver.observe(section));

  /* ── Mobile Navigation Toggle ────────────── */
  const navToggle = document.getElementById('nav-toggle');
  const navMenu   = document.getElementById('nav-menu');

  if (navToggle && navMenu) {
    navToggle.addEventListener('click', () => {
      const isOpen = navMenu.classList.toggle('open');
      navToggle.classList.toggle('open', isOpen);
      navToggle.setAttribute('aria-expanded', isOpen.toString());
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    navMenu.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('open');
        navToggle.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      });
    });

    document.addEventListener('click', (e) => {
      if (
        navMenu.classList.contains('open') &&
        !navMenu.contains(e.target) &&
        !navToggle.contains(e.target)
      ) {
        navMenu.classList.remove('open');
        navToggle.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      }
    });
  }

  /* ── Scroll Reveal Animations ────────────── */
  const revealEls = document.querySelectorAll('.reveal');

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
  );

  revealEls.forEach((el) => revealObserver.observe(el));

  // Auto-apply reveal to content cards
  const autoReveal = document.querySelectorAll(
    '.service-card, .secondary-card, .about-img, .about-stats, ' +
    '.media-card, .testimonial-card, .big-quote, .education-block, ' +
    '.about-body p, .wave-pillar, .phase-card, .problem-card, ' +
    '.video-card'
  );

  autoReveal.forEach((el) => {
    if (!el.classList.contains('reveal')) {
      el.classList.add('reveal');
      const cls = el.classList[0];
      const siblings = el.parentElement
        ? Array.from(el.parentElement.children).filter(c => c.classList.contains(cls))
        : [];
      const idx = siblings.indexOf(el);
      if (idx > 0) el.style.transitionDelay = `${idx * 0.1}s`;
    }
    revealObserver.observe(el);
  });

  /* ── Video Testimonials Modal ────────────── */
  const videoModal    = document.getElementById('video-modal');
  const videoEmbed    = document.getElementById('video-modal-embed');
  const videoClose    = document.getElementById('video-modal-close');
  const videoBackdrop = document.getElementById('video-modal-backdrop');

  function openVideoModal(url) {
    if (!videoModal || !videoEmbed) return;

    // Convert YouTube Shorts URL → embed URL
    let embedUrl = url;

    // youtube.com/shorts/ID → embed
    const shortsMatch = url.match(/youtube\.com\/shorts\/([\w-]+)/);
    if (shortsMatch) {
      embedUrl = `https://www.youtube.com/embed/${shortsMatch[1]}?autoplay=1&rel=0`;
    }
    // youtu.be/ID → embed
    const shortMatch = url.match(/youtu\.be\/([\w-]+)/);
    if (shortMatch) {
      embedUrl = `https://www.youtube.com/embed/${shortMatch[1]}?autoplay=1&rel=0`;
    }
    // vimeo.com/ID → embed
    const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
    if (vimeoMatch) {
      embedUrl = `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1`;
    }

    videoEmbed.innerHTML = `
      <iframe
        src="${embedUrl}"
        frameborder="0"
        allow="autoplay; fullscreen; picture-in-picture"
        allowfullscreen
        title="Testimonial video"
      ></iframe>`;

    videoModal.removeAttribute('hidden');
    document.body.style.overflow = 'hidden';
    videoClose.focus();
  }

  function closeVideoModal() {
    if (!videoModal) return;
    videoModal.setAttribute('hidden', '');
    videoEmbed.innerHTML = '';
    document.body.style.overflow = '';
  }

  // Attach to all video thumb buttons
  document.querySelectorAll('.video-thumb-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const url = btn.getAttribute('data-video-url');
      if (url) openVideoModal(url);
    });
  });

  if (videoClose)    videoClose.addEventListener('click', closeVideoModal);
  if (videoBackdrop) videoBackdrop.addEventListener('click', closeVideoModal);

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && videoModal && !videoModal.hasAttribute('hidden')) {
      closeVideoModal();
    }
  });

  /* ── Testimonials Slider ─────────────────── */
  const track        = document.getElementById('testimonials-track');
  const dotsContainer = document.getElementById('slider-dots');
  const prevBtn      = document.getElementById('slider-prev');
  const nextBtn      = document.getElementById('slider-next');

  if (track && dotsContainer && prevBtn && nextBtn) {
    const cards = Array.from(track.querySelectorAll('.testimonial-card'));
    let current    = 0;
    let isDragging = false;
    let startX     = 0;
    let dragOffset = 0;

    function getVisibleCount() {
      const w = window.innerWidth;
      if (w <= 768)  return 1;
      if (w <= 1024) return 2;
      return 3;
    }

    function getMaxIndex() {
      return Math.max(0, cards.length - getVisibleCount());
    }

    function buildDots() {
      dotsContainer.innerHTML = '';
      const max = getMaxIndex();
      for (let i = 0; i <= max; i++) {
        const dot = document.createElement('button');
        dot.classList.add('dot');
        dot.setAttribute('role', 'listitem');
        dot.setAttribute('aria-label', `Go to testimonial ${i + 1}`);
        if (i === current) dot.classList.add('active');
        dot.addEventListener('click', () => goTo(i));
        dotsContainer.appendChild(dot);
      }
    }

    function updateDots() {
      dotsContainer.querySelectorAll('.dot').forEach((d, i) =>
        d.classList.toggle('active', i === current)
      );
    }

    function goTo(index) {
      current = Math.max(0, Math.min(index, getMaxIndex()));
      const cardWidth = cards[0].offsetWidth;
      const gap       = 24;
      track.style.transform = `translateX(-${current * (cardWidth + gap)}px)`;
      updateDots();
    }

    prevBtn.addEventListener('click', () => goTo(current - 1));
    nextBtn.addEventListener('click', () => goTo(current + 1));

    prevBtn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); goTo(current - 1); }
    });
    nextBtn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); goTo(current + 1); }
    });

    // Mouse drag
    track.addEventListener('mousedown', (e) => {
      isDragging = true;
      startX = e.clientX;
      track.style.transition = 'none';
      dragOffset = 0;
    });
    document.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      dragOffset = e.clientX - startX;
      const base = current * (cards[0].offsetWidth + 24);
      track.style.transform = `translateX(${-base + dragOffset}px)`;
    });
    document.addEventListener('mouseup', () => {
      if (!isDragging) return;
      isDragging = false;
      track.style.transition = '';
      if (Math.abs(dragOffset) > 60) {
        goTo(dragOffset < 0 ? current + 1 : current - 1);
      } else {
        goTo(current);
      }
      dragOffset = 0;
    });

    // Touch drag
    track.addEventListener('touchstart', (e) => {
      startX = e.touches[0].clientX;
      track.style.transition = 'none';
      dragOffset = 0;
    }, { passive: true });
    track.addEventListener('touchmove', (e) => {
      dragOffset = e.touches[0].clientX - startX;
      const base = current * (cards[0].offsetWidth + 24);
      track.style.transform = `translateX(${-base + dragOffset}px)`;
    }, { passive: true });
    track.addEventListener('touchend', () => {
      track.style.transition = '';
      if (Math.abs(dragOffset) > 50) {
        goTo(dragOffset < 0 ? current + 1 : current - 1);
      } else {
        goTo(current);
      }
      dragOffset = 0;
    });

    // Auto-advance
    let autoPlay = setInterval(() => {
      if (!isDragging) goTo(current >= getMaxIndex() ? 0 : current + 1);
    }, 5000);

    const sliderRegion = document.getElementById('testimonials-slider');
    sliderRegion?.addEventListener('mouseenter', () => clearInterval(autoPlay));
    sliderRegion?.addEventListener('mouseleave', () => {
      autoPlay = setInterval(() => {
        if (!isDragging) goTo(current >= getMaxIndex() ? 0 : current + 1);
      }, 5000);
    });

    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        buildDots();
        goTo(Math.min(current, getMaxIndex()));
      }, 200);
    });

    buildDots();
    goTo(0);
  }

  /* ── Contact Form ────────────────────────── */
  const form = document.getElementById('newsletter-form');

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const email = form.querySelector('#form-email');
      const btn   = form.querySelector('button[type="submit"]');

      if (!email.value || !email.value.includes('@')) {
        email.style.borderColor = '#e05c5c';
        email.focus();
        setTimeout(() => (email.style.borderColor = ''), 2500);
        return;
      }

      btn.textContent = 'Sending…';
      btn.disabled    = true;

      setTimeout(() => {
        btn.textContent            = '✓ Message Received!';
        btn.style.background       = 'var(--teal)';
        btn.style.borderColor      = 'var(--teal)';
        btn.style.color            = '#fff';
        form.querySelector('#form-name').value    = '';
        form.querySelector('#form-email').value   = '';
        form.querySelector('#form-message').value = '';
        setTimeout(() => {
          btn.textContent       = 'Send a Message';
          btn.style.background  = '';
          btn.style.borderColor = '';
          btn.style.color       = '';
          btn.disabled          = false;
        }, 4000);
      }, 1200);
    });
  }

  /* ── Smooth Anchor Scroll ────────────────── */
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      const navH = parseInt(
        getComputedStyle(document.documentElement).getPropertyValue('--nav-h')
      ) || 76;
      const top = target.getBoundingClientRect().top + window.scrollY - navH - 12;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });

  /* ── Pause logo animation when tab hidden ── */
  document.addEventListener('visibilitychange', () => {
    const logoSlide = document.querySelector('.logos-slide');
    if (!logoSlide) return;
    logoSlide.style.animationPlayState = document.hidden ? 'paused' : 'running';
  });

})();
