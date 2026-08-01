import * as THREE from "../vendor/three.module.js";
import { COLOR_STATES, announceAudience, getStageState, subscribeStageState } from "./sync.js?v=20260801-3";

const canvas = document.querySelector("#scene");
const loadingScreen = document.querySelector("#loading-screen");
const colorLabel = document.querySelector("#color-label");
const tapHint = document.querySelector("#tap-hint");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: "high-performance" });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.08;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
camera.position.set(0, 0.1, 9.2);

const character = new THREE.Group();
character.rotation.set(0, 0, 0);
scene.add(character);

const glowGroup = new THREE.Group();
scene.add(glowGroup);

const portalGroup = new THREE.Group();
portalGroup.position.set(0, 0.12, -0.72);
scene.add(portalGroup);

const texture = await new THREE.TextureLoader().loadAsync("./assets/su-gu-zheng.jpg");
texture.colorSpace = THREE.SRGBColorSpace;
texture.anisotropy = renderer.capabilities.getMaxAnisotropy();

const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = `
  uniform sampler2D map;
  uniform vec3 tint;
  uniform float tintAmount;
  uniform float brightness;
  varying vec2 vUv;
  void main() {
    vec4 tex = texture2D(map, vUv);
    float whiteness = smoothstep(0.88, 0.995, min(tex.r, min(tex.g, tex.b)));
    float alpha = 1.0 - whiteness;
    if (alpha < 0.015) discard;
    float lightness = dot(tex.rgb, vec3(0.299, 0.587, 0.114));
    vec3 colored = tint * (0.38 + lightness * 0.72);
    vec3 result = mix(tex.rgb, colored, tintAmount) * brightness;
    gl_FragColor = vec4(result, alpha);
  }
`;

const uniforms = {
  map: { value: texture },
  tint: { value: new THREE.Color("#ffffff") },
  tintAmount: { value: 0 },
  brightness: { value: 1 },
};

const frontMaterial = new THREE.ShaderMaterial({
  uniforms,
  vertexShader,
  fragmentShader,
  transparent: true,
  depthWrite: true,
  side: THREE.DoubleSide,
});

const aspect = texture.image.width / texture.image.height;
const height = 6.1;
const width = height * aspect;
const geometry = new THREE.PlaneGeometry(width, height, 1, 1);

for (let i = 8; i >= 1; i -= 1) {
  const layerUniforms = THREE.UniformsUtils.clone(uniforms);
  layerUniforms.map.value = texture;
  layerUniforms.brightness.value = 0.34 + i * 0.022;
  const material = new THREE.ShaderMaterial({
    uniforms: layerUniforms,
    vertexShader,
    fragmentShader,
    transparent: true,
    depthWrite: true,
    side: THREE.DoubleSide,
  });
  const layer = new THREE.Mesh(geometry, material);
  layer.position.z = -i * 0.026;
  layer.scale.setScalar(1 + i * 0.0015);
  layer.userData.tintUniforms = layerUniforms;
  character.add(layer);
}

const front = new THREE.Mesh(geometry, frontMaterial);
front.position.z = 0.025;
front.userData.tintUniforms = uniforms;
character.add(front);

const haloMaterial = new THREE.MeshBasicMaterial({ color: "#ffc857", transparent: true, opacity: 0.24, blending: THREE.AdditiveBlending, depthWrite: false });
const halo = new THREE.Mesh(new THREE.CircleGeometry(2.34, 96), haloMaterial);
halo.position.set(0, 0.16, -0.34);
glowGroup.add(halo);

const ringMaterial = new THREE.MeshBasicMaterial({ color: "#ffbf47", transparent: true, opacity: 0.34, blending: THREE.AdditiveBlending, depthWrite: false });
const ring = new THREE.Mesh(new THREE.RingGeometry(2.45, 2.5, 96), ringMaterial);
ring.position.set(0, 0.16, -0.32);
glowGroup.add(ring);

const portalRings = [
  { radius: 2.18, tube: 0.018, tiltX: 0.48, tiltY: 0.12, opacity: 0.2 },
  { radius: 2.72, tube: 0.024, tiltX: -0.38, tiltY: 0.3, opacity: 0.15 },
  { radius: 3.22, tube: 0.015, tiltX: 0.7, tiltY: -0.22, opacity: 0.12 },
].map((config, index) => {
  const material = new THREE.MeshBasicMaterial({
    color: index === 1 ? "#ff8db6" : "#ffc857",
    transparent: true,
    opacity: config.opacity,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const portalRing = new THREE.Mesh(new THREE.TorusGeometry(config.radius, config.tube, 12, 120), material);
  portalRing.rotation.set(config.tiltX, config.tiltY, index * 0.72);
  portalRing.userData = { ...config, phase: index * 1.8 };
  portalGroup.add(portalRing);
  return portalRing;
});

const bodyAuraGroup = new THREE.Group();
bodyAuraGroup.position.set(0, -0.42, 0);
character.add(bodyAuraGroup);

const bodyAuraRings = [-0.055, 0.11].map((depth, index) => {
  const material = new THREE.MeshBasicMaterial({
    color: "#ffd45c",
    transparent: true,
    opacity: index === 0 ? 0.24 : 0.42,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const auraRing = new THREE.Mesh(new THREE.TorusGeometry(0.76, index === 0 ? 0.034 : 0.022, 14, 96), material);
  auraRing.position.z = depth;
  auraRing.scale.set(1.24, 0.43, 1);
  auraRing.rotation.z = index ? -0.18 : 0.2;
  bodyAuraGroup.add(auraRing);
  return auraRing;
});

const shadow = new THREE.Mesh(
  new THREE.CircleGeometry(1.05, 64),
  new THREE.MeshBasicMaterial({ color: "#6e3f20", transparent: true, opacity: 0.18, depthWrite: false }),
);
shadow.scale.set(1.35, 0.28, 1);
shadow.position.set(0, -3.02, -0.28);
scene.add(shadow);

const stars = [];
for (let i = 0; i < 56; i += 1) {
  const dot = new THREE.Mesh(
    new THREE.CircleGeometry(0.018 + Math.random() * 0.035, 12),
    new THREE.MeshBasicMaterial({ color: i % 3 === 0 ? "#ff8db6" : "#ffd45c", transparent: true, opacity: 0.35 + Math.random() * 0.5 }),
  );
  const angle = Math.random() * Math.PI * 2;
  const radius = 2.1 + Math.random() * 2.5;
  dot.position.set(Math.cos(angle) * radius, Math.sin(angle) * radius * 0.78 + 0.15, -0.5 - Math.random());
  dot.userData = {
    baseX: dot.position.x,
    baseY: dot.position.y,
    phase: Math.random() * Math.PI * 2,
    speed: 0.4 + Math.random() * 0.8,
    drift: 0.025 + Math.random() * 0.065,
  };
  scene.add(dot);
  stars.push(dot);
}

let activeColor = "original";
let pulseStarted = -10;
let targetTint = new THREE.Color("#ffffff");
let targetTintAmount = 0;
let targetHalo = new THREE.Color("#ffc857");
const portalPink = new THREE.Color("#ff8db6");
const clock = new THREE.Clock();

function applyState(color) {
  activeColor = COLOR_STATES[color] ? color : "original";
  const state = COLOR_STATES[activeColor];
  colorLabel.textContent = state.label;
  document.body.dataset.color = activeColor;
  targetTint.set(state.hex);
  targetTintAmount = activeColor === "original" ? 0 : 0.78;
  targetHalo.set(state.hex);
  pulseStarted = clock.getElapsedTime();
}

function triggerGlow() {
  pulseStarted = clock.getElapsedTime();
  tapHint.classList.add("is-used");
  window.setTimeout(() => tapHint.classList.remove("is-used"), 900);
}

function resize() {
  const rect = canvas.getBoundingClientRect();
  renderer.setSize(rect.width, rect.height, false);
  camera.aspect = rect.width / rect.height;
  camera.position.z = camera.aspect < 0.75 ? 10.7 : 9.2;
  camera.updateProjectionMatrix();
}

canvas.addEventListener("pointerdown", triggerGlow);
tapHint.addEventListener("click", triggerGlow);
window.addEventListener("resize", resize);
resize();

function animate() {
  const t = clock.getElapsedTime();
  const pulseAge = t - pulseStarted;
  const pulse = pulseAge < 1.15 ? Math.sin(Math.min(pulseAge / 1.15, 1) * Math.PI) : 0;
  // Hard-lock the artwork to a front-facing pose. Only a tiny vertical float is allowed.
  character.rotation.set(0, 0, 0);
  character.position.set(0, reducedMotion.matches ? 0 : Math.sin(t * 0.8) * 0.035, 0);
  character.scale.setScalar(1 + pulse * 0.13);

  const currentTint = uniforms.tint.value;
  currentTint.lerp(targetTint, 0.055);
  uniforms.tintAmount.value += (targetTintAmount - uniforms.tintAmount.value) * 0.055;
  uniforms.brightness.value = 1 + pulse * 0.28;
  character.children.forEach((layer, index) => {
    const u = layer.userData.tintUniforms;
    if (!u || layer === front) return;
    u.tint.value.copy(currentTint);
    u.tintAmount.value = uniforms.tintAmount.value;
    u.brightness.value = 0.38 + index * 0.018 + pulse * 0.13;
  });

  haloMaterial.color.lerp(targetHalo, 0.055);
  ringMaterial.color.copy(haloMaterial.color);
  const idleGlow = (Math.sin(t * 1.25) + 1) * 0.5;
  haloMaterial.opacity = 0.20 + idleGlow * 0.13 + pulse * 0.46;
  ringMaterial.opacity = 0.27 + idleGlow * 0.16 + pulse * 0.58;
  const haloScale = 0.98 + idleGlow * 0.07 + pulse * 0.24;
  halo.scale.setScalar(haloScale);
  ring.scale.setScalar(haloScale + pulse * 0.12);

  portalGroup.rotation.z = reducedMotion.matches ? 0 : Math.sin(t * 0.16) * 0.08;
  portalRings.forEach((portalRing, index) => {
    const config = portalRing.userData;
    portalRing.rotation.z += reducedMotion.matches ? 0 : (index % 2 ? -0.0007 : 0.00055);
    portalRing.rotation.x = config.tiltX + Math.sin(t * 0.28 + config.phase) * 0.075;
    portalRing.material.color.lerp(index === 1 ? portalPink : targetHalo, 0.035);
    portalRing.material.opacity = config.opacity + idleGlow * 0.09 + pulse * 0.14;
  });

  bodyAuraGroup.rotation.z = reducedMotion.matches ? 0 : Math.sin(t * 0.72) * 0.13;
  bodyAuraRings.forEach((auraRing, index) => {
    auraRing.material.color.lerp(targetHalo, 0.055);
    auraRing.material.opacity = (index ? 0.34 : 0.18) + idleGlow * (index ? 0.22 : 0.14) + pulse * 0.26;
    const auraBreath = 1 + idleGlow * 0.09 + pulse * 0.13;
    auraRing.scale.set(1.24 * auraBreath, 0.43 * auraBreath, 1);
    auraRing.rotation.z += reducedMotion.matches ? 0 : (index ? -0.0018 : 0.0012);
  });

  stars.forEach((star) => {
    const particleTime = t * star.userData.speed + star.userData.phase;
    star.position.x = star.userData.baseX + Math.cos(particleTime) * star.userData.drift;
    star.position.y = star.userData.baseY + Math.sin(particleTime * 0.82) * star.userData.drift * 1.8;
    star.material.opacity = 0.32 + (Math.sin(particleTime) + 1) * 0.27 + pulse * 0.2;
  });

  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

applyState(getStageState().color);
subscribeStageState((state) => applyState(state.color));
announceAudience();
loadingScreen.classList.add("is-hidden");
animate();
