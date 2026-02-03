# GitHub Copilot instructions for this repository

## Purpose
Help AI agents be immediately productive in this **PhysioConnect** platform - a role-based physiotherapy management system built with Next.js.

## Big Picture (Architecture & "Why")

### Domain Model
This is a **healthcare platform** connecting patients with physiotherapists through a case-based workflow:
- **3 user roles**: Admin (monitors platform), Physiotherapist (treats cases), Patient (creates cases)
- **Core entity**: Case - represents a patient's treatment request with comments, assignments, and closure workflow
- **Case lifecycle**: `open` → `in_progress` (assigned) → `pending_closure` (physio requests) → `closed` (patient approves with rating)
- **Test secret code**: Admin signup requires secret code `ZBK897` (see `app/api/auth/signup/route.ts`)

### Technical Stack
- **Framework**: Next.js 16.x with App Router (server components by default; use `"use client"` for browser-only code)
- **Database**: MongoDB + Mongoose (models in `app/lib/models/`) - uses `connectDB()` helper with DNS workarounds for network issues
- **State**: Zustand with localStorage persistence (`app/store/useAuthStore.ts`) - NO server-side session/JWT yet
- **Styling**: Tailwind CSS v4 via PostCSS
- **Security**: 
  - Passwords hashed with bcryptjs (auto-hashed in User model pre-save hook)
  - Field-level encryption via `app/lib/encryption.ts` (AES-256-CBC) - requires `ENCRYPTION_KEY` env var
  - MongoDB URI stored base64-encoded in `MONGODB_URI` env var

### Data Layer Architecture
- **Models** (`app/lib/models/`): Mongoose schemas with middleware
  - `User.ts`: Password auto-hash on save; `.toJSON()` strips password from responses
  - `Case.ts`: Indexed on `status`, `patientId`, `physiotherapistId` for performance
- **API Routes** (`app/api/`): RESTful endpoints returning `ApiResponse<T>` type (see `app/types/index.ts`)
  - All routes call `await connectDB()` before DB operations
  - Use `.populate()` to load related users, always exclude passwords: `.populate('patientId', '-password')`
  - **City matching**: Case assignment validates that physiotherapist serves the case city
  - **City API** (`app/api/cities/route.ts`): Returns available cities from constants (centralized for future DB expansion)
- **Database helper** (`app/lib/mongodb.ts`): Singleton connection with caching, DNS fixes (IPv4 forcing, Google DNS)
- **Constants** (`app/lib/constants.ts`): `INDIAN_METRO_CITIES` - hardcoded list of 6 metro cities used by city API
- **State Management**:
  - `useCityStore` (`app/store/useCityStore.ts`): Zustand store for cities, fetched from API on app load, persisted to localStorage
  - Cities loaded automatically via `CityProvider` in root layout
  - All components use `useCityStore` hook instead of hardcoded cities

### Component Structure
- **Role dashboards** (`app/components/`): `AdminDashboard.tsx`, `PhysiotherapistDashboard.tsx`, `PatientDashboard.tsx`
  - All are client components (`"use client"`) - they fetch data from API routes and manage local state
  - Use Zustand stores: `useAuthStore()` for current user, `useCityStore()` for available cities
- **Reusable UI** (`app/components/`): `Button`, `Card`, `Input`, `Select`, `TextArea`, `MultiSelect` - all use Tailwind utilities
- **Providers** (`app/components/`): `CityProvider` - loads cities on app initialization (wrapped in root layout)

## Developer Workflows & Commands

### Setup & Run
```bash
npm install                    # Install dependencies
node scripts/generate-keys.js  # Generate ENCRYPTION_KEY for .env.local
npm run dev                    # Start dev server (http://localhost:3000)
```

### Environment Variables (`.env.local`)
Required vars (NEVER commit these):
```env
MONGODB_URI=<base64-encoded connection string>  # See MONGODB_FIX.md for troubleshooting
ENCRYPTION_KEY=<64-char hex from generate-keys.js>
```

### Quality Checks
```bash
npm run lint          # ESLint (config: eslint.config.mjs)
npx tsc --noEmit     # TypeScript strict mode check
npm test             # Run all unit tests (81 tests)
npm run test:coverage # Test with coverage report
npm run build        # Production build
```

### Debugging MongoDB
- Connection issues? See `MONGODB_FIX.md` for DNS/SRV troubleshooting
- Connection string is **base64-encoded** in env var (decoded in `mongodb.ts`)
- Logs show `✅ MongoDB connected successfully` or error details

## Project-Specific Conventions

### Type Safety
- **Strict TypeScript**: All code uses `strict: true` mode
- **Dual ID handling**: Models support both `_id` (MongoDB) and `id` (legacy). When fetching users, use: `const userId = user._id || user.id;`
- **API Response shape**: Always return `ApiResponse<T>` from `app/types/index.ts`:
  ```ts
  return NextResponse.json<ApiResponse<User>>({
    success: true,
    data: userObject,
    message: 'Optional success message'
  });
  ```

### Authentication Pattern
- Login/signup: Client calls API route → receives user object → stores in Zustand → redirects to `/dashboard`
- Dashboard page (`app/dashboard/page.tsx`): Router component that loads role-specific dashboard based on `user.role`
- **No middleware** - authentication state lives in client localStorage (Zustand persist)

### Database Patterns
- **Always exclude passwords** from query results: `.select('-password')` or `.populate('userId', '-password')`
- **Use indexes** on Case model for queries by status/user (already defined in schema)
- **Pre-save hooks**: User password hashing happens automatically (see `User.ts` line 36)

### API Route Pattern (Example from `app/api/cases/route.ts`)
```ts
import connectDB from '@/app/lib/mongodb';
import { Case } from '@/app/lib/models/Case';
import { ApiResponse } from '@/app/types';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const cases = await Case.find().populate('patientId', '-password');
    return NextResponse.json<ApiResponse<any[]>>({ success: true, data: cases });
  } catch (error) {
    return NextResponse.json<ApiResponse>({ success: false, error: 'Message' }, { status: 500 });
  }
}
```

### Client Component Pattern (Example from dashboards)
```tsx
"use client";
import { useAuthStore } from '@/app/store/useAuthStore';
import { useState, useEffect } from 'react';

export default function MyDashboard() {
  const { user } = useAuthStore();
  const [data, setData] = useState([]);
  
  useEffect(() => {
    fetch(`/api/cases/patient/${user._id || user.id}`)
      .then(res => res.json())
      .then(result => result.success && setData(result.data));
  }, []);
  
  return <div>{/* render */}</div>;
}
```

## Integration Points & External Dependencies

### MongoDB Atlas
- Connection via Mongoose with custom DNS settings (see `app/lib/mongodb.ts`)
- Uses Google DNS (`8.8.8.8`) and IPv4 forcing to avoid SRV lookup issues on some networks
- Standard connection string preferred over `mongodb+srv://` (see `MONGODB_FIX.md`)

### Encryption System
- Field-level encryption in `app/lib/encryption.ts` (not yet used in models, but ready)
- Uses AES-256-CBC with random IV per encryption
- Key generated via `scripts/generate-keys.js`

##**Auth Store**: `app/store/useAuthStore.ts`
  - Persists user object to localStorage
  - Methods: `setUser(user)`, `logout()`, `updateUser(partial)`
- **City Store**: `app/store/useCityStore.ts`
  - Fetches cities from `/api/cities` on app load
  - Persists to localStorage to avoid repeated API calls
  - Method: `fetchCities()` (auto-called by CityProvider)
  - **Usage pattern**: `const cities = useCityStore((state) => state.cities);` - returns `{value, label}[]
- Methods: `setUser(user)`, `logout()`, `updateUser(partial)`

## What Agents Should NOT Do

- ❌ Don't modify MongoDB connection logic in `app/lib/mongodb.ts` without understanding DNS workarounds
- ❌ Don't expose passwords in API responses - models strip them via `.toJSON()`, but always verify `.populate()` excludes password field
- ❌ Don't hardcode the admin secret code `ZBK897` in new files (reference from existing signup route)
- ❌ Don't commit `.env.local` or real encryption keys
- ❌ Don't change User/Case schema without migration plan (no migrations set up)

## Helpful Patterns & Examples

### Create a new API endpoint
```ts
// app/api/my-feature/route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/app/lib/mongodb';
import { User } from '@/app/lib/models/User';

export async function GET(request: NextRequest) {
  await connectDB();
  const users = await User.find({ role: 'patient' }).select('-password');
  return NextResponse.json({ success: true, data: users });
}
```

### Add a new field to User model
1. Update schema in `app/lib/models/User.ts`
2. Update TypeScript interfaces in `app/types/index.ts`
3. Update Zustand store type in `app/store/useAuthStore.ts`
4. No automatic migrations - data added on next save

### Test with mock data
See `QUICK_START.md` for test credentials (e.g., `alice@example.com` / `patient123`)

## Key Files Reference
- **Entry**: `app/page.tsx` (landing), `app/dashboard/page.tsx` (role router)
- **Auth**: `app/api/auth/login/route.ts`, `app/api/auth/signup/route.ts`
- **Models**: `app/lib/models/User.ts`, `app/lib/models/Case.ts`
- **DB**: `app/lib/mongodb.ts` (connection), `app/lib/db.ts` (re-exports models)
- **Types**: `app/types/index.ts` (all TypeScript interfaces)
- **Config**: `tsconfig.json` (paths: `@/*`), `MONGODB_FIX.md` (connection troubleshooting)
- **Stores**: `app/store/useAuthStore.ts` (user), `app/store/useCityStore.ts` (cities)
- **API**: `app/api/cities/route.ts` (city data endpoint)
- **Providers**: `app/components/CityProvider.tsx` (loads cities on app init)

## Open Questions / Human Decisions Needed
- Migration strategy for schema changes (currently no migration tooling)
- Production deployment env vars and secrets management
- Whether to implement server-side sessions/JWT instead of localStorage auth
- Integration testing strategy for API routes (requires MongoDB mocking)
- E2E testing framework choice (Playwright, Cypress, etc.)