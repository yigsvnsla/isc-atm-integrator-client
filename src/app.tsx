import { RGBA } from "@opentui/core"
import { useEffect, useState } from "react"
import { useRenderer } from "@opentui/react"
import { useCsrfToken } from "./hooks/use-get-crsf-token"
import { useKeyboardEffect } from "./hooks/use-keyboard-effect"
import { AppShell, type Screen } from "./app-shell"
import { useAuth } from "./hooks/use-auth"

const isValidEmail = (email: string): boolean => {
  const atIdx = email.indexOf("@")
  if (atIdx < 1) return false
  return email.slice(atIdx + 1).includes(".")
}

export function App() {
  const renderer = useRenderer()
  const { token, isLoggedIn, login } = useAuth()
  const csrf = useCsrfToken()

  const [screen, setScreen] = useState<Screen>("dashboard")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [emailErr, setEmailErr] = useState("")
  const [passwdErr, setPasswdErr] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [loginErr, setLoginErr] = useState("")

  useEffect(() => {
    renderer.console.show()
    console.log("App mounted, CSRF:", csrf?.value)
  }, [])

  const disabled = submitting || csrf === null || !!csrf?.isFailed

  useKeyboardEffect((key) => {
    if (isLoggedIn) return
    if (key.name === "return" || (key.ctrl && key.name === "s")) {
      if (disabled || emailErr || passwdErr || !email || !password) return
      handleLogin()
    }
  })

  async function handleLogin() {
    setSubmitting(true)
    setLoginErr("")
    try {
      await login(email, password)
      setEmail("")
      setPassword("")
      setEmailErr("")
      setPasswdErr("")
    } catch (e: unknown) {
      setLoginErr((e as Error).message)
    }
    setSubmitting(false)
  }

  if (isLoggedIn) {
    return <AppShell screen={screen} onNavigate={setScreen} />
  }

  return (
    <box
      title=" ISC ATM INTEGRATOR "
      id="panel"
      flexGrow={1}
      borderStyle="rounded"
      justifyContent="center"
      alignItems="center"
    >
      {csrf?.isFailed && (
        <text bg={RGBA.fromHex("#df2121")} paddingX={1}>
          ✗ {csrf.error.message}
        </text>
      )}

      <box borderStyle="rounded" alignItems="center" padding={4} paddingY={1} paddingBottom={1}>
        <box flexDirection="row">
          <ascii-font id="title" text="BAN " font="block" color={RGBA.fromHex("#df2121")} />
          <ascii-font id="title" text="NET" font="block" color={RGBA.fromHex("#2c62b3")} />
        </box>

        <box alignItems="center" marginY={1}>
          <text>
            <strong>SERVICIO DE INTEGRACION FINANCIERO</strong>
          </text>
        </box>

        <box flexDirection="column">
          <box flexDirection="column">
            <box
              title=" Usuario "
              borderStyle="rounded"
              borderColor={emailErr ? RGBA.fromHex("#df2121") : undefined}
              paddingX={1}
            >
              <input
                id="email-input"
                width={30}
                placeholder="correo@ejemplo.com"
                textColor={disabled ? "#555" : "#FFFFFF"}
                focused={disabled ? false : undefined}
                onInput={(v: string) => {
                  if (disabled) return
                  setEmail(v)
                  setEmailErr(v && !isValidEmail(v) ? "Correo inválido" : "")
                }}
              />
            </box>
            {emailErr && (
              <text marginX={1} fg={RGBA.fromHex("#df2121")}>
                ✗ {emailErr}
              </text>
            )}
          </box>

          <box flexDirection="column">
            <box
              title=" Contraseña "
              borderStyle="rounded"
              borderColor={passwdErr ? RGBA.fromHex("#df2121") : undefined}
              paddingX={1}
            >
              <input
                id="password-input"
                width={30}
                placeholder="••••••••"
                textColor={disabled ? "#555" : "#FFFFFF"}
                focused={disabled ? false : undefined}
                onInput={(v: string) => {
                  if (disabled) return
                  setPassword(v)
                  setPasswdErr(v.length > 0 && v.length < 6 ? "Mínimo 6 caracteres" : "")
                }}
              />
            </box>
            {passwdErr && (
              <text marginX={1} fg={RGBA.fromHex("#df2121")}>
                ✗ {passwdErr}
              </text>
            )}
          </box>
        </box>

        {submitting && <text>Ingresando...</text>}
        {loginErr && (
          <text marginY={1} fg={RGBA.fromHex("#df2121")}>
            ✗ {loginErr}
          </text>
        )}
        {csrf && !csrf.isFailed && <text fg="#666">Enter o Ctrl+S para ingresar</text>}
      </box>
    </box>
  )
}
