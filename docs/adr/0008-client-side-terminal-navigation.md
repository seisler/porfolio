# Client-side terminal navigation: accumulating scrollback and a writable prompt

* Status: accepted
* Date: 2026-07-11

## Context and Problem Statement

The site's "terminal" conceit (ADR unrelated, but established via `NameBanner`/`BaseLayout`/`TerminalLog`) renders each page as the output of a command (`npm run home`, `npm run job-experience`, ...) followed by a fresh prompt. The user asked for two things beyond what CSS/SSR can do: (1) clicking a nav link should feel like *running* that page's command rather than just navigating to it, with previous output staying on screen instead of being replaced; (2) the trailing prompt should be genuinely typable, so a visitor can type `npm run job-experience` themselves.

Both require the terminal panel to persist and grow across what the user experiences as "running more commands" — a real full-page navigation (even a smooth one, e.g. Astro's View Transitions) replaces the document with the destination page's own server-rendered markup, which would erase everything accumulated so far. That's incompatible with ADR-0002's default of zero client-side JS, but ADR-0002 itself carves out an explicit exception process for exactly this situation: a named, deliberate case, test-driven.

## Decision Drivers

* Prior commands' output must stay visible as new ones run (an accumulating scrollback), which a real navigation cannot do
* Every route must still work as a real, bookmarkable, server-rendered page with JS disabled — this is additive, not a replacement for the existing per-page rendering
* ADR-0002 requires any JS exception to be scoped, named, and test-driven
* No UI framework needed — the interaction (read input, match a command, mutate the DOM, update history) doesn't need component state/reactivity machinery

## Considered Options

* Real navigation only (reject the "no erase" requirement, keep zero JS)
* Astro View Transitions (`<ClientRouter />`) for smoother real navigations
* A small vanilla-JS controller that intercepts nav clicks and prompt submission, appends to a persistent DOM container, and drives `history.pushState`/`popstate` itself
* A full client-side framework/SPA router

## Decision Outcome

Chosen option: a small vanilla-JS controller (`src/pages/_layouts/terminal-controller.ts`, ~200 lines, no dependencies), wired up once in `BaseLayout.astro`. It:

* Reads a per-route registry (`{ command, route, title, lines }`) serialized from the `commands` content collection ([src/content.config.ts](../../src/content.config.ts)) into an inline JSON script tag — no client-side fetching
* Hydrates the trailing `.resume-log__prompt` (rendered statically by [TerminalLog.astro](../../src/widgets/terminal-log/TerminalLog.astro)) into a real `<input>`, matching typed text against the registry on Enter
* Intercepts clicks on `.header__link` elements whose `href` matches a registered route, running the same append logic instead of a real navigation; routes not yet in the registry (e.g. `/contact`) are left to navigate normally — this is how the exception stays scoped, not blanket
* Tracks the accumulated route sequence in `history.state` via `pushState`, and rebuilds the scrollback from that state on `popstate` (back/forward), rather than losing it to a real reload
* Syncs the header's active-link state and `document.title` on every virtual navigation, since nothing else re-renders them
* Announces each run via an `aria-live="polite"` region, since content now changes without a page load

Because `TerminalLog.astro`'s output must be mutable by both server-rendered HTML and this controller's `document.createElement` calls, its `<style>` block is `is:global` rather than Astro-scoped — scoped CSS relies on a `data-astro-cid-*` attribute that only server-rendered elements get.

Test-driven per ADR-0002: `terminal-controller.test.ts` and `terminal-controller.popstate.test.ts` (Vitest + jsdom, the project's first test setup) cover command matching, the "command not found" path, nav-link interception (including the un-registered-route passthrough), history pushes, and popstate reconstruction.

### Consequences

* Good, because the interactive experience works exactly as requested — no erased scrollback, a genuinely typable prompt — without adopting a framework
* Good, because every route still renders fully server-side; the controller is additive progressive enhancement, not a requirement for the site to function
* Good, because the registry is a single source of truth (content collection) shared by SSR pages and the client controller — no duplicated content
* Bad, because this is now bespoke history-management code (not a well-trodden library), so future route types (e.g. dynamic content, pagination) will need deliberate extension of `rebuild()`/the registry schema
* Bad, because it's the project's first test suite — Vitest/jsdom is now a dependency that has to be kept working alongside the Astro/Stylelint toolchain

## Pros and Cons of the Options

### Real navigation only

* Good, because zero JS, no exception needed
* Bad, because it does not satisfy the actual request (no accumulating scrollback, no writable prompt)

### Astro View Transitions

* Good, because built into Astro, minimal code
* Bad, because it still swaps the document body with the destination page's markup — doesn't merge/accumulate content, so the core requirement (prior output stays visible) still isn't met without additional custom logic on top

### Vanilla-JS controller (chosen)

* Good, because it's the minimum necessary to satisfy both requirements
* Good, because no framework/hydration cost
* Bad, because history reconstruction and DOM mutation are hand-rolled and need their own test coverage to stay correct

### Full SPA router/framework

* Good, because this exact interaction pattern is well-trodden in that world
* Bad, because it's a large capability/dependency increase for one feature on an otherwise static, mostly-content site
