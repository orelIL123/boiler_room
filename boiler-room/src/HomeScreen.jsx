import React, { useMemo, useState, useCallback } from 'react'
import { View, Text, StyleSheet, FlatList, Pressable, Animated, Platform, Dimensions, Image, ImageBackground, ScrollView, Share, Alert, Easing, Linking } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import { Grayscale } from 'react-native-color-matrix-image-filters'
import SideMenu from './components/SideMenu'
import { useUser } from './context/UserContext'

const GOLD = '#E63946'
const BG = '#000000'
const DEEP_BLUE = '#2D6A4F'
const GREEN = '#16a34a'
const BRIGHT_GREEN = '#22c55e'

const CARDS = [
  { key: 'daily-insight', title: 'ערך יומי', desc: 'תובנה מעוררת השראה ליום שלך', icon: 'bulb-outline', image: require('../assets/photos/IMG_0694.png') },
  { key: 'community', title: 'קהילה', desc: 'עדכוני קבוצה ושיתופים מהקהילה', icon: 'chatbubbles-outline', image: require('../assets/photos/IMG_0693.png') },
  { key: 'stock-picks', title: 'המלצות על מניות', desc: 'סיגנלים יומיים/שבועיים למסחר', icon: 'trending-up-outline', image: require('../assets/photos/IMG_0692.png'), locked: true, imageScale: 0.92 },
  { key: 'academy', title: 'לימודי מסחר', desc: 'קורסי וידאו ומסלולי למידה', icon: 'school-outline', image: require('../assets/photos/IMG_0694.png') },
  { key: 'live-alerts', title: 'התראות חמות', desc: 'מרכז התראות ופוש בזמן אמת', icon: 'notifications-outline', image: require('../assets/photos/IMG_0693.png'), imageScale: 0.97 },
]

// Carousel image order (image 3 promoted to first)
const IMAGES = [
  require('../assets/photos/IMG_0693.png'), // 1st
  require('../assets/photos/IMG_0691.png'),
  require('../assets/photos/IMG_0692.png'),
  require('../assets/photos/IMG_0694.png'),
  require('../assets/photos/IMG_0693.png'),
  require('../assets/photos/IMG_0691.png'),
]

function useFadeIn(delay = 0) {
  const anim = useMemo(() => new Animated.Value(0), [])
  React.useEffect(() => {
    Animated.timing(anim, { toValue: 1, duration: 600, delay, useNativeDriver: true }).start()
  }, [anim, delay])
  return anim
}

// Market snapshot from API
const INITIAL_MARKET = [
  { key: 'ETH', label: 'Ethereum', value: 3500.00, change: 0.45 },
  { key: 'XRP', label: 'XRP', value: 0.65, change: 1.25 },
]

const MARKET_API_BASE = 'https://apimarket-mskm.onrender.com'

// Popular symbols available via API
const AVAILABLE_SYMBOLS = [
  { key: 'ETH', label: 'Ethereum', symbol: 'ETH' },
  { key: 'XRP', label: 'XRP', symbol: 'XRP' },
  { key: 'BTC', label: 'Bitcoin', symbol: 'BTC' },
  { key: 'AAPL', label: 'Apple', symbol: 'AAPL' },
  { key: 'GOOGL', label: 'Google', symbol: 'GOOGL' },
  { key: 'MSFT', label: 'Microsoft', symbol: 'MSFT' },
  { key: 'TSLA', label: 'Tesla', symbol: 'TSLA' },
  { key: 'NVDA', label: 'NVIDIA', symbol: 'NVDA' },
  { key: 'AMZN', label: 'Amazon', symbol: 'AMZN' },
  { key: 'META', label: 'Meta', symbol: 'META' },
  { key: 'SOL', label: 'Solana', symbol: 'SOL' },
  { key: 'ADA', label: 'Cardano', symbol: 'ADA' },
  { key: 'DOGE', label: 'Dogecoin', symbol: 'DOGE' },
]

// Default selected symbols
const DEFAULT_SELECTED = ['ETH', 'XRP']

function useMarketData(selectedSymbols = DEFAULT_SELECTED) {
  const [items, setItems] = React.useState(INITIAL_MARKET)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState(null)
  const previousPrices = React.useRef({})

  const fetchMarketData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Get symbols to fetch based on selection
      const symbolsToFetch = AVAILABLE_SYMBOLS.filter(s => selectedSymbols.includes(s.key))
      
      // Fetch data for each selected symbol
      const promises = symbolsToFetch.map(async ({ key, label, symbol }) => {
        try {
          const response = await fetch(`${MARKET_API_BASE}/price/${symbol}`)
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
          }
          const data = await response.json()
          
          // API returns: { symbol, price, currency, last_refreshed, source }
          const currentPrice = data.price || 0
          const previousPrice = previousPrices.current[key]
          
          // Calculate change percentage
          let change = 0
          if (previousPrice && previousPrice > 0) {
            change = ((currentPrice - previousPrice) / previousPrice) * 100
          }
          
          // Store current price for next calculation
          previousPrices.current[key] = currentPrice
          
          return {
            key,
            label,
            value: currentPrice,
            change: parseFloat(change.toFixed(2)),
          }
        } catch (err) {
          // Silently handle errors for unsupported symbols (like TA35, NASDAQ)
          // Only log if it's not a 404 (expected for unsupported symbols)
          if (err.message && !err.message.includes('404')) {
            console.warn(`Error fetching ${symbol}:`, err.message)
          }
          // Return null on error - we'll keep previous data from state
          return null
        }
      })
      
      const results = await Promise.all(promises)
      // Filter out null results (errors) and update only successful ones
      const successfulResults = results.filter(item => item !== null && item.value > 0)
      
      // Merge with previous items to keep data for failed symbols
      setItems(prevItems => {
        const updatedMap = new Map(successfulResults.map(item => [item.key, item]))
        return prevItems.map(item => updatedMap.get(item.key) || item)
      })
    } catch (err) {
      console.error('Error fetching market data:', err)
      setError(err.message)
      // Keep previous data on error
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    // Fetch immediately on mount
    fetchMarketData()
    
    // Then fetch every 5 seconds to keep data fresh
    const interval = setInterval(fetchMarketData, 5000)
    
    return () => clearInterval(interval)
  }, [fetchMarketData, selectedSymbols])

  return { items, loading, error }
}

function Card({ item, index, scrollX, SNAP, CARD_WIDTH, CARD_HEIGHT, OVERLAP, onPress }) {
  const fade = useFadeIn(index * 80)
  const pressAnim = React.useRef(new Animated.Value(0)).current

  const onPressIn = () => Animated.spring(pressAnim, { toValue: 1, useNativeDriver: true, speed: 20, bounciness: 10 }).start()
  const onPressOut = () => Animated.spring(pressAnim, { toValue: 0, useNativeDriver: true, speed: 20, bounciness: 10 }).start()

  const inputRange = [ (index - 1) * SNAP, index * SNAP, (index + 1) * SNAP ]
  const animatedStyle = {
    opacity: fade,
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    transform: [
      { translateY: scrollX.interpolate({ inputRange, outputRange: [12, -8, 12], extrapolate: 'clamp' }) },
      { scale: scrollX.interpolate({ inputRange, outputRange: [0.9, 1, 0.9], extrapolate: 'clamp' }) },
      { perspective: 900 },
      { rotateY: scrollX.interpolate({ inputRange, outputRange: ['12deg', '0deg', '-12deg'], extrapolate: 'clamp' }) },
      { rotateZ: scrollX.interpolate({ inputRange, outputRange: ['2deg', '0deg', '-2deg'], extrapolate: 'clamp' }) },
      { scale: pressAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 0.985] }) },
    ],
  }

  const imageStyle = [StyleSheet.absoluteFill, item?.imageScale ? { transform: [{ scale: item.imageScale }] } : null]

  return (
    <View style={[styles.cardItemContainer, { width: CARD_WIDTH, marginRight: -OVERLAP }]}>
      <View style={styles.cardLabelContainer}>
        <Text style={[styles.cardLabelTitle, { textAlign: 'right' }]}>{item.title}</Text>
        <Text style={[styles.cardLabelDesc, { textAlign: 'right' }]} numberOfLines={2}>{item.desc}</Text>
      </View>
      <Pressable
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        onPress={() => {
          if (item.locked) {
            Alert.alert('תוכן נעול', 'התוכן מיועד למשתמשים רשומים בלבד')
            return
          }
          onPress?.(item)
        }}
        style={styles.cardPressable}
        accessibilityRole="button"
        accessibilityLabel={`${item.title} - ${item.desc}`}
      >
        <Animated.View style={[styles.card, animatedStyle]}>
          <ImageBackground
            source={item.image || IMAGES[index % IMAGES.length]}
            resizeMode="cover"
            style={StyleSheet.absoluteFill}
            imageStyle={imageStyle}
          />
          <LinearGradient
            colors={[ 'rgba(0,0,0,0.35)', 'rgba(0,0,0,0.0)' ]}
            locations={[0, 0.45]}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>
      </Pressable>
    </View>
  )
}

export default function HomeScreen({ navigation }) {
  const { width } = Dimensions.get('window')
  const SPACING = 12
  const CARD_WIDTH = Math.min(width * 0.76, 360)
  const CARD_HEIGHT = Math.round(CARD_WIDTH * (16/9))
  const OVERLAP = 56
  const SNAP = CARD_WIDTH - OVERLAP
  const sideInset = (width - CARD_WIDTH) / 2

  const scrollX = React.useRef(new Animated.Value(0)).current
  const [selectedSymbols, setSelectedSymbols] = React.useState(DEFAULT_SELECTED)
  const { items: market } = useMarketData(selectedSymbols)
  const [activeTab, setActiveTab] = React.useState('home')
  const [sideMenuVisible, setSideMenuVisible] = React.useState(false)
  const [symbolSelectorVisible, setSymbolSelectorVisible] = React.useState(false)
  const pulse = React.useRef(new Animated.Value(0)).current
  const { userType } = useUser()

  const triggerPulse = React.useCallback(() => {
    pulse.setValue(0)
    Animated.timing(pulse, {
      toValue: 1,
      duration: 800,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start()
  }, [pulse])

  const pulseStyle = {
    opacity: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.7, 0] }),
    transform: [
      { scale: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.6, 2.0] }) },
    ],
  }
  const [completedDays, setCompletedDays] = React.useState(8)
  const progress = Math.max(0, Math.min(1, completedDays / 14))
  const quote = 'הצלחות משמעותיות נבנות מצעדים קטנים ועקביים. התמדה היא הכוח.'
  const [unreadCount, setUnreadCount] = React.useState(3) // TODO: Get from backend

  const onShareQuote = React.useCallback(() => {
    Share.share({ message: `"${quote}" — טל פרטוק` }).catch(() => {})
  }, [quote])

  const handleCardPress = React.useCallback((key) => {
    if (key === 'daily-insight') {
      navigation?.navigate('DailyInsight')
      return
    }
    if (key === 'community') {
      navigation?.navigate('Community')
      return
    }
    if (key === 'academy') {
      navigation?.navigate('Courses')
      return
    }
    if (key === 'live-alerts') {
      navigation?.navigate('LiveAlerts')
      return
    }
    Alert.alert('בקרוב', 'המסך הזה עדיין בפיתוח')
  }, [navigation])

  const handleNotificationPress = React.useCallback(() => {
    Alert.alert('בקרוב', 'מערכת התראות תתווסף בקרוב')
  }, [])

  const openSocialLink = React.useCallback((url) => {
    Linking.openURL(url).catch(() => {
      Alert.alert('שגיאה', 'לא ניתן לפתוח את הקישור')
    })
  }, [])

  const openYouTube = React.useCallback(() => {
    Linking.openURL('https://www.youtube.com/@BoilerRoom.Israel').catch(() => {
      Alert.alert('שגיאה', 'לא ניתן לפתוח את הקישור')
    })
  }, [])

  const openRecommendations = React.useCallback(() => {
    // TODO: עדכן את הקישור לפלייליסט ספציפי של סרטוני המלצות
    Linking.openURL('https://www.youtube.com/@BoilerRoom.Israel').catch(() => {
      Alert.alert('שגיאה', 'לא ניתן לפתוח את הקישור')
    })
  }, [])

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Pressable
          accessibilityRole="button"
          style={styles.headerMenu}
          hitSlop={12}
          onPress={() => setSideMenuVisible(true)}
        >
          <Ionicons name="menu" size={28} color={GOLD} />
        </Pressable>
        <Pressable
          accessibilityRole="button"
          style={styles.headerBell}
          hitSlop={12}
          onPress={handleNotificationPress}
        >
          <Ionicons name="notifications-outline" size={31} color={GOLD} />
          {unreadCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
            </View>
          )}
        </Pressable>
        <View style={styles.headerContent}>
          <Text style={styles.title}>BOILER ROOM</Text>
          <Text style={styles.subtitle}>Trading • Mindset • Faith</Text>
        </View>
      </View>

      <View style={styles.main}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Animated.FlatList
            data={CARDS}
            keyExtractor={(it) => it.key}
            horizontal
            showsHorizontalScrollIndicator={false}
            snapToInterval={SNAP}
            decelerationRate="fast"
            bounces={false}
            contentContainerStyle={{ paddingHorizontal: sideInset, paddingVertical: 4 }}
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { x: scrollX } } }],
              { useNativeDriver: true }
            )}
            scrollEventThrottle={16}
            renderItem={({ item, index }) => (
              <Card
                item={item}
                index={index}
                scrollX={scrollX}
                SNAP={SNAP}
                CARD_WIDTH={CARD_WIDTH}
                CARD_HEIGHT={CARD_HEIGHT}
                OVERLAP={OVERLAP}
                onPress={() => handleCardPress(item.key)}
              />
            )}
          />

          {/* YouTube Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>בואו ליוטיוב</Text>
            </View>
            <Pressable
              onPress={openYouTube}
              style={styles.youtubeCard}
              accessibilityRole="button"
              accessibilityLabel="בואו ליוטיוב"
            >
              <ImageBackground
                source={require('../assets/photos/youtube.jpg')}
                style={styles.youtubeCardImage}
                imageStyle={styles.youtubeCardImageStyle}
                resizeMode="cover"
              >
                <LinearGradient
                  colors={['rgba(34,197,94,0.4)', 'rgba(22,163,74,0.2)']}
                  style={StyleSheet.absoluteFill}
                />
                <View style={styles.youtubeCardContent}>
                  <Ionicons name="logo-youtube" size={50} color="#FF0000" />
                  <Text style={styles.youtubeCardTitle}>Boiler Room</Text>
                  <Text style={styles.youtubeCardSubtitle}>ערוץ היוטיוב שלנו</Text>
                  <Ionicons name="play-circle" size={32} color={GOLD} style={{ marginTop: 12 }} />
                </View>
              </ImageBackground>
            </Pressable>
          </View>

          {/* Market Snapshot */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>תצוגת שוק חיה</Text>
              <Pressable
                onPress={() => setSymbolSelectorVisible(true)}
                style={styles.symbolSelectorBtn}
                accessibilityRole="button"
              >
                <Ionicons name="settings-outline" size={18} color={BRIGHT_GREEN} />
                <Text style={styles.symbolSelectorText}>בחר סימולים</Text>
              </Pressable>
            </View>
            <View style={styles.snapshotBar}>
              {market.map(m => {
                // Skip items with invalid data
                if (!m || !m.value || m.value === 0) return null
                
                const up = m.change >= 0
                // Format price based on symbol type
                let formattedValue
                if (['BTC', 'ETH'].includes(m.key)) {
                  // Crypto with high values - round to integer
                  formattedValue = Math.round(m.value).toLocaleString()
                } else if (['XRP', 'ADA', 'DOGE'].includes(m.key)) {
                  // Low-value crypto - show 4-6 decimals
                  formattedValue = m.value.toLocaleString('en-US', { minimumFractionDigits: 4, maximumFractionDigits: 6 })
                } else {
                  // Stocks - show 2 decimals
                  formattedValue = m.value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                }
                
                return (
                  <View key={m.key} style={styles.snapshotItem}>
                    <Text style={styles.snapshotLabel}>{m.label}</Text>
                    <Text style={styles.snapshotValue}>{formattedValue}</Text>
                    <View style={styles.snapshotChangeRow}>
                      <Ionicons name={up ? 'caret-up' : 'caret-down'} size={14} color={up ? '#16a34a' : '#dc2626'} />
                      <Text style={[styles.snapshotChange, { color: up ? '#16a34a' : '#dc2626' }]}>{m.change >= 0 ? '+' : ''}{m.change.toFixed(2)}%</Text>
                    </View>
                  </View>
                )
              })}
            </View>
          </View>

          {/* Quote of the Week */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>ציטוט השבוע</Text>
            </View>
            <View style={styles.quoteCard}>
              <Text style={styles.quoteText}>“{quote}”</Text>
              <View style={styles.quoteFooter}>
                <Text style={styles.quoteAuthor}>— טל פרטוק</Text>
                <Pressable onPress={onShareQuote} style={styles.shareBtn} accessibilityRole="button">
                  <Ionicons name="share-social-outline" size={16} color="#ffffff" />
                  <Text style={styles.shareBtnText}>שיתוף</Text>
                </Pressable>
              </View>
            </View>
          </View>

          {/* Podcasts / Meditations */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>פינת פודקאסטים </Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.podcastRow}>
              {[1,2,3].map(i => (
                <Pressable
                  key={`pod-${i}`}
                  style={styles.podcastCard}
                  onPress={() => Alert.alert('בקרוב', 'נגן אודיו יתווסף כאן')}
                  accessibilityRole="button"
                >
                  <Ionicons name="play-circle" size={34} color={GOLD} />
                  <Text style={styles.podcastTitle}>פרק {i}</Text>
                  <Text style={styles.podcastDesc} numberOfLines={1}>Placeholder audio</Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>

          {/* Paths Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>המסלולים שלנו</Text>
            </View>
            <Pressable
              style={styles.pathsCard}
              onPress={() => navigation?.navigate('Paths')}
              accessibilityRole="button"
            >
              <LinearGradient
                colors={[BRIGHT_GREEN + '30', BRIGHT_GREEN + '10']}
                style={StyleSheet.absoluteFill}
              />
              <View style={styles.pathsCardContent}>
                <Ionicons name="school" size={40} color={BRIGHT_GREEN} />
                <View style={styles.pathsCardText}>
                  <Text style={styles.pathsCardTitle}>בוחרים מסלול ומתחילים להגשים</Text>
                  <Text style={styles.pathsCardDesc}>הכשרה דיגיטלית למסחר והשקעות בשוק ההון</Text>
                </View>
                <Ionicons name="arrow-forward" size={24} color={BRIGHT_GREEN} />
              </View>
            </Pressable>
          </View>

          {/* Students Recommendations */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>תלמידים ממליצים</Text>
            </View>
            <Pressable
              style={styles.recommendationsCard}
              onPress={openRecommendations}
              accessibilityRole="button"
              accessibilityLabel="תלמידים ממליצים"
            >
              <LinearGradient
                colors={['#E4405F', '#C13584', '#833AB4']}
                style={StyleSheet.absoluteFill}
              />
              <View style={styles.recommendationsContent}>
                <Ionicons name="people-circle" size={50} color="#FFFFFF" />
                <View style={styles.recommendationsText}>
                  <Text style={styles.recommendationsTitle}>סרטוני המלצות</Text>
                  <Text style={styles.recommendationsDesc}>
                    צפה בסרטונים קצרים של תלמידים שמספרים על החוויה שלהם
                  </Text>
                </View>
                <Ionicons name="play-circle" size={40} color="#FFFFFF" />
              </View>
            </Pressable>
          </View>

          {/* Social Links */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>קישורים חברתיים</Text>
            </View>
            <View style={styles.socialRow}>
              <Pressable
                style={styles.socialButton}
                onPress={() => openSocialLink('https://www.instagram.com/boilerroom')}
                accessibilityRole="button"
                accessibilityLabel="Instagram"
              >
                <Ionicons name="logo-instagram" size={24} color="#E4405F" />
                <Text style={styles.socialLabel}>Instagram</Text>
              </Pressable>
              <Pressable
                style={styles.socialButton}
                onPress={() => openSocialLink('https://t.me/boilerroom')}
                accessibilityRole="button"
                accessibilityLabel="Telegram"
              >
                <Ionicons name="paper-plane-outline" size={24} color="#0088cc" />
                <Text style={styles.socialLabel}>Telegram</Text>
              </Pressable>
              <Pressable
                style={styles.socialButton}
                onPress={() => openSocialLink('https://wa.me/972XXXXXXXXX')}
                accessibilityRole="button"
                accessibilityLabel="WhatsApp"
              >
                <Ionicons name="logo-whatsapp" size={24} color="#25D366" />
                <Text style={styles.socialLabel}>WhatsApp</Text>
              </Pressable>
            </View>
          </View>

        </ScrollView>
      </View>

      <View style={styles.bottomNav}>
        <Pressable
          accessibilityRole="button"
          onPress={() => { setActiveTab('home'); triggerPulse(); navigation?.navigate('Home') }}
          style={styles.navItemPressable}
        >
          <View style={styles.iconBox}>
            <Animated.View style={[styles.pulseRing, pulseStyle]} />
            <Ionicons name="home-outline" size={22} color={activeTab === 'home' ? GOLD : '#B3B3B3'} />
          </View>
          <Text style={[styles.navLabel, { color: activeTab === 'home' ? GOLD : '#B3B3B3' }]}>בית</Text>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          onPress={() => {
            setActiveTab('community')
            navigation?.navigate('Community')
          }}
          style={styles.navItemPressable}
        >
          <View style={styles.iconBox}>
            <Ionicons name="chatbubbles-outline" size={22} color={activeTab === 'community' ? GOLD : '#B3B3B3'} />
          </View>
          <Text style={[styles.navLabel, { color: activeTab === 'community' ? GOLD : '#B3B3B3' }]}>קהילה</Text>
        </Pressable>

        {/* CENTER - Courses (Featured Button) */}
        <Pressable
          accessibilityRole="button"
          onPress={() => { setActiveTab('courses'); navigation?.navigate('Courses') }}
          style={styles.centerNavButton}
        >
          <View style={styles.centerNavGlowOuter} />
          <LinearGradient
            colors={[GOLD, '#c49b2e', GOLD]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.centerNavGradient}
          >
            <View style={styles.centerNavGlow} />
            <Ionicons name="school" size={28} color="#fff" />
          </LinearGradient>
          <Text style={styles.centerNavLabel}>קורסים</Text>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          onPress={() => { setActiveTab('news'); navigation?.navigate('News') }}
          style={styles.navItemPressable}
        >
          <View style={styles.iconBox}>
            <Ionicons name="newspaper-outline" size={22} color={activeTab === 'news' ? GOLD : '#B3B3B3'} />
          </View>
          <Text style={[styles.navLabel, { color: activeTab === 'news' ? GOLD : '#B3B3B3' }]}>חדשות</Text>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          onPress={() => { setActiveTab('profile'); navigation?.navigate('Profile') }}
          style={styles.navItemPressable}
        >
          <View style={styles.iconBox}>
            <Ionicons name="person-circle-outline" size={22} color={activeTab === 'profile' ? GOLD : '#B3B3B3'} />
          </View>
          <Text style={[styles.navLabel, { color: activeTab === 'profile' ? GOLD : '#B3B3B3' }]}>פרופיל</Text>
        </Pressable>
      </View>

      <SideMenu
        visible={sideMenuVisible}
        onClose={() => setSideMenuVisible(false)}
        navigation={navigation}
      />

      {/* Symbol Selector Modal */}
      {symbolSelectorVisible && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>בחר סימולים</Text>
              <Pressable
                onPress={() => setSymbolSelectorVisible(false)}
                style={styles.modalCloseBtn}
                accessibilityRole="button"
              >
                <Ionicons name="close" size={24} color="#FFFFFF" />
              </Pressable>
            </View>
            <ScrollView style={styles.modalBody}>
              <Text style={styles.modalSubtitle}>בחר עד 5 סימולים לתצוגה</Text>
              {AVAILABLE_SYMBOLS.map(symbol => {
                const isSelected = selectedSymbols.includes(symbol.key)
                return (
                  <Pressable
                    key={symbol.key}
                    onPress={() => {
                      if (isSelected) {
                        if (selectedSymbols.length > 1) {
                          setSelectedSymbols(selectedSymbols.filter(k => k !== symbol.key))
                        } else {
                          Alert.alert('חובה לבחור לפחות סימול אחד')
                        }
                      } else {
                        if (selectedSymbols.length < 5) {
                          setSelectedSymbols([...selectedSymbols, symbol.key])
                        } else {
                          Alert.alert('ניתן לבחור עד 5 סימולים')
                        }
                      }
                    }}
                    style={[styles.symbolOption, isSelected && styles.symbolOptionSelected]}
                    accessibilityRole="button"
                    accessibilityState={{ selected: isSelected }}
                  >
                    <View style={styles.symbolOptionContent}>
                      <Text style={[styles.symbolOptionLabel, isSelected && styles.symbolOptionLabelSelected]}>
                        {symbol.label}
                      </Text>
                      <Text style={[styles.symbolOptionKey, isSelected && styles.symbolOptionKeySelected]}>
                        {symbol.symbol}
                      </Text>
                    </View>
                    {isSelected && (
                      <Ionicons name="checkmark-circle" size={24} color={BRIGHT_GREEN} />
                    )}
                  </Pressable>
                )
              })}
            </ScrollView>
            <View style={styles.modalFooter}>
              <Pressable
                onPress={() => setSymbolSelectorVisible(false)}
                style={styles.modalDoneBtn}
                accessibilityRole="button"
              >
                <Text style={styles.modalDoneText}>סיום</Text>
              </Pressable>
            </View>
          </View>
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: BG,
  },
  header: {
    paddingTop: Platform.select({ ios: 48, android: 34, default: 42 }),
    paddingBottom: 12,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    backgroundColor: '#000000',
  },
  headerContent: {
    alignItems: 'center',
    marginTop: 6,
  },
  logo: {
    width: 60,
    height: 60,
    marginBottom: 8,
  },
  headerMenu: {
    position: 'absolute',
    left: 16,
    top: Platform.select({ ios: 54, android: 52, default: 48 }),
    zIndex: 10,
  },
  headerBell: {
    position: 'absolute',
    right: 16,
    top: Platform.select({ ios: 54, android: 52, default: 48 }),
    zIndex: 10,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -6,
    backgroundColor: '#dc2626',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
    borderWidth: 2,
    borderColor: BG,
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 11,
    fontFamily: 'Poppins_700Bold',
  },
  title: {
    color: GOLD,
    fontSize: 28,
    fontWeight: '700',
    fontFamily: 'CinzelDecorative_700Bold',
    letterSpacing: 3,
  },
  subtitle: {
    marginTop: 6,
    color: '#B3B3B3',
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
  },
  main: {
    flex: 1,
    paddingHorizontal: 8,
    paddingBottom: 72,
    marginTop: -4,
  },
  scrollContent: {
    paddingBottom: 92,
    gap: 18,
  },
  grid: {
  },
  gridRow: {
  },
  section: {
    paddingHorizontal: 8,
  },
  sectionHeader: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  symbolSelectorBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: 'rgba(34,197,94,0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: BRIGHT_GREEN,
  },
  symbolSelectorText: {
    color: BRIGHT_GREEN,
    fontSize: 12,
    fontFamily: 'Poppins_600SemiBold',
  },
  sectionTitle: {
    color: BRIGHT_GREEN,
    fontSize: 16,
    fontFamily: 'Heebo_600SemiBold',
    textAlign: 'right',
  },
  snapshotBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1F2937',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 2,
    borderColor: BRIGHT_GREEN,
  },
  snapshotItem: {
    alignItems: 'flex-end',
    minWidth: 96,
  },
  snapshotLabel: {
    color: '#9CA3AF',
    fontSize: 12,
    fontFamily: 'Poppins_500Medium',
  },
  snapshotValue: {
    color: '#E5E7EB',
    fontSize: 15,
    marginTop: 2,
    fontFamily: 'Poppins_600SemiBold',
  },
  snapshotChangeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
    justifyContent: 'flex-end',
  },
  snapshotChange: {
    fontSize: 12,
    fontFamily: 'Poppins_500Medium',
  },
  quoteCard: {
    backgroundColor: '#1F2937',
    borderRadius: 14,
    padding: 14,
    borderWidth: 2,
    borderColor: BRIGHT_GREEN,
  },
  quoteText: {
    color: '#E5E7EB',
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'right',
    fontFamily: 'Poppins_500Medium',
  },
  quoteFooter: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  quoteAuthor: {
    color: '#9CA3AF',
    fontSize: 12,
    fontFamily: 'Poppins_400Regular',
  },
  shareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: GOLD,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  shareBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontFamily: 'Poppins_600SemiBold',
  },
  podcastRow: {
    gap: 10,
    paddingHorizontal: 2,
  },
  podcastCard: {
    width: 160,
    height: 110,
    borderRadius: 12,
    backgroundColor: '#1F2937',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.1)',
    padding: 12,
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  podcastTitle: {
    color: '#E5E7EB',
    fontSize: 14,
    fontFamily: 'Poppins_600SemiBold',
  },
  podcastDesc: {
    color: '#9CA3AF',
    fontSize: 12,
    fontFamily: 'Poppins_400Regular',
  },
  cardItemContainer: {
    alignItems: 'flex-end',
  },
  cardLabelContainer: {
    alignItems: 'flex-end',
    paddingRight: 28,
    marginBottom: 10,
  },
  cardLabelTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontFamily: 'Heebo_600SemiBold',
    marginBottom: 2,
  },
  cardLabelDesc: {
    color: '#FFFFFF',
    opacity: 0.9,
    fontSize: 13,
    lineHeight: 18,
    fontFamily: 'Heebo_400Regular',
  },
  cardPressable: {
    justifyContent: 'center',
  },
  card: {
    borderRadius: 18,
    padding: 18,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.06)',
    shadowColor: '#000',
    shadowOpacity: 0.45,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 12 },
    elevation: 8,
  },
  lockIcon: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 32,
    height: 32,
  },
  cardContent: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    padding: 16,
    paddingRight: 28,
    alignItems: 'flex-end',
    justifyContent: 'flex-start',
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 10,
  },
  cardIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    marginBottom: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(212,175,55,0.12)',
  },
  cardTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'Poppins_600SemiBold',
    marginBottom: 6,
  },
  cardDesc: {
    color: '#B3B3B3',
    fontSize: 14,
    lineHeight: 20,
    fontFamily: 'Poppins_400Regular',
  },
  bottomNav: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingTop: 8,
    paddingBottom: 12,
    backgroundColor: '#000000',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  navItemPressable: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  navItem: {
    alignItems: 'center',
    gap: 4,
  },
  navItemActive: {
    alignItems: 'center',
    gap: 4,
  },
  iconBox: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulseRing: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: GOLD,
  },
  navLabel: {
    fontSize: 12,
    color: '#B3B3B3',
    fontFamily: 'Poppins_400Regular',
  },
  socialRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: 8,
  },
  socialButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: BRIGHT_GREEN,
    gap: 8,
  },
  socialLabel: {
    color: '#E5E7EB',
    fontSize: 14,
    fontFamily: 'Poppins_500Medium',
  },
  centerNavButton: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -28,
  },
  centerNavGlowOuter: {
    position: 'absolute',
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: GOLD,
    opacity: 0.15,
    top: -16,
    left: -16,
  },
  centerNavGradient: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: GOLD,
    shadowOpacity: 0.6,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    elevation: 12,
    borderWidth: 4,
    borderColor: BG,
  },
  centerNavGlow: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: GOLD,
    opacity: 0.25,
  },
  centerNavLabel: {
    marginTop: 6,
    fontSize: 12,
    color: GOLD,
    fontFamily: 'Poppins_600SemiBold',
  },
  youtubeCard: {
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: 8,
    shadowColor: BRIGHT_GREEN,
    shadowOpacity: 0.3,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  youtubeCardImage: {
    width: '100%',
    aspectRatio: 16 / 9,
    justifyContent: 'center',
    alignItems: 'center',
  },
  youtubeCardImageStyle: {
    borderRadius: 16,
  },
  youtubeCardContent: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  youtubeCardTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontFamily: 'Heebo_700Bold',
    marginTop: 12,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  youtubeCardSubtitle: {
    color: '#000000',
    fontSize: 16,
    fontFamily: 'Heebo_500Medium',
    marginTop: 8,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  pathsCard: {
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: 8,
    borderWidth: 2,
    borderColor: BRIGHT_GREEN,
  },
  pathsCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    gap: 16,
  },
  pathsCardText: {
    flex: 1,
    alignItems: 'flex-end',
  },
  pathsCardTitle: {
    fontSize: 18,
    fontFamily: 'Heebo_700Bold',
    color: '#FFFFFF',
    marginBottom: 6,
    textAlign: 'right',
  },
  pathsCardDesc: {
    fontSize: 14,
    fontFamily: 'Heebo_400Regular',
    color: '#D1D5DB',
    textAlign: 'right',
  },
  recommendationsCard: {
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: 8,
    minHeight: 140,
    shadowColor: '#E4405F',
    shadowOpacity: 0.3,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  recommendationsContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    gap: 16,
  },
  recommendationsText: {
    flex: 1,
    alignItems: 'flex-end',
    gap: 6,
  },
  recommendationsTitle: {
    fontSize: 20,
    fontFamily: 'Heebo_700Bold',
    color: '#FFFFFF',
    textAlign: 'right',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  recommendationsDesc: {
    fontSize: 14,
    fontFamily: 'Heebo_400Regular',
    color: '#FFFFFF',
    textAlign: 'right',
    opacity: 0.95,
    lineHeight: 20,
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalContent: {
    width: '90%',
    maxWidth: 400,
    maxHeight: '80%',
    backgroundColor: '#1F2937',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: BRIGHT_GREEN,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  modalTitle: {
    color: BRIGHT_GREEN,
    fontSize: 20,
    fontFamily: 'Heebo_700Bold',
  },
  modalCloseBtn: {
    padding: 4,
  },
  modalBody: {
    padding: 16,
    maxHeight: 400,
  },
  modalSubtitle: {
    color: '#9CA3AF',
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
    marginBottom: 16,
    textAlign: 'right',
  },
  symbolOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    marginBottom: 8,
    backgroundColor: '#374151',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  symbolOptionSelected: {
    backgroundColor: 'rgba(34,197,94,0.15)',
    borderColor: BRIGHT_GREEN,
  },
  symbolOptionContent: {
    flex: 1,
    alignItems: 'flex-end',
  },
  symbolOptionLabel: {
    color: '#E5E7EB',
    fontSize: 16,
    fontFamily: 'Poppins_600SemiBold',
    marginBottom: 4,
  },
  symbolOptionLabelSelected: {
    color: '#FFFFFF',
  },
  symbolOptionKey: {
    color: '#9CA3AF',
    fontSize: 12,
    fontFamily: 'Poppins_400Regular',
  },
  symbolOptionKeySelected: {
    color: BRIGHT_GREEN,
  },
  modalFooter: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  modalDoneBtn: {
    backgroundColor: BRIGHT_GREEN,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalDoneText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Poppins_600SemiBold',
  },
})


