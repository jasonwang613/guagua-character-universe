import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { CinematicWorlds } from "./worlds.js";
import { CharacterEffects } from "./effects.js";

const A = "./assets/characters/";
const characters = [
  {
    id: "little-cucumber", name: "小黃瓜", image: `${A}little-cucumber.webp`, world: "land",
    role: "瓜族 · 童子軍", description: "正值青春期、任性愛玩，卻有一顆勇於冒險的心。每一次出發，都是花園裡的新故事。",
    energy: 88, kind: 96, courage: 92, accent: "#d9f75d",
  },
  {
    id: "cucumber-mama", name: "黃瓜媽媽", image: `${A}cucumber-mama.webp`, world: "land",
    role: "瓜族 · 護士長", description: "最關心大家、最溫柔的代表。面對家庭危機時，她總會鼓起勇氣，成為最可靠的後盾。",
    energy: 82, kind: 100, courage: 91, accent: "#a9df52",
  },
  {
    id: "watermelon", name: "西瓜", image: `${A}watermelon.webp`, world: "land",
    role: "瓜族 · 偵查兵", description: "負責傳遞訊息與大家的聲音，也會祈求瓜瓜有燈照耀。圓滾滾的外表裡，藏著敏銳觀察力。",
    energy: 76, kind: 94, courage: 80, accent: "#70c849",
  },
  {
    id: "papaya", name: "木瓜", image: `${A}papaya.webp`, world: "land",
    role: "瓜族 · 開心果", description: "笑口常開、雙手靈活，是大家最喜歡的開心果。只要她在，花園就不會安靜太久。",
    energy: 91, kind: 98, courage: 78, accent: "#ffc84b",
  },
  {
    id: "melon", name: "洋香瓜", image: `${A}melon.webp`, world: "land",
    role: "瓜族 · 漂亮寶貝", description: "甜度超標、頭上的旋轉天線還能自動驅蚊。她時時提醒大家，要保持漂亮也保持清醒。",
    energy: 84, kind: 93, courage: 73, accent: "#ffd23f",
  },
  {
    id: "bitter-gourd", name: "苦瓜園長", image: `${A}bitter-gourd.webp`, world: "land",
    role: "瓜族 · 園長", description: "擅長搞笑、調解情緒，但常常失敗；偶爾出門還會被自己的門擋住，是花園裡最忙碌的園長。",
    energy: 65, kind: 89, courage: 74, accent: "#7aa644",
  },
  {
    id: "guagua", name: "瓜瓜", image: `${A}guagua.webp`, world: "land",
    role: "瓜族 · 神秘旅伴", description: "來自花園中心的圓滾滾旅伴，眼神冷靜、行動俐落。遇到難題時，總能找到意想不到的捷徑。",
    energy: 79, kind: 86, courage: 88, accent: "#badd72",
  },
  {
    id: "purple-loofah", name: "紫絲瓜", image: `${A}purple-loofah.webp`, world: "land",
    role: "瓜族 · 海螺使者", description: "頭頂紫色果梗、手持海螺號角，負責把遠方的消息送回瓜園，也是陸地與海底的聯絡人。",
    energy: 80, kind: 90, courage: 85, accent: "#8d4aa4",
  },
  {
    id: "diaoweichui", name: "吊尾錘", image: `${A}diaoweichui.webp`, world: "sea",
    role: "燈族 · 忙內", description: "年紀最小、勇氣最多，曾是瓜族的一員，如今化身守護家園的藍角戰士。",
    energy: 83, kind: 97, courage: 99, accent: "#50d4ef",
  },
  {
    id: "green-light", name: "綠燈燈", image: `${A}green-light.webp`, world: "sea",
    role: "燈族 · 安全官", description: "掌控綠燈、一切順利；遇到嚴肅任務會立刻上線，偶爾也忍不住在市場訂購秘密裝備。",
    energy: 77, kind: 88, courage: 90, accent: "#73db79",
  },
  {
    id: "crystal-light", name: "水晶燈燈", image: `${A}crystal-light.webp`, world: "sea",
    role: "燈族 · 法師", description: "能操控藍色光芒，也會放射藍光攻擊。她從頭頂綻放的光，安靜卻充滿力量。",
    energy: 98, kind: 82, courage: 91, accent: "#58cdea",
  },
  {
    id: "bright-light", name: "光明燈燈", image: `${A}bright-light.webp`, world: "sea",
    role: "燈族 · 司令官", description: "專門控制紅色的光，負責點亮紅燈；小朋友成績滿分時，她的觸角會亮得特別耀眼。",
    energy: 92, kind: 94, courage: 94, accent: "#ff7586",
  },
  {
    id: "ghost-light", name: "幽靈燈燈", image: `${A}ghost-light.webp`, world: "sea",
    role: "燈族 · 長老", description: "外形像幽靈，閃過時常念著神祕咒語。看起來輕飄飄，卻保管著王國最久遠的記憶。",
    energy: 86, kind: 75, courage: 87, accent: "#9fe4e7",
  },
  {
    id: "octopus-light", name: "章魚燈燈", image: `${A}octopus-light.webp`, world: "sea",
    role: "燈族 · 戰士", description: "急速閃光、突然急凍，是海底攝影任務的高手。八隻手同時工作，沒有任何畫面能逃過他。",
    energy: 96, kind: 84, courage: 98, accent: "#60d9e5",
  },
  {
    id: "conch-warrior", name: "海螺勇士", image: `${A}conch-warrior.webp`, world: "sea",
    role: "燈族 · 潮汐守衛", description: "背著會唱歌的海螺，沿著珊瑚邊界巡邏。海螺一響，遠方的夥伴就知道該集合了。",
    energy: 89, kind: 90, courage: 96, accent: "#df75a1",
  },
  {
    id: "light-king", name: "燈燈國王", image: `${A}light-king.webp`, world: "sea",
    role: "燈族 · 國王", description: "光一移動就能讓土地震動、山脈搖動，掌控整個燈堡的生命，是威嚴又溫暖的守護者。",
    energy: 100, kind: 86, courage: 100, accent: "#ff684f",
  },
  {
    id: "algae-prince", name: "藍藻王子", image: `${A}algae-prince.webp`, world: "sea",
    role: "海裡面的華麗藍色", description: "住在海底中冷面養區，擁有無限能量；他會請你吃好喝到飽，也會率領藍藻之光前進。",
    energy: 100, kind: 91, courage: 93, accent: "#4099e4",
  },
  {
    id: "chong-lai", name: "蟲來", image: `${A}chong-lai.webp`, world: "land",
    role: "蟲族 · 英雄", description: "農場裡欺負小黃瓜、最有錢的英雄。外表尖刺滿滿，內心其實很在意夥伴的目光。",
    energy: 90, kind: 58, courage: 96, accent: "#f3903d",
  },
  {
    id: "chong-xin", name: "蟲新", image: `${A}chong-xin.webp`, world: "land",
    role: "蟲族 · 忙內", description: "喜歡吃葉子，是蟲族最小的成員；平常喜歡在花園中翻滾，總是帶著毫不保留的大笑。",
    energy: 74, kind: 96, courage: 81, accent: "#f7a431",
  },
];

const references = [
  ["character-card-01.webp", "角色卡 01｜小黃瓜、黃瓜媽媽"],
  ["character-card-03.webp", "角色卡 03｜西瓜、木瓜"],
  ["character-card-04.webp", "角色卡 04｜洋香瓜、苦瓜園長"],
  ["character-card-06.webp", "角色卡 06｜吊尾錘、綠燈燈"],
  ["character-card-07.webp", "角色卡 07｜水晶燈燈、光明燈燈"],
  ["character-card-08.webp", "角色卡 08｜幽靈燈燈、章魚燈燈"],
  ["character-card-09.webp", "角色卡 09｜燈燈國王、藍藻王子"],
  ["character-card-10.webp", "角色卡 10｜蟲來、蟲新"],
  ["model-reference-a.webp", "3D 造型參考 A"],
  ["model-reference-b.webp", "3D 造型參考 B"],
];

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];
const ui = {
  theater: $("#theater"), name: $("#characterName"), role: $("#characterRole"),
  description: $("#characterDescription"), no: $("#characterNo"), world: $("#characterWorld"),
  energy: $("#statEnergy"), kind: $("#statKind"), courage: $("#statCourage"),
  castGrid: $("#castGrid"), dialogGrid: $("#dialogGrid"), dialog: $("#castDialog"),
  sceneChinese: $("#sceneChinese"), sceneEnglish: $("#sceneEnglish"),
};

let activeIndex = 0;
let currentWorld = "land";
let motionEnabled = !matchMedia("(prefers-reduced-motion: reduce)").matches;
let characterObject;
let characterMaterial;
let characterPlane;
let targetCharacterScale = 1;

const canvas = $("#worldCanvas");
const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x0b526b, 0.035);
const characterEffects = new CharacterEffects(scene);

const camera = new THREE.PerspectiveCamera(38, innerWidth / innerHeight, 0.1, 100);
camera.position.set(1.8, 2.7, 11);

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "high-performance" });
renderer.setPixelRatio(Math.min(devicePixelRatio, innerWidth < 900 ? 1.35 : 1.8));
renderer.setSize(innerWidth, innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.12;

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.06;
controls.enablePan = false;
controls.minDistance = 7.8;
controls.maxDistance = 14;
controls.minPolarAngle = Math.PI * 0.31;
controls.maxPolarAngle = Math.PI * 0.62;
controls.minAzimuthAngle = -0.42;
controls.maxAzimuthAngle = 0.42;
controls.target.set(1.7, 2.1, 0);

scene.add(new THREE.HemisphereLight(0xb9f4ff, 0x153623, 2.5));
const keyLight = new THREE.DirectionalLight(0xffffff, 3.8);
keyLight.position.set(5, 9, 6);
scene.add(keyLight);
const rimLight = new THREE.PointLight(0x55e9ff, 25, 18);
rimLight.position.set(3, 3, -3);
scene.add(rimLight);

const cinematicWorlds = new CinematicWorlds({ scene, camera, rimLight, keyLight });

let environment = new THREE.Group();
scene.add(environment);

function material(color, roughness = 0.8, emissive = 0x000000) {
  return new THREE.MeshStandardMaterial({ color, roughness, emissive, emissiveIntensity: 0.25 });
}

function randomBetween(min, max) { return min + Math.random() * (max - min); }

function addSeaEnvironment() {
  scene.fog.color.set(0x07475f);
  scene.fog.density = 0.042;
  rimLight.color.set(0x50e9ff);
  keyLight.color.set(0xb9fbff);

  const floor = new THREE.Mesh(
    new THREE.CylinderGeometry(7.5, 8.3, 0.55, 64),
    material(0x0b6273, 0.9, 0x063b42)
  );
  floor.position.y = -1.05;
  environment.add(floor);

  for (let i = 0; i < 22; i++) {
    const rock = new THREE.Mesh(
      new THREE.DodecahedronGeometry(randomBetween(0.13, 0.5), 0),
      material(i % 3 === 0 ? 0xe06b5e : 0x18778a, 1)
    );
    const angle = Math.random() * Math.PI * 2;
    const radius = randomBetween(3.2, 7);
    rock.position.set(Math.cos(angle) * radius, randomBetween(-0.75, -0.45), Math.sin(angle) * radius);
    rock.scale.y = randomBetween(0.6, 1.5);
    rock.rotation.set(Math.random(), Math.random(), Math.random());
    environment.add(rock);
  }

  for (let i = 0; i < 14; i++) {
    const coral = new THREE.Group();
    const branches = 2 + Math.floor(Math.random() * 4);
    const coralColor = [0xff745f, 0xf5b85b, 0x9e73d8][i % 3];
    for (let j = 0; j < branches; j++) {
      const branch = new THREE.Mesh(
        new THREE.CapsuleGeometry(randomBetween(.055, .11), randomBetween(.55, 1.6), 5, 8),
        material(coralColor, .78, coralColor)
      );
      branch.position.set((j - branches / 2) * .16, randomBetween(.2, .8), 0);
      branch.rotation.z = randomBetween(-.45, .45);
      coral.add(branch);
    }
    const angle = (i / 14) * Math.PI * 2;
    const radius = randomBetween(4.6, 7.1);
    coral.position.set(Math.cos(angle) * radius, -.62, Math.sin(angle) * radius);
    environment.add(coral);
  }

  const bubbleGeo = new THREE.BufferGeometry();
  const positions = [];
  for (let i = 0; i < 170; i++) positions.push(randomBetween(-10, 10), randomBetween(-1, 11), randomBetween(-8, 4));
  bubbleGeo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  const bubbles = new THREE.Points(
    bubbleGeo,
    new THREE.PointsMaterial({ color: 0xcafaff, size: .045, transparent: true, opacity: .7, sizeAttenuation: true })
  );
  bubbles.userData.isParticles = true;
  environment.add(bubbles);

  for (let i = 0; i < 5; i++) {
    const ray = new THREE.Mesh(
      new THREE.ConeGeometry(randomBetween(.5, 1.4), 13, 12, 1, true),
      new THREE.MeshBasicMaterial({ color: 0xa9f6ff, transparent: true, opacity: .028, side: THREE.DoubleSide, depthWrite: false })
    );
    ray.position.set(randomBetween(-5, 8), 5.2, randomBetween(-5, 0));
    ray.rotation.z = randomBetween(-.15, .15);
    environment.add(ray);
  }
}

function addLandEnvironment() {
  scene.fog.color.set(0x3c6a35);
  scene.fog.density = 0.03;
  rimLight.color.set(0xffbd55);
  keyLight.color.set(0xfff1ba);

  const floor = new THREE.Mesh(
    new THREE.CylinderGeometry(8, 8.8, 0.75, 64),
    material(0x5c8d42, 1, 0x183c1a)
  );
  floor.position.y = -1.1;
  environment.add(floor);

  for (let i = 0; i < 28; i++) {
    const plant = new THREE.Group();
    const stem = new THREE.Mesh(new THREE.CylinderGeometry(.025, .04, randomBetween(.45, 1.5), 7), material(0x315e28));
    stem.position.y = .35;
    plant.add(stem);
    const petalCount = 5 + (i % 3);
    const flowerColor = [0xffd661, 0xff785e, 0xd1f070, 0xf4a8c6][i % 4];
    for (let p = 0; p < petalCount; p++) {
      const petal = new THREE.Mesh(new THREE.SphereGeometry(.12, 8, 6), material(flowerColor, .7, flowerColor));
      const a = (p / petalCount) * Math.PI * 2;
      petal.scale.set(.65, 1.3, .4);
      petal.position.set(Math.cos(a) * .15, .9 + Math.sin(a) * .15, Math.sin(a) * .08);
      petal.rotation.z = -a;
      plant.add(petal);
    }
    const angle = Math.random() * Math.PI * 2;
    const radius = randomBetween(4.2, 7.7);
    plant.position.set(Math.cos(angle) * radius, -.63, Math.sin(angle) * radius);
    plant.scale.setScalar(randomBetween(.7, 1.35));
    environment.add(plant);
  }

  const pollenGeo = new THREE.BufferGeometry();
  const positions = [];
  for (let i = 0; i < 130; i++) positions.push(randomBetween(-10, 10), randomBetween(-.5, 10), randomBetween(-8, 3));
  pollenGeo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  const pollen = new THREE.Points(
    pollenGeo,
    new THREE.PointsMaterial({ color: 0xffe98a, size: .055, transparent: true, opacity: .68, sizeAttenuation: true })
  );
  pollen.userData.isParticles = true;
  environment.add(pollen);
}

function clearEnvironment() {
  environment.traverse((object) => {
    object.geometry?.dispose();
    if (Array.isArray(object.material)) object.material.forEach((m) => m.dispose());
    else object.material?.dispose();
  });
  scene.remove(environment);
  environment = new THREE.Group();
  scene.add(environment);
}

function setWorld(world) {
  currentWorld = world;
  cinematicWorlds.setWorld(world);
  ui.theater.classList.toggle("world-sea", world === "sea");
  ui.theater.classList.toggle("world-land", world === "land");
  $$(".world-switch button").forEach((button) => button.classList.toggle("is-active", button.dataset.world === world));
  ui.sceneChinese.textContent = world === "sea" ? "深海光域" : "瓜瓜花園";
  ui.sceneEnglish.textContent = world === "sea" ? "THE LUMINOUS DEEP" : "THE LIVING GARDEN";
}

function disposeCharacter() {
  if (!characterObject) return;
  characterEffects.clearTarget();
  characterPlane = null;
  characterObject.traverse((object) => {
    object.geometry?.dispose();
    if (object.material?.map) object.material.map.dispose();
    object.material?.dispose();
  });
  scene.remove(characterObject);
}

function loadCharacter(character) {
  targetCharacterScale = 0;
  new THREE.TextureLoader().load(character.image, (texture) => {
    disposeCharacter();
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
    const image = texture.image;
    const targetHeight = innerWidth < 900 ? 4.4 : 5.7;
    const width = targetHeight * (image.width / image.height);

    characterObject = new THREE.Group();
    characterObject.position.set(innerWidth < 900 ? 0 : 2.7, innerWidth < 900 ? 1.8 : 1.95, 0);
    const plane = new THREE.Mesh(
      new THREE.PlaneGeometry(width, targetHeight),
      new THREE.MeshBasicMaterial({ map: texture, transparent: true, alphaTest: .015, side: THREE.DoubleSide })
    );
    characterPlane = plane;
    plane.userData.isCharacterHitTarget = true;
    characterMaterial = plane.material;
    characterObject.add(plane);

    const glow = new THREE.Mesh(
      new THREE.CircleGeometry(Math.max(width, targetHeight) * .68, 64),
      new THREE.MeshBasicMaterial({ color: character.accent, transparent: true, opacity: .08, depthWrite: false })
    );
    glow.position.z = -.25;
    characterObject.add(glow);

    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(Math.max(width, targetHeight) * .55, .018, 8, 80),
      new THREE.MeshBasicMaterial({ color: character.accent, transparent: true, opacity: .2 })
    );
    ring.position.z = -.2;
    ring.rotation.x = .05;
    characterObject.add(ring);

    characterObject.scale.setScalar(.001);
    scene.add(characterObject);
    characterEffects.setTarget(characterObject, plane, character);
    $("#powerName").textContent = characterEffects.profileName(character.id);
    canvas.classList.add("is-power-ready");
    setTimeout(() => triggerCharacterPower(.65), 260);
    targetCharacterScale = 1;
    $("#loading").classList.add("is-hidden");
  });
}

function updateUI(index, switchEnvironment = true) {
  activeIndex = (index + characters.length) % characters.length;
  const character = characters[activeIndex];
  ui.name.textContent = character.name;
  ui.role.textContent = character.role;
  ui.description.textContent = character.description;
  ui.no.textContent = `NO. ${String(activeIndex + 1).padStart(2, "0")}`;
  ui.world.textContent = character.world === "sea" ? "海底居民" : "陸地居民";
  ui.energy.textContent = character.energy;
  ui.kind.textContent = character.kind;
  ui.courage.textContent = character.courage;
  document.documentElement.style.setProperty("--lime", character.accent);
  loadCharacter(character);
  if (switchEnvironment && currentWorld !== character.world) setWorld(character.world);
}

function cardTemplate(character, index) {
  return `
    <button class="cast-card" type="button" data-index="${index}" data-world="${character.world}" aria-label="選擇${character.name}">
      <span class="cast-card__top"><b>${character.name}</b><small>${character.world === "sea" ? "海底" : "陸地"}</small></span>
      <img src="${character.image}" alt="${character.name}角色立繪" />
    </button>`;
}

function renderCards(filter = "all") {
  ui.castGrid.innerHTML = characters
    .map((character, index) => ({ character, index }))
    .filter(({ character }) => filter === "all" || character.world === filter)
    .map(({ character, index }) => cardTemplate(character, index))
    .join("");
}

ui.dialogGrid.innerHTML = characters.map(cardTemplate).join("");
renderCards();

$("#referenceTrack").innerHTML = references.map(([file, caption]) => `
  <button class="reference-card" type="button" data-image="./assets/references/${file}" data-caption="${caption}">
    <img src="./assets/references/${file}" alt="${caption}" />
    <span>${caption} ↗</span>
  </button>`).join("");

document.addEventListener("click", (event) => {
  const card = event.target.closest(".cast-card");
  if (card) {
    updateUI(Number(card.dataset.index));
    ui.dialog.close();
    if (card.closest(".cast-section")) ui.theater.scrollIntoView({ behavior: "smooth" });
  }
  const reference = event.target.closest(".reference-card");
  if (reference) {
    $("#lightboxImage").src = reference.dataset.image;
    $("#lightboxImage").alt = reference.dataset.caption;
    $("#lightboxCaption").textContent = reference.dataset.caption;
    $("#lightbox").showModal();
  }
});

document.addEventListener("pointerdown", (event) => {
  const card = event.target.closest(".cast-card");
  if (!card) return;
  card.classList.remove("is-hopping");
  requestAnimationFrame(() => card.classList.add("is-hopping"));
  setTimeout(() => card.classList.remove("is-hopping"), 560);
});

$$(".world-switch button").forEach((button) => button.addEventListener("click", () => setWorld(button.dataset.world)));
$$(".filter-row button").forEach((button) => button.addEventListener("click", () => {
  $$(".filter-row button").forEach((item) => item.classList.toggle("is-active", item === button));
  renderCards(button.dataset.filter);
}));

$("#prevCharacter").addEventListener("click", () => updateUI(activeIndex - 1));
$("#nextCharacter").addEventListener("click", () => updateUI(activeIndex + 1));
$("#openCast").addEventListener("click", () => ui.dialog.showModal());
$("#closeCast").addEventListener("click", () => ui.dialog.close());
$("#closeLightbox").addEventListener("click", () => $("#lightbox").close());
$("#motionToggle").setAttribute("aria-pressed", String(motionEnabled));
$("#motionToggle").addEventListener("click", (event) => {
  motionEnabled = !motionEnabled;
  event.currentTarget.setAttribute("aria-pressed", String(motionEnabled));
  event.currentTarget.querySelector("span:last-child").textContent = motionEnabled ? "動態開啟" : "動態暫停";
});

function triggerCharacterPower(strength = 1) {
  if (!characterObject || !characterPlane) return;
  if (!motionEnabled) {
    motionEnabled = true;
    $("#motionToggle").setAttribute("aria-pressed", "true");
    $("#motionToggle").querySelector("span:last-child").textContent = "動態開啟";
  }
  characterEffects.trigger(strength);
  const hint = $("#powerHint");
  hint.classList.remove("is-bursting");
  requestAnimationFrame(() => hint.classList.add("is-bursting"));
  setTimeout(() => hint.classList.remove("is-bursting"), 650);
}

$("#powerHint").addEventListener("click", () => triggerCharacterPower(1.15));

const raycaster = new THREE.Raycaster();
const pointerNdc = new THREE.Vector2();
let pointerDownPosition = null;
canvas.addEventListener("pointerdown", (event) => {
  pointerDownPosition = { x: event.clientX, y: event.clientY };
});
canvas.addEventListener("pointerup", (event) => {
  if (!pointerDownPosition || !characterPlane) return;
  const distance = Math.hypot(event.clientX - pointerDownPosition.x, event.clientY - pointerDownPosition.y);
  pointerDownPosition = null;
  if (distance > 9) return;
  const rect = canvas.getBoundingClientRect();
  pointerNdc.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  pointerNdc.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  raycaster.setFromCamera(pointerNdc, camera);
  if (raycaster.intersectObject(characterPlane, false).length) triggerCharacterPower(1.25);
});

for (const dialog of $$("dialog")) {
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) dialog.close();
  });
}

let pointerX = 0;
let pointerY = 0;
addEventListener("pointermove", (event) => {
  pointerX = (event.clientX / innerWidth - .5) * 2;
  pointerY = (event.clientY / innerHeight - .5) * 2;
});

addEventListener("keydown", (event) => {
  if (event.key === "ArrowLeft") updateUI(activeIndex - 1);
  if (event.key === "ArrowRight") updateUI(activeIndex + 1);
});

function resize() {
  const height = ui.theater.clientHeight;
  camera.aspect = innerWidth / height;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, height);
  camera.position.x = innerWidth < 900 ? 0 : 1.8;
  controls.target.x = innerWidth < 900 ? 0 : 1.7;
  if (characterObject) characterObject.position.x = innerWidth < 900 ? 0 : 2.7;
}
addEventListener("resize", resize);

const clock = new THREE.Clock();
function animate() {
  requestAnimationFrame(animate);
  const delta = clock.getDelta();
  const t = clock.elapsedTime;
  controls.update();

  if (characterObject) {
    characterObject.scale.lerp(new THREE.Vector3(targetCharacterScale, targetCharacterScale, targetCharacterScale), .08);
    if (motionEnabled) {
      characterObject.position.y += (1.95 + Math.sin(t * 1.25) * .09 - characterObject.position.y) * .06;
      characterObject.rotation.y += (pointerX * .055 - characterObject.rotation.y) * .045;
      characterObject.rotation.x += (-pointerY * .025 - characterObject.rotation.x) * .045;
    }
  }

  environment.children.forEach((child, index) => {
    if (child.userData.isParticles && motionEnabled) {
      child.rotation.y = t * .015;
      child.position.y = Math.sin(t * .25) * .12;
    } else if (motionEnabled && child.type === "Group") {
      child.rotation.z = Math.sin(t * .7 + index) * .025;
    }
  });
  cinematicWorlds.update(t, motionEnabled ? delta : 0);
  characterEffects.update(t, delta, motionEnabled);
  renderer.render(scene, camera);
}

setWorld("land");
updateUI(0, false);
resize();
animate();
