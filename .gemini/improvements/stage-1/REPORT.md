# Stage 1: Scientific Mode - Implementation Report

## 🛠 What was done
- **Database Schema Update**: Modified `prisma/schema.prisma` to make `operandB` optional (`Float?`). This allows storing unary operations (like square root) without a dummy second operand.
- **Core Logic Expansion**:
    - Added `sqrt` (Square Root) and `abs` (Absolute Value) operations to `src/lib/calculator.ts`.
    - Introduced a metadata property `isUnary` to distinguish between operation types.
    - Updated the Zod validation schema to handle optional `b` conditionally based on the operator.
    - Added constants support (`PI`, `Euler's number`).
- **API Enhancements**:
    - Updated `/api/calculate` to handle unary operations and save them correctly to the database.
    - Refactored `/api/history` to use the centralized operator metadata for symbol resolution.
- **UI/UX Improvements**:
    - Added a "Scientific" section in the calculator UI.
    - Implemented "Immediate Calculation" for unary operators: clicking `√x` or `|x|` triggers the calculation instantly if the first operand is present.
    - Added quick-insert buttons for `PI` and `E`.
    - Improved the expression display to support unary formats (e.g., `√(16) =` instead of `16 √ undefined`).
    - Added visual feedback (disabling Field B) when a unary operation is selected.

---

## 🔍 Reviewer Checklist (Code Quality & Architecture)
- [ ] **Type Safety**: Check `src/lib/calculator.ts`. Does the `CalculateRequest` type correctly reflect that `b` is optional?
- [ ] **Validation Logic**: Review the `calculateRequestSchema.refine` block. Is it robust against missing operands for binary operations?
- [ ] **Database Integrity**: Verify that `operandB` is correctly handled as `null` in the database for unary records.
- [ ] **UI Component Structure**: Review `src/components/calculator/calculator-app.tsx`. Is the split between `binaryOperators` and `unaryOperators` clean?
- [ ] **Constants Handling**: Ensure `CONSTANTS` are used consistently and formatted correctly.

---

## 🧪 Tester Guide (QA & Edge Cases)
### Functional Tests
- [ ] **Unary Ops**: Enter `16`, click `√x`. Result should be `4`.
- [ ] **Negative Sqrt**: Enter `-4`, click `√x`. Should show error: "Нельзя извлечь корень из отрицательного числа".
- [ ] **Absolute Value**: Enter `-10`, click `|x|`. Result should be `10`.
- [ ] **Constants**: Click `π (PI)`. Field A should fill with `3.141593`. Select `+`, click `e (Euler)`. Result of `PI + E` should be approx `5.859874`.
- [ ] **History**: Perform a unary calculation. Check the history panel. Does it display as `√(16)` or `| -5 |` correctly?

### Edge Cases
- [ ] **Zero**: `sqrt(0)` should be `0`.
- [ ] **Very large numbers**: `10**100` followed by `sqrt` or `abs`.
- [ ] **Field B interaction**: Select `+`, enter `5` in B. Then click `√x`. Field B should dim/disable, and calculation should ignore the `5` in B.
- [ ] **API Validation**: Try sending a POST to `/api/calculate` with operator `+` but without `b`. It should return a 400 error.

---

## ✅ Verification Result
- **Unit Tests**: `35 passed` (including new cases for unary ops and constants).
- **Typecheck**: Passed.
- **Lint**: Passed.
- **Build**: Successful.
