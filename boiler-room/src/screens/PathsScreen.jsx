import React from 'react'
import { SafeAreaView, View, Text, StyleSheet, ScrollView, Pressable, Platform, Linking, Alert } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'

const GOLD = '#E63946'
const BG = '#000000'
const DEEP_BLUE = '#2D6A4F'
const BRIGHT_GREEN = '#22c55e'

const PATHS = [
  {
    id: 'digital',
    title: 'הכשרה דיגיטלית למסחר והשקעות בשוק ההון',
    subtitle: 'קורס אונליין מלא מ-0 ל-100',
    description: 'לימוד עולם המניות – לימוד מלא בקצב אישי, מכל מקום, עם גישה לתכנים החזקים ביותר.',
    target: 'מתאים למי שרוצה ללמוד בצורה עצמאית וגמישה.',
    icon: 'laptop-outline',
    color: '#3b82f6',
  },
  {
    id: 'frontend',
    title: 'הכשרה פרונטלית למסחר והשקעות בשוק ההון',
    subtitle: '15 מפגשים פרונטליים + 12 שיעורים אישיים',
    description: '15 מפגשים פרונטליים + 12 שיעורים אישיים עם מנטור + 4 חודשי גישה לעמדת מסחר בבויילר רום. מסחר יומי, סווינגים, השקעות, ניתוחים טכניים ופונדמנטליים, מיינדסט, ניהול סיכונים כולל גישה מלאה לבויילר רום, קהילה דיגיטלית פעילה וקורס דיגיטלי מלא.',
    target: 'מתאים למי שמחפש הכנסה צדדית או התחלה רצינית במסחר.',
    icon: 'people-outline',
    color: '#8b5cf6',
  },
  {
    id: 'futures',
    title: 'הכשרה פרונטלית למסחר בחוזים עתידיים',
    subtitle: '15 מפגשים פרונטליים + 12 מפגשי מנטורינג',
    description: '15 מפגשים פרונטליים + 12 מפגשי מנטורינג אישי + 6 חודשי גישה לעמדת מסחר בבויילר רום. לימוד מתקדם: Order Flow, ICT, SMC, תורת הרבעים, Footprint. כולל חצי שנה גישה מלאה לבויילר רום, קהילה דיגיטלית פעילה.',
    target: 'מתאים למתקדמים שרוצים להפוך לסוחרים מקצועיים.',
    icon: 'trending-up-outline',
    color: '#f59e0b',
  },
  {
    id: 'trading-desk',
    title: 'עמדת מסחר בבויילר רום',
    subtitle: 'גישה יומית לעמדת מסחר מקצועית',
    description: 'גישה יומית לעמדת מסחר מקצועית לצד סוחרים פעילים, סביבת מסחר מקצועית וממוקדת תוצאות.',
    target: 'מתאים למי שכבר פעיל בשוק ורוצה להקפיץ את היכולות האישיות ולהיות מוקף בסביבה של מקצוענים.',
    icon: 'desktop-outline',
    color: BRIGHT_GREEN,
  },
]

export default function PathsScreen({ navigation }) {
  const handlePathPress = (path) => {
    // TODO: Navigate to path details or open contact form
    Alert.alert('למידע נוסף', `לפרטים נוספים על ${path.title}, אנא צור קשר`)
  }

  const handleInfoPress = (path) => {
    Linking.openURL('https://wa.me/972XXXXXXXXX').catch(() => {
      Alert.alert('שגיאה', 'לא ניתן לפתוח את הקישור')
    })
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={[BG, '#0a0a0a']} style={StyleSheet.absoluteFill} />
      <View style={styles.header}>
        <Pressable
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
          accessibilityRole="button"
          accessibilityLabel="חזרה"
        >
          <Ionicons name="arrow-back" size={24} color={GOLD} />
        </Pressable>
        <Text style={styles.headerTitle}>המסלולים שלנו</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView 
        contentContainerStyle={styles.content} 
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.introSection}>
          <Text style={styles.introTitle}>בוחרים מסלול ומתחילים להגשים</Text>
          <Text style={styles.introSubtitle}>
            הכשרה דיגיטלית למסחר והשקעות בשוק ההון
          </Text>
        </View>

        {PATHS.map((path, index) => (
          <Pressable
            key={path.id}
            style={[styles.pathCard, index === 0 && styles.pathCardFirst]}
            onPress={() => handlePathPress(path)}
            accessibilityRole="button"
          >
            <LinearGradient
              colors={[path.color + '20', path.color + '10', 'transparent']}
              style={StyleSheet.absoluteFill}
            />
            <View style={[styles.pathCardBorder, { borderColor: path.color }]} />
            
            <View style={styles.pathCardHeader}>
              <View style={[styles.pathIcon, { backgroundColor: path.color + '30' }]}>
                <Ionicons name={path.icon} size={32} color={path.color} />
              </View>
              <View style={styles.pathHeaderText}>
                <Text style={styles.pathTitle}>{path.title}</Text>
                <Text style={styles.pathSubtitle}>{path.subtitle}</Text>
              </View>
            </View>

            <View style={styles.pathCardBody}>
              <Text style={styles.pathDescription}>{path.description}</Text>
              <View style={styles.pathTarget}>
                <Ionicons name="checkmark-circle" size={16} color={BRIGHT_GREEN} />
                <Text style={styles.pathTargetText}>{path.target}</Text>
              </View>
            </View>

            <Pressable
              style={[styles.infoButton, { backgroundColor: path.color }]}
              onPress={() => handleInfoPress(path)}
              accessibilityRole="button"
            >
              <Text style={styles.infoButtonText}>למידע נוסף</Text>
              <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
            </Pressable>
          </Pressable>
        ))}
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
    fontFamily: 'Heebo_600SemiBold',
    color: BRIGHT_GREEN,
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  introSection: {
    marginTop: 12,
    marginBottom: 24,
    alignItems: 'flex-end',
  },
  introTitle: {
    fontSize: 24,
    fontFamily: 'Heebo_700Bold',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'right',
  },
  introSubtitle: {
    fontSize: 16,
    fontFamily: 'Heebo_400Regular',
    color: '#9CA3AF',
    textAlign: 'right',
  },
  pathCard: {
    backgroundColor: '#1F2937',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  pathCardFirst: {
    marginTop: 8,
  },
  pathCardBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
  },
  pathCardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
    gap: 12,
  },
  pathIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pathHeaderText: {
    flex: 1,
    alignItems: 'flex-end',
  },
  pathTitle: {
    fontSize: 18,
    fontFamily: 'Heebo_700Bold',
    color: '#FFFFFF',
    marginBottom: 4,
    textAlign: 'right',
  },
  pathSubtitle: {
    fontSize: 14,
    fontFamily: 'Heebo_500Medium',
    color: BRIGHT_GREEN,
    textAlign: 'right',
  },
  pathCardBody: {
    marginBottom: 16,
  },
  pathDescription: {
    fontSize: 14,
    fontFamily: 'Heebo_400Regular',
    color: '#E5E7EB',
    lineHeight: 22,
    marginBottom: 12,
    textAlign: 'right',
  },
  pathTarget: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(34,197,94,0.1)',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(34,197,94,0.3)',
  },
  pathTargetText: {
    flex: 1,
    fontSize: 13,
    fontFamily: 'Heebo_500Medium',
    color: BRIGHT_GREEN,
    textAlign: 'right',
  },
  infoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    gap: 8,
  },
  infoButtonText: {
    fontSize: 16,
    fontFamily: 'Heebo_600SemiBold',
    color: '#FFFFFF',
  },
})

