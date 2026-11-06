# Design

## Context

See proposal.md for motivation and specs/cms-agent-editing/spec.md for behavior. The gem stores named regions as CmsPageObject records keyed by page, version, type, and name. Public rendering runs through ActionControllerExtensions#insert_object, placeholder substitution, ERB rendering, and Cms::ContentController#render_cms_page_to_string. Management rendering overrides insert_object to produce editing controls. HugeRTE runs inline with canonical source in hidden textareas and protected CMS/ERB tokens.

Content saving currently lives in Manage::CmsPagesController#edit_page_content: it normalizes submitted source, creates a page revision and object records, updates the index, and invokes cache sweeping. published_version=0 follows Latest; other publishing states must retain their existing semantics. Templates and snippets have their own versions. Public HTML may be cached; the preview toolbar is fetched from an authenticated endpoint.

## Goals / Non-Goals

**Goals:** Reuse the CMS's source model and persistence behavior; keep canonical source distinct from rendered HTML; make browser working content authoritative for unsaved edits; support broad preview-mode editing through existing permissions.

**Non-Goals:** Exact snippet reach counts, a site-wide dependency graph, a Ruby execution sandbox, new publishing semantics, or an agent-accessible save tool. No new support for non-CMS host application code editing.

## Decisions

### 1. Render source metadata and load privileged context separately

Instrument region insertion, page-list rendering, and snippet/template rendering to associate output with stable source descriptors: kind, source identity, page/version context, local/shared scope, and save category. Preserve nested ownership: a page-list item can display content originating on another page; it is not automatically local to the viewed page. Descriptors identify the actual owner and allow server resolution rather than accepting arbitrary model names or database fields from tools.

Use data attributes on existing wrappers where possible and inert boundary markers where adding a wrapper would break HTML. Template-owned output must remain distinguishable from nested region/snippet output. Resolve any ambiguous target through source discovery rather than guessing from identical visible text. A source descriptor may list multiple contributors.

Load privileged source content and tool registration through authenticated, permission-checked context after page load, following the preview toolbar pattern. Public cached HTML must not contain protected source content, pending proposals, or user capabilities. Register on the top-level document only when the supported API exists. Retain normal editing when absent. Verify the issue's recorded WebMCP API assumptions against current official documentation during implementation.

Alternative: infer ownership from DOM text or expose every database source globally. Rejected because neither reliably identifies ownership nor respects page/source permissions.

### 2. Separate working source, proposal preview, and persisted source

Represent working page content as a canonical source map plus a persisted base snapshot and a local generation. In edit mode this adapts the existing editor/textarea state; in preview mode it is a browser working copy. Read tools return current working source, not just the database. Proposal preview is an overlay over that working copy; accepting content updates the map, and discarding removes only the overlay. Do not inject final rendered HTML as editable canonical source.

Apply edit-mode content through HugeRTE's content/undo APIs and existing dirty/event handling. Keep manual edits and protected tokens intact. Preview mode renders the accumulated map in the real page context and adds Save / Discard changes plus an unload warning. Save uses the complete working content map so unchanged regions are retained. Avoid full reloads unless working state has been safely retained. Switching modes must transfer working content or require an explicit save/discard decision.

Alternative: persist each accepted region immediately. Rejected because agent-assisted edits are an input mode and content must accumulate before Save.

### 3. Store bounded proposals and preview exact normalized changes

Add a proposal record storing editor/session binding, page, category, canonical normalized changes, local working-source values, requested scope, warnings, expiry, and consumption state. Default pending lifetime: 30 minutes, checked on access with batched cleanup. Proposal IDs alone do not grant access. Protect mutation endpoints with existing session authentication and CSRF defenses.

Extract the relevant save-time normalization from the existing content controller into a shared operation used by preview and persistence. Refactor content revision persistence into a shared transaction used by existing Save and preview-mode Save; retain all unmodified objects in the new version. Render proposals with request-scoped source overrides through the real template/filter/placeholder/ERB path, without creating saved CMS revisions. Start with full-page rendering and extract replaceable output boundaries when reliable; use larger preview replacements for template-wide changes.

Before display, ensure a returned asynchronous preview still matches the current working generation. Acceptance checks explicitly submitted local working values; independent region proposals can coexist even when the overall generation advances. Overlapping stale proposals require regeneration. Applying/saving consumes a proposal once. Expired proposals do not silently remove already applied working content.

The CMS already executes trusted editorial ERB. Guidance requires avoiding side effects and preserving existing Ruby unless needed for the request. This change does not claim regex filters or database rollback create a Ruby sandbox.

### 4. Classify by persistence ownership

Staged: page-owned text/string regions and page-list configuration stored as content objects. Immediate: page properties, templates, snippets. Snippets are shared sources even if currently referenced once. A shared source stays shared regardless of where it appears. Page-local does not imply the current page when output comes from another page; discovery identifies the owner, and content changes require its own working-page context rather than silently changing foreign content in this page's Save.

Proposals include requested scope so the server can compare it with actual source scope. The on-page review displays any local/shared mismatch before acceptance, without estimating page counts. Tool guidance instructs the agent to resolve scope intent and to handle one save category at a time. Server validation rejects mixed categories before creating a usable proposal; there is no partial acceptance of a mixed batch.

For immediate proposals, the explicit user action is Save change. Saving a property/template/snippet uses the existing corresponding permissions and persistence rules. Maintain pending content across the resulting re-render. Before saving structural changes, render with the working map and reject changes that remove or invalidate dirty regions; the editor can save/discard/revise those edits first. No ordinary content Save may accidentally persist an unaccepted immediate proposal.

### 5. Preserve ordinary CMS revision saving

Agent-assisted edits use the same revision model as manual edits. Another editor saving, changing properties, publishing a revision, or editing a template/snippet does not invalidate a draft or prevent proposing, applying, or saving. Each content Save creates a revision and retains previous revisions. Publishing selects which revision is visible according to existing CMS rules.

Do not generate or require page fingerprints, base tokens, or site-wide snippet snapshots. Keep authorization, proposal expiry/ownership, single-use acceptance, and atomic persistence. A short page-row transaction allocates a distinct revision; it is not an editor lock or a reason to reject another editor's draft. Shared-source saves retain their existing model history behavior.

Only protect edits made in the same working copy while a proposal is being reviewed: if a submitted local target has changed since preview, require a fresh proposal for that target. Do not compare against newly persisted source as a proxy for local edits. Discarding all page-content edits fetches current context and starts a clean working copy; discarding one proposal preserves other working content.

## Risks / Trade-offs

- Complex/nested rendering boundaries → validate real templates, snippets, lists, and repeated instances; use a larger replacement boundary when needed.
- Shared structural changes can conflict with unsaved content → preflight against the working source map and block only conflicting saves.
- Cached public HTML can expose metadata accidentally → keep privileged context behind authenticated endpoints and test anonymous/cache paths.
- Existing save code combines normalization, versioning, and callbacks → extract narrowly and verify manual editor behavior as well as agent paths.
- UI acceptance is not proof of a physical human against arbitrary browser automation → expose no apply/save tool and require explicit page interaction; do not claim an absolute security boundary.

## Migration Plan

1. Add proposal storage and the shared rendering/persistence operations with regression coverage. Keep existing CMS behavior available when site tools are absent.
2. Add source descriptors, authenticated discovery, working-copy adapters, and proposal review controls. Follow established CMS styles; inspect actual states before durable UI implementation.
3. In sportshigh, temporarily select the local path gem and bundle as usual, run affected Rails/JavaScript checks, and manually test both modes in the ChatGPT desktop browser. Restore dependency selection after testing unless deliberately retained for development.
4. Run Dijkstra review and fix valid findings before declaring implementation complete. Sync/archive/commit/push require their own authorization.
5. Roll back by reverting tool/UI registration and endpoints; existing saved edits remain ordinary CMS data. Expire pending proposals; remove proposal storage only after disabling its consumers.
