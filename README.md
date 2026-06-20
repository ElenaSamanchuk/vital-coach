# Vital Coach

Личный коуч: питание, тренировки, сон, чекап, цикл.  
Учитывает инсулинорезистентность, щитовидку, кортизол, B12/D, гормоны.

**PWA** — работает на macOS, Windows, iOS, Android (установка «На экран Домой» / в браузере).

## Быстрый старт (один Mac)

```bash
cd vital-coach
cp .env.example .env
# Отредактируй AUTH_SECRET: openssl rand -base64 32

npm install
npm run db:migrate
npm run dev
```

Открой http://localhost:3000 → Регистрация → Онбординг.

## Общая БД на всех устройствах

SQLite — только на одном компьютере. Для синхронизации между телефоном, Mac и Windows:

### Вариант A: PostgreSQL на домашнем сервере / VPS

```bash
docker compose up -d
```

1. В `prisma/schema.prisma` смени `provider = "sqlite"` на `provider = "postgresql"`
2. В `.env`:
   ```
   DATABASE_URL="postgresql://vital:vitalcoach_secret@localhost:5432/vital_coach"
   ```
3. Установи адаптер: `npm install @prisma/adapter-pg pg`
4. Обнови `src/lib/db.ts` (см. комментарий в файле для PostgreSQL)
5. `npm run db:migrate`
6. Запусти приложение: `npm run build && npm start`
7. На телефоне открой `http://IP-СЕРВЕРА:3000` → «Добавить на экран»

### Вариант B: Railway / Render / Fly.io

Задеплой репозиторий, добавь PostgreSQL addon, пропиши `DATABASE_URL` и `AUTH_SECRET` в переменные окружения.

## Установка как приложение

| Платформа | Как |
|-----------|-----|
| **iPhone/iPad** | Safari → Поделиться → «На экран Домой» |
| **Android** | Chrome → меню → «Установить приложение» |
| **macOS** | Safari/Chrome → установка PWA из адресной строки |
| **Windows** | Edge/Chrome → «Установить Vital Coach» |

## Разделы приложения

| Вкладка | Что делает |
|---------|------------|
| **Коуч** | План дня: еда, тренировка, чеклист, предупреждения по ИР/гормонам |
| **Дневник** | Вес, объёмы, калории, вода, сон, стресс, тироксин, тренировки |
| **Динамика** | Графики, что проседает, что работает |
| **Чекап** | TSH, инсулин, D, B12 и др. + список для врача |
| **Настройки** | Цели, состояния здоровья, цикл |

## Ежедневный ритуал (2 минуты)

1. Открой **Коуч** — прочитай план
2. Вечером заполни **Дневник** → «Сохранить день»
3. Раз в неделю — объёмы и **Динамика**

## GitHub (приватный репозиторий)

```bash
gh auth login   # если токен истёк
cd vital-coach
git init
git add .
git commit -m "Initial Vital Coach app"
gh repo create vital-coach --private --source=. --push
```

## Стек

Next.js 16 · Prisma · SQLite/PostgreSQL · NextAuth · Recharts · PWA
