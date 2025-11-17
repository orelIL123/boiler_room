import React, { useMemo, useState, useEffect } from 'react'
import { View, Text, FlatList, Pressable, ActivityIndicator, Platform, Alert } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import * as Linking from 'expo-linking'
import { useNavigation } from '@react-navigation/native'

const BG = '#000000'
const GOLD = '#D4AF37'

const mockEvents = [
  { id: 'e1', title: 'וובינר שבועי: סקירת שוק', startsAt: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), type: 'webinar', visibility: 'public' },
  { id: 'e2', title: 'Meetup תל אביב: מפגש קהילה', startsAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), type: 'meetup', visibility: 'registered' },
]

const mockAnnouncements = [
  { id: 'a1', title: 'הכרזה: פתיחת הרשמה למחזור דצמבר', body: 'שריינו מקום מוקדם וקבלו בונוס הרשמה.', createdAt: new Date().toISOString(), visibility: 'public' },
  { id: 'a2', title: 'VIP: סשן Q&A נוסף בשבוע הבא', body: 'חברי VIP בלבד — פרטים יצאו במייל.', createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), visibility: 'vip' },
]

export default function CommunityScreen() {
  const navigation = useNavigation()
  const [loading, setLoading] = useState(true)
  const [events, setEvents] = useState([])
  const [announcements, setAnnouncements] = useState([])

  useEffect(() => {
    // Simulate fetch delay
    const t = setTimeout(() => {
      setEvents(mockEvents)
      setAnnouncements(mockAnnouncements)
      setLoading(false)
    }, 400)
    return () => clearTimeout(t)
  }, [])

  const eventStartingToday = useMemo(() => {
    const startOfDay = new Date()
    startOfDay.setHours(0,0,0,0)
    const endOfDay = new Date()
    endOfDay.setHours(23,59,59,999)
    return events.find(e => {
      const d = new Date(e.startsAt)
      return d >= startOfDay && d <= endOfDay
    })
  }, [events])

  if (loading) {
    return (
      <View style={{ flex:1, alignItems:'center', justifyContent:'center', backgroundColor: BG }}>
        <ActivityIndicator color={GOLD} />
      </View>
    )
  }

  const addToCalendar = async (event) => {
    try {
      const startDate = new Date(event.startsAt)
      const endDate = new Date(startDate.getTime() + 60 * 60 * 1000) // Add 1 hour default duration
      
      // Format dates for calendar URL
      const formatDate = (date) => {
        return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
      }
      
      const startStr = formatDate(startDate)
      const endStr = formatDate(endDate)
      const title = encodeURIComponent(event.title)
      const description = encodeURIComponent(`אירוע קהילה - Boiler Room`)
      
      if (Platform.OS === 'ios') {
        // iOS Calendar URL scheme
        const url = `calshow://?startdt=${startStr}&enddt=${endStr}&title=${title}&notes=${description}`
        const canOpen = await Linking.canOpenURL(url)
        if (canOpen) {
          await Linking.openURL(url)
        } else {
          // Fallback to web calendar
          const webUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startStr}/${endStr}&details=${description}`
          await Linking.openURL(webUrl)
        }
      } else {
        // Android - use intent or Google Calendar
        const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startStr}/${endStr}&details=${description}`
        await Linking.openURL(googleCalendarUrl)
      }
    } catch (error) {
      Alert.alert('שגיאה', 'לא ניתן לפתוח את הביומן. אנא הוסף את האירוע ידנית.')
    }
  }

  const handleGoBack = () => {
    try {
      if (navigation.canGoBack()) {
        navigation.goBack()
      } else {
        navigation.navigate('Home')
      }
    } catch (error) {
      console.log('Error navigating back:', error)
      navigation.navigate('Home')
    }
  }

  return (
    <View style={{ flex:1, backgroundColor: BG, paddingTop: Platform.select({ ios: 48, android: 24 }), paddingHorizontal: 16 }}>
      {/* Header with back button */}
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20, marginTop: 8 }}>
        <Pressable
          onPress={handleGoBack}
          style={{ 
            padding: 10,
            borderRadius: 12,
            backgroundColor: 'rgba(212,175,55,0.1)',
            borderWidth: 1,
            borderColor: 'rgba(212,175,55,0.2)',
            marginRight: 12
          }}
          accessibilityRole="button"
        >
          <Ionicons name="arrow-back" color={GOLD} size={22} />
        </Pressable>
        <Text style={{ color:'#fff', fontFamily:'Heebo_700Bold', fontSize:28, textAlign:'right', flex: 1 }}>קהילה</Text>
      </View>

      {eventStartingToday && (
        <View style={{ marginBottom:16, padding:14, borderRadius:12, backgroundColor:'rgba(212,175,55,0.12)', borderWidth:1, borderColor:'rgba(212,175,55,0.35)', flexDirection:'row', alignItems:'center', gap:10 }}>
          <Ionicons name="calendar-outline" color={GOLD} size={22} />
          <View style={{ flex:1 }}>
            <Text style={{ color:GOLD, fontFamily:'Heebo_700Bold', fontSize:16, textAlign:'right' }}>יש אירוע היום</Text>
            <Text style={{ color:'#E5E7EB', fontFamily:'Heebo_400Regular', fontSize:14, textAlign:'right' }}>{eventStartingToday.title}</Text>
          </View>
          <Pressable 
            style={{ backgroundColor:GOLD, borderRadius:8, paddingHorizontal:12, paddingVertical:6 }}
            onPress={() => addToCalendar(eventStartingToday)}
          >
            <Text style={{ color:'#000', fontFamily:'Heebo_700Bold' }}>הוסף ליומן</Text>
          </Pressable>
        </View>
      )}

      <SectionTitle title="אירועים קרובים" />
      <FlatList
        data={events}
        keyExtractor={(item)=>item.id}
        renderItem={({ item }) => <EventRow item={item} onAddToCalendar={addToCalendar} />}
        style={{ marginBottom:16 }}
      />

      <SectionTitle title="הכרזות" />
      <FlatList
        data={announcements}
        keyExtractor={(item)=>item.id}
        renderItem={({ item }) => <AnnouncementRow item={item} />}
      />
    </View>
  )
}

function SectionTitle({ title }) {
  return (
    <View style={{ flexDirection:'row', alignItems:'center', justifyContent:'space-between', marginBottom:8, marginTop:8 }}>
      <View style={{ height:1, backgroundColor:'rgba(255,255,255,0.08)', flex:1, marginLeft:12 }} />
      <Text style={{ color:'#E5E7EB', fontFamily:'Heebo_700Bold', fontSize:18 }}>{title}</Text>
      <View style={{ height:1, backgroundColor:'rgba(255,255,255,0.08)', flex:1, marginRight:12 }} />
    </View>
  )
}

function EventRow({ item, onAddToCalendar }) {
  const isWebinar = item.type === 'webinar'
  const dateText = new Date(item.startsAt).toLocaleString('he-IL', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
  return (
    <View style={{ padding:14, borderRadius:12, backgroundColor:'rgba(255,255,255,0.06)', marginBottom:10 }}>
      <View style={{ flexDirection:'row', alignItems:'center', gap:10, marginBottom:10 }}>
        <Ionicons name={isWebinar ? 'videocam-outline' : 'people-outline'} color={GOLD} size={22} />
        <View style={{ flex:1 }}>
          <Text style={{ color:'#fff', fontFamily:'Heebo_600SemiBold', fontSize:16, textAlign:'right' }}>{item.title}</Text>
          <Text style={{ color:'#9CA3AF', fontFamily:'Heebo_400Regular', marginTop:4, textAlign:'right' }}>{dateText}</Text>
        </View>
      </View>
      <Pressable
        onPress={() => onAddToCalendar(item)}
        style={{ 
          flexDirection: 'row', 
          alignItems: 'center', 
          justifyContent: 'center',
          backgroundColor: 'rgba(212,175,55,0.15)',
          borderRadius: 8,
          paddingVertical: 8,
          paddingHorizontal: 12,
          borderWidth: 1,
          borderColor: 'rgba(212,175,55,0.3)'
        }}
      >
        <Ionicons name="calendar-outline" color={GOLD} size={18} style={{ marginLeft: 6 }} />
        <Text style={{ color: GOLD, fontFamily: 'Heebo_600SemiBold', fontSize: 14 }}>הוסף ל יומן</Text>
      </Pressable>
    </View>
  )
}

function AnnouncementRow({ item }) {
  const dateText = new Date(item.createdAt).toLocaleDateString()
  return (
    <View style={{ padding:14, borderRadius:12, backgroundColor:'rgba(255,255,255,0.06)', marginBottom:10 }}>
      <Text style={{ color:'#fff', fontFamily:'Heebo_600SemiBold', fontSize:16, textAlign:'right' }}>{item.title}</Text>
      <Text style={{ color:'#9CA3AF', fontFamily:'Heebo_400Regular', marginTop:6, lineHeight:20, textAlign:'right' }}>{item.body}</Text>
      <Text style={{ color:'#6b7280', fontFamily:'Heebo_400Regular', marginTop:8, fontSize:12, textAlign:'left' }}>{dateText}</Text>
    </View>
  )
}


