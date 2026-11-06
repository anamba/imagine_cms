# Proposal

## Why

Editors should be able to describe a change while viewing the real CMS page and review its result in place. BB-652 establishes agent-assisted editing as an input mode for the existing editor and as a broader editing interface for less technical users in preview mode, with a path toward becoming their primary interface.

## What Changes

- Expose permission-scoped source discovery, source reads, and proposals through top-level WebMCP site tools in ChatGPT desktop's built-in browser.
- Identify CMS-rendered output with its source and whether that source is page-local or shared. Warn when requested scope differs from actual scope; usage counts are unnecessary.
- In edit mode, Apply changes the working content without saving; existing Save remains the persistence boundary.
- In preview mode, page content (including page-owned page-list configuration) accumulates in a working copy until the user selects Save. Page properties, templates, and snippets save individually when the user accepts their proposal.
- Reject proposals mixing staged page content with immediately saved sources. Tool guidance tells the agent to process one category first and defer the other.
- Render proposals through existing CMS rendering and content normalization, preserve unrelated unsaved edits, check stale source/working-copy state, and expire pending proposals.
- Keep applying and saving under explicit user control; tools can read and propose but cannot apply, save, or publish.
- Support editable regions, page lists, templates, and snippets according to existing permissions. Avoid introducing Ruby side effects through agent guidance; no separate execution sandbox project.

## Capabilities

### New Capabilities

- `cms-agent-editing`: Permission-scoped source discovery, scope warnings, proposal previews, working content, and user-controlled application and persistence.

### Modified Capabilities

None. This gem has no existing OpenSpec capability inventory.

## Impact

Changes belong in the Imagine CMS Ruby gem, particularly rendering helpers/extensions, CMS management controllers, page version persistence, the HugeRTE adapter, and preview/edit toolbars. Add proposal persistence and rendering metadata; preserve existing access levels, section restrictions, publishing behavior, search indexing, and cache invalidation. Test in sportshigh using the existing local path Gemfile workflow. Other browsers/agents, Elixir editions, usage-count tracking, and agent-initiated publishing are outside scope.

Issue: https://linear.app/biggerbird/issue/BB-652
