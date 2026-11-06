# Tasks

## 1. Configuration and repeatable ordering

- [x] 1.1 Add pagination_mode resolution, persistence, template propagation, and the None/Page numbers/Load more/Infinite scroll selector; verify legacy flag behavior, explicit precedence, save/reopen, and calendar regression tests.
- [x] 1.2 Implement per-list validated seeds and a local seeded shuffle for append modes with stable candidate enumeration; verify successive slices, pool limits, initial skip, selected pages, tied sort values, retries, and multiple-list isolation against unchanged content.
- [x] 1.3 Update the template reference and author documentation with mode examples, batch size, seeded randomization, and live-content limitations; verify examples match option resolution.

## 2. Append response and markup

- [x] 2.1 Share item rendering between initial and append responses, place insertion markers, and return items/count/next URL with carried seed; verify empty, partial/final batches, placeholder semantics, and preserved headers/footers in renderer tests.
- [x] 2.2 Preserve default HTML segment responses and public/preview visibility plus format-specific caching; verify controller tests for HTML/JSON, unknown lists, invalid seeds/offsets, anonymous and preview requests.
- [x] 2.3 Document the response and markup boundaries; verify browser-parsed flat, ul/li, and table/tbody/tr examples retain their actual item parents and owner markers.

## 3. Shared loading interaction

- [x] 3.1 Add gem-owned per-list loading state, contextual insertion, duplicate-request prevention, retry, completion, and append-complete event; verify JavaScript tests covering success, malformed responses, request failure, and independent lists.
- [x] 3.2 Add keyboard controls, polite status feedback, and intentional focus handling on append/completion; verify focus reaches new content on manual loads without scrolling the reading position unexpectedly and automatic loads never steal focus.
- [x] 3.3 Add opt-in automatic observation using the same loader with manual fallback and observer cleanup; verify failure suspends automatic loading, manual retry resumes it, exhaustion stops it, and unsupported observation leaves the button working.
- [x] 3.4 Document required public asset inclusion, host append initialization event, and footer-access trade-off; verify dummy-app inclusion and a host initialization example.

## 4. Integration and implementation review

- [x] 4.1 Exercise the dummy app in a real browser with multiple lists, seeded randomized lists, wrapped markup, network failure/retry, and numbered pagination; record results and run affected gem suites.
- [x] 4.2 Run Dijkstra on the final implementation, verify and fix valid findings, rerun affected checks, and re-review modified areas before declaring implementation complete.
