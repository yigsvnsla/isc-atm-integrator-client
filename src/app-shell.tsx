import type { ReactNode } from "react"
import { useRenderer } from "@opentui/react"
import { useKeyboardEffect } from "@/hooks/use-keyboard-effect"
import { DashboardScreen } from "./screens/dashboard.js"
import { TransactionsScreen } from "./screens/transactions.js"
import { CreateTransactionScreen } from "./screens/create-transaction.js"
import { TransferScreen } from "./screens/transfer.js"
import { ConciliationScreen } from "./screens/conciliation.js"

export type Screen = "dashboard" | "transactions" | "create" | "transfer" | "conciliation"

const ROUTES: Record<Screen, ReactNode> = {
  dashboard: <DashboardScreen />,
  transactions: <TransactionsScreen />,
  create: <CreateTransactionScreen />,
  transfer: <TransferScreen />,
  conciliation: <ConciliationScreen />,
}

const NAV_KEYS: Record<string, Screen> = {
  "1": "dashboard",
  "2": "transactions",
  "3": "create",
  "4": "transfer",
  "5": "conciliation",
}

const HINT = "1:Dash  2:Txns  3:New  4:Xfer  5:Concil  |  Esc:Home  Ctrl+Q:Quit"

export function AppShell({ screen, onNavigate }: { screen: Screen; onNavigate: (s: Screen) => void }) {
  const renderer = useRenderer()

  useKeyboardEffect((key) => {
    if (key.name === "escape") { onNavigate("dashboard"); return }
    if (key.ctrl && key.name === "q") { renderer.destroy(); return }
    const target = NAV_KEYS[key.name]
    if (target) onNavigate(target)
  })

  return (
    <box flexDirection="column">
      <box borderStyle="single" paddingX={1}>
        <box flexDirection="row" gap={2} alignItems="center">
          <text><b>ISC ATM Integrator</b></text>
          <text fg="#888">1:Dash</text>
          <text fg="#888">2:Txns</text>
          <text fg="#888">3:New</text>
          <text fg="#888">4:Xfer</text>
          <text fg="#888">5:Concil</text>
          <text> </text>
          <text fg="#666">Esc:Home  Ctrl+Q:Quit</text>
        </box>
      </box>
      <box flexGrow={1} padding={1}>
        {ROUTES[screen]}
      </box>
    </box>
  )
}
