---
name: fsd-scaffold
description: Use when adding a new slice (domain, feature, widget, or page) to this project's src/ directory, or when deciding which FSD layer a piece of code belongs in. Covers folder/file scaffolding conventions and the public-API-only import rule for domains/features/widgets/pages-layer.
---

# FSD scaffolding for hometogether

This project organizes `src/` as Feature-Sliced Design layers: `app → pages-layer → widgets → features → domains → shared`. Imports only flow downward (see `AGENTS.md` for the hard constraint on import direction). This skill covers *how* to scaffold a new slice inside those layers.

## Which layer does this belong in?

- **`domains/`** — a business entity/noun and its data shape (e.g. `user`, `housing-unit`, `reservation`). Holds types, entity logic, and the API calls that fetch/mutate that entity.
- **`features/`** — a single user-facing interaction/verb (e.g. `apply-to-listing`, `edit-profile`, `send-message`). A feature does one thing.
- **`widgets/`** — a composite, self-contained UI block that combines multiple features/domains for a page section (e.g. `listing-card`, `profile-header`).
- **`pages-layer/`** — the composition for a specific route: assembles widgets/features into what a page renders.
- **`shared/`** — generic, business-agnostic code with no knowledge of any domain (ui kit primitives, generic hooks/utils, config).

If you're unsure between two layers, prefer the lower one (e.g. prefer `features` over `widgets`) — it's easier to compose small pieces upward later than to split a monolithic slice.

## Slice folder structure

Each slice (a single domain/feature/widget/page folder) follows this internal shape — omit segments you don't need, don't pre-create empty ones:

```
src/<layer>/<slice-name>/
  ui/          # components
  model/       # state, hooks, business logic, types
  api/         # network calls scoped to this slice
  lib/         # slice-local utilities
  index.ts     # public API — the ONLY thing other slices/layers may import
```

Example: adding a `reservation` domain and an `apply-to-listing` feature:

```
src/domains/reservation/
  model/reservation.types.ts
  api/reservation.api.ts
  index.ts              # export type { Reservation } from './model/reservation.types'; export { fetchReservation } from './api/reservation.api';

src/features/apply-to-listing/
  ui/ApplyToListingForm.tsx
  model/use-apply-to-listing.ts
  index.ts               # export { ApplyToListingForm } from './ui/ApplyToListingForm';
```

## Public API rule

Other slices/layers must import only from a slice's `index.ts`, never reach into its internal `ui/model/api/lib` folders directly:

```ts
// good
import { ApplyToListingForm } from "@/features/apply-to-listing";

// bad — reaches past the slice's public API
import { ApplyToListingForm } from "@/features/apply-to-listing/ui/ApplyToListingForm";
```

This keeps a slice's internals refactorable without breaking importers, and makes it easy to spot layer-direction violations (an import path tells you the layer immediately).

## Naming

- Slice folder names: kebab-case, and a noun for `domains`/`widgets`/`pages-layer`, a verb phrase for `features` (e.g. `edit-profile` not `profile-editor`).
- Component files inside `ui/`: PascalCase matching the exported component name.
- Non-component files (`model`, `api`, `lib`): kebab-case, suffixed by role (`*.types.ts`, `*.api.ts`, `*.store.ts`).
