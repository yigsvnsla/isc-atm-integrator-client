import { useState, useEffect, useCallback } from "react"
import { useRenderer } from "@opentui/react"
import { useCsrf } from "@/components/csrf-provider"
import { setCsrfToken, onUnauthorized } from "@/services/api"
import { AppShell, type Screen } from "./app-shell"
import { useAuth } from "./hooks/use-auth"
import { LoginScreen } from "./screens/login"

export function App() {
  const renderer = useRenderer()
  const { isLoggedIn, logout } = useAuth()
  const csrf = useCsrf()
  const [screen, setScreen] = useState<Screen>("dashboard")
  const [forceLogin, setForceLogin] = useState(false)

  useEffect(() => {
    if (csrf) setCsrfToken(csrf)
  }, [csrf])

  useEffect(() => {
    renderer.console.show()
    console.log("App mounted, CSRF:", csrf)
  }, [])

  useEffect(() => {
    onUnauthorized(() => {
      logout()
      setForceLogin(true)
    })
  }, [logout])

  if (!isLoggedIn || forceLogin) return <LoginScreen onLoginSuccess={() => setForceLogin(false)} />
  return <AppShell screen={screen} onNavigate={setScreen} />
}
