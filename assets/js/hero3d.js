/**
 * Three.js WebGL 3D Deep-Space Overlay for the Hero Banner.
 * Follows threejs-web-animation best practices:
 * - DPR clamped to 1.5
 * - ACESFilmicToneMapping
 * - Exponential smooth camera lerp
 * - Graceful pause when tab hidden & clean fallback if WebGL unavailable
 */
(async function initHero3D() {
  const canvas = document.getElementById("hero-3d-canvas");
  if (!canvas) return;
  if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  let THREE;
  try {
    THREE = await import("https://cdn.jsdelivr.net/npm/three@0.164.1/build/three.module.js");
  } catch (_) {
    return; // Graceful fallback: hero keyart still shines cleanly
  }

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      powerPreference: "high-performance"
    });
  } catch (_) {
    return;
  }

  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.2;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 140);
  camera.position.set(0, 0.2, 18);

  // 1. Multi-depth additive starfield (cyan, white-blue, solar gold)
  const starCount = 1600;
  const starPos = new Float32Array(starCount * 3);
  const starCol = new Float32Array(starCount * 3);
  const palette = [
    new THREE.Color(0x38e8ff),
    new THREE.Color(0xeef6ff),
    new THREE.Color(0xf0b956),
    new THREE.Color(0x9bd2ff)
  ];
  for (let i = 0; i < starCount; i++) {
    starPos[i * 3] = (Math.random() - 0.5) * 48;
    starPos[i * 3 + 1] = (Math.random() - 0.5) * 28;
    starPos[i * 3 + 2] = (Math.random() - 0.5) * 32 - 4;
    const c = palette[i % palette.length];
    starCol[i * 3] = c.r;
    starCol[i * 3 + 1] = c.g;
    starCol[i * 3 + 2] = c.b;
  }
  const starGeo = new THREE.BufferGeometry();
  starGeo.setAttribute("position", new THREE.BufferAttribute(starPos, 3));
  starGeo.setAttribute("color", new THREE.BufferAttribute(starCol, 3));
  const starMat = new THREE.PointsMaterial({
    size: 0.085,
    vertexColors: true,
    transparent: true,
    opacity: 0.78,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });
  const stars = new THREE.Points(starGeo, starMat);
  scene.add(stars);

  // 2. Orbital Solar Particle Halo aligned right-center over Dyson citadel
  const ringCount = 520;
  const ringPos = new Float32Array(ringCount * 3);
  const ringCol = new Float32Array(ringCount * 3);
  for (let i = 0; i < ringCount; i++) {
    const a = (i / ringCount) * Math.PI * 2 + Math.random() * 0.12;
    const r = 4.6 + (Math.random() - 0.5) * 1.1;
    ringPos[i * 3] = Math.cos(a) * r;
    ringPos[i * 3 + 1] = (Math.random() - 0.5) * 0.45;
    ringPos[i * 3 + 2] = Math.sin(a) * r;
    const isGold = i % 3 !== 0;
    const c = isGold ? palette[2] : palette[0];
    ringCol[i * 3] = c.r;
    ringCol[i * 3 + 1] = c.g;
    ringCol[i * 3 + 2] = c.b;
  }
  const ringGeo = new THREE.BufferGeometry();
  ringGeo.setAttribute("position", new THREE.BufferAttribute(ringPos, 3));
  ringGeo.setAttribute("color", new THREE.BufferAttribute(ringCol, 3));
  const ringMat = new THREE.PointsMaterial({
    size: 0.11,
    vertexColors: true,
    transparent: true,
    opacity: 0.65,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });
  const haloGroup = new THREE.Group();
  haloGroup.position.set(4.8, 0.3, -2.5);
  haloGroup.rotation.set(0.52, -0.25, 0.22);
  const haloPoints = new THREE.Points(ringGeo, ringMat);
  haloGroup.add(haloPoints);

  // Subtle holographic wireframe energy ring
  const torusGeo = new THREE.TorusGeometry(4.5, 0.02, 8, 96);
  const torusMat = new THREE.MeshBasicMaterial({
    color: 0x38e8ff,
    transparent: true,
    opacity: 0.22,
    blending: THREE.AdditiveBlending
  });
  haloGroup.add(new THREE.Mesh(torusGeo, torusMat));
  scene.add(haloGroup);

  const targetMouse = { x: 0, y: 0 };
  const currentMouse = { x: 0, y: 0 };

  window.addEventListener("pointermove", (e) => {
    targetMouse.x = (e.clientX / window.innerWidth - 0.5) * 2;
    targetMouse.y = (e.clientY / window.innerHeight - 0.5) * 2;
  }, { passive: true });

  const handleResize = () => {
    const parent = canvas.parentElement;
    if (!parent) return;
    const w = parent.clientWidth || window.innerWidth;
    const h = parent.clientHeight || window.innerHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h, false);
  };
  handleResize();
  window.addEventListener("resize", handleResize);

  const clock = new THREE.Clock();
  let paused = false;
  document.addEventListener("visibilitychange", () => {
    paused = document.hidden;
    if (!paused) clock.getDelta();
  });

  renderer.setAnimationLoop(() => {
    if (paused) return;
    const dt = Math.min(clock.getDelta(), 0.08);
    const ease = 1 - Math.exp(-3.8 * dt);
    currentMouse.x += (targetMouse.x - currentMouse.x) * ease;
    currentMouse.y += (targetMouse.y - currentMouse.y) * ease;

    stars.rotation.y += dt * 0.015;
    stars.rotation.x += dt * 0.004;
    haloPoints.rotation.y += dt * 0.14;
    haloGroup.rotation.z = 0.22 + Math.sin(clock.elapsedTime * 0.35) * 0.06;

    camera.position.x = currentMouse.x * 0.9;
    camera.position.y = 0.2 - currentMouse.y * 0.55;
    camera.lookAt(0, 0, -2);
    renderer.render(scene, camera);
  });
})();
