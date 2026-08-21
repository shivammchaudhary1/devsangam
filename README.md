# devsangam

1.  Product direction
    I recommend building one responsive React PWA first, not separate React web + React Native applications.

                           DevSangam
                               │
                        React + TypeScript
                               │
                  ┌────────────┴────────────┐
                  │                         │
              Desktop UI                Mobile UI
              Sidebar UI                Bottom Nav
              Analytics                 Chant-first UX
                  │                         │
                  └────────────┬────────────┘
                               │
                     Offline Session Engine
                               │
                        IndexedDB / Dexie
                               │
                        Express REST API
                               │
                         MongoDB Atlas

This matches the desktop/mobile distinction in the current designs while letting us maintain one frontend codebase. Vite is a good fit for the React client, and vite-plugin-pwa can add service-worker/PWA behavior without requiring us to build a separate mobile application immediately.

Later, if DevSangam genuinely needs App Store/Play Store-specific native capabilities, we can evaluate React Native. I would not take on that complexity for v1.

2. PRD v0.1 — DevSangam Digital Japamala
   Product vision

DevSangam should be a focused digital Sadhana companion where users can discover mantras, create a daily chanting goal, chant using a digital Japamala, maintain streaks, and understand their spiritual-practice consistency without the interface becoming distracting or gamified excessively.

Main user journey

Landing
↓
Register / Login
↓
Onboarding
├── Profile
├── Preferred Mantras
├── Goal / Intention
└── Reminder Preference
↓
Dashboard
↓
Choose Mantra
↓
Choose Target
108 | 216 | 1008 | Custom
↓
Start Session
↓
Digital Japamala
↓
Tap → Count
↓
Complete / Pause / Exit
↓
Session saved
↓
Insights / Streak updated

## MVP screens

The current designs map well to these routes:

/auth/login
/auth/register
/auth/forgot-password

/onboarding

/dashboard

/practice
/practice/:mantraId
/practice/:mantraId/session

/library
/library/:mantraSlug

/insights
/history
/achievements

/profile
/settings

MVP feature groups

Authentication

Email/password registration and login, logout, forgot password, session persistence, and optionally Google authentication.

Onboarding

Name, avatar, preferred mantras, intention such as Peace / Focus / Healing / Discipline, daily reminder preference, default target, and language.

Dashboard

Daily streak, today's practice, total malas, quick start, recent sessions, weekly summary, and overall progress.

Sadhana setup

Select mantra, read Sanskrit preview, select 108 / 216 / 1008 / custom count, and start a session.

Digital Japamala

This is the most important part of the product. The UI from your source already calls for the circular progress indicator, target/remaining count, mala count, sound, haptics and reset.

The counter must work independently of internet connectivity.

Sadhana Library

Search, categories, favorites, mantra page, Sanskrit, transliteration, meaning, benefits, ideal chant count, estimated time, and start-practice action.

Insights

Current/longest streak, weekly chanting, total malas, total time, mantra distribution, achievements, and session history.

Profile and settings

Profile details, reminders, chanting sound, haptic feedback, theme, language, password/security, logged-in devices and sync state.

## Not in MVP

I would deliberately postpone:

Social/community feed
Guru/follower system
Live group chanting
Chat
Leaderboards
Payments/subscriptions
AI spiritual advice
Full admin CMS
React Native application
Complex recommendation engine

This keeps version 1 centered around excellent chanting + reliable tracking.

3. Tech stack I recommend

Frontend

React
TypeScript
Vite

React Router
TanStack Query

Tailwind CSS v4
shadcn/ui
Radix primitives
Lucide React
Recharts

Dexie / IndexedDB
vite-plugin-pwa

//check
