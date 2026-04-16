# Vikunja QA Automation Framework

Enterprise-grade **Playwright + TypeScript + BDD Cucumber** automation framework for the [Vikunja](https://vikunja.io) task management application.

---

## Table of Contents

1. [Tech Stack](#tech-stack)
2. [Framework Architecture](#framework-architecture)
3. [Features](#features)
4. [Installation](#installation)
5. [Running Tests](#running-tests)
6. [Generating Allure Reports](#generating-allure-reports)
7. [Switching Environments](#switching-environments)
8. [MySQL Integration](#mysql-integration)
9. [Test Scope & Checklist](#test-scope--checklist)
10. [Design Choices](#design-choices)
11. [CI/CD](#cicd)

---

## Tech Stack

| Tool | Version | Purpose |
|------|---------|---------|
| Node.js | ≥ 18 | Runtime |
| TypeScript | ^5.4 | Type-safe authoring |
| Playwright | ^1.44 | Browser automation + API testing |
| @cucumber/cucumber | ^10 | BDD / Gherkin scenario execution |
| allure-playwright | ^2.15 | Playwright Allure reporter |
| allure-cucumberjs | ^2.15 | Cucumber Allure reporter |
| allure-commandline | ^2.30 | CLI to generate/open reports |
| winston | ^3.13 | Structured logging |
| mysql2 | ^3.10 | MySQL / MariaDB DB verification |
| dotenv | ^16 | Environment variable loading |
| ts-node | ^10 | TypeScript execution at runtime |
| ESLint + Prettier | latest | Code quality |

---

## Framework Architecture

```
qa/
├── Allure/                          # Allure report output placeholder
├── MySQL/
│   ├── db-utils.ts                  # MySQL connection & query helpers
│   ├── db-fixtures.ts               # Test data seed/cleanup via DB
│   └── queries.ts                   # Named SQL queries + row types
│
├── src/
│   ├── env/
│   │   ├── qa.env.ts                # QA environment config
│   │   ├── dev.env.ts               # DEV environment config
│   │   └── stage.env.ts             # STAGE environment config
│   │
│   ├── settersAndGetters/
│   │   └── index.ts                 # Typed in-memory cross-step state store
│   │
│   ├── test-setup/
│   │   ├── world.ts                 # Custom Cucumber World class
│   │   ├── hooks.ts                 # Before/After hooks (browser + API lifecycle)
│   │   ├── global-setup.ts          # Playwright global setup
│   │   └── global-teardown.ts       # Playwright global teardown
│   │
│   ├── Tests/
│   │   ├── feature-files/
│   │   │   ├── login.feature        # User auth BDD scenarios
│   │   │   ├── project.feature      # Project CRUD BDD scenarios
│   │   │   ├── task.feature         # Task CRUD BDD scenarios
│   │   │   └── api.feature          # API BDD scenarios
│   │   │
│   │   ├── page-files/
│   │   │   ├── LoginPage.ts         # Login page object
│   │   │   ├── DashboardPage.ts     # Dashboard page object
│   │   │   ├── ProjectPage.ts       # Projects page object
│   │   │   └── TaskPage.ts          # Tasks page object
│   │   │
│   │   ├── step-files/
│   │   │   ├── common.steps.ts      # Shared step definitions
│   │   │   ├── login.steps.ts       # Login step definitions
│   │   │   ├── project.steps.ts     # Project step definitions
│   │   │   ├── task.steps.ts        # Task step definitions
│   │   │   └── api.steps.ts         # API step definitions
│   │   │
│   │   └── vikunja-api.spec.ts      # Playwright API test spec (non-BDD)
│   │
│   ├── upload-file/
│   │   └── sample.txt               # Sample file for upload tests
│   │
│   └── utils/
│       ├── action-utils.ts          # Click, type, select, hover, drag, etc.
│       ├── api-utils.ts             # APIRequestContext wrapper
│       ├── assert-utils.ts          # Assertions with auto-screenshot + Allure
│       ├── asset-utils.ts           # Screenshots, upload path resolver
│       ├── browser-utils.ts         # Browser launch/close + media permissions
│       ├── constants.ts             # Timeout constants, load states
│       ├── element-utils.ts         # Element stability / wait utilities
│       ├── env-utils.ts             # Multi-environment config switcher
│       ├── locator-utils.ts         # Locator strategies (role, text, testid...)
│       ├── logger.ts                # Winston logger (file + console)
│       ├── page-utils.ts            # Page factory, navigation, window switching
│       ├── test-data-utils.ts       # Random data generators, payload builders
│       └── types.ts                 # Shared TypeScript interfaces
│
├── logs/                            # Runtime log files (gitignored)
├── test-results/                    # Playwright screenshots/videos (gitignored)
├── allure-results/                  # Raw Allure data (gitignored)
├── allure-report/                   # Generated HTML report (gitignored)
│
├── playwright.config.ts             # Playwright configuration
├── cucumber.js                      # Cucumber profiles
├── tsconfig.json                    # TypeScript configuration
├── package.json                     # Dependencies and npm scripts
├── .eslintrc.json                   # ESLint rules
├── .prettierrc                      # Prettier formatting
└── .gitignore
```

---

## Features

| Feature | Details |
|---------|---------|
| **Web Automation** | Playwright POM with `action-utils`, `locator-utils`, `element-utils` |
| **API Automation** | Playwright `APIRequestContext` via `api-utils` — GET/POST/PUT/PATCH/DELETE |
| **BDD (Cucumber)** | `@cucumber/cucumber` v10 with Gherkin feature files, step definitions |
| **Page Object Model** | Strict SRP: locators + actions only, no assertions in page objects |
| **Allure Reporting** | Screenshots on every assertion pass/fail; API request+response attached |
| **Multi-Environment** | QA, DEV, STAGE, PROD via `ENV` env var |
| **Parallel Execution** | `fullyParallel: true` in Playwright; `parallel: 4` in Cucumber |
| **MySQL Integration** | `mysql2` connection to MariaDB; named queries; DB fixture helpers |
| **Screenshot on Failure** | Auto-captured in `After` hook and every `assert-utils` assertion |
| **Logging** | Winston: timestamped console + rotating file (`logs/framework.log`) |
| **CI/CD Ready** | `cross-env`, GitHub Actions–friendly scripts, `process.env.CI` guards |

---

## Installation

### Prerequisites

- Node.js ≥ 18
- Docker + Docker Compose (to run the application)

### 1. Start the application

```bash
cd ../application
docker-compose up -d
# Verify: http://localhost:8080
```

### 2. Install dependencies

```bash
cd qa
npm install
```

### 3. Install Playwright browsers

```bash
npm run install:browsers
```

### 4. (Optional) Register a test user

Open `http://localhost:8080/register` and create a user matching `src/env/qa.env.ts`:
- Username: `qauser`
- Email: `qa@test.local`
- Password: `qaPassword1!`

Or override via environment variables (see [Switching Environments](#switching-environments)).

---

## Running Tests

### BDD Tests (Cucumber)

```bash
# All scenarios (QA env, sequential)
npm run test:bdd

# Smoke scenarios only
npm run test:bdd:smoke

# Parallel execution (4 workers)
npm run test:bdd:parallel

# API scenarios only
npm run test:api

# With a specific tag
cross-env ENV=QA cucumber-js --profile default --tags "@project and @positive"
```

### Playwright Tests (non-BDD)

```bash
# API spec — Chromium
npm run test:web

# All browsers
cross-env ENV=QA playwright test

# Headed mode (watch the browser)
npm run test:web:headed

# Firefox / WebKit
npm run test:web:firefox
npm run test:web:webkit
```

### Run Everything

```bash
npm run test:all
```

---

## Generating Allure Reports

### BDD (Cucumber) Allure

```bash
# Run BDD tests (writes allure-results/)
npm run test:bdd

# Generate HTML report
npm run report:generate

# Open in browser
npm run report:open
```

### Playwright Allure

```bash
# Run Playwright tests (writes allure-results/ via allure-playwright)
npm run test:web

# Generate + open
npm run report:generate
npm run report:open
```

### Clean reports

```bash
npm run report:clean
```

---

## Switching Environments

Set the `ENV` variable before running tests:

| Environment | Command prefix |
|-------------|----------------|
| QA (default) | `cross-env ENV=QA` |
| DEV | `cross-env ENV=DEV` |
| STAGE | `cross-env ENV=STAGE` |

Override individual values without modifying env files:

```bash
cross-env ENV=QA BASE_URL=http://localhost:9090 TEST_USERNAME=admin PASSWORD=secret npm run test:bdd
```

Cucumber profiles already wired:

```bash
npm run test:bdd:dev    # DEV environment
npm run test:bdd:stage  # STAGE environment
```

---

## MySQL Integration

The Vikunja docker-compose runs MariaDB internally. To connect from the host you must expose port 3306. Add this to `application/docker-compose.yml` (for local dev only):

```yaml
db:
  ports:
    - "3306:3306"
```

Then run DB fixture helpers in tests:

```typescript
import { openDBConnection, closeDBConnection, verifyProjectInDB } from '../../MySQL/db-fixtures';

// In test/step
await openDBConnection();
const exists = await verifyProjectInDB('My Project', userId);
expect(exists).toBe(true);
await closeDBConnection();
```

Override connection defaults:

```bash
cross-env DB_HOST=127.0.0.1 DB_PORT=3306 DB_USER=vikunja DB_PASSWORD=vicunja_password npm run test:bdd
```

---

## Test Scope & Checklist

### Coverage Strategy

We focus on **combined UI + API** coverage for maximum confidence. API tests verify the backend contract; UI tests verify the end-to-end user journey.

### Test Checklist

#### Authentication
- [x] Successful login with valid credentials (UI)
- [x] Failed login with invalid credentials (UI + API)
- [x] Login page elements visibility (UI)
- [x] API login returns token (API)
- [x] Authenticated API call returns user info (API)

#### Projects (Full CRUD)
- [x] Create project (UI)
- [x] Create project (API — PUT /projects)
- [x] Read all projects (UI + API)
- [x] Read single project (API — GET /projects/:id)
- [x] Update project title (UI + API — POST /projects/:id)
- [x] Delete project (UI + API — DELETE /projects/:id)
- [x] Negative: create with empty title (UI)

#### Tasks (Full CRUD)
- [x] Create task in project (UI)
- [x] Create task via API (PUT /projects/:id/tasks)
- [x] Read all tasks (UI + API)
- [x] Mark task as done (UI + API)
- [x] Delete task (UI + API — DELETE /tasks/:id)

#### DB Verification
- [x] Verify project exists in DB after API creation
- [x] Verify task count via DB query
- [x] User existence check via DB

---

## Design Choices

### Why Page Object Model?
Encapsulates all element selectors and interactions per page. Step definitions stay clean and readable. Selectors change in one place only.

### Why Cucumber BDD?
Feature files serve as living documentation. Scenarios are readable by non-technical stakeholders. Tags allow selective execution (@smoke, @regression, @api).

### Why Playwright for API Tests?
Re-uses the same `request` object used for browser auth; `APIRequestContext` integrates seamlessly with Allure and the existing utils layer.

### Why Every Assertion Takes a Screenshot?
`assert-utils.ts` wraps every assertion in a try/catch: on pass it attaches a `PASS_*` screenshot; on fail it attaches a `FAIL_*` screenshot. This eliminates guesswork when debugging failures — you always have a visual.

### Why Singleton Page?
`page-utils.ts` stores the active `Page` as a module-level singleton. All utils — actions, locators, assertions — call `getPage()` instead of passing the page around. This keeps step definitions and page objects lean.

### Why Winston Logging?
Structured timestamps, levels (info/error/warn/debug), and file rotation. Log level controlled via `LOG_LEVEL` env var. Colour in console, plain text in file.

---

## CI/CD

The framework is CI-ready:

```yaml
# Example GitHub Actions snippet
- name: Start application
  run: cd application && docker-compose up -d

- name: Install dependencies
  run: cd qa && npm ci && npm run install:browsers

- name: Run BDD smoke tests
  run: cd qa && npm run test:bdd:smoke
  env:
    ENV: QA
    CI: true

- name: Run API spec
  run: cd qa && npm run test:web
  env:
    ENV: QA
    CI: true

- name: Generate Allure report
  if: always()
  run: cd qa && npm run report:generate

- name: Upload Allure report
  uses: actions/upload-artifact@v4
  with:
    name: allure-report
    path: qa/allure-report/
```

Key CI behaviours:
- `process.env.CI` → `retries: 2`, `workers: 4`, GitHub reporter enabled
- `HEADLESS` defaults to `true` in all environments
- `LOG_LEVEL=debug` for verbose CI output


# 🧪 Cucumber.js Test Suite

## 📋 Prerequisites

- Node.js installed
- Dependencies installed via `npm install`
- `cucumber.js` config file present at project root

---

## 🚀 Running Tests

### ▶️ Run All Login Tests

```bash
npx cucumber-js --config=cucumber.js --tags "@login" src/Tests/feature-files/login.feature
```

---

### 🔐 Login Feature — `src/Tests/feature-files/login.feature`

```bash
# TC_001
npx cucumber-js --config=cucumber.js --tags "@TC_001" src/Tests/feature-files/login.feature

# TC_002
npx cucumber-js --config=cucumber.js --tags "@TC_002" src/Tests/feature-files/login.feature

# TC_003
npx cucumber-js --config=cucumber.js --tags "@TC_003" src/Tests/feature-files/login.feature

# TC_004
npx cucumber-js --config=cucumber.js --tags "@TC_004" src/Tests/feature-files/login.feature

# TC_005
npx cucumber-js --config=cucumber.js --tags "@TC_005" src/Tests/feature-files/login.feature
```

---

### 📝 Register Feature — `src/Tests/feature-files/register.feature`

```bash
# TC_006
npx cucumber-js --config=cucumber.js --tags "@TC_006" src/Tests/feature-files/register.feature
```

---

### ✅ Task Feature — `src/Tests/feature-files/task.feature`

```bash
# TC_007
npx cucumber-js --config=cucumber.js --tags "@TC_007" src/Tests/feature-files/task.feature
```

---

## 📊 Test Cases Summary

| Test Case | Tag      | Feature File       |
|-----------|----------|--------------------|
| All Login | `@login` | `login.feature`    |
| TC 001    | `@TC_001`| `login.feature`    |
| TC 002    | `@TC_002`| `login.feature`    |
| TC 003    | `@TC_003`| `login.feature`    |
| TC 004    | `@TC_004`| `login.feature`    |
| TC 005    | `@TC_005`| `login.feature`    |
| TC 006    | `@TC_006`| `register.feature` |
| TC 007    | `@TC_007`| `task.feature`     |
