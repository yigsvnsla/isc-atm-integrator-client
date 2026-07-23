import type { ReactNode } from "react"
import { useKeyboardEffect } from "@/hooks/use-keyboard-effect"
import { Box } from "@/components/ui/box"
import { Heading } from "@/components/ui/heading"
import { Badge } from "@/components/ui/badge"
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

export function AppShell({ screen, onNavigate }: { screen: Screen; onNavigate: (s: Screen) => void }) {
  useKeyboardEffect((key) => {
    if (key.name === "escape") {
      onNavigate("dashboard")
      return
    }
    if (key.ctrl && key.name === "q") {
      process.exit(0)
    }
    const target = NAV_KEYS[key.name]
    if (target) onNavigate(target)
  })

  return (
    <box flexDirection="column">
      {/* header */}
      <Box border borderVariant="muted" paddingX={1}>
        <box flexDirection="row" gap={2} alignItems="center">
          <Heading level={2} uppercase={false}>ISC ATM Integrator</Heading>
          <Badge>1:Dash</Badge>
          <Badge>2:Txns</Badge>
          <Badge>3:New</Badge>
          <Badge>4:Xfer</Badge>
          <Badge>5:Concil</Badge>
          <text> </text>
          <text fg="#666">Esc:Home Ctrl+Q:Quit</text>
        </box>
      </Box>

      {/* content */}
      <box flexGrow={1} padding={1}>
        {ROUTES[screen]}
      </box>
    </box>
  )
}
