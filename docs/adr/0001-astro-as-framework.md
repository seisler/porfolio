# Use Astro as the site framework

* Status: accepted
* Date: 2026-07-08

## Context and Problem Statement

The portfolio is 99–100% static content (projects, about, contact) that changes rarely and has almost no per-request interactivity. We need a framework/tooling choice that reflects that reality instead of defaulting to a JS-heavy SPA stack.

## Decision Drivers

* Performance budget: fast TTFB/LCP, minimal-to-zero JS shipped to the client
* SEO: fully rendered HTML, no client-side rendering dependency
* Content model: structured, mostly static content (projects, writing)
* Room to add an interactive island later without switching frameworks
* Component-based authoring (reuse, composition) is still desired

## Considered Options

* Astro
* Next.js / Nuxt (SSR/SPA-first frameworks)
* Plain static HTML/CSS, no build tooling
* 11ty (static site generator, no component islands)

## Decision Outcome

Chosen option: "Astro", because it ships zero JS per component by default, supports an islands architecture for the rare case interactivity is explicitly needed, has first-class content collections for structured content, and gives file-based routing out of the box — all without requiring a client-side framework runtime.

### Consequences

* Good, because the default output is static HTML/CSS with no JS bundle to justify
* Good, because content collections give type-safe, structured content without a headless CMS
* Good, because islands remain available if an explicit, justified interactive need arises
* Bad, because the team must actively resist reaching for React/Vue habits Astro still allows
* Bad, because some contributors may be unfamiliar with Astro's `.astro` component syntax

## Pros and Cons of the Options

### Astro

* Good, because zero JS by default per component
* Good, because native content collections and file-based routing
* Good, because framework-agnostic islands if JS is ever justified
* Bad, because smaller ecosystem/community than Next.js

### Next.js / Nuxt

* Good, because large ecosystem, well-known patterns
* Bad, because JS-first by default (client runtime, hydration) — fights the static-site goal
* Bad, because far more capability than this project needs

### Plain static HTML/CSS

* Good, because zero tooling, zero JS is structurally guaranteed
* Bad, because no component reuse, no content collections, manual repetition across pages

### 11ty

* Good, because static-first, minimal JS by default
* Bad, because no islands architecture if interactivity is ever needed
* Bad, because templating (Nunjucks/Liquid) is less ergonomic than component syntax for this team
