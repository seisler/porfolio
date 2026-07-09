## Development

When starting the dev server, use background mode:

```
astro dev --background
```

Manage the background server with `astro dev stop`, `astro dev status`, and `astro dev logs`.

## Conventions

- **Commit messages** must follow [docs/commit-convention.md](docs/commit-convention.md)
  (Conventional Commits: trimmed type set, enumerated FSD scopes). A `commit-msg`
  hook enforces this via commitlint — do not bypass it with `--no-verify`.
- **Architecture decisions** are recorded in [docs/adr/](docs/adr/). Follow them
  when writing code — notably: CSS-first, no client-side JS unless explicitly
  requested (ADR-0002); design tokens only, no hardcoded values (ADR-0003);
  simplified FSD layout `pages → widgets → shared` (ADR-0004); mobile-first
  `min-width` breakpoints (ADR-0006); BEM class naming (ADR-0007).
- **CSS** is checked by Stylelint (`npm run lint:css`), run automatically on
  staged files by a `pre-commit` hook.

## Documentation

Full documentation: https://docs.astro.build

Consult these guides before working on related tasks:

- [Adding pages, dynamic routes, or middleware](https://docs.astro.build/en/guides/routing/)
- [Working with Astro components](https://docs.astro.build/en/basics/astro-components/)
- [Using React, Vue, Svelte, or other framework components](https://docs.astro.build/en/guides/framework-components/)
- [Adding or managing content](https://docs.astro.build/en/guides/content-collections/)
- [Adding styles or using Tailwind](https://docs.astro.build/en/guides/styling/)
- [Supporting multiple languages](https://docs.astro.build/en/guides/internationalization/)
