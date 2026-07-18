# Spec: [Feature Name]

## Blueprint (Design)

### Context

> **Goal:** [What we're building]
> **Why:** [Business/user problem being solved]
> **Architectural Impact:** [Which systems, routes, or components are affected]

### Architecture

[Describe the technical design: components, routes, data flow, plugin pipeline, etc.]

```
[Diagrams, flow charts, or directory trees as needed]
```

### Anti-Patterns

<rules>
<rule id="[kebab-case-id]">
[NEVER/AVOID instruction explaining what not to do and why]
</rule>
</rules>

---

## Contract (Quality)

### Definition of Done

- [ ] [Observable, testable criterion]
- [ ] [Constitution-derived constraint from CLAUDE.md]
- [ ] Logic unit tested completely using `vitest` (no arbitrary DOM checks, pure script evaluation).
- [ ] Spec scenarios functionally verified through Playwright E2E tests (`tests/`).

### Regression Guardrails

<invariants>
<invariant id="[kebab-case-id]">
[Invariant statement that must never break.]
[What breaks if violated.]
</invariant>
</invariants>

### Scenarios

```gherkin
Feature: [Feature Name]

  Scenario: [Happy path]
    Given [precondition]
    When [action]
    Then [expected outcome]

  Scenario: [Edge case or error path]
    Given [precondition]
    When [action]
    Then [expected outcome]
```

---

## Implementation Files

| File | Responsibility |
|------|----------------|
| `src/...` | [What this file does for this feature] |

---

## Decision Log

### [Decision Title]

**Decision:** [What was decided]

**Reasoning:**
1. [Why this approach was chosen]

**Trade-offs:**
- [Pros and cons]
