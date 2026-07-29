import * as THREE from "three";

const IS_MOBILE = matchMedia("(max-width: 900px)").matches;

const PROFILES = {
  "little-cucumber": { name: "向日葵星爆", primary: "#dfff4f", secondary: "#ff9f1c", shape: "star", motion: "nova" },
  "cucumber-mama": { name: "暖心守護光", primary: "#b9ff63", secondary: "#ff7daa", shape: "heart", motion: "orbit" },
  watermelon: { name: "西瓜籽彈幕", primary: "#7cff62", secondary: "#ff4f75", shape: "seed", motion: "nova" },
  papaya: { name: "金色歡笑雨", primary: "#ffd34f", secondary: "#ff7d35", shape: "spark", motion: "fountain" },
  melon: { name: "蜜糖六角光", primary: "#ffe65b", secondary: "#ffad32", shape: "hex", motion: "orbit" },
  "bitter-gourd": { name: "苦瓜閃電秀", primary: "#a8ff54", secondary: "#42ffcb", shape: "bolt", motion: "electric" },
  guagua: { name: "薄荷旋風", primary: "#c9ff95", secondary: "#46e5aa", shape: "leaf", motion: "spiral" },
  "purple-loofah": { name: "海螺音浪", primary: "#c268ff", secondary: "#ff9856", shape: "bubble", motion: "wave" },
  diaoweichui: { name: "冰角暴風雪", primary: "#78e9ff", secondary: "#ffffff", shape: "snow", motion: "spiral" },
  "green-light": { name: "綠光雷射陣", primary: "#6dff78", secondary: "#d9ff42", shape: "square", motion: "electric" },
  "crystal-light": { name: "水晶星河", primary: "#73ebff", secondary: "#9c82ff", shape: "diamond", motion: "fountain" },
  "bright-light": { name: "紅光煙火祭", primary: "#ff557d", secondary: "#ffd34f", shape: "star", motion: "nova" },
  "ghost-light": { name: "幽靈魂光", primary: "#b4ffff", secondary: "#9b6cff", shape: "wisp", motion: "orbit" },
  "octopus-light": { name: "八手泡泡潮", primary: "#62f3ff", secondary: "#ff806f", shape: "bubble", motion: "wave" },
  "conch-warrior": { name: "海螺超音波", primary: "#ff7bc8", secondary: "#ffb45d", shape: "ring", motion: "wave" },
  "light-king": { name: "王者龍焰", primary: "#ff673e", secondary: "#32bfff", shape: "flame", motion: "spiral" },
  "algae-prince": { name: "藍藻無限陣", primary: "#48a8ff", secondary: "#67fff0", shape: "diamond", motion: "orbit" },
  "chong-lai": { name: "火刺英雄爆", primary: "#ff853e", secondary: "#ff4db8", shape: "spark", motion: "electric" },
  "chong-xin": { name: "糖果萌龍砲", primary: "#ffab42", secondary: "#ff62b4", shape: "heart", motion: "fountain" },
};

const overlayVertex = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const overlayFragment = `
  uniform sampler2D uMap;
  uniform vec3 uPrimary;
  uniform vec3 uSecondary;
  uniform float uTime;
  uniform float uPower;
  uniform vec2 uPixel;
  varying vec2 vUv;
  void main() {
    vec4 tex = texture2D(uMap, vUv);
    float a = tex.a;
    float n1 = texture2D(uMap, vUv + vec2(uPixel.x * 4.0, 0.0)).a;
    float n2 = texture2D(uMap, vUv - vec2(uPixel.x * 4.0, 0.0)).a;
    float n3 = texture2D(uMap, vUv + vec2(0.0, uPixel.y * 4.0)).a;
    float n4 = texture2D(uMap, vUv - vec2(0.0, uPixel.y * 4.0)).a;
    float edge = max(0.0, a - min(min(n1, n2), min(n3, n4)));
    float sweepY = fract(uTime * .34);
    float sweep = exp(-pow((vUv.y - sweepY) * 18.0, 2.0)) * a;
    float cross = exp(-pow((vUv.x - (.5 + sin(uTime * 1.7) * .18)) * 14.0, 2.0)) * a * .35;
    float shimmer = (.45 + sin((vUv.x + vUv.y) * 48.0 - uTime * 6.0) * .25) * a;
    vec3 color = mix(uPrimary, uSecondary, clamp(sweep * 1.5 + vUv.y * .2, 0.0, 1.0));
    float alpha = edge * (1.2 + uPower * 1.5) + sweep * (.38 + uPower * 1.5) + cross * uPower + shimmer * uPower * .18;
    gl_FragColor = vec4(color, alpha);
  }
`;

function spriteTexture(shape) {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 128;
  const ctx = canvas.getContext("2d");
  ctx.translate(64, 64);
  ctx.fillStyle = "#fff";
  ctx.strokeStyle = "#fff";
  ctx.lineWidth = 9;
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  ctx.shadowColor = "#fff";
  ctx.shadowBlur = 14;

  if (shape === "star") {
    ctx.beginPath();
    for (let i = 0; i < 10; i++) {
      const radius = i % 2 ? 20 : 48;
      const angle = -Math.PI / 2 + (i / 10) * Math.PI * 2;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
    }
    ctx.closePath(); ctx.fill();
  } else if (shape === "heart") {
    ctx.beginPath();
    ctx.moveTo(0, 45);
    ctx.bezierCurveTo(-58, 8, -48, -39, -18, -39);
    ctx.bezierCurveTo(0, -39, 8, -26, 0, -14);
    ctx.bezierCurveTo(8, -26, 20, -39, 38, -39);
    ctx.bezierCurveTo(67, -39, 68, 8, 0, 45);
    ctx.fill();
  } else if (shape === "bubble" || shape === "ring") {
    ctx.beginPath(); ctx.arc(0, 0, 42, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.arc(-16, -18, 7, 0, Math.PI * 2); ctx.fill();
  } else if (shape === "diamond" || shape === "seed") {
    ctx.beginPath();
    if (shape === "seed") {
      ctx.moveTo(0, -48); ctx.quadraticCurveTo(43, -5, 0, 48); ctx.quadraticCurveTo(-43, -5, 0, -48);
    } else {
      ctx.moveTo(0, -50); ctx.lineTo(38, 0); ctx.lineTo(0, 50); ctx.lineTo(-38, 0);
    }
    ctx.closePath(); ctx.fill();
  } else if (shape === "hex" || shape === "square") {
    ctx.beginPath();
    const sides = shape === "hex" ? 6 : 4;
    for (let i = 0; i < sides; i++) {
      const angle = -Math.PI / 2 + (i / sides) * Math.PI * 2;
      const x = Math.cos(angle) * 43;
      const y = Math.sin(angle) * 43;
      i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
    }
    ctx.closePath(); ctx.stroke();
  } else if (shape === "bolt" || shape === "spark") {
    ctx.beginPath();
    ctx.moveTo(13, -52); ctx.lineTo(-32, 7); ctx.lineTo(-7, 7);
    ctx.lineTo(-19, 50); ctx.lineTo(34, -16); ctx.lineTo(7, -16);
    ctx.closePath(); ctx.fill();
  } else if (shape === "snow") {
    for (let i = 0; i < 6; i++) {
      ctx.rotate(Math.PI / 3);
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, 48);
      ctx.moveTo(0, 31); ctx.lineTo(-11, 21);
      ctx.moveTo(0, 31); ctx.lineTo(11, 21);
      ctx.stroke();
    }
  } else if (shape === "leaf" || shape === "flame" || shape === "wisp") {
    ctx.beginPath();
    ctx.moveTo(0, 50);
    ctx.bezierCurveTo(shape === "flame" ? -52 : -42, 18, -34, -30, shape === "wisp" ? 22 : 0, -50);
    ctx.bezierCurveTo(42, -20, 52, 18, 0, 50);
    ctx.closePath(); ctx.fill();
  } else {
    ctx.beginPath(); ctx.arc(0, 0, 35, 0, Math.PI * 2); ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function auraTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 256;
  const ctx = canvas.getContext("2d");
  const gradient = ctx.createRadialGradient(128, 128, 12, 128, 128, 128);
  gradient.addColorStop(0, "rgba(255,255,255,.75)");
  gradient.addColorStop(.26, "rgba(255,255,255,.36)");
  gradient.addColorStop(.58, "rgba(255,255,255,.12)");
  gradient.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 256, 256);
  return new THREE.CanvasTexture(canvas);
}

export class CharacterEffects {
  constructor(scene) {
    this.scene = scene;
    this.group = null;
    this.plane = null;
    this.profile = PROFILES["little-cucumber"];
    this.active = [];
    this.shockwaves = [];
    this.flash = 0;
    this.triggerCount = 0;
    this.spriteCache = new Map();
  }

  profileName(id) {
    return (PROFILES[id] || PROFILES["little-cucumber"]).name;
  }

  clearTarget() {
    if (this.effectRoot?.parent) this.effectRoot.parent.remove(this.effectRoot);
    this.effectRoot?.traverse((object) => {
      object.geometry?.dispose();
      if (object.material && !Array.isArray(object.material)) object.material.dispose();
    });
    for (const burst of this.active) this.disposeBurst(burst);
    this.active = [];
    this.shockwaves = [];
    this.effectRoot = null;
    this.group = null;
    this.plane = null;
  }

  setTarget(group, plane, character) {
    this.clearTarget();
    this.group = group;
    this.plane = plane;
    this.profile = PROFILES[character.id] || {
      name: "角色星光", primary: character.accent, secondary: "#ffffff", shape: "star", motion: "nova",
    };

    const width = plane.geometry.parameters.width;
    const height = plane.geometry.parameters.height;
    const primary = new THREE.Color(this.profile.primary);
    const secondary = new THREE.Color(this.profile.secondary);
    this.effectRoot = new THREE.Group();
    group.add(this.effectRoot);

    this.aura = new THREE.Mesh(
      new THREE.PlaneGeometry(height * 1.45, height * 1.45),
      new THREE.MeshBasicMaterial({
        map: auraTexture(),
        color: primary,
        transparent: true,
        opacity: .14,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      })
    );
    this.aura.position.z = -.38;
    this.effectRoot.add(this.aura);

    this.overlay = new THREE.Mesh(
      new THREE.PlaneGeometry(width * 1.01, height * 1.01),
      new THREE.ShaderMaterial({
        vertexShader: overlayVertex,
        fragmentShader: overlayFragment,
        uniforms: {
          uMap: { value: plane.material.map },
          uPrimary: { value: primary },
          uSecondary: { value: secondary },
          uTime: { value: 0 },
          uPower: { value: 0 },
          uPixel: { value: new THREE.Vector2(1 / plane.material.map.image.width, 1 / plane.material.map.image.height) },
        },
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      })
    );
    this.overlay.position.z = .035;
    this.effectRoot.add(this.overlay);

    this.ringGroup = new THREE.Group();
    this.ringGroup.position.z = -.18;
    this.effectRoot.add(this.ringGroup);
    for (let i = 0; i < 3; i++) {
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(height * (.42 + i * .12), .012 + i * .006, 8, 96),
        new THREE.MeshBasicMaterial({
          color: i % 2 ? secondary : primary,
          transparent: true,
          opacity: .13,
          depthWrite: false,
          blending: THREE.AdditiveBlending,
        })
      );
      ring.rotation.set(i * .38, i * .52, i * .3);
      this.ringGroup.add(ring);
    }

    this.light = new THREE.PointLight(primary, 0, 12);
    this.light.position.set(0, 0, 3);
    this.effectRoot.add(this.light);
  }

  getSprite(shape) {
    if (!this.spriteCache.has(shape)) this.spriteCache.set(shape, spriteTexture(shape));
    return this.spriteCache.get(shape);
  }

  trigger(strength = 1) {
    if (!this.group || !this.plane) return;
    this.flash = Math.max(this.flash, 1.25 * strength);
    this.triggerCount += 1;
    if (this.active.length > 5) this.disposeBurst(this.active.shift());

    const width = this.plane.geometry.parameters.width;
    const height = this.plane.geometry.parameters.height;
    const count = Math.round((IS_MOBILE ? 105 : 220) * strength);
    const positions = new Float32Array(count * 3);
    const velocities = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const colors = new Float32Array(count * 3);
    const primary = new THREE.Color(this.profile.primary);
    const secondary = new THREE.Color(this.profile.secondary);

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const bodyY = (Math.random() - .48) * height * .78;
      const bodyWidth = width * (.18 + (1 - Math.abs(bodyY) / (height * .5)) * .2);
      const x = (Math.random() - .5) * bodyWidth * 2;
      const y = bodyY;
      const z = .08 + Math.random() * .22;
      positions.set([x, y, z], i * 3);

      let speed = .8 + Math.random() * 2.3;
      let vx = Math.cos(angle) * speed;
      let vy = Math.sin(angle) * speed;
      let vz = (Math.random() - .15) * 2.7;
      if (this.profile.motion === "fountain") { vx *= .65; vy = Math.abs(vy) + 1.2; }
      if (this.profile.motion === "spiral") { vx += -y * .45; vy += x * .45; }
      if (this.profile.motion === "orbit") { vx = -y * .62 + Math.cos(angle); vy = x * .62 + Math.sin(angle); }
      if (this.profile.motion === "wave") { vx *= 1.4; vy *= .5; vz += Math.sin(angle * 3) * .7; }
      if (this.profile.motion === "electric") { speed *= 1.35; vx *= 1.6; vy *= 1.6; vz *= 1.25; }
      velocities.set([vx, vy, vz], i * 3);
      sizes[i] = (IS_MOBILE ? .18 : .14) * (.55 + Math.random() * 1.35);
      const color = primary.clone().lerp(secondary, Math.random());
      colors.set([color.r, color.g, color.b], i * 3);
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    const material = new THREE.PointsMaterial({
      map: this.getSprite(this.profile.shape),
      size: IS_MOBILE ? .18 : .14,
      vertexColors: true,
      transparent: true,
      opacity: 1,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true,
      alphaTest: .025,
    });
    const points = new THREE.Points(geometry, material);
    points.renderOrder = 20;
    this.effectRoot.add(points);
    this.active.push({
      points, velocities, sizes, age: 0, life: this.profile.motion === "orbit" ? 2.4 : 1.75,
      gravity: this.profile.motion === "fountain" ? -1.4 : -.12,
      spin: this.profile.motion === "spiral" || this.profile.motion === "orbit",
      baseSize: IS_MOBILE ? .18 : .14,
    });

    this.createShockwaves(height);
  }

  createShockwaves(height) {
    const primary = new THREE.Color(this.profile.primary);
    const secondary = new THREE.Color(this.profile.secondary);
    for (let i = 0; i < 3; i++) {
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(height * .28, .022 + i * .008, 8, 96),
        new THREE.MeshBasicMaterial({
          color: i % 2 ? secondary : primary,
          transparent: true,
          opacity: 0,
          depthWrite: false,
          blending: THREE.AdditiveBlending,
        })
      );
      ring.position.z = .18 + i * .08;
      ring.rotation.set(i * .4, i * .35, i * .6);
      this.effectRoot.add(ring);
      this.shockwaves.push({ ring, age: -i * .16, life: 1.15 + i * .12 });
    }
  }

  disposeBurst(burst) {
    if (!burst) return;
    burst.points.parent?.remove(burst.points);
    burst.points.geometry.dispose();
    burst.points.material.dispose();
  }

  update(time, delta, enabled = true) {
    if (!this.effectRoot) return;
    const dt = enabled ? Math.min(delta, .035) : 0;
    this.flash = Math.max(0, this.flash - dt * 1.65);
    const burstPower = Math.min(1, this.flash);
    this.overlay.material.uniforms.uTime.value = time;
    this.overlay.material.uniforms.uPower.value = burstPower;
    this.aura.material.opacity = .13 + Math.sin(time * 2.1) * .035 + burstPower * .52;
    this.aura.scale.setScalar(1 + Math.sin(time * 1.7) * .025 + burstPower * .22);
    this.ringGroup.rotation.z += dt * (.12 + burstPower * 1.8);
    this.ringGroup.rotation.y = Math.sin(time * .55) * .22;
    this.ringGroup.children.forEach((ring, i) => {
      ring.material.opacity = .1 + burstPower * (.34 - i * .04);
      ring.rotation.z += dt * (.1 + i * .09);
    });
    this.light.intensity = burstPower * 38;

    for (let b = this.active.length - 1; b >= 0; b--) {
      const burst = this.active[b];
      burst.age += dt;
      const progress = burst.age / burst.life;
      const position = burst.points.geometry.attributes.position;
      for (let i = 0; i < position.count; i++) {
        const vi = i * 3;
        let vx = burst.velocities[vi];
        let vy = burst.velocities[vi + 1] + burst.gravity * dt;
        let vz = burst.velocities[vi + 2];
        if (burst.spin) {
          const x = position.getX(i);
          const y = position.getY(i);
          vx += -y * dt * .8;
          vy += x * dt * .8;
        }
        burst.velocities[vi] = vx * .992;
        burst.velocities[vi + 1] = vy * .992;
        burst.velocities[vi + 2] = vz * .992;
        position.setXYZ(
          i,
          position.getX(i) + vx * dt,
          position.getY(i) + vy * dt,
          position.getZ(i) + vz * dt
        );
      }
      position.needsUpdate = true;
      burst.points.rotation.z += dt * (burst.spin ? .55 : .08);
      burst.points.material.opacity = Math.max(0, 1 - Math.pow(progress, 1.8));
      burst.points.material.size = burst.baseSize * (.85 + Math.sin(progress * Math.PI) * .55);
      if (progress >= 1) {
        this.disposeBurst(burst);
        this.active.splice(b, 1);
      }
    }

    for (let i = this.shockwaves.length - 1; i >= 0; i--) {
      const wave = this.shockwaves[i];
      wave.age += dt;
      if (wave.age < 0) continue;
      const p = wave.age / wave.life;
      const scale = .55 + p * 2.15;
      wave.ring.scale.setScalar(scale);
      wave.ring.material.opacity = Math.sin(Math.min(1, p) * Math.PI) * .72;
      wave.ring.rotation.x += dt * .6;
      wave.ring.rotation.y += dt * .85;
      if (p >= 1) {
        wave.ring.parent?.remove(wave.ring);
        wave.ring.geometry.dispose();
        wave.ring.material.dispose();
        this.shockwaves.splice(i, 1);
      }
    }
  }
}
