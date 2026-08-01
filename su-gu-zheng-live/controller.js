import {
  COLOR_STATES,
  getStageState,
  onControllerAuth,
  setStageState,
  signInController,
  signOutController,
  subscribeAudience,
  subscribeStageState,
} from "./sync.js?v=20260801-3";

const buttons = [...document.querySelectorAll(".cue-button")];
const currentColor = document.querySelector("#current-color");
const nowSwatch = document.querySelector("#now-swatch");
const connectionTitle = document.querySelector("#connection-title");
const connectionNote = document.querySelector("#connection-note");
const authButton = document.querySelector("#auth-button");
const authTitle = document.querySelector("#auth-title");
const authNote = document.querySelector("#auth-note");
let readyTimer;
let signedIn = false;

function render(color, animate = true) {
  const state = COLOR_STATES[color] || COLOR_STATES.original;
  document.body.dataset.color = color;
  currentColor.textContent = state.label;
  nowSwatch.style.setProperty("--swatch", state.hex);
  buttons.forEach((button) => {
    const active = button.dataset.color === color;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-pressed", String(active));
  });
  if (animate) {
    document.querySelector(".control-panel").animate(
      [{ transform: "translateY(0)" }, { transform: "translateY(-5px)" }, { transform: "translateY(0)" }],
      { duration: 280, easing: "cubic-bezier(.2,.8,.2,1)" },
    );
  }
}

async function send(color) {
  if (!signedIn) return authButton.click();
  buttons.forEach((button) => { button.disabled = true; });
  try {
    const state = await setStageState(color);
    render(state.color);
    connectionTitle.textContent = "指令已送出";
    connectionNote.textContent = `${COLOR_STATES[color].label}已同步到所有觀眾畫面`;
    clearTimeout(readyTimer);
    readyTimer = setTimeout(() => {
      connectionTitle.textContent = "雲端連動中";
      connectionNote.textContent = "可繼續切換舞台顏色";
    }, 1800);
  } catch (error) {
    connectionTitle.textContent = "指令送出失敗";
    connectionNote.textContent = error?.message || "請檢查網路後再試一次";
  } finally {
    buttons.forEach((button) => { button.disabled = !signedIn; });
  }
}

buttons.forEach((button) => button.addEventListener("click", () => send(button.dataset.color)));
window.addEventListener("keydown", (event) => {
  if (["1", "2", "3", "4"].includes(event.key)) buttons[Number(event.key) - 1].click();
});

subscribeAudience(() => {
  connectionTitle.textContent = "雲端已連線";
  connectionNote.textContent = "不同手機與瀏覽器都會同步";
  document.querySelector(".connection-card").classList.add("is-live");
});

subscribeStageState((state) => render(state.color, false), () => {
  connectionTitle.textContent = "雲端連線異常";
  connectionNote.textContent = "請確認網路連線";
});

onControllerAuth((user) => {
  signedIn = Boolean(user);
  buttons.forEach((button) => { button.disabled = !signedIn; });
  authButton.textContent = signedIn ? "登出" : "登入 Google";
  authTitle.textContent = signedIn ? "控制權已啟用" : "控制權尚未登入";
  authNote.textContent = signedIn ? user.email : "使用指定的 Google 帳號即可跨裝置控制";
  document.querySelector(".auth-card").classList.toggle("is-authorized", signedIn);
});

authButton.addEventListener("click", async () => {
  authButton.disabled = true;
  authNote.textContent = signedIn ? "正在安全登出…" : "正在開啟 Google 登入…";
  try {
    if (signedIn) await signOutController();
    else await signInController();
  } catch (error) {
    authTitle.textContent = "無法取得控制權";
    authNote.textContent = error?.message || "請再試一次";
  } finally {
    authButton.disabled = false;
  }
});

render(getStageState().color, false);
