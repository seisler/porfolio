# CSS-first architecture: JavaScript is forbidden unless explicitly requested

* Status: accepted
* Date: 2026-07-08

## Context and Problem Statement

[ADR-0001](0001-astro-as-framework.md) chose Astro specifically because it ships zero JS by default. That choice is only meaningful if implementation follows through on it. We need an explicit rule for how functionality and effects (menus, accordions, transitions, hover/focus states, etc.) get built, so "zero JS" doesn't erode component by component.

## Decision Drivers

* Preserve the performance/zero-JS goal behind choosing Astro
* Avoid hydration cost and client-side maintenance burden
* Modern CSS already covers most of what used to require JS (`:has()`, native `<details>`/`<dialog>`, scroll-driven animations, `@starting-style`, container queries, the Popover API, View Transitions)
* Resilience: CSS-driven behavior keeps working if JS fails to load or is disabled

## Considered Options

* JS-first: default to framework components with client hydration for interactivity
* Mixed, no explicit rule: whichever is convenient per case
* CSS-first / progressive enhancement: HTML/CSS is the default and required first attempt; JS is forbidden unless explicitly requested

## Decision Outcome

Chosen option: "CSS-first / progressive enhancement", because it directly protects the reason Astro was chosen. Any functionality or visual effect must first be attempted in HTML/CSS. JavaScript is off the table by default and may only be introduced when explicitly requested for a specific, named case — it is never a default implementation choice. If that exception is ever exercised (e.g. an Astro island with client-hydrated JS), the JS must be test-driven — write the failing test first. Static HTML/CSS is not held to that requirement; it's covered by Stylelint and manual review instead.

### Consequences

* Good, because the JS bundle stays at zero for the vast majority of the site
* Good, because the site keeps working with JS disabled or failing to load
* Good, because it forces a deliberate, reviewable decision every time JS is considered
* Bad, because some effects genuinely have no CSS-only equivalent yet and will need a case-by-case exception request
* Bad, because it requires staying current on modern CSS capabilities (browser support checks before ruling something "impossible in CSS")

## Pros and Cons of the Options

### JS-first

* Good, because most familiar pattern for many developers
* Bad, because it directly undermines the zero-JS goal from ADR-0001
* Bad, because it introduces hydration cost and bundle size by default

### Mixed, no explicit rule

* Good, because flexible, no friction
* Bad, because JS usage creeps in inconsistently without anyone deciding it should
* Bad, because it gives no clear standard to review against

### CSS-first / progressive enhancement

* Good, because it's the only option that structurally enforces the ADR-0001 goal
* Good, because it's consistent with an explicit, auditable exception process
* Bad, because occasionally slower to implement when a CSS-only path takes research to find
