# Vital — GitHub Pages + APK

Репозиторий: **github.com/ElenaSamanchuk/vital-coach**  
После деплоя: **https://elenasamanchuk.github.io/vital-coach/**

> Пароли и данные пользователей **не хранятся в Git**. Standalone — без входа, данные на телефоне.  
> Подробнее: [docs/SECURITY.md](./SECURITY.md)

---

```
GitHub repo  →  Actions  →  GitHub Pages (ваша ссылка)
                                ↑
Capacitor APK (WebView) ────────┘
Данные: localStorage на телефоне
```

APK не содержит логику — это «браузер без адресной строки», который открывает ваш Pages-URL. После первой загрузки данные живут на телефоне.

---

## Шаг 1: GitHub

```bash
cd vital-coach
git init
git add .
git commit -m "Vital standalone for GitHub Pages"
gh repo create vital-coach --public --source=. --push
```

В репозитории: **Settings → Pages → Build and deployment → GitHub Actions**.

После push в `main` приложение будет на:

`https://elenasamanchuk.github.io/vital-coach/`

(имя репозитория = часть URL; в workflow уже подставляется автоматически)

---

## Шаг 2: Локальная проверка

```bash
npm run build:pages
# NEXT_PUBLIC_BASE_PATH=/vital-coach по умолчанию в скрипте
npx serve out
```

---

## Шаг 3: APK для сайта

1. В `capacitor.config.json` замените URL:

```json
"server": {
  "url": "https://ВАШ_ЛОГИН.github.io/vital-coach/",
  "cleartext": false
}
```

2. Сборка:

```bash
npm install @capacitor/core @capacitor/cli @capacitor/android
npx cap add android
npx cap open android
```

Android Studio → **Build → Build APK(s)** → выложите `app-release.apk` на свой сайт.

---

## Переменные сборки

| Переменная | Назначение |
|------------|------------|
| `NEXT_PUBLIC_STANDALONE=true` | localStorage вместо API |
| `NEXT_PUBLIC_GENERIC_MODE=true` | массовый режим |
| `NEXT_PUBLIC_BASE_PATH=/repo-name` | путь на GitHub Pages |
| `GITHUB_PAGES=true` | static export |

---

## Подробный анализ и roadmap

См. [docs/ANALYSIS.md](./ANALYSIS.md)
