# Quickstart: Validate Header and Footer Widgets

## Prerequisites

```bash
npm install
astro dev --background
```

## Scenarios

### 1. Desktop nav (User Story 1)

1. Open the site at a desktop viewport width (≥64rem / 1024px).
2. Confirm the header shows three links inline — Home, Job History
   (routed to `/job-experience`), Projects — with no hamburger button
   visible. Contact is not currently in the nav (dropped pending its
   content; see spec Edge Cases).
3. Confirm the link matching the current route is visually distinguished
   and carries `aria-current="page"` (check via devtools).
4. Click Job History and Projects: navigation succeeds (no 404), confirming
   the links are real and correctly pointed, not dead/placeholder anchors.

### 2. Footer (User Story 2)

1. On any page, scroll to the bottom.
2. Confirm the footer reads `© <current year> Mark Schenzle | All Rights
   Reserved`, with `<current year>` matching today's year.
3. On a page shorter than the viewport, confirm the footer sits at the
   bottom of the viewport, not floating mid-page.

### 3. Tablet panel (User Story 3, lateral)

1. Resize to a tablet viewport width (≥48rem, <64rem).
2. Confirm the inline links are replaced by a hamburger button.
3. Click it: confirm a lateral panel slides in from the right edge showing
   all four links, partially covering the viewport.
4. Click a link inside the panel: confirm navigation proceeds (panel closes
   as the browser navigates).
5. Click outside the panel: confirm it light-dismisses (native Popover
   behavior).

### 4. Mobile panel (User Story 3, full-screen)

1. Resize to a mobile viewport width (<48rem).
2. Repeat the same steps as the tablet scenario; confirm the panel now
   covers the full screen rather than a partial lateral strip.

### 5. Breakpoint transition

1. With the panel open at tablet/mobile width, resize the browser across
   `--bp-md`/`--bp-lg` thresholds.
2. Confirm the header always presents the treatment matching the *current*
   width (no reload needed, no stale hamburger/inline state).

## Lint check

```bash
npm run lint:css
```

Expect no errors — new classes follow BEM (ADR-0007), all new values route
through tokens in `src/shared/tokens/tokens.css` (ADR-0003).
