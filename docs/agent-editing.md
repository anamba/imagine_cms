# Agent-assisted CMS editing

BB-652 is implemented as a staging-testing checkpoint. The active OpenSpec change
is `agent-assisted-cms-editing`; its remaining end-to-end checks are still open.

## Interaction

Tools run on the top-level page through `document.modelContext.registerTool`.
`cms_read_page` reads working source; `cms_propose_change` creates an on-page
preview for user review. No tool applies, saves, or publishes.

- Edit mode: Apply updates the open editor and its undo/dirty state. Save uses the
  normal editor form submission and shared content writer to create an ordinary CMS revision.
- Preview mode: Apply accumulates page content and page-owned page-list settings.
  Save creates a revision containing that working content.
- Page properties, templates, and snippets: Save change persists the proposal
  immediately, according to existing permissions and publishing behavior.
- A proposal cannot mix staged content with immediately saved sources. Guidance
  recommends handling one category first and deferring the other.

The review bar is pinned to the viewport. Discarding a proposal restores the prior
working view; Discard changes fetches current saved context and clears working
content only after that fetch succeeds.

## Revisions and other editors

Agent-assisted editing follows the existing CMS revision model. If two editors
save, both saved revisions remain available. Publishing selects the visible
revision. Do not add page/source fingerprints, base tokens, or agent-only save
conflict detection. Another editor's save or publication change does not block a
draft from being proposed, applied, or saved.

ContentWriter saves atomically and allocates a distinct page revision under a
short database row lock. It retains unsubmitted regions, preserves the live
publication selection, and follows existing basic-editor publishing rules.
Templates and snippets retain their normal model histories.

Only protect the same editor's local input while a proposal is being reviewed:
if that editor changes a submitted target before Apply, request a fresh proposal.
That check must not use newly saved database content as a proxy for local edits.
Permission checks, CSRF, proposal ownership, expiry and single-use acceptance
remain enforced. Structural changes must preserve existing unsaved regions.

## Sources and rendering

Sources identify their actual owner, page-local/shared scope, and save category.
Warn when requested scope differs from actual scope. Similar text does not prove
sharing; a snippet remains shared even if referenced only once. Usage counts and
a site-wide dependency graph are unnecessary.

Rendered list items identify their actual page owner. Read context provides
permission-checked navigation to that page for editing its content or properties.

Canonical source retains CMS placeholders and ERB; rendered HTML is its preview,
not editable canonical source. Preview and Save share editorial normalization.
This is not an execution sandbox: agent guidance must avoid introducing side
effects and preserve existing Ruby unless the requested edit requires changing it.

## Setup and maintenance

Install the engine's CreateCmsAgentProposals migration in the host and run it
before testing proposal writes. Authenticated requests use
`/manage/cms_pages/:id/agent/` endpoints. Proposal lifetime is 30 minutes;
`CmsAgentProposal.cleanup_expired!` removes up to 500 expired records per call.

Official API reference checked 2026-11-03: https://learn.chatgpt.com/docs/webmcp .
Feature-detect tool support and retain normal CMS behavior when unavailable.
On 2026-11-06 the user confirmed ChatGPT browser discovery in both modes.

## Verification

Rails regressions cover revision preservation, publishing behavior, normalization,
region retention, permissions, proposal lifecycle, scope/category validation,
rendered previews, and page-list configuration. JavaScript regressions execute the
actual editor adapter and discard operation against representative controls/state.
They cover radio/checkbox Apply and preserving drafts when discard refresh fails.

The page/source fingerprint implementation and related false-conflict patches
were removed after the user clarified revision semantics on 2026-11-06. Older
requests may include unused base parameters; they are not required or checked.
No draft needs a fresh fingerprint to Save.

Full ChatGPT Apply/Save/Discard, HugeRTE undo, shared-source, and mode-switch
scenarios remain to be verified locally or on staging. These remaining checks do
not prevent a checkpoint commit or preview deployment. The OpenSpec change remains
open until they are verified.


Latest automated checks after removing concurrency gates: combined host/CMS Rails
suite 37 tests, 115 assertions, no failures/errors/skips; HugeRTE checks 10 tests,
248 assertions, all passing; JavaScript adapter/discard regressions, syntax checks,
whitespace checks, and strict OpenSpec validation pass. One regression sends an
older browser's base token and verifies Save succeeds while retaining both editors'
revisions. Source/property/template edits continue to follow ordinary CMS behavior.
Independent Dijkstra review of token removal, ordinary form Save, revision retention,
and publication behavior found no actionable issues. Reviewer also ran the
JavaScript regressions and whitespace check successfully.
