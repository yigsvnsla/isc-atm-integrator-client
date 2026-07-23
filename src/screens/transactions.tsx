import { useEffect, useState } from "react"
import { useKeyboardEffect } from "@/hooks/use-keyboard-effect"
import { api } from "../services/api.js"

interface Tx {
  id: string; amount?: number; operation: string; state: string
  sourceBank: string
}

interface TxR {
  data: Tx[]; metadata: { pagination?: { page: number; limit: number; totalItems: number } }
}

const FILTERS = ["all", "bank_a", "bank_b"]
const statusFg = (s: string) => s === "success" ? "green" : s === "pending" ? "yellow" : "red"

export function TransactionsScreen() {
  const [txs, setTxs] = useState<Tx[]>([])
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [filter, setFilter] = useState("all")
  const [loading, setLoading] = useState(true)
  const limit = 10

  useEffect(() => {
    setLoading(true)
    const p: Record<string, string | number | undefined> = { page, limit }
    if (filter !== "all") p.sourceBank = filter
    api<TxR>("transactions", { params: p })
      .then(r => { setTxs(r.data); setTotal(r.metadata?.pagination?.totalItems ?? 0) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [page, filter])

  useKeyboardEffect((key) => {
    if (key.name === "n" || key.name === "right") setPage(p => Math.min(p + 1, Math.ceil(total / limit)))
    if (key.name === "p" || key.name === "left") setPage(p => Math.max(1, p - 1))
    if (key.name >= "1" && key.name <= "3") {
      const i = parseInt(key.name) - 1
      if (i < FILTERS.length) { setFilter(FILTERS[i]); setPage(1) }
    }
  })

  if (loading) return <text>Loading transactions...</text>

  const pages = Math.ceil(total / limit)

  return (
    <box flexDirection="column" gap={1}>
      <text><b>Transactions</b></text>

      <box flexDirection="row" gap={2}>
        {FILTERS.map((f, i) => (
          <text key={f} fg={filter === f ? "#58a6ff" : "#888"}>
            [{i + 1}] {f === "all" ? "All" : f}
          </text>
        ))}
      </box>

      <box flexDirection="column">
        <box flexDirection="row" gap={1} paddingX={1}>
          <text width={18} fg="#888"><b>Operation</b></text>
          <text width={10} fg="#888"><b>Amount</b></text>
          <text width={10} fg="#888"><b>State</b></text>
          <text width={8} fg="#888"><b>Bank</b></text>
        </box>
        {txs.slice(0, limit).map(tx => (
          <box key={tx.id} flexDirection="row" gap={1} paddingX={1}>
            <text width={18}>{tx.operation}</text>
            <text width={10}>{tx.amount != null ? `$${(tx.amount / 100).toFixed(2)}` : "-"}</text>
            <text width={10} fg={statusFg(tx.state)}>{tx.state}</text>
            <text width={8}>{tx.sourceBank}</text>
          </box>
        ))}
      </box>

      <box flexDirection="row" gap={1}>
        <text fg="#666">{'<'}</text>
        <text>Page {page} / {pages}</text>
        <text fg="#666">{'>'}</text>
      </box>

      <text fg="#666">[p] prev · [n] next · [1-3] filter</text>
    </box>
  )
}
