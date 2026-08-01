# 套骨正・光彩舞台

使用 Three.js 製作的雙頁面互動裝置：

- `audience.html`：觀眾用的 3D 套骨正舞台，點擊角色會發亮與縮放。
- `controller.html`：操作人員控制台，可切換紅、黃、橘三種色彩或回到原始狀態。

兩頁透過 `BroadcastChannel` 與 `localStorage` 即時同步，適合在同一台電腦的兩個分頁或視窗中使用。

## 使用方式

從網站伺服器開啟 `audience.html` 與 `controller.html`。請勿直接雙擊 HTML 檔案，因為瀏覽器通常會限制本機 ES Modules。

## 技術

- Three.js
- WebGL shader 輪廓透明化與即時著色
- BroadcastChannel / localStorage 跨分頁同步
- 響應式、鍵盤快捷鍵（1–4）與 reduced-motion 支援
