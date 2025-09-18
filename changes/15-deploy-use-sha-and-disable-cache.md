## What changed

- Update `.github/workflows/deploy.yml` to build without cache, push SHA tag, and deploy that immutable tag instead of `latest`.
- Add OCI labels to `server/Dockerfile` and support build args for `GIT_SHA` and `BUILD_DATE`.

## Why

- EC2 was repeatedly pulling an older `latest` digest, causing old logs and code to run.
- Using immutable image tags (commit SHA) removes ambiguity and avoids stale cache surprises.
- Adding labels improves traceability of what commit/date a container was built from.

## Technical details

- Workflow changes:
  - Add `no-cache: true` to docker/build-push-action
  - Push both `latest` and `${{ github.sha }}`
  - Deploy using `${{ github.sha }}` tag
- Dockerfile changes:
  - Add `ARG GIT_SHA` and `ARG BUILD_DATE`
  - Add OCI labels `org.opencontainers.image.revision` and `org.opencontainers.image.created` in both stages

## Pros

- **Deterministic deploys**: EC2 runs exactly the image built from the commit
- **No stale cache**: Build step does not reuse cached layers in CI
- **Traceability**: Inspecting the image shows commit and build date

## Cons

- **Slightly longer builds**: No-cache builds can take a bit longer

## Known issues/Follow-ups

- If you must roll back, deploy the previous SHA tag explicitly

## Commit message

```
ops(ci)!: deploy docker image by immutable sha tag and disable cache

• build-push: add no-cache, push latest and sha tags
• deploy: pull and run image by ${{ github.sha }}
• dockerfile: add build args and OCI labels (revision, created)

BREAKING CHANGE: deployments no longer use `latest` at runtime; they use commit SHA.
```
