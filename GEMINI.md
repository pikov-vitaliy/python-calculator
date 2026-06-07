# GEMINI.md - Web Calculator Instructional Context

This file provides instructional context for AI agents interacting with the Web Calculator project.

## Project Overview

The **Web Calculator** is a professional engineering tool built with modern web technologies. It supports complex mathematical expressions, operator precedence, parentheses, scientific functions, and persistent calculation history.

### Core Technology Stack
- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript (Strict Mode)
- **Styling:** Tailwind CSS 4 + Lucide Icons
- **Database:** SQLite managed via Prisma ORM
- **Logic:** Custom Shunting-yard expression parser
- **Testing:** Vitest
- **Animations:** Framer Motion

### Key Architectural Components
- `src/lib/calculator.ts`: Contains the mathematical core, including the tokenizer, Shunting-yard algorithm, and RPN evaluator.
- `src/app/api/calculate/route.ts`: API endpoint for processing expressions and saving results.
- `src/app/api/history/route.ts`: API endpoint for retrieving and managing (deleting) history.
- `src/components/calculator/calculator-app.tsx`: The main React component managing UI state and user interactions.
- `prisma/schema.prisma`: Defines the data model for `Calculation` records, supporting both legacy and modern expression formats.

## Building and Running

Commands should be executed in a PowerShell terminal (on Windows) or standard shell.

| Task | Command |
| --- | --- |
| **Install Dependencies** | `npm install` |
| **Setup Database** | `npm run db:setup` (Initializes SQLite and generates Prisma Client) |
| **Run Development Server** | `npm run dev` (Starts on `http://localhost:3000`) |
| **Run Tests** | `npm run test` |
| **Type Check** | `npm run typecheck` |
| **Lint** | `npm run lint` |
| **Build Production** | `npm run build` |
| **Full Quality Gate** | `npm run check` (Runs typecheck, test, lint, and build) |

## Development Conventions

### Coding Style & Standards
- **TypeScript:** Strict typing is enforced. Avoid `any`. Use interfaces for data structures (e.g., `HistoryItem`, `OperatorConfig`).
- **Functional Components:** Use React hooks (`useState`, `useCallback`, `useEffect`, `useMemo`) efficiently.
- **UI Components:** Built using Tailwind CSS 4. UI primitives are located in `src/components/ui`.
- **Error Handling:** Use Zod for input validation. Return structured error responses from APIs.

### Mathematical Logic
- **Parsing:** The parser uses a strict tokenizer. Numeric literals must follow a strict format.
- **Security:** Expression length is capped at 500 characters, and processing is limited to 200 tokens to prevent DoS.
- **Functions:** Functions like `sqrt` and `abs` require explicit parentheses (e.g., `sqrt(16)`).

### Testing Practices
- Tests are co-located with logic or in `src/lib/calculator.test.ts`.
- Always run `npm run test` before committing changes to ensure no regressions in the mathematical core.
- New features or bug fixes must include corresponding test cases.

### Git & SSDLC
- Follow a **Plan -> Implement -> Verify** cycle.
- Do not commit `.env`, `*.db`, or `*.db-journal` files.
- Ensure `npm run check` passes before finalizing any architectural changes.

## Data Model & Backward Compatibility
- The `Calculation` model in Prisma supports legacy fields (`operandA`, `operandB`, `operator`) and the modern `fullExpression` field.
- Logic in `src/app/page.tsx` and the history API reconstructs display strings for old records to maintain a seamless user experience.
