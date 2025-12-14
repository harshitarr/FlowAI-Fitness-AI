# FlowAI (FitnessAI) 


FlowAI is an intelligent fitness platform that blends AI-powered personalization with a clean, modern experience. Built using Next.js and Convex, it delivers tailored workout programs, meal plans, and goal-based recommendations generated through advanced AI models. With seamless Clerk authentication, real-time database functions, and a polished UI powered by Tailwind and Framer Motion, FlowAI offers a smooth end-to-end fitness journey — from signing in, to generating plans, to tracking your progress.


## ⭐ Table of contents

- [Screenshots](#screenshots)
- [Tech stack](#tech-stack)
- [Features](#features)
- [Quick start (development)](#quick-start-development)
- [Environment variables](#environment-variables)
- [Available scripts](#available-scripts)
- [Project structure (important files)](#project-structure-important-files)
- [Convex & Clerk notes](#convex--clerk-notes)
- [Deployment](#deployment)


## 📸 Screenshots
**Home Page**
![Home Page](https://github.com/harshitarr/FlowAI-Fitness-AI/blob/main/public/hero1.png)

**AI Interaction**
![Mobile Navbar](https://github.com/harshitarr/FlowAI-Fitness-AI/blob/main/public/hero2.png)


## ⭐ Tech stack

- Next.js 15 (App Router)
- React 19
- Convex (database + serverless functions)
- Clerk (authentication)
- Tailwind CSS (design)
- Framer Motion (animations)
- VAPI (@vapi-ai/web) and Google Generative AI client (AI integrations)
- ESLint





## ⭐ Features

- AI-powered program and meal plan generation (VAPI / Google Generative API integration)
- User authentication (Clerk)
- Serverless data storage and functions (Convex)
- Responsive, Tailwind-based UI with accessible components
- Program gallery, profile, and generate flow


## ⭐ Quick start (development)

These commands are intended for PowerShell on Windows (your default shell). From the repository root:

1) Install dependencies

```powershell
npm install
```

2) Create a `.env.local` file (see the Environment variables section for required keys)

3) Start the dev server

```powershell
npm run dev
```

The app will be available at http://localhost:3000

Notes:

- The project uses Turbopack for local development by default via the `dev` script.
- Convex and Clerk run independently from the Next app; make sure your Convex deployment URL and Clerk publishable key are configured via environment variables.

## ⭐ Environment variables

Create a `.env.local` file in the root (do NOT commit credentials). Example:

```env
# Convex
NEXT_PUBLIC_CONVEX_URL=https://convex.example.com

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...

# VAPI (used for AI generation - public client key)
NEXT_PUBLIC_VAPI_API_KEY=vp_...

# (Optional) Google Generative API key used server-side if configured
GOOGLE_API_KEY=...

NODE_ENV=development
```

Important: Keep keys secret and only expose publishable keys on the client. Server-only keys (like Google service keys) should be used in Convex functions or server-side code.

## ⭐ Available scripts

From `package.json`:

- `npm run dev` — Start Next.js dev server (Turbopack)
- `npm run build` — Build for production
- `npm run start` — Start the production server
- `npm run lint` — Run ESLint

## Project structure (important files)

Top-level files and important folders in this repository:

- `package.json` — dependencies and scripts
- `next.config.mjs` — Next.js configuration
- `src/app/layout.jsx` — Root layout (fonts, providers, global layout)
- `src/app/page.jsx` — Home page / hero
- `src/components` — Reusable UI components (Navbar, Footer, ProfileHeader, UserPrograms, TerminalOverlay)
- `src/lib/vapi.js` — Client wrapper for `@vapi-ai/web` used for AI generation
- `src/lib/utils.js` — Small utilities (e.g., className helpers)
- `src/providers/ConvexClerkProvider.jsx` — Integrates Clerk with Convex React client
- `convex/schema.js` — Convex data schema (tables: `users`, `plans`, `vapi_sessions`)
- `convex/` — Convex server functions and generated files

### Notable components

- `Navbar.jsx` — top navigation and Clerk buttons
- `UserPrograms.jsx` — gallery of AI-generated programs
- `ProfileHeader.jsx` — displays signed-in user's basic info

## ⭐ Convex & Clerk notes

- Convex is used as the database and function host. The schema lives in `convex/schema.js`. Indexes include `by_user_id` for plans and `by_clerk_id` for users.
- For local Convex development and deployment, use the Convex CLI. Typical commands:

```powershell
# start local convex dev environment (if needed)
npx convex dev

# deploy convex functions & schema to your Convex project
npx convex deploy
```

- Clerk is used for authentication. Provide `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` in `.env.local`. Configure Clerk dashboard redirect URLs (e.g., http://localhost:3000) in your Clerk app settings.

## ⭐ AI providers

- The project includes `@vapi-ai/web` (client initialized in `src/lib/vapi.js`) and `@google/generative-ai` as dependencies. Configure `NEXT_PUBLIC_VAPI_API_KEY` for client calls. Any server-side (private) AI keys should be stored and used in Convex server functions or other server code only.

## ⭐ Deployment

Recommended deployment target: Vercel (first-class Next.js support). Basic steps:

1. Push the repository to GitHub.
2. Create a new Vercel project and connect the GitHub repository.
3. Add environment variables in the Vercel dashboard matching `.env.local` entries.
4. Deploy — Vercel will run `npm run build` and publish the site.

Alternative: You can deploy Next.js to other platforms as well. Make sure the platform supports the Node version your app requires and that the environment variables are configured.

### Convex in production

Deploy your Convex functions and schema to your production Convex project (use the Convex dashboard or `npx convex deploy`). Ensure the `NEXT_PUBLIC_CONVEX_URL` points to the deployed Convex URL.

