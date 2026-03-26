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
  handleNavScroll(); // run on load

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
    { threshold: 0.35 }
  );

  sections.forEach((section) => sectionObserver.observe(section));

  /* ── Mobile Navigation Toggle ────────────── */
  const navToggle = document.getElementById('nav-toggle');
  const navMenu = document.getElementById('nav-menu');

  if (navToggle && navMenu) {
    navToggle.addEventListener('click', () => {
      const isOpen = navMenu.classList.toggle('open');
      navToggle.classList.toggle('open', isOpen);
      navToggle.setAttribute('aria-expanded', isOpen.toString());
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    // Close on nav link click
    navMenu.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('open');
        navToggle.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      });
    });

    // Close on outside click
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
          revealObserver.unobserve(entry.target); // animate once
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -50px 0px' }
  );

  revealEls.forEach((el) => revealObserver.observe(el));

  // Auto-apply reveal class to section content (except hero which has its own)
  const autoReveal = document.querySelectorAll(
    '.service-card, .secondary-card, .about-img, .about-stats, .media-card, ' +
    '.testimonial-card, .big-quote, .education-block, .about-body p'
  );

  autoReveal.forEach((el, i) => {
    if (!el.classList.contains('reveal')) {
      el.classList.add('reveal');
      // Stagger cards within grids
      const parent = el.parentElement;
      const siblings = parent
        ? Array.from(parent.children).filter((c) => c.classList.contains(el.className.split(' ')[0]))
        : [];
      const idx = siblings.indexOf(el);
      if (idx > 0) {
        el.style.transitionDelay = `${idx * 0.1}s`;
      }
    }
    revealObserver.observe(el);
  });

  /* ── Testimonials Slider ─────────────────── */
  const track = document.getElementById('testimonials-track');
  const dotsContainer = document.getElementById('slider-dots');
  const prevBtn = document.getElementById('slider-prev');
  const nextBtn = document.getElementById('slider-next');

  if (track && dotsContainer && prevBtn && nextBtn) {
    const cards = Array.from(track.querySelectorAll('.testimonial-card'));
    let current = 0;
    let isDragging = false;
    let startX = 0;
    let dragOffset = 0;

    function getVisibleCount() {
      const w = window.innerWidth;
      if (w <= 768) return 1;
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
      const dots = dotsContainer.querySelectorAll('.dot');
      dots.forEach((d, i) => d.classList.toggle('active', i === current));
    }

    function goTo(index) {
      current = Math.max(0, Math.min(index, getMaxIndex()));
      const cardWidth = cards[0].offsetWidth;
      const gap = 24; // 1.5rem gap
      const offset = current * (cardWidth + gap);
      track.style.transform = `translateX(-${offset}px)`;
      updateDots();
    }

    prevBtn.addEventListener('click', () => goTo(current - 1));
    nextBtn.addEventListener('click', () => goTo(current + 1));

    // Keyboard accessibility
    prevBtn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); goTo(current - 1); }
    });
    nextBtn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); goTo(current + 1); }
    });

    // Touch/drag support
    track.addEventListener('mousedown', (e) => {
      isDragging = true;
      startX = e.clientX;
      track.style.transition = 'none';
      dragOffset = 0;
    });

    document.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      dragOffset = e.clientX - startX;
      const cardWidth = cards[0].offsetWidth;
      const gap = 24;
      const base = current * (cardWidth + gap);
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

    // Touch events
    track.addEventListener('touchstart', (e) => {
      startX = e.touches[0].clientX;
      track.style.transition = 'none';
      dragOffset = 0;
    }, { passive: true });

    track.addEventListener('touchmove', (e) => {
      dragOffset = e.touches[0].clientX - startX;
      const cardWidth = cards[0].offsetWidth;
      const gap = 24;
      const base = current * (cardWidth + gap);
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
      if (!isDragging) {
        goTo(current >= getMaxIndex() ? 0 : current + 1);
      }
    }, 5000);

    // Pause on hover
    const sliderRegion = document.getElementById('testimonials-slider');
    sliderRegion?.addEventListener('mouseenter', () => clearInterval(autoPlay));
    sliderRegion?.addEventListener('mouseleave', () => {
      autoPlay = setInterval(() => {
        if (!isDragging) goTo(current >= getMaxIndex() ? 0 : current + 1);
      }, 5000);
    });

    // Rebuild on resize
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

  /* ── Newsletter Form ─────────────────────── */
  const form = document.getElementById('newsletter-form');

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const name = form.querySelector('#form-name');
      const email = form.querySelector('#form-email');
      const btn = form.querySelector('button[type="submit"]');

      // Simple validation
      if (!email.value || !email.value.includes('@')) {
        email.style.borderColor = '#c0392b';
        email.focus();
        setTimeout(() => (email.style.borderColor = ''), 2500);
        return;
      }

      // Simulate submission
      btn.textContent = 'Sending…';
      btn.disabled = true;

      setTimeout(() => {
        btn.textContent = '✓ You\'re on the list!';
        btn.style.background = '#2e7d5e';
        btn.style.borderColor = '#2e7d5e';
        form.querySelector('#form-name').value = '';
        form.querySelector('#form-email').value = '';
        setTimeout(() => {
          btn.textContent = 'Count Me In';
          btn.style.background = '';
          btn.style.borderColor = '';
          btn.disabled = false;
        }, 4000);
      }, 1200);
    });
  }

  /* ── Smooth Anchor Scroll (offset for fixed nav) ── */
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      const navH = parseInt(getComputedStyle(document.documentElement)
        .getPropertyValue('--nav-h')) || 76;
      const top = target.getBoundingClientRect().top + window.scrollY - navH - 12;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });

  /* ── Vimeo background video fallback ─────── */
  // Pause logos animation when tab is hidden (performance)
  document.addEventListener('visibilitychange', () => {
    const logoSlide = document.querySelector('.logos-slide');
    if (!logoSlide) return;
    logoSlide.style.animationPlayState =
      document.hidden ? 'paused' : 'running';
  });

})();
