const menuToggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('.site-nav');
const navLinks = Array.from(document.querySelectorAll('.site-nav a'));
const revealItems = document.querySelectorAll('.reveal');

const trackGaEvent = (eventName, params = {}) => {
  if (typeof window.gtag !== 'function') return;
  window.gtag('event', eventName, params);
};

const bindContactClicksTracking = () => {
  const links = document.querySelectorAll('a[href]');
  links.forEach((link) => {
    const href = (link.getAttribute('href') || '').toLowerCase();
    if (href.includes('wa.me/')) {
      link.addEventListener('click', () => {
        trackGaEvent('click_whatsapp', {
          link_url: link.href,
          page_location: window.location.href
        });
      });
    }
    if (href.includes('t.me/')) {
      link.addEventListener('click', () => {
        trackGaEvent('click_telegram', {
          link_url: link.href,
          page_location: window.location.href
        });
      });
    }
  });
};

bindContactClicksTracking();

if (menuToggle && nav) {
  menuToggle.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('open');
    menuToggle.setAttribute('aria-expanded', String(isOpen));
  });

  navLinks.forEach((link) => {
    link.addEventListener('click', () => {
      nav.classList.remove('open');
      menuToggle.setAttribute('aria-expanded', 'false');
    });
  });
}

const sectionIds = navLinks
  .map((link) => link.getAttribute('href'))
  .filter((href) => href && href.startsWith('#'));
const sections = sectionIds
  .map((id) => document.querySelector(id))
  .filter(Boolean);

const setActiveLink = () => {
  const offset = window.scrollY + 120;
  let activeId = '#home';

  sections.forEach((section) => {
    if (offset >= section.offsetTop) {
      activeId = `#${section.id}`;
    }
  });

  navLinks.forEach((link) => {
    link.classList.toggle('active', link.getAttribute('href') === activeId);
  });
};

let isScrollTicking = false;
const onScroll = () => {
  if (isScrollTicking) return;
  isScrollTicking = true;
  requestAnimationFrame(() => {
    setActiveLink();
    isScrollTicking = false;
  });
};

window.addEventListener('scroll', onScroll, { passive: true });
setActiveLink();

if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.18 }
  );

  revealItems.forEach((item) => observer.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add('visible'));
}

const graphValue = document.querySelector('.graph-value');
const graphPercent = document.querySelector('.graph-percent');
const prefersReducedMotion =
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const isCoarsePointer =
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(pointer: coarse)').matches;
const reduceStartupMotion = prefersReducedMotion || isCoarsePointer;

if (graphValue && graphPercent) {
  const startValue = Number(graphValue.getAttribute('data-start')) || 25000;
  const endValue = Number(graphValue.getAttribute('data-target')) || 50000;
  const startPercent = Number(graphPercent.getAttribute('data-start')) || 25;
  const endPercent = Number(graphPercent.getAttribute('data-target')) || 50;
  let frameId = null;

  const animateGraphValue = () => {
    if (frameId) cancelAnimationFrame(frameId);
    const duration = 2900;
    const start = performance.now();
    graphValue.textContent = `$${startValue.toLocaleString('en-US')}`;
    graphPercent.textContent = `${startPercent}%`;

    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = Math.floor(startValue + (endValue - startValue) * eased);
      const percent = Math.floor(startPercent + (endPercent - startPercent) * eased);
      graphValue.textContent = `$${value.toLocaleString('en-US')}`;
      graphPercent.textContent = `${percent}%`;
      if (progress < 1) frameId = requestAnimationFrame(tick);
    };

    frameId = requestAnimationFrame(tick);
  };

  if (reduceStartupMotion) {
    graphValue.textContent = `$${endValue.toLocaleString('en-US')}`;
    graphPercent.textContent = `${endPercent}%`;
  } else {
    setTimeout(animateGraphValue, 120);
  }
}
