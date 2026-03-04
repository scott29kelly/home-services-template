# Phase 15: Tech Debt Cleanup - Context

**Gathered:** 2026-03-04
**Status:** Ready for planning

<domain>
## Phase Boundary

Remove specific dead code: orphan API files (api/contact.js, api/banner.js), unused exports (getTestimonialsByService), and the vitals.ts no-op handler. Goal is zero dead code for the listed targets. No new capabilities added.

</domain>

<decisions>
## Implementation Decisions

### Deletion scope
- Focus on the 4 explicit targets named in the roadmap
- If trivial additional dead code is discovered during removal (e.g., an import only used by a deleted file), include it in the cleanup
- Do NOT expand into a broad dead-code sweep — keep changes predictable

### Vitals handler
- Remove vitals.ts entirely rather than fixing it
- It's a no-op — the project already has Lighthouse measurements and real monitoring
- Clean up any imports/references to the vitals handler

### API file handling
- Delete api/contact.js and api/banner.js after confirming no routes or imports reference them
- Grep codebase for any imports/references before deletion to ensure safety

### Verification approach
- Build must pass after all removals
- Grep for removed export names and file paths to confirm zero remaining references
- Run existing test suite to catch regressions

### Claude's Discretion
- Order of operations for removals
- Whether to remove files one-by-one or batch
- How to handle any cascading unused imports discovered during cleanup

</decisions>

<specifics>
## Specific Ideas

No specific requirements — open to standard approaches. The roadmap already names exact targets.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 15-tech-debt-cleanup*
*Context gathered: 2026-03-04*
