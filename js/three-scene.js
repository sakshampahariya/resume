// Three.js hero scene with graceful fallback for mobile / no WebGL
// ES module imports via import map to unpkg pinned version.
// Import map guidance and URLs based on community recommendations.
import * as THREE from 'three'; // [7][10]
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'; // [7]

const state = {
  enabled: false,
  isMobile: /Mobi|Android/i.test(navigator.userAgent),
  scene: null,
  renderer: null,
  camera: null,
  clock: new THREE.Clock(),
  group: null,
  particles: null,
  raf: 0
};

const wrap = document.querySelector('.three-wrap');
const canvas = document.getElementById('hero-canvas');

// Basic WebGL capability check
function canUseWebGL() {
  try {
    const c = document.createElement('canvas');
    return !!(window.WebGLRenderingContext && (c.getContext('webgl') || c.getContext('experimental-webgl')));
  } catch { return false; }
}

// Init minimal scene quickly, then enhance after load (lazy upgrade)
function initScene() {
  if (!wrap || !canvas) return;
  if (state.isMobile || !canUseWebGL()) {
    // Keep CSS fallback visible and skip heavy scene
    canvas.style.display = 'none';
    return; // [10][7]
  }

  state.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  state.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  state.renderer.setSize(wrap.clientWidth, wrap.clientHeight);

  state.scene = new THREE.Scene();
  state.camera = new THREE.PerspectiveCamera(50, wrap.clientWidth / wrap.clientHeight, 0.1, 100);
  state.camera.position.set(0, 0.6, 3);

  // Lighting
  const amb = new THREE.AmbientLight(0x66ffff, 0.6);
  const dir = new THREE.DirectionalLight(0xff66cc, 0.6);
  dir.position.set(2, 3, 2);
  state.scene.add(amb, dir);

  // Group with low-poly geometry
  state.group = new THREE.Group();
  const mats = [
    new THREE.MeshStandardMaterial({ color: 0x00f0ff, roughness: 0.4, metalness: 0.2 }),
    new THREE.MeshStandardMaterial({ color: 0xff4dd2, roughness: 0.4, metalness: 0.2 })
  ];
  const geos = [
    new THREE.IcosahedronGeometry(0.6, 0),
    new THREE.TetrahedronGeometry(0.45, 0),
    new THREE.OctahedronGeometry(0.5, 0)
  ];
  geos.forEach((g, i) => {
    const m = new THREE.Mesh(g, mats[i % mats.length]);
    m.position.set((i - 1) * 0.9, (i === 1 ? 0.3 : -0.2), 0);
    state.group.add(m);
  });
  state.scene.add(state.group);

  // Minimal particles first
  addParticles(300);

  // Controls (disabled interactions; used for damping)
  const controls = new OrbitControls(state.camera, canvas);
  controls.enableZoom = false;
  controls.enablePan = false;
  controls.enableRotate = false;
  controls.enableDamping = true;

  // Parallax via pointer
  const parallax = { x: 0, y: 0 };
  window.addEventListener('pointermove', (e) => {
    const x = (e.clientX / window.innerWidth) * 2 - 1;
    const y = (e.clientY / window.innerHeight) * 2 - 1;
    parallax.x = x * 0.5;
    parallax.y = -y * 0.3;
  }, { passive: true });

  function animate() {
    const t = state.clock.getElapsedTime();
    state.group.rotation.y = t * 0.25;
    state.group.rotation.x = Math.sin(t * 0.2) * 0.1;

    // camera parallax
    state.camera.position.x += (parallax.x - state.camera.position.x) * 0.05;
    state.camera.position.y += (parallax.y - state.camera.position.y) * 0.05;
    state.camera.lookAt(0, 0, 0);

    controls.update();
    state.renderer.render(state.scene, state.camera);
    state.raf = requestAnimationFrame(animate);
  }
  animate();

  state.enabled = true;

  // Upgrade to fuller particle field after a short idle
  setTimeout(() => {
    if (state.enabled) upgradeParticles(state.isMobile ? 400 : 900);
  }, 1200);

  // Resize
  const onResize = () => {
    if (!state.renderer) return;
    const w = wrap.clientWidth, h = wrap.clientHeight;
    state.camera.aspect = w / h;
    state.camera.updateProjectionMatrix();
    state.renderer.setSize(w, h);
  };
  window.addEventListener('resize', onResize);
}

// Particles helpers
function addParticles(count){
  const geom = new THREE.BufferGeometry();
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    positions[i*3+0] = (Math.random()-0.5)*6;
    positions[i*3+1] = (Math.random()-0.5)*3;
    positions[i*3+2] = (Math.random()-0.5)*2;
  }
  geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const mat = new THREE.PointsMaterial({ color: 0x88ffff, size: 0.02, transparent: true, opacity: 0.8 });
  state.particles = new THREE.Points(geom, mat);
  state.scene.add(state.particles);
}
function upgradeParticles(count){
  if (!state.scene || !state.particles) return;
  state.scene.remove(state.particles);
  addParticles(count);
}

// Visibility pause/resume
function setPaused(paused){
  if (paused && state.raf) {
    cancelAnimationFrame(state.raf);
    state.raf = 0;
  } else if (!paused && state.enabled && !state.raf) {
    state.clock.start();
    const tick = () => {
      const t = state.clock.getElapsedTime();
      state.group.rotation.y = t * 0.25;
      state.group.rotation.x = Math.sin(t * 0.2) * 0.1;
      state.renderer.render(state.scene, state.camera);
      state.raf = requestAnimationFrame(tick);
    };
    tick();
  }
}

// Listen for app visibility changes from main.js
window.addEventListener('app-visibility', (e) => {
  setPaused(e.detail.hidden);
});

// Init after load
window.addEventListener('load', initScene);
