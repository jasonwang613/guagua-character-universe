import { COLOR_STATES, getStageState, setStageState, subscribeAudience } from "./sync.js";

const buttons = [...document.querySelectorAll(".cue-button")];
const currentColor = document.querySelector("#current-color");
const nowSwatch = document.querySelector("#now-swatch");
const connectionTitle = document.querySelector("#connection-title");
const connectionNote = document.querySelector("#connection-note");
let readyTimer;

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

function send(color) {
  render(setStageState(color).color);
  connectionTitle.textContent = "指令已送出";
  connectionNote.textContent = `${COLOR_STATES[color].label}已同步到觀眾畫面`;
  clearTimeout(readyTimer);
  readyTimer = setTimeout(() => {
    connectionTitle.textContent = "連動中";
    connectionNote.textContent = "可繼續切換舞台顏色";
  }, 1800);
}

buttons.forEach((button) => button.addEventListener("click", () => send(button.dataset.color)));
window.addEventListener("keydown", (event) => {
  if (["1", "2", "3", "4"].includes(event.key)) buttons[Number(event.key) - 1].click();
});

subscribeAudience(() => {
  connectionTitle.textContent = "觀眾畫面已連線";
  connectionNote.textContent = "現在可以開始控制色彩";
  document.querySelector(".connection-card").classList.add("is-live");
});

render(getStageState().color, false);
