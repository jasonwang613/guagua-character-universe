import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import { getDatabase, onValue, ref, set } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-database.js";
import {
  browserLocalPersistence,
  getAuth,
  GoogleAuthProvider,
  onAuthStateChanged,
  setPersistence,
  signInWithPopup,
  signInWithRedirect,
  signOut,
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

const STORAGE_KEY = "great-sheep-stage-state";
const CONTROLLER_EMAIL = "jasonwang613@gmail.com";
const firebaseConfig = {
  apiKey: "AIzaSyD4MUTpizIK8X-9_A0OH6sO6bw7VeQBwG8",
  authDomain: "great-sheep-live.firebaseapp.com",
  databaseURL: "https://great-sheep-live-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "great-sheep-live",
  storageBucket: "great-sheep-live.firebasestorage.app",
  messagingSenderId: "794518471281",
  appId: "1:794518471281:web:be3682dfee228a475a91d0",
};

export const COLOR_STATES = {
  original: { label: "原始彩繪", hex: "#f4b55f" },
  red: { label: "紅色光彩", hex: "#ff3d46" },
  yellow: { label: "黃色光彩", hex: "#ffd83d" },
  orange: { label: "橘色光彩", hex: "#ff8a2a" },
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const auth = getAuth(app);
const stageRef = ref(database, "stage");
const connectedRef = ref(database, ".info/connected");

function safeState(value) {
  return {
    color: COLOR_STATES[value?.color] ? value.color : "original",
    sentAt: Number(value?.sentAt) || Date.now(),
    source: typeof value?.source === "string" ? value.source : "default",
  };
}

function cacheState(state) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (_) { /* Private mode fallback. */ }
}

export function getStageState() {
  try { return safeState(JSON.parse(localStorage.getItem(STORAGE_KEY))); } catch (_) { return safeState(null); }
}

export async function setStageState(color) {
  if (auth.currentUser?.email !== CONTROLLER_EMAIL) throw new Error("請先使用授權的 Google 帳號登入");
  const state = safeState({ color, sentAt: Date.now(), source: "control-console" });
  await set(stageRef, state);
  cacheState(state);
  return state;
}

export function subscribeStageState(listener, onError) {
  return onValue(stageRef, (snapshot) => {
    if (!snapshot.exists()) return;
    const state = safeState(snapshot.val());
    cacheState(state);
    listener(state);
  }, onError);
}

export function subscribeAudience(listener) {
  return onValue(connectedRef, (snapshot) => {
    if (snapshot.val() === true) listener({ connected: true, sentAt: Date.now() });
  });
}

export function announceAudience() {
  // Realtime Database keeps the audience subscribed across browsers and devices.
}

export function onControllerAuth(listener) {
  return onAuthStateChanged(auth, (user) => listener(user?.email === CONTROLLER_EMAIL ? user : null));
}

export async function signInController() {
  await setPersistence(auth, browserLocalPersistence);
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });
  try {
    const result = await signInWithPopup(auth, provider);
    if (result.user.email !== CONTROLLER_EMAIL) {
      await signOut(auth);
      throw new Error(`此控制台僅限 ${CONTROLLER_EMAIL} 使用`);
    }
    return result.user;
  } catch (error) {
    if (["auth/popup-blocked", "auth/operation-not-supported-in-this-environment"].includes(error?.code)) {
      await signInWithRedirect(auth, provider);
      return null;
    }
    throw error;
  }
}

export function signOutController() {
  return signOut(auth);
}
