# Plan: Stage 2 - UX and Interface Enhancements

Improving user interaction with keyboard support and better history management.

## 1. History API Update
- File: `src/app/api/history/route.ts`
- Action: Modify the existing `DELETE` handler to accept an `id` query parameter for deleting a single calculation record from the database.

## 2. Keyboard Support (UI)
- File: `src/components/calculator/calculator-app.tsx`
- Action: Implement a global or scoped keyboard event listener.
    - Operators (`+`, `-`, `*`, `/`): Automatically select the corresponding binary operator.
    - `Enter` or `=`: Trigger `handleCalculate`.
    - `Escape`: Trigger `handleClear`.

## 3. History Item Deletion (UI)
- File: `src/components/calculator/calculator-app.tsx`
- Action:
    - Add a delete icon/button to each history item card, visible on hover.
    - Implement `deleteHistoryItem(id)` function calling the new API endpoint.
    - Animate the removal of the item using `AnimatePresence`.

## 4. Documentation & Quality Assurance
- Create `.gemini/improvements/stage-2/REPORT.md` with:
    - Task-specific Reviewer Checklist.
    - Task-specific Tester Guide.
- Run `npm run check`.
