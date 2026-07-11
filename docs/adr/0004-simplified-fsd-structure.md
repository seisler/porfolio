# Simplified Feature-Sliced Design structure: pages, widgets, shared

* Status: accepted
* Date: 2026-07-09

## Context and Problem Statement

We want a folder/component organization strategy that scales reasonably as the portfolio grows, without imposing more ceremony than a small, mostly-static, content-driven site needs. Feature-Sliced Design (FSD) is a reasonable reference standard, but its full layer set (`app`, `processes`, `pages`, `widgets`, `features`, `entities`, `shared`) assumes a domain model and interactive feature set this project doesn't have.

## Decision Drivers

* No real domain model yet (a portfolio has no `Order`, `User`, etc. with business rules) — an `entities` layer has nothing to hold
* No distinct multi-step interactive flows yet — a `features` layer has nothing to hold either
* Astro's file-based `src/pages` already **is** the routes/app layer; no need to reinvent it
* Still want FSD's real value: one-directional imports (nothing lower imports from something higher) and a clear public API per slice
* Low ceremony: should be easy to explain to a future contributor in one paragraph

## Considered Options

* Full FSD (`app`, `processes`, `pages`, `widgets`, `features`, `entities`, `shared`)
* Simplified FSD: `pages` (Astro-native routing) + `widgets` + `shared` only
* Flat/ad-hoc structure: `components/`, `layouts/`, no enforced layers or import direction
* Atomic Design (`atoms`/`molecules`/`organisms`/`templates`/`pages`)

## Decision Outcome

Chosen option: "Simplified FSD" —

* `src/pages` — Astro's native file-based routing layer. Maps 1:1 to FSD's `pages` concept; no separate `app` layer needed since Astro's config/entry already fills that role. Page shells/templates (layouts) also live here, under `src/pages/_layouts/` — Astro excludes any `_`-prefixed path from routing, so this stays out of the route tree while remaining part of the `pages` layer. Layouts compose `widgets`/`shared` to assemble the chrome every route shares (nav, banners, footer); placing them in `pages` rather than `shared` keeps that composition legal under the import-direction rule below, since `shared` may not import from `widgets`.
* `src/widgets` — composed, reusable page sections built from `shared` (e.g. header, footer, project grid, hero).
* `src/shared` — design-system primitives: tokens ([ADR-0003](0003-design-tokens-and-stylelint.md)), base components (button, badge, icon), and utilities. Nothing here composes `widgets`.
* `entities` and `features` are **not** created. If the site later grows real domain logic (e.g., a blog with tags and relations) or a genuine multi-step interactive flow (e.g., a contact form with client validation), introduce the relevant layer at that point rather than up front.
* Import direction is still enforced: `pages → widgets → shared`. Nothing in `shared` may import from `widgets`, nothing in `widgets` may import from `pages`. Layouts under `src/pages/_layouts/` are part of the `pages` layer, so their widget imports are ordinary top-down imports, not an exception to this rule.
* Content data (`src/content`, Astro content collections) sits outside this UI layering — it's data, not UI, so it isn't a "layer" in the FSD sense.

Confirmed in practice by [src/widgets/name-banner/NameBanner.astro](../../src/widgets/name-banner/NameBanner.astro), which consumes [src/shared/tokens/tokens.css](../../src/shared/tokens/tokens.css), and by [src/pages/_layouts/BaseLayout.astro](../../src/pages/_layouts/BaseLayout.astro), which composes the `Header`, `NameBanner`, and `Footer` widgets as a `pages`-layer layout.

### Consequences

* Good, because it matches the actual complexity of the project today
* Good, because it's easy to extend later by adding `entities`/`features` back in without restructuring what already exists
* Good, because the import-direction discipline (FSD's main practical benefit) is retained even without the full layer set
* Bad, because it deviates from "pure" FSD, so anyone familiar with strict FSD will need this ADR as the reference for the deviation
* Bad, because `widgets` can become a dumping ground without discipline if "is this shared or a widget?" isn't asked consistently

## Pros and Cons of the Options

### Full FSD

* Good, because it's the standard, well-documented version — no explaining a deviation
* Bad, because `entities` and `features` would be empty/near-empty scaffolding with nothing real to justify them yet

### Simplified FSD (chosen)

* Good, because every layer that exists has an actual reason to exist right now
* Bad, because it's a non-standard variant that needs this document to be understood

### Flat/ad-hoc structure

* Good, because maximally simple to start
* Bad, because there's no import-direction discipline, so coupling between pages and low-level pieces will grow unchecked

### Atomic Design

* Good, because also well-known and lightweight
* Bad, because it organizes by UI complexity (atom/molecule/organism), not by ownership/import-direction — doesn't give the same "what can import what" guarantee FSD does
