/**
 * Memryon — main.js
 * Features:
 *  1. Language switcher (UA / EN)
 *  2. Header scroll effect
 *  3. Mobile hamburger menu
 *  4. Scroll reveal animations (IntersectionObserver)
 *  5. Contact form handling (success message)
 *  6. Smooth anchor scroll
 */

(function () {
  'use strict';

  /* =========================================================
     1. LANGUAGE SWITCHER
  ========================================================= */

  const LANG_KEY = 'memryon_lang';
  let currentLang = localStorage.getItem(LANG_KEY) || 'ua';

  function applyLanguage(lang) {
    currentLang = lang;
    localStorage.setItem(LANG_KEY, lang);

    // Show/hide language-specific elements
    document.querySelectorAll('[data-lang]').forEach(function (el) {
      if (el.getAttribute('data-lang') === lang) {
        el.style.display = '';
      } else {
        el.style.display = 'none';
      }
    });

    // Update active state on lang buttons
    document.querySelectorAll('.lang-btn').forEach(function (btn) {
      btn.classList.toggle('active', btn.getAttribute('data-lang-btn') === lang);
    });

    // Update html lang attribute for accessibility
    document.documentElement.lang = lang === 'ua' ? 'uk' : 'en';
  }

  function initLanguageSwitcher() {
    document.querySelectorAll('.lang-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        applyLanguage(btn.getAttribute('data-lang-btn'));
      });
    });

    applyLanguage(currentLang);
  }

  /* =========================================================
     2. HEADER SCROLL EFFECT
  ========================================================= */

  function initHeaderScroll() {
    var header = document.querySelector('.header');
    if (!header) return;

    function onScroll() {
      header.classList.toggle('scrolled', window.scrollY > 40);
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* =========================================================
     3. MOBILE HAMBURGER MENU
  ========================================================= */

  function initMobileMenu() {
    var hamburger = document.querySelector('.hamburger');
    var mobileNav = document.querySelector('.mobile-nav');
    if (!hamburger || !mobileNav) return;

    function closeMenu() {
      hamburger.classList.remove('open');
      mobileNav.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }

    hamburger.addEventListener('click', function () {
      var isOpen = hamburger.classList.toggle('open');
      mobileNav.classList.toggle('open', isOpen);
      hamburger.setAttribute('aria-expanded', String(isOpen));
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    // Close on nav link click
    mobileNav.querySelectorAll('.nav__link').forEach(function (link) {
      link.addEventListener('click', closeMenu);
    });

    // Close on Escape
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeMenu();
    });

    // Close when clicking outside
    document.addEventListener('click', function (e) {
      if (
        !hamburger.contains(e.target) &&
        !mobileNav.contains(e.target) &&
        mobileNav.classList.contains('open')
      ) {
        closeMenu();
      }
    });
  }

  /* =========================================================
     4. SCROLL REVEAL ANIMATIONS
  ========================================================= */

  function initScrollReveal() {
    var elements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');
    if (!elements.length) return;

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );

    elements.forEach(function (el) {
      observer.observe(el);
    });
  }

  /* =========================================================
     5. CONTACT FORM
  ========================================================= */

  function initContactForm() {
    var form = document.getElementById('contact-form');
    var formBody = document.getElementById('form-body');
    var successMsg = document.getElementById('form-success');
    var errorMsg = document.getElementById('form-error');
    if (!form) return;

    function showError(msg) {
      if (errorMsg) {
        errorMsg.textContent = msg;
        errorMsg.style.display = 'block';
        errorMsg.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }

    function hideError() {
      if (errorMsg) {
        errorMsg.style.display = 'none';
        errorMsg.textContent = '';
      }
    }

    // Before submit: disable hidden-language selects so they don't submit duplicate fields
    form.addEventListener('submit', function (e) {
      hideError();

      // Sync: disable hidden-language selects so only the active lang select submits
      form.querySelectorAll('select[data-lang]').forEach(function (sel) {
        var isVisible = sel.getAttribute('data-lang') === currentLang;
        sel.disabled = !isVisible;
      });

      // Allow FormSubmit to handle submission naturally via action attribute.
      if (form.getAttribute('data-ajax') !== 'true') {
        return; // let default form submit happen
      }

      e.preventDefault();

      var submitBtn = form.querySelector('.form__submit');
      submitBtn.disabled = true;

      var data = new FormData(form);

      fetch(form.action, {
        method: 'POST',
        body: data,
        headers: { Accept: 'application/json' }
      })
        .then(function (resp) {
          if (resp.ok) {
            if (formBody) formBody.style.display = 'none';
            if (successMsg) successMsg.classList.add('show');
          } else {
            submitBtn.disabled = false;
            showError(currentLang === 'ua'
              ? 'Помилка відправки. Спробуйте ще раз.'
              : 'Submission error. Please try again.');
          }
        })
        .catch(function () {
          submitBtn.disabled = false;
          showError(currentLang === 'ua'
            ? 'Помилка мережі. Спробуйте ще раз.'
            : 'Network error. Please try again.');
        });
    });
  }

  /* =========================================================
     6. SMOOTH SCROLL FOR ANCHOR LINKS
  ========================================================= */

  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(function (link) {
      link.addEventListener('click', function (e) {
        var targetId = link.getAttribute('href').slice(1);
        var target = document.getElementById(targetId);
        if (!target) return;

        e.preventDefault();

        var headerHeight = document.querySelector('.header')
          ? document.querySelector('.header').offsetHeight
          : 0;

        var top = target.getBoundingClientRect().top + window.scrollY - headerHeight - 12;

        window.scrollTo({ top: top, behavior: 'smooth' });
      });
    });
  }

  /* =========================================================
     INIT
  ========================================================= */

  document.addEventListener('DOMContentLoaded', function () {
    initLanguageSwitcher();
    initHeaderScroll();
    initMobileMenu();
    initScrollReveal();
    initContactForm();
    initSmoothScroll();
  });
})();
