import * as THREE from "three";
import { GLTFLoader } from "./vendor/GLTFLoader.js";
import { OBJLoader } from "./vendor/OBJLoader.js";

const MODEL_ROOT = "./assets/models/";
const IS_MOBILE = matchMedia("(max-width: 900px)").matches;
const LOW_POWER = IS_MOBILE || (navigator.deviceMemory && navigator.deviceMemory <= 4);

const vertexShader = `
  varying vec3 vWorld;
  varying vec2 vUv;
  uniform float uTime;
  uniform float uWave;
  void main() {
    vUv = uv;
    vec3 p = position;
    p.z += sin(p.x * .55 + uTime * .75) * uWave;
    p.z += cos(p.y * .72 - uTime * .48) * uWave * .55;
    vec4 world = modelMatrix * vec4(p, 1.0);
    vWorld = world.xyz;
    gl_Position = projectionMatrix * viewMatrix * world;
  }
`;

const seaDomeFragment = `
  varying vec3 vWorld;
  varying vec2 vUv;
  uniform float uTime;
  void main() {
    float h = normalize(vWorld).y * .5 + .5;
    vec3 deep = vec3(.005, .045, .11);
    vec3 aqua = vec3(.00, .34, .46);
    vec3 cyan = vec3(.04, .78, .72);
    vec3 color = mix(deep, aqua, smoothstep(.05, .68, h));
    color = mix(color, cyan, smoothstep(.73, 1., h) * .42);
    float waves = sin(vWorld.x * .36 + uTime * .42) * sin(vWorld.z * .27 - uTime * .34);
    color += vec3(.02, .18, .16) * waves * smoothstep(.42, .95, h);
    gl_FragColor = vec4(color, 1.);
  }
`;

const landDomeFragment = `
  varying vec3 vWorld;
  varying vec2 vUv;
  uniform float uTime;
  void main() {
    float h = normalize(vWorld).y * .5 + .5;
    vec3 horizon = vec3(.93, .45, .24);
    vec3 sky = vec3(.12, .48, .60);
    vec3 zenith = vec3(.025, .12, .20);
    vec3 color = mix(horizon, sky, smoothstep(.12, .48, h));
    color = mix(color, zenith, smoothstep(.52, 1., h));
    float glow = pow(max(0., dot(normalize(vWorld), normalize(vec3(-.55,.55,.3)))), 18.);
    color += vec3(1., .45, .12) * glow * (1.1 + sin(uTime * .15) * .08);
    gl_FragColor = vec4(color, 1.);
  }
`;

const waterFragment = `
  varying vec3 vWorld;
  varying vec2 vUv;
  uniform float uTime;
  void main() {
    float a = sin((vUv.x + uTime * .025) * 74.) * cos((vUv.y - uTime * .018) * 58.);
    float b = sin((vUv.x - vUv.y + uTime * .02) * 43.);
    float lines = smoothstep(.7, .98, a * b);
    vec3 color = mix(vec3(.03,.42,.52), vec3(.35,1.,.88), lines);
    gl_FragColor = vec4(color, .16 + lines * .14);
  }
`;

const groundFragment = `
  varying vec3 vWorld;
  varying vec2 vUv;
  uniform float uTime;
  uniform vec3 uA;
  uniform vec3 uB;
  void main() {
    float rings = sin(length(vUv - .5) * 42. - uTime * .22) * .5 + .5;
    float grain = sin(vWorld.x * 3. + uTime * .1) * cos(vWorld.z * 2.7 - uTime * .12);
    vec3 color = mix(uA, uB, rings * .12 + grain * .07);
    gl_FragColor = vec4(color, 1.);
  }
`;

function shaderMaterial(fragment, uniforms = {}, options = {}) {
  return new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader: fragment,
    uniforms: {
      uTime: { value: 0 },
      uWave: { value: 0 },
      ...uniforms,
    },
    ...options,
  });
}

function seeded(seed = 10) {
  let value = seed;
  return () => {
    value = Math.sin(value * 9283.31) * 43758.5453;
    return value - Math.floor(value);
  };
}

function glowTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 128;
  const ctx = canvas.getContext("2d");
  const gradient = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  gradient.addColorStop(0, "rgba(255,255,255,1)");
  gradient.addColorStop(.15, "rgba(255,255,255,.9)");
  gradient.addColorStop(.5, "rgba(120,245,255,.24)");
  gradient.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 128, 128);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function makeParticleField(count, color, size, range, random) {
  const positions = new Float32Array(count * 3);
  const phases = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    positions[i * 3] = (random() - .5) * range.x;
    positions[i * 3 + 1] = random() * range.y + range.minY;
    positions[i * 3 + 2] = (random() - .5) * range.z;
    phases[i] = random() * Math.PI * 2;
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  const points = new THREE.Points(
    geometry,
    new THREE.PointsMaterial({
      map: glowTexture(),
      color,
      size,
      transparent: true,
      opacity: .75,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true,
    })
  );
  points.userData = { phases, range, speed: range.speed || .2, particleField: true };
  return points;
}

function makeCloud(scale = 1) {
  const group = new THREE.Group();
  const material = new THREE.MeshBasicMaterial({ color: 0xffefe1, transparent: true, opacity: .16, depthWrite: false });
  for (let i = 0; i < 7; i++) {
    const puff = new THREE.Mesh(new THREE.IcosahedronGeometry(.55 + (i % 3) * .22, 1), material);
    puff.position.set((i - 3) * .48, Math.sin(i) * .18, (i % 2) * .16);
    puff.scale.y = .55;
    group.add(puff);
  }
  group.scale.setScalar(scale);
  return group;
}

function makeCoral(color, random) {
  const group = new THREE.Group();
  const mat = new THREE.MeshStandardMaterial({
    color,
    emissive: color,
    emissiveIntensity: .16,
    roughness: .72,
  });
  const branches = 3 + Math.floor(random() * 4);
  for (let i = 0; i < branches; i++) {
    const height = .55 + random() * 1.35;
    const branch = new THREE.Mesh(new THREE.CapsuleGeometry(.065 + random() * .055, height, 4, 7), mat);
    branch.position.set((i - branches / 2) * .18, height * .5, (random() - .5) * .3);
    branch.rotation.z = (random() - .5) * .7;
    group.add(branch);
    const tip = new THREE.Mesh(new THREE.SphereGeometry(.12, 8, 6), mat);
    tip.position.copy(branch.position);
    tip.position.y += height * .48;
    group.add(tip);
  }
  return group;
}

function makeSeaweed(color, random) {
  const group = new THREE.Group();
  const material = new THREE.MeshStandardMaterial({ color, roughness: .8, side: THREE.DoubleSide });
  for (let i = 0; i < 3; i++) {
    const height = .8 + random() * 1.7;
    const blade = new THREE.Mesh(new THREE.PlaneGeometry(.16 + random() * .13, height, 1, 5), material);
    blade.geometry.translate(0, height * .5, 0);
    blade.position.x = (i - 1) * .16;
    blade.rotation.y = random() * Math.PI;
    group.add(blade);
  }
  return group;
}

function makeButterfly(color) {
  const group = new THREE.Group();
  const material = new THREE.MeshBasicMaterial({ color, side: THREE.DoubleSide, transparent: true, opacity: .9 });
  const wingGeometry = new THREE.CircleGeometry(.12, 12, 0, Math.PI);
  const left = new THREE.Mesh(wingGeometry, material);
  const right = new THREE.Mesh(wingGeometry, material);
  left.rotation.set(0, .55, Math.PI * .5);
  right.rotation.set(0, -.55, -Math.PI * .5);
  left.position.x = -.07;
  right.position.x = .07;
  group.add(left, right);
  group.userData.wings = [left, right];
  return group;
}

export class CinematicWorlds {
  constructor({ scene, camera, rimLight, keyLight }) {
    this.scene = scene;
    this.camera = camera;
    this.rimLight = rimLight;
    this.keyLight = keyLight;
    this.gltf = new GLTFLoader();
    this.obj = new OBJLoader();
    this.cache = new Map();
    this.root = new THREE.Group();
    this.scene.add(this.root);
    this.animated = [];
    this.shaders = [];
    this.fish = [];
    this.clouds = [];
    this.butterflies = [];
    this.token = 0;
    this.random = seeded(42);
    this.currentWorld = "land";
  }

  setWorld(world) {
    this.currentWorld = world;
    this.token += 1;
    this.scene.remove(this.root);
    this.root = new THREE.Group();
    this.scene.add(this.root);
    this.animated = [];
    this.shaders = [];
    this.fish = [];
    this.clouds = [];
    this.butterflies = [];
    this.random = seeded(world === "sea" ? 613 : 318);
    if (world === "sea") this.buildSea(this.token);
    else this.buildLand(this.token);
  }

  addShader(mesh) {
    this.root.add(mesh);
    this.shaders.push(mesh.material);
    return mesh;
  }

  addDome(fragment) {
    const dome = new THREE.Mesh(
      new THREE.SphereGeometry(36, LOW_POWER ? 24 : 40, LOW_POWER ? 16 : 28),
      shaderMaterial(fragment, {}, { side: THREE.BackSide, depthWrite: false })
    );
    dome.position.y = 4;
    this.addShader(dome);
  }

  addGround(world) {
    const colors = world === "sea"
      ? [new THREE.Color("#073d52"), new THREE.Color("#16a0a2")]
      : [new THREE.Color("#28552e"), new THREE.Color("#95bb49")];
    const ground = new THREE.Mesh(
      new THREE.CircleGeometry(11, LOW_POWER ? 40 : 80),
      shaderMaterial(groundFragment, {
        uA: { value: colors[0] },
        uB: { value: colors[1] },
      }, { side: THREE.DoubleSide })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -1.02;
    this.addShader(ground);

    const lower = new THREE.Mesh(
      new THREE.CylinderGeometry(11, 13, 1.2, 64),
      new THREE.MeshStandardMaterial({ color: world === "sea" ? 0x052d3d : 0x173c26, roughness: 1 })
    );
    lower.position.y = -1.65;
    this.root.add(lower);
  }

  buildSea(token) {
    this.scene.fog.color.set(0x032b42);
    this.scene.fog.density = .028;
    this.rimLight.color.set(0x43f5dd);
    this.rimLight.intensity = 34;
    this.keyLight.color.set(0xb7ffff);
    this.keyLight.intensity = 4.6;
    this.addDome(seaDomeFragment);
    this.addGround("sea");

    const surface = new THREE.Mesh(
      new THREE.PlaneGeometry(35, 35, LOW_POWER ? 18 : 35, LOW_POWER ? 18 : 35),
      shaderMaterial(waterFragment, {}, {
        transparent: true,
        side: THREE.DoubleSide,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      })
    );
    surface.rotation.x = Math.PI / 2;
    surface.position.y = 9;
    surface.material.uniforms.uWave.value = .42;
    this.addShader(surface);

    for (let i = 0; i < (LOW_POWER ? 5 : 9); i++) {
      const ray = new THREE.Mesh(
        new THREE.ConeGeometry(.55 + this.random() * 1.15, 18, 12, 1, true),
        new THREE.MeshBasicMaterial({
          color: i % 2 ? 0x5bffe6 : 0x77dfff,
          transparent: true,
          opacity: .035,
          side: THREE.DoubleSide,
          depthWrite: false,
          blending: THREE.AdditiveBlending,
        })
      );
      ray.position.set((this.random() - .5) * 17, 6.5, -3 - this.random() * 6);
      ray.rotation.z = (this.random() - .5) * .24;
      ray.userData.baseOpacity = ray.material.opacity;
      this.root.add(ray);
      this.animated.push({ object: ray, type: "ray", phase: this.random() * 6 });
    }

    const plankton = makeParticleField(
      LOW_POWER ? 260 : 760,
      0x70ffe5,
      LOW_POWER ? .075 : .055,
      { x: 23, y: 13, z: 17, minY: -1, speed: .24 },
      this.random
    );
    this.root.add(plankton);
    this.animated.push({ object: plankton, type: "particles" });

    const bubbles = makeParticleField(
      LOW_POWER ? 90 : 260,
      0xc5ffff,
      LOW_POWER ? .13 : .1,
      { x: 20, y: 11, z: 15, minY: -1, speed: .52 },
      this.random
    );
    bubbles.material.opacity = .5;
    this.root.add(bubbles);
    this.animated.push({ object: bubbles, type: "particles" });

    for (let i = 0; i < (LOW_POWER ? 13 : 25); i++) {
      const angle = (i / (LOW_POWER ? 13 : 25)) * Math.PI * 2 + this.random() * .25;
      const radius = 4.8 + this.random() * 5.3;
      const coral = makeCoral([0xff685d, 0xffb84f, 0x9b74ff, 0x43e2aa][i % 4], this.random);
      coral.position.set(Math.cos(angle) * radius, -.96, Math.sin(angle) * radius);
      coral.rotation.y = this.random() * Math.PI;
      coral.scale.setScalar(.65 + this.random() * .8);
      this.root.add(coral);
      this.animated.push({ object: coral, type: "sway", phase: this.random() * 6, amount: .035 });
    }

    for (let i = 0; i < (LOW_POWER ? 16 : 34); i++) {
      const angle = this.random() * Math.PI * 2;
      const radius = 3.5 + this.random() * 7;
      const weed = makeSeaweed(i % 2 ? 0x1aa680 : 0x4ec06d, this.random);
      weed.position.set(Math.cos(angle) * radius, -.98, Math.sin(angle) * radius);
      weed.scale.setScalar(.6 + this.random());
      this.root.add(weed);
      this.animated.push({ object: weed, type: "sway", phase: this.random() * 6, amount: .09 });
    }

    this.addKenneySea(token);
    this.addFishSchool(token);
    this.addJellyfish();
  }

  buildLand(token) {
    this.scene.fog.color.set(0x254e45);
    this.scene.fog.density = .018;
    this.rimLight.color.set(0xffaa50);
    this.rimLight.intensity = 27;
    this.keyLight.color.set(0xffdf9c);
    this.keyLight.intensity = 4.2;
    this.addDome(landDomeFragment);
    this.addGround("land");

    for (let i = 0; i < (LOW_POWER ? 6 : 11); i++) {
      const cloud = makeCloud(.7 + this.random() * 1.35);
      cloud.position.set(-15 + this.random() * 30, 6 + this.random() * 5, -8 - this.random() * 7);
      this.root.add(cloud);
      this.clouds.push({ object: cloud, speed: .15 + this.random() * .18 });
    }

    const fireflies = makeParticleField(
      LOW_POWER ? 210 : 620,
      0xffef72,
      LOW_POWER ? .1 : .075,
      { x: 24, y: 9, z: 17, minY: -.4, speed: .12 },
      this.random
    );
    this.root.add(fireflies);
    this.animated.push({ object: fireflies, type: "fireflies" });

    for (let i = 0; i < (LOW_POWER ? 10 : 22); i++) {
      const angle = this.random() * Math.PI * 2;
      const radius = 3.5 + this.random() * 7.2;
      const stalk = new THREE.Group();
      const stem = new THREE.Mesh(
        new THREE.CylinderGeometry(.025, .045, .75 + this.random() * .8, 7),
        new THREE.MeshStandardMaterial({ color: 0x2b7a3d })
      );
      stem.position.y = .5;
      stalk.add(stem);
      const flower = new THREE.Mesh(
        new THREE.IcosahedronGeometry(.16 + this.random() * .12, 1),
        new THREE.MeshStandardMaterial({
          color: [0xffcf59, 0xff7e76, 0xbf8cff][i % 3],
          emissive: [0x7a4a00, 0x7a1623, 0x3c166a][i % 3],
          emissiveIntensity: .18,
        })
      );
      flower.position.y = stem.geometry.parameters.height + .12;
      stalk.add(flower);
      stalk.position.set(Math.cos(angle) * radius, -.98, Math.sin(angle) * radius);
      this.root.add(stalk);
      this.animated.push({ object: stalk, type: "sway", phase: this.random() * 6, amount: .07 });
    }

    for (let i = 0; i < (LOW_POWER ? 5 : 10); i++) {
      const butterfly = makeButterfly([0xffd74c, 0xff728d, 0x81e5ff][i % 3]);
      butterfly.userData = {
        ...butterfly.userData,
        radius: 2.7 + this.random() * 6,
        speed: .22 + this.random() * .18,
        phase: this.random() * Math.PI * 2,
        height: 1.1 + this.random() * 3.5,
      };
      this.root.add(butterfly);
      this.butterflies.push(butterfly);
    }

    this.addKenneyLand(token);
  }

  async loadGLB(name) {
    const key = `glb:${name}`;
    if (!this.cache.has(key)) {
      this.cache.set(key, this.gltf.loadAsync(`${MODEL_ROOT}kenney/${name}`).then((result) => result.scene));
    }
    return this.cache.get(key);
  }

  async loadOBJ(name) {
    const key = `obj:${name}`;
    if (!this.cache.has(key)) {
      this.cache.set(key, this.obj.loadAsync(`${MODEL_ROOT}quaternius/${name}`));
    }
    return this.cache.get(key);
  }

  normalizeModel(model, targetSize) {
    const box = new THREE.Box3().setFromObject(model);
    const size = box.getSize(new THREE.Vector3());
    const max = Math.max(size.x, size.y, size.z) || 1;
    model.scale.setScalar(targetSize / max);
    const centered = new THREE.Box3().setFromObject(model).getCenter(new THREE.Vector3());
    model.position.sub(centered);
    return model;
  }

  async addKenneyLand(token) {
    const names = ["tree_oak.glb", "tree_pineRoundA.glb", "tree_small.glb", "tree_palmBend.glb"];
    const templates = await Promise.all(names.map((name) => this.loadGLB(name)));
    if (token !== this.token || this.currentWorld !== "land") return;
    const count = LOW_POWER ? 13 : 28;
    for (let i = 0; i < count; i++) {
      const tree = templates[i % templates.length].clone(true);
      const angle = (i / count) * Math.PI * 2 + this.random() * .2;
      const radius = 6.3 + this.random() * 4.6;
      tree.position.set(Math.cos(angle) * radius, -1, Math.sin(angle) * radius);
      tree.rotation.y = this.random() * Math.PI * 2;
      tree.scale.setScalar(.75 + this.random() * 1.25);
      this.root.add(tree);
      this.animated.push({ object: tree, type: "sway", phase: this.random() * 6, amount: .018 });
    }

    const detailNames = ["rock_largeB.glb", "rock_smallC.glb", "flower_purpleA.glb", "flower_yellowB.glb", "mushroom_redGroup.glb", "plant_bushDetailed.glb", "grass_large.glb"];
    const details = await Promise.all(detailNames.map((name) => this.loadGLB(name)));
    if (token !== this.token || this.currentWorld !== "land") return;
    for (let i = 0; i < (LOW_POWER ? 18 : 42); i++) {
      const object = details[i % details.length].clone(true);
      const angle = this.random() * Math.PI * 2;
      const radius = 3.3 + this.random() * 7.3;
      object.position.set(Math.cos(angle) * radius, -.98, Math.sin(angle) * radius);
      object.rotation.y = this.random() * Math.PI * 2;
      object.scale.setScalar(.55 + this.random() * .75);
      this.root.add(object);
      this.animated.push({ object, type: "sway", phase: this.random() * 6, amount: .025 });
    }
  }

  async addKenneySea(token) {
    const templates = await Promise.all(["rock_largeB.glb", "rock_smallC.glb", "tree_palmBend.glb"].map((name) => this.loadGLB(name)));
    if (token !== this.token || this.currentWorld !== "sea") return;
    for (let i = 0; i < (LOW_POWER ? 13 : 26); i++) {
      const object = templates[i % templates.length].clone(true);
      const angle = this.random() * Math.PI * 2;
      const radius = 4.4 + this.random() * 6.3;
      object.position.set(Math.cos(angle) * radius, -1, Math.sin(angle) * radius);
      object.rotation.set((this.random() - .5) * .35, this.random() * Math.PI * 2, (this.random() - .5) * .18);
      object.scale.setScalar(.45 + this.random() * .8);
      object.traverse((child) => {
        if (child.isMesh && child.material) {
          child.material = child.material.clone();
          child.material.color.lerp(new THREE.Color(i % 2 ? 0x0e6f78 : 0x31556b), .48);
        }
      });
      this.root.add(object);
      this.animated.push({ object, type: "sway", phase: this.random() * 6, amount: .018 });
    }
  }

  async addFishSchool(token) {
    const fishFiles = ["fish1.obj", "fish2.obj", "fish3.obj", "manta-ray.obj", "dolphin.obj", "shark.obj"];
    const templates = await Promise.all(fishFiles.map((name) => this.loadOBJ(name)));
    if (token !== this.token || this.currentWorld !== "sea") return;
    const colors = [0xff8f4f, 0x55d5ff, 0xe75b91, 0x665cff, 0x49d8b1, 0x8099a6];
    const count = LOW_POWER ? 12 : 28;
    for (let i = 0; i < count; i++) {
      const model = templates[i % templates.length].clone(true);
      this.normalizeModel(model, i % 6 > 2 ? 1.3 : .7);
      model.traverse((child) => {
        if (!child.isMesh) return;
        child.material = new THREE.MeshStandardMaterial({
          color: colors[i % colors.length],
          roughness: .6,
          metalness: .05,
          flatShading: true,
        });
      });
      const swimmer = new THREE.Group();
      swimmer.add(model);
      const data = {
        object: swimmer,
        radius: 5 + this.random() * 9,
        speed: .1 + this.random() * .12,
        phase: this.random() * Math.PI * 2,
        height: .4 + this.random() * 5.5,
        depth: -2 - this.random() * 8,
      };
      swimmer.scale.setScalar(.65 + this.random() * .75);
      this.root.add(swimmer);
      this.fish.push(data);
    }
  }

  addJellyfish() {
    for (let i = 0; i < (LOW_POWER ? 4 : 8); i++) {
      const group = new THREE.Group();
      const color = [0x9c7cff, 0x61e8ff, 0xff72bf][i % 3];
      const bell = new THREE.Mesh(
        new THREE.SphereGeometry(.32 + this.random() * .16, 16, 10, 0, Math.PI * 2, 0, Math.PI * .55),
        new THREE.MeshStandardMaterial({
          color, emissive: color, emissiveIntensity: .7,
          transparent: true, opacity: .65, roughness: .2, side: THREE.DoubleSide,
        })
      );
      group.add(bell);
      for (let t = 0; t < 5; t++) {
        const tentacle = new THREE.Mesh(
          new THREE.CylinderGeometry(.012, .02, .55 + this.random() * .45, 5),
          new THREE.MeshBasicMaterial({ color, transparent: true, opacity: .55 })
        );
        tentacle.position.set((t - 2) * .1, -.42, (t % 2) * .07);
        group.add(tentacle);
      }
      group.position.set((this.random() - .5) * 15, this.random() * 5 + .5, -2 - this.random() * 8);
      this.root.add(group);
      this.animated.push({ object: group, type: "jelly", phase: this.random() * 6, amount: .2 });
    }
  }

  update(time, delta) {
    if (!delta) return;
    for (const material of this.shaders) material.uniforms.uTime.value = time;

    for (const item of this.animated) {
      const object = item.object;
      if (item.type === "sway") {
        object.rotation.z = Math.sin(time * .72 + item.phase) * item.amount;
      } else if (item.type === "ray") {
        object.material.opacity = item.object.userData.baseOpacity * (.75 + Math.sin(time * .35 + item.phase) * .25);
        object.rotation.y = Math.sin(time * .08 + item.phase) * .18;
      } else if (item.type === "jelly") {
        object.position.y += Math.sin(time * .9 + item.phase) * .0018;
        object.scale.y = 1 + Math.sin(time * 1.7 + item.phase) * .08;
        object.rotation.y += delta * .12;
      } else if (item.type === "particles" || item.type === "fireflies") {
        const position = object.geometry.attributes.position;
        const { phases, range, speed } = object.userData;
        for (let i = 0; i < position.count; i++) {
          const y = position.getY(i) + delta * speed * (item.type === "particles" ? 1 : .08);
          position.setY(i, y > range.minY + range.y ? range.minY : y);
          position.setX(i, position.getX(i) + Math.sin(time * .35 + phases[i]) * delta * .018);
          if (item.type === "fireflies") position.setZ(i, position.getZ(i) + Math.cos(time * .28 + phases[i]) * delta * .012);
        }
        position.needsUpdate = true;
      }
    }

    for (const data of this.fish) {
      const angle = time * data.speed + data.phase;
      data.object.position.set(
        Math.cos(angle) * data.radius,
        data.height + Math.sin(time * .8 + data.phase) * .28,
        data.depth + Math.sin(angle) * data.radius * .35
      );
      data.object.rotation.y = -angle + Math.PI * .5;
      data.object.rotation.z = Math.sin(time * 1.3 + data.phase) * .08;
    }

    for (const data of this.clouds) {
      data.object.position.x += delta * data.speed;
      if (data.object.position.x > 17) data.object.position.x = -17;
      data.object.rotation.y = Math.sin(time * .05) * .06;
    }

    for (const butterfly of this.butterflies) {
      const data = butterfly.userData;
      const angle = time * data.speed + data.phase;
      butterfly.position.set(
        Math.cos(angle) * data.radius,
        data.height + Math.sin(time * 1.2 + data.phase) * .35,
        -1 + Math.sin(angle) * data.radius * .45
      );
      butterfly.rotation.y = -angle;
      data.wings[0].rotation.y = .35 + Math.sin(time * 9 + data.phase) * .75;
      data.wings[1].rotation.y = -.35 - Math.sin(time * 9 + data.phase) * .75;
    }
  }
}
