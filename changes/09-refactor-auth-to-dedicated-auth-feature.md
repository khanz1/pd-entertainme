# 09 - Refactor Auth to Dedicated Auth Feature

## What Changed

### Added

- **auth.type.ts**: Centralized all authentication-related types
  - `User`, `AuthState`, `AuthResponse` interfaces
  - `RegisterRequest`, `LoginRequest`, `GoogleLoginRequest` interfaces
  - `UserMeResponse` interface
- **auth.slice.ts**: Dedicated authentication state management
  - Moved `setCredentials`, `logout`, `clearAuth`, `setIsAuthenticated` actions
  - Clean separation of auth state from movies state
- **auth.api.ts**: Dedicated authentication API endpoints
  - `register`, `login`, `googleLogin` mutations
  - `getUserMe` query
  - Proper RTK Query organization

### Updated

- **store.ts**: Updated to import auth reducer from dedicated auth feature
- **Login.page.tsx**: Changed imports to use `@/features/auth/auth.api` and `@/features/auth/auth.slice`
- **Register.page.tsx**: Changed imports to use `@/features/auth/auth.api` and `@/features/auth/auth.slice`
- **header.tsx**: Changed imports to use `@/features/auth/auth.api` and `@/features/auth/auth.slice`

### Removed

- **movie.slice.ts**: Removed all auth-related code and types
  - Removed `AuthState`, `User` interfaces
  - Removed `setCredentials`, `logout`, `clearAuth`, `setIsAuthenticated` actions
  - Removed `authSlice` and `authReducer` exports
- **movie.api.ts**: Removed all auth-related endpoints
  - Removed `register`, `login`, `googleLogin` mutations
  - Removed `getUserMe` query
  - Removed auth-related type definitions

## Technical Details

### Before Structure

```
features/
├── movies/
│   ├── movie.slice.ts (contained both auth and movie logic)
│   ├── movie.api.ts (contained both auth and movie endpoints)
│   └── movie.type.ts
└── auth/
    ├── auth.slice.ts (empty)
    ├── auth.api.ts (empty)
    ├── auth.type.ts (empty)
    └── schema/
```

### After Structure

```
features/
├── movies/
│   ├── movie.slice.ts (clean, movies-only)
│   ├── movie.api.ts (clean, movies-only)
│   └── movie.type.ts
└── auth/
    ├── auth.slice.ts (complete auth state management)
    ├── auth.api.ts (complete auth API endpoints)
    ├── auth.type.ts (all auth-related types)
    └── schema/
```

### Import Changes

```typescript
// Before
import { setCredentials } from "@/features/movies/movie.slice";
import { useLoginMutation } from "@/features/movies/movie.api";

// After
import { setCredentials } from "@/features/auth/auth.slice";
import { useLoginMutation } from "@/features/auth/auth.api";
```

## Pros and Cons

### Pros

- **Better Organization**: Clear separation of concerns between auth and movies
- **Maintainability**: Easier to maintain auth-specific functionality
- **Scalability**: Auth feature can grow independently without affecting movies
- **Code Discovery**: Developers can find auth-related code in one place
- **Type Safety**: Centralized auth types improve consistency
- **Testing**: Easier to test auth functionality in isolation
- **Team Collaboration**: Different teams can work on auth vs movies independently

### Cons

- **Migration Effort**: Required updating imports across multiple files
- **Learning Curve**: Developers need to know the new file structure
- **Import Paths**: Slightly longer import paths for auth-related functionality

## Benefits

- Clear feature boundaries and responsibilities
- Improved code organization and maintainability
- Better scalability for future auth enhancements
- Easier debugging and testing of auth functionality
- Consistent type definitions across auth components

## Files Created

- `client/src/features/auth/auth.type.ts` - Auth type definitions
- `client/src/features/auth/auth.slice.ts` - Auth state management
- `client/src/features/auth/auth.api.ts` - Auth API endpoints

## Files Modified

- `client/src/store.ts` - Updated auth reducer import
- `client/src/features/movies/movie.slice.ts` - Removed auth logic
- `client/src/features/movies/movie.api.ts` - Removed auth endpoints
- `client/src/pages/Login.page.tsx` - Updated imports
- `client/src/pages/Register.page.tsx` - Updated imports
- `client/src/components/header.tsx` - Updated imports

---

**Git Commit Message:**

```
refactor(auth): separate auth functionality into dedicated feature module

• create auth.type.ts with centralized auth type definitions
• create auth.slice.ts with dedicated auth state management
• create auth.api.ts with auth-specific RTK Query endpoints
• remove auth logic from movies slice and API
• update all auth imports across components and pages
• improve code organization with clear feature boundaries

BREAKING CHANGE: auth imports moved from @/features/movies to @/features/auth
```
