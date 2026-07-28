# 🌌 Solitude — Personal Productivity Hub

[![Release](https://img.shields.io/github/v/release/exowynt/productivity-app?color=6366F1&style=for-the-badge)](https://github.com/exowynt/productivity-app/releases)
[![License](https://img.shields.io/github/license/exowynt/productivity-app?color=10B981&style=for-the-badge)](LICENSE)
[![Platform](https://img.shields.io/badge/Platform-Windows%20x64-3B82F6?style=for-the-badge&logo=windows)](https://github.com/exowynt/productivity-app/releases)
[![Built With](https://img.shields.io/badge/Tech-React%2019%20%7C%20TypeScript%20%7C%20Electron-8B5CF6?style=for-the-badge)](https://github.com/exowynt/productivity-app)

> **A sleek, minimalist desktop application designed to eliminate distraction, boost focus, and harmonize daily work with daily reflection.**

---

![Solitude Preview](assets/preview.png)

---

## ✨ Features at a Glance

### ⚡ **Focus Mode Centerpiece**
* **Pomodoro & Custom Timers:** Quick presets (15m, 25m Pomodoro, 45m Deep Study, 60m Power Hour, 5m Break) plus custom minute inputs.
* **Persistent Background Execution:** Timer runs continuously across all tabs without resetting when navigating between Dashboard, Tasks, Notes, Bible, or Analytics.
* **Live Header Status Pill:** Active countdown display (`00:00 — Deep Study Session`) right in the top navigation bar.
* **Completion Chime & Notifications:** Plays a Web Audio harmonic chime (`D5 -> A5`) and triggers native Windows desktop notifications when sessions finish.

### 🎯 **Long-Term Habit Tracker**
* **Daily Habit Checklists:** Build routines with custom color themes (Indigo, Emerald, Amber, Rose, Cyan, Violet) and one-click completion toggles.
* **Streak Counter:** Live streak tracking (`🔥 7d Streak`) and daily completion percentage metrics.
* **Multi-Timeframe Analytics Charts:** Toggle between **Today**, **Past 7 Days**, and **Monthly (30 Days)** consistency heatmaps to visualize long-term habit momentum!

### 📖 **365 Bible Verses, Reading Log & Reflection Journal**
* **Daily Scripture Reading Tracker:** Document what you read daily (e.g., *Genesis 1-3*, *Psalm 23*), chapters count, and reflection notes with historical reading timeline!
* **Zero Repeat Annual Engine:** 365 authentic, verified ESV Scripture verses (Genesis through Revelation). Guaranteed 0 repeated verses for an entire year!
* **Verse Refresh & Favorites:** Refresh icon button (`🔄`) to draw new Scripture on demand and heart button (`❤️`) to bookmark verses.
* **Date-Stamped Spiritual Journal:** Daily Reflection journal editor with saved history log.

### 🎨 **Artistic Wallpapers & 9 Color Theme Presets**
* **4 Aesthetic Photo Wallpapers:** *Snowy Peak*, *Alpine Lake Lodge*, *Rose Sunset Horizon*, and *Twilight Promise* paired with a **Translucent Frosted Glassmorphism UI** (`backdrop-filter: blur(20px)`).
* **9 Developer Color Palettes:** Midnight Slate, Dracula, Nordic Frost, Catppuccin Mocha, Tokyo Night, Rosé Pine, One Dark Pro, Solarized Dark, and Paper & Ink.

### ⚡ **Dual Layout Density Modes**
* **🌿 Calm Spacious (Default):** Generous margins, comfortable action buttons, and spacious cards.
* **⚡ Sleek Compact:** Condensed padding, tighter header (`56px`), smaller button heights, and high information density.

### 📋 **Daily Task Checklist & Sticky Notes**
* **Prioritized Tasks:** Drag/order tasks up and down, toggle completion, live progress bar, and instant clearing.
* **Digital Sticky Notes:** Color-coded digital sticky notes, pinning, and inline editing.

### 📊 **Study Analytics & History Log**
* **KPI Metrics:** Track today's focus minutes, current streak (`🔥 5d Streak`), weekly totals, and completed sessions.
* **Visual Charts:** Interactive Weekly Focus Bar Chart & Category breakdown progress bars.
* **Instant Session History:** Completed and manual sessions log on screen with zero delay.

---

## 📥 Download & Installation

### Option 1: Installer Executable (Recommended)
1. Download the latest installer **[Solitude Productivity Hub Setup 1.0.0.exe](https://github.com/exowynt/productivity-app/releases)** from GitHub Releases.
2. Run the installer to set up Solitude on your Windows computer with Desktop and Start Menu shortcuts.

### Option 2: Portable Executable
1. Download **[Solitude Productivity Hub 1.0.0.exe](https://github.com/exowynt/productivity-app/releases)**.
2. Run directly without installation.

---

## 🛠️ Local Development & Build Setup

### Prerequisites
* [Node.js](https://nodejs.org/) (v18 or higher recommended)
* npm (v9+)

### Installation
```bash
# 1. Clone the repository
git clone https://github.com/exowynt/productivity-app.git
cd productivity-app

# 2. Install dependencies
npm install

# 3. Launch live development environment
npm run dev
```

### Packaging & Executable Build
```bash
# Build Vite renderer & TypeScript main process
npm run build

# Package Windows setup installer & portable executable into release/
npm run dist
```

---

## 📜 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

Developed with ❤️ by [exowynt](https://github.com/exowynt).
