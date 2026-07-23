import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react"
import { setAuthTokens, clearAuth, onAuthChange, api } from "@/services/api"

interface AuthContextValue {
  csrfToken: string | null
  accessToken: string | null
  refreshToken: string | null
  isReady: boolean
  isLoggedIn: boolean
  isLoading: boolean
  error: string | null
  login: (email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue>({
  csrfToken: null,
  accessToken: null,
  refreshToken: null,
  isReady: false,
  isLoggedIn: false,
  isLoading: false,
  error: null,
  login: async () => {},
  logout: () => {},
})

export function useAuth() {
  return useContext(AuthContext)
}

interface LoginResponse {
  data: { accessToken: string; refreshToken: string }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [csrfToken, setCsrfToken] = useState<string | null>(null)
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [refreshToken, setRefreshToken] = useState<string | null>(null)
  const [isReady, setIsReady] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch CSRF token on mount
  useEffect(() => {
    fetch("http://localhost:7000/api/csrf-token", {
      headers: { "x-api-version": "1" },
    })
      .then(async (r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        const cookie = r.headers.get("set-cookie")
        const d = await r.json()
        if (!d.token) throw new Error("No token in response")
        setCsrfToken(d.token)
        setAuthTokens({ csrfToken: d.token, sessionCookie: cookie?.split(";")[0] ?? "" })
      })
      .catch((e) => console.error("CSRF fetch failed:", e))
      .finally(() => setIsReady(true))
  }, [])

  // Sync 401 → logout
  useEffect(() => {
    onAuthChange(() => {
      setAccessToken(null)
      setRefreshToken(null)
    })
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await api<LoginResponse>("auth/login", {
        method: "POST",
        body: { email, password },
      })
      setAccessToken(res.data.accessToken)
      setRefreshToken(res.data.refreshToken)
      setAuthTokens({
        accessToken: res.data.accessToken,
        refreshToken: res.data.refreshToken,
      })
    } catch (e: unknown) {
      setError((e as Error).message)
      throw e
    } finally {
      setIsLoading(false)
    }
  }, [])

  const logout = useCallback(() => {
    clearAuth()
    setAccessToken(null)
    setRefreshToken(null)
  }, [])

  return (
    <AuthContext.Provider
      value={{
        csrfToken,
        accessToken,
        refreshToken,
        isReady,
        isLoggedIn: !!accessToken,
        isLoading,
        error,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
