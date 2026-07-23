import { useState } from "react"
import { useKeyboardEffect } from "@/hooks/use-keyboard-effect"
import { useAuth } from "../hooks/use-auth"

export function LoginScreen({ onLoginSuccess }: { onLoginSuccess?: () => void }) {
  const { login } = useAuth()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [emailErr, setEmailErr] = useState("")
  const [passwdErr, setPasswdErr] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [loginErr, setLoginErr] = useState("")

  const isValidEmail = (v: string) => { const i = v.indexOf("@"); return i > 0 && v.slice(i + 1).includes(".") }

  useKeyboardEffect((key) => {
    if (key.name === "return" || (key.ctrl && key.name === "s")) {
      if (submitting || !email || !password) return
      setSubmitting(true); setLoginErr("")
      login(email, password)
        .then(() => { setEmail(""); setPassword(""); onLoginSuccess?.() })
        .catch((e: Error) => setLoginErr(e.message))
        .finally(() => setSubmitting(false))
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
        <box flexDirection="column">
          <box flexDirection="column">
            <box title=" Usuario " borderStyle="rounded" borderColor={emailErr ? "#df2121" : undefined} paddingX={1}>
              <input
                width={30} placeholder="correo@ejemplo.com" textColor={submitting ? "#555" : "#FFF"}
                focused={submitting ? false : undefined}
                onInput={(v: string) => {
                  setEmail(v)
                  setEmailErr(v && !isValidEmail(v) ? "Correo inválido" : "")
                }}
              />
            </box>
            {emailErr && <text marginX={1} fg="#df2121">✗ {emailErr}</text>}
          </box>
          <box flexDirection="column">
            <box title=" Contraseña " borderStyle="rounded" borderColor={passwdErr ? "#df2121" : undefined} paddingX={1}>
              <input
                width={30} placeholder="••••••••" textColor={submitting ? "#555" : "#FFF"}
                focused={submitting ? false : undefined}
                onInput={(v: string) => {
                  setPassword(v)
                  setPasswdErr(v.length > 0 && v.length < 6 ? "Mínimo 6 caracteres" : "")
                }}
              />
            </box>
            {passwdErr && <text marginX={1} fg="#df2121">✗ {passwdErr}</text>}
          </box>
        </box>
        {submitting && <text>Ingresando...</text>}
        {loginErr && <text marginY={1} fg="#df2121">✗ {loginErr}</text>}
        <text fg="#666">Enter o Ctrl+S para ingresar</text>
      </box>
    </box>
  )
}
