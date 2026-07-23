import { createContext, useContext, useEffect, useState, type ReactNode } from "react"

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
      .then((r) => r.json())
      .then((d) => setToken(d.token))
      .catch((e) => console.error("CSRF fetch failed:", e))
  }, [])

  return <CsrfContext.Provider value={token}>{children}</CsrfContext.Provider>
}
