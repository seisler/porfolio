# BEM naming convention for CSS classes

* Status: accepted
* Date: 2026-07-09

## Context and Problem Statement

[ADR-0002](0002-css-first-architecture.md) puts the bulk of implementation weight on CSS, and [ADR-0003](0003-design-tokens-and-stylelint.md)/[ADR-0004](0004-simplified-fsd-structure.md) already establish enforceable conventions for values and folder structure. Class naming was never decided explicitly — [src/widgets/name-banner/NameBanner.astro](../../src/widgets/name-banner/NameBanner.astro) already used a block/element pattern (`.name-banner`, `.name-banner__line`, `.name-banner__first`) without it being a deliberate choice. We need a naming convention so that pattern is consistent and enforceable rather than incidental.

## Decision Drivers

* Astro scopes component `<style>` blocks automatically (via `data-astro-cid-*`), so collision-avoidance alone doesn't justify a naming system — the value has to be readability and consistency instead
* `shared` tokens/resets and any genuinely global CSS aren't scoped by Astro, so a naming convention still matters there
* Class names should communicate a component's internal structure (which piece belongs to which block) independent of whichever file happens to define it
* Whatever convention is chosen should be enforceable via Stylelint, consistent with the tooling-enforced approach in ADR-0003, not left as an unverified convention

## Considered Options

* BEM (`.block`, `.block__element`, `.block--modifier`)
* No formal convention — semantic names chosen ad hoc per component
* Utility-first classes (already rejected for the token system in ADR-0003, for the same reasons)

## Decision Outcome

Chosen option: "BEM". Every custom class name follows `.block`, `.block__element`, `.block--modifier`, or `.block__element--modifier`:

* **Block** — a standalone, meaningful component (usually matches the widget/component name, kebab-case: `NameBanner.astro` → `.name-banner`)
* **Element** — a part of a block that has no standalone meaning outside it (`.name-banner__first`)
* **Modifier** — a variant or state of a block or element (`.name-banner--compact`)

This applies inside Astro's scoped `<style>` blocks too, not just global/`shared` CSS — scoping and naming solve different problems (collision vs. readability), and using BEM everywhere keeps components consistent whether or not Astro's own scoping happens to be in play. Enforced via Stylelint's `selector-class-pattern` rule once Stylelint is wired up per ADR-0003.

### Consequences

* Good, because class names are self-documenting about structure regardless of which file/scoping mechanism is involved
* Good, because it's enforceable by the same linter already enforcing tokens (ADR-0003), not just a documented convention
* Good, because modifiers give a standard, CSS-only way to express variants, consistent with ADR-0002 (no JS-driven class logic needed beyond applying a modifier class)
* Bad, because BEM class names are verbose compared to shorter ad hoc names
* Bad, because Astro's own scoping already solves collisions, so BEM is "extra" ceremony for components that will only ever be styled in one scoped file — accepted anyway for consistency across scoped and unscoped CSS

## Pros and Cons of the Options

### BEM (chosen)

* Good, because it's a well-known, well-documented convention — no onboarding cost
* Good, because block/element/modifier maps cleanly onto how components are already being built
* Bad, because naming can get long for deeply nested elements

### No formal convention

* Good, because zero ceremony
* Bad, because consistency depends entirely on memory/review, not something Stylelint can check
* Bad, because `shared`-layer CSS (unscoped) has no collision protection without either scoping or a naming discipline

### Utility-first classes

* Good, because fast to write
* Bad, because already rejected in ADR-0003 for being in tension with a token-driven, CSS-first design system
