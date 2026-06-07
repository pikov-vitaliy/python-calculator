# Plan: Stage 1 - Scientific Mode

Implementing expanded mathematical operations and adapting the system for unary operators.

## 1. Database Update
- File: `prisma/schema.prisma`
- Action: Change `operandB Float` to `operandB Float?`.
- Command: `npx prisma db push` to apply changes to SQLite.

## 2. Core Logic Enhancements
- File: `src/lib/calculator.ts`
- Add `sqrt` and `abs` to `OPERATORS`.
- Introduce `isUnary` property to operators metadata.
- Update `calculateRequestSchema` using `z.preprocess` or `z.refine` to allow missing `b` for unary ops.
- Add `constants` (PI, E) as helper functions or exported values.

## 3. API & History
- Files: `src/app/api/calculate/route.ts`, `src/app/api/history/route.ts`
- Ensure API correctly saves and retrieves records where `operandB` is null.
- Update history display to handle unary expressions (e.g., `√ (16) = 4` vs `5 + 3 = 8`).

## 4. UI Implementation
- File: `src/components/calculator/calculator-app.tsx`
- Add a "Scientific" button group.
- Implement "Immediate Calculation" for unary operations:
    - If user clicks `sqrt`, use current `operandA`, calculate, and show result.
- Add "PI" and "E" buttons to quickly fill the current operand field.

## 5. Quality Assurance & Documentation
- Update `src/lib/calculator.test.ts` with new cases.
- Create `.gemini/improvements/stage-1/REPORT.md` with sections:
    - **Implementation Details** (for the user)
    - **Reviewer Checklist** (architecture and code quality)
    - **Tester Guide** (test cases and edge cases)

## 6. Verification
- Run `npm run check` (typecheck, test, lint, build).
