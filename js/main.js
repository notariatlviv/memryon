/**
 * Memryon — main.js
 * Features:
 *  1. Language switcher (UA / EN / PL)
 *  2. Header scroll effect
 *  3. Mobile hamburger menu
 *  4. Scroll reveal animations (IntersectionObserver)
 *  5. Contact form — FormSubmit.co submission
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

    // Disable hidden language form fields and remove required to prevent validation issues
    document.querySelectorAll('.form__select[data-lang], .form__input[data-lang]').forEach(function (el) {
      if (el.getAttribute('data-lang') === lang) {
        el.disabled = false;
      } else {
        el.disabled = true;
        el.required = false;
      }
    });

    // Update active state on lang buttons
    document.querySelectorAll('.lang-btn').forEach(function (btn) {
      btn.classList.toggle('active', btn.getAttribute('data-lang-btn') === lang);
    });

    // Update html lang attribute for accessibility
    var htmlLang = lang === 'ua' ? 'uk' : lang === 'pl' ? 'pl' : 'en';
    document.documentElement.lang = htmlLang;
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
     5. CONTACT FORM — FormSubmit.co submission
  ========================================================= */

  function initContactForm() {
    var form = document.getElementById('contact-form');
    var errorMsg = document.getElementById('form-error');
    if (!form) return;

    var errorMessages = {
      ua: 'Будь ласка, заповніть обов\'язкові поля.',
      en: 'Please fill in the required fields.',
      pl: 'Proszę wypełnić wymagane pola.'
    };

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

    var subjectByLang = {
      ua: 'Нове замовлення з сайту Memryon',
      en: 'New order from Memryon website',
      pl: 'Nowe zamówienie ze strony Memryon'
    };

    form.addEventListener('submit', function (e) {
      hideError();

      var lang = currentLang;

      // Validate required fields; prevent submission if invalid
      var nameVal = (form.querySelector('#field-name') || {}).value || '';
      var phoneVal = (form.querySelector('#field-phone') || {}).value || '';
      var emailVal = (form.querySelector('#field-email') || {}).value || '';

      if (!nameVal.trim() || !phoneVal.trim() || !emailVal.trim()) {
        e.preventDefault();
        showError(errorMessages[lang] || errorMessages['ua']);
        return;
      }

      // Update email subject to match the active language
      var subjectField = form.querySelector('input[name="_subject"]');
      if (subjectField) {
        subjectField.value = subjectByLang[lang] || subjectByLang['ua'];
      }

      // Disable hidden language fields to avoid duplicate form data
      form.querySelectorAll('select[data-lang], input[data-lang]').forEach(function (el) {
        if (el.getAttribute('data-lang') !== lang) {
          el.disabled = true;
        }
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
