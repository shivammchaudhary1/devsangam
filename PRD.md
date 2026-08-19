# DevSangam — Product Requirements, System Design & Technical Architecture

> **Document status:** v0.1
> **Product:** DevSangam Digital Japamala
> **Primary stack:** MERN + TypeScript
> **Frontend strategy:** Responsive Web Application + PWA
> **UI strategy:** Tailwind CSS + shadcn/ui + custom DevSangam design system

---

# 1. Product Overview

## 1.1 Product Name

**DevSangam**

### Tagline

**Chant. Connect. Transform.**

---

## 1.2 Product Vision

DevSangam is a digital Sadhana companion designed to help users:

* discover sacred mantras,
* maintain a daily chanting practice,
* perform digital Japamala sessions,
* track spiritual practice consistency,
* maintain streaks,
* study mantra meanings and benefits,
* use chanting even without internet connectivity,
* synchronize practice history across devices.

The product should feel:

* calm,
* meditative,
* premium,
* distraction-free,
* spiritually respectful,
* modern,
* responsive across laptop and mobile devices.

---

# 2. Product Principles

The application should follow these principles.

## 2.1 Chanting First

The primary purpose of DevSangam is chanting.

Every major feature should support one of these actions:

1. Discover a mantra.
2. Start a mantra practice.
3. Complete chanting.
4. Track consistency.
5. Understand previous practice.

---

## 2.2 Offline First

A chanting session must never depend on internet connectivity.

A user should be able to:

```text
Open DevSangam
      ↓
Choose Mantra
      ↓
Choose Target
      ↓
Start Chanting
      ↓
Lose Internet
      ↓
Continue Chanting
      ↓
Complete Session
      ↓
Reconnect Later
      ↓
Automatically Sync
```

---

## 2.3 Local-First Counter

The chanting counter must run completely on the client.

Never send an API request for every chant.

Incorrect architecture:

```text
Tap
 ↓
POST /api/count
 ↓
MongoDB

Tap
 ↓
POST /api/count
 ↓
MongoDB
```

Correct architecture:

```text
User Tap
   ↓
React State
   ↓
Update Counter
   ↓
Update Progress Ring
   ↓
Save Local Checkpoint
   ↓
Session Completed
   ↓
Sync Session
   ↓
MongoDB
```

---

## 2.4 Minimal Distraction

During an active chanting session:

* hide unnecessary navigation,
* reduce visual noise,
* make the tap interaction dominant,
* keep controls secondary,
* avoid notifications inside the chanting screen.

---

# 3. Primary User Journey

```text
Landing
   ↓
Authentication
   ↓
Onboarding
   ↓
Dashboard
   ↓
Select Mantra
   ↓
Select Target
   ↓
Start Session
   ↓
Digital Japamala
   ↓
Tap to Chant
   ↓
Complete / Pause / Exit
   ↓
Save Session
   ↓
Update Streak
   ↓
Update Insights
```

---

# 4. Core Application Screens

Recommended application routes:

```text
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
```

---

# 5. Authentication

## 5.1 Login

Features:

* email login,
* password login,
* remember me,
* forgot password,
* create account,
* optional Google login,
* optional Apple login,
* session persistence.

---

## 5.2 Registration

Collect:

```text
Name
Email
Password
Confirm Password
```

Optional later:

```text
Phone Number
Google Login
Apple Login
OTP Authentication
```

---

## 5.3 Forgot Password

Flow:

```text
Enter Email
   ↓
Receive Reset Link / OTP
   ↓
Create New Password
   ↓
Login
```

---

# 6. Onboarding

Onboarding should personalize DevSangam without becoming too long.

Suggested steps:

```text
Step 1
Profile

Step 2
Preferences

Step 3
Goals

Step 4
Complete
```

---

## 6.1 Profile Setup

Collect:

```text
Name
Avatar
Language
Timezone
```

---

## 6.2 Preferred Mantras

Examples:

```text
Mahamrityunjaya Mantra
Gayatri Mantra
Om Namah Shivaya
Hare Krishna Mahamantra
Asato Ma Sadgamaya
Custom Mantra
```

---

## 6.3 User Intent

Allow users to select a primary intention:

```text
Peace
Focus
Healing
Discipline
Devotion
Protection
Wisdom
Prosperity
```

---

## 6.4 Reminder Setup

Allow:

```text
Enable Daily Reminder

Reminder Time
06:00 AM

Reminder Days
M T W T F S S
```

---

# 7. Dashboard

The main dashboard should answer:

```text
How am I doing?

What should I chant today?

Can I quickly continue my practice?
```

---

## 7.1 Dashboard Metrics

Recommended cards:

```text
Daily Streak

Today's Practice

Total Mala

Total Chanting Minutes

Overall Progress
```

Example:

```text
Daily Streak
21 Days

Today's Practice
15 Minutes

Mala Count
108

Mantras
3
```

---

## 7.2 Quick Start

Show:

```text
Selected / Preferred Mantra

Current Target

Last Count

Start Session Button
```

---

## 7.3 Recent Sessions

Display:

```text
Mantra
Count
Mala
Duration
Date
```

---

## 7.4 Weekly Overview

Display:

```text
Monday
Tuesday
Wednesday
Thursday
Friday
Saturday
Sunday
```

Use a chart showing chanting minutes or malas.

---

# 8. Sadhana / Mantra Selection

The user selects:

1. mantra,
2. target count.

---

## 8.1 Default Mantras

Initial seed list:

```text
Mahamrityunjaya Mantra

Gayatri Mantra

Hare Krishna Mahamantra

Om Namah Shivaya
```

Future expansion:

```text
Om Gan Ganapataye Namah

Om Shreem Mahalakshmyai Namah

So'ham

Sri Ram Jai Ram

Om Mani Padme Hum
```

---

## 8.2 Default Targets

Recommended presets:

```text
108
216
1008
Custom
```

Interpretation:

```text
108  = 1 Mala

216  = 2 Malas

1008 = Extended Sadhana
```

---

# 9. Active Japamala Session

This is the most important screen in DevSangam.

---

## 9.1 Main UI

Display:

```text
Mantra Name

Sanskrit Text

Current Count

Target Count

Remaining Count

Mala Progress

Elapsed Time
```

---

## 9.2 Main Interaction

The center of the interface should contain a large:

```text
Circular Japamala Counter
```

Example:

```text
        ● ● ● ● ●
     ●             ●

          054

       TAP TO CHANT

          ॐ

     ●             ●
        ● ● ● ● ●
```

---

## 9.3 Chant Controls

Provide:

```text
Sound ON/OFF

Haptic ON/OFF

Pause

Resume

Reset

Exit Session
```

---

## 9.4 Haptic Feedback

On supported mobile devices:

```javascript
navigator.vibrate?.(40);
```

Use subtle vibration.

Do not use aggressive vibration.

---

# 10. Sadhana Library

Users should be able to explore mantras.

---

## 10.1 Categories

Recommended filters:

```text
All

Healing

Focus

Devotion

Peace

Protection

Prosperity

Wisdom
```

---

## 10.2 Mantra Card

Each mantra card should include:

```text
Image

Mantra Name

Sanskrit Preview

Category

Benefits

Favorite Button
```

---

# 11. Mantra Detail Page

Display:

```text
Mantra Name

Sanskrit

Transliteration

Meaning

Benefits

Suggested Chant Count

Estimated Duration

Start Chanting Button
```

Example sections:

```text
Mahamrityunjaya Mantra

Sanskrit

Transliteration

Meaning

Benefits

Ideal Count
108 Beads

Estimated Duration
11 Minutes

[ Start Chanting ]
```

---

# 12. Insights & Progress

Insights should help users understand consistency.

Do not turn the application into an aggressive competition system.

---

## 12.1 Core Metrics

Display:

```text
Current Streak

Longest Streak

Total Mala

Total Sessions

Total Chanting Time
```

---

## 12.2 Weekly Chart

Example:

```text
Malas

50 |                     █
40 |             █       █
30 |       █     █   █   █
20 |   █   █ █   █   █   █
10 |   █   █ █   █   █ █ █
 0 +-------------------------
     M T W T F S S
```

---

## 12.3 Mantra Distribution

Example:

```text
Mahamrityunjaya     50%

Gayatri             30%

Om Namah Shivaya    15%

Others               5%
```

---

## 12.4 Streak Calendar

Allow users to see which days contained completed practice.

---

# 13. Achievements

Possible achievements:

```text
First Chant

First Mala

7 Day Streak

21 Day Streak

48 Day Streak

108 Malas

500 Malas

1000 Malas
```

Achievements should encourage consistency rather than comparison.

---

# 14. Profile & Settings

Recommended sections:

```text
Profile

Notifications

Sound & Haptics

Appearance

Language

Security

Device Sync

Daily Reminder
```

---

## 14.1 Preferences

```text
Push Notifications

Mantra Reminders

Chanting Sound

Haptic Feedback

Dark Mode
```

---

## 14.2 Account Security

```text
Change Password

Two-Factor Authentication

Logged In Devices

Sign Out
```

---

# 15. Technology Stack

# MERN Stack

```text
MongoDB
Express
React
Node.js
```

With TypeScript across frontend and backend.

---

# 16. Frontend Stack

Recommended:

```text
React

TypeScript

Vite

React Router

TanStack Query

Tailwind CSS v4

shadcn/ui

Radix UI

Lucide React

Recharts

Dexie

IndexedDB

vite-plugin-pwa
```

---

# 17. Backend Stack

Recommended:

```text
Node.js

Express

TypeScript

MongoDB

MongoDB Atlas

Mongoose
```

---

# 18. UI Library Decision

Recommended UI stack:

```text
Tailwind CSS
     ↓
Design Tokens
     ↓
shadcn/ui
     ↓
Radix UI
     ↓
DevSangam Custom Components
```

---

# 19. Why Tailwind + shadcn/ui

Use Tailwind for:

```text
Layouts

Spacing

Responsive behavior

Typography

Colors

Animations

Utility classes
```

Use shadcn/ui for:

```text
Buttons

Dialogs

Inputs

Dropdowns

Sheets

Tabs

Switches

Avatars

Select menus

Tooltips

Popovers
```

Build DevSangam-specific components manually.

---

# 20. Custom DevSangam Components

These components should belong to the application's custom design system:

```text
JapamalaCounter

JapamalaProgressRing

BeadRing

MantraCard

MantraSelector

TargetSelector

StreakCalendar

AchievementBadge

SacredBackground

DevSangamLogo

MalaBadge

PracticeSummary

SessionStats
```

---

# 21. CSS Theme

Primary palette:

```css
--ds-obsidian: #0C0D12;

--ds-charcoal: #161922;

--ds-surface: #222736;

--ds-border: #2E3648;

--ds-amber: #F59E0B;

--ds-gold: #D4AF37;

--ds-soft-gold: #E5C07B;

--ds-cream: #F8FAFC;

--ds-muted: #94A3B8;

--ds-success: #10B981;
```

---

# 22. CSS Semantic Variables

Recommended semantic variables:

```css
:root {
  --background: #0C0D12;
  --foreground: #F8FAFC;

  --card: #161922;
  --card-foreground: #F8FAFC;

  --popover: #161922;
  --popover-foreground: #F8FAFC;

  --primary: #F59E0B;
  --primary-foreground: #0C0D12;

  --secondary: #222736;
  --secondary-foreground: #F8FAFC;

  --muted: #222736;
  --muted-foreground: #94A3B8;

  --accent: #D4AF37;
  --accent-foreground: #0C0D12;

  --border: #2E3648;

  --input: #222736;

  --ring: #F59E0B;

  --success: #10B981;

  --radius: 0.85rem;
}
```

---

# 23. Tailwind Theme

Example Tailwind v4 configuration:

```css
@import "tailwindcss";

@theme {
  --color-ds-obsidian: #0C0D12;
  --color-ds-charcoal: #161922;
  --color-ds-surface: #222736;
  --color-ds-border: #2E3648;

  --color-ds-amber: #F59E0B;
  --color-ds-gold: #D4AF37;
  --color-ds-soft-gold: #E5C07B;

  --color-ds-cream: #F8FAFC;
  --color-ds-muted: #94A3B8;

  --color-ds-success: #10B981;
}
```

---

# 24. Recommended CSS Structure

```text
src/
└── styles/
    ├── globals.css
    ├── theme.css
    ├── components.css
    └── animations.css
```

---

# 25. Global Styles

Example:

```css
body {
  background:
    radial-gradient(
      circle at top,
      rgba(245, 158, 11, 0.04),
      transparent 38%
    ),
    #0C0D12;

  color: #F8FAFC;

  min-height: 100vh;

  -webkit-font-smoothing: antialiased;
}
```

---

# 26. Sacred Card

```css
.ds-card {
  background:
    linear-gradient(
      145deg,
      rgba(255, 255, 255, 0.025),
      rgba(255, 255, 255, 0)
    ),
    #161922;

  border: 1px solid #2E3648;

  border-radius: 16px;

  box-shadow:
    0 12px 40px rgba(0, 0, 0, 0.28);
}
```

---

# 27. Interactive Card

```css
.ds-card-interactive {
  background: #161922;

  border: 1px solid #2E3648;

  border-radius: 16px;

  transition:
    border-color 180ms ease,
    box-shadow 180ms ease,
    transform 180ms ease;
}

.ds-card-interactive:hover {
  border-color: rgba(245, 158, 11, 0.5);
}

.ds-card-interactive[data-selected="true"] {
  border-color: #F59E0B;

  background:
    linear-gradient(
      145deg,
      rgba(245, 158, 11, 0.1),
      rgba(245, 158, 11, 0.02)
    ),
    #161922;

  box-shadow:
    0 0 24px rgba(245, 158, 11, 0.15);
}
```

---

# 28. Primary CTA Button

```css
.ds-primary-button {
  background:
    linear-gradient(
      135deg,
      #F59E0B,
      #D4AF37,
      #E5C07B
    );

  color: #0C0D12;

  border-radius: 12px;

  font-weight: 700;

  box-shadow:
    0 6px 20px rgba(245, 158, 11, 0.24);

  transition:
    transform 150ms ease,
    box-shadow 150ms ease;
}

.ds-primary-button:hover {
  box-shadow:
    0 8px 28px rgba(245, 158, 11, 0.32);
}

.ds-primary-button:active {
  transform: scale(0.98);
}
```

---

# 29. Input Style

```css
.ds-input {
  background: #222736;

  color: #F8FAFC;

  border: 1px solid #2E3648;

  border-radius: 10px;

  transition:
    border-color 150ms ease,
    box-shadow 150ms ease;
}

.ds-input::placeholder {
  color: #94A3B8;
}

.ds-input:focus {
  outline: none;

  border-color: #F59E0B;

  box-shadow:
    0 0 0 3px rgba(245, 158, 11, 0.12);
}
```

---

# 30. Japamala Glow

```css
.ds-japa-ring {
  box-shadow:
    0 0 10px rgba(245, 158, 11, 0.35),
    0 0 35px rgba(245, 158, 11, 0.15),
    inset 0 0 22px rgba(245, 158, 11, 0.07);
}
```

---

# 31. Gold Divider

```css
.ds-gold-divider {
  height: 1px;

  background:
    linear-gradient(
      90deg,
      transparent,
      rgba(245, 158, 11, 0.8),
      transparent
    );
}
```

---

# 32. Stat Value

```css
.ds-stat-value {
  color: #F59E0B;

  font-weight: 700;

  letter-spacing: -0.02em;
}
```

---

# 33. Pill / Badge

```css
.ds-pill {
  display: inline-flex;

  align-items: center;

  gap: 0.4rem;

  padding:
    0.35rem
    0.7rem;

  border-radius: 9999px;

  background:
    rgba(245, 158, 11, 0.1);

  border:
    1px solid
    rgba(245, 158, 11, 0.25);

  color: #E5C07B;
}
```

---

# 34. Animations

Recommended:

```css
@keyframes dsPulseGold {
  0%,
  100% {
    box-shadow:
      0 0 12px rgba(245, 158, 11, 0.15);
  }

  50% {
    box-shadow:
      0 0 32px rgba(245, 158, 11, 0.4);
  }
}

.ds-pulse-gold {
  animation:
    dsPulseGold
    2.2s
    ease-in-out
    infinite;
}
```

---

## Chant Tap Animation

```css
.ds-tap-feedback {
  transition:
    transform 80ms ease;
}

.ds-tap-feedback:active {
  transform:
    scale(0.965);
}
```

---

## Bead Animation

```css
@keyframes dsBeadPop {
  0% {
    transform:
      scale(0.8);

    opacity: 0.4;
  }

  50% {
    transform:
      scale(1.2);

    opacity: 1;
  }

  100% {
    transform:
      scale(1);

    opacity: 1;
  }
}

.ds-bead-pop {
  animation:
    dsBeadPop
    220ms
    ease-out;
}
```

---

# 35. Charts

Recommended library:

```text
Recharts
```

Use Recharts for:

```text
Weekly Practice Chart

Mantra Distribution

Streak Analytics

Monthly Practice

Session Statistics
```

Do not use Recharts for:

```text
Japamala Ring
```

The Japamala ring should be custom SVG.

---

# 36. Frontend Architecture

Recommended project structure:

```text
src/
│
├── app/
│   ├── App.tsx
│   ├── router.tsx
│   └── providers.tsx
│
├── features/
│   │
│   ├── auth/
│   │
│   ├── onboarding/
│   │
│   ├── dashboard/
│   │
│   ├── mantras/
│   │
│   ├── practice/
│   │
│   ├── insights/
│   │
│   ├── achievements/
│   │
│   ├── profile/
│   │
│   └── settings/
│
├── components/
│   ├── ui/
│   ├── layout/
│   └── shared/
│
├── services/
│   ├── api/
│   ├── storage/
│   └── sync/
│
├── hooks/
│
├── lib/
│
├── types/
│
└── styles/
    ├── globals.css
    ├── theme.css
    ├── components.css
    └── animations.css
```

---

# 37. Practice Feature Architecture

```text
features/
└── practice/
    │
    ├── components/
    │   ├── JapamalaCounter.tsx
    │   ├── ProgressRing.tsx
    │   ├── MantraHeader.tsx
    │   ├── SessionControls.tsx
    │   ├── SessionStats.tsx
    │   └── MalaBadge.tsx
    │
    ├── hooks/
    │   ├── useChantSession.ts
    │   ├── useHaptics.ts
    │   ├── useSessionTimer.ts
    │   └── useSessionSync.ts
    │
    ├── storage/
    │   └── sessionRepository.ts
    │
    ├── types/
    │   └── session.types.ts
    │
    └── pages/
        ├── PracticeSetupPage.tsx
        └── ChantSessionPage.tsx
```

---

# 38. Core React Components

Recommended reusable components:

```text
AppShell

DesktopSidebar

MobileBottomNavigation

PageHeader

DevSangamLogo

SacredCard

MetricCard

StreakCard

AchievementBadge

MantraCard

MantraSelector

TargetSelector

JapamalaCounter

JapamalaProgressRing

MalaBadge

PrimaryButton

SecondaryButton

IconButton

TextField

PasswordField

SearchField

SegmentedControl

FilterChip

Toggle

ChartCard

EmptyState

SkeletonCard

ConfirmDialog

BottomSheet

Toast
```

---

# 39. State Management

Use different systems for different types of state.

## Server State

Use:

```text
TanStack Query
```

For:

```text
User Profile

Mantra Library

Session History

Dashboard Analytics

Achievements

Settings
```

---

## Chanting State

Do not make the chanting counter depend on server state.

Use a dedicated React hook:

```text
useChantSession()
```

Example state:

```typescript
interface ChantSessionState {
  sessionId: string;

  mantraId: string;

  targetCount: number;

  currentCount: number;

  startedAt: number;

  pausedAt?: number;

  elapsedSeconds: number;

  soundEnabled: boolean;

  hapticEnabled: boolean;

  status:
    | "active"
    | "paused"
    | "completed"
    | "abandoned";
}
```

---

# 40. Local Storage Architecture

Use:

```text
IndexedDB
```

Recommended wrapper:

```text
Dexie
```

Database:

```text
devsangamDB
```

Tables:

```text
activeSessions

pendingSync

userPreferences

cachedMantras
```

---

# 41. Chanting Checkpoint Strategy

Do not write IndexedDB for absolutely every tap if unnecessary.

Possible checkpoint strategy:

```text
Every 5 chants

OR

Every 2 seconds

OR

When page becomes hidden

OR

When session pauses

OR

When session exits
```

---

# 42. Offline Sync Architecture

```text
Chant Session
      ↓
Local React State
      ↓
IndexedDB Checkpoint
      ↓
Session Complete
      ↓
pendingSync
      ↓
Check Internet
   ┌───────┴───────┐
   │               │
 Online          Offline
   │               │
   ▼               ▼
Sync API       Keep Local
                   │
                   ▼
            Internet Returns
                   │
                   ▼
                Sync API
```

---

# 43. PWA Strategy

Use:

```text
vite-plugin-pwa
```

PWA capabilities:

```text
Installable Application

Service Worker

Offline Application Shell

Cached Static Assets

Offline Mantra Cache

Background Sync Strategy
```

---

# 44. Backend Structure

Recommended:

```text
apps/api/
│
├── src/
│   │
│   ├── config/
│   │
│   ├── controllers/
│   │
│   ├── middleware/
│   │
│   ├── models/
│   │
│   ├── routes/
│   │
│   ├── services/
│   │
│   ├── validators/
│   │
│   ├── utils/
│   │
│   ├── types/
│   │
│   ├── app.ts
│   │
│   └── server.ts
│
└── package.json
```

---

# 45. API Architecture

Base route:

```text
/api/v1
```

Domains:

```text
/auth

/users

/mantras

/sessions

/insights

/achievements
```

---

# 46. Authentication APIs

```http
POST /api/v1/auth/register
```

```http
POST /api/v1/auth/login
```

```http
POST /api/v1/auth/refresh
```

```http
POST /api/v1/auth/logout
```

```http
POST /api/v1/auth/forgot-password
```

```http
POST /api/v1/auth/reset-password
```

---

# 47. User APIs

```http
GET /api/v1/users/me
```

```http
PATCH /api/v1/users/me
```

```http
PATCH /api/v1/users/me/preferences
```

---

# 48. Mantra APIs

```http
GET /api/v1/mantras
```

```http
GET /api/v1/mantras/:slug
```

```http
POST /api/v1/mantras/:id/favorite
```

```http
DELETE /api/v1/mantras/:id/favorite
```

---

# 49. Session APIs

Primary session sync endpoint:

```http
POST /api/v1/sessions/sync
```

History:

```http
GET /api/v1/sessions
```

Single session:

```http
GET /api/v1/sessions/:id
```

Do not require:

```http
POST /sessions/start
```

to begin chanting.

The client should be able to start locally.

---

# 50. Insights APIs

```http
GET /api/v1/insights/summary
```

```http
GET /api/v1/insights/weekly
```

```http
GET /api/v1/insights/streak
```

```http
GET /api/v1/insights/mantras
```

---

# 51. Achievement APIs

```http
GET /api/v1/achievements
```

Future:

```http
GET /api/v1/achievements/user
```

---

# 52. MongoDB Collections

Initial collections:

```text
users

mantras

sessions

achievements

userAchievements
```

Optional later:

```text
notifications

reminders

favorites

devices
```

---

# 53. User Schema

```typescript
interface User {
  _id: string;

  name: string;

  email: string;

  passwordHash: string;

  avatar?: string;

  preferences: {
    language: string;

    theme: "dark" | "light";

    soundEnabled: boolean;

    hapticEnabled: boolean;

    reminderEnabled: boolean;

    reminderTime?: string;

    timezone: string;

    defaultTarget: number;
  };

  streak: {
    current: number;

    longest: number;

    lastPracticeDate?: Date;
  };

  totals: {
    chants: number;

    malas: number;

    sessions: number;

    durationSeconds: number;
  };

  createdAt: Date;

  updatedAt: Date;
}
```

---

# 54. Mantra Schema

```typescript
interface Mantra {
  _id: string;

  slug: string;

  title: string;

  sanskrit: string;

  transliteration: string;

  meaning: string;

  description?: string;

  benefits: string[];

  categories: string[];

  deity?: string;

  image?: string;

  defaultTargets: number[];

  estimatedSecondsPerChant?: number;

  isPublished: boolean;

  createdAt: Date;

  updatedAt: Date;
}
```

---

# 55. Session Schema

```typescript
interface Session {
  _id: string;

  clientSessionId: string;

  userId: string;

  mantraId: string;

  targetCount: number;

  completedCount: number;

  malasCompleted: number;

  startedAt: Date;

  completedAt?: Date;

  durationSeconds: number;

  status:
    | "completed"
    | "paused"
    | "abandoned";

  source:
    | "web"
    | "pwa";

  createdAt: Date;

  updatedAt: Date;
}
```

---

# 56. Offline Session ID

Generate locally:

```typescript
const clientSessionId = crypto.randomUUID();
```

This ID should remain identical during offline synchronization retries.

---

# 57. Session Idempotency

Create a unique database constraint on:

```text
userId
+
clientSessionId
```

Conceptually:

```text
unique(userId, clientSessionId)
```

This prevents duplicate sessions when offline synchronization retries occur.

---

# 58. MongoDB Indexes

Recommended indexes:

```text
users

email UNIQUE
```

```text
mantras

slug UNIQUE

categories
```

```text
sessions

userId + completedAt

userId + mantraId

userId + clientSessionId UNIQUE
```

---

# 59. Session Sync Example

Client sends:

```json
{
  "clientSessionId": "4540186d-2953-4373-8cc8-1dc612dbaac1",
  "mantraId": "mahamrityunjaya-id",
  "targetCount": 108,
  "completedCount": 108,
  "malasCompleted": 1,
  "startedAt": "2026-08-19T06:30:00.000Z",
  "completedAt": "2026-08-19T06:42:00.000Z",
  "durationSeconds": 720,
  "status": "completed",
  "source": "pwa"
}
```

---

# 60. Session Sync Backend Flow

```text
POST /sessions/sync
       ↓
Authenticate User
       ↓
Validate Payload
       ↓
Find:
userId + clientSessionId
       ↓
Already Exists?
   ┌───────┴───────┐
   │               │
 YES              NO
   │               │
Return Existing   Create
                   │
                   ▼
             Update Totals
                   │
                   ▼
              Update Streak
                   │
                   ▼
          Check Achievements
                   │
                   ▼
             Return Session
```

---

# 61. Streak Calculation

Streak should update only when a valid completed practice exists.

Concept:

```text
Practice Today
      ↓
Compare Last Practice Date
      ↓
Same Day
    Do Nothing

Previous Day
    Streak + 1

Older Date
    Reset Streak to 1
```

Store timestamps in UTC.

Calculate practice day based on user timezone.

---

# 62. Monorepo Architecture

Recommended repository:

```text
devsangam/
│
├── apps/
│   │
│   ├── web/
│   │
│   └── api/
│
├── packages/
│   │
│   ├── shared/
│   │
│   ├── types/
│   │
│   └── config/
│
├── package.json
│
└── README.md
```

---

# 63. apps/web

Contains:

```text
React

Vite

Tailwind CSS

shadcn/ui

TanStack Query

Dexie

PWA
```

---

# 64. apps/api

Contains:

```text
Node.js

Express

MongoDB

Mongoose
```

---

# 65. packages/types

Store shared TypeScript types:

```text
UserDTO

MantraDTO

SessionDTO

InsightsDTO

AchievementDTO

APIResponse
```

---

# 66. packages/shared

Store:

```text
Constants

Validation helpers

Date helpers

Target presets

Shared schemas
```

---

# 67. Responsive Layout Strategy

Use one responsive frontend.

Desktop:

```text
┌─────────────┬────────────────────────────┐
│             │                            │
│   Sidebar   │          Content           │
│             │                            │
│             │                            │
└─────────────┴────────────────────────────┘
```

Mobile:

```text
┌──────────────────────────┐
│                          │
│         Content          │
│                          │
│                          │
├──────────────────────────┤
│ Home Start Insights ...  │
└──────────────────────────┘
```

---

# 68. Desktop Navigation

Recommended:

```text
Home

Start Practice

Insights

Library

Profile
```

Additional:

```text
Achievements

History

Settings
```

---

# 69. Mobile Navigation

Recommended bottom navigation:

```text
Home

Start

Insights

Library

Profile
```

---

# 70. Performance Requirements

The chanting screen should remain smooth during rapid tapping.

Avoid rerendering the entire application on every chant.

Structure:

```text
ChantSessionPage
      │
      ├── MantraHeader
      │
      ├── JapamalaCounter
      │
      ├── SessionStats
      │
      └── SessionControls
```

Isolate the counter component.

Potential optimization:

```typescript
React.memo(JapamalaCounter);
```

---

# 71. Counter Logic

Basic logic:

```typescript
const handleChant = () => {
  setCurrentCount((count) => {
    if (count >= targetCount) {
      return count;
    }

    return count + 1;
  });
};
```

---

# 72. Remaining Count

```typescript
const remaining =
  Math.max(
    targetCount - currentCount,
    0
  );
```

---

# 73. Mala Count

```typescript
const malasCompleted =
  Math.floor(
    currentCount / 108
  );
```

---

# 74. Target Mala Count

```typescript
const targetMalas =
  Math.ceil(
    targetCount / 108
  );
```

---

# 75. Progress

```typescript
const progress =
  Math.min(
    currentCount / targetCount,
    1
  );
```

---

# 76. Important Architecture Rule

Do not make this call:

```typescript
await api.post(
  "/sessions/count",
  {
    count
  }
);
```

after every tap.

Instead:

```text
React State
    ↓
IndexedDB
    ↓
Session Completion
    ↓
Single Sync
```

---

# 77. Security Considerations

Use:

```text
Password hashing

Secure authentication cookies or carefully managed tokens

HTTPS

Request validation

Rate limiting

CORS configuration

Helmet

MongoDB injection protection

Input sanitization
```

Never store plain passwords.

---

# 78. Validation

Recommended:

```text
Zod
```

or another consistent validation library.

Use the same validation concepts across:

```text
Frontend Forms

Backend Requests

Shared DTO Validation
```

---

# 79. Error Handling

Recommended API response:

```json
{
  "success": false,
  "error": {
    "code": "INVALID_SESSION",
    "message": "Session data is invalid."
  }
}
```

Successful response:

```json
{
  "success": true,
  "data": {}
}
```

---

# 80. Loading States

Every server-driven interface should provide:

```text
Skeleton Loading

Empty State

Error State

Retry Action
```

Avoid generic blank screens.

---

# 81. MVP Scope

Include:

```text
Authentication

Onboarding

Dashboard

Mantra Library

Mantra Details

Mantra Selection

Target Selection

Digital Japamala

Offline Session Persistence

Session Sync

Streak Tracking

Insights

History

Achievements

Profile

Settings

Responsive Layout

PWA
```

---

# 82. Features To Postpone

Do not include in initial MVP:

```text
Community Feed

Followers

Guru Accounts

Live Group Chanting

Messaging

Social Comments

Leaderboards

Payments

Subscriptions

AI Spiritual Guidance

Advanced Recommendation Engine

React Native App

Complex Admin CMS
```

---

# 83. Development Phases

## Phase 1 — Foundation

```text
Monorepo

React

Vite

Express

MongoDB

TypeScript

Tailwind

shadcn/ui

Theme System

Responsive App Shell
```

---

## Phase 2 — Authentication

```text
Register

Login

Logout

Forgot Password

Protected Routes

Profile Endpoint
```

---

## Phase 3 — Mantra Domain

```text
Mantra Schema

Mantra Seed Data

Library

Search

Filters

Mantra Details

Favorites
```

---

## Phase 4 — Core Japamala

```text
Mantra Selection

Target Selection

Japamala Counter

Progress Ring

Timer

Haptic Feedback

Sound

Pause

Reset

Complete Session
```

---

## Phase 5 — Offline Engine

```text
Dexie

IndexedDB

Active Session Persistence

Checkpoints

Pending Sync Queue

Retry Logic

Idempotent Sync
```

---

## Phase 6 — Dashboard

```text
Daily Streak

Quick Start

Today's Summary

Recent Sessions

Weekly Overview
```

---

## Phase 7 — Insights

```text
Streak Calendar

Weekly Chart

Mantra Distribution

Session History

Achievements
```

---

## Phase 8 — PWA

```text
Manifest

Service Worker

Installability

Offline App Shell

Cached Mantras
```

---

## Phase 9 — Production Polish

```text
Animations

Accessibility

Responsive Testing

Performance

Security Review

API Tests

Frontend Tests

Error Tracking

Monitoring
```

---

# 84. Recommended Development Priority

The recommended implementation order is:

```text
App Foundation
      ↓
Authentication
      ↓
Mantra Data
      ↓
Practice Setup
      ↓
Japamala Counter
      ↓
Offline Persistence
      ↓
Session Sync
      ↓
Dashboard
      ↓
Insights
      ↓
Achievements
      ↓
Settings
      ↓
PWA Polish
```

The most important technical domain is:

```text
Mantra
+
Chant Session
+
Offline Storage
+
Session Synchronization
```

Once these are reliable, the dashboard and analytics become presentation layers over the session data.

---

# 85. Final Technology Decision

## Frontend

```text
React
TypeScript
Vite
React Router
TanStack Query
Tailwind CSS v4
shadcn/ui
Radix UI
Lucide React
Recharts
Dexie
vite-plugin-pwa
```

---

## Backend

```text
Node.js
Express
TypeScript
Mongoose
```

---

## Database

```text
MongoDB Atlas
```

---

## Architecture

```text
Responsive PWA
+
REST API
+
Offline-First Chanting
+
MongoDB Cloud Synchronization
```

---

# 86. Final System Overview

```text
┌──────────────────────────────────────────────┐
│                 DevSangam                    │
└──────────────────────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────┐
│            React + TypeScript                │
│                                              │
│  Desktop UI             Mobile UI            │
│  Sidebar                Bottom Navigation    │
└──────────────────────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────┐
│            Chant Session Engine              │
│                                              │
│  Counter                                     │
│  Timer                                       │
│  Progress                                    │
│  Haptics                                     │
│  Sound                                       │
└──────────────────────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────┐
│             Dexie / IndexedDB                │
│                                              │
│  Active Sessions                             │
│  Pending Sync                                │
│  Cached Mantras                              │
│  Preferences                                 │
└──────────────────────────────────────────────┘
                       │
                 Internet Available
                       │
                       ▼
┌──────────────────────────────────────────────┐
│             Node.js + Express                │
│                                              │
│  Auth                                        │
│  Users                                       │
│  Mantras                                     │
│  Sessions                                    │
│  Insights                                    │
│  Achievements                                │
└──────────────────────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────┐
│          MongoDB Atlas + Mongoose            │
│                                              │
│  Users                                       │
│  Mantras                                     │
│  Sessions                                    │
│  Achievements                                │
└──────────────────────────────────────────────┘
```

---

# 87. Core Engineering Rule

> A user must be able to open DevSangam, start a mantra session, chant 108 or 1008 times, lose internet connectivity during the practice, close or minimize the application temporarily, return to the practice, complete the session, and eventually synchronize the result without losing or duplicating the chanting count.

If the system guarantees this behavior, the core DevSangam architecture is working correctly.
