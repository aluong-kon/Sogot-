# SOGOT 🇸🇸 — Traditional South Sudanese Stick Game

A 3D browser game inspired by **Sogot**, the traditional childhood stick game played by South Sudanese children across open dirt fields, courtyards, and villages.

![License](https://img.shields.io/badge/license-Apache--2.0-blue.svg)
![React](https://img.shields.io/badge/React-19-61dafb.svg)
![Three.js](https://img.shields.io/badge/Three.js-r182-black.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6.svg)

---

## 📖 About the Game

Across South Sudan—from Juba, Malakal, Wau, Bor, and Torit to rural homesteads and cattle camps—generations of children gather on red-earth clearings to play **Sogot**. With two branches carved from native acacia trees and an oblong trench dug into the red dirt, players compete to launch the short wooden stick as far downfield as possible.

### 🌟 Signature Cultural Mechanics

1. **The Traditional Call-and-Response**:
   - **Striker announces:** `"SOGOT!"`
   - **Opponents & Field roar back:** `"SOGOT! SOGOT!"`
   - Visual countdown ($3 \dots 2 \dots 1$) leads into the strike!
   - Optional live microphone shout detection allows players to shout `"SOGOT!"` into their microphone.

2. **The 3 Traditional Stages**:
   - **Stage A — The Lift (Flick):** Wedge the long stick into the trench (*dhol / kan*) beneath the short stick and flick it upward into the air.
   - **Stage B — The Strike:** Aim azimuth direction, set elevation loft angle, and time the mid-air strike at the peak of the arc.
   - **Stage C — Opponent Challenge & Defense:** Opponents in the outfield attempt to catch the flying stick. If uncaught, the fielder throws the stick back toward the launcher hole while the striker defends the ring.

3. **The 3-Strike "Carry Forward" & "Kuoc" Rule**:
   - If the stick is **not caught**, the player is carried forward to continue hitting for up to **3 consecutive strikes**!
   - If the player completes all 3 strikes without being caught, custom decrees the traditional **"Kuoc" (Piggyback)** penalty: the losing fielder must carry the striker on their back across the field back to the launcher hole to celebratory cheers!
   - If the stick is **caught** in the air at any time, the striker is immediately **OUT** and the bat passes to the opponent.

---

## 🎮 Game Modes

- **Practice Field:** Master the flick, mid-air timing, power charging, and trajectory tracking.
- **Local 2-Player Pass & Play:** Head-to-head match taking turns on one device.
- **Team Competition:** Team Bright Stars 🇸🇸 vs Team Nile Gazelles 🦌 with cumulative team distance.
- **South Sudan National Cup:** 8-team regional knockout bracket (Quarterfinals, Semifinals, Grand Final).

---

## 🛠️ Tech Stack

- **Framework:** React 19 + TypeScript + Vite
- **3D Graphics:** Three.js (Procedural PBR materials, custom red savannah soil, acacia tree generation, and dynamic camera tracking)
- **Audio:** 100% Procedural Web Audio API sound synthesis (resonant wood strikes, dirt landing thuds, crowd cheers, ambient savannah breeze, and voice synthesizers)
- **Styling:** Tailwind CSS

---

## 🚀 Getting Started

### Prerequisites

- Node.js (version 18 or newer)
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/sogot-game.git

# Navigate to the project directory
cd sogot-game

# Install dependencies
npm install

# Start local development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🌐 Deploy to Vercel

### Option 1: Deploy with Vercel CLI

```bash
# Install Vercel CLI globally (if not installed)
npm install -g vercel

# Deploy directly from terminal
vercel
```

### Option 2: Deploy via Vercel Dashboard (Recommended)

1. Push this repository to your GitHub account (see instructions below).
2. Go to [vercel.com](https://vercel.com) and log in.
3. Click **"Add New..."** ➔ **"Project"**.
4. Import your `sogot-game` GitHub repository.
5. Vercel automatically detects Vite:
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
6. Click **Deploy**!

---

## 📦 Pushing to GitHub

To push this codebase to your own GitHub repository:

```bash
# Initialize git if not already initialized
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: SOGOT South Sudanese 3D Stick Game"

# Set main branch
git branch -M main

# Add your GitHub repository remote
git remote add origin https://github.com/YOUR_USERNAME/sogot-game.git

# Push to GitHub
git push -u origin main
```

---

## 📜 Cultural Preservation

SOGOT is dedicated to preserving and celebrating traditional South Sudanese games and childhood cultural memory for communities around the world.
