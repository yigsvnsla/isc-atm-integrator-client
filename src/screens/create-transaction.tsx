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

  const upd = (k: Field) => (v: string) => setF(p => ({ ...p, [k]: v }))
  const next = () => step < STEPS.length - 1 && setStep(s => s + 1)

  useKeyboardEffect((key) => {
    if (key.name === "escape") { setStep(0); setResult(""); return }

    if (STEPS[step] === "operation" || STEPS[step] === "type" || STEPS[step] === "source_bank") {
      const opts = STEPS[step] === "operation" ? OPERATIONS : STEPS[step] === "type" ? TYPES : SOURCE_BANKS
      const n = parseInt(key.name)
      if (n >= 1 && n <= opts.length) {
        upd(STEPS[step])(opts[n - 1])
        key.name === "return" ? null : next()
        next()
      }
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

  return (
    <box flexDirection="column" gap={1}>
      <text><b>Create Transaction</b></text>

      {(field === "account_id" || field === "amount" || field === "description") ? (
        <box flexDirection="column">
          <text fg="#888"><b>{field === "account_id" ? "Account ID" : field === "amount" ? "Amount" : "Description"}</b></text>
          <input
            placeholder={field === "account_id" ? "Enter account ID" : field === "amount" ? "in cents" : "Optional"}
            onInput={upd(field)} onSubmit={handleSubmit} value={f[field]} />
        </box>
      ) : field === "operation" ? (
        <box flexDirection="column">
          <text fg="#888"><b>Operation</b></text>
          {OPERATIONS.map((o, i) => (
            <text key={o} fg={f.operation === o ? "#58a6ff" : "#FFF"}>
              {f.operation === o ? "›" : " "} [{i + 1}] {o}
            </text>
          ))}
        </box>
      ) : field === "type" ? (
        <box flexDirection="column">
          <text fg="#888"><b>Type</b></text>
          {TYPES.map((t, i) => (
            <text key={t} fg={f.type === t ? "#58a6ff" : "#FFF"}>
              {f.type === t ? "›" : " "} [{i + 1}] {t}
            </text>
          ))}
        </box>
      ) : field === "source_bank" ? (
        <box flexDirection="column">
          <text fg="#888"><b>Source Bank</b></text>
          {SOURCE_BANKS.map((b, i) => (
            <text key={b} fg={f.source_bank === b ? "#58a6ff" : "#FFF"}>
              {f.source_bank === b ? "›" : " "} [{i + 1}] {b}
            </text>
          ))}
        </box>
      ) : null}

      {loading && <text>Creating...</text>}
      {result && <text fg={result.startsWith("Error") ? "#df2121" : "green"}>{result}</text>}
      <text fg="#666">Enter to confirm · number to select · Esc to cancel</text>
    </box>
  )
}
