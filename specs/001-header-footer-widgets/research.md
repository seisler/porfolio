# Research: Header and Footer Widgets

## Decision 1: Disclosure mechanism for the mobile/tablet nav panel

**Decision**: Use the native **Popover API** (`popover` attribute + `popovertarget` button), not a `:checked`-driven checkbox hack.

**Rationale**:
- ADR-0002 explicitly names the Popover API as part of the project's approved CSS-first toolset — this is a sanctioned technique, not a workaround.
- Native top-layer rendering means no manual `z-index` stacking against page content is needed for the open panel itself (still need a token for it — see Decision 3).
- Built-in light-dismiss (click outside closes the panel) and Escape-to-close come for free, with no extra markup/CSS to reproduce that behavior.
- The slide-in transform animation is achievable with `transition-behavior: allow-discrete` + `@starting-style`, both plain CSS.
- **Responsive neutralization at desktop**: a `[popover]` element only receives `display: none` from the User-Agent stylesheet while closed; that UA rule is overridable by author CSS. At `--bp-lg`, the plan is to override the panel's `display`/`position`/`inset` to render it as a normal static, inline flex row (and hide the hamburger button), which turns off the popover's visual "hidden-until-open" behavior without needing two copies of the nav markup. This is a documented, intentional pattern for responsive popover-based menus, not a hack fighting the platform.

**Alternatives considered**:
- **`:checked`/`:has()` checkbox hack** (hidden checkbox + label-as-button + sibling selector reveal): works without the Popover API, and has broader legacy browser support, but requires manually implementing light-dismiss (extra full-screen `<label>` overlay) and manual `z-index` bookkeeping, and CSS gets more convoluted for the same slide animation. Rejected — more CSS ceremony for a technique the project's own ADR already steers away from in favor of Popover API where applicable.
- **Client-side JS toggle**: rejected outright — forbidden by ADR-0002 unless explicitly requested, which it was not.

## Decision 2: Active-link indication

**Decision**: Compare the current route against each nav link's `href` at build/request time inside the `.astro` component (`Astro.url.pathname`), and apply an `aria-current="page"` attribute plus a `.header__link--active` BEM modifier class to the matching link.

**Rationale**: This runs at Astro's build/server-render step, not in the browser — it introduces no client-side JavaScript, satisfying ADR-0002, while giving both a visual (CSS modifier) and assistive-technology (`aria-current`) signal of the current page, addressing FR-003 and the accessibility gap noted as low-impact/deferred during `/speckit-clarify`.

**Alternatives considered**: A client-side JS check against `window.location` — rejected as unnecessary; Astro already knows the current route at render time.

## Decision 3: New design tokens needed

**Decision**: Extend `src/shared/tokens/tokens.css` with a small set of new tokens rather than hardcoding any new numeric/visual value in the widget styles, per ADR-0003:

- A z-index/stacking token for the panel (the existing token file has no z-index scale yet).
- A transition-duration token for the slide-in/out animation (no motion-duration token exists yet).
- A panel-width token for the tablet lateral panel's partial width.

**Rationale**: ADR-0003 requires all design values to route through tokens; these three categories are simply not yet represented in `tokens.css` because no prior widget needed them. Adding them is additive (no existing token is changed), consistent with "the token files themselves are the single source of truth."

**Alternatives considered**: Hardcoding these values directly in `Header.astro`'s scoped styles — rejected, direct ADR-0003 violation.

## Decision 4: Breakpoint mapping

**Decision**: Reuse the existing two breakpoint tokens exactly as defined — no new breakpoint introduced:

- Base (no media query, mobile): hamburger button + full-screen popover panel.
- `@media (--bp-md)` (≥48rem, tablet): hamburger button + lateral (partial-width) popover panel.
- `@media (--bp-lg)` (≥64rem, desktop): hamburger button hidden; nav links shown inline; popover panel neutralized (see Decision 1).

**Rationale**: The spec's Assumptions section already commits to reusing `--bp-md`/`--bp-lg` (ADR-0006) rather than introducing new thresholds, and the existing two-token scale maps cleanly onto the spec's three-tier (mobile/tablet/desktop) requirement with no gap.
