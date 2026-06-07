# Plan: Stage 3 - Expression Parser (Remediation)

Following the reviewer's feedback, this plan addresses architectural gaps and regressions in the Stage 3 implementation.

## 1. API Security & Validation
- **File**: `src/app/api/history/route.ts`
- **Action**: Fix the `DELETE` handler. Explicitly check if the `id` parameter is provided. If `id` is present but invalid/empty, return an error instead of falling back to "delete all".
- **Action**: Use Zod or manual strict checks for the `id` parameter.

## 2. Type Safety & Contract Alignment
- **File**: `src/app/page.tsx`
- **Action**: Update the server-side mapping of calculations to `HistoryItem`. Use the same reconstruction logic as in `/api/history` to handle legacy records (those without `fullExpression`).
- **File**: `src/components/calculator/calculator-app.tsx`
- **Action**: Ensure the `HistoryItem` interface matches the one used in the API and page.

## 3. Operator Logic Cleanup
- **Files**: `src/components/calculator/calculator-app.tsx`, `src/app/api/history/route.ts`
- **Action**: Remove any remaining references to `isUnary`. Use `isFunction` from the new `OperatorConfig` where applicable.

## 4. Documentation
- **Action**: Ensure both `PLAN.md` and `REPORT.md` are present in `.gemini/improvements/stage-3/`.

## 5. Verification
- **Action**: Run `npm run typecheck` and `npm run test`.
- **Action**: Verify the UI-API contract manually by checking the payload in `handleCalculate`.
