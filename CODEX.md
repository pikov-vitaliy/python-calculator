# CODEX.md

Краткое состояние проекта для возврата после схлопывания контекста.

## Проект

- Путь: `C:\Users\user\Documents\GitHub\python-calculator`
- Репозиторий: `https://github.com/pikov-vitaliy/python-calculator`
- Ветка: `codex/project-cleanup-tests-ci`
- Базовый коммит проверки перед финализацией: `2ea58e8 chore: add Windows recovery notes and fix db setup`
- Назначение: простой веб-калькулятор, без дальнейшего "окультуривания" без явной необходимости.

## Текущее состояние

- Рабочее дерево было чистым до создания этого файла.
- Проект собирается и проходит локальный quality gate.
- Проверка выполнена 2026-06-06 командой:

```powershell
npm run check
```

Результат:

- `tsc --noEmit` проходит.
- `vitest run` проходит: 1 test file, 27 tests.
- `eslint .` проходит.
- `next build` проходит.

## Стек

- Next.js 16
- React 19
- TypeScript 5
- Tailwind CSS 4
- Prisma 6
- SQLite
- Vitest
- ESLint

## Основные файлы

- `src/components/calculator/calculator-app.tsx` - главный UI калькулятора.
- `src/lib/calculator.ts` - бизнес-логика вычислений, валидация и форматирование.
- `src/lib/calculator.test.ts` - unit-тесты бизнес-логики.
- `src/app/api/calculate/route.ts` - API вычисления.
- `src/app/api/history/route.ts` - API истории.
- `prisma/schema.prisma` - схема SQLite.
- `.github/workflows/ci.yml` - CI quality gate.
- `README.md` - актуальные команды запуска и Windows recovery notes.
- `.env.example` - безопасный пример локальной SQLite-конфигурации.

## Команды

```powershell
npm run dev
npm run db:setup
npm run test
npm run check
```

На Windows `npm run db:setup` лучше выполнять до `npm run dev`, чтобы Prisma могла обновить engine DLL без блокировки dev-сервером.

## Решение по дальнейшим правкам

Проект сейчас не требует дополнительных косметических или архитектурных изменений. Если задача не связана с реальным багом, регрессией, зависимостью, безопасностью или явной просьбой пользователя, код лучше не менять.

Минимальная политика сопровождения:

- не рефакторить ради стиля;
- не расширять функциональность без запроса;
- перед пушем выполнять `npm run check`;
- при изменениях в Prisma сначала выполнять `npm run db:setup`;
- держать проект как простой калькулятор.

## Финальные замечания по сопровождению

- CI должен оставаться read-only: `permissions: contents: read`, `actions/checkout` с `persist-credentials: false`.
- Быстрый старт должен работать из fresh clone, без привязки к локальному пути пользователя.
- Qwen/GitKraken/другие AI-assistant артефакты считаются локальной оснасткой и не входят в продуктовый репозиторий без отдельного решения.

## Примечание

Файл `.vibe.md` в репозитории существует, но содержит устаревшие сведения о структуре и старых коммитах. Для текущего возврата в работу использовать этот `CODEX.md`.
