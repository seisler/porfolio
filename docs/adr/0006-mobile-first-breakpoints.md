# Mobile-first responsive strategy and breakpoint tokens

* Status: accepted
* Date: 2026-07-08

## Context and Problem Statement

[ADR-0003](0003-design-tokens-and-stylelint.md) established CSS custom-property tokens for color, spacing, typography, etc., consumed via `var()`. Breakpoints weren't covered there and need their own decision: what order to author responsive CSS in (mobile-first vs. desktop-first), and how breakpoint values stay a single source of truth given that standard CSS custom properties **cannot** be evaluated inside `@media` conditions.

## Decision Drivers

* Consistency with the progressive-enhancement direction already set by [ADR-0002](0002-css-first-architecture.md): start from the simplest case and layer enhancements on top, not the reverse
* Portfolio traffic skews mobile-heavy; the unprefixed base styles should target the common case, not a desktop default that then gets undone
* `min-width` media queries produce a simple, additive cascade; `max-width` tends to require override/undo rules against a desktop-default base
* Breakpoints must still be a single source of truth per ADR-0003 — not magic `px` values scattered per component
* `var()` doesn't resolve inside `@media (min-width: ...)` in standard CSS, so this needs an explicit resolution rather than a silent exception to ADR-0003
* Industry mobile-first guidance (see References) converges on the same core rules: design essential content/functionality for the smallest screen first, layer on animation/grid/enhanced UI only for viewports that can take it, and avoid fixed-pixel layouts that don't adapt

## Considered Options

* Mobile-first, `min-width` queries, breakpoints as raw hardcoded values (no token mechanism)
* Mobile-first, `min-width` queries, breakpoints as build-time tokens via `postcss-custom-media`
* Desktop-first, `max-width` queries
* Container queries only, no viewport breakpoints

## Decision Outcome

Chosen option: "Mobile-first, `min-width` queries, breakpoints as build-time tokens via `postcss-custom-media`".

* Base (unprefixed) CSS targets the smallest supported viewport. Every breakpoint is authored as `@media (min-width: ...)`, layering enhancements on top of the mobile base — never the reverse.
* Breakpoint values stay a single source of truth despite the `var()`-in-media-query limitation: they're defined once via `@custom-media` (through the `postcss-custom-media` plugin, run through Astro/Vite's existing PostCSS pipeline) and consumed as `@media (--bp-md) { ... }`. This is a build-time transform only — nothing is shipped to the client, so it doesn't conflict with [ADR-0002](0002-css-first-architecture.md).
* Stylelint is configured to disallow raw `px` values inside `@media` conditions, mirroring the ADR-0003 rule for every other token category — a hardcoded breakpoint is a lint failure, same as a hardcoded color or spacing value.
* Component-level responsiveness driven by a container's own size (e.g. a card laid out differently in a sidebar vs. the main column) should use container queries, not viewport breakpoints. Container queries are a complement to the mobile-first breakpoint scale, not a replacement for it.
* Default breakpoint scale (defined once as `@custom-media`, extend only if a real layout need arises — don't pre-add tiers speculatively):
  * `--bp-md` → `(min-width: 48rem)` (~768px, tablet)
  * `--bp-lg` → `(min-width: 64rem)` (~1024px, desktop)
* Breakpoint values themselves are expressed in `rem`, not `px`: a `rem`-based media query still tracks the user's browser font-size/zoom setting, whereas `px` breakpoints stay fixed and can trigger layout changes at the wrong physical size for a user who has increased their default font size. This is the one deliberate deviation from the `px` examples in the reference article below.
* Beyond the breakpoints themselves, values *inside* the responsive layout should prefer relative units — `rem`/`em` for typography and spacing (already the norm via the ADR-0003 token scale), `%`/`vw`/`vh` for fluid dimensions — over fixed `px`, so layouts keep adapting between breakpoints rather than only at them.

### Consequences

* Good, because it follows through on the progressive-enhancement direction already set by ADR-0002
* Good, because it closes the one gap ADR-0003 left open — breakpoints are now enforceably tokenized like every other value category
* Good, because `min-width` layering avoids override wars against a desktop-default base
* Bad, because it adds one PostCSS plugin (`postcss-custom-media`) to the build — build-time only, no client runtime cost
* Bad, because contributors need to remember container queries are for component-relative sizing, not a substitute for the breakpoint scale

## Pros and Cons of the Options

### Mobile-first + postcss-custom-media (chosen)

* Good, because it closes the tokenization gap for breakpoints without shipping any JS
* Good, because Stylelint can enforce "no raw values" symmetrically with ADR-0003
* Bad, because it's one more build dependency to maintain

### Mobile-first + raw hardcoded breakpoints

* Good, because zero extra dependency
* Bad, because it directly breaks the "no hardcoded values" principle from ADR-0003 for an entire category of values

### Desktop-first, max-width

* Good, because arguably closer to how a design might first be visualized (desktop mockups)
* Bad, because it fights the progressive-enhancement direction of ADR-0002 — starts from the most complex case and subtracts, rather than starting simple and adding
* Bad, because override cascades tend to need more specificity/undo rules in practice

### Container queries only

* Good, because component-relative, avoids viewport assumptions entirely
* Bad, because it doesn't solve page-level layout decisions (overall grid/nav changes) that genuinely depend on viewport size, not container size
* Bad, because it's a bigger paradigm shift than the project needs right now

## References

* [Mobile-First CSS Design Principles](https://allthingsprogramming.com/mobile-first-css-design-principles/) — source for the smallest-screen-first framing, the tablet/desktop tier convention (~768px / ~1024px), and the fixed-`px`-layout pitfall this ADR avoids by using `rem` for both breakpoints and in-layout values
