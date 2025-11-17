import React, { createContext, useState, useContext } from 'react'

const UserContext = createContext()

export const USER_TYPES = {
  GUEST: 'guest',
  REGISTERED: 'registered',
  VIP: 'vip',
  ADMIN: 'admin',
}

export function UserProvider({ children }) {
  const [userType, setUserType] = useState(USER_TYPES.GUEST)
  const [userData, setUserData] = useState(null)

  const value = {
    userType,
    setUserType,
    userData,
    setUserData,
    isGuest: userType === USER_TYPES.GUEST,
    isRegistered: userType === USER_TYPES.REGISTERED,
    isVIP: userType === USER_TYPES.VIP,
    isAdmin: userType === USER_TYPES.ADMIN,
  }

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>
}

export function useUser() {
  const context = useContext(UserContext)
  if (!context) {
    throw new Error('useUser must be used within UserProvider')
  }
  return context
}

