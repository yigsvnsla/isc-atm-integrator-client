import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { setSessionCookie } from "@/services/api"

const CsrfContext = createContext<string | null>(null)

export function useCsrf() {
  return useContext(CsrfContext)
}

export function CsrfProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null)

  useEffect(() => {
    fetch("http://localhost:7000/api/csrf-token", {
      headers: { "x-api-version": "1" },
    })
      .then(async (r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        const cookie = r.headers.get("set-cookie")
        if (cookie) setSessionCookie(cookie.split(";")[0])
        const d = await r.json()
        if (!d.token) throw new Error("No token in response")
        setToken(d.token)
      })
      .catch((e) => console.error("CSRF fetch failed:", e))
  }, [])

  return <CsrfContext.Provider value={token}>{children}</CsrfContext.Provider>
}
