# Design system via CSS custom-property tokens, enforced by Stylelint

* Status: accepted
* Date: 2026-07-08

## Context and Problem Statement

[ADR-0002](0002-css-first-architecture.md) commits the project to doing most work in CSS. Without a shared token system, that CSS will drift: inconsistent spacing, colors, and sizes hardcoded per component. We need a design system with a single source of truth for design values, and a way to enforce its use so hardcoded values can't quietly reappear.

## Decision Drivers

* Visual consistency across a growing set of static pages/components
* A single source of truth that's easy to theme (e.g., dark mode via `prefers-color-scheme` or a data attribute)
* Enforcement via tooling, not just code review, since CSS-first means CSS volume will be high
* No preprocessor dependency if it can be avoided, keeping the stack simple

## Considered Options

* Hardcoded values per component (status quo / no system)
* CSS custom properties (design tokens) + Stylelint enforcement
* Sass variables/maps + a linter for Sass
* Utility-first framework (e.g., Tailwind)

## Decision Outcome

Chosen option: "CSS custom properties + Stylelint enforcement". Design tokens (color, spacing scale, typography scale, radii, shadows, z-index, breakpoints) are defined centrally as CSS custom properties and consumed via `var(--token-name)` everywhere. Stylelint is configured to disallow raw hardcoded values (e.g. `px`, hex colors) outside the token definition file itself, so any hardcoded value is a lint failure, not a style-guide suggestion.

### Consequences

* Good, because tokens are a native browser feature — no preprocessor needed
* Good, because custom properties cascade and can be overridden per scope, which makes theming (dark mode, per-section overrides) straightforward
* Good, because Stylelint makes the rule self-enforcing in CI/pre-commit rather than relying on review discipline
* Bad, because the full token scale needs to be defined up front, before components are built against it
* Bad, because the Stylelint rule set needs tuning to avoid false positives (e.g., `0`, `1px` borders, unitless `line-height`, `100%`)

## Pros and Cons of the Options

### Hardcoded values (status quo)

* Good, because zero setup
* Bad, because guaranteed visual drift as the site grows
* Bad, because nothing is enforceable — it's a convention with no teeth

### CSS custom properties + Stylelint

* Good, because native, zero-dependency, and cascade-aware
* Good, because directly enforceable via lint rule
* Bad, because no compile-time computation (e.g., no Sass `map-get` style helpers) — everything resolves at runtime

### Sass variables/maps

* Good, because compile-time checks and helper functions
* Bad, because adds a preprocessor dependency the project doesn't otherwise need
* Bad, because Sass variables aren't runtime-themeable the way custom properties are (no live cascade override for dark mode)

### Utility-first framework (Tailwind)

* Good, because fast to write, consistent by construction
* Bad, because it's an abstraction layer on top of CSS, in tension with a CSS-first, minimal-dependency architecture
* Bad, because utility classes in markup reduce the value of a dedicated token-driven design system

## Related

* Breakpoint tokens are a special case not covered above — `var()` doesn't resolve inside `@media` conditions. See [ADR-0006](0006-mobile-first-breakpoints.md) for how breakpoints stay tokenized despite that limitation.
* Class naming isn't covered above either. See [ADR-0007](0007-bem-naming-convention.md) for the BEM convention Stylelint's `selector-class-pattern` rule will enforce alongside the value rules here.
