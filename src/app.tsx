import { useState, useEffect } from "react"
import { useRenderer } from "@opentui/react"
import { useCsrf } from "@/components/csrf-provider"
import { setCsrfToken } from "@/services/api"
import { AppShell, type Screen } from "./app-shell"
import { useAuth } from "./hooks/use-auth"
import { LoginScreen } from "./screens/login"

export function App() {
  const renderer = useRenderer()
  const { isLoggedIn } = useAuth()
  const csrf = useCsrf()
  const [screen, setScreen] = useState<Screen>("dashboard")

  useEffect(() => {
    if (csrf) setCsrfToken(csrf)
  }, [csrf])

  useEffect(() => {
    renderer.console.show()
    console.log("App mounted, CSRF:", csrf)
  }, [])

  if (!isLoggedIn) return <LoginScreen />
  return <AppShell screen={screen} onNavigate={setScreen} />
}
