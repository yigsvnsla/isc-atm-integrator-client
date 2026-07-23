import { useEffect, useState } from "react"
import { api } from "../services/api.js"

interface TransactionStats {
  data: { total?: number }
  metadata: { pagination?: { totalItems: number } }
}

interface ConciliationSummary {
  data: Array<{
    id: string; runAt: string; status: string
    summary: { matched: number; discrepancies: number; missing: number }
  }>
}

export function DashboardScreen() {
  const [data, setData] = useState({ totalTxs: 0, last: "N/A", matched: 0, discrepancies: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    (async () => {
      try {
        const [txs, concs] = await Promise.all([
          api<TransactionStats>("transactions?limit=1"),
          api<ConciliationSummary>("conciliation?limit=1"),
        ])
        const last = concs.data[0]
        setData({
          totalTxs: txs.metadata?.pagination?.totalItems ?? 0,
          last: last?.runAt ? new Date(last.runAt).toLocaleString() : "N/A",
          matched: last?.summary?.matched ?? 0,
          discrepancies: last?.summary?.discrepancies ?? 0,
        })
      } catch {}
      setLoading(false)
    })()
  }, [])

  if (loading) return <text>Loading dashboard...</text>

  return (
    <box borderStyle="single" padding={1} flexDirection="column" gap={1}>
      <text><b>Dashboard</b></text>
      <box borderStyle="single" padding={1} flexDirection="column" gap={1}>
        <text>Total Transactions: <span fg="green">{data.totalTxs}</span></text>
        <text>Last Conciliation: {data.last}</text>
        <box flexDirection="row" gap={2}>
          <text>✓ Matched: {data.matched}</text>
          <text>⚠ Discrepancies: {data.discrepancies}</text>
        </box>
      </box>
      <text fg="#666">Use number keys [1-5] to navigate screens</text>
    </box>
  )
}
