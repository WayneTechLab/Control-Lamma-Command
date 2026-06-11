# Testing & QA

Unit tests (Vitest + Testing Library), end-to-end tests (Playwright), and
automated accessibility/security gates — runnable locally and in CI.

> Detailed source:
> [Step 10 — Testing & QA](https://github.com/WayneTechLab/webapp-stack-g1/blob/main/.SYSTEMX/Template/steps/10-testing-qa.md).

## What ships in the baseline vs. the playbook

- **Baseline (repo root):** ESLint + TypeScript + a build gate, wired into CI
  (`lint · typecheck · build`).
- **Playbook (Step 10):** adds Vitest, Playwright, and a11y/security audits.

## Unit / component tests (Vitest + Testing Library)

```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom \
  @testing-library/user-event jsdom
```

`vitest.config.ts`:

```ts
import { defineConfig } from 'vitest/config'
export default defineConfig({
  test: { environment: 'jsdom', setupFiles: ['./vitest.setup.ts'], globals: true },
})
```

`vitest.setup.ts`:

```ts
import '@testing-library/jest-dom/vitest'
```

Run them:

```bash
npm run test          # (wire this script to "vitest")
```

## End-to-end tests (Playwright)

```bash
npm install -D @playwright/test
npx playwright install --with-deps
npx playwright codegen http://localhost:5173    # record flows
```

`playwright.config.ts`:

```ts
import { defineConfig } from '@playwright/test'
export default defineConfig({
  testDir: './tests',
  webServer: { command: 'npm run dev', url: 'http://localhost:5173', reuseExistingServer: true },
  use: { baseURL: 'http://localhost:5173', trace: 'on-first-retry' },
})
```

Example smoke test (`tests/smoke.spec.ts`):

```ts
import { test, expect } from '@playwright/test'
test('home renders + no console errors', async ({ page }) => {
  const errors: string[] = []
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()))
  await page.goto('/')
  await expect(page).toHaveTitle(/.+/)
  expect(errors, errors.join('\n')).toHaveLength(0)
})
```

## Accessibility & security gates

```bash
npm install -D @axe-core/playwright    # a11y assertions inside e2e
npm audit                              # dependency vulnerabilities
```

## Wiring into CI

Extend the CI `verify` job (from Step 09) with the test stages:

```yaml
      - run: npm run ci:test
      - run: npx playwright install --with-deps
      - run: npx playwright test
      - run: npm run ci:rules || true     # Firestore rules tests
```

## Verification gate

```bash
npm run test            # unit/component green
npx playwright test     # e2e green
```

## Testing rules of thumb

- Use **test-mode** credentials and the **emulator suite** for e2e — never prod
  data.
- Keep a **rules unit test** (`@firebase/rules-unit-testing`) in the suite to
  catch data-exposure regressions.
- Run `npm audit` + secret scanning on every PR.
- Treat e2e fixtures/tokens as secrets — inject via CI secrets, not the repo.
- Identify your **critical-path** journeys (auth, core CRUD, checkout) and ensure
  each has e2e coverage.
