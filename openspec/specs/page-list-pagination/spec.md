# Page-list pagination

## Purpose
Let visitors browse additional CMS page-list results while preserving their existing reading context and supporting existing numbered lists.

## Requirements

### Requirement: Compatible pagination selection
The gem SHALL offer None, Page numbers, Load more, and Infinite scroll for list display through editor settings and template options. Existing use_pagination settings SHALL retain their meaning when no explicit mode is supplied. Calendar display SHALL remain unchanged.

#### Scenario: Existing configuration
- **WHEN** a list has use_pagination enabled and no explicit mode
- **THEN** it uses numbered replacement pagination as before

#### Scenario: Explicit mode
- **WHEN** an author selects Load more or Infinite scroll and saves the page
- **THEN** that mode survives reopening and is used on subsequent segment requests

### Requirement: Append results without duplicating structure
Append modes SHALL add the next batch after existing items, preserving their order, header, footer, and scroll position. Each list SHALL maintain independent progress. Completion SHALL hide the loading action and announce that no more results remain.

#### Scenario: Wrapped items
- **WHEN** a visitor loads another batch in a list whose header and footer wrap items in a ul or table
- **THEN** new items are inserted into that existing structure without duplicating its header, footer, or controls

#### Scenario: Last batch
- **WHEN** the final batch contains fewer items than the configured batch size
- **THEN** those items appear once and the control reports completion without requesting another batch

#### Scenario: Independent lists
- **WHEN** one of two lists loads more results
- **THEN** only that list's items and progress change

### Requirement: Recoverable loading
The loading action SHALL allow at most one pending request per list, display Loading…, and advance progress only after successful insertion. Failures SHALL preserve existing items and allow retry of the same batch. Controls SHALL be keyboard operable and status changes SHALL be announced accessibly without moving focus unexpectedly.

#### Scenario: Failure and retry
- **WHEN** a request fails and the visitor retries
- **THEN** the same batch is requested with existing items intact and no skipped batch

#### Scenario: Repeated activation
- **WHEN** the visitor activates Load more repeatedly while a request is pending
- **THEN** only one batch request proceeds

### Requirement: Automatic loading shares manual behavior
Infinite scroll SHALL invoke the same append behavior as Load more near the list end. It SHALL retain a manual control, stop automatic requests on failure or completion, and use manual loading when automatic observation is unsupported. After failure, only a successful manual retry SHALL re-enable automatic loading.

#### Scenario: Automatic load
- **WHEN** the end of an eligible infinite list approaches the viewport
- **THEN** one next batch is loaded using the same progress and recovery rules as manual loading

#### Scenario: Automatic loading unavailable
- **WHEN** the browser cannot observe the list end
- **THEN** Load more remains operable

### Requirement: Repeatable randomized append
Randomized append lists SHALL carry a per-list seed from initial rendering through every subsequent request and retry. With unchanged eligible content, options, and seed, the list SHALL reproduce the same full ordering before slicing batches. Seeds SHALL NOT change visibility or authorization.

#### Scenario: Randomized continuation
- **WHEN** a randomized append list loads successive batches without content changes
- **THEN** it retains one seed and shows successive slices of the same randomized order without repetition or omission

#### Scenario: Failed randomized request
- **WHEN** a randomized batch request is retried
- **THEN** it uses the same seed and offset as the failed request

### Requirement: Preserve public rendering boundaries
Append requests SHALL use the same published-content and preview authorization rules as ordinary list rendering. Existing HTML segment responses SHALL remain compatible, and append metadata SHALL not leak into responses of other formats or lists.

#### Scenario: Anonymous request
- **WHEN** an anonymous visitor requests an append batch
- **THEN** it contains only content available to that visitor through ordinary page rendering
