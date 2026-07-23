import { useEffect, useState } from "react"
import { useKeyboardEffect } from "@/hooks/use-keyboard-effect"
import { api } from "../services/api.js"

interface CRun { id: string; runAt: string; status: string; summary: { matched: number; discrepancies: number; missing: number } }
interface CReport {
  conciliation: CRun
  matches: Array<{ internalTxId: string; externalTxId?: string; status: string; amountDiff: number }>
}
interface CRes { data: CRun[] }

const statusIcon = (s: string) => s === "matched" ? "✓" : s === "discrepancy" ? "⚠" : s === "missing" ? "✗" : "?"
const statusFg = (s: string) => s === "matched" ? "green" : s === "discrepancy" ? "yellow" : s === "missing" ? "red" : "#888"

export function ConciliationScreen() {
  const [concs, setConcs] = useState<CRun[]>([])
  const [report, setReport] = useState<CReport | null>(null)
  const [loading, setLoading] = useState(true)
  const [running, setRunning] = useState(false)
  const [msg, setMsg] = useState("")
  const [selIdx, setSelIdx] = useState(0)
  const [hoverIdx, setHoverIdx] = useState(-1)

  const load = () => {
    setLoading(true)
    api<CRes>("conciliation")
      .then(r => { setConcs(r.data); setSelIdx(0) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  useKeyboardEffect((key) => {
    if (report) {
      if (key.name === "q" || key.name === "escape") { setReport(null); setMsg(""); return }
      return
    }
    if (key.name === "r" && !running) { runConc(); return }
    if (key.name === "up") setSelIdx(i => Math.max(0, i - 1))
    if (key.name === "down") setSelIdx(i => Math.min(concs.length - 1, i + 1))
    if (key.name === "return" && concs.length > 0) view(concs[selIdx].id)
  })

  const view = async (id: string) => {
    setLoading(true)
    try {
      const res = await api<{ data: CReport }>(`conciliation/${id}`)
      setReport(res.data)
    } catch (e: unknown) { setMsg(`Error: ${(e as Error).message}`) }
    setLoading(false)
  }

  const runConc = async () => {
    setRunning(true); setMsg("Running conciliation...")
    try {
      await api("conciliation/run", { method: "POST" })
      setMsg("Done!"); load()
    } catch (e: unknown) { setMsg(`Error: ${(e as Error).message}`) }
    setRunning(false)
  }

  if (report) {
    const c = report.conciliation
    return (
      <box flexDirection="column" gap={1}>
        <box borderStyle="single" padding={1} flexDirection="column" gap={1}>
          <text><b>Report: {c.id.slice(0, 8)}</b></text>
          <text>Status: <span fg={statusFg(c.status)}>{statusIcon(c.status)} {c.status}</span></text>
          <box flexDirection="row" gap={2}>
            <text fg="green">✓ Matched: {c.summary.matched}</text>
            <text fg="yellow">⚠ Diff: {c.summary.discrepancies}</text>
            <text fg="red">✗ Missing: {c.summary.missing}</text>
          </box>
        </box>
        <box flexDirection="column">
          <box flexDirection="row" gap={1} paddingX={1}>
            <text width={22} fg="#888"><b>Internal Tx</b></text>
            <text width={22} fg="#888"><b>External Tx</b></text>
            <text width={14} fg="#888"><b>Status</b></text>
            <text width={10} fg="#888"><b>Diff</b></text>
          </box>
          {report.matches.map((m, i) => (
            <box key={i} flexDirection="row" gap={1} paddingX={1}
              backgroundColor={i % 2 === 1 ? "#111" : undefined}>
              <text width={22}>{m.internalTxId.slice(0, 18)}..</text>
              <text width={22}>{(m.externalTxId ?? "-").slice(0, 18)}</text>
              <text width={14} fg={statusFg(m.status)}>{statusIcon(m.status)} {m.status}</text>
              <text width={10}>{m.amountDiff != null ? `$${(m.amountDiff / 100).toFixed(2)}` : "-"}</text>
            </box>
          ))}
        </box>
        <text fg="#666">Press <b>q</b> to go back</text>
      </box>
    )
  }

  if (loading) return <text>Loading...</text>

  return (
    <box flexDirection="column" gap={1}>
      <box flexDirection="row" gap={1}>
        <text><b>Conciliations</b></text>
        <box borderStyle="single" borderColor="#58a6ff" paddingX={1} onMouseDown={() => !running && runConc()}>
          <text fg="#58a6ff">r: run</text>
        </box>
      </box>

      {concs.length === 0
        ? <text fg="#666">No conciliations yet. Press <b>r</b> to run one.</text>
        : <box flexDirection="column">
            <box flexDirection="row" gap={1} paddingX={1}>
              <text width={24} fg="#888"><b>Date</b></text>
              <text width={12} fg="#888"><b>Status</b></text>
              <text width={8} fg="#888"><b>Match</b></text>
              <text width={8} fg="#888"><b>Diff</b></text>
              <text width={8} fg="#888"><b>Miss</b></text>
            </box>
            {concs.map((c, i) => (
              <box key={c.id} flexDirection="row" gap={1} paddingX={1}
                backgroundColor={i === selIdx ? "#2c62b3" : i === hoverIdx ? "#1a1a2e" : i % 2 === 1 ? "#111" : undefined}
                onMouseDown={() => { setSelIdx(i); view(c.id) }}
                onMouseOver={() => setHoverIdx(i)}
                onMouseOut={() => setHoverIdx(-1)}
              >
                <text width={24}>{new Date(c.runAt).toLocaleDateString()}</text>
                <text width={12} fg={statusFg(c.status)}>{statusIcon(c.status)} {c.status}</text>
                <text width={8}>{c.summary.matched}</text>
                <text width={8}>{c.summary.discrepancies}</text>
                <text width={8}>{c.summary.missing}</text>
              </box>
            ))}
          </box>
      }

      {running && <text>Running conciliation...</text>}
      {msg && <text fg={msg.startsWith("Error") ? "#df2121" : "#58a6ff"}>{msg}</text>}
      <text fg="#666">↑↓ select · Enter view · <b>r</b>: run</text>
    </box>
  )
}
