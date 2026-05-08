---
name: UI/UX Accessibility Auditor
description: >
  MANDATORY skill that MUST be automatically triggered AFTER any frontend change — creating new components,
  pages, or features; modifying existing UI code; fixing visual or functional bugs; refactoring frontend code;
  or adding new routes/views. This skill MUST also be used proactively whenever you write, modify, or refactor
  ANY file in frontend/src/ that contains JSX, CSS, or UI-related logic. DO NOT skip this skill. It runs
  automatically after frontend changes to audit accessibility (WCAG 2.1 AA), UI convention compliance, and UX
  quality. It also proactively scans for broader improvements beyond the specific change. Keywords that MUST
  trigger this skill: implement, create, add, modify, update, refactor, fix, bug, feature, component, page,
  view, modal, form, button, input, table, card, layout, style, design, UI, UX, a11y, accessibility, responsive,
  screen reader, keyboard, aria, focus, tab, dialog, menu, dropdown, tooltip, pagination, empty state, loading.
---

# UI/UX Accessibility Auditor

**CRITICAL: This skill is MANDATORY and must be triggered AUTOMATICALLY after any frontend code change.**

This skill audits every frontend change against three pillars: **Accessibility**, **UI Convention Compliance**, and **UX Quality**. It also proactively scans neighboring code for broader improvement opportunities.

## AUTOMATIC Trigger Conditions (NO EXCEPTIONS)

This skill runs after ANY of these actions:

1. Creating a new `.tsx` file in `frontend/src/`
2. Modifying an existing `.tsx` or `.ts` file in `frontend/src/` that contains JSX or UI logic
3. Adding new routes, pages, or views
4. Fixing bugs that affect the UI (visual, layout, interaction)
5. Refactoring components, hooks, or UI-related code
6. Adding or modifying CSS/Tailwind classes in component files

## Audit Workflow

### Step 1: Identify Scope

Determine which files changed. Read each changed file completely. Then identify neighboring files in the same feature directory that may need review (parent pages, sibling components, related hooks).

### Step 2: Run the Audit Checklist

For each changed file, systematically check every category below. Read `references/audit-checklist.md` for the full detailed checklist with examples.

#### Category A: Accessibility (WCAG 2.1 AA)

- [ ] **Semantic HTML:** No `<div onClick>` — all interactive elements use `Button`, `ClickableCard`, or proper semantic elements
- [ ] **ARIA attributes:** Every icon-only button has `aria-label`. Dialogs have `aria-labelledby` or `aria-label`. Dynamic content uses `aria-live` where appropriate
- [ ] **Keyboard navigation:** All interactive elements are reachable via Tab. Enter/Space activates buttons. No broken `tabIndex` usage. Focus order is logical
- [ ] **Focus management:** Modals trap focus and return focus on close. Focus rings (`focus-visible`) are not removed. Focus moves to new content after route changes or dynamic updates
- [ ] **Form labels:** Every input has an associated `<Label>` with matching `htmlFor` + `id`. Required fields are indicated. Error messages are associated with their inputs
- [ ] **Color and contrast:** No information conveyed by color alone. Text contrast meets AA ratio (4.5:1 normal, 3:1 large). Status uses both color + text/icon
- [ ] **Images and media:** All `<img>` have meaningful `alt` text. Decorative images use `alt=""`. Icons paired with text don't need labels; icon-only elements do
- [ ] **Screen reader announcements:** Loading states, errors, success messages, and dynamic updates are announced. `role="alert"` or `aria-live` used for toasts and inline errors
- [ ] **Motion and animation:** No auto-playing animations that can't be paused. `prefers-reduced-motion` respected if animations exist

#### Category B: UI Convention Compliance (per `docs/guides/ui-conventions.md`)

- [ ] **Allowed components only:** All UI uses components from `@/components/ui/` and `@/components/common/`. No raw `<button>`, `<input>`, `<select>`, `<textarea>`, `<dialog>`, `<table>`
- [ ] **Design tokens:** Uses `bg-background`, `text-foreground`, `text-muted-foreground`, `border`, `bg-primary`, `text-destructive`, `bg-muted`. No hardcoded Tailwind colors (`text-blue-600`) or hex (`#123456`) when a token exists
- [ ] **Button variants:** Uses correct variant (`default`, `outline`, `ghost`, `destructive`, `link`). No inline color overrides like `className="bg-indigo-600 ..."`
- [ ] **Mandatory UI states:** Loading → `Skeleton`, Empty → `EmptyState` with CTA, Error → `Alert` with readable message. No raw error objects, no handmade spinners
- [ ] **Toast usage:** `toast.success/error/info` from `sonner`. No `alert()`, no `console.log()` for user-facing messages
- [ ] **File size:** Under 400 lines. If approaching, extract subcomponents, hooks, or helpers
- [ ] **No `any` type:** Proper TypeScript interfaces, `[key: string]: unknown` escape hatch, error narrowing with `instanceof Error`
- [ ] **Pagination:** Uses `Pagination` component. No re-implemented prev/next buttons
- [ ] **Print:** Uses `openPrintWindow` from `@/lib/print` for print actions

#### Category C: UX Quality

- [ ] **Responsive behavior:** Layout works on mobile (xs: 320px), tablet (md: 768px), and desktop (lg: 1024px). No horizontal overflow on small screens
- [ ] **Loading states:** Data views show Skeleton immediately, not blank screens. No flash of empty content
- [ ] **Error recovery:** Errors show actionable messages. User can retry or navigate away. Forms preserve input on validation error
- [ ] **Confirmation for destructive actions:** Delete, cancel, irreversible actions use `AlertDialog` confirmation
- [ ] **Navigation consistency:** Back buttons use `navigate(-1)`, not hardcoded routes. Breadcrumbs reflect current location
- [ ] **Status communication:** Background operations show progress indication. Long operations have spinner or progress bar
- [ ] **Form UX:** Validation is clear and immediate. Required fields marked. Defaults are sensible. Autocomplete hints set where appropriate

### Step 3: Scan for Broader Improvements

Beyond the specific change, look for improvement opportunities in the same feature area:

1. **Check sibling components** in the same directory for similar violations
2. **Check the parent page** for missing UI states (loading, empty, error)
3. **Check for common anti-patterns** listed in `references/common-violations.md`
4. **Check for accessibility debt**: `eslint-disable` comments hiding a11y issues, missing `aria-label` on buttons, `<div onClick>` patterns
5. **Check for UX improvements**: confusing labels, missing confirmations, inconsistent patterns across similar views

### Step 4: Report Findings

Present findings in this structured format:

```
## UI/UX Accessibility Audit Report

### Files Changed
- `path/to/file.tsx` — brief description of what changed

### Critical Issues (must fix)
These are accessibility blockers or convention violations that will fail CI:

1. **[A11y|Convention|UX]** Description of the issue
   - File: `path/to/file.tsx:line`
   - Fix: Specific action to resolve

### Warnings (should fix)
These are quality issues that degrade the user experience:

1. **[A11y|Convention|UX]** Description
   - File: `path/to/file.tsx:line`
   - Recommendation: How to improve

### Improvement Opportunities
Broader improvements found in the same feature area:

1. **[Category]** Description of the opportunity
   - Scope: Files/areas affected
   - Benefit: Why this matters

### Passed Checks
Brief summary of what passed: "All ARIA attributes present, design tokens used correctly, loading/empty/error states handled"
```

### Step 5: Fix Critical Issues

After reporting, **immediately fix all Critical Issues** unless the user explicitly asks to review first. Then re-audit the fix to confirm it passes.

## Severity Guidelines

| Severity | Criteria | Action |
|---|---|---|
| **Critical** | ESLint a11y errors, broken keyboard nav, missing labels on interactive elements, forbidden native HTML, hardcoded colors when tokens exist, missing UI states, file > 400 lines | Fix immediately |
| **Warning** | Suboptimal ARIA, missing confirmation dialogs, missing responsive handling, inconsistent patterns, `eslint-disable` hiding real issues | Recommend and offer to fix |
| **Improvement** | UX enhancements, DRY opportunities, better error messages, accessibility beyond minimum | Log for future consideration |

## Key Reference Files

- **UI Conventions:** `docs/guides/ui-conventions.md` — the authoritative source for all UI rules
- **ESLint config:** `frontend/eslint.config.js` — automated rule enforcement (28 jsx-a11y rules)
- **Design tokens:** `frontend/src/styles/globals.css` — all CSS variables and theme tokens
- **UI components:** `frontend/src/components/ui/` — the 24 allowed primitives
- **Common components:** `frontend/src/components/common/` — shared feature components

## Integration with Other Skills

This skill coordinates with:
- **Frontend Development conventions** — loaded for React/TS architectural guidance
- **Unit Testing Enforcement** — triggered after fixes to ensure test coverage
- **document-fix** — triggered if a bug fix led to the audit findings

Always run this audit AFTER implementing changes but BEFORE considering the task complete. The audit is part of the definition of done.
