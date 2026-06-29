# Control-Llama-Command — Wiki

Control-Llama-Command is a secure macOS dashboard for local Ollama model
operations, built on the WayneTechLab `webapp-stack-g1` foundation.

The app provides an authenticated command surface for installed models, running
models, chat streaming, settings, and operational logs. `.SYSTEMX/` keeps the
ordered setup, quality, and deploy workflows.

## Start here

| If you want to… | Go to |
| --- | --- |
| Run the app locally | **[Quick Start](Quick-Start)** |
| Understand the stack | **[Architecture & Stack](Architecture-and-Stack)** |
| See the repo layout | **[Project Structure](Project-Structure)** |
| Configure Firebase/Ollama | **[Environment Variables](Environment-Variables)** |
| Review access controls | **[Security](Security)** |
| Follow the setup gates | **[Setup Playbook](Setup-Playbook)** |
| Ship with Firebase | **[Deployment](Deployment)** |
| Add coverage | **[Testing & QA](Testing-and-QA)** |
| Common questions | **[FAQ](FAQ)** |

## Product overlay

The source build spec is ingested locally as `PROMPT-INGEST.md`. The tracked
source of truth is `.SYSTEMX/PROJECT-MASTER-PLAN.md`.

## First implementation slice

- Dashboard and running-model views.
- Chat streaming against Ollama's generation API.
- Settings for local runtime URLs and generation defaults.
- Firebase-aware login and route protection.
- Admin-only model control boundary through a local agent URL.
