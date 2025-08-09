// Main app bootstrap: GSAP animations, scroll progress, buttons ripple, skill bars, visibility pause

// GSAP entrance animations and ScrollTrigger setup (via CDN)
// GSAP usage and plugins guidance per docs/community references.
gsap.registerPlugin(ScrollTrigger); // [18][15][9]

// Scroll progress bar
(() => {
  const bar = document.querySelector('.scroll-progress');
  const update = () => {
    const h = document.documentElement;
    const scrollTop = h.scrollTop || document.body.scrollTop;
    const height = h.scrollHeight - h.clientHeight;
    const progress = height ? (scrollTop / height) * 100 : 0;
    bar.style.width = progress + '%';
  };
  document.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
  update();
})();

// Ripple glow position for buttons
document.addEventListener('pointermove', (e) => {
  document.querySelectorAll('.btn').forEach((btn) => {
    const rect = btn.getBoundingClientRect();
    btn.style.setProperty('--x', `${e.clientX - rect.left}px`);
    btn.style.setProperty('--y', `${e.clientY - rect.top}px`);
  });
});

// GSAP reveals
window.addEventListener('DOMContentLoaded', () => {
  // Hero text entrance
  gsap.from('.headline, .tagline, .cta-row', {
    opacity: 0,
    y: 20,
    duration: 0.8,
    stagger: 0.1,
    ease: 'power2.out'
  }); // [18]

  // Section reveal on scroll
  document.querySelectorAll('.section .container').forEach((el) => {
    gsap.from(el, {
      opacity: 0,
      y: 24,
      duration: 0.7,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: el,
        start: 'top 80%',
        toggleActions: 'play none none reverse'
      }
    }); // [18]
  });

  // Skills bars fill on enter
  document.querySelectorAll('.bar').forEach((bar) => {
    ScrollTrigger.create({
      trigger: bar,
      start: 'top 85%',
      onEnter: () => {
        bar.setAttribute('data-animate', 'in');
        const level = parseInt(bar.dataset.level || '0', 10);
        const span = bar.querySelector('span');
        // Animate width via inline style end state
        span.style.inset = `0 ${Math.max(0, 100 - level)}% 0 0`;
      }
    }); // [18]
  });
});

// Page Visibility: pause Three.js ticker (handled in three-scene.js via exported control)
// We send a custom event listened by the three module
document.addEventListener('visibilitychange', () => {
  window.dispatchEvent(new CustomEvent('app-visibility', { detail: { hidden: document.hidden } }));
});

// Footer year
document.getElementById('year').textContent = new Date().getFullYear();
