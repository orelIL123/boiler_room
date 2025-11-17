// Placeholder data-service for future Firebase wiring.
// Replace implementations with Firestore queries (events, announcements).

export async function fetchEvents() {
  // TODO: Replace with Firestore: collection('events'), orderBy('startsAt')
  return [
    { id: 'e1', title: 'וובינר שבועי: סקירת שוק', startsAt: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), type: 'webinar', visibility: 'public' },
    { id: 'e2', title: 'Meetup תל אביב: מפגש קהילה', startsAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), type: 'meetup', visibility: 'registered' },
  ]
}

export async function fetchAnnouncements() {
  // TODO: Replace with Firestore: collection('announcements'), orderBy('createdAt', 'desc')
  return [
    { id: 'a1', title: 'הכרזה: פתיחת הרשמה למחזור דצמבר', body: 'שריינו מקום מוקדם וקבלו בונוס הרשמה.', createdAt: new Date().toISOString(), visibility: 'public' },
    { id: 'a2', title: 'VIP: סשן Q&A נוסף בשבוע הבא', body: 'חברי VIP בלבד — פרטים יצאו במייל.', createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), visibility: 'vip' },
  ]
}


