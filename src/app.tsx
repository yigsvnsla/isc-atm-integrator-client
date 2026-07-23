import { useState, useEffect } from "react"
import { useRenderer } from "@opentui/react"
import { useAuth } from "@/components/auth-provider"
import { AppShell, type Screen } from "./app-shell"
import { LoginScreen } from "./screens/login"

export function App() {
  const renderer = useRenderer()
  const { isReady, isLoggedIn } = useAuth()
  const [screen, setScreen] = useState<Screen>("dashboard")

  useEffect(() => {
    renderer.console.show()
  }, [])

  if (!isReady) return <text>Cargando seguridad...</text>
  if (!isLoggedIn) return <LoginScreen />
  return <AppShell screen={screen} onNavigate={setScreen} />
}
