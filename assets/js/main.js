/* =========================================================
   Mar Alegría — Interacciones
   Tema claro/oscuro · Idiomas · Navegación · Formulario
   JavaScript nativo, sin dependencias.
   ========================================================= */
(() => {
  'use strict';

  /* -------------------------------------------------------
     Configuración editable
     Cambia el número de WhatsApp por el del salón (código de
     país + número, sin espacios, guiones ni el signo +).
     ------------------------------------------------------- */
  const CONFIG = {
    whatsapp: '51942865182'
  };

  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));
  const waLink = (message) => `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(message)}`;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const I18N = window.MA && window.MA.i18n;
  const t = (key, vars) => (I18N ? I18N.t(key, vars) : '');

  const storage = {
    get(key) {
      try { return window.localStorage.getItem(key); } catch (e) { return null; }
    },
    set(key, value) {
      try { window.localStorage.setItem(key, value); } catch (e) {}
    }
  };

  /* -------------------------------------------------------
     Tema claro / oscuro
     ------------------------------------------------------- */
  const themeMeta = $('meta[name="theme-color"]');
  const themeButtons = $$('.js-theme');

  const syncThemeButtons = () => {
    const isDark = document.documentElement.dataset.theme === 'dark';
    themeButtons.forEach((button) => {
      button.setAttribute('aria-pressed', String(isDark));
      button.setAttribute('aria-label', t(isDark ? 'theme.toLight' : 'theme.toDark'));
      button.title = t(isDark ? 'theme.toLight' : 'theme.toDark');
    });
    if (themeMeta) themeMeta.setAttribute('content', isDark ? '#05122f' : '#ffffff');
  };

  const setTheme = (theme, animate = true) => {
    const next = theme === 'dark' ? 'dark' : 'light';
    document.documentElement.dataset.theme = next;
    document.documentElement.style.colorScheme = next;
    storage.set('ma-theme', next);
    syncThemeButtons();

    if (animate && !reduceMotion) {
      document.documentElement.classList.add('theme-anim');
      window.setTimeout(() => document.documentElement.classList.remove('theme-anim'), 360);
    }
  };

  themeButtons.forEach((button) => {
    button.addEventListener('click', () => {
      setTheme(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark');
    });
  });

  /* -------------------------------------------------------
     Idioma
     ------------------------------------------------------- */
  const langSwitchers = $$('[data-lang-switcher]');
  const supportedLangs = I18N ? I18N.supported : ['es', 'en', 'pt'];
  const langNames = { es: 'Español', en: 'English', pt: 'Português' };
  let activeLangSwitcher = null;

  const closeLangSwitcher = (switcher, restoreFocus = false) => {
    if (!switcher) return;

    const trigger = $('.lang-switcher__trigger', switcher);
    switcher.classList.remove('is-open');
    if (trigger) {
      trigger.setAttribute('aria-expanded', 'false');
      if (activeLangSwitcher === switcher) activeLangSwitcher = null;
      if (restoreFocus) trigger.focus();
    } else if (activeLangSwitcher === switcher) {
      activeLangSwitcher = null;
    }
  };

  const closeLangSwitchers = (except = null) => {
    langSwitchers.forEach((switcher) => {
      if (switcher !== except) closeLangSwitcher(switcher);
    });
  };

  const syncLangSwitchers = (lang) => {
    langSwitchers.forEach((switcher) => {
      const value = $('[data-lang-value]', switcher);
      const trigger = $('.lang-switcher__trigger', switcher);
      if (value) value.textContent = lang.toUpperCase();
      if (trigger) {
        const label = t('nav.language') || 'Idioma';
        trigger.setAttribute('aria-label', `${label}: ${langNames[lang] || lang.toUpperCase()}`);
      }

      $$('.lang-switcher__option', switcher).forEach((option) => {
        const isActive = option.dataset.lang === lang;
        option.classList.toggle('is-active', isActive);
        option.setAttribute('aria-checked', isActive ? 'true' : 'false');
      });
    });
  };

  const updateChromeLabels = () => {
    syncThemeButtons();

    const navToggle = $('#navToggle');
    if (navToggle) {
      const isOpen = navToggle.getAttribute('aria-expanded') === 'true';
      navToggle.setAttribute('aria-label', t(isOpen ? 'nav.menuClose' : 'nav.menuOpen'));
    }

    const toTop = $('#toTop');
    if (toTop) toTop.setAttribute('aria-label', t('cta.top'));
  };

  const setLanguage = (lang, { persist = true } = {}) => {
    const code = supportedLangs.includes(lang) ? lang : 'es';
    if (persist) storage.set('ma-lang', code);

    if (I18N) I18N.apply(code);
    else document.documentElement.lang = code;

    syncLangSwitchers(code);
    updateChromeLabels();
    refreshWhatsAppLinks();
    resetFormFeedback();
  };

  langSwitchers.forEach((switcher) => {
    const trigger = $('.lang-switcher__trigger', switcher);
    const options = $$('.lang-switcher__option', switcher);
    if (!trigger || !options.length) return;

    const focusRelativeOption = (step) => {
      const currentIndex = options.indexOf(document.activeElement);
      const activeIndex = options.findIndex((option) => option.classList.contains('is-active'));
      const start = currentIndex === -1 ? Math.max(activeIndex, 0) : currentIndex;
      const nextIndex = (start + step + options.length) % options.length;
      options[nextIndex].focus();
    };

    const openSwitcher = () => {
      closeLangSwitchers(switcher);
      switcher.classList.add('is-open');
      trigger.setAttribute('aria-expanded', 'true');
      activeLangSwitcher = switcher;

      const current = options.find((option) => option.classList.contains('is-active')) || options[0];
      if (current) current.focus();
    };

    trigger.addEventListener('click', () => {
      if (switcher.classList.contains('is-open')) closeLangSwitcher(switcher);
      else openSwitcher();
    });

    trigger.addEventListener('keydown', (event) => {
      if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
      event.preventDefault();
      if (!switcher.classList.contains('is-open')) openSwitcher();
      else focusRelativeOption(event.key === 'ArrowDown' ? 1 : -1);
    });

    options.forEach((option) => {
      option.addEventListener('click', () => {
        setLanguage(option.dataset.lang);
        closeLangSwitcher(switcher, true);
      });

      option.addEventListener('keydown', (event) => {
        if (event.key === 'ArrowDown') {
          event.preventDefault();
          focusRelativeOption(1);
        } else if (event.key === 'ArrowUp') {
          event.preventDefault();
          focusRelativeOption(-1);
        } else if (event.key === 'Home') {
          event.preventDefault();
          options[0].focus();
        } else if (event.key === 'End') {
          event.preventDefault();
          options[options.length - 1].focus();
        } else if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          option.click();
        } else if (event.key === 'Escape') {
          event.preventDefault();
          event.stopPropagation();
          closeLangSwitcher(switcher, true);
        } else if (event.key === 'Tab') {
          closeLangSwitcher(switcher);
        }
      });
    });

    switcher.addEventListener('keydown', (event) => {
      if (event.key !== 'Escape') return;
      event.preventDefault();
      event.stopPropagation();
      closeLangSwitcher(switcher, true);
    });
  });

  document.addEventListener('click', (event) => {
    if (!event.target.closest('[data-lang-switcher]')) closeLangSwitchers();
  });

  document.addEventListener('focusin', (event) => {
    if (activeLangSwitcher && !activeLangSwitcher.contains(event.target)) {
      closeLangSwitcher(activeLangSwitcher);
    }
  });

  /* -------------------------------------------------------
     Header, volver arriba y año del footer
     ------------------------------------------------------- */
  const header = $('#siteHeader');
  const toTop = $('#toTop');
  let ticking = false;

  const updateOnScroll = () => {
    const y = window.scrollY;
    if (header) header.classList.toggle('is-scrolled', y > 24);
    if (toTop) toTop.classList.toggle('is-visible', y > 700);
    ticking = false;
  };

  const requestScrollUpdate = () => {
    if (!ticking) {
      ticking = true;
      window.requestAnimationFrame(updateOnScroll);
    }
  };

  window.addEventListener('scroll', requestScrollUpdate, { passive: true });
  window.addEventListener('resize', requestScrollUpdate, { passive: true });
  updateOnScroll();

  if (toTop) {
    toTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
    });
  }

  const yearElement = $('#year');
  if (yearElement) yearElement.textContent = String(new Date().getFullYear());

  /* -------------------------------------------------------
     Menú móvil accesible
     ------------------------------------------------------- */
  const navToggle = $('#navToggle');
  const mobileMenu = $('#mobileMenu');
  let lastFocused = null;

  const closeMenu = (restoreFocus = true) => {
    if (!mobileMenu || !mobileMenu.classList.contains('is-open')) return;

    mobileMenu.classList.remove('is-open');
    mobileMenu.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('no-scroll');
    if (header) header.classList.remove('is-menu-open');

    if (navToggle) {
      navToggle.setAttribute('aria-expanded', 'false');
      navToggle.setAttribute('aria-label', t('nav.menuOpen'));
    }

    if (restoreFocus && lastFocused) lastFocused.focus();
  };

  const openMenu = () => {
    if (!mobileMenu || !navToggle) return;

    lastFocused = document.activeElement;
    closeLangSwitchers();
    mobileMenu.classList.add('is-open');
    mobileMenu.setAttribute('aria-hidden', 'false');
    document.body.classList.add('no-scroll');
    navToggle.setAttribute('aria-expanded', 'true');
    navToggle.setAttribute('aria-label', t('nav.menuClose'));
    if (header) header.classList.add('is-menu-open');

    const firstLink = $('a', mobileMenu);
    if (firstLink) window.setTimeout(() => firstLink.focus(), 130);
  };

  if (navToggle && mobileMenu) {
    navToggle.addEventListener('click', () => {
      if (mobileMenu.classList.contains('is-open')) closeMenu();
      else openMenu();
    });

    $$('a', mobileMenu).forEach((link) => {
      link.addEventListener('click', () => closeMenu(false));
    });

    document.addEventListener('keydown', (event) => {
      if (!mobileMenu.classList.contains('is-open')) return;

      if (event.key === 'Escape') {
        event.preventDefault();
        closeMenu();
        return;
      }

      if (event.key !== 'Tab') return;

      const focusable = $$('a[href], button:not([disabled]), select', mobileMenu)
        .filter((element) => element.offsetParent !== null);

      if (!focusable.length) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    });

    const desktopQuery = window.matchMedia('(min-width: 1020px)');
    const handleDesktopChange = (event) => {
      if (event.matches) closeMenu(false);
    };

    if (typeof desktopQuery.addEventListener === 'function') {
      desktopQuery.addEventListener('change', handleDesktopChange);
    } else if (typeof desktopQuery.addListener === 'function') {
      desktopQuery.addListener(handleDesktopChange);
    }
  }

  /* -------------------------------------------------------
     Carrusel sutil del hero
     ------------------------------------------------------- */
  const hero = $('.hero');
  const heroSlides = $$('.hero__slide');
  const heroDots = $$('.hero__dot');
  const heroCurrent = $('#heroCurrent');
  let heroIndex = 0;
  let heroTimer = null;

  const showHeroSlide = (index) => {
    if (!heroSlides.length) return;

    heroIndex = (index + heroSlides.length) % heroSlides.length;

    heroSlides.forEach((slide, i) => {
      slide.classList.toggle('is-active', i === heroIndex);
    });

    heroDots.forEach((dot, i) => {
      const isActive = i === heroIndex;
      dot.classList.toggle('is-active', isActive);
      dot.setAttribute('aria-current', isActive ? 'true' : 'false');
    });

    if (heroCurrent) {
      heroCurrent.textContent = String(heroIndex + 1).padStart(2, '0');
    }
  };

  const stopHero = () => {
    if (heroTimer !== null) {
      window.clearInterval(heroTimer);
      heroTimer = null;
    }
  };

  const startHero = () => {
    stopHero();
    if (reduceMotion || heroSlides.length < 2) return;
    heroTimer = window.setInterval(() => showHeroSlide(heroIndex + 1), 7000);
  };

  if (hero && heroSlides.length) {
    heroDots.forEach((dot) => {
      dot.addEventListener('click', () => {
        showHeroSlide(Number(dot.dataset.slideTo));
        startHero();
      });
    });

    hero.addEventListener('pointerenter', stopHero);
    hero.addEventListener('pointerleave', startHero);
    hero.addEventListener('focusin', stopHero);
    hero.addEventListener('focusout', (event) => {
      if (!hero.contains(event.relatedTarget)) startHero();
    });

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) stopHero();
      else startHero();
    });

    showHeroSlide(0);
    startHero();
  }

  /* -------------------------------------------------------
     Revelado progresivo al hacer scroll
     ------------------------------------------------------- */
  const revealElements = $$('.reveal');

  if (!('IntersectionObserver' in window) || reduceMotion) {
    revealElements.forEach((element) => element.classList.add('is-visible'));
  } else {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -30px' });

    revealElements.forEach((element) => revealObserver.observe(element));
  }

  /* -------------------------------------------------------
     Navegación de categorías (página de servicios)
     ------------------------------------------------------- */
  const catLinks = $$('.cat-nav a');
  const catTargets = catLinks
    .map((link) => document.querySelector(link.getAttribute('href')))
    .filter(Boolean);

  const setActiveCategory = (id) => {
    catLinks.forEach((link) => {
      const isActive = link.getAttribute('href') === '#' + id;
      if (isActive) link.setAttribute('aria-current', 'true');
      else link.removeAttribute('aria-current');
    });
  };

  if (catLinks.length && 'IntersectionObserver' in window) {
    const catObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) setActiveCategory(entry.target.id);
      });
    }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });

    catTargets.forEach((target) => catObserver.observe(target));

    catLinks.forEach((link) => {
      link.addEventListener('click', () => {
        setActiveCategory(link.getAttribute('href').slice(1));
      });
    });

    if (location.hash) setActiveCategory(location.hash.slice(1));
  }

  /* -------------------------------------------------------
     Enlaces de WhatsApp con mensaje contextual
     ------------------------------------------------------- */
  function refreshWhatsAppLinks() {
    const defaultLink = waLink(t('wa.default'));

    $$('.js-wa').forEach((link) => {
      link.href = defaultLink;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
    });

    $$('.js-wa-service').forEach((link) => {
      const key = link.dataset.serviceKey;
      const service = (key && t(key)) || link.dataset.service || t('nav.services');
      link.href = waLink(t('wa.service', { service }));
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.setAttribute('aria-label', t('cta.reserveLabel', { service }));
    });
  }

  /* -------------------------------------------------------
     Formulario de contacto → WhatsApp
     ------------------------------------------------------- */
  const form = $('#contactForm');

  const resetFormFeedback = () => {
    if (!form) return;
    $$('.field__error', form).forEach((error) => {
      error.textContent = '';
      error.classList.remove('is-visible');
    });
    $$('[aria-invalid]', form).forEach((input) => input.removeAttribute('aria-invalid'));
    const status = $('#formStatus');
    if (status) {
      status.textContent = '';
      status.classList.remove('is-visible');
    }
  };

  if (form) {
    const nameInput = $('#name');
    const phoneInput = $('#phone');
    const serviceSelect = $('#service');
    const messageInput = $('#message');
    const formStatus = $('#formStatus');

    const validators = [
      {
        input: nameInput,
        error: $('#nameError'),
        key: 'form.errorName',
        test: (value) => value.trim().length >= 2
      },
      {
        input: phoneInput,
        error: $('#phoneError'),
        key: 'form.errorPhone',
        test: (value) => value.replace(/\D/g, '').length >= 7
      },
      {
        input: serviceSelect,
        error: $('#serviceError'),
        key: 'form.errorService',
        test: (value) => value !== ''
      }
    ];

    const showFieldError = (input, errorElement, message) => {
      if (!input) return;
      input.setAttribute('aria-invalid', 'true');
      if (errorElement) {
        errorElement.textContent = message;
        errorElement.classList.add('is-visible');
      }
    };

    const clearFieldError = (input, errorElement) => {
      if (!input) return;
      input.removeAttribute('aria-invalid');
      if (errorElement) {
        errorElement.textContent = '';
        errorElement.classList.remove('is-visible');
      }
    };

    validators.forEach(({ input, error }) => {
      if (!input) return;
      const clearOnInput = () => {
        if (input.getAttribute('aria-invalid') === 'true') clearFieldError(input, error);
      };
      input.addEventListener('input', clearOnInput);
      input.addEventListener('change', clearOnInput);
    });

    form.addEventListener('submit', (event) => {
      event.preventDefault();

      let firstInvalid = null;

      validators.forEach(({ input, error, key, test }) => {
        if (!input) return;

        if (test(input.value)) {
          clearFieldError(input, error);
        } else {
          showFieldError(input, error, t(key));
          if (!firstInvalid) firstInvalid = input;
        }
      });

      if (firstInvalid) {
        firstInvalid.focus();
        if (formStatus) {
          formStatus.textContent = t('form.review');
          formStatus.classList.add('is-visible');
        }
        return;
      }

      const firstName = nameInput.value.trim().split(/\s+/)[0];
      const serviceName = serviceSelect.options[serviceSelect.selectedIndex].text;

      let body = [
        t('wa.greeting'),
        '',
        t('wa.intro'),
        '',
        `• ${t('wa.name')}: ${nameInput.value.trim()}`,
        `• ${t('wa.phone')}: ${phoneInput.value.trim()}`,
        `• ${t('wa.serviceLabel')}: ${serviceName}`
      ].join('\n');

      if (messageInput && messageInput.value.trim()) {
        body += `\n• ${t('wa.message')}: ${messageInput.value.trim()}`;
      }

      body += `\n\n${t('wa.thanks')}`;

      if (formStatus) {
        formStatus.textContent = t('form.success', { name: firstName });
        formStatus.classList.add('is-visible');
      }

      const link = document.createElement('a');
      link.href = waLink(body);
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      document.body.appendChild(link);
      link.click();
      link.remove();
    });
  }

  /* -------------------------------------------------------
     Arranque
     ------------------------------------------------------- */
  const initialLang = supportedLangs.includes(document.documentElement.lang)
    ? document.documentElement.lang
    : 'es';

  setLanguage(initialLang, { persist: false });
  syncThemeButtons();

  window.addEventListener('storage', (event) => {
    if (event.key === 'ma-theme' && event.newValue) setTheme(event.newValue, false);
    if (event.key === 'ma-lang' && event.newValue) setLanguage(event.newValue, { persist: false });
  });
})();
