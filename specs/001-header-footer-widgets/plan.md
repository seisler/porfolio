# Implementation Plan: Header and Footer Widgets

**Branch**: `feature/EKQKaWCY/header-and-footer-widgets` | **Date**: 2026-07-10 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/001-header-footer-widgets/spec.md`

## Summary

Add a global header widget (navbar: Home, Job History, Projects, Contact —
inline on desktop, behind a hamburger-triggered slide-in panel on tablet/
mobile) and a global footer widget (build-time-computed copyright line), both
imported and rendered by `src/pages/_layouts/BaseLayout.astro`, the direct
consumer, with `src/pages/index.astro` consuming them indirectly through
that layout and reusable by future pages. The disclosure behavior for the
mobile/tablet panel is implemented with the native Popover API (per
ADR-0002) — no client-side JavaScript.

## Technical Context

**Language/Version**: Astro 7.0.7 on Node >=22.12.0 (`.astro` components; no client JS runtime introduced)

**Primary Dependencies**: None added — pure Astro + CSS. Disclosure behavior uses the native Popover API (HTML/CSS platform feature, no library).

**Storage**: N/A

**Testing**: The repo has an automated test framework (Vitest, e.g. `src/pages/_layouts/terminal-controller.test.ts`), used for the client-side JS exception (the terminal controller); this feature adds no widget-specific tests since it is static markup/CSS with no client-side JS — per the constitution's Principle II, static HTML/CSS is exempt from the TDD requirement. Verification is Stylelint (`npm run lint:css`, already wired to pre-commit/CI) plus manual/visual review across viewport widths, per `quickstart.md`.

**Target Platform**: Static site, evergreen browsers. The Popover API requires a Baseline-2024 browser (Chrome/Edge 114+, Firefox 125+, Safari 17+) — acceptable for a personal portfolio site; no fallback is implemented for older browsers.

**Project Type**: Static web site (single Astro project, no separate frontend/backend split)

**Performance Goals**: No client JS bytes added by this feature; navigation and panel open/close are native browser behaviors (instant, no hydration cost).

**Constraints**: No client-side JavaScript (ADR-0002); all new visual values via design tokens, extending `tokens.css` rather than hardcoding (ADR-0003); mobile-first `min-width` layering using the existing `--bp-md`/`--bp-lg` custom-media tokens, no new breakpoints (ADR-0006); BEM class naming (ADR-0007); widgets live in `src/widgets`, consumed by `src/pages`, built from `src/shared` (ADR-0004).

**Scale/Scope**: Two new widgets (header, footer); one page updated to consume them; a handful of new design tokens.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Check | Result |
|---|---|---|
| I. Static-First Delivery | Pure Astro static markup/CSS, no SSR/runtime introduced | Pass |
| II. CSS-First, JS by Exception | Disclosure panel uses the native Popover API (explicitly named in ADR-0002's approved toolset); zero client-side JavaScript added | Pass |
| III. Token-Driven Styling | All new visual values (panel width, transition duration, stacking order) added as named tokens in `tokens.css`, not hardcoded in component styles | Pass |
| IV. Mobile-First Responsive | Base styles = mobile (full-screen panel behind hamburger); `@media (--bp-md)` = tablet (lateral panel); `@media (--bp-lg)` = desktop (inline nav, no hamburger) — reuses existing tokens, no new breakpoints | Pass |
| V. Layered Architecture (FSD) | New `src/widgets/header/` and `src/widgets/footer/`, consumed by `src/pages/index.astro`, built from `src/shared/tokens` | Pass |
| VI. BEM Naming | `.header`, `.header__nav`, `.header__link`, `.header__menu-button`, `.header__panel`, `.footer`, `.footer__text`, with `--active`/`--current` modifiers | Pass |
| VII. Pragmatic Simplicity (YAGNI) | No abstraction beyond two widgets and the token additions they need; no framework/library added | Pass |

No violations — Complexity Tracking table is not applicable and omitted below.

**Post-Design re-check** (after Phase 1): `research.md` confirmed the Popover
API (an ADR-0002-approved technique, still zero client JS), `data-model.md`
introduces no entities, and the only new surface area is additive tokens in
`tokens.css` (Decision 3) — no principle above is affected. Gate still
passes, unchanged.

## Project Structure

### Documentation (this feature)

```text
specs/001-header-footer-widgets/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md         # Phase 1 output (N/A — no data entities)
├── quickstart.md        # Phase 1 output
└── tasks.md             # Phase 2 output (/speckit-tasks — not created here)
```

No `contracts/` directory: this feature exposes no API, CLI, or other interface consumed by another system or user — it's presentational markup/CSS. Skipped per the plan template's own guidance to omit contracts for purely internal features.

### Source Code (repository root)

```text
src/
├── pages/
│   └── index.astro              # Updated: renders Header + NameBanner + Footer
├── widgets/
│   ├── name-banner/              # Existing, unchanged (kept independent per clarification)
│   │   └── NameBanner.astro
│   ├── header/                   # New
│   │   └── Header.astro
│   └── footer/                   # New
│       └── Footer.astro
└── shared/
    └── tokens/
        └── tokens.css            # Extended: z-index, panel width/transition tokens
```

**Structure Decision**: Follows the existing simplified-FSD layout (ADR-0004) exactly as already established by `name-banner` — no new layers, no new top-level directories. `Header` and `Footer` are new sibling widgets under `src/widgets/`, each a single `.astro` file with a scoped `<style>` block, consuming `src/shared/tokens/tokens.css`. `index.astro` is updated to import and render both around the existing `NameBanner`.

## Complexity Tracking

*Not applicable — no Constitution Check violations.*
