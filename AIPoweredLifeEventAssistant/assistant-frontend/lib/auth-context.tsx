'use client'

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react'
import {
  apiAuth,
  setToken,
  clearToken,
  getToken,
  type ApiUser,
} from './api-client'

// ── Types ─────────────────────────────────────────────────
export interface PersonalInfo {
  embg: string
  firstName: string
  lastName: string
  dateOfBirth: string
  placeOfBirth: string
  address: string
  city: string
  postalCode: string
  phoneNumber: string
  idCardNumber: string
}

export interface User {
  id: string
  email: string
  name: string
  role: 'user' | 'admin'
  embg?: string | null
  phone_number?: string | null
  address?: string | null
  city?: string | null
  hasCompletedProfile?: boolean
  personalInfo?: PersonalInfo
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

// ── Helper: map backend user → local User ─────────────────
function mapApiUser(apiUser: ApiUser): User {
  return {
    id: apiUser.id,
    email: apiUser.email,
    name: apiUser.name,
    role: apiUser.role,
    embg: apiUser.embg,
    phone_number: apiUser.phone_number,
    address: apiUser.address,
    city: apiUser.city,
    hasCompletedProfile: !!(apiUser.embg || apiUser.phone_number || apiUser.address),
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // On mount: restore session from stored JWT
  useEffect(() => {
    const token = getToken()
    if (!token) {
      setIsLoading(false)
      return
    }
    apiAuth
      .me()
      .then((apiUser) => setUser(mapApiUser(apiUser)))
      .catch(() => clearToken())
      .finally(() => setIsLoading(false))
  }, [])

  const login = async (email: string, password: string) => {
    try {
      const data = await apiAuth.login(email, password)
      setToken(data.access_token)
      setUser(mapApiUser(data.user))
      return { success: true }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Грешка при најава'
      return { success: false, error: msg }
    }
  }

  const register = async (name: string, email: string, password: string) => {
    try {
      const data = await apiAuth.register(name, email, password)
      setToken(data.access_token)
      setUser(mapApiUser(data.user))
      return { success: true }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Грешка при регистрација'
      return { success: false, error: msg }
    }
  }

  const logout = () => {
    setUser(null)
    clearToken()
  }

  const updateProfile = async (data: {
    name?: string
    email?: string
    password?: string
  }) => {
    try {
      const updated = await apiAuth.updateMe(data)
      setUser((prev) => (prev ? { ...prev, ...mapApiUser(updated) } : null))
      return { success: true }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Грешка при ажурирање'
      return { success: false, error: msg }
    }
  }

  const updatePersonalInfo = async (info: PersonalInfo) => {
    try {
      const updated = await apiAuth.updateMe({
        name: `${info.firstName} ${info.lastName}`,
        embg: info.embg,
        phone_number: info.phoneNumber,
        address: info.address,
        city: info.city,
      })
      const mapped = mapApiUser(updated)
      setUser({
        ...mapped,
        personalInfo: info,
        hasCompletedProfile: true,
      })
      return { success: true }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Грешка при ажурирање'
      return { success: false, error: msg }
    }
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
