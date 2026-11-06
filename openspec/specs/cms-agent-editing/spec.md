# CMS agent editing

## Purpose

Let authorized editors request CMS changes through an agent, review them on the rendered page, and control when changes enter working content or persistent storage.

## Requirements

### Requirement: Permission-scoped site tools
The CMS SHALL expose top-level source discovery, source reads, and proposal tools only to authenticated editors with applicable rights. Each server operation MUST enforce source-specific permissions and page section restrictions. Agent tools MUST NOT apply, save, or publish changes.

#### Scenario: Authorized discovery
- **WHEN** an authorized editor opens a CMS page in the supported site-tools browser
- **THEN** top-level tools describe permitted sources, current working content, and proposal operations

#### Scenario: Unauthorized source access
- **WHEN** a user requests or proposes a source outside their permissions or allowed sections
- **THEN** the server denies access without returning protected source content or creating a proposal

#### Scenario: Unsupported browser
- **WHEN** site tools are unavailable or disabled
- **THEN** ordinary CMS editing and viewing continue to work

### Requirement: Source identity and scope
The CMS SHALL identify editable regions, page lists, templates, and snippets responsible for rendered output, distinguish page-local from shared sources, and expose their save category. It MUST warn before acceptance when requested scope conflicts with actual source scope. Usage counts SHALL NOT be required.

#### Scenario: Everywhere requested for local content
- **WHEN** a proposal requests an everywhere change to page-local content
- **THEN** the proposal warns that its source affects only this page and does not claim to update independent occurrences

#### Scenario: Local intent targets a shared source
- **WHEN** a proposal requests a page-only change to a shared source
- **THEN** the proposal warns that saving changes the shared source and can affect other pages

### Requirement: Rendered proposal review
Proposals SHALL preview through the CMS rendering and save-time normalization rules, identify affected sources and save behavior, and offer user-controlled acceptance or discard. Discard MUST preserve prior working content. Guidance MUST instruct agents to avoid introducing side effects and preserve existing Ruby unless the requested change requires it.

#### Scenario: Discard a proposal
- **WHEN** an editor discards a rendered proposal
- **THEN** the prior working view returns without saving or losing unrelated unsaved changes

#### Scenario: Rendering failure
- **WHEN** a proposal cannot render successfully
- **THEN** the CMS reports the failure without changing persisted sources or replacing the current working content

### Requirement: Staged page content in both modes
Applying page-content proposals SHALL modify working content without saving in edit and preview modes. Page-owned page-list configuration SHALL follow this rule. Editors MUST be able to accumulate content changes and explicitly Save or discard them. Edit-mode changes MUST participate in editor undo and dirty-state handling.

#### Scenario: Edit-mode application
- **WHEN** an editor applies a content proposal alongside manual edits
- **THEN** the proposal joins the working content without creating a revision, preserves other edits, marks the editor dirty, and can be undone

#### Scenario: Preview-mode accumulation
- **WHEN** an editor applies several content and page-list configuration proposals in preview mode
- **THEN** all applied changes appear together and remain unsaved until the editor selects Save

#### Scenario: Save accumulated content
- **WHEN** the editor selects Save on a valid working copy
- **THEN** the CMS saves a new page revision containing the applied edits and unchanged regions, honoring existing publishing rights and publishing policy, then navigates to that saved revision

#### Scenario: Leave with unsaved content
- **WHEN** the editor attempts to leave with applied unsaved content
- **THEN** the CMS warns about losing that content

### Requirement: Individually saved source changes
Page property, template, and snippet proposals SHALL persist the exact previewed source change only when the user explicitly selects Save change. Saving MUST respect existing permissions, version history, publishing policy, indexing, and cache invalidation. Prior unsaved page content MUST be retained.

#### Scenario: Save a shared snippet
- **WHEN** an authorized editor accepts a previewed snippet proposal
- **THEN** that snippet change is saved immediately and the page refreshes its rendered view while retaining staged content

#### Scenario: Template conflicts with working content
- **WHEN** a proposed template change would remove or invalidate a region with unsaved content
- **THEN** saving is blocked with an explanation until the editor resolves the conflict

### Requirement: Separate proposal categories
A proposal MUST contain only staged page-content changes or only immediately saved source changes. The server SHALL reject mixed proposals without partially applying them. Tool guidance SHALL recommend processing one category first and deferring the other when a user request spans both.

#### Scenario: Mixed proposal rejected
- **WHEN** a proposal combines page content with a property, template, or snippet change
- **THEN** the server rejects it and returns guidance to handle the categories separately

### Requirement: Proposal lifecycle and local working content
Pending proposals SHALL be bound to their editor, page, local working values, and expiry. Expired, foreign, or consumed proposals MUST NOT apply. Changes saved by other editors SHALL NOT block proposing, applying, or saving. Each content Save MUST create a revision and retain previous revisions. Applying a proposal MUST preserve unrelated local unsaved content.

#### Scenario: Another editor saves while a draft is open
- **WHEN** another editor saves content or changes publishing state while a draft is open
- **THEN** the draft can still be proposed, applied, and saved as a separate revision, retaining earlier revisions and respecting the current publication selection

#### Scenario: Working content changed since preview
- **WHEN** the editor modifies a proposal's target before applying it
- **THEN** the CMS rejects the stale application and preserves the newer working content

#### Scenario: Independent proposals
- **WHEN** an editor applies proposals to different unchanged regions
- **THEN** both changes are retained without silently replacing either

#### Scenario: Expired or foreign proposal
- **WHEN** an editor attempts to accept an expired proposal or another editor's proposal
- **THEN** the CMS refuses acceptance without exposing or changing its contents
