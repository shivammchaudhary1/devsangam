devsangam/
│
├── apps/
│ │
│ ├── web/
│ │ │
│ │ ├── src/
│ │ │ ├── app/
│ │ │ │ └── query-client.ts
│ │ │ │
│ │ │ ├── components/
│ │ │ │ ├── layout/
│ │ │ │ │ └── AppShell.tsx
│ │ │ │ ├── shared/
│ │ │ │ └── ui/
│ │ │ │
│ │ │ ├── features/
│ │ │ │ ├── auth/
│ │ │ │ ├── onboarding/
│ │ │ │ ├── dashboard/
│ │ │ │ ├── mantras/
│ │ │ │ ├── practice/
│ │ │ │ ├── insights/
│ │ │ │ ├── achievements/
│ │ │ │ ├── profile/
│ │ │ │ └── settings/
│ │ │ │
│ │ │ ├── hooks/
│ │ │ ├── lib/
│ │ │ │
│ │ │ ├── services/
│ │ │ │ ├── api/
│ │ │ │ │ ├── client.ts
│ │ │ │ │ └── health.ts
│ │ │ │ ├── storage/
│ │ │ │ └── sync/
│ │ │ │
│ │ │ ├── styles/
│ │ │ │ ├── theme.css
│ │ │ │ ├── globals.css
│ │ │ │ ├── components.css
│ │ │ │ └── animations.css
│ │ │ │
│ │ │ ├── types/
│ │ │ │
│ │ │ ├── App.tsx
│ │ │ ├── index.css
│ │ │ └── main.tsx
│ │ │
│ │ ├── .env
│ │ ├── .env.example
│ │ ├── index.html
│ │ ├── package.json
│ │ ├── tsconfig.json
│ │ └── vite.config.ts
│ │
│ └── api/
│ │
│ ├── src/
│ │ ├── config/
│ │ │ └── database.ts
│ │ │
│ │ ├── controllers/
│ │ ├── middleware/
│ │ ├── models/
│ │ ├── routes/
│ │ ├── services/
│ │ ├── types/
│ │ ├── utils/
│ │ ├── validators/
│ │ │
│ │ ├── app.ts
│ │ └── server.ts
│ │
│ ├── .env
│ ├── .env.example
│ ├── package.json
│ └── tsconfig.json
│
├── packages/
│ ├── types/
│ └── shared/
│
├── .gitignore
├── package.json
├── package-lock.json
└── README.md

[ ] Node 24 installed

[ ] Git repository initialized

[ ] npm workspaces working

[ ] apps/web created

[ ] apps/api created

[ ] React + TypeScript working

[ ] Express + TypeScript working

[ ] MongoDB Atlas connected

[ ] /api/v1/health returns 200

[ ] Tailwind CSS working

[ ] shadcn/ui working

[ ] DevSangam theme installed

[ ] Cinzel heading font working

[ ] Devanagari font working

[ ] Desktop sidebar working

[ ] Mobile bottom navigation working

[ ] React Router working

[ ] React Query provider configured

[ ] API URL configured through environment variable

[ ] frontend can contact API

[ ] .env ignored by Git

[ ] npm run dev starts both apps

[ ] npm run typecheck passes

[ ] npm run build passes

[ ] Desktop layout tested

[ ] Mobile layout tested

[ ] Git working tree clean

The next phase should be Phase 2: Authentication, and I would implement it in this exact order:
User model
↓
Validation schemas
↓
Password hashing
↓
Register API
↓
Login API
↓
Access/refresh authentication
↓
Auth middleware
↓
GET /users/me
↓
Login UI
↓
Registration UI
↓
Protected routes
↓
Forgot password
↓
Session persistence
