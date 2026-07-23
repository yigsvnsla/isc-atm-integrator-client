import { createCliRenderer } from "@opentui/core"
import { createRoot } from "@opentui/react"
import { AuthProvider } from "@/components/auth-provider"
import { App } from "./app.js"

const renderer = await createCliRenderer({ exitOnCtrlC: true })
const root = createRoot(renderer)
root.render(
  <AuthProvider>
    <App />
  </AuthProvider>,
)
