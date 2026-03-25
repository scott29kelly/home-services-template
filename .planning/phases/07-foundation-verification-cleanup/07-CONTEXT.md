# Phase 7: Foundation Verification & Tech Debt Cleanup - Context

**Gathered:** 2026-02-25
**Status:** Ready for planning

<domain>
## Phase Boundary

Formally verify Phase 01 pre-GSD work (CFG-01 to CFG-06) against acceptance criteria, update REQUIREMENTS.md traceability for SEO-01, and close specific tech debt items from the milestone audit. No new features — verification and cleanup only.

</domain>

<decisions>
## Implementation Decisions

### Verification evidence
- Verify each CFG requirement by inspecting the codebase against its acceptance criteria checkboxes
- Evidence per criterion: reference the specific file(s) and code that satisfy each checkbox
- Mark checkboxes in REQUIREMENTS.md as verified (checked) as part of this phase
- No automated test suite required — manual code inspection with documented findings is sufficient for pre-GSD work

### Failure handling
- If a CFG criterion is not satisfied, document the gap in VERIFICATION.md with severity (critical/minor)
- Minor gaps (cosmetic, non-functional): document and defer — do not fix in this phase
- Critical gaps (broken functionality, missing core behavior): flag for immediate attention but do not expand phase scope — create a follow-up item instead
- Pass/fail is per-checkbox, not per-requirement — partial passes are expected and fine to document

### Cleanup discovery scope
- Stick strictly to the listed tech debt items: remove `getPostsByTag()` dead code, fix noindex meta tag placement
- If related issues are discovered during verification, document them in VERIFICATION.md under a "Discovered Issues" section but do not fix them
- This keeps the phase predictable and LOW complexity as estimated

### VERIFICATION.md structure
- One section per requirement (CFG-01 through CFG-06)
- Each section: requirement name, acceptance criteria checkboxes with pass/fail, evidence (file paths and brief explanation)
- Summary section at top with overall pass rate
- Discovered issues section at bottom if any

### Claude's Discretion
- Exact wording of verification evidence
- Order of verification (can verify in any logical sequence)
- Level of detail in evidence descriptions — enough to be convincing, not exhaustive
- How to structure the SEO-01 checkbox updates

</decisions>

<specifics>
## Specific Ideas

No specific requirements — open to standard approaches. User deferred all decisions to best practice judgment given the home services industry context and project scope.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 07-foundation-verification-cleanup*
*Context gathered: 2026-02-25*
