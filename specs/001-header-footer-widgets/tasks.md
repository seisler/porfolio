---

description: "Task list for Header and Footer Widgets"

---

# Tasks: Header and Footer Widgets

**Input**: Design documents from `/specs/001-header-footer-widgets/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md (N/A — no entities), quickstart.md

**Tests**: Not requested. No automated test framework is configured in this repo (plan.md Technical Context); verification is Stylelint plus manual/visual review per quickstart.md, covered in Phase 6 (Polish).

**Organization**: Tasks are grouped by user story (spec.md) to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)
- Paths are relative to the repository root

## Path Conventions

Single Astro project (plan.md Project Structure): `src/pages/`, `src/widgets/`, `src/shared/tokens/`.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create the directories the new widgets live in

- [X] T001 Create `src/widgets/header/` and `src/widgets/footer/` directories per plan.md Project Structure

**Checkpoint**: Directories exist — foundational token work can begin.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Design tokens shared by both widgets, per research.md Decision 3 and ADR-0003 (no hardcoded values). All user stories depend on these.

**⚠️ CRITICAL**: No widget markup/styles may reference a token that doesn't exist yet — this phase MUST complete first.

- [X] T002 Add a z-index/stacking token (e.g. `--z-panel`) to `src/shared/tokens/tokens.css` for the popover panel's top-layer stacking (research.md Decision 3)
- [X] T003 Add a transition-duration token (e.g. `--motion-duration-panel`) to `src/shared/tokens/tokens.css` for the slide-in/out animation (research.md Decision 3)
- [X] T004 Add a panel-width token (e.g. `--size-panel-width`) to `src/shared/tokens/tokens.css` for the tablet lateral panel's partial width (research.md Decision 3)

**Checkpoint**: Tokens exist in `tokens.css` — User Story 1, 2, and 3 widget work can now begin.

---

## Phase 3: User Story 1 - Navigate the site with a mouse or touch (Priority: P1) 🎯 MVP

**Goal**: A header widget on every page with four labeled, clickable nav links (Home, Job History, Projects, Contact), with the current page's link visually distinguished.

**Independent Test**: Load the site, confirm a header with four visible labeled links is present and each is clickable/tappable, independent of any other widget on the page.

### Implementation for User Story 1

- [X] T005 [US1] Create `src/widgets/header/Header.astro` with `.header`, `.header__nav`, `.header__link` BEM markup (ADR-0007): a `<nav>` containing four `<a>` links labeled Home (`/`), Job History (`/job-history`), Projects (`/projects`), and Contact (`/contact`)
- [X] T006 [US1] In `src/widgets/header/Header.astro`, compare `Astro.url.pathname` against each link's `href` and apply `aria-current="page"` plus a `.header__link--active` modifier class to the matching link (research.md Decision 2, FR-003)
- [X] T007 [US1] Add scoped `<style>` block in `src/widgets/header/Header.astro` styling `.header`, `.header__nav`, `.header__link`, and `.header__link--active` using only tokens from `src/shared/tokens/tokens.css` (ADR-0003); desktop base treatment shows links inline (mobile-first note: full inline-only styling is refined in Phase 5/US3 for narrower widths)
- [X] T008 [US1] Update `src/pages/index.astro` to import and render `Header` from `src/widgets/header/Header.astro`, placed before `NameBanner` in `<body>`, keeping `NameBanner` unchanged and independently positioned (FR-007)

**Checkpoint**: User Story 1 is fully functional and testable independently — header with four working, active-state-aware links renders on the page at desktop width.

---

## Phase 4: User Story 2 - See ownership/copyright information (Priority: P2)

**Goal**: A footer widget on every page showing "© <current year> Mark Schenzle | All Rights Reserved", with the year computed at build time.

**Independent Test**: Load any page and confirm a footer is present at the bottom showing the copyright line, independent of header/nav state.

### Implementation for User Story 2

- [X] T009 [P] [US2] Create `src/widgets/footer/Footer.astro` with `.footer`, `.footer__text` BEM markup (ADR-0007), computing the current year at build time (e.g. `new Date().getFullYear()` in the component frontmatter) and rendering "© {year} Mark Schenzle | All Rights Reserved" (FR-004, assumption on build-time year)
- [X] T010 [P] [US2] Add scoped `<style>` block in `src/widgets/footer/Footer.astro` styling `.footer` and `.footer__text` using only tokens from `src/shared/tokens/tokens.css` (ADR-0003)
- [X] T011 [US2] Update `src/pages/index.astro` to import and render `Footer` from `src/widgets/footer/Footer.astro`, placed after `NameBanner` in `<body>`
- [X] T012 [US2] In `src/pages/index.astro`, adjust the page `<body>` layout styles (currently centered flex/`min-height: 100dvh`) so the footer stays pinned to the bottom of the viewport or the end of content, whichever is lower, without floating mid-page on short pages (Edge Cases, FR-005)

**Checkpoint**: User Stories 1 AND 2 both work independently — header and footer both render correctly on the page.

---

## Phase 5: User Story 3 - Open the navbar via a menu button on tablet and mobile (Priority: P3)

**Goal**: On tablet and mobile viewports, the inline nav links are replaced by a hamburger menu button that reveals a right-edge slide-in panel (lateral on tablet, full-screen on mobile) containing all four links, implemented with the native Popover API (no client JS).

**Independent Test**: Load the site at tablet and mobile viewport widths, confirm a menu button is visible, tapping it reveals all four nav links in a panel, and each remains clickable/tappable.

### Implementation for User Story 3

- [X] T013 [US3] In `src/widgets/header/Header.astro`, add a `.header__menu-button` `<button>` with `popovertarget` pointing at the nav panel, and wrap/mark the nav links container as `.header__panel` with the `popover` attribute (research.md Decision 1)
- [X] T014 [US3] In `src/widgets/header/Header.astro`'s scoped `<style>`, add base (mobile) styles: `.header__menu-button` visible, `.header__panel` as a full-screen popover sliding in from the right edge using `transition-behavior: allow-discrete` + `@starting-style` and the `--motion-duration-panel`/`--z-panel` tokens from Phase 2 (FR-008, FR-009, FR-010)
- [X] T015 [US3] In `src/widgets/header/Header.astro`'s scoped `<style>`, add `@media (--bp-md)` styles: `.header__panel` becomes a lateral (partial-width, `--size-panel-width` token) panel instead of full-screen, menu button remains visible (FR-009)
- [X] T016 [US3] In `src/widgets/header/Header.astro`'s scoped `<style>`, add `@media (--bp-lg)` styles: hide `.header__menu-button`, neutralize `.header__panel`'s popover display/position/inset so it renders as a normal static inline flex row of links (research.md Decision 1's "Responsive neutralization at desktop"), matching User Story 1's desktop inline treatment (FR-011)

**Checkpoint**: All user stories are independently functional — inline desktop nav, footer, and tablet/mobile hamburger+panel all work, with correct treatment at each breakpoint and on resize/rotate across breakpoints (Edge Cases).

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Verification across all three stories together

- [X] T017 Run `npm run lint:css` and fix any Stylelint violations across `src/widgets/header/Header.astro`, `src/widgets/footer/Footer.astro`, and `src/shared/tokens/tokens.css`
- [X] T018 Run the full `quickstart.md` validation checklist (desktop nav, footer, tablet panel, mobile panel, breakpoint transition) against `astro dev --background`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Setup (T001) — BLOCKS all user stories (widget styles need the tokens)
- **User Story 1 (Phase 3)**: Depends on Foundational (Phase 2) — no dependency on other stories
- **User Story 2 (Phase 4)**: Depends on Foundational (Phase 2) — independent of US1's files, but T011/T012 touch `index.astro` alongside T008, so sequence T008 before T011 if both are in flight
- **User Story 3 (Phase 5)**: Depends on Foundational (Phase 2) AND on `Header.astro` existing (T005–T008 from US1) — it extends the same file
- **Polish (Phase 6)**: Depends on all three user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational — no dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational — independently testable; only converges with US1 in `index.astro` (T008, T011)
- **User Story 3 (P3)**: Can start after Foundational, but builds directly on top of `Header.astro` from US1 (same file, additive markup/styles) — treat as sequential after US1 in practice even though the spec frames it as independently valuable

### Within Each User Story

- Markup before styles (styles reference the BEM classes markup introduces)
- Widget file complete before wiring it into `index.astro`
- Mobile-first base styles before `@media (--bp-md)` before `@media (--bp-lg)` (ADR-0006), per T014 → T015 → T016

### Parallel Opportunities

- T002, T003, T004 (Foundational tokens) can run in parallel — same file (`tokens.css`) but non-overlapping token additions; sequence if conflict-averse
- T009 and T010 (US2, `Footer.astro` markup + styles) can run in parallel with US1's Phase 3 tasks once Foundational is done, since they're different files
- T017 is independent of T018 and can run in parallel

---

## Parallel Example: Foundational + User Story 2

```bash
# After Phase 1 (T001), launch foundational token tasks together:
Task: "Add z-index token to src/shared/tokens/tokens.css"
Task: "Add transition-duration token to src/shared/tokens/tokens.css"
Task: "Add panel-width token to src/shared/tokens/tokens.css"

# Once Foundational is done, User Story 2 can run fully in parallel with User Story 1:
Task: "Create Footer.astro markup in src/widgets/footer/Footer.astro"
Task: "Add Footer.astro scoped styles in src/widgets/footer/Footer.astro"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001)
2. Complete Phase 2: Foundational (T002–T004) — CRITICAL, blocks all stories
3. Complete Phase 3: User Story 1 (T005–T008)
4. **STOP and VALIDATE**: Load the site at desktop width, confirm four working nav links with correct active-state
5. Deploy/demo if ready — this alone satisfies FR-001–FR-003, FR-006, FR-007

### Incremental Delivery

1. Setup + Foundational → Foundation ready
2. Add User Story 1 → validate independently → MVP
3. Add User Story 2 → validate independently (footer renders, pinned to bottom)
4. Add User Story 3 → validate independently (hamburger + panel at tablet/mobile widths)
5. Phase 6 Polish → lint + full quickstart.md pass across all stories together

---

## Notes

- [P] tasks touch different files, or non-conflicting regions of the same token file
- [Story] label maps each task to its user story for traceability
- No test tasks included — tests were not requested and none are configured in this repo (plan.md)
- Commit after each task or logical group, following `docs/commit-convention.md`
- Stop at any checkpoint to validate a story independently before proceeding
- User Story 3 is additive to `Header.astro` from User Story 1 — plan for US1 to land first in practice despite being framed as independently valuable in spec.md
