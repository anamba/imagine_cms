# Tasks

## 1. Source discovery and permissions

- [x] 1.1 Verify current official WebMCP registration/discovery behavior and record the supported API in developer documentation.
- [x] 1.2 Add source descriptors and rendering boundaries for regions, page lists, templates, and snippets, including nested/repeated sources and actual owning page.
- [x] 1.3 Add authenticated source discovery/read endpoints with existing source permissions and section restrictions.
- [x] 1.4 Document descriptor scope, persistence categories, and target-resolution behavior.

## 2. Working source and existing persistence

- [x] 2.1 Extract shared content normalization and full-page revision persistence from the management action.
- [x] 2.2 Add request-scoped render overrides using canonical working source.
- [x] 2.3 Preserve ordinary revision-based saving without agent-only concurrency rejection.
- [x] 2.4 Document the working-source/preview/persisted-source boundaries and verify source map examples preserve CMS tokens.

## 3. Proposal lifecycle

- [x] 3.1 Add proposal storage/migration, editor/session binding, local working values, expiry, and cleanup.
- [x] 3.2 Implement proposal validation and normalized rendering, local/shared mismatch warnings, and server rejection of mixed categories.
- [x] 3.3 Implement single-use acceptance/discard endpoints with permission/CSRF/expiry checks and local working-value checks.
- [x] 3.4 Document proposal endpoints and agent guidance for no side effects, source scope, deferred mixed requests, and human-controlled apply/save.

## 4. Edit-mode input adapter

- [x] 4.1 Connect proposal preview, Apply, and Discard to HugeRTE canonical source and undo/dirty handling.
- [x] 4.2 Handle asynchronous previews and changed targets without replacing newer working content.
- [x] 4.3 Document Apply-versus-Save behavior and verify the labels/state against the existing editing interface.

## 5. Preview-mode editing

- [x] 5.1 Add the content working map and Apply, Save, Discard changes, and unload warning behavior.
- [x] 5.2 Add immediate Save change review for page properties, templates, and snippets with scope warnings.
- [x] 5.3 Preflight structural changes against dirty regions and handle mode switches safely.
- [x] 5.4 Document preview-mode save categories and scope warnings.

## 6. Site tools and end-to-end verification

- [x] 6.1 Register permission-scoped top-level discovery/read/proposal tools with category/scope guidance and feature detection.
- [x] 6.2 Use sportshigh's local path Gemfile entry and bundle for integration testing; run bin/rails test and relevant JavaScript checks, recording results and restoring dependency selection unless intentionally retained.
- [x] 6.3 Record user-confirmed ChatGPT discovery and local Apply/Save/Discard testing, fixed issues, and remaining manual QA scenarios.
- [x] 6.4 Run Dijkstra on the final implementation, check findings against requirements, fix valid findings, rerun affected validation, and re-review affected changes; retain a review summary before declaring implementation complete.

## Completion and QA follow-up

The user clarified that implementation completion is separate from QA coverage.
All implementation tasks are complete. The earlier 11/23 status reflected tasks
that combined delivered code with unrun manual scenarios; it did not represent
missing implementation. Those scenarios are carried forward below without claiming
they were executed. Follow-up bugs from QA are handled separately.

Implemented and verified during local testing:

- ChatGPT discovery in preview and edit modes confirmed by the user.
- User-confirmed preview/propose/Apply/Save/Discard flow and UI refinements.
- Regression coverage for permissions, proposals, source scope, save categories,
  retained revisions, publishing behavior, local working-content checks, and lists.
- Browser-component/JavaScript coverage for form-control Apply, draft discard,
  and save navigation, plus existing HugeRTE checks.
- User clarification applied: no agent-only concurrent-editor conflict gates;
  ordinary revision-based saving preserves each saved revision.
- Preview Save now uses the normal management content-save action and navigates
  to its saved revision URL. HTML Save retains its normal redirect behavior.
- Required independent Dijkstra reviews completed for the implementation and fixes;
  final save-path review is recorded in docs/agent-editing.md.

Manual QA follow-up (not a completion gate):

- Additional combinations of HugeRTE undo/protected source and manual edits.
- Shared template/snippet changes alongside staged content and mode switches.
- More nested/repeated list-source examples and mobile layouts.
- Additional permission/CSRF and delayed-response scenarios in the live browser.

Sync and archive are authorized by the user's finalization request. No push,
deployment, or new commit is included unless separately requested.
