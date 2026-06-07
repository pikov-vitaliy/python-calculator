# CODEX.md

Resume notes for Codex after context compaction.

## Project

- Path: `C:\Users\user\Documents\GitHub\python-calculator`
- Repository: `https://github.com/pikov-vitaliy/python-calculator`
- Current branch observed on 2026-06-07: `main`
- Current head observed on 2026-06-07: `af40767 chore: finalize CI and setup docs`
- Purpose: a small web calculator with calculation history. Keep the project simple unless the user explicitly asks for broader product work.

## Role

Act as a strict reviewer when the user asks for review, validation, stage reports, tester instructions, or readiness decisions.

Priority order:

1. Correctness.
2. Security and safe failure behavior.
3. Standards-backed SSDLC practice.
4. Minimal, task-scoped changes.
5. Clear reviewer/tester evidence.

For security and process guidance, align recommendations with NIST SSDF, OWASP, CWE, ISO/IEC 27001/27034, and least-privilege/defense-in-depth principles. Do not give a readiness verdict from descriptions alone; verify code, diff, commands, and behavior.

## Current Stack

- Next.js 16
- React 19
- TypeScript 5
- Tailwind CSS 4
- Prisma 6
- SQLite
- Vitest
- ESLint

## Important Files

- `src/components/calculator/calculator-app.tsx` - main calculator UI.
- `src/lib/calculator.ts` - calculation logic, validation, constants, formatting.
- `src/lib/calculator.test.ts` - unit tests for calculator logic.
- `src/app/api/calculate/route.ts` - calculation API.
- `src/app/api/history/route.ts` - history API.
- `prisma/schema.prisma` - SQLite schema.
- `.github/workflows/ci.yml` - CI quality gate.
- `README.md` - setup and Windows recovery notes.
- `.env.example` - safe local SQLite configuration example.
- `.gemini/improvements/stage-1/PLAN.md` - stage 1 plan.
- `.gemini/improvements/stage-1/REPORT.md` - stage 1 implementation report.
- `.gemini/improvements/stage-2/PLAN.md` - stage 2 plan.
- `.gemini/improvements/stage-2/REPORT.md` - stage 2 reviewer checklist and tester guide.

## Current Stage 2 Documentation Task

The user asked to create stage 2 documentation:

- `.gemini/improvements/stage-2/PLAN.md`
- `.gemini/improvements/stage-2/REPORT.md`

`REPORT.md` must contain task-specific reviewer and tester guidance for:

- single history-item deletion;
- full history clearing;
- keyboard shortcuts;
- history UI and accessibility behavior;
- quality gate verification with `npm run check`.

Do not create a second Codex instruction file. Keep this file, `CODEX.md`, as the single root resume/instruction document.

## Reviewer Position For Stage 2

Treat these as critical checks:

- `DELETE /api/history` clears all history only when no `id` is provided.
- `DELETE /api/history?id=<id>` deletes exactly one record.
- Empty `id`, whitespace-only `id`, malformed `id`, and nonexistent `id` must fail in a controlled way and must not clear all history.
- The UI delete action must not also trigger "apply from history".
- Record ids should be URL-encoded before being placed in a request URL.
- Keyboard handling must not double-submit on `Enter`.
- Keyboard shortcuts must not hijack typing in operand inputs.
- There must be one global `keydown` listener with cleanup.
- Delete controls must be keyboard-accessible and not rely only on hover.
- `operandB = null` history rows from unary operations must still render correctly.
- Any TypeScript, lint, test, build, JSX, or broken export failure means `NEEDS CHANGES`.

Use a binary reviewer verdict when asked:

- `READY` only when the requested checks and verification pass.
- `NEEDS CHANGES` when any mandatory check fails.

## Commands

```powershell
npm run dev
npm run db:setup
npm run typecheck
npm run test
npm run lint
npm run build
npm run check
```

On Windows, run `npm run db:setup` before `npm run dev` when Prisma files may need regeneration. A running dev server can lock Prisma's Windows engine DLL.

## Verification Baseline

Last observed full local gate on 2026-06-07:

```powershell
npm run check
```

Observed result:

- `tsc --noEmit` passed.
- `vitest run` passed: 1 test file, 35 tests.
- `eslint .` passed.
- `next build` passed.

This baseline only proves the working tree at that moment built successfully. Re-run the gate after any relevant code or dependency change.

## Change Discipline

- The working tree may already be dirty. Never revert user changes unless explicitly asked.
- Do not refactor for style.
- Do not expand functionality without an explicit user request.
- Keep documentation and reviewer artifacts fact-based, not promotional.
- Prefer `rg` and PowerShell `-LiteralPath` for searches and paths.
- Before final readiness claims, inspect the actual diff and run the relevant gate.

## Notes

- `.vibe.md` exists but may contain stale structure or commit information.
- Qwen, Gemini, GitKraken, and other assistant artifacts are project tooling/context unless the user explicitly decides they are product artifacts.
