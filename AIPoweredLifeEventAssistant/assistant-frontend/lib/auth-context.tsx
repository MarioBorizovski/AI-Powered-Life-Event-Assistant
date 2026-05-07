'use client'

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'

export interface PersonalInfo {
  embg: string // Единствен матичен број на граѓанин
  firstName: string
  lastName: string
  dateOfBirth: string
  placeOfBirth: string
  address: string
  city: string
  postalCode: string
  phoneNumber: string
  idCardNumber: string // Број на лична карта
}

export interface User {
  id: string
  email: string
  name: string
  role: 'user' | 'admin'
  password?: string
  personalInfo?: PersonalInfo
  hasCompletedProfile?: boolean
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>
  logout: () => void
  updateProfile: (data: { name?: string; email?: string; password?: string }) => Promise<{ success: boolean; error?: string }>
  updatePersonalInfo: (info: PersonalInfo) => Promise<{ success: boolean; error?: string }>
  isAdmin: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Mock users for demonstration
const MOCK_USERS: User[] = [
  {
    id: '1',
    email: 'admin@test.com',
    name: 'Администратор',
    role: 'admin',
    password: 'admin123',
  },
  {
    id: '2',
    email: 'user@test.com',
    name: 'Корисник Тест',
    role: 'user',
    password: 'user123',
  },
]

const STORAGE_KEY = 'euslugi_auth'
const USERS_KEY = 'euslugi_users'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const getUsers = useCallback((): User[] => {
    if (typeof window === 'undefined') return MOCK_USERS
    const stored = localStorage.getItem(USERS_KEY)
    if (stored) {
      return JSON.parse(stored)
    }
    localStorage.setItem(USERS_KEY, JSON.stringify(MOCK_USERS))
    return MOCK_USERS
  }, [])

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const userData = JSON.parse(stored)
      setUser(userData)
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 800))

    const users = getUsers()
    const foundUser = users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    )

    if (foundUser) {
      const { password: _, ...userWithoutPassword } = foundUser
      setUser(userWithoutPassword as User)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(userWithoutPassword))
      return { success: true }
    }

    return { success: false, error: 'Невалидна е-пошта или лозинка' }
  }

  const register = async (name: string, email: string, password: string) => {
    await new Promise((resolve) => setTimeout(resolve, 800))

    const users = getUsers()
    const exists = users.find((u) => u.email.toLowerCase() === email.toLowerCase())

    if (exists) {
      return { success: false, error: 'Корисник со оваа е-пошта веќе постои' }
    }

    const newUser: User = {
      id: String(Date.now()),
      email,
      name,
      role: 'user',
      password,
    }

    const updatedUsers = [...users, newUser]
    localStorage.setItem(USERS_KEY, JSON.stringify(updatedUsers))

    const { password: _, ...userWithoutPassword } = newUser
    setUser(userWithoutPassword as User)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(userWithoutPassword))

    return { success: true }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem(STORAGE_KEY)
  }

  const updateProfile = async (data: { name?: string; email?: string; password?: string }) => {
    await new Promise((resolve) => setTimeout(resolve, 500))

    if (!user) {
      return { success: false, error: 'Не сте најавени' }
    }

    const users = getUsers()

    // Check if new email already exists (if changing email)
    if (data.email && data.email !== user.email) {
      const exists = users.find((u) => u.email.toLowerCase() === data.email!.toLowerCase())
      if (exists) {
        return { success: false, error: 'Корисник со оваа е-пошта веќе постои' }
      }
    }

    const updatedUsers = users.map((u) => {
      if (u.id === user.id) {
        return {
          ...u,
          name: data.name || u.name,
          email: data.email || u.email,
          password: data.password || u.password,
        }
      }
      return u
    })

    localStorage.setItem(USERS_KEY, JSON.stringify(updatedUsers))

    const updatedUser = {
      ...user,
      name: data.name || user.name,
      email: data.email || user.email,
    }

    setUser(updatedUser)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedUser))

    return { success: true }
  }

  const updatePersonalInfo = async (info: PersonalInfo) => {
    await new Promise((resolve) => setTimeout(resolve, 500))

    if (!user) {
      return { success: false, error: 'Не сте најавени' }
    }

    const users = getUsers()

    const updatedUsers = users.map((u) => {
      if (u.id === user.id) {
        return {
          ...u,
          personalInfo: info,
          hasCompletedProfile: true,
          name: `${info.firstName} ${info.lastName}`,
        }
      }
      return u
    })

    localStorage.setItem(USERS_KEY, JSON.stringify(updatedUsers))

    const updatedUser = {
      ...user,
      personalInfo: info,
      hasCompletedProfile: true,
      name: `${info.firstName} ${info.lastName}`,
    }

    setUser(updatedUser)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedUser))

    return { success: true }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        register,
        logout,
        updateProfile,
        updatePersonalInfo,
        isAdmin: user?.role === 'admin',
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
