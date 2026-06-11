# WebApp Stack G One Point Zero — Wiki

Welcome to the **WebApp Stack G One Point Zero** wiki — the deep-dive home for the
reusable, enterprise-grade blueprint for spinning up **TypeScript + React + Vite +
Firebase + Stripe** web apps the same way, every time.

> The repository is **two things at once**: a runnable starter app (the repo root)
> and a full, ordered setup playbook (`.SYSTEMX/Template/`). This wiki documents
> both.

## Start here

| If you want to… | Go to |
| --- | --- |
| Get a running app in minutes | **[Quick Start](Quick-Start)** |
| Understand the tech choices | **[Architecture & Stack](Architecture-and-Stack)** |
| Know where everything lives | **[Project Structure](Project-Structure)** |
| Wire up Firebase / config | **[Environment Variables](Environment-Variables)** |
| Ship safely | **[Security](Security)** |
| Do the full guided build | **[Setup Playbook](Setup-Playbook)** |
| Go live | **[Deployment](Deployment)** |
| Add tests | **[Testing & QA](Testing-and-QA)** |
| Common questions | **[FAQ](FAQ)** |

## What is this?

A **portable golden path**. Drop it into any new repository (or click *Use this
template*) and an engineer — or an AI agent — follows the steps in order to stand
up a production-ready web application from a bare machine to a deployed,
monitored, billing-enabled product.

It is intentionally **generic**: no business names, no hard-coded project IDs, no
customer data. Everything project-specific is collected during the **Interview**
step (Step 01) and injected into generated files.

## Two ways to use it

1. **⚡ Fast start** — the repo root is a runnable app. `npm install && npm run dev`
   and you have a working React + Firebase site (it boots even before Firebase is
   configured).
2. **🧭 Full playbook** — [`.SYSTEMX/Template/`](https://github.com/WayneTechLab/webapp-stack-g1/tree/main/.SYSTEMX/Template)
   contains an ordered, gated system (`steps/00` → `steps/12`) covering
   provisioning, Stripe, Cloud Functions, security rules, CI/CD, testing, and
   monitoring.

## The golden rule

> **One step at a time, in order.** Each step states its goal and preconditions,
> prompts for inputs, performs the work, and ends with a **verification gate** you
> must pass before advancing. Later steps depend on artifacts (env vars, project
> IDs, price IDs) produced earlier.

## Versioning

`G One Point Zero` = **Generation 1.0**. Bump the generation for a breaking change
to the step order or baseline stack; patch individual step files freely.
