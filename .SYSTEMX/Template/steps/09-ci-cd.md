# Step 09 — CI/CD

> Continuous integration that blocks bad merges, plus repository secrets and a
> deploy pipeline to Firebase Hosting + Functions.

## 🎯 Goal
A green GitHub Actions pipeline that runs lint, typecheck, unit tests, rules
tests, and build on every PR — and deploys on merge to the default branch.

## ✅ Preconditions
- `GITHUB_REPO` exists and you can push.
- `gh auth login` complete (Step 00).
- Build + tests pass locally.

## ❓ Operator prompts
1. Deploy on merge to `main`, or manual `workflow_dispatch`?
2. Use preview channels for PRs?
3. Which environments deploy from which branches?

## ⌨️ Commands

### Repository secrets
```bash
# Service account for CI deploys (least privilege: Firebase Hosting Admin, etc.)
gh secret set FIREBASE_SERVICE_ACCOUNT < path/to/ci-sa.json
gh secret set FIREBASE_PROJECT_ID --body "${PROJECT_ID}"

# Client build-time vars (these are public VITE_* values, fine as repo secrets):
gh secret set VITE_FIREBASE_API_KEY --body "..."
# ...repeat for each VITE_FIREBASE_* value...

# Server secrets stay in Functions secrets / Secret Manager, NOT here.
```

### `.github/workflows/ci.yml`
```yaml
name: CI
on:
  pull_request:
  push: { branches: [main] }
jobs:
  verify:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 22, cache: npm }
      - run: npm ci
      - run: npm run ci:lint
      - run: npm run ci:typecheck
      - run: npm run ci:test
      - run: npm run ci:build
        env:
          VITE_FIREBASE_API_KEY: ${{ secrets.VITE_FIREBASE_API_KEY }}
          # ...map remaining VITE_FIREBASE_* secrets...
```

### `.github/workflows/deploy.yml`
```yaml
name: Deploy
on:
  push: { branches: [main] }
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 22, cache: npm }
      - run: npm ci && npm run build
      - uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          repoToken: ${{ secrets.GITHUB_TOKEN }}
          firebaseServiceAccount: ${{ secrets.FIREBASE_SERVICE_ACCOUNT }}
          projectId: ${{ secrets.FIREBASE_PROJECT_ID }}
          channelId: live
```

### Branch protection
```bash
gh api -X PUT repos/${GITHUB_REPO}/branches/main/protection \
  -f required_status_checks.strict=true \
  -F 'required_status_checks.contexts[]=verify' \
  -F enforce_admins=true \
  -F 'required_pull_request_reviews.required_approving_review_count=1'
```

## 📄 Generated files
- `.github/workflows/ci.yml`, `.github/workflows/deploy.yml`
- Optional `.github/workflows/preview.yml` for PR channels.

## 🔒 Security notes
- CI deploy service account = **least privilege** (Hosting/Functions deploy only).
- Add a **secret-scanning** + `npm audit` job; fail on high severity.
- Never echo secrets in logs; rely on GitHub's masking.
- Pin action versions; review third-party actions before adding.
- Protect `main`; require passing checks + review before merge.

## 🚦 Verification gate
```bash
git push -u origin main         # opens/triggers CI
gh run watch                    # CI completes green
```
✅ Pass → proceed to [Step 10 — Testing & QA](./10-testing-qa.md).
