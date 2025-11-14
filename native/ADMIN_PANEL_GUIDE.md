# 🎛️ Admin Panel - מדריך העלאת התראות

## מבנה ההתראות

### מבנה Firestore
```javascript
// Collection: alerts
{
  id: 'auto-generated',
  symbol: 'AAPL',              // סימול המנייה
  title: 'Apple Inc.',         // שם מלא
  type: 'buy',                 // 'buy' | 'sell' | 'watch'
  price: '$182.45',            // מחיר נוכחי
  change: '+2.4%',             // שינוי באחוזים
  message: 'פריצה מעל...',    // הודעה קצרה (80-120 תווים)
  details: 'ניתוח מפורט...',  // פרטים נוספים (אופציונלי)
  priority: 'high',            // 'high' | 'medium' | 'low'
  targetAudience: ['free', 'premium', 'vip'], // מי יראה
  timestamp: Timestamp,
  author: 'boilerroom',
  isActive: true,              // false אחרי 24 שעות
}
```

---

## 🚀 תהליך העלאת התראה

### שלב 1: Admin Panel (Web)
```javascript
// AdminPanel/pages/alerts/new.jsx
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { sendPushToSegment } from '../utils/push'

function CreateAlert() {
  const [form, setForm] = useState({
    symbol: '',
    title: '',
    type: 'buy',
    price: '',
    change: '',
    message: '',
    details: '',
    priority: 'medium',
    targetAudience: ['premium', 'vip']
  })

  const handleSubmit = async (e) => {
    e.preventDefault()

    // 1. שמירה ל-Firestore
    const alertRef = await addDoc(collection(db, 'alerts'), {
      ...form,
      timestamp: serverTimestamp(),
      author: 'boilerroom',
      isActive: true
    })

    // 2. שליחת Push Notifications
    await sendPushToSegment({
      title: `${getTypeEmoji(form.type)} ${form.symbol} - ${getTypeLabel(form.type)}`,
      body: `${form.price} (${form.change})\n${form.message}`,
      data: {
        alertId: alertRef.id,
        screen: 'LiveAlerts'
      },
      segment: form.targetAudience // שליחה רק לקהל יעד
    })

    alert('התראה נשלחה בהצלחה!')
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        placeholder="סימבול (AAPL)"
        value={form.symbol}
        onChange={e => setForm({...form, symbol: e.target.value})}
      />

      <input
        placeholder="שם מלא (Apple Inc.)"
        value={form.title}
        onChange={e => setForm({...form, title: e.target.value})}
      />

      <select value={form.type} onChange={e => setForm({...form, type: e.target.value})}>
        <option value="buy">📈 קנייה</option>
        <option value="sell">📉 מכירה</option>
        <option value="watch">👁️ מעקב</option>
      </select>

      <input
        placeholder="מחיר ($182.45)"
        value={form.price}
        onChange={e => setForm({...form, price: e.target.value})}
      />

      <input
        placeholder="שינוי (+2.4%)"
        value={form.change}
        onChange={e => setForm({...form, change: e.target.value})}
      />

      <textarea
        placeholder="הודעה קצרה (80-120 תווים)"
        maxLength={120}
        value={form.message}
        onChange={e => setForm({...form, message: e.target.value})}
      />

      <textarea
        placeholder="פרטים נוספים (אופציונלי)"
        value={form.details}
        onChange={e => setForm({...form, details: e.target.value})}
      />

      <select value={form.priority} onChange={e => setForm({...form, priority: e.target.value})}>
        <option value="high">🔥 דחוף</option>
        <option value="medium">⚡ בינוני</option>
        <option value="low">💡 נמוך</option>
      </select>

      <div>
        <label>
          <input
            type="checkbox"
            checked={form.targetAudience.includes('free')}
            onChange={e => {
              if (e.target.checked) {
                setForm({...form, targetAudience: [...form.targetAudience, 'free']})
              } else {
                setForm({...form, targetAudience: form.targetAudience.filter(a => a !== 'free')})
              }
            }}
          />
          משתמשים חינמיים
        </label>

        <label>
          <input type="checkbox" checked={form.targetAudience.includes('premium')} />
          Premium
        </label>

        <label>
          <input type="checkbox" checked={form.targetAudience.includes('vip')} />
          VIP בלבד
        </label>
      </div>

      <button type="submit">📤 שלח התראה</button>
    </form>
  )
}
```

---

## 📲 Push Notification - Backend

### Backend Function (Firebase Cloud Functions)
```javascript
// functions/src/sendPush.js
const admin = require('firebase-admin')

exports.sendPushToSegment = async ({ title, body, data, segment }) => {
  const db = admin.firestore()

  // קבלת כל המשתמשים בקהל היעד
  const usersSnapshot = await db.collection('users')
    .where('subscriptionType', 'in', segment)
    .get()

  const tokens = []
  usersSnapshot.forEach(doc => {
    const userData = doc.data()
    if (userData.pushToken) {
      tokens.push(userData.pushToken)
    }
  })

  // שליחת Push
  const messages = tokens.map(token => ({
    to: token,
    sound: 'default',
    title,
    body,
    data,
    badge: 1,
    priority: 'high',
    channelId: 'default'
  }))

  // Expo Push API
  const chunks = chunkArray(messages, 100) // מקסימום 100 בקריאה

  for (const chunk of chunks) {
    await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(chunk)
    })
  }
}

function chunkArray(array, size) {
  const chunks = []
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size))
  }
  return chunks
}
```

---

## 📱 App Side - קבלת התראות

### עדכון LiveAlertsScreen לקרוא מ-Firestore
```javascript
// LiveAlertsScreen.jsx
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore'

const [alerts, setAlerts] = useState([])

useEffect(() => {
  const q = query(
    collection(db, 'alerts'),
    orderBy('timestamp', 'desc'),
    limit(50)
  )

  const unsubscribe = onSnapshot(q, (snapshot) => {
    const data = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
    setAlerts(data)
  })

  return () => unsubscribe()
}, [])
```

---

## 🧪 בדיקה מקומית (Local Testing)

### שלב 1: שלח התראה לוקלית (ללא Firebase)
```javascript
// בכל מסך באפליקציה
import { sendLocalNotification } from '../utils/notifications'

// כפתור לבדיקה
<Button
  title="🔔 שלח התראה בדיקה"
  onPress={() => {
    sendLocalNotification({
      title: '📈 AAPL - קנייה',
      body: '$182.45 (+2.4%)\nפריצה מעל רמת התנגדות',
      data: { screen: 'LiveAlerts' }
    })
  }}
/>
```

### שלב 2: הרצת Admin Panel מקומית
```bash
cd admin-panel
npm run dev
# פתח: http://localhost:3000/alerts/new
```

---

## 📊 Workflow מלא

```
┌─────────────────────────────────────────────────┐
│  1. אתה נכנס ל-Admin Panel (Web)       │
│     https://admin.boilerroom.com               │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│  2. ממלא טופס התראה:                           │
│     - סימבול: AAPL                             │
│     - מחיר: $182.45                            │
│     - הודעה: "פריצה מעל התנגדות..."           │
│     - קהל: Premium + VIP                       │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│  3. לוחץ "שלח התראה"                           │
│     ↓                                           │
│     • נשמר ב-Firestore (collection: alerts)    │
│     • נשלח Push לכל המשתמשים המתאימים          │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│  4. משתמשים מקבלים:                             │
│     📱 Push Notification (גם אם האפליקציה סגורה)│
│     📋 רשומה חדשה במסך "התראות חמות"          │
└─────────────────────────────────────────────────┘
```

---

## 🎯 Next Steps

1. **כרגע**: האפליקציה מוכנה לקבל Push ✅
2. **הבא**: צריך לבנות Admin Panel (Next.js/React)
3. **אחר כך**: חיבור Firebase + Authentication
4. **לבסוף**: מערכת מנויים (Free/Premium/VIP)

---

## 🔗 Resources

- [Expo Push Notifications Docs](https://docs.expo.dev/push-notifications/overview/)
- [Firebase Cloud Messaging](https://firebase.google.com/docs/cloud-messaging)
- [Expo Push Tool (בדיקה)](https://expo.dev/notifications)
