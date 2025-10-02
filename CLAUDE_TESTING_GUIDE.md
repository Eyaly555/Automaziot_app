# מדריך בדיקות מקומיות עבור Claude

## הגדרת סביבת הפיתוח

### 1. הרצת השרת המקומי

```bash
cd discovery-assistant
npm run dev
```

השרת ירוץ על: `http://localhost:5177` (או 5176 אם הפורט פנוי)

---

## כלי הבדיקה - Chrome MCP Tools

### 1. פתיחת האפליקציה בדפדפן

```javascript
mcp__chrome-mcp-server__chrome_navigate({
  url: "http://localhost:5177"
})
```

### 2. קריאת תוכן העמוד

```javascript
mcp__chrome-mcp-server__chrome_get_web_content({
  textContent: true
})
```

### 3. בדיקת קונסול לשגיאות

```javascript
mcp__chrome-mcp-server__chrome_console({
  maxMessages: 50
})
```

### 4. צילום מסך

```javascript
mcp__chrome-mcp-server__chrome_screenshot({
  fullPage: true,
  savePng: false,
  storeBase64: true
})
```

### 5. אינטראקציה עם אלמנטים

#### קבלת רשימת אלמנטים אינטראקטיביים:
```javascript
mcp__chrome-mcp-server__chrome_get_interactive_elements()
```

#### לחיצה על כפתור:
```javascript
mcp__chrome-mcp-server__chrome_click_element({
  selector: "button.class-name"
})
```

#### מילוי שדה:
```javascript
mcp__chrome-mcp-server__chrome_fill_or_select({
  selector: "input#field-id",
  value: "test value"
})
```

---

## תהליך בדיקה מומלץ

### לפני כל תיקון:

1. **הרץ את השרת אם הוא לא רץ**:
   ```bash
   cd discovery-assistant && npm run dev
   ```

2. **פתח את הדפדפן**:
   ```javascript
   chrome_navigate({ url: "http://localhost:5177" })
   ```

3. **בדוק קונסול לשגיאות**:
   ```javascript
   chrome_console({ maxMessages: 50 })
   ```

### אחרי תיקון קוד:

1. **המתן ל-HMR** (Hot Module Replacement):
   - Vite יתרענן אוטומטית את הדף
   - המתן 2-3 שניות

2. **רענן את הדפדפן** (אם צריך):
   ```javascript
   chrome_navigate({ url: "http://localhost:5177", refresh: true })
   ```

3. **בדוק שהתיקון עובד**:
   - קרא את תוכן העמוד
   - בדוק את הקונסול
   - צלם מסך אם צריך

---

## דוגמאות לתרחישי בדיקה

### בדיקה 1: ווידוא שהעמוד נטען

```javascript
// פתח דפדפן
chrome_navigate({ url: "http://localhost:5177" })

// המתן 2 שניות
await sleep(2)

// בדוק תוכן
chrome_get_web_content({ textContent: true })

// בדוק שגיאות
chrome_console({ maxMessages: 20 })
```

### בדיקה 2: בדיקת טופס

```javascript
// מלא שדה
chrome_fill_or_select({
  selector: "#client-name",
  value: "לקוח לדוגמה"
})

// לחץ על כפתור שמירה
chrome_click_element({
  selector: "button[type='submit']"
})

// המתן לשמירה
await sleep(1)

// בדוק הודעת הצלחה בקונסול
chrome_console({ maxMessages: 10 })
```

### בדיקה 3: בדיקת ניווט

```javascript
// לחץ על כפתור ניווט
chrome_click_element({
  selector: "a[href='/dashboard']"
})

// המתן לטעינת דף
await sleep(2)

// ודא שה-URL השתנה
chrome_get_web_content({ textContent: true })
```

---

## טיפים חשובים

### ✅ DO:
- **תמיד השתמש ב-Chrome MCP Tools** - לא DevTools
- **המתן אחרי כל שינוי** - תן ל-HMR לעבוד (2-3 שניות)
- **בדוק קונסול אחרי כל פעולה** - כדי לזהות שגיאות
- **השתמש ב-`textContent: true`** - כדי לקרוא תוכן בעברית
- **שמור על השרת רץ** - אל תעצור אותו בין בדיקות

### ❌ DON'T:
- **אל תשתמש ב-DevTools MCP** - רק Chrome MCP
- **אל תנקה Storage ידנית** - HMR עושה זאת אוטומטית
- **אל תעצור את השרת** - אלא אם יש שגיאה קריטית
- **אל תפרוס ל-Vercel** - לבדיקות יומיומיות

---

## בעיות נפוצות ופתרונות

### בעיה: "עמוד ריק"
**פתרון**: בדוק קונסול לשגיאות JavaScript

### בעיה: "שינויים לא מתעדכנים"
**פתרון**: המתן 3-5 שניות ל-HMR או רענן ידנית

### בעיה: "שגיאת 404 ב-API"
**פתרון**: ודא שמשתני הסביבה ב-`.env.local` מוגדרים נכון

### בעיה: "השרת לא מגיב"
**פתרון**:
```bash
# עצור את השרת (Ctrl+C)
# הרץ מחדש
cd discovery-assistant && npm run dev
```

---

## דוגמה מלאה לבדיקת תיקון

```javascript
// 1. ערכת קובץ - למשל src/components/Dashboard.tsx

// 2. המתן ל-HMR
await sleep(3)

// 3. בדוק שהשינוי נטען
chrome_navigate({ url: "http://localhost:5177" })
await sleep(2)

// 4. בדוק קונסול
const console_result = chrome_console({ maxMessages: 20 })
// חפש שגיאות

// 5. בדוק תוכן
const content = chrome_get_web_content({ textContent: true })
// ודא שהשינוי נראה

// 6. צלם מסך (אם צריך)
chrome_screenshot({ fullPage: false, storeBase64: true })

// 7. דווח למשתמש על התוצאה
```

---

## סיכום

- **סביבת פיתוח מקומית** = בדיקות מהירות ללא פריסה
- **Chrome MCP Tools** = הכלי היחיד לבדיקות דפדפן
- **HMR** = רענון אוטומטי - המתן 2-3 שניות
- **קונסול** = המקור העיקרי לזיהוי באגים

**זכור**: תמיד בדוק מקומית לפני פריסה ל-Vercel!
