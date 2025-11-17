import React from 'react'
import { View, Text, StyleSheet, Pressable, Modal, Platform } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import { useUser } from '../context/UserContext'
import { useNavigation } from '@react-navigation/native'

const GOLD = '#E63946'
const BG = '#000000'
const BRIGHT_GREEN = '#22c55e'

// Lightweight placeholder logic – later replace with data-driven logic (Firestore)
const getHasNewCommunityEvent = () => {
  // For demo: always show 'new' to highlight the feature.
  // Replace with: check persisted 'lastSeenEventAt' vs latest event time from backend.
  return true
}

const MENU_ITEMS = [
  { id: 'home', label: 'בית', icon: 'home-outline', screen: 'Home' },
  { id: 'paths', label: 'המסלולים שלנו', icon: 'school-outline', screen: 'Paths' },
  { id: 'courses', label: 'קורסים', icon: 'book-outline', screen: 'Courses' },
  { id: 'daily-insight', label: 'ערך יומי', icon: 'bulb-outline', screen: 'DailyInsight' },
  { id: 'news', label: 'חדשות', icon: 'newspaper-outline', screen: 'News' },
  { id: 'alerts', label: 'התראות חמות', icon: 'notifications-outline', screen: 'LiveAlerts' },
  { id: 'profile', label: 'פרופיל', icon: 'person-outline', screen: 'Profile' },
  { id: 'community', label: 'קהילה', icon: 'people-outline', screen: 'Community' },
]

export default function SideMenu({ visible, onClose, navigation }) {
  const { userType, isGuest, isRegistered, isVIP } = useUser()
  const nav = navigation || useNavigation()

  const handleMenuItemPress = (item) => {
    if (item.screen) {
      nav?.navigate(item.screen)
    }
    onClose()
  }

  const getUserTypeLabel = () => {
    if (isVIP) return 'VIP'
    if (isRegistered) return 'רשום'
    return 'אורח'
  }

  const getUserTypeColor = () => {
    if (isVIP) return BRIGHT_GREEN
    if (isRegistered) return '#3b82f6'
    return '#9CA3AF'
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.menuContainer} onPress={(e) => e.stopPropagation()}>
          <LinearGradient
            colors={[BG, '#1a1a1a']}
            style={StyleSheet.absoluteFill}
          />
          
          <View style={styles.menuHeader}>
            <Text style={styles.menuTitle}>תפריט</Text>
            <Pressable onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={28} color={GOLD} />
            </Pressable>
          </View>

          <View style={styles.userTypeBadge}>
            <View style={[styles.userTypeDot, { backgroundColor: getUserTypeColor() }]} />
            <Text style={[styles.userTypeText, { color: getUserTypeColor() }]}>
              {getUserTypeLabel()}
            </Text>
          </View>

          <View style={styles.menuItems}>
            {MENU_ITEMS.map((item) => {
              const showNewBadge = item.id === 'community' && getHasNewCommunityEvent()
              return (
                <Pressable
                  key={item.id}
                  style={styles.menuItem}
                  onPress={() => handleMenuItemPress(item)}
                >
                  <Ionicons name={item.icon} size={24} color={GOLD} />
                  <Text style={styles.menuItemLabel}>{item.label}</Text>
                  {showNewBadge && (
                    <View style={styles.newBadge}>
                      <Text style={styles.newBadgeText}>חדש</Text>
                    </View>
                  )}
                  <Ionicons name="chevron-back" size={20} color="#6b7280" />
                </Pressable>
              )
            })}
          </View>

          <View style={styles.menuFooter}>
            <Text style={styles.footerText}>Boiler Room</Text>
            <Text style={styles.footerSubtext}>Trading • Mindset • Faith</Text>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  menuContainer: {
    width: '85%',
    height: '90%',
    backgroundColor: BG,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: Platform.select({ ios: 48, android: 24 }),
    paddingBottom: 24,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOpacity: 0.5,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: -5 },
    elevation: 10,
  },
  menuHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  menuTitle: {
    fontSize: 24,
    fontFamily: 'Heebo_700Bold',
    color: BRIGHT_GREEN,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(212,175,55,0.12)',
  },
  userTypeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    alignSelf: 'flex-end',
    marginBottom: 24,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  userTypeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  userTypeText: {
    fontSize: 12,
    fontFamily: 'Heebo_600SemiBold',
  },
  menuItems: {
    flex: 1,
    gap: 4,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.03)',
    marginBottom: 4,
  },
  newBadge: {
    marginHorizontal: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    backgroundColor: '#ef4444',
  },
  newBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontFamily: 'Heebo_700Bold',
  },
  menuItemLabel: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Heebo_500Medium',
    color: '#E5E7EB',
    textAlign: 'right',
  },
  menuFooter: {
    alignItems: 'center',
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  footerText: {
    fontSize: 18,
    fontFamily: 'Heebo_700Bold',
    color: GOLD,
    marginBottom: 4,
  },
  footerSubtext: {
    fontSize: 12,
    fontFamily: 'Heebo_400Regular',
    color: '#6b7280',
  },
})

