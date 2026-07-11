# Feature Specification: Interactive Terminal Navigation

**Feature Branch**: `feature/hSt1unC9/home-page`

**Created**: 2026-07-11

**Status**: Implemented (spec written retroactively, after the feature was built iteratively with the user)

**Input**: User description: "Retroactive spec for the feature/hSt1unC9/home-page branch, covering everything built in this session: a terminal-log-styled home page and content-collection-backed Job Experience / Projects pages, each rendering as a staggered-reveal 'command output' (timestamped log lines under a `npm run <page>` prompt), followed by a writable prompt. That prompt is a real client-side terminal controller: typing a known command (or clicking a header nav link for a registered route) appends that route's output to the same scrollback instead of navigating away, accumulating multiple runs on one continuous page; unknown commands print a 'command not found' line; browser back/forward reconstructs the accumulated view from history state; the active nav link and document title stay in sync; log timestamps are real wall-clock time (captured per run, offset by a second per line) with static times as the no-JS fallback; a decorative cursor and click-anywhere-to-refocus give it a real-terminal feel. Content (job history entries, the one current project) was supplied by the user. A Contact page exists as an unstyled placeholder, deliberately not yet wired into the command registry or nav."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Read a page's content as command output (Priority: P1)

A visitor lands on Home, Job Experience, or Projects and sees that page's
content presented as if a command had just been run: a labeled prompt line
showing the command, followed by a sequence of timestamped lines, then a
fresh, empty prompt waiting for the next command.

**Why this priority**: This is the baseline presentation every other story
builds on. Without it there is no terminal conceit and nothing for the
interactive stories to enhance — it must work as a normal, fully-readable
page on its own, including with scripting unavailable.

**Independent Test**: Load each of the three pages directly (by URL) and
confirm each shows its own command label and full set of content lines,
readable top to bottom, with no missing content — verifiable with scripting
disabled.

**Acceptance Scenarios**:

1. **Given** a visitor opens the Home page directly, **When** the page
   finishes loading, **Then** they see a command label followed by every line
   of the home content, each with a timestamp.
2. **Given** a visitor opens the Job Experience or Projects page directly,
   **When** the page finishes loading, **Then** they see that page's own
   command label and its own content lines, not another page's.
3. **Given** a visitor's browser does not run scripts, **When** they open any
   of the three pages, **Then** all content is still fully present and
   readable, and standard navigation links still work.

---

### User Story 2 - Run another page's content without losing the current one (Priority: P2)

A visitor viewing one page's content wants to see another page's content —
either by typing that page's command into the waiting prompt, or by clicking
its link in the site navigation — without the content they're already
looking at disappearing.

**Why this priority**: This is the feature's central value proposition: a
continuous, explorable session rather than a series of disconnected page
loads. It depends on User Story 1 already working, but delivers the feature's
real differentiator.

**Independent Test**: From any page, type another page's command into the
prompt (or click its nav link) and confirm the new content appears below the
existing content — not in place of it — followed by a new waiting prompt.

**Acceptance Scenarios**:

1. **Given** a visitor is viewing Home's content with the waiting prompt
   visible, **When** they type the Job Experience command and submit it,
   **Then** Job Experience's content appears below Home's content, and a new
   waiting prompt appears below that.
2. **Given** a visitor is viewing any page, **When** they click a
   navigation link for a page that participates in this system, **Then** the
   same append-without-replacing behavior occurs as if they had typed its
   command.
3. **Given** a visitor has already run two pages' worth of content in one
   session, **When** they run a third, **Then** all three pages' content
   remains visible in the order it was run.
4. **Given** a visitor types a command that does not match any known page,
   **When** they submit it, **Then** a clear "not found" message appears in
   place of page content, and the prompt remains available for another
   attempt without losing any prior content.
5. **Given** a visitor is anywhere in the terminal area, **When** they click
   without hitting the exact prompt text, **Then** the waiting prompt still
   becomes ready to receive typed input.

---

### User Story 3 - Retrace steps with back/forward (Priority: P3)

A visitor who has run several pages' worth of content in one session uses
their browser's back and forward controls and expects to see the session as
it was at that point, not lose everything back to a blank first page.

**Why this priority**: Standard browser navigation expectations are easy to
violate with an accumulating, non-reloading view; getting this wrong would
make the feature feel broken even though User Story 2 works. It builds on,
and is only meaningful after, User Story 2.

**Independent Test**: Run two or three pages' worth of content in one
session, then press back; confirm the view matches what was visible after
the previous run, not an empty or fully-reset page. Press forward and
confirm it restores the later state.

**Acceptance Scenarios**:

1. **Given** a visitor has run Job Experience after Home, **When** they press
   the browser's back control, **Then** the view returns to showing only
   Home's content with its own waiting prompt.
2. **Given** a visitor has pressed back as above, **When** they press
   forward, **Then** Job Experience's content reappears below Home's, exactly
   as before.
3. **Given** a visitor navigates back to an earlier point, **When** they
   view the navigation links, **Then** the link matching that earlier page is
   the one shown as current.

---

### User Story 4 - See genuine, current timestamps (Priority: P4)

A visitor notices the timestamp on each line of content and expects it to
reflect when they actually viewed or ran that content, not a fixed value
that never changes.

**Why this priority**: A nice-to-have realism improvement once the core
interaction (Stories 1-3) works; the feature is fully usable without it, but
it strengthens the terminal illusion the whole feature is built on.

**Independent Test**: Run a page's content and confirm its timestamps match
the current time of day (not a value baked in ahead of time), with each
successive line's timestamp one second later than the last.

**Acceptance Scenarios**:

1. **Given** a visitor's browser can run scripts, **When** any page's
   content is run (on load, by typing, or by clicking a nav link), **Then**
   each line's timestamp reflects the real time it was run, with each
   subsequent line one second later.
2. **Given** a visitor's browser cannot run scripts, **When** they view a
   page's content, **Then** timestamps still display (a fixed placeholder
   value) rather than being blank or broken.

---

### Edge Cases

- What happens when a visitor submits an empty prompt (presses enter without
  typing anything)? Nothing happens — no blank command is run and no "not
  found" message appears.
- What happens when a visitor clicks a navigation link for a page that isn't
  yet part of this system (e.g. Contact)? It behaves as an ordinary link and
  takes them to that page normally, outside the accumulating session.
- What happens when a visitor clicks a real link inside the content itself
  (e.g. a project's external URL)? It behaves as an ordinary link and does
  not disturb the accumulating session or steal input focus back to the
  prompt.
- What happens if a visitor runs the same page's command twice in a row?
  Its content is appended again as a new entry, same as running any other
  page — the session is a log of what was run, not a set of unique pages.
- What happens on a very long session (many pages run repeatedly)? All
  content remains visible and scrollable; no content is discarded to save
  space.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Each participating page (Home, Job Experience, Projects) MUST
  present its content as a command label followed by an ordered sequence of
  timestamped content lines, ending in a waiting prompt.
- **FR-002**: All content on a participating page MUST be fully present and
  readable, and standard links MUST work, when the visitor's browser does
  not run scripts.
- **FR-003**: Visitors MUST be able to type a participating page's command
  into the waiting prompt and submit it to bring that page's content into
  view.
- **FR-004**: Visitors MUST be able to click a navigation link for a
  participating page to achieve the same result as typing its command.
- **FR-005**: When a command is run (typed or via nav link), its content
  MUST be appended after whatever is already visible, never replacing or
  clearing it.
- **FR-006**: When a visitor submits text that does not match any
  participating page's command, the system MUST display a clear "not found"
  indication and MUST preserve everything already shown.
- **FR-007**: Submitting an empty prompt MUST have no effect.
- **FR-008**: The navigation link matching the most recently run page MUST
  be visually indicated as current, and the browser tab title MUST match
  that page.
- **FR-009**: Using the browser's back and forward controls MUST restore the
  accumulated view, the current navigation indicator, and the tab title to
  the state they were in at that point in the session.
- **FR-010**: Each content line's displayed timestamp MUST reflect the real
  time its command was run, with each successive line in the same run
  timestamped one second later than the previous, whenever scripting is
  available; a fixed placeholder timestamp MUST display when it is not.
- **FR-011**: Visitors MUST be able to (re)gain the ability to type by
  clicking anywhere within the content area, not only by clicking the exact
  prompt text.
- **FR-012**: Clicking a real link within the content (e.g. an external
  project URL) MUST behave as an ordinary link and MUST NOT be treated as an
  attempt to type a command.
- **FR-013**: Pages not yet part of this system (e.g. Contact) MUST remain
  reachable as ordinary pages and MUST NOT be forced to participate before
  their content is ready.

### Key Entities

- **Participating Page**: A section of the site (Home, Job Experience,
  Projects) that has a command label, a title, and an ordered list of
  content lines.
- **Content Line**: A single unit of displayed output belonging to a
  Participating Page — its text, its timestamp, and, optionally, a
  destination link (e.g. a project's repository URL).
- **Session Run**: A record of which Participating Page's command was
  executed and when, used to reconstruct the accumulated view when the
  visitor uses back/forward.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A visitor can view all participating pages' content in one
  continuous session, without a single full page reload, using either typed
  commands or navigation links interchangeably.
- **SC-002**: 100% of submitted commands that match a participating page
  bring that page's content into view without any previously shown content
  disappearing.
- **SC-003**: A visitor who mistypes a command sees a clear indication of
  the mistake in the same view, with zero loss of previously shown content.
- **SC-004**: Using back and forward at any point in a session restores an
  accurate reconstruction of the session at that point 100% of the time.
- **SC-005**: A visitor with scripting disabled can still read 100% of every
  participating page's content and reach every page via ordinary links.
- **SC-006**: Displayed timestamps always match the real time the visitor's
  session actually ran that content, never a stale or fixed value, whenever
  scripting is available.

## Assumptions

- Commands follow a fixed, discoverable naming pattern (`npm run
  <page-name>`) consistent with the site's developer-portfolio conceit,
  rather than accepting free-form natural-language input.
- The set of participating pages (Home, Job Experience, Projects) is fixed
  and defined ahead of time; visitors cannot add new pages to the system
  themselves.
- The Contact page's content and whether/how it joins this system are
  separate, not-yet-made decisions; it exists today only as an ordinary,
  unstyled placeholder page reachable outside the accumulating session.
- "Real time" timestamps use the visitor's own device clock at the moment
  each command runs; no server-synchronized clock is required.
- The accumulated session is scoped to one continuous browsing session in
  one browser tab; it is not expected to persist across a full reload or a
  brand-new visit.
- Job history and project content are supplied and maintained by the site
  owner, not entered by visitors.
