# Commit Message Convention

This project follows [Conventional Commits](https://www.conventionalcommits.org/),
with a trimmed type set and an enumerated scope list tailored to the architecture.

Commit messages are enforced automatically by [commitlint](https://commitlint.js.org/)
via a `commit-msg` git hook (see [Enforcement](#enforcement)).

## Format

```
type(scope): subject

[optional body]

[optional footer]
```

- **`type`** — required. One of the [allowed types](#types).
- **`(scope)`** — optional, but when present must be one of the [allowed scopes](#scopes).
- **`subject`** — required. A short summary of the change.

## Types

Only these types are allowed (the standard set minus `test`, `perf`, and
`revert`, which don't fit a solo static portfolio):

| Type       | Use for                                                        |
| ---------- | -------------------------------------------------------------- |
| `feat`     | A new feature, page, or widget                                 |
| `fix`      | A bug fix                                                       |
| `docs`     | Documentation only, including ADRs                             |
| `style`    | Formatting/whitespace only, no behavior or output change       |
| `refactor` | A code change that neither fixes a bug nor adds a feature      |
| `chore`    | Tooling, configuration, or housekeeping                        |
| `ci`       | GitHub Actions / CI workflow changes                           |
| `build`    | Build system or build-time tooling (PostCSS, Astro config)     |

## Scopes

The scope is **optional** — omit it for changes that don't map cleanly to one
area. When you do include a scope, it must be one of these:

| Scope     | Area                                                         |
| --------- | ------------------------------------------------------------ |
| `pages`   | The FSD `pages` layer (Astro routes)                         |
| `widgets` | The FSD `widgets` layer                                      |
| `shared`  | The FSD `shared` layer (primitives, layouts, utilities)      |
| `tokens`  | Design tokens (`src/shared/tokens`)                          |
| `adr`     | Architecture Decision Records (`docs/adr`)                   |
| `ci`      | CI workflows                                                 |
| `build`   | Build tooling / config                                       |
| `deps`    | Dependency additions, bumps, or removals                     |

The FSD layers come from [ADR-0004](adr/0004-simplified-fsd-structure.md).

## Subject rules

These are enforced by commitlint (via `@commitlint/config-conventional`):

- Not empty.
- No trailing period.
- Start lowercase; write in the imperative mood ("add", not "added"/"adds").
- The whole header (`type(scope): subject`) stays within 100 characters.

## Body and footer

Both optional. If present, separate each from what precedes it with a blank
line. Use the body to explain *why*, not *what* (the diff already shows what).

Breaking changes are supported by the spec (`type!:` or a `BREAKING CHANGE:`
footer) but are rarely relevant here — reach for them only if you genuinely
break a consumer-facing contract.

## Examples

Valid:

```
feat(widgets): add ASCII name banner
docs(adr): add BEM naming decision
fix(shared): correct token fallback for reduced-motion
chore(deps): bump astro to 7.0.7
ci: run stylelint on pull requests to dev
refactor(pages): extract head metadata into a layout
```

Invalid:

```
added a banner              # no type
feat(header): add banner    # 'header' is not an allowed scope
test(shared): add test      # 'test' is not an allowed type
fix: Corrected the bug.     # capitalized subject + trailing period
```

## Enforcement

- **Local:** a `commit-msg` hook (`.githooks/commit-msg`) runs commitlint on
  every commit. A non-conforming message is rejected before the commit is
  created. The hook is wired automatically on `npm install` via the
  `prepare` script (`git config core.hooksPath .githooks`).
- **Config:** the machine-readable rules live in
  [commitlint.config.js](../commitlint.config.js); this document is the
  human-readable companion. Keep the two in sync.
- **CI:** not currently checked in CI — enforcement is local only. If commits
  ever land that bypass the hook (`--no-verify`), they won't be caught later.
