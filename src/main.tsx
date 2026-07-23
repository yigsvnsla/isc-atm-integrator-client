import { createCliRenderer } from "@opentui/core"
import { createRoot } from "@opentui/react"
import { CsrfProvider } from "@/components/csrf-provider"
import { App } from "./app.js"

const renderer = await createCliRenderer({ exitOnCtrlC: true })
const root = createRoot(renderer)
root.render(
  <CsrfProvider>
    <App />
  </CsrfProvider>,
)
