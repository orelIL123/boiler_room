// Mock initial articles - in production, this would come from Firestore
const INITIAL_ARTICLES = [
  {
    id: 'news-1',
    title: 'הזדמנויות בשוק הדיגיטלי לקראת 2026',
    date: '31 באוקטובר 2025',
    summary: 'איך להתכונן לשינויים הצפויים בשוק ולהפוך מידע להזדמנויות השקעה.',
    image: require('../../assets/photos/IMG_0692.png'),
    imageType: 'local', // 'local' | 'uri'
  },
  {
    id: 'news-2',
    title: 'Mindset של טריידר – שיעורים מהקהילה',
    date: '29 באוקטובר 2025',
    summary: 'תובנות מרכזיות מהקהילה שלנו על ניהול רגשות ועמידה ביעדים.',
    image: require('../../assets/photos/IMG_0693.png'),
    imageType: 'local',
  },
  {
    id: 'news-3',
    title: 'טל ממליץ: 3 מניות למעקב מקרוב',
    date: '27 באוקטובר 2025',
    summary: 'הסקירה השבועית עם נקודות מפתח לפני שבוע המסחר הבא.',
    image: require('../../assets/photos/IMG_0694.png'),
    imageType: 'local',
  },
]

// In-memory storage for news articles
let articlesStorage = [...INITIAL_ARTICLES]

export function getNewsArticles() {
  return articlesStorage
}

export function addNewsArticle(article) {
  const newArticle = {
    id: `news-${Date.now()}`,
    ...article,
    date: new Date().toLocaleDateString('he-IL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }),
  }
  articlesStorage = [newArticle, ...articlesStorage]
  return newArticle
}

export function updateNewsArticle(id, updates) {
  articlesStorage = articlesStorage.map(article =>
    article.id === id ? { ...article, ...updates } : article
  )
  return articlesStorage.find(article => article.id === id)
}

export function deleteNewsArticle(id) {
  articlesStorage = articlesStorage.filter(article => article.id !== id)
  return true
}

