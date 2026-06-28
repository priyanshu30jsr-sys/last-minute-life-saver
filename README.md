# ⚡ LifeSaver AI — The Last-Minute Life Saver

> Your AI doesn't just remind you. It plans your entire day, adapts when you fall behind,
> and syncs with Google Calendar — all autonomously.


## 🚨 The Problem

Students and developers miss deadlines not because they're lazy — but because:
- Passive reminders don't tell you **what to do or when**
- Generic to-do apps don't adapt when you fall behind
- No tool **autonomously rebuilds your plan** when life happens

## 💡 The Solution

LifeSaver AI is a **chat-first autonomous productivity agent** powered by **Gemini 1.5 Pro
via Google AI Studio**. You describe your goal and deadline in plain language.
The AI takes over from there — planning, tracking, replanning, and syncing
everything to Google Calendar without you lifting a finger.

---

## 🤖 Agentic Depth — What Makes This Different

| Feature | How it works |
|---|---|
| **Autonomous Planning** | Describe a goal → Gemini generates a full day-by-day action plan in structured JSON, saved to MongoDB |
| **Adaptive Replanning** | Mark a step as skipped → Gemini immediately regenerates the remaining plan to still hit the deadline. Zero user prompting needed. |
| **Proactive Briefs** | A cron job at 7 AM calls Gemini with each user's full plan context and pushes a personalized priority brief via Socket.io |
| **Calendar Auto-Sync** | After plan generation, every step is auto-created as a Google Calendar event with reminders |
| **AI Priority Ranking** | Gemini analyzes urgency × complexity × past completion to rank tasks — not just by date |

---

## 🛠️ Tech Stack

### Frontend
| Tech | Purpose |
|---|---|
| React 18 + Vite | Core frontend framework |
| Three.js + React Three Fiber | 3D orb, particle backgrounds, 3D bar chart |
| Framer Motion | Page transitions, card flip reveal, chat bubbles |
| GSAP + ScrollTrigger | Scroll-triggered reveal animations |
| Tailwind CSS | Utility styling with custom Google palette |
| Socket.io Client | Live plan updates and morning briefs |
| Recharts | Animated progress charts |

### Backend
| Tech | Purpose |
|---|---|
| Node.js + Express | REST API server |
| MongoDB + Mongoose | Plan, user, and chat persistence |
| @google/generative-ai | Gemini 1.5 Pro via Google AI Studio |
| googleapis | Google Calendar API (OAuth 2.0) |
| Socket.io | Real-time replan and brief delivery |
| node-cron | 7 AM morning brief scheduler |
| JWT + bcryptjs | Auth |

### Infrastructure (All Google)
| Service | Purpose |
|---|---|
| **Google AI Studio** | Gemini 1.5 Pro API |
| **Google Calendar API** | Autonomous event creation |
| **Firebase Hosting** | Frontend (React) |
| **Render** | Backend (Node.js, containerized) |
| **MongoDB Atlas** | Database (free tier) |

---

## 🎨 Design System

- **Background:** Deep space navy `#0A0F1E`
- **Google AI gradient:** `#4285F4` → `#EA4335` → `#FBBC04` → `#34A853`
- **Gemini accent:** `#8B5CF6`
- **Glass cards:** `rgba(255,255,255,0.05)` + `backdrop-filter: blur(16px)`
- **Typography:** Google Sans / Plus Jakarta Sans + JetBrains Mono

### 3D Effects
- Floating shader orb (Three.js custom vertex/fragment shaders in Google colors)
- Particle background (Three.js, 1200 points, Google blue/purple)
- 3D card tilt on hover (CSS perspective + JS mouse tracking)
- Liquid loader when Gemini is "thinking" (SVG wave animation)
- Card flip reveal when plan steps appear (CSS 3D rotateY)
- Morphing blob backgrounds (CSS border-radius keyframe animation)
- SVG checkmark draw animation on step completion

---

## 🚀 Local Setup

### Prerequisites
- Node.js ≥ 20
- MongoDB Atlas account (free)
- Google AI Studio API key
- Google Cloud project with Calendar API enabled

### 1. Clone
```bash
git clone https://github.com/YOUR_USERNAME/last-minute-life-saver.git
cd last-minute-life-saver
```

### 2. Backend
```bash
cd server
npm install
cp .env.example .env
# Fill in all values in .env
npm run dev
```

### 3. Frontend
```bash
cd client
npm install
cp .env.example .env
# Fill in VITE_API_URL=http://localhost:8080/api
npm run dev
```

### 4. Open
