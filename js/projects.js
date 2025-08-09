// Projects data and rendering + modal population
import { openModal } from './ui.js';

// Placeholder tiny SVG preview as data URI
const placeholderSVG = (title = 'Preview') =>
  `data:image/svg+xml;utf8,` +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='800' height='450'>
      <defs>
        <linearGradient id='g' x1='0' x2='1'><stop offset='0' stop-color='%2300f0ff'/><stop offset='1' stop-color='%23ff4dd2'/></linearGradient>
      </defs>
      <rect width='100%' height='100%' fill='%230b0f14'/>
      <g fill='none' stroke='url(%23g)' stroke-width='3' opacity='0.8'>
        <rect x='50' y='40' width='700' height='370' rx='20' />
        <circle cx='200' cy='225' r='80'/>
        <circle cx='600' cy='225' r='60'/>
      </g>
      <text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='%23c6f9ff' font-family='Inter' font-size='28'>${title}</text>
    </svg>`
  );

// Edit your projects here
const projects = [
  {
    id: 'p1',
    title: 'Neon Dashboard',
    description: 'A blazing-fast analytics dashboard with reactive charts and accessible keyboard navigation.',
    images: [placeholderSVG('Neon Dashboard 1'), placeholderSVG('Neon Dashboard 2')],
    tags: ['JavaScript', 'GSAP', 'A11y'],
    repo: '#',
    demo: '#'
  },
  {
    id: 'p2',
    title: '3D Landing',
    description: 'Hero with Three.js geometry and particles, graceful fallback for low-end devices.',
    images: [placeholderSVG('3D Landing 1'), placeholderSVG('3D Landing 2')],
    tags: ['Three.js', 'Performance'],
    repo: '#',
    demo: '#'
  },
  {
    id: 'p3',
    title: 'Design System',
    description: 'Composable tokens, theming, and motion guidelines for a multi-brand platform.',
    images: [placeholderSVG('Design System 1')],
    tags: ['Design', 'Tokens', 'Docs'],
    repo: '#',
    demo: '#'
  }
];

const grid = document.getElementById('project-grid');

function renderProjects(){
  if (!grid) return;
  grid.innerHTML = '';
  projects.forEach((p) => {
    const card = document.createElement('article');
    card.className = 'project-card tilt';
    card.setAttribute('tabindex', '0');
    card.setAttribute('role', 'button');
    card.setAttribute('aria-label', `${p.title} details`);

    const image = document.createElement('div');
    image.className = 'project-thumb';
    image.innerHTML = `<img src="${p.images[0]}" alt="Preview of ${p.title}" loading="lazy" />`;
