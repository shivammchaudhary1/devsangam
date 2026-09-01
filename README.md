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





| Metric           |   Earlier Phase 8 |               Current |
| ---------------- | ----------------: | --------------------: |
| Production build |            ~50 MB |            **~15 MB** |
| PWA precache     |        12,654 KiB |      **3,094.81 KiB** |
| PWA entries      |              113+ |                **81** |
| Om audio         |           38.9 MB |          **11.66 MB** |
| Logo             |            491 KB |             **27 KB** |
| Fonts            | 48 files / 812 KB | **20 files / 600 KB** |
| Main CSS         |         206.91 KB |         **160.37 KB** |
| CSS gzip         |          44.82 KB |          **25.89 KB** |
| Total JS         |                 — |            **809 KB** |


| Step      | Work                                                                                       | Status                           |
| --------- | ------------------------------------------------------------------------------------------ | -------------------------------- |
| 8.01–8.24 | Architecture foundation, page refactors, shared utilities, Toast, loading/state foundation | DONE                             |
| 8.25      | Remaining PNG investigation                                                                | DONE                             |
| 8.26      | Old PNG cleanup                                                                            | DONE                             |
| 8.27      | Logo optimization + favicon                                                                | DONE                             |
| 8.28      | Om audio inspection                                                                        | DONE                             |
| 8.29      | Om audio optimization                                                                      | DONE                             |
| 8.30      | Audio loading behavior                                                                     | DONE                             |
| 8.31      | PWA cache optimization                                                                     | DONE                             |
| 8.32      | Font optimization                                                                          | DONE                             |
| **8.33**  | **JavaScript bundle optimization**                                                         | **IN PROGRESS — audit complete** |
| 8.34      | React render-performance audit                                                             | NOT STARTED                      |
| 8.35      | TanStack Query optimization                                                                | NOT STARTED                      |
| 8.36      | Remaining loading-state migrations                                                         | NOT STARTED                      |
| 8.37      | API performance audit                                                                      | NOT STARTED                      |
| 8.38      | MongoDB index optimization                                                                 | NOT STARTED                      |
| 8.39      | Mongoose `lean()` / projections                                                            | NOT STARTED                      |
| 8.40      | Mantra endpoint optimization                                                               | NOT STARTED                      |
| 8.41      | HTTP/server optimization                                                                   | NOT STARTED                      |
| 8.42      | Full performance rebaseline                                                                | NOT STARTED                      |
| 8.43      | Extended profile foundation                                                                | NOT STARTED                      |
| 8.44      | Extended profile schema/types                                                              | NOT STARTED                      |
| 8.45      | Extended profile API                                                                       | NOT STARTED                      |
| 8.46      | Profile photo/S3 architecture                                                              | NOT STARTED                      |
| 8.47      | Extended profile UI                                                                        | NOT STARTED                      |
| 8.48      | Profile/privacy review                                                                     | NOT STARTED                      |
| 8.49      | Full regression QA                                                                         | NOT STARTED                      |
| 8.50      | Final lint/typecheck/build/diff                                                            | NOT STARTED                      |
| 8.51      | Final commit, push, merge, production deploy                                               | NOT STARTED                      |
