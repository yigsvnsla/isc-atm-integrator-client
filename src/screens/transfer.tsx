import { useState } from "react"
import { useKeyboardEffect } from "@/hooks/use-keyboard-effect"
import { api } from "../services/api.js"

const SOURCE_BANKS = ["bank_a", "bank_b"]
const STEPS = ["from_account", "to_account", "amount", "source_bank", "description"] as const
type Field = (typeof STEPS)[number]

export function TransferScreen() {
  const [f, setF] = useState<Record<Field, string>>({
    from_account: "", to_account: "", amount: "", source_bank: "bank_a", description: "",
  })
  const [step, setStep] = useState(0)
  const [result, setResult] = useState("")
  const [loading, setLoading] = useState(false)

  const upd = (k: Field) => (v: string) => setF(p => ({ ...p, [k]: v }))
  const next = () => step < STEPS.length - 1 && setStep(s => s + 1)

  useKeyboardEffect((key) => {
    if (key.name === "escape") { setStep(0); setResult(""); return }
    if (STEPS[step] === "source_bank") {
      const n = parseInt(key.name)
      if (n >= 1 && n <= SOURCE_BANKS.length) {
        upd("source_bank")(SOURCE_BANKS[n - 1])
        next()
      }
    }
  })

  const submit = async () => {
    setLoading(true)
    try {
      const res = await api<{ data: Array<{ id: string }> }>("transactions/transfer", {
        method: "POST",
        body: {
          from_account_id: f.from_account, to_account_id: f.to_account,
          amount: parseInt(f.amount), description: f.description, source_bank: f.source_bank,
        },
      })
      setResult(`Transfer created: ${res.data.map(t => t.id.slice(0, 8)).join(", ")}`)
    } catch (e: unknown) { setResult(`Error: ${(e as Error).message}`) }
    setLoading(false)
  }

  const handleSubmit = () => step < STEPS.length - 1 ? next() : submit()

  const field = STEPS[step]

  return (
    <box flexDirection="column" gap={1}>
      <text><b>Transfer</b></text>

      {(field === "from_account" || field === "to_account" || field === "amount" || field === "description") ? (
        <box flexDirection="column">
          <text fg="#888"><b>{
            field === "from_account" ? "From Account" :
            field === "to_account" ? "To Account" :
            field === "amount" ? "Amount" : "Description"
          }</b></text>
          <input
            placeholder={
              field === "from_account" ? "Source account ID" :
              field === "to_account" ? "Destination account ID" :
              field === "amount" ? "in cents" : "Optional"
            }
            onInput={upd(field)} onSubmit={handleSubmit} value={f[field]} />
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

      {loading && <text>Processing transfer...</text>}
      {result && <text fg={result.startsWith("Error") ? "#df2121" : "green"}>{result}</text>}
      <text fg="#666">Enter to confirm · number to select · Esc to cancel</text>
    </box>
  )
}
