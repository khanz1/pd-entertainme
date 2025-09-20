# 30 - Align package.json Metadata and Scripts

## What changed

- Added root `package.json` with project metadata, repository links, and helpful scripts for dev/prod and Docker Compose operations.
- Updated `client/package.json` metadata (name, version, description, author, repo) and improved scripts.

## Pros

- Clear project metadata for tooling and maintainers.
- Consistent scripts to operate the monorepo and Docker environments.
- Better default dev experience (host 0.0.0.0 for Vite).

## Cons

- Slight overhead keeping metadata in sync across packages.

## Known issues / follow-ups

- None.

## Technical details

- Root `package.json`:
  - Scripts added: `dev`, `prod`, `compose:*`, `logs`, `server:*`, `client:*`.
  - Marked repo as private and configured workspaces.
- Client `package.json`:
  - Bumped version to `0.1.0` and renamed to `pd-entertainme-client`.
  - Added author/license/repository metadata.
  - `dev` script now serves on `0.0.0.0` for Docker compatibility.

## Commit message

```
chore(meta): align package.json metadata and scripts

• add root package.json with monorepo scripts and metadata
• update client/package.json metadata and dev script (host 0.0.0.0)
• improve compose scripts for local ops
```
