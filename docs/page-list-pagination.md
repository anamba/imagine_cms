# Page-list pagination

Page lists support `pagination_mode: "none"`, `"numbered"`, `"load_more"`, or `"infinite"`. Editors choose the same modes under Display → Pagination. Display is the batch size; skip still excludes items before batching. Existing `use_pagination: 1` lists keep page numbers unless an explicit mode is supplied. Explicit template modes take precedence over editor settings, then saved mode, then the legacy flag. Calendar display is unchanged.

```erb
<%= page_list("News", folders: "news", item_count: 10,
      pagination_mode: "load_more", header: "<ul>", footer: "</ul>",
      template: '<li><a href="<#path#>"><#title#></a></li>') %>
```

Load more appends items, preserving the existing header, footer, and reading position. Infinite scroll performs the same operation near the list end and retains a manual button. A failed request offers Retry; automatic loading pauses until a manual retry succeeds. Once finished, the button disappears and “All items loaded.” is announced. Manual loading moves keyboard focus into the new batch without scrolling; automatic loading does not move focus. Prefer Load more when visitors need easy access to a site footer.

The gem automatically includes the standalone `imagine_cms/page_list.js` asset for append lists and registers it for precompilation. No jQuery or frontend framework is required for the new modes. Hosts with custom asset delivery must publish this asset under that logical name or include it through their pipeline. JavaScript-disabled visitors see the initial batch, as with the existing JavaScript paginator.

Each item template must render complete sibling items. Headers/footers can open and close a list or table; the gem inserts items at a DOM comment marker before the footer without adding an intervening div. Custom widgets should initialize new content using the bubbling event:

```javascript
document.addEventListener('imagine-cms:append', function (event) {
  // event.target is the item container; detail has key and count.
  initializeWidgets(event.target);
});
```

Header/footer scripts are not replayed. Make host widget initialization idempotent when scanning the container.

Randomized append lists use a per-list seed carried in every next URL and retry. A local seeded shuffle reproduces the full order before slicing; it does not affect global randomness. With unchanged candidates/options this prevents repeated or skipped items across batches. A seed does not freeze content: adding, removing, publishing, or changing sort fields while browsing can shift results. No server session or snapshot is kept; cached initial pages can share a seed.

The existing `/segment/[offset]/[list name]` endpoint returns HTML by default. Append requests use `append=1&seed=[unsigned 32-bit seed]` and receive JSON with `html` (items only), `count`, and `next_url` (null when complete). The server calculates continuation offsets. Append responses are not cached and follow ordinary published-page and authorized preview rules. The seed is public ordering input, never authorization. Preview next URLs preserve the requested version. History restoration and virtualization are outside this feature.
