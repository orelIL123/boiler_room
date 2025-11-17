import React, { useState } from 'react'
import { SafeAreaView, View, Text, StyleSheet, Pressable, ScrollView, Share, Image, ActivityIndicator, Dimensions, Linking, Alert } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import { Video, ResizeMode } from 'expo-av'

const GOLD = '#E63946'
const BG = '#000000'
const DEEP_BLUE = '#2D6A4F'

// מבנה הערך היומי עם תמיכה במדיה
const todayInsight = {
  title: 'הכוח של סבלנות במסחר',
  date: new Date().toLocaleDateString('he-IL', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }),
  readTime: '2 דקות קריאה',
  category: 'Mindset',
  author: 'טל פרטוק',
  content: `המסחר הוא מרתון, לא ספרינט.

כשאתה מתחיל את הדרך, אתה רוצה תוצאות מהירות. אתה רוצה לראות את החשבון גדל כל יום, לחוש את ההצלחה מיד. אבל האמת היא שהמסחר המצליח בנוי על סבלנות, משמעת, ואמונה בתהליך.

כל טריידר מצליח עבר את התקופות הקשות. את הימים שבהם השוק נע נגדו, את השבועות שבהם הכל נראה אפור. אבל מה שמייחד אותם זה שהם לא ויתרו.

הם הבינו משהו פשוט אך עמוק:
• הצלחה במסחר היא תוצאה של עקביות לאורך זמן
• כל טעות היא שיעור
• כל יום הוא הזדמנות חדשה

אז היום, תזכור:
אתה לא מתחרה עם אף אחד חוץ מעצמך אתמול.
התמקד בתהליך, לא רק בתוצאה.
סבלנות + משמעת = הצלחה.

💪 המשך לצמוח, המשך להאמין.`,
  // תמיכה במדיה:
  // imageUrl: 'https://example.com/image.jpg' - תמונת URL או null
  // videoUrl: 'https://example.com/video.mp4' - וידאו מקומי או URL
  // videoType: 'local' | 'url' | 'youtube' - סוג וידאו
  imageUrl: null, // או URL מ-Firebase Storage
  videoUrl: null, // או URL מ-Firebase Storage / YouTube
  videoType: null, // 'local' | 'url' | 'youtube'
}

export default function DailyInsightScreen({ navigation }) {
  const [imageLoading, setImageLoading] = useState(!!todayInsight.imageUrl)
  const [videoLoading, setVideoLoading] = useState(!!todayInsight.videoUrl && todayInsight.videoType !== 'youtube')
  const [youtubeThumbnailLoading, setYoutubeThumbnailLoading] = useState(!!todayInsight.videoUrl && todayInsight.videoType === 'youtube')
  const videoRef = React.useRef(null)

  const handleShare = React.useCallback(() => {
    Share.share({ message: `${todayInsight.title}\n\n${todayInsight.content}\n\n— ${todayInsight.author}` }).catch(() => {})
  }, [])

  const handleOpenYoutube = React.useCallback((url) => {
    Linking.openURL(url).catch(() => {
      Alert.alert('שגיאה', 'לא ניתן לפתוח את הקישור')
    })
  }, [])

  const screenWidth = Dimensions.get('window').width - 64 // פחות padding
  const mediaWidth = screenWidth

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={[BG, '#f5f5f5']} style={StyleSheet.absoluteFill} />
      <View style={styles.header}>
        <Pressable
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
          accessibilityRole="button"
          accessibilityLabel="חזרה"
        >
          <Ionicons name="arrow-back" size={24} color={GOLD} />
        </Pressable>
        <Text style={styles.headerTitle}>ערך יומי</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          <View style={styles.categoryChip}>
            <Text style={styles.categoryText}>{todayInsight.category}</Text>
          </View>

          <Text style={styles.title}>{todayInsight.title}</Text>

          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Ionicons name="calendar-outline" size={16} color={GOLD} style={styles.metaIcon} />
              <Text style={styles.metaText}>{todayInsight.date}</Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="time-outline" size={16} color={GOLD} style={styles.metaIcon} />
              <Text style={styles.metaText}>{todayInsight.readTime}</Text>
            </View>
          </View>

          {/* תמונה - אם קיימת */}
          {todayInsight.imageUrl && (
            <View style={styles.mediaContainer}>
              {imageLoading && (
                <View style={[styles.mediaLoader, { width: mediaWidth, height: mediaWidth * 0.6 }]}>
                  <ActivityIndicator size="large" color={GOLD} />
                </View>
              )}
              <Image
                source={{ uri: todayInsight.imageUrl }}
                style={[styles.mediaImage, { width: mediaWidth, height: mediaWidth * 0.6 }]}
                resizeMode="cover"
                onLoadStart={() => setImageLoading(true)}
                onLoadEnd={() => setImageLoading(false)}
                onError={() => setImageLoading(false)}
              />
            </View>
          )}

          {/* וידאו - אם קיים */}
          {todayInsight.videoUrl && (
            <View style={styles.mediaContainer}>
              {todayInsight.videoType === 'youtube' ? (
                <Pressable
                  style={[styles.videoPlaceholder, { width: mediaWidth, height: mediaWidth * 0.56 }]}
                  onPress={() => handleOpenYoutube(todayInsight.videoUrl)}
                >
                  <View style={styles.youtubeOverlay}>
                    <Ionicons name="play-circle" size={64} color="#fff" />
                    <Text style={styles.youtubeText}>פתח ב-YouTube</Text>
                  </View>
                  {youtubeThumbnailLoading && (
                    <View style={styles.mediaLoader}>
                      <ActivityIndicator size="large" color={GOLD} />
                    </View>
                  )}
                  <Image
                    source={{ uri: `https://img.youtube.com/vi/${todayInsight.videoUrl.split('/').pop().split('?')[0]}/maxresdefault.jpg` }}
                    style={StyleSheet.absoluteFill}
                    resizeMode="cover"
                    onLoadStart={() => setYoutubeThumbnailLoading(true)}
                    onLoadEnd={() => setYoutubeThumbnailLoading(false)}
                  />
                </Pressable>
              ) : (
                <View style={[styles.videoContainer, { width: mediaWidth, height: mediaWidth * 0.56 }]}>
                  {videoLoading && (
                    <View style={styles.mediaLoader}>
                      <ActivityIndicator size="large" color={GOLD} />
                    </View>
                  )}
                  <Video
                    ref={videoRef}
                    source={{ uri: todayInsight.videoUrl }}
                    style={styles.video}
                    useNativeControls
                    resizeMode={ResizeMode.CONTAIN}
                    onLoadStart={() => setVideoLoading(true)}
                    onLoad={() => setVideoLoading(false)}
                    onError={() => setVideoLoading(false)}
                  />
                </View>
              )}
            </View>
          )}

          <View style={styles.body}>
            {todayInsight.content.split('\n\n').map((para, idx) => (
              <Text key={idx} style={styles.paragraph}>{para}</Text>
            ))}
          </View>

          <View style={styles.authorRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>NB</Text>
            </View>
            <View style={styles.authorInfo}>
              <Text style={styles.authorName}>{todayInsight.author}</Text>
              <Text style={styles.authorTitle}>Trader • Mentor • Faith</Text>
            </View>
            <Pressable style={styles.shareBtn} onPress={handleShare} accessibilityRole="button">
              <Ionicons name="share-social-outline" size={16} color="#fff" />
              <Text style={styles.shareText}>שיתוף</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.nextReminder}>
          <Text style={styles.reminderText}>💫 התובנה הבאה תגיע מחר בשעה 08:00</Text>
          <Text style={styles.reminderSub}>הפעל התראות כדי לקבל אותה בזמן אמת</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 6,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(212,175,55,0.12)',
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: 'Poppins_600SemiBold',
    color: GOLD,
  },
  content: {
    padding: 20,
    paddingBottom: 64,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 12 },
    elevation: 4,
  },
  categoryChip: {
    alignSelf: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(212,175,55,0.14)',
  },
  categoryText: {
    color: GOLD,
    fontSize: 12,
    fontFamily: 'Poppins_600SemiBold',
    letterSpacing: 0.6,
  },
  title: {
    marginTop: 18,
    textAlign: 'right',
    color: DEEP_BLUE,
    fontSize: 26,
    fontFamily: 'Poppins_700Bold',
    lineHeight: 34,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 18,
    marginTop: 18,
    paddingBottom: 18,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(11,27,58,0.1)',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaIcon: {
    marginTop: 1,
  },
  metaText: {
    color: '#6b7280',
    fontSize: 12,
    fontFamily: 'Poppins_500Medium',
  },
  body: {
    marginTop: 20,
    gap: 16,
  },
  paragraph: {
    color: '#111827',
    fontSize: 15,
    lineHeight: 26,
    textAlign: 'right',
    fontFamily: 'Poppins_400Regular',
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 28,
    gap: 14,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: GOLD,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#000',
    fontSize: 16,
    fontFamily: 'Poppins_700Bold',
  },
  authorInfo: {
    flex: 1,
    alignItems: 'flex-end',
  },
  authorName: {
    color: DEEP_BLUE,
    fontSize: 14,
    fontFamily: 'Poppins_600SemiBold',
  },
  authorTitle: {
    marginTop: 2,
    color: '#6b7280',
    fontSize: 12,
    fontFamily: 'Poppins_400Regular',
  },
  shareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: GOLD,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
  },
  shareText: {
    color: '#000',
    fontSize: 12,
    fontFamily: 'Poppins_600SemiBold',
  },
  nextReminder: {
    marginTop: 24,
    padding: 18,
    borderRadius: 16,
    backgroundColor: 'rgba(212,175,55,0.08)',
    alignItems: 'center',
    gap: 6,
  },
  reminderText: {
    color: DEEP_BLUE,
    fontSize: 14,
    fontFamily: 'Poppins_600SemiBold',
    textAlign: 'center',
  },
  reminderSub: {
    color: '#6b7280',
    fontSize: 12,
    fontFamily: 'Poppins_400Regular',
  },
  mediaContainer: {
    marginTop: 20,
    marginBottom: 20,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#f0f0f0',
  },
  mediaImage: {
    borderRadius: 16,
  },
  mediaLoader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 16,
    zIndex: 1,
  },
  videoContainer: {
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#000',
    position: 'relative',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  videoPlaceholder: {
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#000',
    position: 'relative',
  },
  youtubeOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 2,
  },
  youtubeText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'Poppins_600SemiBold',
    marginTop: 8,
  },
})
