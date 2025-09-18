# 08 - Migrate Login Google OAuth to RTK Query

## What Changed

### Added

- Added `GoogleLoginRequest` interface to `movie.api.ts`
- Added `googleLogin` mutation endpoint to handle Google OAuth authentication
- Added `useGoogleLoginMutation` hook export

### Updated

- **Login.page.tsx**: Migrated Google OAuth login from axios to RTK Query
  - Replaced `serverApi.post()` call with `googleLogin()` mutation
  - Added proper error handling with try-catch block
  - Improved error messaging for Google login failures

### Removed

- **http.ts**: Deleted entire file as it's no longer needed
- **package.json**: Removed axios dependency
- **vite.config.ts**: Removed axios from build utils chunk
- Removed all axios and serverApi imports

## Technical Details

### Before

```typescript
// Login.page.tsx
import { serverApi } from "@/lib/http";

const result = await serverApi.post("/auth/login/google", {
  code: tokenResponse.code,
});
```

### After

```typescript
// movie.api.ts
googleLogin: builder.mutation<AuthResponse, GoogleLoginRequest>({
  query: (credentials) => ({
    url: "/auth/login/google",
    method: "POST",
    body: credentials,
  }),
  invalidatesTags: ["Auth"],
}),

// Login.page.tsx
const [googleLogin] = useGoogleLoginMutation();

const result = await googleLogin({
  code: tokenResponse.code,
}).unwrap();
```

## Pros and Cons

### Pros

- **Consistent API Management**: All API calls now use RTK Query for consistency
- **Better Error Handling**: Standardized error handling across all authentication flows
- **Reduced Bundle Size**: Removed axios dependency (~13.3KB gzipped)
- **Better TypeScript Support**: Improved type safety with RTK Query mutations
- **Automatic Caching**: RTK Query provides automatic caching and invalidation
- **Cleaner Code**: Removed redundant HTTP client setup

### Cons

- **Learning Curve**: Developers need to understand RTK Query patterns
- **Migration Effort**: Required updating existing code that used axios

## Benefits

- Unified authentication flow using RTK Query
- Reduced dependency footprint
- Better error handling and user feedback
- Consistent state management patterns
- Improved type safety and developer experience

## Files Modified

- `client/src/features/movies/movie.api.ts` - Added Google OAuth endpoint
- `client/src/pages/Login.page.tsx` - Migrated to RTK Query
- `client/package.json` - Removed axios dependency
- `client/vite.config.ts` - Updated build configuration

## Files Deleted

- `client/src/lib/http.ts` - No longer needed

---

**Git Commit Message:**

```
refactor(auth): migrate google oauth from axios to rtk query

• add googleLogin mutation to movie.api.ts
• update Login.page.tsx to use RTK Query for Google OAuth
• remove axios dependency and http.ts file
• improve error handling for Google login flow
• unify all API calls under RTK Query for consistency

BREAKING CHANGE: removed axios dependency, all HTTP calls now use RTK Query
```
