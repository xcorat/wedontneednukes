# [ESTABLISHED] Documentation Index

Welcome to the WeDoNotNeedNukes documentation.

## How to read these docs

- **`.ai/`** is the agent-facing surface. Coding agents (and humans doing AI-assisted development) should start at [`.ai/AGENTS.md`](../.ai/AGENTS.md); its **Quick References** table routes to the dense `.ai/context/` files covering stack versions, schema, design tokens, campaign strings, deployment, and the live roadmap status.
- **`docs/`** is the human-facing surface. This index, the contributor guide, campaign authoring prose, design rationale, fundraising analysis, and roadmap context live here.
- **The two surfaces don't drift.** Each `.ai/context/<name>.md` has a corresponding `docs/...` file with deeper prose. The historical `docs/research/*.md` documents each carry a short pointer at the top directing readers to the authoritative `.ai/context/*.md`.

## Core Documentation
- [Project README](../README.md): High-level overview and vision.
- [Agent Master Guide](../.ai/AGENTS.md): The entry point for all AI interactions and coding norms.
- [Contributing Guidelines](CONTRIBUTING.md): How to get involved in the community.

## AI Agent Context `[ESTABLISHED]`
- [Architecture Overview](../.ai/context/architecture.md)
- [Code Conventions](../.ai/context/conventions.md)
- [Glossary](../.ai/context/glossary.md)
- [Decisions (ADRs)](../.ai/context/decisions.md)
- [Feature Prompt](../.ai/prompts/feature.md)
- [Bugfix Prompt](../.ai/prompts/bugfix.md)
- [Review Prompt](../.ai/prompts/review.md)

## Architecture `[ESTABLISHED]`
- [System Overview](architecture/overview.md)
- [AI Assistant & Research Grounding Engine](architecture/ai-assistant.md)
- [Pledge Flow Engine](architecture/pledge-engine.md)
- [Community Media & Voting Engine](architecture/community-media.md)

## Campaign: Nuclear Disarmament `[DRAFT]`
- [Campaign Strategy & Positioning](campaigns/nukes/strategy.md)
- [Goals, Growth & Financials](campaigns/nukes/goals-and-financials.md)
- [Pledge Flow Definition](campaigns/nukes/pledge-flow.md)
- [FAQ Content](campaigns/nukes/faq-content.md)
- [UI Copy & Messaging](campaigns/nukes/copy.md)

## Design `[ACTIVE]`
- [Design System](design/design-system.md): Neo-Brutalist design tokens, themes, and font systems.
- [User Flows](design/user-flows.md): Core user interaction workflows.
- [User Flows, Form Modularization & Gated Questions Architecture](design/user-flows-and-data-architecture.md): Full component modularization, anonymous state strategy, and question tree specifications.

## Research `[RESEARCH / EXPLORATION]`
- [Tech Stack](research/tech-stack.md)
- [Data Model](research/data-model.md)
- [Folder Structure](research/folder-structure.md)
- [Auth Options](research/auth-options.md)

## Roadmap `[DRAFT]`
- [Phases](roadmap/phases.md)
- [Milestones](roadmap/milestones.md)

## Guides `[DRAFT]`
- [Local Development](guides/local-dev.md)
- [Deployment](guides/deployment.md)

