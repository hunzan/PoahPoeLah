# 跋桮啦！(Poa̍h-poe--lah)

> 一款以台灣傳統「擲筊」文化為靈感的互動式祈問 App  
> 由 **林阿猴 & 金蕉（Lîm A-kâu & Kim-chio）** 共同製作  
> 支援語音音效、玻璃感介面、可安裝成 PWA 或行動 App。

---

## 🎮 專案簡介

「跋桮啦！」是一款融合宗教文化與現代互動設計的小遊戲。  
玩家可誠心祈求後擲出「聖杯」「笑杯」「陰杯」等結果，  
搭配真實音效、柔和背景音樂、可選桮樣式與語言（中文／台語／英文）。  

🧋特色：
- 三語介面（zh / tl / en）
- 多款桮圖樣（12 組陰陽圖）
- 音效、BGM 全程持續播放（含 duck 降音效果）
- 支援 PWA（可離線、可安裝）
- 以 Capacitor 打包 Android / iOS App

---

## 📁 專案結構
```bash
PoahPoeLah/
│
├─ index.html # 主頁面（含主要邏輯）
│
├─ js/
│ └─ cups/
│ ├─ image.js # 桮圖渲染函式
│ ├─ manifest.js # 12 款桮清單（陰陽圖對應）
│ └─ registry.js # 匯出桮物件供主頁使用
│
├─ assets/
│ ├─ images/
│ │ ├─ cups/ # 24 張桮圖 (*.webp)
│ │ └─ bg.webp # 背景圖
│ └─ sounds/ # 音效與背景音樂
│ ├─ toss.ogg
│ ├─ ok.ogg
│ ├─ bad.ogg
│ ├─ meh.ogg
│ ├─ select.ogg
│ ├─ bg_01.ogg
│ └─ bg_02.ogg
│
├─ assets/icons/ # PWA icon（192px / 512px）
│
├─ manifest.webmanifest # PWA 設定
├─ service-worker.js # 離線快取與更新邏輯
├─ .gitignore # 忽略 android / ios / node_modules 等
└─ README.md
```

---

## 🚀 部署方式

### 一、GitHub Pages（Web 版）
1. 推上 GitHub：  
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
