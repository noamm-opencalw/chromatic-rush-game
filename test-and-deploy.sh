#!/bin/bash
# 🚀 Test SSH ו-Deploy ל-GitHub Pages

echo "🔍 בודק חיבור SSH ל-GitHub..."
ssh -T git@github.com 2>&1 | head -1

if [ $? -eq 1 ]; then
    echo "✅ SSH עובד!"
    
    echo "📤 מעלה קוד ל-GitHub..."
    git push origin main
    
    echo "🎮 GitHub Pages כבר מופעל ידנית ב-repository"
    echo "🌐 URL: https://noamm-openclaw.github.io/chromatic-rush-game"
    echo "⏰ האתר יהיה חי תוך 2-3 דקות!"
    
    echo ""
    echo "🎉 הצלחה! מעכשיו כל push יעדכן את המשחק אוטומטית"
    
else
    echo "❌ SSH לא עובד - ודא שהמפתח הציבורי נוסף ל-GitHub"
    echo "🔗 https://github.com/settings/keys"
fi