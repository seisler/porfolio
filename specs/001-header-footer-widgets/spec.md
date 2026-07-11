# Feature Specification: Header and Footer Widgets

**Feature Branch**: `feature/EKQKaWCY/header-and-footer-widgets`

**Created**: 2026-07-10

**Status**: Draft

**Input**: User description: "Build a header widget that serves as the site's navbar (Home, Job History, Projects, Contact) — providing non-keyboard/mouse access to navigation on this otherwise terminal-driven portfolio — and a footer widget showing the copyright line, both following the project's CSS-first, token-driven, BEM, FSD-widgets conventions."

## Clarifications

### Session 2026-07-10

- Q: Should the existing NameBanner (ASCII name art currently on the homepage) be incorporated into/positioned alongside the new header, or stay fully independent of it? → A: Keep independent — NameBanner stays exactly as-is on the homepage; the header is a separate, new element.
- Q: On narrow (mobile) viewports, how should the 4 nav links behave, given no client JS is allowed? → A: A menu (hamburger) button opens a panel: lateral (sliding in from the right) on tablet widths, full-screen (also entering from the right) on mobile widths.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Navigate the site with a mouse or touch (Priority: P1)

A visitor lands on the portfolio and wants to reach a specific section (Home,
Job History, Projects, Contact) without relying on any keyboard-only
interaction the site may otherwise favor. They look for a conventional navbar
and use it the way they would on any website.

**Why this priority**: This is the entire point of the ticket — giving
mouse/touch visitors a real way in. Without it, the feature delivers nothing.

**Independent Test**: Load the site, confirm a header with four visible
labeled links (Home, Job History, Projects, Contact) is present and each is
clickable/tappable, independent of any other widget on the page.

**Acceptance Scenarios**:

1. **Given** a visitor on any page of the site, **When** they look at the top
   of the page, **Then** they see a header containing links labeled Home, Job
   History, Projects, and Contact.
2. **Given** a visitor viewing the header, **When** they click or tap a nav
   link, **Then** the browser navigates to that link's route.
3. **Given** a visitor on a page corresponding to one of the nav links,
   **When** they view the header, **Then** the link for their current page is
   visually distinguished from the others.

---

### User Story 2 - See ownership/copyright information (Priority: P2)

A visitor scrolls to the bottom of a page and wants to confirm who owns the
site and that content is protected.

**Why this priority**: Standard, low-risk expectation-setting; independent of
navigation and can ship even if nav links change later.

**Independent Test**: Load any page and confirm a footer is present at the
bottom showing the copyright line, independent of header/nav state.

**Acceptance Scenarios**:

1. **Given** a visitor on any page, **When** they reach the bottom, **Then**
   they see a footer reading "© <current year> Mark Schenzle | All Rights
   Reserved".

---

### User Story 3 - Open the navbar via a menu button on tablet and mobile (Priority: P3)

A visitor on a tablet or phone-sized viewport wants the same navigation
access as a desktop visitor. At these widths the four links move behind a
menu (hamburger) button, which reveals them in a sliding panel, without
requiring JavaScript to function.

**Why this priority**: Extends P1 to smaller viewports; independently
testable/valuable on top of the desktop nav, but the site's core desktop
navigation (User Story 1) is usable without it if deferred.

**Independent Test**: Load the site at tablet and mobile viewport widths,
confirm a menu button is visible, tapping it reveals all four nav links in a
panel, and each remains clickable/tappable.

**Acceptance Scenarios**:

1. **Given** a visitor on a tablet-width viewport, **When** they tap the menu
   button, **Then** a panel slides in from the right edge of the screen,
   covering part of the viewport (lateral), showing all four nav links.
2. **Given** a visitor on a mobile-width viewport, **When** they tap the menu
   button, **Then** a panel slides in from the right edge covering the full
   screen, showing all four nav links.
3. **Given** the panel is open, **When** the visitor taps a nav link,
   **Then** the panel closes and the browser navigates to that link's route.
4. **Given** a visitor on a desktop-width viewport, **When** they view the
   header, **Then** all four nav links are shown inline and no menu button
   is present (per User Story 1).

---

### Edge Cases

- What happens when a visitor clicks Job History or Projects? Both routes
  (`/job-experience` and `/projects`) now have pages, so these render as
  normal links and navigation succeeds — no 404. Contact's page
  (`/contact`) also exists as a placeholder, but the header does not
  currently include a Contact nav link (dropped pending its content); it
  will be reinstated once that work lands.
- What happens when the page content is shorter than the viewport? The footer
  must not float mid-page; it stays pinned to the bottom of the viewport or
  the end of content, whichever is lower.
- What happens at very narrow viewports (e.g. 320px)? The full-screen panel's
  four labels must remain legible and tappable without clipping or overlap
  (see User Story 3).
- What happens if the viewport is resized/rotated across the tablet/mobile/
  desktop breakpoints while the panel is open or closed? The header MUST
  present the correct treatment (inline links, tablet lateral panel, or
  mobile full-screen panel) for the current width without a page reload.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The site MUST display a header, present on every page,
  containing navigation links labeled Home, Job History, and Projects.
  Contact is intentionally omitted for now (dropped pending its content —
  see Edge Cases) and will be reinstated as a fourth link once that page's
  content lands.
- **FR-002**: Each nav link MUST be a real, directly clickable/tappable link
  (mouse, touch, or keyboard) — not something that requires a
  keyboard-only/command-driven interaction to reach.
- **FR-003**: The nav link corresponding to the page the visitor is currently
  on MUST be visually distinguishable from the other links.
- **FR-004**: The site MUST display a footer, present on every page, showing
  the text "© <current year> Mark Schenzle | All Rights Reserved".
- **FR-005**: The header and footer MUST remain fully usable (all links
  reachable and operable, footer text fully legible) from the smallest
  supported mobile viewport up through desktop widths, whether links are
  shown inline or behind a menu control.
- **FR-006**: The Job History and Projects links MUST point to their
  intended routes, `/job-experience` and `/projects`, which now exist as
  real pages. (Contact's route, `/contact`, also exists as a placeholder,
  but Contact is not currently a header link — see FR-001 and Edge Cases.)
- **FR-007**: The header MUST be a distinct widget from the existing
  NameBanner; NameBanner remains unchanged and independently positioned, not
  merged into the header.
- **FR-008**: On tablet and mobile viewport widths, the header MUST present a
  menu (hamburger) button in place of the inline links; activating it MUST
  reveal all four nav links in a panel.
- **FR-009**: The panel MUST enter from the right edge of the screen on both
  tablet and mobile widths: as a lateral panel (partial width) on tablet, and
  full-screen on mobile.
- **FR-010**: The menu/panel open-close interaction MUST be achieved without
  client-side JavaScript, per ADR-0002 (e.g. via a native HTML disclosure
  mechanism such as the Popover API or a `:checked`/`:has()`-driven toggle).
- **FR-011**: On desktop viewport widths, the four nav links MUST remain
  shown inline with no menu button present (per User Story 1).

### Key Entities

*(Not applicable — this feature introduces no data entities; it is presentational/navigational.)*

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A first-time visitor can locate and reach any of the four
  listed sections (Home, Job History, Projects, Contact) using only a mouse
  or touch, without discovering or using any keyboard-driven navigation.
- **SC-002**: The header and footer render correctly (no overlapping or
  clipped content) across mobile, tablet, and desktop viewport widths.
- **SC-003**: 100% of pages on the site display the same header and footer,
  with the currently active page indicated in the header.
- **SC-004**: The footer's displayed year reflects the current year as of the
  site's most recent build; static deployments must be rebuilt at least
  annually to keep the year current.
- **SC-005**: On tablet and mobile viewports, a visitor can reach any of the
  four nav links within two taps (open the menu, then tap the link).

## Assumptions

- The header and footer are global layout elements meant to appear on every
  page, not just the current single `index.astro` page — future pages reuse
  the same widgets.
- The footer's year is computed at build time (not hand-typed) so it never
  goes stale; this is build-time templating, not client-side JavaScript, so
  it does not conflict with the project's no-client-JS-by-default principle
  (ADR-0002).
- The header and footer are structured after terminal.iabhinav.me only in the
  sense of "site has a persistent nav/footer" — visual styling and copy are
  this project's own (per the ticket), using this project's existing design
  tokens, not the reference site's.
- Per the scope decision on nav link targets: Job History, Projects, and
  Contact links point to their real intended routes now and will 404 until
  those pages are built in future tickets — this feature is scoped to
  header/footer only, not to the destination pages.
- No client-side JavaScript is introduced; any interactive behavior (e.g.
  active-link styling, mobile layout adaptation) is achieved with CSS/HTML
  only, per ADR-0002.
- The tablet/mobile/desktop width thresholds used to switch between inline
  links, lateral panel, and full-screen panel reuse this project's existing
  `@custom-media` breakpoint tokens (ADR-0006) rather than introducing new
  ones.
- The hamburger menu's open/close interaction is implemented via a no-JS
  disclosure mechanism (e.g. the Popover API or a `:checked`/`:has()`-driven
  toggle) — the exact technique is a plan/implementation decision, not a
  spec-level constraint beyond "no client-side JavaScript."
