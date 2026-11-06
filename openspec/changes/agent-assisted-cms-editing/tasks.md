# Tasks

## 1. Source discovery and permissions

- [x] 1.1 Verify current official WebMCP registration/discovery behavior and record the supported API in developer documentation; verify top-level registration in ChatGPT desktop's built-in browser.
- [ ] 1.2 Add source descriptors and rendering boundaries for regions, page lists, templates, and snippets, including nested/repeated sources and actual owning page; verify rendering tests preserve valid output and distinguish page-local/shared ownership.
- [ ] 1.3 Add authenticated source discovery/read endpoints with existing source permissions and section restrictions; verify denied reads/proposals and anonymous/cache responses expose no protected context.
- [x] 1.4 Document descriptor scope, persistence categories, and target-resolution behavior; verify examples against rendering fixtures.

## 2. Working source and existing persistence

- [x] 2.1 Extract shared content normalization and full-page revision persistence from the management action; verify ordinary editor saves retain unchanged objects, revision attribution, publishing permissions, index updates, and cache invalidation.
- [ ] 2.2 Add request-scoped render overrides using canonical working source; verify placeholders, ERB, snippets, lists, and normalization render faithfully without creating saved CMS revisions.
- [x] 2.3 Preserve ordinary revision-based saving without agent-only concurrency rejection; verify two editors can each save a retained revision and publishing changes do not block drafts.
- [x] 2.4 Document the working-source/preview/persisted-source boundaries and verify source map examples preserve CMS tokens.

## 3. Proposal lifecycle

- [x] 3.1 Add proposal storage/migration, editor/session binding, local working values, expiry, and cleanup; verify expiry, foreign access, replay rejection, and migration behavior.
- [x] 3.2 Implement proposal validation and normalized rendering, local/shared mismatch warnings, and server rejection of mixed categories; verify each path leaves persistent content unchanged before user acceptance.
- [ ] 3.3 Implement single-use acceptance/discard endpoints with permission/CSRF/expiry checks and local working-value checks; verify exact previewed source is accepted and independent proposals coexist while overlapping stale proposals fail.
- [x] 3.4 Document proposal endpoints and agent guidance for no side effects, source scope, deferred mixed requests, and human-controlled apply/save; verify no registered tool invokes acceptance or saving.

## 4. Edit-mode input adapter

- [ ] 4.1 Connect proposal preview, Apply, and Discard to HugeRTE canonical source and undo/dirty handling; verify manual edits, protected tokens, undo, and subsequent normal Save behavior in editor tests.
- [ ] 4.2 Handle asynchronous previews and changed targets without replacing newer working content; verify delayed responses and discard preserve unrelated manual edits.
- [ ] 4.3 Document Apply-versus-Save behavior and verify the labels/state against the existing editing interface.

## 5. Preview-mode editing

- [ ] 5.1 Add the content working map and Apply, Save, Discard changes, and unload warning behavior; verify multiple content/page-list proposals accumulate, unrelated content remains, and Save creates one valid new revision.
- [ ] 5.2 Add immediate Save change review for page properties, templates, and snippets with scope warnings; verify saved source, permission enforcement, version/cache behavior, and preservation of staged content.
- [ ] 5.3 Preflight structural changes against dirty regions and handle mode switches safely; verify conflicting saves are blocked and mode changes never silently lose drafts.
- [ ] 5.4 Document preview-mode save categories and scope warnings; verify the displayed states clearly distinguish proposed, applied-unsaved, and saved changes.

## 6. Site tools and end-to-end verification

- [x] 6.1 Register permission-scoped top-level discovery/read/proposal tools with category/scope guidance and feature detection; verify supported discovery plus ordinary CMS behavior when tools are absent or disabled.
- [x] 6.2 Use sportshigh's local path Gemfile entry and bundle for integration testing; run bin/rails test and relevant JavaScript checks, recording results and restoring dependency selection unless intentionally retained.
- [ ] 6.3 Manually exercise edit-mode apply/undo/save/discard and preview-mode accumulation, list configuration, immediate saves, both scope mismatch warnings, mixed-category rejection, and conflicts in ChatGPT desktop; record results and any unavailable verification explicitly.
- [x] 6.4 Run Dijkstra on the final implementation, check findings against requirements, fix valid findings, rerun affected validation, and re-review affected changes; retain a review summary before declaring implementation complete.

## Workflow follow-up

- Proposal and implementation were authorized in this conversation. On 2026-11-06 the user requested a CMS-side checkpoint commit. Sync, archive, push, PR creation, and deployment remain outside the requested scope.

## Implementation status (2026-11-03)

Implementation is in progress. Source/proposal endpoints, rendering boundaries,
working content and toolbar adapters are present. Unchecked tasks include code
already implemented but not yet fully verified against their stated scenarios.
See docs/agent-editing.md for checks, independent-review fixes, and limits.

Full UI verification is blocked by the host Sass rgb compilation error. The normal
development server also fails on a missing Rack::LiveReload constant. The available
preview browser lacks document.modelContext, so actual ChatGPT discovery and the
full manual scenario checklist remain pending. No sync/archive/commit/push was run.

## Verification update (2026-11-06)

The user confirmed that ChatGPT's browser discovers the site tools in both preview
and edit mode. Tasks 1.1 and 6.1 are now complete on that evidence. This verifies
discovery, not the full interaction scenarios in task 6.3.

The combined host/CMS regression suite was rerun: 37 tests, 110 assertions, zero
failures/errors/skips. HugeRTE backport checks: 10 tests, 248 assertions, all passing.
JavaScript syntax, whitespace, and strict OpenSpec validation also pass.

The host LiveReload remnant was removed separately and development boot was verified.
Earlier LiveReload/browser-availability notes above describe the historical test run.
Do not count the following as complete solely because their code is present:

- 1.2–1.3: rendering ownership and authenticated discovery code exists; nested/repeated
  ownership and anonymous/cache verification still need their stated coverage.
- 2.2–2.3 and 3.3: rendering, revision saving, and acceptance code has basic regression
  coverage; the complete source-type/concurrency/CSRF/independent-proposal matrix remains.
- 4.1–4.3: the edit adapter and documentation exist; HugeRTE interaction/undo and
  delayed-response scenarios need end-to-end verification.
- 5.1–5.4: preview working-copy, immediate saves, structural preflight, and documentation
  exist; accumulation, shared-source saves, mode switches, and visible-state scenarios
  remain to be verified as specified.
- 6.3: the complete manual ChatGPT interaction checklist remains pending.

This is an implementation checkpoint; the change is not complete or archived.

Staging/preview is the intended environment for the remaining interaction checks.
The 2026-11-06 precommit review found and fixed checkbox/radio Apply semantics;
targeted JavaScript regressions pass. This commit is a deployable testing checkpoint,
not a claim that the unchecked scenarios are verified.

## Concurrency clarification (2026-11-06)

The user confirmed that concurrent editing is not a concern requiring special
handling: every Save creates a revision, so neither saved edit is lost. Removed
page/source fingerprints and base-token gates from propose, Apply, and Save.
Publishing and unrelated edits do not invalidate drafts. Only local unsaved input,
authorization, proposal ownership/expiry/single use, and structural preservation
remain guarded. Earlier fingerprint-related review notes are historical and do
not define the current requirements. Staging interaction verification remains open.
