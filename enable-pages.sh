#!/bin/bash
# 🚀 Script להפעלת GitHub Pages אוטומטי

echo "🎯 מפעיל GitHub Pages עבור CHROMATIC RUSH..."

# 1. העלאת הקוד למאן
echo "📤 מעלה קוד למאן..."
git push origin main

# 2. הפעלת GitHub Pages דרך API
echo "⚙️ מפעיל GitHub Pages..."
gh api \
  --method POST \
  -H "Accept: application/vnd.github+json" \
  -H "X-GitHub-Api-Version: 2022-11-28" \
  /repos/noamm-openclaw/chromatic-rush-game/pages \
  -f source='{"branch":"main","path":"/"}'

# 3. בדיקת סטטוס
echo "🔍 בודק סטטוס Pages..."
gh api repos/noamm-openclaw/chromatic-rush-game/pages

echo ""
echo "✅ GitHub Pages מופעל!"
echo "🌐 URL: https://noamm-openclaw.github.io/chromatic-rush-game"
echo "⏰ האתר יהיה זמין תוך 2-3 דקות"