# GitHub Copilot instructions for this repository

Purpose
- Help AI coding agents be immediately productive in this Next.js (app-directory) project.
- Include the minimal set of patterns, commands, and file locations an agent needs to make safe, small, reviewable changes.

Big picture (architecture & "why")
- Framework: Next.js (v16.x) using the app directory semantics. Server components are the default; use `"use client"` at the top of files that must run in the browser.
- Root layout and fonts: `app/layout.tsx` defines the HTML root, loads Google fonts (Geist) via `next/font`. Keep global document-level changes here.
- Pages: `app/page.tsx` is the home route; per-route folders (e.g., `app/login`, `app/signup`, `app/dashboard`) are used for feature pages. Many feature directories are scaffolded but currently empty.
- Styling: Tailwind is used via PostCSS - `app/globals.css` imports Tailwind, and `postcss.config.mjs` enables `@tailwindcss/postcss`.
- Data layer stub: `app/lib/db.ts` is a placeholder for server-side data access (currently empty). Keep database and secret-handling code server-only.

Developer workflows & useful commands
- Install deps: `npm install` (use `npm ci` in CI environments).
- Dev server: `npm run dev` — starts Next.js dev server on http://localhost:3000.
- Build & start: `npm run build` then `npm start` for production runs.
- Linting: `npm run lint` (eslint config in `eslint.config.mjs` extends Next + TypeScript rules).
- Type checking (recommended before PR): `npx tsc --noEmit` (project uses `strict` TS config in `tsconfig.json`).
- No test runner is currently configured (no `test` script or test files).

Project-specific conventions & patterns
- App directory semantics: Default to server components for data fetching and logic; mark components `"use client"` only when necessary (event handlers, state, DOM APIs).
- Styling: use Tailwind utility classes in JSX. Global tokens and color variables live in `app/globals.css`.
- Path alias: `tsconfig.json` defines `@/*` -> `./*`. Prefer `import X from '@/path/to/file'` for local imports.
- Keep UI components in `app/components` and feature pages under their respective directories (e.g., `app/dashboard`). Add tests alongside modules if you introduce logic.

Integration points & external dependencies
- Vercel is the recommended deployment platform (mentioned in README). Use `next` build target defaults.
- Fonts loaded with `next/font/google` (see `app/layout.tsx`).
- No database or auth provider is configured yet — `app/lib/db.ts` is the right place to add server-only data access (and secrets must come from environment variables: do NOT hardcode credentials).

When making changes, prefer small, reviewable PRs
- Keep changes focused (e.g., "Add login form component" rather than "Add login form + database + auth + tests"), unless asked to implement a full feature.
- Run `npm run lint` and `npx tsc --noEmit` before opening a PR.
- Do not commit secrets or environment-specific files. Add `.env.example` if documenting required variables.

Helpful examples (quick snippets agents can use)
- Create a client component:
  ```tsx
  "use client"; // top of file
  import React from 'react';
  export default function MyButton(){ return <button className="px-4 py-2">Click</button> }
  ```
- Import with alias:
  ```ts
  import db from '@/app/lib/db'  // resolver via tsconfig paths
  ```

What an AI agent should NOT do
- Don't add or commit secrets; do not create or modify cloud-provider credentials.
- Don't change global layout behavior without reviewer confirmation (root layout affects all pages).

Open questions / places where a human must decide
- What database or ORM to use (Prisma, Supabase, etc.) — `app/lib/db.ts` was left empty and needs project-specific decisions.
- Preferred testing framework and CI setup (no test scripts or GitHub Actions present).

If something in these notes is unclear or incomplete, tell me which area (architecture, commands, conventions, or integrations) you want expanded and I will iterate. Thanks!