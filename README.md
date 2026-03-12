# שעון דיגיטלי לבית הכנסת

אפליקציית שעון דיגיטלי עם שכבת נתונים לזמנים יומיים ממקור itimlabina עבור הכתובת: **זאב פלק 18, ירושלים**.

## מה חדש

- מודול נתונים ייעודי: `src/zmanimProvider.js`
- הבאת נתונים דרך endpoint פנימי: `GET /api/zmanim?date=YYYY-MM-DD`
- זיהוי שדות:
  - זריחה
  - שקיעה
  - הנץ בניקוי 25 ק"מ
- נרמול שעות לפורמט: `HH:MM:SS`
- מטמון יומי לפי תאריך גם ב-frontend וגם ב-backend
- שרת Proxy קטן ב-Node.js למניעת בעיות CORS

## הרצה

```bash
node server.js
```

ואז לפתוח בדפדפן:

- `http://localhost:3000`

## הערה חשובה על מקור הנתונים

השרת משתמש כרגע ב-endpoint:

- `https://www.itimlabina.com/api/zmanim?address=...&date=...`

אם מבנה או כתובת ה-API של itimlabina שונים בפועל, יש לעדכן את בניית ה-URL בתוך `server.js` בלבד.
