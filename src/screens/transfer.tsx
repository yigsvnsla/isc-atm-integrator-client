import { useState } from "react";
import { Select } from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { Alert } from "@/components/ui/alert";
import { api } from "../services/api.js";

const SOURCE_BANKS = ["bank_a", "bank_b"];
const fieldOrder = ["from_account", "to_account", "amount", "source_bank", "description"] as const;
type Field = (typeof fieldOrder)[number];

export function TransferScreen() {
  const [fields, setFields] = useState<Record<Field, string>>({
    from_account: "", to_account: "", amount: "",
    source_bank: "bank_a", description: "",
  });
  const [step, setStep] = useState(0);
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const update = (key: Field) => (v: string) => setFields((f) => ({ ...f, [key]: v }));
  const advance = () => {
    if (step < fieldOrder.length - 1) setStep(step + 1);
  };

  const submit = async () => {
    setLoading(true);
    try {
      const res = await api<{ data: Array<{ id: string }> }>("transactions/transfer", {
        method: "POST",
        body: {
          from_account_id: fields.from_account,
          to_account_id: fields.to_account,
          amount: parseInt(fields.amount),
          description: fields.description,
          source_bank: fields.source_bank,
        },
      });
      setResult(`Transfer created: ${res.data.map((t) => t.id.slice(0, 8)).join(", ")}`);
    } catch (e: unknown) {
      setResult(`Error: ${(e as Error).message}`);
    }
    setLoading(false);
  };

  const handleSubmit = () => {
    if (step < fieldOrder.length - 1) advance();
    else submit();
  };

  const name = fieldOrder[step];

  return (
    <box flexDirection="column" gap={1}>
      <text><b>Transfer</b></text>
      {name === "from_account" && (
        <box flexDirection="column">
          <text fg="#888"><b>From Account</b></text>
          <input
            placeholder="Source account ID"
            onInput={update("from_account")}
            onSubmit={advance}
            value={fields.from_account}
          />
        </box>
      )}
      {name === "to_account" && (
        <box flexDirection="column">
          <text fg="#888"><b>To Account</b></text>
          <input
            placeholder="Destination account ID"
            onInput={update("to_account")}
            onSubmit={advance}
            value={fields.to_account}
          />
        </box>
      )}
      {name === "amount" && (
        <box flexDirection="column">
          <text fg="#888"><b>Amount</b></text>
          <input
            placeholder="in cents"
            onInput={update("amount")}
            onSubmit={advance}
            value={fields.amount}
          />
        </box>
      )}
      {name === "source_bank" && (
        <Select
          options={SOURCE_BANKS.map((b) => ({ value: b, label: b }))}
          value={fields.source_bank}
          onChange={update("source_bank")}
          onSubmit={advance}
          label="Source Bank"
        />
      )}
      {name === "description" && (
        <box flexDirection="column">
          <text fg="#888"><b>Description</b></text>
          <input
            placeholder="Optional description"
            onInput={update("description")}
            onSubmit={handleSubmit}
            value={fields.description}
          />
        </box>
      )}
      {loading && <Spinner label="Processing transfer..." />}
      {result && (
        <Alert variant={result.startsWith("Error") ? "error" : "success"}>
          {result}
        </Alert>
      )}
      <text fg="#666">Enter to confirm · Esc to cancel</text>
    </box>
  );
}
