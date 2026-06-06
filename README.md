# Web Calculator

Веб-калькулятор на Next.js 16 с TypeScript, Tailwind CSS 4, Prisma и SQLite.
Приложение выполняет базовые вычисления, сохраняет историю операций и поддерживает светлую/темную тему.

## Требования

- Node.js `20.19.0` или новее.
- npm `10` или новее.
- PowerShell для локальных команд на Windows.

Проверка окружения:

```powershell
node --version
npm --version
```

## Быстрый запуск в PowerShell

Из любого PowerShell-терминала:

```powershell
cd "C:\Users\user\Documents\GitHub\python-calculator"
npm install
if (!(Test-Path .env)) { Copy-Item .env.example .env }
npm run db:setup
npm run dev
```

После запуска откройте:

```text
http://localhost:3000
```

Если зависимости уже установлены и база уже подготовлена, достаточно:

```powershell
cd "C:\Users\user\Documents\GitHub\python-calculator"
npm run dev
```

## База данных

Проект использует SQLite через Prisma. Переменная окружения хранится в `.env`:

```env
DATABASE_URL=file:./db/calculator.db
```

Для Prisma относительный путь SQLite считается от папки `prisma`, поэтому файл базы создается как:

```text
prisma/db/calculator.db
```

Файлы `.env`, `*.db` и `*.db-journal` не коммитятся.

## Доступные команды

| Команда | Назначение |
| --- | --- |
| `npm run dev` | Запуск dev-сервера на `http://localhost:3000` |
| `npm run db:setup` | Применить Prisma-схему к SQLite и сгенерировать Prisma Client |
| `npm run db:push` | Применить Prisma-схему к SQLite |
| `npm run db:generate` | Сгенерировать Prisma Client |
| `npm run typecheck` | Проверить TypeScript без сборки |
| `npm run test` | Запустить unit-тесты Vitest |
| `npm run lint` | Запустить ESLint |
| `npm run build` | Собрать production-версию |
| `npm run start` | Запустить собранную production-версию |
| `npm run check` | Полный локальный quality gate: typecheck, tests, lint, build |

## Production-запуск

```powershell
npm run db:setup
npm run build
npm run start
```

## Тесты

Тесты находятся рядом с проверяемой бизнес-логикой:

```text
src/lib/calculator.test.ts
```

Покрывается:

- корректность операций `+`, `-`, `*`, `/`, `**`, `%`;
- запрет деления и остатка от деления на ноль;
- запрет нечисловых и бесконечных значений;
- строгая схема API-запроса;
- парсинг пользовательского ввода;
- форматирование результата.

Запуск:

```powershell
npm run test
```

## Структура

```text
python-calculator/
├── .github/workflows/ci.yml       # CI quality gate
├── prisma/schema.prisma           # Prisma-схема SQLite
├── public/                        # Статические файлы
├── src/app/                       # Next.js App Router
│   ├── api/calculate/route.ts     # API вычислений
│   ├── api/history/route.ts       # API истории
│   ├── globals.css                # Tailwind CSS 4 theme tokens
│   ├── layout.tsx                 # Корневой layout
│   └── page.tsx                   # Главный экран калькулятора
├── src/components/providers/      # React providers
├── src/components/ui/             # Только используемые UI primitives
└── src/lib/                       # Бизнес-логика, Prisma client, utilities
```

## CI

GitHub Actions запускает на `push` в `main` и на pull request:

1. `npm ci`
2. `npm run db:setup`
3. `npm run check`

Это соответствует базовой SSDLC-практике автоматического quality gate для изменений: статическая проверка типов, unit-тесты, lint и production build перед слиянием.

## Операции калькулятора

```text
5 + 3 = 8
10 - 4 = 6
7 × 6 = 42
20 ÷ 5 = 4
2 ^ 3 = 8
10 % 3 = 1
```
