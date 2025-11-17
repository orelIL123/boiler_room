import React, { useState } from 'react'
import { SafeAreaView, View, Text, StyleSheet, ScrollView, Pressable, ImageBackground, Alert } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'

const GOLD = '#E63946'
const BG = '#000000'
const DEEP_BLUE = '#2D6A4F'

// קורסים חינמיים
const FREE_COURSES = [
  {
    id: 'course-1',
    title: 'Foundations of Trading',
    level: 'Beginner',
    duration: '6 פרקים • 3.5 שעות',
    description: 'מבוא למסחר ממושמע — הגדרת מטרות, ניהול סיכונים ובניית שגרה יומית.',
    cover: require('../../assets/photos/IMG_0691.png'),
    isFree: true,
  },
]

// קורסים VIP
const VIP_COURSES = [
  {
    id: 'course-2',
    title: 'Advanced Technical Analysis',
    level: 'Intermediate',
    duration: '8 פרקים • 5 שעות',
    description: 'העמקה בתבניות מתקדמות, ניתוח ווליום, וכלים לזיהוי מומנטום.',
    cover: require('../../assets/photos/IMG_0692.png'),
    isFree: false,
  },
  {
    id: 'course-3',
    title: 'Mindset & Faith Alignment',
    level: 'Mindset',
    duration: '5 פרקים • 2 שעות',
    description: 'איך לחבר בין אמונה, תודעה ומסחר בצורה מאוזנת ויציבה.',
    cover: require('../../assets/photos/IMG_0693.png'),
    isFree: false,
  },
]

export default function CoursesScreen({ navigation }) {
  const [activeTab, setActiveTab] = useState('free')

  const onCoursePress = (course) => {
    Alert.alert('בקרוב', `${course.title} ייפתח עם תוכן מלא לאחר חיבור לבקאנד.`)
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={[BG, '#f7f7f7']} style={StyleSheet.absoluteFill} />
      <View style={styles.header}>
        <Pressable
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
          accessibilityRole="button"
          accessibilityLabel="חזרה"
        >
          <Ionicons name="arrow-back" size={24} color={GOLD} />
        </Pressable>
        <Text style={styles.headerTitle}>לימודי מסחר</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* טאבים */}
      <View style={styles.tabsContainer}>
        <Pressable
          style={[styles.tab, activeTab === 'free' && styles.tabActive]}
          onPress={() => setActiveTab('free')}
        >
          <Ionicons 
            name={activeTab === 'free' ? 'unlock' : 'unlock-outline'} 
            size={18} 
            color={activeTab === 'free' ? GOLD : '#6b7280'} 
          />
          <Text style={[styles.tabText, activeTab === 'free' && styles.tabTextActive]}>
            קורסים חינמיים
          </Text>
        </Pressable>
        <Pressable
          style={[styles.tab, activeTab === 'vip' && styles.tabActive]}
          onPress={() => setActiveTab('vip')}
        >
          <Ionicons 
            name={activeTab === 'vip' ? 'diamond' : 'diamond-outline'} 
            size={18} 
            color={activeTab === 'vip' ? GOLD : '#6b7280'} 
          />
          <Text style={[styles.tabText, activeTab === 'vip' && styles.tabTextActive]}>
            קורסים VIP
          </Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {activeTab === 'free' ? (
          <>
            <Text style={styles.subtitle}>התחל את המסע שלך</Text>
            {FREE_COURSES.map((course, idx) => (
              <Pressable
                key={course.id}
                style={[styles.courseCard, idx === 0 && styles.courseCardFirst]}
                onPress={() => onCoursePress(course)}
                accessibilityRole="button"
                accessibilityLabel={`קורס ${course.title}`}
              >
                <ImageBackground source={course.cover} style={styles.coverImage} imageStyle={styles.coverImageRadius}>
                  <LinearGradient colors={['rgba(0,0,0,0.55)', 'rgba(0,0,0,0.15)']} style={StyleSheet.absoluteFill} />
                  <View style={styles.courseLabelRow}>
                    <View style={styles.levelPill}>
                      <Text style={styles.levelText}>{course.level}</Text>
                    </View>
                    <View style={styles.freeBadge}>
                      <Ionicons name="unlock" size={14} color={DEEP_BLUE} />
                      <Text style={styles.freeBadgeText}>חינמי</Text>
                    </View>
                  </View>
                  <View style={styles.courseTextBlock}>
                    <Text style={styles.courseTitle}>{course.title}</Text>
                    <View style={styles.courseMetaRow}>
                      <Ionicons name="time-outline" size={14} color="#f3f4f6" />
                      <Text style={styles.courseMeta}>{course.duration}</Text>
                    </View>
                    <Text style={styles.courseDesc}>{course.description}</Text>
                  </View>
                </ImageBackground>
              </Pressable>
            ))}
          </>
        ) : (
          <>
            <Text style={styles.subtitle}>קורסים בלעדיים למשתמשי VIP</Text>
            {VIP_COURSES.map((course, idx) => (
              <Pressable
                key={course.id}
                style={[styles.courseCard, idx === 0 && styles.courseCardFirst]}
                onPress={() => onCoursePress(course)}
                accessibilityRole="button"
                accessibilityLabel={`קורס ${course.title}`}
              >
                <ImageBackground source={course.cover} style={styles.coverImage} imageStyle={styles.coverImageRadius}>
                  <LinearGradient colors={['rgba(0,0,0,0.55)', 'rgba(0,0,0,0.15)']} style={StyleSheet.absoluteFill} />
                  <View style={styles.courseLabelRow}>
                    <View style={styles.levelPill}>
                      <Text style={styles.levelText}>{course.level}</Text>
                    </View>
                    <View style={styles.vipBadge}>
                      <Ionicons name="diamond" size={14} color={GOLD} />
                      <Text style={styles.vipBadgeText}>VIP</Text>
                    </View>
                  </View>
                  <View style={styles.courseTextBlock}>
                    <Text style={styles.courseTitle}>{course.title}</Text>
                    <View style={styles.courseMetaRow}>
                      <Ionicons name="time-outline" size={14} color="#f3f4f6" />
                      <Text style={styles.courseMeta}>{course.duration}</Text>
                    </View>
                    <Text style={styles.courseDesc}>{course.description}</Text>
                  </View>
                </ImageBackground>
              </Pressable>
            ))}
          </>
        )}

        <View style={styles.footerCard}>
          <Ionicons name="diamond" size={32} color={GOLD} />
          <View style={styles.footerTextBlock}>
            <Text style={styles.footerTitle}>מסלול VIP</Text>
            <Text style={styles.footerDesc}>
              משתמשי VIP יקבלו גישה לקורסים מיוחדים, שיעורים לייב וקהילת מאסטרמיינד סגורה.
            </Text>
          </View>
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
    paddingHorizontal: 16,
    paddingBottom: 32,
    gap: 18,
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    gap: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(11,27,58,0.1)',
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: 'rgba(11,27,58,0.04)',
  },
  tabActive: {
    backgroundColor: 'rgba(212,175,55,0.15)',
  },
  tabText: {
    fontSize: 14,
    fontFamily: 'Poppins_500Medium',
    color: '#6b7280',
  },
  tabTextActive: {
    color: GOLD,
    fontFamily: 'Poppins_600SemiBold',
  },
  subtitle: {
    alignSelf: 'flex-end',
    color: DEEP_BLUE,
    fontSize: 15,
    fontFamily: 'Poppins_500Medium',
    marginTop: 8,
  },
  courseCard: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 10 },
    elevation: 5,
  },
  courseCardFirst: {
    marginTop: 6,
  },
  coverImage: {
    height: 220,
    justifyContent: 'space-between',
  },
  coverImageRadius: {
    borderRadius: 20,
  },
  courseLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  levelPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(212,175,55,0.18)',
  },
  levelText: {
    color: '#fdf3c2',
    fontSize: 12,
    fontFamily: 'Poppins_600SemiBold',
  },
  freeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: 'rgba(45,106,79,0.2)',
  },
  freeBadgeText: {
    color: '#ffffff',
    fontSize: 11,
    fontFamily: 'Poppins_600SemiBold',
  },
  vipBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: 'rgba(212,175,55,0.25)',
  },
  vipBadgeText: {
    color: '#fdf3c2',
    fontSize: 11,
    fontFamily: 'Poppins_600SemiBold',
  },
  courseTextBlock: {
    padding: 18,
    alignItems: 'flex-end',
    gap: 8,
  },
  courseTitle: {
    color: '#ffffff',
    fontSize: 20,
    fontFamily: 'Poppins_700Bold',
    textAlign: 'right',
  },
  courseMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  courseMeta: {
    color: '#f3f4f6',
    fontSize: 12,
    fontFamily: 'Poppins_500Medium',
  },
  courseDesc: {
    color: '#f3f4f6',
    fontSize: 13,
    fontFamily: 'Poppins_400Regular',
    textAlign: 'right',
    lineHeight: 18,
  },
  footerCard: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 18,
    borderRadius: 18,
    backgroundColor: 'rgba(212,175,55,0.1)',
  },
  footerTextBlock: {
    flex: 1,
    alignItems: 'flex-end',
    gap: 4,
  },
  footerTitle: {
    color: DEEP_BLUE,
    fontSize: 16,
    fontFamily: 'Poppins_600SemiBold',
  },
  footerDesc: {
    color: '#4b5563',
    fontSize: 13,
    fontFamily: 'Poppins_400Regular',
    textAlign: 'right',
    lineHeight: 18,
  },
})
