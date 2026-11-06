# Design

## Context
See proposal.md for motivation. render_page_list_segment currently combines header, items, footer, numbered controls, and inline JavaScript. The segment action rebuilds the page and renders the named list with default options; template-only settings therefore need explicit propagation. page_list_items applies the author-configured initial offset before segment slicing and can reshuffle on every request. Existing header/footer templates can create a ul or table around items. No PRODUCT.md or DESIGN.md was found; the interaction review is based on source, not browser observation.

## Goals / Non-Goals
**Goals:** One append path owned by the gem; existing sites retain their behavior until opting in. Valid markup for wrapped items; no database changes.
**Non-Goals:** Snapshot consistency during edits, cursor pagination, virtualization, browser history/scroll restoration, server-side randomization snapshots, new UI frameworks, or a general pagination rewrite.

## Decisions

### One explicit mode with a legacy fallback
Use pagination_mode: none, numbered, load_more, infinite. Persist as the page-object pagination-mode setting. Resolve explicit template option, saved mode, then legacy use_pagination. Keep the existing legacy option precedence. Carry the resolved mode and all rendering inputs needed by subsequent segments through the page render, as existing template and batch-size options are carried today. Replace the editor pagination checkbox with a labeled selector; display legacy values correctly without eagerly rewriting saved content. Explain that the existing item count is the batch size. Leave calendar settings alone.

### Separate items from the surrounding frame
Extract item rendering so the initial page and append response use the same template/substitution behavior. Keep header/footer and existing numbered output semantics. On append-mode initial render, place a unique DOM comment marker immediately after the items and before the footer. Insert contextual fragments before that marker, using its actual parent so li and tr elements land inside their existing containers. Avoid adding a div between a ul and li or table and tr. Test browser-parsed table markup, including implicit tbody elements; position the marker in the actual item parent where parsing requires it. If this cannot preserve a supported template, revise the design before implementation rather than ship malformed markup.

### Opt-in structured segment response
Reuse the segment route with an explicit append query flag and JSON response containing rendered items HTML, next URL or null, and loaded count. Default segment requests still return their existing HTML. Separate response formats in caching and preserve preview/public authorization. Compute the next offset on the server from the rendered batch, retaining the initial configured item skip independently. Do not accept client template content or change query visibility rules. Preserve CMS owner markers around items and the current placeholder semantics.

### One browser operation
A gem-owned script initializes each list once and owns pending state, next URL, insertion marker, and controls. Manual clicks and an optional IntersectionObserver call the same operation. Validate response metadata before insertion; update progress only after successful insertion. Loading disables duplicate requests; failure keeps the URL and offers Retry with “Could not load more items.” Completion announces “All items loaded.” Use a polite status region; manual activation places keyboard focus at the first new item's appropriate focus target, while automatic loads do not move focus. Completion must not strand focus on a removed control. Keep selectors scoped to the list. Infinite mode retains a visible Load more button and observes its end sentinel; disconnect on exhaustion, and suspend on failure until a successful manual retry. Disconnect obsolete observers when lists are replaced.

### Seed randomized append requests
Generate a bounded seed per randomized append list at initial rendering and include it in every next URL and retry. Validate incoming seeds and use a local PRNG, never process-global srand. Reproduce the full ordered candidate set, then perform the seeded shuffle before segment slicing. Stabilize candidate enumeration and sort ties while preserving configured sort priorities, initial skip, individually selected-page semantics, and random-pool limits. Scope seed handling to the requested list so other lists rendered during the segment request are not affected. Leave the legacy randomization path unchanged for existing modes. The seed is public ordering input, never an authorization token. Initial-page and segment cache behavior must preserve the same seed/order relationship; a cached initial page may intentionally share a seed among visitors.

A seed freezes the shuffle, not the eligible content. Document duplicates or omissions when the candidate set changes between requests. Do not add sessions or snapshots. Infinite scroll remains opt-in and can make the site footer harder to reach; recommend manual Load more when footer access matters. JavaScript-disabled browsing retains initial results, matching the current JavaScript-dependent paginator; a new no-JavaScript route is outside this change.

## Risks / Trade-offs
- Arbitrary templates and browser HTML repair → test flat markup, ul/li, table/tbody/tr, footer placement, and CMS owner comments in a real browser.
- Existing template scripts or custom widgets → document an append-complete DOM event for host initialization; never replay the entire header/footer or initialization script on append.
- Existing hosts omit public assets → document the required gem script and verify its inclusion in the dummy app.
- Offset pagination during live edits → document its current consistency limit; do not claim a frozen result set.
- Public/preview response caching → exercise anonymous, authenticated, JSON, and HTML paths separately.

## Migration Plan
Ship opt-in; no migration or consumer-site changes. Existing lists resolve from the legacy flag. Authors can revert to numbered/none without changing templates or data. Do not deploy or update this site's gem dependency as part of implementation.

## Proposal review reconciliation
- Elon: Keep existing numbered behavior because deployed consumers depend on it. Consolidate manual/automatic append into one loader; omit snapshots, cursors, and history restoration. A carried seed replaces the initial restriction on randomized append without snapshots. Direct evidence is the existing segment renderer and per-request shuffle; production usage breadth is unknown.
- Mycroft: Consequences remain within one gem capability and its established consuming-template contract. Preserve that contract and keep state ownership in the gem; no wider platform redesign is justified.
- Norman: Selector labels describe visitor behavior. Define ready/loading/failure/completion feedback together, preserve reading position, retain retry/manual operation, and explain that seeded ordering is stable only while eligible content is unchanged. Browser verification remains an implementation task.

User refinement: Carry a shuffle seed forward in Load more URLs. Re-reviewed under Elon (no server state), Mycroft (local ordering input, existing visibility authority), and Norman (same controls and recovery behavior); incorporated into specs and tasks.
