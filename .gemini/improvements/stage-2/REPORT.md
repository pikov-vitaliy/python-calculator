# Stage 2 Review Assets

## Scope

Stage 2 covers UX and interface changes for the calculator:

- single-item history deletion through `DELETE /api/history?id=<calculation-id>`;
- full history deletion through `DELETE /api/history`;
- keyboard shortcuts for operator selection, calculation, and clearing;
- history-item UI behavior, including delete controls, click-to-reuse behavior, and removal animation;
- verification that scientific-mode history records with `operandB = null` still render correctly.

Target files for review:

- `src/app/api/history/route.ts`
- `src/components/calculator/calculator-app.tsx`
- `src/lib/calculator.ts`
- `src/lib/calculator.test.ts`
- `prisma/schema.prisma`

This report is a review and test artifact, not an implementation sign-off. Stage 2 is ready only when the checklist below is satisfied and the local quality gate passes.

## Task-specific Reviewer Checklist

### Acceptance Gate

- [ ] Confirm the exact diff scope before review: no unrelated product, styling, dependency, Prisma, or generated-file churn outside the stage-2 task.
- [ ] Run `npm run check` from the repository root and require typecheck, tests, lint, and production build to pass.
- [ ] Treat any TypeScript syntax error, duplicated JSX tail, unused import, or broken component export as `NEEDS CHANGES`.
- [ ] Confirm the implementation does not weaken the existing CI/security posture. This aligns with NIST SSDF PW.8, ISO/IEC 27034 application-security verification, and least-privilege review practice.

### History API: `DELETE /api/history`

- [ ] Verify `DELETE /api/history` clears all history only when the `id` parameter is absent.
- [ ] Verify `DELETE /api/history?id=<id>` deletes exactly one `Calculation` row and does not call `deleteMany`.
- [ ] Verify `DELETE /api/history?id=` and whitespace-only ids do not clear all history. Expected behavior: controlled `400 Bad Request`.
- [ ] Verify malformed or nonexistent ids return a controlled `400` or `404`, not a generic `500`.
- [ ] Verify the id value is validated before database use. Recommended rule: non-empty Prisma `cuid()`-compatible string.
- [ ] Verify response bodies are explicit enough for the UI but do not expose internal Prisma errors.
- [ ] Verify the implementation has no authorization assumptions hidden in the API contract. If auth is added later, single-record delete must become object-level authorized.

Security rationale: this is input validation and safe failure handling under CWE-20, CWE-754, OWASP API Security Top 10 API1/API3 risk thinking, and defense-in-depth from NIST SSDF PW.7/PW.8.

### History UI: Single-item Deletion

- [ ] Verify each history item has its own delete button wired to `DELETE /api/history?id=<id>`.
- [ ] Verify the id is URL-encoded before interpolation into the request URL.
- [ ] Verify delete click uses `stopPropagation()` so it does not also trigger "apply result from history".
- [ ] Verify UI state is updated only after a successful response, or failed deletion is rolled back visibly.
- [ ] Verify the error path shows a user-visible failure and does not silently remove the item.
- [ ] Verify the history counter decrements after deleting one item and reaches zero after deleting the last item.
- [ ] Verify failed history records can be deleted but are not applied to input fields when clicked.
- [ ] Verify `AnimatePresence` uses stable `item.id` keys and does not cause duplicate cards, flicker, or wrong-item removal during rapid deletes.

### Keyboard Shortcuts

- [ ] Verify there is only one global `keydown` listener and it is removed in `useEffect` cleanup.
- [ ] Verify `Enter` and `=` trigger exactly one calculation when appropriate.
- [ ] Verify pressing `Enter` inside an input does not double-submit through both the input handler and the global handler.
- [ ] Verify `Escape` clears fields and result consistently without corrupting history state.
- [ ] Verify `+`, `-`, `*`, `/`, `^`, and `%` select operators only when focus is outside text inputs.
- [ ] Verify shortcuts do not hijack typing inside operand inputs, including negative numbers and decimal values.
- [ ] Verify shortcut behavior remains stable under React Strict Mode re-rendering.

### Accessibility and UX

- [ ] Verify delete buttons are keyboard reachable, not hover-only.
- [ ] Verify delete buttons have accessible names such as `aria-label="Удалить запись истории"`.
- [ ] Verify focus indicators are visible for operator buttons, history actions, clear-history, and theme toggle.
- [ ] Verify touch/mobile users can discover and trigger single-item deletion without hover.
- [ ] Verify color-only state is not the sole indicator of selected operator or delete/error state.

Accessibility rationale: WCAG 2.1.1 Keyboard, 2.4.7 Focus Visible, 3.3.1 Error Identification, and 4.1.2 Name/Role/Value.

### Data Integrity

- [ ] Verify unary operations (`sqrt`, `abs`) still store `operandB` as `null` and render correctly in history.
- [ ] Verify binary operations still require `operandB` and render `A symbol B`.
- [ ] Verify history order remains newest-first after adding and deleting records.
- [ ] Verify deletion does not change `lastResult`, current operands, selected operator, or current result unless the user explicitly performs those actions.
- [ ] Verify clearing all history does not clear calculator inputs unless that behavior is intentionally documented.

## Task-specific Tester Guide

### Environment Setup

Use PowerShell from the repository root:

```powershell
npm install
if (!(Test-Path .env)) { Copy-Item .env.example .env }
npm run db:setup
npm run dev
```

Open:

```text
http://localhost:3000
```

### Automated Verification

Run the full gate before manual acceptance:

```powershell
npm run check
```

If debugging a failure, run the gate in parts:

```powershell
npm run typecheck
npm run test
npm run lint
npm run build
```

### API Tests

1. Create at least three successful history records from the UI.
2. Delete one record through its UI delete button.
3. Refresh the page and confirm the deleted record does not reappear.
4. Clear all history and confirm the empty-history placeholder is shown.
5. With the dev server running, verify edge cases:

```powershell
Invoke-RestMethod -Method Delete 'http://localhost:3000/api/history?id='
Invoke-RestMethod -Method Delete 'http://localhost:3000/api/history?id=not-a-real-id'
Invoke-RestMethod -Method Delete 'http://localhost:3000/api/history'
```

Expected:

- empty `id` must not clear all history;
- nonexistent or malformed id must not produce an uncontrolled server error;
- no-id request clears all history only when the user chose the clear-all action.

### Manual UI Tests

- [ ] Calculate `2 + 3`; expected result: `5`, one new history item.
- [ ] Calculate `10 - 4`; expected result: `6`, newest item appears first.
- [ ] Calculate `16 sqrt`; expected result: `4`, history expression is `sqrt(16)` or equivalent root notation.
- [ ] Click a successful history item outside its delete button; expected: result copied to field A.
- [ ] Click the delete button on the middle history item; expected: only that item disappears and is not copied to field A.
- [ ] Delete the last item; expected: history count is `0` and the empty-history placeholder appears.
- [ ] Use clear-all history; expected: all records disappear and a page refresh keeps history empty.
- [ ] Rapidly delete several items; expected: no wrong-item deletion, duplicate cards, or stale count.

### Keyboard Tests

- [ ] Focus the page background and press `+`; expected: addition operator selected.
- [ ] Press `^`; expected: power operator selected.
- [ ] Press `%`; expected: modulo operator selected.
- [ ] Press `=` with valid operands and operator; expected: exactly one calculation and one history item.
- [ ] Press `Enter` with valid operands and operator; expected: exactly one calculation and one history item.
- [ ] Focus field A and type `-10`; expected: value is typed, operator is not changed to subtraction.
- [ ] Focus field B and type `3,5`; expected: value is typed, operator shortcuts are not triggered.
- [ ] Press `Enter` while focus is inside an operand input; expected: no duplicate history records.
- [ ] Press `Escape`; expected: fields, result, selected operator, and error message are cleared.

### Accessibility Tests

- [ ] Navigate all controls with `Tab` and `Shift+Tab`.
- [ ] Trigger item deletion with keyboard only.
- [ ] Confirm each icon-only button has an accessible name or visible tooltip backed by an accessible label.
- [ ] Confirm focus is visible on light and dark themes.
- [ ] Confirm mobile or touch interaction can delete one history item without relying on hover.

### Evidence to Capture

For final acceptance, capture:

- `npm run check` output summary;
- screenshot or short note showing three history records before single deletion;
- screenshot or short note showing only the selected record removed;
- note that `DELETE /api/history?id=` did not clear history;
- note that `Enter` inside an input did not create duplicate history records.

## Reviewer Verdict Rule

Use a binary verdict:

- `READY` only if all mandatory reviewer checks and tester guide items pass.
- `NEEDS CHANGES` if any API edge case, keyboard double-submit, accessibility requirement, build gate, or data-integrity check fails.
