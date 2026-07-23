import { useState } from "react"
import { useKeyboardEffect } from "@/hooks/use-keyboard-effect"
import { useAuth } from "@/components/auth-provider"

export function LoginScreen() {
  const { isReady, login, isLoading, error: loginErr } = useAuth()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [emailErr, setEmailErr] = useState("")
  const [passwdErr, setPasswdErr] = useState("")
  const [focusIdx, setFocusIdx] = useState(0)

  const isValidEmail = (v: string) => { const i = v.indexOf("@"); return i > 0 && v.slice(i + 1).includes(".") }
  const disabled = !isReady || isLoading
  const canSubmit = email && password && !emailErr && !passwdErr && !disabled

  useKeyboardEffect((key) => {
    if (key.name === "tab") { setFocusIdx(i => (i + 1) % 3); return }
    if (key.name === "return" || (key.ctrl && key.name === "s")) {
      if (!canSubmit) return
      login(email, password).catch(() => {})
    }
  })

  return (
    <box flexGrow={1} borderStyle="rounded" justifyContent="center" alignItems="center">
      <box borderStyle="rounded" alignItems="center" padding={4} paddingY={1} paddingBottom={1}>
        <box flexDirection="row">
          <ascii-font id="t1" text="BAN " font="block" color="#df2121" />
          <ascii-font id="t2" text="NET" font="block" color="#2c62b3" />
        </box>
        <box alignItems="center" marginY={1}>
          <text><b>SERVICIO DE INTEGRACION FINANCIERO</b></text>
        </box>

        {!isReady && <text fg="#888">Cargando seguridad...</text>}

        {isReady && (
          <box flexDirection="column" gap={1}>
            <box flexDirection="column">
              <text fg="#888" marginBottom={1}><b>Usuario</b></text>
              <box borderStyle="rounded" borderColor={emailErr ? "#df2121" : focusIdx === 0 ? "#58a6ff" : undefined} paddingX={1}>
                <input
                  width={30} placeholder="correo@ejemplo.com"
                  textColor={disabled ? "#555" : "#FFF"}
                  focused={focusIdx === 0}
                  onInput={(v: string) => {
                    setEmail(v)
                    setEmailErr(v && !isValidEmail(v) ? "Correo inválido" : "")
                  }}
                />
              </box>
              {emailErr && <text marginX={1} fg="#df2121">✗ {emailErr}</text>}
            </box>
            <box flexDirection="column">
              <text fg="#888" marginBottom={1}><b>Contraseña</b></text>
              <box borderStyle="rounded" borderColor={passwdErr ? "#df2121" : focusIdx === 1 ? "#58a6ff" : undefined} paddingX={1}>
                <input
                  width={30} placeholder="••••••••"
                  textColor={disabled ? "#555" : "#FFF"}
                  focused={focusIdx === 1}
                  onInput={(v: string) => {
                    setPassword(v)
                    setPasswdErr(v.length > 0 && v.length < 6 ? "Mínimo 6 caracteres" : "")
                  }}
                />
              </box>
              {passwdErr && <text marginX={1} fg="#df2121">✗ {passwdErr}</text>}
            </box>

            <box
              borderStyle="rounded"
              borderColor={focusIdx === 2 ? "#58a6ff" : undefined}
              backgroundColor={disabled ? "#333" : "#2c62b3"}
              paddingX={2}
              alignItems="center"
              onMouseDown={() => { if (canSubmit) login(email, password).catch(() => {}) }}
            >
              <text fg={disabled ? "#666" : "#FFF"}>
                {isLoading ? "  Ingresando...  " : "  Iniciar Sesión  "}
              </text>
            </box>
          </box>
        )}

        {loginErr && <text marginY={1} fg="#df2121">✗ {loginErr}</text>}
        {isReady && !loginErr && <text fg="#666">Tab entre campos · Enter o clic para ingresar</text>}
      </box>
    </box>
  )
}
