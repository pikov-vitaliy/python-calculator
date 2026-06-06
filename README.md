# 🧮 Web Calculator

> **Красивый веб-калькулятор с историей вычислений** на Next.js 16 + TypeScript + Tailwind CSS 4 + Prisma

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=nextdotjs&logoColor=white)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript&logoColor=white)](https://typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Prisma](https://img.shields.io/badge/Prisma-6.11-2D3748?logo=prisma&logoColor=white)](https://prisma.io)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)

## 📸 Превью

*Красивый интерфейс с анимациями, поддержкой темной/светлой темы и удобной историей вычислений.*

---

## 🚀 Быстрый старт

### 📥 Установка

```bash
# Клонировать репозиторий
git clone https://github.com/user/python-calculator.git
cd python-calculator

# Установить зависимости
npm install
```

### ⚙️ Настройка базы данных

Проект использует **SQLite** через Prisma. Создайте файл `.env` в корне проекта:

```env
DATABASE_URL=file:./db/calculator.db
```

Затем инициализируйте базу данных:

```bash
npx prisma db push
npx prisma generate
```

### 🏃‍♂️ Запуск

```bash
# Режим разработки
npm run dev

# Перейти по адресу: http://localhost:3000
```

### 📦 Сборка для продакшн

```bash
npm run build
npm start
```

---

## 🛠️ Технологии

| Технология | Назначение |
|------------|------------|
| **[Next.js 16](https://nextjs.org)** | React-фреймворк с App Router |
| **[TypeScript](https://typescriptlang.org)** | Типизация |
| **[Tailwind CSS 4](https://tailwindcss.com)** | Styles |
| **[Prisma](https://prisma.io)** | ORM для работы с SQLite |
| **[shadcn/ui](https://ui.shadcn.com)** | UI-компоненты |
| **[Framer Motion](https://framer.com/motion)** | Анимации |
| **[next-themes](https://github.com/pacocoursey/next-themes)** | Переключение тем |
| **[Sonner](https://sonner.emilkowal.ski)** | Toast-уведомления |

---

## ✨ Возможности

### 🧮 Операции
- ✅ Сложение (+)
- ✅ Вычитание (−)
- ✅ Умножение (×)
- ✅ Деление (÷)
- ✅ Возведение в степень (xⁿ)
- ✅ Остаток от деления (%)

### 📋 История вычислений
- Автоматическое сохранение всех вычислений
- Просмотр даты и времени каждого вычисления
- Возможность очистки истории
- Клик по записи из истории копирует результат в поле A

### 🎨 Дизайн
- Адаптивный дизайн (mobile-first)
- Темная и светлая темы
- Плавные анимации
- Красивый градиентный фон

---

## 📁 Структура проекта

```
python-calculator/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── calculate/route.ts      # API для вычислений
│   │   │   └── history/route.ts        # API для истории
│   │   ├── globals.css                 # Глобальные стили
│   │   ├── layout.tsx                  # Корневой layout
│   │   └── page.tsx                    # Главная страница
│   ├── components/
│   │   ├── calculator/
│   │   │   ├── calculator-display.tsx  # Дисплей калькулятора
│   │   │   └── history-panel.tsx       # Панель истории
│   │   ├── providers/
│   │   │   └── theme-provider.tsx      # Провайдер тем
│   │   └── ui/                        # shadcn/ui компоненты
│   └── lib/
│       ├── db.ts                       # Prisma клиент
│       └── utils.ts                    # Утилиты
├── prisma/
│   └── schema.prisma                   # Схема базы данных
├── public/
│   └── logo.svg                       # Логотип
├── .env.example                        # Пример конфига
├── next.config.ts                     # Конфиг Next.js
├── package.json                       # Зависимости
├── tailwind.config.ts                 # Конфиг Tailwind
├── tsconfig.json                      # Конфиг TypeScript
└── README.md                          # Документация
```

---

## 🔧 Доступные скрипты

| Скрипт | Описание |
|--------|----------|
| `npm run dev` | Запуск в режиме разработки |
| `npm run build` | Сборка для продакшн |
| `npm start` | Запуск собранного приложения |
| `npm run db:push` | Применение миграций базы данных |
| `npm run db:generate` | Генерация Prisma клиента |

---

## 📝 Примеры использования

### Базовые вычисления
```
5 + 3 = 8
10 - 4 = 6
7 × 6 = 42
20 ÷ 5 = 4
2 ** 3 = 8
10 % 3 = 1
```

### Работа с историей
1. Выполните несколько вычислений
2. Посмотрите историю в правой панели
3. Кликните по записи, чтобы скопировать результат в поле A
4. Нажмите "Очистить историю", чтобы удалить все записи

---

## 🎯 Дорожная карта

- [x] Базовые операции (+, -, *, /)
- [x] Расширенные операции (степень, остаток)
- [x] История вычислений
- [x] Темная/светлая тема
- [x] Анимации
- [ ] Научные функции (sin, cos, tan, log)
- [ ] Сохранение истории в localStorage
- [ ] Экспорт истории в CSV
- [ ] PWA поддержка

---

## 🤝 Вклад в проект

Вклады приветствуются! Пожалуйста, следуйте этим шагам:

1. Форкните репозиторий
2. Создайте ветку для вашей фичи (`git checkout -b feature/amazing-feature`)
3. Закоммитьте изменения (`git commit -m 'Add amazing feature'`)
4. Запушьте в ветку (`git push origin feature/amazing-feature`)
5. Откройте Pull Request

---

## 📄 Лицензия

Этот проект лицензирован по лицензии **MIT**.

---

## 📞 Контакты

- **Repository**: [python-calculator](https://github.com/user/python-calculator)

---

<div align="center">
  <p>⭐ Если проект понравился, поставьте звездочку!</p>
</div>
