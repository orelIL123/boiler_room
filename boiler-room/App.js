import React, { useEffect, useRef, useState } from 'react'
import { StatusBar } from 'expo-status-bar'
import { View, ActivityIndicator, Image, Animated, Dimensions } from 'react-native'
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import * as Notifications from 'expo-notifications'
import HomeScreen from './src/HomeScreen'
import DailyInsightScreen from './src/screens/DailyInsightScreen'
import CoursesScreen from './src/screens/CoursesScreen'
import NewsScreen from './src/screens/NewsScreen'
import ProfileScreen from './src/screens/ProfileScreen'
import LiveAlertsScreen from './src/screens/LiveAlertsScreen'
import AdminScreen from './src/screens/AdminScreen'
import PathsScreen from './src/screens/PathsScreen'
import CommunityScreen from './src/screens/CommunityScreen'
import { useFonts, Poppins_400Regular, Poppins_600SemiBold, Poppins_700Bold } from '@expo-google-fonts/poppins'
import { CinzelDecorative_400Regular, CinzelDecorative_700Bold } from '@expo-google-fonts/cinzel-decorative'
import { Heebo_400Regular, Heebo_500Medium, Heebo_600SemiBold, Heebo_700Bold } from '@expo-google-fonts/heebo'
import { registerForPushNotificationsAsync } from './src/utils/notifications'
import { UserProvider } from './src/context/UserContext'

const Stack = createNativeStackNavigator()

export default function App() {
  const [showSplash, setShowSplash] = useState(true)
  const fadeAnim = useRef(new Animated.Value(1)).current
  const navigationRef = useRef(null)

  const [fontsLoaded, fontError] = useFonts({
    Poppins_400Regular,
    Poppins_600SemiBold,
    Poppins_700Bold,
    CinzelDecorative_400Regular,
    CinzelDecorative_700Bold,
    Heebo_400Regular,
    Heebo_500Medium,
    Heebo_600SemiBold,
    Heebo_700Bold,
  })

  // Log font loading errors
  useEffect(() => {
    if (fontError) {
      console.log('Font loading error:', fontError)
    }
  }, [fontError])

  useEffect(() => {
    // Show for 2s, then fade out over 1s
    const t = setTimeout(() => {
      try {
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }).start(({ finished }) => {
          if (finished) setShowSplash(false)
        })
      } catch (error) {
        console.log('Error in splash animation:', error)
        setShowSplash(false)
      }
    }, 2000)
    return () => clearTimeout(t)
  }, [fadeAnim])

  // Register for push notifications
  useEffect(() => {
    registerForPushNotificationsAsync().then(token => {
      if (token) {
        console.log('Push Token:', token)
        // TODO: Save token to Firestore when user logs in
      }
    }).catch(error => {
      console.log('Error registering for push notifications:', error)
    })

    // Handle notification received while app is in foreground
    const notificationListener = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification received:', notification)
    })

    // Handle notification tap
    const responseListener = Notifications.addNotificationResponseReceivedListener(response => {
      try {
        const screen = response.notification.request.content.data?.screen
        if (screen && navigationRef.current) {
          navigationRef.current.navigate(screen)
        }
      } catch (error) {
        console.log('Error handling notification tap:', error)
      }
    })

    return () => {
      if (notificationListener) {
        try {
          Notifications.removeNotificationSubscription(notificationListener)
        } catch (error) {
          console.log('Error removing notification listener:', error)
        }
      }
      if (responseListener) {
        try {
          Notifications.removeNotificationSubscription(responseListener)
        } catch (error) {
          console.log('Error removing response listener:', error)
        }
      }
    }
  }, [])

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#000000' }}>
        <ActivityIndicator color="#D4AF37" />
        <StatusBar style="light" />
      </View>
    )
  }

  return (
    <UserProvider>
      <View style={{ flex: 1, backgroundColor: '#000000' }}>
        <NavigationContainer ref={navigationRef}>
          <StatusBar style="light" />
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="DailyInsight" component={DailyInsightScreen} />
            <Stack.Screen name="Courses" component={CoursesScreen} />
            <Stack.Screen name="News" component={NewsScreen} />
            <Stack.Screen name="Profile" component={ProfileScreen} />
            <Stack.Screen name="LiveAlerts" component={LiveAlertsScreen} />
            <Stack.Screen name="Admin" component={AdminScreen} />
            <Stack.Screen name="Paths" component={PathsScreen} />
            <Stack.Screen name="Community" component={CommunityScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      {showSplash && (
        <Animated.View 
          pointerEvents="none" 
          style={[
            { 
              position: 'absolute', 
              top: 0, 
              left: 0, 
              right: 0, 
              bottom: 0, 
              opacity: fadeAnim, 
              backgroundColor: '#000000',
              alignItems: 'center',
              justifyContent: 'center'
            }
          ]}
        >
          <Image
            source={require('./assets/splashphoto.png')}
            style={{ 
              width: Dimensions.get('window').width * 0.9,
              height: Dimensions.get('window').height * 0.9,
              maxWidth: 400,
              maxHeight: 400
            }}
            resizeMode="contain"
          />
        </Animated.View>
      )}
      </View>
    </UserProvider>
  )
}
