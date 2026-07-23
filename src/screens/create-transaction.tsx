import { useState } from "react"
import { useKeyboardEffect } from "@/hooks/use-keyboard-effect"
import { api } from "../services/api.js"

const OPERATIONS = ["withdrawal", "deposit", "transfer", "balance_inquiry", "pin_change", "reversal", "mini_statement"]
const SOURCE_BANKS = ["bank_a", "bank_b"]
const TYPES = ["debit", "credit"]
const STEPS = ["account_id", "amount", "operation", "type", "source_bank", "description"] as const
type Field = (typeof STEPS)[number]

export function CreateTransactionScreen() {
  const [f, setF] = useState<Record<Field, string>>({
    account_id: "", amount: "", operation: "withdrawal",
    type: "debit", source_bank: "bank_a", description: "",
  })
  const [step, setStep] = useState(0)
  const [result, setResult] = useState("")
  const [loading, setLoading] = useState(false)
  const [hoverOpt, setHoverOpt] = useState(-1)

  const upd = (k: Field) => (v: string) => setF(p => ({ ...p, [k]: v }))
  const next = () => step < STEPS.length - 1 && setStep(s => s + 1)

  useKeyboardEffect((key) => {
    if (key.name === "escape") { setStep(0); setResult(""); return }
    const field = STEPS[step]
    if (field === "operation" || field === "type" || field === "source_bank") {
      const opts = field === "operation" ? OPERATIONS : field === "type" ? TYPES : SOURCE_BANKS
      const n = parseInt(key.name)
      if (n >= 1 && n <= opts.length) { upd(field)(opts[n - 1]); next() }
    }
  })

  const submit = async () => {
    setLoading(true)
    try {
      const body: Record<string, unknown> = {
        account_id: f.account_id, amount: f.amount ? parseInt(f.amount) : undefined,
        operation: f.operation, description: f.description, source_bank: f.source_bank,
      }
      if (!["balance_inquiry", "pin_change", "mini_statement"].includes(f.operation)) body.type = f.type
      const res = await api<{ data: { id: string } }>("transactions", { method: "POST", body })
      setResult(`Created: ${res.data.id}`)
    } catch (e: unknown) { setResult(`Error: ${(e as Error).message}`) }
    setLoading(false)
  }

  const handleSubmit = () => step < STEPS.length - 1 ? next() : submit()

  const field = STEPS[step]
  const pct = Math.round(((step) / (STEPS.length - 1)) * 100)

  return (
    <box flexDirection="column" gap={1}>
      <text><b>Create Transaction</b></text>

      <box flexDirection="row" gap={1}>
        {STEPS.map((s, i) => (
          <text key={s} fg={i === step ? "#58a6ff" : i < step ? "green" : "#444"}>
            {i <= step ? "●" : "○"}
          </text>
        ))}
        <text fg="#666">({pct}%)</text>
      </box>

      {(field === "account_id" || field === "amount" || field === "description") ? (
        <box flexDirection="column">
          <text fg="#888" marginBottom={1}><b>{
            field === "account_id" ? "Account ID" : field === "amount" ? "Amount (cents)" : "Description"
          }</b></text>
          <input placeholder={field === "account_id" ? "Enter account ID" : field === "amount" ? "e.g. 5000" : "Optional"}
            onInput={upd(field)} onSubmit={handleSubmit} value={f[field]} />
        </box>
      ) : (
        <box flexDirection="column">
          <text fg="#888" marginBottom={1}><b>{
            field === "operation" ? "Operation" : field === "type" ? "Type" : "Source Bank"
          }</b></text>
          {(
            field === "operation" ? OPERATIONS :
            field === "type" ? TYPES : SOURCE_BANKS
          ).map((opt, i) => {
            const val = f[field]
            const isSel = val === opt
            return (
              <box key={opt} flexDirection="row" gap={1} paddingX={1}
                backgroundColor={isSel ? "#2c62b3" : hoverOpt === i ? "#1a1a2e" : undefined}
                onMouseDown={() => { upd(field)(opt); next() }}
                onMouseOver={() => setHoverOpt(i)}
                onMouseOut={() => setHoverOpt(-1)}
              >
                <text fg={isSel ? "#58a6ff" : "#FFF"}>
                  {isSel ? "▸" : " "} [{i + 1}] {opt}
                </text>
              </box>
            )
          })}
        </box>
      )}

      {loading && <text>Creating...</text>}
      {result && <text fg={result.startsWith("Error") ? "#df2121" : "green"}>{result}</text>}
      <text fg="#666">Enter to confirm · number to select · Esc to cancel</text>
    </box>
  )
}
