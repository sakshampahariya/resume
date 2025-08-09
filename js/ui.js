// UI interactions: nav toggle, smooth scroll, active link highlight, modal accessibility, card flip, form validation, VanillaTilt init

// Mobile nav toggle
const hamburger = document.querySelector('.hamburger');
const nav = document.getElementById('site-nav');
if (hamburger && nav) {
  hamburger.addEventListener('click', () => {
    const expanded = hamburger.getAttribute('aria-expanded') === 'true';
    hamburger.setAttribute('aria-expanded', String(!expanded));
    nav.classList.toggle('open');
  });
}

// Smooth scroll for nav anchors
document.querySelectorAll('a[href^="#"]').forEach((a) => {
  a.addEventListener('click', (e) => {
    const id = a.getAttribute('href');
    if (id.length > 1) {
      e.preventDefault();
      document.querySelector(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

// Active section highlight on scroll
const sections = Array.from(document.querySelectorAll('section[id]'));
const links = Array.from(document.querySelectorAll('.nav a'));
const onScroll = () => {
  let current = sections[0];
  const fromTop = window.scrollY + 120;
  sections.forEach((sec) => {
    if (sec.offsetTop <= fromTop) current = sec;
  });
  links.forEach((l) => l.classList.toggle('active', l.getAttribute('href') === `#${current.id}`));
};
document.addEventListener('scroll', onScroll, { passive: true });
window.addEventListener('load', onScroll);

// Card flip (About)
document.querySelectorAll('.flip').forEach((card) => {
  card.addEventListener('click', () => card.classList.toggle('flipped'));
  card.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      card.classList.toggle('flipped');
    }
  });
  card.setAttribute('tabindex', '0');
  card.setAttribute('role', 'button');
  card.setAttribute('aria-pressed', 'false');
});

// VanillaTilt init on cards and project cards
window.addEventListener('load', () => {
  if (window.VanillaTilt) {
    const tiltEls = document.querySelectorAll('.tilt, .project-card');
    window.VanillaTilt.init(tiltEls, {
      max: 8,
      speed: 800,
      glare: true,
      'max-glare': 0.2
    }); // [8][1][17]
  }
});

// Modal logic with focus trap and keyboard navigation
const modal = document.getElementById('project-modal');
const dialog = modal?.querySelector('.modal-dialog');
const closeBtns = modal?.querySelectorAll('[data-close]');
let lastFocused = null;

function openModal() {
  lastFocused = document.activeElement;
  modal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  trapFocus();
}
function closeModal() {
  modal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
  if (lastFocused) lastFocused.focus();
}

modal?.addEventListener('click', (e) => {
  if (e.target.matches('[data-close]') || e.target.classList.contains('modal-backdrop')) closeModal();
});
document.addEventListener('keydown', (e) => {
  if (modal?.getAttribute('aria-hidden') === 'false') {
    if (e.key === 'Escape') closeModal();
    if (e.key === 'ArrowLeft') window.dispatchEvent(new CustomEvent('carousel-prev'));
    if (e.key === 'ArrowRight') window.dispatchEvent(new CustomEvent('carousel-next'));
  }
});

function trapFocus() {
  const focusable = dialog.querySelectorAll('a, button, input, textarea, [tabindex]:not([tabindex="-1"])');
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  dialog.addEventListener('keydown', (e) => {
    if (e.key !== 'Tab') return;
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });
  first?.focus();
}

// Export modal controls for projects.js to use
export { openModal, closeModal };

// Contact form validation + mailto fallback
const form = document.getElementById('contact-form');
if (form) {
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const hp = form.querySelector('#company');
    if (hp && hp.value.trim() !== '') return; // Honeypot tripped

    const name = form.name.value.trim();
    const email = form.email.value.trim();
    const subject = form.subject.value.trim();
    const message = form.message.value.trim();

    // Basic validation
    let valid = true;
    form.querySelectorAll('.error').forEach((el) => (el.textContent = ''));
    if (!name) { valid = false; form.querySelector('#name + .error').textContent = 'Please enter your name.'; }
    if (!email || !/.+@.+\..+/.test(email)) { valid = false; form.querySelector('#email + .error').textContent = 'Enter a valid email.'; }
    if (!subject) { valid = false; form.querySelector('#subject + .error').textContent = 'Subject is required.'; }
    if (!message) { valid = false; form.querySelector('#message + .error').textContent = 'Message can’t be empty.'; }
    if (!valid) return;

    // Optional: Formspree (example)
    // fetch('https://formspree.io/f/your-id', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ name, email, subject, message }) });

    // Fallback: mailto open
    const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\n${message}`);
    const mailto = `mailto:your.email@example.com?subject=${encodeURIComponent(subject)}&body=${body}`;
    window.location.href = mailto;
    form.reset();
  });
}
