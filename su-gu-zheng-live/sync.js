const CHANNEL_NAME = "su-gu-zheng-live-color";
const STORAGE_KEY = "su-gu-zheng-stage-state";

export const COLOR_STATES = {
  original: { label: "原始彩繪", hex: "#f4b55f" },
  red: { label: "紅色光彩", hex: "#ff3d46" },
  yellow: { label: "黃色光彩", hex: "#ffd83d" },
  orange: { label: "橘色光彩", hex: "#ff8a2a" },
};

const channel = "BroadcastChannel" in window ? new BroadcastChannel(CHANNEL_NAME) : null;

export function getStageState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (saved && COLOR_STATES[saved.color]) return saved;
  } catch (_) {
    // Ignore invalid data and restore the safe default.
  }
  return { color: "original", sentAt: Date.now() };
}

export function setStageState(color) {
  const state = { color: COLOR_STATES[color] ? color : "original", sentAt: Date.now() };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  channel?.postMessage({ type: "stage-state", ...state });
  return state;
}

export function subscribeStageState(listener) {
  const onChannel = (event) => {
    if (event.data?.type === "stage-state") listener(event.data);
  };
  const onStorage = (event) => {
    if (event.key !== STORAGE_KEY || !event.newValue) return;
    try { listener(JSON.parse(event.newValue)); } catch (_) { /* no-op */ }
  };
  channel?.addEventListener("message", onChannel);
  window.addEventListener("storage", onStorage);
  return () => {
    channel?.removeEventListener("message", onChannel);
    window.removeEventListener("storage", onStorage);
  };
}

export function announceAudience() {
  channel?.postMessage({ type: "audience-ready", sentAt: Date.now() });
  channel?.addEventListener("message", (event) => {
    if (event.data?.type === "audience-check") {
      channel.postMessage({ type: "audience-ready", sentAt: Date.now() });
    }
  });
}

export function subscribeAudience(listener) {
  const handler = (event) => {
    if (event.data?.type === "audience-ready") listener(event.data);
  };
  channel?.addEventListener("message", handler);
  channel?.postMessage({ type: "audience-check", sentAt: Date.now() });
  return () => channel?.removeEventListener("message", handler);
}
