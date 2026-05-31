/* =======================================================
   GKS Properties – main.js
   ======================================================= */

document.addEventListener('DOMContentLoaded', () => {

  // ── Mobile Nav ────────────────────────────────────────
  const menuBtn  = document.getElementById('menu-btn');
  const navLinks = document.getElementById('nav-links');

  if (menuBtn && navLinks) {
    menuBtn.addEventListener('click', () => {
      const open = navLinks.classList.toggle('open');
      menuBtn.classList.toggle('open', open);
      menuBtn.setAttribute('aria-expanded', open);
    });

    // Close on outside click
    document.addEventListener('click', e => {
      if (!menuBtn.contains(e.target) && !navLinks.contains(e.target)) {
        navLinks.classList.remove('open');
        menuBtn.classList.remove('open');
      }
    });

    // Close on nav link click
    navLinks.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        navLinks.classList.remove('open');
        menuBtn.classList.remove('open');
      });
    });
  }

  // ── Hero Slider ───────────────────────────────────────
  const slides = document.querySelectorAll('.hero-slide');
  if (slides.length > 1) {
    let current = 0;
    setInterval(() => {
      slides[current].classList.remove('active');
      current = (current + 1) % slides.length;
      slides[current].classList.add('active');
    }, 5000);
  }

  // ── Animated Counters ─────────────────────────────────
  const counters = document.querySelectorAll('.stat-num[data-target]');
  if (counters.length) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.4 });
    counters.forEach(c => observer.observe(c));
  }

  function animateCounter(el) {
    const target  = parseInt(el.dataset.target, 10);
    const suffix  = el.dataset.suffix || (el.textContent.includes('%') ? '%' : '+');
    const duration = 1800;
    const step     = 16;
    const steps    = duration / step;
    const increment = target / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        current = target;
        clearInterval(timer);
      }
      el.textContent = Math.floor(current) + suffix;
    }, step);
  }

  // ── Scroll-to-top Button ──────────────────────────────
  const scrollBtn = document.getElementById('scrollTop');
  if (scrollBtn) {
    window.addEventListener('scroll', () => {
      scrollBtn.classList.toggle('visible', window.scrollY > 500);
    }, { passive: true });
    scrollBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // ── Projects Filter ───────────────────────────────────
  const filterBar = document.getElementById('filterBar');
  const grid      = document.getElementById('projectsGrid');
  const noResults = document.getElementById('noResults');

  if (filterBar && grid) {
    filterBar.addEventListener('click', e => {
      const btn = e.target.closest('.filter-btn');
      if (!btn) return;

      filterBar.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.dataset.filter;
      const cards  = grid.querySelectorAll('.project-card');
      let visible  = 0;

      cards.forEach(card => {
        const cats = card.dataset.category || '';
        const show = filter === 'all' || cats.includes(filter);
        card.style.display = show ? '' : 'none';
        if (show) visible++;
      });

      if (noResults) {
        noResults.style.display = visible === 0 ? 'block' : 'none';
      }
    });

    // Auto-apply filter from URL param
    const params = new URLSearchParams(window.location.search);
    const typeParam = params.get('type');
    if (typeParam) {
      const btn = filterBar.querySelector(`[data-filter="${typeParam}"]`);
      if (btn) btn.click();
    }
  }

  // ── Contact Form – Web3Forms ──────────────────────────
  const contactForm = document.getElementById('contactForm');
  const formSuccess = document.getElementById('formSuccess');

  if (contactForm && formSuccess) {

    // Keep replyto in sync with the email field
    const emailField   = contactForm.querySelector('#email');
    const replytoField = contactForm.querySelector('#replytoField');
    if (emailField && replytoField) {
      emailField.addEventListener('input', () => {
        replytoField.value = emailField.value.trim();
      });
    }

    contactForm.addEventListener('submit', async e => {
      e.preventDefault();

      const fname = contactForm.querySelector('#fname');
      const phone = contactForm.querySelector('#phone');
      const ptype = contactForm.querySelector('#proptype');
      const submitBtn = contactForm.querySelector('[type="submit"]');

      // Client-side validation
      let valid = true;
      [fname, phone, ptype].forEach(field => {
        if (!field.value.trim()) {
          field.style.borderColor = '#ef4444';
          field.focus();
          valid = false;
          setTimeout(() => { field.style.borderColor = ''; }, 3000);
        }
      });
      if (!valid) return;

      // Submit to Web3Forms
      submitBtn.textContent = 'Sending…';
      submitBtn.disabled = true;

      try {
        const formData = new FormData(contactForm);
        const res = await fetch('https://api.web3forms.com/submit', {
          method: 'POST',
          body: formData
        });
        const data = await res.json();

        if (data.success) {
          contactForm.style.display = 'none';
          formSuccess.style.display = 'block';
        } else {
          throw new Error(data.message || 'Submission failed');
        }
      } catch (err) {
        submitBtn.textContent = 'Send Enquiry →';
        submitBtn.disabled = false;
        const errMsg = contactForm.querySelector('.form-error') || document.createElement('p');
        errMsg.className = 'form-error';
        errMsg.style.cssText = 'color:#ef4444;font-size:.85rem;margin-top:10px;';
        errMsg.textContent = '⚠ Something went wrong. Please call us directly or try again.';
        if (!contactForm.querySelector('.form-error')) {
          contactForm.appendChild(errMsg);
        }
        setTimeout(() => { errMsg.remove(); }, 5000);
      }
    });
  }

  // ── Scroll-reveal Animations ──────────────────────────
  const revealEls = document.querySelectorAll(
    '.service-card, .project-card, .stat-card, .testi-card, .why-item, .process-step, .value-card, .team-card, .info-card'
  );

  if (revealEls.length && 'IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.opacity  = '1';
          entry.target.style.transform = 'translateY(0)';
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    revealEls.forEach((el, i) => {
      el.style.opacity   = '0';
      el.style.transform = 'translateY(28px)';
      el.style.transition = `opacity .5s ease ${(i % 4) * 0.08}s, transform .5s ease ${(i % 4) * 0.08}s`;
      revealObserver.observe(el);
    });
  }

  // ── Active nav link highlight ─────────────────────────
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(a => {
    const href = a.getAttribute('href');
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
      a.classList.add('active');
    } else {
      a.classList.remove('active');
    }
  });

});
