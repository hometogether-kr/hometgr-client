# Project Instructions

## Next.js

This is not the Next.js version you may remember from older projects.

Before changing framework-specific code, read the relevant guide in
`node_modules/next/dist/docs/`. APIs, conventions, and file structure may have
breaking changes. Follow current deprecation notices.

## Server And Client Components

Prefer Server Components by default.

Use `"use client"` only when a component needs hooks, browser APIs, event
handlers, client-side state, or client-only libraries.

Do not move an entire page or large tree to a Client Component only because one
child needs interactivity. Isolate the interactive part into a small client
component.

Do not import server-only code into Client Components. Do not pass non-serializable
values from Server Components to Client Components.

## Routes

Route files in `app/` should stay thin.

A `page.tsx` should usually import and render a page composition from
`pages-layer`.

Avoid putting feature logic, large layout code, form orchestration, or business
rules directly in route files.

## Architecture: Feature-Sliced Design

`src/` follows Feature-Sliced Design.

Source layers:

- `app/`: Next.js App Router routes, root layout, global providers, global styles, and app-level initialization.
- `pages-layer/`: Route-level page compositions that assemble widgets, features, domains, and shared UI.
- `widgets/`: Self-contained composite UI blocks used by pages.
- `features/`: User-facing actions and business capabilities.
- `domains/`: Business entities, domain types, entity API, model logic, and entity-specific UI.
- `shared/`: Business-agnostic UI, utilities, config, API infrastructure, and low-level helpers.

Dependencies must only flow downward:

```text
app
-> pages-layer
-> widgets
-> features
-> domains
-> shared
```

A lower layer must never import from a higher layer. For example, `shared` must
not import from `domains`, `features`, `widgets`, `pages-layer`, or `app`.

Avoid direct dependencies between separate slices on the same layer. Compose
separate features, widgets, or domains in a higher layer instead.

## Slice Structure

Create only the directories that have a clear responsibility. Do not create
empty folders to match a template.

Common slice segments:

- `ui`: Components and presentation.
- `model`: State, hooks, schemas, selectors, and business logic.
- `api`: Slice-owned requests, DTO schemas, DTO types, and mappers.
- `lib`: Internal helpers specific to the slice.
- `config`: Slice-specific configuration.

Each slice exposes its external API through its root `index.ts`.

Prefer public imports across slice boundaries:

```ts
import { ListingStepper } from "@/widgets/listing-step-layout";
```

Avoid deep imports across slice boundaries:

```ts
import { ListingStepper } from "@/widgets/listing-step-layout/listing-stepper";
```

Inside the same slice, use relative imports. Export only what other slices
actually need.

## Layer Responsibilities

Use `app` for framework routing, layouts, providers, global styles, metadata,
and application-level error boundaries. Do not put page-specific business logic
in `app`.

Use `pages-layer` for route composition and orchestration. Page components should
mostly arrange widgets, features, domains, and shared UI.

Use `widgets` for larger reusable UI sections that combine lower layers. Do not
put small generic controls in widgets.

Use `features` for meaningful user actions or business capabilities, such as
`edit-profile`, `delete-comment`, `toggle-favorite`, or `submit-listing`.

Use `domains` for core business concepts, such as `user`, `listing`,
`housing-unit`, or `reservation`. Domain UI should represent the entity itself.
Actions involving an entity usually belong in `features`.

Use `shared` only for domain-independent code. Do not place domain-specific
modules such as `UserCard`, `ListingApi`, or `ReservationStatus` in `shared`.

## Clean Code

Keep functions focused on one responsibility. Prefer early returns over deeply
nested conditions. Use names that describe intent, not implementation details.

Avoid boolean parameters when they significantly change behavior. Prefer
composition or separate functions when behavior meaningfully differs.

Extract logic only when it improves readability, testability, or reuse. Do not
create abstractions for one-line operations without a clear benefit.

Write comments to explain why a decision exists, not to repeat what the code
already says. Delete unused and commented-out code.

## Components

Keep components focused on rendering and interaction. Move complex business
logic into model hooks, pure functions, API mappers, or lower-layer modules.

Prefer composition over large components controlled by many boolean props.

Avoid unnecessary state and effects. Derive values during render when possible.
Use `useMemo` only when a calculation is meaningfully expensive or stable
identity is required.

Keep shared UI components business-agnostic. Do not put domain copy, domain
rules, route knowledge, or feature-specific behavior into `shared/ui`.

Use semantic HTML and accessible controls. Inputs need labels, buttons need clear
names, disabled/loading states must be represented, and keyboard interaction
should work for custom controls.

Keep responsive layouts intentional. Text must not overflow or overlap at mobile
or desktop sizes.

## UI Quality

Reusable UI components must support disabled, loading, error, focus, and keyboard
states when relevant.

Do not hardcode domain-specific copy, route knowledge, or feature-specific
behavior inside shared UI components.

Avoid layout shifts caused by loading states, validation messages, dynamic text,
or responsive changes.

Prefer predictable spacing, semantic HTML, accessible labels, and clear visual
states over visual-only structure.

## State Management

Use local component state for temporary UI state.

Use URL state for shareable, bookmarkable, or navigation-relevant state.

Use server-state queries for remote data, caching, refetching, and request
deduplication.

Do not copy server data into local state unless the user is intentionally editing
a draft.

Avoid global state unless multiple distant parts of the app need the same
client-owned state.

## Naming

Use descriptive names:

```ts
const hasEditPermission = ...
const activeListings = ...
const submitListing = ...
```

Avoid vague names:

```ts
const flag = ...
const data2 = ...
const handle = ...
```

Event handlers should describe the event or action:

```ts
handleSubmit;
handleListingDelete;
handleModalClose;
```

## Types

Avoid `any`. Use `unknown` for external values that have not been validated.

Use `interface` as the default for named object contracts, including domain
models, component props, form values, service contracts, and function parameter
objects.

Keep API DTO types separate from domain model types when their shapes differ.
Do not use type assertions only to silence TypeScript errors.

## Hooks

Hooks must have one clear responsibility. Use hooks for reusable stateful logic,
side effects, and framework-specific integration.

Do not move every function into a hook. Pure calculations and transformations
belong in regular functions.

Do not create hooks that only rename another hook without adding meaningful
behavior. Custom hook names must start with `use`.

Keep UI rendering out of hooks. Return values with domain-focused names rather
than exposing library internals by default.

Hook placement:

- `shared/lib/hooks/`: Domain-independent hooks such as `useDebounce`, `useMediaQuery`, or `useOutsideClick`.
- `domains/<slice>/model/`: Entity reading, entity representation, and domain model hooks.
- `features/<slice>/model/`: User action, form, mutation, and feature-specific hooks.

Do not place domain-specific hooks in `shared`.

## API

Place shared HTTP infrastructure in `shared/api/`.

Place domain-owned reads and entity representation requests in
`domains/<slice>/api/`.

Place user actions and business commands in `features/<slice>/api/`.

API functions should accept explicit typed input, perform the request, validate
or safely interpret external data, map DTOs into domain models, normalize
transport errors when the app has a shared error model, and return a
domain-friendly result.

Do not return raw HTTP client responses unless headers or status are
intentionally required. Transport details should not spread into components,
hooks, or business logic.

UI components should not construct transport-specific payloads such as
`FormData` unless the payload is inherently UI-specific. Prefer converting API
input inside the API function.

## Forms

Keep form state separate from API request input when their shapes differ.

Validate user input before submitting. Show validation errors near the field when
possible, and use form-level errors for cross-field or submission-level failures.

Represent pending, success, and failure states explicitly when a form submits
asynchronously.

Do not let generic UI components build backend-specific payloads. Convert form
values into feature input or API input in the feature or API layer.

## Zod Validation

Use Zod to validate data received from external boundaries.

External boundaries include API responses, URL search parameters, local storage,
environment variables, form input, third-party SDK responses, and file data.

TypeScript types do not validate runtime data. Do not assume external data is
valid because a generic type was passed to an HTTP client.

Place schemas close to the boundary or model they validate:

- `domains/<slice>/api/*.schema.ts` for API DTOs.
- `features/<slice>/model/*.schema.ts` for feature forms or feature inputs.
- `shared/config/*.schema.ts` for environment and shared configuration.

Use the `Schema` suffix for Zod schemas, such as `userDtoSchema`,
`listingFormSchema`, or `envSchema`.

When a DTO type directly corresponds to a Zod schema, infer it from the schema:

```ts
export type UserDto = z.infer<typeof userDtoSchema>;
```

Do not duplicate the same DTO shape as both an interface and a schema.

Use `parse` when invalid data is a server-contract, configuration, or programmer
error that should stop the current operation. Use `safeParse` when the
application needs to recover from user-controlled invalid data.

Keep validation and domain mapping separate unless a schema transform is truly
part of parsing the same representation.

## Query And Mutation Hooks

When using a server-state library, query hooks should use stable centralized
query keys, call API functions instead of raw HTTP requests, return domain
models rather than unprocessed DTOs, and avoid side effects inside query
functions.

Use `select` only for consumer-specific derived values or query-library
optimization. Do not use it as the main place for DTO-to-domain mapping.

Mutation hooks should represent meaningful actions. Keep cache invalidation and
cache updates near the mutation that causes them.

Do not trigger notifications, navigation, modal closing, or unrelated UI behavior
inside generic domain mutation hooks unless that behavior is part of the hook's
explicit contract. Page-specific UI behavior should usually remain in the caller.

## useEffect

Use `useEffect` only when synchronizing React with an external system.

External systems include browser APIs, DOM APIs not managed by React, event
listeners, timers, WebSocket connections, third-party libraries, analytics, local
storage synchronization, and imperative media or canvas APIs.

Effects that register subscriptions, listeners, timers, or connections must
return cleanup logic.

Do not use `useEffect` for values that can be derived during render, filtering or
transforming props into state, event-driven logic, ordinary API fetching,
effect-triggered mutations caused by user actions, parent notifications that can
happen in the same event handler, or chains of effects that update state only to
trigger another effect.

Prefer component identity with `key`, explicit event logic, controlled
components, or a better state model before adding synchronization effects.

## Suspense And Error Handling

Separate asynchronous states by responsibility:

- Loading state: Suspense fallback.
- Render error: Error Boundary.
- Query error: Error Boundary and query reset.
- Mutation error: Local feature-level handling by default.
- Form error: Field-level or form-level validation message.
- Fatal app error: Application-level Error Boundary.

Use Suspense only for asynchronous resources that explicitly support React
Suspense, such as lazy-loaded components, framework-supported async resources,
or Suspense-enabled query hooks.

Do not manually throw arbitrary promises from application code.

When a query is designed for Suspense, use a Suspense-specific hook and avoid
redundant loading checks in the consuming component.

Suspense fallbacks should match the size and shape of the content being loaded
and avoid layout shifts.

Place Error Boundaries around the smallest meaningful section that can display an
independent fallback, fail without breaking the whole page, be retried
independently, and preserve the rest of the user's work.

Do not add an Error Boundary around every small component. A boundary is useful
only when its fallback gives the user a meaningful recovery path.

## Testing And Verification

No test framework is set up yet.

Do not add speculative test infrastructure unless the task explicitly asks for
it. Verify UI changes by running the dev server and checking the browser.
