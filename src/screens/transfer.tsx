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
  const [hoverOpt, setHoverOpt] = useState(-1)

  const upd = (k: Field) => (v: string) => setF(p => ({ ...p, [k]: v }))
  const next = () => step < STEPS.length - 1 && setStep(s => s + 1)

  useKeyboardEffect((key) => {
    if (key.name === "escape") { setStep(0); setResult(""); return }
    if (STEPS[step] === "source_bank") {
      const n = parseInt(key.name)
      if (n >= 1 && n <= SOURCE_BANKS.length) { upd("source_bank")(SOURCE_BANKS[n - 1]); next() }
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
  const pct = Math.round(((step) / (STEPS.length - 1)) * 100)

  return (
    <box flexDirection="column" gap={1}>
      <text><b>Transfer</b></text>

      <box flexDirection="row" gap={1}>
        {STEPS.map((s, i) => (
          <text key={s} fg={i === step ? "#58a6ff" : i < step ? "green" : "#444"}>
            {i <= step ? "●" : "○"}
          </text>
        ))}
        <text fg="#666">({pct}%)</text>
      </box>

      {(field === "from_account" || field === "to_account" || field === "amount" || field === "description") ? (
        <box flexDirection="column">
          <text fg="#888" marginBottom={1}><b>{
            field === "from_account" ? "From Account" :
            field === "to_account" ? "To Account" :
            field === "amount" ? "Amount (cents)" : "Description"
          }</b></text>
          <input placeholder={
            field === "from_account" ? "Source account ID" :
            field === "to_account" ? "Destination account ID" :
            field === "amount" ? "e.g. 5000" : "Optional"
          } onInput={upd(field)} onSubmit={handleSubmit} value={f[field]} />
        </box>
      ) : (
        <box flexDirection="column">
          <text fg="#888" marginBottom={1}><b>Source Bank</b></text>
          {SOURCE_BANKS.map((opt, i) => {
            const isSel = f.source_bank === opt
            return (
              <box key={opt} flexDirection="row" gap={1} paddingX={1}
                backgroundColor={isSel ? "#2c62b3" : hoverOpt === i ? "#1a1a2e" : undefined}
                onMouseDown={() => { upd("source_bank")(opt); next() }}
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

      {loading && <text>Processing transfer...</text>}
      {result && <text fg={result.startsWith("Error") ? "#df2121" : "green"}>{result}</text>}
      <text fg="#666">Enter to confirm · number to select · Esc to cancel</text>
    </box>
  )
}
