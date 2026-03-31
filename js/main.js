/**
 * Memryon — main.js
 * Features:
 *  1. Language switcher (UA / EN / PL)
 *  2. Header scroll effect
 *  3. Mobile hamburger menu
 *  4. Scroll reveal animations (IntersectionObserver)
 *  5. Contact form — mailto submission
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
     5. CONTACT FORM — mailto submission
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

    var labels = {
      ua: {
        name: "Ім'я",
        phone: 'Телефон',
        email: 'Email',
        cemetery: 'Кладовище',
        package: 'Пакет',
        burialKnown: 'Місце поховання відоме',
        message: 'Повідомлення',
        subject: 'Нова заявка з сайту Memryon',
        error: 'Будь ласка, заповніть обов\'язкові поля.'
      },
      en: {
        name: 'Name',
        phone: 'Phone',
        email: 'Email',
        cemetery: 'Cemetery',
        package: 'Package',
        burialKnown: 'Burial location known',
        message: 'Message',
        subject: 'New Memryon Order',
        error: 'Please fill in the required fields.'
      },
      pl: {
        name: 'Imię',
        phone: 'Telefon',
        email: 'Email',
        cemetery: 'Cmentarz',
        package: 'Pakiet',
        burialKnown: 'Miejsce pochówku znane',
        message: 'Wiadomość',
        subject: 'Nowe zamówienie Memryon',
        error: 'Proszę wypełnić wymagane pola.'
      }
    };

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      hideError();

      var lang = currentLang;
      var l = labels[lang] || labels['ua'];

      // Collect field values
      var nameVal = (form.querySelector('#field-name') || {}).value || '';
      var phoneVal = (form.querySelector('#field-phone') || {}).value || '';
      var emailVal = (form.querySelector('#field-email') || {}).value || '';

      // Cemetery — get the visible (active lang) select
      var cemeteryVal = '';
      var cemeterySelects = form.querySelectorAll('select[id^="field-cemetery-"]');
      cemeterySelects.forEach(function (sel) {
        if (sel.getAttribute('data-lang') === lang) {
          cemeteryVal = sel.value;
        }
      });

      // Package — get the visible (active lang) select
      var packageVal = '';
      var packageSelects = form.querySelectorAll('select[id^="field-package-"]');
      packageSelects.forEach(function (sel) {
        if (sel.getAttribute('data-lang') === lang) {
          packageVal = sel.value;
        }
      });

      // Burial location known — radio buttons
      var burialVal = '';
      var burialRadios = form.querySelectorAll('input[name="burial_known"]');
      burialRadios.forEach(function (radio) {
        if (radio.checked) {
          burialVal = radio.value;
        }
      });

      var messageVal = (form.querySelector('#field-message') || {}).value || '';

      // Validate required fields
      if (!nameVal.trim() || !phoneVal.trim() || !emailVal.trim()) {
        showError(l.error);
        return;
      }

      // Build mailto body
      var lines = [];
      lines.push(l.name + ': ' + nameVal);
      lines.push(l.phone + ': ' + phoneVal);
      lines.push(l.email + ': ' + emailVal);
      if (cemeteryVal) lines.push(l.cemetery + ': ' + cemeteryVal);
      if (packageVal) lines.push(l.package + ': ' + packageVal);
      if (burialVal) lines.push(l.burialKnown + ': ' + burialVal);
      if (messageVal.trim()) lines.push(l.message + ': ' + messageVal);

      var subject = encodeURIComponent(l.subject);
      var body = encodeURIComponent(lines.join('\n'));

      window.location.href = 'mailto:memryon@gmail.com?subject=' + subject + '&body=' + body;

      // Show success message
      if (formBody) formBody.style.display = 'none';
      if (successMsg) successMsg.classList.add('show');
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
