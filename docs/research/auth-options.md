# [RESEARCH / EXPLORATION] Authentication Options

This document outlines the authentication solutions evaluated for the WeDoNotNeedNukes project.

## Authentication Provider Comparison

| Solution | Status | D1 Support | Edge Compatible | Social Providers | Notes |
|---|---|---|---|---|---|
| **Better Auth** | **Recommended** | Native (Drizzle) | Yes | Google, GitHub, Apple, etc. | TS-first, utilizes a factory pattern for D1 injection per-request. |
| **Arctic (by Pilcrow)** | Alternative (DIY) | Manual | Yes | Any OAuth | Minimalistic, requires hand-rolling session management. |
| **Lucia Auth** | **DEPRECATED** | N/A | N/A | N/A | Deprecated late 2024. Do not use. |
| **@auth/sveltekit (Auth.js)** | Caution | Via adapter | Yes | Many | Known for cookie/session hydration quirks in SvelteKit. |
| **Cloudflare Access** | Internal/B2B only | N/A | Yes | IdP-based | Not suitable for consumer/B2C applications. |

## Implementation Strategy: Better Auth on Cloudflare D1

Since Cloudflare D1 database bindings are provided on a per-request basis via `platform.env.DB`, we cannot instantiate a static, globally scoped Better Auth instance. Instead, we must use a **factory pattern**.

### Factory Pattern Example

```typescript
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { drizzle } from 'drizzle-orm/d1';
import * as schema from './schema';

// Because D1 is injected per-request via platform.env.DB,
// you cannot use a static singleton. Use a factory:
export function getAuth(env: App.Platform['env']) {
  const db = drizzle(env.DB, { schema });
  
  return betterAuth({
    database: drizzleAdapter(db, { provider: 'sqlite' }),
    socialProviders: {
      github: { 
        clientId: env.GITHUB_CLIENT_ID, 
        clientSecret: env.GITHUB_CLIENT_SECRET 
      },
      google: { 
        clientId: env.GOOGLE_CLIENT_ID, 
        clientSecret: env.GOOGLE_CLIENT_SECRET 
      }
    }
  });
}
```

### Route Handler Pattern

This factory will be invoked inside the catch-all API route handler (`/api/auth/[...betterauth]/+server.ts`) and within `hooks.server.ts` to manage the request lifecycle and session resolution.
