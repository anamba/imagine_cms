# Agent-assisted CMS editing

Implementation is in progress under OpenSpec change `agent-assisted-cms-editing` (BB-652).

## Site tools API

Checked 2026-11-03 against https://learn.chatgpt.com/docs/webmcp .
Feature-detect `document.modelContext.registerTool` and register tools with `name`,
`description`, `inputSchema`, optional `annotations`, and an asynchronous `execute`.
Register on the top-level document. The current documentation also describes iframe
and declarative-form support; the issue's original limitation is historical.
No API key or remote MCP server is needed: tools use the editor's signed-in browser session.
Real ChatGPT desktop discovery still needs manual verification.

## Source and persistence contract

A source has an actual owner, a page-local/shared scope, and a staged/immediate
save category. Similar DOM text is not evidence of shared ownership. A snippet
remains shared even if currently referenced only once. Usage counts are not needed.
Page-list output must resolve to its real content owner, not automatically the page
that displays the list. Tool descriptions must recommend handling mixed requests
one category at a time, deferring the other.

Working source contains CMS placeholders (`<# title #>`) and ERB (`<%= ... %>`).
Rendered HTML is a view of that source, never a replacement for canonical source.
ContentNormalizer applies the same editorial transformations during preview and
Save; it is not a Ruby/HTML sandbox. Avoid introducing side effects and retain
existing Ruby unless the requested change needs it.

ContentWriter saves a complete page revision under a page-row lock, retaining
unsubmitted regions. A persisted snapshot includes properties and objects, since
property saves can leave the page's revision number unchanged. Save rechecks that
snapshot and refuses stale work. Existing publishing rules remain in effect:
Latest can publish on Save, while basic editors pin the prior published revision.

## Integration and verification (2026-11-03)

Install the engine migration through the host's usual engine migration workflow
before enabling site tools. For this checkout, proposal storage was exercised in
the local test database only; the development migration did not run because the
host development environment fails at `Rack::LiveReload` startup.

Registered tools are `cms_read_page` and `cms_propose_change`. They use authenticated
`/manage/cms_pages/:id/agent/` endpoints. No tool applies or saves. The UI uses the
separate accept/discard/save endpoints with CSRF, session and permission checks.
Pending proposals expire after 30 minutes. Run `CmsAgentProposal.cleanup_expired!`
from the host maintenance job to remove at most 500 expired records per call.

In edit mode the tools target content in the existing form. Apply participates in
HugeRTE undo and marks content dirty. Save (including Ctrl/Cmd+S) uses the checked
working-copy endpoint when agent editing is active. In preview mode Apply accumulates
page content/page-list configuration until Save; Save change immediately persists
page properties, templates or snippets. Review/discard retains the original DOM
nodes and document head. Shared source changes warn when scope intent differs.
List item owner boundaries identify content from another page and read context
provides permission-checked navigation to its owning page.

Freshness includes the page, its objects, its template, and conservative snippet
state. Because ERB can select snippets dynamically, an unrelated snippet save can
also invalidate a working base. This favors conflict detection over silently
accepting a preview with changed dependencies.

Verification performed:

- Rails service/controller tests exercise normalization, region retention,
  publishing policy, proposal ownership/expiry/replay, scope warnings, category
  rejection, working/source conflicts, immediate property persistence, rendered
  head content, and newly added page-list configuration.
- Existing HugeRTE backport checks pass (10 tests, 248 assertions).
- JavaScript syntax checks and git whitespace checks pass.
- Browser execution of the actual `readWorking` function confirms unchecked radios,
  unchecked checkboxes, and disabled fields follow FormData submission semantics.
- Browser execution of the actual preview/restore functions confirms head styling
  changes appear and discard restores the original head and body node identities.

Full on-page CMS flow verification remains pending: the host application stylesheet
fails with Sass `wrong number of arguments (1 for 3) for rgb` when rendering a real
CMS page. The available preview browser does not expose `document.modelContext`;
real ChatGPT desktop tool discovery, invocation, and complete user interaction
scenarios have not been verified. Do not mark the OpenSpec change complete until
these checks and remaining task-specific verification are finished.

Final automated run with the local path gem selected:
`bin/rails test test imagine_cms_rb/test/services` — 37 tests, 110 assertions,
0 failures, 0 errors, 0 skips. Temporary browser-test records and servers were
removed/stopped, and sportshigh's original Gemfile/Gemfile.lock were restored.

Dijkstra independently reviewed the captured implementation and affected fixes.
Valid findings fixed: stale-base acknowledgement through immediate saves,
unversioned property-object duplication, omitted head previews, unchecked form
control serialization, and rejection of newly added list fields. Final independent
re-review reported no remaining actionable findings within the affected scope.
No commit, push, sync, archive, PR, or deployment was performed.
The final page-list feed URL consolidation, pagination URL, and list-owner marker
changes also received a separate independent Dijkstra recheck with no findings.


## User verification update (2026-11-06)

The user confirmed actual ChatGPT browser tool discovery in both preview and edit
mode. This supersedes the earlier discovery limitation, but does not establish the
full Apply/Save/Discard, undo, accumulation, or conflict scenarios. The host
LiveReload remnants were removed separately and development boot was verified.

Precommit automated checks were rerun with the user's current local path gem:
37 Rails tests / 110 assertions and 10 HugeRTE checks / 248 assertions passed.
The user authorized a CMS-side checkpoint commit. Pending verification remains
tracked in the active OpenSpec tasks; do not treat the checkpoint as completion.

Precommit Dijkstra review on 2026-11-06 identified one additional edit-mode defect:
checkbox/radio Apply updated the first control's value instead of checked state.
The adapter now updates checked state across matching choices while preserving
option values and Rails hidden defaults. The actual adapter passes targeted Node
regressions for checked-to-unchecked, unchecked-to-checked, radio selection changes,
and ordinary string fields. The affected fix was re-reviewed against form-submission
semantics. Staging is the intended next environment for the remaining interaction
checks; those checks do not prevent a checkpoint commit or preview deployment.
