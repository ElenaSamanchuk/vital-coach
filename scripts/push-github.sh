#!/bin/bash
# Запустите после: sudo xcodebuild -license accept
set -e
cd "$(dirname "$0")/.."
npm run check:secrets
git init
git branch -M main
git add -A
git commit -m "Vital: IndexedDB, backup import, offline SW, 1-screen onboarding, APK CI"
git remote add origin https://github.com/ElenaSamanchuk/vital-coach.git 2>/dev/null || git remote set-url origin https://github.com/ElenaSamanchuk/vital-coach.git
git push -u origin main
echo ""
echo "✓ Pushed. Pages: Settings → Pages → GitHub Actions"
echo "✓ APK: Actions → Build Android APK → artifact vital-debug-apk"
echo "✓ URL: https://elenasamanchuk.github.io/vital-coach/"
