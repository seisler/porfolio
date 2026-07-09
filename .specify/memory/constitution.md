# Portfolio Constitution

This constitution captures the non-negotiable principles governing this project.
It is derived from the Architecture Decision Records in [`docs/adr/`](../../docs/adr/);
each principle cites the ADR that ratified it. When a principle and an ADR appear
to conflict, the ADR is the source of truth and this document must be corrected.

## Core Principles

### I. Static-First Delivery (ADR-0001)

The site is a static, pre-rendered artifact. Astro is the framework precisely
because it ships zero JavaScript by default. Server-side/build-time rendering is
the norm; there is no client-side application runtime. Any capability that would
require an SSR server, a client framework runtime, or per-request rendering must
be justified against this principle before adoption.

### II. CSS-First, JavaScript by Exception (ADR-0002)

Any functionality or visual effect MUST first be attempted in HTML/CSS. Modern CSS
(`:has()`, native `<details>`/`<dialog>`, container queries, scroll-driven
animations, the Popover API, View Transitions) is the default toolset. Client-side
JavaScript is forbidden unless explicitly requested for a specific, named case — it
is never a default implementation choice. If that exception is exercised (e.g. an
Astro island), the JavaScript MUST be test-driven: write the failing test first.
Static HTML/CSS is exempt from that requirement — it is covered by linting and
manual/visual review instead.

### III. Token-Driven Styling, No Hardcoded Values (ADR-0003)

All design values — color, spacing, typography, radii, shadows, breakpoints — are
defined once as design tokens and consumed via `var(--token-name)` (or, for
breakpoints, `@custom-media` tokens). Hardcoded values (raw `px`, hex colors, magic
numbers) are forbidden outside the token definition files and are a lint failure,
not a style-guide suggestion. The token files themselves are the single source of
truth.

### IV. Mobile-First Responsive Design (ADR-0006)

Base (unprefixed) styles target the smallest supported viewport. Enhancements layer
on top via `min-width` media queries — never `max-width` override cascades.
Breakpoints are expressed in `rem` (so they respect user font-size/zoom) and
tokenized via `@custom-media`. Container queries are used for component-relative
sizing, complementing — not replacing — the breakpoint scale.

### V. Layered Architecture — Simplified FSD (ADR-0004)

The UI is organized as `pages → widgets → shared` (Astro's `src/pages` is the
native routing/pages layer). Imports flow one direction only: nothing in `shared`
imports from `widgets`, nothing in `widgets` imports from `pages`. The `entities`
and `features` layers are intentionally omitted and introduced only if genuine
domain logic or a multi-step interactive flow later demands them.

### VI. Consistent Naming — BEM (ADR-0007)

Every custom class follows BEM: `.block`, `.block__element`, `.block--modifier`.
This applies inside Astro's scoped `<style>` blocks too — scoping solves collisions,
BEM solves readability. Enforced via Stylelint's `selector-class-pattern`.

### VII. Pragmatic Simplicity (YAGNI)

Ceremony must earn its place. Abstractions, layers, tooling, and process are added
when a concrete need exists — not speculatively. This principle is why TDD is scoped
to JS/schemas rather than mandated everywhere (ADR-0002), why FSD is trimmed
(ADR-0004), and why tooling favors the lightest option that works. Prefer deleting a
decision over carrying an unused one.

## Technology & Tooling Constraints

- **Runtime**: Node `>=22.12.0`. Package manager: npm.
- **Framework**: Astro (static output, no SSR adapter).
- **Styling**: plain CSS with custom-property tokens; PostCSS `@custom-media` for
  breakpoints (`postcss-custom-media` + `@csstools/postcss-global-data`). No CSS
  preprocessor, no utility-first framework.
- **Linting**: Stylelint (`stylelint-config-standard` plus token, breakpoint, and
  BEM rules) is the enforcement mechanism for Principles III, IV, and VI.
- **Commits**: follow [`docs/commit-convention.md`](../../docs/commit-convention.md)
  (Conventional Commits — trimmed type set, enumerated FSD scopes), enforced by
  commitlint.

## Development Workflow & Quality Gates

- **Branching**: `dev → main`. Work happens on `dev`; `main` is the release branch.
- **Architectural decisions**: any new architectural decision is recorded as an ADR
  in `docs/adr/` before or alongside its implementation. The ADR is the amendment
  mechanism for this constitution (see Governance).
- **Local gates** (native git hooks, `core.hooksPath` → `.githooks/`):
  - `pre-commit` runs Stylelint on staged CSS/Astro files.
  - `commit-msg` runs commitlint on the message.
- **CI gate**: Stylelint runs on every pull request targeting `dev`.
- **Verification**: non-trivial changes are verified by observing the real rendered
  output, not only by passing lint/build.

## Governance

- This constitution supersedes ad-hoc practice. Specs, plans, and implementations
  produced via the Spec Kit workflow are checked against it.
- Principles here are **derived from ADRs**. To amend a principle, write or update
  the governing ADR first, then reconcile this document to match — never edit a
  principle in isolation.
- Amendments bump the version below using semantic versioning: MAJOR for a
  principle removed or materially redefined, MINOR for a new principle or section,
  PATCH for clarifications and wording.
- Runtime, agent-facing guidance lives in [`AGENTS.md`](../../AGENTS.md) (symlinked
  as `CLAUDE.md`); it must stay consistent with this constitution.

**Version**: 1.0.0 | **Ratified**: 2026-07-09 | **Last Amended**: 2026-07-09
