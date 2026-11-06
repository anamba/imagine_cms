# Proposal

## Why
Visitors need to browse additional page-list results without losing the items already on screen. The gem already fetches list segments, but only supports replacing the current segment.

## What Changes
- Add opt-in Load more and Infinite scroll modes to the gem's list display, alongside existing numbered pagination and no pagination.
- Share one append operation between manual and automatic loading, with loading feedback, retry, completion, and independent state per list.
- Preserve existing saved settings, template options, segment responses, and numbered pagination by default.
- Keep headers and footers rendered once, including templates that wrap items in lists or tables.
- Carry a per-list shuffle seed through append requests so randomized lists can load consistently without server-side snapshots.

## Capabilities

### New Capabilities
- `page-list-pagination`: Compatible pagination selection and incremental page-list browsing.

### Modified Capabilities
None.

## Impact
Changes belong to imagine_cms, not a consuming site's templates or dependency lockfile. Affected areas: list settings, helper option propagation, segment controller/rendering, public JavaScript, template reference, and gem tests. No database migration, new framework, or external service is needed. Automatic loading does not promise history restoration or snapshot consistency during concurrent content edits.
